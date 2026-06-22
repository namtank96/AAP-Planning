# AAP Domain Pack 포맷 명세 v0.2 — SSOT 단일 계약

> **무엇**: 플랫폼 셸(`05_범용플랫폼/app/core/`)이 읽어 작동시키는 **Domain Pack의 실행 가능한 표준 계약(스키마)**. 흩어져 있던 계약을 **하나의 SSOT**로 통합한다.
> **흡수 출처(→ `05_범용플랫폼/_archive/`로 이동 예정)**:
> - `aap_domain_pack_spec_v0_1.md` (베이스 — 최상위 필드·ops·뷰 데이터·surface·검증 규칙)
> - `aap_pack_contract_v2_spec.md` (`flow` 도메인 그래프 계약 · `io` 훅 · work→flow 하위호환)
> - `aap_decision_runtime_spec_v0_1.md` (결정 레이어: `caseModel`·`knowledge`·`decide`·`@verdict`·CQ — **구현=Phase 3 보류, 계약 정의만**)
> **근거**: 현 구현 실태 3팩 — `app/packs/recruiting.js`·`meeting.js`·`voc.js` + 소비자 `app/core/core.js`. **추측 ✕, 작동 사실 기반.** 문서-코드 괴리는 §10에 명시.
> **불변/교체 경계**: 코어는 이 계약만 알면 어떤 팩이든 구동. 팩이 = 도메인. (셸 스펙 = `aap_platform_form_spec_v0_1.md`)

---

## 목차
0. 등록 방식
1. 최상위 필드 (현 3팩 실태 1:1)
2. `flow` v2 — 도메인 단계 그래프 (+`work` 하위호환 · `io` 슬롯)
3. `ops` 스키마 + `blockKind` (결정론/비결정론/제어)
4. `ontology` (L4 의미 레이어) — 그래프 렌더 대상
5. `surfaceHooks` 인터페이스 + surface vs surfaceSpec 선택 규칙
6. `demoScenario` 스키마
7. 결정 레이어 계약 (⚠ Phase 3 보류 · 정의만)
8. 검증 규칙 + 작성 스켈레톤 (자동저작 emit 타깃)
9. 코어 보장 vs 팩 제공 (경계)
10. 문서-코드 괴리 · 정합 참조

---

## 0. 등록 방식

각 팩 파일은 IIFE에서 레지스트리에 자신을 등록한다:

```js
(window.AAP_PACKS = window.AAP_PACKS || {}).<id> = { /* 아래 필드 */ };
```

- `app/index.html`에 `<script src="packs/<id>.js"></script>`를 코어보다 **먼저** 적재.
- 상단 Domain Pack 드롭다운이 레지스트리 키로 자동 구성되고, 코어 `loadPack(id)`/`setPackRefs(id)`가 교체.
- 코어는 `normalizePack(pack)`을 1회 호출해 색·타입 토큰을 정규화한 뒤 구동.

---

## 1. 최상위 필드 (현 3팩 실태 1:1)

> **실태 매트릭스** — recruiting는 함수형 surface + 온톨로지/훅/시연을 모두 가진 **최대치 인스턴스**, meeting·voc는 선언형 surfaceSpec 기반 **간이 인스턴스**다. "어느 팩이 쓰나" 열로 필수/선택을 구분한다.

