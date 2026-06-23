/* =========================================================================
   AAP 결정 런타임 — evaluate(caseData, knowledge) v0.1  (N3 §D 참조 구현)
   ─────────────────────────────────────────────────────────────────────────
   도메인 무관 선언형 룰 해석기. knowledge(데이터)만으로 케이스를 판정한다.
   순수·결정론(Date/random ✕) → 같은 입력 = 같은 출력(재현성). LLM 0.
   안전 DSL: 비교·논리·집합·산술만(임의 코드 실행 ✕) → 검증 가능, 하니스가 emit 안전.

   ★ 드롭인: 이 파일을 app/core/evaluate.js 로 복사 + index.html 에 <script src> 한 줄.
     브라우저=window.AAP_EVALUATE / Node=module.exports 양쪽 노출.
   ─────────────────────────────────────────────────────────────────────────
   DSL 조건(condition) 노드 — 첫 키가 연산자:
     { "all":[..] }            모두 참(AND)
     { "any":[..] }            하나라도 참(OR)
     { "not": cond }           부정
     { "==":[ref,val] }        같음   (!=, <, <=, >, >= 동일)
     { "in":[ref,[vals]] }     ref 값이 집합에 포함
     { "intersects":[ref,[vals]] }  배열 ref 가 집합과 교집합 ≥1
     { "empty": ref }          배열/문자열이 빔
   ref: "$slotName"(케이스 슬롯) 또는 리터럴(숫자/불리언/문자열).
   knowledge.route = { rules:[ {id,label,outcome,basis,when} ], default:{id,label,outcome,basis} }
     outcome ∈ 'AUTO_APPROVE' | 'LEGAL_REVIEW' | 'REJECT' (도메인 무관 3분기)
   evaluate → { outcome, ruleId, label, basis, inputs:{읽은 슬롯}, reproducible:true }
   ========================================================================= */
(function (g) {
  'use strict';

  function ref(x, ctx) {
    if (typeof x === 'string' && x[0] === '$') {
      ctx._read.add(x.slice(1));
      return ctx.caseData[x.slice(1)];
    }
    return x; // 리터럴
  }

  const CMP = {
    '==': (a, b) => a === b,
    '!=': (a, b) => a !== b,
    '<':  (a, b) => num(a) <  num(b),
    '<=': (a, b) => num(a) <= num(b),
    '>':  (a, b) => num(a) >  num(b),
    '>=': (a, b) => num(a) >= num(b),
  };
  const num = (v) => (typeof v === 'number' ? v : Number(v));
  const arr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);

  function evalCond(cond, ctx) {
    if (cond == null) return false;
    if (cond.all) return cond.all.every((c) => evalCond(c, ctx));
    if (cond.any) return cond.any.some((c) => evalCond(c, ctx));
    if (cond.not) return !evalCond(cond.not, ctx);
    for (const op in CMP) {
      if (op in cond) { const [a, b] = cond[op]; return CMP[op](ref(a, ctx), ref(b, ctx)); }
    }
    if (cond.in) { const [a, set] = cond.in; return set.indexOf(ref(a, ctx)) >= 0; }
    if (cond.intersects) { const [a, set] = cond.intersects; const v = arr(ref(a, ctx)); return v.some((x) => set.indexOf(x) >= 0); }
    if (cond.empty !== undefined) { const v = ref(cond.empty, ctx); return v == null || (Array.isArray(v) ? v.length === 0 : v === ''); }
    throw new Error('evaluate: 알 수 없는 조건 노드 ' + JSON.stringify(cond));
  }

  /* 단일 결정테이블(route) 평가 — 위→아래 첫 매칭 */
  function evalTable(table, caseData) {
    const ctx = { caseData, _read: new Set() };
    for (const r of (table.rules || [])) {
      ctx._read.clear();
      if (evalCond(r.when, ctx)) {
        const inputs = {}; ctx._read.forEach((k) => { inputs[k] = caseData[k]; });
        return { outcome: r.outcome, ruleId: r.id, label: r.label, basis: r.basis || r.id, inputs, matched: true, reproducible: true };
      }
    }
    const d = table.default || { outcome: 'LEGAL_REVIEW', id: 'default', label: '기본(모호) HITL', basis: 'no rule matched' };
    return { outcome: d.outcome, ruleId: d.id, label: d.label, basis: d.basis, inputs: {}, matched: false, reproducible: true };
  }

  /* knowledge 전체 평가 — route 우선. (thresholds/lookup 은 route.when 에서 참조; 별도 verdict 필요 시 확장) */
  function evaluate(caseData, knowledge) {
    if (!knowledge || !knowledge.route) throw new Error('evaluate: knowledge.route 필요');
    const v = evalTable(knowledge.route, caseData);
    return v;
  }

  const api = { evaluate, evalTable, evalCond };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  g.AAP_EVALUATE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
