# AAP 내부용 사업전략 및 직책자 설득안 · v0.1

> **문서 성격**: 내부 전략 / 사업화 방향 / 직책자 설득용  
> **대상 독자**: 사업부장, BD/영업 리더, 수행 총괄, 기술 리더, 파트너/보안/운영 책임자  
> **목적**: AAP를 단일 AI PoC가 아니라 kt ds가 주도할 수 있는 통합 SI 오퍼링으로 사업화하기 위한 방향, 책임 경계, 패키지, 실행 로드맵을 제시한다.  
> **작성 기준**: 고객용 문서와 동일한 AAP 정의·아키텍처 코어를 사용하되, 내부 의사결정에 필요한 사업성·수행성·차별화·리스크를 전면화한다.

---

## Executive Summary

AAP(Agentic AI Platform)는 Data Platform 이후의 차세대 실행 계층입니다. 고객은 이미 데이터 플랫폼과 생성형 AI PoC를 경험했지만, AI가 실제 업무 프로세스에 들어가 판단·승인·예외 처리·시스템 반영까지 이어지는 운영형 사례는 아직 제한적입니다.

이 지점은 kt ds에게 사업 기회입니다. AAP는 단일 솔루션 판매가 아니라, **고객 업무 의미화, 기간계/레거시 연계, Agent 실행, HITL·감사·보안 통제, 운영 학습 체계**를 묶어 제공하는 통합 SI 오퍼링입니다.

> **내부 전략 명제**  
> AAP는 AI 기술 트렌드 대응이 아니라, kt ds가 보유한 SI·기간계 연계·보안·운영 경험을 Agentic AI 시대의 실행형 오퍼링으로 재포장하는 사업 전략이다.

---

## 01. 왜 이 사업을 해야 하는가

### 1. Data Platform 이후 고객의 다음 예산 주제
고객은 데이터 수집·분석·시각화 기반을 구축했지만, 실제 업무 실행은 여전히 사람이 담당합니다. Data Platform 이후의 다음 질문은 “AI가 실제 업무를 어디까지 수행할 수 있는가”입니다.

### 2. 생성형 AI PoC의 운영 전환 병목
생성형 AI PoC는 많지만 운영 전환은 어렵습니다. 이유는 LLM 성능 자체보다 업무 맥락, 시스템 실행, 승인/감사, 운영 학습 구조가 비어 있기 때문입니다.

### 3. kt ds의 기존 강점과 정면으로 맞닿는 영역
AAP는 모델 자체 경쟁이 아닙니다. 고객 업무를 해석하고, 기간계와 연결하고, 보안/감사/운영 체계 안에서 실행되게 만드는 통합 역량이 핵심입니다. 이는 kt ds의 SI 경험과 맞습니다.

### 4. 파트너 조합형 Prime SI 포지션 확보
LLM, RAG, Ontology, Workflow, RPA, EvalOps, 보안 솔루션은 외부 자산을 조합할 수 있습니다. kt ds는 고객 업무와 시스템 통합, 보안/운영 책임을 쥐는 Prime SI 포지션을 가져갈 수 있습니다.

---

## 02. 사업 기회와 1차 타겟

### 2.1 우선 타겟 산업

| 우선순위 | 산업/고객군 | 이유 | 1차 제안 업무 |
|---|---|---|---|
| 1 | 금융/보험/자산운용 | 규정, 승인, 감사, 폐쇄망, 판단 업무가 많음 | 내부통제, 손해사정, 투자 자문, 규정 검토 |
| 2 | 공공/협회/산업단체 | 정책·규제·회원사/민원 대응 등 도메인 지식 기반 판단 필요 | 정책 영향도 분석, 회원사 차등 통보, 민원/질의 대응 |
| 3 | 그룹 내부/대기업 | 기존 데이터·업무 시스템과 AI 조직 보유 | 업무 Agent Portal, 지식 검색, 승인형 업무 자동화 |
| 4 | 제조/유통 | 공급망·품질·계약·클레임 등 반복 판단/실행 업무 존재 | 품질 클레임, 구매/계약 검토, 공급 리스크 대응 |
| 5 | 국방/보안 | 폐쇄망·권한·감사 요구가 강함 | 폐쇄망 지식 검색, 절차 검토, 승인형 업무 지원 |

