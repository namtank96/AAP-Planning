# Agentic AI Platform (AAP) 기획안

> **버전**: v2.0
> **작성일**: 2026-05-20
> **작성**: KT DS · AX BD
> **목적**: 고객 선제안용 — Data Platform 이후의 다음 과제로 AAP를 인식시키고 후속 논의를 만드는 자료
> **기반 자료**: `aap_proactive_offering_v100 (1).html`, `aap_offering_map_v07.html`
> **v1.0 대비 주요 변경**: 1~3장 톤다운 (설득형 문장으로 다듬음) · AAP 정의 + Future Capabilities 블록 신설 · 적용 레퍼런스를 전략 로드맵·Strategic Plays 구조로 재편 · Past/Present/Future 섹션은 Future Capabilities로 흡수

---

## 한 줄 정의

> **Data Platform이 정보를 보게 했다면, AAP는 업무를 수행하게 합니다.**

**AAP**는 고객의 데이터·문서·시스템을 **업무 의미로 구조화**하고, Agent가 **판단·실행·검토**하며, 운영 결과를 **지식·스킬·판단 이력으로 축적**하는 **구축형 Enterprise Agentic AI Platform**입니다.

### 핵심 키워드
- Data Platform 이후의 실행 계층
- Business Semantic 중심
- Writeback / HITL / Closed Network
- SI 경험 기반 선제안
- 검증 케이스 보유 (자산운용 · 산업단체)

---

## 1. 기업 AI 활용의 현재 위치

많은 기업이 생성형 AI PoC, 챗봇, 문서 요약, 검색 자동화까지는 경험했습니다. 이제 다음 과제는 **AI를 실제 업무 흐름 안에서 실행 가능한 운영 체계로 전환하는 것**입니다.

| 단계 | 상태 | 설명 |
|---|---|---|
| **① PoC 단계** | 가능성은 확인했지만, 운영 전환은 제한적 | 생성형 AI PoC는 데모와 파일럿 단계에서 충분한 가능성을 보여주었습니다. 그러나 실제 업무 프로세스에 연결되어 지속적으로 사용되는 운영형 사례는 아직 제한적입니다. |
| **② 단일 업무 자동화** | 챗봇·요약·검색 등 점 단위 활용에 머무름 | FAQ 챗봇, 문서 요약, 사내 검색, RPA 보조 등은 개별 업무의 생산성을 높이고 있습니다. 다만 업무 흐름 전체를 이해하고 다음 단계까지 이어서 처리하는 구조로는 확장되지 못하고 있습니다. |
| **③ 인적 개입의 지속** | 판단·승인·실행은 여전히 사람이 담당 | AI가 답변과 초안을 만들더라도 정책 판단, 예외 처리, 승인, 시스템 입력은 여전히 현업과 IT가 수행합니다. 결국 AI와 업무 시스템 사이의 마지막 공백을 사람이 메우는 구조가 남아 있습니다. |

### 시장 진단 보조 지표
Gartner·Deloitte 등의 조사에서 **AI 도입의 70~80%가 PoC 단계에서 운영 전환에 실패**하는 것으로 보고됩니다. 원인은 단일 기술 한계가 아니라 구조적 결핍입니다 (다음 장 참조).

---

## 2. AI의 운영 전환을 막는 4가지 공백

AI PoC가 운영으로 확장되지 못한 이유는 기술 가능성이 부족해서만은 아닙니다. 실제 업무에 적용되기 위해 필요한 **맥락·실행·통제·학습 구조**가 함께 갖춰지지 않았기 때문입니다.

| 구분 | 공백 | 설명 |
|---|---|---|
| **① 맥락** | 업무 맥락 부족 | 문서 검색과 답변은 가능하지만, 고객사의 정책, 프로세스, 권한, 예외 기준까지 이해하지는 못합니다. |
| **② 실행** | 시스템 실행 연계 부족 | AI의 답변이나 추천이 ERP, CRM, SCM, 그룹웨어, 결재 시스템의 실제 업무 처리로 이어지지 못합니다. |
| **③ 통제** | 신뢰·통제 체계 부족 | 어떤 근거로 판단했는지, 언제 사람이 검토해야 하는지, 어떤 실행을 제한해야 하는지에 대한 기준이 약합니다. |
| **④ 학습** | 운영 학습 구조 부족 | 질문, 답변, 실패, 예외 처리 이력이 다시 업무 지식과 Agent 스킬로 축적되는 구조가 부족합니다. |

