# AAP Domain Pack 포맷 명세 v0.1

> **무엇**: 플랫폼 셸(`app/core/`)이 읽어 작동시키는 **Domain Pack의 실행 가능한 표준 계약(스키마)**.
> **근거**: 검증된 2개 인스턴스 — `app/packs/meeting.js`(회의), `app/packs/voc.js`(VOC 대응) — 에서 추출. 추측 ✕, 작동 사실 기반.
> **용도**: ① **단기** — 새 도메인 팩을 일관 포맷으로 손작성. ② **장기** — AI가 소스(RFP·문서·암묵지)를 분석해 도메인을 breakdown 한 결과를 **이 스키마로 출력**(자동 저작)하는 타깃.
> **불변/교체 경계**: 코어는 이 계약만 알면 어떤 팩이든 구동. 팩이 = 도메인. (스펙 §1 = `aap_platform_form_spec_v0_1.md`)

---

## 0. 등록 방식

각 팩 파일은 IIFE에서 레지스트리에 자신을 등록한다:

```js
(window.AAP_PACKS = window.AAP_PACKS || {}).<id> = { /* 아래 필드 */ };
```

- `app/index.html`에 `<script src="packs/<id>.js"></script>`를 코어보다 **먼저** 적재.
- 상단 Domain Pack 드롭다운이 레지스트리 키로 자동 구성되고, 코어 `loadPack(id)`가 교체.

---

## 1. 최상위 필드

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | string | ✅ | 레지스트리 키 (`'meeting'`, `'voc'`) |
| `label` | string | ✅ | 드롭다운 표시명 (`'회의'`, `'VOC 대응'`) |
| `work` | array<Step> | ✅ | 실행 플랜 단계 = 표준 런타임 문법 인스턴스 (§2) |
| `compose` | array<Compose> | ✅ | 구성 뷰 '실행 구조' 5타입 카드 (§4.1) |
| `components` | array<Component> | ✅ | 관리 뷰 Component Registry (§4.2) |
| `products` | object<id,Product> | ✅ | 산출물 미리보기(모달) (§4.3) |
| `times` | array<Option> | ✅ | HITL 게이트의 **선택 슬롯** 옵션 (회의 시각 / 보상 수준). `{t,s}` |
| `workload` | object | ✅ | 구성 뷰 Workload Analysis (§4.4) |
| `planProduces` | object<stepId,string[]> | ✅ | Execution Plan 표의 단계별 산출물 |
| `gates` | string[] | ✅ | 구성 뷰 하단 HITL 게이트 라벨 |
| `govern` | array<{k,v}> | ✅ | 관리 뷰 거버넌스 strip 4셀 (v=HTML) |
| `stepLoop` | object<stepId,LoopStage> | ✅ | 단계→추론 루프 단계(정합 뷰·배지). LoopStage ∈ `Data\|Semantic\|Reasoning\|Decision\|Action\|Learning` |
| `extExcluded` | (STATE)→bool | ✅ | 도메인 결정 해석 규칙 (예: `S=>S.decisions['approve']==='no'`) → 후속 단계 분기 |
| `surface` | object | ✅ | 좌측 '고객 서비스 화면' 렌더러 (§5) |

> 팩 내부 헬퍼로 `odTable(title, rows)`를 각자 정의(op `detail` 생성용). 코어 비의존.

---

## 2. `work[]` — 단계 스키마 (표준 런타임 문법)

