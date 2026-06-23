/* =========================================================================
   하니스 출력 → 앱 Pack v2 어댑터 (다리 1 — 스키마 정합) v0.1
   ─────────────────────────────────────────────────────────────────────────
   입력: 하니스 워크플로 결과 JSON의 finalPack
     { domain, profile?, goal, actors, subProcesses[], decisions[],
       caseModel{slots[]}, knowledge{lookupTables,decisionTables,thresholds},
       components[], seeds[], gates[] }
   출력: 앱 Pack v2 (aap_pack_contract_v2_spec §3 + 결정층 aap_decision_runtime_spec)
     { id, label, flow[], io{inputs,connectors,editable},
       caseModel, knowledge, components, compose[], seeds, gates, govern,
       stepLoop, surfaceSpec(stub), provenance, _adapterNotes }
   ─────────────────────────────────────────────────────────────────────────
   순수 결정론 변환(LLM ✕). 결정층(caseModel·knowledge·seeds·components)은 1:1 통과(정밀),
   flow·loopPhase·gate 분류는 휴리스틱(어댑터 v0.1 — app/ 세션이 정통화).
   실행: node adapter_harness_to_pack_v0_1.js   (저장된 _harness_out/*.json 일괄 bake)
   ※ app/ 무관 — _harness_out/packs_baked/ 에만 출력.
   ========================================================================= */
const fs = require('fs');
const path = require('path');
const HERE = __dirname;

const TYPE_CLS = { 'Agent':'tA', 'Module':'tM', '기존 솔루션':'tS', 'Connector':'tC', 'Policy':'tP' };
const TYPE_SUB = { 'Agent':'전문 작업', 'Module':'재사용 기능', '기존 솔루션':'Buy·Integrate', 'Connector':'시스템 연동', 'Policy':'통제·권한' };

const has = (s, ...kw) => kw.some(k => (s||'').includes(k));

/* 단계 종류(kind) — v2: input / auto / gate.
   gate = '구조적' 사람 결정 단계만(라우팅·결재·HITL 심층검토). 단계 내부의 암묵지 sub-결정은
   gates[](HITL 사유)로 흡수 → 여기선 라벨 마커만으로 보수적 분류(auto 우세가 정상: 규정 심사). */
function classifyKind(sp, i) {
  const lab = sp.label || '';
  if (i === 0 || has(lab, '접수', '수신', 'intake')) return 'input';
  if (has(lab, '분기', '결재', '승인', '심층검토', '검토(HITL)', 'HITL', '라우팅', 'approval', 'routing')) return 'gate';
  return 'auto';
}

/* 운영 루프 phase — Data/Semantic/Reasoning/Decision/Action/Learning */
function loopPhaseOf(sp, i, n) {
  const t = sp.label + ' ' + (sp.detail||'');
  if (has(t, '접수', '수집', '조회', '추출', '수신')) return 'Data';
  if (has(t, '분류', '이해', '식별', '의미', '정규화')) return 'Semantic';
  if (has(t, '분기', '결재', '승인', '판정', '검토')) return 'Decision';
  if (has(t, '반영', '생성', '발행', '기록', 'PO', '전표', 'writeback', '등록')) return (i >= n-1 ? 'Learning' : 'Action');
  if (has(t, '학습', '패턴')) return 'Learning';
  return 'Reasoning';  // 점검·분석·산정·탐지
}

