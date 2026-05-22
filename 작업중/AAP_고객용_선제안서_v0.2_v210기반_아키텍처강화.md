# Agentic AI Platform(AAP) 고객용 선제안서 v0.2

> **기준 방향**: `aap_proactive_offering_v210_260521.html`의 형식·목차·스토리라인을 유지하고, `v220`에서 유효했던 **Layer × 대표 Capability × 확장 컴포넌트** 구조만 04장 아키텍처에 반영한 고객 선제안용 문서 초안입니다.  
> **작성 목적**: 공통 고객을 대상으로 Data Platform 이후의 다음 과제로 AAP를 소개하고, 실제 업무 운영으로 전환 가능한 Agentic AI 구조를 설명하기 위한 자료입니다.  
> **삭제 반영**: 기존 `후속 논의 방향` 장은 본 문서에서 제외했습니다. 고객 미팅 이후 액션은 별도 제안/워크숍 문서에서 다룹니다.

---

## 목차

1. 기업 AI 활용의 현재 위치
2. 운영까지 가지 못하는 4가지 빈틈
3. 왜 지금 AAP가 필요한가
4. 통합 아키텍처와 수행 모델
5. 적용 레퍼런스
6. 산업별 적용 예시
7. 고객 유형별 진입 패턴

---

## 01. 기업 AI 활용의 현재 위치

많은 기업이 생성형 AI PoC, 챗봇, 문서 요약, 검색 자동화까지는 이미 경험했습니다. 이제 남은 과제는 AI를 단일 기능이 아니라 **권한·승인·예외 처리·시스템 반영까지 포함하는 실제 업무 운영 체계 안에 안착시키는 일**입니다.

### ① PoC 이후 정체 · 가능성은 확인했지만, 실제 운영까지는 가지 못함

생성형 AI PoC는 데모와 파일럿 단계에서 충분한 가능성을 보여주었습니다. 다만 실제 업무 프로세스에 붙어서 꾸준히 쓰이는 사례는 아직 많지 않습니다.

### ② 단일 업무 자동화 · 챗봇·요약·검색 등 개별 업무 단위에 머묾

FAQ 챗봇, 문서 요약, 사내 검색, RPA 보조 등은 개별 업무의 생산성을 높여 주고 있습니다. 다만 업무 흐름 전체를 이해하고 다음 단계까지 이어서 처리하는 수준으로는 확장되지 못하고 있습니다.

### ③ 사람 손이 계속 필요 · 판단·승인·실행은 여전히 사람이 담당

AI가 답변과 초안을 만들어도 정책 판단, 예외 처리, 승인, 시스템 입력은 여전히 현업과 IT가 담당합니다. 결국 AI와 업무 시스템 사이에 남은 한 단계를 사람이 채우는 모양이 됩니다.

> **AAP의 출발점은 모든 업무를 AI로 자동화하는 것이 아닙니다.** AI가 처리할 수 있는 판단·실행 영역과 사람이 검토해야 하는 영역을 구분하고, 이를 **고객의 업무 시스템과 통제 체계 안에서 안전하게 운영하는 구조**를 만드는 데 있습니다.

---

## 02. 운영까지 가지 못하는 4가지 빈틈

AI PoC가 운영으로 이어지지 못한 이유는 기술이 부족해서만이 아닙니다. 실제 업무에 적용되려면 필요한 **맥락·실행·통제·학습 기반**이 함께 갖춰져야 하는데, 이 부분이 비어 있기 때문입니다.

| 빈틈 | 고객 현상 | AAP에서 연결되는 영역 |
|---|---|---|
| **① 맥락** | 문서를 검색하고 답변하는 것은 가능하지만, 고객사의 정책·프로세스·권한·예외 기준까지는 이해하지 못함 | **Business Semantic Modeling** |
| **② 실행** | AI의 답변이나 추천이 ERP, CRM, SCM, 그룹웨어, 결재 시스템에서 실제 업무 처리로 이어지지 않음 | **Enterprise Integration & Action** |
| **③ 통제** | 어떤 근거로 판단했는지, 언제 사람이 검토해야 하는지, 어떤 실행을 막아야 하는지에 대한 기준이 충분히 정리되어 있지 않음 | **Trust · Security · Governance / HITL** |
| **④ 학습** | 판단 근거·실행 결과·실패·예외 처리·사람 검토 이력이 업무 지식이나 Agent 스킬로 다시 쌓이는 구조가 없음 | **Operational Learning** |

