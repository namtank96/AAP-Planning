# AAP Pack Contract v2 — 도메인별 흐름·화면 일반화 스펙

> 상태: 초안 v0.1 (260622) · 작성=기획 총괄 합의 · 구현=aap-platform
> 목적: **"8단계 고정"을 폐기**하고, 각 도메인이 자기 **흐름 그래프·네이티브 화면·인터랙션**을 선언하게 한다.
> 적용 대상: `05_범용플랫폼/app/` (core·packs 멀티파일)

---

## 1. 배경 — 왜 바꾸는가

현재 모든 도메인 팩이 **동일한 캐논 8단계**(`request→understand→compose→approve→prepare→meeting→commit→share`)를 공유하고 라벨만 갈아끼운다. 그 결과:

- 채용의 "면접 일정 조율" 단계 **id가 `meeting`** — 회의 도메인의 흐름 틀을 그대로 물려받은 흔적.
- 코어가 단계 **위치를 하드코딩**(`idxOf(sel)>=4/5/6`, `w.id==='approve'` 등)해 흐름이 8단계에 묶임.
- 자동 진행으로 바꿔도(Phase 1) **"정해진 각본 재생"** 느낌이 남음.

이는 AAP의 핵심 주장("요청마다 실행 구조를 분해·조립해 재구성")과 모순된다. **플랫폼이 모든 도메인을 한 모양으로 찍어내면 자기 주장을 배반**한다.

## 2. 핵심 원칙 — 표준화의 층위

| 층 | 무엇 | 표준화 |
|---|---|---|
| **운영 루프 (엔진)** | 이해→구성→실행→통제(HITL)→반영→학습. 자동진행·트레이스·근거 레일·case.overrides | **보편 (코어)** |
| **업무 프로세스 흐름** | 도메인의 실제 단계·분기·게이트·화면·입력 | **도메인별 (팩 선언)** |

> 이미 깔린 seam: 팩 export의 `stepLoop:{stageId→loopPhase}` 가 *업무 단계 ↔ 운영 루프 phase* 를 매핑한다. 흐름이 4단계든 11단계든, 이 매핑 덕분에 **엔진은 "이 단계가 무슨 종류인지" 이해**한다. v2는 이 seam을 1급 계약으로 승격한다.

**캐논 8단계는 폐기가 아니라 강등** — "여러 가능한 흐름 중 하나(특수 케이스)"가 된다. 회의·VOC는 기존 8단계를 그대로 `flow`로 선언 → **무회귀**.

## 3. 계약 v2 — PACK 인터페이스

기존 PACK export(`window.AAP_PACKS.<id>`)에서 **`work`(고정 8) → `flow`(도메인 그래프)** 로 일반화하고 **`io` 훅**을 추가한다. 나머지 필드(`surface`·`surfaceHooks`·`components`·`compose`·`govern`·`seeds`·`ontology` 등)는 유지.

### 3.1 `flow` — 도메인 단계 그래프 (← 기존 `work` 대체)

```js
flow: [
  { id, label, kind, loopPhase, role?, gate?, live?, doneModal?, next?, ops?, explain? },
  ...
]
```

- **`id`** — 도메인 고유(예: 채용 `screen`·`shortlist`·`offer`). **코어는 어떤 id도 리터럴로 가정하지 않는다.**
- **`label`** — 표시 라벨.
- **`kind`** — 단계 종류(엔진 구동 키):
  - `'input'` — 사람이 요청/자료를 제공하는 시작점(요청 텍스트·문서 업로드).
  - `'auto'` — AAP 자율 실행(기존 actor:'aap').
  - `'gate'` — HITL 결정 지점(기존 actor:'hitl'+hitl:1+gate:1).
- **`loopPhase`** — 운영 루프 phase(`Data|Semantic|Reasoning|Decision|Action|Learning`). 기존 `stepLoop` 을 단계 객체로 흡수.
- **`gate`** (kind==='gate' 일 때) — 게이트 정의로 **코어 하드코딩 제거**:
  ```js
  gate: { label:'숏리스트 기준 승인',
          decisions:[ {key:'yes', label:'이 기준으로 진행', toast:'승인 · 진행합니다'},
                      {key:'no',  label:'컷 좁히기(≥90)', toast:'컷을 좁혀 진행합니다'} ] }
  ```
  (현재 `decide()` 의 `w.id==='approve'?'외부 제외':'수정 요청'` 같은 코어 리터럴을 여기로 이전)
- **`live`** (옵션) — 실시간 세션 단계(회의 진행·면접 진행처럼 시작/중/종료 하위 phase). 기존 `w.meeting` 특수 처리를 **일반 플래그로**(`meeting` id 종속 제거).
- **`doneModal`** (옵션) — 완료 시 결과 모달 표시.
- **`next`** (옵션) — 분기. 기본=배열 다음 단계(선형). 조건 분기 시:
  ```js
  next: (S)=> S.decisions[id]==='no' ? 'rescreen' : 'shortlist'
  ```
- **`ops`·`explain`·`role`** — AAP 작동 근거 레일 콘텐츠(현행 유지).

### 3.2 `io` — 인터랙션 훅 (신규 · 2c에서 채움)

```js
io: {
  inputs:   [ { stage, type:'text'|'file'|'field', key, label, accept? } ],  // 요청 텍스트·이력서/JD 업로드
  editable: [ { key, label, type:'threshold'|'weight'|'value', recompute } ],// 임계값·가중치 → 결정론 재계산
  connectors:[ { id, label, system, stub:true } ],                           // 잡코리아·링크드인·ATS·캘린더(stub)
}
```
- **2a 에서는 슬롯만 예약**(빈 객체 허용). 실제 동작은 2c.
- `editable.recompute` 는 결정론 함수(예: 임계값 변경 → `cutThreshold`/`shortlistIds` 재평가). 이미 결정론이라 **연결만**.

