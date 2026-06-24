# 하니스 ↔ 앱 연계 진단 + 다리 설계 (N3) v0.1

> **무엇**: 시나리오 생성 하니스(Claude Code 환경)와 앱 '새 업무 요청'·스튜디오가 **현재 분리**된 상태를 진단하고, 둘을 잇는 다리(스키마 정합 + `evaluate()` 결정 런타임 + 소비 seam)를 설계해 **app/ 세션(Pack Contract v2 담당)에 핸드오프**한다.
> **발단(유저, 260623)**: "하니스가 어떻게 구성됐나? '새 업무 요청'에서도 확인되나? 스튜디오(도메인팩·워크플로우·자산)도 다 연계돼야 — 현 상태 진단."
> **★정합(중요)**: 본 N3은 `aap_pack_contract_v2_spec.md`(다른 세션 진행 중)와 **보완 관계**다. **v2 = flow/io 구조 일반화**(단계 그래프·화면·입력), **N3 = 그 단계 안에서 도는 결정 룰 엔진**(caseModel·knowledge·evaluate). 겹치지 않고 맞물린다(§4·§7). 경쟁 스펙 ✕.
> ※ 본 문서는 **진단·설계만**(코드 0). 다리 2·3 구현은 app/ 편집 → 단일 writer 세션 몫.

---

> **갱신(260623, Explore 코드 확인)**: Pack Contract v2의 **`flow`·`kind`·`loopPhase`·`gate.decisions`는 이미 app/ 코드 랜딩**(packs/meeting·voc·recruiting + core `stKind`/`stLoop` core.js:204–219). **결정층(`caseModel`·`knowledge`·`evaluate`·flow `next`)만 공백** — 본 N3가 채우는 정확한 자리. 런타임 `decide(v)`(core.js:1454)는 기록만. 드롭인 준비 완료=`_decision_engine/dropin/`(§D 갱신).

## A. 현 상태 진단 — 3중 단절

| | 하니스 (Claude Code) | 앱 '새 업무 요청' (pipeline.js) | 앱 런타임/스튜디오 |
|---|---|---|---|
| 분해·구성 | **LLM(진짜)** | **키워드 사전(theater)** | — |
| 산출 데이터 | analysis·caseModel·knowledge·seeds | 옛 Pack(work/ops/surface 서사) | — |
| 판정 실행 | (생성만) | — | **`evaluate()` 없음** (core `decide`=HITL yes/no 핸들러일 뿐) |
| 앱 연결 | ❌ 무관(파일로만) | ✅ register→스튜디오 배선됨 | ✅ 카탈로그·wfeditor·자산 존재 |

- **앱 '새 업무 요청' 흐름은 이미 스튜디오까지 배선**: `＋새 업무 요청`(On-Ramp, `core.js:713`) → 유형 인식(키워드 토큰) → 매칭 실패 시 **격상 파이프라인**(`pipeline.js` 5단계) → `genericAuthor()` Pack 조립 → `AAP_CORE.register`(draft) → 스튜디오 도메인팩 → 배포 → 인박스/실행.
- **그러나** 분해·구성·게이트가 **키워드 매칭**(`proposeBreakdown/Compose/Gates`). 코드 주석에 *"Phase 3에서 LLM으로 교체"* 명시 = **하니스가 들어갈 바로 그 자리**.
- 산출 Pack은 **옛 형태** — `caseModel·knowledge·decide` 없음. 즉 하니스가 만든 **명시지 룰을 앱이 담을 그릇도, 돌릴 엔진도 아직 없음**.
- Pack Contract v2(다른 세션)는 `work→flow`·`io` **구조 일반화**까지 — **결정 룰 엔진은 범위 밖**(보완 필요 지점).

→ **세 가지가 따로 논다**: ①하니스는 좋은 데이터를 만들지만 앱에 안 들어감 ②'새 업무 요청'은 키워드라 하니스급 데이터를 못 만듦 ③만든 knowledge를 돌릴 `evaluate()`가 없음.

---

## B. 연계 목표 (유저 직관 = 맞음)

```
하니스(LLM 생성) ──①스키마 정합──▶ Pack v2(flow + io + 결정층) ──register──▶ 스튜디오
                                          │                                  ├ 도메인팩 = 정의(flow·knowledge)
                                          │                                  ├ 워크플로우 = flow 그래프(wfeditor)
                                          │                                  └ 자산 = components(5타입)
                                          └──②evaluate(case, knowledge)──▶ 인박스 케이스 실제 판정 → flow 라우팅
```
한 팩에서 **도메인팩·워크플로우·자산이 동시에 채워지고**, 인박스 케이스가 그 knowledge로 굴러간다.

---

## C. 다리 1 — 스키마 정합 (하니스 출력 → Pack v2 필드)

하니스 S9(조립)가 **Pack v2 스키마 + 결정층**으로 emit하게 한다. 매핑:

| 하니스 출력 | → Pack v2 필드 | 비고 |
|---|---|---|
| `analysis.subProcesses[]` + `decisions[]` | **`flow[]`** (각 단계 `{id,label,kind,loopPhase,gate?,next?}`) | tacit 결정·gap 슬롯 단계 = `kind:'gate'`, rule 단계 = `kind:'auto'`, 접수 = `kind:'input'` |
| route 3분기(자동승인/검토/반려) | 분기 단계의 **`gate.decisions` + `next`** | route verdict가 `next` 결정(§D) |
| `caseModel.slots[]` | **결정층 `caseModel`** + `io.inputs`(extract=manual/doc) + `io.connectors`(extract=connector) | gap 슬롯 → HITL 게이트 트리거 |
| `knowledge{lookup·decision·thresholds}` | **결정층 `knowledge`** (신규 필드, evaluate가 소비) | 본 N3가 추가하는 핵심 필드 |
| `components[]` (5타입) | `components` | 이미 동형(tA~tP) |
| `seeds[]` (입력 슬롯값) | `seeds` (mock 케이스) | v2 seeds와 동형 |
| `gates[]` (HITL 사유·basis) | `flow` gate 단계 `gate`/`explain` | |
| (하니스에 없음 → 어댑터가 파생) | `surfaceSpec`·`products`·`compose`·`govern`·`workload` | analysis·components에서 generic 생성(authoring.js `genericAuthor` 패턴 재사용) |

> **갭**: 하니스 PoC는 *연구형 평면 shape*(analysis/caseModel/knowledge/...)을 낸다. **앱에 바로 load 불가** — 위 매핑대로 **Pack v2 emit**이 필요(하니스 측 작업, app/ 무관).
>
> **✅ 구현됨(260623)**: `adapter_harness_to_pack_v0_1.js`(prose knowledge) → **v0.2로 진화**(`adapter_harness_to_pack_v0_2.js`): **게이트 통과 실행가능 DSL을 소비**해 완전한 Pack v2 emit — `knowledge.route`=evaluate.js 실행 DSL(when 파싱), `seeds`=expectedOutcome 포함, flow gate `next`=verdict.outcome 바인딩. 4팩 `_harness_out/packs_baked_v2/pack_*.v2.json` + **evaluate 스모크 전수 통과**(10/10·9/9·11/11·11/11). 다리 1+2 결합 = **app 로드 가능한 실행 결정층** 확보.

---

## D. 다리 2 — `evaluate()` 결정 런타임 표준 (★N3 핵심, v2와 맞물림)

코어에 **도메인 무관 선언형 룰 해석기**를 1회 추가. **하니스는 데이터(knowledge)만, 코드 생성 ✕.**

```
core.evaluate(caseData, knowledge) → verdicts[]
  · lookupTables: key→row 룩업
  · thresholds:   expr 평가(슬롯·룩업·산술 참조) → flag
  · decisionTables(route): when[] 첫매칭 → 분기 (1차 verdict 집계 허용)
  각 verdict = { id, inputs, output, basis, loopPhase, gate? }   // basis=룰id/행/식 (추적성 강제)
```
- **안전 DSL**: `when`/`expr` = 비교·논리·룩업참조·산술만(임의 코드 ✕) → 검증 가능·하니스가 emit 안전.
- **v2 flow와 맞물리는 지점**:
  - route verdict의 `output`(자동승인/검토/반려)이 v2 **gate 단계의 `next` 분기**를 결정 → `next: (S)=> S.verdicts.route.output` 형태.
  - v2 **`io.editable.recompute`** = "임계 바꾸면 `evaluate()` 재실행 → verdict 갱신 → flow 재라우팅". v2가 예약한 editable 모델의 **백엔드가 곧 evaluate()**(per-pack 코드 ✕ → knowledge 데이터).
  - gate 단계 `ops`/`explain`에 `@verdict:<id>.basis`로 근거 레일 채움.
- **✅ 구현·검증·고도화됨(260623)**: `_decision_engine/evaluate.js`(드롭인). 하니스 자동 DSL emit(dslify)이 처음엔 2결함(슬롯 drift·자동승인 누출)을 냈으나, **evaluate-in-the-loop**(생성 루프 내 결정론 게이트)로 **자동 해소** — 게이트가 실행 검출 → evalFix가 보완 룰(R6B)·슬롯 자동 생성 → A·B 1라운드 게이트 PASS(10/10·9/9, `verify_evalgate.js` 독립 재검증). **자기검증 = prose critic + 실행 게이트 2중.** 드롭인 팩 = 자동생성+게이트 통과본(수기 0).
- **§9 검증 러너(severity-aware, N1b 학습)**: 생성/편집된 knowledge를 **blocking/minor**로 검증. **blocking**(데이터구동·route 전 분기 커버·gap 누출 없음·basis 존재·미정의 입력 없음·재현성) 0이면 pass, **minor**(edge 임계 seed·문구)는 잔존 허용. → 과엄격 이분법이 비용·오판의 주원인이었음(하니스 N1b §9 입증). 이 잣대를 코어 검증 표준으로.