> 이 네 가지 빈틈은 개별 AI 기능을 추가하는 방식만으로는 해결되기 어렵습니다. 업무 의미를 정리하고, Agent 실행 흐름을 설계하며, 시스템 반영과 운영 통제를 함께 묶어야 AI가 실제 업무 운영으로 이어질 수 있습니다.

---

## 03. 왜 지금 AAP가 필요한가

AAP는 기존 데이터 플랫폼이나 AI PoC를 대체하는 것이 아닙니다. 이미 갖춰진 데이터·AI 자산 위에 **업무 맥락, 실행, 통제, 학습을 이어주는 Agentic Layer**를 한 겹 더하는 접근입니다.

### 3-1. 지금 필요한 세 가지 이유

| 흐름 | 의미 |
|---|---|
| **Data Platform 이후** | 데이터 플랫폼은 수집·분석·시각화의 토대를 마련했습니다. 다만 정책 판단, 승인, 예외 처리, 시스템 반영은 여전히 별도의 업무 절차와 사람의 손에 의존하고 있습니다. |
| **PoC 이후** | 생성형 AI PoC로 가능성은 충분히 확인되었습니다. 이제는 단일 기능 검증을 넘어, 업무 맥락·시스템 실행·검토 체계·운영 학습이 한 자리에 모인 구조가 필요합니다. |
| **Agentic AI 흐름** | 최신 LLM과 Agent 프레임워크가 자리잡으면서 AI의 역할은 답변 생성에서 계획·도구 호출·실행 보조까지 넓어지고 있습니다. 기업 환경에서는 이를 안전하게 돌릴 수 있는 통제형 구조가 필요합니다. |

### 3-2. AAP 정의

> **AAP는 고객의 데이터·문서·시스템을 업무 맥락으로 연결하고, Agent가 판단·실행·검토 흐름을 안전하게 보조하도록 만드는 기업용 Agentic AI Platform입니다.**

조금 더 구체적으로 말하면, AAP는 Agent가 모든 업무를 임의로 처리하는 체계가 아닙니다. 고객의 업무 기준에 따라 **판단 후보를 만들고, 필요한 도구와 시스템을 호출하며, 위험하거나 예외적인 단계에서는 사람 검토로 연결하고, 승인된 결과를 업무 시스템에 반영하며, 그 이력을 다시 운영 자산으로 축적하는 구조**입니다.

### 3-3. 닫힌 루프 구조

```text
[Service Experience]  ← 고객이 경험하는 AI 업무 서비스

  Semantic  →  Agentic  →  Action  →  Learning
  의미 이해     판단·계획     시스템 반영    운영 학습
       ↑____________________________________________|
             운영 이력과 피드백이 다시 업무 의미와 스킬 개선 후보로 환류

[Trust Foundation]  ← 권한 · 감사 · HITL · 보안 · 폐쇄망
```

### 3-4. 기존 접근과의 차이

| 구분 | Data Platform | 개인 AI Tool | 단순 RAG | **AAP** |
|---|---|---|---|---|
| **목적** | 데이터 수집·분석·시각화 | 답변·요약·초안 작성 | 문서 검색과 근거 제시 | **업무 판단·실행·검토·학습 흐름 연결** |
| **핵심 단위** | 데이터셋, 파이프라인, 대시보드 | 프롬프트, 대화, 문서 | 질문, 문서, 검색 결과 | **업무 사건, 정책, 권한, 도구, 실행 로그** |
| **결과** | 리포트와 인사이트 | 사용자가 직접 다듬어 쓰는 텍스트 | 문서를 근거로 한 답변 | **Workflow, API/RPA 실행, 시스템 반영, 감사 가능한 이력** |
| **운영성** | 이후 판단·처리는 사람 몫 | 개인 생산성 향상 수준에 머묾 | 검색 품질에 초점 | **업무 기준에 따라 처리 경로를 나누고, 사람 검토가 필요한 지점을 표시** |

### 3-5. 왜 단순 RAG가 아닌가 · 손해사정 심사 시나리오

| 구분 | 단순 RAG | AAP |
|---|---|---|
| **요청** | “약관상 보상에서 제외되는 항목이 있는지 찾아줘.” | “이 청구 건을 업무 기준에 따라 심사하고 필요한 처리 경로를 제안해줘.” |
| **처리 방식** | 보험 약관과 판례 문서를 찾아 요약 | 청구서·진단서·계약·과거 지급 이력을 하나의 사건 단위로 묶음 |
| **판단 기준** | 문서에 있는 관련 조항 검색 | 보장 범위, 면책 조건, 중복 청구, 이상 징후를 룰과 근거 문서로 함께 검토 |
| **후속 처리** | 사용자가 직접 판단하고 시스템에 입력 | 자동 승인, 추가 서류 요청, 조사 배정, 지급 보류 등 처리 경로를 제안하고 이력을 남김 |

