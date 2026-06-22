# AAP 핸드오프 · 변경 기록 (플랫폼 기획 / 표준화 agent용)

> **목적**: 회의 데모(Reference Runtime Instance, `03_프로토타입/D_회의/aap_meeting_runtime_builder_*.html`)에서 나온 결정·변경을 **플랫폼 기획 agent**와 **표준화 agent**에 나눠 전달하기 위한 코디네이션 문서.
> 사용자가 수정할 때마다 §5 변경 기록에 추가하고, **영역 태그**(기획·UX / 표준·정의 / 데모 한정)로 해당 agent에 라우팅한다. (이 문서는 매 수정마다 갱신)

---

## 1. 두 agent 분담

| | **플랫폼 기획 agent** | **표준화 agent** |
|---|---|---|
| 역할 | 도메인 무관 플랫폼 **'형태'** 기획 | 도메인 교체 가능한 **'표준'** 정의 |
| 소유 | 3뷰 셸·뷰 구성 / 런타임 화면 구조(좌 고객화면·우 작동흐름) / HITL UX / 거버넌스 배치 / UX 원칙 | 8계층 캐논 · 상세 capability taxonomy · 칩 타입 체계 · kt ds 자산 목록 · 런타임 문법(8단계+운영객체) · Domain Pack 인터페이스 |
| 입력 | 현행 데모 파일 + `aap_platform_form_spec_v0_1.md` §2/§6/§7 + 본 문서 §5(**기획·UX** 태그) | 선제안서 `01_선제안서/aap_proactive_offering_v0.7_260616.html`의 `DEFAULT_ARCH_CHIPS` + `aap_platform_form_spec_v0_1.md` §3~§5/§8 + 본 문서 §5(**표준·정의** 태그) |
| 산출 | 플랫폼 형태 스펙 갱신 · 화면 설계 · 플랫폼 셸 코드 | capability taxonomy · 칩 체계 · 운영객체 스키마 · Pack 인터페이스 |

> **데모는 둘의 검증장**: 데모(D_회의)에서 검증된 항목만 각 agent의 표준/스펙으로 승격. 데모 한정(애니메이션·컴팩트 등)은 승격 대상 아님.

---

## 2. 표준화 agent 핵심 입력 (현 확정)

- **8계층 캐논** (선제안서 v0.7 4-2 = 데모 `LK` 정합): L1 경험·접근 · L2 설계·개발 · L3 에이전트 실행환경(코어) · **L4 지식·시맨틱 ★** · L5 데이터·연동 · L6 AI 품질·평가 · **L7 컨트롤·거버넌스 ★** · L8 인프라.
- **계층별 상세 capability** = `DEFAULT_ARCH_CHIPS[].detail` (원천: 선제안서 v0.7). 예) L5 = DB/API/SaaS Connector·OCR·Parser·Chunking·Embedding·Vector Index·Retrieval Policy·Writeback·System Sync / L3 = Supervisor·Task Routing·A2A·Model Gateway·Tool Calling·Memory/Context·HITL Runtime Gate·Runtime Guardrail / L4 = Domain Ontology·Knowledge Graph·Context Assembly·Evidence/Citation·RAG.
  - **데모 노출 규칙**: 우측 흐름 그래프는 **현재 단계가 작동시키는 레이어 + 그 안에서 실제 쓰는 상세 capability만** 노출(전부 ✕).
- **칩 타입 체계** (선제안서 v0.7): `normal`(일반 capability·회색) / `asset`(kt ds 자산·teal 테두리) / `partner`(외부·상용·teal 점선) / `outcome`(분기 결과 →·teal). 내부 하위요소 = normal.
- **kt ds 자산**: Business Agent(L1) · **BEAST**(L3) · **AI:ON-U**(L5) · **Antbot**(L6). ⚠ **Self-Improving 제외**(자산 아님). (BEAST=AI·API 게이트웨이·Antbot=RPA·AI:ON-U=AI 서빙 — 단 데모에선 설명 범례 줄 비표시, asset 칩 포맷만 유지)
- **런타임 문법(8단계)**: 요청 접수 → 업무 이해 → 실행 구조 구성 → ★HITL① 계획 승인 → 준비 실행 → 회의 진행(자동) → ★HITL② 최종 승인 → 공유·기록. + 운영 객체(Work Event·Context Package·Task Graph·Candidate Set·Execution Package·HITL Decision·Action Result·Run Trace·Skill Update).
- **HITL 모델**: AAP 추천 선반영 + 🔴 필수(책임: 외부 초대·공유·발송)/⚪ 선택(시각·장소·참석자·수신자) 디자인 구분. 게이트 = 계획 승인·최종 승인 2곳.
- **Domain Pack 인터페이스**: 스펙 §8 (workload·compose/registry·plan·products·case).

### ★ 우측 작동 영역 구조 문법 (v0.29 확정 — 표준화 대상)
> 데모 v0.29에서 검증된 "AAP 작동 흐름" 표현 표준. 단계 컴포넌트를 **한 방향 트리로 나열하지 않는다**(레이어 간 상호작용·상시 작동·조건부 작동을 분리해 표현).
- **3계열 레이어 분리**:
  1. **상시·배경 레이어**(cross-cutting, always-on): `Supervisor(L3)` · `온톨로지·맥락(L4)` · `가드레일(L7)` · `감사로그(L8)`. **단계마다 새로 읽지 않고 전 단계에 상시 적용**(밴드 + "상시 적용" 표식). 모든 단계 공통·상수.
  2. **단계 컴포넌트**(step-specific): 그 단계가 실제로 작동시키는 구성요소. **병렬(같은 실행 그룹 `g`)=같은 줄, 순서(`g` 증가)=↓ 화살표**. 6타입(Agent·Module·상용 솔루션·고객 시스템·Connector·Policy).
  3. **맥락 변화 트리거 레이어**(conditional): 외부/내부 맥락이 바뀔 때만 작동(평소 대기). 예) `맥락 재구성(L4)`·`정책 재적용(L7)`.