권장 형태 = 8단계 캐논(요청→이해→실행구조구성→[HITL]→실행→[진행]→[HITL]→공유·학습). 단계 수는 가변(회의 8 / VOC 7).

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | string | ✅ | 단계 키(고유) |
| `label` | string | ✅ | 단계명 |
| `role` | string | ✅ | actor 라벨(`사람 요청`/`AAP 분석`/`사람 확인 ①`…) |
| `actor` | `human`\|`aap`\|`hitl` | ✅ | 주체 |
| `explain` | string(HTML) | ✅ | 우측 패널 설명(추론 루프 단계 서술, `<b>`/`<span class="v">` 허용) |
| `ops` | array<Op> | ✅ | 8계층 작업 = 런타임 트레이스 (§3) |
| `gate` | `1` | ⬜ | 업무 순서 strip에서 게이트(amber) 표시 |
| `hitl` | `1` | ⬜ | 사람 결정 대기 → 모달 `kind='hitl'`. (보통 `gate`와 함께) |
| `meeting` | `1` | ⬜ | **라이브 단계** 메커닉(await_start→in_meeting→await_end). 사람이 시작/종료 신호. 도메인에 없으면 생략 |
| `doneModal` | `1` | ⬜ | 완료 시 결과 모달(`kind='done'`) 표시 |

> 게이트 단계는 `gate:1` + (`hitl:1` 또는 `meeting:1`). 자동 단계는 actor `aap`/`human`.

---

## 3. `ops[]` — 단계 내 8계층 작업

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `g` | number | ✅ | 병렬 그룹. **같은 g = 동시 실행(∥)**. 0,1,2…로 순차 그룹 |
| `feed` | string | ✅ | 작업명 |
| `out` | string | ✅ | 중간 산출물(과정 가시화 — 결과만 ✕) |
| `L` | `L1`~`L8` | ✅ | AAP 8계층 |
| `comp` | string | ✅ | 구성요소명(코어·실행 엔진 / 정책 관리·통제 …) |
| `micro` | string[] | ⬜ | 하위 호출 칩(`calendar.create()`·`메일 커넥터`…) |
| `asset` | `1` | ⬜ | kt ds 자산(보라 강조) |
| `badge` | string | ⬜ | 자산 배지(`AI:ON-U`/`Antbot`/`Self-Improving`) |
| `detail` | string(HTML) | ⬜ | '결과 보기' 펼침(더미 결과표). `odTable(title,[[k,v,cls]])` 사용. cls: `g`(green)/`a`(amber)/`r`(red) |

> 8계층(불변): L1 경험·접근 · L2 설계·개발 · L3 에이전트 코어 · L4 지식·시맨틱 · L5 데이터·연동 · L6 AI 품질·평가 · L7 컨트롤·거버넌스 · L8 인프라.

---

## 4. 뷰 데이터

### 4.1 `compose[]` (구성 뷰 — 5타입 고정)
`{ t:'Agent', sub:'전문 작업', cls:'tA', n:6, items:['…'] }`
- `cls`/타입: `tA` Agent · `tM` Module · `tS` 기존 솔루션 · `tC` Connector · `tP` Policy. **5개 권장(키 메시지: Agent만이 아님).**

### 4.2 `components[]` (관리 뷰 Component Registry)
`{ type, ty, ic, name, L, asset?, desc, when, data, how }`
- `ty`: `tyA/tyM/tyS/tyC/tyP`. `when`(언제 쓰나)·`data`(사용 데이터)·`how`(수행 방식) 3필드 필수.

### 4.3 `products` (산출물 미리보기 모달)
`{ <key>: { ic, title, sub, body } }` — `sub`·`body`는 string 또는 `(C)=>string`.
- 코어 `resolveDlv(key,C)`가 호출. `data-dlv="<key>"` 버튼 → `openPreview`.
- 본문 클래스: `.dlv`(리스트)·`.doc`(문서)·`.row/.tag.ok|warn|no|block` 등 (CSS 제공).

### 4.4 `workload` (구성 뷰 Workload Analysis)
`{ request, type, purpose, outputs:[...], gates }`

### 4.5 기타
- `planProduces`: `{ stepId:[산출물…] }`. 빈 배열이면 '중간 처리'로 표기.
- `gates`: `['★ HITL ① …', …]`.
- `govern`: `[{k:'Policy', v:'…<b>…</b>…'}, …]` 4셀.
- `stepLoop`: `{ stepId:'Semantic', … }`.

---