> RAG는 **문서를 잘 찾아 주는 방식**입니다. AAP는 사건·정책·권한·실행 경로를 함께 다루기 때문에, 전문 심사 업무의 판단과 후속 처리까지 실제 운영 흐름에 태울 수 있습니다.

---

## 04. 통합 아키텍처와 수행 모델

AAP는 고객이 이미 보유한 데이터·문서·시스템을 대체하지 않고, 기존 자산을 AAP 실행 구조에 연결합니다. 그 위에 업무 맥락 정리, Agent 판단, 시스템 반영, 운영 학습, 보안·통제를 단계적으로 결합해 **실제 운영 가능한 Enterprise Agentic AI 운영 모델**로 전환합니다.

본 장은 이 문서에서 가장 중요한 장입니다. 단순 개념 설명이 아니라, 고객·기술조직·사업담당자가 모두 같은 그림을 보도록 **AAP의 한판 아키텍처**를 제시합니다.

### 4-1. Architecture Overview · 한판 구조

```text
┌────────────────────────────────────────────────────────────────────┐
│  Service Experience                                                │
│  AI Agent Portal · Business Agents · Review/Approval · Ops Report  │
└────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ 업무 요청 · 검토 · 승인 · 결과 확인
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  AAP Execution Loop                                                │
│                                                                    │
│  Enterprise Data & Inputs                                          │
│      ↓                                                             │
│  Business Semantic Modeling  ★                                     │
│      ↓                                                             │
│  Agentic Reasoning                                                 │
│      ↓                                                             │
│  Enterprise Integration & Action                                   │
│      ↓                                                             │
│  Operational Learning        ★                                     │
│      └─────────────── feedback to Semantic / Agentic ───────────┐  │
└─────────────────────────────────────────────────────────────────│──┘
                                                                  │
┌─────────────────────────────────────────────────────────────────▼──┐
│  Customer Environment                                               │
│  Data Platform · ERP/CRM/SCM · Groupware/Approval · Document/KMS    │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│  Trust · Security · Governance                                      │
│  IAM/SSO · 권한 · 감사 · HITL · Guardrails · Private/Closed         │
│  ※ 전 영역에 적용되는 공통 기반                                     │
└────────────────────────────────────────────────────────────────────┘
```

#### Overview 해석

- **Customer Environment**는 고객이 이미 보유한 자산입니다. AAP는 이를 대체하지 않고 연결합니다.
- **AAP Execution Loop**는 업무 입력을 받아 의미화하고, Agent가 판단 후보와 실행 경로를 만들고, 승인된 결과를 시스템에 반영하며, 이력을 운영 자산으로 쌓는 핵심 루프입니다.
- **Service Experience**는 현업 사용자·검토자·승인자·운영자가 AAP를 실제로 사용하는 접점입니다.
- **Trust · Security · Governance**는 별도 부가 기능이 아니라, 모든 레이어에 적용되는 권한·감사·보안·통제 기준입니다.
- **Operational Learning**은 자동 학습을 의미하지 않습니다. 운영 이력과 피드백이 정책·스킬·지식 개선 후보로 쌓이고, 사람이 승인한 개선만 다음 운영에 반영되는 구조입니다.

### 4-2. MECE Layer Map

AAP 아키텍처는 다음 8개 Layer로 구분합니다. 각 Layer는 서로 중복되지 않는 역할을 가지며, 함께 연결될 때 실제 운영 가능한 Agentic AI 체계가 됩니다.

| Layer | MECE 역할 | 핵심 질문 |
|---|---|---|
| **Customer Environment** | 고객 기존 자산 영역 | 어떤 데이터·문서·시스템을 연결할 것인가? |
| **Service Experience** | 사용자 접점 영역 | 누가 Agent를 실행하고 결과를 검토할 것인가? |
| **Enterprise Data & Inputs** | 입력 연결·정제 영역 | 어떤 정보를 업무 판단에 쓸 수 있게 만들 것인가? |
| **Business Semantic Modeling** | 업무 의미화 영역 | 정책·절차·권한·예외를 Agent가 이해 가능한 구조로 만들었는가? |
| **Agentic Reasoning** | 판단·계획 영역 | 어떤 업무 단계를 계획하고 어떤 도구를 호출할 것인가? |
| **Enterprise Integration & Action** | 실행·반영 영역 | 승인된 결과를 어떤 시스템에 어떻게 반영할 것인가? |
| **Operational Learning** | 운영 개선 영역 | 실행 이력·피드백을 어떻게 재사용 자산으로 만들 것인가? |
| **Trust · Security · Governance** | 통제·보안 공통 영역 | 무엇을 허용·차단·감사·검토할 것인가? |