- **컴포넌트(op) 스키마**: `{ g(실행 그룹·순서), ty(6타입), L(8계층), nm(이름), desc(평이한 한 줄=근거+행동), out(결과), reads[](읽는 데이터), caps[](상세 capability=선제안서 v0.7), ev{data·lookup·rule·logic}(판단 근거 4유형), prod{doc·msg·sys}(산출물 3유형), asset?(kt ds 자산) }`.
- **정보 밀도 규칙**: 단계 밀도는 **가변**(준비 실행 6개=최대 / 업무 이해 3개=경량). **상시·트리거 레이어는 상수**(단계 수에 비례 ✕). "모든 단계가 같은 정보량" 가정 금지.
- **카드 표현(v0.31 갱신)**: 카드 면 = header(타입·계층·상태) → nm → desc(한 줄) → '데이터·근거·산출물' 링크. **reads(읽는 데이터)·out(결과)·ev·prod는 카드 면 ✕ → 클릭 모달에만**(카드 줄바꿈 방지·최대 컴팩트). 구조 캡션 텍스트 최소(↓ 화살표만·"병렬 N", '상시 적용' DIV는 v0.30서 제거).
- **노드 모달**: 정체성 행(구성요소/계층/상태) ↔ 상세 capability 행 ↔ **읽는 데이터/결과 행** ↔ 판단 근거(ev 4유형 색 라벨) ↔ 산출물(prod 3유형). 한 줄 혼재 ✕.
- **상태 모델(v0.31 색 확정)**: 단계 컴포넌트 4상태 = **대기(회색 #94a3b8) → 준비중(amber #d97706) → 작동중(파랑 #2563eb·펄스) → 완료(초록 #16a34a)**, 그룹 reveal로 점등 전이(작동중↔완료 색 분리 필수) / 상시(배경 레이어, cyan) / 대기·트리거(트리거 레이어, amber 점선).
- **업무 순서 표시**: 8단계 전부 1줄(현재 강조·완료 흐림), 직전/현재/다음 3노드 ✕.
- **레이아웃 선정 경위**: 1안(밴드+태그)·2안(방사형 온톨로지)·3안(하이브리드=1안 읽힘+선/구조) 비교 샘플(`03_프로토타입/D_회의/_sample_우측레이아웃_A_B_v0_1.html`) → **3안 채택**.

---

## 3. 플랫폼 기획 agent 핵심 입력 (현 확정)

- **3뷰 셸**(구성/실행/관리) — 단 **현 데모는 '작동 원리 데모'로 슬림화해 토글 숨김**(표준 스펙엔 3뷰 유지; 플랫폼 빌드 시 복원).
- **런타임 화면 2분할**: 좌 = 고객 서비스 화면(**kt ds 업무 포털** — 헤더 + 챗 + 회의 워크스페이스 아티팩트, 2px teal 테두리로 플랫폼과 구분) / 우 = **작동 흐름**(입력 데이터 → 컴포넌트[해당 레이어 상세 capability] → 산출물의 **동적 노드 그래프 + 데이터 입자 흐름**).
- **HITL UX**: 화면 속 모달(인-콘솔)·콘솔 무스크롤·필수/선택 구분·중립 확정 버튼·회의 진행 자동.
- **재생 UX**: Run + 속도 조절(1×/2×) + 단계별 커서·툴팁 narration.
- **거버넌스**: Policy · Run Trace · Evaluation · Skill Library.
- **금칙**: 코파일럿 톤(기업 포털로)·내레이션/작업 리스트 좌측 노출·버튼에 답 넣기·HITL 남발.

---

## 4. 변경 전달 포맷 (사용자 → 본 문서)

수정 지시 시 아래 형식이면 라우팅이 빠릅니다(없어도 정리함):
```
변경: <무엇을 바꿨나>
의도: <왜 / 목적>
영역: 기획·UX | 표준·정의 | 데모 한정   (복수 가능)
```

---

## 5. 변경 기록 (최신순 · 영역 태그)

### app/ 구현체 — P4 프로젝트 계층 (APP.projects + case.projectId + 인박스 프로젝트별 보기 토글) (260622, aap-platform) 〔기획·UX〕
> 5단계 중 **P4**(P1~P3 자산·로그 전역화는 직전 커밋, 핸드오프 기준 `3b2ec68` / 프롬프트 명시 `df162c7` — 두 값 병기). **핵심 = 격리**: 프로젝트는 케이스 묶음(포트폴리오) **추가 레이어일 뿐**, 통합 인박스·상태·유형·On-Ramp·케이스 실행·영속 로직 미변경. **토글 OFF(기본)=현행 인박스 100% 유지**. P5(케이스 튜닝)는 범위 밖. **코어=도메인 무관 유지**(projects/projectId=일반 메커니즘, 팩별 분기 0 — 시드 배정만 packId='recruiting'/'meeting' 매칭, 없으면 미배정). meeting/voc/recruiting·인박스·실행·스튜디오·시연·wfeditor·pipeline·On-Ramp·자동저작·X1·8계층·HITL·자산/로그 전역화(P2/P3) 무회귀. **백업=셸 cp/PowerShell·삭제 전면 차단 → `_archive/app_v0_16_pre_projects/_BACKUP_NOTE.md`(변경 파일 목록 + git 복원 `git checkout 3b2ec68 -- 05_범용플랫폼/app/`). 물리 디렉터리 백업 권한 차단.**
- **데이터 — `APP.projects[]` + `case.projectId?`**(`core/core.js`) — `APP` 에 `projects:[]`·`projectsOn:false` 추가. `saveApp`/`loadApp` 가 `projects`·`projectsOn` 영속(localStorage `aap.v1.projects`·`aap.v1.projectsOn`, 타입 검증 폴백). `caseTemplate` 가 `seed.projectId` 를 옵셔널로 받아 `case.projectId`(기본 null=미배정) 세팅 — 기존 호출(projectId 없음) 무회귀. `createCase` 가 seed 에 request/projectId 있으면 caseTemplate 으로 전달(둘 다 없으면 기존 경로). `projectById`(헬퍼)·`seedProjects`(1회·비어있을 때만: '2026 상반기 채용'·'대한제조 도입' 2개 시드 + recruiting 시드 케이스→채용 프로젝트, meeting 시드 1건→도입 프로젝트 느슨 배정). boot 에서 `seedPack` 직후 `seedProjects()`+`saveApp()` 호출. 〔기획·UX〕
- **인박스 프로젝트별 보기 토글**(`core/core.js` `renderInbox`·신규 `_inboxStatusGroups`, `index.html`) — 인박스 상단(`#inboxProjToggle`, 프로젝트 1개+ 있을 때만 노출)에 **'프로젝트별 보기' 스위치 토글**(`.proj-tg`). **OFF(기본)** = `_inboxStatusGroups(cs)` 직접 호출 = **현행 상태 그룹 마크업과 바이트 동일**(원본 루프를 헬퍼로 그대로 추출 — 무회귀 보장). **ON** = 프로젝트별 그룹(각 프로젝트 헤더 `.ibx-ph`[이름·건수·검토대기 N] + 프로젝트 안에서 `_inboxStatusGroups` 재사용해 기존 상태 그룹 유지) + projectId 없거나 삭제된 프로젝트 가리키는 케이스는 **'미배정'** 그룹. 유형 필터(typeFilter)와 직교(필터 적용된 cs 위에서 그룹). 토글 상태 localStorage 영속. 〔기획·UX〕
- **격리 원칙** — projectId 없는 케이스 정상 동작(미배정 또는 OFF 시 영향 0). 토글 OFF 가 안전 기본값. 프로젝트는 추가 레이어 — caseStatus/caseProgress/openCase/On-Ramp/영속/X1 미터치. 〔기획·UX〕
- **CSS**(`core/platform.css`) — `.inbox-proj-toggle`·`.proj-tg`(+`.ptg-sw` 스위치 on 모션)·`.ibx-proj`·`.ibx-ph`(`.ph-ic/.ph-name/.ph-n/.ph-wait`)·`.ibx-pbody` 추가. 색=aap teal·amber·surface 토큰 재사용, 신규 hex 0. 〔기획·UX〕
- **코어 도메인 무관 유지** — projects/projectId/토글 전부 일반 메커니즘. 안정 ID(`#inboxList`/`#inboxFilter`/`#newCaseBtn`)·뷰 키·demo.js 타깃·X1·자산/로그 전역화 미터치. file:// 동작·외부 라이브러리 0·Lucide 인라인·자기설명 캡션 ✕. 〔표준·정의〕
- **검증(헤드리스/셸 cp·런처·삭제 권한 차단 → `node --check`(허용분)+정적 검증, 브라우저 런타임 미실측 명시)**: (a) `node --check core/core.js` **통과**(구문 0 에러). (b) **OFF 무회귀=정적 보장**: OFF 분기는 원본 상태 그룹 루프를 그대로 옮긴 `_inboxStatusGroups(cs)` 단일 호출 + 동일 `data-open` 와이어링 → 출력 동일. (c) ON 분기=프로젝트 그룹+미배정+프로젝트 내 상태 그룹(코드 경로 리뷰). (d) 토글/projectsOn 영속=loadApp/saveApp 경로 정합. (e) projectId 없는 케이스=caseTemplate 기본 null·미배정 그룹/OFF 무영향. (f) 시드=seedProjects 1회 가드(`APP.projects.length` 체크)·packId 'recruiting'/'meeting' 매칭(확인됨). **후속자가 file://로 (a)토글 OFF=현행 인박스 그대로 (b)토글 ON=프로젝트 그룹+미배정 (c)projectId 없는 케이스 정상 (d)토글 reload 영속 (e)On-Ramp·실행·자산/로그·시연 무회귀 (f)JS 에러 0 실측 필요(미실측 — 헤드리스·런처 차단).** 임시 검증 파일 생성 0. 〔데모 한정 검증〕
- **남긴 후속**: ① **P5 케이스 튜닝**(케이스별 자산·정책 오버라이드). ② 프로젝트 CRUD UI(현재 시드 2개 고정 — 생성/이름변경/케이스 재배정 UI 없음). ③ **aap-design 시각**: 토글 스위치 모션·프로젝트 그룹 헤더/접기·프로젝트별 진행률 롤업·미배정 그룹 위계. ④ 거버넌스(PACK.govern) 전역화(P2/P3 미포함분 잔존). 〔aap-design/후속〕

### 분해·조립 프로토타입 v0.1 (별도 탐색본 · 260622) 〔기획·UX〕
- **파일 = `03_프로토타입/D_회의/aap_meeting_runtime_compose_proto_v0_1.html`** (v0.36 복사본, 현행 데모와 분리된 탐색 프로토타입 — 본선 아님).
- **문제의식(사용자)**: "~~회의 진행하고 싶다" 요청을 받았을 때 AAP가 **업무·역할을 구분하고 프로세스를 분해→조립(재구성)하는 과정**이 안 보임. 현행은 `compose` 단계에서 `out:'작업 그래프 T1~T5'`·`'구성요소 조합'`처럼 **결과 라벨로만 선언**, 분해물·재조립이 화면에 없음.
- **범위 = `compose`(실행 구조 구성) 한 스텝만** 교체. 디자인 토큰·기존 8단계 데이터·다른 7단계 렌더는 **그대로**. `renderRight()`에 `if(w.id==='compose'){renderComposeCanvas();return;}` 분기 1줄, `revealOps` n=3(분해·배정·조립 3비트)만 손댐.
- **새 데이터** `COMPOSE_TASKS[T1~T5]`(goal·필요역량·dep·owners·why[채택/탈락+이유]) + `GATES`. **새 함수** `renderComposeCanvas`/`composeGraph`/`ownerBadges`/`whyBlock`. 새 CSS는 `.cmp-*`/`.tcard`/`.gcard` 등 **스코프 한정 신규**(기존 클래스 불변).
- **화면 = 3비트 진행형 캔버스**: ① 업무 분해(요청→T1~T5 작업 카드, goal+필요역량) → ② 역할 배정(작업별 구성요소 배지 + "왜 이 구성요소인가" 펼침=후보 채택/탈락 이유, **전부 Agent ✕** 메시지) → ③ 재조립(병렬 T1·T2·T3 → 외부 초대 게이트 → T4 → T5 → 외부 발송 게이트, 의존성·게이트 배선). 상단 **입력(한 줄 요청)→출력(작업5·구성요소6종·게이트2)** strip, 하단 **"요청이 다르면 다르게 재구성" 힌트**(Direction D 맛보기).
- Run 재생 시 ②③ 섹션이 `.off`(흐림)에서 비트 진행에 따라 점등 → **분해 먼저 → 배정 → 조립**이 동적으로 보임. 검증: 헤드리스 렌더 OK(①②③ 전부 표출).
- **다음 결정 대기**: 이 방향 확정 시 본선(v0.37+)에 흡수할지 / 역할(누가 실행·승인·책임 RACI) 축 추가할지 / Direction D(다른 요청=다른 구조 토글) 별도 구현할지.

### v0.36 (데모, 빌드 완료 · 260622)
- **검정 narration 툴팁(#nTip) 닫기(×) 추가** — 우상단 `.nt-x` 닫기 버튼. 자동재생 중 닫으면 `STATE.narrHidden=true`로 이후 단계 narration 미표시(가이드 모드 ×는 stopGuide). Run/Guide 시작 시 리셋. 〔기획·UX〕
- **검정 툴팁 ↔ '상태' 범례 아래 설명(rg-expl) 중복 표출 해결** — 같은 `w.guide`를 둘 다 보여 중복 → **상호 배타**: 재생/가이드 중(툴팁 표시)엔 rg-expl 숨김, 비재생·툴팁 닫음 시엔 rg-expl 표시(renderRight 조건 + stopPlay·닫기 시 재렌더). 〔기획·UX〕

### app/ 구현체 — 관리/자산/로그 전역화 P1~P3 (자산 전 팩 union·로그 전 케이스 집계) (260622, aap-platform) 〔기획·UX/표준·정의〕
> 배경: 자산(PACK.components)·거버넌스는 활성 팩만, 로그(renderTrace)는 활성 케이스만 — **전역 차원 부재**. ⭐핵심: trace 는 이미 `case.trace[]`에 영속(`persistToCase`) → 전역 로그는 **새 저장소 없이 `APP.cases[].trace` 집계만**. 이번 배치=**P1(용어)·P2(자산 전역화)·P3(로그 전역화)**. P4(프로젝트)·P5(케이스 튜닝)는 범위 밖. **코어 도메인 무관 유지**(union/집계=일반 메커니즘, 팩별 분기 0). meeting/voc/recruiting·인박스·실행·스튜디오·시연·wfeditor·pipeline·On-Ramp·자동저작·X1·8계층·HITL 무회귀. **백업=셸 cp/PowerShell 차단 → git 복원 경로 `git checkout 3b2ec68 -- 05_범용플랫폼/app/`(직전 커밋 3b2ec68). 물리 디렉터리 백업 권한 차단.**
- **P1 용어 정합**(`index.html`·`core/core.js` 렌더 문자열만) — 자산 뷰 마스터카드 "Agent·모듈·솔루션" → **"Agent·Module·기존 솔루션·Connector·정책"**(사전 용어). 자산/로그 sec-title 부제 추가(자산="전 도메인 팩 통합 카탈로그(중복 자산은 1개로 합산)", 로그="전 케이스 집계(감사·재현)"). 나머지 UI 라벨(운영/스튜디오/관리·워크플로우·도메인 팩·자산·로그·트레이스·거버넌스·정책·HITL·Run Trace·Decision Log)은 이미 정합 — 로직 변경 0. 주: 컴포넌트 `name` 내 "…모듈"은 자산 고유명(dedup 키)이라 유지(변경 시 매칭 깨짐). 〔기획·UX〕
- **P2 자산 전역화**(`core/core.js` `renderAssets` 전면 재작성 + `buildAssetCatalog`/`assetCatalogScoped`/`assetKey`/`_assetNorm`/`gotoAsset` 신규) — 활성 팩 COMPONENTS 한정 ✕ → **전 팩(PACKS) union 카탈로그**. **dedup 키 = 정규화 타입(X1 DC `dcTypeKey`→A/M/S/C/P) + 정규화 이름**(`_assetNorm`=소문자·공백/괄호주석/구두점 제거). 같은 자산 1개로 합치고 **`usedBy:[packId]`(역링크) 표기**(자산 카드 하단 "쓰는 도메인 팩" 칩). **스코프 칩**(`#assetScope`): 전역(전 팩)/팩별(각 PACKS)/현재 케이스(activeCase 팩) + 기존 **타입 필터**(`#assetFilter` A/M/S/C/P) 직교. 〔기획·UX〕
- **P2 Run↔자산 양방향**(`core/core.js` `renderRight`·`gotoAsset`) — 실행 뷰 근거 레일 구성요소 칩(`.ev-comp`)·compose 조합 칩(`.casm .ct2`)에 `.ev-link`+`data-asset`/`data-atk` → 클릭 시 `gotoAsset`(이름 역추적: 타입+이름 정확→이름→타입+부분일치 순) → 자산 뷰로 점프 + 해당 카드 `.hl` 강조·scrollIntoView. 이름 매칭 실패(근거 레일의 일반 역량 라벨, 예 "온톨로지·시맨틱")는 **같은 타입으로 필터**해 유형 자산군으로 안내(토스트). 역방향=자산 카드 usedBy 칩으로 "이 자산을 쓰는 도메인 팩" 표기. 〔기획·UX〕
- **P3 로그 전역화**(`core/core.js` `renderTrace` 전면 재작성, 데이터 기존) — 활성 케이스 STATE.trace 한정 ✕ → **전 케이스(`APP.cases[].trace`) 집계**(활성 케이스는 in-flight STATE.trace 우선 합산). **전역 KPI 스트립**(`#logKpi`): 실행된 케이스·누적 기록·HITL 판단·차단/보류·업무 유형 5종. **집계 키**: HITL=`e.k==='HITL'`, 차단/보류=`e.k==='통제'` OR `t`에 차단/보류/제외/거부, 유형=trace 있는 packId set. **케이스 드릴다운**(`#logCaseFilter`): 통합 타임라인(케이스 라벨 칩 포함) ↔ 케이스별 trace 필터. 〔기획·UX〕
- **CSS**(`core/platform.css`) — `.asset-scope`/`.ag-used`/`.ag-use`(usedBy 역링크 칩)/`.ag.hl`(Run→자산 강조)/`.ev-link`(점프 링크)/`.log-kpis`/`.log-kpi`(KPI 스트립)/`.tr-case`(통합 로그 케이스 칩) 추가 + `.asset-chip.tA~tP`(typeTok 토큰 점/on 색, 스코프·로그 케이스 칩용). 상태색=teal/violet/cyan/blue/amber 토큰 재사용, 신규 hex 0. 〔기획·UX〕
- **코어 도메인 무관 유지** — union/dedup/집계 전부 일반 메커니즘(PACKS·APP.cases 순회), 채용/회의/voc 전용 분기 0줄. dedup 타입 정규화는 X1 DC `dcTypeKey` 재사용(토큰 일관). 안정 ID(`#reg`/`#assetFilter`/`#traceLog`)·뷰 키(`assets`/`logs`)·demo.js 타깃·영속·X1 미터치. file:// 동작·외부 라이브러리 0·Lucide 인라인·자기설명 캡션 ✕. 〔표준·정의〕
- **검증(헤드리스/셸 cp·런처 권한 차단 → `node --check`(허용분) + 정적 검증, 브라우저 런타임 미실측 명시)**: (a) `node --check core/core.js` **통과**(구문 0 에러). (b) DOM id 존재 확인: assetScope·assetFilter·reg·logKpi·logCaseFilter·traceLog **전부 present**. (c) 팩 components 수 meeting 15·voc 13·recruiting 15 → union+dedup 시 공용 모듈(OCR·정규화 등) 합산 확인(로직 리뷰). **후속자가 file://로 (a)자산 뷰=전 팩 union·dedup·usedBy·스코프(전역/팩/케이스)·타입 필터 (b)Run 근거 레일/compose 칩 클릭→자산 강조 (c)로그 뷰=전역 KPI 5종+케이스 드릴다운+통합 타임라인 (d)인박스·실행·스튜디오·시연·파이프라인·On-Ramp·채용 무회귀 (f)JS 에러 0 실측 필요(미실측 — 헤드리스·런처 차단).** 임시 검증 파일 생성 0. 〔데모 한정 검증〕
- **남긴 후속**: ① **P4 프로젝트**(케이스 묶음/포트폴리오 차원) ② **P5 케이스 튜닝**(케이스별 자산·정책 오버라이드) ③ **거버넌스(PACK.govern) 전역화**(이번 미포함 — 현재도 활성 팩만, P2 패턴으로 전 팩 union 가능) ④ **aap-design 시각**: 자산 카드 usedBy 칩/스코프 전환 모션·Run→자산 점프 트랜지션·KPI 스트립 시각 강조·통합 타임라인 케이스 색 일관. ⑤ Run→자산 이름 매칭 품질(현재 정규화 부분일치 휴리스틱 — op.comp 일반 역량 라벨은 타입 필터 폴백). 〔aap-design/후속〕

### app/ 구현체 — 인박스 On-Ramp (새 업무 → 흐름 있으면 실행 / 없으면 격상 자동 유도) (260622, aap-platform) 〔기획·UX〕
> 기획서 `aap_platform_menu_ia_v0_1.md` §3 + 구현순서 **5) 인박스 On-Ramp** = 운영 루프↔구성 루프를 잇는 핵심 연결(유저 최강조: "인박스에 새 업무 추가하면 즉시 플로우를 쪼개 AAP로 격상하는 과정이 빠져있다"). 기존 `promptNewCase`(유형 미리 고르기)를 **업무 설명 입력 + 유형 인식**으로 재설계. **코어=도메인 무관 유지**(팩별 키워드 사전 ✕, 팩 메타 토큰 겹침 휴리스틱). meeting/voc/recruiting·인박스·케이스·영속·X1·8계층·HITL·자동저작·wfeditor·demo.js·파이프라인 무회귀. **백업=셸 cp/PowerShell·삭제 전면 차단 → `_archive/app_v0_14_pre_onramp/_BACKUP_NOTE.md`(변경 파일 목록+git 복원 경로 `git checkout dedfa26 -- 05_범용플랫폼/app/`, 직전 커밋 dedfa26·app/ 워킹트리 clean 확인). 물리 디렉터리 백업은 권한 차단으로 BACKUP_NOTE만 생성.**
- **On-Ramp 입구 재설계**(`core/core.js` `promptNewCase`/`renderNcReco`) — `＋새 업무 요청` 클릭 시 유형 선택 메뉴 ✕ → **업무 설명 textarea + 실시간 유형 인식 패널**(`.nc-onramp`). 입력할 때마다 `matchPackByText`로 인식 결과 갱신: ① **매칭** → '인식된 유형' 카드(유형 배지+workload.type+"이 유형으로 실행") + 항상 '새 유형으로 격상' 보조 선택지. ② **매칭 실패(신규/비정형)** → amber "이 업무는 아직 AAP 흐름이 없습니다 → 분해→구성→HITL→격상" 안내 + '격상 파이프라인으로 진행' 1차 버튼. 빈 입력=힌트+격상 폴백. 외부 클릭(`_ncOff` capture)·재클릭 토글로 닫힘. 〔기획·UX〕
- **유형 인식(도메인 무관 휴리스틱)**(`core/core.js` `matchPackByText`/`packKeywords`/`_tokens`) — 입력 텍스트 토큰 ↔ 각 팩 메타(`label`·`workload.type`·`purpose`·`outputs`) 토큰 **겹침 점수**(0~1). **인정 임계 = 겹친 토큰 ≥2 AND 점수 ≥0.14** (일반 동사 1~2개 우연 겹침은 신규로 흘려보내 격상 유도). 팩별 하드코딩 키워드 ✕ → 새 팩이 register 되면 자동 인식 대상. 〔기획·UX/표준·정의〕
- **매칭→케이스 seed 전달**(`core/core.js` `createCase(packId,seed)`/`ncSeed`) — 매칭 시 사용자가 입력한 업무 설명을 `{title(40자),request(160자)}` seed로 실어 `createCase`→`caseTemplate(pack,{request})` 경로로 그 유형 케이스 생성·실행(케이스 제목·요청에 실제 업무 설명 반영). 기존 호출(seed 없음)은 종전 자동 제목 유지(무회귀). 〔기획·UX〕
- **격상 진입 = 파이프라인 재사용**(`core/core.js` `ncGoPromote` → `core/pipeline.js` `open(seedText)`) — 매칭 실패 시 `AAP_PIPELINE.open(업무설명)` 호출. `pipeline.js open` 이 **옵션 seedText 인자**를 받아 `initModel(text)`(없으면 SAMPLE) — 사용자가 인박스에서 입력한 설명이 격상 파이프라인 ①분해 입력으로 그대로 들어감. 파이프라인 5단계(분해→구성→HITL→격상검증→승격) 완료=`promote()`→`AAP_CORE.register`(새 도메인 팩 편입+typeTok)+`AAP_CORE.load`(시드 케이스 생성+첫 케이스 실행 콘솔). 파이프라인 미로드 시 `AAP_AUTHORING_OPEN` 폴백. **격상 파이프라인·자동저작 중복 구현 0(재사용).** 〔기획·UX〕
- **승격 후 복귀·편입**: `promote()`의 `register`→`renderInbox`/`renderDesign` 자동 재렌더 + `load`→run 뷰로 케이스 열림 → On-Ramp 완료 후 사용자는 새 유형 케이스 실행 뷰에 도착(근거 레일·8계층은 wfeditor 항목대로 ops 연동). **인박스 정형화 완화**: 즉석 생성 유형이 typeTok·필터·카탈로그·인박스에 1급으로 편입(기존 register/typeTok/renderInbox 메커니즘 재사용). 〔기획·UX〕
- **아이콘/CSS**(`core/icons.js`·`core/platform.css`) — `icons.js`에 `search` Lucide path 추가(인라인 SVG·currentColor·이모지 0). `platform.css` `.nc-onramp`/`.nc-ta`/`.nc-reco`/`.nc-reco-i`/`.nc-noflow`/`.nc-hint`/`.nc-acts` 추가(기존 `.nc-menu`/`.ncm-*` 확장, 상태색=aap teal·amber 토큰 재사용, 신규 hex 0). 〔기획·UX〕
- **코어 도메인 무관 유지** — 채용/회의/voc 전용 분기 코어 0줄(matchPackByText=팩 메타 토큰 휴리스틱). 안정 ID(`#newCaseBtn`)·뷰 키·demo.js 타깃·X1·영속 미터치. file:// 동작·외부 라이브러리 0·Lucide 인라인·자기설명 캡션 ✕. 〔표준·정의〕
- **검증(헤드리스/셸/PowerShell·삭제 전부 권한 차단 → `node --check` + 순수 로직 단위 테스트로 검증, 브라우저 런타임 미실측 명시)**: (a) `node --check` core/pipeline/icons 전부 통과(구문 0 에러). (b) **matchPackByText 단위 테스트 6/6 통과**(임시 `app/_onramp_test.js`, 실행 후 내용 비움): 채용 설명→recruiting(0.18)·회의 설명→meeting(0.21)·VOC 설명→voc(0.26) 매칭, 신규 거래처 심사(0.11·일반동사 우연 겹침)→(none)→격상 유도, 빈 입력→(none), 법무 검토→(none). 임계 0.14가 진짜 매칭(≥0.18)과 우연 겹침(0.11)을 분리. (c) 흐름 정합(코드 경로): 매칭→`createCase(id,seed)`→caseTemplate request 반영→openCase / 미매칭→`AAP_PIPELINE.open(text)`→initModel(text)→5단계→promote→register+load→인박스·카탈로그 편입+run 뷰 복귀. **후속자가 file://로 (a)`＋새 업무 요청`→채용/회의/voc 설명 입력→인식 카드→실행 (b)신규 유형 입력→격상 안내→파이프라인 진입(입력 텍스트가 ①분해에) (c)승격→인박스/카탈로그 편입→케이스 실행 (d)채용/회의/voc 무회귀 (e)인박스·실행·스튜디오·시연·wfeditor 무회귀 (f)JS 에러 0 실측 필요(미실측 — 헤드리스 차단).** 임시 검증 파일 `app/_onramp_test.js` = 셸 삭제 차단으로 **내용 비워 무력화**(index.html 미로드·런타임 영향 0, 수동 삭제 가능). 〔데모 한정 검증〕
- **남긴 후속**: ① **신규 팩 영속화**(현 한계 유지 — 자동저작/파이프라인 생성 팩은 비영속 = reload 시 인박스에서 숨김[저장은 보존]). On-Ramp 격상 팩도 동일 — 세션 내 인박스 편입·실행은 동작, reload 영속은 후속(packOverrides 패턴처럼 생성 팩 직렬화/재register boot 필요). ② **aap-design 시각**: On-Ramp 패널 인식 결과 전환 모션·격상 진입 트랜지션·인식 점수 시각화·매칭 후보 다중 표시(현재 최고 1개). ③ 인식 품질 = LLM 연동 시 향상(현재 토큰 겹침 결정론 — pipeline.js proposeBreakdown 과 동일 교체 지점). 〔aap-design/후속〕

### app/ 구현체 — 경량 워크플로우 편집기/시각화 (스튜디오 · 팔란티어식 노드 그래프 + 단계별 5타입·HITL 편집) (260619, aap-platform) 〔기획·UX〕
> 기획서 `aap_platform_menu_ia_v0_1.md` 구현순서 **4) 워크플로우 편집기/시각화** = **경량 편집**(유저 확정) 구현. 스튜디오의 읽기전용 미리보기 아래에 선택된 도메인 팩(워크플로우)을 **노드 그래프로 시각화 + 경량 편집**하는 편집기 추가. 코어=도메인 무관(편집 로직 일반·팩 데이터만 수정). meeting/voc/recruiting·인박스·케이스·영속·X1·8계층·HITL·자동저작·파이프라인·demo.js 무회귀. **백업=셸 cp/PowerShell 전면 차단 → git 복원 경로 `git checkout d3550c7 -- 05_범용플랫폼/app/`(직전 커밋, app/ 워킹트리 clean 확인). `_archive/app_v0_13_pre_wfeditor/` 디렉터리 생성 실패·미생성 명시.**
- **신규 모듈 `core/wfeditor.js`**(일반 로직) — `window.AAP_WFEDITOR = { renderEditor, applyOverride, modelFromPack }`. ① `modelFromPack(pack)`=팩 `work[].ops` 의 `comp` 라벨을 5타입(opType 휴리스틱=코어 evidType 정합)으로 추출해 단계별 `{comps,hitl,canGate}` 모델 생성. ② `renderEditor(pack)`=`#wfEditor` 에 **노드 그래프(graph)**·**편집(edit)** 토글 렌더 — 그래프는 pipeline.js `renderComposeGraph` 의 `.plg-*` 다크 엔진룸 토큰 재사용(좌=캐논 단계 노드, 우=5타입 구성요소 노드, HITL 게이트=amber 플래그/게이트 노드/엣지). 편집은 단계 카드별 **구성요소 추가/교체(타입 select)/삭제** + **HITL 게이트 토글**. ③ `applyOverride(pack,ov)`=override 를 `work.ops`(추가/삭제·기존 op feed/out/L 보존, 신규는 타입별 L 합성)·`work.hitl/gate/actor`·`compose` 칩·`gates` 라벨에 인플레이스 반영. 〔기획·UX〕
- **코어 연동**(`core/core.js`) — ① override 영속 store `packOverrides`(localStorage `aap.v1.packOverrides`, `loadOverrides/saveOverrides`). ② `snapshotPack/restoreBase`=원본 baseline(work/compose/gates 딥클론) 스냅샷 → override 는 **항상 원본에서 재적용**(누적·잔존 방지). ③ `applyPackOverride`=normalizePack **0단계**에서 1회 적용(`_ovApplied` 가드, `_dcDone=false` 로 DC 재정규화 유도) → 편집 결과가 X1 디자인 계약(5타입 토큰) 재통과. ④ `renderDesign` 끝에 `AAP_WFEDITOR.renderEditor(P)` 호출. ⑤ `AAP_CORE` API 추가: `setPackOverride/getPackOverride/hasPackOverride/clearPackOverride/toast`. 저장 시 `reapplyOverride(packId)`=원본 재적용+영향 뷰 재렌더(studio 미리보기·편집기·열린 run 의 seq/restoreStep). 〔기획·UX〕
- **게이트 0개 강제**(편집기+코어) — `wireEdit` 토글 해제 시 다른 게이트가 0개면 차단(체크 되돌림+토스트 "최소 1개 필요"). 상단 게이트 카운트 0이면 red `.wf-gate-block` 경고. **실시간 회의 흐름(`w.meeting`)은 시작/종료 신호 통제 구조라 토글 제외**(고정 게이트) → meeting 팩은 항상 게이트≥1 보장. canGate=approve·commit·hitl형 meeting(채용 면접확인 등). 〔기획·UX/표준·정의〕
- **반영 경로**: 편집→`setPackOverride`→localStorage 저장+`reapplyOverride`→`normalizePack`(원본 baseline 위 override 적용)→`setPackRefs`(활성 팩이면 WORK/COMPOSE 갱신)→studio/run 재렌더. **reload 시 boot 의 `normalizePack`/`setPackRefs` 가 저장된 override 자동 적용** → run 뷰 **근거 레일(ops)·8계층(o.L)·compose 칩(casm)**·스튜디오 미리보기(compose/gatebar)·아키텍처 정합(usedL)에 반영. 기본 시드 팩도 '기본값 복원'(`clearPackOverride`)으로 원복. 〔기획·UX〕
- **index.html / CSS** — `index.html`: 스튜디오 gatebar 아래 `<div class="wf-editor" id="wfEditor">` + 섹션 제목 추가, `<script src="core/wfeditor.js">`(core.js 앞 적재 — core 가 boot 시 호출). `core/platform.css`: `.plg-task.gate`/`.plg-gate`/`.plg-edge.g`/`.plg-lg.gate`(그래프 게이트 amber) + `.wf-*`(바·게이트 카운트·편집 단계 카드·게이트 토글). 신규 hex 0(5타입·상태 토큰 재사용), `.pl-comp*`/`.pl-ty-sel`/`.pl-t` 재사용. 〔기획·UX〕
- **검증(헤드리스/셸/PowerShell 권한 차단 · jsdom 없음 → `node --check` + 순수 로직 단위 테스트로 검증, 브라우저 런타임 미실측 명시)**: (a) `node --check` wfeditor/core 통과(구문 0 에러). (b) **순수 로직 13개 단언 전부 통과**(임시 `_wftest.js`, 실행 후 내용 비움): modelFromPack 단계·comps·타입 추정(Antbot→Module), canGate(approve=true·request/실시간meeting=false), applyOverride 신규 op 추가·Policy L7·기존 op L 보존·commit 게이트 off→hitl0/actor=aap·approve 유지·meeting 보존·compose Policy 칩 n=1·gates 라벨 재계산. (c) X1=applyOverride 가 `_dcDone=false`→normalizePack DC 재정규화로 신규 구성요소도 5타입 토큰 정규화 ✓(코드 경로). **후속자가 file://로 (a)스튜디오 워크플로우 선택→노드 그래프/편집 토글 (b)구성요소 add/replace/delete (c)HITL 토글·0개 차단 (d)저장→reload 영속→run 근거 레일·8계층 반영 (e)인박스·실행·시연·파이프라인·자동저작·채용 무회귀 (f)JS 에러 0 실측 필요(미실측 — 헤드리스 차단).** 임시 검증 파일 `_wftest.js` = 셸 삭제 차단으로 **내용 비워 무력화**(index.html 미로드·런타임 영향 0, 수동 삭제 가능). 〔데모 한정 검증〕
- **남긴 후속**: ① **인박스 On-Ramp**(구현순서 5, 새 업무→흐름 있으면 실행/없으면 격상 자동 유도) — 편집기로 만든 워크플로우가 근거 레일과 연동되므로 On-Ramp 와 자연 결합. ② 편집기 시각 폴리시(aap-design): 노드 그래프 인터랙션(노드 클릭→편집 점프)·게이트 토글 모션·편집/그래프 전환 일관. ③ (선택) 편집기에서 ops 의 feed/out 텍스트까지 편집(현 범위=타입·이름·게이트만, feed/out 은 신규는 합성·기존은 보존). 〔aap-design/후속〕

