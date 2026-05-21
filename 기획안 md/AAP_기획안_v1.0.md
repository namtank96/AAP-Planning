# Agentic AI Platform (AAP) 기획안

> **버전**: v1.0 (통합 정리본)
> **작성일**: 2026-05-20
> **작성**: KT DS · AX BD
> **목적**: 고객 선제안용 — Data Platform 이후의 다음 과제로 AAP를 인식시키고 후속 논의를 만드는 자료
> **기반 자료**: `aap_offering_map_v07.html`, `aap_proactive_offering_v100.html`

---

## 한 줄 정의

> **Data Platform이 정보를 보게 했다면, AAP는 업무를 수행하게 합니다.**

**AAP**는 고객의 데이터·문서·시스템을 **업무 의미로 구조화**하고, Agent가 **판단·실행·검토**하며, 운영 결과를 **지식·스킬·판단 이력으로 축적**하는 **구축형 Enterprise Agentic AI Platform**입니다.

### 핵심 키워드
- Data Platform 이후의 실행 계층
- Business Semantic 중심
- Writeback / HITL / Closed Network
- SI 경험 기반 선제안
- 검증 케이스 보유 (무역·금융·투자)

---

## 1. Why Now — Data Platform 다음의 질문

고객은 이미 Data Platform과 AI PoC를 경험했습니다. 다음 질문은 **"AI가 실제 업무를 어디까지 수행할 수 있는가"** 입니다.

### 시장 진단
시장 조사(Gartner, Deloitte 등)에서 **AI 도입의 70~80%가 PoC 단계에서 운영 전환에 실패**하는 것으로 보고됩니다. 원인은 단일 기술 한계가 아니라 **4가지 구조적 결핍**입니다.

| 구분 | 결핍 | 설명 |
|---|---|---|
| **Context** | 업무 맥락 부족 | 문서 검색은 되지만 정책·프로세스·권한·의사결정 기준을 업무 의미로 연결하지 못함 |
| **Action** | 실행 연계 부족 | AI 답변이 실제 ERP, CRM, 그룹웨어, 업무 시스템의 처리로 이어지지 않음 |
| **Control** | 검토·통제 부족 | 위험 업무에서 사람 검토·승인·감사·설명 가능성 체계가 약함 |
| **Learning** | 운영 자산화 부족 | 결과·피드백·예외 처리 경험이 지식·스킬·판단 기준으로 누적되지 않음 |

### 핵심 메시지
> Data Platform이 정보를 보게 했다면, AAP는 업무를 수행하게 합니다. 기존 AI가 답변·요약에 머물렀다면, AAP는 업무 의미를 이해하고 **실행·검토·반영까지** 연결합니다.

---

## 2. Data Platform / 기존 AI / AAP 비교

| 구분 | Data Platform | 기존 AI / Copilot | **AAP** |
|---|---|---|---|
| **목적** | 데이터 수집·저장·분석 | 질의응답·요약·초안 생성 | **업무 이해·판단·실행·검토** |
| **핵심 단위** | 데이터셋, 파이프라인, 대시보드 | 프롬프트, 대화, 문서 | **업무 프로세스, 정책, 도구, 결정, 실행 로그** |
| **결과물** | BI, 리포트, 데이터 서비스 | 답변, 문서 초안, 요약 | **Copilot, Workflow, API/RPA 실행, 시스템 반영** |
| **한계** | 실행은 사람이 함 | 업무 맥락·통제·연계가 약함 | **업무 실행과 운영 학습까지 포함** |

> AAP는 Data Platform을 대체하지 않습니다. **Data Platform 위에서** 고객 업무를 실행 가능한 Agentic Layer로 연결합니다.

---

## 3. AAP Offering Map

작동원리와 고객 제공 오퍼링이 같은 **7개 영역**을 공유하도록 재구성한 맵입니다.

```
┌─────────────────────────────────────────────────────────────────────┐
│ ① Service Experience  (고객이 실제로 사용하는 AI 업무 서비스)        │
│   AI Agent Portal · Horizontal Agents · Vertical Agents · HITL UI   │
└─────────────────────────────────────────────────────────────────────┘
            ▼
┌──────────┐  ┌────────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐
│ ② Data & │→ │ ③ Business │→ │ ④ Agentic│↔ │ ⑤ Action & │↺ │ ⑥ Op.    │
│   Inputs │  │  Semantic  │  │ Reasoning│  │ Integration│  │ Learning │
│          │  │ ★ 차별화   │  │          │  │            │  │ ★ Moat   │
└──────────┘  └────────────┘  └──────────┘  └────────────┘  └──────────┘
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ⑦ Foundation — Trust · Security · Governance                        │
│   IAM · Data Security · Audit · Explainability · Guardrails · CLOSED│
└─────────────────────────────────────────────────────────────────────┘
```