### 4-3. Layer × 대표 Capability × 확장 컴포넌트

아래 표의 각 Layer별 3개 항목은 전체 구성요소가 아니라, 고객 논의를 시작하기 위한 **대표 Capability**입니다. 실제 구축 시 각 Capability는 Connector, Runtime, Policy, Log, Monitoring, Security 등 세부 컴포넌트로 확장됩니다.

#### ① Customer Environment · 고객 보유 자산

| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| **Data Platform / Analytics Assets** | 기존 데이터·분석 자산을 업무 판단의 입력으로 활용 | Lakehouse, Warehouse, BI, Catalog, Metric Store, Feature Store |
| **Business Systems** | ERP·CRM·SCM·결재·그룹웨어 등 실제 업무 시스템과 연결 | ERP, CRM, SCM, Groupware, Approval, Internal API, EAI, Legacy |
| **Document / Knowledge Assets** | 사내 규정·매뉴얼·FAQ·KMS 등 문서 지식 자산을 활용 | KMS, ECM, File Storage, Policy Docs, Manual, FAQ |

#### ② Service Experience · 사용자 접점

| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| **AI Agent Portal** | 업무별 Agent를 찾아 실행하고, 실행 이력과 결과를 확인 | Agent Search, Launch, Session, Run History, User Workspace |
| **Business Agents** | 공통 업무 Agent와 산업·직무 특화 Agent 제공 | Horizontal Agent, Vertical Agent, Role Agent, Task Template |
| **Review / Approval Workspace** | 검토·승인·반려·예외 처리를 지원 | HITL Console, Evidence View, Approval Queue, Audit View, Comment Trail |

#### ③ Enterprise Data & Inputs · 고객 자산을 AAP 입력으로 변환

| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| **System & Data Connectors** | 기간계·DB·API·파일·분석 자산을 Agent 실행 흐름에 연결 | REST/SOAP, DB Connector, File/SFTP, Event Bus, Batch/Stream Connector |
| **Document / Knowledge Ingestion** | 문서·규정·FAQ를 검색 가능한 업무 지식으로 변환 | OCR, Parser, Chunking, Embedding, Vector Index, Metadata, Retrieval Policy |
| **Operational Data Integration** | 운영 로그·이벤트·외부 데이터를 업무 판단·학습 흐름에 연결 | Log Pipeline, Event Stream, External API, Data Quality, Lineage, PII Masking |

#### ④ Business Semantic Modeling · 업무 의미·정책·권한 구조화 ★

| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| **Business Concept Model** | 업무 용어·개념·관계를 표준화해 Agent가 같은 의미로 업무를 해석 | Domain Ontology, Taxonomy, Knowledge Graph, Business Dictionary, Entity/Relation Model |
| **Process & Decision Rule Design** | 업무 절차·판단 규칙·예외 조건을 실제 실행 기준으로 구조화 | BPMN, DMN, Rule Design, Exception Taxonomy, Rule Versioning, Scenario Map |
| **Authority & Policy Model** | 권한·승인 기준·자동/수동 처리 경계를 정의 | RBAC, ABAC, Approval Matrix, Policy Pack, Delegation Rule, Risk Policy |

> Business Semantic Modeling은 AAP의 핵심 차별화 영역입니다. 단순히 문서를 검색하는 것이 아니라, 고객 업무의 개념·절차·정책·권한·예외를 Agent가 사용할 수 있는 구조로 정리합니다.

#### ⑤ Agentic Reasoning · 판단·계획·도구 호출

| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| **Planning & Orchestration** | 업무를 여러 단계로 나누고 Agent 실행 흐름을 조율 | Planner, Supervisor, Multi-Agent, State Machine, Task Decomposition |
| **Tool Calling Runtime** | Agent가 호출할 도구·API를 등록·관리하고 권한 기준으로 통제 | Tool Registry, MCP, OpenAPI, Function Calling, Credential Scope, Tool Governance |
| **HITL & Action Policy** | 위험도·확신도에 따라 자동 처리·검토 요청·실행 보류 경로를 분기 | Risk Scoring, Confidence Threshold, Escalation, Guardrail Hook, Human Review Rule |