### app/ 구현체 — 메뉴 IA 그룹형 재편 (운영/스튜디오/관리 + 시연) (260619, aap-platform) 〔기획·UX〕
> 기획서 `aap_platform_menu_ia_v0_1.md`(그룹형 메뉴·자산=스튜디오 아래·'실행' 삭제, 유저 확정) 구현순서 1~3 반영. KEY MESSAGE("업무 이해→실행 구조 구성→5타입 조합") 기반으로 평면 4메뉴(인박스/실행/관리/도메인+시연)를 **3그룹**으로 재편. 코어=도메인 무관 유지. meeting/voc/recruiting·인박스·케이스·영속·X1·8계층·HITL·자동저작·파이프라인·demo.js 무회귀. **백업=셸 cp/PowerShell 전면 차단 → git 복원 경로 `git checkout 597a41e -- 05_범용플랫폼/app/`로 직전본 보존(`_archive/app_v0_12_pre_menuia/` 디렉터리 생성 실패·미생성 명시).**
- **gnav 그룹형 재편**(`index.html`) — 좌측 네비를 **운영**[인박스] · **스튜디오**[워크플로우·도메인 팩 / 자산] · **관리**[로그·트레이스 / 거버넌스·정책] + 하단 **시연** 3그룹으로. 그룹 헤더(`.gnav-grp`) 추가. **'실행' 네비 버튼 삭제**(run 뷰 자체는 유지 — 인박스에서 `openCase`→`setView('run')` 진입). 〔기획·UX〕
- **뷰 키 매핑**(`index.html`·`core/core.js`): `domain`→**`studio`**(워크플로우·도메인 팩, renderDesign 재사용 + 상단 '＋ 신규 격상' 버튼) / `govern` **분할**→ **`logs`**(Run Trace·Decision Log, `renderLogs`=renderTrace) + **`govern`**(거버넌스·정책 govStrip만, `renderGovern` 축소) / 신규 **`assets`**(5타입 레지스트리, 구 govern Component Registry의 `#reg`·Master 카드 이동 + 타입 필터 `#assetFilter`, `renderAssets`). run/inbox/demo 키 유지. 하위호환: `?view=design|domain`→`studio`. setView whitelist·loadApp whitelist·boot whitelist 전부 신규 키로 갱신. 〔기획·UX〕
- **상단 '업무 격상' 버튼 → 스튜디오로 흡수**(`index.html`·`core/core.js`·`core/authoring.js`) — 상단바 `#authBtn` **제거**. 스튜디오 '＋ 신규 격상' 버튼(`#newPromoteBtn`)이 격상 진입(core 가 `window.AAP_PIPELINE.open()` 우선, 없으면 `window.AAP_AUTHORING_OPEN()` 폴백). authoring.js 의 `$('authBtn').onclick` 제거 → 대신 `window.AAP_AUTHORING_OPEN=open` 전역 노출(authBtn null 참조 에러 방지). `?author/pipeline` 딥링크 무영향. 〔기획·UX〕
- **자산 뷰 신규**(`core/core.js` `renderAssets`) — 현 런타임 팩 components 를 5타입(tyA/M/S/C/P) 타입 필터 칩(전체+타입별 카운트·색점)으로. 구 govern 의 reg 렌더 로직을 그대로 이동(ag 카드 무변). 〔기획·UX〕
- **demo.js 타깃 정합**(`packs/recruiting.js`) — 채용 가이드 투어 마지막 스텝 `{do:{view:'govern'}, target:'#traceLog'}` → `view:'logs'`(trace 가 logs 뷰로 이동). demo.js 의 `d.view` 클릭 메커니즘은 `#gnav [data-view]` 제네릭이라 신규 키 자동 동작(코어 미수정). meeting/voc 는 투어 없음. 〔기획·UX〕
- **CSS**(`core/platform.css`) — `.gnav-grp`(그룹 헤더)·`.studio-top`(제목+신규 격상)·`.asset-filter`/`.asset-chip`(5타입 색점 칩, ty-chip 패턴 재사용) 추가. 신규 hex 0(5타입·상태 토큰 재사용). 구 `.authbtn` 규칙은 미사용 잔존(무해). 〔기획·UX〕
- **검증(헤드리스/셸/PowerShell 권한 차단 → 정적·`node --check` 검증, 런타임 미실측 명시)**: (a) gnav 3그룹·'실행' 버튼 부재·상단 '업무 격상' 부재 ✓(마크업). (b) studio=catGrid 카탈로그+`#newPromoteBtn` ✓. (c) assets=`#assetFilter`+`#reg` 5타입 ✓. (d) 관리=logs(trace)+govern(govStrip), reg 없음 ✓. (e) 인박스→openCase→`setView('run')` 경로 무변 ✓. (f) 시연·파이프라인·자동저작·채용 보드 미터치 → 무회귀(데모 투어 govern→logs 1곳만 수정). (g) `node --check` core/authoring/pipeline/demo/icons/recruiting 전부 통과(JS 구문 0 에러). **후속자가 file://로 6뷰 전환·신규 격상→파이프라인·자산 필터·로그/거버넌스 분리·인박스→실행·시연·reload 영속 실측 필요(미실측 — 헤드리스 차단).** 임시 검증 파일 0. 〔데모 한정 검증〕
- **남긴 후속**: ① **워크플로우 편집기/시각화**(구현순서 4, 팔란티어식 노드 그래프 편집 — 현 studio 는 읽기전용 미리보기). ② **인박스 On-Ramp**(구현순서 5, 새 업무→흐름 있으면 실행/없으면 격상 자동 유도). ③ 각 골격(aap-platform)→**시각(aap-design)**: 그룹 헤더·자산 필터·스튜디오 레이아웃 폴리시. 〔aap-design/후속〕

