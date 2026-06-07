[Eyebrow] Agentic AI Platform 고객용 선제안서 · v0.5.1

# Enterprise Agentic AI Platform

AAP는 고객의 데이터·문서·시스템을 업무 맥락으로 연결하고, Agent가 업무 기준에 따라 판단 후보를 만들며 , 필요한 지점에서 사람 검토와 시스템 반영 으로 이어지도록 만드는 구축형 Agentic AI 운영 체계 입니다.


---

## TOC
목차
- 01 · AI PoC의 함정: 문제는 운영 구조에 있다
- 02 · 해결 방향 — Agentic AI Platform
- 03 · AAP 정의와 위치
- 04 · AAP 아키텍처와 수행 모델
- 05 · AAP로 확장 가능한 검증 사례
- 06 · 산업별 적용 예시
- 07 · 고객군별 진입 패턴
- 08 · 후속 논의 방향
- 09 · 별첨 · Capability 확보 전략
- A · 별첨 · 내부 검토용


---

## [01] 기업의 AX 전환, 문제는 기술 역량이 아닌 운영 구조

> (보충 필요)


### 1-1. 기업 AI 활용의 현 주소


 - `① PoC 이후 정체 지속` / **활용 가능성은 확인했지만, 운영 전환은 아직** / 생성형 AI PoC는 기업의 AX 전환 가능성을 충분히 보여주었습니다. 다만 실제 업무 프로세스에 붙어 지속적으로 운영되는 사례는 아직 제한적입니다.

 - `② 단일 기능 중심의 단순 도구로 활용` / **챗봇·문서 요약·정보 검색 등 개별 업무 단위로 제한** / FAQ 챗봇, 문서 요약, 사내 검색, RPA 보조 등은 개별 업무의 생산성을 높여 주고 있습니다. 다만 업무 흐름 전체를 이해하고 다음 단계까지 이어서 처리하는 수준으로는 확장되지 못하고 있습니다.

 - `③ 계속 높아지는 인적 의존성` / **판단·승인·시스템 반영은 여전히 사람에게 집중** / AI가 답변과 초안을 만들어도 정책 판단, 예외 처리, 승인, 시스템 입력은 여전히 현업 실무진이 담당합니다. 결국 AI와 업무 시스템 사이에 남은 한 단계를 사람이 채우는 모양이 됩니다.


📌 **NOTE** · 문제는 AI 기술이 아니라, AI 기능과 맥락·실행·통제·학습 구조 간 연계성 부족 에 있습니다.


### 1-2. AX 전환에 필요한 4가지 요소


| 요소 | (수정 필요) | (수정 필요) |
| --- | --- | --- |
| ① 맥락 | 사내 문서·FAQ 기반 검색과 답변, 일반적 요약·초안 작성 | 고객사의 정책·프로세스·권한·예외 기준 까지는 이해하지 못해 실제 업무 판단에 그대로 쓰기 어려움 |
| ② 실행 | AI가 답변·추천·문서 초안을 만들어 사용자에게 전달 | ERP·CRM·SCM·그룹웨어·결재 시스템에 실제 처리로 이어지는 실행 경로 가 없음. 결국 사람이 다시 시스템에 입력 |
| ③ 통제 | 검색 결과·답변·근거 문서를 제시 | 어떤 근거로 판단했는지, 언제 사람이 검토해야 하는지, 어떤 실행을 막아야 하는지에 대한 기준과 이력 체계 가 미정리 |
| ④ 학습 | 사용자 피드백, 프롬프트 개선, 검색 품질 튜닝 등 단위 개선 은 가능 | 판단 근거·실행 결과·예외 처리·사람 검토 이력이 업무 지식·정책 개선·Agent 스킬로 재사용되는 구조 는 부족 |


📌 **NOTE** · AX 전환 병목의 문제, 개별 AI 기능을 더하는 방식으로는 어렵습니다. AI가 처리할 수 있는 판단·실행 영역과 사람이 검토해야 하는 영역을 구분 하고, 그 위에서 의미·실행·통제·학습을 하나의 운영 구조로 묶어야 합니다.


---

## [02] 왜 Agentic AI Platform인가

> AI의 역할은 더 이상 사용자 요청에 대한 단순 응답(Reactive) 이 아닙니다. 목표를 스스로 해석하고 계획·실행·검토를 주도(Proactive) 해야 합니다.


### 2-1. 왜 Agentic AI인가

_Human-Based Analytics에서 Agentic Operation으로 — Reactive AI에서 Proactive AI로
 기존의 기업 AI는 사람이 질문하고, 사람이 결과를 해석하며, 사람이 시스템에 반영하는 구조 였습니다.
 그러나 AI Agent가 새로운 업무 수행 주체로 합류하면, 데이터·지식은 대시보드·리포트로만 제공되어서는 부족합니다.
 사용자의 의도·권한·업무 맥락에 따라 필요한 데이터·정책·도구·근거를 동적으로 조합하는 구조 가 필요합니다._


### 3-1. Agentic AI란 무엇인가

_답변 생성·근거 검색·도구 호출 등 기존 AI 기능 위에 목표 해석·다단계 계획·도구 사용·결과 검증 을 결합, 업무 목표를 기준으로 업무 흐름을 자율적으로 실행하는 AI 패러다임_


