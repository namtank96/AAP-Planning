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
- 현행 데모: `03_프로토타입/D_회의/aap_meeting_runtime_builder_v0_32.html` (우측 = 3안 하이브리드 컴팩트, 8단계 1줄·4상태 색·카드 면 슬림+모달 상세·상태 범례 상단·topbar 'AAP 데모(회의 업무)' 컴팩트, §2 구조 문법)
- 우측 레이아웃 비교 샘플: `03_프로토타입/D_회의/_sample_우측레이아웃_A_B_v0_1.html`