### app/ 구현체 — 채용(recruiting) 데이터·기능 고도화 + 설명 캡션 정리 (260619, aap-platform) 〔기획·UX/표준·정의〕
> 직전 'run 뷰 재정정'(메인=ATS 보드 + 우측 근거 레일) 위에, 유저 요구("화면 외 **데이터·기능 측면 고도화**")를 반영. 채용=실작동 PoC 타깃이라 채용 중심으로 깊이. **코어=도메인 무관 유지**(채용 전용 로직은 recruiting.js, 코어엔 일반 메커니즘 hook만 추가). meeting/voc·시연·파이프라인·인박스·X1·영속 무회귀. 작업 전 백업=셸 cp/PowerShell·IDE 진단 전면 차단 → `_archive/app_v0_11_pre_datafunc/_BACKUP_NOTE.md`(변경 파일 목록 + git 복원 경로 `git checkout 597a41e -- 05_범용플랫폼/app/`).
- **작업 2 · 데이터 고도화**(`packs/recruiting.js`) — 후보 **6→10명**. 각 후보 = 이름·직무·경력연차·이전회사/도메인·이력서요약·스킬·**3축 점수(sk 스킬·ca 경력·dm 도메인 0~100)**·**플래그**(스킬매치높음/경력하한/도메인불일치/중복지원/재직안정성/IC미스매치/추천). **매칭% = sk×0.5 + ca×0.3 + dm×0.2** (가중합=총점, `_c()` 헬퍼가 init 시 결정론 산출 — 숫자 일관). **JD 요건**에 `weight{skill:50,career:30,domain:20}`·`minYrs/maxYrs`·`domain` 추가. **컷 통과수 동적 산출**(`cutCount(th)`=CAND 필터 → TIMES·approve op·모달 라벨 전부 데이터 연동, 하드코딩 제거). **스크리닝 판정**(`screenVerdict`: 통과 ≥85·리스크없음 / 보류 ≥80 또는 리스크 / 탈락 <80 → 리포트·done 모달이 통과 5·보류 2·탈락 3 결정론 표시). 산출물(DLV) 실내용: 스크리닝 리포트=통과/보류/탈락 그룹+사유, 비교표=점수 3축 분해+신호, 오퍼=조건. 〔표준·정의〕
- **작업 3 · 기능 고도화**(`packs/recruiting.js` surface + 코어 hook) — ① **후보 카드 클릭→상세 모달**(`candDetail`: 이력서·**매칭 점수 분해 막대(스킬×50/경력×30/도메인×20=match)**·플래그·스킬 must/plus 색·1차 판정·근거·단계별 결정 버튼). ② **정렬(매칭/종합/경력)·필터(전체/검토신호/스킬매치)** 바(`boardTools`/`sortCands`, prepare~ 노출). ③ **HITL/카드 결정이 실제 보드 상태 전이**: 숏리스트 승급·면접 확정·오퍼 대상·탈락 → `recrDecisions` → `colOf` 가 컬럼 재배치·카운트·상태 갱신 + **localStorage 영속**(`packState`). ④ 컷 기준(`cutThreshold`/`shortlistIds`)이 보드 숏리스트를 결정 — '컷 좁히기(≥90)' `ex`도 반영. ⑤ 근거 레일은 각 단계 실제 데이터에 연동(랭킹 detail = CAND top5 동적). 〔기획·UX〕
- **코어 일반화(도메인 무관 hook 메커니즘 · 채용 분기 0줄)**(`core/core.js`) — `PACK.surfaceHooks` 옵셔널 인터페이스 추가: **`currentCM(S)`**(팩이 도메인 모달 kind 우선 반환 — 후보 상세='cand'), **`wire(root,S,rerender)`**(surface·모달 공통 배선, `rerender(opts{persist,toast,trace})` 콜백 제공), **`decideHook(S,v,sel)`**(HITL decide→보드 상태 번역), **`persistKeys[]`**(케이스 `packState` 직렬화), **`transientKeys[]`**(케이스/단계 전환 시 초기화). `currentCM`/`renderCModal`/`wireSurface`/`decide`/`hydrateFromCase`/`persistToCase`/`runStep`에 hook 호출 1~3줄씩(전부 `if(hk)` 가드 → meeting/voc 무영향). `#flow`/`#explain`/`#cmodal`/`#seq`/`.recr-board` 안정 ID 유지. 〔표준·정의〕
- **작업 1 · 설명 캡션 정리**(`index.html`) — 인박스와 같은 기준으로 **나레이션형 sec-sub 단락 제거**: 도메인 뷰("'도메인'은 앱을 갈아타는 모드가…", "AAP가 요청을 먼저 해석합니다", "AAP는 Agent를 많이 띄우는 게 아니라…", 실행순서·아키텍처 정합 설명) + `.compose-note` 박스 삭제, 시연 뷰 설명 단락, 관리 뷰 Component Registry 설명·Run Trace 인라인 힌트 제거. 기능 라벨(sec-title)은 최소 유지. 키 메시지는 단락 설명 ✕ → 구조·데이터로. 〔기획·UX〕
- **CSS**(`core/platform.css`) — `.rc-flag`(카드 플래그 3색)·`.recr-tools`/`.rbt`(정렬·필터 바)·`.cd-*`(후보 상세 모달: 헤더·점수 분해 grid-area 막대·스킬 must/plus·판정 배지)·`.recr-card.rejected` 추가. 비교표 `.cmp-h/.cmp-r` 5→7열, `.dot-a`(amber) 추가. 5타입·상태 4색 토큰 재사용, 신규 hex 0. 〔기획·UX〕
- **검증(헤드리스/셸/PowerShell/IDE 진단 전부 권한 차단 → 정적·마크업 검증, 런타임 미실측 명시)**: (a) 후보 10명·3축 점수·플래그·매칭 가중합 결정론(`_c`)·컷 통과수 동적(2/6/7)·판정 통과5/보류2/탈락3 정합 ✓(정적 계산). (b) `candDetail`이 점수 분해 막대·플래그·판정·결정 버튼 emit, `currentCM` hook 'cand' 우선. (c) `decide`·카드 결정 → `recrDecisions`→`colOf` 재배치 + `persistKeys`→`packState` 영속 경로 정합. (d) 산출물 report/compare/offer 실내용 데이터 연동. (e) index.html 나레이션 sec-sub·compose-note 부재 확인. (f) meeting/voc=surfaceSpec(hook 미선언→`if(hk)` 가드 무영향)·demo.js 타깃(`.con-body .recr-board`·`#cmodal .cmodal-card`·`#flow`·`#seq`·`#traceLog`) 유지·pipeline/X1/인박스 미터치 → 무회귀. (g) 함수 선언 hoisting·const 정의 순서(JOB→RUBRIC→CAND→cutCount/TIMES→PRODUCTS→WORK) 정합 → 정적 구문 0 에러. **후속자가 file://로 채용 케이스 열기→보드 10명·카드 클릭 상세·정렬/필터·결정 보드 전이·reload 영속·meeting/voc·시연 무회귀·JS 에러 0 실측 필요(미실측 — node --check/헤드리스 전부 차단).** 임시 검증 파일 0. 〔데모 한정 검증〕
- **남긴 후속(aap-design 시각)**: ① 후보 카드 컬럼 간 이동 시 애니메이션(현재 즉시 재배치)·결정 후 카운트 카운트업. ② 점수 분해 막대 채워지는 모션·플래그 위계 시각 정교화. ③ ATS 탭(후보/스코어카드/면접) 전환 실제 인터랙션(현재 라벨만). ④ 정렬/필터 바 시각 디테일·후보 상세 모달 레이아웃 폴리시. ⑤ 시연 narration을 새 인터랙션(상세·정렬·결정 전이)에 맞춰 보강. 〔aap-design 후속〕

### v0.35 (데모, 빌드 완료 · 260619)
- **좌측 = 진짜 기업 포털 홈으로** (기존 홈이 '회의록용 메인'처럼 보임 지적) — '새 회의 요청' 상태칩(`ptSt`) 홈에서 숨김 + 회의 준비 안내문("회의 준비를 요청하면…") 삭제 + '최근 회의' 카드 폐기 → **업무 포털 대시보드**(인사+팀/날짜 / 4스탯[오늘 할 일·결재 대기·안 읽은 메일·오늘 회의] / 공지사항·오늘 일정 2-col / 바로가기[메일·전자결재·문서함·일정·경비·조직도]). 하단 AI 입력바로 회의 요청 → 회의 워크스페이스 전개(워크플로 단계의 상태칩은 유지). 〔기획·UX〕 *(좌측 고객 화면 = 도메인 무관 '일반 업무 포털'이 기본, 회의는 그 안의 한 요청)*

### v0.34 (데모, 빌드 완료 · 260619)
- **topbar 제목 = "Agentic AI Platform 데모 시연 (회의업무)"** (기존 'AAP 데모' ✕), **로고 아이콘 삭제**, **'Domain Pack 회의' pill 삭제**. 개발자 보기·배속·Run 유지. 〔기획·UX〕

### app/ 구현체 — 실행(run) 뷰 재정정: 메인 = 업무가 돌아가는 도메인 화면(surface 복귀), AAP 작동은 우측 얇은 '근거 레일'로 강등 (260619, aap-platform) 〔기획·UX〕
> ★ 직전 항목(아래 'AAP 작동 중심 재구조화')이 **틀려서 되돌림**. 유저 확정 정정: 이 플랫폼은 고객 화면을 따로 지정하지 않는다 — **켜진 HTML 자체가 고객 화면**. 인박스에서 케이스를 열면 **메인 = '그 업무(시나리오)가 실제로 돌아가는 화면'**(채용=ATS 보드·후보·매칭·숏리스트가 단계별로 살아 움직임). **AAP 작동 구조를 메인으로 두면 안 됨** → '중요 근거' 정도로만 곁들임(단계별 얇은 narration + ▸펼침 상세). "코어 실행엔진이 있다" 전시 ✕ → "그런 근거로 그렇게 돌아갔다". 백업=셸 cp/PowerShell 전면 차단 → app/ 전체가 git-tracked·직전 커밋 clean이라 pre-change 상태는 **git 히스토리로 복원 가능**(`_archive/app_v0_10_pre_runwork/` 물리 백업은 권한 차단으로 미생성, git 명시로 대체).
- **① 메인 = 도메인 surface 복귀**(`index.html` run 뷰) — `.run-main`을 `.run-surface`(메인, flex:1) + `.run-evid`(우측 304px 레일)로 2분할. `.run-surface` 안에 `.con-head#surfHead`+`.con-body#surfBody`+오버레이 `#cmodal`. `renderConsole()`이 `surfHead(C)`/`surfBase(C)`를 `#surfHead`/`#surfBody`에 렌더 → recruiting `PACK.surface`(ATS 보드)·meeting/voc `surfaceSpec`이 실행 뷰 메인 표면으로 복귀. '고객이 보는 서비스 화면' 캡션/별도 박스 ✕(`.run-surface` 자체가 그 화면). 단계 진행 시 board `reached()`/`colOf()`가 `idxOf(sel)`을, base가 `R.phase`를 읽어 **살아 움직임**(renderConsole이 매 reveal tick 재렌더). 〔기획·UX〕
- **② AAP 작동 = 우측 얇은 근거 레일로 강등**(`renderRight` 전면 교체) — `#flow`를 8계층 op 그래프 → **단계별 얇은 근거 라인(.evid-row)**: 점(5타입 색)+구성요소명(comp)+타입 배지+`feed → out` 1~2줄, ▸`근거 펼침`(.ev-more)으로 관여 계층(L)·micro·detail(산출물 표) 노출. 데이터=`w.ops`(comp·feed·out·L·micro·detail·badge) 그대로(도메인 무관). 구성요소 타입색은 `evidType(o)`가 comp 문자열을 5타입(A/M/S/C/P)으로 매핑하는 **코어 토큰 휴리스틱**(도메인 분기 0). `compose` 단계 `.casm` 구성요소 칩 보존. `#explain`(단계 설명)·`loopbadge`(추론 루프)도 레일에. 〔기획·UX〕
- **③ HITL 게이트 = surface 위 오버레이 유지** — `#cmodal`이 `.run-surface` 안 `inset:0` 오버레이(보드 위). `currentCM`/`renderCModal`/`decide('yes'/'no')`·`surfCmodal`(도메인 네이티브 HITL/결과) 로직 전부 무변경. 게이트 await → 모달, 보드는 뒤에. 〔기획·UX〕
- **④ 산출물 미리보기 재사용** — surface 내 `[data-dlv]`(보드 카드·JD 스트립·리뷰 '보기')와 근거 펼침의 detail → `wireSurface`/`openPreview`(기존 products/DLV) 경로 보존. surface 내 `#replay` = 처음(WORK[0])으로. 〔기획·UX〕
- **코어 도메인 무관 유지** — 채용/회의 전용 분기 코어 0줄(`evidType`은 토큰 휴리스틱). 인박스·케이스·영속성·X1 normalizePack/DC·8계층·자동저작·파이프라인·demo.js 미터치. `#flow`/`#explain`/`#cmodal`/`#seq` 안정 ID 유지 + 신규 `#surfHead`/`#surfBody`. recruiting 데모 타깃 `.con-body .recr-board`가 **다시 유효**(surfBody=con-body 안 보드 렌더), `#flow`(근거 레일)·`#cmodal .cmodal-card`도 유효 → demo.js 무회귀. 〔표준·정의〕
- **CSS**(`platform.css`) — `.run-main` 2분할(surface+`.run-evid`), `.con-head`(구 cust-head 역할 padding/border), `.run-surface .con-body{overflow:auto}`, 신규 `.run-evid`/`.re-head`/`.evid-row`/`.ev-dot/.ev-comp/.ev-tag/.ev-badge/.ev-par/.ev-line/.ev-more/.ev-detail/.ev-lay/.ev-micro`(5타입 색은 `--type-*` 변수 폴백 hex=Agent teal·Module violet·Solution cyan·Connector blue·Policy amber, 페르소나 색 규약 준수). 구 `.rs-head/.rs-scroll/.rs-scroll .flow`(중앙정렬) 룰 제거, `.op*`/`.casm`/`.ct2` 보존(detail·compose 칩 재사용). 신규 raw hex는 5타입 폴백뿐. 〔기획·UX〕
- **검증(헤드리스 불가: jsdom 미설치·PowerShell/Bash cp·IDE 진단 권한 차단 → 정적·마크업·`node --check` 검증, 런타임 미실측 명시)**: `node --check` core.js/recruiting.js/meeting.js 전부 OK(구문 에러 0). (a) run 뷰 메인=`#surfHead`/`#surfBody`(surface), 8계층 op 그래프는 우측 `#flow` 근거 레일로만 → 메인 아님 ✓(마크업). (b) `renderRight`가 `.evid-row`+`.ev-more`(▸펼침) emit ✓. (c) `renderConsole`이 매 호출 surfHead/surfBase 재렌더 + board가 idxOf(sel)·R.phase 읽음 → 단계 진행 반영(정적 정합). (d) `decide` 경로 무변경·HITL `#cmodal` 오버레이 유지. (e) meeting/voc=`surfaceSpec`→core headSpec/baseSpec, recruiting=`surface{head,base,cmodal}` 둘 다 surfHead/surfBase/surfCmodal로 라우팅 → surface 메인. (f) demo.js·pipeline·인박스·X1 미터치·`#flow` 등 ID 유지 → 무회귀. (g) `node --check` 통과로 JS 에러 정적 0. **후속자가 file://로 채용 케이스 열기→ATS 보드 메인·우측 근거 레일·단계 진행 보드 반영·HITL decide·meeting/voc surface·시연 무회귀 실측 필요(미실측).** 임시 검증 파일 0. 〔데모 한정 검증〕
- **남긴 후속**: ① **aap-design**: 근거 레일 시각 정교화(타입 점·배지 위계, doing blink, 펼침 detail 표 정렬), 보드가 단계마다 카드 in/animate. ② 보드 surface가 prepare 단계에서 파싱/매칭 카운트 카운트업 등 '살아 움직임' 모션 강화. ③ ATS 탭(후보/스코어카드/면접) 전환 인터랙션(현 라벨만). ④ 시연 스텝을 새 구조(메인 보드 + 근거 레일)에 맞춰 narration 보강. 〔기획·UX/aap-design 후속〕

