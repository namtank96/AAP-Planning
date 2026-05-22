# AAP 고객용 선제안서 · v0.1

> **문서 성격**: 고객 선제안 / 후속 논의 유도용  
> **대상 독자**: 고객사 DX/AI/데이터/IT/현업 혁신 부서, 임원 및 실무 리더  
> **목적**: Data Platform과 생성형 AI PoC 이후, AI를 실제 업무 운영 체계 안에 연결하는 다음 과제로 AAP를 제안한다.  
> **작성 기준**: 고객에게 과도한 대형 플랫폼 구축을 요구하는 문서가 아니라, 통제 가능한 업무 단위에서 시작해 운영형 Agentic AI 체계로 확장하는 제안서다.

---

## Executive Message

많은 기업은 이미 데이터 플랫폼, 생성형 AI PoC, 챗봇, 문서 요약, 사내 검색 자동화를 경험했습니다. 그러나 실제 업무 운영에서는 여전히 사람이 정책을 해석하고, 예외를 판단하고, 승인하고, ERP·CRM·결재 시스템에 결과를 반영합니다.

**AAP(Agentic AI Platform)** 는 이 간극을 메우기 위한 기업용 Agentic AI 운영 체계입니다. 고객의 데이터·문서·업무 시스템을 대체하지 않고, 이를 업무 맥락으로 연결한 뒤, Agent가 판단 후보를 만들고, 정책에 따라 실행하거나 사람 검토로 넘기며, 결과와 피드백을 다시 업무 지식과 스킬로 축적합니다.

> **한 줄 정의**  
> Data Platform이 정보를 보게 했다면, AAP는 고객 업무를 통제 가능한 방식으로 판단·실행·검토하게 합니다.

---

## 01. 기업 AI 활용의 현재 위치

### 1. PoC 이후 정체
생성형 AI PoC는 가능성을 확인하는 데 성공했습니다. 다만 파일럿 이후 실제 업무 프로세스에 붙어서 반복적으로 쓰이는 운영형 사례는 제한적입니다.

### 2. 단일 업무 자동화에 머묾
챗봇, 문서 요약, 사내 검색, RPA 보조는 개별 생산성을 높입니다. 그러나 업무 흐름 전체를 이해하고, 다음 단계의 판단과 실행까지 연결하지는 못합니다.

### 3. 사람 손이 계속 필요
AI가 답변과 초안을 만들더라도 정책 판단, 승인, 예외 처리, 시스템 입력은 사람이 담당합니다. AI와 업무 시스템 사이의 마지막 공백이 여전히 사람에게 남아 있습니다.

> **AAP의 출발점은 모든 업무의 완전 자동화가 아닙니다.**  
> AI가 처리할 수 있는 판단·실행 영역과 사람이 검토해야 하는 영역을 구분하고, 이를 고객의 업무 시스템과 통제 체계 안에서 안전하게 운영하는 구조를 만드는 것입니다.

---

## 02. 운영까지 가지 못하는 4가지 빈틈

AI PoC가 운영으로 이어지지 못하는 이유는 단일 기술 부족이 아니라, 운영에 필요한 네 가지 기반이 함께 갖춰지지 않았기 때문입니다.

| 빈틈 | 현재 문제 | AAP의 대응 |
|---|---|---|
| **① 맥락** | 문서 검색은 가능하지만 정책·프로세스·권한·예외 기준까지 이해하지 못함 | 업무 개념, 정책, 권한, 판단 기준을 Business Semantic으로 구조화 |
| **② 실행** | AI 답변이 ERP, CRM, SCM, 그룹웨어, 결재 시스템의 실제 처리로 이어지지 않음 | Workflow, API, RPA, Writeback을 통해 승인된 결과를 업무 시스템에 반영 |
| **③ 통제** | 근거, 승인, 감사, 사람 검토 기준이 모호함 | HITL, Action Policy, Audit, Explainability로 실행 경계를 설정 |
| **④ 학습** | 실패·예외·검토 이력이 다시 업무 지식과 스킬로 쌓이지 않음 | Decision Log, Feedback, Evaluation, Skill Registry로 운영 개선 루프 구축 |

---

## 03. 왜 지금 AAP인가

AAP는 기존 Data Platform이나 AI PoC를 대체하지 않습니다. 이미 갖춰진 데이터·문서·시스템 자산 위에 **업무 맥락, Agent 판단, 시스템 실행, 운영 통제, 학습 개선**을 연결하는 실행 계층을 더합니다.