### 2.2 초기 진입 원칙

- 전사 플랫폼 구축으로 시작하지 않는다.
- 고객의 반복 판단 업무 중 **정책 기준이 있고, 시스템 반영이 필요하며, 감사/승인 이력이 중요한 업무**를 우선 찾는다.
- 8~12주 내 통제형 Pilot을 구성할 수 있는 범위를 1차 타겟으로 삼는다.
- Pilot 이후 Decision Log, Skill Registry, Evaluation Loop를 붙여 운영 확장 논리로 전환한다.

---

## 03. AAP 정의와 MECE 원칙

### 3.1 AAP 정의

> **AAP는 고객의 데이터, 문서, 시스템을 업무 맥락으로 연결하고, Agent가 판단 후보 생성·도구 호출·실행 보조·사람 검토 연계를 안전하게 수행하도록 만드는 기업용 Agentic AI 운영 체계입니다.**

### 3.2 AAP를 설명하는 5가지 구성 원칙

AAP는 다음 다섯 구성요소로 설명할 때 가장 MECE에 가깝습니다.

| 구성요소 | 질문 | 역할 |
|---|---|---|
| **Customer Environment** | 무엇을 연결하는가? | 고객의 데이터 플랫폼, 업무 시스템, 문서/KMS, 내부 API를 연결 |
| **Service Experience** | 누가 어떻게 사용하는가? | 현업 사용자, 검토자, 승인자, 운영자가 Agent와 상호작용 |
| **Execution Loop** | 업무가 어떻게 처리되는가? | 입력 연결 → 의미화 → 판단/계획 → 실행 → 운영 학습 |
| **Control Plane** | 무엇을 허용하고 막는가? | 권한, 위험도, HITL, 감사, 설명성, 비용/품질 통제 |
| **Trust Foundation** | 어떤 기반에서 안전하게 운영되는가? | IAM, 보안, 폐쇄망, 관측, 거버넌스, 데이터 경계 |

### 3.3 내부 관점에서의 핵심 차별화

| 차별화 | 의미 | kt ds 관점의 사업 가치 |
|---|---|---|
| **Business Semantic Modeling** | 업무 의미·정책·권한·예외 기준을 구조화 | 고객 업무 컨설팅과 SI 설계 역량이 직접 작동 |
| **Enterprise System Writeback** | 결과를 실제 업무 시스템에 반영 | 기간계/레거시 연계 역량이 차별화 포인트 |
| **Control Plane** | HITL, 감사, 권한, 위험도, 보안 통제 | 공공·금융·국방 고객 진입의 필수 조건 |
| **Operational Learning** | 운영 이력과 피드백을 개선 후보·스킬로 축적 | 일회성 PoC가 아닌 장기 운영/고도화 매출로 연결 |
| **Partner-Orchestrated SI** | 외부 솔루션을 조합하고 kt ds가 책임 | 자체 솔루션 한계를 보완하면서 Prime 포지션 확보 |

---

## 04. 통합 아키텍처와 수행 모델

> 이 장은 고객용과 내부용 문서에서 동일한 코어 구조로 사용한다. 고객에게는 운영 가능성과 안전성을 설명하고, 내부에는 사업화·수행·파트너 전략의 기준점으로 사용한다.

### 4.1 Architecture Overview

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

### 4.2 MECE Layer Map

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

### 4.3 Capability Map · 대표 Capability와 확장 컴포넌트

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

### 4.4 Capability-to-Technology Bridge