### app/ 구현체 — 실행(run) 뷰 'AAP 작동 중심' 재구조화: 좌 고객화면 패널 제거 + HITL run 오버레이 (260619, aap-platform) 〔기획·UX · ★위 항목으로 되돌려짐〕
> 로드맵 §6 + 유저 결정: "우리가 만드는 건 'AAP의 (가짜) 작동을 보여주는 것' → '고객이 보는 서비스 화면'을 별도 영역으로 두면 안 된다. **플랫폼(이 HTML) 자체가 고객 화면**이고 인박스 항목을 AAP에 '태워' 처리. 실행 뷰의 고객화면 박스를 완전히 제거하고 AAP 작동 중심으로." 참조=`03_프로토타입/D_회의/aap_meeting_runtime_builder_v0_32.html`(우=업무순서+AAP 작동 흐름). 작업 전 백업=셸 cp/diagnostics 전면 차단 → `_archive/app_v0_9_pre_runview/_BACKUP_NOTE.md`(변경 파일 목록·git 복원 경로, 무변경 파일은 히스토리 의존).
- **① 좌 '고객이 보는 서비스 화면' 패널 완전 제거** (`index.html` run 뷰) — `.panel.left`(cons-wrap·"고객이 보는 서비스 화면" 캡션·custHead·conBody·인-콘솔 cmodal) 삭제 → `.run-main > .run-surface`(풀폭) 단일 표면. 우 8계층 패널을 메인으로 승격. 〔기획·UX〕
- **② AAP 작동 흐름 = 실행 뷰 메인 표면** — 상단 `.runtop` 업무 순서(8단계 seq, 기존 `renderSeq` 그대로) + 메인 `.rs-scroll` 안 `#explain`+`#flow`(기존 `renderRight` 8계층 op 흐름, 풀폭·중앙정렬 max-width 760). 노드 그래프 시각(Master 허브·5타입 노드·상태 점등) 정교화는 v0.32 스타일로 **aap-design 후속**(골격·데이터 연결만 이번에 정비). 〔기획·UX〕
- **③ HITL/결과/미리보기 = 실행 영역 위 오버레이로 승격** — `#cmodal`을 `.console`(좌패널) 내부 → `.run-surface` 내부(`position:relative`)로 이동, `inset:0` 풀 오버레이. `currentCM`/`renderCModal`/`decide('yes'/'no')`·HITL 데이터·`surfCmodal`(도메인 네이티브 HITL/결과 콘텐츠) **로직 전부 유지**. 게이트 단계 await → 모달 오버레이로 사람 승인. 〔기획·UX〕
- **④ 산출물 미리보기 재사용** — 흐름 op 노드의 '결과 보기'(op-more, inline `o.detail`)·모달 내 `[data-dlv]` '보기' → `openPreview`(기존 products/DLV) 경로 보존. 〔기획·UX〕
- **⑤ per-도메인 고객 서비스 화면 보존(삭제 ✕)** — `renderConsole()`를 `renderCModal()`만 호출하도록 축소(custHead/conBody 미렌더). **`surfHead`/`surfBase`/`headSpec`/`baseSpec`/recruiting `PACK.surface`(ATS 보드)/meeting `surfaceSpec` 코드는 전부 보존** — 운영 실행 뷰에서만 미호출, 시연 모드(demo.js)용으로 유지. `restoreStep` baseOnly=true(정착 단계는 AAP 흐름 기본 노출, 결과 모달이 흐름 안 덮음 / HITL await 는 baseOnly 무관하게 모달 표시). 〔기획·UX/표준·정의〕
- **코어 도메인 무관 유지** — 채용·회의 전용 분기 코어에 0줄. 인박스·케이스·영속성·X1 normalizePack/DC·8계층·자동저작·파이프라인 미터치. `#seq`/`#flow`/`#explain`/`#cmodal` 안정 ID 유지 → demo.js 시연 스텝 타깃 무회귀(`.con-body .recr-board` 타깃만 run 뷰에서 부재 → `pick()` 폴백으로 스포트라이트 생략, JS 에러 0). 〔표준·정의〕
- **CSS** (`platform.css`) — `.main`(grid 60/40 2분할) → `.run-main`(flex)·`.run-surface`(풀폭 패널)·`.rs-head`·`.rs-scroll`·`.flow`/`.explain` 중앙정렬(max-width 760) 추가. 구 `.panel`/`.panel.left/.right`/`.cons-wrap`/`.cons-h`/`.console`/`.cust-head`/`.con-body` 룰은 **삭제하지 않고 보존**(시연 surface 출력이 사용). 신규 hex 0(기존 토큰 재사용). 〔기획·UX〕
- **검증(헤드리스/셸/IDE 진단 전부 권한 차단 → 정적·마크업 검증으로 대체, 미실측 명시)**: (a) run 뷰 마크업에 '고객이 보는 서비스 화면' 캡션·`.panel.left`·custHead·conBody 부재 확인 ✓. (b) `#flow`(AAP 작동 흐름) `.run-surface` 메인 풀폭 + `renderRight`가 `#flow`/`#explain` emit ✓. (c) `currentCM`/`renderCModal`/`decide` 경로 무변경 → HITL 게이트 단계 모달 오버레이 동작(정적). (d) `openCase`→`hydrateFromCase`→`restoreStep`(baseOnly=true)→`renderConsole`(=renderCModal)+`renderRight` 경로 정합. (e) boot 기본 view='inbox'(run인데 active 없으면 inbox 폴백) → 랜딩=인박스(시연 아님) ✓. (f) demo.js 시연 스텝 타깃(`#inboxList`/`#seq`/`#flow`/`#cmodal .cmodal-card`/`#traceLog`) 실존·`.con-body .recr-board`만 부재(폴백 무에러); meeting/voc surfaceSpec·recruiting surface·pipeline 미터치 → 무회귀. (g) custHead/conBody/replay getElementById 잔존 참조 0(grep 확인). **사용자/후속자가 file://로 인박스→케이스 열기→실행=AAP 흐름 풀폭·HITL 모달 승인·시연 무회귀·JS 에러 0 실측 필요(미실측).** 임시 검증 파일 생성 0. 〔데모 한정 검증〕
- **남긴 후속**: ① **aap-design**: 실행 뷰 AAP 작동 흐름을 v0.32 노드 그래프 스타일(Master 허브→5타입 노드→산출물, 데이터 흐름·상태 점등·상시 배경/트리거 레인)로 시각 정교화(현재는 기존 op 흐름 풀폭). ② **시연 모드에 per-도메인 고객화면 연결**(보존된 surfaceSpec/PACK.surface를 시연 스텝에서 노출 — 이번 미구현). ③ run 뷰에서 산출물 패널/딜리버러블 갤러리(현재 노드 inline + 모달 data-dlv). 〔기획·UX 후속〕

### app/ 구현체 — 디자인: 시연 모드(Guide Mode) 발표 품질 시각 정교화 (260619, aap-design) 〔기획·UX〕
> 직전 반영된 시연 모드 골격(네비 '시연'+시나리오 선택+가이드 투어 오버레이)을 **기능 무회귀로 발표용 수준까지 시각만** 정교화. 디자인 가이드 §6.5.5(신규) 준수. 작업 전 백업=셸 cp/rm 차단 → `_archive/app_v0_8_pre_demo_design/_BACKUP_NOTE.md`(변경 파일 목록 + git 복원 경로, 무변경 파일은 히스토리 의존). 시연 엔진 로직(startTour/layoutGuide/waitFor·스텝 do 실행·core 위임) 무변경.
- **메타 레이어=violet / 본체 액션=teal 규율 확립** — 시연 진입 경로(시나리오 카드 상단 그라데이션·아이콘 violet)는 "메타 레이어" 신호로 violet 유지, 단 **투어 진행 중 1차 액션(다음 버튼)·스포트라이트 ring은 teal 브랜드**로 전환(violet 남용 방지). 〔기획·UX〕
- **작업 A — 시나리오 카드**(`platform.css .demo-*` / `demo.js renderDemoView`): 업무 아이콘+업무명+한줄 설명 위에 **예상 흐름 칩(`.demo-flow`)** 추가 — `N단계 흐름`(layers 아이콘) + `사람 승인 N회`(user-check·amber, HITL 스텝 수 자동 집계 `hitlCount`). 카드 1스타일+상단 violet 그라데이션 악센트(`::before`)·hover lift·violet-soft 아이콘 칩. 상단 1줄 안내는 기존 `.sec-sub` 유지. 〔기획·UX〕
- **작업 B — 가이드 투어 오버레이**(`platform.css .guide-*`·`.gb-*` / `demo.js buildOverlay·gotoStep·placeBubble`): ① **스포트라이트** dim `.58→.62`(운영 화면 가독)·**teal 2px ring + 외곽 글로우**·이동/크기 `.3s` 트랜지션(드리프트 로직 layoutGuide 불변, 시각만). ② **말풍선** = 헤더(`STEP n/N` teal pill + **역할 태그** AAP 자율 실행[violet·bot] / 사람이 승인[amber·user-check]) + **진행 도트(`.gb-dots`)**(현재=teal bar·완료=teal-border·HITL=amber) + 제목 + 본문 + 푸터(다음=1차 teal / 이전·중지=ghost 보조, 중지에 x 아이콘) + **target 가리키는 꼬리(`.gb-tail`)** 4방향(placeBubble이 side 클래스·꼬리 좌표 계산). ③ **커서** Lucide mouse-pointer + 은은한 펄스. 〔기획·UX〕
- **HITL 스텝 강조(키 메시지)** — 게이트 단계는 스포트라이트 ring·말풍선 테두리·역할 태그·진행 도트·1차 버튼을 일괄 **amber**로 전환 → "여기서 사람이 승인"을 색으로 못박음. 판정=`step.hitl` 플래그 또는 제목의 `HITL` 표기(`isHitlStep`). `gotoStep`에서 `.hitl` 클래스 토글(bubble/spot/cursor). 〔기획·UX〕
- **아이콘** — `icons.js`에 Lucide path 3종 추가(circle-dot·user-check·bot), 인라인 SVG·currentColor·이모지 0. 〔기획·UX〕
- **검증(헤드리스/셸/IDE 진단 전부 권한 차단 → 정적·마크업 검증으로 대체, 미실측 명시)**: (a) `renderDemoView`가 카드에 flow 칩(`N단계 흐름`·HITL 수) emit·`hitlCount` 로직 확인. (b) `buildOverlay` 새 DOM(`#gbTail`·`#gbTag`·`#gbDots`)과 `gotoStep`의 `els.tag/dots/tail` 참조 정합(빌드→gotoStep 순서상 존재). (c) `els.next.querySelector('.btn-l')` 구조 보존('마침'/'다음' 라벨 토글 무영향). (d) `placeBubble` side 클래스(tail-left/right/top/bottom)·`placeBubbleCenter` 꼬리 제거 로직. (e) 신규 참조 아이콘(layers·user-check·bot·x·circle-dot·mouse-pointer·chevron-left/right·play-circle) 전부 `icons.js` 정의(미정의 0). (f) 함수 시그니처·startTour/layoutGuide/waitFor/applyDo·core 위임 무변경 → 시연 엔진·운영 모드 무회귀. **사용자/후속자가 file://로 '시연'→채용 시연 시작→스포트라이트 ring·말풍선 도트/역할 태그/꼬리·HITL amber 전환·스크롤 드리프트 0·이전/다음/중지·JS 에러 0 실측 필요(미실측).** 임시 검증 파일 생성 0. 〔데모 한정 검증〕
- **가이드 갱신** — `04_디자인가이드/aap_platform_ui_design_guide_v0.1.md` §6.5.5(시연 모드 시각 표준) 신규 + footer v0.3 노트. 〔기획·UX〕
- **남긴 후속**: ① **헤드리스 실측**(셸/진단 차단 해제 시 스포트라이트 ring·HITL amber 전환·꼬리 정렬·드리프트 스크린샷). ② 회의·VOC 팩 `demoScenario` 추가 시 카드 자동 편입(현재 채용 1종). ③ 시나리오 데이터에 명시적 `step.hitl:true` 부여 검토(현재는 제목 'HITL' 표기 휴리스틱 병행). ④ 진행 도트 클릭→해당 스텝 점프(현재 이전/다음만). 〔기획·UX 후속〕

### app/ 구현체 — 시연 모드(Guide Mode) 신규: 네비 '시연' + 시나리오 선택 + 가이드 투어 오버레이 (260619, aap-platform) 〔기획·UX/표준·정의〕
> 로드맵 §5("하나의 플랫폼, 두 모드")·§6 후속2 구현. 운영 모드(기본)는 그대로, **'시연' 네비 진입 → 시나리오 선택 → 운영 콘솔 화면 위에 가이드 내레이션(dim 스포트라이트+말풍선+커서+자동 화면 전환)**을 얹어 AAP의 분해→구성→게이트→실행 흐름을 한 호흡으로 시연. 데모/실제가 **같은 화면 공유**(실작동 Phase3 진화해도 시연 그대로 동작). 손해사정 v0.53+ "온디맨드 Guide Mode" 검증 패턴 차용. 작업 전 `_archive/app_v0_7_pre_guidemode/_BACKUP_NOTE.md`(셸 cp/rm 차단 → 변경 파일 목록·git 히스토리 복원 경로 명시). 운영 모드(통합 인박스·케이스·파이프라인·X1·8계층·HITL·자동저작·채용 Pack) 무회귀.
- **신규 `app/core/demo.js`(코어 · 도메인 무관 가이드 투어 엔진)** — `index.html`에 `<script src="core/demo.js">` 추가(recruiting.js 뒤·core.js **앞** → core boot의 setView가 `window.AAP_DEMO` 참조 가능). `window.AAP_DEMO={renderDemoView,startTour,stopTour,isActive}`. 〔기획·UX/표준·정의〕
- **가이드 엔진 구조** — ① **시나리오 레지스트리=데이터**: 등록된 팩 중 `demoScenario`를 가진 것만 자동 수집(`scenarios()`), 시연 뷰 카드로 렌더. 코드에 채용 전용 분기 0줄. ② **오버레이**(body 직속 1회 생성, 뷰 재렌더 무영향): `.guide-spot`(box-shadow `0 0 0 9999px rgba(15,23,42,.58)` dim 스포트라이트)+`.guide-cursor`(mouse-pointer)+`.guide-bubble`(스텝 n/N·제목·본문·[이전/중지/다음]). ③ **자동 화면 전환**: 스텝의 `do={view|open|go}`를 **코어 공개 API 재사용**으로 실행 — `view`=`#gnav [data-view] .click()`(setView), `open`=`AAP_CORE.load(packId)`(케이스 열기→run뷰), `go`=`AAP_CORE.go(stepId)`(work step 이동·runStep). ④ **★layoutGuide**: `scroll`(capture=true·운영 화면 내부 스크롤 포함)·`resize`마다 target `getBoundingClientRect()` 재계산해 스포트라이트·커서·말풍선 재배치(**드리프트 방지** — fixed 1회 배치 ✕). 투어 종료/`stopTour` 시 listener 제거+오버레이 숨김. ⑤ **HITL 모달 대기**: HITL 스텝은 실행 애니(최대 ~2.2s) 후 `#cmodal .cmodal-card` 표시 → `waitFor`(rAF 폴링 ~4s, 스텝 변경 시 가드로 늦은 콜백 폐기)로 등장 대기 후 배치. ⑥ **말풍선 자동 배치**: target 옆 빈 공간(오른쪽→왼쪽→아래→위→중앙) 뷰포트 클램프. 〔기획·UX/표준·정의〕
- **시나리오 스텝 데이터(채용) = `recruiting.js`의 `demoScenario`** — 8스텝: ①통합 인박스(`#inboxList`) ②요건 분해(open+go understand·`#seq`) ③구성요소 조합(go compose·`#flow`) ④숏리스트 기준 승인 HITL①(go approve·`#cmodal .cmodal-card`) ⑤자율 파싱·매칭·랭킹(go prepare·`.con-body .recr-board`) ⑥면접 일정 확인 HITL②(go meeting·모달) ⑦합격·오퍼 승인 HITL③(go commit·모달) ⑧기록·학습(view govern·`#traceLog`). 각 스텝=`{do,target,title,body}`. 화법 설명형 'AAP가', 금칙("알아서 다 한다"·"사람 볼 필요 없음") 준수, HITL을 "사람이 정/확인/승인"으로 명시. **타깃=운영 화면 실제 요소(기존 안정 ID·클래스)** — 별도 data-guide 속성 없이 실 요소 직접 앵커. 〔기획·UX〕
- **코어 보강(최소·도메인 무관)** — `core.js setView`에 `if(window.AAP_DEMO&&v==='demo')renderDemoView()` 위임 1줄 + 유효 뷰 화이트리스트 3곳(`loadApp`·boot·`?view=`)에 `'demo'` 추가. **채용/시연 전용 분기 코어에 0줄**(가이드 엔진=demo.js, 시나리오=데이터). `index.html`: gnav에 `.gnav-sp`(스페이서)+`'시연'` 항목(`data-view="demo"`·presentation 아이콘·violet 톤, 운영 메뉴와 하단 분리) + demo 뷰 섹션(`#demoList`). 〔기획·UX/표준·정의〕
- **아이콘/CSS** — `icons.js`에 Lucide path 3종(`presentation`·`play-circle`·`mouse-pointer`) 추가(인라인 SVG·currentColor·이모지 0). `platform.css`에 `.gnav-sp`/`.demo-nav`(violet)·`.demo-grid`/`.demo-card`/`.demo-start`(시나리오 선택)·`.guide-ov`/`.guide-spot`/`.guide-cursor`/`.guide-bubble`/`.gb-*`(투어 오버레이) 추가 — 색=violet(시연=학습/제안 톤) + 기존 토큰 재사용, 신규 hex 0(dim만 rgba). 〔기획·UX〕
- **검증(헤드리스/셸/IDE 진단 전부 권한 차단 → 정적·마크업 검증으로 대체, 미실측 명시)**: (a) gnav '시연' 항목·demo 뷰 섹션·`#demoList`·script 로드 순서(packs→demo→core) 마크업 확인. (b) `scenarios()`가 `demoScenario` 보유 팩(현재 채용 1종) 수집 → 카드 1개 렌더 로직. (c) 스텝 `do`→코어 API(load/go/nav click) 매핑, target 셀렉터 전부 실존 요소(`#inboxList`·`#seq`·`#flow`·`#cmodal .cmodal-card`·`.con-body .recr-board`·`#traceLog`)·일부는 fallback(nav 버튼) 콤마 셀렉터. (d) 이전/다음(경계 클램프·'마침' 라벨)/중지(stopTour=listener 제거+오버레이 숨김) 로직. (e) **layoutGuide 드리프트 방지는 정적 확인 불가 → scroll/resize(capture) listener + rAF 재배치 + waitFor 스텝 가드 로직으로 보장(코드 명시)**. (f) 코어 setView 위임·뷰 화이트리스트 외 운영 로직 무변경 → 운영 모드 무회귀(채용 Pack·meeting·voc surface·X1·HITL 미터치). **사용자/후속자가 file://로 '시연'→채용 시연 시작→스포트라이트·말풍선·자동 전환·HITL 모달 등장·스크롤 시 드리프트 없음·이전/다음/중지·운영 무회귀·JS 에러 0 실측 필요(미실측).** 임시 검증 파일 생성 0(정적 코드 검증만). 〔데모 한정 검증〕
- **남긴 후속**: ① **헤드리스 실측**(셸/진단 차단 해제 시 스포트라이트 배치·HITL 모달 대기 타이밍·드리프트 스크린샷). ② 회의·VOC 팩에도 `demoScenario` 추가하면 시연 뷰에 자동 편입(현재 채용 1종만). ③ 시연 중 HITL 스텝에서 **자동 클릭(decide)까지 시연**할지(현재는 모달 '제시'만 스포트라이트, 클릭은 사용자/설명자 몫) — 자동 진행 옵션(`do.click`) 검토. ④ Phase3 실작동 시 내레이션 문구를 '시뮬→실행' 설명으로 교체(스텝 데이터만 수정). 〔기획·UX/표준·정의 후속〕