### 3.1 Data Platform 이후
데이터 플랫폼은 수집·분석·시각화 기반을 마련했습니다. 그러나 정책 판단, 승인, 예외 처리, 시스템 반영은 여전히 별도 업무 절차와 사람의 손에 의존합니다.

### 3.2 PoC 이후
생성형 AI PoC는 답변과 요약의 가능성을 보여주었습니다. 이제는 단일 기능 검증을 넘어, 업무 맥락과 시스템 실행, 검토 체계, 운영 학습이 결합된 구조가 필요합니다.

### 3.3 Agentic AI 흐름
LLM과 Agent Framework는 답변 생성에서 계획, 도구 호출, 실행 보조로 확장되고 있습니다. 기업 환경에서는 이 능력을 안전하게 운영할 통제형 구조가 필요합니다.

---

## 04. AAP 정의와 MECE 원칙

### 4.1 AAP 정의

> **AAP는 고객의 데이터, 문서, 시스템을 업무 맥락으로 연결하고, Agent가 판단 후보 생성·도구 호출·실행 보조·사람 검토 연계를 안전하게 수행하도록 만드는 기업용 Agentic AI 운영 체계입니다.**

### 4.2 AAP를 설명하는 5가지 구성 원칙

AAP는 다음 다섯 구성요소로 설명할 때 가장 MECE에 가깝습니다.

| 구성요소 | 질문 | 역할 |
|---|---|---|
| **Customer Environment** | 무엇을 연결하는가? | 고객의 데이터 플랫폼, 업무 시스템, 문서/KMS, 내부 API를 연결 |
| **Service Experience** | 누가 어떻게 사용하는가? | 현업 사용자, 검토자, 승인자, 운영자가 Agent와 상호작용 |
| **Execution Loop** | 업무가 어떻게 처리되는가? | 입력 연결 → 의미화 → 판단/계획 → 실행 → 운영 학습 |
| **Control Plane** | 무엇을 허용하고 막는가? | 권한, 위험도, HITL, 감사, 설명성, 비용/품질 통제 |
| **Trust Foundation** | 어떤 기반에서 안전하게 운영되는가? | IAM, 보안, 폐쇄망, 관측, 거버넌스, 데이터 경계 |

### 4.3 기존 접근과의 차이

| 구분 | Data Platform | 개인 AI Tool | 단순 RAG | **AAP** |
|---|---|---|---|---|
| 목적 | 데이터 수집·분석·시각화 | 답변·요약·초안 작성 | 문서 검색과 근거 제시 | **업무 판단·실행·검토·학습** |
| 핵심 단위 | 데이터셋, 파이프라인, 대시보드 | 프롬프트, 대화, 문서 | 질문, 문서, 검색 결과 | **업무 사건, 정책, 권한, 도구, 실행 로그** |
| 결과 | 리포트와 인사이트 | 사용자가 다듬는 텍스트 | 문서 근거 답변 | **Workflow, API/RPA 실행, 시스템 반영, 감사 가능한 이력** |
| 운영성 | 이후 판단·처리는 사람 몫 | 개인 생산성 향상 중심 | 검색 품질 중심 | **업무 기준에 따라 자동·검토·보류 경로를 분기** |

---

## 05. 통합 아키텍처와 수행 모델

> 이 장은 고객용과 내부용 문서에서 동일한 코어 구조로 사용한다. 고객에게는 운영 가능성과 안전성을 설명하고, 내부에는 사업화·수행·파트너 전략의 기준점으로 사용한다.

### 5.1 Architecture Overview

AAP는 고객이 보유한 데이터·문서·시스템을 대체하지 않고, 기존 자산을 실행 구조에 연결합니다. 그 위에 업무 의미화, Agent 판단, 시스템 실행, 운영 학습, 보안·통제를 결합해 실제 운영 가능한 Enterprise Agentic AI 운영 모델로 전환합니다.

```text
┌────────────────────────────────────────────────────────────────────┐
│                        Service Experience                          │
│  AI Agent Portal · Business Agents · Review/Approval · Ops Report   │
└────────────────────────────────────────────────────────────────────┘
                                 ▲
                                 │ 업무 요청 · 검토 · 승인 · 결과 확인
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                         AAP Execution Loop                          │
│  Enterprise Data & Inputs → Business Semantic → Agentic Reasoning   │
│        → Enterprise Integration & Action → Operational Learning      │
└────────────────────────────────────────────────────────────────────┘
                                 ▲
                                 │ 정책 · 권한 · 위험도 · 품질 · 감사 기준
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                         AAP Control Plane                           │
│  HITL & Action Policy · Evaluation · Audit · Guardrails · Cost Ctrl  │
└────────────────────────────────────────────────────────────────────┘
                                 ▲
                                 │ 연결 · 호출 · 반영 · 이력 수집
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                       Customer Environment                          │
│  Data Platform · ERP/CRM/SCM · Groupware/Approval · Document/KMS     │
└────────────────────────────────────────────────────────────────────┘

                         Trust Foundation
        IAM/SSO · RBAC/ABAC · Security · Observability · Private/Closed
```

