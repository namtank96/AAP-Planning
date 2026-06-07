# Agentic AI Platform (AAP) — 통합 아키텍처 상세 (외부 LLM 자문용)

> 출처: `AAP_v0.1/aap_proactive_offering_v0.1_260529.html` (고객용 선제안서 v0.1)
> 발췌·정리일: 2026-06-05
> 목적: 본 문서는 AAP 아키텍처 구조에 대해 **외부 LLM의 구조 자문(critique·검증·개선안)**을 받기 위한 자기완결형 설명서입니다. 제안서 원문의 Section 4(통합 아키텍처), 별첨 C(영역별 역량 상세), 3장(플랫폼 정의), 별첨 A-6(Traceability Map)을 손실 없이 텍스트로 재구성했습니다.

---

## 0. 한 문단 요약 (먼저 읽을 것)

AAP는 **고객의 기존 IT 자산을 대체하지 않고**, 그 위에 "Agent가 사람과 같은 의미·정책·권한으로 업무를 해석하고, 판단 후보를 만들고, 사람 검토를 거쳐, 실제 시스템에 반영하고, 그 이력을 학습 자산으로 환류하는" **공통 운영 기반(Platform Layer)**을 얹는 것이 핵심이다. 제안 주체(KT ds)는 **자체 개발이 아니라 "자사 자산 + 검증된 외부 자산 조합 + 업무 의미화·연계·통제·운영 구조의 설계 통합"**으로 이 플랫폼을 구성한다.

아키텍처는 **두 가지 관점**으로 동일한 구조를 표현한다.
- **(A) 계층 관점 (Layer View)** — 기술 스택을 8개 수평 계층으로 적층. → Section 4
- **(B) 업무 흐름 관점 (Domain View)** — 업무가 흐르는 8개 영역으로 재배열. → 별첨 C

두 관점 모두 좌측에 **Customer Environment(고객 자산)**, 우측/하단에 **Trust·Security·Governance(전 영역 횡단 통제)**를 두고, 중앙을 **5단계 Execution Loop(데이터 → 의미화 → 추론 → 실행 → 학습)**가 가로지른다.

---

## 1. 설계 철학 / 전제 (3장에서 추출)

### 1-1. 패러다임 전제
- **Agentic AI** = 단발 답변(Generative)·근거 기반 답변(RAG)·도구 호출(Tool-Augmented)을 넘어, **목표 해석 → 단계별 계획 → 도구 사용 → 결과 검증**을 수행하는 패러다임.
- Enterprise AI의 역할이 "단발 답변"에서 **"검토 가능한 실행 후보 + 운영 이력"**으로 이동.
- 자산화 단위의 진화: 프롬프트/문서 → 문서 인덱스 → 도구 호출 패턴 → **Skill·실행 패턴·Decision Log**.

### 1-2. 개별 Agent 집합 ✕ → Platform 중심 운영 ✓
"개별 Agent를 여러 개 만드는 것"으로는 부족하고, 모든 Agent가 공유하는 **공통 운영 기반(Platform Layer)** 위에서 작동해야 한다. 공통 기반의 4대 기둥:

| 기둥 | 내용 |
|---|---|
| **표준화** | 의미·도구·실행 인터페이스 |
| **통제** | 권한·승인·HITL·가드레일 |
| **관측** | 판단 근거·실행 이력·품질·비용 |
| **재사용** | Skill·Decision Log·지식 자산 |

### 1-3. AAP 정의 (제안서 원문 3-3)
> (1) 고객의 데이터·문서·시스템을 **업무 맥락으로 연결**하고,
> (2) Agent가 업무 기준에 따라 **판단 후보 생성·실행 보조·사람 검토 연계**를 수행하며,
> (3) 그 결과가 **시스템 반영과 운영 이력으로 안전하게 이어지도록** 만드는 (Agentic Operation) 기업용 플랫폼.