### app/ 구현체 — 채용(recruiting) 도메인 네이티브 Pack 신규 (260619, aap-platform) 〔기획·UX/표준·정의〕
> 로드맵 §5(하이브리드·PoC 타깃=채용)·§6("두 종류의 같음" + 회의 리스킨 탈피) 구현. **공유층(통합 인박스·3뷰 셸·8단계 캐논·HITL 3관문·거버넌스 4종·5타입·X1·8계층)=불변 공유, per-도메인 surface+단계 안무=도메인 네이티브**. meeting/voc 무회귀. 작업 전 `_archive/app_v0_6_pre_recruiting/`에 백업(셸 rm/cp 권한 차단 → 변경 파일 백업 + `_BACKUP_NOTE.md`로 기록, 무변경 파일은 git 히스토리 보존).
- **신규 `app/packs/recruiting.js`**(id=`recruiting`·label=`채용`) — 통합 인박스/카탈로그/필터에 새 유형 자동 편입(`window.AAP_PACKS.recruiting` 등록, `typeTok` 자동 색 배정). `index.html`에 `<script src="packs/recruiting.js">` 1줄 추가(voc 뒤·core 앞). 〔기획·UX〕
- **surface 구현 선택 = (b) `PACK.surface` 함수형 커스텀 렌더** — 좌측 콘솔을 **실제 ATS(채용관리시스템)**처럼: 직무 슬롯(JD 스트립) + **후보 파이프라인 보드**(스크리닝 통과→숏리스트→면접→오퍼 4컬럼, 단계별 후보 카드[이니셜·경력·매칭%·스킬·종합점수·검토신호]) + **스코어카드**(루브릭 5항목 가중 막대) + 후보 비교표. **이유**: 선언형 `surfaceSpec`은 avatars/rows/times/files/overview만 표현 가능 → 보드·표·스코어카드 불가. 코어가 제공하는 함수형 escape hatch(`surfHead`/`surfBase`/`surfCmodal`)를 사용해 PoC 손빌드 화면을 그리되, **코어는 도메인 무관 유지**(채용 전용 분기 0줄 — `currentCM`/`caseStatus`가 이미 `meeting` 플래그 없이 `hitl`/`done`만으로 동작). 〔기획·UX/표준·정의〕
- **단계 안무도 채용 고유(캐논 id·actor·gate 구조 유지, 라벨·ops=채용)** — 채용 요건 접수(human)→요건 분석(aap)→스크리닝 계획·구성(aap)→★숏리스트 기준 승인(HITL①)→이력서 파싱·매칭·랭킹(aap, 병렬)→면접 일정 조율(HITL②)→★합격·오퍼 승인(HITL③)→공유·기록·학습(aap). **meeting 전용 '회의진행(시작/종료)' 메커니즘 미사용** — `meeting` step에 `meeting:1` 플래그를 주지 않고 `hitl:1`만 부여(면접 일정 '확인' 게이트로 대체). 회의 리스킨 탈피의 핵심. 〔표준·정의〕
- **5타입 구성요소 + 8계층 매핑** — Agent 6(이력서 파싱·요건 매칭·랭킹·면접 조율·평가 취합·후보 커뮤니케이션)·Module 3(OCR 정규화 AI:ON-U·편향 점검 Antbot·보상밴드 검증)·기존 솔루션 2(ATS·HRIS)·Connector 4(지원자 DB·메일·캘린더·메신저)·Policy 3(차별금지·PII·오퍼 승인 게이트). kt ds 자산=AI:ON-U(L5)·Antbot(L6)·Self-Improving(L7 학습). 〔표준·정의〕
- **결정론 더미 데이터(일관 숫자)** — 직무 JD-2041 백엔드 2명·지원 38→스크리닝 통과 6명. 후보 6명(이력서 요약·스킬·경력·매칭% 62~94·루브릭 5항목 종합점수). 숏리스트 3(엄격 컷=2)·면접 3슬롯(충돌 0)·오퍼 1(정유진, 밴드 내). 산출물(products): 직무 기술서·스크리닝 리포트·후보 비교표·면접 일정·오퍼 패키지. HITL '컷 좁히기' 선택 시 `ex` 플래그로 숏리스트/오퍼가 실제 축소(담당자 결정이 화면 반영). 〔표준·정의〕
- **시드 케이스 3건(서로 다른 상태)** — 백엔드 2명@숏리스트 기준 승인(검토대기)·프로덕트 디자이너@요건 접수(접수)·데이터 분석가@완료 → 통합 인박스에 채용 유형 배지로 등장. 〔기획·UX〕
- **아이콘** — `icons.js`에 Lucide path 9종 추가(briefcase·users·user·filter·gauge·trending-up·mail·award·graduation-cap), 전부 인라인 SVG·currentColor·이모지 0. surface는 코어가 innerHTML 주입(아이콘 하이드레이션 미적용)이라 `AAP_ICON.svg()`를 직접 인라인 호출(`I()` 헬퍼). `platform.css`에 `.recr-*`/`.rc-*`/`.rsc-*`/`.rjd-*`/`.cmp-*` 채용 전용 스타일 추가(5타입·상태 4색 토큰 재사용, 신규 hex 0). 〔기획·UX〕
- **검증(헤드리스 브라우저 = 환경상 셸/브라우저 실행 차단 → 미실측)**: 대체로 **node 정적·통합 검증**으로 확인. (a) 통합 검증 harness: 8단계 × {working/done} × {기본/ex} surface(head/base/cmodal) 렌더 0 에러 + 사용된 모든 `data-dlv`(jd·compare·report·schedule·offer)가 product로 해석(0 에러). (b) **minimal DOM shim으로 core.js 전체 부팅** → 통합 인박스에 채용 유형 배지·12행(3팩) → `CORE.load('recruiting')` → custHead에 직무명·`파이프라인` 탭, conBody에 **ATS 보드(`.recr-board`)+JD 스트립(`.recr-jd`)** 렌더, **회의 마크업(참석자·회의) 부재** 확인 → "회의 리스킨 탈피" 입증. (c) gate steps=approve·meeting·commit(HITL 3). (d) Design Contract 토큰(compose.cls·components.ty) 전부 enum 통과 → **부팅+케이스 열기 DC 경고 0·JS 에러 0**. (e) meeting/voc surfaceSpec·아이콘 전부 무회귀. **사용자/후속자가 file:// + `?type=recruiting`로 데스크톱 렌더(보드 점등·HITL 모달·스코어카드) 실측 필요(미실측).** 검증 스캐폴딩 `app/_recr_harness.js`·`app/_recr_dom_harness.js`는 index.html 미로드(런타임 무영향)이며 삭제 가능(셸 rm 차단으로 자동 삭제 못 해 1줄 노트로 비움). 〔데모 한정 검증〕
- **남긴 후속**: ① **시연 모드**(로드맵 §5·§6 2번) — 네비 '시연' 항목 + 시나리오 선택(첫=채용) + 가이드 투어 오버레이(운영 화면 위). ② **실작동 PoC**(Phase 3) — 이력서·JD 텍스트 입력 → 실제 LLM 파싱·매칭·랭킹(localhost·키 관리), 더미 데이터 자리 교체. ③ ATS 탭(후보/스코어카드/면접)이 현재 라벨만 — 탭 전환 시 보드↔스코어카드 리스트 전환 인터랙션. ④ 선언형 surfaceSpec 스키마에 board/table/scorecard 패턴 추가 검토(다른 도메인 재사용 시 — 현재는 함수형이 더 적합). 〔기획·UX/표준·정의 후속〕

### v0.32 (데모, 빌드 완료 · 260619)
> v0.31 위 ① 색 범례 위로 ② topbar 정리·컴팩트.
- **색상 범례(상태) = 우측 작동 흐름 최상단으로** — 하단 → `AAP 작동 흐름` 헤더 바로 아래 `.rg-leg.top`(배경 박스 + '상태' 라벨). 색을 먼저 보고 카드 점등 읽게. 〔기획·UX〕
- **topbar 제목·컴팩트** — 브랜드 = **"AAP 데모 (회의 업무)"**(기존 'AAP · 회의 업무 · 작동 원리 데모' ✕). 높이 54→42, 로고/폰트/패딩 축소. 개발자 보기·배속(0.5/1/2×)·Run 유지. 〔기획·UX〕

### app/ 구현체 — 디자인 v0.2b: 통합 인박스·카탈로그 + 격상 파이프라인 5단계 UX 정교화 (260619, aap-design) 〔기획·UX〕
> 골격(Phase 1.5 통합 인박스·Phase 2 pipeline·X1·8계층·HITL·자동저작) 무회귀, **시각만**. 작업 전 `_archive/app_v0_5_pre_design2/`에 app/ 전체 백업(8파일, Read+Write 수기 복사 — 환경상 셸 차단). Phase 2 후속 ④('aap-design 몫: 파이프라인 노드 그래프') 해소. 신규 hex 0(5타입·상태 4색·다크 맵 토큰만).
- **작업 B(핵심) — 격상 파이프라인 5단계 시각 정교화** (`core/pipeline.js`·`core/platform.css`):
  - **② 실행 구조 구성 = 다크 "엔진룸" 노드 그래프 신규**(`renderComposeGraph`) — `노드 그래프`/`편집` 토글(`.pl-cmp-toggle`, 기본=그래프). 캔버스=`#0b1220`+36px 그리드, **작업 노드(좌, 중립 다크)→구성요소 노드(우, 5타입 테두리·점 색)** 베지어 엣지(청록 opacity.4). 다크 위 가독성 톤(teal `#2dd4bf`·violet `#a78bfa`·cyan `#22d3ee`·blue `#60a5fa`·amber `#fbbf24`)·하단 5타입 범례. SVG는 viewBox 스케일·overflow auto. 기존 편집 목록은 `renderComposeList`/`wireComposeList`로 분리(골격 보존). 오케 v2 노드맵 차용, canonical 5타입 teal 정합.
  - **③ HITL 게이트 0개 = red 차단 강화** — 기존 amber empty → **red 차단 박스(`.pl-gate-block`)** + 푸터 경고 red(`.pl-warn.block`) + 다음 버튼 disabled(기존 골격 로직 유지). "자율=사람 통제점 전제"를 색으로.
  - **스텝퍼 위계 강화** — 5스텝 균등 분배 + `on` 단계 4px teal 글로우 링(`.pl-stp.on .pl-stn`)·완료 teal·대기 faint.
- **작업 A — 통합 인박스·카탈로그(Linear/Datadog 톤)** (`platform.css`): 진행률 바 색을 그룹 상태색과 동기화(`:has()` wait amber·run blue·done green)·검토대기 그룹 카드 옅은 amber 그림자(주목)·그룹 헤더 카운트 pill·카탈로그 HITL 스탯 amber 강조·유형 배지 색점.
- **아이콘** — `icons.js`에 Lucide path 3종 추가: `git-branch`(노드 그래프 토글)·`boxes`(② 구성 섹션)·`workflow`. 전부 인라인 SVG·currentColor·이모지 0.
- **검증** — 헤드리스 Chrome/Edge는 **환경상 셸 전면 차단으로 실행 불가**(서브에이전트 포함). 정적 검증으로 대체: 전 아이콘 정의 확인(미정의 아이콘 0)·`renderComposeGraph` `.plg-canvas`/`.plg-comp` emit·게이트 0개 `.pl-gate-block`+next disabled 로직·`M._cmpView` 비누수(initModel서 재생성)·3팩 무회귀(코어/팩 무변경). **사용자/후속자가 `?pipeline=1`로 ②③ 시각 + 데스크톱 렌더 확인 필요(미실측).**
- **가이드 갱신** — `04_디자인가이드/aap_platform_ui_design_guide_v0.1.md` §6.5 신규(운영 콘솔 IA·통합 인박스·격상 파이프라인 5단계 UX·다크 엔진룸 노드 그래프 규칙) + footer v0.2 노트.
- **남긴 후속**: ① **헤드리스 렌더 실측**(셸 차단 해제 시 ②노드그래프·③red차단·⑤dry-run 스크린샷). ② 노드 그래프에 hover 툴팁(구성요소 note)·작업 노드 클릭→해당 작업 comps 강조. ③ ⑤ dry-run에 노드 그래프 점등(현재 행 리스트). ④ 카탈로그 선택 유형 미리보기에도 노드 그래프 재사용 검토. 〔기획·UX 후속〕

