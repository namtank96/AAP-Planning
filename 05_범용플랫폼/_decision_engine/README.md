# _decision_engine/ — 코어 evaluate() 독립 구현·검증 (첫 도미노)

> N3 §D '코어 결정 런타임'을 **app/ UI 없이 단독으로** 만들고 Node로 검증한 것. = 유저 "app 작업 따로 하고 붙일 수는?"에 대한 답 — **엔진은 분리 작업·검증 가능, 나중에 2줄로 붙임.**
> ※ app/ 무관(여기서 완결). 드롭인 경로는 §드롭인 참조.

## 파일
| 파일 | 무엇 |
|---|---|
| `evaluate.js` | **도메인 무관 선언형 룰 해석기.** 순수·결정론·안전 DSL. **드롭인**: 그대로 `app/core/evaluate.js` 복사(브라우저 `window.AAP_EVALUATE` / Node `module.exports` 양쪽 노출) |
| `contract_A.structured.json` | pack_contract_A의 route를 **평가 가능 DSL**로 구조화(현 baked 팩은 when이 사람 문장) + 타입 있는 seed 10 |
| `run_eval_test.js` | seed를 evaluate로 판정 → §9(데이터구동·추적성·재현성) 검증 |

## 검증 결과 (`node run_eval_test.js`)
```
outcome(자동승인/법무검토/반려) 10/10 일치 ✅
rule(R1~R10)                    9/10 일치
재현성 OK(2회 동일) · 추적성 OK(전 결과 ruleId+basis)
```
→ **결정 엔진이 knowledge 데이터만으로 케이스를 결정론·추적·재현 가능하게 판정**한다. UI·LLM 0.

## ★ 발견 — evaluate가 prose 검토가 놓친 결함을 표면화
seed10(신종조항 모호건)은 라벨이 **R10**(catch-all)인데 실제로는 **R7**(보수 임계)에서 발화. 원인: seed10 `riskGrade=중`이고 route R7이 `riskGrade=중 OR compositeRiskScore>=30`을 포함 → riskGrade가 분기에 끼어 라벨↔발화 불일치.
- 이건 하니스 **run2 fix-loop가 이미 식별**한 결함(riskGrade는 표시용 → 분기에서 배제, toxicHighCount/compositeRiskScore/toxicUnmatched 명시 슬롯만 사용)인데, **run3 severity 패스가 minor로 통과시켜 baked 팩이 미수정 버전을 물려받음**.
- **시사**: prose critic(문장 수준)은 못 잡고 **실행 엔진(evaluate)이 잡는다.** → ①하니스 route emit 시 **표시용 파생(riskGrade)을 when에서 배제**, 명시 슬롯만. ②결정층은 baked 후 **evaluate로 한 번 더 실행 검증**(prose 검토 + 실행 검증 2중).

## DSL (안전·평가 가능) — evaluate.js
조건 노드(첫 키=연산자): `all`/`any`/`not` · `==`/`!=`/`<`/`<=`/`>`/`>=` · `in`(집합 포함) · `intersects`(배열 교집합) · `empty`(빈 배열/문자열). ref `"$slot"` = 케이스 슬롯, 그 외 리터럴. `knowledge.route={rules:[{id,label,outcome,basis,when}],default}` 위→아래 첫 매칭. outcome ∈ AUTO_APPROVE/LEGAL_REVIEW/REJECT(도메인 무관 3분기). **임의 코드 실행 ✕ → 하니스가 emit 안전·검증 가능.**

## 드롭인 (app/ 세션 — 2줄 + 1 호출부)
1. `evaluate.js` → `app/core/evaluate.js` 복사. `index.html`에 `<script src="core/evaluate.js"></script>` (코어보다 먼저) 1줄.
2. 케이스 실행 시 `const v = AAP_EVALUATE.evaluate(caseData, PACK.knowledge)` → `v.outcome`으로 flow 라우팅(N3 §G-1: flow gate `next`↔v.outcome), `v.basis`로 근거 레일.
3. **전제**: `PACK.knowledge.route`가 DSL 형태여야 함 → **하니스 route emit 업그레이드**(현 baked는 prose when). = 이 트랙 다음 작업(app/ 무관).
→ 기존 파일 수정 = index.html 1줄 + 호출부 1곳. **머지 충돌 거의 0.**

