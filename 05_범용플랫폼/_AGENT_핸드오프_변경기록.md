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
- 현행 데모: `03_프로토타입/D_회의/aap_meeting_runtime_builder_v0_28.html`