### 1-4. 구현 4축 (3-3)
1. **업무 의미화** — 흩어진 용어·정책·권한·예외 기준을 Agent가 같은 의미로 해석 가능한 구조로 정리
2. **시스템 반영** — Agent 답변·추천을 Workflow·API/RPA·ERP·CRM·결재 처리 흐름으로 연결
3. **통제·권한** — 도구 호출·실행 분기를 권한·승인·위험도·감사 기준으로 통제 (자동/검토/보류 경계를 Platform 수준에서 관리)
4. **운영 학습** — 판단·도구·검토·실행·예외 이력 축적 → 업무 지식·정책·재사용 Skill로 개선 환류

### 1-5. 공급 원칙: Build · Integrate · Partner
> "자체 개발 ✕ → **자사·검증 외부 자산 조합** + **업무 의미화·연계·통제·운영 구조 설계 통합** ✓"

자산 소유 구분(별첨 C 범례):
- **ds 설계·통합 주도** (차별화 영역, 직접 설계)
- **ds Asset 활용** (자사 보유 자산 — 원문에서 빨간 테두리 강조)
- **외부 자산·파트너 조합** (검증된 외부 솔루션 조립)

---

## 2. 관점 A — 계층 관점 (Layer View, Section 4 원문)

전체 배치:
```
┌──────────────┬─────────────────────────────────────────┬──────────────────┐
│  좌측 (입력)  │            중앙: 8개 계층 적층            │  우측 (횡단 통제) │
│  Customer     │  ↑ 상단을 Execution Loop가 가로지름      │  Trust·Security   │
│  Environment  │  [1]~[8] Layer                           │  (전 영역 공통)   │
└──────────────┴─────────────────────────────────────────┴──────────────────┘
```

### 2-0. 상단 바: Execution Loop (5단계, 계층을 가로지르는 작동 흐름)
```
Data ▶ Semantic ▶ Reasoning ▶ Integration ▶ Learning  ↺(운영 학습 환류)
```
- 각 단계는 아래 계층과 대응: **Data(L5) → Semantic(L4) → Reasoning(L3) → Integration(L5 연동/L6) → Learning(L6 품질평가/L7 거버넌스)**.
- 마지막 Learning 결과가 다시 앞단으로 환류되는 닫힌 루프(↺).
- ※ 참고: 원문 HTML에서 Loop 단계에 붙은 숫자(5,4,3,5,6)는 대응 계층 번호를 가리키며, "Integration"이 L5(데이터/연동)와 실행계층 양쪽을 참조하는 점은 구조 검토 시 명확화가 필요한 부분.

### 2-A. 좌측: Customer Environment (고객 자산 · 대체 아님)
> AAP가 대체하지 않고 **입력·실행 기반**으로 활용하는 고객 보유 자산.

| 항목 | 구성 |
|---|---|
| **Data Platform** | Lakehouse · BI · Catalog |
| **Business Systems** | ERP · CRM · SCM · 결재 · 그룹웨어 |
| **Knowledge Assets** | 문서 · KMS · FAQ · 매뉴얼 · 상담 이력 |

### 2-B. 우측: Trust · Security (전 영역 공통 횡단 통제)
| 항목 | 구성 |
|---|---|
| **Identity · Access** | IAM · SSO · RBAC · ABAC |
| **Audit · Explainability** | 감사 · 근거 · 실행 이력 |
| **Security Guardrails** | PII · DLP · Prompt Injection |
| **Private / Closed Deploy** | 폐쇄망 · On-prem 옵션 |

### 2-C. 중앙: 8개 계층 (위 → 아래)

**Layer 1 — 경험 / 접근 (Experience / Access)**
| 컴포넌트 | 설명 |
|---|---|
| 에이전트 포털 | Agent 검색 · 실행 · 이력 |
| 코파일럿 / 챗 UI | 대화형 업무 인터페이스 |
| 검토·승인 워크스페이스 | HITL 콘솔 |
| 관리자 콘솔 | 운영자용 관리 |

**Layer 2 — 설계 / 개발 (Build / Design)**
| 컴포넌트 | 설명 |
|---|---|
| 에이전트 스튜디오 | Agent 정의 · 테스트 |
| 워크플로우 디자이너 | 업무 흐름 설계 |
| 도구 레지스트리 | API · MCP · 스킬 등록 |
| 에이전트 레지스트리 | Agent 카탈로그 · LLM 라우팅 |