| 필드 | 타입 | 필수 | recruiting | meeting | voc | 설명 |
|---|---|---|:--:|:--:|:--:|---|
| `id` | string | ✅ | ✅ | ✅ | ✅ | 레지스트리 키 (`'recruiting'`/`'meeting'`/`'voc'`) |
| `label` | string | ✅ | ✅ | ✅ | ✅ | 드롭다운 표시명 (`'채용'`/`'회의'`/`'VOC 대응'`) |
| `flow` | array<Stage> | ✅(권장) | ✅ | ✅ | ✅ | 도메인 단계 그래프 = 표준 런타임 문법 (§2). 코어 `WORK=PACK.flow\|\|PACK.work` |
| `work` | array<Stage> | ⬜(하위호환) | =flow | =flow | =flow | 구(舊) 8단계 필드. **현 3팩은 `flow`와 동일 배열 참조**(`work:FLOW`)로 무회귀 보장 (§2.4) |
| `ontology` | object | ⬜ | ✅ | ✕ | ✕ | L4 의미 레이어 — 객체/관계/Action (§4). 없으면 코어가 폴백 안내 렌더 |
| `compose` | array<Compose> | ✅ | ✅ | ✅ | ✅ | 구성 뷰 '실행 구조' 5타입 카드 (§9-뷰) |
| `components` | array<Component> | ✅ | ✅ | ✅ | ✅ | 관리 뷰 Component Registry (§9-뷰) |
| `products` | object<id,Product> | ✅ | ✅ | ✅ | ✅ | 산출물 미리보기(모달) |
| `times` | array<Option> | ✅ | ✅ | ✅ | ✅ | HITL 게이트의 **선택 슬롯** 옵션. `{t,s}` |
| `workload` | object | ✅ | ✅ | ✅ | ✅ | 구성 뷰 Workload Analysis. `{request,type,purpose,outputs[],gates}` |
| `planProduces` | object<stageId,string[]> | ✅ | ✅ | ✅ | ✅ | Execution Plan 표의 단계별 산출물. **키 = `flow` id** |
| `gates` | string[] | ✅ | ✅ | ✅ | ✅ | 구성 뷰 하단 HITL 게이트 라벨 |
| `govern` | array<{k,v}> | ✅ | ✅ | ✅ | ✅ | 관리 뷰 거버넌스 strip 4셀 (v=HTML) |
| `stepLoop` | object<stageId,LoopPhase> | ✅ | ✅ | ✅ | ✅ | 단계→운영 루프 phase. LoopPhase ∈ `Data\|Semantic\|Reasoning\|Decision\|Action\|Learning` |
| `extExcluded` | (S)→bool | ✅ | ✅ | ✅ | ✅ | 도메인 결정 해석 규칙 (예: `S=>S.decisions['approve']==='no'`) → 후속 단계 분기 |
| `seeds` | array<Seed> | ⬜ | ✅ | ✅ | ✅ | 데모용 시드 케이스(인스턴스). 없으면 코어가 workload/surfaceSpec에서 자동 도출 |
| `io` | object | ⬜ | ✅(빈) | ✅(빈) | ✅(빈) | 인터랙션 훅 슬롯 `{inputs,editable,connectors}` (§2.5). **현재 전 팩 빈 배열로 슬롯 예약**(실동작 Pack Contract v2 2c) |
| `surface` | object | (택1) | ✅ | ✕ | ✕ | 좌측 화면 **함수형** 렌더러 `{head,base,cmodal}` (§5) |
| `surfaceSpec` | object | (택1) | ✕ | ✅ | ✅ | 좌측 화면 **선언형** 데이터 기술 (§5.2) — AI 자동저작 타깃 |
| `surfaceHooks` | object | ⬜ | ✅ | ✕ | ✕ | surface 인터랙션 훅 `{currentCM,wire,decideHook,persistKeys,transientKeys}` (§5.1) |
| `demoScenario` | object | ⬜ | ✅ | ✕ | ✕ | 시연 모드(Guide Mode) 스텝 (§6) |
| `caseModel` | object | (B)Phase3 | ✕ | ✕ | ✕ | 결정 레이어 L4 슬롯 (§7) — **미구현, 계약만** |
| `knowledge` | object | (B)Phase3 | ✕ | ✕ | ✕ | 결정 레이어 명시지 3종 (§7) — **미구현, 계약만** |
| `decide` | (caseData,knowledge)→verdicts[] | (B)Phase3 | ✕ | ✕ | ✕ | 결정론 판정 순수 함수 (§7) — **미구현, 계약만** |

> **택1 규칙**: `surface`(함수, 우선) **또는** `surfaceSpec`(선언형) 중 하나. 둘 다 있으면 `surface` 우선(§5.2).
> **(B)Phase3 규칙**: 결정 레이어 3필드는 §7 계약만 정의됐고 **현 3팩 어디에도 없으며 코어 소비 코드도 없다**(Phase 3 구현 보류).
> 팩 내부 헬퍼로 `odTable(title, rows)`를 각자 정의(op `detail` 생성용). 코어 비의존.

---

## 2. `flow` v2 — 도메인 단계 그래프

> **배경(← pack_contract_v2 흡수)**: "8단계 고정"을 폐기하고 각 도메인이 자기 흐름 그래프를 선언한다. 캐논 8단계는 **강등**(여러 가능한 흐름 중 하나) — 회의·VOC는 기존 단계를 그대로 `flow`로 선언해 무회귀. 채용은 채용 네이티브 9단계.

### 2.1 단계(Stage) 스키마

```js
flow: [
  { id, label, kind, loopPhase, role?, actor?, gate?, hitl?, live?,
    doneModal?, next?, ops, explain, showCompose? },
  ...
]
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | string | ✅ | 도메인 고유 키. **코어는 어떤 id도 리터럴로 가정하지 않는다**(위치 하드코딩 제거). 예: 채용 `intake`·`shortlist_gate`·`offer_gate` |
| `label` | string | ✅ | 단계 표시명 |
| `kind` | `'input'`\|`'auto'`\|`'gate'` | ✅(v2) | 단계 종류(엔진 구동 키). `input`=사람 요청/자료 제공 시작점 · `auto`=AAP 자율 실행 · `gate`=HITL 결정 지점 |
| `loopPhase` | LoopPhase | ✅ | 운영 루프 phase(`Data\|Semantic\|Reasoning\|Decision\|Action\|Learning`). 단계 `stepLoop`을 단계 객체로 흡수(현재 `stepLoop` 필드와 병행 — §10 괴리) |
| `role` | string | ✅ | actor 라벨(`채용 요청`/`AAP 분석`/`사람 확인 ①`…) |
| `actor` | `human`\|`aap`\|`hitl` | ✅(하위호환) | 주체. `kind`와 병행 잔존(v1 호환). `gate`↔`hitl`, `auto`↔`aap`, `input`↔`human` 대응 |
| `explain` | string(HTML) | ✅ | 우측 패널 설명(추론 루프 단계 서술, `<b>`/`<span class="v">` 허용) |
| `ops` | array<Op> | ✅ | 8계층 작업 = 런타임 트레이스 (§3) |
| `gate` | object \| `1` | ⬜ | **객체형(v2 권장)** `{label, decisions:[{key,label,toast}]}` — 코어 하드코딩 제거(§2.2). **숫자형 `1`(v1)** = 업무 순서 strip에서 게이트(amber) 마크만 |
| `hitl` | `1` | ⬜ | 사람 결정 대기 → 모달 `kind='hitl'`. 보통 `kind:'gate'`와 함께 |
| `live` | `1` | ⬜ | **실시간 세션 단계**(시작/중/종료 하위 phase). 회의 진행·면접 진행. v1 `meeting:1`을 id 종속 없이 일반화 |
| `doneModal` | `1` | ⬜ | 완료 시 결과 모달(`kind='done'`) 표시 |
| `next` | (S)→stageId | ⬜ | 분기. 기본 = 배열 다음 단계(선형). 조건 분기 시 함수형. (현 3팩은 선형 — 미사용 슬롯) |
| `showCompose` | `1` | ⬜ | 이 단계에서 구성요소 조합 연출 노출(채용 `design` 단계) |

### 2.2 `gate` 객체형 — 코어 하드코딩 제거

게이트 단계의 결정 라벨·토스트를 **팩이 선언**한다(코어 `w.id==='approve'` 같은 리터럴 제거):

```js
{ id:'shortlist_gate', kind:'gate', hitl:1, loopPhase:'Decision', role:'사람 확인 ①',
  gate:{ label:'숏리스트 기준 승인',
         decisions:[ {key:'yes', label:'이 기준으로 스크리닝', toast:'숏리스트 컷 확정 · 스크리닝을 시작합니다'},
                     {key:'no',  label:'컷 좁히기(≥90)',      toast:'컷을 ≥90으로 좁혀 진행합니다'} ] },
  ops:[…] }
