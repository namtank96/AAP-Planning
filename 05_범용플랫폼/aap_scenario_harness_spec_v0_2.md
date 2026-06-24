# AAP 시나리오 생성 하니스 — 설계 v0.2 (as-built · loop engineering)

> **무엇**: v0.1 설계(`aap_scenario_harness_spec_v0_1.md`)를 실제 구현·검증으로 갱신한 **as-built 아키텍처**. 도메인/업무 + 고객 프로파일 → **자기검증된 실행 가능 결정 시나리오(Pack v2)** 를 생성하는 LLM 루프.
> **검증**: 5개 도메인(계약 A/B·구매·경비 + 여신·보조금 진행)에서 동작. 4도메인 게이트 통과·독립 evaluate.js 재검증 전수 ✅.
> **핵심 진화(v0.1→v0.2)**: 자기검증이 **"prose critic" → "prose critic + 실행 게이트(evaluate-in-the-loop)"** 2중으로. LLM이 생성한 룰을 **실제 실행해** 검증·자가수복.
> ※ 전부 **오프라인 저작**(Claude Code Workflow). 앱 라이브 API 0. 출력=데이터.

---

## 0. 한 줄
같은 골격(파이프라인·decide 2계층·route 3분기)에 **knowledge·슬롯만** 갈아끼우면 도메인이 **무수정 1패스 + 게이트 통과본**으로 찍혀 나온다 = **자기검증되는 범용 시나리오 공장.**

---

## 1. 루프 — 8단계 (각 = LLM 스텝, 단 게이트는 결정론 JS)

| # | 단계 | 종류 | 산출 |
|---|---|---|---|
| S1 | 업무 분석·드릴다운 | LLM | goal·actors·subProcesses·decisions(명시지/암묵지) |
| S2 | 룰·데이터 매핑 | LLM | caseModel.slots(source=legacy/gap)·knowledge(lookup·decisionTable·threshold)·components(5타입) |
| S3 | 더미·HITL | LLM | seeds(route 전 분기 커버)·gates |
| S4 | **severity critic** | LLM | blocking/minor 검증 → fail 시 S5 |
| S5 | critic-fix loop | LLM | blocking만 해소(1R 후 스키마 freeze) → S4 재검증 |
| S6 | **dslify** | LLM | route(prose)→평가가능 DSL(whenDSL). 표시용 파생(riskGrade) 분기 배제 |
| S7 | **annotate** | LLM | 각 seed에 `expectedOutcome` enum 명시(게이트 기대값 ground-truth) |
| S8 | **evaluate-in-the-loop 게이트** | **결정론 JS(에이전트 0)** | DSL 실행→drift·misroute 검출→실패 시 evalFix(LLM)로 게이트 통과까지 루프 |

> S4(severity)와 S8(실행 게이트)가 **2중 자기검증**. S4=문장 수준(논리·커버리지 주장), S8=실행 수준(실제 라우팅).

---

## 2. evaluate-in-the-loop (S8) — 핵심

```
evalGate(dsl, seeds, caseModelالسlotKeys):
  drift     = dsl.whenDSL 참조 슬롯 ⊄ caseModel.slots
  misroutes = seed 중 evaluate(seed.input, dsl).outcome ≠ seed.expectedOutcome
  pass      = drift 0 AND misroutes 0
while !pass and round<3:
  evalFix(dsl, seeds, 실패) → 슬롯 추가·보완 룰·seed 보정 → 재게이트
```
- **인-프로세스 결정론**(evaluate.js와 동형, 에이전트 0). 같은 입력 = 같은 결과.
- **자가수복 실증**: riskGrade 분기 배제로 생긴 자동승인 누출 → **보완 룰(toxicUnmatched→LEGAL) 자동 생성** / 미정의 파생 슬롯 → caseModel 추가+seed 주입.
- **expectedOutcome(S7)이 게이트 기대값**: 라벨 정규식 의존 제거(구매 3R→1R, "자동승인 차단" 오매칭 해소).

---

## 3. 출력 — 게이트 통과 Pack v2 (실행 가능)

`adapter_harness_to_pack_v0_2.js`가 게이트 통과본 → 앱 Pack v2:
```
{ id, label, flow[{id,label,kind,loopPhase,gate?,next?}], io{inputs,connectors,editable},
  caseModel{slots}, knowledge{ route:{rules[{id,outcome,label,basis,when(DSL)}],default}, lookup, threshold },
  seeds[{label,expectedRoute,expectedOutcome,input}], components, compose, govern, stepLoop, provenance{gatePass} }
```
- `knowledge.route` = **evaluate.js 실행 가능 DSL**(게이트 통과). `flow` gate `next` = `evaluate(case,knowledge).outcome` 바인딩.
- 산출물: `_harness_out/packs_baked_v2/pack_*.v2.json` (evaluate 스모크 전수 통과).

---

## 4. 검증된 학습 (loop engineering 원칙)

1. **자기검증 = prose + 실행 2중.** 문장 수준 critic은 슬롯 drift·분기 누출을 못 잡는다. **실행 게이트가 잡고 LLM이 고친다.** (실증: prose+severity 통과본을 evaluate가 2결함 표면화)
2. **severity가 결정적 레버.** blocking(본질)/minor(edge) 분리로 과엄격 이분법(=churn·오판)을 제거 → raw 출력 무수정 pass.
3. **게이트 기대값은 명시 ground-truth로.** 라벨 정규식 추측 ✕ → seed `expectedOutcome` 명시.
4. **하니스는 데이터만, 코드 생성 ✕.** route=선언형 DSL, evaluate=코어 1함수. 검증·재사용 가능.
5. **고객 프로파일이 1급 변수.** 같은 도메인이 레거시·정책·리스크 성향에 따라 발산(슬롯 출처·임계·게이트), 골격은 불변.
6. **재사용 레시피**: 새 도메인 = ①슬롯 매핑 ②knowledge ③route 사유 ④writeback만 교체. 파이프라인·decide 2계층·route 3분기·게이트·임계 패밀리 고정.

---

## 5. 정합 · 산출물
- 결정 런타임: `aap_decision_runtime_spec_v0_1.md` · 다리: `aap_harness_app_bridge_n3_v0_1.md`
- 엔진·검증: `_decision_engine/`(evaluate.js·verify_*·dropin/) · 어댑터: `_harness_out/adapter_harness_to_pack_v0_2.js`
- 게이트 통과본: `_harness_out/packs_baked_v2/` · 원본 run: `_harness_out/*_evalgate.json`·`*_expectedoutcome.json`
- 진입점: `_AAP_결정런타임_진행내역_index.md`