### 영역별 구성요소

#### ① Service Experience — 고객 사용단
- AI Agent Portal (Works AI+ · Works AI · AI Edu · 전사 AI 업무 포털)
- Horizontal Agents (회의록·보고서·사내자료 검색·VOC 답변·데이터 분석)
- Vertical Agents (무역 정세·금융 내부통제·AI 투자 자문·공공·국방·교육 특화)
- Human Review / Approval UI (승인·반려 UI · 예외 라우팅 · 근거 표시)

#### ② Enterprise Data & Inputs — 고객 자산 연결
- Enterprise System Connectors
- Data Platform Integration
- Document / Knowledge Integration
- Operational Log Integration
- External Data Interface
- Metadata Catalog

#### ③ Business Semantic Modeling — 핵심 차별화 ★
> 문서와 데이터를 Agent가 이해 가능한 **업무 개념·프로세스·정책·권한·판단 기준**으로 전환

- Domain Ontology
- KMS / Domain Dictionary
- Knowledge Graph
- Process Map
- Decision Rule Repository
- System Map
- Authority Matrix

#### ④ Agentic Reasoning & Execution — Agent 실행 코어
- Planning Engine / Work Context Memory
- Agent Routing
- Tool Registry / Tool Calling Runtime
- HITL Routing / Action Policy
- Prompt / Skill Template

#### ⑤ Enterprise Integration & Action — 업무 시스템 반영
- Copilot UI / Review·Approval UI
- Workflow Engine / API Gateway
- RPA / Writeback Connector
- Report / Dashboard / Monitoring

#### ⑥ Operational Learning — 운영 자산화 ★
- Decision Log / Action Log
- System Knowledge / Skill Library
- Feedback Store / Evaluation Pipeline
- Versioning / Knowledge Update Workflow

#### ⑦ Foundation — Trust · Security · Governance
- IAM / SSO
- Data Security
- Audit / Lineage
- Explainability
- Guardrails
- **Closed / Private Deployment** (1차 타겟 산업 모두 폐쇄망)
- Tenant Governance

---

## 4. 선제안용 Top 4 차별화

Multi-LLM 등은 기본 기능으로 보고, 고객 의사결정에 더 직접적인 4가지를 전면에 둡니다.

| # | 차별화 요소 | 왜 강한가 |
|---|---|---|
| **1** | **Business Semantic Modeling** | KT DS의 KMS·AICC 경험과 SI 본업이 정면 작동. 일반 AI Studio·LLM Gateway가 다루지 못하는 부분. |
| **2** | **Enterprise System Writeback** | 답변형 AI와 실행형 AI의 가장 큰 차이. 레거시·기간계 통합 노하우가 정면 작동. |
| **3** | **Operational Learning Loop** | 시간 가치가 누적되는 구조. 일반 AI 시스템은 노후화되지만 AAP는 진화. **장기 해자**. |
| **4** | **Closed / Private Deployment** | 1차 타겟 산업(공공·금융)이 모두 폐쇄망. KT그룹 보안 자산과 결합. |

---

## 5. Business Semantic Modeling — 왜 단순 RAG가 아닌가

AAP의 핵심은 문서 검색이 아니라, **고객 업무의 의미·정책·권한·판단 기준을 Agent가 사용할 수 있는 구조로 만드는 것**입니다.

| 산출물 | 의미 | 고객 가치 |
|---|---|---|
| **Domain Ontology** | 업무 개념과 관계 구조 | 질문이 아니라 업무 맥락을 이해 |
| **Process Map** | 업무 흐름과 단계 | Agent가 절차에 따라 행동 |
| **Decision Rule Repository** | 정책·조건·예외 기준 | 판단의 일관성과 설명 가능성 확보 |
| **System Map** | 업무와 시스템 연결 관계 | 실제 시스템 호출·반영 가능 |
| **Authority Matrix** | 승인·검토·권한 구조 | 자동 실행과 사람 검토를 분리 |
| **Skill Catalog** | 재사용 가능한 Agent 업무 능력 | 운영할수록 재사용 자산 축적 |

