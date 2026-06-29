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

### 렌탈 콘솔 v0.4 P1 — 실서비스급 전환(가로 스텝·HITL 상태기계·실행 write-back·예외) (260629, 유저 지시·승인) 〔데모〕
> `03_프로토타입/G_렌탈/aap_rental_콘솔_v0_3.html`만. 유저: "임원·실무자가 직접 시험 → 선별 기능 진짜 동작·깨지면 안 됨". **0. 깨짐 원인=내 디자인 아님**: 다른 세션이 `app/`→`_archive/app_260629/` 아카이브하며 콘솔의 `app/core/platform.css` 링크 死 → 셸 CSS 전부 404. **`maestro/core`로 링크 수정**(3개)해 정상화. (헤드리스 JS 미실행도 같은 류 — file:// URL 백슬래시 인코딩 버그, `replace(/\\/g,'/')`로 해결 → Chrome 헤드리스 스크린샷 검증 복구). **1. P1 빌드(승인된 비전)**: UX=상단 가로 탭+단일 패널(유저 선택). ①케이스 워크플로우 **상태기계** `c.wf{approved,picked,executed,record}`·`wfStage`/`loopStatus(c,i)`(done/cur/lock/block)·`isApproved`(auto=계획승인 자동통과). ②**가로 스텝**: `renderCase`가 `stepTab`×7(상단 진행바)+`stepPanel`(‹이전 다음›) 렌더, 세로 레일 폐기. 단계별 패널 압축(스크롤↓). ③**HITL 실제 강제**: 계획 승인(`btnApprove`)·정산 수준 결정(`btnDecide`, review/uncertain=picked 필수)·발송 승인(`btnCommit`→`executeCase`가 계약시스템 레코드 write-back)·미충족 단계=`lockedBody` 잠금. ④**예외 verdict `uncertain`**(4째 케이스 RT-3201, `regionClaimed&&!regionVerified`→'담당자 판단 필요'·AAP 추천 없음). ⑤**3 유입 경로** `c.src`(auto 계약시스템/legacy 레거시 연동/request 사용자 요청)·`srcBadge`·인박스 표기·FDE생성=request. ⑥**결정 내역** `decidedChips`(승인·정산수준·실행효력) 헤더 상시. 검증(Chrome 헤드리스, 4 verdict): review→계획확인 게이트 안착·auto→계획승인 자동통과·발송확인 안착·승인 후 정산산정(산식·3안·시뮬·판정·write-back 미리보기)·실행 완료(전 탭 done·결정칩3·계보)·uncertain violet pill·미납 reject 차단·**page error 0**. **차기 P2~P4**(미완): P2 자연어→케이스+FLOW 생성강화 / P3 단계별 상세 근거모달 가로 페이지네이션+규정·연동 클릭 편집+온톨로지 노드 확대 / P4 다른선택·실시간변동·유사케이스 종합→추천+시뮬+변동설명모달. **의존성 주의**: 콘솔이 `maestro/core/*` 참조 → maestro 세션이 platform.css 클래스/경로 변경 시 콘솔 셸 영향(좌표: 링크 3개).

### maestro 배포 팩 5종 도메인 온톨로지(L4) 추가 — 도메인별 객체·관계·단계별 사용 (260629, 유저 지시·aap-platform) 〔기획·UX·표준〕
> `maestro/packs/`만(core·라이브 아카이브·렌탈·app/ 미접촉). recruiting 1개뿐이던 `ONTOLOGY`를 **meeting·voc·contract_a·procurement·expense** 5팩에 도메인 사실 모델로 추가(recruiting 스키마 그대로: `objects[k,n,kind,a,on]·touch{stepId:[k]}·relations[from,label,to,t]·actions[key,n,mode]` + export `ontology:ONTOLOGY`). 각 6객체(recruiting 5)·5~6관계·7~9액션. **meeting**=Meeting·Attendee(entity)/Agenda·Material(document)/Decision·ActionItem(event), touch=understand/compose/prepare/share. **voc**=Customer·ComplaintType(master)/VocTicket·Compensation·CaseHistory(event)/Response(document). **contract_a**=Contract(entity)/Counterparty(master)/Clause·LegalReview(document)/RiskFinding·Approval(event). **procurement**=Vendor·Budget(master)/Quote(document)/Purchase·RiskFinding·Approval(event). **expense**=ExpensePolicy·Claimant(master)/Receipt(document)/ExpenseClaim·RiskFinding·Voucher(event). kind 4종(entity·event·document·master)=기존 색 토큰, 신규 hex·외부 lib 0. touch stepId=각 팩 실제 work[].id. **부수 발견·동봉 수정(데이터만, 코어 0)**: contract_a·procurement·expense는 `actor`·`workload`·`planProduces` 미보유 → ①touch 렌더는 `work.filter(actor==='aap')` 의존이라 intake·check 단계에 `actor:'aap'` 추가(`kind` 명시돼 stKind 불변=무부작용), ②도메인 뷰 카탈로그 미리보기 `renderDesign`이 `P.workload.request`(2310)·`P.planProduces[id]`(2478)를 비가드 deref해 **이 3팩 도메인 뷰가 기존부터 TypeError로 크래시**(온톨로지 도달 전) → 표준 필드 `workload`·`planProduces`를 사실 데이터로 추가해 해소(타 팩과 동일 계약). 검증: 6팩 `node --check` OK·구조 계약 검사(touch∈work·aap단계, rel·on 키 해소, kind 4종) ALL OK·헤드리스(localhost) 도메인 뷰 온톨로지 카드/관계/단계별사용 렌더(meeting 6/6/4·voc 6/5/4·contract_a·procurement·expense 6/5/2·recruiting 5/5/5, graceful 0·consoleErr 0)·`?demo=1&seed=<pack>:0` 런타임 케이스 open consoleErr 0·fde-onto 객체참조 분기 활성·그래프 토글 마크업 존재·한글 0깨짐·recruiting 무회귀.
> **track-auditor 감사(260629)**: 기계검증 all green(kind4·rel/on 키해소·touch∈work·mode 전팩 0위반)·크래시 해소/§5 claim 정직성 검증 OK·복붙/허위/과표현 0·recruiting 무회귀·🔴 0. 도메인 plausibility 4.3~4.7. **🟡 1건 정정 반영**: voc·procurement·expense의 핵심 유입객체(VocTicket·Purchase·ExpenseClaim)가 event라 entity('핵심 대상') 카테고리가 비던 것 → contract_a(Contract)·recruiting(Candidate)와 통일해 **kind event→entity**(지속 기록 객체가 사실에 부합·빈 카드 해소, 관계·touch·on은 key 매칭이라 무영향). 3팩 `node --check` OK.

### maestro 더미 런타임 케이스 정리 — 기본 빈 인박스 + ?demo=1 게이트 (260629, 유저 지시) 〔기획·UX·표준〕
> `maestro/`만. 팩 7종이 `pack.seeds`로 자동 주입하던 더미 케이스 ~13건이 **부팅 시 인박스를 가짜로 채움** → '새 업무 요청' 표준화가 섰으니 정리. **단일 게이트**(`core.js`): `seedPack(key)` 최상단 `if(!APP.demo)return` — 부팅 루프(`keys.forEach(seedPack)`)·`AAP_CORE.load` API 양쪽이 한 곳으로 막힘. 부팅에서 `APP.demo=q.get('demo')==='1'` 설정 + **비데모 부팅 시 영속된 seedKey 케이스 필터**(`APP.cases.filter(c=>!c.seedKey)` — 이전 `?demo=1` 세션이 localStorage에 남긴 더미 제거, **사용자 생성 케이스=seedKey 없음=보존**). 시드 정의는 팩에 그대로 → **가역**(언제든 `?demo=1`). 효과: **기본 부팅=빈 인박스**(`.ibx-empty` graceful "＋ 새 업무 요청으로 시작") / **`?demo=1`=더미 13건 복원**(유형 필터 회의·VOC·채용·계약·구매·경비). 거버넌스·실행추적 등 빈 케이스 graceful(3차 검증분). 검증: `node --check` OK·헤드리스 plain(빈 인박스 전체 0)/demo(13건) 양쪽 스크린샷 확인·error 0·회귀 0. → **maestro 제품형 정본: 깨끗한 부팅 + 발표용 데모 모드 분리.**

### 렌탈 콘솔 v0_3 고도화 — 루프=정보구조 재분배 (과밀·위계·산만·톤·동적성) (260629, 유저 지시·승인) 〔데모〕
> `03_프로토타입/G_렌탈/aap_rental_콘솔_v0_3.html`만. 유저 불만 5종(과밀·레이아웃/완성도·근거 산만·톤·동적성 약함) "다 필요" → 진단=**'정산 산정' 한 단계가 9패널 떠안음, 7단계 루프를 정보구조로 안 씀**. 방안 검토·승인 후 **근거 패널을 각 단계 홈으로 재분배**(모달로 숨기지 않고 분산=걸으면 내러티브). **업무 파악**(`understandGround`): 관련 객체 온톨로지(`AAP_VIZ.ontology` 인라인)+읽은 사실 데이터(`evidenceMini`=`caseEvidence` 4그룹 compact+`srcChip`) 2열. **처리 구성**(`composeGround`): 기존 5타입 조합 + **적용 규정 카탈로그**(발동 규칙만 `regCard`). **정산 산정**(`execDetail`): groundHtml 3패널+tools바 **제거** → 산식+정산3안+판단요인 미니 | 시뮬레이터+판정(인과배너 유지)만 = 과밀 해소. **발송·기록**(`shareGround`): write-back ops + **정산안 계보**(`AAP_VIZ.lineage` 인라인). mount 일반화 `mountGround`→**`mountStepViz`**(현 단계가 가진 #ontoMountI/#linMountI만 채움, 전 단계 호출). **동적성 체감**: 시뮬 변경 시 `flash()`가 바뀐 값(위약금 행·판정 헤더·인과 배너)에 펄스(`@keyframes rcFlash`). 톤=단계 헤드라인(`loopDH` label+role+explain 업무 언어)·메타 표현 제거. 기존 빌더(`caseEvidence`·`caseOntology`·`caseLineage`·`regCard`·`vizCalc`·`vizOpts`) 그대로 재사용·배치만 이동·신규 더미 0. 검증: vm 구문0·신규 6함수(understand/compose/share Ground·evidenceMini·mountStepViz·flash) 정의·dangling ref 0(잔여=미사용 `.rc-ev-tools` CSS 1줄). 숫자 카운트업 트윈=보류(flash로 체감 충족). 차기(미완): FDE 저작모드 ↔ 정본 `maestro/` 수렴(동시 세션 조율).

### 정본 승격 ②(완료) — 기존 `app/` → `_archive/app_260629/` 아카이브 (260629, 유저 지시) 〔표준·정의〕
> owner 세션 일단락 신호 후 진행. **이동 전 안전 확인**: `diff -rq app maestro` = 파일 구성 완전 동일, 내용 차이 6개(core.js·icons.js·platform.css·platform-fix.css·index.html·recruiting.js)는 전부 이 세션 1·2·3차 작업분(maestro 최신), app/ owner 변경(pipeline.js·contract_a·expense·procurement)은 maestro에 이미 동일 존재 → **maestro ⊇ app, 고유 내용 손실 0**. 일반 `Move-Item`(삭제 ✕·가역). 결과: `app/` 제거, **`maestro/`가 단독 정본**. (tracked app/ 파일은 git상 삭제로 표시 — 커밋은 유저 지시 시.)

### 정본 승격 ① — `app_v2/` → `maestro/` 리네임 (제품명 AAP Maestro) (260629, 유저 지시) 〔표준·정의〕
> 제품형 IA 개편 끝난 `app_v2/`를 **정본으로 승격**, 제품명 **AAP Maestro**(폴더 `maestro/`). 명칭=지휘자 메타포(AAP "Agent 남발 ✕ → 조합·지휘" 철학), console/studio/portal=내부 기획툴 느낌 반려. **이동**: `app_v2/`는 git 미추적(신규)이라 일반 폴더 이동(`Move-Item`). 상대경로(`core/`·`packs/`) 무변경 생존. **브랜드 문자열**: `index.html` `<title>`·`.brand` "AAP Platform"→"AAP Maestro", `core.js` 헤더 주석 동. 동작·`data-view`·딥링크 불변. 검증(헤드리스 Edge 스크린샷 1440×900, 한글경로 file://): 좌상단 "AAP Maestro · 운영 콘솔 · 통합 인박스"·좌측 6메뉴·AI FDE 버튼·인박스 케이스 전부 정상 렌더(상대참조 css/icons/packs 생존)·error 0. **잔여 승격 ②**: 기존 `app/`→`_archive/`는 **owner 세션 활성 편집 중이라 타이밍 조율 후**(임의 이동 시 그 세션 손상). 계획서=`app_승격_AAP_Maestro_계획_v0_1.md`.

### app_v2 정리 1단계 — 미정의 아이콘 2종 등록 + 런타임 자동 surfaceSpec 밀도 보강(Y2) (260629, 유저 지시·aap-platform) 〔기획·UX〕
> `app_v2/`만(라이브 `app/` 미접촉). **①(아이콘) `icons.js`** 에 Lucide 표준 path `list-checks`·`receipt` 2종 등록(3a/3b 결정콘솔 lookup-table 헤더 `contract_a`·`expense`·`procurement`가 사용·기존 graceful 폴백 → 콘솔 warn 2종 제거). 신규 색 ✕. **②(Y2 밀도) `core.js buildPackFromDecomp`** — '새 업무 요청'(detViz) 생성 케이스가 더미 팩 대비 과소밀도 원인 = detViz가 op마다 emit하는 `desc`·`reads`·`why`와 게이트 단계의 `dec`·`data`·`risk`를 빌더가 **드롭**해 work-panel ops가 1줄·게이트 좌측 휑함. **새 사실 ✕·분해 데이터 재배치(레이아웃)**: (a) 생성 op마다 `op-detail`(더미 팩 `odTable`과 동일 클래스: `od-title`=처리 계층 L+LK / `od-row` 하는 일·읽는 자료) 부여 → `se-ops` 높이 144→383(VOC 247 상회). (b) 게이트 단계는 ops가 없어 `dwById`로 원본 분해의 `dec`/`data`/`risk`를 HITL `rows`(확인·결정/검토 자료/책임·리스크)로 표면화 + 게이트 카드 `perStep.mode:'overview'`로 동일 행을 좌측 카드에 노출(`ct-vd` 143→228) → 결정 모달뿐 아니라 at-rest에서도 통제점 내용이 보임. **컨테이너 폭은 가·불변 동일(op-split 1240·opMain 840·content 792·aside 363) — '폭' 체감은 세로 밀도 차였음(헤드리스 측정 확인).** 코어 수정은 `buildPackFromDecomp` 내부에 한정(렌더러·더미 팩·`data-view`·동작 불변). **외부 lib 0·신규 raw hex 0·5타입/상태 토큰·Lucide·1·2·3a/3b 무회귀.** 검증(헤드리스 Chrome, in-place probe·한글경로 file://): warns=0·iconWarn=0·`AAP_ICON.has('list-checks'/'receipt')=true`·expense 참조기준 패널서 두 아이콘 실렌더 / 생성 케이스 auto단계 work-panel·gate단계 결정 overview 밀도 더미 수준 도달·error 0.

### 렌탈 콘솔 v0_3 척추 재작업 — 동적 흐름·인과·근거 인라인·실행 전면 (260629, 유저 지시) 〔데모〕
> `03_프로토타입/G_렌탈/aap_rental_콘솔_v0_3.html`만(app/ 미접촉). 유저 비판("케이스가 가상 데이터로만 보임·동적 작동 안 보임·온톨로지 등 근거 전부 모달에 가림·우측 과넓음") → 수렴 프레임(`06_사업화전략/메타AAP_데모_수렴프레임_v0_1.md` §5 척추 4요소: 동적 맥락·결정론·HITL·실행)을 데모에 구현. **①동적 흐름(②온톨로지=동적 맥락 철학 증명)**: 좌측 7단계 레일을 정적→**판정 파생**. `stageMeta(c,st)`가 `curR(c)=compute(slotsOf(c))`의 verdict(review/auto/reject)에서 게이트 단계 의미를 파생 — 계획확인·발송확인 단계가 review=`담당자 확인 ①·②`(amber 게이트) / auto=`AAP 자동·확인 불필요`(green) / reject=`진행 차단·발송 보류`(red). 시뮬레이터 변경 시 `wireSim.refresh()`가 `#loopRail` innerHTML 재렌더(+`wireRail` 재배선) → **조건 바꾸면 흐름이 살아 바뀜**. **②인과 배너**(`causalityHtml`): 시뮬 변경 시 `#causalBanner`에 `[바뀐 입력] → 규칙 → 흐름 변화 → 위약금 before→after` 한 줄 체인. **①근거 인라인**(`groundHtml`/`mountGround`, exec 상세 하단 full-width 3분할): 적용 규정(`regCard`, 케이스에 실제 발화한 penalty/refund/removal/unmanaged/unpaid만)·관련 객체 온톨로지(`AAP_VIZ.ontology` SVG 인라인 마운트)·정산안 계보(`AAP_VIZ.lineage` 인라인). 모달은 '전문/크게' 보조로 강등. sim 변경 시 ground도 재파생(규칙·객체·계보 슬롯 의존). **③실행 전면**(vizVerdict `rc-act`): 판정 패널에 '확정 시 시스템 반영' write-back 미리보기(계약 해지 예약·환불 정산 등록·안내 발송 / reject=보류) — 결정 시점에 실행이 보임. **④레이아웃**: 근거를 우측 aside가 아닌 하단 full-width 3열(<1100px 1열)로, aside는 sim+verdict+act 밀도↑. **자체 결정론 엔진·외부 CDN 0·platform.css 상대링크 유지.** 검증: 인라인 스크립트 vm 구문 0에러·참조 아이콘(layers·boxes·calendar·database·mail·zap)/토큰 전수 존재·배선 검사(stageMeta→rail·refresh→rail/ground/causal 재렌더·mountGround 양쪽 호출). ⚠ 헤드리스(Edge/Chrome --dump-dom)가 이 환경서 페이지 인라인 JS 미실행(gnav도 미렌더) → 런타임 시각검증은 Edge 실오픈.
> **이어서 — 메뉴 채우기(같은 파일·같은 날)**: 스튜디오 '도메인 팩'·관리 '로그·트레이스'를 '구현 중' 모달→**실제 뷰**로(gnav `data-wip`→`data-view`+`setView` 디스패치+신규 section). **도메인 팩**(`renderDomainPack`): 케이스 근거가 파생되는 원천 정의서 — 객체 카탈로그(`caseOntology` 대표 케이스서 스키마 추출·kind별 대상/사건/문서/마스터·`OBJ_ROLE` 일반 라벨)·관계 6종·관계 그래프(`AAP_VIZ.ontology` 인라인)·적용 규정 카탈로그(`REG`×5 `regCard`)·연동 시스템(`SOURCES` `srcChip`+desc). **로그·트레이스**(`renderLogs`): 케이스별 Lineage 집계 — provenance 5역할 색범례(`ROLEK`)·케이스마다 산출물+verdict+계보 체인(`caseLineage` 홉 inline·역할색)+'계보 크게'(`openLineage(c)`)+'재현 가능'. 데이터=기존 결정론 빌더 재사용(신규 더미 0). 워크플로우·자산·거버넌스는 '구현 중' 유지. 검증: vm 구문0·두 render 정의·data-view 4. 차기(미완): **FDE 저작모드 ↔ 정본 `maestro/`(구 app_v2) 수렴**(동시 세션 조율 필요·솔로 ✕).

### app_v2 3차 통합 감사(design+track) 갭 반영 — 온톨로지 폴드·provenance 정직화·a11y·토큰화 (260626, 유저 지시·aap-design) 〔디자인·표준〕
> `app_v2/`만(라이브 `app/` 미접촉). 3a/3b 위에서 design-auditor·track-auditor 통합 감사 7갭 반영(시각·텍스트·a11y·토큰만, 골격·동작·`data-view` 불변). **①(🔴) 온톨로지 본문 폴드** `platform.css .dom-top`: 카탈로그가 상단 ~46% 과점유→객체카드 폴드 밖 → `.dom-top .catalog`를 단일 행 가로 스크롤(`flex-wrap:nowrap;overflow-x:auto`·`cat-card width:210px`)로 압축(신규 클래스 ✕) → dom-top 26%·객체카드5+관계5 1뷰포트 안. **②(🟡) provenance 정직화** `core.js _TR_ROLE`: L3·L4 `judgment` 라벨 `LLM 판단`→모드 중립 **`추론 계층(L3·L4)`**, 근거 footer 단언을 '계층 기준 구분(L3·L4는 결정론 규칙 또는 LLM)'으로 정정(결정론/LLM을 색으로 분리한다는 과표현 제거) — AAP 'L3 결정론/LLM 블록 분리' 메시지 정합. **③(🟡) connect 모달 a11y** `openAssetConnect`: new-case `_ncTrap` 패턴 재사용 `_acTrap`(Tab 순환)+초기 `.focus()`(첫 연결 버튼→없으면 닫기)+트리거 복귀+ESC. **④(🟡) 근거 footer 토큰화** `platform.css :root`에 다크 표면용 라이트 변형 `--violet-300:#c4b5fd`·`--teal-300:#5eead4` 1쌍 추가→footer 인라인 raw hex 치환(신규 raw hex 0). **⑤(🟡) 거버넌스 요약 스코프** `_govSummaryMetrics` 주석 'logs KPI와 동일 소스·수치 일관'→'동일 소스(`isDeployed` 배포 케이스 한정)·미배포 trace 있으면 두 뷰 수치 갈릴 수 있음(정상)'. **⑥(🟢) AI FDE** `toggleFde`에 ESC 닫기(`_fdeEsc`)+`.fde-panel` 좌 1px 경계·그림자. **⑦(🟢) Eval bar** 4지표 bar fill amber 고정→`_opsTone`(green≥85·amber≥60·red<60) 종합점수와 동일 상태색 규칙. **외부 lib 0·신규 raw hex 0·5타입/상태 토큰·Lucide·결정론 폴백·1·2·3a·3b 무회귀.** 검증(헤드리스 CDP, Chrome): 온톨로지 도메인26%·카드5+관계5 1뷰포트(firstCardInView·relsBlockVisibleWithoutScroll) / provenance 라벨 `추론 계층(L3·L4)`·`사람 통제점`(LLM판단 0)·footer 계층 기준·raw hex 0·토큰 resolve(violet rgb(196,181,253)·teal rgb(94,234,212)) / connect 트랩 focusable6·초기포커스 inside·Tab wrap 양방향·ESC 닫힘 / fde border 1px·shadow·ESC 닫힘 / eval bar 4개 `_opsTone` 전부 매칭(amber 고정 ✕) / **page·JS error 0**(잔여=`list-checks`·`receipt` 미정의 아이콘 warn 2종, **3a/3b 이전 선존·본 범위 ✕**, 아이콘 레지스트리 graceful 폴백). 가이드 정정 권고(색축↔형태축 명문화·관리뷰 스크롤 허용·온톨로지 카드 기본)=04 디자인가이드 현행화로 별도 진행.

### app_v2 3차-b — AI FDE 전역 패널 + 자산 카탈로그 connect + 거버넌스 운영 요약 (260626, 유저 지시·aap-platform) 〔기획·UX·표준〕
> `app_v2/`만(라이브 `app/` 미접촉 — app/ 변경은 동시 세션 소관). 1·2·3a 무회귀(메뉴 제품형명·새 업무 요청 표준화·온톨로지/실행추적 강화 보존). 기존 자산(`AAP_VIZ_BRIDGE.analyze`·`renderAssets`·`renderGovern`·`trace`) 재사용, 새로 만들지 않음. **① AI FDE 전역 패널(`#fdeToggle` topbar 버튼 + `#fdePanel` 우측 슬라이드, `body.fde-on`)**: 챗봇 ✕ → 실무형 액션 어시스턴트(모든 화면 토글 접근). 액션 3종 — `이 업무 구조화`(textarea→`AAP_VIZ_BRIDGE.analyze` 분해 뷰 + `ncCreateNewType` 생성, 새 업무 요청 흐름 재사용) · `근거 설명`(현재 view/케이스 맥락 **결정론 요약** narr+행) · `온톨로지 초안`(현재 팩 `ontology.objects` kind별, 없으면 graceful 산출물 단서). 제안 결과가 분해 뷰·생성·온톨로지로 **반영**(대화 거품 ✕). **② 자산 카탈로그 connect(`renderAssets`)**: 카드마다 `연결` 버튼(drag-drop ✕·선택→연결) → `openAssetConnect(key)` 모달 = 현재 쓰는 워크로드(usedBy 내장)+연결된(linked) 칩 + `사용 가능한 업무 유형`(배포 팩 중 미사용·`assetAvailablePacks`) 각 행 `연결`·해제. 연결 상태는 `APP.assetLinks`(localStorage 영속, SCHEMA_VER 미변경=additive). `buildAssetCatalog`가 linked 병합, 카드에 `연결됨` 점선 칩. **③ 거버넌스 운영 요약(`renderGovern` 상단 `#govSummary`)**: 5카드 = 승인 대기(amber·게이트 미결정 케이스)·정책 위반 차단(red·`_trIsBlock`)·자동 실행(teal·비-HITL/비-차단 trace)·사람 확인 전환(violet·`_trIsHITL`)·실패/재시도(muted·현 데이터 없음=0 graceful). 전부 `APP.cases[].trace`+work 정의서 **결정론 집계**(`_govSummaryMetrics`), logs(renderTrace) KPI와 **동일 소스·수치 일관**(검증: 실행 후 block 2·auto 1·hitl 0 = steps 3). 기존 거버넌스 4축·Eval·RBAC·Agent Ops 전부 보존. **외부 lib 0·신규 hex 0**(5타입/상태 토큰 `--aap*/--violet*/--amber*/--red*/--surf` 재사용)·Lucide(sparkles·plug·user-check·rotate-ccw 등)·동작/`data-view`/안정 ID 불변·HITL='사람 확인'(영문=dev)·결정론(LLM 프록시 무관). 검증(헤드리스 Playwright chromium): FDE 버튼·패널 토글·분해 7카드/12구성요소·근거 4행+narr·온톨로지·닫기 / 자산 86카드 모두 `연결` 버튼·모달 5 avail·연결→모달 닫힘+linked 칩 / 거버넌스 5요약 카드·strip 4·RBAC 16·AgentOps 6 / 회귀: logs KPI 5·새 업무 요청 분해 6·전 뷰 렌더 · **page error 0·real console error/warning 0**(LLM 프록시 probe 1=기존 결정론 폴백 설계)·한글 깨짐 0.

### app_v2 3차-a — 온톨로지 스튜디오 + 실행 추적(리니지) 강화 (Palantir AIP 시그니처 2화면) (260626, 유저 지시·aap-platform) 〔기획·UX·표준〕
> `app_v2/`만(라이브 `app/` 미접촉 — app/ 변경은 동시 세션 소관). 두 화면을 '단순 로그/기술 도식'에서 'AAP가 업무를 어떻게 이해·왜 이 결과인가'로 격상. **① 실행 추적(`renderTrace`/`#traceLog`, data-view=logs)**: 평면 로그 목록 → 케이스별 **타임라인/계보**. provenance 역할 4종(원천 blue·결정론 teal·LLM판단 violet·사람통제점 amber, viz_decomp lineage taxonomy와 동일)으로 노드 dot 색 분리 + 단계마다 `✓기록됨` + **재현 ID**(`_runId` FNV-1a 결정론 해시, 케이스당 고정 `RUN-xxxxx`). 노드 클릭 → 우측 sticky **근거 패널**(처리방식·입력·근거·산출·승인·책임·거치는 계층 + 재현 ID·#순번 + '거버넌스 로그 기록' foot). KPI 5종·케이스 필터·empty 폴백 전부 보존. 'Run Trace/Decision Log'·역할 영문(`.tl-en`)=dev ON 보조표기. **② 온톨로지 탭(`renderOntology`/`#ontologyBox`, dom-pane=ontology)**: 기본 뷰를 노드 그래프 → **객체 카드 뷰**(AAP_VIZ.ontologyHtml 급)로 전환(그래프는 토글 보존·무회귀). kind 색 객체 카드(entity 핵심대상 teal / event 사건 connector blue / document 문서 module violet / master 기준정보 solution cyan = 5타입 토큰 재사용)·관계 리스트·**단계별 만지는 객체(touch)**·객체 클릭 드릴(속성·사용 단계·Action·관계 인라인). 데이터: `recruiting` 팩 ONTOLOGY에 `kind`+`touch` 추가(honest 도메인 데이터). 온톨로지 없는 팩(meeting·voc·expense 등)=**graceful**('아직 명시 온톨로지 없음' + 산출물 단서, 허위 객체 ✕). 톤='AAP가 이 업무를 어떻게 이해하는가'(기술 도식 ✕), 'L4/Ontology'=dev ON 보조(`.onto-dev`). **외부 lib 0·신규 hex 0**(다크=트레이스 팔레트 #0b1220/#162033/#7dd3fc/#5eead4/#c4b5fd/#fcd34d/#34d399 재사용, 라이트=`--type-*`·`--aap-*` 토큰)·Lucide·data-view/안정 ID 불변·결정론(LLM 프록시 무관). 검증(헤드리스 CDP, Edge): logs=timeline·evi 패널·6노드·provenance 3역할·재현 ID·근거 5행·KPI 5 / onto=카드 5·kind 4종·관계 5·touch 5·드릴(속성5·사용단계)·그래프 토글 5노드 / meeting 팩 graceful · **page/console error·warning 0**·한글 깨짐 0. 1·2차 변경·시드·런타임·새업무요청 흐름 무회귀.

### app_v2 2차 — 새 업무 요청 모달 design-auditor 감사 반영(R1·R2·Y1·Y3·Y4·Y5·G1~G3) (260626, 유저 지시·aap-design) 〔디자인〕
> `app_v2/`만(라이브 `app/` 미접촉). 인박스 `＋새 업무 요청` 와이드 모달(`.nc-modal-wide`/`#ncDecomp`). **R1 이중 스크롤 제거**: `.nc-decomp` 자체 `max-height:48vh;overflow:auto` 삭제 → 모달(`.nc-modal`) 단일 스크롤에 분해 뷰가 흐름(헤드리스: decMaxH=none·overflowY=visible). **R2 주 CTA sticky**: `.nc-menu.nc-modal .nc-acts`를 `position:sticky;bottom:0` 하단 바(상단 헤어라인+`--surface` 배경+모달 패딩 bleed `margin:-20px`+하단 코너 라운드)로 항상 노출, `:empty`면 숨김. **Y1 컴팩트 분해**(CSS 스코프만, viz_decomp JS·shape 불변): `.nc-decomp` 스코프에서 `.vd-bk`/`.vd-bk-top`/`.vd-bk-col`/`.vd-bk-k/v` 패딩·폰트 축소 + 장문 `.vd-why` 숨김(풀디테일은 생성 후 워크로드 스튜디오). **Y3 후보 임계**(`core.js _renderNcRecoBody`): `cands` 필터 `score>0`→`ncCandQualifies`(hits≥2·score≥0.14) → 6%짜리 우연 매칭 제거, 미달이면 `nc-noflow`로 일원화(헤드리스: 신규 쿼리 candCount=0·noflow=true). **Y4 액션 위계**: 강매칭(`m.packId` 확정)이면 `‘○○’ 팩으로 생성`=primary·`새 유형`=ghost 스왑(primary 우측), 약매칭이면 현행(새 유형 primary). **Y5 a11y**: 모달 `role=dialog aria-modal=true aria-labelledby=ncHead` + 바닐라 포커스 트랩(`_ncTrap` Tab 순환) + `closeNewCase` 트리거(`newCaseBtn`) 포커스 복귀. **G1** toast `새 ‘{케이스 제목}’ 업무를 시작했습니다`(따옴표 분리). **G2** `.nc-chip .tc-dot` teal 고정→`typeTok` 5타입색(currentColor·ty-chip 패턴). **G3** `.nc-reco-i:hover` 생 hex `#e6fcf8`→`--aap-soft`. **신규 hex 0**·5타입 색·결정론 폴백·data-view 키 불변. 검증(헤드리스 CDP): R1/R2·후보 임계(강:1·약:0)·Y4 primary 스왑·a11y role+트랩(10 focusable Tab wrap)+포커스 복귀·page error 0(잔여 1=localhost LLM 프록시 미가동 결정론 폴백, 기존 동작).

### 렌탈 콘솔 v0_3 — 시연 근거 층(드릴다운·Lineage·온톨로지 그래프) (260626, 유저 지시·aap-platform+aap-viz 병렬) 〔데모〕
> `aap_rental_콘솔_v0_3.html` 후속. 유저 방향: "시연은 근거를 들고 이야기하는 것 — AAP 산출(위약금·정산·판정)이 실제 데이터·규정·계보로 추적돼야". **메뉴(도메인팩·로그) 없이 각 케이스 화면에 맥락 근거**로 구현(메뉴는 나중에 이 데이터를 집계해 붙일 것 — 데이터는 글로벌 레지스트리로 재사용 가능 구조). **에이전트 2개 병렬**: 루프 빌더 A(SendMessage 재개)=근거 데이터+드릴, aap-viz=AAP_VIZ 컴포넌트.
- **근거 데이터 층(자체 결정론 파생, `slotsOf(c)`=ST.sim 우선 → 화면값과 항상 일치)**: 케이스별 사실 데이터(계약·결제·사용·이사 — `caseEvidence`)·규정 베이스(`REG`: 소비자분쟁해결기준 등 조항·출처)·출처 레지스트리(`SOURCES`: 계약시스템·결제·고객신고·지역코드)·`caseLineage`·`caseOntology`. FDE 생성 케이스(RT-3130+)도 함수 파생이라 자동 커버.
- **근거 드릴다운**(케이스 surface 안, 메뉴 ✕): 위약금/정산3안/판정/판단요인/계약식별 op·결과에 '근거 보기' → 모달(읽은 데이터+출처 칩 / 적용 규칙 카드[규정 전문] / 산출 결과). 출처 칩 클릭→시스템 상세. 실측: penalty 근거 = 규정 1·출처 4.
- **온톨로지 노드-링크 그래프**(AAP_VIZ.ontology, 자체 SVG·외부 lib 0): 6객체(계약 마스터 허브+고객·제품·해지요청·위약금·정산안)+6관계, kind 색(entity teal/event cyan/document blue/master violet), 노드 클릭→속성 드릴. **카드 ✕ 진짜 그래프**.
- **Lineage**(AAP_VIZ.lineage): 정산안→상류 8홉(source/transform/judgment/gate/output) provenance 배지+기록됨.
- **AAP_VIZ = 재사용 공용 컴포넌트**(`window.AAP_VIZ.ontology/lineage`, 자기완결·AAP_ICON 폴백) → 다른 HTML서도 `<script>`+호출로 재사용(설계서 viz_decomp 방향과 정합). 미로드 시 텍스트 폴백.
- 검증: 헤드리스 JS 에러 0·온톨로지 svg/노드6/엣지6·근거 규정/출처·Lineage 8홉 렌더. 메타 표현 ✕(읽은 데이터·적용 규칙·산출 결과·출처·계보·관련 객체 = 업무 용어). Edge 오픈. **app/ 미접촉.**
- **차기**: 메뉴(도메인팩=온톨로지 카탈로그·로그=Lineage 집계)에 이 데이터 연결 + FDE 플랫폼 Q&A.

### app_v2 2차 — 세 입구 통합 + '새 업무 요청' 표준화(분해→신규 Pack→런타임) (260626, 유저 지시·aap-platform) 〔기획·UX·표준〕
> `app_v2/`만(라이브 `app/` 미접촉). On-Ramp '키워드 매칭 우선' → **'AAP 분해 우선'으로 표준화**. ① `core.js` `promptNewCase`/`renderNcReco` 재구성: 작은 모달 → 입력 시 **분해 뷰를 품은 와이드 패널**(`.nc-modal-wide` max-width 880, `#ncDecomp`). 업무 설명 입력(디바운스 340ms) → **`AAP_VIZ_BRIDGE.analyze(text,el)`로 분해 뷰 표출**(라이브 LLM 우선 → 프록시 없으면 결정론 detViz). `matchPackByText`는 유지하되 **'유사 도메인 팩 후보(보조)'**로 격하(클릭=재사용 선택). 액션 2종 = **‘○○ 팩으로 생성’**(매칭/최상위 후보로 createCase) / **‘새 업무 유형으로 생성’**(분해 결과로 신규 Pack 생성). ② **신규 함수 `buildPackFromDecomp(decomp,text)`**(코어 일반): detViz 분해(work/compose/gates)→**최소 surfaceSpec 팩** 생성·`PACKS` 등록·`setPackStatus(id,'deployed')`. 생성물=① 작업 타임라인(flow 단계 매핑·actor→kind input/gate/auto) ② 산출물(자동단계마다 products, readyAt=step.id) ③ HITL 게이트(gate.decisions+SS.hitl/done). op.ty→`_ncCompLabel`로 evidType 색 정합. 더미 SEEDS 없이 createCase→인박스 편입→**스트림 런타임 그대로 작동**. 도메인 rich 슬롯(caseModel·온톨로지·전용 surface)=후속 범위 ✕. ③ 세 입구 수렴: 격상(pipeline)·자동저작(authoring)은 기존대로(이미 격상 ①에 분해뷰 반영) — On-Ramp가 같은 viz 자산 소비로 일원화. **코어 수정 최소**(promptNewCase/renderNcReco/신규 빌더 1블록 + platform-fix.css nc-modal-wide·nc-decomp). 회귀 보존(시드 케이스·data-view·안정 ID). 검증(헤드리스 CDP, 프록시 OFF=결정론): 분해 뷰 25KB·`.vd-` 렌더·모달 확장 / 새 유형 생성→**7단계 타임라인·산출물 4개·HITL 게이트 카드·결정 모달(SS.hitl '계획·판단 승인')·decide 진행**(4/7→5/7) / 유사 후보(voc) 보조 노출+‘VOC 대응 팩으로 생성’ 버튼 / 시드 케이스 35건 정상·런타임 surface 렌더 / page·console JS error 0(localhost LLM 프록시 probe ERR_CONNECTION_REFUSED는 기존 viz_bridge 라이브-probe 설계, 본 변경 무관)·한글 깨짐 0.

> **[track-auditor 감사 260626]** app_v2 2차 새업무 흐름 — claim 4종 기계 검증 PASS(점수 4.4/5). ①가변분해: detViz 입력신호별 단계 5/6/7·게이트 0/1/2·5타입 3~5종 실측 가변(단 A:6 M:1은 공통 골격 floor — "신호별 가변=게이트·추가타입·단계수, 공통 골격 유지"로 표기가 정직). ②더미SEEDS무관: buildPackFromDecomp 산출 팩 seeds:0·products 4(body 충실)·perStep/status/hitl/done 완비·caseModel 없이 caseTemplate graceful → 빈 껍데기 ✕. ③결정론폴백: ncCreateNewType=detViz 직접호출(LLM 무관)·analyze는 LLM우선+catch 무음폴백 → 프록시 OFF서 전 경로 작동. ④조건부탭: 결정론 ontology/lineage 부재 확정→해당 탭 미표출·과표현 문구 없음. 🟡 잔여: app/는 pristine 아님(viz_bridge.js/viz_decomp.js/llm_breakdown.js 미배선 고아 + pipeline/contract_a/expense/procurement 수정=직전 라운드분, 2차 흐름은 app_v2 격리 확정). 하니스 트랙 audit_track.js=blocking 0.

### app_v2 1차-후속 — design-auditor 감사 3건 반영(제목 동기화·dev 위계·균질화) (260626, 유저 지시·aap-design) 〔디자인〕
> `app_v2/`만(라이브 `app/` 미접촉). ① **nav 라벨 = 화면 제목 동기화**(6/7 불일치 해소): `index.html` sec-title 5개를 nav 라벨로 — 도메인 팩→**지식 라이브러리**, 워크플로우 빌더→**워크로드 스튜디오**, 자산·조합 재료→**자산 카탈로그**, Run Trace·Decision Log→**실행 추적**, 운영 콘솔→**거버넌스**. 기존 식별자/부제는 제목 옆 muted 11.5px 보조로 강등(텍스트만·JS 로직·data-view 키 불변). ② **dev 이중표기 위계**: `.gn-en`을 제목 라인(13px inline)에서 분리 → nav 안 10px·faint **sub 행**(`gn-sub`와 동일 위계, `body.dev-on .gnav-i .gn-en{display:block}`), ragged wrap·"Pack" 고아행 해소(HTML: gn-en을 gn-l 밖 gn-tx 자식으로 이동). run-id pill의 gn-en은 인라인 기본 유지. ③ 균질화: (a) topbar `brand-sub` = 현재 view 라벨 동기화(`setView` JS 1줄, inbox=「운영 콘솔 · 통합 인박스」톤 유지·텍스트만) (b) nav 라벨 「추적」(1어절)→**「실행 추적」**(2어절). **신규 hex 0**·teal 토큰만. 검증(헤드리스 CDP, dev ON): 7뷰 nav 라벨=sec-title=brand-sub 동기화 확인·gn-en display block/10px 1행(고아행 0)·page/console error 0.

### app_v2 1차 — 좌측 메뉴 제품형 한국어 재명명 + 개발자보기 영문 이중표기 (260626, 유저 지시·aap-design) 〔디자인〕
> 신규 `05_범용플랫폼/app_v2/`(라이브 `app/` 복사본, 라이브 미접촉)에서 **메뉴 라벨·보조설명·이중표기·CSS만** 수정(동작·JS·data-view 키 불변). 그룹(운영/스튜디오/관리) 유지·1:1 재명명: 워크플로우→**워크로드 스튜디오**, 도메인 팩→**지식 라이브러리**, 자산→**자산 카탈로그**, 로그·트레이스→**추적**, 거버넌스·정책→**거버넌스**(인박스·시연 유지). 각 항목에 보조설명 1줄(`gn-sub`, 작게·faint). 개발자 보기(`body.dev-on`)에서만 영문 보조표기 노출(`gn-en`: 지식 라이브러리·Knowledge/Domain Pack / 워크로드 스튜디오·Decomposer/Builder / 자산 카탈로그·Assets / 추적·Run Trace/Decision Log / 거버넌스·Governance). topbar에 run 식별 pill(`run-id`, `body.run-active`에서만)= "런타임"(dev ON: "런타임 · Agentic Operation"). 라벨 컬럼화(`gn-tx`)·collapsed nav 숨김(`gn-l`→`gn-tx`)·data-label 툴팁 신명칭 갱신. **신규 hex 0**·teal 토큰만. 검증(헤드리스 CDP): 메뉴 재명명·보조설명 표시·dev OFF/ON 이중표기 토글·인박스 케이스 클릭→run pill 노출·caseTitle·page/console error 0·한글 정상. 2·3차(흐름 통합·surfaceSpec·온톨로지 스튜디오 분리·AI FDE 전역)는 미착수.

### 렌탈 콘솔 v0_3 — 케이스=AAP 오퍼레이팅 루프 전체화 + AI 어시스턴트(FDE) + 메타표현 제거 (260626, 유저 지시·aap-platform 병렬) 〔데모〕
> `aap_rental_콘솔_v0_3.html` 후속. 유저 피드백 반영: ①"절차 너무 간소·결과값만" → AAP 루프 전체화 ②"새 업무 요청 = AI 어시스턴트(FDE) 진입점" ③"메타 표현(하드코딩 ✕·결정론·엔진·verdict·재계산·HITL) 전부 삭제 — 실제 제품 화면처럼". **aap-platform 에이전트 2개 병렬 투입**(A=루프, B=FDE, 영역 비겹침) → 통합용 완성코드 반환 → 단일 writer 통합.
- **A: 케이스 run surface = 7단계 오퍼레이팅 루프**. 좌측 과정 레일(요청 접수→업무 파악→처리 방식 구성→계획 확인→정산 산정·처리→발송 확인→발송·기록) + 우측 단계 상세. 단계 클릭=그 단계 'AAP가 한 일·근거·산출물'(요청해석·유형분류·계약식별·구성요소 16조합·게이트 등). **기존 위약금 viz/시뮬레이터/정산3안/판정은 '정산 산정' 단계 상세로 흡수**(삭제 ✕·동작 유지). rental.js FLOW 7단계 콘텐츠 차용.
- **B: '새 업무 요청'·gnav 'AI 어시스턴트' = FDE 진입**. 자유 상담 입력/예시칩 → 의도 분석(요청에서 제품·유형·신호 추출) → 실행 구조 구성(Master/Agent/Module/기존솔루션/Connector/Policy 5타입 색구분, 구성요소 N) → 케이스 생성(CASES.unshift+compute+openCase). 예시 3종이 결정적으로 3 verdict(검토/무위약/반려) 도달.
- **메타 표현 전부 제거**: 화면 텍스트에서 '하드코딩·결정론·재현·엔진 판정·verdict·산식 재계산·surface 내부·What-if·(HITL)' 삭제. 업무 용어로 대체("위약금 산정 내역"·"조건을 바꿔 정산 미리보기"·"담당자 확인 대기" 등). 코드 주석만 잔존(화면 노출 0).
- 검증(헤드리스): JS 에러 0. 케이스 7단계 루프·단계 상세·정산 산정 임베드(시뮬 동작) 렌더. FDE 의도분석→구조구성(구성요소 10)→케이스생성 렌더. Edge 오픈.
- **차기**: 도메인팩 온톨로지 그래프·로그 Lineage·FDE의 플랫폼 Q&A(차기).

### 렌탈 콘솔 v0_3 +run 케이스 surface + 위약금 시뮬레이터 (260626, 유저 지시) 〔데모〕
> `aap_rental_콘솔_v0_3.html` 후속. 인박스 케이스 클릭 → **run/케이스 surface**(index.html run 뷰 구조: runtop seq + con-head + con-body). **시뮬레이터는 단독 페이지 ✕ → surface 내부**(유저 지시).
- 좌(main): 위약금 **산식 인과 전개**(잔여×기본×10%=331,800·계산식·amber) + **정산 3안 비교카드**(표준 461,800/부분 295,900 AAP추천/무위약 30,000·고객부담 닷·클릭 선택) + **자격 미니카드**(의무경과·이사사유·납부·대체).
- 우(aside): **What-if 시뮬레이터**(잔여월·기본요금 슬라이더 + 무관리지역 토글) + **verdict 카드**(정산검토 HITL/자동무위약/반려 · 정산수준 선택→확정).
- **자체 결정론 라이브 재계산 실측**: 잔여 42→12 ⇒ 위약금 94,800(12×79,000×10%)·정산 3안 before→after diff / 무관리지역 토글 ON ⇒ 판정 `정산검토`→`자동 무위약` + 헤더 pill 갱신. 산술·판정 둘 다 동적(하드코딩 ✕).
- 검증: 헤드리스 JS 에러 0·산식·정산·시뮬·verdict 렌더·시뮬 재계산 실측. Edge 오픈.
- **차기**: 도메인팩 온톨로지 그래프·로그 Lineage·AI 어시스턴트(FDE) — 현재 메뉴+구현중 모달.

### 렌탈 콘솔 v0_3 — 외관 카피 + 셸·대시보드·인박스 (260626, 유저 지시) 〔데모〕
> 신규 `03_프로토타입/G_렌탈/aap_rental_콘솔_v0_3.html` (v0_2 엔진번들 → `_archive`). **3차 방향 정정**: v0_2(core.js 통째 번들)는 "엔진을 카피"한 것 → 유저 반려. 올바른 = **index.html 외관(룩)만 카피 + 자체 결정론 엔진 + index.html 핵심 IA 구조**(복붙 ✕·렌탈 단일·채용/voc 등 제외).
- **구조 = index.html IA 자체 재현**(core.js 미사용): topbar + gnav(운영[대시보드★신규·인박스] / 스튜디오[도메인팩·워크플로우·자산] / 관리[로그·거버넌스] / AI어시스턴트). platform.css·platform-fix.css·icons.js 상대 link(외부 CDN 0). app/ 미접촉.
- **이번 빌드 범위(유저 확정)**: 외관 + **대시보드**(작동) + **인박스**(작동)만. 나머지(도메인팩·워크플로우·자산·로그·거버넌스·AI어시스턴트)=**메뉴만 + 클릭 시 "구현 중" 모달**.
- **자체 결정론 엔진**(~10줄 `compute(slots)`): 위약금=잔여×기본×10%(의무1년초과)·정산3안·verdict(미납→반려/무관리지역→자동무위약/1년초과→정산검토HITL). 케이스 3건 데이터 → 엔진이 verdict·금액 산출(하드코딩 결과 ✕). 대시보드 KPI·분포·인박스 카드가 전부 엔진 출력 구동.
- **검증(헤드리스)**: neterror 0·JS 에러 0. 대시보드(KPI·최근상담·정산분포)·인박스(케이스·타입필터·새업무) 렌더. 정수아 461,800(정산검토)·김도현 30,000(무위약·자동)·박미정 미납(반려) 엔진 산출. "구현 중" 모달 OK. Edge 오픈.
- **차기(합의된 다음)**: ①run/케이스 surface + **위약금 시뮬레이터**(단독 페이지 ✕ → surface 내부) ②도메인팩 온톨로지 그래프·로그 Lineage ③**AI 어시스턴트(FDE)** = 플랫폼 Q&A + 의도분석→워크플로우 재구성(index.html authoring/pipeline 개념·어려운 작업). chat=정해진 시나리오 ✕.

### 분해 뷰 app/ 배선 + 감사 갭 반영 (260626, 직접·aap-design·design-auditor) 〔기획·UX·디자인〕
> 설계 §4 실행: 격상(`pipeline.js` `renderBreakdown` ① 스텝)에 공용 분해 뷰 반영. `index.html`에 모듈 3개 script(`viz_decomp.js`·`llm_breakdown.js`·`viz_bridge.js`) + `renderBreakdown`의 task 카드 → `#plViz`에 `AAP_VIZ_BRIDGE.analyze(M.sourceText)`(결정론 **즉시** 렌더→라이브 LLM 프록시 가용 시 갱신, 조건부 탭=온톨로지/Lineage는 라이브만, 모듈 미로드 시 기존 카드 폴백). `?pipeline=1` 헤드리스 검증·node --check OK. **aap-design 폴리시**: 토큰 parity 확인(`--vd-*`=platform 동일값)·단일 탭바 숨김(`:has(:only-child)`)·폰트 stack 정합. **design-auditor 감사**(차원 평균 3.25/5): 🔴 위저드 ①~⑤↔모듈 ①② 번호체계 충돌 / 🔴 ①스텝 engGraph↔②스텝 compose 그래프 2이디엄 중복 / 🟡 모달 1스텝 4~5뷰포트 과적·`pl-sigs` 5색 칩·`vd-why` teal 반복 / 🟢 신규 hex 2색(`#243349`·`#7d8da3`)·모달 focus 트랩. a11y(버튼·aria·focus-visible·Esc)·토큰 parity·단일탭 양호. **즉시 적용**: 🔴 번호 충돌(모듈 vd-bh ①②→아이콘 무번호, 위저드 스텝퍼만 번호) + 🟡 헤더 중복(`pl-sech "분해·재구성"` 제거, 모듈 헤더가 carry) → 재검증 OK. **잔여 갭 전부 적용(유저 "다 진행")**: 🔴2 idiom 통일 = **① 분해 뷰 다크 엔진룸(engGraph)을 정본 재구성 그래프로, ②스텝은 편집 리스트 전용**(`renderCompose` 그래프뷰/토글 제거) → 작업→5타입 그래프 1회·1이디엄 · 🟡4 `pl-sigs` 5색 칩 → 중립 단일 "감지 신호 N종" 칩 · 🟡5 `vd-why` teal 배너 → 중립 배경+teal 라벨만 · 🟢7 모달 포커스 복원(`_lastFocus`) · 🟢6 다크 hex `--vd-eng-*` 토큰화(자기완결 의도). 재검증·node --check OK. (모달 full focus-trap만 경미 잔여)

### 격상 ① 분해 뷰(viz_decomp) 시각 폴리시 — 단일 탭·폰트 정합 (260626, aap-design) 〔디자인〕
> `core/viz_decomp.js` CSS 2줄만 조정(JS 동작·데이터 shape·자체완결성 무접촉). ① **단일 탭 숨김** `.vd-tabs:has(.vd-tab:only-child){display:none}` — 결정론 폴백(분해만, 온톨로지·Lineage 없음=`?pipeline=1` 기본)일 때 lone 탭 "분해·재구성"이 바로 위 호스트 `.pl-sech` 헤더와 라벨 중복 → 탭바 제거로 위계 정리(다중 탭이면 그대로 노출). ② **폰트 정합** `.vd-root` font-stack 앞에 `"Pretendard","Inter","Noto Sans KR"` prepend — 오버레이 안에서 vd 텍스트가 앱(platform.css body)과 같은 face로 렌더(미로드 시 system-ui 폴백=standalone 자체완결 유지). 검증: vd 자체 토큰(`--vd-*`)이 이미 platform.css(teal/violet/cyan/blue/amber·ink/slate/surf·#0b1220 엔진룸)와 동일값 확인 → 표면·여백·5타입 색·shadow 무이상. 헤드리스(`?pipeline=1`) 전후 캡처: 중복 헤더 해소·4-col 분해카드·다크 엔진룸 오버레이 폭 내 정상.

### 렌탈 콘솔 v0_2 — 엔진 번들 standalone(진짜 결정 런타임 작동) (260626, 유저 지시) 〔데모〕
> 신규 `03_프로토타입/G_렌탈/aap_rental_콘솔_v0_2.html` (v0_1 mockup → `_archive`). **방향 재전환**: 유저가 v0_1을 "콘솔이라 볼 수 없다·실제로 작동하는 걸 원해"로 반려. v0_1은 가짜 `compute()`+고정 데이터 목업이었음 → v0_2 = **실제 `core.js`+`evaluate.js`를 그대로 부팅**하는 엔진 번들. app/index.html 미접촉(상대경로 `<script src>`로 실제 엔진 로드, 외부 CDN 0).
- **렌탈 결정 팩 inline 정의**: contract_a.js의 '작동하는 export 형태'(surface/surfaceHooks 미제공 → 코어 `renderDataConsole` 자동 렌더) 그대로. `caseModel.slots`(17) + `knowledge.route`(4룰+default: 미납→REJECT·무관리지역→AUTO무위약·잔여≤임계→AUTO·1년초과→LEGAL_REVIEW) + `io.editable`(th_autoWaiveRemain 임계). 위약금은 evaluate가 산술 ✕라 팩 `derive()`로 사전 결정론 계산(잔여×기본×10%) 후 seed.input 주입.
- **부팅**: index.html 전체 셸 스켈레톤 복제 + `window.AAP_CORE.load('rental')`.
- **실측 검증(헤드리스)**: 부팅 OK·neterror 0·JS 에러 0. evaluate 진짜 verdict 3종 — 정수아=`LEGAL_REVIEW/r_review_standard`·김도현(무관리)=`AUTO_APPROVE/r_waive_zone`·박미정(미납)=`REJECT/r_reject_unpaid`. **임계 60 클릭→정수아 `LEGAL_REVIEW`→`AUTO_APPROVE/r_auto_short` 실제 라이브 재판정**. 코어 결정 콘솔(슬롯·verdict·근거·HITL 게이트) 자동 렌더 확인. Edge 오픈.
- **남은 것(Step 2, 실제 STATE 읽어 얹기)**: ①위약금 산술 시뮬레이터(잔여월 슬라이더→33만 before→after) = 팩 surfaceHooks.steerHook(arithmetic)+custom surface. ②온톨로지 노드-링크 그래프 + 기진회식 리치 viz. (현재는 코어 일반 슬롯/판정 카드.)
- **미접촉**: core.js·evaluate.js·rental.js(app/)·index.html·다른 팩. (단독 파일이 실제 엔진을 read-only로 부팅.)

### app/ Phase 2 — 공용 viz 모듈 + 라이브 LLM 분해 프록시 (설계 §4 실행, 신규 파일만) (260626, 직접) 〔기획·UX·표준〕
> 설계 §4(app/ 4요소·Phase 2) 실행. **기존 app/ 파일 미편집**(단일-writer 충돌 방지) — 신규 파일만 추가, 배선은 owner 세션이 적용. ① 공용 모듈 `app/core/viz_decomp.js` = H 데모 렌더(분해카드·engGraph 순차·온톨로지·Lineage·드릴모달·3탭)를 자기완결 모듈로 승격(`window.AAP_VIZ.mount(el,data)`, 자체 CSS 1회 주입·`.vd-` 네임스페이스·자체 5타입 토큰·`AAP_ICON` 폴백, 외부 라이브러리 0). 표준 데이터 shape(`work·compose·gates·ontology·lineage`) 소비 = app/·렌탈·standalone 공용. 격리 헤드리스 검증 OK. ③ 라이브 LLM: `app/core/llm_breakdown.js`(어댑터 `window.AAP_LLM_BREAKDOWN.run/runOr/available` — localhost 프록시 POST→정규화, 실패 시 결정론 폴백·브라우저 키 0) + `05_범용플랫폼/_dev_llm_proxy/`(Node 프록시 `server.js`: ANTHROPIC_API_KEY 서버 격리·Sonnet 4.6 기본/Haiku 옵션·`output_config.format`+json_schema로 work/compose/ontology/lineage 강제·8계층 캐논 시스템프롬프트 캐싱·CORS·/health·/breakdown / `package.json`(@anthropic-ai/sdk 1개) / `.env.example` / `README` / `INTEGRATION.md`(owner 배선 패치) / `test_live.html`(프록시+어댑터+모듈 end-to-end 검증)). 비용=격상 시 1회 호출(케이스 실행마다 ✕)·키는 사용자 보유 시에만. node --check 전부 OK·test_live 모듈 로드 OK. **배선(index.html script 2줄·pipeline.js proposeBreakdown 라이브 우선+폴백 훅)=INTEGRATION.md로 owner 적용 대기.** 렌탈은 §5 옵션 B로 별도 완료(타 세션) → 추후 공용 모듈 link 전환 가능.

### 렌탈 콘솔 — 온톨로지+Lineage 탭 추가 (설계 §5 ② 실행) (260626, 유저 지시) 〔데모〕
> `aap_rental_콘솔_v0_1.html`에 H 분해시연의 트리오(온톨로지·Lineage·구성)를 **자기완결 이식**. 설계(`aap_분해뷰_콘솔적용_설계_v0_1.md`)의 권장 순서 ②. **옵션 B(자기완결) 선택** — ①공용모듈화는 app/ 단일-writer 타 세션 영역이라 블로킹 → 렌탈은 단독 HTML이므로 ~150줄 렌더 자체 작성(엔진 `compute()`/`DRILL` 재투영). **app/ 미접촉.**
- 「지식·산식」 뷰 → **「지식·계보」 세그먼트 4탭**: ①온톨로지(계약·제품·위약금산정·정산안·정책 객체, kind=entity/event/document/master 색=5타입 토큰, 객체 클릭→속성·사용단계·관계 드릴) ②계보·Lineage(산출물 정산안 ← GATE(사람·amber) ← TRANSFORM(결정론·teal 331,800) ← SOURCE(계약데이터·정책·blue), provenance 색+"✓기록됨") ③구성(렌탈 워크플로우 5타입 정적·라이브 분해 ✕=운영평면) ④산식·규칙(기존 규칙·재현성).
- 드릴 모달을 글로벌(`position:fixed`)로 승격 → 전 뷰에서 동작(consult 근거보기 + onto 객체 드릴 공용).
- 색 규율: entity=teal·event=cyan·document=blue·master=violet / provenance source=blue·transform=teal·gate=amber. 신규 hex 0(platform 토큰).
- 검증: 헤드리스 4탭 렌더·console error 0·객체 드릴 모달 OK. Edge 오픈. **app/·core.js·rental.js 미접촉.**
- 차기(app/ 세션 조율 후): ①공용모듈 `app/core/viz_decomp.js` 승격 시 렌탈도 link로 전환(중복 제거) · ③app/ Phase 2 라이브 LLM 4탭.

### 분해·온톨로지·Lineage 패턴 콘솔 적용 설계 (260626, 직접·설계만) 〔기획·UX〕
> 신규 `05_범용플랫폼/aap_분해뷰_콘솔적용_설계_v0_1.md`. H 데모(분해 시연 v0_2)의 4요소(분해·재구성·온톨로지·Lineage)를 **app/index.html(구성·저작 평면)·렌탈 콘솔(운영·런타임 평면)** 둘 다 적용하는 매핑. **빌드 ✕ 설계만**(소유권 조율 후). 평면 차이: app/=분해 1급(라이브, =Phase 2 4탭) / 렌탈=온톨로지·Lineage 1급(엔진 `compute()`·drill·knowledge가 이미 절반)·분해는 정적 설명. 재사용=H 렌더(`engGraph`·`renderOntology`·`renderLineage`)+데이터 shape(`work·compose·ontology·lineage`)를 `app/core/` 공용 모듈(`viz_decomp.js` 등)로 승격(옵션 A 권고, 렌탈이 app/core 이미 link). 블로커=app/ 단일-writer·렌탈 소유권 조율. 다음=모듈화 확정→렌탈 탭 빌드(저비용)→app/ Phase 2.

### 가전 렌탈 운영 콘솔 v0_1 — 플랫폼 콘솔 + 라이브 엔진 + AI 어시스턴트 (260626, 유저 지시) 〔데모·기획·UX〕
> 신규 `03_프로토타입/G_렌탈/aap_rental_콘솔_v0_1.html`. **방향 전환**: 앞서 만든 모바일 챗 셀프서비스(`aap_rental_시연_v0_2.html`)는 유저 의도와 다름 → 폐기(삭제 ✕, 검증 수치 출처로 보관). 진짜 요구 = **index.html 대형 플랫폼 콘솔 레이아웃을 빌려 렌탈 운영 콘솔**.
- **콘솔 chrome 재사용**: `core/platform.css`·`platform-fix.css`·`icons.js`를 상대경로 link(외부 CDN 0). topbar·gnav·views·run-surface 그대로 → 플랫폼과 시각 100% 정합(모노톤 토큰 상속).
- **gnav 3뷰**: ①대시보드(KPI·최근상담·정산 분포바) ②상담·케이스(핵심 40/60: 좌 chat 상담 스레드[2px teal 포털톤·`.csync`식 진행·근거보기 드릴 모달] / 우 라이브 viz) ③지식·산식(결정론 규칙 코드블록·인과 누적계수·재현성 박스).
- **라이브 엔진(자체 ~60줄)**: 위약금 산식 `잔여월×기본요금×10% + 등록비+철거비`를 **실제 계산**(하드코딩 ✕). rental.js는 표시용 문자열뿐이라 신규 작성. **What-if 시뮬레이터** 슬라이더(잔여월·기본요금·무관리지역) → 위약금·정산 3안 **라이브 재계산 + before→after diff**. 검증: 잔여 42→30 ⇒ 위약금 331,800→237,000·표준 461,800→367,000 실측.
- **기진회 프로토타입 차용 viz**(`참고자료/기진회_2차세미나_호르무즈_v0.11`): 인과경로 누적계수 테이블(계산식 명시·배경강조), 정산 3안 비교카드(AAP 추천 배지·고객부담 닷게이지·before→after), 자격 미니카드 그리드(수치+평가+출처), 재현성 박스(산정ID·기준일·규칙버전).
- **AI 어시스턴트 chat 패널**(우측 docked, Palantir AIP *AI FDE* 스타일, **v0.1=현황·시스템 Q&A만**): 운영자 질문→라이브 상태 기반 결정론 답변("진행 중 상담 N건"·"위약금 산식=42×79,000×10%=331,800"·"케이스 단계"·"무위약 조건"), 출처 인용·후속 칩. 시나리오 구동·FDE 저작보조는 차기.
- **시나리오 3종**(rental.js SSOT): B 해지·위약금(풀 viz+시뮬+HITL 불가역 경고)·A 조회(자동 종결)·C 명의변경(본인확인 게이트·가역 앰버). 케이스 탭 전환.
- **검증**: 헤드리스 dump-dom — 3뷰·chat·console error 0·neterror 0(상대링크 해석)·한글 0깨짐. 정적·동기 캡처로 대시보드·상담B·지식·도크 육안 OK. 시뮬 라이브 재계산 실측. 버그 1건 수정(정산 3안 grid `1fr` 중간카드 폭붕괴 → flex `1 1 0`). Edge 오픈.
- **미접촉**: `core.js`·`rental.js`·`index.html`·다른 app/ 팩(자체 라이브 엔진 내장 — core.js render는 surfaceSpec 전용이라 기진회 viz 부적합). 차기: chat 시나리오 구동·FDE 저작·Cytoscape 그래프·스튜디오/거버넌스 뷰·app/ 라이브 통합.

### 업무 분해 시연 v0_2 — 온톨로지·Lineage 탭 추가 (Palantir AIP 트리오) (260626, 직접 빌드) 〔데모·기획·UX〕
> `03_프로토타입/H_분해시연/aap_분해_시연_v0_2.html` (v0_1 → `_archive/`). v0_1 design-auditor 감사 **합격(구조·일관성 4.x)** + 우선 갭 수정 완료(노드 button·키보드 포커스·다크 타입라벨 밝은변형·결정점 색분리·이모지→Lucide·파이프 chip 색·엔진룸 순차 정직화[거짓 '병렬' 제거]·모달 ESC). v0_2 = 결과 화면을 **세그먼트 탭 3패널**로(① 분해·재구성 / ② 온톨로지 / ③ Lineage) — 사용자 명시 Palantir AIP Studio류(ontology manager·data lineage·pipeline builder) 중 빠졌던 둘 추가, 트리오 완성. **② 온톨로지(Ontology Manager)**: 각 case `ontology{objects(kind=entity/event/document/master, 색=기존 5타입 토큰)·links(from—rel→to)·touch(단계→객체)}`, 객체 클릭 드릴다운(속성·사용 단계). **③ Lineage**: 각 case `lineage{output·chain[role=source/transform/judgment/gate/output]}`, 산출물→상류 역추적 + provenance 색분리(원천=blue·결정론변환=teal·LLM판단=violet·게이트=amber)+"기록됨" 스탬프 → v0_1 block3(결정론 척추)을 실제 계보로 흡수·구체화. 데이터=Opus 4.8 생성 bake(라이브 ✕), 기존 `work[].ops`와 정합(재투영). 3 case 상이: 객체 5/5/4·Lineage 홉 quality 5(LLM 포함)/vendor 5/expense 4(LLM 판단 홉 없음)·단계 7/6/5·구성 15/11/9. a11y: 탭 role=tab·화살표 키·focus-visible. 헤드리스 3탭×3case error 0·한글 깨짐 0. 딥링크 `?seed=<case>&tab=<pane>`. **렌탈·app/ 미접촉.** 데이터 shape=Pack 스키마 정합 → Phase 2 app/ 라이브 LLM 이식 시 재사용(별도 승인).

### 렌탈 시연 HTML v0_2 — 명의변경(C) 흐름 추가 + 시각 마감 (260626, 유저 지시) 〔데모〕
> `03_프로토타입/G_렌탈/aap_rental_시연_v0_2.html` (직전 `v0_1` → `_archive/` 보관). **목적 재확정**: 이 산출물은 *시연 데모* — 기존 AAP의 **프레임만**(오퍼레이팅 루프·HITL 게이트·결정론 산식·근거 드릴) 빌리고 내부 세부는 안 가져온다(가져오면 시연이 아니라 풀 구현). `rental.js` = 데모가 쓰는 **검증된 수치·산식 SSOT** 역할로 동결. **`core.js`·voc·recruiting·meeting 등 모든 app/ 팩 미접촉.**
- **신규 시나리오 C(명의변경)**: 챗 칩 "정수기 명의를 가족으로 바꾸고 싶어요" + 자유입력 라우팅(`명의/양도/이전/넘기`). 흐름 = 계약 조회 → **본인확인 게이트(HITL)** → 확정 카드. 정수기 계약(R-2023-5519·월 29,900) / 양수인 정수민(가족·세대원) / 본인확인 2안(문자·카카오). **가역 행동이라 B(해지)의 빨강 "되돌릴 수 없어요" 대신 앰버 권한이전 안내**(`.dc-note`)로 톤 구분. 기존 `.decision-card`/`.opt`/`.kv-row` 재사용, 신규 스타일은 `.dc-note` 1종뿐.
- **시각 마감(실제 갭만)**: ①`.dc-note` 배경 `amber-soft`→**흰색**(카드도 앰버라 같은 색 겹쳐 박스 안 보이던 것, B의 빨강 경고처럼 대비 확보). ②HITL 게이트 하단 두 버튼이 420~460px서 줄바꿈 → `.btn{white-space:nowrap}` + 거부 라벨 "조금 더 생각할게요"→**"조금 더 볼게요"**(메모리 HITL 거부 표준 문구)로 통일(B·C 양쪽), 한 줄 정렬 확정.
- **검증**: 헤드리스 Chrome dump-dom — 칩 A/B/C/A2 전부 렌더·console/page error 0·한글 깨짐 0. C 게이트 카드 정적 캡처로 dc-note 대비·버튼 1줄 육안 확인. Edge 실브라우저 오픈. ⚠ 헤드리스 `--screenshot`는 페이지 타이머 구동 전 캡처되는 Chrome 빌드 quirk라 인터랙션 후 상태는 dump-dom/정적 캡처로 검증(스크린샷 직접 캡처는 신뢰 불가).
- **드롭**: 당초 검토하던 "rental.js 시드별 데이터 분기"는 core.js 중폭 변경(전역 `PACK.products` 참조·케이스 오버라이드 훅 없음, 전 팩 회귀 필요)이라 **시연 목적과 어긋나 폐기**(유저 확정).

### 디자인 폴리시 패스 + 인박스 상태 분산 (260626, aap-design·aap-platform · 감사 🟢·🟡#3 후속) 〔디자인 + 표준·정의〕
> govern 빈상태 수정에 이어 design-auditor 잔여 갭 처리. **제안 순서대로**: 🟢 폴리시 → 🟡#3 시드 분산.
> - **🟢#5 HITL 헤더 라벨 중복 제거〔디자인〕**: run 2열에서 좌 현재단계 카드(`ct-vd-h`=단계 라벨)와 우 `streamHitlCard`(`op-hc-t`=같은 라벨)가 단계명 중복. 우 HITL카드 제목을 단계명→**동사형 "결정하기"**로 축약(core.js streamHitlCard). 의미는 좌 카드가, 행동은 우 카드가. `op-hitl-tag`("결정 필요")·desc 유지.
> - **🟢#7 domain '개요' 정렬〔디자인〕**: `.wa` 2열 그리드에서 유형·목적이 반폭으로 나란히 떠 시선 단절. 둘 다 `.wa-row full`로 → 요청·유형·목적·산출물·확인지점 **단일 정렬 라벨-값 그리드**(core.js waBox). CSS 0.
> - **🟡#3 인박스 status/progress 분산〔표준·정의〕**: 디자인(상태색·보더·진행바)은 이미 정상 → 원인은 **시드가 전부 같은 상태**. data-console 팩(procurement 13·expense 11·contract_a 4)이 시드를 전부 `atStep:'route_gate'`(검토대기)에 둬 인박스가 평평. **atStep 을 intake(접수)·check(진행)·route_gate(검토대기)로 분산**(procurement·expense=`i%3` 순환, contract_a=표준→check·스캔품질→intake·고위험2건 route_gate 유지). **게이트 demo 보존**: 케이스를 열면 `autoAdvanceOnOpen` 이 어차피 route_gate 까지 흘려보내 멈춤 → atStep 은 인박스 스냅샷일 뿐. 'done'은 meeting·voc·recruiting 이 이미 제공(data-console done 렌더 미검증이라 회피). recruiting.js 미접촉(타 세션 소유).
> - **검증(헤드리스 Edge --dump-dom, 깨끗한 프로필)**: 인박스 = 4개 상태 그룹 전부(접수 11·진행 9·검토대기 12·완료 3행, 35행 정상 렌더·JS에러 0). 분산 data-console 시드(procurement:1=진행·contract_a:1=접수) 정상 오픈. govern = `#opsEvalGlobal`에 `.ops-empty` muted·`eval-score`(red) 제거 확인. node --check core.js·procurement·expense·contract_a OK. ⚠ 이미 시드된 localStorage 는 seedKey 로 재시드 건너뛰므로 분산은 **신규/깨끗한 저장소**에서 반영(기존 사용자는 시드 삭제 후 재부팅 시).
> - **잔여 🟢〔후속〕**: #4 좌/우 세로 불균형(좌 보조블록=기능 증식이라 스킵)·#6 recruiting 정책값 amber 3색(recruiting.js=타 세션 소유 → aap-platform 후속).

### 업무 분해 시연 단독 HTML 빌드 — LLM 분해 캡처-재생 (260626, 직접 빌드) 〔데모·기획·UX〕
> 신규 `03_프로토타입/H_분해시연/aap_분해_시연_v0_1.html` — "AI가 요청 분석→워크플로우 분해→단계별 로직·근거→5타입 재구성" 시연하는 자기완결 단독 HTML(외부 src 0·Lucide 인라인·file:// 더블클릭). **목적**: app/의 분해(`proposeBreakdown` `pipeline.js:60`·`authoring.js`)가 입력 무관 고정 골격이라 "AI가 쪼갠다" 메시지와 어긋나는 진단 → 데모만큼은 *살아있는 분해*로. **결정**: 결정론을 숨기지 말고 **배치**를 바꿈 — 분해·판단=LLM(생동감)/실행·게이트·lineage=결정론(신뢰 증거로 전면). 데모=라이브 호출 ✕, **실제 LLM 분해(Opus 4.8 빌드 시점 생성)를 JSON bake해 재생**(키·프록시·지연 0). **3 case**(제조 품질 7단계·2게이트 / 거래처 심사 6단계·2게이트 / 경비 정산 5단계·1게이트) — 단계수·5타입 구성(15/11/9)·게이트 위치 전부 달라 *입력별 가변 분해* 1대비 증명(각본 아님 합격 기준). **UX**: 입력 선택→분석 파이프 애니(7단계)→분해 카드(작업·필요데이터·결정점·리스크+"왜 이 단계")→다크 엔진룸 재구성 그래프(작업T#→5타입, HITL 게이트 분절·병렬)→노드 드릴다운 모달(하는 일·읽는데이터·결과·"왜 이 타입"). 5타입 색 규율(teal/violet/cyan/blue/amber), 신규 hex 0. 딥링크 `?seed=<case>`·`?case=<case>`. 헤드리스 error 0·한글 깨짐 0. **렌탈·app/ 미접촉**. 데이터 shape=기존 Pack 스키마(work·compose·components·gates) 정합 → Phase 2: app/ `proposeBreakdown`을 라이브 LLM(Sonnet 4.6/Haiku 4.5)+결정론 폴백 교체 시 동일 스키마 재사용·세 입구 통합(별도 승인). design-auditor 감사 진행 중.

### govern 전역 Eval 빈상태 red 오용 제거 (260626, aap-design · design-auditor 감사 🟡#1) 〔디자인〕
> design-upgrade-base 미커밋 상태 헤드리스 9뷰 감사 = **회귀 0건**(중앙모달·run 2열 400px 근거레일·3노드 스테퍼·tb-back 모두 정상). 남은 최우선 갭 = 운영 콘솔(govern) **전역 Eval 블록이 실행 케이스 0건일 때 종합점수 "0"·4지표 "0%"를 red로 표시**(의미색 규율상 red=차단·위반·실패 전용인데 단순 무데이터를 알람처럼). 근본원인: `renderGovern()`의 `#opsEvalGlobal`에 빈상태 가드 없이 `_opsTone(G.score)`(p<60→red) 직접 적용 — 바로 아래 케이스 블록(`#opsEvalCases`)엔 가드(`.ops-empty`) 있어 두 블록 불일치.
> - **수정(core.js, ~3줄)**: 전역 블록에 `if(!em.ran.length)` 가드 추가 → 케이스 블록과 동일 muted 빈상태(`.ops-empty`=`--faint`, "아직 실행된 케이스가 없어…"). `_opsTone`·gauge·eval-score 마크업·RBAC·Agent Ops 불변. 신규 클래스·hex 0.
> - **동반 해소 🟡#2(빈상태 3종 불일치)**: govern 전역·케이스 + logs(`.tr-empty`, 이미 `--faint`)가 빈상태 토큰 1세트로 수렴(platform.css:2460~2464). 추가 변경 불필요.
> - **검증**: `node --check core/core.js` OK. Edge `?view=govern` 육안 — red "0"/"0%" 사라지고 muted 안내. 정상 데이터 경로(케이스 진행 후) 점수·게이지 복귀는 가드가 안 막음.
> - **분리 후속 🟡#3〔aap-platform/packs〕**: 인박스 status/progress 무변별 = **디자인 아님**. `.st-new/run/wait/done` 색·행 보더·진행바 색 이미 존재(platform.css:1288~1291·2382~2385). 모든 행이 같게 보이는 건 시드 데이터가 전부 동일 상태(wait·~50%)라서 → 시드 상태/진행 분산 필요.

### 가전 렌탈 시연 단독 HTML 빌드 + 감사 갭 반영 (260625, aap-platform·aap-design) 〔데모〕
> 신규 `03_프로토타입/G_렌탈/aap_rental_시연_v0_1.html` — 가전 렌탈 고객 셀프서비스 상담 **시연 버전**. 자기완결 단독 HTML 1개(외부 src 0·CDN 0·Lucide 인라인 SVG·file:// 더블클릭). 데이터·산식은 `app/packs/rental.js` 원본 재사용(잔여 42×79,000×10%=331,800 / 표준 461,800·부분 295,900·무위약 30,000, 합 검증 일치). **시연 3계명 골격**: AAP 내부구조 노출 0(8계층·5타입·엔진룸·캐논 단계명 화면 0)·단일 콘솔(좌우 2분할/우측 레일 0, 모바일 셀프서비스 스트림 1컬럼)·고객 자율(칩/자유입력 시작, 자동재생 레일 0). 시나리오 A=단순문의 자동 종결(멈춤 0) vs B=해지·위약금 멈춤(accordion 근거 펼침→amber HITL 멈춤 카드 "해지가 확정되면 되돌릴 수 없어요"→정산 3안 사용자 선택→green 확정). design-auditor 감사 3계명 전부 합격 후 미세 갭 3종 반영: ①welcome→상주 인사 버블(empty-state) ②done 후 후속 칩("처리 현황 보기"·"다른 문의") ③표준 정산 자가설명 1줄("위약금 331,800 + 설치·철거 130,000 = 461,800"). 헤드리스 page/console error 0·A·B 동작·한글 깨짐 0 재검증. 색 5색 규율(teal·amber멈춤·green완료·red경고·slate) 준수, 신규 hex 0. app/ 미접촉.

### 가전 렌탈 시연 단독 HTML 감사 (260625, design-auditor) 〔디자인·감사〕
> `03_프로토타입/G_렌탈/aap_rental_시연_v0_1.html` 헤드리스 6상태 캡처 감사. **시연 3계명 전부 합격**(AAP 내부구조 노출 0·단일콘솔·고객자율 A자동종결/B해지 게이트+"되돌릴 수 없어요"). 색 5색 규율 준수(teal·amber멈춤·green완료·red경고·slate). 갭=경미: ①welcome→첫응답 빈 stream(empty-state 약함) ②done 후 후속 칩 안내 없음 ③kv 라벨/값 모바일 줄바꿈 여유 ④total 위약금=331,800인데 옵션 표준=461,800(설치·철거 포함, 본문 설명은 있으나 점프 체감) — 수정은 aap-design 권고표 참조. app/ 미접촉.

### ②-후속 · 도메인 팩 카탈로그 카드 모노톤 정합 (260625, aap-design · design-auditor 감사 🔴#2) 〔디자인〕
> 감사 🔴#2: `.cat-card`가 상단 3px 타입색 띠(5종) + 카드 안 `.ty-badge` 타입색 채움 pill을 유지해 ②의 모노톤 전환(stream 카드 v0.4~0.5)과 불일치. ②의 "중립 칩 + 선행 `--type-*` 색 dot 하나" 패턴을 동일 적용. **CSS(`core/platform-fix.css` override)만 · 구조·DOM·JS 불변 · 신규 hex 0(--type-* 토큰).**
- **(1) 카드 상단 보더**: `.cat-card.tA..tP` border-top-color(teal/violet/cyan/blue/amber) → `var(--border)` 중립. `.cat-card.is-draft` dashed 보더는 우선순위 보강으로 유지.
- **(2) 카드 안 badge**: `.cat-card .ty-badge`·`#catPrevTitle .ty-badge` 채움(color/bg/border) → 중립(`--muted`/`--surf`/`--line`, ②의 se-op 타입배지와 동일 톤). 타입 식별 = 선행 `::before` 색 dot 하나(기존 1806 currentColor → per-type `--type-*` 재지정 + catPrev에도 동일 dot 부여).
- **⚠ 회귀 가드**: `.ty-badge`는 인박스(`.ibx-t`)·`typeBadge()` 등 재사용 → override를 `.cat-card`/`#catPrevTitle` 스코프로만 한정. 인박스 badge 미접촉.
- **검증(헤드리스 Edge, `?view=domain`·`?view=inbox`)**: domain = 카드 상단 띠 전부 중립·badge 6종 중립 칩+타입 dot 하나(teal/violet/cyan/blue/amber)·미리보기 badge 동일. inbox = `.ibx-t .ty-badge`(경비·지출/구매·조달 등) 원래 소프트 채움 그대로·필터 칩 dot/카운트 무변화 → 회귀 0.

### 새 Domain Pack — 가전 렌탈 고객상담 (rental) (260625, 유저 지시) 〔표준·정의 / 데모 한정〕
> 회의 데모가 BD·임원 피드백으로 폐기 → "거래성(해지·위약금=되돌릴 수 없는 결정)+고객특정+write-back+HITL 필연"을 만족하는 **세라젬형 가전 렌탈 상담**으로 전환. voc.js 구조(intake→triage→execute+HITL)가 이미 원하는 형태 → 도메인만 통신→렌탈로 리스킨.
- **신규 `app/packs/rental.js`** (voc.js 템플릿 복제·리스킨, 인터페이스 동일: 데이터 5종 + surfaceSpec / FLOW 7단계 캐논 / TIMES·SEEDS·COMPOSE·COMPONENTS·GOVERN). **코어 로직 수정 0**.
- **시나리오 2종 대비 = "왜 agentic인가"의 답**: ① A 단순조회(윤재호 "다음 결제일·약정 만료") = read-only·자동 종결(HITL 없음) ② B 해지·위약금(정수아 안마의자) = write-back + HITL 2관문. SEEDS 3종(B@approve / A@request / 명의변경 done).
- **결정론 숫자(소비자분쟁해결기준, 합 검증)**: 잔여 42개월×79,000×10% = 위약금 331,800 / 등록비 100,000 / 철거비 30,000. 정산 3안 = **표준 461,800 / 부분(위약금50%) 295,900 / 무위약(이사 무관리지역) 30,000**. `extExcluded`(approve='no'→'위약금 감면') = voc 의 하향 분기 패턴 재사용.
- **빌드 가드레일 2개 준수**: ① 좌측 surface = '상담 건 처리 화면' 하나에 집중 — 인박스·로그·거버넌스 운영관리 UI는 좌측서 제외(셸 다른 뷰 소관, voc 와 동일하게 surfaceSpec 만). ② HITL 게이트①에서 사용자가 **정산 3안 직접 선택** + "해지는 되돌릴 수 없습니다" 명시 → 자동재생 레일이 아닌 사람 결정. 게이트② 발송 승인.
- **셸 등록(surgical)**: `index.html` 에 `<script src="packs/rental.js">` 1줄 추가(voc 다음). `core.js` `SEED_PACK_IDS` 에 `'rental'` 추가 — **신규 팩은 기본 draft 라 인박스 시드가 안 깔리는 메커니즘**, voc 처럼 deployed 시드로 노출. (등록 allowlist 1토큰, 코어 로직 불변.)
- **검증(헤드리스 Chrome + Edge)**: A·B 둘 다 렌더 OK, **page error 0**. B 가 approve 게이트에서 정지 → HITL 모달 정산 3안(461,800/295,900/30,000) 선택 + 위약금 근거(42×79,000×10%)·자료 드릴 정상. A 는 1/7 상담 접수서 계약·사용이력 패널 표출. ⚠ 헤드리스 rAF 스로틀로 `autoAdvanceOnOpen` 자동진행이 compose(3/7)에서 멈춰 보이나 **voc(known-good)도 동일** → 렌탈 결함 아님(실브라우저/Edge 정상).
- 남은 이슈: rental SEEDS 의 PRODUCTS(계약·이력 등)는 시나리오 B(정수아) 기준 데이터 1세트 공유 → A(윤재호)·done(배수지) 케이스는 헤더·요청텍스트만 다르고 우측 산출물은 B 데이터 표출(voc 와 동일 한계). 시나리오별 데이터 분기는 차기.

### run 셸 전 유형 통일 — 계약·구매·경비 (260625, 유저 (A) + design-auditor 감사) 〔표준·정의 + 로직〕
> aap-design-auditor 1회 감사 🔴#1: "run 콘솔 본문 골격 3종(회의=좌작업/우결정 · 계약=상단 임계밴드+슬롯 · 채용=3카드). inbox→detail→action→audit 4존 중 action 위치가 화면마다 이동." 유저: "(A) 계약·채용까지 셸 통일."
- **데이터콘솔(계약·구매·경비) 셸 = 회의와 동일화**: ① `dcMain`=슬롯만(판정카드+HITL바 제거) ② 새 `dcDecision`(판정카드+HITL)을 `dcAside` 상단으로 → **우=결정·근거 레일**(회의 streamHitlCard 와 같은 자리) ③ `renderDataConsole`가 `dcSteer`(임계 튜너)를 **main 상단에 흡수**(`{main:dcSteer+dcMain, aside:dcAside}`) → 떠있던 floating steer 밴드 폐지. platform-fix.css: `.op-main .op-steer` band-centering 무력화 + 인라인 카드 외형.
- **결과**: 전 유형 「상단 strip → 좌 본문 / 우 결정·근거 aside」 1셸. 계약(자동승인)·구매(반려) 헤드 검증 — 판정카드·HITL이 우측 레일로, 상단 밴드 0.
- **채용(recruiting) 게이트까지 통일 확인**(유저 "확실히 통일"): recruiting `opstage`(878) 단계별 분기 — **3 게이트 전부**(shortlist 745·interview 825·offer 867) HITL을 이미 **aside `op-hitlcard`로** 렌더(회의 streamHitlCard·계약 dcDecision 동일 패턴). 단 매칭 단계서 **steer 밴드 보유**(opMatchSteer)였음.
- **steer 흡수 일반화**(핵심): `renderOpConsole` 가 `op.steer` 를 **`op.main` 앞에 prepend**(opSteerSlot·band 폐지) → 계약·구매·경비 **+ 채용**까지 steer 전부 main 상단 인라인 카드(`renderDataConsole` 는 steer 다시 분리 반환). → **전 유형·전 단계·전 게이트 단일 셸 완성**. 헤드 검증: recruiting shortlist_gate(좌 임계인라인+후보랭킹 / 우 '숏리스트 확정' HITL카드+근거)·계약·회의 무회귀.
- **부수**: `?step=<stepId>` 딥링크(boot) — 열린 케이스를 특정 단계로(게이트면 await 정지). 헤드리스 게이트 검증·design-auditor 게이트 캡처용.
- 회귀 안전: dc* + renderOpConsole steer 흡수 + skeleton(opSteerSlot 제거). stream(streamFocus)·recruiting surface 본문 미접촉.

### 케이스 콘솔 — 상단 압축 + 좌→우 복원 (260625, 유저 검토승인 plan) 〔표준·정의 + 로직 / ②=디자인〕
> 유저: "아직 위→아래(산출물 아래). 좌→우여야. 상단 4겹 너무 많음. 8단계 좌측정렬 불필요. 시연버튼 불필요." → 검토 후 plan 승인(순서 ③⑤④①②).
- **Round A (③⑤④ 상단 압축)**: 상단 크롬 **4겹→2겹**. ①상단바 1줄 통합(`#tbBack` '내 업무'를 topbar로, 케이스명 좌측, `body.run-active`서 부제 숨김, 46px) ②`.runtop{display:none}` 폐지(시연버튼 처음/이전/다음/중단/"결정하기"=BD용 발표컨트롤, 제품 UX 아님) ③`opStageStrip`=8노드 전체→**직전·현재·다음 3노드**(옛 renderSeq 패턴) + 같은 줄 우측 인라인 요약(요청·진행). `#opSumSlot` 폐지(요약을 strip 줄로). 헤드 검증: meeting·voc·contract·inbox 정상.
- **Round B (① 좌→우 복원)**: `streamFocus` main의 산출물 그리드(`ws`) **제거** — aside(streamArts)에 이미 산출물 탭·뷰어 존재(중복이었음). main을 **이 단계 작업 내역(`flow[ci].ops`: 구성요소타입·feed→out·detail 표, `evidType`/`_TYKO`/`se-op` 재사용)**으로 채움. → **좌=지금 AAP가 하는 일 / 우=산출물** 분리. streamArts 미접촉(채용 세션 충돌 회피). 헤드 검증: 회의·VOC 좌→우 정상.
- **남은 ② (디자인 토큰)〔디자인·aap-design〕 ✅완료**: 아래 'stream 하는 일 카드 본문 모노톤 정합' 항목 참조.

### 케이스 내부 화면 = 전 유형 단일 프레임(B) 통일 (260625, 유저 직접지시) 〔표준·정의 + 로직〕
> 유저 진단요청: 인박스→케이스 진입 시 "유형마다 내부 화면이 다 다르다 · 어떤 건 위>아래, 어떤 건 좌>우, 너무 복잡". 같은 유형 일관 + 유형 달라도 큰 틀 일관(세부 프로세스·화면은 달라도 됨)을 원함.
- **근본원인**: `renderConsole`의 `hasOpSurface(C)` 한 줄이 **두 골격** 분기 — ⓐ 스트림(`streamSplit`, 위>아래 타임라인, 상단 strip 無): 회의·VOC / ⓑ 조작형(`renderOpConsole`/op-split, 상단 strip + 좌 main/우 aside): 채용·계약·구매·경비. + surface 렌더 경로 3종(`surface`함수 / `surfaceSpec` / 코어 `renderDataConsole`).
- **표준 = B 프레임으로 통일**: 전 유형이 「상단 단계 strip → (steer) → 좌 main / 우 aside」 골격 공유. 고정=골격, 가변=main/aside 콘텐츠·단계 라벨/개수.
- **구현**(core.js, 최소 디프): `opstageOf()`에 stream 폴백 추가 — surface·dataConsole 없어도 `flow` 있으면 `{main:streamLeft, aside:streamArts}` 반환 → 회의·VOC도 op-골격 렌더. `renderOpConsole`에 `wireStream` 배선. platform-fix.css 6줄(op-main/aside 안 stream 콘텐츠 이중패딩·중복보더 무력화). **신규 콘텐츠 0줄**(기존 streamLeft/streamArts 재사용).
- **동반효과**: 회의·VOC가 `ws-on-op` 클래스를 받게 되어 aap-design의 op-console 디자인 폴리시(strip·steer·360px aside 레일)를 **자동 동반 적용** → 프레임·디자인 동시 통일.
- **2차(유저 선택 "현재단계 초점 재구성")**: 회의·VOC main = `streamLeft`(전 단계 feed) → **`streamFocus`로 교체**. 결정콘솔 dcMain 과 같은 척추 = ①이 건 요약(요청 원문·진행 N/N) ②현재 단계 카드(ct-vd 톤·HITL 표식) ③게이트면 결정 바(op-hitlbar). **상단 strip 과 중복되던 '전 단계 나열' 폐기** → 채용·계약·구매와 main 구조 일관. 새 CSS 0(기존 ct-/op- 클래스 재사용). aside=산출물(strm-arts) 유지. 헤드리스 캡처 검증 완료(회의·VOC 동일 구조).
- **부수**: 시드 케이스 딥링크 `?seed=packId:index` 추가(core.js boot) — 공유·데모·헤드리스 검증용(케이스 id 비결정적이라 안정 seedKey 로).
- **3차(유저 "계속 진행" — recruiting 오리엔테이션 일관)**: 마지막 비일관 = 첫 화면 오리엔테이션(회의·VOC·계약은 '이 건 요약'으로 시작, recruiting은 곧장 분석 카드). recruiting ATS/분석 surface는 좋은 도메인 콘텐츠라 **뭉개지 않음**(유저 "화면 달라도 됨"). 해법 = recruiting.js(채용 세션 소유) 미접촉, **코어에 전 유형 공통 '이 건 요약' 밴드 `opCaseSummary` 추가** — op-skeleton surfHead 에 `#opSumSlot`(strip 아래), 케이스 title·요청 원문·진행 N/N 한 줄. 회의·VOC·계약·**채용 4유형 전부 동일 오리엔테이션**(헤드리스 캡처 검증). 얇은 1행(aap-design 높이 압축 비충돌). streamFocus 의 자체 '이 건 요약' head 는 밴드와 중복이라 제거 → `return cur`.
- ⚠ **실시간 충돌 봉합**: streamFocus 를 **채용 세션이 동시 리팩터**(HITL 좌측 gatebar → 우측 aside `streamHitlCard`/streamArts, return `${head}${cur}`). 이 세션이 같은 함수의 head 를 제거 → `head` undefined 런타임 에러 발생 → **즉시 reconcile**(return `${cur}`, 요약=코어 밴드·HITL=채용 세션 aside 카드 양립). **core.js 동시 편집이 실제 breakage 유발 확인** — 이후 core.js streamFocus/streamArts 는 채용 세션 단독 편집 권장, 이 세션은 코어 밴드(opCaseSummary)·opstageOf·skeleton 까지만.
- **4차(유저 정색 "내가 요청한 걸 만족스럽게 못 함" → "너가 해봐")**: 핵심 오진 시인 — 2차에서 회의·VOC main 을 '카드 1개'로 만들며 **풍부한 도메인 데이터(perStep·ws·products)를 버려 휑하게** 만듦. 계약은 슬롯 그리드로 꽉 찬데 회의는 비어 → 여전히 "다 다름". **진짜 해법 = streamFocus 재구성**: ①현재 단계 카드에 단계별 작업뷰(`surfaceSpec.perStep`: overview rows / track / hint) 추가 ②**이 건의 산출물 그리드**(`surfaceSpec.ws` → ct-slots, 계약 슬롯과 동일 밀도 · 준비된 항목 값+보기/미준비 '준비 전'). 회의=참석자6·자료4·안건6·초대장·회의록 / VOC=고객이력·원인·보상안·응답·티켓. **네 유형 모두 「현재단계 카드 + 정보/산출물 그리드」로 밀도·구조 수렴**(헤드리스 검증). 새 CSS 0(ct-/od-/wl- 재사용).
  - 교훈: 프레임 통일 ≠ 내부화면 일관. **각 유형의 풍부한 데이터를 살려 같은 구조에 채워야** 함(데이터 버리고 단순화 ✕).
- **후속(deferred, ponytail)**: ⓐVOC 게이트 단계는 산출물 대부분 '준비 전'(데이터 정확하나 시각적으로 빈약) — ready 항목 우선/요약 검토 ⓑstrip 단계 라벨 캐논 ⓒstream aside 톤.

### 전체 디자인 = 미니멀 모노톤 전환 v0.4~v0.5 (260625, aap-design · 유저 직접지시) 〔디자인〕
> 유저 피드백: v0.3 시각변화 미미("하나도 안 바뀜"). 원인 = ① 1px 미세조정 no-op ② 이미 밝은 UI에 모노톤은 원래 미묘. 유저 방향 선택 = **미니멀 모노톤(Linear 정수)** + "확 바뀌게" = 색만 빼지 말고 **구조 전환**.
- **v0.4 모노톤 시스템**: `--shadow` 하인라인(전 뷰 그림자↓), 상태배지=중립 pill+색 dot 하나, 진행바·타입칩·타입배지·nav active 중립화, **teal=주액션·nav 인디케이터만**.
- **v0.5 구조 전환**(인박스): 분리 카드 무더기 → **상태별 1패널 안 평면 리스트**(행=하인라인, 검토대기=좌측 슬레이트 레일), 타이포 타이트. = before/after 명확.
- **단일 writer 분담 확정**(유저 승인): **디자인·CSS=aap-design(이 트랙) / 로직·구조=채용 세션(core.js·recruiting.js)**. platform.css=디자인, platform-fix.css=채용 → 상호 비간섭. [[feedback-single-writer-app]]
- **남은 후속**: 잔여 뷰(run·workflow·govern·domain pack) 색 채움을 같은 시스템으로 확장(헤드리스 캡처 불가 → 유저 클릭 검토 기반). 신규 hex 0·DOM/JS훅 불변.

### ② 디자인 토큰 마감 — stream "하는 일" 카드 본문 모노톤 정합 (260625, aap-design) 〔디자인〕
> 유저 지적: 계획 승인 'ct-vd 하는 일' 카드 아래 텍스트(`comp` 타입칩·`se-op` 타입배지)가 타입색 채움이라 모노톤(v0.4~v0.5)과 톤 불일치. = Round A/B 후 남은 ②. **platform-fix.css 만 수정**(구조·DOM·data-*·JS 불변, 신규 hex 0·토큰만).
- **원칙 = monochrome system 그대로**: 채움 ✕ · 텍스트 중립 · **5타입 식별은 "색 dot 하나"로만**(`--type-*`) · 상태(ok/warn/info)는 단일 악센트(아이콘 칩 하나) · teal=주액션만.
- **(A) `se-op` 타입배지**: `.se-op-ty.tyA{color:aap-ink;background:aap-soft}…` 멀티색 채움 → `background:--surf · color:--muted · border:--line` + 선행 `::before` 색 dot(`--type-agent/module/solution/connector/policy`). 텍스트 중립, 타입 식별=dot. "조합된 구조"(KEY MESSAGE) 증명 유지.
- **(B) stream `comp` 칩**(`.ct-vchips .comp`): 큰 카드 스타일(r13·pad12) → **타이트 중립 칩**(`--surf`·`--border`·`r-pill`·slate 텍스트) + `ty*` 선행 색 dot. bare `.comp`(ps.track 체크 칩)는 dot 가드(없음).
- **(C) `ct-vd` 카드**(stream·결정콘솔 공유): warn/ok 전체 색 워시 → **중립 카드**(흰 표면·얇은 중립 테두리·ink 헤더·중립 tag·중립 basis). 상태=**아이콘 칩 하나만 악센트**(amber=HITL게이트·green=완료·info=중립 faint). risk 만 헤더 red 유지(차단/위험 신호 예외).
- **검증(헤드리스 Edge 1440)**: meeting:0(계획 승인 gate)·voc:0(대응안 승인 gate)·contract_a:0(자동승인 verdict)·recruiting:0 캡처 확인. before=amber/teal 채움 → after=중립 카드+칩+dot. **회귀 0**: contract ct-vd '자동승인'도 green 워시→중립+green 체크 아이콘으로 동반 개선, recruiting 은 자체 surface(`wp-op-*`)라 미영향, VOC=meeting 과 동일 톤. 브레이스 균형(289/289).
- **스코프 밖(의도 유지)**: 우측 aside `op-hitlcard`("결정 필요" amber 카드)=HITL 게이트 요약(amber=게이트 정당) · 근거 4유형 색 키(`.ev-k`·`.ev-dot`·`.op-tdot`=드릴 모달/그래프 식별) 불변.

### 인박스 운영 콘솔 시각 고도화 — platform.css `aap-design v0.3` override (260625, aap-design · 유저 직접지시) 〔디자인〕
> 유저 요구: index.html(운영 콘솔)을 상용 SaaS 수준으로 — 인박스→상세→액션 흐름. 클라우드 예약 루틴이 push 실패(CCR 임시환경 권한)로 산출물 유실 → 로컬 aap-design로 직접 수행. **platform.css 말미 append만**(DOM·id·class·JS 셀렉터 불변, 신규 hex 0·토큰만).
- **(a) 인박스 카드 밀도·위계**: 행 패딩/갭 압축, 제목 위계(자간), 메타 1줄 tabular·말줄임, 진행 막대 슬림+% tabular. (Linear 인박스·shadcn Tasks 패턴)
- **(b) status badge·chip 토큰화**: `--bdg-pill/py/px/fs` 신규 → `.ibx-st`·`.ty-badge`·`.hd-status` 라운드·크기·자간 통일, 검토대기 행 amber 강조. (Tabler)
- **(c) detail sheet 전환**: run 진입 fade+slide(`rsheet-in`)+reduced-motion 가드. (shadcn Sheet)
- **(d) HITL command bar 위계**: `.op-hitlbar`/`.op-hbtn` elevation, cmodal 주/부(primary/ghost) 위계. amber=게이트 규칙 유지.
- **(e) empty/toast 일관성**: empty 중앙정렬·여백 통일, toast 좌 teal 액센트.
- **검증**: 헤드리스 Chrome 1440×900, 인박스 35건 렌더 정상·콘솔 에러 0·JS 훅(`#inboxList`·`.ibx-row`·`[data-open]`·`.ty-chip`·`[data-view]`) 보존.
- **⚠️ 동시 편집**: 본 작업과 아래 '채용 RUN 서피스' 세션이 같은 날 app/ 동시 편집 — 파일은 분리됨(이 작업=platform.css만 / 채용 세션=core.js·recruiting.js·platform-fix.css). 커밋도 platform.css만 격리. [[feedback-single-writer-app]] 충돌 사례.
- **스코프 밖**: 인박스 카드 '요청자/마감/현재 Agent 단계/HITL 필요' 신규 필드는 core.js 렌더 DOM에 없어 미적용(편집 금지) → 필드 신설 시 aap-platform 트랙 core.js 협의.

### app/ 채용 RUN 서피스 개선 — 진행 중 (260625, 이 세션이 유저 직접지시로 app/ 편집 · ★단일 writer 양해)
- **유저 6대 피드백(채용 RUN 화면)**: #1 새업무 팝오버가 다른 장면에도 잔존 / #2 새업무 화면=텍스트만→유형 분류·제시 / #3 업무 순서 2줄 wrap·기준 패널 등 케이스 진입 레이아웃 엉망 / #4 HITL 모달 강제 재검토(본화면+세부만 모달) / #5 판단 근거·로직 안 드러남.
- **완료(검증)**: **#1** `setView`·`openCase`에 `closeNewCase()` 추가(뷰 전환·케이스 진입 시 팝오버 닫힘). **#3** `.op-strip` `nowrap`+가로스크롤·`.op-snode` 컴팩트(9단계 2줄 wrap→단일 라인) + **`.op-steer{align-items:stretch}`**(우선순위·필터·면접범위 3박스 높이 레벨 맞춤). platform-fix.css. 헤드리스 검증(`?pack=recruiting`+`AAP_CORE.load('recruiting');go('screen'/'interview')`) OK.
- **재진단(중요)**: **근거·로직은 없는 게 아니라 단계별로 노출이 들쭉날쭉.** 면접 조율(interview)=캘린더 교차 근거·HITL이 **본 화면 인라인**으로 잘 나옴(좋은 모델). 반면 매칭/스크리닝(screen)=후보 근거(candDetail)·`evidDrill`(근거 4유형)이 **모달/aside에만**. → #5 = 매칭 단계 후보 근거·로직을 interview처럼 본 화면 인라인 + 세부만 드릴.
- **진단(중요)**: 근거·로직 데이터는 채용 팩에 **이미 풍부**(WORK ops `ev{data,rule,logic}`·detail 테이블·컷 시뮬·verdict basis) — 단 **RUN 서피스가 아니라 모달(HITL gate·done)에만** 올라옴. opstage=`{steer(op-steer 기준),main(op-wh 후보랭킹+op-hitlbar 인라인 HITL),aside}`. 후보=막대(스킬/경력/도메인 매칭 기여)+토큰, 그러나 산식·컷·가중 '왜'는 안 드릴.
- **#5 1차 완료(검증)**: 매칭 후보 행(`matchRows`)에 **판정 칩(통과/보류/탈락=`screenVerdict(c)`)+이유(why)+기여(스킬·경력·도메인 contrib)+'근거 보기' cue** 인라인 추가(`.op-rv/.op-rwhy/.op-rbd-t/.op-rmore` platform.css L661). DOM 검증 OK. 판단 근거·로직이 모달뿐 아니라 본 화면에.
- **#2 완료(검증) + ★선행 버그 복구**: 새업무 오버레이 빈 상태에 **자주 맡기는 업무 칩**(`deployedPackIds`→타입 토큰 칩, 클릭=`createCase` 바로 시작) + 자유입력 안내. `renderNcReco` 빈 분기. **근본 원인 발견·수정**: `aee71a7`(On-Ramp ①②③) 커밋에서 `_tokens`·`packKeywords`·`NC_MIN_HITS/SCORE` **헬퍼 블록이 통째 유실** → `matchPackByText`가 `_tokens is not defined`로 throw → **On-Ramp 유형 인식 전체(텍스트 입력 인식·칩·명확화)가 죽어 있었음**. 3정의 복구(core.js, matchPackByText 직전). 검증(헤드리스 로컬서버+iframe 덤프): 빈 상태 칩 6개, "채용 후보 이력서 스크리닝…" 입력→`채용` top 인식, 에러 0. (renderNcReco는 `_renderNcRecoBody` try/catch 래퍼로 분리 — 단일 에러가 빈 메뉴로 침묵 실패하지 않게.)
- **#4 완료(검증) — 본 화면 인라인 HITL + 세부만 모달**: 게이트 도달(`C.S.sel===gateId && await`) 시 op-hitlbar에 **gate.decisions 결정 버튼 인라인**(`data-decide`→`AAP_CORE.decide`) + **'세부 기준 보기'**(`data-gatedetail`→컷·가중·통과 미리보기 모달만). 코어 **가산 훅 2개**: `currentCM`에 `suppressGateModal(S)` 체크(훅 있으면 게이트 모달 자동 노출 ✕·인라인) + `AAP_CORE.decide(v)` 노출. recruiting `gateInlineBar()`(3게이트 공통: shortlist/interview/offer), `suppressGateModal:(S)=>!S.recrGateDetail`, `recrGateDetail` transient. **meeting 등 훅 없는 팩=원래대로 모달(무회귀)**. CSS=platform-fix.css(`.gate-await/.op-hitl-acts/.op-hitl-tag/.op-hbtn.alt/.ghost/.sm`). 검증(헤드리스 자동전진→shortlist_gate await): `cmodal.show=false`+인라인 결정 2개("이 기준으로 스크리닝/컷 좁히기")+세부 클릭→`cmodal.show=true`+edcut 4개.
- **2차 피드백(260625) 반영**: (1) 새 업무 오버레이 **× 닫기 버튼**(`ncm-x`→closeNewCase) + textarea `resize:none`. (2) **옵션 패널 컴팩트화** — `.op-sg`를 `flex-direction:column`(세로 박스 쌓임·공간 낭비) → **가로 칩 행**(라벨+칩, 박스 보더 제거), 스텝 네비 추가 압축(노드·번호·화살표↓). 옵션 패널 ~200px→~60px, 후보 더 많이 노출. (3) 근거=행 인라인(verdict+이유+기여)+'근거 보기' 모달(기존 #5 유지). (4) **옵션 변경 피드백** — `wireSteer` 비-instant 분기가 `meta.toast`를 안 띄우던 것 수정 + 가중·필터 steerHook에 **before→after 결과 토스트**("시니어만 적용 · 후보 10→6명", "도메인 중시 우선 반영 · 면접 대상 6→7명 · 1순위 …"). 옵션은 원래도 동작했으나(재분석 ~6초·인-서피스 오버레이라 체감 약함) 토스트로 '먹혔다' 신호 명시. 검증(헤드리스): senior 클릭→.on=true·목록 10→6·토스트 텍스트 OK. CSS=platform-fix.css, JS=core.js·recruiting.js.
- **3차 피드백(260625) 반영**: (1) **새 업무 요청 = 중앙 모달**(앵커 팝오버 ✕) — `promptNewCase`에 `.nc-backdrop`(딤+중앙)+`.nc-modal`, 백드롭/×/Esc 닫기. (2) **HITL 결정을 우측 aside로** — run 콘솔 **2컬럼 복원**(`[SINGLE-COLUMN]` 강제블록 → main 좌·aside 우 400px·≤1280 스택). `gateInlineBar`(main) → `gateDecisionPanel`(aside, 게이트 await만): 3 aside(opMatch/opIv/opEval) 상단 결정 패널 sticky, main에서 제거. (3) **옵션 변경 = 결과 모달** — `wireSteer` onDone이 `STATE.reResult`→`currentCM 'reresult'`→`reResultModalHtml`(전/후 diff + 단계별 판단 로직·근거), wide. recruiting weight/filter steerHook에 `diff[]`+filter `steps[]`. **모달 확대**(cmodal-card 360→440~680, wide→880). 검증(헤드리스): (1) backdrop+chips6+닫기, (2) aside 결정2+세부1, (3) 결과모달 wide+diff3+logic4. 무회귀: expense·meeting 2컬럼·에러0. (aside HITL=recruiting 전용·meeting은 모달 유지)
- **4차 피드백(260625·옵션B 확정) 반영 — 우측=산출물+HITL요약 / 결정·근거=카드클릭→모달**: 사용자 질문(AskUserQuestion) 결과 옵션B 선택. (a) 우측 HITL을 **인라인 결정버튼 → 요약 카드**(`gateSummaryCard`, `.op-hitlcard`)로: 게이트 await 시 amber 카드("결정 필요"+요약), 클릭(data-gatedetail)→`recrGateDetail=true`→**'hitl' 결정 모달**(결정버튼+컷·가중 편집+미리보기, 이미 완비). 자동 모달 ✕(suppressGateModal 유지). (b) **산출물 리스트**(`productsAside`, `.op-prods`) 우측 추가 — PRODUCTS 중 `readyAt` 도달분, 클릭(data-dlv)→상세 모달. 3 aside(opMatch/opIv/opEval) 상단=HITL카드→산출물→그래프→근거. (c) 내부 근거=카드 클릭 모달(후보 candDetail·근거 evidDrill·산출물 product 전부 기존 모달). 검증(헤드리스): 우측 HITL카드+산출물·자동모달 false→카드클릭→결정모달(버튼2·"숏리스트 기준을 직접 정해 주세요"). 좌=후보 랭킹(작업). CSS=platform-fix.css, JS=recruiting.js.
- **5차 — 옵션B를 코어 generic surface(VOC·meeting·데이터 팩)에도 전파**: VOC에서 "고친 거 맞냐"(채용만 적용됐던 문제) 지적. VOC도 op-split 2컬럼이지만 **HITL이 좌측 streamFocus 인라인**이었음. `streamFocus`에서 게이트바 제거(좌=요약+현재단계), `streamArts`(우측) 상단에 **`streamHitlCard`**(HITL 요약 카드) prepend → 우측 HITL카드+산출물. 게이트 자동 모달 ✕(`revealOps` 게이트 분기 `baseOnly=true`), 카드 클릭=`openGate`(즉시 모달)/`gotoGate`(wireStream). 검증: VOC·recruiting 자동모달 false→우측 HITL카드 클릭→모달 true, 산출물 5탭.
- **남음(이어서)**: **#5-2** candDetail/evidDrill 세부(선택). VOC 좌 단계카드↔우 HITL카드 라벨 중복(정리 여지). ※2컬럼=260624 [SINGLE-COLUMN] 되돌림. ※게이트 자동모달 전역 ✕(카드/runAction 클릭으로만).
- **★레인 분담 확정(유저 조율)**: **이 세션=로직·구조(core.js·recruiting.js)+`platform-fix.css`** / **aap-design=디자인·CSS+`platform.css`**. base=main(9a1d00b) 고정(무손실). → 내 #5 op-rv CSS를 platform.css→**platform-fix.css로 이동**(platform.css 더 안 건드림; platform.css 잔존 op-rv는 aap-design이 정리, platform-fix override). 남은 내 작업: #2 새업무(core.js)·#4 숏리스트 gate 인라인(core.js·recruiting.js)·#5-2 candDetail/evidDrill(recruiting.js), CSS는 전부 platform-fix.css.


### 지시서 반영 ① 인박스 = 운영 콘솔 재설계 (코어, 260624) 〔기획·UX〕
> 외부 지시서 §1 반영. 인박스를 '티켓 목록'→**AAP가 개입 이유로 분류한 운영 큐**로. (지시서 10항 중 #1~#4·#11 일부)
- **caseBrief 인프라**(core.js): `REASON`(사람결정/정책위반/근거부족/자료부족/SLA/시스템반영/자동처리/진행) + `caseBrief(c)` = 팩 `inboxBrief(c)` 훅 우선, 없으면 **단일케이스(knowledge.route)는 순수 `evaluate(c.caseData,knowledge)`로 판정 도출**(REJECT→정책위반·LEGAL_REVIEW→사람결정·AUTO→자동), 그 외 상태 기반. 근거=verdict.inputs 중 슬롯 라벨만(임계키 제외).
- **renderInbox**: 상단 운영 요약 스탯(개입이유별 카운트·클릭필터) + **1차 필터=개입 이유**·2차=도메인 + `APP.reasonFilter`. index.html에 `#inboxStats`·`#inboxReasonFilter` 추가.
- **카드 재설계**(`_inboxStatusGroups`): 행→판단형 카드 = 제목+부서+도메인배지 / **개입 이유 칩**(색) / **AAP 판단 한 줄** / **근거 chip** / **액션 버튼**(검토·자료요청·예외·반려…). **삭제는 ⋯ 메뉴(hover)로** — 카드 기본 CTA에서 제거(지시서 1-5). `more-horizontal` 아이콘 추가.
- platform-fix.css `[INBOX-REDESIGN]` 블록(토큰만·신규 hex 0). 검증(헤드리스 1440): 스탯3·이유필터4·카드35·판단35·액션70·에러0. 단일케이스(경비/구매/계약)=evaluate로 실제 '반려/검토'+근거 자동. `node --check`·audit A=3 무회귀.
- **#2 완료**: 채용·회의 팩에 `inboxBrief(c)` 추가 — 단계(c.sel)·완료로 도메인 문장. 채용=숏리스트/면접/오퍼 게이트별 판단·근거·액션 + 진행/완료, 회의=계획승인(approve)/공유(commit)/진행/완료. 경비=evaluate 자동. 검증(헤드리스): 회의 3건 = 사람결정/진행중/자동완료 각기 다른 판단·근거·액션. `node --check` 팩 OK.
- **#3 완료**: 카드 클릭→Run 진입 시 **업무 브리핑 배너 먼저**(단계 직행 ✕, 지시서 #2·#6). index.html `#runBrief` + core `renderRunBrief()`(caseBrief 재사용: 개입이유 칩·제목·현재 단계·판단·근거·액션·접기). `.run-main` flex-row→column 전환(브리핑 위·surface 아래). openCase·afterStateChange 연결. 검증: 채용 진입 시 '사람 결정 필요 + 판단 + 근거 + 검토하기/기준조정' 전체폭 배너, surface 정상 하단. audit A=3 무회귀.
- **#4 완료**: Run 정보 위계 — 스테퍼 비중↓(지시서 §3). `[STEP-DEEMPHASIS]` CSS: 9단계 strip을 슬림 보조 진행으로(배경 바·보더 제거, 현재 teal·완료 점만 또렷, 대기 흐림). 클릭 되짚기 유지. 위계=runtop→**브리핑(현재 결정)**→슬림 스테퍼→작업→근거. 검증: 채용 진입 화면 위계 정상.
- **#5 완료 — HITL 절충(요약 인라인 + 조정 모달)**: 사용자 결정(가이드 §5.6 모달 ↔ 지시서 인라인 충돌 → 절충). `revealOps` 게이트 분기 `STATE.baseOnly=true` → **게이트 도착 시 덮는 모달 자동 표시 ✕**, 본문 인라인(브리핑+콘솔 판정/랭킹+'결정하기' 큐). "결정하기/기준 조정"=`openGate`(on-demand 모달). `AAP_CORE.openGate/atGate` 노출, recruiting 게이트 버튼=게이트면 모달·아니면 이동. decide()=토스트+트레이스+자동진행(결정 후 피드백). **가이드 §2-6·§5.6 정정(v0.9)**. 검증(헤드리스 전 도메인): 채용 4/9 인라인(modal:false)→결정하기→모달→확정→5/9 진행 · 경비(3/4)·회의(4/8) 자동덮기 차단+모달 도달, 제네릭 모달=verdict 확인(비어있지 않음). audit A=3·되짚기·삭제숨김 무회귀.
- **#8 완료 — 새 업무 요청 ↔ Domain Pack 생성 분리**: 인박스 On-Ramp 패널(`promptNewCase`)이 케이스 생성(유형 인식→`createCase`)과 팩 생성(격상)을 섞던 것 분리. `ncGoPromote`가 `setView('domain')`(스튜디오)로 이동 후 파이프라인 오픈. 패널 카피="…유형을 인식해 새 케이스를 만듭니다", 격상 버튼="스튜디오에서 새 유형 만들기", 스튜디오 버튼 라벨 "신규 격상"→"새 업무 유형 만들기". 검증: 격상 클릭→domain 뷰 활성. `node --check` OK.
- **#6 완료 — 동적 재계산 피드백 diff**: `runReanalysis` 오버레이에 **결과 diff(전→후)** 추가. `#rediff` 컨테이너 + finish()가 `opts.diff=[{label,from,to}]` 렌더("변경 결과", 변경값 teal 강조, diff 있으면 +1.5s 노출). `wireSteer`가 `meta.diff` 전달(누락 버그 수정). recruiting weight steerHook이 적용 전/후 `passCount`·`opRanked` 캡처 → diff. 검증: 우선순위 균형→도메인 시 "면접 대상 6명→7명 · 1위 정유진→정유진" + 4단계 판단로직(가중→재산출→재랭킹→컷 basis). audit A=3. (slotpref/panel 등 다른 steer 케이스도 동일 패턴으로 확장 가능 — 현재 weight 대표 구현.)
- **#7 완료 — 새 업무 요청 3-step 플로우**: `#newCaseBtn`→`openNewCaseFlow`(기존 promptNewCase On-Ramp 대체). 오버레이 `#ncFlow`: ① 유형 선택(deployedPackIds 카드 + `ncfDesc` 도메인 설명 + '직접 설명할게요'=matchPackByText 인식) → ② 요청 입력(자연어 textarea + 첨부 목업) → ③ **AAP 접수 미리보기**(업무 유형·요청·예상 실행 단계 `PACK.work`·**사람 결정 지점** `stIsGate` amber⚑·필요 입력 `io.inputs`) → [이대로 시작]=`createCase`→Run(브리핑 #3). `[NEW-CASE-FLOW]` CSS(토큰만·반응형 560). 검증: 채용 선택→9단계·3게이트 미리보기→시작→run 진입. audit A=3.
- **★ 지시서 8개 작업(#1~#8) 전부 완료.** 인박스 운영큐화·도메인 brief·진입 브리핑·Run 위계·HITL 절충·재계산 diff·새업무 3-step·팩생성 분리. 디자인 가이드 §2-6·§5.6(v0.9) 정합. 신규 hex 0·되짚기·삭제숨김·단일컬럼·결정론·A=3 전부 무회귀.

### run 콘솔 = 세로 1열 위→아래 "작동 흐름"으로 구조 전환 (260624) 〔기획·UX + 표준·정의〕
> 사용자: "비례·용어만 만져선 '전혀 다른 게 없다'. 너 판단으로 타당한 구조를 짜라." → 2열(좌 작업/우 얇은 근거)이 비례·반응형 문제의 **근본**이라 판단. **구조 결정**: run 콘솔을 **세로 1열·중앙 캡(960/1040px)** 으로, 위→아래 작동 흐름이 본문. AAP 주인공 = 작업 카드가 아니라 **'판단·근거가 입력 따라 살아 움직이는 것'** → steering(무엇으로 판단) 위 → 출력(랭킹/결과) 아래. v0_58 우측 패널 톤, 좌/우 분할 ✕.
- **CSS만**(`platform-fix.css` [SINGLE-COLUMN] 블록): `.op-split`을 모든 너비에서 `flex-direction:column`·`--op-col` 중앙 캡. 우 `.op-aside`(근거 레일) → 본문 아래 **인라인 섹션**(좌보더·배경 제거, 위 구분선, 동일 좌우 패딩). 매칭 그래프 본문 폭 가득. 상단 스테퍼·steer 같은 중앙 폭 정렬. **함수·DOM id·data-*·JS 무수정**(직전 v0_58 패스의 2열 폭/레일 규칙은 의도적 후순위 override).
- 검증(헤드리스 fullPage): 채용 스크리닝=조정칩(우선순위/필터/면접범위) 위 → 후보 랭킹 10명 아래 1열 흐름(`COL3_screen_1440·1024.png`), 분석 단계=작업카드→온톨로지 그래프 1열(`COL2`). 1024·1440 동일 구조(반응형 자연 해소). steer 재랭킹·되짚기·삭제숨김·용어 쉬운말 무회귀(JS 불변).
- **남은(구조 2차)**: ① 게이트 **HITL을 덮는 모달 → 흐름 안 인라인**(#3 'HITL 전후 자연스럽게'의 핵심, core renderCModal/currentCM 손봐야 함) ② "왜 이 순서?" **쉬운말 근거 한 줄을 랭킹에 상시 인라인**(현재 막대+게이트 모달에 분산). 〔기획·UX → 코어〕

### #6 용어 쉬운말 마무리 (코어, 260624) — aap-design 패스의 부분달성분 직접 마감 〔기획·UX〕
> 직접 다중너비 검증 결과 #1~#5는 통과, **#6만 부분달성**(근거 4유형·L코드 dev토글은 됐으나 엔드유저 화면에 `caseModel·verdict·r_reject_prohibited·지식·시맨틱 L4` 잔존)을 확인 → 마저 닫음. 위임 아님·직접 수정·재검증.
- **core.js dc* 인라인 기술토큰 → 쉬운말 기본 + `.dc-tech` 개발자 보기 뒤로**: "케이스 슬롯 caseModel"→**"이 건의 정보 · 값·출처·확인 방식"** · `verdict` 태그→**"AAP 판단"** · "룰 r_reject… · 결정론 재현"→**"같은 입력이면 늘 같은 결정 ✓"** · "결정 룰 판정 · ruleId"→**"AAP 판단"** · "참조 룩업 · 지식·시맨틱 L4"→**"참조 기준 · 제도·규정"**. 기술 원문은 `.dc-tech`(평소 숨김)로 보존 → `body.dev-on`에서 복원.
- `platform-fix.css`에 `.dc-tech{display:none} body.dev-on .dc-tech{display:inline}`(기존 `.op-ior-l` L코드 토글과 동일 패턴 확장).
- 검증(헤드리스 1440): 기본 노출 기술용어 **0** / 개발자 보기 ON → `caseModel·verdict·r_reject·L4` 복원. `node --check` OK · `audit_track` A=3 무회귀 · 콘솔 에러 0. (`T1_terms_default.png`·`T2_terms_devon.png`)
- **남음**: reanalysis 스텝 basis의 `evaluate(case,knowledge)`·recruiting normWeight mono 등 '판단 로직' 상세는 의도적 기술 노출(근거 depth) — 엔드유저 주표면 아님.

### run 콘솔 v0.58 정합 패스 — 비례·반응형·모달·근거·용어 6건 (260624, aap-design) 〔표준·정의 / UX〕
> 사용자 지적: run(실행 뷰)이 레퍼런스 데모 `aap_meeting_runtime_builder_v0_58.html` 경험에 못 미침. **구조는 유지**(좌 작업 surface `.op-main` + 우 근거 레일 `.op-aside` + 상단 runtop `.op-strip-wrap`, **좌/우 50:50 분할 신설 ✕ · 단일 콘솔**) — 비례·반응형·모달·근거·용어만 정비. **★시각만**: `core/platform-fix.css`(캐논 fix 레이어) 1곳에 집약 — `platform.css`·`core.js`·`packs/*` 무수정, 신규 hex 0(가이드 토큰만), DOM id·data-*·결정론 엔진·demo.js 안정 ID 불변. 검증=헤드리스 1024/1440/1920 before/after + steer 재랭킹 + HITL 모달 + 무회귀(audit A=3·되짚기·삭제숨김·콘솔 에러 0).
- **#1 반응형** — `@media(max-width:1280px)` 신설: `.op-split` 세로 스택 + 근거 레일이 작업 surface **아래로 graceful 스택**(가로 찌부러짐 ✕, 폭 캡 해제·풀폭, 그래프 height 200). 기존 platform.css의 1080 기준을 1280으로 상향(채용·경비 공통). `@media(min-width:1700px)`·`(min-width:2200px)`: `--op-maxw` 1240→1500→1760·레일 400→460→520 확대(우측 데드 여백 회수 = v0_58 zoom 확대 정신을 폭으로).
- **#2 비례(좌넓·우좁·상단큼 교정)** — runtop 스테퍼 `.op-strip-wrap` 패딩 11→7·`.op-snode` 5/10·`.op-sn` 19px로 **압축**(높이↓). 좌 work는 `--op-maxw` 중앙 캡(과확산 제거, platform-fix 기존 캡 계승). 우 근거 레일 360→**400**(조연→주연급 확대, %·토큰 기반). v0_58처럼 작동/근거가 주연.
- **#3 HITL 전후 매끄럽게** — `.cmodal` opacity 트랜지션 + `.cmodal.show .cmodal-card` `@keyframes cmcardin`(8px 솟아오름+scale .985, cubic-bezier 스프링) → 갑툭·점프 제거. `.run-surface.ws-on-op:has(.cmodal.show) .op-main{filter:saturate(.96)}` → 게이트 진입 시 work surface가 살짝 가라앉아 모달이 흐름의 다음 장면처럼(갇힘 ✕). prefers-reduced-motion 시 애니 off. (#cmodal은 con-body 형제 → run-surface 스코프 has())
- **#4 동적 입력→출력 + 스피너 강화** — 재분석 오버레이 `#reov` top 10→14·카드폭 clamp(360,46%,460)·헤더 키움·테두리 teal·그림자 강화. 작동중 단계 `.rstep.doing{box-shadow:inset 3px 0 var(--aap)}`(좌측 진행 바)·스피너 22px. **근거(basis) mono 라인** `.rsb` 10.5px·slate(판단 로직·근거 단계가 핵심 지적 → 또렷). live-busy 메인 흐림 .55→.62. 헤드리스 검증: steer(균형→도메인) 클릭 → 오버레이가 "2/4 단계 · 매핑% 재산출" phase 칩 + green-check 스텝 + mono basis(`normalweight = preset dom · 합 100 정규화`) 노출, 750ms busy 확인, 재랭킹 정합(이하늘 92→88·박서준 87→90).
- **#5 모달 비례** — `.cmodal-card` max-width 452→`clamp(360,64%,520)`·`.wide` 560→`clamp(440,78%,620)`·padding clamp·`#nodeModal .nm-card` clamp(420,56vw,560). 좁은 폭(≤1080)=clamp(320,84%,520)로 콘솔폭 거의 채워 내부 데이터 짓눌림 해소. 검증: HITL 모달 1440=614px(ratio .43)·1024=620px(ratio .61) — 너비 대비 과대/과소 해소, 내부 정렬 일관.
- **#6 근거 안 보임·용어 어려움** — (a) 엔드유저 화면에서 카드 위 **레이어 코드 배지 숨김**(`.op-ior-l`·`.wp-op-l`·`.rn-lcode` display:none) → `body.dev-on`(개발자 보기)에서만 노출. 레이어 **이름**(`.rn-lay` 등 읽기쉬운 라벨)은 유지. 검증: 엔드유저=none·개발자보기=block(가역). (b) 우 근거 레일 `.op-sh` 헤더에 teal 색점(`::before`) + ink색 → '근거 보기' 데이터 zone임을 신호. 근거 4유형 색 키(`.ev-k`: 참조데이터=Solution cyan·조회대조=Connector blue·규칙정책=Policy amber·판단로직=Agent teal) 캐논 5타입 정합 재확인(타입색↔상태색 혼동 방지). 4유형 구조 자체는 드릴 모달(`evidDrill`)에 이미 노출 — 이를 레일에서 유도.
- **검증 산출**: before/after 1024·1440·1920 × 채용·경비 = `C:/Users/namta/AppData/Local/Temp/aap_shot/{before,after}_{1024,1440,1920}_{recruit,expense}.png`. 효과(#3#4#5) = `FX_1440_reov_mid.png`(재분석 오버레이+basis)·`HITL_{1024,1440}_open.png`(모달 비례). dev(#6)=`DEV_1440_on.png`. 무회귀: `node --check core.js` OK·콘솔 에러 0·되짚기(요건접수→1/9 정착)·`.ibx-confirm[hidden]` display:none·`audit_track.js` A=3(procurement·expense·contract_a).
- **남긴 후속**: ① **닫기 fade-out** — 현재 close는 `.show` 제거 시 `display:none` 즉시(card-in만 부드럽고 퇴장은 스냅). 부드러운 퇴장 원하면 close 타이밍 JS 훅 필요(이번 CSS-only 범위 외). ② **#reov ↔ HITL 모달 동시 표출 z-순서** — 게이트 모달 내 steer 변경 시 재분석 오버레이가 모달 위 중앙상단에 뜸(현재 의도대로 동작, 시각 정합 OK이나 추후 모달-내 인라인 표출 검토 가능). ③ 경비 레일의 "참조 룩업 · 지식·시맨틱 L4" 부제 L코드 — 카드 배지(`.op-ior-l`)가 아닌 aside 본문 텍스트라 이번 숨김 미적용(근거 depth라 허용, 더 엄격히 하려면 팩 텍스트 수정 필요). 〔aap-design 후속〕

### 실사용 결함 3건 직접 재현·수정 (코어, 260624) — 삭제 노출·단계 되짚기·동적 정합 검증
> 사용자 피드백: "삭제를 직접 명시(사용자 친화성 0)·직전 단계 이동 안 됨·동적 정합 없음·디자인 처참". 말로 다듬었다 ✕ → 헤드리스로 직접 진입·클릭해 재현·수정·재검증. 〔기획·UX〕
- **#1 인박스 삭제 상시 노출 = 수정·검증** — `.ibx-confirm`이 `display:inline-flex`만 있고 `[hidden]` 오버라이드가 없어 **모든 행(35/35)에 "삭제할까요?" 상시 노출**. `platform.css`에 `.ibx-confirm[hidden]{display:none}` 추가 → 휴지통은 hover-only(opacity:0)+클릭 시에만 확인. 재검증: visible 35→0.
- **#2 단계 되짚기 불가 = 근본 수정·검증** — (a) `autoAdvanceOnOpen`이 진입 시 자동전진(설계 의도, 유지) (b) **자동재생 중 `renderConsole`이 매 reveal 틱마다 strip/seq 재생성 → per-render onclick(구 line 618·1683) 유실 → 클릭 무반응 → 계속 앞 게이트로 전진**(="직전 단계 이동 안 됨"의 정체). 수정: per-element onclick 제거 → **안정 조상(`#seq`·`.run-surface`)에 클릭 위임 1회 바인딩(`initStageNav`/`navToStep`) + 클릭 시 `stopPlay`**. 재검증: 채용 자동정착(3/9)→요건접수 클릭→1/9 정착·5초 후도 유지(튕김 0), 제네릭 경비도 동일(3/4→1/4), 에러 0.
- **#3 동적 정합 = 실제 동작(앞선 진단 정정)** — steering(우선순위/필터/범위·매칭 가중·컷) → `normWeight`/`mOf` 결정론 재계산 → 재랭킹·컷라인·헤더·그래프 반응. 검증: 균형→도메인중시 시 박서준 4→2위·이하늘 2→4위·점수 전부 재계산·헤더 "도메인 중시". **단, `runReanalysis` 애니가 ~3.7초라 첫 1.8초 probe로 "정합 깨짐" 오판 → 5초 재측정 후 ✅ 정정.** 교훈=비동기 재분석은 onDone(≈3.7s)까지 기다려 검증.
- **남은 진단(미수정)**: ④ steering UI 이중화 — 게이트 **모달 자체가 steering**(임계·가중 슬라이더·통과 미리보기)인데 base에도 프리셋 버튼(우선순위)이 겹침 → 정리 필요. ⑤ 채용 게이트/리치 surface 시각 밀도("디자인 처참") 별도 패스. 〔기획·UX → aap-design〕

### 트랙 A — 코어 일반 콘솔 `renderDataConsole` 시각 폴리시 (260624, aap-design) 〔표준·정의 / UX〕
- **대상**: `app/core/core.js` dc 함수 + `app/core/platform.css`. A등급 데이터팩(expense·procurement·contract_a)이 코어 일반 콘솔로 표출될 때의 정돈도를 채용(수제 surface) 수준으로. **이게 신규 데이터팩 시각 기준선**(작업 0 상속). expense 전용 하드코딩 0 · 신규 hex 0 · platform-fix 룩 불변.
- **① 경보 과잉 제거(핵심)**: `dcSlotPanel` 셀 색 = `s.risk && 값있음 → 무조건 .risk(분홍)` → **verdict 연동 톤**으로 교체(`dcSlotTone`, 도메인 무관). **red(.crit)=반려(REJECT) 판정이 실제 인용한 결격 슬롯만** · **amber(.attn)=주의(gap 또는 검토(LEGAL_REVIEW) 인용 위험슬롯)** · 그 외 전부 중립. 결과: 자동승인 케이스=경보 0(전 백색), 반려 케이스=증빙2칸만 red. ("적격증빙 충족 예"가 red로 뜨던 역설 해소.)
- **② 임계 밴드 콩나물 해소**: `dcSteer` = flat 버튼 나열 → **임계별 카드 블록**(라벨 1줄 + 옵션 1줄, 테두리·여백). "조정 가능한 임계" 헤더(`sliders-horizontal` Lucide 인라인 신규 추가, file:// 안전). 경비 4임계가 2줄 빽빽 → 균질 4블록.
- **③ 슬롯 그룹핑**: primary 8셀을 `slot.group`(기본/금액/기간/증빙/점검…)별 소제목(`.ct-grp`)으로 묶음 → 균질 격자 → 위계. group 메타 없으면 단일 그리드(graceful).
- **④ 우레일 밀도**: `dcAside` = "AAP가 한 일·근거"를 룩업보다 앞(채용 순서 정합), `.op-flow`·`.op-sh`·`.ct-lks` 패딩·라인하이트·dashed 구분 → 잔글씨 떡칠 완화.
- **검증**: 헤드리스 before/after(`C:/Users/namta/AppData/Local/Temp/aap_shot/`): before=`_before/E_expense_top.png`, after=`A1_expense_review.png`(검토/amber 1칸)·`A2_expense_reject.png`(반려/red 2칸)·`A3_expense_auto.png`(자동/경보 0)·`B_계약.png`(contract_a 동형). 채용(`A5_recruit_top.png`)·meeting/voc 무변. `node --check` OK · 콘솔 에러 0 · `audit_track.js` A=3 회귀 0.
- **다음(트랙 B 백로그)**: recruiting(B) generic 대체 가능성 실측 · meeting/voc(C) 수렴.

### 표준 적합도 대장 + 두 트랙 관리 방향 (플랫폼, 260624) — '기존 팩' 관리 = 상태 추적
- **문제 재정의**: run 뷰 "엉망"의 정체 = 렌더 경로 2개 공존. 채용(recruiting)=수제 surface 1399줄(정돈됨), 경비·구매·계약=코어 일반 `renderDataConsole`(빽빽). **'엉망'과 '기존 팩 관리'는 동전의 양면.** 〔표준·정의 + UX〕
- **적합도 대장 신설**(`aap_architecture_convergence_spec_v0_1.md` §8): 등급 **A 수렴**(전용surface× + caseModel+route)·**B 부분**(결정만 표준+surface 잔존)·**C 미수렴**(caseModel/route 없음). 현황: procurement/expense/contract_a=**A**, recruiting=**B**, meeting/voc=**C**. 〔표준·정의〕
- **거버넌스 인프라**: `_decision_engine/audit_track.js`에 **검사 G(app 팩 적합도)** 추가 — `app/packs/*.js` 정규식 스캔 → 등급 산출 → 수렴 스펙 §8 `<!-- LEDGER:START/END -->` 자동 덮어씀(코드=SSOT). 신규=머지 게이트(A 아니면 minor 경고), 기존=등급 자동 기록. 〔표준·정의〕
- **두 트랙(처방 반대)**: **트랙 A**(공유 렌더러 폴리시)=A등급 팩은 데이터가 맞으니 `renderDataConsole` 시각 품질만 채용 수준으로 → 3팩+미래 데이터팩 동시 개선, 이게 신규 시각 표준 기준선. **트랙 B**(수렴 마이그레이션)=B·C 점진·백로그. **순서=트랙 A 먼저.** 〔기획·UX + 표준·정의〕
- **결정(사용자)**: ① recruiting(B)=**트랙 A 후 재판단**(generic이 리치 surface 대체 가능한지 실측 → §5.3 surface 예외 인정 vs 수렴 2차). ② 대장=audit_track 스캔 + 문서 자동 갱신 둘 다. 〔기획·UX〕
- **다음**: 트랙 A 착수 — `renderDataConsole`(dcSteer 임계밴드 그룹핑·dcSlot risk색 치명만·dcAside 우레일 밀도) 폴리시 = **aap-design 소관**(색 토큰 정합·신규 hex 0·platform-fix 룩 유지). 검증=헤드리스 스크린샷(경비 케이스 → 채용 수준). 〔기획·UX → aap-design〕

### v0.58 (데모, 빌드 완료 · 260624) — 대한제조 맥락 명시 + HITL 거부 처리
- **#1 고객사 = 대한제조 명시**: 요청부터 "다음 주 **대한제조 AAP 킥오프** 회의 잡아줘"로(기존 'AAP 고객사 킥오프'는 맥락 없이 대한제조가 뒤에 갑툭). "AAP 고객사 킥오프 회의" 12곳 전부 "대한제조 AAP 킥오프 회의"로, understand a1 '대한제조 AAP 킥오프로 파악했어요'. 〔표준·정의〕
- **#2 HITL 거부('조금 더 볼게요')=보류 처리**: 기존엔 toast만 → `STATE.deferred[step]`. 거부 시 모달 닫히고 좌측에 `heldCard`('⏸ 아직 확정하지 않았어요 · 확정해야 다음 단계로 · 발송·진행 멈춤' + `[이어서 검토하기]`=data-resume로 모달 재오픈). currentCM에 `!STATE.deferred` 가드. decide()가 deferred 해제. **= AAP는 사람 확정 전까지 안 넘어간다(HITL 통제)를 화면으로.** 〔기획·UX〕
- **#3 본부장 가독성 점검**: 좌=쉬운 말+근거 보기 / 우=AAP 작동(기술) 분리는 의도적, 각 단계 cs-status 'AAP가 ~했어요'+HITL 게이트로 'AAP가 한 일/사람이 결정' 구분 OK. 잠재 개선=첫 진입 1줄 오리엔테이션(과설명 금지와 균형). 〔기획·UX〕


### v0.57 (데모, 빌드 완료 · 260624) — 회의 진행 방식 선택(앞단) + 채널 라벨 정리
- **계획 승인(approve)에 '회의 진행 방식' 선택 추가**(뒤단 발송 채널에 이어 앞단도) — `PLATFORM_OPTS`(Microsoft Teams 추천·기본 / Zoom / Webex / 대면(회의실)), `C.platform='teams'`, `data-plat` 단일선택. 기본 고정값+사용자 변경. **회의 단계가 선택 반영**: teamsView가 `PLATFORM_META`로 바·로고·이름 전환(Zoom=Z 파랑, Webex=W, 대면=🏢), mtrig 배지도. 〔기획·UX〕
- 발송 채널 라벨 또렷이(Confluence 발행 / 메일 발송(Outlook) / Teams 메시지 / Works 게시판). 〔기획·UX〕
- 원칙: 솔루션·채널 선택은 거버넌스(#6 app/) ✕ → 엔드유저의 업무 결정. **앞단(진행 방식)·뒤단(발송 채널) 양쪽에 옵션 전부 노출+기본값+변경 가능.**


### v0.56 (데모, 빌드 완료 · 260624) — 근거 모달 좌측 내부화 + 회의록 결과 카드 + 발송 채널 선택
- **#1 근거 패널을 좌측 화면(`.cscreen`) 안 오버레이로**(HITL 모달과 동일) — `#drillModal`을 body→`.cscreen` 내부로 이동, CSS fixed→absolute(inset:0, z-index 9, max-width 340·padding 축소). 전체화면 정중앙 ✕. 〔기획·UX〕
- **#2 회의 종료 후 좌측에 회의록 결과 카드**(`minutesCard`: 결정 3·후속 3 요약 + `[전문 보기]`=openPreview('minutes') 모달 + `ⓘ 근거`=meet_rec). teamsView의 '회의록 어떻게' 링크는 녹취 중(live/mend)만, 종료 후엔 카드가 근거 보유. 〔기획·UX〕
- **#3 최종 승인에 회의록 발송·공유 채널 선택(옵션 전부 노출)** — `C.channels{confluence,mail,teams,works}`(기본 confluence+mail 추천 선택), `CHAN_OPTS` 4개 멀티선택(실제론 1~2개만 쓰지만 고객이 다른 채널 고를 수 있게 메뉴엔 전부). `data-ch` 토글. **공유 단계 실제 반영**: confluenceView가 선택 채널만 cf-ch로 점등(Confluence 등록/메일 Outlook/Teams 메시지/Works 게시판 + 학습), Confluence 미선택 시 헤더 'Confluence 발행'→'회의록 공유'. share_teams·share_works 근거 추가. 〔기획·UX〕


### v0.55 (데모, 빌드 완료 · 260624) — 근거 보기 드릴다운 전 단계 확장
- **prepare 그리드 셀·meeting(Teams)·share(Confluence) 목업 요소에 '근거 보기' 드릴다운 추가**(v0.51 syncLines 카드에 이어 목업 단계까지). 좌측 모든 결과 요소 = 결과만 보이고, 클릭 시 사용자 언어 패널(이렇게 했어요·근거·연결 시스템). `DRILL_EXTRA`에 `prep_자료/참석자/장소/안건/초대장`·`meet_rec`·`share_0/1/2` 추가. cell()에 `prep_${k}` 근거, teamsView에 '이 회의록은 어떻게 만들어졌나요?'(meet_rec), confluenceView ch()에 채널별 `share_${stage}` 근거. `.mtg-why` CSS. 〔기획·UX〕


### 범용 공장 폭 확장(여신·보조금=6도메인) + Connector 계약 스펙 (260624, aap-lead) 〔표준·정의 / ★백엔드·app/ 세션 핸드오프〕
> 결정 런타임 하니스를 **금융(여신·한도)·공공(보조금)** 으로 확장 + 서비스화 선행작업 Connector 스펙화. app/ 코드 0.
- **6도메인 게이트 통과**: 여신·보조금을 전체 게이트 파이프라인(severity critic→dslify→evalGate→annotate)으로 생성, **둘 다 PASS**(여신 10/10·0R·보조금 10/10·1R, 캐논 evaluate.js 독립 재검증). N4 골격(계약·구매·경비) **무수정 재사용** → 범용 공장 폭 = **백오피스 4종 + 금융·공공 = 6도메인**. 산출=`packs_baked_v2/pack_credit·subsidy.v2.json`(어댑터 v0.2 bake) + 드롭인 `_decision_engine/dropin/pack_credit·subsidy.decision.json`(결정팩 5종으로 확장).
- **Connector 계약 스펙**(`aap_connector_계약_스펙_v0_1.md`, 인덱스 ⑩): L5 어댑터 인터페이스를 **백엔드 구현용 계약**으로 못박음. `slot.extract`(connector/doc/llm)→어댑터 종류 / read `SlotFill{value,confidence,source,status}` 시그니처 / **신뢰도<임계→슬롯 pending→HITL 승격**(엔진은 안 막고 슬롯만 미확정 — 데모 'AAP 확인 vs 담당자 판단'의 인프라 계약) / write 멱등키+RBAC 권한 경계. 구현=백엔드, app/=충전 호출부·HITL UI 소비.
- **★Agent 결정 사다리(아래 항목)와 정합**: Connector 스펙은 사다리 3단(Connector/조회)·4단(Policy/Rule=evaluate)의 **인터페이스 실체** — "Agent 띄우기 전 결정론·조회로 끝내라"를 L5 계약으로 뒷받침.

### Agent 결정 사다리 (Agent Decision Ladder) — 오케스트레이션 차별화 원칙 (260624) 〔기획·UX / ★선제안서 차별화 섹션 후보〕
> 외부 도구 **ponytail**(github.com/DietrichGebert/ponytail, "가장 좋은 코드는 안 짠 코드" — 코드 생성 전 결정 사다리로 과잉설계 차단)의 구조를 AAP 오케스트레이션 원칙으로 차용. **개념은 이미 우리 것**(메모리 "AAP는 Agent 많이 띄우는 시스템 ✕ → 적합한 것 조합")인데, ponytail은 그걸 **명시적 게이트로 제품화**한 선례 → 우리도 명문화한다.
- **원칙**: AAP는 새 Agent를 띄우기 **전에** 결정 사다리를 거친다. = "Agent 많이 띄우는 플랫폼"(경쟁사) 대비 **"미니멀 오케스트레이션 플랫폼"** 차별화 축.
- **결정 사다리(Agent를 새로 붙이기 전 순서대로 묻는다)**:
  1. 이 일이 정말 필요한가? (불필요한 단계 제거)
  2. **기존 솔루션/Module**로 되나? (kt ds 자산·상용 솔루션 재사용)
  3. **Connector/조회**로 되나? (고객 시스템에서 가져오면 끝)
  4. **Policy/Rule(결정론)**로 되나? (LLM 없이 규칙으로 — Decision Engine)
  5. **한 Agent로** 되나? (멀티에이전트 남발 ✕)
  6. 그때만 최소한의 Agent를 붙인다.
- **§3 금칙과 정합**: "HITL 남발 ✕"과 같은 결의 "**Agent 남발 ✕**" 원칙으로 추가. 6타입 구성요소(Agent·Module·상용·고객시스템·Connector·Policy) **조합 = 결정 사다리의 산물**임을 우측 작동 영역(§2 ★)에서 이미 시각화 중 — 사다리는 그 "왜 이 조합인가"의 근거 서사.
- **데모 메시지 연결**: 손해사정 "AAP가 책임 있게 멈춘 증거"(안 하는 것을 증명)와 동형 — **안 띄우는 것이 차별화**.
- **선제안서 차용 후보**: 4-2/별첨에 "Agent 결정 사다리" 한 단락(경쟁사 = Agent 多 / AAP = 사다리 거친 최소 조합). 단 **선제안 단계는 역량 폭도 보여야 하므로**(메모리 offering-map detail 규칙) "할 수 있는 것 vs 굳이 안 하는 것" 균형 의식.
- **작업 보조 도구로도 도입**: Claude Code에 ponytail 플러그인 설치(`/plugin install ponytail@ponytail`) — `app/` 코드·단일 HTML 데모 비대화 방지(`/ponytail ultra`·`/ponytail-review`·`/ponytail-audit`). 메모리 교훈 "파일 커지면 잘못 구현"·"삭제가 핵심"의 자동 집행기.

### 서비스화 로드맵 (PoC→실서비스) (`aap_서비스화_로드맵_v0_1.md`) (260624, aap-lead) 〔기획·UX / ★app/ 세션·백엔드 핸드오프〕
> 정합성 검토 §2가 식별한 서비스 갭을 **Tier·의존성·아키 결정·소유**로 구체화. `aap_platform_to_runtime_roadmap`·객체모델 P1~P5를 **서비스 수준 렌즈로 재배열**(중복 ✕).
- **8계층 렌즈**: 데모는 L3/L4/L6(지능) 강함 ↔ 서비스화는 **L5(연동·mock)·L7(통제·정적표시)·L8(인프라·file://)를 실체화**. "지능은 됐고 신뢰·운영을 붙이는 단계."
- **Tier**: T0(검증PoC)→**T1 단일고객 파일럿(MVS)**→T2 멀티도메인→T3 멀티테넌트SaaS. **MVS(데모↔서비스 경계)=P-persist+P-connector1+P-rbac-basic**.
- **의존성**: **루트=P-persist**(관측·RBAC·프로젝트·테넌트 다 의존). P-connector1·P-studio-decision(C1/C2)은 독립=병렬 착수 가능(빠른 가치).
- **소유 분담**: 이 트랙=결정 팩 공급·Connector 계약 스펙·variant 매트릭스·저작 파이프라인(app/ 무관) / **app/ 세션=영속·RBAC enforce·스튜디오 결정층 노출(C1)·flow next(C2)** / **백엔드·인프라(신규)=Connector 구현·멀티테넌트·스케일**.
- **이 트랙 다음 한 수(app-무관)**: Connector 계약 스펙(read/write·auth·신뢰도·HITL 폴백 인터페이스) 먼저 써두면 백엔드 착수 시 바로 물림.

### 전체 정합성·서비스수준·목적부합성 검토 + 실행가능 Pack v2 (`aap_정합성_서비스수준_검토_v0_1.md`·`packs_baked_v2/`) (260624, aap-lead) 〔표준·정의 / ★app/ 세션 핸드오프〕
> 유저 요청 검토(병렬 read-only 2건, app/ 미수정). **핸드오프 작동 확인**: 다른 세션이 결정층을 app에 랜딩(evaluate.js·contract_a.js caseModel/knowledge.route/io.editable·evalCase() 런타임 호출). 정합성=문서 4/5·app 6.5/10.
- **★최대 정합 갭(app/ 세션 핸드오프)**: **C1 스튜디오가 결정층 블라인드**(renderDesign/renderAssets가 caseModel·knowledge·threshold 0개 표시·wfeditor가 gate next·임계 편집✕) → 거버넌스 사각 / **C2 flow `next` 부재**(verdict.outcome이 분기로 안 이어짐, HITL 하드코딩) / **C3 팩 스키마 파편화**(contract만 결정층, meeting·recruiting 0) / **C4 app contract 팩 구버전**(seeds expectedOutcome 없음·게이트통과 R6B 미반영 가능) / **C6 프로젝트 L2 inert**.
- **이 트랙 조치(완료)**: A1 계약 P1 설계 `decide()`→`evaluate()` 정합 보정(canonical 명시) / A2 **`packs_baked_v2/pack_*.v2.json`**(게이트통과·expectedOutcome·R6B·evaluate 스모크 전수) = app contract 팩 **교체본** 공급(어댑터 v0.2). flow gate `next` 바인딩 데이터 포함.
- **서비스 수준 갭(§2)**: 🔴 영속저장·실Connector(OCR/STT/ERP)·멀티테넌트·RBAC enforcement / 🟡 프로젝트관리·전역자산카탈로그·관측KPI·variant선택. 문서가 P1~P5·"후속"으로 정직히 명시 — "데모 기준" 충분, "범용 플랫폼 운영"엔 🔴 4종 블로커.
- **목적 부합**: (B) loop engineering 95%(4도메인 게이트통과) / (A) 범용 플랫폼 70%(구조 증명·운영 미완: 회의만 live). **다음 레버=결정층 스튜디오 노출(C1)+게이트통과본 배포(C4)+멀티도메인 인박스.**
- 본 건=검토·설계·데이터 공급(app/ 코드 0). 〔표준·정의 / app/ 세션 핸드오프 후속〕

### v0.54 (데모, 빌드 완료 · 260624) — #6 구성 토글 철회(복원)
- **v0.53의 실행↔구성 토글·구성 뷰 전부 제거(v0.52 상태로 복원)** — 잘못된 전제: 구성 뷰는 사실상 `app/index.html`(진짜 플랫폼 콘솔=자산 5타입 레지스트리·거버넌스·워크플로우·로그)을 데모 안에 중복 생성한 것. 데모는 *고객이 보는 서비스 화면 + AAP 작동 흐름*에 집중, **거버닝(솔루션 연결·레지스트리·정책 관리)은 별도 운영자 역할·콘솔(=app/)** 소관. 〔기획·UX / ★역할·서피스 분리 원칙〕
- **원칙 확정**: 고객 서비스 화면(데모 좌측, 엔드유저 홍길동) = 업무 사용·승인(거버닝 ✕). 플랫폼 콘솔(app/) = 운영자 거버닝. 한 화면에 두 역할 섞지 않음. KMS=Confluence·드릴다운 패널 등은 유지.

### v0.53 (데모, 빌드 · 260624) — #6 구성 뷰(정적 저파이) 〔철회됨 → v0.54〕
- **상단 모드 토글 `[실행][구성]`(기본 실행) + 구성 뷰 신설** — '좌/우와 또 다른 모습이냐'에 화면으로 답: 구성 뷰는 런타임 좌/우 분할이 아니라 **레지스트리 화면**(같은 topbar·디자인·타입 색). `body.cfg-mode`로 `.main` 숨기고 `.config-view` 표시. 〔기획·UX / ★범용 플랫폼 3뷰의 '구성'〕
- 3블록: **연결된 솔루션 6**(Teams·Confluence(지식관리)·Works AI·캘린더·조직도·메일+설정/연결·+추가) / **컴포넌트 레지스트리**(Agent·모듈·Policy 칩) / **등록된 업무**(회의 준비 업무→`실행으로 보기`=setMode('run')). `CONNECTORS`·`REGISTRY`·`renderConfig`·`setMode`. **정적 저파이(연결 플로우·관리 뷰는 합의 후)**.

### v0.52 (데모, 빌드 완료 · 260624) — KMS=Confluence 중복 제거
- **고객사가 KMS 용도로 Confluence를 씀 → 데모의 'KMS'를 전부 'Confluence'로 통일**(별도 KMS 시스템 phantom 제거, 중복 0). understand/compose 근거·systems('Confluence'·'Confluence(지식관리)'·'Confluence(문서·지식)'), share guide·op('Confluence 기록'·'Confluence(지식관리)에 등록')·confluenceView 채널('지식 등록·태깅 → Confluence 지식관리')·workingTasks·결과 모달. KMS 잔존 0. 〔표준·정의〕
- #6 구성 뷰: 유저가 '좌/우와 또 다른 모습이냐' 질문 → 그렇다(런타임 좌/우 분할 ✕, 레지스트리 화면). 같은 topbar·디자인 시스템·컴포넌트 타입 색. 커넥터 = Teams·Confluence(지식관리)·Works AI·캘린더·조직도·메일(6개, KMS 제외). 합의·시각화 진행 중.

### v0.51 (데모, 빌드 완료 · 260624) — #2+#3 온디맨드 근거 패널
- **항상-노출 박스(aap-why) 전부 폐기 → 라인 '근거 보기' 클릭 시 사용자 언어 드릴다운 패널**(우측 노드 패널의 사용자판). 좌측 카드는 기본=결과·결정만, 근거·판단은 온디맨드(v0.41 정합, 클러터·잘림 해소). 〔기획·UX / 표준·정의〕
- 패널 구조(호르무즈식): **이렇게 했어요**(번호 진행 단계) · **사용한 근거**(칩) · **연결한 시스템**(칩). 핵심어 `<b>` 볼드. `#drillModal`·`openDrill/renderDrill/closeDrill`·`STATE.drill`·`DRILL_EXTRA`(prepfoot 등 비-SUB용).
- SUB에 `detail{how,basis,systems}` 추가: REQUEST_SUB(2)·UNDERSTAND_SUB(3)·COMPOSE_SUB(4). `spot`은 텍스트→`1`(링만), 설명은 패널로. 카피 구체화·볼드(예 '대한제조(외부 고객)'·'보안 정책 P-03'·'결정론 시스템 vs Agent'). C 준비 footer 카피 명확화('외부 DX팀장에게 갈 초대장·회의 자료는 담당자가 승인해야 보내요')+근거 보기, E sensBlock 중복 박스 제거(sens-why·감사로그 유지).
- 미적용(후속): prepare 그리드 셀·meeting/share 목업 요소 드릴다운. **#6=구성 뷰는 합의 후 별도.**

### v0.50 (데모, 빌드 완료 · 260624) — 폴리시 묶음(6대 피드백 중 #1·4·5)
- **#4 우측 하늘색 레이저(flow-spark) 제거** — `.flow-spark`·`@keyframes flowspark`·`.stages.working` 토글 전부 삭제(장식 노이즈, reveal 점등+스피너로 충분). 〔기획·UX〕
- **#5 모달 내부 정돈** — 모달 골격 유지·내부만 압축(cmodal-card 412→404·padding↓, ch-op 6/10→5/9·11.5→11px, ch-sec/ch-k/seg-b/cm-row/sens-b/sens-why/rs-card 여백·폰트 한 단계↓). 스캔 가능한 결정 패널로. 〔기획·UX〕
- **#1 요청 전송 애니** — 입력창 문구가 위로 올라가 전송되는 느낌: request working 진입 시 req-echo.sent에 `just-sent`(reveal===0에서만 1회 `@keyframes sendup` translateY 26→0, 재렌더 깜빡임 방지) + renderInput phase 인식(idle=문구+활성 전송 / 보낸 뒤=입력창 '요청을 보냈어요'로 비움). 〔기획·UX〕
- 남은 피드백: **#2+#3 = 온디맨드 근거 패널**(좌측 카드 클릭→호르무즈식 사용자 언어 드릴다운, 항상-박스 aap-why 폐기·카피 구조화/볼드·'') → 다음. **#6 = 구성 뷰**(상단 모드 토글 실행↔구성, Connector/Module/Policy 레지스트리·솔루션 연결, 9번째 스텝 ✕) → 화면 합의 후 별도.

### v0.49 (데모, 빌드 완료 · 260623)
- **업무 순서 클릭 = 그 단계 흐름 재생(좌측 장면→우측 설명)** — 기존엔 요청 접수(정적 포털)·회의 진행(회의 시작 버튼 대기) 두 단계가 클릭해도 안 움직였음. `runStep`을 고쳐 클릭 시 모든 단계가 재생: 요청=포털(그림) 잠깐+커서→1.2s 뒤 startWorking(requestCard 보냄+우측 reveal), 회의=회의 시작 게이트(그림) 잠깐+커서→1.8s 뒤 startWorking(STT→정리→종료 게이트), 나머지=즉시 startWorking. 단계 클릭은 다음 단계로 자동 이동 ✕(단일 단계 재생). **첫 로딩은 포털 정적 유지**(init에서 request면 idle 렌더, 클릭 시에만 재생). 〔기획·UX〕

### v0.48 (데모, 빌드 완료 · 260623)
- **AAP-only 순간(A·C·E)을 스포트라이트 + 부연설명으로 시각 강조** — 재생 중 해당 요소가 나타나면 더 드러나게: `.aap-spot`(앰버 포커스 링+떠오름, 재렌더 깜빡임 방지 위해 일회성 애니 ✕ 지속 강조) + `.aap-why`(💡 파란 콜아웃, 인라인 결과보다 깊은 '왜 중요한가'). A=UNDERSTAND_SUB a3 `spot` 필드(syncLines가 spot 있으면 링+콜아웃 렌더)='요청엔 승인 얘기가 없었어요…외부 고객만 보고 AAP가 승인을 더했어요'. C=af-foots에 aap-spot+콜아웃='되돌릴 수 있는 일은 AAP가 처리, 외부 발송만 사람 승인 대기'. E=sensBlock에 aap-spot+콜아웃='보낼 수 있었지만 멈췄어요…누가·왜 정했는지 기록·추적'. 부연설명도 대비 금지·작동 의미만. 〔기획·UX〕

### v0.47 (데모, 빌드 완료 · 260623)
- **AAP-only 능력을 단계 내부 분기로 — '챗봇/오케/RPA' 공격을 세 단계에 분산해 닫음** (새 스텝/구조/phase ✕, 카피만 구체·자연체, 대비 자막 금칙). 〔기획·UX/표준·정의〕
  - **A. 이해(함의 추론)**: UNDERSTAND_SUB a3 = '대한제조가 외부 고객이라 승인이 필요해요 / 자료 공유·외부 초대는 담당자가 확인한 뒤에 나가요'. 요청에 없던 승인을 외부 감지로 챙김(메타 설명 ✕).
  - **C. 준비(가역성 분기)**: meetingCard af-foot 2줄 = '✓ 캘린더 등록(CAL-3391)·회의 폴더 생성까지 마쳤어요' / '⏸ 외부로 나가는 초대·발송만 담당자 승인 뒤에 보내요'. (되돌릴 수 있음/비가역 라벨 ✕ → 한 것·멈춘 것만)
  - **E. 최종 승인(발견·차단·결정·기록)**: `C.recip.D`(외부 발송) 조건 분기. ON이면 `sensBlock()`='이대로면 대한제조에 단가가 나가요'+선제안 자료 내부 단가표 발견+[단가만 가리고/자료 빼고/원본(팀장 승인)] 결정(`C.sensitive`)+감사 2줄(LOG-2291). 제외면 발견 없음(가지 않은 길 라이브). 우측 발송안 점검 op도 '단가표 발견·보류'로. CSS: ch-must.sens·sens-opts/b·sens-log, af-foots/af-foot.hold.


### app/ run 조작형 콘솔 — 깜빡임·속도 근본 수정(부분 갱신 구조) (260623, aap-platform) 〔기획·UX / 표준·정의〕
> 기준 문서 = `aap_run_console_experience_spec_v0_1.md` **§2-D(깜빡임 0의 정의)·§2-A(자동 흐름 속도·근거)** 통과가 완료 조건. 곁가지 반창고 ✕ → **렌더 구조 자체를 부분 갱신으로 전환.** 대상 = `core/core.js` 만(코어, 도메인 무관). **1차 디자인(`platform-fix.css`) 룩·토큰 불변·신규 hex 0.**
- **★ §2-D 충족 — 통째 innerHTML 교체 제거(번쩍임 0)**: `renderOpConsole()` 이 매 갱신마다 `surfHead.innerHTML`·`surfBody.innerHTML` 를 통째 교체하던 것을 **뼈대 1회 마운트 + 섹션 메모 모핑**으로 재구성.
  - **`ensureOpSkeleton(sh,sb)`** — strip 래퍼(`#opStripSlot`)·steer 슬롯(`#opSteerSlot`)·`op-split`·`#opMainSlot`·`#opAsideSlot`·`op-hidden-mount`(#explain/#caseTune/#flow=영구 형제)·그래프 컨테이너를 **케이스/구조 진입 시 1회만** 생성(`!sh.querySelector('#opStripSlot')` 가드). 이후 갱신은 뼈대 미접촉.
  - **`opSection(slot,html,owner,sigKey,{animate})`** — 섹션 단위 제자리 갱신. 새 HTML 서명(`_opSig` djb2)이 직전과 **같으면 DOM 미접촉(skip)**, 다르면 FLIP 활강+수치 트윈으로 모핑. → 변경 없는 섹션은 재생성 0.
  - **부분 업데이트 분리**: strip(클래스/번호만)·steer(active 토글, 변경 시에만 `wireSteer`)·main(FLIP+트윈)·aside(FLIP+트윈+그래프 트랜지션). 그래프는 aside 변경 시에만 재배선(불변이면 SVG 컨테이너·엣지 유지).
  - `wireSteer` instant/onDone 의 중복 외부 FLIP 캡처/재생 제거 → 섹션 모핑이 단일 소스(이중 transform 충돌 제거).
- **§2-A 충족 — auto-run 속도·근거**: 자동 진행 타이밍 상수 `OP_T{reveal:680,settleFloor:1250,hold:1100}` 도입. `revealOps` 의 단계 정착 시점 = `max(그룹 등장 완료, settleFloor 1.25s)` → **단계당 최소 ~1.25s 머무름(휙 ✕)** + 그 단계 본문(슬롯·판정·랭킹 막대=근거)이 보인 뒤 다음으로. 완료분 즉시 채움·현재 지점 정지(`autoAdvanceOnOpen` 기존 동작 유지·전 단계 재생 ✕). 게이트에서만 모달 정지.
- **검증(헤드리스 Edge `--headless=new --allow-file-access-from-files`, app/ ASCII 임시 드라이버→삭제)**: 채용 `screen`·계약 `check` op-콘솔에서 steering 발생 시 — `SKELETON strip/steer/split/main/aside=true`, `AFTER_STEER strip/split/flow=true`(뼈대 노드 태그 생존=재생성 0), `SLOT_IDENTITY ...=true`(슬롯 DOM identity 유지·innerHTML 만 모핑), `STEER_CHANGED` 로 main 변경·active 전환 확인. **코드 확인**: 갱신 경로에 `surfHead/surfBody` 통째 innerHTML 교체 없음(ensureOpSkeleton 1회·가드만). 회의·VOC 스트림 모델 무회귀(별도 경로·미수정, 콘솔+HITL 모달 정상 렌더 확인). `node --check` 전 파일 OK.
- **보존**: 결정론 엔진·evaluate·case.overrides(P5)·HITL decide/cmodal·자동저작·자동 스트림(회의·VOC)·demo 안정 ID(#surfHead/#surfBody/#flow/#explain)·file://·Lucide 인라인. 〔후속: 다음 도메인 op-surface 추가 시 뼈대/섹션 분리 그대로 재사용〕

### 하니스 — seed expectedOutcome 명시(게이트 정밀화) (260623, aap-lead) 〔표준·정의 / app/ 세션 핸드오프〕
> evaluate-in-the-loop 게이트의 기대-outcome 도출이 seed 라벨 정규식(`_outcomeOf`) 의존이라 "자동승인 **차단**" 부분문자열 오매칭 → **`annotate` 단계 추가**(dslify 뒤): seed 의도(expectedRoute)를 보고 `expectedOutcome` enum 명시. 게이트가 그 필드 직접 사용. 두 워크플로 resume(annotate만 라이브).
- **결과(독립 evaluate.js 재검증, expectedOutcome 기준)**: 계약A 10/10·계약B 9/9·구매 11/11·경비 11/11, drift 0. ★**구매 3R→1R**(헛 라운드 제거), 계약 B "담당→대표 정상결재"가 부정확 LEGAL→정확 AUTO로 정렬(정규식보다 의미 정확).
- **드롭인 3팩 갱신**: `pack_{contract_A,procurement,expense}.decision.json` seed에 `expectedOutcome` 전수 명시 → app/ 통합 시 게이트/검증이 라벨 파싱 없이 명시 필드 사용.
- 게이트 로직: `s.expectedOutcome || _outcomeOf(s.expectedRoute)`(하위호환). 〔표준·정의 후속〕

### app/ run 조작형 콘솔 — 2차 작동 가시화 보강(기능/모션) (260623, aap-platform) 〔기획·UX / 표준·정의〕
> 대상 = `05_범용플랫폼/app/` run 뷰 조작형 콘솔(opstage). **1차 디자인 마감(`core/platform-fix.css`) 불변** — 이번은 **기능/모션 JS** 위주(필요 트랜지션 CSS는 가이드 토큰·기존 클래스, 신규 hex 0). 사용자 지적 4건(①재분석 휙 지나감 ②중간 작동 근거 안 보임 ③깜빡임 ④동적 시각화 부족) 해소.
- **(1) 라이브 재분석 속도·근거 (지적 1·2)** — `core.js runReanalysis` 재작성: 단계 타이밍을 코어 상수 `RE_T{reveal,work:860,gap,done}`로 통제(휙 ✕, 각 단계 충분히 머무름) + 단계 상태 전이 **작동중(파랑 펄스 spinner)→완료(✓)** + **step 스키마 확장 `{t,d,basis,tag}`**: `basis`=무엇을 읽고/계산/판정했는지 mono 라인(타이핑되듯 뒤따라 등장), `tag`=작동 유형(읽기/대조/평가/판정 색칩). 헤더에 진행 phase(`N/총·단계명`) 칩. → "결과로 점프" ✕ → **중간 작동을 근거와 함께** 노출.
- **(2) 깜빡임 제거 (지적 3)** — 기존 FLIP(행 활강) 유지 + **수치 트윈 `AAP_NUM.capture/play`**(`data-numtween` 키의 옛→새 숫자 카운트업/다운, 깜빡 스냅 ✕). `wireSteer`의 재분석·즉시반영 양 경로에서 FLIP+수치트윈 동시 재생. 채용 매칭% (`data-numtween="m-<id>"`)·평가 종합점수(`evtot`)에 적용.
- **(3) 동적 시각화 강화 (지적 4)** — SVG 매칭 그래프: 엣지/노드에 안정 키(`data-gk`)·클래스(`op-gedge/op-gnode/.top`) 부여 → 재렌더 시 **엣지가 허브에서 자라고(stroke-dashoffset) 노드가 팝(scale)**(가이드 §2: 모션=상태 전이, `prefers-reduced-motion` 가드). 엣지 굵기·노드 강조는 steering(가중)에 인라인 반응(기존). 계약 결정: **재판정 직후 verdict pulse**(`ct-vd.reflow` 1.1s, pack `reflowKeys`로 코어가 1회 후 클리어) — 슬롯→룩업→판정 흐름 하이라이트.
- **펼친 재분석 단계(팩 데이터)** — 채용 가중: **가중 적용→매칭% 재산출→재랭킹→컷 적용**(각 수치·산식·통과 N). 계약 임계: **슬롯 읽기→룩업 대조→임계 평가→route 판정**(각 슬롯값·룩업표·임계 부등식·룰ID·결정론 재현). 슬롯/패널/평가가중/오퍼수준도 basis 보강.
- **불변·검증** — `evaluate`·`case.overrides`·HITL·자산/로그/거버넌스·demo.js 안정 ID·file://·Lucide 인라인·코어 도메인 무관. `node --check` 전 파일 OK. 헤드리스(Edge): 채용 재분석 4단계·basis 4·tag 4·그래프 6엣지6노드·FLIP 무깜빡 / 계약 임계 evaluate 4단계 펼침·verdict pulse(`reflowSeen`)·임계 부등식(34≥20→법무검토) / **회의·VOC 무회귀**(stream 모델 유지·opRows 0). 임시 드라이버 삭제.

### v0.46 (데모, 빌드 완료 · 260623)
- **준비·공유 단계 좌측 요소 동기화(목업 유지) — 8단계 세분화 완성** — 준비(아티팩트 그리드)·공유(Confluence) 목업을 유지한 채 좌측 요소 점등을 우측 op reveal과 1:1 정렬. 준비: ops g0,0,1,2,2,3(자료수집·비정형 / 회의실·참석 / 마스킹·초대장 / RPA), 그리드 셀 PREP_STAGE 매핑(자료 g0·참석자/장소 g1·안건/초대장 g2) + RPA는 af-foot(g3). 공유: ops g0,1,2, confluenceView에 cf-chans 3채널(발송 b1·KMS b2·학습 b3)이 reveal과 점등. af-cell.doing·cf-ch.doing=파랑(좌우 통일). 〔기획·UX〕


### v0.45 (데모, 빌드 완료 · 260623)
- **버그①: 요청 접수 좌측 빈 화면 수정** — 보낸 뒤(working/done) 좌측을 포털 홈→요청 접수 카드(`requestCard`/`REQUEST_SUB` 2줄)로 전환해 우측 b1·b2(요청 수신·핵심 신호 추출)와 동기화. idle(보내기 전)만 포털 홈. 〔기획·UX〕
- **버그②: 회의 자동 종료 수정** — 회의는 녹취·정리 끝나도 자동 종료 ✕ → `mend` 단계(REC 유지 + '■ 회의 종료' 버튼·'종료는 사람이 누릅니다')에서 대기, 사람이 누르면 `endMeeting()`→done(회의록 정리). 자동재생은 잠시 뒤 자동 누름. meeting ops g:0,1,2 순차화(STT→의미화→회의록). 〔기획·UX〕
- **검토(좌측 세분화·우측 정합성)** — 요청·이해·구성·회의 4단계=줄글 a-i 동기화 완료(좌 a-i↔우 b-i 1:1, 계층·컴포넌트 정합). 승인①②=HITL 게이트(모달, 동기화 대신 추천 확정). **남은 세분화=준비(아티팩트 그리드)·공유(Confluence)** — 목업 유지하며 좌측 요소를 우측 op reveal과 1:1 정렬 예정. 〔기획·UX〕


### app/ run 뷰 조작형 콘솔 디자인 마감 패스 (260623, aap-design) 〔표준·정의 / UX〕
> 대상 = `05_범용플랫폼/app/` run(업무) 뷰의 **조작형 콘솔(opstage)** — 채용 매칭(matching/interview/evaloffer) · 계약 결정(check/route_gate) surface 공통. "데모 티 → 제품"으로 끌어올리는 **시각만** 마감(함수·로직·DOM id·data-* 불변, 신규 hex 0). 새 디자인 발명 ✕ → 기존 디자인 가이드(`04_디자인가이드/aap_platform_ui_design_guide_v0.1.md`) 일관 적용.
> **전부 `core/platform-fix.css` override 레이어에 추가**(platform.css·JS 미수정 → 다른 세션 충돌 0).
- **(1) 1뷰포트·가로 퍼짐 제거 (§6.7·§4.1)**: 근본 원인 = `.run-surface .con-head>*{max-width:760px;auto}`(platform.css)가 op 모드의 `.op-strip-wrap`을 760 중앙으로 몰아 **단계 strip이 가운데로 뜨고** 본문(op-split)은 풀폭이라 좌우 경계가 어긋남. → op 모드 한정 strip max-width 환원 + **strip·steer·본문(op-split)을 동일 `--op-maxw:1240px` 중앙정렬·`--op-padx:28px` 공유**로 좌우 경계 일치. op-main=흐름 / op-aside=`flex:0 0 360px` 고정 레일(비율→폭 캡으로 퍼짐 제어). 1240 캡으로 와이드 화면 양옆 여백 확보.
- **(2) 타이포 통일 (§4·§4.3 타입 스케일)**: 기존 8.5~16px 난립을 `--fs-micro:9 / --fs-sub:11 / --fs-body:13 / --fs-h:15 / --fs-hero:17`로 수렴. 본문 상향(13), 마이크로 라벨만 9~11 UPPER+letter-spacing. strip 노드·steer 옵션·후보 행·슬롯·verdict·근거 라벨 전부 정합.
- **(3) 네비 또렷 (§5.3)**: 단계 strip `.op-snode` 13px·`.op-sn` 21px·아이콘 키움, 현재/완료=weight 800·대기=opacity .62 위계 명확, 클릭 타겟 확대(padding 7/12).
- **(4) 톤·카드 1스타일 (§2)**: HITL 바 데모틱 그라데이션 → `amber-soft` 단색(auto=green-soft), 카드 라운드 `--r-card:12px` 통일·옅은 `--shadow` 일관, aside 보조 레일 `--surf` 배경으로 차분히. 색=의미(teal 주체·amber HITL) 유지, red·장식색 0.
- **모션**: 추가·변경 0 (§2 "상태 전이에만" 유지 — 기존 spin/FLIP 그대로).
- **검증**: 헤드리스(Edge new headless · puppeteer-core 임시) — ① 채용 매칭(design) ② 계약 결정(check) 각각 1뷰포트·strip↔본문 경계 일치·폰트 통일·네비 또렷 확인. ③ 회의·VOC 스트림 폴백+HITL 모달 **무회귀**(op-* 스코프라 ws-on-stream 무영향). 임시 드라이버·스크린샷 삭제 완료.
- **후속(2차 기능 패스 · 이번 범위 ✕)**: 재분석 속도·근거 강화·깜빡임·동적 시각화(모션 강화).

### v0.44 (데모, 빌드 완료 · 260623)
- **(1) 우측 상태 범례 제거 → 카드 self-라벨** — `buildFlow`에서 `.rg-leg.top`(상태 색인) 삭제. 카드마다 우측 상단 아이콘+문구로 상태 표기(`stLabel`: 작동중=로딩 스피너 / 완료=✓ / 준비중·대기=색점 `.rn-dot`). 〔기획·UX〕
- **(2) 카드 높이 축소** — 폰트 유지하고 여백·줄간격 압축(rg-node padding 7/9→5/8·rn-nm/rn-desc margin·line-height·rn-caps/rn-more/cards-row/seqar/band). 우측 스크롤 최소화. 〔기획·UX〕
- **(3) 좌측 상태 테두리 통일(좌우 일관)** — 진행중=파랑 / 완료=초록 / 대기=회색. compose·understand 동기화 라인 active를 teal→**파랑**(우측 doing과 일치), 결과 카드(`.kard`)에 단계 상태 테두리(`kdoing` 파랑·`kdone` 초록, `kardCls()`). 〔기획·UX〕
- **(4) a-i↔b-i 동기화 확장 — understand** — `syncLines(SUB)` 공통 렌더로 일반화(compose·understand 공유), understand ops g:0,1,2 순차화, `UNDERSTAND_SUB[3]`(킥오프 파악→근거 수집→외부 공유 승인[risk]). 솔루션 목업 단계(prepare·meeting·share)는 목업 유지+요소 점등 정렬로 후속. 〔기획·UX〕


### 하니스 — evaluate-in-the-loop 4도메인 전수 게이트 통과 + 드롭인 3팩 (260623, aap-lead) 〔표준·정의 / app/ 세션 핸드오프〕
> 직전 evaluate-in-the-loop(계약)를 **N4(구매·경비)에도 이식** → 4도메인 전수 게이트 통과. app/ 무관(워크플로+_decision_engine).
- **결과(독립 evaluate.js 재검증)**: 계약A 10/10·계약B 9/9·구매 11/11·경비 11/11, **slot drift 전부 0**. 게이트가 도메인 고유 결함 자동 해소(구매=config 임계 슬롯 6종 drift+임계값 seed 역산[3R]·라벨 부분문자열 오매칭 / 경비=th_amount_tolerance 리터럴 치환[1R]).
- **★app/ 세션에 더 나은 데이터 공급**: `_decision_engine/dropin/`에 **3팩**(`pack_contract_A`·`pack_procurement`·`pack_expense`.decision.json) = 하니스 자동생성+게이트 통과+독립 재검증본(수기 0). ★현재 app/ 세션이 bake 계약 팩 + evaluate() 통합 중(아래 항목) → **이 게이트 통과본으로 교체 권장**(drift·자동승인 누출 없음 보장).
- **부수 발견(개선안)**: 게이트 기대-outcome 도출이 seed 라벨 정규식("자동승인" 부분문자열) 의존 → seed에 `expectedOutcome` 명시로 정밀화.
- 워크플로 인라인 게이트(evalGate)=`evaluate.js` 동형(2 워크플로 공유 로직). 〔표준·정의 후속〕

### app/ 구현체 — 결정 런타임 `evaluate()` 통합 + bake된 계약 팩 "데이터 주도 조작형 결정 콘솔" (Phase 1, N3 §D·E 정합) (260623, aap-platform) 〔표준·정의 / 기획·UX〕
> **목표 증명**: "채용은 예시일 뿐, 다른 도메인(계약)도 같은 조작형 화면을 자동으로 가진다" — 채용=리스트형(후보 랭킹), 계약=**단일 케이스형(슬롯+판정)**, 같은 프레임워크·다른 모양.
- **① evaluate() 코어 드롭인**: `_decision_engine/evaluate.js` → `app/core/evaluate.js` 복사(원본 미수정) + `index.html`에 `<script src="core/evaluate.js">`(코어 src 앞). `window.AAP_EVALUATE` 노출. 코어에 **도메인 무관** `evalCase()` 추가 = 팩이 `caseModel`+`knowledge.route`를 주면 `evaluate({caseData, ...thresholdOv}, knowledge)` 실행→`STATE.verdict`. 케이스 open(`hydrateFromCase`)·임계 steering 시 재실행. **N3 §D 표준 = io.editable.recompute 의 백엔드가 evalCase**.
- **② 결정층 1급 필드 + caseData 영속**: `STATE.caseData/verdict/thresholdOv` 추가. `caseTemplate`에 `coerceSlots`(seed `input[{slot,value}]`→caseModel.slots 타입강제: number/boolean/array) → 케이스에 영속(hydrate/persist). `caseModel`·`knowledge` 없는 팩(회의·VOC·채용)은 **graceful no-op**.
- **③ 코어 graceful 가드(도메인 무관 · bake 팩 호환)**: `groupsOf`·`traceStep`·`renderRight`·`renderArchCoherence`·`renderPlan`이 `w.ops||[]` 허용, `renderSeq`/`renderPlan`이 `w.role||stRole(w)`(kind→역할 폴백). **계약 전용 코어 분기 0**.
- **④ bake된 계약 팩 register**: `app/packs/contract_a.js`(JSON을 JS로 감싼 `window.AAP_PACKS.contract_a`). `SEED_PACK_IDS`에 `contract_a` 추가(기본 deployed)→카탈로그·인박스 등장. seed 4건. **knowledge.route = 실행 가능 안전 DSL**(bake JSON의 prose decisionTables를 DSL로 인코딩, 임계는 `$th_riskScore`/`$th_pdfConf` 슬롯 참조)→**seed 골든 4/4 통과**(AUTO/REVIEW/REVIEW/REJECT).
- **⑤ 데이터 주도 조작형 결정 콘솔(surface.opstage)**: 채용과 **같은 척추**(steering→재계산→근거→HITL, `AAP_LIVE`/`wireSteer` 재사용). 슬롯 패널(caseModel.slots 값·출처·추출방식, risk/gap 강조) + 판정 카드(verdict outcome green/amber/red + **basis 근거** + ruleId) + 참조 룩업(필수조항·결재선·인지세) + **steering=io.editable 임계 2종**(추출 신뢰도·위험점수 → 라이브 재평가 → verdict·basis 갱신) + HITL 모달(분기 판정·체결). CSS는 기존 op-* 재사용 + ct-* 신규(**신규 hex 0**, 기존 토큰만).
- **검증**(헤드리스 Edge · ASCII 임시 드라이버, 검증 후 삭제): 19/19 PASS — 팩 등록·evaluate 노출·시드 4건·caseData 채움·verdict 골든 4/4·**steering flip(스캔 케이스 임계 0.7→0.5: 법무검토→자동승인)**·op-console DOM(슬롯/판정/룩업/steering 버튼/4단 strip)·HITL 모달·인박스·카탈로그 계약 등장·**채용/회의/VOC 무회귀**. `node --check` 전 파일 OK. SCHEMA_VER 5→6(재시드).
- **남은 것(다음 Phase)**: 채용 리스트형을 동일 표준으로 통합 / contract B·구매·경비 register(surface는 계약과 동형) / flow `next`(route verdict→gate 분기 바인딩) 정통화(v2 §8).

### v0.43 (데모, 빌드 완료 · 260623)
- **좌↔우 a-i↔b-i 세분 연계(동기화 재생) — compose 프로토타입** — 좌측 고객 화면 sub-라인이 한 줄씩 펼쳐질 때 우측 AAP 컴포넌트가 1:1로 점등(동기화). compose ops를 g:0,1,2,3 순차로 변경(병렬 2그룹→4단계)해 reveal 그룹과 좌측 a1~a4 인덱스를 일치. composeCard를 `COMPOSE_SUB[4]`(작업분해→데이터연결→배정→승인게이트) 동기화 렌더로 교체: `rev===i`면 active(스피너)·`rev>i`면 done(✓)·`rev<i`면 미노출, a4는 책임 지점이라 red. 방식 선택=AskUserQuestion '동기화 재생만'(번호 배지·호버 교차강조 제외), 범위='compose 먼저 프로토타입'. 상시·배경 레이어(백그라운드 AAP 구조)는 그대로 유지. 〔기획·UX〕


### 하니스 고도화 — evaluate-in-the-loop (생성 루프 내 실행 검증 게이트) (260623, aap-lead) 〔표준·정의〕
> harness/loop engineering 고도화(app/ 무관). 하니스 생성 루프(dslify 뒤)에 **인-프로세스 결정론 게이트(JS·에이전트 0)** 추가: 생성된 DSL을 실제 실행→①슬롯 drift(route 참조 ⊆ caseModel) ②seed 분기 커버리지 검사→실패 시 **evalFix 에이전트가 보완해 게이트 통과까지 루프**(run5). 13에이전트.
- **결과: A·B 둘 다 1라운드에 게이트 PASS**(A 10/10·B 9/9). 표준 `_decision_engine/evaluate.js` 독립 재검증 동일(`verify_evalgate.js` 교차검증).
- **★자가수복**: 직전 evaluate가 잡은 2결함을 게이트가 자동 해소 — ①`toxicHighCount` 슬롯 caseModel 추가+전 seed 값 주입(drift) ②**보완 룰 `R6B`(toxicUnmatchedCount≥1→LEGAL_REVIEW) 자동 생성**해 신종 모호 건 자동승인 누출 차단. = prose critic이 놓친 걸 **실행 게이트가 잡고 LLM이 고침.**
- **의미**: 자기검증 = "prose critic" → **"prose + 실행 게이트" 2중**으로 진화. 자동 DSL이 "진짜로 도는" 것을 게이트가 보장 → 직전 "auto DSL 품질 게이트 필요" 항목 **해소**.
- **드롭인 승격**: `_decision_engine/dropin/pack_contract_A.decision.json` = 하니스 자동생성+게이트 통과본(수기 0·독립 10/10). app/ 통합 무변(INTEGRATION.md ≈3줄+헬퍼).
- 워크플로 인라인 엔진(`evalGate`/`_evalRoute`/`_cond`)=evaluate.js와 동형. 다음=procurement·경비도 evalGate 적용. 〔표준·정의 후속〕

### v0.42 (데모, 빌드 완료 · 260623)
- **우측 작동 흐름 폰트 확대(특히 카드)** — 단계 설명은 좌측 화면 툴팁(`#csGuide`)·우측엔 제거한 합의 유지 확인 후, 우측 전반 폰트를 키움. 카드(rn-nm 10.5→12.5·rn-desc 9.5→11·rn-lay 9.5→11.5·rn-ty/st/ccap·rg-node padding 5/8→7/9), Master(rm-tx b 11.5→13), 상시밴드(bg-nm 9.5→11.5·bg-d 8→9.5), 헤더(stage-h 9→10.5·trig-h 8.5→10·ph 14→15.5·범례 9→10) 등 29곳. 좁은 폭(1280)에서도 카드 헤더 한 줄 유지·오버플로우 없음 검증. 〔기획·UX〕


### v0.27-onramp (플랫폼 app/, 빌드 완료 · 260623) — On-Ramp(새 업무 요청) 강화 ①②③
- 준비문서 `04_디자인가이드/aap_onramp_apply_prep_v0_1.md` + 검토 `aap_studio_enhancement_review_v0_1.md §1` 대로 구현. 백업=`_archive/app_v0_27_pre_onramp/`(core.js·icons.js·platform.css·platform-fix.css, baseline aa725f1). 〔플랫폼·구현〕
- **③ 유형 인식 governed (top-N·신뢰도·근거)** — `matchPackByText` 가 `ranked[]`에 `hitToks`(근거 토큰) 추가, 임계 상수 `NC_MIN_HITS=2·NC_MIN_SCORE=0.14` 분리 + `ncCandQualifies()`. `renderNcReco` 가 단일 매칭 → **top-3 후보 카드**(`_ncRecoItem`: ty-badge + 신뢰도 바 `nc-conf` score% + 근거 `nc-why` hitToks). 후보 클릭=그 유형 실행, 임계 전부 미달이면 격상 유도 유지. 〔플랫폼·구현〕
- **① 입력 다양화 (io.inputs)** — `_renderNcInputs(el,pack)` 가 매칭/최고후보 팩의 `io.inputs[]` 읽어 동적 렌더: `type:file`=**mock**(파일명·건수만, 실파싱 ✕ → `_ncIO`), 그 외=텍스트 필드. 값→`ncSeed.ioLines`→`createCase` 가 요청 텍스트에 합류. recruiting(file×2) 활용, meeting(빈 io)=텍스트만(무회귀). 〔플랫폼·구현〕
- **② 명확화 질문** — `_ncClarifyQuestions(text,m)` 결정론 규칙 3종(임계 미통과→성격 질문 / 1·2위 근소 경합→택1 / 토큰<3→규모·목표). `_renderNcClarify` 가 `#ncClarify`에 선택형 칩 노출, 답→`_ncClarifyAns`→`_ncAugText`로 **재매칭 보강**(②가 ③ 인식 실제 향상)+`ncSeed.ioLines` 합류. 실제 LLM 되묻기=Phase3. 〔플랫폼·구현〕
- 패널 markup에 `#ncClarify`·`#ncInputs` 슬롯 추가, `closeNewCase`가 세션 `_ncIO/_ncClarifyAns` 초기화. `icons.js`에 `help-circle` 추가. `platform.css` 말미에 On-Ramp 강화 CSS(토큰 var만, 신규 hex 0): `.nc-conf/.nc-why/.nc-inputs/.nc-drop/.nc-field/.nc-clarify/.nc-cl-*`. 〔플랫폼·구현/디자인〕
- 무회귀: 기존 텍스트만 입력 동작·매칭→실행·미매칭→격상·`createCase`/`caseTemplate` 시그니처·반환 호환(`{packId,score,ranked}`)·io 빈 팩 텍스트 전용·코어 도메인 무관(io 읽기·top-N=일반 메커니즘). 검증=헤드리스 Chrome(웹시큐 해제 iframe 하네스, 임시 `?nctest` 훅 후 제거): top-N(recruiting 24%/4토큰·meeting 6%/1)·io.inputs(rec 2·meet 0)·명확화(short 2·ambig 1)·텍스트전용 seed(ioLines 0)·io seed 합류·메뉴 슬롯 존재·**JS 에러 0**, 본 index.html 부팅 무에러. 〔검증〕
- 후속(다음 아티팩트): 자산 드로어(편집)·도메인팩 온톨로지 1급화·워크플로우 디버거. 〔후속〕

### v0.41 (데모, 빌드 완료 · 260623)
- **좌측 고객 화면 = 결과·결정만, 판단 근거·로직은 우측으로** — understandCard에서 `신뢰도 92%`(L6 AI 품질·평가 점수=엔진 로직) 제거. 좌측은 '무엇이 됐는가(결과)'+'사람이 결정할 지점(HITL)'만, 근거 4유형·로직·점수는 우측 노드 모달에만. HITL `cm-why` 한 줄(왜 확인해야 하나=책임 맥락)은 유지. 〔기획·UX/표준·정의〕


### 하니스 DSL emit + evaluate end-to-end + 드롭인 패키지 (`_decision_engine/`, `dropin/`) (260623, aap-lead) 〔표준·정의 / app/ 세션 핸드오프〕
> 계획(`~/.claude/plans/iterative-growing-aho.md`) Phase A·B. **app/ 무관.** 하니스에 `dslify` 단계 추가 → 검증된 prose route를 **평가 가능 DSL 자동 emit**(run4: A 9 rules+fallback, `excludedDisplaySlots:["riskGrade"]`=seed10 학습 반영). `verify_harness_dsl.js`로 evaluate.js에 직접 실행.
> **★Explore 확인**: Pack Contract v2 **`flow`·`kind`·`loopPhase`·`gate.decisions`는 이미 코드 랜딩**(packs/meeting·voc·recruiting + core stKind/stLoop 204–219). **결정층(caseModel·knowledge·evaluate·flow `next`)만 공백** = 이 트랙이 채움. 런타임 `decide(v)`(core.js:1454)는 기록만.
- **★핵심 발견 — evaluate가 prose critic이 놓친 2결함 표면화**: ①riskGrade를 분기서 뺐으나 보완 룰(toxicUnmatched) 없어 **신종 모호 건이 자동승인 누출**(분기 커버리지 구멍) ②route가 caseModel에 없는 파생 슬롯(toxicHighCount) 참조(슬롯 drift). outcome A 9/10·B 7/9. = **prose+severity는 못 잡고 실행 검증(evaluate)이 잡음.**
- **권고(하니스 dslify v0.2)**: ①whenDSL을 caseModel.slots 키로만 제한 ②생성 루프에 **evaluate 게이트** 내장(route 참조 슬롯⊆caseModel·전 seed expectedRoute 라우팅). 통과해야 DSL 채택.
- **드롭인 패키지(`_decision_engine/dropin/`)**: `evaluate.js`+**golden `pack_contract_A.decision.json`**(evaluate 10/10 검증)+`INTEGRATION.md`(랜딩 v2 정합 ≈3줄+헬퍼). **app/ 세션 통합**: ①evaluate.js→app/core + index.html `<script>` 1줄 ②팩에 caseModel·knowledge 필드 ③flow gate `next:{AUTO_APPROVE,LEGAL_REVIEW,REJECT}` + `nextStage` 헬퍼(playNext ~1467)에서 `AAP_EVALUATE.evaluate(caseData,PACK.knowledge).outcome`로 분기 ④pre-gate verdict.basis 근거 레일. knowledge 없는 기존 팩=선형 폴백(무회귀).
- 본 건=문서·엔진·검증(코드 0 in app/). 〔표준·정의 / app/ 세션 핸드오프 후속〕

### v0.40 (데모, 빌드 완료 · 260623)
- **(1·내 추가제안) 우측 흐름 끊김 없이 동적화 — 증분 렌더** — `renderRight`를 `buildFlow`(구조 1회 생성, key=단계+expanded)+`updateFlowStates`(점등은 클래스 토글만)로 분리. reveal tick마다 DOM 재생성 안 함 → CSS 애니가 끊기지 않음. `.stages`에 **흐르는 입자(`.flow-spark`)** = 작동 중(.stages.working)에만 좌측 스파인을 따라 cyan 점이 내려감(@keyframes flowspark). 진행바·스피너→✓와 결합. 〔기획·UX/데모〕
- **(2) HITL 모달 축소** — `.cmodal-card` max-width 540→412·padding 축소, `.cp-btn` 13→12px·padding 축소, ch-must/ch-sec/ch-op 컴팩트화. 좌측 화면 안에 한눈에 들어옴. 〔기획·UX〕
- **(3) AI 어투 정리** — 'A · B' 식 가운뎃점(·)으로 문장+라벨 잇는 표기 폐기('꼭 확인해 주세요 · 책임 지점'→'꼭 확인할 책임 지점', 'AAP 추천 · 원하면'→'AAP 추천, 원하면'). 카드 desc 끝 **온점(.) 제거**(compNode·bg·trig·cm-why). 데이터 구분용 '·'(결정 3 · 후속 3 등)는 유지. 〔표준·정의/기획〕
- **(4) HITL 참석자 추가 기능** — approve 모달 내부 참석자에 **'+ 참석자 추가'**(점선 칩). 클릭 시 ADDPOOL(강민재·윤서연·임도윤)에서 순차 추가→토글 on, `partsCount/partsNames`·결과 카드에 반영. 〔기획·UX〕
- **(5) 업무 순서 화살표 복원** — 8단계 칩 사이 `›`(`.sarrow`) 7개 재배치(컴팩트). 〔기획·UX〕


### app/ run 뷰 = 조작형 surface 종합 프레임워크 (steering+라이브 재분석+FLIP+SVG 그래프) (260623, aap-platform) 〔기획·UX / 표준·정의〕
> 확정 디자인 목업 3종(`03_프로토타입/aap_의도반응형_테스트_v0_1.html`·`aap_단계별_surface_v0_1.html`·`aap_BD근거뷰_목업_v0_1.html`)을 app/ run 뷰에 이식. **메시지: "정해진 대로 보는 정적 화면 ✕ → 사람 의도에 따라 결과·흐름이 곳곳에서 갈라지는 조작형 작업 화면."** 메인=조작형 surface, 스트림/근거=보조. chat ✕ → **인라인 의도 steering**.
- **코어 일반 프레임워크(도메인 무관, `core/core.js`)** — 신규 4종, 채용 전용 분기 0:
  1. **라이브 재분석 엔진** `runReanalysis(opts)`→`window.AAP_LIVE.run/busy`. 비침투 상단 작은 카드(`#reov`, `.run-surface` 마운트·전체 덮기 ✕·메인만 `.live-busy` 흐림) + 진행바 + step spinner→✓ + 구체 수치(mono) + **연속 클릭 잠금(`_LIVE_BUSY`)**. 끝나면 onDone()=결정론 recompute.
  2. **FLIP** `flipCapture/flipPlay`→`window.AAP_FLIP`. `data-flip` 키로 옛 위치 기록 → 재렌더 후 옛→새 위치 활강(innerHTML 통째 교체 깜빡임 제거).
  3. **의도 steering 배선** `wireSteer(root)` — `[data-steer]`/`[data-steerval]` 클릭 → 팩 `surfaceHooks.steerHook(S,key,val)`→{intent,mono,steps?,instant?,trace?,toast?} → 라이브 재분석(또는 instant=분기 즉시) → FLIP 재렌더. recompute는 팩 소유(결정론).
  4. **조작형 콘솔** `renderOpConsole()` + `hasOpSurface(C)` 게이트. 팩이 `surface.opstage(C)` 제공 시 = 상단 단계 strip(`opStageStrip`·코어 일반·`[data-opstep]` 탐색) + steering 바 + 조작형 main(메인) + 보조 aside(그래프·근거). **미제공 팩(회의·VOC)·비매칭 단계 = 기존 `streamSplit` 폴백(graceful·무회귀).**
- **안정 ID·격리 보존**: `#surfHead`(strip+steer)·`#surfBody`(main+aside)·`#flow`/`#explain`/`#caseTune`(op-console선 `.op-hidden-mount` 숨김 마운트 — renderRight·demo 호환). `case.overrides`(P5)·HITL `decide`/`decideHook`/`#cmodal`·Contract v2·자동저작·wfeditor·삭제 전부 유지. 외부 라이브러리 0·인라인 SVG·Lucide 인라인.
- **채용 팩(`packs/recruiting.js`, 플래그십 3단계 surface)** — 기존 결정론 엔진(`mOf`/`normWeight`/`cutThreshold`/`shortlistIds`/`breakdown`/`RUBRIC`) 재사용, 케이스 격리(`recrWPreset`/`recrIntentFilt`/`recrScope`/`recrSlotPref`/`recrPanel`/`recrEvalW`/`recrOfferLvl`/`recrDropped`):
  - **매칭·랭킹**(design/shortlist_gate/screen) = 후보 랭킹 행(FLIP) + 근거 분해 막대(스킬 teal/경력 blue/도메인 cyan 기여) + 컷라인 + **우선순위(균형/도메인/경력/스킬)·필터(재택/시니어/커머스)·면접 범위 분기(톱3/표준6/넓게)** steering + **SVG 매칭 그래프**(요건 허브←후보·굵기=매칭) + HITL 바. 후보 빼기(`data-opdrop`)도 라이브 재분석.
  - **면접 조율**(interview_gate) = 슬롯 카드 + 슬롯 선호·패널 steering + 캘린더 교차 근거.
  - **평가·오퍼**(offer_gate/evaluate) = 스코어카드(루브릭) + 오퍼 패키지 + 평가 가중·오퍼 수준 steering.
- **검증**: `node --check` 전 파일 OK. 로직 드라이버 = 재랭킹 확인(BAL: 정유진>이하늘>임재훈… / DOM: 이하늘 #2→#4·박서준 #4→#2 / SKL: 한도윤 #5→#3 — 의도별 순위 갈라짐). 헤드리스(Edge) = 매칭 단계 opbody/strip7/steer10/rows10/graph1/hitlbar1/flowmount1 + steer 클릭 시 reov·busy 활성 + 면접 slots3/steer5 + 평가 sc/offer OK. **무회귀**: meeting·voc·recr-intake = stream 폴백(op=0) 확인.
- **다음**: 코어 steering/재분석/FLIP를 form spec §6 고도화 로드맵에 승격 후보 등재. 회의·VOC도 같은 프레임 깊은 surface(opstage) 작성 시 동일 메커니즘 즉시 적용.

### 다리 2 — 코어 evaluate() 독립 구현·검증 (`_decision_engine/`, 드롭인) (260623, aap-lead) 〔표준·정의 / app/ 세션 핸드오프〕
> 유저 "app 작업 따로 하고 붙일 수는?" → **결정 엔진은 UI 없이 단독 구현·검증 가능, 나중에 2줄로 붙임** 입증. `_decision_engine/evaluate.js`(도메인 무관 선언형 룰 해석기·순수·결정론·안전 DSL·`window.AAP_EVALUATE`+`module.exports`) + `contract_A.structured.json`(route DSL화) + `run_eval_test.js`. **app/ 무관·Node 검증.**
- **검증**: contract_A 10 seed → **outcome(자동/검토/반려) 10/10 ✅·재현성 OK·추적성 OK(ruleId+basis)**. rule 9/10.
- **★발견(중요)**: seed10 라벨 R10인데 실제 R7 발화 — `riskGrade=중`이 route R7에 끼어 라벨↔발화 불일치. **하니스 run2가 이미 식별(riskGrade 분기 배제)했으나 run3 severity가 minor로 통과시켜 baked 팩이 미수정 물려받음.** → **prose critic은 못 잡고 evaluate(실행)가 잡음.** 시사: ①하니스 route emit 시 표시용 파생(riskGrade) when 배제 ②baked 후 evaluate 실행 검증 2중.
- **DSL**: all/any/not·비교 6·in·intersects·empty. ref `$slot`. route 첫매칭·outcome 3분기. 임의 코드 ✕(안전·하니스 emit 가능).
- **드롭인(app/ 세션)**: `evaluate.js`→`app/core/evaluate.js` + index.html `<script>` 1줄 + 호출부 `AAP_EVALUATE.evaluate(case,PACK.knowledge)` 1곳(→flow next/basis). 전제=PACK.knowledge.route DSL 형태(하니스 emit 업그레이드, 이 트랙 다음).
- **이 트랙 다음(app/ 무관)**: 하니스 S4 프롬프트를 **DSL when emit**으로 → 4팩 자동 DSL화 → 어댑터(다리1)→evaluate(다리2) 데이터로 전구간 자동 연결. 〔표준·정의 / app/ 세션 핸드오프〕

### v0.39 (데모, 빌드 완료 · 260623)
- **(1) 우측 흐름 동적화(호르무즈 프로토타입 기법 차용)** — rhead(고정 영역)에 **진행바**(단계 진행률 비례 채움·width 전환 매끄럽게) + '작동중' 카드에 **스피너**·'완료'에 **✓**. 데이터 흐름이 '돌아가는' 느낌 강화. 〔기획·UX〕
- **(2) 단계 설명 → 좌측 화면 툴팁(`#csGuide`)으로 이동, 우측 `rg-expl` 삭제** — 고객 화면 위 다크 말풍선(아래 화살표 포인터)로 단계 설명 표시(역할·라벨 + guide). 우측에선 제거. 〔기획·UX〕
- **(3) 상태 범례 우측 정렬**(`.rg-leg.top` justify-content flex-end, '상태' 라벨만 좌측). 〔기획·UX〕


### 로드맵 — 스튜디오 4화면 고도화(새 업무 요청·도메인팩·워크플로우·자산) (`aap_studio_enhancement_roadmap_v0_1.md`) (260623, aap-lead) 〔기획·UX / app/ 세션 핸드오프〕
> 유저: "4화면에 어떤 점이 고도화되면 좋겠나? 하니스·설계 중 app/ 기준으로." → 공통 축 = **하니스가 만든 결정층·evaluate·검증(severity)·재사용 레시피를 4화면에 흘려보내기**.
- **새 업무 요청**: 키워드 분해→**bake 카탈로그 인식**(packs_baked)·드릴다운(analysis 명시지/암묵지)·격상 검증을 **§9 severity**로·고객 환경 입력 조건화·정직한 baked/신규 2분기.
- **도메인팩**: 결정층(caseModel·knowledge·seeds) 1급 뷰·**검증 배지**(blocking0=✅)·프로파일 variant(A사/B사)·재사용 레시피 가시화·provenance lineage.
- **워크플로우**: gate `next`↔route 결정테이블 **3분기 시각화**·kind/loopPhase 표면화·gate↔knowledge basis·**io.editable 라이브 튜닝→evaluate 재계산→seeds 재라우팅**(시뮬레이터화)·branch-coverage 검사.
- **자산**: **knowledge 자산화**(임계 패밀리 5종·결재선표·정책금지룰셋 가로질러 재사용)·evaluate() 공유 모듈·Connector 자산+바인딩 상태·사용처 lineage·재사용률.
- **우선순위**: 첫 도미노=**코어 evaluate()+결정층 1급 필드**(N3 §D, app/ 세션). 그 위에 4화면 동시 활성. 이 트랙은 bake 카탈로그·provenance·검증·공유 knowledge 자산 후보 공급(app/ 무관).
- 본 건=로드맵 진단만(코드 0). app/ 구현은 단일 writer 세션이 Pack v2와 함께. 〔기획·UX / app/ 세션 핸드오프 후속〕

### 다리 1 구현 — 하니스 출력 → 앱 Pack v2 어댑터 + 4개 bake (`_harness_out/adapter_harness_to_pack_v0_1.js`, `packs_baked/`) (260623, aap-lead) 〔표준·정의 / app/ 세션 핸드오프〕
> N3 §C(다리 1) 참조 구현. `finalPack`(하니스 생성) → **Pack v2(flow+io+결정층)** 결정론 변환(LLM ✕·Node). 4개 bake: `pack_contract_A/B`·`pack_procurement`·`pack_expense`. **app/ 무관**(`_harness_out/`에만, `app/packs/`엔 미투입 — 단일 writer 협의 후 드롭).
- **정밀(1:1 통과)**: `caseModel`·`knowledge`·`seeds`·`components` = 하니스 출력 그대로(어댑터 핵심 가치). **휴리스틱(v0.1)**: `flow`의 kind(input/auto/gate)·loopPhase·gate.decisions, surfaceSpec(stub) → app/ 세션이 v2 2b서 정통화.
- **v2 정합**: `io.editable[].recompute='evaluate(case,knowledge)'`(v2 §3.2 백엔드=N3 §D), flow gate.decisions=route 결정테이블 라벨 미러(SSOT=knowledge), `provenance.reviewedBy:null`(미검토 표식). 결과: 슬롯 24~48·룰표 16~21·seed 9~11/팩, flow auto 우세+게이트 1~4(규정 심사 형태).
- **재생성**: `node adapter_harness_to_pack_v0_1.js`(하니스 재실행→finalPack 변경 시 어댑터만 재실행).
- **app/ 세션 후속**(packs_baked/README §app 연결): 코어 `evaluate()` 추가→knowledge 소비 / flow gate `next`↔route verdict 바인딩 / `pack_<id>.json`→`app/packs/<id>.js` 래핑·register / surfaceSpec·flow 정통화. 〔app/ 세션 핸드오프〕

### v0.38 (데모, 빌드 완료 · 260623) — 다건
- **(1)** 단계 설명을 업무순서 레일 바로 아래 항상 표시 + 그 아래 상태 범례(순서 뒤집음). **Run 중 검정 툴팁 생략**(narrate 미호출, 커서만 이동). 〔기획·UX〕
- **(2)** HITL 확정 알림(토스트)을 **고객 화면 안 인-콘솔 토스트(`.ctoast`)**로(전체 정중앙 ✕). 〔기획·UX〕
- **(3)** 우측 카드 '데이터·근거·산출물' 링크 = `margin-top:auto`로 **항상 카드 좌하단 고정**(세부 토글 유무 무관). 〔기획·UX〕
- **(4) 8단계 좌측 장면 → 우측 순차 점등** — request=포털 AI바 / understand=파악 결과 카드 / compose=진행 계획 카드(T1~T5) / approve·commit=인-콘솔 확인 모달 / prepare=워크스페이스 채워짐 / **meeting=Teams(코멘트 시퀀스+커서로 녹음 ON→우측 STT 점등)** / share=Confluence 발행. **working/result 모달 제거**해 좌측 장면이 항상 보이게(`currentCM`=HITL choice만). 〔기획·UX/표준·정의〕
- **(5)** **느리게**(reveal 1400·dwell 2400) + **일시정지/계속**(Run 3상태 ▶Run→❚❚일시정지→▶계속) + **단계 클릭=그 단계 1회 재생**(좌→우 점등 후 정착). 〔기획·UX〕
- **(6)** AI 어투 제거(`—`·`~함.`→자연스럽게)·**그룹웨어→Works AI**. 〔기획·UX〕


### 진단+설계 — 하니스↔앱 연계 진단 + 다리(N3) 핸드오프 (`aap_harness_app_bridge_n3_v0_1.md`) (260623, aap-lead) 〔표준·정의 / ★app/ 세션 핸드오프〕
> 유저 진단 요청: "하니스 구성? '새 업무 요청'에서 확인되나? 스튜디오(도메인팩·워크플로우·자산)도 연계돼야." → **현 상태 = 3중 단절**(하니스 Claude Code 환경·앱 무관 / '새 업무 요청'=키워드 theater·옛 Pack / 앱에 evaluate() 없음). 앱 '새 업무 요청'→격상(pipeline.js)→genericAuthor→register→스튜디오 **배선은 있으나 결정층 없는 옛 Pack이 흘러 반쪽**.
> **★Pack Contract v2와 보완 관계 확인**(충돌 0): v2=flow/io 구조 일반화 / **N3=그 단계 안 결정 룰 엔진**(caseModel·knowledge·evaluate). v2 §8 '열린 결정: next 분기 모델'과 직접 맞닿음.
- **다리 3개 설계**: ①스키마 정합(하니스 출력→Pack v2 필드 매핑: subProcesses→flow·caseModel→io.inputs+결정층·knowledge→신규 결정층 필드·seeds→seeds) ②**evaluate(case,knowledge) 코어 표준**(안전 DSL·verdict basis·§9 severity 러너[N1b 학습]·route verdict가 v2 flow next 분기 결정·io.editable.recompute의 백엔드) ③소비 seam(오프라인 bake 권장 — pipeline.js propose* 자리에 꽂기).
- **스튜디오 연계**: register 1번에 도메인팩(정의)·워크플로우(flow)·자산(components) 동시 — 배선 존재, 결정층만 흘려보내면 온전.
- **★app/ 세션 핸드오프(§G·§H)**: 코어 evaluate()+안전 DSL+§9 러너·pipeline.js propose*→bake 연결·flow↔route next 바인딩은 **app/ 단일 writer 세션이 v2와 함께** 구현. 정합 포인트 5개 명시(next 선언형 통일·결정층 1급 필드·evaluate 코어 소유·severity 검증·@verdict basis). 하니스 S9→Pack v2 emit은 이 트랙 독립 진행 가능.
- 본 건 = 진단·설계만(코드 0). 〔표준·정의 / app/ 세션 핸드오프 후속〕

### app/ 구현체 — 인박스 개별 케이스 삭제 + 시드 좀비 방지 (260623, aap-platform) 〔기획·UX/표준·정의〕
- **인박스 행 삭제 액션**(`core/core.js` `_inboxStatusGroups`): `.ibx-row`에 휴지통(Lucide `trash`, hover 노출) `data-del` 버튼 + **행 내 인라인 확인**(`삭제할까요? 삭제/취소`, `data-confirm/delyes/delno`). 실수 방지 2-스텝. 클릭 전파는 `renderInbox` 이벤트 바인딩에서 `.ibx-del/.ibx-confirm` 영역 차단. CSS는 `core/platform.css`(red 토큰·신규 hex 0).
- **삭제 동작**(`core/core.js` 신규 `deleteCase(id)`): `APP.cases`에서 제거 → 케이스 객체 내부에 격리된 P5 델타(`case.overrides`)·trace·packState 동반 제거(별도 전역 저장소 없음) → `saveApp()` → 인박스/카운트 갱신. **활성 케이스 삭제 시** `clearActiveCaseOverlay()`(팩 레벨 복원)·`APP.active=null`·`setView('inbox')` 복귀.
- **★시드 좀비 방지**: 시드마다 안정 키 `packId:seedIndex`를 케이스에 stamp(`c.seedKey`, `seedPack` 갱신) + 삭제 시 그 키를 영속 집합 `APP.deletedSeeds`(`aap.v1.deletedSeeds`)에 등록. `seedPack`이 **per-seed**로 바뀌어(기존 pack 단위 early-return 폐기) `deletedSeeds`·이미 존재하는 seedKey를 건너뜀 → 리로드 시 삭제 시드 부활 안 함. `SCHEMA_VER 4→5`(기존 케이스에 seedKey 부여 위해 1회 재시드).
- **검증**(헤드리스 Edge CDP, 임시 드라이버 검증 후 삭제): ① 휴지통→확인→삭제 시 행 9→8·케이스 제거·`deletedSeeds`에 키 등록 ② 활성 케이스 삭제 시 `active null`·view `run→inbox` ③ 리로드 후 삭제 시드 **부활 안 함**·`deletedSeeds` 영속(total 9→7) ④ voc/recruiting 시드 무회귀. `node --check` 전 파일 OK.

### v0.37 (데모, 빌드 완료 · 260623) — 다건 반영
- **(1) 좌측 캡션** = `고객이 보는 서비스 화면`(괄호 'kt ds 업무 포털' 삭제)·**글씨 키움**. **'작동 안내'(수동 가이드 투어) 버튼 삭제**(누르면 01로 리셋 → 제거). 단계 설명(`w.guide`)은 업무 순서 레일 아래 단계 설명으로. 〔기획·UX〕
- **(2) 우측 제목 위계** = **`AAP 작동 흐름` 단일 주제목(teal 엔진 헤더)** + **`업무 순서`(8단계)를 그 안의 하위 레일로 흡수**. 〔기획·UX〕
- **(2) 반응형** — 큰 모니터 `zoom`(≥1700·≥2200)·좁은 화면 좌/우 스택(≤1024). 〔기획·UX〕
- **(3) 좌/우 색 구분** — 좌=라이트 포털·우=**teal 엔진 헤더 + 쿨 톤(#edf2f8) 캔버스**. 〔기획·UX〕
- **(3) 카드 세부 토글** — 분량 있는 카드(작업 분해 T1~T5·데이터 식별 4·캘린더 3안·자료 수집·발송안 점검)에 `▸ 세부 N` 인라인 토글(`op.sub`·`STATE.expanded`). 근거·산출물 모달 유지. 〔표준·정의 + UX〕
- **(4) 3계열 구분 강화** — 상시·배경 / **"이 단계 작동 구성요소 · 업무 순서에 따라 바뀜"**(헤더+teal 좌측 바) / 맥락 트리거("· 맥락이 바뀔 때만") 라벨 명시. 〔표준·정의 + UX〕
- **추가1: HITL 운영 트리거 '회의 시작'** — 게이트(🔴 책임 승인) 2 + **운영 트리거(▶ 사람이 시작) 1** 도입. 준비→회의 전환 시 Teams 켜진 뒤 사람이 '회의 시작'(자동재생은 자동 press). 업무 순서에 **트리거=파랑 점 / 게이트=amber 점** 구분. 〔표준·정의 + UX〕 *(표준 'HITL 2게이트' → '게이트 2 + 운영 트리거 1'로 확장 — §2 HITL 모델 갱신 대상)*
- **추가2: 좌측 고객 화면 실제 솔루션 목업** — 회의 진행=**Teams 통화 뷰**(참석자 타일·발언자 강조·REC·실시간 자막) / 공유·기록=**Confluence 발행 뷰**(페이지·체크·발송 채널). 회의/공유 단계는 working 모달 대신 이 뷰로 진행 표시. 〔기획·UX〕

### app/ 구현체 — 자동저작(AAP화)을 「분해·배정·조립 rich 시각화(G1) + 고객 콘솔 연결 미리보기(G2)」로 정렬 (목업 `03_프로토타입/aap_스튜디오_목업_v0_1.html` 정합) (260623, aap-platform) 〔기획·UX〕
> 자동저작 결과가 칩 나열(빈약)·생성 후 즉시 run 점프(연결 안 보임)였던 갭 2개 해소. `core/authoring.js`만 수정(코어 도메인 무관·생성 팩 데이터에서 결정론 도출). 입력 소스(제조 품질·직접 입력)·딥링크(`?author=1|run|gen`)·register/load·Pack Contract v2 보존.
- **① G1 — 분해·배정·조립 rich(파이프라인 완료 후 표면화)**: `decompose(pack)`가 `pack.work`의 **AAP 실행 단계(actor=aap, request·hitl 제외)를 작업 T1..Tn으로 표면화**. 각 작업 = 이름 + 목표(ops out 1~2 요약) + **배정 구성요소 5타입 색 배지**(`opType(op)`가 comp·feed·out 문자열로 P>C>S>M>A 우선순위 결정론 분류 → `.au-cmp.tA/tM/tS/tC/tP` + Lucide bot/boxes/database/plug/shield) + **"왜?"** 한 줄(`WHY`, 가장 비-Agent 타입 근거 = '전부 Agent ✕'). **조립 그래프**(`renderG1`): 작업을 HITL 게이트로 분절 → 게이트 사이 묶음=병렬(`.au-asm-par` '병렬 N')·게이트=amber(`.au-gate2` + `pack.gates` 라벨)·순서=↓.
- **② G2 — 고객 콘솔 연결 미리보기(finish 교체)**: `finish()`가 즉시 run 점프 → **2열 split**(`.au-split` = 좌 G1 스튜디오 + 우 violet 메타 패널). `consolePreview(pack)` = mini 콘솔(작업 흐름 스트림=`work`에서 human 제외·gate 강조·첫 게이트 직전 done/이후 wait + 산출물 파일 탭=`products` 절반 ready) + **매핑 명시**(`분해·배정→작업 흐름`·`게이트→사람 결정`·`산출물→파일 뷰어`) + **[이 고객 콘솔 생성·실행] CTA**(`#auLoad` 유지). CTA → 기존 `register`+`load`(Side A 스트림 실행) — 즉시 점프 대신 미리보기 후 명시적 생성.
- **③ 스튜디오 톤**: 자동저작=BD 도구 → violet 메타 악센트(`.au-conn` violet 그라데/테두리·`.au-conn-lead/.au-conn-map` violet·가이드 §6.5.5). 단 1차 CTA(teal)·구성요소 타입색은 규칙대로. `.cmp` 충돌 회피 위해 배지는 `.au-cmp`로 네임스페이스.
- **파일**: `core/authoring.js`(TYPE/opType/composeKey/WHY·decompose·taskCard·renderG1·consolePreview·renderG2·finish 교체, `ic()` = AAP_ICON 인라인 SVG) · `core/platform.css`(`.auth-box:has(.au-split)` 1000px 확장·`.au-split/.au-studio/.au-conn`·G1 `.au-tgrid/.au-tcard/.au-cmp/.au-asm/.au-grow/.au-gnode/.au-gate2`·G2 `.au-mini/.au-ms/.au-mf/.au-conn-map/.au-cta`). **신규 hex 0**(가이드 토큰 + 기존 Solution cyan 팔레트만), Lucide 인라인(이모지 ✕), `node --check` 전 파일 통과. **헤드리스 검증**(임시 드라이버 iframe→`?author=1`→`#auGo`, 검증 후 삭제): ① 작업 카드 4 + 5타입 배지 14(tA/tM/tP/tC/tS 전부)·Lucide SVG 14 ② 조립 그래프·게이트(amber) 2·병렬 1 ③ 고객 콘솔 미리보기·스트림 6(done 2/gate 1)·산출물 4탭·매핑 명시 ④ CTA→오버레이 hidden·시퀀스레일 노출(Side A 실행) ⑤ `?author=run` 무회귀(콘솔 직행) 전부 OK.

### app/ 구현체 — run 뷰를 「작업 스트림 + 산출물 뷰어」로 재구현 (자동 진행·스테퍼 제거·HITL 모달) (목업 `03_프로토타입/aap_작업스트림_목업_v0_3.html` 정합) (260623, aap-platform) 〔기획·UX/표준·정의〕
> 사용자 불만 #1("자동으로 작동하는 것 같지 않다 — 내가 phase를 눌러 진행")을 해소. run 뷰 메인(상단 스테퍼 + 내업무/업무진행 2탭 + 워크스페이스 본문)을 **좌 자동 작업 스트림 + 우 산출물 뷰어**로 통째 대체(Claude 아티팩트/draft 패턴). **코어 도메인 무관 일반 도출**(flow·ops·products) — 채용 전용 분기 0. 회의·VOC 동일 구조 자동 적용·무회귀.
- **① 자동 작업 스트림(좌·코어 일반)**: `streamLeft(C)`가 `WORK(flow)`를 위→아래 카드로 자동 누적. 상태 `strState`(완료✓/진행 pulse/대기 흐림, 게이트=결정 여부로 done/cur/wait). 카드 = role·라벨·시각(`strWhen`)·설명(`strDesc`=ops feed→out 또는 explain)·**구성요소 5타입 색 배지**(`strComps`=ops를 `evidType`로 tyA/M/S/C/P dedupe)·산출물 '열기' 링크(`artForStep`)·'자세히' 펼침(`strDetail`=explain+ops 전체). **상단 스테퍼·2탭 제거**(runtop `.seq`/`.rt-lab`/`.rt-prog` CSS 숨김·#seq DOM 유지=demo.js 호환). 상단 자동신호 = `renderRunAction` 'AAP 작업 중 · N/총 단계' pill(await=amber '여기서 결정이 필요해요'·done=완료).
- **② 산출물 뷰어(우·코어 일반)**: `streamArts(C)`가 `PACK.products`(DLV)를 파일 탭 + 선택 문서로. 생성 시점=`products[k].readyAt`(stepId) 우선, 없으면 등장 순서 균등 배치(graceful). 생성 전=대기(흐림·클릭 불가), ready=`resolveDlv` 본문 렌더 + 열기/다운로드(stub). 좌측 산출물 링크→`STATE.artK`로 우측 해당 파일 열기. 회의·VOC products 있으면 표시, 없으면 '표시할 산출물 없음'.
- **③ 자동 진행 메커니즘**: `openCase`→`restoreStep`(완료분 누적·현재 지점 복원) 직후 `autoAdvanceOnOpen` — 현재 단계가 게이트/라이브 await/완료가 **아니면** `STATE.playing=true`+`setSel`로 자동 재생 시작 → `revealOps`/`playNext`가 비-게이트 단계를 순차 자동 완료하며 **게이트(stIsGate)·라이브에서 멈춤**(사람 결정 대기·#cmodal 모달). 결정(`decide`) 후 `STATE.playing=true`+`playNext`로 **다시 자동 이어서 진행**. 사용자가 스테퍼 누를 일 0.
- **④ HITL = #cmodal 오버레이 재사용**: 스트림 게이트 카드(amber·`data-strgate`)→`gotoGate`→`setSel`→`currentCM`='hitl'(또는 라이브=meetingStart/Live)→기존 `cmodal-card.wide`. 컷·가중 편집→결정론 재계산·P5 격리(`STATE.recrCut/recrWeight`·공유 불변)·`decide`/`decideHook` 전부 보존. io(`wsIoBar`/`ioActivate`)·`case.overrides`·자산/로그/거버넌스·자동저작·wfeditor·On-Ramp 보존.
- **파일**: `core/core.js`(renderConsole 스트림 분기·streamSplit/Left/Arts·strState/When/Desc/Comps·artKeys/ReadyStepIdx/Ready/ForStep/curArtK·wireStream·autoAdvanceOnOpen·renderRunAction pill·decide 자동재개·STATE.artK transient) · `packs/recruiting.js`(products[].readyAt 5종·demo 시나리오 target #seq/.recr-board→.strm-left/.strm-arts) · `core/icons.js`(zap·alert-circle·download·external-link) · `core/platform.css`(.strm-split/.strm-left/.st/.hitl-card/.strm-arts/.file/.strm-doc + runtop 스테퍼 숨김·.rt-running pill + .con-body.stream-body·.ws-on-stream). 옛 `wsProgress`/`wsTabBar`/`wsStepDetail`은 미사용 잔존(무해). **신규 hex 0**(가이드 토큰만), `node --check` 전 파일 통과. **헤드리스 검증**: 채용(스트림 9카드·게이트 3·5타입 배지·산출물 5탭·결정→자동진행 done 3→5·art ready 1→4)·회의(8카드·라이브 게이트·6탭)·VOC(7카드·5탭) 전부 split 렌더·스테퍼 없음·ws-tabs 빈·게이트 모달 OK.

### app/ 구현체 — run 뷰 워크스페이스 2탭화(내 업무/업무 진행) · HITL 모달 컷·가중 편집 · io(업로드·커넥터·editable) 실동작 · 프로세스 심화 (260623, aap-platform) 〔기획·UX/표준·정의〕
> Side A(고객 워크스페이스) 고도화 4종. 옛 'AAP 작동 보기' 토글 드로어(#runEvid 다크 아사이드)를 **「업무 진행」 탭으로 흡수** — run 뷰가 '드로어를 켜야 보이는 작동'에서 '탭으로 항상 접근 가능한 단계·HITL·작동'으로. 코어 도메인 무관 메커니즘, 채용 분기 0.
- **① 워크스페이스 2탭(코어 일반)**: `STATE.wsTab`('mine'|'progress', 코어 소유·케이스 전환 시 'mine' 리셋). `#wsTabs` 바(`wsTabBar`)를 run-surface 상단에. **내 업무**=기존 base(doneBand·결정 큐·evidList). **업무 진행**(`wsProgress`, 코어 일반 도출)=①WORK 전체 단계 타임라인(완료/진행/대기·role·ops 요약·loopPhase 배지·클릭 펼침) ②HITL 통제점(stIsGate amber·클릭→게이트 이동) ③AAP 작동(옛 드로어 흡수 — `#explain`/`#caseTune`/`#flow`를 `.wp-aap.run-evid` 다크 마운트로 이식, `renderRight` 재사용). **#flow/#explain/#caseTune/#seq/#surfHead/#surfBody 안정 ID 보존**(아사이드→탭 본문으로 단일 이전, 중복 ID 없음). `#aapTg`/`#aapTgX` 버튼 제거, `data-aapsee`('어떻게 했는지 →')는 `AAP_setWsTab('progress')`로 전환. 데모 투어 design 스텝은 `do.wsTab:'progress'`(demo.js applyDo 일반 지원)로 #flow 가시화.
- **② HITL 모달 확대 + 컷·가중 편집(io.editable)**: HITL cmodal `.cmodal-card.wide`(560px·Notion 차분). 숏리스트 모달에 `editorBlock` — 프리셋(엄격≥90/표준≥85/넓게≥80)+컷 슬라이더+가중 2축 슬라이더(도메인=잔차·합 100). **격리(P5)**: 공유 `JOB.weight`·`c.match` 절대 미변경 → 케이스 단위 `STATE.recrCut`/`recrWeight`에만 저장(persistKeys 추가). `cutThreshold`/`mOf(C,c)`/`breakdown(c,C)`/`shortlistIds`/`passCount`가 STATE 우선 참조해 결정론 재산출 → 모달 미리보기·결정 큐·evidList·보드 카드의 후보수/매칭% 실시간 갱신. 슬라이더 드래그=라벨 라이브, change=전체 재계산(드래그 끊김 방지).
- **③ io.inputs·connectors 실동작(결정론 mock·코어 일반)**: 코어 `wsIoBar`(내 업무 탭 상단)가 `PACK.io.inputs/connectors` 읽어 업로드(이력서+8·JD)·외부 소싱(잡코리아+12/사람인+9/링크드인+6) affordance 렌더. 클릭=`ioActivate` 결정론 핸들러(멱등·`entry.setKey`로 STATE 갱신·trace·`STATE.ioDone` 케이스 영속). 채용 surface `applicantsOf(C)`=기본+업로드+소싱이 헤더·doneBand·JD 스트립에 반영. **회의·VOC=io 빈 배열→미표시(graceful)**.
- **④ 프로세스 심화**: 업무 진행 탭 단계 펼침(`STATE.wsStepOpen`·코어 일반)=`wsStepDetail` — ops 전체(comp 5타입 배지·feed→out·micro·detail 표)+step.explain('무엇을·무엇으로·어떤 근거로').
- **파일**: `core/core.js`(STATE.wsTab/wsStepOpen/ioDone, renderConsole 2탭 분기, wsTabBar/wsProgress/wsStepDetail/wsIoBar/ioActivate/setWsTab, wireSurface data-wstab/wsstep/wsgate/ioinput/ioconn, renderCModal wide, hydrate/persist ioDone, aapTg 제거) · `packs/recruiting.js`(normWeight/mOf/cutOf/passCount/uploadsOf/sourcedOf/applicantsOf, editorBlock, 숏리스트 모달 재작성, io 채움, persistKeys, decideHook no=cut90, data-aapsee→탭) · `core/demo.js`(applyDo wsTab) · `core/icons.js`(upload·plug) · `core/platform.css`(.ws-tab/.io-bar/.io-chip/.wp-*/.ed-*/.cmodal-card.wide, .wp-aap.run-evid 오버라이드, evid-collapse :not(.wp-aap) 가드). **신규 hex 0**(가이드 토큰·기존 팔레트만), `node --check` 전 파일 통과.

### 하니스 N4 — 도메인 확장(구매·경비) · 범용 시나리오 공장 입증 (`aap_harness_poc_result_v0_1.md` §10) (260623, aap-lead) 〔표준·정의〕
> 같은 하니스(severity-aware critic 기본)로 **구매·조달 / 경비·지출** 신규 도메인 시나리오 생성 → 계약 아키타입과 가로질러 비교. 9 에이전트·542k 토큰·8.3분. 원본=`_harness_out/scenarios_procurement_expense_n4.json`. ※app/ 무관.
- **결과: 구매·경비 둘 다 0회 pass**(무수정 1패스, severity critic 효과 일관). 구매=11 route 분기(3견적·단가편차·예산약정·쪼개기 split_score≥70·신규벤더 실사·벤더 컴플라이언스), 경비=12 route 분기(직급×비용×지역 한도표·법인카드 3-way 대사·정책금지룰셋·중복분할·OCR·riskScore≥85 SIU).
- **★sharedArchetype(계약·구매·경비 가로질러 동일)**: 6단계 파이프라인·decide 2계층·route 3분기 서열(하드차단→HITL승급→자동승인 fallback)·gap↔게이트 1:1·임계 패밀리 5종(금액캡·결재선룩업·신뢰도컷 0.8·패턴탐지·소진초과)·결재선 위임전결표·writeback. **아키타입·서열·엔진 공유**(단계 수는 도메인별 가변 — 토큰 동일 ✕. `aap_트랙_리스크_진단` #5).
- **★reuseRecipe(하니스 산출)**: 새 도메인 = ①슬롯 매핑 ②knowledge 4종(룩업·임계값·룰·정책금지) ③route 사유표 ④writeback 대상만 교체. 골격(파이프라인·decide 2계층·route 서열·gap↔게이트·임계 패밀리)은 고정.
- **판정**: 하니스 트랙(가설 검증) **일단락** — 신뢰 가능(N1b)+범용(N4)+고객 변수 조건화(앞선 PoC) 3박자 확보.
- **표준화 연결**: 이 6단계 파이프라인·임계 패밀리 5종·route 3분기 서열은 app/ Pack Contract v2 `decide/evaluate`가 도메인 무관 코어로 일반화할 때 **검증된 도메인 무관 골격**으로 참조 가능. 〔표준·정의 후속〕

### app/ 구현체 — run 뷰 → 고객 업무 워크스페이스(근거 토글 드로어·결정 큐 히어로·스테퍼 강등·좌 nav 분리·채용 surface 재작성) (목업 `03_프로토타입/aap_업무워크스페이스_목업_v0_2.html` 정합) (260623, aap-platform) 〔기획·UX/표준·정의〕
> 문제의식: run 뷰가 스테이지 재생 내레이션 + 운영자 껍데기 + 데모 흔적(페르소나·운영 콘솔·과대 ATS 보드)으로 "데모 재생"·"채용 SaaS"처럼 보임 → **"AAP에게 맡긴 한 업무를 처리하는 작업 공간"**으로 전환(채용=인사 업무 중 하나).
- **A. 우측 근거 레일 → "AAP 작동 보기" 토글 드로어(코어·도메인 무관)**: `.run-evid`를 기본 숨김 + runtop 우상단 토글 스위치(`#aapTg`)로. 켜면 우측 **다크 엔진룸 드로어**(372px)로 **업무 분해·구성요소 배정**(5타입 색 카드 + 범례 + LLM/결정론 칩) / **사람이 결정할 통제점(HITL · amber, 대기/예정/완료)** / **처리 로그**(L배지) 노출. 토글 상태 `APP.collapse.aapDrawer` localStorage 영속(run 한정 노출). `#flow`/`#explain` 안정 ID 보존(데모/안정성). `renderRight()`가 ops→`.dt` 다크 카드 + `drawerGates()`/`drawerLog()`로 재구성.
- **B. 중앙 = 업무 워크스페이스(채용 surface 재작성 · recruiting.js)**: ATS 보드(JD스트립+탭+풀보드) → 목업 워크스페이스. **업무 헤더**('AAP에게 맡긴 업무' 키 + "채용 1차 스크리닝" + 진행%·결정 N건) **페르소나 '한지원'·제품 브랜딩 제거**. **"AAP가 해둔 일" 밴드**(완료 auto 체크리스트). **"당신이 결정할 것 (N)" 결정 큐 히어로**(미결정 HITL 게이트 전면화 · 클릭→기존 HITL 모달 재사용). **"근거·상위 후보" 컴팩트 리스트**(풀 보드 ✕ · 후보 상세 candDetail 유지 · '파이프라인 전체 보기'는 접힘). 탭 탐색 제거.
- **C. 결정 큐 = 코어 일반 도출(도메인 무관)**: 코어 `pendingGates()`가 `flow`의 `stIsGate` && 미decided 단계를 결정 큐 아이템으로 산출(state=pending/upcoming/done). `ctx()`에 `gates`/`openGate`/`gateDecided` 노출 → 팩 surface는 라벨·설명만 채움(채용·회의·VOC 동일 프레임). live 세션 게이트는 meetPhase 미완료=미결정.
- **D. 스테이지 스테퍼 강등(코어)**: runtop `.seq`/`.snode`를 박스 스테퍼 → **배경 진행률 칩 스트립**(주 컨트롤 ✕, 클릭 되짚기 유지). 워크스페이스가 주인공.
- **E. 좌측 운영자 nav 분리**: `body.run-active`에서 글로벌 nav(`.gnav`)·nav-toggle·운영 부제 숨김 → 목업처럼 **"‹ 내 업무"(인박스 복귀) 백 링크**만. run 외 뷰에선 nav 정상.
- **적용 범위**: 채용=목업대로 깊게 재작성(플래그십). 회의·VOC=코어 일반 프레임(드로어 토글·결정 큐·스테퍼 강등·nav 숨김) 동일 적용 + surfaceSpec 본문 무회귀(워크스페이스 프레임 안에서 깨지지 않게).
- **보존**: 결정론 엔진·수치, case.overrides(P5) 격리, HITL decide/decideHook/cmodal, 자산/로그/거버넌스, 자동저작·wfeditor·On-Ramp·pipeline, Contract v2 flow/stIsGate/stDecision, demo.js 안정 ID, file://(script src·외부 라이브러리 0), Lucide 인라인, 코어 도메인 무관(채용 전용=recruiting.js).
- **검증(헤드리스 Edge)**: ① 채용 케이스=깨끗한 워크스페이스(좌 nav 숨김·드로어 닫힘·결정 큐 히어로·"AAP가 해둔 일" 밴드) ② 토글 → 드로어(분해·배정 5타입 색·통제점 amber·로그) ③ 결정 큐 → HITL 모달 → decide → 큐 갱신(pendingGates 재산출) ④ 회의·VOC 무회귀(워크스페이스 프레임 + 자기 surface + 동일 드로어). node --check 4파일 OK.

### 하니스 N1b — critic severity 튜닝 결과 (`aap_harness_poc_result_v0_1.md` §9) (260623, aap-lead) 〔표준·정의〕
> N1b: critic severity(blocking/minor) + cap 5 + fixer freeze 적용 후 resume 재실행(S1~S8 캐시). 9 에이전트·**176k 토큰·4.4분**(직전 fix-loop 1.33M의 1/7).
- **결과: A사·B사 둘 다 첫 critic에서 즉시 pass(fix 0회)**. 검증 대상=캐시된 run1 원본 시나리오.
- **★핵심 발견**: 직전 "A사 3회 미수렴(fail)"은 **시나리오 결함이 아니라 critic의 이분법(edge 갭을 hard-fail 취급)** 탓. blocking(핵심: route 전 분기 1:1 커버·추적성·gap 누출 없음·미정의 입력 없음) vs minor(edge: 단일 임계 seed·인지세 상위구간·문서용 임계·문구 긴장)를 가르자 **raw 출력이 수정 없이 pass**.
- **정직한 한계**: fix 0회라 **cap·fixer freeze는 미발동**(blocking 없어 호출 안 됨). severity 단독이 효과 전부. → 하니스 기본값으로 **severity-aware critic 채택**.
- **잔여 minor(비차단)**: 자동갱신 없음 분기 단독 seed·법무 후속 3결과 seed·인지세 상위구간·위약벌>10% 트리거 — route 본질 무관, freeze 1라운드로 선택적 마감 가능.
- **표준화 연결**: 이 **severity 모델(blocking=데이터구동·분기커버·추적성·gap누출·미정의입력·재현성 / minor=edge)**을 app/ Pack Contract v2의 `decide/evaluate` 검증 러너 §9 기준으로 직접 채택 권장(과엄격 게이트가 비용·오판의 주원인이었음).
- **다음**: N4 도메인 확장(구매·경비, 범용성 입증)▶권장 / N3 실행 표준 핸드오프 / (선택) freeze 1라운드로 minor 마감. 〔표준·정의 후속〕

### app/ 구현체 — 온톨로지 그래프화 (목록 → 노드 그래프 · 객체=노드/관계=엣지/Action=배지) (`04_디자인가이드/aap_layout_improvement_spec_v0_1.md` §3) (260623, aap-platform) 〔기획·UX〕
> 명세 §3 후속(직전 레이아웃 v0.1이 "그래프화는 후속"으로 남긴 항목) 구현. 도메인 뷰 온톨로지 탭을 목록형 → **Palantir 톤 다크 엔진룸(`.plg-*` 재사용) SVG 노드 그래프**로. 객체=노드(teal)·관계=라벨 엣지·Action=객체 배지(자동 green/사람확인 amber). 코어가 ontology 데이터로 렌더 → **도메인 무관**, ontology 없는 팩(meeting/voc)은 generic 폴백 유지(무회귀). 안정 ID `#ontologyBox` 유지·뷰 키 불변·X1 dcText 전 텍스트 적용. file:// 동작·외부 라이브러리 0.
- **백업**: 셸 cp/PowerShell 전부 차단 → 물리 백업 `_archive/app_v0_26_pre_ontograph/` 미생성. git 복원 기준 **HEAD c8a18cb**(변경 전). 변경 파일=`packs/recruiting.js`·`core/core.js`·`core/platform.css`.
- **[ONTOLOGY] 관계 구조화**(`packs/recruiting.js` `ONTOLOGY`) — `relations[]`를 그래프용 `{from, label, to}` 구조로 재정의(+display `t`는 하위호환 유지·목록 렌더용). 객체에 `k`(영문 핵심 키, 그래프 매칭용)·`on[]`(이 객체에 걸린 Action 키) 추가, `actions[]`에 `key` 추가(객체 `on[]`이 참조). 관계 1개 추가(`Application —for→ Job`)로 그래프 연결성 보강.
- **[ONTOLOGY] renderOntology → SVG 노드 그래프**(`core.js`) — `#ontologyBox`에: ①**결정론적 원형 레이아웃**(객체 노드를 원 위 균등 배치·좌표 고정 산출·추가 상태 0, N=1은 중앙). ②**객체=노드**(객체명+`속성 N · Action N`+해당 객체 Action 배지 dot green/amber). ③**관계=라벨 엣지**(중심선 단축·`marker-end` 화살표·라벨 칩). ④**노드 클릭/Enter→하단 상세 패널**(속성·Action·연결 관계, 선택 노드 하이라이트 `.sel`). ⑤**그래프/목록 토글**(`_ontoView`, 목록형 보존). 폴백(ontology 없음)·X1 dcText 전 라벨 통과. `_ontoKey` 헬퍼=`k`||`n`에서 영문 키 추출.
- **[ONTOLOGY] CSS**(`platform.css` 신규 블록) — `.onto-canvas`(radial 다크 엔진룸)·`.onto-node`(teal rect+hover/sel)·`.onto-edge`/`.onto-elbl`(엣지·라벨)·`.onto-badge`(auto green/confirm amber dot)·`.onto-detail`(다크 상세 패널)·`.onto-toolbar`/`.onto-tg`(토글)·`.onto-d-*`(상세 행). `.plg-wrap`/`.plg-canvas`/`.plg-leg` 재사용. 엔진룸 hex는 기존 `.plg-*` 컨벤션과 정합(다크 캔버스=토큰 외 hex 선례).
- **검증**(헤드리스 Chrome/Edge·`node --check` **전부 셸/IDE 차단으로 미실측** — 정적 추적만): ①객체 5노드·관계 5엣지·Action 배지(parse/score/screen=Application·interview·offer) 매핑 정합 확인 ②노드 클릭→상세(속성·Action·관계) 핸들러 바인딩 확인 ③meeting/voc=ontology 없음→generic 폴백 분기 무변경 ④도메인 탭/레이아웃 접기/뷰 키/`#ontologyBox` ID/Pack Contract v2/P2~P5 미접촉(렌더 함수 1개+팩 데이터+CSS만 수정) ⑤JS 정적상 에러 0(타 코드 relations 형태 미참조 grep 확인). **헤드리스 실측은 환경(셸·IDE 실행 전부 차단)으로 미수행 → 유저/후속 세션 1회 실행 권장**.
- **남긴 후속**: ① **meeting/voc 팩에 최소 ontology 추가**(현 폴백 → 그래프 표출) — 선택, 미구현(폴백 유지). ② 노드 수 많은 팩(>8)일 때 원형 레이아웃 라벨 충돌 가능 → force/격자 등 적응 레이아웃 후속. ③ 헤드리스 실측 1회(위 a~e). 〔기획·UX/후속〕

### app/ 구현체 — 레이아웃·편의성 개선 v0.1 (무스크롤·스크롤바 비표시·패널 접기·도메인 탭) (`04_디자인가이드/aap_layout_improvement_spec_v0_1.md` §1~§5) (260623, aap-platform) 〔기획·UX〕
> 명세 §1~§5 구현. 유저 핵심=스크롤바 비표시·1뷰포트·좌 nav/우 패널 접기·직관성. **온톨로지 그래프화(§3 그래프)는 범위 밖(후속)** — 이번은 탭까지. 코어 골격·뷰 키·안정 ID·Pack Contract v2·P2~P5·demo.js **무회귀**. 신규 hex 0(토큰만)·file:// 동작·Lucide 인라인 유지.
- **백업**: 셸 cp/PowerShell 차단 → git 복원 기준 **HEAD 86c68c0**(변경 전). 변경 파일=`core/platform.css`·`core/icons.js`·`index.html`·`core/core.js`·`core/wfeditor.js`. `_archive/app_v0_25_pre_layout/` 물리 백업은 셸 차단으로 미생성 → git 히스토리로 대체.
- **[LAYOUT] §1 스크롤바 비표시·1뷰포트**(`platform.css` 신규 블록) — 전역 `*{scrollbar-width:none;-ms-overflow-style:none}` + `*::-webkit-scrollbar{width:0;height:0}`(스크롤 기능 유지). `.view>.scroll`에 하단 fade 그라데이션(`::after` sticky bottom, 스크롤바 대체 신호). 페이지 전체 스크롤 ✕ → `.view`(overflow:hidden)+`.scroll`(flex:1·overflow:auto)로 패널 내부만.
- **[COLLAPSE] §2 좌 nav 접기**(`index.html` 상단바 `#navToggle`(menu 아이콘)·각 `.gnav-i`에 `data-label` + `platform.css` `body.nav-collapsed`) — 188px↔56px(아이콘만), `.gn-l`/`.gnav-grp` 숨김, 접힘 시 `::after` 호버 플라이아웃 툴팁(data-label). `.2s` 트랜지션. **접힘 상태서도 `#gnav [data-view]` 버튼 클릭 유지**(폭만 축소 → demo.js `.click()` 무회귀).
- **[COLLAPSE] §2 우 패널 접기**(run 근거 레일·workflow 팔레트·Run) — `.panel-fold`(» 접기, 패널 우상단)+`.panel-handle`/`.wfb-handle`(‹ 재오픈, 접힌 자리 가장자리). run: `#evidFold`(surface)·`#evidHandle`(run-main), `body.evid-collapsed .run-evid{display:none}`로 surface 풀폭. workflow: 팔레트/Run fold는 **wfeditor `renderPalette`/`renderRun` innerHTML에 주입**(매 렌더 재생성 대응) `#wfPalFold`/`#wfRunFold`, 캔버스 양끝 `#wfPalHandle`/`#wfRunHandle`. `wf-builder` grid-template-columns를 접힘 조합별 재배치(`0 1fr 300px` 등)로 캔버스 확대. Lucide `panel-left/right-close/open`·`menu`·`chevron-up` 아이콘 추가(`icons.js`).
- **[COLLAPSE] 영속**(`core.js`) — `APP.collapse{nav,evid,wfpal,wfrun}`+`APP.domTab` 단일 소스, `saveApp`/`loadApp`에 키 추가(타입 검증·기본 펼침/overview). `applyCollapse()`=body 클래스 토글, `toggleCollapse(k)`=토글+저장. fold/handle 버튼은 **document click 위임**(동적 재생성 안정 바인딩, `e.preventDefault`). boot에서 `applyCollapse()`+`applyDomTab()` 복원. SCHEMA_VER=4 유지(신규 키만 추가·기존 키 불변 → 스키마 무파괴, 기존 저장본은 기본값으로 안전 흡수).
- **[DOMAIN-TABS] §3 도메인 뷰 탭**(`index.html` `.dom-shell`/`.dom-top`/`.dom-tabsbar`/`.dom-body`/`.dom-pane` + `platform.css` + `core.js` `applyDomTab`) — 카탈로그(`#catGrid`) 상단 고정 + 하단 탭(개요[`waBox`]/온톨로지[`ontologyBox`]/아키텍처[`archMap`]) → 세로 스택·세로 스크롤 제거. ID 보존 → `renderDesign` 무수정 동작. 탭 상태 영속. **온톨로지 그래프화는 미구현(후속)**.
- **검증**(헤드리스 Chrome/Edge·셸 파일 op 차단으로 **미실측** — 정적·`node --check`만): `node --check` core.js/wfeditor.js/icons.js 전부 OK. 정적 추적: ①전 뷰 1뷰포트+스크롤바 비표시(전역 규칙) ②좌 nav 56px 토글·data-label 툴팁 ③우 패널 fold/handle 토글·`display:none`+grid 재배치 ④영속 키 save/load+boot 복원 ⑤도메인 탭 pane 전환 ⑥demo.js `#gnav [data-view].click()` — 접힘 시 버튼 존치 확인(폭만 축소). **헤드리스 실측은 환경(셸 차단)으로 미수행 → 유저/후속 세션 1회 실행 권장**.
- **남긴 후속**: ① **§3 온톨로지 그래프화**(객체=노드/관계=엣지/Action=배지, `.plg-*` 다크 캔버스 재사용) — 이번 범위 밖, 별도 작업. ② `.wfb-handle` 캔버스 스크롤 시 top:50% absolute가 함께 스크롤(긴 캔버스에서 가장자리 affordance 이탈 가능) — sticky/고정 개선 후속. ③ 헤드리스 실측(위 검증 a~g) 1회. ④ 디자인 가이드에 '패널 접기·1뷰포트·스크롤바 비표시·fade 힌트' 패턴 문서화. 〔기획·UX/후속〕

### app/ 구현체 — Pack Contract v2 · 2b 채용 흐름 정통화 (`aap_pack_contract_v2_spec.md` §6-2b·§3·§7) (260622, aap-platform) 〔기획·UX/표준·정의〕
> 채용 팩 `flow`를 **회의 틀에서 벗어난 채용 네이티브 9단계**로 교체. **코어 무수정**(2a 일반화로 충분 — 도메인 분기 0줄 유지). 회의·VOC 무회귀.
- **새 flow 그래프(9단계, 게이트 3)**: `intake`(요건 접수·input·Data) → `analyze`(요건 분석·auto·Semantic) → `design`(스크리닝 설계·auto·Reasoning·showCompose) → **`shortlist_gate`**(숏리스트 기준 승인·★HITL①·Decision) → `screen`(이력서 수집·스크리닝·auto·Action·doneModal·**후보 통과/보류·탈락 분기**) → **`interview_gate`**(면접 조율·★HITL②·Decision·**live ✕**) → `evaluate`(면접 평가 취합·auto·Action — 신규: 회의식 live 세션을 '조율 게이트'와 '평가 auto'로 분리) → **`offer_gate`**(합격·오퍼 승인·★HITL③·Decision) → `record`(기록·학습·auto·Learning·doneModal). 게이트 decisions 의 toast/label 도 채용 어휘로(컷 좁히기·일정 확정·처우 하향).
- **갱신한 stage id 참조처(전수)**: `FLOW`(9 단계 객체)·각 단계 `gate.decisions`·`loopPhase`·`showCompose`(design)·`doneModal`(screen/record) / `PLAN_PRODUCES` 키 9종 / `stepLoop` 키 9종 / `head()` stMap·`base()` stMap+분기(`id==='intake'|'analyze'|'design'`, working par 분기 `screen|record|interview_gate|evaluate`) / surface 위치판정 **`reached`/`colOf`/`candDetail`·`jdStrip`·`boardTools` 의 `idxOf>=4/5/6`·`i===4/5` 매직넘버 전부 → stage id 기준 헬퍼**(`atOrAfter(C,id)`·`boardReady`·`SCREEN_ID/INTERVIEW_ID/EVAL_ID/OFFER_ID`) / `cmodal` hitl 3분기(`shortlist_gate`/`interview_gate`/`offer_gate`)·done 2분기(`screen`/`record`) / `SURF_HOOKS.decideHook`(`shortlist_gate`/`offer_gate`) / `extExcluded`(`S.decisions['shortlist_gate']`) / `SEEDS` `atStep:'shortlist_gate'·'intake'` / `DEMO_SCENARIO` go 7종(analyze·design·shortlist_gate·screen·interview_gate·evaluate·offer_gate, evaluate 스텝 신규 추가). **demo.js·core 무수정**(가이드 go id 는 전부 팩 demoScenario 데이터 안).
- **screen 단계 분기 구현 방식**: 보드 5번째 컬럼 **'보류·탈락'** 신설(STAGES 에 `hold`) + `colOf` 에서 ① `screenVerdict(c).k==='drop'`(컷 미달=결정론 자동 분기) → hold, ② 담당자 `recrDecisions[id]==='reject'`(수동 탈락) → hold. 분기 = 별도 `next` 함수 없이 surface `colOf` 로 표현(선형 진행 + 보드 가시화 분기). 결정론 수치 일관: screen 시점 10명 = 숏리스트 6/스크리닝통과 1/보류·탈락 3, offer 시점 = 면접 5/오퍼 1/통과 1/탈락 3(합 10 유지).
- **코어 1줄·CSS 1줄 보강(도메인 무관, 2a 누락 아님)**: ① `hydrateFromCase` 에 **graceful 가드** — 저장된 `c.sel` 이 현재 flow 에 없으면(옛 stage id 케이스) `flow[0].id` 로 폴백(구버전 localStorage 케이스 깨짐 방지, 어느 팩이든 flow 변경 시 보호). ② `platform.css` `.recr-board` `repeat(4,1fr)`→`repeat(auto-fit,minmax(0,1fr))`(채용 보드가 4→5 컬럼이어도 깨지지 않게 · recr- 네임스페이스 한정).
- **검증**: `node --check` 전 파일 OK. ① 순수 Node 하니스 — flow id 9종=기대순서·게이트 3·live 0·stepLoop/planProduces/seeds/demoScenario id 정합·extExcluded 동작·surface head/base/cmodal/candDetail/board 전 단계 no-throw·board 컬럼 분기 카운트(통과1/숏6/탈락3·offer시 오퍼1)·수동 reject 분기(탈락3→4). ② **헤드리스 Edge(`--headless=new --virtual-time-budget`) DOM 드라이버** — 채용 ▶실행→**게이트 3곳(shortlist_gate·interview_gate·offer_gate)에서만 멈춤**→각 decide→`done`(stages: shortlist_gate→screen→interview_gate→evaluate→offer_gate→record, error 0). ③ **무회귀**: meeting 풀플레이(approve→prepare→**meeting live**→commit→share, liveHandled✓·done✓)·voc(approve→prepare→commit→share·done✓) 둘 다 error 0. ④ 스크린샷 — interview_gate 시점 보드 5컬럼(보류·탈락 포함) 정상 렌더·근거 레일 Decision/HITL 정상.
- **다음(2c)**: `io.inputs`(이력서·JD mock 업로드)·`io.editable`(컷·가중치 직접 수정→결정론 재계산)·`io.connectors`(잡코리아·링크드인·ATS·캘린더 stub).

### 하니스 fix-loop(N1) 실행 결과 (`aap_harness_poc_result_v0_1.md` §8) (260622, aap-lead) 〔표준·정의〕
> 시나리오 생성 하니스(`aap_scenario_harness_spec_v0_1.md`)에 스펙 §6 'critic 실패 시 루프백'을 닫음 — critic→fix→re-critic loop-until-pass(cap 3) 추가 후 **이 환경 Workflow resume 재실행**(S1~S8+첫 critic 캐시 재사용, fix/re-critic만 라이브). 19 에이전트·누적 ~2.8M 토큰·47분. ※app/ 무관(문서·Workflow 산출물).
- **수렴**: **B사(IT·중도) fail→fail→pass = 2회 수렴 ✅**(loop 실제로 닫힘 입증), **A사(제조·보수) 3회 cap 미수렴 ⚠️**이나 결함이 ①CQ→④추적성→⑤정합으로 라운드마다 지엽화(iter3 route 11분기 17 seed 1:1 전수 커버, 잔여=인지세 비과세측·pdf_score 가산밴드 edge seed 누락 + 프로파일 텍스트 긴장 — 핵심 라우팅 결함 아님).
- **fixer 추론 깊이(구조적 수정)**: monetaryContract carve-out(무금액 NDA/MOU 배상·위약 임계 면제, ③+④ 동시 깨던 근원 제거)·dt_route 상위우선 재정렬(emit 라벨↔실제 발화 1:1 추적성 회복)·파생 boolean 1급화·gap 자동승인 누출 게이트·0 vs null 명문화.
- **★루프 튜닝 3종 학습**: ①critic severity 부재(blocking/minor 구분 없어 edge seed 1개 누락=fail) → severity 추가·blocking 0이면 pass ②cap 3 부족(보수=분기多) → cap 5 ③fixer whack-a-mole(큰 구조 변경이 새 갭 유입) → 1라운드 후 스키마 freeze·seed/문구만 보강. 토큰 비용도 절감.
- **표준화 agent 연결**: 이 학습은 app/ Pack Contract v2(아래 다른 세션 작업)의 `decide`/`evaluate` 검증 러너 설계에 직접 반영 가능 — critic severity·branch coverage 잣대를 코어 §9 검증으로 표준화.
- **다음**: N1b 루프 튜닝(severity·cap5·fixer freeze→A 재실행 pass)▶추천 / N2 소비방식 / N3 코어 evaluate()(app/ 단일 writer 분담) / N4 도메인 확장. 〔표준·정의 후속〕

### app/ 구현체 — Pack Contract v2 · 2a 계약+코어 일반화 무회귀 리팩터 (`aap_pack_contract_v2_spec.md` §3·§4·§6-2a) (260622, aap-platform) 〔표준·정의/기획·UX〕
> **"8단계 고정·특정 stage id 하드코딩"을 코어에서 제거**하고, 각 팩이 자기 흐름을 `flow`로 선언하게 일반화. **순수 리팩터 — 채용·회의·VOC 3팩 동작 100% 동일**(무회귀 검증 ALL PASS).
- **`flow` 스키마 도입(§3.1)**: 각 팩 `work`(고정 8단계) → `flow` 배열로 이전. 단계마다 `kind`('input'|'auto'|'gate')·`loopPhase`(기존 `stepLoop` 흡수)·gate 단계엔 `gate:{label,decisions:[{key,label,toast}]}`·실시간 세션엔 `live:1`·compose 류엔 `showCompose:1` 부여. **stage id·라벨·ops·순서는 현행 그대로**(채용은 `meeting` 등 기존 id 유지 — 정통화는 2b). legacy 플래그(`actor`·`hitl`·`meeting`·`gate`·`doneModal`)는 wfeditor 호환 위해 병행 유지. export에 `flow:FLOW, work:FLOW`(동일 배열) + `io:{inputs,editable,connectors}` 슬롯 예약(§3.2, 실동작 2c).
- **코어 단계 메타 접근자 신설**(도메인 무관): `stKind`/`stIsGate`/`stIsInput`/`stIsLive`/`stHasDoneModal`/`stIsGateMark`/`stLoop`/`stDecisions`/`stDecision`/`stShowsCompose`. 모두 `flow` 필드 우선 + legacy 플래그 폴백 → flow 미선언 팩(authoring/pipeline 자동저작)도 통과.
- **코어 하드코딩 제거(§4)**: `currentCM`·`restoreStep`·`revealOps`·`runStep`의 `w.meeting`/`w.hitl` 분기 → `stIsLive`/`stIsGate`. `decide()`의 `w.id==='approve'?'외부 제외':'수정 요청'`·토스트 리터럴 → `stDecision(w,key).label/.toast`(팩 `gate.decisions`에서). `renderRight` compose casm `w.id==='compose'` → `stShowsCompose`. loopbadge `PACK.stepLoop[w.id]` → `stLoop`. `caseStatus`·`_caseEval`·`renderPlan`·`renderSeq` 게이트 판정 → 접근자. `meetPhase`(await_start/in_meeting/await_end) 메커니즘은 `stIsLive`로 일반화(회의 id 종속 해제 — 채용 `meeting`은 `live` 미선언이라 일반 게이트로 정확히 분기). **잔존 step-index 리터럴(`i>=4/5/6`)은 전부 팩 로컬**(recruiting `reached`/`colOf`·meeting surfaceSpec `ws`) → 2b 재작성 대상. 코어 도메인 분기 0줄.
- **격리 보존**: `setPackRefs`에서 `WORK=PACK.flow||PACK.work`(없으면 work 보존). `snapshotPack`/`restoreBase`가 `flow`·`work`를 **동일 배열 참조로 유지**(override/case.overlay 인플레이스 변경이 둘 다 반영) → packOverrides·case.overrides(P5) 누수 0 유지.
- **검증**: `node --check` 전 파일 OK. 헤드리스 Edge(`--headless=new --virtual-time-budget`) **DOM 드라이버로 3팩 각각 ▶실행→자동진행→HITL await 멈춤→decide(yes)→완료 1사이클 ALL PASS**(meeting=gate 3[approve·회의 live start/end·commit]·voc=2·recruiting=3[approve·면접 일반게이트·commit] — 채용 meeting이 live 아님을 정확히 검증). domain/govern/workflow/run 뷰 스크린샷 무회귀 확인(wfeditor 노드그래프·plan HITL 게이트·Eval·RBAC·ATS 보드·근거 레일 loopPhase/decisions 정상). **사용자 체감 변화 0 — 내부 구조만 일반화.**
- **다음(2b/2c)**: 채용 `flow`를 채용 고유 그래프로 교체(회의 id 탈피·`reached`/`colOf` 새 id 재작성·분기 `next`) → `io` 채움(이력서/JD mock 업로드·임계값 직접 수정 결정론 재계산·Connector stub).

### 하니스 PoC 실행 결과 (`aap_harness_poc_result_v0_1.md`) (260622, aap-lead) 〔표준·정의〕
> 시나리오 생성 하니스를 **이 환경 Claude Code Workflow로 실제 실행**(계약 도메인 × A사/B사 프로파일 → 시나리오 2종 생성·critic·비교). 9 에이전트·~388초·460k 토큰·5페이즈. **인프라 0·app/ 코드 0·LLM 저작 하니스에서만**(앱 라이브 API 불요 재확인).
- **가설 입증 ✅**: ①LLM이 실제 드릴다운(A사 13 subProcess·14 decision 명시지/암묵지 분류·20 슬롯·9룰 route·8 더미) ②**고객 변수가 시나리오를 실제로 가름**(A=SAP·온프레미스·ERP발주정합 1급 / B=Notion·DocuSign·대표결재 게이트 1급) ③**핵심 골격 재사용**(동일 아키타입 인입→추출→결정론 룰 1차→HITL 게이트→route 3분기[AUTO/LEGAL/REJECT]→결재선→대장, decide 2계층, gap↔게이트 패턴, 5대 위험검출축).
- **★핵심 발견 — critic 양쪽 fail**: critic이 통과 남발 안 하고 **진짜 결함 검출**(th_penalty_cap 입력 슬롯 부재·NDA 금액0 vs null 모호·templateDeviation unknown 갱신건 AUTO_APPROVE 누출·dt_renewal_notice 분기 더미 미커버). = "진짜로 돈다"의 자기검증 작동. 단 **스펙 §6 'critic 실패 시 루프백'을 PoC가 1회만 돌려 미구현** → 출력 시나리오는 분석 충실하나 §9(데이터구동·추적성·재현성) 미통과 상태.
- **다음**: N1 **fix-loop 닫기**(critic→fix→re-verify loop-until-pass, critic이 구체 수정안 이미 냄 → pass 수렴) ▶추천 / N2 소비방식 확정(보류) / N3 코어 evaluate() 해석기(app/ 단일 writer 분담 — 본 세션은 데이터·설계만) / N4 도메인 확장(구매·경비). 원천 JSON=temp 휘발, 필요 시 `_harness_out/` 영구저장. 〔표준·정의 후속〕

### 신규 명세 — 시나리오 생성 하니스 설계 (`aap_scenario_harness_spec_v0_1.md`) (260622, aap-lead) 〔기획·UX/표준·정의〕
> 배경: 유저 재정의 — "OCR/STT는 어렵다. LLM으로 ①업무 분석·드릴다운 ②더미데이터 생성 ③**고객 레거시 환경 반영(변수에 따라 시나리오가 계속 바뀜)**. API 호출 해야 하나? **요점은 harness·loop engineering.** 플랫폼 AAP는 아직 어려우니 특정 도메인을 AI로서 디테일하게 파고들어 **시나리오를 결과물로 생성**." → **(A) 저작을 '오프라인 LLM 하니스 = 시나리오 생성기'로 진짜로 만든다**(라이브 플랫폼 기능 ✕). 유저 확정(AskUserQuestion): 소비방식 결정 전 **"먼저 하니스 설계만".**
> **API 검토 결론**: 앱 안 라이브 API ✕(file://·단일HTML·포터블 유지·키노출·불필요 — 생성은 저작시점 활동). LLM은 **저작 하니스에만**, 출력 Pack 데이터를 앱에 구워넣음. 하니스=**이 환경 Claude Code Workflow/에이전트** 그 자체(인프라 0). 라이브 재생성(고객 변수 즉석)만 백엔드 필요→나중.
- **★중요 아키텍처 보정**: 하니스가 **코드 생성하면 위험** → `decide()`는 코어의 **범용 선언형 룰 해석기 `evaluate(caseData,knowledge)`**(안전 DSL: 비교·논리·룩업·산술만, 임의코드 ✕)로 두고, **하니스는 데이터(`knowledge`·`caseModel`·`seeds`)만 emit**. 검토·검증 가능·도메인 재사용. → 계약 P1 설계(`decide` 팩함수)도 보정: 범용 evaluate가 표준, 팩 `decide()`는 복잡도메인 escape hatch. 〔표준·정의〕
- **설계 골자**: ①입력=domain + **customerProfile**(legacy 인벤토리·dataAvailability.gaps·policy.approvalDelegation·riskAppetite·constraints) ②프로파일이 슬롯 source·Connector·결재선·임계·더미·게이트를 조건화("변수에 따라 바뀜") ③출력=Pack 데이터(+`caseModel`·`knowledge`·`seeds`·`provenance{reviewedBy}`) ④**10단계 loop**(S1이해→S2 WBS드릴다운→S3 명시지/암묵지 분류→S4 룰생성→S5 데이터·시스템매핑→S6 구성요소→S7 더미데이터(모든 route분기 커버)→S8 HITL→S9 조립→S10 critic) ⑤Critic 검증=CQ커버리지·데이터갭→HITL정합·분기커버리지·추적성·재현성·프로파일정합(=§9 자동검사) ⑥기존 seam=`pipeline.js` propose*가 S2/S6/S8 자리, `authoring.js` genericAuthor가 S9.
- **소비 방식 미결**(§8, 하니스와 독립): A 오프라인 구움(추천 시작)/B 사전 매트릭스/C 라이브 백엔드.
- **미구현**: 설계 문서만(코드 0). 다음=① 코어 `evaluate()` 해석기+안전DSL → 계약 P1을 knowledge 데이터로 구동 ② 하니스를 이 환경 Workflow로 프로토타입(계약+A사/B사 프로파일→시나리오 2종) ③ 소비방식 확정. 〔기획·UX/표준·정의 후속〕

### 신규 명세 — 계약 관리 (B) 결정 설계 P1 (`aap_pack_contract_decision_v0_1.md`) (260622, aap-lead) 〔표준·정의〕
> 배경: (B) 결정 런타임의 **첫 증명 도메인 선정**. 유저 후보 비교(계약관리/구매조달/경비지출/여신심사) 후 **계약 관리 커밋**(AskUserQuestion). 기준 = formal·포맷화·AI 실수요·**재사용 골격("규정 기반 심사·승인" 아키타입)**. voc(인바운드 트리아지)에 이은 2번째 재사용 아키타입.
> 갭 재확인: voc 팩 판정부("보상 정책 §3-2"·한도·유형 신뢰도 0.88)도 전부 **하드코딩 문자열** — `decide()` 엔진 아님. → 계약 팩이 첫 결정론 판정 인스턴스.
- **설계 골자**: ①케이스=계약 검토·승인 건(신규/갱신/변경) ②`caseModel` 14슬롯(유형·금액·기간·자동갱신·조항목록·배상한도·위약벌·준거법·제재매칭…, extract=manual/rule/doc/llm) ③`knowledge` 3종: lookupTables(requiredClausesByType·approvalLineByAmount·stampDutyByAmount·riskClausePatterns)·decisionTables(route: 제재→반려/필수누락·고위험·표준편차→법무검토/소액무위험→자동승인)·thresholds(renewalNotice D-30·liabilityRatio·amountAuthority) ④`decide()→verdicts[9]`(requiredClauses·templateDeviation·riskClauses·approvalLine·renewal·stampDuty·liability·sanction·route, 각 basis 추적성, route=2차 집계 판정) ⑤**명시지/암묵지 분리=데모 핵심**(필수조항·편차·결재선·만기·인지세·제재=AAP 자동 / 독소조항 실질해석·보완·체결승인=HITL) ⑥work 8단계 `@verdict:<id>.<path>` 바인딩(정적 문자열→데이터 구동) ⑦seeds mock 4건(자동승인/법무검토/반려/만기임박 — 입력만으로 4결론=theater 아님) ⑧§9 검증 시나리오(조항 추가→route 사유 변동) ⑨재사용표(knowledge·slots만 교체→구매·경비로 전이, decide 골격 유지).
- **미구현**: **P1 설계 문서만**(코드 0). 구현=`app/packs/contract.js`(데이터) + 코어 `decide()` 훅·`@verdict` 해석·검증 러너. P1 범위=LLM 0·OCR 0·mock 데이터·§9 통과. P2=llm/RAG seam 1종, P3=계약서 OCR 1종.
- **표준화 agent 과제**: `decide()`·verdict 스키마(`{id,inputs,output,basis,loop,gate}`)·`@verdict` 문법을 `aap_domain_pack_spec`에 정식 반영(`aap_decision_runtime_spec_v0_1.md` §11 기반). 〔표준·정의 후속〕

### 신규 명세 — 결정 런타임 (B): 명시지 기반 결정론 실행 설계 v0.1 (`aap_decision_runtime_spec_v0_1.md`) (260622, aap-lead) 〔표준·정의〕
> 배경: 유저 지적 — "'새 업무 요청'(`pipeline.js` 격상 파이프라인)이 LLM 추론이 아니라 회의 흐름과 같은 **키워드 사전→캐논 골격(theater)**이다. 암묵지는 아직 어렵다. 한 도메인의 명시지(업무 프로세스)를 넣어 처리하는 방향이 맞나?" → 확인 결과 정확(`proposeBreakdown`은 `KW` 사전 `includes()` 매칭, 코드 자체가 'Phase 3에서 LLM 교체' 명시). **유저 확정(AskUserQuestion): 도메인 커밋 전 "먼저 설계만".**
> **핵심 분리 — (A) 저작 vs (B) 런타임**: (A)"임의 텍스트→Pack 자동 생성"은 LLM 붙여도 범위 무한·검증 불가 → **비전/티저로 유지**. 증명 대상은 (B) "한 케이스를 명시지 규칙으로 실제 판정·처리, 매 판정이 규칙+데이터로 추적·재현". **LLM 없이 가능**(손해사정 `compute()`가 레퍼런스).
> **갭**: 현 Domain Pack=서사·UI 데이터만, `ops[].out`=하드코딩 문자열, 판정 엔진(손해사정 `compute()`)은 스키마 밖. → **결정 레이어 1개 추가**가 핵심.
- **명세 골자**: ①"진짜로 돈다" 수용 3조건(데이터 구동·추적성·재현성) + §9 코드 검증 테스트로 theater 판별 ②L4 Case Model(타입 슬롯=규칙 입력 변수) + **CQ는 범용 엔진 ✕ 저작 검수 체크리스트** ③Knowledge Base 명시지 3종(결정 테이블·기준표·임계 규칙) + `decide(caseData,knowledge)→verdicts[]` 순수 함수(각 verdict에 `basis` 추적성 강제) ④ops `@verdict:<id>.<path>` 바인딩으로 정적 문자열→데이터 구동 ⑤LLM seam **3곳만**(추출·RAG·초안, 전부 판정 앞단·HITL 뒤, **판정엔 LLM 금지**) ⑥OCR/STT 유입 seam=mock 먼저·1종씩 swap(선결조건 ✕) ⑦HITL=verdict 소비(명시지 자동화 ↔ 암묵지 사람결정 분리).
- **Pack 스키마 확장(§11)**: `aap_domain_pack_spec_v0_1.md` §1에 `caseModel`·`knowledge`·`decide`·`seeds[].input` 추가(하위호환 — 기존 meeting·voc는 정적 ops로 그대로, 결정 레이어는 (B) 원하는 팩만). 코어 보장 추가=`decide()` 호출·verdict 캐시·`@verdict` 해석·trace `basis` 기록.
- **단계(도메인 커밋 후)**: P1 한 도메인 (B) 증명(caseModel·knowledge·decide 인코딩 → §9 통과, LLM 0·mock) → P2 LLM seam 1종 → P3 유입 seam 1종. 후보=손해사정(compute() 재사용 최단)/내부통제/제조 품질 quality 팩.
- **표준화 agent 과제**: 본 §11 확장을 `aap_domain_pack_spec`에 정식 반영(결정 레이어 §11~ 신설), `@verdict` 참조 문법·verdict 스키마(`{id,inputs,output,basis,loop,gate}`) 표준화, §9 검증 러너를 도메인 무관 코어로 설계. 〔표준·정의 후속〕
- **미구현**: 본 건은 **설계 문서만**(코드 변경 0). app/ 구현(코어 `decide` 훅·`@verdict` 해석·검증 러너)은 도메인 커밋 후 P1.

### app/ 구현체 — 디자인 v0.21: 신규 surface 4종 시각 폴리시 (온톨로지 L4 · 결정론/LLM 배지 · 3패널 빌더 · 운영 콘솔 Eval/RBAC/KPI) (260622, aap-design) 〔기획·UX〕
> 배경: 최근 기능 줄기(온톨로지 L4·결정론/LLM 블록·워크플로우 3패널 빌더·운영 콘솔 Eval/RBAC)를 빠르게 쌓아 시각이 거칠던 신규 surface를 디자인 가이드(토큰·밀도·타입 시각화)로 폴리시. **직전 v0.23 govern 항목 '남긴 후속 ④ aap-design 시각'을 소화**(Eval 게이지·RBAC hover·Agent Ops 톤·배포 칩 위계). **★시각만 — 함수·DOM id·뷰 키·data-* 불변(platform.css 끝 v0.21 블록 1곳에 집약, 마크업/JS 무수정).**
> **백업=셸(Bash/PowerShell) cp 전면 차단 → 물리 백업 불가. 변경 파일=`app/core/platform.css`(끝에 v0.21 블록 추가)만. git 복원 `git checkout d48dd6c -- "05_범용플랫폼/app/core/platform.css"`.** 임시 파일 0.
- **① 온톨로지 L4 섹션**(`.onto-*`) — 카드 1스타일 정합(라운드 12·옅은 그림자), 섹션 헤더 색점(객체/관계=teal·Action=green)+하단 구분선, 객체는 객체명+속성칩 1행씩 dashed 분리(위계), 관계 `em`을 aap-soft 칩으로(A —관계→ B 읽힘), Action 자동/사람확인 배지에 색점(green=자동·amber=사람확인, §5.5 게이트 규칙) → "LLM이 온톨로지 통해 접근"이 구조로 읽히게(전시 캡션 추가 ✕).
- **② 결정론/LLM 배지**(`.ev-kind`+`.wfp-kind`/`.wfp-lg`/`.wfr-blk-kind`/`.wfr-st`) — 같은 의미 배지 전반에 작은 색점(결정론=slate 중립·LLM=violet) 일관. 제어(control) 블록은 det 취급으로 slate 점.
- **③ 워크플로우 3패널 빌더**(`.wf-builder`/`.wfp-*`/`.wfr-*`/`.plg-task.sel`, Palantir AIP Logic 톤) — 좌 팔레트·우 Run = surf 배경+inset 경계선, 중 캔버스=흰 작업면(3패널 위계), 패널 헤더 하단 구분선 통일, 팔레트 타입 그룹 좌측 3px 타입색 띠(§5.9 부품 종류 신호)+dot 확대, 캔버스 선택 단계 노드 글로우(stroke 2.4)+라벨 강조, Run 통계 칩 색점·게이트 단계 amber 좌측 그라데이션·dry-run 버튼 글로우/disabled 위계.
- **④ 운영 콘솔**(`.eval-*`/`.evc-*`/`.rbac-*`/`.rb-*`/`.ao-*`/`.ops-sub`, Datadog 톤) — Eval 종합점수 좌측 상태색 4px 띠, 메트릭/케이스 행 hover 들림+종합 점수 셀 상태색 배경(스캔성), RBAC 허용=green 굵은 체크(stroke 2.4)·차단=회색 dash·셀 hover, Agent Ops KPI hover 들림+값 letter-spacing, 운영 서브헤더 좌측 teal 마커.
- **전반** — 카드 1스타일·버튼 위계·상태색 통일. **신규 hex 0**(5타입 색·상태 4색·다크 엔진룸 토큰만), **아이콘 추가 0**(기존 icons.js 세트 충분), 이모지 0. file:// 동작·외부 라이브러리 0. `color-mix` 등 신기능 미사용(보수적).
- **검증(헤드리스·node --check·IDE 진단 권한 차단 → 정적·코드경로 검증, 브라우저 런타임 미실측 명시)**: (a)~(d) 신규 셀렉터가 전부 실제 렌더 마크업 클래스와 1:1 매칭 확인(core.js renderOntology/renderRight/renderGovern, wfeditor.js renderPalette/renderRun) — `.evc-c.sc`+tone, `.rb-cell.ok/.no`, `.wfp-grp-h.tA..ctl`, `.wfr-st.llm/det/gate` 등 출력 클래스 대조. (e) 이모지 잔존 0(내 v0.21 블록 grep=0; 기존 `content:"✓"`·코멘트 `⚑`는 사전 존재·무회귀 비대상). (f) JS 무수정 → 함수·ID·뷰키·data-* 불변 → 전 뷰/기능·P5 격리·시연 무회귀. **후속자 file:// 실측 필요**: ⓐ도메인 뷰 온톨로지 섹션 ⓑ실행 근거 레일 결정론/LLM 배지 ⓒ워크플로우 빌더 3패널 균형·팔레트 타입 띠·캔버스 선택·Run 디버거 ⓓ운영 콘솔 Eval/RBAC/KPI ⓔ전 뷰 JS 에러 0. 〔데모 한정 검증〕
- **남긴 후속**: ① 다크 엔진룸 캔버스(`.plg-*`)의 게이트/선택 노드 SVG는 currentColor 미상속이라 색 하드코딩 유지(가이드 §6.5.4 예외 그대로) — 향후 SVG도 토큰화하려면 클래스별 직접 토큰 정리 필요. ② Eval 게이지 진입 모션(현 width 트랜지션만 — 등장 애니메이션은 보류). ③ 디자인 가이드에 §6.6 '워크플로우 빌더 3패널' 정식 절 신설(현 v0.21 changelog로만 기록). 〔aap-design 후속〕

### app/ 구현체 — govern 뷰를 운영 콘솔로 확장 (Eval + RBAC + Agent Ops · 배포 연결) v0.23 (260622, aap-platform) 〔기획·UX〕
> 배경: 벤치마크([[reference-agentic-platform-benchmark]] SK AX **Agent Ops**[성능·품질·비용·HITL·감사 한 화면] + 메가존 **RBAC·ISO42001**)대로 '관리(govern)' 영역을 **운영 콘솔로 실체화**. 직전까지 govern 뷰는 `govStrip`(거버넌스4: Policy·Run Trace·Evaluation·Skill Library) 카드만 표시 → Eval(평가 실데이터)·RBAC(권한 매트릭스)·Agent Ops 지표(성능·비용·품질)를 섹션으로 증축. **★전부 결정론 도출 — 새 저장소 0**(`APP.cases[].trace` + 팩 work 정의 집계). 코어 도메인 무관(팩별 분기 0줄).
> **백업=셸(Bash/PowerShell) cp·복사·삭제 및 node --check·IDE getDiagnostics 전면 차단 → 물리 백업·런타임 검증 불가. `_archive/app_v0_23_pre_opsconsole/_BACKUP_NOTE.md`(변경 파일 목록+노트). git 복원 `git checkout b9cc20d -- "05_범용플랫폼/app/"`.** 임시 파일 생성 0.
- **① Eval(평가)**(`core/core.js` 신규 `_caseEval`/`_evalMetrics`/`_opsClamp`/`_opsTone`) — 배포된 팩 케이스의 `trace`에서 4지표 결정론 도출(케이스별/전역 평균): **근거 충족도**=trace가 닿은 단계 / 도달한(현재 sel까지) 단계, **정책 준수율**=도달 HITL·게이트 중 처리(decisions/done) 비율, **실행 성공률**=완료 100·진행 시 caseProgress, **HITL 적시 처리율**=처리 HITL / 도달 HITL. 종합=4지표 평균. 상태색 `_opsTone`(≥85 green / ≥60 amber / <60 red). 전역=종합 점수 카드 + 4 게이지 바, 케이스별=표(근거·정책·실행·HITL·종합). 〔기획·UX〕
- **② RBAC(권한)**(`core/core.js` renderGovern 내 ROLES×PERMS) — **역할(담당자/검토자/승인자/관리자) × 권한(케이스 처리·HITL 승인·배포(deploy)·정책/워크플로우 변경)** 불리언 매트릭스 `M`. 허용=green 체크 아이콘(`_ICO('check')`)·차단=회색 '—'. **배포·정책 권한은 승인자·관리자 한정 → 배포 생애주기(draft→deployed)와 연결**(배포 권한 헤더에 shield 게이트 마킹). 일반 RBAC 모델(도메인 무관, 코어). 〔기획·UX/표준·정의〕
- **③ Agent Ops 지표**(`core/core.js` 신규 `_agentOpsKpi`) — 6 KPI 한 화면: **성능**(평균 처리 단계 수·평균 진행률), **비용**(실행 비용 단위 = 결정론 op 1 + LLM(Agent) op 4 가중 결정론 시뮬 / 추정 토큰 ≈단위×420 / LLM·결정론 op 수), **품질**(Eval 종합 점수). `blockKind`/`evidType`로 op별 LLM·결정론 분류 — logs 전역 KPI(런·기록·HITL·차단·유형)와 중복 없이 보완(logs=감사 누적, govern=성능·비용·품질). 〔기획·UX〕
- **④ 배포↔관리 연결**(`core/core.js` `#opsDeploy`) — `deployedPackIds()`/`Object.keys(PACKS)`로 '운영 거버넌스 대상 N/전체 유형 배포됨' + 배포 유형 칩 + 미배포는 스튜디오 한정(평가·권한 대상 아님) 표기. Eval/Agent Ops 집계 모두 `isDeployed` 필터 → 배포된 팩만 운영 평가. 〔기획·UX〕
- **마크업·CSS**(`app/index.html` govern 뷰, `core/platform.css`) — govern 뷰를 '운영 콘솔'로 제목 변경 + 섹션 컨테이너(`#opsDeploy`/`#opsEvalGlobal`/`#opsEvalCases`/`#opsRbac`/`#opsAgentKpi`) 추가, **govStrip(거버넌스4) id·맨 위 유지**. CSS 신규(`.ops-*`·`.eval-*`·`.evc-*`·`.rbac-*`·`.rb-*`·`.ao-*`) — **신규 hex 0**(5타입 색·상태 4색·기존 토큰만 재사용), 반응형(≤1100px 그리드 축소). 〔기획·UX〕
- **코어 도메인 무관 유지** — Eval 지표·RBAC 모델·Agent Ops·비용 추정 전부 일반 메커니즘(채용/회의/voc 전용 분기 0). 안정 ID(`govStrip` 유지·신규 ops 컨테이너)·뷰 키(`govern`)·demo.js 타깃 불변(demo.js는 govern 내부 미참조 — gnav click만). file:// 동작·외부 라이브러리 0·Lucide 인라인(check/shield 기존)·이모지 0·자기설명 캡션 0. 〔표준·정의〕
- **검증(헤드리스·node --check·IDE 진단 전부 권한 차단 → 정적·코드경로 검증으로 대체, 브라우저 런타임 미실측 명시)**: (a) renderGovern 확장=중괄호·템플릿 리터럴·괄호 균형 정적 재검(읽기 확인), 신규 5함수 이름 유일(grep=5). (b) 참조 심볼(`evidType`/`blockKind`/`caseProgress`/`typeBadge`/`dcText`/`typeLabel`/`deployedPackIds`/`typeTok`/`_ICO`/`isDeployed`/`PACKS`/`STATE`/`activeCase`) 전부 동일 IIFE 내 정의 확인. (c) CSS 신규 블록=토큰만·셀렉터 닫힘 정적 확인, `--violet`/`--blue`/`--amber`/`--green`/`--red`/`--aap*` 토큰 존재 확인. (d) demo.js govern 미참조 → 시연 무회귀. (e) govStrip id 보존 → 거버넌스4 무회귀. (f) Eval/Agent Ops가 `isDeployed`·`activeCase` in-flight trace 합산 → logs(renderTrace)와 동일 소스·중복 저장 0 → P2~P5(★P5 격리)·인박스·실행·스튜디오·빌더 무영향(govern은 읽기 전용 집계). **후속자 file:// 실측 필요**: ⓐgovern 뷰 진입→배포 연결 표기·Eval 전역/케이스 표·RBAC 매트릭스 체크·Agent Ops 6 KPI ⓑ케이스 진행 후 지표 변동(trace 도출) ⓒ배포 취소→해당 유형 평가/권한 대상 제외 ⓓlogs·인박스·실행·스튜디오·빌더·시연·P5 무회귀 ⓔJS 에러 0. 임시 파일 0. 〔데모 한정 검증〕
- **남긴 후속**: ① **ISO42001 GTM 문구**(메가존 벤치 — govern 콘솔에 ISO42001/AI 거버넌스 인증 매핑 카피·체크리스트 미반영). ② **실권한 연동**(현 RBAC=정적 매트릭스 표시 — 실제 사용자 역할/권한 enforcement·배포 버튼 권한 게이팅 미연결). ③ **Phase3 비용 실측**(현 비용=결정론 op 가중 추정 시뮬 — 실제 LLM 토큰/원가 연동은 Phase3 dryRun→실행 교체 시점). ④ **aap-design 시각**(Eval 게이지 모션·RBAC 매트릭스 hover·Agent Ops 카드 톤·배포 연결 칩 위계 다듬기·디자인 가이드 §운영콘솔 패턴 문서화). ⑤ Eval 지표 시계열(현 스냅샷만 — 추세선·이력은 trace 타임스탬프 보강 필요). 〔aap-platform/aap-design 후속〕

### app/ 구현체 — Run 뷰 인터랙션 모델 전환: '수동 스테퍼' → '요청 트리거 자동 운영 + 탐색 surface' (Phase 1) (260622, aap-platform) 〔기획·UX〕
> 배경: 인박스→케이스로 들어가면 직전/현재/다음을 **직접 클릭해야 다음 단계로 넘어가는 데모식 스테퍼** + 탭(파이프라인·후보·스코어카드·면접)도 클릭 불가 → "더미라도 요청을 올리면 흐름이 차례로 작동해야" 한다는 문제의식. 기존 `startPlay`(시연/Run)는 결정·trace를 **초기화**하는 파괴적 재생이라 운영 진입에 부적합. **인터랙션 모델만** 바꿈(문서 업로드·자유 필드·외부 Connector·surface 케이스 스코프화는 다음 Phase, 손대지 않음).
- **A. 케이스 진입 = 요청 트리거 자동 운영**(`core/core.js`) — 신규 `startRun()`(비파괴: 현재 지점부터 `STATE.playing=true`로 자동 진행, 누적 결정·진행 **보존**) + `renderRunAction()`(runtop 우측 실행 진입점 버튼: 미진입=**▶ 실행/처리 시작** · 진행중=**이어서 진행 ▶** · 자동진행중=**처리 중…**(클릭=정지·탐색) · HITL=**확인이 필요합니다** · 완료=**처리 완료**) + `caseStarted(c)` 헬퍼(첫 단계·결정 0·미완료=미진입). 자동 진행은 기존 `revealOps`/`decide`/`meetingEnd`의 `playNext` 경로를 그대로 타고 **HITL(await)·회의에서만 멈춤** — 사람이 `decide`해야 다음으로. `openCase`/`setView`/`setSel`/`afterStateChange`에 `renderRunAction()` 훅. **`startPlay`(시연 Run 버튼)는 불변** — 시연=처음부터 재생, 운영=현재 지점 진입으로 분리. 〔기획·UX〕
- **B. 스테퍼 = 되짚기용 타임라인 재프레이밍**(`core/core.js renderSeq` · `index.html` runtop 라벨 · `platform.css`) — 라벨 "업무 순서 · 직전/현재/다음" → **"처리 진행 · 자동 진행 · 클릭 = 되짚기"**. active 노드에 단계 상태 태그(`처리 중…`/`확인 대기`/`완료`) + working 시 teal 펄스(`@keyframes snodepulse`), past 노드 흐림. 클릭-되짚기 동작은 유지(의미만 '진행'→'탐색'). 〔기획·UX〕
- **C. surface 탭 클릭 탐색 — 도메인 무관 코어 위임**(`core/core.js wireSurface` · `packs/recruiting.js`) — 코어 `wireSurface`가 `[data-surftab]` 클릭을 **일반 위임**으로 처리(`STATE.activeTab` 기록 + `renderConsole` 재렌더, 자동 진행과 독립). 탭 목록·라벨·본문은 **recruiting.js 전용**(`TABS`·`activeTab(C)`·`tabBody`/`candList`/`scoreTab`/`interviewTab`). 단계 기본 탭=파이프라인(보드, **원래 본문=항상 보드 동작 보존**), 보드 가시화 전(prepare 이전)에는 후보·스코어카드·면접 탭 **비활성(off)**. `activeTab`을 recruiting `transientKeys`에 추가(단계/케이스 전환 시 기본 탭으로 리셋). 후보 카드 상세(`candDetail`)·정렬·필터·HITL `decideHook` 기존 동작 불변. 〔표준·정의: surface 탭 위임은 도메인 무관 메커니즘으로 일반화 — 새 팩이 `head()`에 `data-surftab`만 달면 동일 동작〕
- **검증(Edge `--headless=new --virtual-time-budget` + DOM 클릭 드라이버)**: (1) 채용 케이스 인박스 열기 → **▶ 실행** → 자동 진행 → **HITL① 숏리스트 기준 승인 모달에서 멈춤**(스테퍼 무클릭) 확인 ✓. (2) 승인 → prepare/meeting 자동 진행 → **HITL②에서 멈춤**, 진행 중 케이스는 **이어서 진행** 버튼 노출 ✓. (3) **후보/스코어카드 탭 클릭 전환** 동작(board↔candList) + prepare 이전 탭 off 가드 ✓. (4) **VOC 팩** 케이스 ▶ 실행 자동 진행("처리 중…" 상태) 무회귀 ✓ — 코어 도메인 무관(meeting/voc=선언형 surfaceSpec, `data-surftab` 미부착 → 탭 위임 no-op). `node --check` core/recruiting OK. **보존: 결정론 엔진·case.overrides(P5)·applyCaseOverlay/rebuildPackLevel·decide/decideHook·자동저작·wfeditor·On-Ramp·demo.js 안정 ID(#flow/#explain/#seq/#surfHead/#surfBody)·file:// `<script src>`·Lucide 인라인 아이콘.** 〔기획·UX〕
- **남긴 후속**: ① surface 데이터 케이스 스코프화(JOB/CAND가 현재 팩 전역 → 케이스별 분화)는 Phase 2 명시 제외. ② meeting/voc 선언형 surfaceSpec에도 탭 탐색을 주려면 `headSpec`에 `data-surftab` 부착(현재 표시용) — 필요 시 코어 일반화 가능. ③ aap-design: 실행 진입점 버튼(`.run-act`)·스테퍼 상태 태그(`.snode-st`)·펄스 톤을 UI 가이드에 매핑 권장. 〔aap-platform/후속〕

### app/ 구현체 — 워크플로우 풀 3패널 빌더 v0.22 (Palantir AIP Logic 차용 · 로우/노코드 직접 생성) (260622, aap-platform) 〔기획·UX〕
> 배경: 워크플로우 뷰가 '경량 편집(노드 그래프+단계별 구성요소·HITL 토글)'에 그쳐 있어, 벤치마크([[reference-agentic-platform-benchmark]] Palantir **AIP Logic 3패널 빌더**: 좌 구성블록 / 중 Debugger 체인 시각화 / 우 Run·테스트)대로 **풀 3패널 빌더(팔레트로 직접 블록을 얹어 생성)**로 확대. 직전 단계서 온톨로지 L4 + 결정론 Action/비결정론 Use LLM 블록 분리(`blockKind`) 완료된 위에 증축.
> **백업=셸(Bash/PowerShell) 파일조작 전면 차단 → 물리 백업 불가. 변경 파일 목록+git 복원 `git checkout 5247cdb -- "05_범용플랫폼/app/"`.** 임시 검증 파일 `05_범용플랫폼/_tmp_wf_test.js`는 rm 차단으로 **내용 비움**(파일명만 잔존).
- **① 워크플로우 뷰 3패널 레이아웃**(`app/index.html` workflow 뷰 통째 교체) — `.wf-builder` grid(228px 팔레트 / 1fr 캔버스 / 300px Run). 좌=`#wfPalette`, 중=`#wfEditor`(기존 캔버스 재사용)+`<details>`로 접은 실행구조 요약(compose/plan/gatebar **id 보존**), 우=`#wfRun`. `newPromoteBtn` id 보존(신규 격상 와이어 불변). 〔기획·UX〕
- **② 블록 팔레트**(`core/wfeditor.js` `renderPalette`/`paletteAssets`/`addBlock`) — 5타입 자산(전 팩 union)을 `AAP_CORE.getAssetCatalog()`로 받아 타입별 아코디언 + 제어 블록(Conditional·Loop). 각 그룹에 **Action(결정론)/Use LLM(비결정론)** 라벨(`blockKind`=Agent→llm, 그 외→det). 클릭=현재 선택 단계(`_selStep`, 캔버스 노드 클릭으로 변경 `wireGraphSelect`)에 블록 추가→`commit`(packOverride 영속)→코어 reapply→캔버스·요약·Run 재렌더. 빈 워크플로우에 사람이 직접 블록을 얹어 생성 가능(로우/노코드). 〔기획·UX〕
- **③ Run · 디버거**(`core/wfeditor.js` `renderRun`/`dryRun`) — 우 패널: 테스트 입력 + 단계별 dry-run(결정론 시뮬) 흐름(블록 결정론/LLM 배지 + 합성 산출물 + HITL 게이트 멈춤 표시) + 집계(블록/LLM/결정론/HITL) + 실행 히스토리(최근 4건). HITL 0개면 dry-run 차단(자율 운영 안전). 실제 LLM은 Phase3(명시). 〔기획·UX〕
- **④ 온톨로지/결정론·LLM 정합 + 라운드트립**(`core/wfeditor.js`) — 추가 블록은 op에 `wfType` 스탬프→`opType`가 명시 타입 우선 반환(제어 블록 포함 라운드트립). 제어 블록 메타 `CTL_META`(L2 설계·개발, 중립 slate). compose 칩 집계는 5타입만(`if(!(k in cnt))return` 가드—제어 제외). 팔레트 안내문="Action=온톨로지 Action(자동/사람확인), Use LLM=온톨로지 통한 데이터 접근". 〔기획·UX〕
- **⑤ 보조**(`core/icons.js` `repeat` 추가 / `core/core.js` `getAssetCatalog`·`typeKeyOf` AAP_CORE 노출 / `core/platform.css` `.wf-builder`·`.wfp-*`·`.wfr-*`·`.plg-task.sel`·`.plg-comp.tCtl` 신규 — 신규 hex 일부(slate #64748b/#94a3b8/#cbd5e1=제어 중립색·기존 팔레트 내) 외 5타입·상태 토큰 재사용). 〔기획·UX〕
- **검증**: 헤드리스 브라우저·jsdom 부재로 DOM 렌더 미실측. (a) `node --check` wfeditor/core/icons 전부 OK. (b) 임시 node 하니스로 순수 로직 검증 PASS — modelFromPack(단계·게이트 추출)·applyOverride(LLM/Action/제어 블록 추가+`wfType` 스탬프)·타입 라운드트립(Conditional 보존)·compose 제어 제외. (c) dryRun 집계는 동일 primitive(blockKind/modelFromPack) 경유라 정합. **DOM 통합(3패널 표시·팔레트 클릭→캔버스 반영·dry-run 버튼·P5 무회귀)은 브라우저 실측 권장.** demo.js는 gnav click만 사용→무영향. P5 case-tune은 `#caseTune`(run 뷰) 별도 호스트→빌더와 격리. 〔기획·UX〕
- **남긴 후속**: ① 타 팩 온톨로지(voc/recruiting ontology 미정의 시 generic 폴백) — 팔레트 Action↔온톨로지 Action 실연결은 ontology 보강 후. ② 운영콘솔 Eval(SK AX Agent Ops/메가존 대시보드 톤) 미착수. ③ Phase3 실제 LLM 연동 시 dryRun→실행 교체 지점=`renderRun`. ④ aap-design: 3패널 빌더 시각 규칙(팔레트 폭·아코디언·Run 카드)을 UI 가이드에 매핑 권장. ⑤ 팔레트 드래그앤드롭(현재 클릭 추가만). 〔aap-platform/후속〕

### app/ 구현체 — 전반 일괄 시각 폴리시 v0.20 (실행 보드 모션·매칭 점수 바·현재 단계 하이라이트·근거 레일) (260622, aap-design) 〔기획·UX〕
> 배경: 긴 사이클로 신규 화면이 쌓였으나 **실행(run) 뷰의 ATS 보드가 가장 미polish**(골격 위주 — 카드 등장 모션·점수 시각화·현재 단계 신호 부재). 디자인 가이드(§1 LangGraph/n8n 작동 시각화·§2-5 모션·§5.3 active=teal·§5.9 타입색)를 기준으로 **시각만** 보강. ★골격(기능)·함수 시그니처·DOM id·뷰 키·data-* 타깃 전부 불변 — **마크업 클래스·CSS만** 변경. 통합인박스·케이스·영속(SCHEMA_VER)·X1·8계층·HITL·자동저작·wfeditor·pipeline·On-Ramp·P2~P5(★P5 격리)·배포 생애주기·demo.js·채용 surfaceHooks·meeting/voc/recruiting **무회귀**. 신규 hex 0(5타입 색·상태 4색·기존 토큰만). file:// 동작·외부 라이브러리 0·Lucide 인라인 유지.
> **백업=셸(Bash/PowerShell) cp·복사·삭제 및 node --check·IDE getDiagnostics 전면 차단 → `_archive/app_v0_20_pre_designpolish/_BACKUP_NOTE.md`(변경 파일 목록+git 복원 `git checkout 9c1f028 -- "05_범용플랫폼/app/"`). 물리 디렉터리 백업 권한 차단.**
- **① 실행 보드(ATS) 모션·하이라이트**(`core/platform.css` 신규 v0.20 블록 + `packs/recruiting.js`) — (a) **후보 카드 등장 stagger**: `@keyframes recrIn`(fade-up 6px) + `.recr-col:not(.off) .recr-card` nth-child 지연(.02~.27s, 상위 6개) → 보드 reveal 시 단계별 카드가 차분히 등장(n8n 점등 톤, 모션은 상태 전이에만). (b) **현재 진행 단계 컬럼 하이라이트**: `board()`가 reached 된 마지막 단계(프런티어)에 `.live` 클래스 부여(표시용 className·로직 불변, 기존 `on/off` 패턴 정합) → `.recr-col.live`=teal 상단 띠+옅은 글로우+헤더 aap-soft+카운트 teal(가이드 §5.3 active=teal). (c) **후보 카드 매칭 점수 바**: `candCard()`에 `.rc-bar`(진행률 톤 통일·teal, risk=amber·rejected=회색) 마크업 1줄 추가 — 숫자 `종합 N`만 있던 카드에 매칭 % 시각화. 〔기획·UX〕
- **② 우측 AAP 근거 레일**(`core/platform.css`) — 진행 중 행 `.evid-row.doing`에 좌측 2px teal 인디케이터(`::before`)+옅은 teal 그라데이션 배경(F-패턴 좌측 신호·`gnav.on` 패턴 정합), `.done .ev-comp` 잉크색 강조. 타입 색점·▸펼침 정렬은 기존 유지. 〔기획·UX〕
- **③~⑤ 일관 미세 조정**(`core/platform.css`) — 인박스 검토대기 행 hover 시 amber 그림자 강조(상태 신호 유지)·도메인 팩 배포 배지 deployed 앞 green 점(`.cat-dep.on::before`)+draft 카드 타입명 톤 다운·로그 KPI hover 보더+값 letter-spacing. 〔기획·UX〕
- **이모지/아이콘**: 코어 chrome 이모지 스캔 결과 잔존 이모지는 전부 **Domain Pack 데이터**(`packs`/`authoring.js`/`core.js`의 `icon:`·TYIC) — 디자인 가이드 §4.2가 명시적으로 허용(팩 데이터 한정, chrome만 Lucide 표준화). chrome 글리프 잔존 2종 = `.pt-i.done`/`.au-done` 점 안 `::after content:"✓"`(상태 체크 — `::after`라 SVG 치환 불가, 마크업 재구성 필요 → 저위험 보류)·케이스 튜너 `⚑`(태스크 명시 "⚑ 한정 배지" = 의도된 케이스-스코핑 플래그). 이번 폴리시 신규 아이콘 0. 〔기획·UX〕
- **검증(헤드리스/셸 cp·런처·삭제·node --check·IDE executeCode·getDiagnostics 전부 권한 차단 → 정적·코드경로 검증으로 대체, 브라우저 런타임 미실측 명시)**: (a) recruiting.js `candCard`/`board` 편집=중괄호·템플릿 리터럴 균형 정적 재검(읽기 확인). `.rc-bar`/`.live` className만 추가, 함수 시그니처·반환 구조 동일. (b) CSS 신규 블록=토큰만 사용·셀렉터 닫힘 정적 확인, 기존 `.recr-col`(border 1px)에 `border-top:3px transparent` 덮어쓰기=`.cat-card` 패턴과 동형. (c) `.recr-*` 클래스는 recruiting 전용 → meeting/voc surface 무영향. (d) `.evid-row.doing::before` left:-2px=`.flow` 패딩 안쪽이라 클립 0. **후속자 file:// 실측 필요**: ⓐ채용 케이스 실행→보드 단계 진행 시 카드 stagger 등장·현재 컬럼 teal 하이라이트·후보 매칭 바 ⓑ근거 레일 doing 행 좌측 마커 ⓒ인박스/스튜디오/자산/로그/파이프라인/On-Ramp/시연/P2~P5/배포 무회귀 ⓓJS 에러 0·chrome 이모지 잔존(✓/⚑ 외) 0. 임시 검증 파일 생성 0. 〔데모 한정 검증〕
- **디자인 가이드 갱신 권고**(후속): §5.9/§6.5에 "실행 surface 보드 = 단계별 카드 등장 stagger + 현재 단계 컬럼 active(teal) + 점수 바(진행률 톤)" 패턴 1줄 추가 권장(이번엔 코드만 적용, 문서 미반영). 〔aap-design/후속〕
- **남긴 후속**: ① chrome `✓` 점 글리프 → 마크업 재구성 시 Lucide `check` 치환(현재 `::after` 한계). ② meeting/voc surface도 보드형 시각 강화 검토(현재 채용만 ATS 보드). ③ 디자인 가이드 §5.9 실행 보드 패턴 문서화. ④ 점수 바 vs 종합점수(`totalScore`) 이중 표기 정리(현재 매칭% 바 + 종합 N 텍스트 공존 — 의도적, 두 지표 다름). 〔aap-design/후속〕

### app/ 구현체 — 도메인 팩 배포 생애주기 (draft/deployed · ★배포된 팩만 운영 편입) (260622, aap-platform) 〔기획·UX〕
> IA v0.2 §4-2 "배포/생애주기 전 층 적용 — 배포된 것만 운영(인박스)·조합에 쓰임"의 **도메인 팩 층** 구현(자산·워크플로우 배포는 후속). 시드 팩(meeting/voc/recruiting)=기본 **deployed**, 자동저작/격상/On-Ramp로 `AAP_CORE.register`되는 신규 팩=**draft**. draft 팩 케이스는 인박스·On-Ramp 인식에서 숨겨지고, 도메인 팩 카드에서 **배포**해야 운영 편입된다. 무회귀: 통합인박스·케이스·영속·X1·8계층·HITL·자동저작·wfeditor·pipeline·On-Ramp·P2~P5(★P5 격리)·스튜디오 3분할·demo.js·채용 surfaceHooks 전부 유지.
- **데이터 — 팩 상태 저장소**(`core/core.js`): `packStatus[packId]='draft'|'deployed'`를 localStorage `aap.v1.packStatus`에 영속(`packOverrides`와 동일 persisted-map 패턴). 헬퍼 `loadPackStatus`/`savePackStatus`/`packStatus(id)`/`setPackStatus(id,s)`/`isDeployed(id)`/`deployedPackIds()`/`ensureSeedDeployed()`. 미기록 폴백 = 시드 ID(`SEED_PACK_IDS=['meeting','voc','recruiting']`)는 deployed, 그 외 draft. 〔기획·UX〕
- **SCHEMA_VER 3→4**: 상태 모델에 packStatus 추가 → 구 저장본 안전 초기화(`lsCheckSchema` 가드). boot에서 `ensureSeedDeployed()`로 시드 deployed 기본 재보장(미기록일 때만, 사용자가 끈 값은 보존). 〔기획·UX〕
- **운영 필터(★배포된 팩만)**: `renderInbox`의 전 팩 통합 목록 `all`에 `&&isDeployed(c.packId)` 추가 → draft 팩 케이스는 인박스/유형 필터/카운트에서 숨김(저장은 보존). `matchPackByText`(On-Ramp 신규 업무 유형 인식)는 `Object.keys(PACKS)` → `deployedPackIds()`로 범위 축소(draft 유형은 인식 대상 제외). `afterStateChange`의 navCnt 집계에도 `isDeployed` 가드. 〔기획·UX〕
- **register 신규=draft**(`AAP_CORE.register`): 새 팩 register 시 상태 미기록이고 시드 ID가 아니면 `setPackStatus(id,'draft')`. 재등록 팩은 기존 상태 보존. pipeline `promote`→register→load 흐름은 draft 팩으로 run 콘솔만 열림(인박스 편입은 배포 후). 〔기획·UX〕
- **배포 UI**(`renderDesign` catGrid · `core/core.js` + `core/platform.css`): 카드에 상태 배지(`.cat-dep` deployed=green '배포됨' / draft=회색 '미배포'), draft 카드 `.is-draft`(점선 상단·옅음), 하단 `.cat-depbar`에 **배포/배포 취소** 버튼(`[data-deploy]`, rocket/rotate-ccw 아이콘). 클릭→`setPackStatus`→toast→`renderDesign`+`renderInbox` 재렌더. 카드 onclick은 `[data-deploy]` 클릭 시 무시(stopPropagation+closest 가드). 카탈로그·자산·워크플로우 뷰는 전 팩 표시 유지(스튜디오=저작 공간), 운영 게이트만 deployed. 〔기획·UX〕
- **검증**: `node --check core.js`/`pipeline.js` PASS. **헤드리스 실측 미실행** — 이 환경에서 chrome.exe 실행이 Bash/PowerShell 모두 차단됨(임시 harness `app/_deploy_test.html` 작성했으나 구동 불가 → 내용 비우고 안내 주석만 남김, 수동 삭제 필요). 정적 추적으로 (a)배지+버튼 (b)시드 deployed (c)draft 숨김→배포 노출 (d)On-Ramp draft 제외 (e)P2~P5·스튜디오 3분할 무회귀 확인. 백업=셸 차단 → **git 복원 기준 HEAD 39e90a0** (`git checkout 39e90a0 -- 05_범용플랫폼/app/`). 〔기획·UX〕
- **후속**: ①자산·워크플로우 배포 상태(같은 packStatus 패턴을 asset/wf 키로 확장, 배포된 자산만 조합에 노출) ②도메인 팩 세분화(업무 화면·데이터·산출물·연결 워크플로우·케이스 구성요소별 관리) ③배포↔관리/거버넌스 연결(거버넌스 뷰에서 배포 상태·이력) ④aap-design 시각 다듬기(배포 배지/버튼 톤·상태 전이 애니메이션) ⑤`app/_deploy_test.html` 수동 삭제. 〔기획·UX〕

### app/ 구현체 — P5 케이스 단위 튜닝 (case.overrides · ⚑ 이 케이스 한정 · 정의 승격 · ★공유 PACK 오염 0 격리) (260622, aap-platform) 〔기획·UX/표준·정의〕
> 5단계 중 **P5(마지막)**. P1~P4 커밋됨(P4=abfb05c). **핵심 = ★최고 리스크인 '공유 PACK 오염' 격리**: 케이스 단위 델타(`case.overrides`)가 공유 `PACK`/`PACKS`/`COMPONENTS`/`WORK`/`packOverrides`/`pack._base` 를 **절대 영구 변경하지 않는다**. 코어=도메인 무관 유지(케이스 델타=일반 메커니즘, 팩별 분기 0 — packOverrides 와 동형 `{steps:{[id]:{comps,hitl}}}` 재사용). meeting/voc/recruiting·인박스·실행·스튜디오·시연·wfeditor 팩 편집·pipeline·On-Ramp·자동저작·X1·8계층·HITL·자산/로그 전역화(P2/P3)·프로젝트(P4) 무회귀. **백업=셸(Bash/PowerShell) cp·복사·삭제 전면 차단 + IDE 실행/진단 차단 → `_archive/app_v0_17_pre_casetune/_BACKUP_NOTE.md`(변경 파일 목록 + git 복원 `git checkout abfb05c -- 05_범용플랫폼/app/`). 물리 디렉터리 백업 권한 차단.**
- **데이터 — `case.overrides`(케이스 단위 델타)**(`core/core.js`) — 케이스 객체 안에 영속(`saveApp`→localStorage `aap.v1.cases`, 공유 팩 저장소 `aap.v1.packOverrides` 와 분리). `caseTemplate` 은 overrides 미생성(튜닝 전까지 undefined=팩 기본). `caseOverridesOf(c)`/`hasCaseOverlay(c)` 헬퍼(steps 비었으면 null 취급). 〔기획·UX〕
- **★격리 적용/복원 엔진**(`core/core.js` 신규 `rebuildPackLevel`/`applyCaseOverlay`/`removeCaseOverlay`/`clearActiveCaseOverlay`, `_caseOvActive` 추적) — **적용 순서 = 베이스라인(`snapshotPack` `pack._base`) → 팩 오버라이드(`packOverrides`) → 케이스 델타(`case.overrides`)** 를 **그 케이스가 열린 동안의 활성 PACK 라이브 참조에만** 얹음. `applyCaseOverlay`=`rebuildPackLevel`(=`_ovApplied/_dcDone/_caseOv=false`+`normalizePack`→baseline+packOverride 재적용)로 팩 레벨 복원 후 `wfeditor.applyOverride(pack, caseOv)` 로 케이스 델타만 라이브 work 에 추가 적용→`_dcDone=false`+`normalizePack`(이때 `_ovApplied`는 true 라 **packOverride 재적용=restoreBase 안 됨**→케이스 델타 보존, DC만 재정규화). `removeCaseOverlay`=`rebuildPackLevel`(팩 레벨 복원). **`openCase`** 가 진입 시 `clearActiveCaseOverlay()`(이전 케이스 델타 제거)→`setPackRefs`→케이스 델타 있으면 `applyCaseOverlay`+`_caseOvActive=packId`+`setPackRefs`. **`setView`** 가 run→타뷰 전환 시 `clearActiveCaseOverlay()`(스튜디오/자산/로그는 공유 팩 기준). 〔기획·UX/표준·정의〕
- **격리 증명 근거**: `applyPackOverride`/`restoreBase`/`wfeditor.applyOverride` 는 **`pack.work/compose/gates`(라이브 파생 참조)만** 수정 — `packOverrides`·`pack._base` 미터치. 케이스 델타는 `wfeditor.applyOverride` 로 라이브 work 에만 적용, **`packOverrides` 에 절대 기록 안 됨**(setCaseOverride 가 `case.overrides` 만 씀). 케이스 전환/run 이탈 시 `rebuildPackLevel` 로 즉시 팩 레벨 복원 → 케이스 A 델타가 케이스 B/팩에 누수 0. **누수 경로 = 정의 승격(명시적 액션) 1곳뿐.** 〔표준·정의〕
- **"⚑ 이 케이스 한정" UX + 케이스 튜너**(`core/wfeditor.js` 신규 `renderCaseTuner`, `index.html` `#caseTune`, `core/platform.css` `.case-tune/.ct-*`) — run 뷰 우측 근거 레일 상단에 **케이스 단위 튜닝 패널**(접힘 토글). 케이스 맥락(`AAP_CORE.isCaseContext()`=run+활성케이스)에서만 노출. 현재 단계(STATE.sel)의 구성요소 add/replace(타입 select)/delete + HITL 토글(게이트 0개 차단 재사용) → `saveCur`=케이스 델타에 그 단계만 머지→`AAP_CORE.setCaseOverride`. 케이스 델타 걸린 단계엔 **⚑ 배지**(헤더 "⚑ 이 케이스 한정 N단계", 단계 카드 amber 좌측 보더+⚑ 미니배지). `renderRight` 끝에서 매 렌더 호출(스튜디오/팩 맥락에선 빈 패널). 〔기획·UX〕
- **정의 승격 + 케이스 복원**(`core/core.js` `AAP_CORE.promoteCaseOverride`/`clearCaseOverride`/`setCaseOverride`/`getCaseOverride`/`hasCaseOverride`/`isCaseContext`/`activeCasePackId`) — **'이 유형(팩) 기본으로 승격'** = 케이스 델타(packOverrides 와 동형)를 `loadOverrides()[packId]` 에 **명시적 병합**(setPackOverride 패턴 재사용)→`case.overrides` 비움→`reapplyOverride`(팩 레벨 재적용, 케이스 델타 0). **이때만 공유 팩 반영(의도적)**. '이 케이스만 기본값' = `case.overrides` 삭제+`removeCaseOverlay`. 〔기획·UX〕
- **compose 집계 버그 수정**(`core/wfeditor.js` `applyOverride` step3) — 기존 `Object.keys(ov.steps)` 집계 → **부분 델타(케이스 델타=1단계만)에서 미편집 단계 구성요소가 compose/casm 에서 사라지는 버그** → `modelFromPack(pack).steps`(적용 후 현재 work 전체)에서 집계로 변경. 팩 오버라이드(전 단계 포함)에선 동일 결과(무회귀), 케이스 부분 델타에서 정상. 〔기획·UX〕
- **아이콘**(`core/icons.js`) — `arrow-up`(승격)·`info`(케이스 한정 안내) Lucide path 추가(인라인 SVG·currentColor·이모지 0). 〔기획·UX〕
- **코어 도메인 무관 유지** — 케이스 델타 적용/복원/승격 전부 일반 메커니즘(packOverrides 동형 구조 재사용), 채용/회의/voc 전용 분기 0줄. 안정 ID(`#caseTune` 신규·`#flow`/`#surfHead` 유지)·뷰 키·demo.js 타깃·X1·영속 미터치. file:// 동작·외부 라이브러리 0·Lucide 인라인·자기설명 캡션 ✕. 〔표준·정의〕
- **검증(헤드리스/셸 cp·런처·삭제·`node --check`·IDE executeCode·getDiagnostics 전부 권한 차단 → 정적·코드경로 검증으로 대체, 브라우저 런타임·node 단위테스트 미실측 명시)**: (a) **케이스 A 델타→A에만**: openCase(A) 시 applyCaseOverlay 가 라이브 work 에만 적용(코드경로). (b) **케이스 B 열기→A 델타 없음**: openCase 가 `clearActiveCaseOverlay`(rebuildPackLevel=팩 레벨 복원) 선행 후 B 델타만 적용 → A 잔존 0. (c) **새로고침 영속**: case.overrides 가 cases[] 안에 saveApp→localStorage, boot openCase 가 재적용. (d) **packOverrides/PACKS 누수 0**: setCaseOverride 는 `case.overrides` 만 기록, applyCaseOverlay 는 `pack.work/compose/gates` 라이브만 수정·`packOverrides`/`pack._base` 미터치(정적 코드 리뷰로 보장 — 케이스 경로에서 `loadOverrides()[...]=` 대입 0). (e) **정의 승격**: promoteCaseOverride 가 loadOverrides 병합+case.overrides 비움+reapplyOverride(확인). (f) 델타 없는 케이스(overrides undefined)=overlay 미적용=팩 기본 무회귀, P1~P4·시연·파이프라인 무회귀(코드경로). (g) JS 구문=정적 검토(node --check 차단으로 미실측 명시). **★격리 단위테스트(A 델타 후 B/PACK 검사)도 node 실행 차단으로 미작성·미실측 — 후속자가 file:///node 로 실측 필요.** **후속자 file:// 실측 항목: (1)케이스 열고 우측 '케이스 단위 튜닝'→구성요소 추가/삭제·HITL 토글→그 케이스 근거 레일/8계층/compose 반영+⚑배지 (2)다른 케이스 열기→A 변경 없음 (3)reload→케이스 델타 유지·스튜디오 팩 기본 깨끗 (4)'이 유형 기본으로 승격'→같은 유형 새 케이스에도 반영+원 케이스 ⚑ 사라짐 (5)스튜디오 팩 편집·P1~P4·시연·채용 무회귀 (6)JS 에러 0.** 임시 검증 파일 생성 0. 〔데모 한정 검증〕
- **남긴 후속**: ① ★**격리 단위테스트 실측**(node 차단 — A 델타 적용 후 PACKS[id]/packOverrides 에 A 흔적 0 단언, B 열어 베이스라인 확인). ② **케이스 델타 정책 값 튜닝**(현 범위=구성요소·HITL 게이트. 정책 임계값·금액 같은 도메인 파라미터 델타는 미구현 — packState/surfaceHooks 와 연계 필요). ③ **케이스 튜너 다단계 편집**(현재 현재 단계만 — 전 단계 편집은 스튜디오 팩 편집기 또는 단계 이동). ④ **aap-design 시각**: 케이스 튜너 펼침 모션·⚑ 배지 위계·승격 확인 다이얼로그(현재 토스트 즉시 실행)·케이스 vs 팩 기본 diff 시각화. ⑤ 자동저작/파이프라인 생성 팩 비영속 한계(P1~P4 동일) → 케이스 델타도 그 팩이 reload 시 숨겨지면 함께 숨김(저장은 보존). 〔aap-design/후속〕

### app/ 구현체 — P4 프로젝트 계층 (APP.projects + case.projectId + 인박스 프로젝트별 보기 토글) (260622, aap-platform) 〔기획·UX〕
> 5단계 중 **P4**(P1~P3 자산·로그 전역화는 직전 커밋, 핸드오프 기준 `3b2ec68` / 프롬프트 명시 `df162c7` — 두 값 병기). **핵심 = 격리**: 프로젝트는 케이스 묶음(포트폴리오) **추가 레이어일 뿐**, 통합 인박스·상태·유형·On-Ramp·케이스 실행·영속 로직 미변경. **토글 OFF(기본)=현행 인박스 100% 유지**. P5(케이스 튜닝)는 범위 밖. **코어=도메인 무관 유지**(projects/projectId=일반 메커니즘, 팩별 분기 0 — 시드 배정만 packId='recruiting'/'meeting' 매칭, 없으면 미배정). meeting/voc/recruiting·인박스·실행·스튜디오·시연·wfeditor·pipeline·On-Ramp·자동저작·X1·8계층·HITL·자산/로그 전역화(P2/P3) 무회귀. **백업=셸 cp/PowerShell·삭제 전면 차단 → `_archive/app_v0_16_pre_projects/_BACKUP_NOTE.md`(변경 파일 목록 + git 복원 `git checkout 3b2ec68 -- 05_범용플랫폼/app/`). 물리 디렉터리 백업 권한 차단.**
- **데이터 — `APP.projects[]` + `case.projectId?`**(`core/core.js`) — `APP` 에 `projects:[]`·`projectsOn:false` 추가. `saveApp`/`loadApp` 가 `projects`·`projectsOn` 영속(localStorage `aap.v1.projects`·`aap.v1.projectsOn`, 타입 검증 폴백). `caseTemplate` 가 `seed.projectId` 를 옵셔널로 받아 `case.projectId`(기본 null=미배정) 세팅 — 기존 호출(projectId 없음) 무회귀. `createCase` 가 seed 에 request/projectId 있으면 caseTemplate 으로 전달(둘 다 없으면 기존 경로). `projectById`(헬퍼)·`seedProjects`(1회·비어있을 때만: '2026 상반기 채용'·'대한제조 도입' 2개 시드 + recruiting 시드 케이스→채용 프로젝트, meeting 시드 1건→도입 프로젝트 느슨 배정). boot 에서 `seedPack` 직후 `seedProjects()`+`saveApp()` 호출. 〔기획·UX〕
- **인박스 프로젝트별 보기 토글**(`core/core.js` `renderInbox`·신규 `_inboxStatusGroups`, `index.html`) — 인박스 상단(`#inboxProjToggle`, 프로젝트 1개+ 있을 때만 노출)에 **'프로젝트별 보기' 스위치 토글**(`.proj-tg`). **OFF(기본)** = `_inboxStatusGroups(cs)` 직접 호출 = **현행 상태 그룹 마크업과 바이트 동일**(원본 루프를 헬퍼로 그대로 추출 — 무회귀 보장). **ON** = 프로젝트별 그룹(각 프로젝트 헤더 `.ibx-ph`[이름·건수·검토대기 N] + 프로젝트 안에서 `_inboxStatusGroups` 재사용해 기존 상태 그룹 유지) + projectId 없거나 삭제된 프로젝트 가리키는 케이스는 **'미배정'** 그룹. 유형 필터(typeFilter)와 직교(필터 적용된 cs 위에서 그룹). 토글 상태 localStorage 영속. 〔기획·UX〕
- **격리 원칙** — projectId 없는 케이스 정상 동작(미배정 또는 OFF 시 영향 0). 토글 OFF 가 안전 기본값. 프로젝트는 추가 레이어 — caseStatus/caseProgress/openCase/On-Ramp/영속/X1 미터치. 〔기획·UX〕
- **CSS**(`core/platform.css`) — `.inbox-proj-toggle`·`.proj-tg`(+`.ptg-sw` 스위치 on 모션)·`.ibx-proj`·`.ibx-ph`(`.ph-ic/.ph-name/.ph-n/.ph-wait`)·`.ibx-pbody` 추가. 색=aap teal·amber·surface 토큰 재사용, 신규 hex 0. 〔기획·UX〕
- **코어 도메인 무관 유지** — projects/projectId/토글 전부 일반 메커니즘. 안정 ID(`#inboxList`/`#inboxFilter`/`#newCaseBtn`)·뷰 키·demo.js 타깃·X1·자산/로그 전역화 미터치. file:// 동작·외부 라이브러리 0·Lucide 인라인·자기설명 캡션 ✕. 〔표준·정의〕
- **검증(헤드리스/셸 cp·런처·삭제 권한 차단 → `node --check`(허용분)+정적 검증, 브라우저 런타임 미실측 명시)**: (a) `node --check core/core.js` **통과**(구문 0 에러). (b) **OFF 무회귀=정적 보장**: OFF 분기는 원본 상태 그룹 루프를 그대로 옮긴 `_inboxStatusGroups(cs)` 단일 호출 + 동일 `data-open` 와이어링 → 출력 동일. (c) ON 분기=프로젝트 그룹+미배정+프로젝트 내 상태 그룹(코드 경로 리뷰). (d) 토글/projectsOn 영속=loadApp/saveApp 경로 정합. (e) projectId 없는 케이스=caseTemplate 기본 null·미배정 그룹/OFF 무영향. (f) 시드=seedProjects 1회 가드(`APP.projects.length` 체크)·packId 'recruiting'/'meeting' 매칭(확인됨). **후속자가 file://로 (a)토글 OFF=현행 인박스 그대로 (b)토글 ON=프로젝트 그룹+미배정 (c)projectId 없는 케이스 정상 (d)토글 reload 영속 (e)On-Ramp·실행·자산/로그·시연 무회귀 (f)JS 에러 0 실측 필요(미실측 — 헤드리스·런처 차단).** 임시 검증 파일 생성 0. 〔데모 한정 검증〕
- **남긴 후속**: ① **P5 케이스 튜닝**(케이스별 자산·정책 오버라이드). ② 프로젝트 CRUD UI(현재 시드 2개 고정 — 생성/이름변경/케이스 재배정 UI 없음). ③ **aap-design 시각**: 토글 스위치 모션·프로젝트 그룹 헤더/접기·프로젝트별 진행률 롤업·미배정 그룹 위계. ④ 거버넌스(PACK.govern) 전역화(P2/P3 미포함분 잔존). 〔aap-design/후속〕

### 분해·조립 프로토타입 v0.2 (별도 탐색본 · 260622) 〔기획·UX〕
- **파일 = `03_프로토타입/D_회의/aap_meeting_runtime_compose_proto_v0_1.html`** (v0.36 복사본, 본선과 분리된 탐색본 — 본선 아님). **`compose`(실행 구조 구성) 한 스텝만** 교체, 다른 7단계·디자인 토큰 불변.
- **문제의식(사용자)**: "~~회의 진행하고 싶다" 요청에 AAP가 **업무·역할 구분 + 프로세스 분해→조립(재구성)** 하는 과정이 현행 데모에 안 보임(`out:'작업 그래프 T1~T5'`처럼 결과 라벨로만 선언).
- **v0.1(폐기) = 3블록 캔버스**(① 분해 / ② 배정 / ③ 조립 별 섹션). 피드백: 흐름이 끊겨 한눈에 안 들어옴, Master 조율 모습·하위 요소 설명 빈약. → **v0.36의 단일 위→아래 흐름 프레임으로 통합**(사용자 결정: "작업=노드 통합", 설명 헤더 절대 금지).
- **v0.2 통합 구조** = v0.36 프레임(상태 범례·Master 허브·상시 밴드·트리거 레인·병렬행+↓·두꺼운 카드) 유지 + **흐름의 노드를 작업(T1~T5) 카드로** 교체. 의존성 3계층(병렬 T1·T2·T3 → T4 → T5), Master 허브가 "요청 분해·작업별 구성요소 배정·실행 구조 조립" 조율 주체로 명시, 상단 입력→출력 strip, 하단 재구성 힌트.
- **★카드 정보 중요도 재분배(사용자 핵심 지시)**: ▸**카드 표면 = 작업명 + 순서 있는 세부 단계(`steps[]`, 개수 가변) + 게이트**. 세부 단계는 **평이한 행동 문장**이고 **요소(Connector·OCR·Policy·Doc Gen 모듈·STT 솔루션·요약 Agent)를 문장 속에 인라인 명시**(별도 배정 배지·caps 칩·읽는데이터 칩·결과 칩 전부 제거). 결과=마지막 단계 문장에 자연 표현. ▸**모달("자세히 ▸") = 계층·상세 capability·읽는 데이터·배정 근거(왜 이 요소·채택/탈락)·판단 근거·산출물**(덜 중요·기술적인 것 전부 하향).
- **요소 설명 위치 결정**: 사용자가 "왼쪽 고객 화면에 '회의록 Agent가 STT로…' 문구로 넣을까?" 제안 → **검토 후 기각**(고객 화면에 내부 요소명 노출=과거 걷어낸 챗봇 톤 회귀, 고객 경험 ✕ 작동원리 설명임). **대신 그 평이한 문장을 우측 카드 세부 단계로** 가져옴. **왼쪽 고객 화면은 요소명 없이 깨끗 유지**("회의록을 정리하고 있어요").
- **청중 = BD 실무자·팀장 → (후) 본부장급**. 너무 사업/기술 한쪽 치우침 금지 → "평이한 행동 문장 + 순서"가 중간 지점. 계층코드·caps 명칭은 너무 기술적이라 모달로.
- **코드**: `COMPOSE_FLOW[T1~T5]`(+`steps[]` 추가)·`COMPOSE_LAYERS`(의존성 3계층)·`composeNode`(헤더 작업명+상태 / `tsteps` 번호 단계 / 게이트 / 자세히 버튼)·`renderComposeCanvas`. `renderNodeModal` 에 compose 분기(tid 조회)+**"배정 근거·왜 이 구성요소" 섹션**+다중 owner 추가. `revealOps` n=3, 계층별 doing/done 점등. 새 CSS `.tsteps/.tstep/.th-nm` + 기존 `.rg-node/.gate/.band/.seqar/.par-tag` 재사용. `?node=`가 compose tid도 받게(테스트). 검증: 헤드리스 렌더 OK(T1~T5 단계·게이트·T3 모달 채택근거 전부 표출).
- **v0.2 추가 다듬기(사용자 4지시)**: ①입력→출력 strip 제거(Master 허브 바로). ②"자세히" 버튼=텍스트 단순화 + **카드 우측 하단 absolute 고정**(`.cnode{position:relative;padding-bottom}`+`.cmore{position:absolute}`). ③**HITL 게이트 칩 제거**(실제 사람 확정은 뒤 approve/commit 단계 — compose 카드엔 불필요, 복원 쉬움). ④**세부 단계에서 요소명 제거→순수 작업 내역화** + **"구현 요소" 스트립 신설**(`impl:[[ty,cap,L]]` → 점선 아래 `[타입 배지]capability·Lx`). *무엇을 하나(steps)* ↔ *무엇으로 구현(impl)* 분리. 무게=단계가 짧아져 수용 가능, T3(요소 3개)가 최밀도. 더 가볍게=계층코드 빼거나 cap 모달 환원 옵션.
- **다음 결정 대기**: 이 방향 본선(v0.37+) 흡수 여부 / 역할(누가 실행·승인·책임 RACI) 축 추가 / Direction D(다른 요청=다른 구조 토글) 별도 구현 / 구현 요소 스트립 무게(T3) 조정 여부.

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
- 현행 데모: `03_프로토타입/D_회의/aap_meeting_runtime_builder_v0_58.html` (대한제조 고객사 맥락 명시·HITL 거부=보류 처리[확정 전 진행 정지] · 회의 진행 방식 선택[앞단 approve, Teams/Zoom/Webex/대면→회의화면 반영]·근거 모달 좌측 화면 내부·회의록 결과 카드·발송 채널 선택[뒤단 commit, 전 옵션→공유 실제 반영] · 근거 보기 드릴다운 전 단계 확장[prepare 셀·meeting·share 목업] · 구성 토글 철회[거버닝=app/ 콘솔 소관·데모는 고객 화면+AAP 작동] · KMS=Confluence 통일 · 좌측 카드 '근거 보기'→사용자 언어 드릴다운 패널[이렇게 했어요·근거·연결 시스템], 항상-박스 폐기 · 폴리시: 우측 레이저 제거·모달 내부 정돈·요청 전송 애니[문구 위로 올라가 전송] · 업무 순서 클릭=그 단계 흐름 재생[좌측 장면→우측 설명, 요청·회의 포함]·첫 로딩 포털 정적 · AAP-only 순간 A·C·E 스포트라이트+💡부연설명[aap-spot/aap-why] · AAP-only 능력 단계 내부 분기[A 함의추론·C 가역성·E 발견차단결정기록] · 준비·공유 좌측 동기화 · 요청 좌측 동기화·회의 종료 게이트 · 범례 제거·카드 self라벨·카드 압축·좌측 상태 테두리 통일·a-i↔b-i 동기화 compose+understand · 우측 폰트 확대[특히 카드] · 좌측=결과·결정만[신뢰도 점수 등 근거·로직은 우측으로] · 끊김 없는 동적 흐름[증분 렌더+입자]·HITL 모달 축소·참석자 추가·어투 정리·업무순서 화살표 / 단계 설명=좌측 화면 툴팁·우측 진행바+스피너 동적화·범례 우정렬 / 좌측 = 기업 포털 홈 + 8단계 좌측 장면(파악/계획 카드·워크스페이스·Teams 코레오·Confluence)→우측 순차 점등 / 우측 = **AAP 작동 흐름 주제목(teal 엔진 헤더)+업무 순서 하위 레일**·3안 하이브리드·세부 토글·3계열 라벨 강화·좌우 색구분·반응형 / **HITL=게이트2+운영 트리거('회의 시작')1**, §2 구조 문법)
- 우측 레이아웃 비교 샘플: `03_프로토타입/D_회의/_sample_우측레이아웃_A_B_v0_1.html`