| 구분 | Generative AI | RAG 기반 챗봇 | Tool-Augmented AI | Agentic AI |
| --- | --- | --- | --- | --- |
| 핵심 능력 | 자연어 답변·요약·생성 | 검색 결과 기반 답변 | + 외부 도구·API 호출 | + 목표 해석 · 계획 · 실행 · 검증 |
| 응답 방식 | Reactive (단발 응답) | Reactive (근거 기반) | Reactive + Tool Use | Plan · Act · Verify (Proactive) |
| 업무 맥락 | 대화·문서 맥락 중심 | 문서·근거 맥락 중심 | 도구 호출 맥락 일부 포함 | 업무 목표·다단계 작업 중심 |
| 사람 역할 | 답변 검토·수정 | 답변 검토·수정 | 도구 결과 검토 | 목표 정의, 결과 검증 |
| 자산화 | 프롬프트·문서 인덱스 | 문서 인덱스·검색 패턴 | 도구 호출 패턴 | Skill · 실행 패턴 · Decision Log |


### 2-2. 왜 'Platform'인가

_Agentic AI가 목표를 해석하고 도구를 사용할 수 있어도, 기업 업무에서는 그것만으로 충분하지 않습니다. 실제 운영에는 고객 자산을 업무 의미로 연결하고, 권한·감사·HITL 기준 안에서 실행을 통제하며, 시스템 반영과 운영 학습까지 이어지는 Platform 형태의 운영 구조 가 필요합니다._


🔸 **NOTE** · 단일 Agent를 도입하는 것이 아니라, 업무 의미화·실행 통제·시스템 반영·운영 학습 을 하나의 구조로 묶어 Agentic AI를 기업의 실제 업무에 적용 가능한 운영 체계로 전환 하는 접근입니다.


### 3-2. 왜 Agentic AI Platform이 필요한가

_Agentic AI가 목표를 해석하고 도구를 사용할 수 있어도, 기업 업무에서는 그것만으로 충분하지 않습니다. 실제 운영에는 고객 자산을 업무 의미로 연결하고, 권한·감사·HITL 기준 안에서 실행을 통제하며,
 시스템 반영과 운영 학습까지 이어지는 Platform 형태의 운영 구조 가 필요합니다._


### 2-3. Platform이 갖춰야 할 4가지 조건

_Platform 형태의 운영 구조가 갖춰야 할 핵심 조건 네 가지입니다. 각 조건은 03장에서 정의할 AAP의 구성 축과 04장의 아키텍처 구현에 대응합니다._


 - `① 업무 의미화` / **Agent 해석 기반 정제** / Data Platform, Analytics AI, KMS, 문서, 업무 시스템에 흩어진 업무 용어·정책·권한·예외 기준 을 Agent가 동일한 의미로 해석할 수 있는 구조로 정리합니다.

 - `② 통제·권한` / **안전한 실행 경계** / Agent의 도구 호출과 실행 분기 는 권한·승인 기준·위험도·감사 요건에 따라 통제되어야 합니다. 자동 처리·사람 검토·실행 보류의 경계를 Platform 수준에서 관리합니다.

 - `③ 시스템 반영` / **업무 실행 연결** / Agent의 답변이나 추천이 사용자 화면에서 끝나지 않고, Workflow·API/RPA·결재·그룹웨어·ERP·CRM 등 실제 업무 시스템의 처리 흐름으로 이어져야 합니다.

 - `④ 운영 학습` / **지속 개선 구조** / 판단 근거·도구 호출·사람 검토·실행 결과·예외 처리 이력을 축적해 업무 지식·정책 기준·재사용 Skill 개선 으로 환류시키는 구조가 필요합니다.


---

## [03] Agentic AI Platform

> AI 기능이나 솔루션 제품이 아니라, 고객의 데이터·문서·시스템·통제 체계 위에 Agentic Operation Layer 를 더하는 구축형 운영 아키텍처입니다.


### 3-1. AAP 정의


📦 **[정의]** AAP는 고객의 Data Platform, 문서·KMS, 업무 시스템, 보안·감사 체계 위에 Agentic Operation Layer 를 더해, 업무 의미화 → 판단 후보 생성 → 시스템 실행 보조 → 사람 검토 → 운영 학습 을 연결하는 기업용 Agentic AI 운영 플랫폼 입니다.


🔸 **NOTE** · 표현 기준 · Agent는 업무 기준에 따라 판단 후보를 생성 하고, 승인된 결과를 시스템 반영으로 연결 하며, 위험도·권한 기준에 따라 사람 검토로 분기 합니다. AAP는 기존 Data Platform을 대체하지 않습니다. 오히려 기존 데이터·분석 자산이 업무 실행으로 이어지도록, 그 위의 소비·실행 계층을 재구성 합니다.


### 3-2. Data Platform → Data Intelligence → Agentic Operation

_AAP는 기존 Data Platform 위에 단순 AI 기능을 붙이는 것이 아니라, Data Platform의 분석 자산을 업무 의미·판단 후보·실행 연계·운영 학습으로 확장하는 Agentic Operation Layer 입니다._


📊 **[3단계 발전 박스]**
Data Platform → Data Intelligence → Agentic Operation Human Analytics 중심에서 Agentic Operation 중심으로

 - `Stage 1 · Data Platform` / **수집·저장·분석 기반** / Lakehouse · ETL · BI · Analytics AI / 한계: 분석 이후 판단·승인·실행은 사람에게 남음

 - `Stage 2 · Data Intelligence` / **의미·맥락 해석** / Ontology · Semantic Modeling · RAG · Metadata / 한계: 정책·권한·실행 경로 연결은 부족

 - `Stage 3 · Agentic Operation · AAP` / **업무 판단·실행·학습** / Agent · Workflow · HITL · Decision Log · Feedback / 한계: AAP의 핵심 운영 구조