> 일반 AI Studio·LLM Gateway는 "Agent를 **어떻게 만드는가**"의 도구, RAG는 "문서를 **어떻게 검색하는가**"의 기법입니다. AAP의 본질은 **고객의 업무 의미를 Agent가 일관되게 이해·실행할 수 있는 구조로 전환하는 것**이며, 이 영역에 의사결정 자산이 누적될수록 시간이 지날수록 더 정확해지는 시스템이 만들어집니다.

---

## 6. 검증 자산 — AAP 구성 요소가 이미 작동한 사례

AAP는 신규 개념이 아닙니다. 작동원리의 일부가 이미 KT DS의 실제 프로젝트에서 검증되었으며, 이를 통합·일반화한 것이 AAP입니다.

| 단계 | 케이스 | 산업 | 내용 | AAP 매핑 |
|---|---|---|---|---|
| **Wave 1 · 외부 영업** | 무역 단체 정세 분석 | 공공·무역·협회 | 국제 정세·환율·규제 변화 통합 → 회원사 영향도 분석·통보. 온톨로지 PoC 완료, 기술 세미나 단계. | ③ Semantic + ⑤ Action + ⑥ Learning |
| **Wave 1 · 딜리버리** | 금융지주사 내부통제 | 금융·규제·폐쇄망 | 승인·감사·예외 처리 의사결정 구조화. 수주 완료, hands-on 부서 존재. | ③ Semantic + ④ HITL + ⑦ Foundation |
| **Reference Instance** | AI 투자 메이트 | 자산운용·의사결정 | 매크로·뉴스·블룸버그 통합 멀티에이전트 투자 자문. E2E 검증, LangGraph 기반. | ② Data + ④ Agentic + ① Service |

> 세 케이스 모두 AAP 핵심 작동원리(Inputs → Semantic → Agentic → Action → Learning)의 일부를 실증. AAP는 이를 **통합 구조로 일반화**해 다른 고객·산업에 재적용 가능하게 한 플랫폼 오퍼링입니다.

---

## 7. 고객 유형별 진입 패턴

공통 Offering Map은 유지하되, 진입 메시지를 다르게 가져갑니다.

### Type A — 대기업 / 자체 AI 조직 보유
- **상황**: 이미 Data Platform과 AI 조직이 있으나, 운영 전환과 실제 업무 실행이 병목
- **제안 메시지**: 기존 플랫폼 위에 **업무 실행형 Agentic Layer**를 얹어 속도와 안정성을 높임
- **강조점**: Writeback · Operational Learning

### Type B — 산업 특화 중견
- **상황**: AI 조직은 크지 않지만, 반복 업무·문서·승인·예외처리 니즈가 명확
- **제안 메시지**: 업무와 시스템에 맞춘 **구축형 AAP**로 작은 영역부터 빠르게 시작
- **강조점**: Vertical Agent · Business Semantic

### Type C — 공공·금융·국방 등 규제·폐쇄망
- **상황**: 보안·감사·망분리·승인 체계가 도입 가능 여부를 결정
- **제안 메시지**: 폐쇄망·권한·감사·HITL을 포함한 **통제형 AAP**로 접근
- **강조점**: Foundation (Closed Network) · HITL

---

## 8. Build / Bring / Borrow

고객 업무와 시스템 통합은 **직접 책임**지고, 범용 모델·도구·도메인 전문성은 **검증된 솔루션과 파트너**로 조합합니다.

| 영역 | Build · 직접 설계·구축 | Bring · 솔루션 조합 | Borrow · 파트너·전문성 |
|---|---|---|---|
| **Service Experience** | Agent Portal, Review·Approval UI, Vertical Agent 서비스화 | Works AI+ · Works AI · AI Edu 등 사내·그룹 자산 | 산업별 SME, 현업 프로세스 전문가 |
| **Enterprise Data & Inputs** | ERP·CRM·SCM·결재 연동, 데이터 수집·정제, 운영 로그 설계 | Connector, Document Parser, Metadata Catalog, Vector DB(Pinecone·Weaviate·Qdrant) | 외부 데이터, 산업 데이터 전문기업, 비투엔 |
| **Business Semantic ★** | 업무·정책·시스템 맵핑, 의사결정 기준, Authority Matrix | KMS, Taxonomy 도구, Knowledge Graph 도구 | Ontology·KG 전문기업(인핸스·E8·서버키트), 규제·산업 도메인 SME |
| **Agentic Reasoning** | Agent Flow, Prompt·Skill Template, Action Policy, HITL 룰 | LLM(GPT·Claude·Gemini), Agent Framework(LangGraph·AutoGen·CrewAI), MCP/Tool Calling, BEAST AI | 국내 sLLM(스켈터랩스·아이브릭스·파수), 멀티에이전트(직스에이아이) |
| **Enterprise Action ★** | Writeback, API 연계, Workflow 통합, Copilot·Review UI | RPA(UiPath·KT DS), API Gateway, Workflow Engine(Camunda·Temporal), BI(Tableau·Power BI) | UI/UX, 특수 레거시 시스템 파트너 |
| **Operational Learning ★** | Decision Log, System Knowledge, Skill Library, Feedback Workflow | EvalOps, MLOps(MLflow·W&B), Monitoring(Datadog·Grafana), Versioning | AI 품질평가, 보안·감사 전문성 |
| **Foundation ★** | 권한·감사 요구사항 설계, 폐쇄망 구축, 운영 정책 | IAM, Audit(Splunk·OpenTelemetry), Guardrails, KT그룹 보안 솔루션 | 보안·망분리·규제 대응 전문 파트너(디피니트 등) |