---

## 3. 왜 지금 AAP가 필요한가

AAP는 기존 데이터 플랫폼이나 AI PoC를 대체하는 개념이 아닙니다. 이미 구축된 데이터·AI 자산 위에 **업무 맥락, 실행, 통제, 학습을 연결하는 Agentic Layer**를 더하는 접근입니다.

| 흐름 | 시사점 |
|---|---|
| **Data Platform 이후** | 데이터 플랫폼은 수집, 분석, 시각화 기반을 만들었습니다. 그러나 정책 판단, 승인, 예외 처리, 시스템 반영은 여전히 별도의 업무 절차와 사람의 개입에 의존하고 있습니다. |
| **PoC 이후** | 생성형 AI PoC를 통해 가능성은 확인되었습니다. 이제는 단일 기능 검증을 넘어, 업무 맥락과 시스템 실행, 검토 체계, 운영 학습이 결합된 플랫폼 구조가 필요합니다. |
| **Agentic AI 흐름** | 프론티어 모델과 Agent 프레임워크의 성숙으로 AI의 역할은 답변 생성에서 계획, 도구 호출, 실행 보조로 확장되고 있습니다. 기업 환경에서는 이를 안전하게 운영할 수 있는 AAP 구조가 필요합니다. |

### Data Platform / 개인 AI Tool / AAP 비교

| 구분 | Data Platform | 개인 AI Tool (GPT·Claude·Copilot) | **AAP** |
|---|---|---|---|
| **목적** | 데이터 수집·저장·분석 | 질의응답·요약·초안 생성 | **업무 이해·판단·실행·검토** |
| **핵심 단위** | 데이터셋, 파이프라인, 대시보드 | 프롬프트, 대화, 문서 | **업무 프로세스, 정책, 도구, 결정, 실행 로그** |
| **결과물** | BI, 리포트, 데이터 서비스 | 답변, 문서 초안, 요약 | **Copilot, Workflow, API/RPA 실행, 시스템 반영** |
| **4가지 공백을 어떻게 메우나** | 맥락·실행·통제·학습 모두 사람이 수행 | 맥락·실행·통제·학습 연계 약함 | ① 업무 온톨로지로 **맥락** 확보 / ② Tool·Workflow로 **실행** 연결 / ③ 감사·승인·HITL로 **통제** / ④ 실행 로그·피드백으로 **학습** |

---

## 3-1. AGENTIC AI PLATFORM · 정의

> **AAP는 무엇이며, 어디로 향하는가**
> *개별 AI 기술의 묶음이 아닌, 기업 업무를 처음부터 끝까지 수행하는 닫힌 루프 구조*

AAP는 LLM·RAG·Agent Framework 같은 개별 기술의 묶음이 아닙니다. **업무 맥락 이해(Semantic) → 판단·도구 호출(Agentic Reasoning) → 시스템 실행(Action) → 운영 학습(Learning)** 이 하나의 닫힌 루프로 연결된 **기업용 Agentic AI Platform**입니다.

현업이 마주하는 **Service Experience**, AAP가 일하는 **5단계 Core 흐름**, 모든 층을 받치는 **Trust · Foundation**의 3개 층으로 구성되며, Data Platform·PoC 자산 위에 얹혀 **운영 가능한 업무 실행 계층**을 더합니다.

### 왜 단순 RAG가 아닌가 · 진흥회 회원사 통보 시나리오

| | **단순 RAG** | **AAP** |
|---|---|---|
| **응답 방식** | *"미국이 X 품목에 25% 관세를 부과합니다."* — 문서를 검색해 요약만 함 | 업무 맥락을 이해해 차등 대응 (아래 3단계) |
| **Step 01** | — | **회원사 매핑** · Knowledge Graph로 이 회원사가 X 품목을 어느 시장에 수출 중인지 확인 |
| **Step 02** | — | **영향도 판단** · 관세·환율·규제 룰로 회원사별 매출 영향을 계산 |
| **Step 03** | — | **차등 통보** · 회원사 등급·노출도에 따라 통보 양식·우선순위·대응 가이드를 다르게 적용 |

> **RAG는 *문서 검색의 기법*이고, AAP는 *업무 의미·정책·권한을 Agent가 사용할 수 있는 구조로 전환*합니다.** 이 구조는 6-2장 진흥회 케이스에서 이미 검증된 영역입니다.

### AAP가 향하는 다음 단계 · Future Capabilities