| 단계 | 핵심 역할 | 주요 산출물 | 한계 · 다음 과제 |
| --- | --- | --- | --- |
| Data Platform | 데이터 수집·정제·저장·분석 | Lakehouse · Medallion · Mart · BI · Catalog | 분석 결과 이후의 판단·승인·실행은 사람 몫 |
| Data Intelligence | 데이터 품질·메타데이터·의미 자산화 | Metadata · Data Product · Feature/Metric · Knowledge Asset | 업무 정책·권한·실행 경로까지 연결 부족 |
| Agentic Operation | 업무 의미 · Agent 판단 · 실행 · 검토 · 학습 | Semantic Context · Agent Skill · Workflow · Decision Log · Feedback Loop | AAP의 핵심 운영 구조로 자리 |

🔸 주의 · Data Catalog나 Metadata가 곧 Business Semantic은 아닙니다. Catalog·Metadata는 중요한 기반이지만, AAP에서 필요한 Business Semantic은 업무 정책·권한·예외 기준·처리 경로까지 Agent가 사용할 수 있는 구조로 재구성 하는 것을 의미합니다.


### 3-3. Build · Buy · Borrow 채택 전략

_02-3에서 제시한 Platform의 4가지 조건( 의미화·통제/권한·시스템 반영·운영 학습 )은 모두 같은 방식으로 확보되지 않습니다. 고객 업무 특수성과 기술 변화 속도에 따라 Build · Buy · Borrow 를 구분해 조합해야 합니다._


📊 **[BBB 전략 박스]**
기술 채택 전략 Build · Buy · Borrow의 조합으로 운영 가능한 Agentic AI 체계 확보
AAP는 모든 기술 요소를 자체 개발하는 단일 제품 전략이 아닙니다. 고객 업무 의미화·시스템 통합·권한·승인·감사 구조 처럼 고객 맥락 이해와 SI 역량이 필요한 영역은 Build 중심 으로 설계하고, LLM·Agent Framework·EvalOps·Guardrails·Observability 처럼 기술 변화가 빠른 영역은 자사 검증 솔루션·상용 솔루션·글로벌 검증 자산을 Buy·Borrow 방식으로 조합 합니다. 핵심은 개별 AI 기술 자체의 보유가 아니라, 고객의 데이터·업무·시스템·보안·감사 환경 안에서 Agentic AI를 운영 가능한 구조로 통합·검증·운영하는 능력 입니다.

 - `Build` / **직접 설계·구축** / 고객 업무 의미화, 시스템 통합, 권한·승인·감사 구조, 업무별 Agent 설계

 - `Buy` / **자사·상용 솔루션** / 자사 검증 솔루션 또는 상용 솔루션 활용 — RAG·문서 처리, RPA·Workflow, 포털·업무 도구

 - `Borrow` / **외부 검증 자산·파트너** / 오픈소스·파트너 기술 조합 — Agent Framework, EvalOps, Guardrails, Observability

🔸 보정 · 운영 학습은 전부 Build가 아닙니다. Decision Log와 업무 기준은 Build 중심 , Evaluation Pipeline·Reliability·Observability·Self-improving 자동화 는 Buy/Borrow와 혼합 가능합니다.


📌 **NOTE** · AAP의 정의와 위치, Capability 확보 전략이 정리되었다면, 다음 장에서는 이를 실제 아키텍처와 수행 모델 로 어떻게 구성하는지 설명합니다.


---

## [04] AAP 아키텍처와 수행 모델


### 4-1. Architecture Overview


📐 **[Architecture Overview]**
Trust · Security · Governance IAM · 권한 · 감사 · HITL · Guardrails · Private/Closed Service Experience & Outcome 요청 → 검토 → 승인 → 결과 반영 ▲ 업무 요청 · 검토 · 승인 · 결과 반영 ▼ AAP Execution Loop Enterprise Data & Inputs 고객 자산을 업무 판단의 입력으로 연결·정제·검색 가능하게 만듦 연결 → 정제 → 검색 가능화 ★ Business Semantic Modeling 업무 의미·정책·권한·예외를 Agent가 이해 가능한 구조로 정리 흐름 설계 → 판단 자동화 → 예외 관리 Agentic Reasoning 업무 목표를 해석하고 단계를 계획한 뒤, 필요한 도구를 호출하며 검증·HITL 기준에 따라 실행 경로를 분기 목표 해석 → 계획 수립 → 도구 호출 → 검증/HITL Enterprise Integration & Action 승인된 결과를 실제 업무 시스템에 안전하게 반영 Workflow 실행 → 시스템 반영 → 안전 처리 ★ Operational Learning 실행 이력·평가·피드백을 재사용 스킬과 개선 후보로 축적 실행 이력 → 품질 평가 → 개선 환류 Operational Learning → Business Semantic · Agentic Reasoning으로 피드백 환류 ▲ 연결 · 호출 · 반영 · 이력 수집 ▼ Customer Environment Data · Analytics Data Platform BI · Lakehouse · Catalog Business Systems ERP / CRM / SCM Groupware · Approval Internal API Knowledge Assets Document / KMS / FAQ 상담·업무 매뉴얼 VOC · 상담 이력


### 4-2. 주요 영역 및 필요 역량

_모든 기술 요소를 자체 개발하는 방식이 아니라, kt ds 자사 역량·자산과 검증된 외부 자산을 고객 업무 기준에 맞게 조합 하고, 업무 의미화·시스템 연계·통제·운영 구조를 설계·통합 하는 접근입니다._


📊 **[Capability Map]**
**주요 영역 및 필요 역량**
_범례:_ Build | · DS 설계·통합 주도 | Buy | · 자사/상용 솔루션 활용 | Borrow | · 검증 자산·파트너 조합 | ★ | = 차별 축적 영역

