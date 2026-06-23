# AAP 객체 모델 구현 계획 (Implementation Plan) v0.1

> **전제**: 용어·스코프는 `aap_object_model_glossary_v0_1.md`에서 확정. 이 문서는 그 모델을 `05_범용플랫폼/app/`에 **어떻게 코드로 반영할지**의 단계별 상세 계획.
> **불변 원칙(전 단계 공통)**: ① 코어 도메인 무관(채용/회의/voc 전용 분기 0줄) ② `file://` 동작·외부 라이브러리 0·Lucide 인라인 ③ 신규 hex 0(5타입·상태 토큰 재사용) ④ meeting/voc/recruiting·인박스·케이스·X1 디자인 계약·영속 무회귀 ⑤ 안정 ID(`#flow`/`#explain`/`#cmodal`/`#seq`/`#traceLog`/`#reg` 등)·뷰 키·demo.js 타깃 유지 ⑥ 매 단계 핸드오프 §5 갱신.

---

## 0. 현행 코드 사실 관계 (계획의 근거)

| 객체/기능 | 현행 위치 | 현 동작 | 스코프 |
|---|---|---|---|
| 도메인 팩 | `PACKS[id]`·`PACK`(활성)·`setPackRefs` (core.js:278) | 팩만 갈아끼움 | L1 ✅ |
| 케이스 | `APP.cases[]`·`caseTemplate` (core.js:189)·`case.packId` | 인스턴스 배열 | L3 ✅ |
| 케이스 영속 | `saveApp/loadApp` (core.js:152), LS_NS `aap.v1.` | cases/active/view/pack/typeFilter | — |
| **trace(로그)** | `case.trace[]`(케이스에 저장)·`STATE.trace`(활성)·`persistToCase` (core.js:239)·`renderTrace` (core.js:809) | **이미 케이스별로 저장됨**. `renderTrace`만 활성 케이스 것만 표시 | 표시=케이스 한정 |
| 자산 | `renderAssets` (core.js:790) = `COMPONENTS = PACK.components` (core.js:279) | 활성 팩 components만 | 팩 한정 |
| 거버넌스 | `renderGovern` (core.js:780) = `PACK.govern` | 활성 팩만 | 팩 한정 |
| 팩 오버라이드 | `packOverrides`(LS `aap.v1.packOverrides`)·`snapshotPack/restoreBase`·`applyPackOverride`(normalizePack 0단계)·`reapplyOverride` | 팩 단위 편집 영속 | 팩 전체 |
| 인박스 그룹핑 | `renderInbox` (core.js:335) | **상태 4종**(접수/진행/검토대기/완료)으로 그룹 | — |

**핵심 발견**: trace는 이미 `case.trace`에 케이스별로 영속된다(persistToCase core.js:242). → **P3 전역 로그는 새 저장소 불필요**, `APP.cases[].trace` 집계만 하면 됨.

---

## P1 — 용어 정합 (라벨·주석) 〔저위험·선행〕

**목표**: 코드/UI 라벨을 확정 용어로 통일. 동작 변경 0, 혼선 제거.

**작업**:
1. **UI 라벨 점검**(`index.html`·`core/core.js` 렌더 문자열): "업무 요청/케이스/유형/도메인 팩/워크플로우" 혼용을 사전 용어로. 예) 인박스 카드=「케이스」, 카탈로그=「도메인 팩(워크플로우)」, 자산=「자산」, 스튜디오 제목 유지.
2. **주석 정합**: core.js 상단 모델 주석(148~151)에 4계층(플랫폼/팩/프로젝트/케이스) 명시. `caseTemplate`·`APP` 주석에 "프로젝트(후속 L2)" 자리표시.
3. **dcText 사전 키 확인**(디자인 계약 텍스트): `'pack.label'`·`'case.title'` 등 기존 키 유지, 신규 라벨은 동일 패턴.

**무회귀**: 문자열·주석만. 함수 시그니처·ID·뷰 키 불변.
**검증**: `node --check` core.js. 6뷰 라벨 육안. 데모 투어 타깃 문자열 미변경 확인.
**산출물 영향**: 없음(라벨만).

---

## P2 — 자산 전역화 (스튜디오·자산) 〔체감 큼·우선 권장〕

**목표**: `자산` 뷰를 **활성 팩 한정 → 전 팩 union 전역 카탈로그**로. 팩/케이스 필터로 좁히기. Run 근거 레일에서 "전역 정의 보기" 연결.

**데이터**:
- 전역 자산 = `Object.values(PACKS).flatMap(p => normalizePack(p).components)` 를 **id/name 기준 dedup**. 같은 자산이 여러 팩에서 쓰이면 1개로 합치고 `usedByPacks[]` 부가.
- 신규 store 불필요(팩 데이터에서 파생). 단, normalizePack 비용↑ → 1회 계산 후 캐시(`_assetCatalog`, 팩 register 시 무효화).