| Capability | 의미 | 가치 |
|---|---|---|
| **Operational Learning Loop** | Decision Log·피드백이 다시 Semantic·Skill로 환류 | 운영할수록 정확해지는 시스템 — 일반 AI는 노후화되지만 AAP는 진화 |
| **Skill Library · Agent Marketplace** | 업무 능력의 재사용 자산화 | Agent 스킬이 산업·고객 간 이식 가능한 자산이 됨 |
| **HITL + Decision Control** | 자율 실행과 사람 검토의 정책 기반 분리 | 위험·예외에 따른 통제 자동화 |
| **EvalOps · Guardrails** | 품질·안전성의 지속적 자동 검증 | 모델·스킬·정책의 버전 관리와 회귀 테스트 |
| **Tool Registry 진화** | MCP·OpenAPI 기반 도구 생태계 확장 | Agent가 사용할 수 있는 능력의 지속 확장 |
| **Closed · Private Deployment** | 폐쇄망·규제·감사 요구를 만족하는 통제형 배포 | 공공·금융·국방까지 적용 가능 |

> AAP는 **Past(이미 해온 SI·KMS·AICC·폐쇄망 경험) + Present(LLM·RAG·Agent Framework·MCP) + Future(위 6대 Future Capabilities)** 의 연속선 위에서 구축됩니다.

---

## 4. AAP Offering Map

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

- Domain Ontology (OWL · RDF · SKOS)
- KMS / Domain Dictionary (Taxonomy · Controlled Vocabulary)
- Knowledge Graph (Property Graph · RDF Triplestore · SPARQL/Cypher)
- Process Map (BPMN · CMMN · Process Mining)
- Decision Rule Repository (DMN · Drools/OPA)
- System Map (ArchiMate · API Inventory)
- Authority Matrix (RBAC · ABAC · ReBAC)

#### ④ Agentic Reasoning & Execution — Agent 실행 코어
- Planning Engine (ReAct · Plan-and-Execute · Reflexion)
- Work Context Memory (Short/Long-term · Vector Store · Episodic)
- Agent Routing (Supervisor · Multi-agent Orchestration)
- Tool Registry / Tool Calling Runtime (MCP · OpenAPI · Function Calling)
- HITL Routing · Action Policy (Policy as Code · OPA · Guardrails)
- Prompt / Skill Template

#### ⑤ Enterprise Integration & Action — 업무 시스템 반영
- Copilot UI / Review·Approval UI
- Workflow Engine / API Gateway
- RPA Connector / Writeback Connector
- Report · Dashboard · Monitoring

#### ⑥ Operational Learning — 운영 자산화 ★
- Decision Log · Action Log
- System Knowledge · Skill Library
- Feedback Store · Evaluation Pipeline
- Versioning · Knowledge Update Workflow

#### ⑦ Foundation — Trust · Security · Governance
- IAM / SSO
- Data Security
- Audit / Lineage
- Explainability
- Guardrails
- **Closed / Private Deployment** (1차 타겟 산업 모두 폐쇄망)
- Tenant Governance

---

## 5. 선제안용 Top 4 차별화

Multi-LLM 등은 기본 기능으로 보고, 고객 의사결정에 더 직접적인 4가지를 전면에 둡니다.

| # | 차별화 요소 | 왜 강한가 |
|---|---|---|
| **1** | **Business Semantic Modeling** | KT DS의 KMS·AICC 경험과 SI 본업이 정면 작동. 일반 AI Studio·LLM Gateway가 다루지 못하는 부분. |
| **2** | **Enterprise System Writeback** | 답변형 AI와 실행형 AI의 가장 큰 차이. 레거시·기간계 통합 노하우가 정면 작동. |
| **3** | **Operational Learning Loop** | 시간 가치가 누적되는 구조. 일반 AI 시스템은 노후화되지만 AAP는 진화. **장기 해자**. |
| **4** | **Closed / Private Deployment** | 1차 타겟 산업(공공·금융)이 모두 폐쇄망. KT그룹 보안 자산과 결합. |

---

## 6. 적용 레퍼런스 — 검증된 것과 사업 확장 방향

AAP는 신규 개념이 아닙니다. Offering Map 구성요소가 이미 **내부 프로젝트**와 **선제안 PoC**에서 작동·검증되고 있으며, 이를 통합·일반화한 것이 AAP입니다. 두 케이스가 각자 **다른 축**을 입증했고, 각자 비워둔 영역이 거꾸로 상대 케이스의 검증 영역과 맞물립니다.