**▸ [1] Customer Environment** — _고객 자산 영역_

 - [Borrow] **Data Platform / Analytics Assets** — 기존 데이터·분석 자산을 업무 판단의 입력으로 활용 (일반: Lakehouse, Warehouse, BI, Catalog, Metric Store, Feature Store)

 - [Borrow] **Business Systems** — ERP·CRM·SCM·결재·그룹웨어 등 실제 업무 시스템과 연결 (일반: ERP, CRM, SCM, Groupware, Approval, Internal API, EAI, Legacy)

 - [Borrow] **Document / Knowledge Assets** — 사내 규정·매뉴얼·FAQ·KMS·상담 이력 등 문서 지식 자산을 활용— 자사 AI KMS 활용(검토중) (자사: KMS | 일반: ECM, File Storage, Policy Docs, Manual, FAQ, VOC, 상담 이력)

**▸ [2] Service Experience** — _현업 사용자 접점 영역_

 - [Borrow] **AI Agent Portal** — 업무별 Agent를 찾아 실행하고, 실행 이력과 결과를 확인 (일반: Agent Search, Launch, Session, Run History, User Workspace, Knowledge Assistant)

 - [Build] **Business Agents** — 공통 업무 Agent와 산업·직무 특화 Agent 제공 — 자사 검증 Agent 보유 (자사: Horizontal Agent | 일반: Vertical Agent, Role Agent, Task Agent)

 - [Build] **Review / Approval Workspace** — 검토·승인·반려·예외 처리를 지원 (일반: HITL Console, Evidence View, Approval Queue, Audit View, Comment Trail)

**▸ [3] Enterprise Data & Inputs** — _데이터 입력 및 연결 영역_

 - [Build] **System & Data Connectors** — 기간계·DB·API·파일·분석 자산·외부 채널을 Agent 실행 흐름에 연결 (일반: REST/SOAP, DB Connector, File/SFTP, MFT, File Upload, Groupware Linkage, API, Crawling, Event Bus, Batch/Stream Connector, SaaS Connector)

 - [Build] **Document / Knowledge Ingestion & Retrieval Pipeline** — 문서·규정·FAQ·상담 이력을 검색 가능한 업무 지식으로 변환 — 자사 AI:ON-U 활용 (자사: OCR, Parser, Chunking, Embedding, Vector Index | 일반: Document Validation, Document Standardization, AI Processing, Retrieval Policy, Hybrid Search, Source Citation)

 - [Build] **Operational Data Integration** — 운영 로그·이벤트·외부 데이터를 업무 판단·학습 흐름에 연결하고 저장소와 연계 (일반: Log Pipeline, Event Stream, External API, DMZ Landing, Storage, RDB, Vector DB, DRM, Data Quality, Lineage, PII Masking)

**▸ [4] Business Semantic Modeling** — _업무 의미화, 권한·정책 구조화 영역_

 - ★ [Borrow] **Business Concept Model** — 업무 용어·개념·관계 표준화, Agent가 동일한 의미로 업무 해석 (일반: Domain Ontology, Taxonomy, Knowledge Graph, Business Dictionary, Entity/Relation Model, Graph + Vector)

 - ★ [Build] **Process & Decision Rule Design** — 업무 절차·판단 규칙·예외 조건을 실제 실행 기준으로 구조화 (일반: BPMN, DMN, Rule Design, Exception Taxonomy, Rule Versioning, Scenario Map)

 - ★ [Build] **Authority & Policy Model** — 권한·승인 기준·자동/수동 처리 경계를 정의 (일반: RBAC, ABAC, Approval Matrix, Policy Pack, Delegation Rule, Risk Policy)

**▸ [5] Agentic Reasoning** — _판단·계획 및 도구 호출 영역_

 - [Borrow] **Planning & Orchestration** — 업무를 여러 단계로 나누고 Agent 실행 흐름을 조율 (일반: Planner, Supervisor, Task Decomposition, Semantic Routing, State / Work Context, Long-term Memory, Multi-Agent Coordination, A2A Protocol)

 - [Build] **Tool & API Execution Control** — Agent가 호출할 도구·API를 등록·관리하고 권한 기준으로 통제 — 자사 BEAST 활용 (자사: MCP | 일반: Tool Registry, OpenAPI, Function Calling, Credential Scope, Tool Governance, API Execution Control, Model Gateway, LLM Routing)

 - [Build] **Model Runtime & AI Capability** — Agent가 업무 목적에 따라 추론·시각 인식·문서 인식·임베딩 모델을 선택적으로 활용 (일반: Inference Model, Vision Model, OCR Model, Embedding Model, Model Policy, Prompt Template, Model Evaluation, Cost/Latency Control)

 - [Build] **HITL & Action Policy** — 위험도·확신도에 따라 자동 처리·검토 요청·실행 보류 경로를 분기 (일반: Risk Scoring, Confidence Threshold, Escalation, Guardrail Hook, Human Review Rule, Action Boundary, Exception Routing, Approval Policy)

**▸ [6] Enterprise Integration & Action** — _시스템 반영 및 실행 영역_

 - [Build] **Workflow & Approval Execution** — 승인·예외·재처리 흐름을 워크플로우 엔진, RPA·API 채널로 실행 — 자사 Antbot, AI:ON-U 활용 (자사: Workflow Engine, RPA | 일반: Approval Queue, Case Management, SLA Rule)

 - [Build] **Business System Writeback** — 승인된 결과를 실제 기업 업무 시스템에 반영 — 자사 BEAST 활용 (자사: API Gateway | 일반: EAI, ERP/CRM Update, Groupware Writeback, Transaction API)

 - [Build] **Exception Handling & Transaction Safety** — 실패·재시도·취소·롤백·수동 검토 전환 등 실행 안전장치를 관리 (일반: Durable Execution, Retry, Rollback, Compensation, Manual Override, Failure Queue)