**함수/뷰**:
1. `renderAssets` (core.js:790) 재작성:
   - 소스 = `COMPONENTS`(활성 팩) → **전역 카탈로그**.
   - 필터 바(`#assetFilter`)에 기존 5타입 필터 + **스코프 필터 추가**: 「전역」(기본)·「현재 도메인 팩」·「현재 케이스」.
     - 전역 = 전체 union. 현재 팩 = `PACK.components`. 현재 케이스 = 그 케이스 trace에 등장한 구성요소(ops의 comp 집합, P3와 공유).
   - 카드에 `usedByPacks` 배지(어느 워크플로우가 쓰는지) 추가.
2. **양방향 링크**:
   - Run 근거 레일(`#flow`/`#explain`) 구성요소 → "전역 정의 보기"(자산 뷰로 점프 + 해당 자산 하이라이트).
   - 자산 카드 → "이 자산을 쓰는 케이스" (인박스 필터로 점프).

**UI**: `.asset-chip` 패턴 재사용(스코프 칩 추가). 신규 hex 0. `usedByPacks` 배지=typeTok 색 재사용.
**무회귀**: `#reg`·`#assetFilter` ID 유지. meeting/voc/recruiting components 데이터 무변(읽기만). Master 카드 유지.
**검증**: `node --check`. (a) 전역=3팩 union·dedup ✓ (b) 스코프 필터 전환 ✓ (c) 5타입 필터와 스코프 필터 동시 동작 ✓ (d) Run→자산 점프·하이라이트 ✓. file:// 실측 필요.
**리스크**: dedup 키(자산 id가 팩 간 충돌/누락) → name+type fallback. normalizePack 반복 비용 → 캐시.

---

## P3 — 로그 전역화 (관리·로그·트레이스) 〔데이터 이미 존재〕

**목표**: `로그·트레이스` 뷰를 **활성 케이스 trace 한정 → 전역 집계 기본 + 케이스 드릴다운**.

**데이터**: 신규 저장소 불필요 — `APP.cases[].trace`(이미 영속). 활성 케이스는 `STATE.trace`(미저장분 포함)로 보강.

**함수/뷰**:
1. `renderLogs`/`renderTrace` (core.js:784/809) 재작성:
   - **기본(전역)**: 상단 KPI 스트립 = 총 런 수(case.trace 있는 케이스)·HITL 건수(trace k 유형 집계)·가드레일/차단 건수·도메인별 분포. 아래 **케이스 목록**(케이스명·유형·마지막 이벤트·이벤트 수) → 클릭 시 그 케이스 trace 펼침(드릴다운).
   - **케이스 슬라이스**: 케이스 열려 있으면 그 케이스 trace를 Run 또는 드릴다운에서. 활성 케이스는 `STATE.trace`, 그 외는 `case.trace`.
   - trace 엔트리 스키마(`{st,k,t,L}`, core.js:812) 유지 — k 유형으로 HITL/Writeback/거버넌스 집계.
2. **양방향**: 전역 케이스 목록 → openCase 드릴다운 / Run → 전역 맥락.

**UI**: KPI 스트립=`.gov-cell` 류 재사용 or 신규 `.log-kpi`(상태 토큰). 케이스 목록=`.ibx-row` 패턴 재사용. 신규 hex 0.
**무회귀**: `#traceLog` ID 유지. `STATE.trace`·`persistToCase` 미변(읽기 집계만 추가). 빈 상태 메시지 유지.
**검증**: `node --check`. (a) 3팩 시드 케이스 진행 후 전역 KPI 집계 정확 (b) 케이스 클릭 드릴다운 (c) 활성 케이스 STATE.trace 반영 (d) 데모 투어 마지막 스텝(`#traceLog`) 무회귀. file:// 실측.
**리스크**: trace k 유형 라벨이 팩마다 일관해야 집계 정확 → traceStep 유형 표준 확인(표준화 agent 영역).

---

## P4 — 프로젝트 계층 (운영·인박스 그룹) 〔신규 L2〕

**목표**: 케이스를 묶는 **선택적** 프로젝트 컨테이너 도입. 채용 팩에 먼저 적용.

**데이터 모델**:
- 신규 `APP.projects[]`: `{id, packId, name, owner?, createdAt, goal?}`. 영속 키 `aap.v1.projects`(saveApp/loadApp 확장 core.js:152/153).
- `case.projectId?`(옵션) 필드 추가(caseTemplate core.js:189) — 없으면 단독 케이스.
- `project.caseIds`는 파생(`APP.cases.filter(c=>c.projectId===p.id)`), 저장 안 함.