**Layer 3 — 에이전트 실행 환경 (Agent Runtime Environment) ★핵심 계층(accent)**
2-tier 구조:
- *Interface Layer (접근 계층)*: REST·GraphQL(표준 동기 호출), WebSocket(실시간 양방향), gRPC(고성능 RPC), Event Trigger(이벤트 기반 실행)
- *Agent Core (에이전트 코어)*:
  - **실행 엔진**: `입력 처리 ▶ 계획·추론(Planning) ▶ 행동 실행(Action) ▶ 응답 생성(Response)`
  - 메모리 (대화 히스토리 · 단기 · 장기)
  - 모델 게이트웨이 (LLM 라우팅 · Provider)
  - 도구 실행 (도구 선택·호출 · 결과 파싱·검증)
  - 안전 · 가드레일 (세션·상태 · 정책·권한 검사)
  - 에이전트 관리 (능력·스킬 · 프롬프트·정책 · 버전)

**Layer 4 — 지식 / 시멘틱 (Knowledge / Semantic)**
| 컴포넌트 | 설명 |
|---|---|
| 온톨로지 · 시멘틱 모델 | 업무 용어 · 개념 표준화 |
| 기업 · 도메인 지식 그래프 | 관계 · 맥락 모델링 |
| 하이브리드 지식 스토어 | Graph DB · Vector DB 등 |
| 컨택스트 조합 · 근거 | 추론 컨택스트 · 근거 추출 |

**Layer 5 — 데이터 / 연동 (Data / Integration)** — 3개 서브그룹
- *연결·수집*: DB 소스 커넥터 / API 커넥터 / SaaS 커넥터 / 파일·이벤트 커넥터
- *데이터 처리 파이프라인*: 수집 → 정제 → 정규화 → 변환
- *데이터 관리*: 스키마 매핑 / 권한·보안·품질 관리

**Layer 6 — AI 품질 / 평가 (AI Quality / Evaluation)**
| 컴포넌트 | 설명 |
|---|---|
| 실행 과정 추적 | Decision Log · Trace |
| 품질 · 근거 평가 | Eval · 답변 품질 · 근거 |
| RAI · 안정성 평가 | Responsible AI · Safety |
| 성능 · 비용 모니터링 | Cost · Latency · SLA |
| 사용자 피드백 | Feedback Capture · Review |

**Layer 7 — AI 컨트롤 / 거버넌스 (AI Control / Governance)**
| 컴포넌트 | 설명 |
|---|---|
| 정책 관리 · 통제 | 실행 정책 · 운영 룰 |
| 에이전트 권한 관리 | Agent별 권한 · 범위 |
| HITL 승인 | 검토 · 승인 · 반려 기준 |
| Self-Improving | 피드백 → 정책·룰 환류 |
| 사용량 · 비용 가드레일 | 토큰 · SLA · Quota |

**Layer 8 — 플랫폼 인프라 (Infra / Foundation)**
| 컴포넌트 | 설명 |
|---|---|
| 컴퓨팅 · GPU | 모델 실행 기반 |
| 컨테이너 · K8s | 오케스트레이션 · 격리 |
| 네트워크 · 보안 | 전송 · 접근 통제 |
| 스토리지 · DB | RDB · Vector · Graph |
| 온프레미스 · 클라우드 | 배포 옵션 |

### 2-D. 외부 시스템 연계 예시 (Integration)
> 실제 연계 대상은 고객 환경에 따라 달라짐.

| 분류 | 예시 |
|---|---|
| ERP · CRM · SCM | SAP · Oracle · Salesforce · MS Dynamics · Workday |
| ITSM · Helpdesk | ServiceNow · Zendesk · Jira Service · Freshdesk |
| 협업 · 메시징 | MS Teams · Slack · Confluence |
| 문서 · 지식 | SharePoint · Google Drive · Notion · Box |
| 데이터 · 분석 | Snowflake · Databricks · Tableau · Power BI |
| 클라우드 · 인프라 | AWS · Azure · GCP · NHN Cloud · NCP |

---

## 3. 관점 B — 업무 흐름 관점 (Domain View, 별첨 C 원문)