### 5.2 MECE Layer Map

| Layer | MECE 역할 | 핵심 질문 |
|---|---|---|
| **Customer Environment** | 고객 기존 자산 영역 | 어떤 데이터·문서·시스템을 연결할 것인가? |
| **Service Experience** | 사용자 접점 영역 | 누가 Agent를 실행하고 결과를 검토할 것인가? |
| **Enterprise Data & Inputs** | 입력 연결·정제 영역 | 어떤 정보를 업무 판단에 쓸 수 있게 만들 것인가? |
| **Business Semantic Modeling** | 업무 의미화 영역 | 정책·절차·권한·예외를 Agent가 이해 가능한 구조로 만들었는가? |
| **Agentic Reasoning** | 판단·계획 영역 | 어떤 업무 단계를 계획하고 어떤 도구를 호출할 것인가? |
| **Enterprise Integration & Action** | 실행·반영 영역 | 승인된 결과를 어떤 시스템에 어떻게 반영할 것인가? |
| **Operational Learning** | 운영 개선 영역 | 실행 이력과 피드백을 어떻게 재사용 자산으로 만들 것인가? |
| **Control Plane / Trust Foundation** | 통제·보안 공통 영역 | 무엇을 허용·차단·감사·검토할 것인가? |

### 5.3 Capability Map · 대표 Capability와 확장 컴포넌트

> 아래 3개 박스는 각 레이어의 전체 구성요소가 아니라, 고객 논의를 시작하기 위한 대표 Capability입니다. 실제 구축 시 각 Capability는 Connector, Runtime, Policy, Log, Monitoring, Security 등 세부 컴포넌트로 확장됩니다.

#### Customer Environment
| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| Data Platform / Analytics Assets | 기존 분석 자산을 업무 판단 입력으로 활용 | Lakehouse, Warehouse, BI, Catalog, Feature/Metric Store |
| Business Systems | ERP·CRM·SCM·결재·그룹웨어 등 업무 시스템 연결 | Internal API, EAI, Approval, Legacy, Transaction System |
| Document / Knowledge Assets | 규정·매뉴얼·FAQ·KMS 등 문서 지식 활용 | KMS, ECM, File Storage, FAQ, Policy Docs |

#### Service Experience
| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| AI Agent Portal | 업무별 Agent 실행과 이력 확인 | Agent Search, Launch, Session, History |
| Business Agents | 공통 업무 + 산업/직무 특화 Agent 제공 | Horizontal Agent, Vertical Agent, Role Agent |
| Review / Approval Workspace | 검토·승인·반려·예외 처리 | HITL Console, Evidence View, Approval Queue, Audit View |

#### Enterprise Data & Inputs
| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| System & Data Connectors | 기간계·DB·API·파일 연결 | REST/SOAP, DB Connector, File/SFTP, Event Bus |
| Document / Knowledge Ingestion | 문서·규정을 검색 가능한 지식으로 변환 | OCR, Parser, Chunking, Embedding, Vector Index, Metadata |
| Operational Data Integration | 운영 로그·이벤트·외부 데이터 연결 | Log Pipeline, Stream, External API, Data Quality, Lineage |

#### Business Semantic Modeling
| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| **Business Concept Model** | 업무 용어·개념·관계 표준화 | Domain Ontology, Taxonomy, Knowledge Graph, Dictionary |
| **Process & Decision Rule Model** | 절차·판단 규칙·예외 조건 구조화 | BPMN, DMN, Rule Repository, Exception Taxonomy |
| **Authority & Policy Model** | 권한·승인 기준·자동/수동 경계 정의 | RBAC, ABAC, Approval Matrix, Policy Pack, Delegation Rule |

#### Agentic Reasoning
| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| Planning & Orchestration | 업무를 단계로 나누고 실행 흐름 조율 | Planner, Supervisor, Multi-Agent, State Machine |
| Tool Calling Runtime | Agent가 호출할 도구·API 관리 | Tool Registry, MCP, OpenAPI, Function Calling, Credential Scope |
| HITL & Action Policy | 위험도·확신도에 따라 자동/검토/보류 분기 | Risk Scoring, Confidence Threshold, Escalation, Guardrail Hook |