## 5. `surface` — 좌측 고객 서비스 화면 (도메인 특화 렌더러)

> 이 부분이 **도메인마다 가장 다른 곳**(실제 제품 UI). 코어는 우측 8계층·구성·관리·실행 엔진을 책임지고, 좌측 surface는 팩이 소유.

모든 함수는 컨텍스트 `C`를 받는다:
```
C = { S:STATE, R:RUN, idxOf, W, par(items[])→parTrackHTML, times, ex:boolean(=extExcluded()) }
```

| 함수 | 시그니처 | 반환 | 코어 호출 시점 |
|---|---|---|---|
| `head(C)` | →HTML | `.cust-head` 내용(헤더·상태·탭). `#replay` 포함 시 '다시' 동작 | 매 렌더 |
| `base(C)` | →HTML | `.con-body` 내용(상태 문구 + 워크스페이스). `C.par([...])`=병렬 트랙, `data-dlv` 버튼=미리보기 | 매 렌더 |
| `cmodal(kind,C)` | →HTML | 인콘솔 모달 내부. `kind ∈ hitl\|done\|meetingStart\|meetingLive` (`preview`는 코어가 처리) | 모달 표시 시 |
| `review(forCommit,C)` | →HTML | (팩 내부 헬퍼) cmodal이 사용 | — |
| `wsList(C)` | →HTML | (팩 내부 헬퍼) base가 사용 | — |

**버튼 data-attr 계약** (cmodal HTML 안에 두면 코어가 자동 wiring):
- `data-yes` / `data-no` → `decide('yes'/'no')` (STATE.decisions[stepId] 기록)
- `data-close` → baseOnly(모달 닫고 결과 화면 유지)
- `data-time="i"` → 선택 슬롯(`times[i]`) 선택 → `STATE.pickedTime`
- `data-mstart` / `data-mend` → 라이브 단계 시작/종료 (meeting 단계)
- `data-dlv="key"` → 산출물 미리보기, `data-back` → 미리보기 뒤로

> `kind` 결정은 코어 `currentCM()`가 플래그로 generic 판단(previewK / meeting+meetPhase / hitl+await / doneModal+done). 팩은 `kind`+`C.S.sel`로 내용만 분기.

### 5.1 선언형 대안 `surfaceSpec` (260618 구현 — AI 자동 저작용)
`surface`(함수) 대신 **데이터로 화면 기술** 가능. 코어 `headSpec/baseSpec/cmodalSpec`가 generic 렌더(함수 없으면 spec 사용). **AI가 코드 ✕ 데이터만 출력**하면 됨.
```
surfaceSpec = {
  icon, title, customer, owner, knownFrom, metaReady, metaUnknown,
  tabs:['개요'…], select:'선택 라벨',
  status:{ stepId:[label, cls, tab] },                      // cls: s-info/s-amber/s-blue/s-green
  perStep:{ stepId:{ mode:'request'|'overview'|'track'|'work', work, done, text?, hint?, rows?, track? } },
  ws:[{k, from:단계index, v(또는 (C)=>v), dlv}],
  hitl:{ stepId:{ title, sub, yes, no, rows:[{k,v,dlv?}], showSelect?, files?:[{label,dlv}] } },
  done:{ stepId:{ title, lines:[{ic,t,dlv?}] } },
}
```
- 둘 중 하나만 제공(`surface` 우선). 자동 저작 모듈 = `app/core/authoring.js`.
- **(260618 갱신) 전 팩이 `surfaceSpec`로 통일됨** — meeting·voc·quality 모두 함수 없이 데이터만. 코어 generic 렌더러가 아바타(`avatars`/`avatarsExt`/`avatarsEmpty`)·회의 라이브(`meeting.start`/`meeting.live`)·결과 카드(`done[step].card`)·동적 상태(status 값에 함수 허용)·함수형 row/line/label(`(C)=>…`)까지 커버. → **함수형 surface 없이도 풍부한 도메인 표현 가능 = AI가 데이터만 emit하면 됨.**
- **자유 소스 → 골격 자동 생성**: `genericAuthor(text)`가 임의 업무 설명을 표준 7단계 골격 Pack(위 모든 필드 데이터)으로 변환. 도메인 깊이는 향후 LLM 연동 시 향상(emit 타깃은 동일 스키마).