## 검증 2 — 하니스 자동 DSL emit (`verify_harness_dsl.js`)
하니스에 `dslify` 단계를 얹어 검증된 prose route → **평가 가능 DSL을 자동 emit**(run4). `evaluate.js`로 직접 실행:
- ✅ **DSL emit·실행 동작**: A 9 rules+fallback, `excludedDisplaySlots:["riskGrade"]`(seed10 학습 반영). 재현성 OK.
- ⚠️ **outcome A 9/10·B 7/9** — evaluate가 **prose critic이 놓친 2개 결함 표면화**:
  1. **분기 커버리지 구멍**: riskGrade를 R7에서 제거했으나 보완 룰(toxicUnmatched)이 없어 **신종 모호 건(seed10)이 자동승인으로 누출**. = 표시 슬롯 제거가 보완 없이는 안전 구멍.
  2. **슬롯 drift**: route가 caseModel/seed에 없는 파생 슬롯(`toxicHighCount`) 참조 → 미스(B는 더 큼).
- → **결론: evaluate는 엔진일 뿐, knowledge 품질은 별도 게이트 필요.** prose+severity로는 못 잡고 **실행 검증(evaluate)이 잡음.**

## ✅ 검증 3 — evaluate-in-the-loop (구현·통과, `verify_evalgate.js`)
하니스 생성 루프에 **인-프로세스 결정론 게이트(JS·에이전트 0)**를 넣어, 생성된 DSL을 실제 실행해 ①슬롯 drift(route 참조 ⊆ caseModel) ②seed 분기 커버리지를 검사 → 실패 시 **evalFix 에이전트가 보완해 게이트 통과까지** 루프(run5).
- **결과: A·B 둘 다 단 1라운드에 게이트 PASS** (A 10/10·B 9/9). 표준 `evaluate.js` 독립 재검증도 동일(교차검증).
- **★자가수복 증거**: 검증2가 잡은 2결함을 게이트가 **자동으로 메움** — ①`toxicHighCount` 슬롯을 caseModel에 추가+전 seed에 값 주입(drift 해소) ②**보완 룰 `R6B`(toxicUnmatchedCount≥1 → LEGAL_REVIEW)를 자동 생성**해 신종 모호 건 자동승인 누출 차단(커버리지 구멍 메움). = prose critic이 놓친 걸 **실행 게이트가 잡고 LLM이 고침.**
- → **자기검증이 "prose critic" → "prose + 실행 게이트" 2중으로 진화. 자동 DSL이 "진짜로 도는" 것이 게이트로 보장됨.**

### 4개 도메인 전수 게이트 통과 (260623)
| 도메인 | 게이트 | 라운드 | 독립 재검증(evaluate.js) | drift |
|---|---|---|---|---|
| 계약 A | PASS | 1 | 10/10 | 0 |
| 계약 B | PASS | 1 | 9/9 | 0 |
| 구매·조달 | PASS | 3 | 11/11 | 0 |
| 경비·지출 | PASS | 1 | 11/11 | 0 |
- 게이트가 도메인별 고유 결함을 자동 해소: 구매=config 임계 슬롯 6종 drift + 임계값 seed 역산 / 경비=th_amount_tolerance 리터럴 치환.
- **부수 발견**: 게이트의 기대-outcome 도출(`_outcomeOf`)이 seed 라벨 정규식이라 "자동승인 **차단**" 같은 라벨에서 부분문자열 오매칭 → fixer가 라벨 보정으로 우회. **개선안: seed에 `expectedOutcome` 필드 명시(라벨 정규식 의존 제거).**

## 다음 (이 트랙·app/ 무관)
- (정밀화) seed에 `expectedOutcome` 명시 → 게이트 기대-outcome 정규식 의존 제거.
- **드롭인(`dropin/`)**: 3팩(`pack_contract_A`·`pack_procurement`·`pack_expense`.decision.json) = **하니스 자동생성 + evaluate 게이트 통과본**(수기 0, 독립 재검증 전수 ✅). app/ 통합 = `dropin/INTEGRATION.md`(≈3줄+헬퍼).