#### Enterprise Integration & Action
| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| Workflow & Approval Execution | 승인·예외·재처리 흐름 실행 | Workflow Engine, Approval Queue, RPA, Case Management |
| System Writeback | 처리 결과를 업무 시스템에 반영 | API Gateway, EAI, ERP/CRM Update, Groupware/Approval Writeback |
| Exception & Transaction Control | 실패·재시도·취소·롤백·수동 전환 | Retry, Rollback, Compensation, Manual Override, Failure Queue |

#### Operational Learning
| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| **Decision / Action Logging** | 판단 근거·도구 호출·실행 결과 저장 | Trace, Prompt/Response Log, Tool Log, Evidence Link |
| **Evaluation & Feedback Loop** | 품질·정책 위반·사용자 피드백 평가 | Feedback Store, Eval Dataset, Regression Test, Drift Monitoring |
| **Reusable Skill & Improvement** | 검증된 업무 패턴을 스킬로 재사용 | Skill Registry, Versioning, Improvement Backlog, Release Gate |

#### Control Plane / Trust Foundation
| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| Identity & Access Control | 사용자·조직·역할·권한 관리 | IAM, SSO, RBAC, ABAC, Tenant Boundary |
| Audit & Explainability | 근거·출처·실행 이력을 감사 가능하게 저장 | Audit Trail, Lineage, Evidence, Decision Reason |
| Security Guardrails & Private Deployment | 민감정보·위험 실행·폐쇄망 요건 관리 | PII Protection, Data Boundary, Model Policy, Closed/Private, Monitoring |

### 5.4 Capability-to-Technology Bridge

| Layer | 고객에게 보이는 가치 | 대표 구현 후보 |
|---|---|---|
| Enterprise Data & Inputs | 고객 자산을 업무 판단에 쓸 수 있게 연결 | API/DB/File Connector, OCR/Parser, RAG Pipeline, Vector Store, Event Bus |
| Business Semantic Modeling | 업무 의미·정책·권한을 Agent가 이해 가능한 구조로 전환 | Knowledge Graph, Ontology, Taxonomy, BPMN, DMN, Rule Repository |
| Agentic Reasoning | 판단·계획·도구 호출을 통제된 흐름으로 수행 | LangGraph, Semantic Kernel, AutoGen, MCP, OpenAPI, Tool Registry |
| Enterprise Integration & Action | 승인된 결과를 실제 업무 시스템에 안전하게 반영 | Workflow Engine, API Gateway, RPA, EAI, Retry/Rollback |
| Operational Learning | 실행 이력과 피드백을 개선 후보와 재사용 스킬로 축적 | Decision Log, EvalOps, Feedback Store, Skill Registry, Version Control |
| Control Plane / Trust Foundation | 보안·감사·HITL·폐쇄망 요구를 충족 | IAM/SSO, RBAC/ABAC, Audit Trail, Guardrails, Observability, Private Deployment |

### 5.5 Delivery Model · Define → Compose → Connect → Operate

| 단계 | 목적 | 주요 활동 | 연계 아키텍처 |
|---|---|---|---|
| **01. Define** | 맡길 업무와 사람 검토 경계 정의 | 대상 업무, 판단 기준, 예외 조건, 권한, KPI 합의 | Business Semantic, Control Plane |
| **02. Compose** | AI·자동화·보안 자산 조합 | 모델, 검색, Agent Framework, Workflow, RPA, 보안 도구 조합 | Agentic Reasoning, Integration, Trust |
| **03. Connect** | 고객 환경 연계 | Data Platform, ERP/CRM/SCM, KMS, 내부 API, IAM 연결 | Customer Environment, Data & Inputs |
| **04. Operate** | 운영·학습 체계화 | HITL, Decision Log, Evaluation, Feedback, Skill 개선, 운영 리포트 | Operational Learning, Control Plane |

---

## 06. 대표 시나리오 · 단순 RAG와 AAP의 차이

### 손해사정 심사 예시

**단순 RAG**  
“약관상 보상 제외 항목이 있는지 찾아줘”라고 물으면 보험 약관과 판례 문서를 찾아 요약합니다.

**AAP**
1. **사건 정리** · 청구서, 진단서, 계약, 과거 지급 이력을 하나의 사건 단위로 묶습니다.
2. **심사 판단** · 보장 범위, 면책 조건, 중복 청구, 이상 징후를 룰과 근거 문서로 검토합니다.
3. **업무 처리** · 자동 승인, 추가 서류 요청, 조사 배정, 지급 보류 중 기준에 맞는 경로로 처리합니다.
4. **운영 학습** · 판단 근거, 사람 검토 결과, 예외 처리 이력을 다음 심사 기준과 스킬 개선 후보로 남깁니다.