**▸ [7] Operational Learning** — _운영 및 평가/자가 개선 영역_

 - ★ [Build] **Decision / Action Logging** — 판단 근거·도구 호출·실행 결과를 추적 가능한 이력으로 저장 (일반: Decision Basis, Tool Call Log, Evidence Link, Action Lineage, Audit Link, Execution Trace)

 - ★ [Build] **Quality Evaluation & Feedback Loop** — 실행 품질·사용자 피드백·정책 위반 여부를 주기적으로 평가 (일반: Feedback Capture, Eval Dataset, Regression Test, Drift Monitoring, Policy Violation Check, 답변 피드백, RAI Evaluation, Cost/Perf Monitoring)

 - ★ [Borrow] **Reusable Skill Catalog** — 검증된 업무 패턴을 재사용 스킬로 관리하고 개선 후보를 축적 (일반: Skill Registry, Versioning, Improvement Backlog, Release Gate, Skill Template, 지식 개선 후보, Knowledge Update Workflow)

**▸ [8] Trust · Security · Governance** — _전 영역 공통 권한·감사·보안·통제_

 - [Borrow] **Identity & Access Control** — 사용자·조직·역할·권한을 관리 (일반: IAM, SSO, Tenant Boundary, MFA, RBAC, ABAC)

 - [Build] **Audit & Explainability** — 판단 근거·참조 출처·실행 이력을 감사 가능한 형태로 저장 (일반: Audit Trail, Lineage, Evidence Store, Decision Reason, Citation, Report View, 근거 문서, 검토 의견, 승인/반려 이력)

 - [Borrow] **Security Guardrails & Private Deployment** — 민감정보 보호·위험 실행 차단·폐쇄망/Private 배포 요건 관리 (일반: PII Protection, Data Boundary, Input/Output Filter, Model Usage Policy, Closed/Private, Container/K8s, On-prem/Cloud, DRM)

 - [Build] **Operations Management** — 운영 모니터링·백업·관리·채널 연계를 통해 서비스 운영성을 확보 (일반: AI Monitoring, Infra Monitoring, AP Monitoring, Admin Console, Backup, DR, OS Backup Policy, Mail Channel, Alert)


### 4-3. 수행 모델

_AAP의 목적은 특정 모델이나 솔루션 도입, 단순 플랫폼 구축이 아닙니다.
고객의 업무 기준, 기존 시스템, 검증된 AI·자동화 자산을 실제 운영 흐름으로 이어주는 단계적 수행 입니다._


📊 **[Delivery Model]**

 - [01] **Assess** (적용 진단) 고객 업무·시스템·보안 조건을 기준으로 적용 후보와 우선순위를 선별

 - [02] **Define** (업무 기준 정의) 업무 의미·정책·권한·예외 기준을 Agent가 실행 가능한 구조로 정리

 - [03] **Compose** (자산 조합 및 전략 매핑) 검증된 AI·자동화 자산을 03-3 Build/Buy/Borrow 매핑 결과 에 따라 업무 목적에 맞게 조합하고, UI·통제·보안 도구를 결합

 - [04] **Connect** (고객 환경 연계) 고객 자산과 업무 시스템을 AAP 실행 흐름에 안전하게 연결

 - [05] **Operate** (운영 전환·학습) 운영 기준과 지속 개선 흐름을 설계하고 재사용 자산으로 축적

🔸 ↻ 운영 로그·평가·피드백을 통해, 고객별 적용 패턴과 재사용 자산이 누적 되며, 동일 산업·업무 유형의 다른 고객에도 빠르게 재적용 할 수 있는 구조를 확보


| 단계 | 목적 | 주요 활동 | 연계 영역 |
| --- | --- | --- | --- |
| Assess (적용 진단) | 고객 업무·시스템·보안 조건을 검토해 AAP 적용 후보와 우선순위를 도출 | · 업무 후보 선정 · 데이터·시스템 가용성 확인 · 보안·규제 제약 검토 · 적용 효과·ROI 가설 정리 | · Customer Environment · Business Systems · Document/Knowledge Assets |
| Define (업무 기준 정의) | 업무 의미·정책·권한·예외 기준을 Agent가 실행 가능한 구조로 정리 | · 대상 업무 분석 · 판단 기준 구조화 · 권한·승인 매트릭스 규정 · HITL 분기 기준·성과 지표 선정 | · Business Semantic Modeling · Authority & Policy Model · HITL & Action Policy |
| Compose (자산 조합 · 전략 매핑) | 검증된 AI·자동화 자산과 자사·파트너 역량을 03-3 Build/Buy/Borrow 매핑 결과를 기반으로 업무 목적에 맞게 조합 | · 모델·검색·문서 처리 선정 · Agent Framework 구성 · Workflow/RPA 조합 · Service UI·보안·통제 도구 결합 · Capability별 BBB 확보 방식 결정 (09장 참조) | · Service Experience · Agentic Reasoning · Trust·Security |
| Connect (고객 환경 연계) | 고객 자산과 업무 시스템을 AAP 실행 흐름에 안전하게 연결 | · Data Platform·ERP·CRM·KMS 연계 · API·Writeback 설계 · IAM·SSO 통합 · 폐쇄망·Private 배포 구조 설계 | · Customer Environment · Enterprise Data & Inputs · Enterprise Integration & Action |
| Operate (운영 전환·학습) | 운영 전환 기준과 지속 개선 흐름을 설계하고 재사용 자산으로 축적 | · HITL 운영 기준 · Decision/Action Log 축적 · Evaluation·Feedback 루프, · Skill Catalog 관리, · 운영 리포트 제공 | · Operational Learning · Audit & Explainability · Governance |


---

## [05] AAP로 확장 가능한 검증 사례

> AAP의 핵심 구성 요소를 부분적으로 검증한 사례를 중심으로, 확장 가능한 영역 및 Action Item 도출