> **★ 표시**는 KT DS가 책임지고 직접 설계·구축할 **4대 차별화 영역**입니다.

---

## 9. 국내 파트너 후보 (2026년 기준)

"전문 파트너"라는 일반 표현이 아닌, 실제 협업 가능한 국내 기업들입니다.

| 파트너 | 영역 | 주요 자산 | 활용 모델 |
|---|---|---|---|
| **인핸스 (Enhans)** | ③ Semantic / ④ Agentic | 온톨로지 기반 엔터프라이즈 멀티에이전트 플랫폼 AgentOS. Act-1 에이전트 Online-Mind2Web 리더보드 3위(구글·OpenAI 다음). 리테일·금융 도메인 검증. | 공동 PoC · 통합 SI |
| **비투엔 (B2EN)** | ② Enterprise Data | RAG 플랫폼 '하이퍼글로리'. 데이터 관리·추론·검증·운영 전 주기 통제. 기업 데이터 라이프사이클 운영 경험. | 라이선스 · 공동 구축 |
| **스켈터랩스 (Skelterlabs)** | ④ Agentic — sLLM | sLLM 'BELLA LLM'. 경찰청 도입 검증. LoRA·양자화 기반. 데이터 비식별화·모사 데이터. | OEM · 통합 SI |
| **아이브릭스 (IBRIX)** | ④ Agentic — sLLM + LLMOps | sLLM '세레브로' + LLMOps 플랫폼 '세레브로 스튜디오'. 지식그래프 기반 RAG 실시간 참조. | OEM · 통합 SI |
| **파수 (Fasoo)** | ④ Agentic + ⑦ Foundation | Private LLM 기반 도메인 특화 AI. ACL 권한 반영. 가트너 2026 트렌드 DSLM(Domain-Specific Language Model). | 라이선스 |
| **직스에이아이 (ZiggsAI)** | ④ Agentic — 멀티에이전트 | AI 에이전트 자율 팀 구성·협업 조율 플랫폼. 비즈니스 워크플로우 자동화·다단계 추론. | 공동 PoC |

### 활용 4 모델
1. **라이선스·OEM**: 파트너 솔루션을 AAP 컴포넌트로 도입 (스켈터랩스·아이브릭스·비투엔·파수)
2. **공동 PoC**: 산업별 케이스 진입 (인핸스·직스에이아이)
3. **통합 SI**: 파트너 솔루션의 한국 시장 SI 파트너 자리
4. **전략 협업**: 글로벌 Frontier(Anthropic·OpenAI·Google Cloud) 한국 진입 시 현지 SI 파트너 자리

---

## 10. Past / Present / Future Capability Continuum

AAP는 갑자기 새로 시작하는 영역이 아니라, **과거 수행경험 위에 현재 솔루션을 조합하고 미래 Agentic 기술을 흡수**하는 확장 구조입니다.

| 시점 | 내용 |
|---|---|
| **Past** (이미 해온 경험) | KMS / AICC 운영 · 그룹사·고객사 시스템 연동 · 폐쇄망·보안·인프라 구축 · ITO 운영 및 장애 대응 · 콜센터·상담·지식관리 업무 이해 |
| **Present** (지금 조합 가능) | LLM / RAG / Vector Search · Agent Framework / Tool Calling · Workflow / API / RPA · Copilot UI / Review UI · Monitoring / Audit / Observability |
| **Future** (흡수할 역량) | 자기통제 / Guardrails 고도화 · EvalOps / 품질 자동평가 · Tool Registry 진화 · 자율 실행 통제 · Skill Marketplace / Agent 자산화 |

---

## 11. 산업별 적용 예시

