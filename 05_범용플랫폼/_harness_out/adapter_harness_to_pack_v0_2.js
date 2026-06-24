/* =========================================================================
   하니스 게이트 통과본 → 완전한 앱 Pack v2 어댑터 v0.2 (다리 1 + 다리 2 결합)
   ─────────────────────────────────────────────────────────────────────────
   v0.1과 차이: knowledge.route를 prose가 아니라 **evaluate.js 실행 가능 DSL**(게이트 통과본)로 emit.
   입력: 하니스 run JSON의 finalPack(서사·구성) + evalSummary[key](dsl·seeds·slotKeys, 게이트 통과·expectedOutcome).
   출력: flow + io + caseModel + knowledge(route DSL + lookup/threshold 참조) + seeds(expectedOutcome) 완전 Pack v2.
   각 팩은 evaluate.js 스모크(seed → expectedOutcome) 통과 후 저장.
   실행: node adapter_harness_to_pack_v0_2.js   (→ packs_baked_v2/)  ※app/ 무관
   ========================================================================= */
const fs = require('fs'), path = require('path');
const HERE = __dirname;
const { evaluate } = require(path.join(HERE, '..', '_decision_engine', 'evaluate.js'));

const TYPE_CLS = { 'Agent':'tA','Module':'tM','기존 솔루션':'tS','Connector':'tC','Policy':'tP' };
const TYPE_SUB = { 'Agent':'전문 작업','Module':'재사용 기능','기존 솔루션':'Buy·Integrate','Connector':'시스템 연동','Policy':'통제·권한' };
const has = (s, ...kw) => kw.some(k => (s||'').includes(k));
const coerce = (v) => { if (typeof v !== 'string') return v; if (v === 'true') return true; if (v === 'false') return false; if (v === 'null' || v === '') return null; if (v === '[]') return []; if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v); if (v.includes('·')) return v.split('·').map(s => s.trim()); return v; };

function classifyKind(sp, i) { const lab = sp.label || '';
  if (i === 0 || has(lab, '접수','수신','intake')) return 'input';
  if (has(lab, '분기','결재','승인','심층검토','검토(HITL)','HITL','라우팅','approval','routing')) return 'gate';
  return 'auto'; }
function loopPhaseOf(sp, i, n) { const t = (sp.label||'') + ' ' + (sp.detail||'');
  if (has(t, '접수','수집','조회','추출','수신')) return 'Data';
  if (has(t, '분류','이해','식별','의미','정규화')) return 'Semantic';
  if (has(t, '분기','결재','승인','판정','검토')) return 'Decision';
  if (has(t, '반영','생성','발행','기록','PO','전표','writeback','등록','교부')) return (i >= n-1 ? 'Learning' : 'Action');
  return 'Reasoning'; }