`Case 1. 내부 프로젝트 추진`
**멀티에이전트 기반 금융 자문 검증('AI 투자메이트')**
도메인 자산운용 영역 개인 투자 의사결정
· 시장 데이터·뉴스·매크로 지표를 통합 수집하고, 멀티에이전트가 단계적으로 분석해 투자 자문 초안을 생성 · 데이터 수집부터 자문 산출까지의 End-to-End 흐름이 작동 가능함을 검증
🔸 · AAP의 데이터 통합·Agentic Reasoning 축 이 실제 구성 가능함을 입증 · 업무 의미화·시스템 반영·운영 학습 영역을 고도화 하여, 패턴화 및 AI OS로의 확장 가능성 검토
**Next Step:** Next Step TBD(검증/고도화 방향 및 일정 미정)


`Case 2. 대외 사업 선제안`
**온톨로지 기반 정부 정책·공급망 영향 분석 PoC**
도메인 공공·산업단체 영역 제조 산업 정책 의사결정 보조
· 제조 영역 도메인 온톨로지를 구축 하고, 투자 방향/정책 시그널 파악 및 대응 필요 영역 제시 에 초점 · 1차 세미나(온톨로지 등 개념 소개) 완료, 실제 데이터 기반 2차 데모 시연 준비 중
🔸 · 업무 의미화(온톨로지 모델링 기반) 가 산업 도메인의 다층 의사결정 질문에서 실제 작동함을 입증 · 공공 도메인 내 고객군(산업단체·R&D 발주 기관·산업 정책 기관 등) 확장 가능 할 것으로 기대
**Next Step:** Next Step 고객사 실 데이터 기반 2차 데모 시연 준비(6월 내)


`Case 3. 대외 사업 제안/수행`
**금융지주사 표준내부통제시스템 구축**
도메인 금융지주·금융사 영역 내부통제·책무관리·감사 대응
· 규정, 문서, 점검, 보고 데이터를 수집하고, 내부통제 관리 UI와 AI Agent를 통해 분석·요약·추천·Insight 후보를 제공 · 그룹 표준관리, 책무관리, 주관부서 점검, 개선과제 관리 등
 금융권 내부통제 업무 흐름을 시스템 관점에서 구조화
🔸 · 금융 업무 의미화·HITL 검토·감사 이력·폐쇄망/권한 통제 축 을
 구체적인 목표시스템 형태로 구조화 · Business Semantic Modeling, Review / Approval Workspace,
 Agentic Reasoning, Trust · Security · Governance 와 연결해
 금융권 내부통제 패턴으로 확장 가능
**Next Step:** Next Step (세부 내용 확인 필요)


---

## [06] 산업별 적용 예시

> AAP의 초기 적용은 정책·권한·예외 처리·시스템 반영·감사 이력 이 중요한
 산업과 업무에서 시작하는 것이 적합합니다.


**▸ [타깃 1] 금융·보험·자산운용**
_판단 기준과 감사 이력이 성과와 리스크를 좌우_
- **고객 상황** · 규정·승인·감사 요구가 높고, 건별 판단 근거를 일관되게 남겨야 하는 업무가 많음
- **적용 업무** · 손해사정 심사, 내부통제 점검·보고 보조, 투자 리서치·자문 보조, 리스크 검토
- **적용 방식** · 약관·규정·계약·거래 이력을 사건 단위로 묶고,
 업무 기준에 따라 판단 근거와 처리 경로 후보를 검토자에게 제시
- **Pilot 후보** · 손해사정 심사 보조, 내부통제 검토, 투자 리서치 보조


**▸ [타깃 2] 공공·협회·산업단체**
_도메인 관계 모델링이 정책 대응 속도를 좌우_
- **고객 상황** · 정책·규제·회원사·산업 데이터가 분산되어 변화 발생 시 즉각 대응이 어려움
- **적용 업무** · 정책 영향도 분석, 회원사 차등 통보, R&D 정책 매칭, 규제 변화 리포트
- **적용 방식** · 산업 개념·품목·회원사·정책 관계를 구조화하고,
 변화 이벤트에 따라 영향 대상과 대응 메시지 후보를 도출
- **Pilot 후보** · 통상규제 영향도 분석, R&D 정책 매칭, 회원사 통보 보조


**▸ [타깃 3] 제조·유통**
_업무 판단과 시스템 반영의 단절이 반복 비용을 만듦_
- **고객 상황** · 품질·구매·계약·클레임·공급망 이슈가 반복되지만, 판단 기준/처리 이력이 분산
- **적용 업무** · 품질 클레임 검토, 구매·계약 조건 검토, 공급 리스크 대응, 작업 지시 후보 생성
- **적용 방식** · 규정·계약·생산·처리 이력을 업무 건 단위로 묶고,
 처리 경로와 후속 조치 후보를 담당자 검토 후 업무 시스템에 반영
- **Pilot 후보** · 품질 클레임 처리 보조, 계약 조건 검토, 공급 리스크 대응


**▸ [타깃 4] 국방·방산·보안망**
_보안 제약 안에서 AI 활용 가능성을 검증해야 함_
- **고객 상황** · 폐쇄망·권한·감사·데이터 반출 제한이 강해 외부 SaaS형 AI를 그대로 적용하기 어려움
- **적용 업무** · 폐쇄망 지식 검색, 정비·군수 절차 검토, 승인형 업무 지원, 보안 정책 질의 응답
- **적용 방식** · 교범·규정·정비 이력·보안 정책을 권한 기준 안에서 활용하고,
 표준 절차 초안과 검토 근거를 감사 가능한 형태로 남김
- **Pilot 후보** · 폐쇄망 지식 검색, 정비·절차 검토, 보안 정책 질의