### 6-1. AI 투자 메이트 · Reference · 내부 프로젝트

**도메인** · 자산운용 · 투자 의사결정

매크로·뉴스·블룸버그 데이터를 통합해 투자 자문을 생성하는 LangGraph 기반 멀티에이전트. 데이터 수집 → 멀티에이전트 분석 → 자문 생성까지 E2E 검증 완료.

| ✓ 검증된 영역 | + AAP로 보완 |
|---|---|
| **Inputs** · 외부 데이터(블룸버그·뉴스·매크로) 통합 | **Semantic** · 투자 정책·룰·권한 구조화 |
| **Agentic** · LangGraph 멀티에이전트 분석·자문 생성 | **Action** · 주문·기록 시스템 Writeback / Workflow |
| **Service** · Vertical Agent 형태의 자문 서비스화 | **Learning · Trust** · Decision Log · HITL · 감사·설명성 |

#### 사업 확장 로드맵 · 단일 자문 Agent에서 Vertical Decision Pack으로

자산운용 1차 진입 → 자문형 의사결정 영역(법무·세무·M&A) 패턴 복제 → Vertical Decision Pack 자산화.

| 단계 | 시점 | 핵심 액션 |
|---|---|---|
| **현재** | FY26 1H | 내부 E2E 검증 완료, **외부 영업 자료화** 진행 |
| **단기** | FY26 2H | KT그룹 금융 채널 1차 PoC, **외부 자산운용사 1-2곳 영업 진입** |
| **중기** | FY27 | 자문형 의사결정(법무·세무·M&A)으로 **패턴 복제** |
| **장기** | — | Vertical Decision Agent **표준 Pack** 자산화 · 산업별 복제 |

#### Strategic Plays

- **PLAY 1 · 금융 컴플라이언스 패키징**
  운용 한도·감사 추적·HITL 통제를 AAP의 **Semantic·Foundation**에 매핑한 "금융 자문 AAP" 패키지 제작 → 금융권 영업 시 즉시 제시 가능

- **PLAY 2 · 파트너 결합형 통합 SI 카드**
  비투엔(RAG) · 인핸스(온톨로지) 결합 통합 SI 제안서로 **자체 모델 한계를 파트너 자산으로 보완** → 수주 경쟁력 확보

---

### 6-2. 한국기계산업진흥회 온톨로지 · POC 선제안 · 1차 완료

**도메인** · 공공·협회 · 기계산업

국제 정세·통상규제·환율 변화를 기계산업 도메인 온톨로지로 구조화해 회원사별 영향도를 분석·통보하는 의사결정 자동화. 1차 사업 완료, 기술 세미나 진행 중.

| ✓ 검증된 영역 | + AAP로 보완 |
|---|---|
| **Semantic** · 기계산업 도메인 온톨로지 · Knowledge Graph | **Inputs** · 정세·환율·규제 외부 데이터 자동 수집 |
| **Semantic** · 회원사 영향도 분석 룰 설계 | **Agentic** · 자율 추론·도구 호출 자동화 |
| **방법론** · 도메인 SME 협업 · 규제·정책 모델링 | **Action** · 회원사 통보·리포팅 Workflow |
| | **Trust** · 폐쇄망·감사 (공공 요건) |

#### 사업 확장 로드맵 · 1개 단체 PoC에서 Public Decision Pack으로

진흥회 본 사업 → 유사 산업단체로 수평 복제 → 진흥기관·공공 정책분석 카테고리화.

| 단계 | 시점 | 핵심 액션 |
|---|---|---|
| **현재** | FY26 1H | 1차 사업 완료, **기술 세미나 → 본 사업 RFP 대응** |
| **단기** | FY26 2H | 본 사업 수주, **회원사 통보 자동화 본 구축** |
| **중기** | FY27 | 자동차·반도체·무역·섬유 협회로 **수평 복제** |
| **장기** | — | 공공 진흥기관 정책분석 **Public Decision Pack** 자산화 |

#### Strategic Plays

- **PLAY 1 · 산업단체 온톨로지 표준 템플릿화**
  1차 사업의 기계산업 온톨로지를 재사용 가능한 **"산업단체 도메인 템플릿"** 으로 자산화 → 신규 단체 진입 리드타임 단축

- **PLAY 2 · 공공 폐쇄망 결합 카드**
  KT그룹 보안·망분리·감사 자산 + 보안 파트너(디피니트 등) 결합으로 **공공 통제형 AAP 패키지** 제작 → 공공 시장 진입 카드