```

- 코어 `decide(v)`가 `STATE.decisions[stageId]=v` 기록 → `surfaceHooks.decideHook` + `extExcluded`로 후속 분기.
- 게이트 단계는 `kind:'gate'` + `hitl:1`(또는 `live:1`).

### 2.3 권장 형태 (캐논과 정합)

권장 흐름 = 8단계 캐논(요청→이해→실행구조구성→[HITL ①]→실행→[진행 HITL ②]→[최종 HITL ③]→공유·학습). 단계 수는 가변(회의 8 / VOC 7 / 채용 9). 게이트 = HITL 책임 지점만.

### 2.4 `work`→`flow` 하위호환 (무회귀 규칙)

- 코어: `WORK = PACK.flow || PACK.work`. `flow`가 있으면 우선, 없으면 `work` 사용.
- **현 3팩 실태**: 등록 시 `flow:FLOW, work:FLOW`로 **동일 배열을 두 키에 할당**. wfeditor·snapshotPack·eval의 기존 `pack.work` 참조 호환을 위해 코어가 `if(!PACK.work)PACK.work=WORK`로 정렬.
- override 인플레이스 변경(`restoreBase`)이 `pack.work`·`pack.flow` 둘 다에 반영되도록 같은 참조 유지.
- → 새 팩은 `flow`만 선언해도 되지만, 기존 모듈 호환을 위해 코어가 `work` 별칭을 보장한다.

### 2.5 `io` — 인터랙션 훅 (슬롯 예약)

```js
io: {
  inputs:    [ { stage, type:'text'|'file'|'field', key, label, accept? } ],  // 요청·문서 업로드
  editable:  [ { key, label, type:'threshold'|'weight'|'value', recompute } ],// 임계값·가중치 → 결정론 재계산
  connectors:[ { id, label, system, stub:true } ],                            // 잡코리아·ATS·캘린더(stub)
}
```

- **현재 = 빈 슬롯**(`io:{inputs:[],editable:[],connectors:[]}` 전 팩). 실제 동작은 Pack Contract v2 2c(후속).
- `editable.recompute` = 결정론 함수(예: 임계값 변경 → `cutThreshold`/`shortlistIds` 재평가). 이미 결정론이라 연결만 남음.

---

## 3. `ops` — 단계 내 8계층 작업 + blockKind

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `g` | number | ✅ | 병렬 그룹. **같은 g = 동시 실행(∥)**. 0,1,2…로 순차 그룹(빈 그룹 ✕) |
| `feed` | string | ✅ | 작업명 |
| `out` | string | ✅ | 중간 산출물(과정 가시화 — 결과만 ✕). (Phase 3 결정 레이어 시 `@verdict:<id>.<path>` 참조 허용 §7) |
| `L` | `L1`~`L8` | ✅ | AAP 8계층 |
| `comp` | string | ✅ | 구성요소명(코어·실행 엔진 / 정책 관리·통제 …). 코어 `evidType(comp)`로 5타입 자동 분류 |
| `micro` | string[] | ⬜ | 하위 호출 칩(`calendar.create()`·`ats.write()`…) |
| `asset` | `1` | ⬜ | kt ds 자산(보라 강조) |
| `badge` | string | ⬜ | 자산 배지(`AI:ON-U`/`Antbot`/`Self-Improving`) |
| `detail` | string(HTML) | ⬜ | '근거 펼침' 상세(더미 결과표). `odTable(title,[[k,v,cls]])`. cls: `g`(green)/`a`(amber)/`r`(red) |
| `kind` | `'llm'` | ⬜ | **blockKind override**(§3.1). 명시 안 하면 comp 타입에서 추론 |

> 8계층(불변): L1 경험·접근 · L2 설계·개발 · L3 에이전트 코어 · L4 지식·시맨틱 · L5 데이터·연동 · L6 AI 품질·평가 · L7 컨트롤·거버넌스 · L8 인프라.

### 3.1 `blockKind` — 결정론 / 비결정론(LLM) / 제어 구분 (★ KEY MESSAGE 증명)

모든 op를 **결정론 vs 비결정론**으로 표기해, 화면이 "Agent 잔뜩"이 아니라 "통제된 조합"임을 증명한다(Palantir governed reasoning 정합).

| 분류 | 의미 | 구성요소 타입 | 코어 판정 |
|---|---|---|---|
| **Action (결정론)** | 규칙·온톨로지 편집, 재현 가능 | Module · Connector · 기존솔루션 | `det` |
| **LLM (비결정론)** | 에이전트 추론(온톨로지 통해 통제) | Agent | `llm` |
| **Control (제어)** | 통제·게이트·정책 차단 | Policy | `det`(현 코드 = 결정론 묶음 · §10 괴리) |

- **코어 함수**: `blockKind(o,tk)` = `o.kind==='llm' ? 'llm' : (tk==='A' ? 'llm' : 'det')`.
  - 팩이 `op.kind:'llm'`로 명시 override 가능. 그 외엔 comp 타입(`evidType`)이 Agent면 `llm`, 나머지는 `det`.
- **렌더**: `.ev-kind` 배지 = LLM(violet 점) / 결정론(slate 점). 디자인 가이드 §6.6.2.
- **문서 taxonomy vs 코드(§10)**: 문서는 Action/LLM/**Control** 3분류를 쓰지만, **코드는 `llm`/`det` 2값**만 emit한다(Policy = `det`로 묶임). 자동저작 emit 타깃은 `op.kind:'llm'`(비결정론 명시) 또는 생략(결정론)으로 한다 — 'control'은 향후 도입 슬롯(현재 미구현).

---

## 4. `ontology` — L4 의미 레이어 (그래프 렌더 대상)

> **원칙**: "LLM은 온톨로지를 통해서만 데이터에 접근(통제된 reasoning)." 전시 캡션 ✕, **구조로** 읽히게. 8계층 L4 지식·시맨틱의 Domain Ontology 인스턴스.
> **실태**: recruiting만 보유. meeting·voc는 미선언 → 코어가 폴백 안내(`이 유형은 아직 명시 온톨로지가 없습니다`) 렌더. **L4 1급화를 위해 신규 팩은 ontology 선언 권장.**

```js
ontology = {
  objects:  [ { k, n, a[], on? } ],          // 객체
  relations:[ { from, label, to, t? } ],     // 관계
  actions:  [ { key, n, mode } ],            // 객체 편집 Action
}
```

### 4.1 `objects[]` — 객체(노드)
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `k` | string | ✅ | 그래프 매칭용 핵심 키(영문). relations의 from/to가 이 키로 매칭 |
| `n` | string | ✅ | 표시명(`'Candidate(후보)'`) |
| `a` | string[] | ✅ | 속성 목록(`['이름','경력','스킬','매칭%','상태']`) |
| `on` | string[] | ⬜ | 이 객체에 걸리는 Action 키(`actions[].key` 참조) → 노드에 배지로 표시 |

### 4.2 `relations[]` — 관계(엣지)
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `from` | string | ✅ | 출발 객체 `k` |
| `label` | string | ✅ | 엣지 라벨(`'applies'`·`'scored-by'`) |
| `to` | string | ✅ | 도착 객체 `k` |
| `t` | string | ⬜ | 하위호환 display 문자열(`'Candidate —<em>applies</em>→ Job'`). 목록 뷰 폴백용 |

### 4.3 `actions[]` — 객체 편집 Action(배지)
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `key` | string | ✅ | 객체 `on[]`이 참조하는 키 |
| `n` | string | ✅ | 표시명(`'이력서 파싱·정규화'`) |
| `mode` | `'auto'`\|`'confirm'` | ✅ | `auto`=자동(green 배지) / `confirm`=사람 확인(amber 배지). HITL 색 규칙 §6.6.1 |

### 4.4 그래프 렌더 (코어 `renderOntology`)
- **객체 = 노드**(사각, 원형 균등 배치, 결정론 레이아웃) · **관계 = 엣지**(베지어/직선 + 화살표) · **Action = 노드 우하단 색점 배지**(green=auto / amber=confirm).
- 다크 캔버스(`plg-canvas`/`onto-canvas`) + **그래프/목록 토글** + 노드 클릭 시 하단 상세 패널.
- 디자인 표준: 디자인 가이드 §6.6.1 + 신설 그래프 시각 표준 절.

---

## 5. `surface` / `surfaceSpec` — 좌측 화면

> 이 부분이 **도메인마다 가장 다른 곳**(실제 제품 UI). 코어는 우측 8계층·구성·관리·실행 엔진을 책임지고, 좌측 화면은 팩이 소유한다. **함수형(`surface`)** 또는 **선언형(`surfaceSpec`)** 둘 중 하나.

### 5.0 컨텍스트 `C`
모든 함수형 렌더러/훅은 컨텍스트 `C`를 받는다:
```
C = { S:STATE, R:RUN, idxOf, W, par(items[])→parTrackHTML, times, ex:boolean(=extExcluded()) }
```

### 5.1 함수형 `surface` + `surfaceHooks` (recruiting)
```js
surface: { head(C), base(C), cmodal(kind,C) }
```
| 함수 | 반환 | 코어 호출 시점 |
|---|---|---|
| `head(C)` | `.cust-head` 내용(헤더·상태·탭). `#replay` 포함 시 '다시' | 매 렌더 |
| `base(C)` | `.con-body` 내용(상태 문구 + 워크스페이스). `C.par([...])`=병렬 트랙, `data-dlv` 버튼=미리보기 | 매 렌더 |
| `cmodal(kind,C)` | 인콘솔 모달 내부. `kind ∈ hitl\|done\|live\|cand…`(`preview`는 코어 처리) | 모달 표시 시 |

