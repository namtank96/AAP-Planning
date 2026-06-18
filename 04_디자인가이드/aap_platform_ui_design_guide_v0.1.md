# AAP Platform UI — 디자인 가이드 v0.1

> **목적**: AAP 범용 플랫폼 데모(현행 `03_프로토타입/D_회의/aap_meeting_runtime_builder_v0_22.html`)의 시각 디자인 시스템을 문서화하고, 상용 서비스를 벤치마크해 일관된 기준선을 만든다.
> **작성 기준**: v0.22 코드에 이미 박혀 있는 `:root` 토큰과 컴포넌트 패턴을 *역추출*해 표준화한 것이다. 새 색을 발명하지 않는다 — 현행 룩을 유지·정리한다.
> **포지션**: 이 문서는 **시각 디자인 시스템**이다. 화면 정보구조·시나리오는 `aap_meeting_screen_design_v0_1.md`(화면 설계서), 플랫폼 형태 정의는 `05_범용플랫폼/aap_platform_form_spec_v0_1.md`를 따른다.

---

## 0. 다른 디자인 문서와의 관계

| 문서 | 성격 | 본 가이드와의 관계 |
|---|---|---|
| `04/ktds_Design_System_참고_v0.1.md` (KT-Onto) | 검정/회색 + **KT 레드**, Palantir·Linear·Tesla 벤치마크. 손해사정 포털·HR Studio 등 **기업 톤** | **색(레드)은 차용하지 않음.** 토큰 정교화·미니멀·정보 밀도의 *규율*만 정합 |
| `D_회의/aap_meeting_screen_design_v0_1.md` | 화면 설계서(무엇을 보여줄지·정보구조) | 본 가이드는 그 화면을 **어떻게 보이게 할지** |
| `05/aap_platform_form_spec_v0_1.md` | 플랫폼 불변(3뷰·5타입+Master·8계층) vs Domain Pack | 본 가이드는 그 형태에 입히는 **시각 규칙** |

**왜 KT-Onto 레드가 아니라 teal인가**: AAP는 KT-Onto(온톨로지 사업, 레드)와 구별되는 *플랫폼 제품 브랜드*다. 현행 데모가 teal(`#0d9488`)을 제품색으로 확정했고, "통제·운영·신뢰"를 주조로 하는 콘솔에 레드(경고색)를 주색으로 쓰면 상태 색 체계와 충돌한다. → **teal 유지, 레드는 차단/위험 전용.**

---

## 1. 상용 서비스 벤치마크

AAP 데모는 "회의 예약 도구"가 아니라 **에이전트 오케스트레이션 + 운영 콘솔**이다. 그래서 벤치마크는 화려한 랜딩페이지가 아니라 *작동을 투명하게 보여주는 운영형 제품*에서 가져온다.

| 상용 서비스 | 무엇을 차용 (✓) | 어디에 적용 | 차용하지 않음 (✕) |
|---|---|---|---|
| **LangGraph Studio / LangSmith** (LangChain) | 에이전트 실행 트레이스 — 노드별 상태(대기/실행/완료), step 펼침, 입출력 객체 표시 | 실행 뷰의 8계층 흐름·Agent 작업 분해·live 로그 | 개발자용 raw JSON 덤프(고객 화면엔 업무 언어로) |
| **n8n / Make** | 노드-엣지 워크플로우 캔버스, 노드 상태 색, 연결선 흐름 | 오케스트레이션 맵(다크 캔버스), 8계층 좌→우 흐름 | 자유 캔버스 편집 UX(우리는 고정 시나리오) |
| **Microsoft Copilot Studio / Azure AI Foundry** | 컴포넌트(에이전트·툴·커넥터·정책) 카탈로그 카드, 타입별 아이콘·배지 | 구성 뷰 = Component Registry(5타입+Master) | 마법사식 단계별 폼(우리는 한눈에 보는 구성도) |
| **Linear** | 3-토큰 규율(base·accent·contrast), 높은 정보 밀도, 차분한 라이트 표면, 키보드·즉각성 | 전체 콘솔 타이포·밀도·토글·버튼 | 보라색 브랜드 강조(우리는 teal) |
| **Datadog / Grafana** | 실시간 로그 타임라인, 상태 점(dot)·심각도 색, 모니터링 보드 | 실행 로그, 관리 뷰의 KPI·통제 현황 | 그래프 과밀(데모는 핵심만) |
| **Notion** | 차분한 문서/워크스페이스 표면, 모달 안의 산출물 뷰, 여백 | 회의 산출물·HITL 모달·문서 패널 | 무한 중첩·이모지 톤 |
| **Vercel / Geist** | 뉴트럴 그레이스케일 절제, 타이포 우선 | 중립 배경·테두리·그림자 강도 | 순흑 다크 일변도 |