---

## 07. 적용 레퍼런스

### Case 1. AI 투자 메이트

| 항목 | 내용 |
|---|---|
| 도메인 | 자산운용 · 투자 의사결정 |
| 검증 영역 | 외부 데이터 통합, 멀티에이전트 분석, 자문 생성, 서비스화 가능성 |
| AAP 매핑 | Enterprise Data & Inputs, Agentic Reasoning, Service Experience |
| 고객 신뢰 포인트 | 외부 데이터와 멀티에이전트 분석 흐름을 업무 서비스로 구성할 수 있음을 검증 |
| 보완 시 확장 | 투자 정책·권한·감사·HITL·Decision Log를 더하면 금융 자문형 AAP Pack으로 확장 가능 |

### Case 2. 산업단체/협회 온톨로지 PoC

| 항목 | 내용 |
|---|---|
| 도메인 | 공공·협회 · 산업 영향도 분석 |
| 검증 영역 | 산업 도메인 온톨로지, 회원사 영향도 판단, 차등 통보 시나리오 |
| AAP 매핑 | Business Semantic Modeling, Enterprise Data & Inputs, 일부 Action 시나리오 |
| 고객 신뢰 포인트 | 단순 문서 검색이 아니라 도메인 지식과 고객별 맥락을 연결해 영향도를 판단할 수 있음을 검증 |
| 보완 시 확장 | 통보 Workflow, 승인, 실행 로그, 피드백 루프를 더하면 공공/협회용 AAP Pack으로 확장 가능 |

---

## 08. 산업별 적용 예시

| 산업 | 적용 업무 | 핵심 가치 |
|---|---|---|
| 금융/보험 | 내부통제, 손해사정, 투자 자문, 규정 검토 | 판단 근거, 감사, 승인, 폐쇄망 요구 충족 |
| 공공/협회 | 정책 영향도 분석, 회원사 통보, 민원/질의 대응 | 도메인 지식 구조화, 차등 대응, 업무 이력 축적 |
| 제조/유통 | 수요·공급 이슈 대응, 품질 클레임, 구매/계약 검토 | 운영 데이터와 업무 시스템 반영 연결 |
| 통신/서비스 | VOC, 장애 대응, 고객 케어, 내부 지식 검색 | 실시간 대응, 상담/운영 지식 자산화 |
| 국방/보안 | 폐쇄망 지식 검색, 절차 검토, 승인형 업무 지원 | 보안·권한·감사 중심의 통제형 AI 운영 |

---

## 09. 고객 유형별 진입 패턴

### Type A. 대기업 / 자체 AI 조직 보유
- **상황**: Data Platform과 AI 조직은 있으나 운영 전환과 실제 업무 실행이 병목
- **제안 메시지**: 기존 플랫폼 위에 업무 실행형 Agentic Layer를 얹어 운영 전환 속도를 높임
- **강조점**: Business Semantic, Writeback, Operational Learning

### Type B. 산업 특화 중견 / 전문 조직
- **상황**: AI 조직은 크지 않지만 반복 업무, 문서, 승인, 예외 처리 니즈가 명확
- **제안 메시지**: 작은 업무 단위부터 통제형 Agentic AI Pilot으로 시작
- **강조점**: Vertical Agent, 업무 의미화, 빠른 Pilot

### Type C. 공공·금융·국방 등 규제/폐쇄망 고객
- **상황**: 보안, 감사, 망분리, 승인 체계가 도입 가능 여부를 결정
- **제안 메시지**: 폐쇄망·권한·감사·HITL을 포함한 통제형 AAP로 접근
- **강조점**: Control Plane, Trust Foundation, Private/Closed Deployment

---

## 10. 후속 논의 방향

고객과의 다음 논의는 전사 플랫폼 구축이 아니라, **통제 가능한 업무 단위 Pilot을 설계하는 것**에서 시작합니다.

1. 대상 업무 후보 선정
2. 업무 기준·정책·권한·예외 조건 정리
3. 고객 시스템·데이터·문서 자산 연결 가능성 진단
4. Agent 실행 흐름과 HITL 경계 설계
5. 통제형 Pilot 범위와 성공 기준 정의
6. 운영 이력·평가·피드백 루프 설계

---

## Appendix. 기술 상세는 별도 Capability Candidate Map으로 확장

본 문서의 Architecture 장은 고객 논의용 핵심 구조입니다. 실제 구축 검토 시에는 각 Capability별 기술 후보, 솔루션/파트너 후보, 보안·망분리·운영 요구사항을 별도 상세 문서로 확장합니다.
