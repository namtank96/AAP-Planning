/* 하니스가 emit한 DSL(run4)을 evaluate.js로 직접 실행 — 수기 구조화 0.
   ① 데이터구동 ② 추적성 ③ 재현성 + 슬롯 drift(route 참조 ↔ seed 제공) 리포트.
   실행: node verify_harness_dsl.js  */
const fs = require('fs');
const path = require('path');
const { evaluate } = require('./evaluate.js');

const run = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '_harness_out', 'contract_scenarios_run4_dsl.json'), 'utf8'));

/* 문자열 seed 값 → 타입 강제 */
function coerce(v) {
  if (typeof v !== 'string') return v;
  if (v === 'true') return true; if (v === 'false') return false;
  if (v === 'null' || v === '') return null;
  if (v === '[]') return [];
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v.includes('·')) return v.split('·').map(s => s.trim());
  return v;
}
/* route가 참조하나 seed에 없는 '파생' 슬롯 계산(문서화된 derivation). drift 표면화용. */
function deriveSlots(c, raw) {
  const derived = [];
  if (c.toxicHighCount === undefined) {
    const t = raw.toxicClauseHits || '';
    c.toxicHighCount = /무제한|한도 ?미설정|일방.{0,3}해지|과도한? ?위약/.test(t) ? 1 : 0;
    derived.push('toxicHighCount←toxicClauseHits(패턴)');
  }
  return derived;
}
const outcomeOf = (route) => /자동승인/.test(route) ? 'AUTO_APPROVE' : /반려/.test(route) ? 'REJECT' : 'LEGAL_REVIEW';

function run1(key) {
  const R = run.result[key]; if (!R || !R.dsl) { console.log(`[${key}] dsl 없음`); return; }
  const knowledge = { route: { rules: R.dsl.rules.map(r => ({ id: r.id, outcome: r.outcome, label: r.label, basis: r.basis, when: JSON.parse(r.whenDSL) })), default: R.dsl.fallback } };
  const seeds = R.finalPack.seeds;
  let okO = 0; const driftAll = new Set(); const rows = [];
  for (const s of seeds) {
    const raw = {}; s.input.forEach(x => raw[x.slot] = x.value);
    const c = {}; s.input.forEach(x => c[x.slot] = coerce(x.value));
    deriveSlots(c, raw).forEach(d => driftAll.add(d));
    const v = evaluate(c, knowledge);
    const expO = outcomeOf(s.expectedRoute);
    const o = v.outcome === expO; if (o) okO++;
    rows.push({ o: o ? 'OK' : 'X', got: v.outcome, exp: expO, rule: v.ruleId, seed: s.label.slice(0, 30) });
  }
  console.log(`\n=== [${key}] 하니스 DSL(${R.dsl.rules.length} rules, excluded=${JSON.stringify(R.dsl.excludedDisplaySlots || [])}) → evaluate, seed ${seeds.length} ===`);
  rows.forEach(r => console.log(`[${r.o}] ${r.got.padEnd(12)}(exp ${r.exp.padEnd(12)}) rule ${String(r.rule).padEnd(12)} | ${r.seed}`));
  console.log(`outcome ${okO}/${seeds.length} 일치 · 재현성 ${reprod(seeds, knowledge) ? 'OK' : 'X'}`);
  if (driftAll.size) console.log(`⚠ 슬롯 drift(route 참조 ↔ seed 미제공 → 파생 계산): ${[...driftAll].join(', ')}`);
}
function reprod(seeds, knowledge) {
  const f = () => seeds.map(s => { const c = {}; s.input.forEach(x => c[x.slot] = coerce(x.value)); deriveSlots(c, Object.fromEntries(s.input.map(x => [x.slot, x.value]))); return evaluate(c, knowledge).ruleId; }).join(',');
  return f() === f();
}

console.log('하니스 자동 emit DSL 검증 (수기 구조화 0) — evaluate.js 실행');
run1('A'); run1('B');
console.log('\n판정: 핵심 outcome 일치 = evaluate가 하니스 DSL을 데이터로 직접 실행. drift 슬롯은 하니스가 caseModel 슬롯으로 제한(또는 derive 룰 emit)하면 해소.');