| Layer | 고객에게 보이는 가치 | 대표 구현 후보 |
|---|---|---|
| Enterprise Data & Inputs | 고객 자산을 업무 판단에 쓸 수 있게 연결 | API/DB/File Connector, OCR/Parser, RAG Pipeline, Vector Store, Event Bus |
| Business Semantic Modeling | 업무 의미·정책·권한을 Agent가 이해 가능한 구조로 전환 | Knowledge Graph, Ontology, Taxonomy, BPMN, DMN, Rule Repository |
| Agentic Reasoning | 판단·계획·도구 호출을 통제된 흐름으로 수행 | LangGraph, Semantic Kernel, AutoGen, MCP, OpenAPI, Tool Registry |
| Enterprise Integration & Action | 승인된 결과를 실제 업무 시스템에 안전하게 반영 | Workflow Engine, API Gateway, RPA, EAI, Retry/Rollback |
| Operational Learning | 실행 이력과 피드백을 개선 후보와 재사용 스킬로 축적 | Decision Log, EvalOps, Feedback Store, Skill Registry, Version Control |
| Control Plane / Trust Foundation | 보안·감사·HITL·폐쇄망 요구를 충족 | IAM/SSO, RBAC/ABAC, Audit Trail, Guardrails, Observability, Private Deployment |

### 4.5 Delivery Model · Define → Compose → Connect → Operate

| 단계 | 목적 | 주요 활동 | 연계 아키텍처 |
|---|---|---|---|
| **01. Define** | 맡길 업무와 사람 검토 경계 정의 | 대상 업무, 판단 기준, 예외 조건, 권한, KPI 합의 | Business Semantic, Control Plane |
| **02. Compose** | AI·자동화·보안 자산 조합 | 모델, 검색, Agent Framework, Workflow, RPA, 보안 도구 조합 | Agentic Reasoning, Integration, Trust |
| **03. Connect** | 고객 환경 연계 | Data Platform, ERP/CRM/SCM, KMS, 내부 API, IAM 연결 | Customer Environment, Data & Inputs |
| **04. Operate** | 운영·학습 체계화 | HITL, Decision Log, Evaluation, Feedback, Skill 개선, 운영 리포트 | Operational Learning, Control Plane |

---

## 05. 오퍼링 패키지화 전략

AAP는 처음부터 전사 플랫폼 구축으로 판매하지 않는다. 고객 부담을 낮추고 내부 수행 리스크를 관리하기 위해 4단계 패키지로 사업화한다.

| 패키지 | 기간 | 목적 | 산출물 | 매출 성격 |
|---|---:|---|---|---|
| **1. AAP Opportunity Assessment** | 2~4주 | 적용 업무 후보와 도입 가능성 진단 | 후보 업무 목록, Pain-Gap 분석, 시스템/데이터 연결성 진단, Pilot 제안서 | 유상 진단/컨설팅 |
| **2. Controlled Pilot** | 8~12주 | 제한된 업무 범위에서 통제형 Agentic AI 검증 | 업무 Semantic 초안, Agent Flow, HITL 기준, 최소 Writeback/Workflow, 평가 리포트 | Pilot 구축 |
| **3. AAP Build** | 3~6개월 | 운영 가능한 업무 실행 체계 구축 | 운영 Agent, 시스템 연계, 권한/감사, Decision Log, 운영 대시보드 | 본 구축 SI |
| **4. Operate & Improve** | 연간 | 운영 학습·평가·스킬 고도화 | Evaluation, Skill Update, Policy 개선, 운영 리포트 | 운영/고도화 매출 |

---

## 06. Build / Bring / Borrow 책임 경계