---

## 6. 코어 보장 vs 팩 제공 (경계)

| 코어(불변·자동 제공) | 팩(도메인·작성) |
|---|---|
| 3뷰 셸·토글·드롭다운 스위처 | `work`·`compose`·`components`·`products`·`times`·`workload`·`gates`·`govern`·`stepLoop` |
| 자율 실행 엔진(runStep·revealOps·병렬·HITL await·라이브 단계·autoplay) | `surface`(좌측 화면) + `extExcluded` 규칙 |
| 우측 8계층 op flow·추론 루프 배지·compose 조합 칩 | (ops 데이터만 제공) |
| 구성 뷰 정합 뷰(Loop·8계층·Trust·경유 계층 점등) | (자동 — ops의 L set으로 계산) |
| 관리 뷰 Run Trace·Decision Log 누적 | (자동 — work ops·decisions에서 생성) |
| 모달 프레임·버튼 wiring·미리보기 | cmodal 내용 |

---

## 7. 검증 규칙 (작성·자동저작 공통 체크리스트)

1. `id` 고유, `window.AAP_PACKS`에 등록.
2. `work` 1개 이상, 각 `id` 고유, `ops` 1개 이상.
3. 모든 `ops[].L` ∈ L1~L8. `g`는 0부터 연속(빈 그룹 ✕).
4. `gate` 단계는 `hitl:1` 또는 `meeting:1` 동반.
5. `stepLoop`에 모든 `work` 단계 키 존재.
6. `surface.head/base/cmodal` 정의. cmodal은 `hitl`/`done`(+필요시 meeting) kind 처리.
7. `products`의 키 = `data-dlv`·`wsList`에서 참조하는 키와 일치.
8. `times` 1개 이상(게이트 선택 슬롯). 없으면 review 선택 UI 비정상.
9. `compose`/`components` 타입·`cls`/`ty` 규칙 준수(tA~tP).
10. 외부 라이브러리 0 / vanilla. `<script src>` 적재(코어보다 먼저).

---

## 8. 최소 작성 스켈레톤