> **계약 P1 설계 보정 재확인**(`aap_pack_contract_decision` §): `decide`를 팩 함수로 적었으나 **표준 = 코어 `evaluate()` + 팩은 knowledge 데이터**. 팩 함수는 복잡 도메인 escape hatch.

---

## E. 다리 3 — 소비 seam (오프라인 bake 권장)

`pipeline.js`의 `proposeBreakdown/Compose/Gates`(키워드) 자리에 하니스를 꽂는다. 방식 3안:
- **A. 오프라인 bake(권장 시작)**: 하니스 출력 → `packs/<id>.js`로 커밋 → `register`. 앱 라이브 API 0·포터블 유지. '새 업무 요청'은 **선(先)생성·검토된 팩 카탈로그**를 제시.
- B. 사전 매트릭스: 도메인×프로파일 조합 N개 사전 생성 → 드롭다운 전환.
- C. 라이브: '새 업무 요청'에서 즉석 LLM 호출 → 백엔드 프록시 필요(보류).

> **현실 경로**: A로 계약·구매·경비 3팩을 bake → 스튜디오 카탈로그에 등장 → '새 업무 요청'에서 그 유형 선택 → 케이스가 `evaluate()`로 굴러감. 라이브 저작은 그 다음.

---

## F. 스튜디오 연계 (이미 배선 — 결정층만 흘려보내면 됨)

`register(pack)` 한 번으로 세 곳이 동시에 채워진다:
- **도메인팩**(정의·카탈로그) ← pack 전체(draft→deploy 생애주기 기존)
- **워크플로우**(wfeditor) ← `flow` 그래프(v2가 만드는 단계 그래프 = 워크플로우 편집 대상)
- **자산**(components 카탈로그) ← `components`(5타입, 전역 카탈로그 [[project-aap-object-model]])

→ 배선은 있다. **지금은 결정층(caseModel·knowledge) 없는 옛 Pack이 흘러서 반쪽**. 다리 1·2가 놓이면 **온전히 연계**.

---

## G. Pack Contract v2 세션에 넘기는 것 (정합 포인트·열린 질문)

> 본 N3은 v2의 **결정 엔진 보완**. v2 구현 시 함께 확정하면 충돌 0:

1. **flow ↔ route 매핑**: route decisionTable의 분기(자동/검토/반려)를 v2 `flow` gate 단계 `next`에 어떻게 바인딩할지(`next:(S)=>S.verdicts.route.output`). v2 §8 '열린 결정: next 분기 모델'과 직접 맞닿음 → **선언형(조건 테이블=knowledge.decisionTables)으로 통일** 제안.
2. **결정층 필드 위치**: `caseModel`·`knowledge`를 Pack export 1급 필드로(§3.3 유지 필드 옆에 추가). v2 `io.editable.recompute`의 표준 구현 = `evaluate(case, knowledge)`.
3. **evaluate() 소유**: 코어 도메인 무관 1함수(§D). v2의 "코어는 도메인 무관" 원칙과 정합.
4. **검증 러너 severity 모델**(N1b): v2 무회귀 검증에 blocking/minor 잣대 채택.
5. `flow` gate 단계의 `ops`/`explain`에 `@verdict:<id>.basis` 근거 표기 컨벤션.

---

## H. 단계 · 소유 (무엇이 누구 몫인가)

| 작업 | 소유 | app/ 편집? |
|---|---|---|
| 하니스 S9를 Pack v2 emit으로 (스키마 정합) | **이 트랙**(하니스) | ✕ |
| 계약·구매·경비 팩 오프라인 bake | **이 트랙** | ✕(packs/ 신규 파일은 협의) |
| 코어 `evaluate()` + 안전 DSL + §9 러너 | **app/ 세션**(v2와 함께) | ✅ |
| `pipeline.js` propose* → bake 카탈로그 연결 | **app/ 세션** | ✅ |
| flow ↔ route `next` 바인딩 | **app/ 세션**(v2 §8) | ✅ |

> 본 문서 = 진단 + 다리 설계 + 핸드오프. **다리 2·3(app/)은 단일 writer 세션이 v2와 함께**, 다리 1(하니스 emit)은 이 트랙이 독립 진행 가능.

---

## I. 참조
- 하니스: `aap_scenario_harness_spec_v0_1.md` · 결과 `aap_harness_poc_result_v0_1.md`(§9 severity·§10 도메인 확장)
- (B) 런타임: `aap_decision_runtime_spec_v0_1.md` · 계약 P1 `aap_pack_contract_decision_v0_1.md`
- **정합 대상**: `aap_pack_contract_v2_spec.md`(flow/io) · 객체모델 `aap_object_model_glossary_v0_1.md`
- 앱 현황: `app/core/pipeline.js`(propose* seam)·`app/core/core.js`(On-Ramp `recognizeWork`·register·스튜디오)
- 핸드오프 라우팅: `_AGENT_핸드오프_변경기록.md` §5