**`surfaceHooks`** — surface가 코어에 노출하는 인터랙션 훅(코어가 일반 메커니즘으로 호출):

| 키 | 시그니처 | 역할 |
|---|---|---|
| `currentCM` | `(S) → kind\|null` | 현재 표시할 모달 kind를 우선 결정(예: 후보 상세 열림 → `'cand'`). null이면 코어 generic 판정(preview/live/hitl/done) |
| `wire` | `(root, S, rerender)` | surface 루트(`#surfHead`/`#surfBody`)·모달(`#cmodal`) 내 `data-*` 버튼 배선. `rerender({persist,toast,trace})` 옵션 |
| `decideHook` | `(S, v, stageId)` | HITL `decide` 결과(`v`=yes/no)를 도메인 상태로 번역(예: `offer_gate yes` → 보드 offer 배치). decide 후 코어가 호출 |
| `persistKeys` | string[] | STATE 영속 키(코어 persistToCase/hydrate가 케이스에 같이 저장) |
| `transientKeys` | string[] | 케이스/단계 전환 시 초기화할 transient 키(열린 모달·탭 선택 등) |

### 5.2 선언형 `surfaceSpec` (meeting·voc — AI 자동저작 타깃)
`surface`(함수) 대신 **데이터로 화면 기술**. 코어 `headSpec/baseSpec/cmodalSpec`가 generic 렌더(함수 없으면 spec 사용). **AI가 코드 ✕ 데이터만 출력**.
```js
surfaceSpec = {
  icon, title, customer, owner, knownFrom, metaReady, metaUnknown,
  tabs:['개요'…], select:'선택 라벨',
  status:{ stageId:[label, cls, tab] },                       // cls: s-info/s-amber/s-blue/s-green (함수 허용)
  perStep:{ stageId:{ mode:'request'|'overview'|'track'|'work', work, done, text?, hint?, rows?, track? } },
  ws:[{k, from:단계index, v(또는 (C)=>v), dlv}],
  hitl:{ stageId:{ title, sub, yes, no, rows:[{k,v,dlv?}], showSelect?, files?:[{label,dlv}] } },
  done:{ stageId:{ title, lines:[{ic,t,dlv?}], card? } },
  avatars?, avatarsExt?, avatarsEmpty?, meeting?:{ start, live },   // 아바타·라이브 세션
}
```
- 코어 generic 렌더러가 아바타·라이브(`meeting.start`/`live`)·결과 카드(`done[step].card`)·동적 상태(status 값 함수 허용)·함수형 row/line/label(`(C)=>…`)까지 커버.
- 둘 다 제공 시 `surface` 우선. 자동저작 모듈 = `app/core/authoring.js`(`genericAuthor(text)` = 임의 업무 설명 → 표준 7단계 골격 Pack).