| 영역 | Build · kt ds 직접 책임 | Bring · 솔루션/그룹 자산 | Borrow · 파트너/전문성 |
|---|---|---|---|
| Service Experience | Agent Portal, Review UI, 업무 화면 설계 | 기존 사내/그룹 AI 서비스 자산 | UX, 산업별 SME |
| Enterprise Data & Inputs | 고객 시스템/API/DB 연계, 데이터 흐름 설계 | Connector, Parser, Vector DB | 문서 처리, 데이터 전문 파트너 |
| Business Semantic | 업무 모델링, 정책/권한/예외 구조화 | KMS, Taxonomy/KG 도구 | Ontology/KG 전문기업, 도메인 SME |
| Agentic Reasoning | Agent Flow, Action Policy, HITL 기준 | LLM, Agent Framework, MCP Runtime | Agent Framework 전문 파트너 |
| Enterprise Action | Writeback, Workflow/API/RPA 연계 책임 | RPA, Workflow Engine, API Gateway | 특수 레거시, UI/UX 파트너 |
| Operational Learning | Decision Log, 평가/피드백 운영 구조 | EvalOps/MLOps, Monitoring | AI 품질평가 전문성 |
| Trust Foundation | 보안/감사 요구사항 설계, 폐쇄망 구축 대응 | IAM, Audit, Guardrail 도구 | 보안·망분리·규제 파트너 |

### 내부 원칙

- kt ds는 **고객 업무 이해, 시스템 연계, 통제/운영 설계, 통합 책임**을 가져간다.
- LLM, KG, RPA, EvalOps 등 개별 기술은 검증된 솔루션과 파트너를 적극 조합한다.
- 고객에게는 “단일 도구 판매”가 아니라 “업무 운영 모델 구축”으로 제안한다.

---

## 07. 레퍼런스 자산화 전략

### Case 1. AI 투자 메이트 → 금융 자문형 AAP Pack

| 현재 검증 | 부족한 영역 | Pack화 방향 |
|---|---|---|
| 외부 데이터 수집, 멀티에이전트 분석, 자문 생성 | 투자 정책, 권한, 감사, HITL, 시스템 Writeback | 금융 자문/리서치/컴플라이언스 Agent Pack |

### Case 2. 산업단체 온톨로지 PoC → 공공/협회형 AAP Pack

| 현재 검증 | 부족한 영역 | Pack화 방향 |
|---|---|---|
| 산업 도메인 온톨로지, 회원사 영향도 판단 | 통보 Workflow, 승인, 실행 로그, 피드백 루프 | 정책 영향도 분석·회원사 차등 대응 Pack |

### 공통 자산화 방향

- 업무 Semantic 템플릿
- 권한/승인 Matrix 템플릿
- Agent Flow 템플릿
- Decision Log 스키마
- HITL/Action Policy 기준
- Evaluation Checklist
- 고객 제안서/데모 시나리오

---

## 08. 경쟁 구도와 포지셔닝

| 경쟁/대체 접근 | 강점 | 약점 | AAP 포지셔닝 |
|---|---|---|---|
| AI Studio / Agent Builder | Agent 개발 편의성 | 고객 업무 의미화·기간계 연계 책임 약함 | 업무 운영 모델과 통합 SI 책임 |
| RAG 솔루션 | 문서 검색/근거 제시 | 실행·승인·학습 구조 약함 | 사건·정책·권한·실행 로그 중심 |
| RPA 업체 | 시스템 실행 자동화 | 의미 이해·판단·HITL 설계 약함 | Agent 판단 + RPA/API 실행 결합 |
| CSP/글로벌 플랫폼 | 기술 생태계 풍부 | 국내 폐쇄망·레거시·업무 책임 약함 | 고객 환경 맞춤형 구축/운영 책임 |
| 일반 SI 경쟁사 | 구축 역량 | Agentic AI 패키지와 레퍼런스 부족 가능 | AAP 표준 아키텍처 + 레퍼런스 Pack 선점 |

---

## 09. 조직 운영 모델

