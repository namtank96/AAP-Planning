# AAP 플랫폼 IA(메뉴·정보구조) 벤치마크 v0.1

> **목적**: 상용 "플랫폼 형태" 제품의 실제 메뉴/네비게이션을 조사해, AAP의 메뉴 구성·정보구조(IA)에 **취할 것/버릴 것**을 도출한다.
> **필터(절대 기준) = KEY MESSAGE**: *AAP는 Agent를 많이 띄우는 시스템이 아니라, **업무를 이해하고 → 실행 구조를 구성하며 → Agent·Module·기존 솔루션·Connector·정책을 조합해 → 운영 가능한 업무 흐름**을 만드는 플랫폼이다.*
> **조사 기준**: n8n·Make·MS Copilot Studio·Microsoft Foundry·LangSmith·Retool·UiPath·Cognigy·Glean 공식 문서, 2026-06-18 확인. (명칭 변동 심함 — §6 참조)
> **짝 문서**: 시각 규칙은 `aap_platform_ui_design_guide_v0.1.md`, 플랫폼 형태는 `05_범용플랫폼/aap_platform_form_spec_v0_1.md`.

---

## 1. 조사 결과 — 상용 플랫폼 IA의 두 아키타입

| 아키타입 | 대표 | 최상위 메뉴 패턴 |
|---|---|---|
| **A. 생애주기 단계 탭** (2025–26 에이전트 플랫폼의 지배적 패턴) | Microsoft Foundry(**Discover·Build·Operate**), Copilot Studio 신규(**Build·Preview·Evaluate·Monitor**), Cognigy(**Build·Deploy·Test·Analyze·Manage**) | "무엇을 만드는가"가 아니라 "지금 어느 단계인가"로 나눔 |
| **B. 자산 타입 모듈** (자동화 도구) | n8n(**Workflows·Credentials·Executions**), Make(**Scenarios·Connections·Tools·Data stores**), Retool(**Apps·Workflows·Agents·Resources**), UiPath(**Studio·Orchestrator·Maestro**) | 만드는 객체(워크플로우/앱/에이전트)별로 나눔 |

**AAP의 현행 3뷰(구성·실행·관리)는 아키타입 A(생애주기)에 가깝다** → 이게 옳다. 자산 타입(B)으로 가면 "Agents" 메뉴가 생기고, 곧 *Agent가 주인공*이 되어 KEY MESSAGE와 충돌한다.

---

## 2. KEY MESSAGE 필터 — 반드시 버려야 할 것

상용 제품 다수가 "Agent/봇/워크플로우를 만드는" 도구라, 그대로 베끼면 메시지가 무너진다.

| 흔한 IA 패턴 | 왜 AAP에선 ✕ |
|---|---|
| 최상위 **"Agents"** 메뉴 (Retool·UiPath·Glean·Foundry) | Agent를 세는·띄우는 시스템처럼 보임. AAP에서 Agent는 **5타입 중 하나의 부품**일 뿐 |
| **봇 단위로 빌드**(Copilot Studio: 한 agent의 Instructions/Knowledge/Tools) | 단위가 "봇"이 됨. AAP의 단위는 **업무와 그 실행 구조** |
| 거버넌스를 **별도 admin 콘솔로 분리**(Power Platform admin, Foundry Operate) | 정책이 사후 관리가 됨. AAP는 **정책을 흐름에 짜 넣는 게 차별점** |
| 개발자용 **raw 트레이스/JSON**(LangSmith) | 고객 화면은 업무 언어여야 함 |

> **한 줄**: 상용은 "에이전트를 만든다", AAP는 "업무 흐름을 구성·운영한다". 메뉴의 명사는 **Agent가 아니라 업무·실행 구조**여야 한다.

---

## 3. 벤치마크 요소 도출 (차용 / 주의 / 버림)