### 5.3 선택 규칙 (surface vs surfaceSpec)
| 기준 | `surface`(함수) | `surfaceSpec`(선언형) |
|---|---|---|
| 도메인 네이티브 UI 깊이 | 높음(보드·정렬·필터·상세 모달) | 표준 골격(헤더·탭·워크스페이스·HITL/done) |
| 인터랙션(클릭→상태) | `surfaceHooks.wire`로 자유 | 코어 generic data-* 처리 |
| AI 자동저작 | 코드 생성 위험 → 부적합 | **데이터만 emit = 적합(권장)** |
| 현 사례 | recruiting(ATS) | meeting·voc |

> **권장**: 새 팩은 `surfaceSpec`(자동저작·검증 용이). 보드형·고도 인터랙션이 필요할 때만 함수형 `surface`+`surfaceHooks`.

**버튼 data-attr 계약**(코어/훅 자동 wiring): `data-yes`/`data-no`→`decide()` · `data-close`/`data-back` · `data-time="i"`→선택 슬롯 · `data-dlv="key"`→미리보기 · `data-mstart`/`data-mend`→라이브 · `data-cand`/`data-rdec`/`data-sort`/`data-filt`→(recruiting 훅).

---

## 6. `demoScenario` — 시연 모드(Guide Mode) 스키마

> **실태**: recruiting만 보유. 코어 가이드 엔진(`demo.js`)이 데이터로 재생(스포트라이트+커서+말풍선). 디자인 표준 §6.5.5.

```js
demoScenario = {
  id, title, desc, icon,
  steps: [
    { do:{ view?, open?, go?:stageId }, target:'CSS 셀렉터', title, body },
    ...
  ],
}
```
| 필드 | 타입 | 설명 |
|---|---|---|
| `id`/`title`/`desc`/`icon` | string | 시나리오 카드 메타(`icon`=Lucide 키) |
| `steps[].do` | object | 스텝 진입 액션. `view`=뷰 전환(inbox/logs…) · `open:1`=케이스 열기 · `go:stageId`=해당 단계로 이동 |
| `steps[].target` | string(CSS) | 스포트라이트 대상(`#seq`·`#flow`·`#cmodal .cmodal-card`·`.recr-board`…). 안정 ID 사용 |
| `steps[].title` | string | 말풍선 제목 |
| `steps[].body` | string | 말풍선 본문(업무 언어. HITL 스텝은 제목에 `(HITL …)` 표기 → amber 강조) |

