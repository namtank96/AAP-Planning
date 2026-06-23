# AAP 결정 런타임 · 시나리오 하니스 — 진행 내역 (index)

> **이 문서 = 진입점.** 2026-06-22~23 작업한 '결정 런타임 (B) + LLM 시나리오 생성 하니스' 트랙의 모든 산출물·결정·결과를 한눈에. 아래 파일들을 순서대로 열면 전체 흐름이 보입니다.
> ※ 이 트랙은 **문서·설계·하니스 산출물**만 다룸(app/ 코드는 다른 세션이 단일 writer로 담당). **코드 변경 0.**
> **현재 상태: 하니스 트랙 가설 검증 일단락** (신뢰 가능 + 범용 + 고객 변수 조건화 3박자 확보).

---

## 0. 한 줄 요약

"새 업무 요청이 LLM 추론이 아니라 키워드 골격(theater)"이라는 지적에서 출발 → **(A) 저작을 '오프라인 LLM 시나리오 생성 하니스'로 진짜로 만들고, (B) 실행은 명시지 결정론으로** 분리 → 계약 도메인으로 **하니스를 실제 실행**해 시나리오를 생성·자기검증(critic)·수렴(fix-loop)·튜닝(severity)·도메인 확장(구매·경비)까지 돌림. **결론: 하니스 = ① 신뢰 가능(severity critic으로 raw 출력 pass) ② 범용(계약·구매·경비가 같은 골격, 새 도메인 무수정 1패스) ③ 고객 변수 조건화(A사/B사 발산) — '범용 시나리오 공장'이 데이터로 입증됨.** 전부 인프라 0·앱 라이브 API 0·app/ 무관.

---

## 1. 어떤 결정을 거쳐 왔나 (의사결정 로그)

| # | 갈림길 | 유저 선택 | 결과 |
|---|---|---|---|
| 1 | 명시지 vs 암묵지, (A)저작 vs (B)런타임 | "먼저 설계만" → (B) 범용 설계 | `aap_decision_runtime_spec` |
| 2 | P1 증명 도메인 | **계약 관리**(재사용 골격 우선) | `aap_pack_contract_decision` |
| 3 | 고객 변수 반영·API 호출 검토 | "먼저 하니스 설계만"(앱 라이브 API ✕) | `aap_scenario_harness_spec` |
| 4 | 하니스 프로토타입 | 실행(계약×A사/B사) | run1: 변수 발산+골격 재사용 입증, critic fail |
| 5 | critic fail 후속 | N1 fix-loop 닫기 | run2: B사 pass·A사 미수렴 → 튜닝 과제 발견 |
| 6 | 루프 튜닝 | N1b severity+cap5+freeze | run3: **A·B 둘 다 0회 pass** → 진짜 문제는 critic 이분법이었음 |
| 7 | 도메인 확장 | N4 구매·경비 | **둘 다 0회 pass·골격 토큰단위 공유** → 범용 공장 입증 |

---

## 2. 설계 문서 (읽는 순서)

| 순서 | 파일 | 무엇 |
|---|---|---|
| ① | `aap_decision_runtime_spec_v0_1.md` | **(B) 결정 런타임 범용 설계.** "진짜로 돈다" 3조건(데이터구동·추적성·재현성), caseModel·knowledge·decide·verdict, LLM seam 3곳, critic 검증 |
| ② | `aap_pack_contract_decision_v0_1.md` | **계약 P1 결정 설계.** 14슬롯·knowledge 3종·decide→verdict 9종·명시지/암묵지 분리·seeds mock |
| ③ | `aap_scenario_harness_spec_v0_1.md` | **시나리오 생성 하니스 설계.** 입력(도메인+고객 프로파일)·10단계 loop·범용 evaluate()·critic·소비방식 |
| ④ | `aap_harness_poc_result_v0_1.md` | **하니스 실행 결과(★핵심).** §0~7=1차 실행 · §8=fix-loop · **§9=N1b severity 튜닝** · **§10=N4 도메인 확장** |
| ⑤ | `aap_harness_app_bridge_n3_v0_1.md` | **하니스↔앱 연계 진단 + 다리(N3) 핸드오프.** 3중 단절 진단 · 스키마 정합 · evaluate() 표준 · 소비 seam · Pack Contract v2 정합(app/ 세션 몫) |
| ⑥ | `aap_studio_enhancement_roadmap_v0_1.md` | **스튜디오 4화면 고도화 로드맵.** 새 업무 요청·도메인팩·워크플로우·자산 각각 무엇을 결정층·evaluate·검증·재사용으로 고도화할지 + 우선순위(첫 도미노=evaluate) |

---

## 3. 하니스가 실제 생성한 시나리오 (★직접 확인용)

> `_harness_out/` 에 보존(워크플로 temp = 휘발이라 복사).

**👉 먼저 이것부터**: `_harness_out/_시나리오_읽기쉬운_요약.md` — 시나리오를 **표로 변환한 사람이 읽는 버전**(계약 A사·B사 + N4 구매·경비 + 비교). JSON 안 열어도 전체 파악 가능.

원본 JSON(깊이 파볼 때 — 에디터로 열어 검색):

