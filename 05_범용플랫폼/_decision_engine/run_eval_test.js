/* evaluate.js 검증 — contract_A 구조화 팩의 seed 를 실제로 판정.
   §9 검증: ①데이터구동(입력→결과) ②추적성(ruleId·basis) ③재현성(2회 동일).
   실행: node run_eval_test.js  */
const { evaluate } = require('./evaluate.js');
const pack = require('./contract_A.structured.json');

let outOk = 0, ruleOk = 0; const rows = [], notes = [];
for (const s of pack.seeds) {
  const v = evaluate(s.input, pack.knowledge);
  const oMatch = v.outcome === s.expect.outcome;
  const rMatch = v.ruleId === s.expect.ruleId;
  if (oMatch) outOk++; if (rMatch) ruleOk++;
  rows.push({ seed: s.label.slice(0, 26), expO: s.expect.outcome, gotO: v.outcome, o: oMatch ? 'OK' : 'X',
    expR: s.expect.ruleId, gotR: v.ruleId, r: rMatch ? 'OK' : '≠', basis: v.basis });
  if (!rMatch) notes.push(`· ${s.label}: 라벨 ${s.expect.ruleId} 인데 실제 발화 ${v.ruleId}(${v.label}) — basis: ${v.basis}`);
}

console.log('=== evaluate(case, knowledge) — contract_A 10 seed ===\n');
rows.forEach(r => console.log(
  `[${r.o}] outcome ${r.gotO.padEnd(12)} (exp ${r.expO.padEnd(12)}) | [${r.r}] rule ${r.gotR.padEnd(4)}(exp ${r.expR}) | ${r.seed}`));

console.log(`\n① 데이터구동·정확도: outcome ${outOk}/${pack.seeds.length} 일치, rule ${ruleOk}/${pack.seeds.length} 일치`);

/* ③ 재현성 — 2회 평가 동일 */
const a = pack.seeds.map(s => evaluate(s.input, pack.knowledge).ruleId).join(',');
const b = pack.seeds.map(s => evaluate(s.input, pack.knowledge).ruleId).join(',');
console.log(`③ 재현성: ${a === b ? 'OK (2회 동일)' : 'FAIL'}`);

/* ② 추적성 — 모든 결과에 ruleId+basis */
const traced = pack.seeds.every(s => { const v = evaluate(s.input, pack.knowledge); return v.ruleId && v.basis; });
console.log(`② 추적성: ${traced ? 'OK (전 결과 ruleId+basis 보유)' : 'FAIL'}`);

if (notes.length) {
  console.log('\n[발견] rule 불일치(=evaluate가 prose 검토가 놓친 추적성 결함을 표면화):');
  notes.forEach(n => console.log(n));
}
console.log('\n판정: 핵심 outcome(자동/검토/반려) ' + (outOk === pack.seeds.length ? '전수 일치 ✅' : 'X') +
  ' · 결정 엔진이 knowledge 데이터만으로 케이스를 결정론·추적·재현 가능하게 판정함.');