### 3.3 유지 필드
`id·label·ontology·times·products·components·compose·workload·planProduces·gates·govern·seeds·demoScenario·extExcluded·surface{head,base,cmodal}·surfaceHooks{currentCM,wire,decideHook,persistKeys,transientKeys}` — 현행 유지. (`planProduces` 등 stageId 키는 새 `flow` id 기준으로 정렬)

## 4. 코어 변경 — 위치 하드코딩 제거 (2a 핵심)

코어(`core/core.js`)에서 **"고정 8단계·특정 id" 가정을 전부 제거**, `PACK.flow` 메타로 구동:

- **단계 종류 판정** = `stage.kind` (`input`/`auto`/`gate`) + `stage.live`/`stage.doneModal`. 기존 `w.hitl`·`w.meeting`·`w.doneModal`·`w.actor` 분기를 `kind` 기반으로 통일.
- **`decide()` 토스트·결정 라벨** = `stage.gate.decisions` 에서. 코어의 `w.id==='approve'` 같은 **리터럴 id 참조 제거**.
- **진행/위치 로직** = `flow` 순서·`kind`·`loopPhase` 로. `idxOf>=N` 같은 **숫자 임계값 금지**. (도메인이 "이 단계부터 보드 가시화" 같은 걸 표현해야 하면 → 팩이 stage id/loopPhase로 판정. 채용 `reached()`/`colOf()` 는 2b에서 새 id 기준으로 재작성.)
- **`renderSeq`/`playNext`/`startPlay`/`restoreStep`/`revealOps`** = 이미 `idxOf`/`WORK[0]`/`groupsOf` 로 대체로 일반적 — **리터럴 id 잔존 여부만 점검·제거**.
- **`live` 세션** = 기존 `meetPhase`(await_start/in_meeting/await_end) 메커니즘을 `stage.live` 로 일반화(회의 id 종속 해제).

> 코어는 **도메인 무관**을 유지한다. 채용/회의/VOC 전용 로직은 0줄(전부 팩에).

## 5. 마이그레이션 · 무회귀

- 회의·VOC 팩: 현행 8단계를 **그대로 `flow`로 선언**(id·라벨·kind·loopPhase 매핑). 동작 100% 동일이 성공 기준.
- 채용 팩: 2a 에서는 **현행 8단계를 flow로 그대로** 옮기고(무회귀), 2b 에서 **정통 흐름으로 교체**.
- `surface`·`surfaceHooks`·`compose`·`components` 불변.

## 6. 단계화 (이 스펙의 실행 순서)

### 2a. 계약 + 코어 일반화 (무회귀 리팩터) — **먼저·단독**
- `flow` 스키마 도입, 3개 팩을 `work→flow`로 이전(동일 단계), 코어 위치/리터럴 하드코딩 제거, `io` 슬롯 예약.
- **성공 기준 = 채용·회의·VOC 모두 현재와 동작 완전 동일**(자동진행·HITL·탭·surface·trace·case.overrides·demo·인박스). 순수 리팩터.
- 검증: `node --check` 전 파일 + 헤드리스(Edge `--headless=new --screenshot`)로 3팩 자동진행·HITL·무회귀.

### 2b. 채용 흐름 정통화
- 채용 고유 `flow` 그래프로 교체(회의 id 탈피): 요건 → 이력서 수집·파싱 → 매칭·랭킹 → **숏리스트 컷(gate)** → 면접 조율(gate, live) → 평가 → **오퍼(gate)** → 기록·학습. 보류/탈락 **분기**(`next`).
- 채용 surface(`reached`/`colOf`/탭)를 새 stage id 기준으로 재작성.

### 2c. 채용 인터랙션 (io 채움)
- `io.inputs`: 이력서·JD **mock 업로드** → 파싱 단계 입력.
- `io.editable`: 임계값·가중치 **직접 수정 → 결정론 재계산**(후보·점수·숏리스트 갱신).
- `io.connectors`: 잡코리아·링크드인·ATS·캘린더 **Connector affordance(stub)**.

## 7. 보존 · 금칙 (전 단계 공통)

- **보존**: 결정론 엔진·수치 일관, `case.overrides`(P5)·`applyCaseOverlay`/`rebuildPackLevel` 격리, HITL `decide`/`decideHook`, 자산/로그/거버넌스 전역화, 자동저작·pipeline·wfeditor·On-Ramp, **demo.js 안정 ID**(`#flow`/`#explain`/`#seq`/`#surfHead`/`#surfBody`), file:// 동작(외부 라이브러리 0·`<script src>`), Lucide 인라인 아이콘.
- **금칙**: 코어에 도메인 전용 분기, 자기설명 캡션, 단계 id 리터럴 하드코딩(코어), 수치 비결정론.
- 변경마다 `_AGENT_핸드오프_변경기록.md` 최신순 1항목(영역 태그).

## 8. 열린 결정 (구현 중 확정)

- `next` 분기 모델: 함수형(`(S)=>nextId`) vs 선언형(조건 테이블) — 구현 단순성 기준 aap-platform 판단.
- `live` 세션 일반화 범위(회의·면접 외 적용처).
- `planProduces`·`gates`(요약)·`stepLoop` 잔존 필드를 `flow`로 완전 흡수할지, 当分 병행할지.