| 파일 | 무엇 | 핵심 검색어 |
|---|---|---|
| `contract_scenarios_run1.json` | 계약 1차(A/B, critic 둘 다 fail) | `analysis`·`knowledge`·`seeds`·`critic`·`conclusion` |
| `contract_scenarios_run2_fixloop.json` | 계약 fix-loop(B pass·A 3회 미수렴) | `convergence`·`history`·`changelog`·`finalPack` |
| `contract_scenarios_run3_severity.json` | 계약 N1b(severity → A·B 둘 다 0회 pass) | `convergence`·`passed`·`residualMinor` |
| `scenarios_procurement_expense_n4.json` | **N4 구매·경비**(둘 다 0회 pass) + 도메인 비교 | `ddiff`(`sharedArchetype`·`reuseRecipe`·`conclusion`) |
| `_harness_out/packs_baked/` | **다리 1 산출 — 앱 Pack v2로 bake한 4개**(어댑터 변환) | `pack_*.json`(flow·io·결정층) + `README.md` |
| `_decision_engine/` | **다리 2 — 코어 evaluate() + 검증**(드롭인) | `evaluate.js`·`run_eval_test.js`(golden 10/10)·`verify_harness_dsl.js`(자동 DSL 2결함 표면화)·**`verify_evalgate.js`(게이트본 독립 10/10)** + `README.md` |
| `_decision_engine/dropin/` | **app/ 드롭인 패키지** | `evaluate.js`·`pack_contract_A.decision.json`(**하니스 자동생성+evaluate게이트 통과본**)·`INTEGRATION.md`(≈3줄+헬퍼) |

---

## 4. 핵심 결과 (요약 — 3박자)

1. **고객 변수 조건화** (run1): 같은 계약 도메인인데 A사(SAP·온프레미스·보수) ≠ B사(Notion·DocuSign·중도)로 슬롯 출처·Connector·결재선·임계·게이트가 실제 발산.
2. **신뢰 가능** (N1b·§9): critic에 **severity(blocking/minor)**를 넣자 raw 생성물이 **수정 없이 pass**. ★발견 — 직전 "A사 fail"은 시나리오 결함이 아니라 **critic의 과엄격 이분법**(edge 갭을 hard-fail) 탓이었음. 자기검증 루프의 진짜 레버 = critic의 severity 모델. 비용도 1/7로 급감.
3. **범용** (N4·§10): **계약·구매·경비**가 6단계 파이프라인·decide 2계층·route 3분기 서열·gap↔게이트 1:1·임계 패밀리 5종·writeback을 **토큰 단위로 공유**. 새 도메인은 무수정 1패스로 생성. 도메인 차이는 knowledge·슬롯 소스에만 국한.

**재사용 레시피**(하니스 산출): 새 도메인 = ①슬롯 매핑 ②knowledge 4종 ③route 사유표 ④writeback 대상만 교체 / 골격 고정.

**공통**: 앱 라이브 API 불요(전부 Claude Code Workflow 하니스, 출력은 데이터). app/ 무관.

---

## 5. 변경·전달 기록
- `_AGENT_핸드오프_변경기록.md` §5 — 최신순. 하니스 N4·N1b·fix-loop·PoC·설계·계약 P1·(B) 런타임 설계(표준·정의 태그). app/ Pack Contract v2(다른 세션)와 병행·정합.

## 6. 현재 상태 · 열린 것
**하니스 트랙 = 가설 검증 + 다리 1·2 구현·드롭인 패키지까지 완료(app/ 무관).**
- **다리 1**(`adapter`): finalPack→Pack v2 bake 4개. **다리 2**(`_decision_engine/evaluate.js`): 도메인 무관 결정 엔진(golden 10/10).
- **하니스 DSL emit + evaluate-in-the-loop**(dslify→실행 게이트): 생성 DSL을 인-프로세스 결정론 게이트가 실행해 slot drift·분기 누출 검출→evalFix가 보완→**4도메인 전수 게이트 PASS**(계약A 10/10·B 9/9·구매 11/11·경비 11/11, drift 0, 독립 evaluate.js 재검증). 자기검증이 **prose critic + 실행 게이트 2중**으로 진화. ★prose가 놓친 걸 실행이 잡고 LLM이 고침.
- **드롭인 3팩 준비**(`_decision_engine/dropin/`): 자동생성+게이트통과본. **다른 세션(aap-platform)이 N3 핸드오프 받아 app/에 evaluate() 통합+bake 계약팩 구현 시작**(핸드오프 작동) → 게이트 통과본으로 교체 권장.
- **★Explore 확인**: Pack Contract v2 **flow/kind/loopPhase는 이미 코드 랜딩, 결정층(caseModel·knowledge·evaluate·next)만 공백** = 이 트랙이 채움.
- **드롭인 준비됨**(`_decision_engine/dropin/`): evaluate.js+golden DSL+INTEGRATION.md. app/ 세션이 ≈3줄+헬퍼로 머지(`decide` 무회귀).
- **다음**: (이 트랙) 하니스 dslify v0.2 / procurement·경비 DSL화·bake. (app/ 세션) 드롭인 통합. (선택) N2 소비 방식.