### v0.31 (데모, 빌드 완료 · 260619)
> v0.30 위 ① 업무 순서 전체 노출 ② 상태 색 명확화 ③ 카드 정보 노출 방식 변경.
- **업무 순서 = 8단계 전부 1줄** — 직전/현재/다음 3노드 ✕ → 8개 균등(현재만 flex 1.7배·완료는 past 흐림), ellipsis. 〔기획·UX〕
- **상태 4색 명확화 + 점등** — 작동중/완료가 유사(둘 다 teal/green) → **작동중=파랑(#2563eb, 펄스 애니 `doingpulse`)·완료=초록·준비중=amber·대기=회색**. 대기→준비중→작동중→완료 전이 시 색 변화 뚜렷. `ST` 색값·`.rg-node`/`.rn-st`/lic 색 갱신. 〔기획·UX〕
- **읽는 데이터·결과 = 카드 면 → 클릭 모달로 이동** — 카드 줄바꿈 정렬 문제 해소·최대 컴팩트. **카드 면 = 타입/계층/상태 + 이름 + 한 줄 설명 + '데이터·근거·산출물' 링크**만. 모달에 `읽는 데이터`/`결과` 행(`.nm-io`) 추가(상세 capability ↔ io ↔ 판단 근거 ↔ 산출물). 〔표준·정의 + UX〕 *(§2 카드 표현 규칙 갱신 대상: 카드 면은 nm·desc·상태만, reads·out·ev·prod는 모달)*

### v0.30 (데모, 빌드 완료 · 260619)
> v0.29 위 밀도 컴팩션. 우측 영역 스크롤 최소화 목표.
- **우측 전체 밀도 ↑** — 패딩·여백·폰트 축소(rsec·rflow·ph·band·stages·card·trig·leg). 스크롤 최소. 〔기획·UX〕
- **업무 순서 헤더·Master 압축** — rsec 컴팩트 / **Master = 단일 줄**(이름 + 'sub' 인라인, `<br>` 제거). 〔기획·UX〕
- **'상시 적용' 화살표 DIV 제거** — 밴드 바로 아래 단계로(불필요 표식 삭제). 〔기획·UX〕
- **단일 카드 가운데 정렬** — stage에 컴포넌트 1개면 `.cards-row.solo{justify-content:center}` (예: 회의록 실시간 정리). 〔기획·UX〕
- **버그 수정**: 단계 순서 화살표가 업무순서 nav와 **`.seq` 클래스 충돌** → 단계 화살표를 **`.seqar`로 분리**(nav 레이아웃 복구). 〔데모 한정〕

### app/ 구현체 — Phase 2: 프로세스 → 자율운영 격상 파이프라인 (260619, aap-platform)
> 로드맵 Phase 2 구현. '업무 학습'(지식 축적)을 넘어 **AI가 프로세스를 분해하고 실제 자율 운영 수준으로 격상(HITL 필수 포함)**시키는 5단계 파이프라인. 수동 빌더 ✕ → AI 제안 + 사람 검토·수정·승인. 분해 엔진=**결정론 시뮬**(file:// 유지), 실제 LLM은 Phase 3에서 함수 경계 교체. 작업 전 `_archive/app_v0_4_pre_pipeline/`에 백업. Phase 0+1+1.5·X1·Lucide·기존 자동저작 무회귀.

- **신규 모듈 `core/pipeline.js`(코어 책임 · 도메인 무관)** — 5단계 격상 UX + 교체 가능 제안 엔진. `index.html`에 `<script>` 추가(authoring.js 뒤 → `AAP_AUTHOR` 의존). 상단 버튼 라벨 `업무 학습`→**`업무 격상`**(rocket 아이콘). `authBtn`은 `AAP_PIPELINE` 있으면 파이프라인, 없으면 기존 자동저작 오버레이로 폴백(무회귀). 파이프라인은 기존 `#authoring` 오버레이 셸을 재사용. 〔기획·UX〕
- **5단계 파이프라인** — ① **이해·분해(Breakdown)**: 텍스트→단계·작업·필요데이터·**결정점·리스크** 분해(genericAuthor보다 풍부, 작업별 속성 도출) ② **실행 구조 구성(Compose)**: 작업별 **5타입 매핑 자동 제안 + 사람이 타입(select)·이름·추가·삭제 수정**, 타입별 합계 실시간 재계산(5타입 색 칩) ③ **HITL 배치(Gate) ★필수★**: 외부 영향·시스템 반영·책임 판단 결정점에 게이트 자동 제안 + 사람 추가/제거, **게이트 0개면 다음 버튼 disabled + 경고(진행 차단)** — 8단계 캐논 매핑 시각화 ④ **격상·검증(Operationalize)**: 8단계 캐논 Pack 조립 + 거버넌스 4종 + **검증 체크리스트**(게이트=hard 항목·외부액션 통제·Policy·데이터 출처·Run Trace) ⑤ **시운전→승격(Promote)**: 샘플 케이스 **dry-run**(8단계 재생) → 완료 후 **"운영 중 승격"** = `AAP_CORE.register`+`load`로 새 유형 편입·시드 케이스 1건. 〔기획·UX/표준·정의〕
- **HITL first-class 강제** — ③ 게이트 0개 → ④⑤ 진행 불가(`plNext` disabled + `.pl-warn`). "자율=사람 통제점 정의가 전제"를 UX로 강제. 게이트는 work step의 `hitl`/`gate` 플래그로 캐논 런타임에 반영(approve/commit 매핑). 〔표준·정의 + 기획·UX〕
- **교체 가능 함수 경계(Phase 3 LLM 교체 지점)** — `proposeBreakdown(text)`·`proposeCompose(bd)`·`proposeGates(bd)`·`buildChecklist(M)`를 **순수 함수**로 분리(부수효과 0, 입력→제안 데이터). 현재는 한국어 키워드 사전(external/write/risk/data/decide) 기반 결정론 규칙. `window.AAP_PIPELINE`로 노출 → 실제 LLM이 같은 시그니처로 교체 가능. 〔표준·정의〕
- **출력 = 기존 Domain Pack 스키마(재사용)** — `authoring.js`의 `genericAuthor(text,opts)`에 오버라이드 인자 추가(`compose`/`components`/`gates`/`gateSteps`/`seeds`/`id`/`label`/`title` 등) + `window.AAP_AUTHOR={genericAuthor,od,SOURCES,PIPE}` 노출. 파이프라인이 사람 수정(구성·게이트)을 반영해 genericAuthor로 최종 Pack 조립 → 코어 `normalizePack`이 X1 토큰 정규화 → 통합 인박스·카탈로그·필터에 새 유형 자동 편입(`typeTok` 자동 배정). 〔표준·정의〕
- **코어/팩 경계** — 코어(core.js) 무변경(register/load/normalizePack/typeTok 그대로 재사용). 파이프라인 로직은 전부 pipeline.js, 골격 빌더는 authoring.js. 신규 Lucide 아이콘 8종(layers·split·rocket·shield-check·pencil·trash·database·sparkles)을 icons.js에 추가. platform.css에 `.pl-*` 스타일(5타입 색·상태 4색 토큰 재사용, 신규 hex 0). 〔기획·UX/표준·정의〕
- **검증(헤드리스 Chrome CDP · 무-deps 드라이버)**: (a) ① 분해=작업4·신호5·결정점3·리스크4 (b) ② 구성=타입select 10·5타입바, 타입 변경 시 합계 실시간(Policy 3) (c) ③ 게이트 제거→empty+warn+next disabled, 추가→게이트1+next enabled (d) ④ 체크리스트5·verdict 산출·next enabled (e) ⑤ dry-run 7행→promote 노출→**packKeys 2→3**·인박스 칩4/행7·카탈로그 카드3 (f) 새 유형 케이스 run뷰 자동 진입(caseTitle '신규 거래처 등록 심사 업무 · 시운전 #1') (g) 기존 팩 무회귀(localStorage clear 후 meeting+voc·인박스6행·칩3)·**JS 에러 0·Design Contract 경고 0**. 〔데모 한정 검증〕
- **남긴 후속**: ① Phase 3 = 실제 **LLM 연동**(`proposeBreakdown/Compose/Gates` 자리 교체 · localhost·키 관리). ② **자동저작 팩 영속화** — 현재 promote된 팩은 register만 되고 비영속이라 reload 시 케이스 고아화(코어 안전 폴백으로 숨김). Domain Pack 직렬화(work/ops 함수 제외 데이터화)·boot 시 register 자동 복원 설계 필요. ③ 분해 품질(현 캐논 4단계 골격 고정) — 단계 수 가변·작업 그래프 편집·op 단위 5타입 매핑은 후속. ④ aap-design 몫: 파이프라인 전용 노드 그래프(오케 v2 차용)·분해→구성→게이트 플로우 시각 정교화. 〔기획·UX/표준·정의 후속〕

### v0.29 (데모, 빌드 완료 · 260619) — ★표준화 반영 대상
> 사용자 승인 "이대로 데모에 반영". 우측 작동 영역 = 비교 샘플에서 고른 **3안 하이브리드**로 전환. **표준 문법 명세는 §2 '★우측 작동 영역 구조 문법(v0.29)' 참조**(표준화 agent 1차 반영 대상).
- **3계열 레이어 분리** — 상시·배경 레이어(밴드, 상수) / 단계 컴포넌트(병렬=같은 줄·순서=↓) / 맥락 변화 트리거(조건부). 한 방향 트리(Master→branch) 폐기. 〔표준·정의 + UX〕
- **컴포넌트 스키마에 `nm`·`desc`·`reads` 추가** — 카드에 평이한 한 줄 설명 + 읽는 데이터/결과 같은 줄(같은 칩). `fn`→`nm`, `pull`→`reads`. 〔표준·정의 + UX〕
- **상시 op를 배경 레이어로 승격** — 기존 per-step `live`(가드레일 모니터·민감발언감시)를 상시 밴드(가드레일·감사로그)로 이동, WORK에서 제거. 〔표준·정의〕
- **밀도 가변 원칙 명문화** — 단계별 컴포넌트 수 가변(준비 6/이해 3), 상시·트리거 상수. 〔표준·정의〕
- **텍스트 최소화** — 순서='↓'만(텍스트 제거)·'상시 적용' 짧은 패널·구조 캡션 최소. 〔기획·UX〕
- 구현: `BG`/`TRIG` 상수, `compNode`=컴팩트 카드(header/nm/desc/foot), `renderRight`=Master+밴드+상시화살표+`stages`(병렬/순서)+트리거레인, 노드 모달 `nm` 타이틀. 〔데모 한정 구현〕

### app/ 구현체 — Phase 1.5: 통합 인박스 (도메인=유형 속성으로 강등) (260619, aap-platform)
> 로드맵 Phase 1.5 구현. 도메인 팩 셀렉터(모드 전환)는 데모 잔재 → **도메인 = 화면을 가르는 모드 ✕ → 각 케이스의 유형(packId) 속성 ✓**. 작업 전 `_archive/app_v0_3_pre_unified_inbox/`에 백업. Phase 0+1·X1·Lucide 무회귀.

- **통합 인박스(전 도메인 한 곳 · 상태 × 유형 2축)** — `core.js renderInbox()`를 `c.packId===APP.pack`(활성 도메인만) → **전 팩 케이스 통합**으로 재작성. 각 행에 유형 배지(팩 label), 상단에 **유형 필터 칩**(전체/회의/VOC/…)+건수, 기존 상태 그룹(접수/진행/검토대기/완료) 유지. `navCnt`(인박스 카운트)=전 유형 검토대기 합. `APP.typeFilter` 영속. 케이스 상태/진행률은 그 케이스의 `PACKS[c.packId]` 기준 산출(활성 PACK 비의존 — 이미 정합). 〔기획·UX〕
- **유형(도메인) → 색/배지 토큰 매핑(코어 책임 · 임의 hex ✕)** — `typeTok(packId)`가 5타입 디자인 토큰 팔레트(`tA` teal·`tM` violet·`tS` cyan·`tC` blue·`tP` amber)를 **등록 순서로 안정 순환 배정**. 팩은 메타(label·id)만 제공, 색은 코어가 결정. `typeBadge()`/`typeLabel()` 헬퍼. CSS `.ty-badge.tX`·`.ty-chip.tX`·`.cat-card.tX`는 기존 5타입 색 변수 재사용(신규 hex 0). 〔기획·UX/표준·정의〕
- **도메인 셀렉터(모드 전환) 강등 폐지** — `index.html` 상단 `packSel` 드롭다운 제거(브랜드 부제 '통합 인박스'). `core.js` `switchPack()`·`addPackOption()` 삭제, `packSel` onchange 와이어링 제거. 런타임 컨텍스트는 **케이스 열 때 그 `packId`로 `setPackRefs`**(openCase 기존 로직 유지+미등록 팩 가드 추가). 〔기획·UX〕
- **＋새 업무 요청 = 유형 선택** — `createCase(packId)`가 유형 인자 수용(미지정 시 현재 필터 유형→런타임 팩→첫 팩 순 폴백, `_newSeq`를 팩별 카운터로). `promptNewCase()`=유형 2개↑면 유형 선택 팝오버(`.nc-menu`), 1개면 즉시 생성. `newCaseBtn` 와이어링 교체. 〔기획·UX〕
- **'도메인' 네비 → 업무 유형 카탈로그/레지스트리** — `renderDesign()`을 모드 스위치 ✕ → **카탈로그**로 재정의: 등록된 전 팩을 카드 그리드(`#catGrid`)로(유형 배지·자동저작 뱃지·단계 수/구성요소/HITL/인박스 건수), 카드 클릭 시 `APP.catSel` 설정 → 그 유형의 **실행 구조 미리보기**(기존 waBox/composeGrid/planTable/gatebar/archMap 흡수). `renderPlan(P)`·`renderArchCoherence(P)`에 팩 파라미터 추가(기본=활성 PACK, 하위호환). `index.html` 도메인 뷰에 카탈로그 헤더+미리보기 타이틀 추가. 〔기획·UX/표준·정의〕
- **자동저작 연동(register/load)** — `AAP_CORE.register`가 `addPackOption`(드롭다운) 대신 `typeTok` 배정 + 현재 뷰가 인박스/도메인이면 즉시 재렌더 → 새 팩이 카탈로그·인박스·필터에 자동 편입. `load`는 `seedPack`+첫 케이스 `openCase`(없으면 `createCase(id)`) 유지. 〔기획·UX〕
- **영속 마이그레이션/안전 폴백** — 신규 LS 키 `typeFilter`(폴백 'all')·`catSel`. 옛 `pack` 키는 '모드'→'런타임 컨텍스트'로 의미만 변경(무해). **미등록 유형 케이스**(자동저작 팩은 비영속)는 인박스에서 숨김+`openCase` 가드(저장은 보존, 삭제 ✕). `?type=` 딥링크 추가. 〔기획·UX〕
- **검증(헤드리스 Chrome + Edge)**: (a) 통합 인박스 회의3+VOC3=6행·tA/tM 배지 (b) 유형 필터 `?type=voc`→3행·VOC칩 active (c) 케이스 열기→해당 유형 런타임(authoring quality→seq 3노드) (d) 새 업무 유형선택 (e) 도메인 카탈로그 2카드+미리보기 plan 8행 (f) 새로고침 영속 6행 복원+미등록 quality 폴백 숨김 (g) 자동저작 register/load 런타임 진입 (h) **JS 콘솔 에러 0·Design Contract 경고 0**. 〔데모 한정 검증〕
- **남긴 후속(Phase 2 격상 파이프라인)**: 새 업무 요청은 현재 기존 팩 템플릿 인스턴스 생성까지만 — 로드맵 Phase 2(이해·분해→구성→HITL 배치→격상·검증→시운전·승격)와 연결 필요. 자동저작 팩 **영속화**(현재 비영속이라 reload 시 케이스 고아화) 시 Domain Pack 스키마 직렬화·register 자동 복원 설계 필요. 케이스 상세(인박스↔실행 중간) 화면·유형별 SLA/카운트 대시보드는 후속. 〔기획·UX 후속〕

### app/ 구현체 — 디자인 v0.2: Lucide 아이콘 시스템 + 운영 콘솔 시각 정교화 (260619, aap-design)
> 골격(aap-platform Phase 0+1) 무변경, **시각만**. 작업 전 `_archive/app_v0_2_pre_design/`에 백업. UI 디자인 가이드 v0.1 준수(teal 주색·5타입 색·상태 4색·라이트 표면).

- **Lucide 아이콘 시스템(인라인 SVG · 외부 라이브러리 0 · file:// 동작)** — 신규 `app/core/icons.js`에 Lucide 0.x 표준 path를 *필요한 것만* 임베드(inbox·play·square·shield·puzzle·brain·calendar·check(-circle)·plus·clock·alert-triangle·flag·star·chevron 3종·arrow 2종·rotate-ccw·x·compass·folder·settings·cpu·file-text·list 등 ~30종). `window.AAP_ICON.svg(name,opt)` 헬퍼 = `viewBox 24` · `stroke=currentColor` · `stroke-width 1.75` → 5타입 색·상태색을 CSS `color`로 상속. CDN/npm 0. 〔기획·UX〕
- **이모지 → SVG 교체(코어 시그니처·로직 보존)** — `index.html` 정적 chrome(네비 4종·Run·새 업무·업무 학습·Master 카드·compose-note·자동저작 닫기/＋)은 `[data-ic]` 속성 + `AAP_hydrateIcons()`(DOMContentLoaded 1회)로 주입. `core.js` 런타임 렌더(seq chevron·gate star·replay·op-more chevron·rarrow·sel 플래그·hd-user·cmodal x/back/check·dn-ic·ibx-go·registry 메타 compass/folder/settings·meetingStart play)는 `_ICO()` 헬퍼로 emit. Run 버튼 토글은 `setRunBtn(running)`(play↔square + 라벨)로 일원화 — 기존 `textContent='▶ Run'/'■ 중지'` 4곳 대체(SVG 유지). 팩 데이터 중 충돌 이모지(meeting `btn:'▶ 회의 시작'`·`endBtn:'■…'`)만 라벨 정리. 케이스 아이콘(`c.icon`)·SS.icon 등 도메인 데이터 이모지는 *유지*(코어가 강제하는 chrome만 표준화). 〔기획·UX〕
- **운영 콘솔 시각 정교화(가이드 토큰 준수)** — `platform.css`: ①네비 = 아이콘 muted→hover slate→active teal + 활성 좌측 3px teal 인디케이터(F-패턴) ②인박스 = 상태 그룹별 행 좌측 보더(wait amber·run blue·done green·new 회색, `:has()` 선택자)·go chevron hover 이동 ③실행 = seq chevron/star·replay·op-more chevron·rarrow 아이콘 정렬 ④HITL/결과 모달 = x/back/check 아이콘 + LIVE `.live-dot`(blink) ⑤관리 = Master brain·Registry 메타 아이콘(언제=amber compass·데이터=green folder·방식=teal settings, 의미 색 유지) ⑥**컴포넌트 타입 색점(§5.9)** = Registry `.ag-type`·실행 `.casm .ct2`에 `::before` currentColor 색점 추가 → "조합된 구조" 신호 강화. 라이트 표면 유지(다크 맵 없음). 〔기획·UX〕
- **검증(헤드리스 Chrome + Edge)**: 인박스(네비 SVG·이모지 0·행 3건)·도메인(compose-note·sel 플래그 SVG)·관리(Master brain·Registry 메타 56 SVG·타입 배지)·실행(seq/replay/Run 버튼 SVG·op 흐름 17카드)·케이스 전환 3건(HITL/결과 모달 cmodal-x SVG·cp-btn) 전부 OK. **JS 콘솔 에러 0 · Design Contract 경고 0 · `${_ICO` 리터럴 누출 0**. 3팩/케이스/영속 무회귀. 〔데모 한정 검증〕
- **남긴 후속**: UI 디자인 가이드 v0.1에 "아이콘 = Lucide 인라인 SVG(currentColor 상속)" 절 추가. Phase 2 빌더 도입 시 팔레트·노드 그래프 아이콘 확장(icons.js에 path 추가). 도메인 데이터 이모지(케이스/SS.icon)도 표준화하려면 팩 스키마에 icon-token 도입 필요(합의 후). 〔기획·UX 후속〕

### v0.28 (데모, 빌드 완료 · 260619)
> v0.27 위 사용자 4지시(narration·재생·컴팩트·모달) 반영. 데모 한정 UX 다듬기지만 ②모달 구조·③밀도는 app/ 화면 계약에 시사점.
- **narration = 매 단계 + 좌측 화면 강조** — 첫 단계·우측에만 뜨던 것 → 매 단계 좌측 고객 화면(`.cscreen`, HITL은 화면 속 모달 카드) spotlight + 말풍선은 화면 오른쪽 틈에. 〔기획·UX〕
- **Run = 현재 단계부터 재생**(맨 처음 ✕) + **속도 0.5×/1×/2×**(느리게)+기본 타이밍 ↑(reveal 700→1000·dwell 1700→2600). 〔기획·UX〕
- **비재생 = 탐색 가능 상태** — 업무 순서 클릭/직접 보기 시 해당 단계를 '완료(정착)'로 렌더(자동 애니·결과 모달 ✕)해 카드·노드 직접 클릭. 재생만 애니메이션. 〔기획·UX〕
- **우측 노드 컴팩트** — footer 1줄(데이터 pull + '근거·산출물' 우측 링크)로 합쳐 카드 높이↓·여백↓, 그룹/엣지/트리 간격 축소. '비어 보임' 완화. 〔기획·UX〕
- **노드 모달 구조화** — 타입·계층·상태·capability가 한 줄에 섞이던 것 → **정체성 행(구성요소/계층/상태 라벨)** + **상세 capability(별도 라벨 칩 행)** + 판단 근거(4유형) + 산출물(3유형)로 분리. 〔표준·정의 + UX〕

### v0.27 (데모, 빌드 완료 · 260619)
> Reference Runtime Instance `aap_meeting_runtime_builder_v0_27.html`. 우측 작동 흐름을 '원형 노드+입자 애니'에서 **'구성요소 타입·상태·근거가 보이는 실제 작동 구조'**로 심화. ※ app/ 구현체의 'Lucide 아이콘·타입 색점' 후속(Phase 2~)과 직접 연결 — 아래 항목 시각 규칙은 aap-design/aap-platform가 그대로 차용 가능.
- **구성요소 타입 노출** — 우측 노드를 6타입(**Agent·Module·상용 솔루션·고객 시스템·Connector·Policy**)으로 구분, **타입 라벨 + Lucide 아이콘**(색 과용 ✕, 라벨 중심 — 사용자 선택). 'AI로 프로세스 breakdown 시 무엇을 Agent로/무엇을 솔루션·고객 시스템으로 둘지' = 사업화 전략 축이자 key message. 〔표준·정의 + UX〕
- **상태 5종** — 대기·준비중·작동중·완료·**상시(background/live)**. 그룹 진행 + `op.live` 플래그로 산출. 가드레일 모니터·실시간 STT·민감 발언 감시 = 상시. (오케 v2 ③라이브/⑤데이터흐름의 '대기·background' 반영) 〔표준·정의〕
- **데이터 = 컴포넌트별·시점별 pull** — 고정 '입력 데이터' 블록 폐기 → 각 노드가 당기는 데이터를 칩+상태점으로(상시 데이터 cyan). 단계마다 참조 데이터·당기는 시점이 다름을 표현. 〔기획·UX〕
- **단계별 컴포넌트 다수** — 한 단계 2~3 레이어 ✕ → 여러 레이어 동시(준비 7·회의 4 등), 병렬은 A2A 묶음. 〔표준·정의 + UX〕
- **노드 클릭 → 근거·산출물 모달** — 근거 4유형(참조 데이터·조회/대조·규칙/정책·판단 로직) + 산출물 3유형(문서/자료·안내/메시지·시스템 반영) 색 라벨 섹션. *app/의 op `detail` → 구조화 rows 승격(§5 X1 '남은 범위')과 정합 — 이 4+3 유형이 그 rows 스키마 후보.* 〔표준·정의〕
- **Lucide 라인 아이콘** 도입(디자인시스템 §9: 1.5px·16/20/24px), 우측 이모지 제거. 〔기획·UX〕
- **좌측 디-챗봇** — '업무 어시스턴트' 문구 삭제 → 포털 nav(홈·회의·문서함·승인) + heading(말풍선 ✕) + 요청 echo. 〔기획·UX〕
- **업무 순서 미니멀** — 직전/현재/다음 = 번호+라벨만(role 줄 제거). 〔기획·UX〕

### app/ 구현체 — Phase 0+1: 운영 콘솔 셸 + 영속성 + 인스턴스성 (260619, aap-platform)
> 로드맵 `aap_platform_to_runtime_roadmap_v0_1.md` Phase 0·1 구현. "각본 재생 뷰어" → "업무를 여러 건 받아 굴리는 운영 콘솔". 작업 전 `_archive/app_v0_1_pre_console/`에 현행본 백업.

- **운영 콘솔 IA (Phase 0)** — 상단 3뷰 토글(구성/실행/관리) 제거 → **좌측 글로벌 네비**(인박스 / 실행 / 관리 / 도메인). 구 `design` 뷰는 **도메인(Domain)** 뷰로 흡수(렌더 로직 `renderDesign` 보존). `index.html`에 `.shell`(좌 `.gnav` + `.views`) 추가, `setView()`가 nav 하이라이트·뷰 전환·상단 케이스 타이틀 갱신. **빌더는 Phase 2이므로 미구현**(네비에도 없음). 〔기획·UX〕
- **localStorage 영속 (Phase 0)** — 네임스페이스 `aap.v1.*`(cases·active·view·pack). `loadApp/saveApp/lsGet/lsSet`, 손상·없음 시 안전 폴백. 케이스의 sel·decisions·pickedTime·meetPhase·trace·done 전부 잔존 → 새로고침 후 boot가 `APP.active`·`view`로 실행 콘솔 복원. **코어 책임**(팩 스키마 무변경). file:// 안정 user-data-dir 기준 reload 영속 검증됨. 〔기획·UX + 표준·정의〕
- **업무 인박스 (Phase 1)** — 들어온 요청을 상태별(검토대기/진행/접수/완료) 그룹·진행률 바·상태 배지로 표시(`renderInbox`). 행 클릭 → `openCase()` → 해당 케이스 실행 뷰. 네비 인박스에 검토대기 건수 배지. 상태색=상태 4종 토큰(new 회색·run blue·wait amber·done green). 〔기획·UX〕
- **케이스 = 인스턴스 (Phase 1)** — 팩당 단일 하드코딩 case → **케이스 객체 배열**(`APP.cases`). 각 케이스가 독립 런타임 슬라이스(sel·decisions·pickedTime·meetPhase·trace·traced·done). `STATE`는 "현재 열린 케이스의 뷰"로 재정의 — `hydrateFromCase`(케이스→STATE)·`persistToCase`(STATE→케이스, 변경 직후 `afterStateChange`로 호출). 〔표준·정의〕
- **케이스 템플릿·시드 (Phase 1)** — `caseTemplate(pack,seed)`가 팩의 `workload`/`surfaceSpec`에서 케이스를 자동 도출(**코어가 도출, 팩은 데이터만**). 새 팩 스키마 = 선택적 `seeds:[{title,customer,icon,request,atStep,status}]` 1필드만 추가. meeting·voc 각 3건 시드(검토대기/접수/완료). `＋ 새 업무 요청`(`createCase`) = 활성 팩 템플릿으로 신규 인스턴스 생성→인박스 추가→실행 투입. 〔표준·정의 + 기획·UX〕
- **코어/팩 경계** — 인박스·케이스·영속성·상태 도출은 전부 `core.js`. 팩 변경은 `seeds` 1필드 추가뿐(없어도 단일 기본 케이스로 동작). X1 계약(`normalizePack`/`DC`)·8계층 흐름·HITL·자동저작(`AAP_CORE.register/load/go`) 무변경(load는 시드 후 첫 케이스 열기로 데모 연속성 유지). 〔표준·정의〕
- **검증(헤드리스 Chrome + Edge)**: 인박스 3건 렌더 / 케이스 열기→실행 뷰(seq·caseTitle) / 새 케이스 추가 / pack 전환(meeting↔voc 인박스 무회귀) / **reload 후 run 뷰·진행 step 영속 복원**(`restored_sel=prepare`) / domain·govern 뷰 무회귀 전부 OK. 〔데모 한정 검증〕
- **남긴 후속**: Phase 2 = 실행 구조 **빌더**(COMPOSE 읽기전용→편집·팔레트·노드 그래프). Phase 3 = **실행성**(더미 setTimeout→결정론 엔진·LLM·커넥터, localhost·키 관리 별도 결정). 디자인 정교화(Lucide 아이콘·인박스/케이스 상세 Linear·Datadog 톤)는 aap-design 후속. 〔기획·UX 후속〕

### app/ 구현체 — X1 선언형 화면 디자인 계약 (260619, aap-platform)
- **코어가 디자인 토큰을 강제** — `app/core/core.js`에 enum 토큰 레지스트리 `DC` + 정규화 함수(`dcTypeKey`/`dcStatusCls`/`dcEmph`/`dcText`) + `normalizePack()`(load 시 1회) 추가. 팩이 emit한 `compose[].cls`·`components[].ty`·`surfaceSpec.status[*][1]`을 정규 클래스(tA~tP / s-info·s-amber·s-green·s-blue·s-red)로 인플레이스 치환·검증, 위반 시 안전 폴백+`console.warn`. `app/core/platform.css`에 `.s-red` 추가. 〔표준·정의〕 *목적: AI가 emit하는 surfaceSpec 화면도 5타입 색·상태색을 자동 준수 → 자유 hex·임의 클래스 차단.*
- **검증**: meeting 등 기존 3팩 무회귀, 불량 팩은 폴백+정확한 warn(헤드리스). 〔데모 한정 검증〕
- **남은 범위(스키마 변경 필요 → 합의 후)**: op `detail`을 사전빌드 HTML 문자열 → 구조화 rows 배열로 승격해야 g/a/r 강조 강제 가능 / 밀도(주액션≤5·카드 1스타일) 실제 카운팅 강제(현재 `MAX_PRIMARY` 정보성 가드만). 〔표준·정의 + 기획〕
- 짝 작업(aap-design 몫): 위 enum 토큰에 대응하는 시각 규칙(타입 색점·범례·여백 30~40%·카드 1스타일)을 UI 가이드 §5.9/§4.1로 매핑. **골격(이 항목)→시각 순서.**

### v0.26 (빌드 완료 · 260619)
- **우측 흐름 = 노드 그래프 + 데이터 입자 흐름** — 입력·Master·Agent·모듈·데이터·산출물 노드 + 엣지 따라 데이터 입자 흐름, A2A 핸드오프. 〔기획·UX〕 (참고: 오케 v2 ⑤ 데이터 흐름·③ 라이브 동작 탭의 동적 연계 느낌)
- **컴포넌트 칩 = 선제안서 v0.7 상세 capability**, 현재 단계가 쓰는 것만 노출. 임의 sub-element ✕. 〔표준·정의〕
- **레이어 구체 표기**(L5 → "L5 데이터·연동"). 〔표준·정의〕
- **kt ds 자산 Self-Improving 제외**(나머지 4종 유지), 설명 범례 줄 비표시·asset 칩 포맷만. 〔표준·정의〕
- **좌측 콘솔 축소 + 사이드바 메뉴 제거 → 기본 기업 포털**(헤더+챗). 우측 공간 확대. 〔기획·UX〕
- **칩 타입 체계 normal/asset/partner/outcome** 적용·노드 컴팩트화(빈 공간 제거). 〔표준·정의 + UX〕

### v0.25
- 좌 = **kt ds 업무 포털**(사이드바 메뉴+챗 메인+AI 입력바). 〔기획·UX〕
- 우 = **단계별 실행 흐름 그래프**(입력→컴포넌트[내부 동작]→산출물, 상태 점등·데이터 토큰). 〔기획·UX〕
- **3뷰 토글·design/govern 삭제**(플랫폼✕ 작동 원리 데모). 〔기획〕
- 속도 조절(1×/2×) + Run 단계별 커서·툴팁 narration. 〔기획·UX〕
- 모달 확대(540)+버튼 중앙. 〔데모 한정〕

### v0.24
- 우측 8계층 레이어 묶음 + 현재 레이어만 ①업무②근거③판단④결과. 〔기획·UX〕 *(v0.26에서 노드 그래프로 대체)*
- **kt ds 자산 정정**: BEAST=AI·API 게이트웨이 · Antbot=RPA · AI:ON-U=AI 서빙 (Antbot=품질평가 오배치 폐기). 〔표준·정의〕
- 가이드=8 업무 단계 순회. 〔기획·UX〕

### v0.23
- 좌=고객 서비스 화면(코파일럿 포털)·2px 테두리 / 우=업무순서+8계층 2단. 〔기획·UX〕
- **HITL = AAP 추천 + 필수(🔴)/선택(⚪) 디자인 구분 · 중립 확정 · 회의 진행 자동**. 〔표준·정의 + UX〕
- 'AAP가 ~중→완료' working 모달('병렬 진행' 표현 폐기). 〔데모 한정〕

### v0.20~v0.22 (압축)
- **8단계 캐논 흐름 + HITL 3개**(→ v0.23에서 2개·회의 자동으로 조정). 〔표준·정의〕
- **구성요소 5타입(Agent·Module·기존 솔루션·Connector·Policy) 조합**이 실행 구조 — Agent 만능 ✕. 〔표준·정의〕
- 업무 순서 = 직전/현재/다음 3노드. 〔기획·UX〕
- 산출물·HITL = 화면 속 인-콘솔 모달, 콘솔 무스크롤. 〔기획·UX〕
- key message(무조건 준수): **AAP는 Agent 많이 띄우는 시스템 ✕ → 업무 이해→실행 구조 구성→구성요소 조합으로 운영 가능한 업무 흐름 만드는 플랫폼**. 〔표준·정의 + 기획〕

---

## 6. 참조
- 표준 스펙: `aap_platform_form_spec_v0_1.md` · `aap_runtime_expansion_strategy_v0_1.md` (같은 폴더)
- capability·칩 원천: `01_선제안서/aap_proactive_offering_v0.7_260616.html` (`DEFAULT_ARCH_CHIPS`, `CHIP_TYPES`)
- 현행 데모: `03_프로토타입/D_회의/aap_meeting_runtime_builder_v0_36.html` (좌측 = 기업 포털 홈 대시보드 / 우측 = 3안 하이브리드 컴팩트, 8단계 1줄·4상태 색·카드 면[caps≤3]+모달·상태 범례 상단·topbar 'Agentic AI Platform 데모 시연(회의업무)'·narration 커서→버튼·검정 툴팁 ×닫기·rg-expl 중복 해소, §2 구조 문법)
- 우측 레이아웃 비교 샘플: `03_프로토타입/D_회의/_sample_우측레이아웃_A_B_v0_1.html`