---

## 7. 결정 레이어 계약 (⚠ 구현=Phase 3 보류 · 정의만)

> **⚠ 보류 배지**: 이 절의 `caseModel`·`knowledge`·`decide`·`@verdict`·CQ는 **계약 정의일 뿐, 현 코드·3팩 어디에도 구현되어 있지 않다.** 실제 결정엔진 구현 = Phase 3(별도 세션/후속). 본 SSOT는 흩어진 설계(← `aap_decision_runtime_spec_v0_1.md`)를 흡수·박제해 둔다. **새 팩 저작 시 채울 의무 없음.**

### 7.0 두 레이어 분리
| | (A) 저작(격상) | (B) 런타임(실행) ← 본 절 |
|---|---|---|
| 하는 일 | 임의 텍스트 → Pack 생성 | 한 케이스를 실제로 판정·처리 |
| 방향 | 비전/티저(LLM·검증 불가) | 명시지+케이스 → **결정론**(LLM 없이 가능) |

### 7.1 "진짜로 돈다" 3조건 (수용 기준)
1. **데이터 구동**: 판정은 케이스 입력에서 계산. 입력 바꾸면 결과 바뀜(하드코딩 ✕).
2. **추적성**: 모든 verdict는 `{ruleId, inputs, output, basis}`. `basis` 없으면 invalid.
3. **재현성**: 같은 입력 → 항상 같은 출력. 판정 경로에 LLM·난수·시계 0.

### 7.2 `caseModel` — L4 케이스 슬롯
```js
caseModel = {
  entity:'손해사정 청구',
  slots:[ { key, label, type, values?, unit?, required?, source, extract:'manual'|'doc'|'rule'|'llm' } ],
  relations:[ { from, rel, to } ],
}
```
- 슬롯 = 규칙의 입력 변수. 규칙이 참조하는 모든 값은 슬롯으로 존재해야 함(§7.5 CQ).

### 7.3 `knowledge` — 명시지 3종
```js
knowledge = {
  decisionTables:[ { id, when:[[slot,op,val]], then:{...} } ],   // SOP 분기
  lookupTables:  [ { id, key, rows:{...}, ret } ],               // 기준표(등급·유형 룩업)
  thresholds:    [ { id, expr, flag?|allow? } ],                 // 임계 규칙
}
```

### 7.4 `decide(caseData, knowledge) → verdicts[]`
- **순수 함수**(부수효과 0, 재현성). 출력 = verdict 배열:
```js
{ id, label, inputs:{...}, output:{...}, basis:{table?,row?,rule?}, loop:'Reasoning', gate:null }
```
- **추적성 강제**: `basis` 없는 verdict는 invalid.
- 레퍼런스 구현 = 손해사정 데모 `compute()/analyze(c,ov)` (Pack 스키마 안으로 들이고 `basis` 부착).

### 7.5 `@verdict` 바인딩 (ops 데이터 구동 전환)
- ops `out`/`detail`에 `@verdict:<id>.<path>` 참조 허용 → 코어 렌더러가 런타임 verdict에서 해석.
  ```js
  { g:1, feed:'원인 분석', out:'@verdict:rootCause.label', detail:'@verdict:rootCause.basis' }
  ```
- 정적 문자열은 서사용으로만 잔존(판정값 ✕).

### 7.6 CQ(Competency Questions) 체크리스트 (저작 검수 게이트 · 코드 ✕)
1. 각 결정 규칙을 나열한다.
2. 규칙 입력값이 **모두 `caseModel.slots`에 있는가?** → 없으면 슬롯 추가(커버리지 갭).
3. 각 슬롯이 **누구에 의해 채워지는가**(`extract` 명시)? → 채울 길 없으면 데이터 갭(이슈).
4. 각 HITL 게이트가 **어떤 verdict를 근거로 멈추는가?** → 근거 없으면 형식적 HITL(제거 대상).

### 7.7 LLM seam (판정 앞단·HITL 뒤만)
| seam | 역할 | 검증 |
|---|---|---|
| 추출(extract) | 문서/음성 → 슬롯 | 타입 검증 + 신뢰도 낮으면 HITL |
| 검색(RAG) | KB 근거 인용 | 인용 출처 필수 |
| 초안(draft) | verdict → 문서 초안 | 사람 검토 후 발송(HITL ②) |
> **금지**: LLM이 `decide()`의 판정을 내리는 것. 판정은 항상 결정론.

---

## 8. 검증 규칙 + 작성 스켈레톤