> Agentic Reasoning은 Agent가 임의로 모든 것을 처리한다는 의미가 아닙니다. 업무 기준, 권한, 위험도, 사람 검토 기준 안에서 판단 후보와 실행 경로를 만드는 계층입니다.

#### ⑥ Enterprise Integration & Action · 시스템 반영과 실행 안전장치

| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| **Workflow & Approval Execution** | 승인·예외·재처리 흐름을 업무 프로세스 엔진과 RPA·API 채널로 실행 | Workflow Engine, Approval Queue, RPA, Case Management, SLA Rule |
| **System Writeback Integration** | 승인된 결과를 ERP·CRM·그룹웨어·결재 등 실제 업무 시스템에 반영 | API Gateway, EAI, ERP/CRM Update, Groupware Writeback, Transaction API |
| **Exception & Transaction Control** | 실패·재시도·취소·롤백·수동 검토 전환 등 실행 안전장치를 관리 | Retry, Rollback, Compensation, Manual Override, Failure Queue, Pre-check |

> Enterprise Integration & Action은 답변형 AI와 실행형 AI의 가장 큰 차이를 만드는 영역입니다. 단, 실행은 항상 권한·승인·감사·예외 처리 기준과 함께 설계되어야 합니다.

#### ⑦ Operational Learning · 운영 이력과 개선 후보 축적 ★

| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| **Decision / Action Logging** | 판단 근거·도구 호출·실행 결과를 추적 가능한 이력으로 저장 | Trace, Prompt/Response Log, Tool Call Log, Evidence Link, Action Lineage |
| **Evaluation & Feedback Loop** | 실행 품질·사용자 피드백·정책 위반 여부를 주기적으로 평가 | Feedback Capture, Eval Dataset, Regression Test, Drift Monitoring, Policy Violation Check |
| **Reusable Skill Catalog** | 검증된 업무 패턴을 재사용 가능한 스킬로 관리하고 개선 후보를 축적 | Skill Registry, Versioning, Improvement Backlog, Release Gate, Skill Template |

> Operational Learning은 자동으로 모델을 마음대로 바꾸는 기능이 아닙니다. 운영 결과를 근거·평가·피드백·개선 후보로 남기고, 검토와 승인 절차를 거쳐 정책·스킬·지식 개선으로 이어지게 하는 운영 개선 루프입니다.

#### ⑧ Trust · Security · Governance · 전 영역 공통 기반

| 대표 Capability | 설명 | 확장 컴포넌트 |
|---|---|---|
| **Identity & Access Control** | 사용자·조직·역할·권한을 관리 | IAM, SSO, RBAC, ABAC, Tenant Boundary, MFA |
| **Audit & Explainability** | 판단 근거·참조 출처·실행 이력을 감사 가능한 형태로 저장 | Audit Trail, Lineage, Evidence Store, Decision Reason, Citation, Report View |
| **Security Guardrails & Private Deployment** | 민감정보 보호·위험 실행 차단·폐쇄망/Private 배포 요건 관리 | PII Protection, Data Boundary, Input/Output Filter, Model Usage Policy, Closed/Private, Monitoring |

> Trust · Security · Governance는 별도 부가 기능이 아니라 AAP 전체에 적용되는 운영 기준입니다. 특히 공공·금융·국방과 같은 규제·통제형 고객에서는 도입 가능 여부를 결정하는 핵심 조건입니다.

### 4-4. Capability-to-Technology Bridge · 본문 요약형

아래 표는 고객에게 보이는 가치와 실제 구현 후보를 연결하는 요약입니다. 특정 제품·스택 채택을 의미하지 않으며, 고객 환경과 RFP 요건에 따라 선택·조합됩니다.

| Layer | 고객에게 보이는 가치 | 대표 구현 후보 |
|---|---|---|
| **Enterprise Data & Inputs** | 고객 자산을 업무 판단에 쓸 수 있게 연결 | API/DB/File Connector, OCR/Parser, RAG Pipeline, Vector Store, Event Bus |
| **Business Semantic Modeling** | 업무 의미·정책·권한을 Agent가 이해 가능한 구조로 전환 | Knowledge Graph, Ontology, Taxonomy, BPMN, DMN, Rule Design |
| **Agentic Reasoning** | 판단·계획·도구 호출을 통제된 흐름으로 수행 | Agent Framework, MCP, OpenAPI, Function Calling, Tool Registry, State Store |
| **Enterprise Integration & Action** | 승인된 결과를 실제 업무 시스템에 안전하게 반영 | Workflow Engine, API Gateway, RPA, EAI, Retry/Rollback, Approval Queue |
| **Operational Learning** | 실행 이력·피드백을 개선 후보·재사용 스킬로 축적 | Decision Log, EvalOps, Feedback Capture, Skill Registry, Version Control |
| **Trust · Security · Governance** | 보안·감사·HITL·폐쇄망 요건 충족 | IAM/SSO, RBAC/ABAC, Audit Trail, Guardrails, Observability, Private Deployment |