> 동일 구조를 "업무가 흐르는 8개 영역"으로 재배열한 것. 각 역량(capability)에 **자산 소유 표시**가 붙어 있어 Build/Integrate/Partner 전략이 드러난다.
> 범례: **[ds주도]** = ds 설계·통합 주도(차별화) / **[ds자산]** = 자사 보유 자산 / (표시 없음) = 외부 자산·파트너 조합 / *(optional)* = 선택 적용.

### [1] Customer Environment — 고객 자산 영역
> Data Platform·업무 시스템·문서지식 자산은 대체 대상이 아니라 Agentic Operation의 **입력·실행 기반**.

- **Data Platform / Analytics Assets**: Lakehouse · Warehouse · BI · Catalog · Metric Store · Feature Store
- **Business Systems**: ERP · CRM · SCM · Groupware · Approval · Internal API · EAI · Legacy
- **Document / Knowledge Assets**: KMS · ECM · File Storage · Policy Docs · Manual · FAQ · VOC · 상담 이력

### [2] Service Experience — 현업 사용자 접점 영역
- **AI Agent Portal**: Agent Search · Launch · Session · Run History · User Workspace · Knowledge Assistant
- **Business Agents** *(공통+산업·직무 특화)*: **[ds자산]** Horizontal Agent · Vertical Agent · Role Agent · Task Agent — *자사 검증 Agent 보유*
- **Review / Approval Workspace**: HITL Console · Evidence View · Approval Queue · Audit View · Comment Trail

### [3] Enterprise Data & Inputs — 데이터 입력 및 연결 영역
- **System & Data Connectors**: REST/SOAP · DB Connector · File/SFTP · MFT · File Upload · Groupware Linkage · API · Crawling · Event Bus · Batch/Stream Connector · SaaS Connector
- **Document / Knowledge Ingestion & Retrieval Pipeline** — **자사 AI:ON-U 활용**: **[ds자산]** OCR · **[ds자산]** Parser · Document Validation · Document Standardization · AI Processing · **[ds자산]** Chunking · **[ds자산]** Embedding · **[ds자산]** Vector Index · Retrieval Policy · Hybrid Search · Source Citation
- **Operational Data Integration**: Log Pipeline · Event Stream · External API · DMZ Landing · Storage · RDB · Vector DB · DRM · Data Quality · Lineage · PII Masking

### [4] Business Semantic Modeling — 업무 의미화, 권한·정책 구조화 영역 ★차별화
- **Business Concept Model** **[ds주도]** *(optional)*: Domain Ontology · Taxonomy · Knowledge Graph · Business Dictionary · Entity/Relation Model · Graph+Vector · Business Event Model · Case/Claim Model · Customer Journey Context
- **Process & Decision Rule Design** **[ds주도]**: BPMN · DMN · Rule Design · Decision Table · Exception Taxonomy · Exception Handling Rule · Action Scenario · Rule Versioning · Scenario Map
- **Authority & Policy Model** **[ds주도]**: RBAC · ABAC · Approval Matrix · Policy Pack · Delegation Rule · Risk Policy · Human Review Boundary · Responsibility Matrix · Risk Level Policy

### [5] Agentic Reasoning — 판단·계획 및 도구 호출 영역
- **Planning & Orchestration**: Planner · Supervisor · Task Decomposition · Semantic Routing · State/Work Context · Long-term Memory · Multi-Agent Coordination · A2A Protocol · Decision Candidate Generation · Next Best Action · Case Reasoning
- **Tool & API Execution Control** — **자사 BEAST 활용**: Tool Registry · **[ds자산]** MCP · OpenAPI · Function Calling · Credential Scope · Tool Governance · API Execution Control · Model Gateway · LLM Routing · Approval Trigger · No-go Condition
- **Model Runtime & AI Capability**: Inference Model · Vision Model · OCR Model · Embedding Model · Model Policy · Prompt Template · Cost/Latency Control · Grounded Reasoning · Evidence-based Answer
- **HITL & Action Policy**: Risk Scoring · Confidence Threshold · Escalation · Guardrail Hook · Human Review Rule · Action Boundary · Exception Routing · Approval Policy · Responsibility Handoff · Approval Trigger · No-go Condition