**함수/뷰**:
1. **인박스 그룹핑**(`renderInbox` core.js:335): 현 상태 4종 그룹 위에 **프로젝트 묶음 계층(선택)** 추가.
   - 프로젝트 있는 케이스 = 프로젝트 헤더 아래 묶음(접기 가능). 프로젝트 없는 케이스 = 기존 평면 그대로.
   - 뷰 토글: 「상태별」(현행 기본)·「프로젝트별」.
2. **프로젝트 생성/배정**: 「＋ 프로젝트」(인박스 상단) → 이름·귀속 팩 입력. 케이스를 프로젝트에 배정(드롭다운 or 케이스 행 액션).
3. **createCase 확장**(core.js:381): seed에 `projectId` 옵션 전달 가능.

**무회귀**: projectId 없는 케이스=완전 현행 동작. `data-open` 클릭→openCase 경로 유지. 기존 상태 그룹핑 보존(토글 기본=상태별). loadApp의 케이스 필터(`c.packId`) 유지.
**검증**: `node --check`. (a) 프로젝트 생성·케이스 배정·프로젝트별 그룹 (b) 단독 케이스 평면 유지 (c) reload 영속(projects + case.projectId) (d) 상태별 토글 무회귀 (e) meeting/voc(프로젝트 미사용) 무영향. file:// 실측.
**리스크**: 프로젝트=단일 팩 가정(교차 팩 후속). UI 복잡도↑ → 토글로 기본은 현행 유지.

---

## P5 — 케이스별 튜닝 (스튜디오·override 레이어) 〔복잡·후순위〕

**목표**: 특정 케이스 1건에만 적용하는 워크플로우 델타. 베이스 정의 불변.

**데이터 모델**:
- `packOverrides`(팩 단위, LS `aap.v1.packOverrides`)에 더해 **`caseOverrides`**(케이스 단위, LS `aap.v1.caseOverrides`, key=caseId).
- 적용 우선순위(glossary §2.1): 플랫폼 기본 → 팩 정의(packOverrides) → 프로젝트 override(후속) → **케이스 override**.

**함수/뷰**(핵심 난점):
- 현행 override는 `normalizePack` 0단계(`applyPackOverride`)에서 **팩 객체에 인플레이스** 적용 → 같은 팩의 모든 케이스 공유. 케이스 튜닝은 **공유 PACK을 오염시키면 안 됨**.
- 접근: `openCase`(core.js:296)에서 케이스 override가 있으면 **그 케이스용 파생 팩 뷰**를 만들어 `setPackRefs` 대상으로 사용(베이스 PACK은 보존). 또는 `applyPackOverride`를 (packOv + caseOv) 합성으로 호출하되 케이스 전환마다 baseline에서 재적용(`snapshotPack/restoreBase` 패턴 확장).
- 스튜디오/Run에 **"⚑ 이 케이스 한정 변경"** 표식 + "이 변경을 워크플로우 전체에 반영"(델타→정의 승격) 명시 액션.

**무회귀**: caseOverrides 없으면 완전 현행. packOverrides 동작 보존. X1(normalizePack DC 재정규화로 5타입 토큰 통과) 유지.
**검증**: `node --check` + 순수 로직 단위 테스트(override 합성 우선순위·baseline 재적용 잔존 0·케이스 간 누수 0). file:// 실측(케이스 A 튜닝이 케이스 B에 안 새는지).
**리스크 ★최고**: 공유 PACK 오염·override 누적·X1 재정규화 상호작용. → 가장 마지막, 단독 PR, 충분한 단위 테스트.

---

## 단계 순서·근거

1. **P1**(용어) → **P2**(자산 전역화) → **P3**(로그 전역화) → **P4**(프로젝트) → **P5**(케이스 튜닝).
2. 근거: P1=무위험 선행. P2=유저 체감 가장 큼 + 데이터 단순(팩 union). P3=데이터 이미 존재(case.trace)라 저비용·고효과. P4=신규 모델이나 격리(토글). P5=공유 PACK 오염 리스크 최고 → 충분히 검증 후 맨 마지막.
3. 각 단계 **독립 커밋/PR**, 핸드오프 §5 1건씩.

## 범위 밖 (후속)
- 교차-팩 프로젝트(여러 워크플로우를 한 프로젝트에).
- 프로젝트 레벨 override(우선순위 자리만 확보).
- 신규 팩 영속화(자동저작/파이프라인 생성 팩 reload 보존 — 별도 과제, On-Ramp 후속과 공유).
- LLM 연동(자산 인식·trace 유형 분류 품질 향상).

## 참조
- 용어 SSOT: `aap_object_model_glossary_v0_1.md`
- 메뉴 IA: `aap_platform_menu_ia_v0_1.md` · 팩 인터페이스: `aap_domain_pack_spec_v0_1.md`
- 구현체: `05_범용플랫폼/app/core/core.js`(위 코드 앵커) · `index.html`(뷰 마크업)
- 변경 라우팅: `_AGENT_핸드오프_변경기록.md` §5