| 역할 | 책임 | 주요 산출물 |
|---|---|---|
| 사업개발 | 오퍼링 구조, 타겟 산업, 패키지/가격, 파트너 전략 | 사업계획, 패키지 정의, 파트너맵 |
| 영업 | 고객 발굴, Pain 진단, 선제안, Pipeline 관리 | 고객별 제안서, Opportunity List |
| 수행 총괄 | Delivery Model, 범위/일정/리스크 관리 | SOW, WBS, 인력 계획, 리스크 관리표 |
| 기술 조직 | 표준 아키텍처, 레퍼런스 구현, 기술 검증 | Architecture Blueprint, PoC Kit, 기술 가이드 |
| 보안/컴플라이언스 | 폐쇄망, 권한, 감사, 데이터 경계 기준 | Security Checklist, Compliance Guide |
| 파트너 | KG/RAG/RPA/EvalOps/보안 솔루션 제공 | 기술 제안, 통합 인터페이스, 공동 데모 |

---

## 10. 리스크와 대응책

| 리스크 | 설명 | 대응책 |
|---|---|---|
| 범위 과대화 | AAP가 전사 플랫폼처럼 인식되어 시작이 어려움 | Assessment → Controlled Pilot → Build 단계화 |
| 기술 과신 | Agent가 모든 판단을 자동 수행한다고 오해 | 판단 후보 생성, HITL, Action Policy 중심 표현 |
| 데이터/시스템 연계 난이도 | 고객 기간계·문서·권한 구조가 복잡 | Connect 진단을 별도 패키지화, 범위 제한 |
| 보안/감사 우려 | 민감정보, 폐쇄망, 감사 요건 미충족 우려 | Control Plane과 Trust Foundation을 전면화 |
| 파트너 종속 | 외부 솔루션 의존도가 높아질 수 있음 | kt ds 책임 영역과 대체 가능한 파트너 풀 정의 |
| 운영 학습 과장 | 자동으로 성능이 좋아진다는 오해 | 반자동 개선 루프, 승인 기반 Skill/Policy 업데이트로 표현 |

---

## 11. 6개월 실행 로드맵

| 시기 | 목표 | 주요 액션 |
|---|---|---|
| 1개월차 | 오퍼링 정리 | 고객용/내부용 문서 확정, 아키텍처 표준화, 데모 시나리오 2개 선정 |
| 2개월차 | 레퍼런스 패키징 | AI 투자 메이트와 산업단체 PoC를 Pack 후보로 정리, 제안서/데모화 |
| 3개월차 | 파트너 번들 구성 | KG/RAG/RPA/EvalOps/보안 파트너 후보와 공동 제안 구조 정리 |
| 4개월차 | 1차 고객 제안 | 금융/공공/그룹 내부 타겟 3~5개 고객 선제안 |
| 5개월차 | Controlled Pilot 착수 | 1~2개 고객 Pilot 범위·SOW 확정 |
| 6개월차 | 표준화/확장 | Pilot 결과 기반 표준 SOW, 견적 템플릿, Architecture Kit 고도화 |

---

## 12. 내부 의사결정 요청사항

1. AAP를 FY26 AI/AX 핵심 오퍼링 후보로 지정
2. 고객용 선제안서와 내부 사업전략 문서의 공식 관리 체계 지정
3. 1차 타겟 산업과 고객군 확정
4. Controlled Pilot 패키지의 표준 범위와 가격 정책 수립
5. 기술 표준 아키텍처와 파트너 조합 원칙 승인
6. 레퍼런스 자산화와 공동 데모 제작을 위한 최소 전담 리소스 배정

---

## Appendix. 내부 검토용 추가 과제

- 고객별 우선순위 Scoring Model
- Pilot 견적 템플릿
- 표준 SOW / R&R / 책임 경계 문서
- 파트너 평가표
- Security & Compliance Checklist
- Architecture Decision Record 템플릿
- 데모 시나리오 2종: 금융 심사형 / 공공·협회 영향도 분석형