| # | 벤치마크 요소 | 출처(검증) | 판정 | AAP 적용 |
|---|---|---|---|---|
| 1 | **생애주기 단계 최상위 탭** | Foundry, Copilot, Cognigy | ✅ **차용** | 3뷰(구성→실행→관리)를 업무 흐름의 생애주기로 명확히 |
| 2 | **타입별 부품 팔레트/카탈로그** | n8n 노드 라이브러리, Make 모듈, Foundry Tool catalog | ✅ **차용** | 5타입(Agent·Module·Solution·Connector·Policy) 팔레트 = 구성 뷰의 핵심 |
| 2b | **실행 맵·목록에 부품 타입 색 표시** (KEY MESSAGE 증명) | 오케스트레이션 v2 자체 실험(`Agentic_AI_회의_오케스트레이션_v2.html`: 타입 색 점 `.mn-type`+타입 배지) | ✅ **차용**(색·분류 정합) | 다크 맵·목록 노드에 5타입 색 점/배지+범례 → "Agent가 잔뜩 도는 그림"이 아니라 "조합된 구조"임을 시각 증명. **엔진·모델은 별도 타입 ✕ → Agent/Module 내부 리소스로 흡수.** 색·규칙은 UI 가이드 §5.9 |
| 3 | **Connector를 1급 카탈로그로** + MCP | Retool "Resources", UiPath "Integration Service", Foundry/Copilot/Glean "Tools+MCP" (MCP는 사실상 표준) | ✅ **차용** | Connector 타입을 1급으로, "기존 시스템 연결"을 카탈로그화. MCP 연결 표기 |
| 4 | **관측/트레이싱을 명명된 메뉴로** | Foundry "Tracing", LangSmith "Observability", Copilot "Monitor", n8n "Executions" | ✅ **차용**(주의) | 관리 뷰에 실행 이력·Decision Lineage. 단 **업무 언어로**(raw 트레이스 ✕) |
| 5 | **재사용 컴포넌트 레지스트리/라이브러리** (신생 1급 개념) | Copilot "Agent Library", Foundry "Entra Agent Registry", Glean agent library | ✅ **차용** | 관리 뷰 = Component Registry(이미 보유) — 시대 흐름과 일치 |
| 6 | **흐름 템플릿/블루프린트** | Make Templates·Blueprints, n8n Templates, Retool Modules | ✅ **차용** | **Domain Pack = 재사용 가능한 업무 흐름 템플릿**(form_spec의 Pack 개념과 연결) |
| 7 | **빌드 영역의 공통 서브섹션**: Instructions·Knowledge·Tools·HITL/Escalation·Model | Copilot, Foundry(Model/Instructions/Tools), UiPath(Prompt/Tools/Context/**Escalations**=HITL) | ⚠️ **주의 차용** | 단, **봇 1개가 아니라 업무 단계별로** 구성. HITL(Escalation)을 1급 게이트로 (UiPath 검증) |
| 8 | **거버넌스 surface** | 전 제품(별도 admin) | ⚠️ **변형** | 존재는 차용하되 **정책을 구성 뷰의 컴포넌트로** 짜 넣고, 관리 뷰엔 통제 *현황*만 |
| 9 | RBAC·환경·감사로그 | n8n·Make·Retool·UiPath·Foundry 공통 | ✅ 차용(후순위) | 관리 뷰 운영설정. 데모에선 가볍게 |
| 10 | 최상위 **"Agents" 자산 메뉴** | Retool·UiPath·Glean | ❌ **버림** | §2 — Agent를 부품으로 강등 |

---

## 4. 권고 IA — AAP 3뷰 (현행 검증 + 샤프닝)

현행 3뷰가 옳다는 게 조사 결론. 각 뷰를 벤치마크로 강화:

### 🔧 구성 (Compose) — "업무를 이해하고 실행 구조를 짠다" *(차별화 핵심)*
- **업무 이해**: 요청 → 의미화(어떤 업무·목표·제약인지). *상용엔 거의 없는 단계 — AAP의 시작점*
  - **L4(지식/시맨틱) 강화 — Palantir AIP 차용(범위: L4 한정, 모델 골격 불변)**: 의미화를 단순 분류가 아니라 **업무 온톨로지(객체·관계·Action)** 로 본다. 5타입 부품은 이 온톨로지 *위에서* 작동하고, 시스템 쓰기는 **거버넌스 Action + HITL on writes**(자동 또는 확인 후)로만 나간다 → "왜 통제 가능한가"가 구조로 설명됨. ⚠️ AIP의 데이터-옵스(Pipeline/Foundry) 스코프는 차용 ✕(데모가 데이터 플랫폼처럼 보이면 메시지 흐려짐).
- **실행 구조**: 업무를 단계로 분해(8계층 흐름), 각 단계에 **부품 팔레트에서 5타입 배정**
  - 팔레트 = `Agent · Module · 기존 솔루션 · Connector · Policy` (+ Master) — *n8n 노드 라이브러리 / Foundry Tool catalog 패턴, 단 타입을 AAP 5종으로*
  - **Policy를 구성 단계에 끼워 넣음**(통제가 흐름의 일부 — §3-8 차별화)
  - **HITL 게이트 지정**(UiPath Escalation 패턴) — amber
- 산출 = "운영 가능한 업무 흐름" 1개

### ▶ 실행 (Run/Operate) — "흐름이 자율로 돈다"
- 업무 순서(직전·현재·다음 3개) + 8계층 다크 캔버스 실행(오케스트레이션 맵)
- **맵 노드에 부품 타입 색 표시**(§3-2b) — 실행 중에도 Agent/Connector/Solution/Policy 구분
- 실시간 로그(Datadog·n8n Executions 패턴, 업무 언어) + HITL/산출물 모달
- *"맡기기" 버튼 없이 자율 실행* (현행 원칙 유지)

### 🗂 관리 (Manage) — "부품·통제·학습이 쌓인다"
- **Component Registry**(5타입+Master) — *Copilot Agent Library / Foundry Registry 패턴*
- **실행 이력 / Decision Lineage**(트레이싱, 업무 언어) — §3-4
- **통제 현황**(가드레일 차단·HITL·권한) — 정책 *현황*만, 정의는 구성에서
- **Pack / 흐름 템플릿**(재사용) — §3-6
- 운영설정(RBAC·감사) — 후순위, 가볍게

---

## 5. 4대 공통 관심사를 "AAP식"으로

조사상 모든 플랫폼이 ⓐ커넥터 ⓑ거버넌스 ⓒ관측 ⓓ재사용 카탈로그를 1급으로 둔다. AAP는 같은 4개를 두되 **KEY MESSAGE로 비틂**:

| 공통 관심사 | 상용 방식 | AAP식(차별화) |
|---|---|---|
| ⓐ 커넥터 | 별도 "Resources/Integration" 카탈로그 | **Connector = 5타입 중 하나**, "기존 솔루션(Solution) 재사용"과 함께 *조합 부품*으로 |
| ⓑ 거버넌스 | 별도 admin 콘솔(사후) | **Policy = 구성 부품**(사전·흐름 내장) + 관리 뷰엔 현황 |
| ⓒ 관측 | Tracing/Executions(개발자) | **Decision Lineage**(업무 언어, 누가·무엇을·왜) |
| ⓓ 재사용 | Agent Library / Templates | **Component Registry + Domain Pack**(업무 흐름 단위 재사용) |

> 핵심: 상용은 이 4개가 *주변 인프라*다. AAP는 **ⓐⓑ가 곧 "조합 부품"** 이라는 점이 다르다 — 커넥터·정책이 카탈로그가 아니라 *흐름을 짜는 재료*다.

---

## 6. 명칭 변동성 주의 (락 걸기 전 재확인)
- Azure AI Foundry → **Microsoft Foundry**
- LangGraph Platform → **LangSmith Deployment** (2025-10)
- Copilot Studio: **Actions → Tools**, classic/new 2분기
- UiPath: **Build/Discover/Operate 폐지**(2025-05), Agent Builder → Studio Web 통합
- Make: 네비 개편 상시화(2025-11). **MCP가 Make·Foundry·Copilot·UiPath·Glean·Cognigy 전반에 표준 진입**

> 조사 신뢰도: 메뉴 *항목*은 신뢰 가능, 좌측 레일 *세로 순서*는 문서가 개념 위주라 indicative. 락 걸기 전 실제 화면 재확인 권장.

---

*v0.1 — 상용 IA 조사(2026-06-18) 기반. AAP 3뷰가 생애주기 아키타입과 정합함을 검증하고, Agent-중심 IA를 명시적으로 배제. 데모 진화 시 갱신.*