---

### 6-3. 두 케이스의 상호 보완성

| 축 | AI 투자 메이트 | 진흥회 온톨로지 |
|---|---|---|
| **검증된 영역** | Inputs · Agentic · Service | Semantic |
| **AAP로 보완** | Semantic · Action · Learning · Trust | Inputs · Agentic · Action · Trust |
| **패턴 자산화 방향** | Vertical Decision Pack (자문형) | Public Decision Pack (정책·산업단체) |

> 두 케이스가 비워둔 영역이 거꾸로 상대 케이스의 검증 영역과 맞물립니다. **AAP는 이 둘을 통합·일반화해 산업·고객에 재적용 가능한 형태로 결합하는 오퍼링**입니다.

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
| **디피니트** | ⑦ Foundation | 폐쇄망·망분리·보안 규제 대응. | 통합 SI · 공공 시장 결합 |

### 활용 4 모델
1. **라이선스·OEM**: 파트너 솔루션을 AAP 컴포넌트로 도입 (스켈터랩스·아이브릭스·비투엔·파수)
2. **공동 PoC**: 산업별 케이스 진입 (인핸스·직스에이아이)
3. **통합 SI**: 파트너 솔루션의 한국 시장 SI 파트너 자리
4. **전략 협업**: 글로벌 Frontier(Anthropic·OpenAI·Google Cloud) 한국 진입 시 현지 SI 파트너 자리

---

## 10. 산업별 적용 예시

AAP는 특정 산업 전용 솔루션이 아니라, **문서·정책·시스템·검토 흐름이 많은 업무**에 우선 적용 가능합니다.

| 산업 | 시작 Use Case | AAP 적합 이유 |
|---|---|---|
| **제조** | 작업표준·품질·설비 매뉴얼 Agent | 문서·설비·품질 이력이 많고 현장 대응 니즈가 큼 |
| **유통** | 매장 운영·프로모션 정책 Agent | 정책 변경과 CS 대응이 잦음 |
| **물류** | 배송 예외·클레임 처리 Agent | 예외 처리와 시스템 연계가 중요 |
| **공공** | 민원·행정 지식 AI KMS · 산업단체 정책 분석 | 법령·지침·근거 제시 필요 (6-2 케이스로 검증) |
| **금융** | 운용역 자문·내부통제·컴플라이언스 | 규제·승인·감사 요구 (6-1 케이스로 검증) |
| **국방** | 폐쇄망 정비·운영 매뉴얼 Agent | 보안·망분리·정비 지식 활용 필요 |
| **교육** | 학사·교무·상담 AI KMS | 규정·FAQ·상담 지식 활용성이 높음 |

---

## 11. Why AAP / Why SI / Why KT DS

| Why AAP | Why SI | Why KT DS |
|---|---|---|
| Data Platform 이후의 실행 계층 | 고객 레거시 시스템과 깊은 연동 | KMS·AICC·SI·ITO 경험의 확장 |
| PoC·챗봇을 운영 업무로 확장 | 업무 프로세스·권한·승인 구조 이해 | Business Semantic·Writeback 중심 제안 |
| 업무 의미·정책·판단 기준을 Agent가 활용 | 구축·운영·개선 책임 인수 | 폐쇄망·보안·운영 환경 대응 가능 |
| 의사결정 자산이 시간 누적되는 구조 | 폐쇄망·규제 환경 대응 | 검증 케이스 보유 (자산운용·산업단체) |

---

## 12. Next Step — Discovery Workshop (2~4주)

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

## 13. Closing — Next Discussion 안건

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
| v1.0 | 2026-05-20 | MD | v0.7 + v1.00 통합 정리본 |
| **v2.0** | **2026-05-20** | **MD** | **(1) 1~3장 톤다운 — "현주소→현재 위치", "빈 곳→공백", "사람 의존성→인적 개입 지속" / (2) AAP 정의 + Future Capabilities 6대 블록 신설(3-1장) / (3) 적용 레퍼런스를 2개 케이스 × 검증/보완 × 사업 확장 로드맵 × Strategic Plays 구조로 재편 / (4) Past/Present/Future를 Future Capabilities로 흡수 / (5) 산업별 예시에 금융·공공 검증 케이스 연결 / (6) Business Semantic Modeling 별도 장 제거 → 정의 블록 안 "단순 RAG vs AAP 시나리오" 한 컷으로 흡수 (선제안 톤 정제, 기술 키워드 부담 완화)** |