**한 줄 요약**: *Linear의 규율 + LangGraph/n8n의 작동 시각화 + Copilot Studio의 컴포넌트 카탈로그 + Datadog의 운영 로그 + Notion의 차분한 산출물*, 색은 teal 제품 브랜드로 통일.

---

## 2. 디자인 원칙

1. **투명한 작동 > 예쁜 결과.** 보닛을 여는 화면. 상태·근거·다음 단계가 항상 보인다.
2. **라이트가 기본, 다크는 "엔진룸"에만.** 업무 표면은 라이트(`--bg #f4f7fb`), 오케스트레이션 맵 등 *기계가 도는 곳*만 다크 캔버스로 대비.
3. **색은 의미다.** teal=AAP 주체/자동, violet=Module, blue=Connector, amber=사람 검토(HITL)·게이트, green=완료, red=차단/위험. 장식용 색 금지.
4. **밀도 높되 숨 쉬게.** 13px 본문, 8–11px 마이크로 라벨, 카드 1스타일, 일관 라운드·그림자.
5. **모션은 상태 전이에만.** pulse=실행 중, fade=등장. 의미 없는 애니메이션 금지.
6. **메인은 작게, 무게는 모달.** 메인 화면은 한눈에, 상세·산출물·HITL은 모달로. (현행 작업 모드 원칙)

---

## 3. 컬러 토큰 (현행 v0.22 = 표준)

```css
:root{
  /* 뉴트럴 */
  --bg:#f4f7fb; --surf:#f8fafc; --surface:#ffffff;
  --ink:#0f172a; --slate:#334155; --muted:#64748b; --faint:#94a3b8;
  --border:#e2e8f0; --line:#eef2f7;
  --shadow:0 8px 24px rgba(15,23,42,.06);

  /* 주색 = AAP (teal) */
  --aap:#0d9488; --aap-ink:#0f766e; --aap-soft:#f0fdfa; --aap-border:#99f6e4;

  /* 컴포넌트 타입 / 상태 액센트 */
  --violet:#7c3aed; --violet-soft:#f5f3ff; --violet-border:#ddd6fe;  /* Module */
  --blue:#2563eb;   --blue-soft:#eff6ff;   --blue-border:#bfdbfe;    /* Connector */
  --amber:#d97706;  --amber-soft:#fffbeb;  --amber-ink:#92400e; --amber-border:#fde68a; /* HITL·Gate */
  --green:#16a34a;  --green-soft:#f0fdf4;                            /* 완료·정상 */
  --red:#dc2626;    --red-soft:#fef2f2;    --red-border:#fecaca;     /* 차단·위험 */
  /* cyan #0891b2 / #0e7490 = 기존 솔루션(Solution) 타입 */
}
```

### 의미 매핑 (절대 어기지 말 것)

