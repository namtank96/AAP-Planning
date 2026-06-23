# 스튜디오 4화면 고도화 로드맵 — 하니스·Pack v2 기준 v0.1

> **무엇**: '새 업무 요청' · 도메인팩 · 워크플로우 · 자산 4개 화면을, **하니스 산출물**(caseModel·knowledge·seeds·evaluate·고객 프로파일 조건화·severity 검증·재사용 레시피)과 **설계 중 Pack v2**(flow·io·kind·loopPhase·editable)에 비춰 무엇을 고도화하면 좋은지 진단.
> **발단(유저, 260623)**: "'새 업무 요청'·도메인팩·워크플로우·자산 쪽에 어떤 점이 고도화되면 좋겠나? 지금 하니스와 설계 중 app/ 기준으로."
> **정합**: 하니스=`aap_scenario_harness_spec`·결과 `aap_harness_poc_result`(§9·§10) / 다리=`aap_harness_app_bridge_n3` / app/ 구조=`aap_pack_contract_v2_spec`(다른 세션) / 객체모델=`aap_object_model_glossary`.
> ※ 진단·로드맵만. app/ 편집은 단일 writer 세션 몫(소유 표기).

---

## 0. 한 줄 — 4화면의 공통 고도화 축

하니스가 만든 **4가지를 4화면에 흘려보내는 것**:
1. **결정층**(caseModel·knowledge) — 지금 화면들이 못 담는 핵심.
2. **evaluate() 실행** — 케이스가 실제로 굴러가게.
3. **검증(severity)** — "진짜로 도는 팩"을 배지로.
4. **재사용 레시피**(골격 고정 + 4가지 교체) — 새 도메인 저작을 가이드.

---

## 1. '새 업무 요청' (On-Ramp / 격상)

| | |
|---|---|
| **현재** | 키워드 토큰 인식 → 매칭 실패 시 격상(`pipeline.js` 키워드 분해 theater) → `genericAuthor` 옛 Pack → register |
| **고도화** | ① **키워드 분해 → 하니스 결과로 교체**: 신규 업무는 라이브 분해(theater) 대신 **오프라인 하니스가 미리 bake한 검증 팩 카탈로그**를 인식 후보로 제시(`packs_baked/`). ② **드릴다운 노출**: 분해 화면에 하니스 `analysis`(subProcesses·**명시지/암묵지 split**·route 3분기)를 그대로 — 가짜 분해 ✕. ③ **격상 검증을 §9 severity로**: 현 'HITL 게이트 N개' 체크리스트 → **blocking/minor 검증**(데이터구동·분기커버·추적성·gap누출). ④ **고객 환경 입력**: 요청 시 레거시 프로파일을 받아 **어떤 변형 시나리오가 맞는지** 조건화(같은 도메인 A사≠B사). ⑤ **정직한 2분기**: "이미 학습된 유형(baked)" vs "신규(오프라인 저작 필요)"를 구분 표기 |
| **하니스 근거** | analysis(드릴다운)·severity critic(§9)·프로파일 조건화(§2 PoC)·`packs_baked/` |
| **소유** | app/ 세션(`pipeline.js` propose*→bake 연결, N3 다리 3) + 이 트랙(bake 카탈로그 공급) |

> 핵심: '새 업무 요청'은 **라이브로 똑똑한 척**할 게 아니라, **오프라인에서 검증된 것을 인식·제시**하고 신규는 정직하게 저작 큐로 보낸다.

---

## 2. 도메인팩 (스튜디오 카탈로그·정의)

| | |
|---|---|
| **현재** | register된 팩, draft/deployed 생애주기. work/surface 서사 중심. **결정층 없음** |
| **고도화** | ① **결정층을 1급 표시**: 팩 상세에 **데이터 모델(caseModel 슬롯)·룰(knowledge 룩업·임계·결정테이블)·테스트 케이스(seeds)·명시지/암묵지 split**을 뷰로(지금은 안 보임). ② **검증 상태 배지**: `provenance.reviewedBy`·critic verdict(blocking 0=✅ 검증 통과 / minor N)·branchCoverage. ③ **프로파일 변형(variant)**: "같은 도메인·다른 환경"을 별도 팩이 아니라 **A사/B사 변형**으로(슬롯 source·Connector·임계만 차이). ④ **재사용 레시피 가시화**: 공유 골격(6단계·임계 패밀리 5종) vs 도메인 고유 knowledge를 갈라 보여 새 도메인 저작자가 "무엇만 갈아끼우면 되는지" 즉시 이해. ⑤ **lineage**: 이 팩이 어느 하니스 run에서 나왔는지(provenance) |
| **하니스 근거** | finalPack(caseModel·knowledge·seeds)·severity·N4 sharedArchetype/reuseRecipe·provenance |
| **소유** | app/ 세션(팩 상세 뷰에 결정층 섹션·배지) + 이 트랙(provenance·검증 데이터 공급) |