---

## [07] 고객군별 진입 패턴


**▸ Type A · 기존 AI·데이터 자산 보유 고객**
_Data, AI 관련 자산과 내부 조직은 있으나 운영 전환이 병목_
- **상황** · Data, AI 자산과 업무 실행·검토·학습 구조가 분리
- **제안 메시지** · 기존 Data Platform에 Agentic Operation Layer 추가 — 분석 결과 이후의 판단·승인·시스템 반영을 한 흐름으로 연결
- **강조점** · Data Platform 투자 보존, Agent-ready Context, Workflow·Writeback, Operational Learning
- **진입 방식** · Data Platform 자산 진단 → Agentic 업무 후보 선정 → 통제형 Pilot → 운영 학습 고도화


**▸ Type B · 산업 특화 중견**
_반복 업무는 명확하지만 AI 운영 조직은 아직 초기 단계_
- **상황** · 반복 업무·문서·승인·예외 처리 니즈가 명확
- **제안 메시지** · 반복 판단·문서·승인 업무부터 작은 범위의 운영형 Pilot 으로 시작하고, 검증된 업무 패턴을 점진적으로 확장합니다
- **강조점** · Vertical Agent, Business Semantic, 운영형 Pilot
- **적합한 시작점** · 반복 판단·문서·승인 업무 중심의 제한된 업무 Pilot


**▸ Type C · 공공·금융·국방**
_보안·감사·망분리 요건이 도입 가능성을 좌우_
- **상황** · 보안·감사·망분리·승인 체계가 도입 가능 여부를 결정
- **제안 메시지** · 권한·감사·HITL·폐쇄망 요건을 반영한 통제형 AAP 로 접근
- **강조점** · Trust Foundation, Private·Closed Deployment, HITL, Audit Trail
- **적합한 시작점** · 폐쇄망 지식 검색, 규정 검토, 승인형 업무 지원, 감사 가능 업무 Agent


---

## [08] 후속 논의 방향

> Build/Buy/Borrow 매핑 전략을 통해 고객의 실제 자산·보안·업무 조건에 AAP 아키텍처를 적용


### 8-1. 후속 논의 5단계

_각 단계의 산출물이 다음 단계의 입력으로 이어집니다. 3단계 Build/Buy/Borrow 매핑 에서 capability별 확보 방식을 결정하고, 그 결과가 Pilot Scope와 Operational Learning 설계로 흘러갑니다._


| 단계 | 핵심 질문 | 산출물 |
| --- | --- | --- |
| 1. Data Foundation 진단 | 어떤 데이터 플랫폼·BI·문서·업무 시스템을 보유하고 있는가? | Customer Environment Map |
| 2. Semantic Foundation 진단 | 어떤 업무 개념·정책·권한·판단 기준이 필요한가? | Business Semantic 후보 |
| 3. Build · Buy · Borrow 매핑 | 어떤 capability를 직접 구축하고, 어떤 자산을 활용·차용할 것인가? | Capability 확보 전략 (09장 매트릭스 참조) |
| 4. Agentic Pilot 설계 | 어떤 업무를 첫 Pilot으로 검증할 것인가? | Pilot Scope · HITL · Action Flow |
| 5. Operational Learning 설계 | 실행 결과와 피드백을 어떻게 축적·개선할 것인가? | Decision Log · Feedback Loop · Now-Near-Next Roadmap |


### 8-2. 고객에게 던질 질문

_각 질문은 5단계 진단의 시작점이 됩니다._


 - `① 기반 자산` / **Data Platform 범위** / 현재 Data Platform, BI, Catalog, Lakehouse, 문서·KMS, 업무 시스템은 어떤 범위로 구축되어 있는가?

 - `② 업무 흐름` / **수작업 잔여 영역** / 분석 결과 이후 사람이 수작업으로 판단·승인·시스템 반영하는 업무는 무엇인가?

 - `③ Agent·HITL 경계` / **판단·검토 경계** / AI Agent가 판단 후보를 만들 수 있는 업무와 반드시 사람이 검토해야 하는 업무는 어떻게 나뉘는가?

 - `④ 시스템 반영` / **Writeback 가능 영역** / 시스템 Writeback이 가능한 업무와 검토·승인까지만 가능한 업무는 무엇인가?

 - `⑤ 학습 환류` / **로그·환류 구조** / 운영 결과를 정책·룰·Agent Skill 개선으로 환류할 수 있는 로그 구조가 있는가?

 - `⑥ 기술 확보 전략` / **Build · Buy · Borrow** / 어떤 capability는 내부 구축이 필요하고, 어떤 capability는 자사·상용·외부 검증 자산 활용이 적합한가?


---

## [09] 별첨 · Capability 확보 전략

> 본 별첨은 03-3의 Build/Buy/Borrow 원칙과 4-3 수행 모델의 Compose 단계 를 구체화하기 위한 판단 기준표입니다. 구체 제품명과 도입 방식은 고객 환경, 보안 요건, 기존 자산, 파트너 정책에 따라 별도 검토합니다. 외부 공유본에서는 미팅 목적에 따라 선택적으로 활용합니다.


### 9-1. Build · Buy · Borrow 원칙


| 원칙 | 설명 |
| --- | --- |
| Build 중심 영역 | 고객 업무 맥락, 업무 의미화, 시스템 통합, 승인·감사·통제 구조처럼 고객별 차이가 크고 SI 역량이 필요한 영역 |
| Buy 활용 영역 | 자사 검증 솔루션 또는 상용 솔루션으로 빠르게 확보할 수 있는 영역 |
| Borrow 조합 영역 | 외부 검증 자산, 오픈소스, 글로벌 프레임워크, 파트너 기술을 조합해 Time-to-Market을 줄일 수 있는 영역 |
| 단계적 확장 | Now에서 Pilot 가능 범위 확보 → Near에서 운영 품질·통제 고도화 → Next에서 자가개선·멀티에이전트·지속 평가로 확장 |