| 색 | 토큰 | 의미 | 쓰는 곳 |
|---|---|---|---|
| **Teal** | `--aap` | AAP 주체·자동 실행·주 CTA | 로고, active 노드, 주 액션, Master 카드 |
| **Violet** | `--violet` | **Module** 컴포넌트, 병렬 실행 | 구성 뷰 Module 카드, 병렬 stage 점선 |
| **Blue** | `--blue` | **Connector** 컴포넌트 | 구성 뷰 Connector 카드 |
| **Cyan** | `#0891b2` | **기존 솔루션(Solution)** 컴포넌트 | 구성 뷰 Solution 카드 |
| **Amber** | `--amber` | **사람 검토(HITL)·게이트·대기** | gate 노드, HITL 모달, 검토 배지 |
| **Green** | `--green` | 완료·정상·승인 | 완료 상태, ok 태그, 사람 승인 |
| **Red** | `--red` | 차단·위험·정책 위반 | block 태그, 가드레일 차단, stop 버튼 |

> 컴포넌트 5타입 = **A**gent(teal `tyA`) · **M**odule(violet `tyM`) · **S**olution(cyan `tyS`) · **C**onnector(blue `tyC`) · **P**olicy(amber `tyP`) + **Master**(teal 그라데이션).

---

## 4. 타이포 · 스페이싱 · 형태

**폰트**: `"Pretendard","Inter","Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",system-ui` — Pretendard 1순위(오케스트레이션 HTML과 동일, 통일).

| 토큰 | 값 | 용도 |
|---|---|---|
| 본문 | 13px / line 1.55 | 기본 |
| 강조/제목 | 15–17px, weight 800 | 브랜드·Master h3 |
| 마이크로 라벨 | 8–11px, weight 800, `letter-spacing .04–.5em`, UPPERCASE | role·단계·KPI 라벨 |
| 본문 보조 | 11–12.5px | 카드 본문·버튼 |

**라운드**: 7px(칩·토글·로고) → 9px(노드·버튼) → 10–11px(태그 컨테이너) → 14px(Master) → **15px(패널)**. 패널이 가장 둥글다.
**그림자**: 표면 `--shadow`(아주 옅게), 떠 있는 것(active 노드·모달)만 강하게.
**테두리**: 기본 `1px solid --border`. 점선(dashed)은 *병렬/예정/조건부* 의미일 때만(violet-border).
**간격**: 패널 패딩 12–18px, 카드 갭 6–13px, 토큰화된 일관 간격 유지.

### 4.1 레이아웃·밀도 규칙 (Palantir Blueprint / Workshop 차용 — 규율만, 색은 teal 유지)
데이터 밀도 높은 운영 콘솔의 정석. 단 Palantir 다크 모노크롬은 차용 ✕.
- **주 액션 ≤ 5개**(상단/툴바). 그 이상은 보조로 강등
- **한 화면 컴포넌트 ≤ 10개**(인지 부하 한계)
- **여백 30–40%** 확보, **compact 패딩 기본**(밀도는 높되 답답하지 않게)
- **F-패턴 읽기**: 좌상단→우측. **필터·내비는 좌측 고정, 콘텐츠는 우측 흐름**
- **가로 스크롤 회피**(컬럼 가로 맞춤), 내비 바·탭은 헤더에 고정
- 시각 위계: 드롭섀도=중요, 밝은 배경=주(主)·어두운 배경=보조(필터 등)

---

## 5. 핵심 컴포넌트 패턴

### 5.1 Top bar (54px, 흰 배경)
`로고(teal 그라데 사각) + 제품명(AAP Platform) + Pack 칩(현재 도메인) … [구성/실행/관리 토글] [Run 버튼(--ink, 실행 중 stop=red)]`

### 5.2 3-뷰 토글 (Linear 세그먼트 패턴)
배경 `#f1f5f9` 안에 pill, 선택 시 흰 배경 + 옅은 그림자. **구성 / 실행 / 관리** 3개 고정.

### 5.3 업무 순서 바 (실행 뷰 상단)
`직전 · 현재 · 다음` 3개만 노출(`.snode`). active=teal soft, gate=amber soft, 인접(adj)=opacity .6. 우측에 진행률(teal). → "맡기기 버튼 없이 자율 실행" 원칙대로 클릭 내비만.