### 8.1 검증 규칙 (작성·자동저작 공통 체크리스트)
1. `id` 고유, `window.AAP_PACKS`에 등록.
2. `flow`(또는 `work`) 1개 이상, 각 `id` 고유, `ops` 1개 이상.
3. 모든 `ops[].L` ∈ L1~L8. `g`는 0부터 연속(빈 그룹 ✕).
4. `kind:'gate'` 단계는 `hitl:1`(또는 `live:1`) 동반 + `gate.decisions` 정의(코어 리터럴 제거).
5. `stepLoop`에 모든 단계 키 존재(또는 단계 객체 `loopPhase`).
6. `surface.head/base/cmodal` **또는** `surfaceSpec` 중 하나 정의(택1). cmodal/cmodalSpec은 `hitl`/`done`(+필요시 live) kind 처리.
7. `products`의 키 = `data-dlv`·`ws`/`wsList`에서 참조하는 키와 일치.
8. `times` 1개 이상(게이트 선택 슬롯).
9. `compose`/`components` 타입·`cls`/`ty` 규칙 준수(tA~tP / tyA~tyP).
10. `planProduces`·`gates`·`stepLoop`·`extExcluded`의 stageId 키 = `flow` id와 정렬.
11. (선택) `ontology` 선언 시 relations from/to = objects `k`, actions key = objects `on[]` 참조 정합.
12. (선택) `io` 슬롯은 빈 객체라도 예약. `surfaceHooks` persist/transient 키는 실제 STATE 키와 일치.
13. (Phase 3·선택) `decide` 채울 경우 §7.1 3조건 + §7.6 CQ 통과.
14. 외부 라이브러리 0 / vanilla. `<script src>` 적재(코어보다 먼저).

### 8.2 작성 스켈레톤 (자동저작 emit 타깃 — 선언형 권장)
```js
(function(){
  const od=(t,r)=>`<div class="op-detail"><div class="od-title">${t}</div>${r.map(x=>`<div class="od-row"><span class="od-k">${x[0]}</span><span class="od-v ${x[2]||''}">${x[1]}</span></div>`).join('')}</div>`;
  const TIMES=[{t:'옵션 A · 부제',s:'설명'},{t:'옵션 B',s:''}];
  const PRODUCTS={ key1:{ic:'file-text',title:'산출물',sub:'부제',body:`<div class="doc">…</div>`} };
  const FLOW=[
    {id:'request',label:'요청 접수',role:'사람 요청',actor:'human',kind:'input',loopPhase:'Data',explain:`…`,
     ops:[{g:0,feed:'요청 수신',out:'…',L:'L1',comp:'챗 UI'}]},
    {id:'compose',label:'실행 구조 구성',role:'AAP 구성',actor:'aap',kind:'auto',loopPhase:'Reasoning',explain:`…`,showCompose:1,
     ops:[{g:0,feed:'작업 분해',out:'…',L:'L2',comp:'설계·개발',detail:od('작업',[['T1','']])}]},
    {id:'approve',label:'승인',role:'사람 확인 ①',actor:'hitl',kind:'gate',hitl:1,loopPhase:'Decision',
     gate:{label:'계획 승인',decisions:[{key:'yes',label:'이대로 진행',toast:'승인'},{key:'no',label:'수정',toast:'수정 요청'}]},
     explain:`…`, ops:[{g:0,feed:'게이트 보류',out:'…',L:'L3',comp:'HITL 런타임 게이트'}]},
    {id:'share',label:'공유·학습',role:'AAP 마무리',actor:'aap',kind:'auto',loopPhase:'Learning',doneModal:1,explain:`…`,
     ops:[{g:0,feed:'학습 자산화',out:'…',L:'L7',comp:'Self-Improving',asset:1,badge:'Self-Improving'}]},
  ];
  const ONTOLOGY={ objects:[{k:'Case',n:'Case(케이스)',a:['상태'],on:['process']}], relations:[], actions:[{key:'process',n:'처리',mode:'auto'}] };
  const COMPOSE=[{t:'Agent',sub:'전문 작업',cls:'tA',n:3,items:['…']}/* M/S/C/P */];
  const COMPONENTS=[{type:'Agent',ty:'tyA',ic:'file-text',name:'…',L:'L3',desc:'…',when:'…',data:'…',how:'…'}];
  const SS={ icon:'inbox', title:'…', customer:'…', tabs:['개요'], select:'선택',
    status:{request:['접수','s-info','개요']}, perStep:{request:{mode:'request'}}, ws:[], hitl:{}, done:{} };
  (window.AAP_PACKS=window.AAP_PACKS||{}).<id>={
    id:'<id>',label:'<표시명>', ontology:ONTOLOGY,
    times:TIMES,products:PRODUCTS,flow:FLOW,work:FLOW,components:COMPONENTS,compose:COMPOSE,
    workload:{request:'…',type:'…',purpose:'…',outputs:['…'],gates:'…'},
    planProduces:{request:[],compose:['실행 구조'],approve:['…'],share:['…']},
    gates:['★ HITL ① …'], govern:[{k:'Policy',v:'…'}/*4*/],
    stepLoop:{request:'Data',compose:'Reasoning',approve:'Decision',share:'Learning'},
    seeds:[], io:{inputs:[],editable:[],connectors:[]},
    extExcluded:(S)=>S.decisions['approve']==='no', surfaceSpec:SS,
  };
})();
```

### 8.3 AI 자동 저작 ↔ 필드 매핑 (RFP→WBS처럼 도메인 breakdown)
| AI 분석 단계 | 채우는 필드 |
|---|---|
| 소스 이해 → 업무 정의 | `workload` |
| 작업 분해(WBS) | `flow[]` + 각 `ops` |
| 역할·전문성 → 구성요소 | `compose`·`components`(5타입) |
| 데이터·시스템 | `ops.L5`·Connector·기존 솔루션·`io.connectors` |
| 책임·되돌리기 어려운 지점 | `kind:'gate'`·`hitl`·`gate.decisions`·`extExcluded` |
| 의미 구조 | `ontology`(객체/관계/Action) |
| 통제·정책 | `govern`·Policy 컴포넌트 |
| 산출물 | `products`·`planProduces` |
| 운영 루프 매핑 | `stepLoop`·`flow[].loopPhase` |
| 화면 | `surfaceSpec`(데이터만) |
| 익히고 기억 | `record`/`share` 단계 학습 op — 생성된 팩 자체가 재사용 자산 |
| (Phase 3) 명시지 판정 | `caseModel`·`knowledge`·`decide` |