### 4-5. Delivery Model · 정의하고, 조합하고, 연결하고, 운영으로 넘긴다

AAP 구축은 특정 모델 하나를 들이는 일이 아닙니다. 고객의 업무 기준, 기존 시스템, 그리고 검증된 AI·자동화 자산을 실제로 돌릴 수 있는 흐름으로 이어 주는 작업입니다.

| 단계 | 목적 | 주요 활동 | 연계 아키텍처 |
|---|---|---|---|
| **01. Define · 맡길 업무 정의** | 무엇을 자동 처리하고 어디서 사람이 검토할지 합의 | 대상 업무, 판단 기준, 권한, 예외 조건, KPI 정리 | Business Semantic Modeling · HITL & Action Policy |
| **02. Compose · 기술 자산 조합** | 검증된 AI·자동화 자산을 업무 목적에 맞게 조합 | 모델, 검색, 문서 처리, Agent Framework, Workflow/RPA, 보안 도구 조합 | Agentic Reasoning · Enterprise Integration |
| **03. Connect · 고객 환경 연계** | 고객 자산과 실행 경로를 AAP 흐름에 연결 | Data Platform, ERP/CRM/SCM, KMS, 내부 API, IAM 연결 | Customer Environment · Enterprise Data & Inputs |
| **04. Operate · 운영·학습 체계화** | 운영 전환에 필요한 통제 기준과 개선 흐름 설계 | HITL, Decision Log, Evaluation, Feedback, Skill Catalog, 운영 리포트 | Operational Learning · Trust · Governance |

> 수행의 기준은 단순히 구축을 끝내는 데 있지 않습니다. **업무 기준, 고객 자산, 실행 통제, 운영 학습이 하나의 흐름으로 맞물려 돌아가야** 비로소 AAP가 실제 운영 모델이 됩니다.

### 4-6. Appendix · Capability별 구현 기술·자산 후보

본 문서의 04장은 고객에게 한눈에 보여줄 수 있는 아키텍처 한판을 중심으로 구성했습니다. 실제 제안·견적·기술 검토 단계에서는 아래와 같은 항목을 별도 Appendix로 상세화할 수 있습니다.

| 구분 | 상세화 가능한 항목 |
|---|---|
| **Connector 상세** | API, DB, File, Event, Legacy, EAI 연계 방식 |
| **Document/RAG 상세** | OCR, Parser, Chunking, Embedding, Vector Index, Hybrid Retrieval |
| **Semantic 상세** | Ontology, Taxonomy, Knowledge Graph, BPMN, DMN, Rule Versioning |
| **Agent Runtime 상세** | Agent Framework, Tool Registry, MCP, OpenAPI, State Store, Credential Scope |
| **Action 상세** | Workflow, RPA, API Gateway, Approval Queue, Retry/Rollback, Manual Override |
| **Learning 상세** | Decision Log Schema, Feedback Capture, Eval Dataset, Regression Test, Skill Registry |
| **Trust 상세** | IAM/SSO, RBAC/ABAC, Audit Trail, PII Protection, Guardrails, Closed/Private Deployment |

---

## 05. 적용 레퍼런스

두 사례가 AAP 구조 안에서 어떤 영역을 이미 검증했는지, 그리고 어떤 부분을 더 채우면 같은 패턴을 반복해서 쓸 수 있는 패키지가 되는지 정리합니다.

### 5-1. AI 투자 메이트 · 내부 프로젝트

**도메인** · 자산운용 · 투자 의사결정

매크로·뉴스·블룸버그 데이터를 한곳에 모아 투자 자문을 만들어 주는 LangGraph 기반 멀티에이전트입니다. 데이터 수집 → 멀티에이전트 분석 → 자문 생성까지 처음부터 끝까지 검증한 사례입니다.

| 구분 | 내용 |
|---|---|
| **검증된 영역** | 외부 데이터 수집·통합, 멀티에이전트 분석, 자문 생성, Vertical Agent 형태의 서비스 가능성 |
| **AAP로 보완할 영역** | 투자 정책·룰·권한 체계 정리, 주문·기록 시스템 반영 경로, Decision Log·HITL·감사 체계 |
| **연결되는 Capability** | Enterprise Data & Inputs, Agentic Reasoning, Service Experience, Business Semantic Modeling, Operational Learning |