```js
(function(){
  const od=(t,r)=>`<div class="op-detail"><div class="od-title">${t}</div>${r.map(x=>`<div class="od-row"><span class="od-k">${x[0]}</span><span class="od-v ${x[2]||''}">${x[1]}</span></div>`).join('')}</div>`;
  const TIMES=[{t:'옵션 A · 부제',s:'설명'},{t:'옵션 B',s:''}];
  const PRODUCTS={ key1:{ic:'📄',title:'산출물',sub:'부제',body:`<div class="doc">…</div>`} };
  const WORK=[
    {id:'request',label:'요청 접수',role:'사람 요청',actor:'human',explain:`…`,
     ops:[{g:0,feed:'요청 수신',out:'…',L:'L1',comp:'챗 UI'}]},
    {id:'compose',label:'실행 구조 구성',role:'AAP 구성',actor:'aap',explain:`…`,
     ops:[{g:0,feed:'작업 분해',out:'…',L:'L2',comp:'설계·개발',detail:od('작업',[['T1','']])}]},
    {id:'approve',label:'승인',role:'사람 확인 ①',actor:'hitl',gate:1,hitl:1,explain:`…`,
     ops:[{g:0,feed:'게이트 보류',out:'…',L:'L3',comp:'HITL 게이트'}]},
    {id:'share',label:'공유·학습',role:'AAP 마무리',actor:'aap',doneModal:1,explain:`…`,
     ops:[{g:0,feed:'학습 자산화',out:'…',L:'L7',comp:'Self-Improving',asset:1,badge:'Self-Improving'}]},
  ];
  const COMPOSE=[{t:'Agent',sub:'전문 작업',cls:'tA',n:3,items:['…']},/* M/S/C/P */];
  const COMPONENTS=[{type:'Agent',ty:'tyA',ic:'🤖',name:'…',L:'L3',desc:'…',when:'…',data:'…',how:'…'}];
  function head(C){return `…#replay…`;}
  function base(C){return `…data-dlv·C.par([...])…`;}
  function cmodal(kind,C){ if(kind==='hitl'&&C.S.sel==='approve')return `…data-yes/data-no…`; if(kind==='done')return `…data-close…`; return ''; }
  (window.AAP_PACKS=window.AAP_PACKS||{}).<id>={
    id:'<id>',label:'<표시명>',times:TIMES,products:PRODUCTS,work:WORK,components:COMPONENTS,compose:COMPOSE,
    workload:{request:'…',type:'…',purpose:'…',outputs:['…'],gates:'…'},
    planProduces:{request:[],compose:['실행 구조'],approve:['…'],share:['…']},
    gates:['★ HITL ① …'], govern:[{k:'Policy',v:'…'}/*4*/], stepLoop:{request:'Data',compose:'Reasoning',approve:'Decision',share:'Learning'},
    extExcluded:(S)=>S.decisions['approve']==='no', surface:{head,base,cmodal},
  };
})();
```

---

## 9. AI 자동 저작 타깃 (RFP→WBS처럼 도메인을 스스로 breakdown)

미래 capability = AI가 소스를 분석해 **이 스키마를 출력**. 분석 산물 ↔ 필드 매핑:

| AI 분석 단계 | 채우는 필드 |
|---|---|
| 소스(RFP·업무 문서·암묵지) 이해 → 업무 정의 | `workload`(요청·유형·목적·산출물) |
| **작업 분해(WBS)** | `work[]` 단계 + 각 `ops` |
| 역할·전문성 식별 → 구성요소 | `compose`·`components`(Agent/Module/기존솔루션/Connector/Policy) |
| 데이터·시스템 식별 | `ops.L5`·Connector·기존 솔루션 |
| **책임·되돌리기 어려운 지점** 식별 | `gate`/`hitl` 플래그·`gates`·`extExcluded` |
| 통제·정책 | `govern`·Policy 컴포넌트 |
| 산출물 정의 | `products`·`planProduces` |
| 운영 루프 매핑 | `stepLoop` |
| **익히고 기억** | Skill Library 자산화(`share` 단계 학습 op) — 생성된 팩 자체가 재사용 자산 |

> **자동 저작 대비 진화 방향(중요)**: 현재 `surface`는 **렌더 함수(JS 코드)**다. AI가 코드를 생성하는 건 위험·검증 부담이 큼 → 자동 저작을 본격화하려면 `surface`를 **선언형 데이터 스키마**(필드로 화면 기술)로 진화시켜 코어가 generic 렌더하게 해야 한다. 그러면 AI는 **데이터만 출력**하면 됨(코드 ✕). v0.1은 데이터 필드(work·ops·compose·products 등)는 이미 선언형 → **자동 저작은 surface 외 필드부터 먼저 가능**. **(260618 구현 완료: surface 선언형화 = §5.1 `surfaceSpec`. `app/core/authoring.js`가 소스→breakdown→선언형 팩 생성·로드 PoC, 제조 품질 팩이 코드 0·데이터만으로 작동 검증 — 이제 work·ops·compose·products + surfaceSpec 전부 데이터로 자동 출력 가능.)**

---

## 10. 정합 참조
- 플랫폼 형태 스펙: `aap_platform_form_spec_v0_1.md`(§8 Domain Pack 인터페이스의 **실행 가능 버전**이 본 문서).
- 구현체: `app/core/`(소비자) · `app/packs/{meeting,voc}.js`(검증 인스턴스 2종).
- 확장 전략: `aap_runtime_expansion_strategy_v0_1.md`.