---

## 9. 코어 보장 vs 팩 제공 (경계) + 뷰 데이터

### 9.1 경계
| 코어(불변·자동 제공) | 팩(도메인·작성) |
|---|---|
| 3뷰/운영 콘솔 셸·토글·드롭다운 스위처·통합 인박스 | `flow`·`compose`·`components`·`products`·`times`·`workload`·`gates`·`govern`·`stepLoop`·`ontology` |
| 자율 실행 엔진(runStep·revealOps·병렬·HITL await·live 세션·autoplay) | `surface`/`surfaceSpec` + `extExcluded`·`surfaceHooks` |
| 우측 8계층 op flow·추론 루프 배지·blockKind·compose 조합 칩 | (ops 데이터만) |
| 온톨로지 그래프 렌더·토글·노드 상세 | (ontology 데이터만) |
| 정합 뷰(Loop·8계층·Trust·경유 계층 점등) | (자동 — ops의 L set) |
| Run Trace·Decision Log 누적·케이스 영속·배포 생애주기 | (자동 — flow ops·decisions·persistKeys) |
| 모달 프레임·버튼 wiring·미리보기·가이드 엔진(demo.js) | cmodal 내용 + `demoScenario` |

### 9.2 뷰 데이터 형식
- **`compose[]`**: `{t:'Agent',sub:'전문 작업',cls:'tA',n:6,items:['…']}`. cls/타입: `tA` Agent·`tM` Module·`tS` 기존솔루션·`tC` Connector·`tP` Policy. 5개 권장.
- **`components[]`**: `{type,ty,ic,name,L,asset?,desc,when,data,how}`. ty: `tyA/tyM/tyS/tyC/tyP`. `when`/`data`/`how` 3필드 필수. `ic`=Lucide 키.
- **`products`**: `{<key>:{ic,title,sub,body}}`. `sub`/`body`는 string 또는 `(C)=>string`. 코어 `resolveDlv(key,C)` 호출, `data-dlv` 버튼 → `openPreview`.
- **`workload`**: `{request,type,purpose,outputs:[...],gates}`.
- **`planProduces`**: `{stageId:[산출물…]}`. 빈 배열이면 '중간 처리'.
- **`gates`**: `['★ HITL ① …', …]`.
- **`govern`**: `[{k:'Policy',v:'…<b>…</b>…'}, …]` 4셀.
- **`seeds`**: `[{title,customer,icon,request,atStep?,pickedTime?,status?}]`.

---

## 10. 문서-코드 괴리 · 정합 참조

### 10.1 괴리 (대조 결과 · 알면서 둠)
| 항목 | 문서(SSOT) | 코드 실태 | 처리 |
|---|---|---|---|
| `blockKind` 값 | Action/LLM/**Control** 3분류 | `llm`/`det` 2값(Policy=det) | 문서 §3.1에 명시. 'control'은 향후 슬롯(미구현) |
| `loopPhase` 위치 | `flow[].loopPhase`(단계 객체) | `stepLoop{}` 별도 객체 **병행** | 둘 다 잔존(v2 흡수 중). 자동저작은 둘 다 emit 권장 |
| `actor` vs `kind` | `kind`(input/auto/gate) 1급 | `actor`(human/aap/hitl) **병행 잔존** | v1 호환. 신규 팩은 `kind` 필수, `actor` 보조 |
| `gate` 형 | 객체형 `{label,decisions}` 권장 | recruiting=객체형 / v1 `gate:1` 숫자형도 코어 인식 | 둘 다 유효. 신규=객체형 |
| `ontology` 보유 | L4 1급(권장) | recruiting만(meeting·voc 폴백) | 신규 팩 선언 권장 |
| `surfaceHooks`/`demoScenario` | 인터페이스 표준화 | recruiting만 | 함수형 surface 팩만 hooks 필요. demoScenario는 시연용 선택 |
| 결정 레이어 | §7 계약 정의 | **0개 구현**(3팩·코어 모두 없음) | Phase 3 보류 배지 |

### 10.2 정합 참조
- 플랫폼 형태 스펙: `aap_platform_form_spec_v0_1.md`(§8 Domain Pack 인터페이스의 실행 가능 버전이 본 문서).
- 디자인: `04_디자인가이드/aap_platform_ui_design_guide_v0.1.md`(§6.6 온톨로지/블록·신설 그래프·레이아웃 표준).
- 메뉴 IA: `aap_platform_menu_ia_v0_1.md` v0.2(form_spec §2로 흡수).
- 구현체: `app/core/`(소비자) · `app/packs/{recruiting,meeting,voc}.js`(검증 인스턴스 3종).
- 객체모델 SSOT: `aap_object_model_glossary_v0_1.md`.

---

*v0.2 — v0.1·pack_contract_v2·decision_runtime 흡수 단일 SSOT. flow v2·blockKind·ontology 그래프·surfaceHooks·demoScenario 정식화 + 결정 레이어 계약(Phase 3 보류) 박제. 현 3팩 실태 1:1 대조, 문서-코드 괴리 §10 명시.*