#### AAP 관점의 의미

이 사례는 AAP의 일부 축, 특히 **데이터 통합과 Agentic Reasoning**이 실제로 구성 가능함을 보여줍니다. 여기에 Business Semantic Modeling, Enterprise Integration & Action, Operational Learning을 더하면 자문형 업무를 운영 체계로 확장할 수 있습니다.

### 5-2. 산업단체 온톨로지 PoC · 선제안 1차 완료

**도메인** · 공공·협회 · 기계산업

국제 정세·통상 규제·환율 변화를 기계산업 도메인 온톨로지로 정리해 회원사별 영향을 분석·통보하는 의사결정 자동화 사례입니다.

| 구분 | 내용 |
|---|---|
| **검증된 영역** | 산업 도메인 개념 구조화, 품목·회원사·규제 관계 모델링, 영향도 판단 룰 설계 |
| **AAP로 보완할 영역** | 외부 데이터 자동 수집, Agentic Reasoning, 회원사 통보·리포팅 Workflow, 감사·보안·운영 로그 |
| **연결되는 Capability** | Business Semantic Modeling, Enterprise Data & Inputs, Enterprise Integration & Action, Trust · Governance |

#### AAP 관점의 의미

이 사례는 AAP의 핵심 차별화 영역인 **Business Semantic Modeling**이 실제 산업 도메인에서 작동할 수 있음을 보여줍니다. 여기에 데이터 수집, Agent 실행, 통보 Workflow, 운영 학습을 결합하면 공공·협회형 AAP Pack으로 확장할 수 있습니다.

### 5-3. 두 레퍼런스가 함께 보여주는 것

| 축 | AI 투자 메이트 | 산업단체 온톨로지 PoC | AAP 통합 시 의미 |
|---|---|---|---|
| **Data & Inputs** | 외부 데이터 통합 검증 | 외부 데이터 연계 필요 | 고객·외부 데이터 연결 구조 표준화 |
| **Semantic** | 투자 정책·룰 구조화 필요 | 산업 도메인 온톨로지 검증 | 업무 의미화 방법론 확보 |
| **Agentic** | 멀티에이전트 분석 검증 | Agentic 자동화 필요 | 판단·계획 구조 결합 가능 |
| **Action** | 주문·기록 반영 필요 | 회원사 통보 Workflow 필요 | 실행·Writeback 구조 확장 |
| **Learning / Trust** | Decision Log·감사 필요 | 감사·보안·운영 로그 필요 | 운영형 AAP로 전환하기 위한 공통 기반 |

> 두 사례는 각각 다른 축을 검증했습니다. AAP는 이 조각들을 하나의 통합 구조로 일반화해, 다른 고객·산업에 재적용 가능한 오퍼링으로 만드는 접근입니다.

---

## 06. 산업별 적용 예시

AAP는 특정 산업 하나에 한정된 솔루션이 아닙니다. 다만 초기 적용은 **정책·권한·예외·시스템 반영·감사 이력**이 중요한 업무에서 시작하는 것이 적합합니다.

### 6-1. 금융·보험·자산운용

| 항목 | 내용 |
|---|---|
| **고객 상황** | 규정·승인·감사 요구가 높고, 반복 심사·검토·자문 업무가 많음 |
| **적용 업무** | 손해사정 심사, 내부통제, 투자 자문 보조, 리스크 검토 |
| **AAP로 달라지는 점** | 약관·규정·계약·거래 이력을 사건 단위로 묶고, 판단 후보와 처리 경로를 제안하며, 승인·감사 이력을 남김 |
| **초기 Pilot 후보** | 손해사정 보조 Agent, 내부통제 검토 Agent, 투자 리서치 보조 Agent |

### 6-2. 공공·협회·산업단체

| 항목 | 내용 |
|---|---|
| **고객 상황** | 정책·규제·회원사·산업 데이터가 복잡하고, 영향도 분석과 통보 업무가 반복됨 |
| **적용 업무** | 정책 영향도 분석, 회원사 차등 통보, 민원·질의 대응, 규제 변화 리포트 |
| **AAP로 달라지는 점** | 산업 개념·품목·회원사 관계를 구조화하고, 회원사별 영향도와 대응 메시지를 다르게 제안 |
| **초기 Pilot 후보** | 통상규제 영향도 분석 Agent, 회원사 공지 자동화 보조 Agent |

### 6-3. 제조·유통