### [6] Enterprise Integration & Action — 시스템 반영 및 실행 영역
- **Workflow & Approval Execution** — **자사 Antbot, AI:ON-U 활용**: **[ds자산]** Workflow Engine · Approval Queue · **[ds자산]** RPA · Case Management · SLA Rule · Transaction Approval
- **Business System Writeback** — **자사 BEAST 활용**: **[ds자산]** API Gateway · EAI · ERP/CRM Update · Groupware Writeback · Transaction API · Writeback Validation · System of Record Sync · Execution Confirmation
- **Exception Handling & Transaction Safety**: Durable Execution · Retry · Rollback · Compensation · Manual Override · Failure Queue · Idempotency · Reconciliation · Execution Confirmation

### [7] Operational Learning — 운영 및 평가/개선 영역 ★차별화
- **Decision / Action Logging** **[ds주도]**: Decision Basis · Tool Call Log · Evidence Link · Action Lineage · Audit Link · Execution Trace · Review Outcome · Reject Reason · Exception Case Log
- **Quality Evaluation & Feedback Loop** **[ds주도]**: Feedback Capture · Eval Dataset · Regression Test · Drift Monitoring · Policy Violation Check · 답변 피드백 · RAI Evaluation · Cost/Perf Monitoring · Human Feedback Review · Answer Quality Score · Process Success Rate
- **Reusable Skill Catalog** **[ds주도]** *(optional)*: Skill Registry · Versioning · Improvement Backlog · Release Gate · Skill Template · 지식 개선 후보 · Knowledge Update Workflow · Reusable Workflow Pattern · Approved Skill · Retired Skill

### [8] Trust · Security · Governance — 전 영역 공통 권한·감사·보안·통제
- **Identity & Access Control**: IAM · SSO · Tenant Boundary · MFA · RBAC · ABAC
- **Audit & Explainability**: Audit Trail · Lineage · Evidence Store · Decision Reason · Citation · Report View · 근거 문서 · 검토 의견 · 승인/반려 이력 · Model Decision Trace · Policy Evidence · Explainability Report
- **Security Guardrails & Private Deployment**: PII Protection · Data Boundary · Input/Output Filter · Model Usage Policy · Closed/Private · Container/K8s · On-prem/Cloud · DRM · Prompt Injection Defense · Data Leakage Prevention · Output Policy Check
- **Operations Management**: AI Monitoring · Infra Monitoring · AP Monitoring · Admin Console · Backup · DR · OS Backup Policy · Mail Channel · Alert · LLM Usage Monitoring · Token Cost Control · Model Quota · SLA Monitoring

---

## 4. 자사 자산 (KT ds) 매핑 — 전략적으로 중요

| 자산 | 적용 영역 | 담당 역량 |
|---|---|---|
| **AI:ON-U** | [3] Data Ingestion, [6] Workflow Execution | OCR · Parser · Chunking · Embedding · Vector Index · Workflow Engine |
| **BEAST** | [5] Tool/API Control, [6] Writeback | MCP · API Gateway · Tool/Execution 통제 |
| **Antbot** | [6] Workflow & Approval | Workflow Engine · RPA |
| **자사 검증 Agent** | [2] Business Agents | Horizontal Agent (공통 업무 Agent) |

**ds 설계·통합 주도 차별화 영역**: [4] Business Semantic Modeling 전체 + [7] Operational Learning 전체.
→ 즉 "온톨로지·의미화·정책 구조화"와 "운영 학습·Skill 자산화"가 제안 주체가 직접 설계하는 차별화 핵심이고, 모델·런타임·인프라·커넥터 등은 자사 자산 + 외부 조합으로 메운다.

---

## 5. 논리 일관성 — Traceability Map (별첨 A-6)

문제 진단(1장) → 운영 전환 조건(2장) → AAP 구현 축(3장) 연결:

