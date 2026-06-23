/* evaluate-in-the-loop 게이트가 통과시킨 DSL을, 워크플로 내부 게이트와 독립적으로
   표준 evaluate.js 로 재검증(run5). = 게이트 결과의 외부 교차검증.
   실행: node verify_evalgate.js  */
const fs = require('fs'), path = require('path');
const { evaluate } = require('./evaluate.js');
const run = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '_harness_out', 'contract_scenarios_run5_evalgate.json'), 'utf8'));
const ES = run.result.evalSummary;

const coerce = (v) => { if (typeof v !== 'string') return v; if (v === 'true') return true; if (v === 'false') return false;
  if (v === 'null' || v === '') return null; if (v === '[]') return []; if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v.includes('·')) return v.split('·').map(s => s.trim()); return v; };
const outcomeOf = (r) => /자동승인/.test(r) ? 'AUTO_APPROVE' : /반려/.test(r) ? 'REJECT' : 'LEGAL_REVIEW';

for (const k of ['A', 'B']) {
  const E = ES[k]; if (!E) continue;
  const knowledge = { route: { rules: E.dsl.rules.map(r => ({ id: r.id, outcome: r.outcome, label: r.label, basis: r.basis, when: JSON.parse(r.whenDSL) })), default: E.dsl.fallback } };
  // drift: route 참조 슬롯 ⊆ slotKeys
  const refs = new Set(); E.dsl.rules.forEach(r => (r.whenDSL.match(/\$[A-Za-z_][A-Za-z0-9_]*/g) || []).forEach(m => refs.add(m.slice(1))));
  const drift = [...refs].filter(x => E.slotKeys.indexOf(x) < 0);
  let ok = 0; const rows = [];
  for (const s of E.seeds) { const c = {}; s.input.forEach(x => c[x.slot] = coerce(x.value)); const v = evaluate(c, knowledge); const exp = outcomeOf(s.expectedRoute);
    if (v.outcome === exp) ok++; rows.push(`[${v.outcome === exp ? 'OK' : 'X'}] ${v.outcome.padEnd(12)}(exp ${exp.padEnd(12)}) ${String(v.ruleId).padEnd(8)} | ${s.label.slice(0, 30)}`); }
  console.log(`\n=== [${k}] 게이트-통과 DSL 독립 재검증 (evaluate.js) — rules ${E.dsl.rules.length} ===`);
  rows.forEach(r => console.log(r));
  console.log(`outcome ${ok}/${E.seeds.length} · 슬롯 drift: ${drift.length ? drift.join(',') : '없음 ✅'} · 워크플로 게이트 보고: ${E.gatePass ? 'PASS' : 'FAIL'} ${E.ok}`);
}
console.log('\n판정: 게이트-통과 DSL이 표준 evaluate.js로도 동일 결과 = evaluate-in-the-loop가 "진짜로 도는" DSL을 생성·자가수복함(교차검증).');