AAP는 특정 산업 전용 솔루션이 아니라, **문서·정책·시스템·검토 흐름이 많은 업무**에 우선 적용 가능합니다.

| 산업 | 시작 Use Case | AAP 적합 이유 |
|---|---|---|
| **제조** | 작업표준·품질·설비 매뉴얼 Agent | 문서·설비·품질 이력이 많고 현장 대응 니즈가 큼 |
| **유통** | 매장 운영·프로모션 정책 Agent | 정책 변경과 CS 대응이 잦음 |
| **물류** | 배송 예외·클레임 처리 Agent | 예외 처리와 시스템 연계가 중요 |
| **공공** | 민원·행정 지식 AI KMS | 법령·지침·근거 제시 필요 |
| **국방** | 폐쇄망 정비·운영 매뉴얼 Agent | 보안·망분리·정비 지식 활용 필요 |
| **교육** | 학사·교무·상담 AI KMS | 규정·FAQ·상담 지식 활용성이 높음 |

---

## 12. Why AAP / Why SI / Why KT DS

| Why AAP | Why SI | Why KT DS |
|---|---|---|
| Data Platform 이후의 실행 계층 | 고객 레거시 시스템과 깊은 연동 | KMS·AICC·SI·ITO 경험의 확장 |
| PoC·챗봇을 운영 업무로 확장 | 업무 프로세스·권한·승인 구조 이해 | Business Semantic·Writeback 중심 제안 |
| 업무 의미·정책·판단 기준을 Agent가 활용 | 구축·운영·개선 책임 인수 | 폐쇄망·보안·운영 환경 대응 가능 |
| 의사결정 자산이 시간 누적되는 구조 | 폐쇄망·규제 환경 대응 | 검증 케이스 보유 (무역·금융·투자) |

---

## 13. Next Step — Discovery Workshop (2~4주)

첫 단계는 대규모 구축이 아니라, **AAP 적용 가능성이 높은 업무를 찾는 낮은 부담의 진단**입니다.

### Step 1 · 업무 후보 발굴 (1주차)
- **활동**: 문서·정책·시스템·예외 처리가 많은 업무 1~2개 선정. 현업·IT·감사 부서 합동 인터뷰.
- **산출물**: 업무 후보 List · 우선순위 매트릭스 · 적용 가능성 평가

### Step 2 · 데이터·문서·시스템 확인 (2~3주차)
- **활동**: 사용 가능한 문서·데이터 플랫폼·API·RPA 가능성·보안 제약 확인. Semantic-Ready 진단 방법론 적용.
- **산출물**: Semantic-Ready Report · 연계 시스템 명세 · 보안·폐쇄망 조건 정리

### Step 3 · Pilot 범위 정의 (4주차)
- **활동**: 8~12주 내 데모 가능한 Copilot·Tool Use·Writeback 범위 정의. 고객 환경에 맞춘 Offering Map 재구성.
- **산출물**: Pilot 제안서 · AAP 적용 Offering Map · ROI·일정·R&R 정의

---

## 14. Closing — Next Discussion 안건

고객 환경에 맞춰 AAP Offering Map을 재구성하고, 적용 후보 업무와 시스템 연계 조건을 함께 검토하는 워크세션을 제안합니다.

| # | 논의 안건 | 세부 |
|---|---|---|
| 1 | **업무 후보 선정** | 문서·정책·시스템·예외 많은 업무 1~2개 |
| 2 | **데이터·시스템 확인** | Data Platform·기간계·API 가능성 |
| 3 | **보안 조건 검토** | 폐쇄망·망분리·감사 요구사항 |
| 4 | **Pilot 범위 협의** | 8~12주 데모 가능 범위 정의 |

### 마무리 메시지
> AAP는 단일 AI 기능 도입이 아니라, **고객 업무 실행 방식을 Agentic 방식으로 전환하는 플랫폼**입니다. 다음 단계에서는 고객 환경에 맞는 AAP Offering Map을 함께 재구성하는 논의를 제안합니다.

---

## 부록 · 버전 히스토리

| 버전 | 일자 | 형식 | 주요 변경 |
|---|---|---|---|
| v0.6 | 2026-05-20 | HTML | Offering Map 초기안 |
| v0.7 | 2026-05-20 | HTML | Top 4 차별화, 검증 자산, 국내 파트너, Discovery Workshop 추가 |
| v1.00 | 2026-05-20 | HTML | Proactive Offering 정제본 (TOC, 비교표, 산업별 예시) |
| **v1.0** | **2026-05-20** | **MD** | **v0.7 + v1.00 통합 정리본** |