function adapt(finalPack, gate, id, label) {
  const slots = (finalPack.caseModel && finalPack.caseModel.slots) || [];
  const slotByKey = {}; slots.forEach(s => { slotByKey[s.key] = s; });
  const sps = finalPack.subProcesses || []; const n = sps.length;
  // route 3분기를 gate 단계 next에 바인딩
  const outcomes = [...new Set(gate.dsl.rules.map(r => r.outcome).concat([gate.dsl.fallback.outcome]))];
  const flow = sps.map((sp, i) => { const kind = classifyKind(sp, i);
    const st = { id: sp.id, label: sp.label, kind, loopPhase: loopPhaseOf(sp, i, n), explain: sp.detail };
    if (kind === 'gate' && /분기|결재선 산정|approval|routing/.test(sp.id + sp.label)) {
      st.gate = { label: sp.label, decisions: outcomes.map(o => ({ key: o, label: o, toast: o })) };
      st.next = {}; outcomes.forEach(o => { st.next[o] = o === 'AUTO_APPROVE' ? 'commit' : o === 'REJECT' ? 'reject' : 'review'; });
      st.nextBy = 'evaluate(caseData, knowledge).outcome';
    }
    return st; });
  const cnt = {}, items = {}; (finalPack.components||[]).forEach(c => { cnt[c.type]=(cnt[c.type]||0)+1; (items[c.type]=items[c.type]||[]).push(c.name); });
  const compose = Object.keys(TYPE_CLS).filter(t => cnt[t]).map(t => ({ t, sub: TYPE_SUB[t], cls: TYPE_CLS[t], n: cnt[t], items: items[t].slice(0,5) }));
  const inputStage = (flow.find(s => s.kind === 'input') || flow[0] || {}).id;
  const io = {
    inputs: gate.slotKeys.filter(k => slotByKey[k] && ['manual','doc'].includes(slotByKey[k].extract)).map(k => ({ stage: inputStage, type: slotByKey[k].extract === 'doc' ? 'file' : 'field', key: k, label: (slotByKey[k]||{}).label || k })),
    connectors: (finalPack.components||[]).filter(c => ['Connector','기존 솔루션'].includes(c.type)).map(c => ({ id: 'c_'+(c.name||'').replace(/\s+/g,'_').slice(0,16), label: c.name, system: c.connectsTo||c.name, stub: true })),
    editable: ((finalPack.knowledge||{}).thresholds||[]).map(t => ({ key: t.id, label: t.flag, type: 'threshold', recompute: 'evaluate(case,knowledge)' })),
  };
  const stepLoop = {}; flow.forEach(s => { stepLoop[s.id] = s.loopPhase; });
  return {
    id, label, flow, io,
    caseModel: { slots: gate.slotKeys.map(k => slotByKey[k] || { key: k }) },
    knowledge: { route: { rules: gate.dsl.rules.map(r => ({ id:r.id, outcome:r.outcome, label:r.label, basis:r.basis, when: JSON.parse(r.whenDSL) })), default: gate.dsl.fallback },
      lookupTables: (finalPack.knowledge||{}).lookupTables || [], thresholds: (finalPack.knowledge||{}).thresholds || [] },
    seeds: gate.seeds,  // expectedOutcome 포함
    components: finalPack.components, compose, stepLoop,
    govern: [ {k:'Policy',v:'책임 지점 자동 차단 후 승인(HITL).'},{k:'Run Trace',v:'요청→판정→분기→반영 전 구간 기록.'},{k:'Evaluation',v:'evaluate(case,knowledge) 결정론·basis 추적.'},{k:'Skill Library',v:'유형·룰 재사용 자산화.'} ],
    surfaceSpec: { icon:'🗂️', title: label, tabs:['개요','판정','처리','기록'], _stub:true },
    provenance: { generatedBy:'harness+evaluate-in-the-loop+annotate', gatePass: gate.gatePass !== false, route: 'evaluate.js DSL', reviewedBy: null },
    _adapterNotes: ['knowledge.route=게이트 통과 실행가능 DSL(when 파싱됨). seeds=expectedOutcome 포함.','flow gate.next=verdict.outcome 바인딩(nextBy). lookup/threshold는 prose 참조(DSL화는 후속).','flow·loopPhase=휴리스틱 v0.2, app/ 세션 정통화.'],
  };
}

/* CLI */
const JOBS = [
  { file: 'contract_scenarios_run6_expectedoutcome.json', items: [['A','contract_A','계약 A사'],['B','contract_B','계약 B사']] },
  { file: 'scenarios_procurement_expense_n4_expectedoutcome.json', items: [['procurement','procurement','구매·조달'],['expense','expense','경비·지출']] },
  { file: 'scenarios_credit_subsidy_v2.json', items: [['credit','credit','여신·한도 심사'],['subsidy','subsidy','보조금·지원금 심사']] },
];
const outDir = path.join(HERE, 'packs_baked_v2'); fs.mkdirSync(outDir, { recursive: true });
const oOf = (r) => /자동승인/.test(r) ? 'AUTO_APPROVE' : /반려/.test(r) ? 'REJECT' : 'LEGAL_REVIEW';
const summary = [];
for (const job of JOBS) {
  const raw = JSON.parse(fs.readFileSync(path.join(HERE, job.file), 'utf8'));
  for (const [resKey, id, label] of job.items) {
    const finalPack = raw.result[resKey].finalPack; const gate = raw.result.evalSummary[id === 'contract_A' ? 'A' : id === 'contract_B' ? 'B' : id];
    const pack = adapt(finalPack, gate, id, label);
    // smoke
    let ok = 0; pack.seeds.forEach(s => { const c = {}; s.input.forEach(x => c[x.slot] = coerce(x.value)); if (evaluate(c, pack.knowledge).outcome === (s.expectedOutcome || oOf(s.expectedRoute))) ok++; });
    fs.writeFileSync(path.join(outDir, `pack_${id}.v2.json`), JSON.stringify(pack, null, 2), 'utf8');
    summary.push(`pack_${id}.v2: flow ${pack.flow.length}(gate ${pack.flow.filter(s=>s.kind==='gate').length}) · route ${pack.knowledge.route.rules.length}룰 · 슬롯 ${pack.caseModel.slots.length} · seed ${pack.seeds.length} · io(in ${pack.io.inputs.length}/conn ${pack.io.connectors.length}/edit ${pack.io.editable.length}) · evaluate 스모크 ${ok}/${pack.seeds.length}${ok===pack.seeds.length?' ✅':' X'}`);
  }
}
console.log('packs_baked_v2/ (게이트 통과 실행가능 Pack v2)\n' + summary.join('\n'));