---

## 3. 워크플로우 (wfeditor / flow 그래프)

| | |
|---|---|
| **현재** | 3패널 빌더(Palantir AIP Logic식). work/flow 단계 편집 |
| **고도화** | ① **route 분기 시각화**: gate 단계의 `next`를 **route 결정테이블(자동승인/검토/반려)에 바인딩**해 선형이 아니라 **3분기 그래프**로(v2 §8 + N3 §G-1). ② **kind·loopPhase 표면화**: 어댑터가 만든 input/auto/gate·Data~Learning을 노드에 표기(엔진이 단계 종류를 이해함을 시각화). ③ **gate ↔ knowledge 연결**: 게이트 노드 클릭 시 **어떤 룰(decisionTable when)이 이 분기를 일으키나** basis 표시. ④ **io.editable 라이브 튜닝**: 임계·가중치를 워크플로우에서 직접 수정 → **`evaluate()` 재계산 → seeds가 분기를 다시 타는 걸 즉석 확인**(세탁 PoC '직접 만져보고 체감' [[project-laundry-poc-ontology]]). ⑤ **분기 커버리지 검사**: 편집기 안에서 §9 branch-coverage(모든 flow 분기를 seed가 커버하나) 실시간 |
| **하니스 근거** | flow(어댑터)·knowledge.decisionTables·seeds·evaluate·§9 branchCoverage·io.editable |
| **소유** | app/ 세션(wfeditor에 분기 바인딩·basis·editable·커버리지) |

> 핵심: 워크플로우가 **"단계 나열"에서 "결정 그래프 + 직접 튜닝"**으로. evaluate()와 seeds가 붙으면 편집기가 곧 **시뮬레이터**가 된다.

---

## 4. 자산 (components 카탈로그)

| | |
|---|---|
| **현재** | components(5타입) → 전역 카탈로그 + 팩/케이스 필터(객체모델 §3.1) |
| **고도화** | ① **knowledge를 자산화**: **임계 패밀리 5종·결재선 위임전결표·정책금지룰셋·기준표**는 도메인 가로질러 재사용(N4 sharedArchetype) → Agent/Module/Connector/Policy 옆에 **'룰·기준표 자산'** 종류 신설. 새 도메인 = 공유 임계 패밀리 pull + knowledge 값만 교체. ② **evaluate()를 공유 모듈 자산**으로(결정론 해석기 1개·전역). ③ **Connector 자산 + 바인딩 상태**: io.connectors(SAP/Notion/DocuSign stub)를 자산으로, 연동/stub 상태 표기. ④ **사용처 lineage**: 이 자산(임계표·Connector)을 쓰는 팩·케이스 양방향 링크(객체모델 양방향). ⑤ **재사용률 지표**: 자산이 몇 도메인에 재사용됐나(범용 골격 증거) |
| **하니스 근거** | components·knowledge(공유 임계 패밀리)·io.connectors·N4 reuseRecipe·evaluate |
| **소유** | app/ 세션(자산 종류 확장·lineage) + 이 트랙(공유 knowledge 자산 후보 추림) |

---

## 5. 우선순위 (의존성)

```
[전제] 코어 evaluate(case,knowledge) + 결정층 1급 필드  ← app/ 세션, N3 다리2 (가장 먼저)
   │
   ├─ 도메인팩: 결정층 뷰 + 검증 배지        (전제 위 바로)
   ├─ 워크플로우: route 분기 + editable 튜닝   (evaluate 필요)
   ├─ 자산: knowledge·Connector 자산화        (결정층 필요)
   └─ '새 업무 요청': bake 카탈로그 인식 + severity 검증  (다리3)
```
- **첫 도미노 = `evaluate()` + 결정층 필드**(N3 §D). 이게 없으면 4화면 고도화가 다 '표시'에 머문다.
- 이 트랙이 **지금 공급 가능**(app/ 무관): bake 카탈로그(`packs_baked/`)·provenance·검증 데이터·공유 knowledge 자산 후보.
- app/ 편집(evaluate·뷰·바인딩)은 **단일 writer 세션이 Pack v2와 함께**.

---

## 6. 한 줄 결론
> 4화면 고도화의 공통 분모 = **하니스가 만든 결정층·evaluate·검증·재사용 레시피를 화면에 흘려보내는 것.** 지금은 배선(register→카탈로그→wfeditor→자산)은 있으나 **결정층 없는 옛 Pack이 흘러 반쪽** — 코어 `evaluate()` 하나가 놓이면 도메인팩(결정층 뷰)·워크플로우(분기·튜닝)·자산(룰 자산화)·새 업무 요청(검증 인식)이 **동시에 살아난다.**