| 1장 · 운영 공백 | 2장 · 전환 조건 | 3장 · AAP 구현 축 |
|---|---|---|
| 업무 맥락 공백 (문서·데이터는 있으나 Agent 기준 미정리) | 업무 의미화 | **Agent 해석 기반** — Semantic Context, Knowledge Asset, Policy Context |
| **Agentic AI 추가 조건** (목표 기반 판단 후보 필요) | 판단 후보 생성 | **Agentic Reasoning** — Plan, Tool Selection, Risk Scoring, Recommendation |
| 실행 연계 공백 (AI 결과가 시스템 처리로 미연결) | 실행 연계 | **Workflow · Writeback** — System Action, Approval Flow, Status Update |
| 통제/권한 공백 (자동/수동 경계 미정의) | 사람 검토와 통제 | **HITL · Governance** — Human Review, Audit Trail, Guardrails |
| 운영 학습 공백 (근거·결과가 자산화 안 됨) | 운영 학습 | **Feedback · Decision Log** — Skill Catalog, Evaluation, Knowledge Update |

---

## 6. 두 관점의 대응 관계 (Layer ↔ Domain)

| Execution Loop | Layer View (Section 4) | Domain View (별첨 C) |
|---|---|---|
| Data | L5 데이터/연동, L8 인프라 | [1] Customer Env, [3] Enterprise Data & Inputs |
| Semantic | L4 지식/시멘틱 | [4] Business Semantic Modeling |
| Reasoning | L3 에이전트 실행 환경, L2 설계/개발 | [5] Agentic Reasoning |
| Integration | L5 연동(실행측), L1 경험/접근 | [6] Enterprise Integration & Action, [2] Service Experience |
| Learning | L6 품질/평가, L7 컨트롤/거버넌스 | [7] Operational Learning |
| (횡단) | Trust·Security (우측) | [8] Trust·Security·Governance |

---

## 7. 외부 LLM에게 물어볼 자문 포인트 (제안)

이 구조를 외부 LLM에 검증받을 때 던지면 좋은 질문들:

1. **계층 분리의 타당성** — 8계층(특히 L3 Agent Runtime과 L5 Data/Integration, L6 품질평가와 L7 거버넌스)의 경계가 중복/누락 없이 MECE한가? 합치거나 쪼개야 할 계층은?
2. **Execution Loop의 정합성** — Loop 5단계와 8계층의 매핑(특히 "Integration"이 L5와 실행계층 양쪽을 가리키는 점)이 혼란스럽지 않은가? Loop를 계층 번호와 분리해 별도 추상으로 두는 게 나은가?
3. **두 관점(Layer/Domain)의 이중 표현** — 같은 구조를 8계층 + 8영역 두 번 보여주는 것이 명료성에 도움이 되는가, 아니면 1:1 대응이 깨져 혼선을 주는가? (현재 Layer 8개 ↔ Domain 8개지만 항목이 정확히 일치하지 않음)
4. **차별화 포지셔닝** — "자체 개발 ✕, 조합·설계 통합 ✓" 전략에서 [4]의미화·[7]운영학습을 차별화 축으로 잡은 것이 경쟁사 대비 설득력 있는가? Agent Core(L3)를 외부 프레임워크 조합으로 두는 선택의 리스크는?
5. **거버넌스 배치** — Trust·Security를 "횡단(우측 세로축)"으로 두면서 동시에 L7 거버넌스 계층과 [8] 도메인으로도 두는 삼중 표현이 적절한가? 통제 책임의 단일 소재(single source of governance)가 모호하지 않은가?
6. **누락 가능성** — Enterprise Agentic Platform 레퍼런스(예: 멀티에이전트 오케스트레이션, 평가/관측성, 데이터·모델 거버넌스) 대비 빠진 핵심 컴포넌트는? (예: Cost/FinOps, Model/Prompt 버전 관리, 데이터 계약(Data Contract), 평가 자동화 파이프라인 등)
7. **실행 안전성** — [6] Exception Handling(Durable Execution·Idempotency·Compensation)이 Agent의 비결정적 행동과 실제 트랜잭션 시스템 사이의 안전을 충분히 보장하는 구조인가?

---

*문서 끝. 원본 시각 자료가 필요하면 `AAP_v0.1/aap_proactive_offering_v0.1_260529.html`의 Section 4 및 별첨 C를 브라우저로 열어 함께 참조.*