/* route 결정테이블 → gate.decisions (분기 라벨 추출) */
function routeDecisions(knowledge) {
  const rt = (knowledge.decisionTables||[]).find(t => /route|분기|승인|심사|검토/.test(t.id + t.description));
  if (!rt) return [{ key:'approve', label:'승인·진행', toast:'승인합니다' }, { key:'reject', label:'반려', toast:'반려합니다' }];
  const outs = [...new Set(rt.rules.map(r => r.then.split(/[—(:]/)[0].trim()))];
  return outs.slice(0, 4).map((o, k) => ({
    key: /자동|승인/.test(o) ? 'auto' : /반려/.test(o) ? 'reject' : `review${k}`,
    label: o, toast: `${o} 처리`
  }));
}

function adapt(fp, opts = {}) {
  const id = opts.id || (fp.domain + (fp.profile && fp.profile.key ? '_' + fp.profile.key : ''));
  const label = opts.label || (fp.domain === 'procurement' ? '구매·조달' : fp.domain === 'expense' ? '경비·지출'
                 : fp.domain === 'contract' ? '계약 관리' : fp.domain);
  const tacitLabels = (fp.decisions||[]).filter(d => d.kind === 'tacit').map(d => d.label);
  const sps = fp.subProcesses || [];
  const n = sps.length;
  const gateDecs = routeDecisions(fp.knowledge);

  /* flow — subProcess → 단계 */
  const flow = sps.map((sp, i) => {
    const kind = classifyKind(sp, i);
    const st = { id: sp.id, label: sp.label, kind, loopPhase: loopPhaseOf(sp, i, n), explain: sp.detail };
    if (kind === 'gate') {
      const isRoute = /분기|결재|승인 판정|approval|routing/.test(sp.id + sp.label) || /분기/.test(sp.label);
      st.gate = { label: sp.label, decisions: isRoute ? gateDecs
        : [{ key:'ok', label:'확인·진행', toast:'확인했습니다' }, { key:'revise', label:'보완 요청', toast:'보완을 요청합니다' }] };
    }
    return st;
  });

  /* io — slots에서 파생 */
  const slots = (fp.caseModel && fp.caseModel.slots) || [];
  const inputStage = (flow.find(s => s.kind === 'input') || flow[0] || {}).id;
  const io = {
    inputs: slots.filter(s => ['manual','doc'].includes(s.extract))
      .map(s => ({ stage: inputStage, type: s.extract === 'doc' ? 'file' : 'field', key: s.key, label: s.label })),
    connectors: (fp.components||[]).filter(c => ['Connector','기존 솔루션'].includes(c.type))
      .map(c => ({ id: 'c_' + (c.name||'').replace(/\s+/g,'_').slice(0,16), label: c.name, system: c.connectsTo || c.name, stub: true })),
    editable: (fp.knowledge.thresholds||[]).map(t => ({ key: t.id, label: t.flag, type: 'threshold', recompute: 'evaluate(case,knowledge)' })),
  };

  /* compose — components 타입별 집계 */
  const cnt = {}; const items = {};
  (fp.components||[]).forEach(c => { cnt[c.type] = (cnt[c.type]||0)+1; (items[c.type] = items[c.type]||[]).push(c.name); });
  const compose = Object.keys(TYPE_CLS).filter(t => cnt[t]).map(t => ({ t, sub: TYPE_SUB[t], cls: TYPE_CLS[t], n: cnt[t], items: items[t].slice(0,5) }));

  const stepLoop = {}; flow.forEach(s => { stepLoop[s.id] = s.loopPhase; });

  return {
    id, label,
    flow,
    io,
    /* ── 결정층 (정밀 통과 — 본 어댑터의 핵심 가치) ── */
    caseModel: fp.caseModel,
    knowledge: fp.knowledge,
    seeds: fp.seeds,
    /* ── 구조 ── */
    components: fp.components,
    compose,
    gates: (fp.gates||[]).map(g => g.reason || g),
    stepLoop,
    govern: [
      { k:'Policy', v:'책임 지점 자동 차단 후 승인(HITL 게이트).' },
      { k:'Run Trace', v:'요청→판정→분기→반영 전 구간 기록.' },
      { k:'Evaluation', v:'evaluate(case,knowledge) 결정론 판정·근거(basis) 추적.' },
      { k:'Skill Library', v:'유형·룰·패턴 재사용 자산화.' },
    ],
    /* surfaceSpec는 어댑터 stub — app/ 세션 generic 렌더러가 채움 */
    surfaceSpec: { icon:'🗂️', title: label, customer: (fp.profile && fp.profile.org && fp.profile.org.name) || '고객', owner:'담당자',
      tabs:['개요','판정','처리','기록'], _stub:true },
    provenance: { generatedBy:'harness', adapter:'harness_to_pack_v0.1', domain: fp.domain,
      profile: fp.profile ? fp.profile.label : null, reviewedBy: null },
    _adapterNotes: [
      'flow·loopPhase·gate 분류 = 휴리스틱(어댑터 v0.1). app/ 세션이 정통화(Pack Contract v2 2b).',
      'caseModel·knowledge·seeds·components = 하니스 출력 1:1 통과(정밀).',
      'surfaceSpec = stub. io.editable.recompute = evaluate() (코어 표준, N3 §D).',
      'route 분기는 knowledge.decisionTables가 SSOT — flow gate decisions는 그 라벨 미러.',
    ],
  };
}

/* ── CLI: 저장된 하니스 JSON 일괄 bake ── */
const JOBS = [
  { file: 'contract_scenarios_run3_severity.json', pick: r => [['contract_A', r.A.finalPack], ['contract_B', r.B.finalPack]] },
  { file: 'scenarios_procurement_expense_n4.json',  pick: r => [['procurement', r.procurement.finalPack], ['expense', r.expense.finalPack]] },
];
const outDir = path.join(HERE, 'packs_baked');
fs.mkdirSync(outDir, { recursive: true });
const summary = [];
for (const job of JOBS) {
  const raw = JSON.parse(fs.readFileSync(path.join(HERE, job.file), 'utf8'));
  for (const [id, fp] of job.pick(raw.result)) {
    const pack = adapt(fp, { id });
    fs.writeFileSync(path.join(outDir, `pack_${id}.json`), JSON.stringify(pack, null, 2), 'utf8');
    summary.push(`pack_${id}: flow ${pack.flow.length}단계(input ${pack.flow.filter(s=>s.kind==='input').length}/auto ${pack.flow.filter(s=>s.kind==='auto').length}/gate ${pack.flow.filter(s=>s.kind==='gate').length}) · 슬롯 ${pack.caseModel.slots.length} · 룰표 ${pack.knowledge.decisionTables.length}+${pack.knowledge.lookupTables.length}+${pack.knowledge.thresholds.length} · seed ${pack.seeds.length} · io.inputs ${pack.io.inputs.length}/connectors ${pack.io.connectors.length}/editable ${pack.io.editable.length}`);
  }
}
console.log('baked → packs_baked/\n' + summary.join('\n'));
module.exports = { adapt };