| 항목 | 내용 |
|---|---|
| **고객 상황** | 품질·구매·계약·클레임·공급망 리스크 대응에 반복 판단이 많음 |
| **적용 업무** | 품질 클레임 검토, 구매·계약 조건 검토, 공급 리스크 대응, 작업 지시 후보 생성 |
| **AAP로 달라지는 점** | 규정·계약·이력 데이터를 함께 검토해 처리 경로를 제안하고, 담당자 검토 후 시스템 반영 |
| **초기 Pilot 후보** | 품질 클레임 처리 보조 Agent, 계약 검토 Agent |

### 6-4. 국방·보안·폐쇄망 고객

| 항목 | 내용 |
|---|---|
| **고객 상황** | 폐쇄망·권한·감사·데이터 반출 제한이 도입 가능 여부를 결정 |
| **적용 업무** | 폐쇄망 지식 검색, 절차 검토, 승인형 업무 지원, 보안 정책 질의 응답 |
| **AAP로 달라지는 점** | Private/Closed 환경에서 권한·감사·HITL 기준을 반영해 통제형 Agent를 운영 |
| **초기 Pilot 후보** | 폐쇄망 업무 지식 Agent, 보안 절차 검토 Agent |

---

## 07. 고객 유형별 진입 패턴

공통 AAP 구조는 유지하되, 고객의 AI 성숙도와 통제 요구 수준에 따라 제안 메시지를 다르게 가져갑니다.

### Type A. 대기업 / 자체 AI 조직 보유

| 항목 | 내용 |
|---|---|
| **상황** | 이미 Data Platform과 AI 조직이 있으나, 운영 전환과 실제 업무 실행이 병목 |
| **제안 메시지** | 기존 플랫폼 위에 **업무 판단·실행·검토를 연결하는 Agentic Layer**를 얹어 속도와 안정성을 높임 |
| **강조점** | 기존 자산 보완, 시스템 반영, 운영 학습, 내부 AI 조직과의 협업 |
| **적합한 시작점** | 기존 데이터·AI 자산을 활용한 업무 Agent Portal, 승인형 업무 자동화 보조 |

### Type B. 산업 특화 중견

| 항목 | 내용 |
|---|---|
| **상황** | AI 조직은 크지 않지만, 반복 업무·문서·승인·예외 처리 니즈가 명확 |
| **제안 메시지** | 업무와 시스템에 맞춘 구축형 AAP로 작은 영역부터 시작 |
| **강조점** | Vertical Agent, Business Semantic, 운영형 Pilot |
| **적합한 시작점** | 반복 판단·문서·승인 업무 중심의 제한된 업무 Pilot |

### Type C. 공공·금융·국방 등 규제·통제형 고객

| 항목 | 내용 |
|---|---|
| **상황** | 보안·감사·망분리·승인 체계가 도입 가능 여부를 결정 |
| **제안 메시지** | 권한·감사·HITL·폐쇄망 요건을 반영한 통제형 AAP로 접근 |
| **강조점** | Trust Foundation, Private/Closed Deployment, HITL, Audit Trail |
| **적합한 시작점** | 폐쇄망 지식 검색, 규정 검토, 승인형 업무 지원, 감사 가능 업무 Agent |

---

## 별첨. 내부 전략 보고용 문서로 확장할 때의 전환 방향

본 고객용 선제안서는 v210 기반의 외부 커뮤니케이션 문서입니다. 이후 내부 전략 보고용 문서를 별도로 고도화할 때는 본 문서의 04장 아키텍처를 공통 코어로 사용하고, 다음 항목을 추가해야 합니다.

| 내부 전략 문서 보강 항목 | 포함 내용 |
|---|---|
| **사업 기회와 1차 타겟** | 산업별 우선순위, 고객군, 첫 적용 업무, 매출 가능성 |
| **오퍼링 패키지화** | Assessment, Controlled Pilot, Build, Operate & Improve 단계별 산출물과 과금 구조 |
| **R&R** | 사업개발, 영업, 수행총괄, 기술조직, 보안/컴플라이언스, 파트너 역할 |
| **비용·견적 구조** | 인력 투입, 파트너 비용, 솔루션 비용, 운영 비용, Pilot/본구축 견적 기준 |
| **Build / Bring / Borrow** | kt ds 직접 책임 영역, 솔루션 조합 영역, 파트너 활용 영역 |
| **Action Plan** | 3개월·6개월 실행 로드맵, 고객 접촉 계획, 데모/제안서 제작, 레퍼런스 Pack화 |
| **리스크와 대응책** | 데이터 연계, 보안, 모델 품질, 운영 책임, 파트너 종속, 과도한 자동화 리스크 |