### 9-2. Capability별 확보 전략 매트릭스

_★ 수가 많을수록 Build 필요성이 높음. Now / Near / Next 는 단계별 구현 우선순위._


| Capability | Build | 권장 확보 | Now | Near | Next |
| --- | --- | --- | --- | --- | --- |
| Business Semantic Modeling | ★★★ | Build 중심 | 업무 용어·정책·권한·프로세스 정리 | Domain Ontology / Decision Rule 고도화 | 산업별 Semantic Pack 자산화 |
| Enterprise Integration / Writeback | ★★★ | Build 중심 | API/RPA/Workflow 연계 | Transaction Safety / Exception Handling | 복수 시스템 조치 자동화 확대 |
| HITL · Approval | ★★ | Build + Workflow 연계 | 승인·반려 UI, 검토 큐 | 위험도 기반 라우팅 | 정책 기반 자동 승인·보류 분기 |
| RAG · Knowledge Ingestion | ★★ | Buy + Build 조합 | OCR · Parser · Chunking · Embedding · Vector Index | 지식 품질 평가 · 문서 버전 관리 | 자동 지식 갱신 Workflow |
| LLM · Agent Framework | ★ | Buy / Borrow 우선 | Tool Calling, 기본 Agent Flow | Agent Routing · State Memory · Work Context | Multi-Agent Collaboration |
| EvalOps · Reliability | ★★ | Borrow + 내부 기준 설계 | 평가 데이터셋 · Human Review | Regression Test · Reliability Score | Continuous Reliability Testing |
| Guardrails · Policy Engine | ★★ | Buy/Borrow + 고객 정책 커스터마이징 | 금지행위 · 권한 · 민감정보 제한 | 정책 기반 실행 제한 | 동적 정책 적용 / 위험도 기반 제어 |
| Observability · Trace · Audit | ★★ | 기존 도구 + Agent 로그 확장 | Decision Basis · Audit Link · Action Log | Cost · Usage · Quality Dashboard | Cross-Agent 운영 관측 |
| Operational Learning | ★★ | Build + Buy/Borrow 혼합 | Decision Log · Feedback Store | Skill Versioning · Feedback Loop | Self-Improving Loop · Skill Optimization |
| Service Experience | ★★ | Build + 자사·상용 솔루션 | Agent Portal · Review UI | 업무별 Copilot · Agent UX | Role-based Adaptive Experience |


### 9-3. Now · Near · Next 로드맵


| 단계 | 기간 감각 | 목표 | 주요 capability |
| --- | --- | --- | --- |
| Now | Pilot · 초기 구축 | 업무별 Agentic Pilot 구현 | RAG, Tool Calling, API 연계, HITL UI, Audit Log, 기초 Semantic |
| Near | 운영 전환 | 품질·통제·운영 안정화 | Agent Routing, Evaluation Pipeline, Guardrails, Usage·Cost Control, Skill Versioning |
| Next | 확장·고도화 | 운영 학습과 자율성 확대 | Self-Improving Loop, Multi-Agent Collaboration, Continuous Reliability Testing, Agent Marketplace |


### 9-4. Build · Buy · Borrow 의사결정 기준


| 판단 기준 | Build 우선 | Buy 우선 | Borrow 우선 |
| --- | --- | --- | --- |
| 고객 업무 특수성 | 높음 | 중간 | 낮음 |
| 보안·통제 요구 | 높음 | 중간 | 검증된 자산에 한정 |
| 기술 변화 속도 | 낮거나 고객화 중요 | 중간 | 매우 빠름 |
| Time-to-Market | 여유 있음 | 빠른 확보 필요 | 빠른 실험·검증 필요 |
| 차별화 축적 가능성 | 높음 | 자사 솔루션이면 높음 | 낮거나 간접적 |
| 운영 책임 | 직접 책임 필요 | 벤더·자사 솔루션 책임 병행 | 내부 검증 후 제한적 적용 |


---

## [A] (별첨) 내부 검토용 · 사업화 확장 항목

> ※ 본 별첨은 내부 검토용 사업화 확장 항목 입니다. 고객 외부 공유 시에는 본 섹션을 분리하거나 별도 내부 보고 문서 로 운용하는 것을 권장합니다.


| 내부 검토 항목 | 추후 상세화 방향 |
| --- | --- |
| 사업 기회와 1차 타겟 | 산업별 우선순위, 고객군, 첫 적용 업무, 매출 가능성 |
| 오퍼링 패키지화 | Assessment, Controlled Pilot, Build, Operate & Improve 단계별 산출물과 과금 구조 |
| R&R | 사업개발, 영업, 수행총괄, 기술조직, 보안·컴플라이언스, 파트너 역할 |
| 비용·견적 구조 | 인력 투입, 파트너 비용, 솔루션 비용, 운영 비용, Pilot·본구축 견적 기준 |
| Build · Buy · Borrow | 직접 책임 영역, 자사·상용 솔루션 활용 영역, 파트너·외부 검증 자산 활용 영역 |
| Action Plan | 3개월·6개월 실행 로드맵, 고객 접촉 계획, 데모·제안서 제작, 레퍼런스 Pack화 |
| 리스크와 대응책 | 데이터 연계, 보안, 모델 품질, 운영 책임, 파트너 종속, 과도한 자동화 리스크 |


---


Agentic AI Platform 고객용 선제안서 · v0.5.1 · v280 무게중심 재배치 (문제의식 → 해결방안 → 정의·위치 → 아키텍처)
2026-05-26