# packs_baked_v2/ — 게이트 통과 실행 가능 Pack v2 (다리 1+2 결합)

> `adapter_harness_to_pack_v0_2.js` 산출. 하니스 **게이트 통과본**(evaluate-in-the-loop + expectedOutcome) → 완전한 앱 Pack v2.
> v0.1(`../packs_baked/`)과 차이: `knowledge.route`가 **prose가 아니라 evaluate.js 실행 가능 DSL**(when 파싱), `seeds`에 **expectedOutcome 명시**, flow gate `next`=verdict.outcome 바인딩.

## 파일 (evaluate 스모크 전수 통과 · **6도메인**)
| 팩 | flow(gate) | route 룰 | 슬롯 | seed | 스모크 |
|---|---|---|---|---|---|
| `pack_contract_A.v2.json` | 13(4) | 10 | 30 | 10 | 10/10 ✅ |
| `pack_contract_B.v2.json` | 10(3) | 7 | 31 | 9 | 9/9 ✅ |
| `pack_procurement.v2.json` | 7(1) | 11 | 39 | 11 | 11/11 ✅ |
| `pack_expense.v2.json` | 7(2) | 11 | 49 | 11 | 11/11 ✅ |
| `pack_credit.v2.json`(여신·한도) | 7(2) | 9 | 27 | 10 | 10/10 ✅ |
| `pack_subsidy.v2.json`(보조금) | 7(2) | 7 | 25 | 10 | 10/10 ✅ |

> 여신·보조금(금융·공공)은 N4 골격(계약·구매·경비)을 **무수정 재사용**해 게이트 통과(여신 0R·보조금 1R). 범용 공장 폭이 **백오피스 4종 → 금융/공공 포함 6종**으로 확장됨.

## ★ app/ 세션 교체 권장 (정합성 검토 C4)
현재 app `packs/contract_a.js`는 **구버전**일 수 있음 — seeds에 `expectedOutcome` 없음, route가 evaluate-in-the-loop **게이트 통과 이전**(riskGrade 제거로 인한 자동승인 누출 보완 룰 `R6B` 미반영 가능). 

→ **`pack_contract_A.v2.json`의 `caseModel`·`knowledge.route`·`seeds`로 교체** 권장:
- route가 게이트 통과·독립 evaluate.js 재검증본(자동승인 누출 차단 R6B 포함)
- seeds에 expectedOutcome 명시 → 런타임/검증이 라벨 파싱 없이 명시 필드 사용
- 슬롯 drift 0(route 참조 ⊆ caseModel)

## 구조
- `knowledge.route` = `{ rules:[{id,outcome,label,basis,when}], default }` — `when`=파싱된 evaluate.js DSL 객체. `AAP_EVALUATE.evaluate(caseData, pack.knowledge)`가 바로 실행.
- `flow[].next` = `{AUTO_APPROVE,LEGAL_REVIEW,REJECT}→stepId`, `nextBy:'evaluate(caseData,knowledge).outcome'`(N3 §G-1 분기 바인딩, 현 app 미구현 C2).
- `lookupTables`·`thresholds` = prose 참조(DSL화는 후속 — route만 실행 가능).
- `flow`·`loopPhase` = 휴리스틱 v0.2(app/ 세션 정통화 C3).

## 재생성
`node ../adapter_harness_to_pack_v0_2.js`