### 5.4 컴포넌트 카드 (구성 뷰, Copilot Studio 카탈로그식)
타입별 상단 3px 보더 + 타입 배지(`tyA/M/S/C/P`). Master는 teal 그라데 카드로 격상.

### 5.5 Gate / HITL (amber 규칙)
게이트 노드·HITL 모달은 항상 **amber**. "여기서 사람이 본다"를 색으로 즉시 전달. 완료되면 green, 차단이면 red.

### 5.6 산출물·HITL 모달 (Notion식 차분함)
메인은 가볍게, 무게 있는 내용(회의 산출물·검토·결재)은 모달. 흰 표면 + 넉넉한 여백 + 상단 back 링크(teal).

### 5.7 상태 태그
`ok`(green-soft) · `warn`(amber-soft) · `no`(slate) · `block`(red-soft). 작게, 한 줄.

### 5.8 툴팁 (`#tip`)
다크(`--ink`) 배경 흰 글씨, 11px, max 300px. 노드·컴포넌트 hover 설명.

### 5.9 컴포넌트 타입 시각화 (★ KEY MESSAGE 증명 장치)
*오케스트레이션 v2(`Agentic_AI_회의_오케스트레이션_v2.html`)에서 차용 — 단 색·분류는 canonical로 정합.*
모든 부품(맵 노드·목록 카드)에 **타입을 색으로 표시**해, 화면이 "Agent가 잔뜩 도는 그림"이 아니라 **"무엇이 Agent이고 무엇이 Connector·Solution·Policy인지 조합된 구조"** 임을 시각적으로 증명한다. (= IA 벤치마크 §3-2)

- **타입 색 점**: 맵 노드 우상단 작은 점(v2 `.mn-type` 패턴), 색 = 타입색
- **타입 배지**: 목록 카드에 `타입색 + soft 배경` 칩
- **타입 범례**: 맵·목록 상단에 5타입 범례 고정
- **5타입 + 색(절대 기준, §3 의미 매핑과 동일)**:
  | 타입 | 색 | 비고 |
  |---|---|---|
  | Agent | teal `--aap` | 자율 추론·판단·도구 오케스트레이션 |
  | Module | violet `--violet` | 단일 기능·규칙엔진·자동화(스킬 포함) |
  | Solution(기존 솔루션) | cyan `#0891b2` | 재사용하는 기존 시스템 |
  | Connector | blue `--blue` | 외부 시스템 연동(읽기/쓰기) |
  | Policy | amber `--amber` | 통제·권한 (흐름 내장) |
- **엔진·모델(LLM·STT·번역 등)은 별도 타입 ✕** → Agent/Module의 *내부 리소스*로 본다. 필요 시 카드 안 작은 "엔진" 칩으로만 표기(타입색 안 부여). *부품 종류를 5개로 묶어 KEY MESSAGE를 흐리지 않는다.*

### 5.10 Object View "허브" 패턴 (Palantir AIP 차용)
대상(업무 객체·부품) 하나를 클릭하면 **그 대상의 정보 + 상태/시각화 + 관련 워크플로·액션**을 한 곳에 묶어 보여주는 허브. Palantir의 Object View 패턴.
- 적용: 관리/Registry 뷰의 **부품 상세**(이 부품이 뭘 하나·어디 쓰이나·실행 이력·관련 정책), 실행 뷰의 **업무 객체 상세**(회의→안건·참석자·결정)
- 구성: 상단 객체 헤더(이름·타입 배지·상태) → 탭/섹션(개요·관계·이력·액션) → 액션은 권한·HITL 규칙 표시
- 모달 또는 우측 패널로(메인은 가볍게 원칙 유지)

---

## 6. 오케스트레이션 캔버스 — 다크 "엔진룸" (오케스트레이션 HTML에서 차용)

업무 표면은 라이트지만, **AAP가 실제로 도는 맵**은 다크 캔버스로 대비시킨다. `Agentic_AI_회의_오케스트레이션.html`의 live-map을 표준 차용:

```css
/* 다크 그리드 캔버스 */
background:
  linear-gradient(0deg, rgba(255,255,255,.03) 1px, transparent 1px) 0 0/36px 36px,
  linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px) 0 0/36px 36px,
  #0b1220;
```

**노드 상태색 (다크 위에서)**:
| 상태 | 카드 | 보더 | 점·라벨 |
|---|---|---|---|
| 대기(off) | `#1e293b` | `#334155` | opacity .5 |
| 실행(on) | `#312e81` | `#6366f1` + 글로우 | indigo dot, pulse |
| 완료(done) | `#053b2e` | `#10b981` | emerald |
| 준비(ready) | `#3a2c0a` | `#f59e0b` 점선 | amber |

**노드 타입 점**: 각 노드 우상단에 §5.9 타입 색 점(`.mn-type`)을 얹어, 실행 상태(글로우)와 *별개로* "이게 어떤 부품인지"를 항상 표시. → 다크 맵에서도 Agent/Connector/Solution/Policy가 구분된다.

> **주의**: 다크 캔버스 안에서 *상태*는 실행=**indigo** glow(오케스트레이션 원본 유지, 가독성). 단 노드 *타입 점*은 §5.9의 teal 5타입 색을 쓴다 — 상태색(indigo/emerald/amber)과 타입색을 혼동하지 말 것. 라이트 표면 업무 주체는 teal. *다크 맵=기계 작동(indigo glow)+부품 타입(teal 5색), 라이트 표면=업무 주체(teal)*.
**모션**: `@keyframes agpulse`(실행 중 노드 글로우), `fade`(등장), `flowping`(연결선 따라 흐르는 데이터 점 `.flow-dot` — v2 차용, 데이터 이동 표현). 1.1~1.25s 안팎, 과하지 않게.

---

## 7. 적용 체크리스트

빌드/수정 시 확인:
- [ ] 새 색을 추가하지 않았다(토큰만 사용). 장식용 색 0개.
- [ ] amber는 사람 검토/게이트에만, red는 차단/위험에만 썼다.
- [ ] 카드는 1스타일(라운드·그림자·테두리 일관). 패널 15px 라운드.
- [ ] 마이크로 라벨은 UPPERCASE + letter-spacing.
- [ ] 다크 캔버스는 오케스트레이션 맵에만. 업무 표면은 라이트.
- [ ] 모션은 상태 전이(pulse/fade)에만.
- [ ] 메인은 가볍게, 상세는 모달.
- [ ] 오버플로우·줄바꿈 깨짐 없다(긴 한글 라벨 nowrap 확인).
- [ ] 밀도 규칙(§4.1): 주 액션 ≤5, 화면 컴포넌트 ≤10, 여백 30–40%, 필터 좌측.

## 8. 금칙
- KT-Onto 레드를 주색으로 쓰기 ✕ (red는 위험색 전용)
- 다크 맵의 indigo를 라이트 표면 주색으로 쓰기 ✕ (라이트=teal)
- 오케스트레이션 v2의 타입색(Agent=violet·엔진=rose) 그대로 쓰기 ✕ → §5.9 canonical 5타입 teal 체계로 정합(Agent=teal). 엔진을 별도 타입으로 세우기 ✕
- 회의 예약/요약 "결과만" 보여주는 화면 ✕ (작동·근거가 보여야 함)
- 개발자용 raw 로그/JSON을 고객 화면에 노출 ✕ (업무 언어로)
- 챗/RAG·경쟁사 비교 UI ✕ (제품감 유지)

---

*v0.1 — 현행 v0.22 코드 역추출 기준. 데모가 진화하면 토큰·패턴 변경분을 여기 반영한다.*
