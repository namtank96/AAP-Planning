# AAP 통합 구조와 수행 모델 — 보수적 Build 관점 정리

> 목적: 기존 AAP 선제안 문서의 04장 `AAP Offering Map`을 확장·정리하기 위한 텍스트 초안  
> 관점: 고객 선제안과 내부 사업화 검토를 동시에 고려하되, KT DS 직접 수행(Build) 범위는 일반 대형 SI사의 현재 AI 사업 추진 수준에 맞춰 보수적으로 정의  
> 핵심 방향: AAP는 특정 AI 솔루션 자체 개발 사업이 아니라, 고객 업무·데이터·시스템·권한·운영 체계를 Agentic AI 구조로 연결하는 구축형 SI 오퍼링

---

## 1. 정리 방향

2번 `Reference Architecture`와 3번 `Build / Bring / Borrow`는 별도 장표로 분리하기보다, 하나의 장표 또는 하나의 섹션 안에서 **AAP 통합 구조와 수행 모델**로 합치는 것이 적절하다.

다만 Build / Bring / Borrow라는 표현을 전면에 내세우면 문서가 기술 검토표나 조달 검토표처럼 보일 수 있다. 따라서 본문에서는 다음과 같은 표현 방식을 권장한다.

| 표현 방식 | 의미 | 문서 내 표현 |
|---|---|---|
| 검정 실선 | KT DS가 직접 설계·구축·통합을 주도할 수 있는 영역 | 직접 수행 중심 영역 |
| 회색 점선 | 고객 기존 자산, 외부 솔루션, 파트너 전문성을 연결·조합하는 영역 | 외부 자산 조합 / 고객 자산 연결 영역 |
| 제한적 강조색 | AAP의 차별화가 누적되는 핵심 영역 | Business Semantic / Operational Learning 중심 |

이 방식은 상부 보고에서 한 장으로 보기 쉽고, 고객에게도 “우리가 무엇을 책임지고, 무엇은 조합하는가”를 과도한 기술 용어 없이 전달할 수 있다.

---

## 2. KT DS 직접 수행 영역의 보수적 정의

KT DS가 직접 수행한다고 표현할 영역은 “기술 자체를 모두 보유하거나 자체 개발한다”는 의미가 아니다. 일반 대형 SI사가 현재 AI 사업에서 현실적으로 책임질 수 있는 범위에 맞춰, 다음 수준으로 보수적으로 정의하는 것이 적절하다.

### 2.1 직접 수행 중심 영역

KT DS가 직접 수행 중심으로 가져갈 수 있는 영역은 다음과 같다.

1. **고객 업무 분석 및 Use Case 구체화**  
   고객의 반복 업무, 의사결정 흐름, 승인·예외 처리, 시스템 입력 지점을 분석하고 AAP 적용 범위를 정의한다.

2. **업무 의미·정책·권한 구조화 설계**  
   온톨로지나 Knowledge Graph 엔진 자체를 직접 개발한다기보다, 고객 업무 개념, 정책, 권한, 예외 기준, 판단 규칙을 구조화하는 분석·설계 역할을 수행한다.

3. **시스템 연계 및 통합 설계**  
   고객의 ERP, CRM, SCM, 그룹웨어, KMS, 문서 저장소, API, RPA 대상 시스템과 AAP 실행 흐름을 연결하는 통합 구조를 설계하고 구축을 주도한다.

4. **Workflow / Writeback / 검토 UI 통합**  
   Agent 결과가 실제 업무 프로세스, 승인 흐름, 리포트, 시스템 반영으로 이어지도록 Workflow, API/RPA, Review UI를 고객 환경에 맞게 통합한다.

5. **운영 로그·감사·품질 관리 체계 설계**  
   Decision Log, Action Log, 피드백 수집, 운영 리포트, 감사 추적, 품질 점검 체계를 설계하고 운영 프로세스에 반영한다.

6. **보안·권한·폐쇄망 요건 반영**  
   공공·금융·국방 등 규제 산업의 IAM, 접근권한, 감사, 망분리, 폐쇄망 배포 요건을 반영한 구축·운영 구조를 설계한다.

7. **PMO / SI 수행 관리 / 운영 전환**  
   파트너 솔루션, 고객 시스템, 내부 개발 요소를 통합 관리하고, 구축 이후 운영 조직·운영 프로세스로 전환한다.

### 2.2 직접 개발로 표현하지 않는 영역

다음 영역은 현재 단계에서 KT DS가 직접 개발한다고 표현하지 않는 것이 안전하다. 대신 **솔루션 조합**, **파트너 활용**, **고객 자산 연계**, **통합 SI** 관점으로 표현하는 것이 적절하다.

- Foundation Model / LLM 자체 개발
- 범용 Agent Framework 자체 개발
- Vector DB, RAG Engine, Document Parser 자체 개발
- Ontology / Knowledge Graph 전문 엔진 자체 개발
- Workflow Engine, RPA Platform 자체 개발
- EvalOps / Observability 전문 플랫폼 자체 개발
- 보안 솔루션, DLP, SIEM, Policy Engine 자체 개발
- 산업별 전문 지식 전체를 내부 인력만으로 확보

이 영역들은 AAP 구성에 필요하지만, KT DS의 직접 수행 영역이라기보다는 검증된 외부 솔루션, 파트너 전문성, 고객 기존 자산을 조합하는 영역으로 보는 것이 현실적이다.

---

## 3. 04장 교체용 본문 초안

## 04 · AAP 통합 구조와 수행 모델

### 리드 문장

AAP는 단일 AI 도구나 개별 솔루션 묶음이 아닙니다. 고객의 기존 데이터·문서·시스템을 대체하지 않고 연결한 뒤, 업무 의미화, Agent 판단, 시스템 실행, 운영 학습, 보안·통제를 하나의 실행 구조로 묶는 **Enterprise Agentic AI 운영 모델**입니다.

### 설명 문장

이 구조는 고객이 실제로 사용하는 AI 업무 서비스부터, 그 아래에서 작동하는 업무 의미·Agent 실행·시스템 반영·운영 학습 체계까지 한 화면에서 보여줍니다. KT DS는 고객 업무 분석, 시스템 연계, 실행·통제 구조 설계, 운영 전환을 중심으로 구축을 주도하고, 범용 모델·프레임워크·전문 솔루션은 검증된 외부 자산과 조합합니다.

### 구조도 읽는 법

- **검정 실선 영역**: KT DS가 직접 설계·구축·통합을 주도할 수 있는 영역
- **회색 점선 영역**: 고객 기존 자산, 외부 솔루션, 파트너 전문성을 연결·조합하는 영역
- **강조 영역**: AAP의 차별화가 누적되는 핵심 영역
  - Business Semantic Modeling: 고객 업무 의미·정책·권한·판단 기준을 구조화
  - Operational Learning: 실행 이력·피드백·스킬을 운영 자산으로 축적

---

## 4. 구조도 내 텍스트

### Customer Environment

**AAP가 새로 대체하지 않고 연결하는 고객 기존 자산**

Data Platform · ERP / CRM / SCM · Groupware / KMS · Document Repository · External API · Security Zone

고객의 기존 데이터 플랫폼과 업무 시스템은 AAP의 입력이자 실행 대상입니다. AAP는 이를 대체하지 않고, Agent가 이해하고 실행할 수 있는 업무 구조로 연결합니다.

**표현 권장**: 회색 점선 영역  
**의미**: 고객 기존 자산 연결 영역

---

### Service Experience

**현업 사용자가 접하는 AI 업무 서비스**

- **AI Agent Portal**  
  업무별 Agent를 검색·실행하고, 실행 이력과 결과를 확인하는 업무 진입점

- **Horizontal Agents**  
  문서 검색, 보고서 작성, 회의록, VOC, 사내 질의응답 등 부서 공통 업무 Agent

- **Vertical Agents**  
  금융, 공공, 제조, 유통, 협회, 국방 등 산업·직무별 판단 기준을 반영한 전문 Agent

- **Review / Approval UI**  
  사람 검토가 필요한 단계에서 근거 확인, 승인, 반려, 예외 처리를 지원하는 검토 화면

**표현 권장**: 검정 실선 + 일부 회색 점선 혼합  
**의미**: KT DS는 고객 업무에 맞는 서비스 구조와 UI 통합을 주도하되, 기존 사내·그룹 자산이나 외부 UI/UX 자산을 조합할 수 있음

---

## 5. AAP Core Operating Loop

**업무 의미 이해 → Agent 판단 → 시스템 실행 → 운영 학습의 닫힌 루프**

---

### 5.1 Enterprise Data & Inputs

**고객 데이터·문서·시스템을 AAP 실행 흐름에 연결**

고객의 데이터 플랫폼, 업무 시스템, 문서 저장소, 외부 API, 운영 로그를 AAP가 사용할 수 있는 입력으로 연결합니다. KT DS는 어떤 데이터와 시스템이 어떤 업무 판단에 필요한지 정의하고, 고객 환경에 맞는 통합 구조를 설계합니다.

주요 구성:

- System Connectors
- Data Platform Integration
- Document / Knowledge Integration
- Operational Log Integration
- Metadata & Lineage
- External Data Interface

**수행 관점**  
KT DS는 데이터·시스템 연계 구조 설계와 통합 수행을 주도합니다. 다만 Document Parser, Vector DB, Metadata Catalog, 외부 데이터 수집 도구 등은 검증된 솔루션이나 고객 기존 자산을 조합하는 방식이 적절합니다.

**표현 권장**: 검정 실선 + 회색 점선 혼합  
**보수적 해석**: 통합 설계와 연계 구축은 직접 수행, 전문 엔진은 외부 조합

---

### 5.2 Business Semantic Modeling

**업무 의미·정책·권한·판단 기준을 Agent가 사용할 수 있는 구조로 전환**

문서와 데이터를 단순 검색 대상으로 두지 않고, 고객 업무의 개념, 프로세스, 정책, 권한, 예외 기준으로 구조화합니다. 이 영역은 AAP의 핵심 차별화 영역이며, KT DS의 SI·KMS·업무 분석 경험이 직접 작동하는 구간입니다.

주요 구성:

- Domain Ontology
- Knowledge Graph
- Process / Decision Map
- Decision Rule Repository
- Authority Matrix
- System Map
- Semantic Quality Check

**수행 관점**  
KT DS는 고객 업무 분석, 정책·권한·프로세스 구조화, 시스템 맵핑, 의사결정 기준 정리를 주도합니다. 다만 Ontology / Knowledge Graph 전문 엔진, 자동 추론 도구, 도메인 전문 지식은 외부 솔루션과 파트너 전문성을 조합하는 것이 현실적입니다.

**표현 권장**: 핵심 박스는 검정 실선, 내부 일부 구성은 회색 점선  
**보수적 해석**: 업무 의미화 설계는 직접 수행, 전문 엔진·도메인 지식은 외부 조합

---

### 5.3 Agentic Reasoning & Execution

**Agent가 업무 목표를 해석하고, 필요한 도구와 절차를 선택해 실행 계획을 수립**

Agent는 업무 맥락과 정책 기준을 참조해 실행 단계를 계획하고, 필요한 도구와 API를 호출합니다. 범용 LLM, Agent Framework, Tool Calling 기술은 외부 솔루션을 조합할 수 있으나, 업무 흐름 설계, 실행 정책, 사람 검토 분기 기준은 고객 업무에 맞게 별도로 설계되어야 합니다.

주요 구성:

- Planning & Orchestration
- Work Context Memory
- Tool Registry / Runtime
- HITL & Action Policy
- Agent Routing
- Cost-Aware Routing

**수행 관점**  
KT DS는 Agent가 어떤 업무 절차를 따르고, 어떤 도구를 호출하며, 어느 지점에서 사람 검토로 넘겨야 하는지에 대한 업무 실행 흐름을 설계합니다. 반면 LLM, Agent Framework, Tool Runtime, 모델 라우팅 엔진 등은 외부 솔루션을 우선 조합하는 것이 적절합니다.

**표현 권장**: 회색 점선 비중 높음, 업무 정책·HITL 설계만 검정 실선  
**보수적 해석**: Agent Framework 자체 개발이 아니라, 업무 흐름·정책·검토 기준 설계 중심

---

### 5.4 Enterprise Integration & Action

**Agent 판단 결과를 실제 업무 시스템과 프로세스에 반영**

AAP의 차이는 답변 생성에서 끝나지 않고, 승인, 예외, 재처리, API/RPA 호출, 시스템 Writeback까지 연결한다는 점입니다. 이 영역은 레거시·기간계 시스템 통합 경험이 중요한 구간이며, KT DS가 상대적으로 직접 수행 책임을 가져갈 수 있는 핵심 영역입니다.

주요 구성:

- Workflow Engine
- API / RPA Connector
- Writeback Connector
- Report / Delivery
- Exception Queue
- Transaction Guard
- Runbook Packaging

**수행 관점**  
KT DS는 고객 업무 시스템 연계, API/RPA 연결, 승인·예외 프로세스 통합, 시스템 반영 구조 설계를 주도합니다. 다만 Workflow Engine, RPA Platform, API Gateway 등 기반 솔루션은 고객 기존 자산이나 외부 솔루션을 활용하는 것이 현실적입니다.

**표현 권장**: 검정 실선 중심 + 일부 솔루션 회색 점선  
**보수적 해석**: 시스템 통합·업무 반영 구조는 직접 수행, 플랫폼 제품은 외부 조합

---

### 5.5 Operational Learning

**실행 결과와 피드백을 지식·스킬·판단 이력으로 축적**

Agent가 수행한 판단 근거, 도구 호출, 실행 결과, 사용자 피드백, 예외 처리 이력을 운영 자산으로 축적합니다. 이 데이터는 다음 업무의 의미 모델, 실행 정책, Agent 스킬 개선에 다시 반영되며, AAP가 시간이 지날수록 고객 업무에 더 잘 맞게 진화하는 기반이 됩니다.

주요 구성:

- Decision / Action Log
- Feedback Store
- Evaluation Pipeline
- Skill Library
- Skill Approval Workflow
- Experiment & Versioning
- Improvement Candidate

**수행 관점**  
KT DS는 어떤 이력을 남기고, 어떤 피드백을 수집하며, 어떤 운영 리포트와 개선 프로세스로 연결할지 설계합니다. 다만 EvalOps 플랫폼, 모델 평가 자동화 도구, Observability 전문 솔루션은 외부 자산을 조합하는 것이 적절합니다.

**표현 권장**: 핵심 박스는 검정 실선, 평가·관측 도구는 회색 점선  
**보수적 해석**: 운영 학습 프로세스 설계는 직접 수행, 평가·관측 전문 도구는 외부 조합

---

## 6. Trust · Security · Governance

**기업 환경에서 안전하게 운영하기 위한 공통 기반**

AAP는 업무 실행형 AI이기 때문에, 보안·권한·감사·설명 가능성·사람 검토 체계가 전 영역에 공통으로 적용되어야 합니다. 특히 공공, 금융, 국방 등 규제 산업에서는 폐쇄망·Private Deployment와 감사 가능한 실행 이력이 도입 조건이 됩니다.

주요 구성:

- IAM / SSO
- Data Security
- Audit / Explainability
- Guardrails / Policy
- Closed / Private Deployment
- Usage & Cost Control
- Agent Observability
- Quality Review

**수행 관점**  
KT DS는 고객 보안 요건, 권한 체계, 감사 기준, 폐쇄망 운영 조건을 반영한 구축 구조를 설계하고 통합합니다. 다만 IAM, DLP, SIEM, Policy Engine, Guardrails 전문 솔루션은 고객 기존 자산 또는 보안 파트너 솔루션을 조합하는 것이 적절합니다.

**표현 권장**: 검정 실선 하단 기반 + 전문 솔루션은 회색 점선  
**보수적 해석**: 보안·감사 요건 반영과 통합은 직접 수행, 보안 제품은 외부 조합

---

## 7. 수행 모델 관점

AAP는 모든 기술을 자체 개발하는 방식이 아닙니다. KT DS는 고객 업무와 시스템 통합, 실행·통제·운영 구조를 중심으로 구축을 주도하고, 범용 모델·프레임워크·전문 도구는 검증된 솔루션과 파트너 자산을 조합합니다.

### 7.1 KT DS 직접 수행 중심 영역

- 고객 업무 분석 및 AAP 적용 범위 정의
- 업무 프로세스·정책·권한·예외 기준 구조화
- 고객 시스템 연계 구조 설계
- Workflow / API / RPA / Writeback 통합
- Review / Approval / Exception 처리 구조 설계
- Decision Log / Feedback / 운영 리포트 설계
- 보안·권한·감사·폐쇄망 요건 반영
- 구축 PMO, 파트너 통합 관리, 운영 전환

### 7.2 외부 자산 조합 영역

- LLM / sLLM / Embedding Model
- Agent Framework
- Vector DB / Search Engine
- Document Parser / OCR
- Ontology / Knowledge Graph 전문 도구
- Workflow Engine / RPA Platform
- API Gateway
- EvalOps / Observability Platform
- IAM / DLP / SIEM / Guardrails 등 보안 솔루션
- 산업별 전문 SME / 규제 전문 파트너

### 7.3 고객 자산 연결 영역

- Data Platform
- ERP / CRM / SCM
- Groupware / KMS
- Document Repository
- Legacy System
- Internal API
- Security Zone
- Existing IAM / Audit System

> KT DS의 역할은 특정 모델이나 도구를 자체 보유하는 데 있지 않습니다. 고객의 업무 의미, 권한, 시스템, 검토 절차, 운영 기준을 하나의 실행 가능한 Agentic AI 구조로 연결하고, 이를 실제 운영 가능한 SI 오퍼링으로 구현하는 데 있습니다.

---

## 8. 구조도 안에 넣을 짧은 문구

### 상단

**Service Experience**  
현업이 사용하는 AI 업무 서비스

### 좌측

**Customer Environment**  
고객 기존 자산과 업무 시스템  
Data Platform · ERP / CRM / SCM · KMS · Document · API · Security Zone

### 중앙 흐름

**Enterprise Data & Inputs**  
데이터·문서·시스템 연결

**Business Semantic Modeling**  
업무 의미·정책·권한 구조화

**Agentic Reasoning & Execution**  
Agent 판단·계획·도구 호출

**Enterprise Integration & Action**  
Workflow · API/RPA · Writeback

**Operational Learning**  
실행 이력·피드백·스킬 자산화

### 하단

**Trust · Security · Governance**  
권한 · 감사 · 설명성 · Guardrails · 폐쇄망

### 범례

**검정 실선** · KT DS 직접 설계·구축·통합 주도 영역  
**회색 점선** · 고객 자산·외부 솔루션·파트너 조합 영역  
**강조색** · AAP 차별화 및 장기 자산화 영역

---

## 9. 최종 정합성 점검

이번 수정 방향은 다음 점에서 정합적이다.

1. **고객 선제안 목적과 맞음**  
   AAP를 기술 아키텍처가 아니라 업무 실행 운영 모델로 설명한다.

2. **상부 보고 요구와 맞음**  
   한 장 구조도 안에서 고객 자산, AAP 작동 구조, KT DS 수행 범위, 외부 조합 영역을 동시에 볼 수 있다.

3. **현재 AI 사업 추진 현실과 맞음**  
   KT DS 직접 수행 영역을 모델·프레임워크 자체 개발이 아니라 업무 분석, 통합 설계, 시스템 연계, 운영 통제, SI 수행 관리 중심으로 보수적으로 정의한다.

4. **기존 문서 구조와 맞음**  
   기존 7개 영역 구조를 유지하되, 04장을 `오퍼링맵`에서 `통합 구조와 수행 모델`로 확장한다.

5. **향후 PPTX 전환에 유리함**  
   검정 실선, 회색 점선, 제한적 강조색만 사용하면 복잡도가 낮고 한 장 구조도로 전환하기 쉽다.

따라서 최종적으로는 다음 방향을 권장한다.

- 1번 고객 공통 요구사항은 별도 보강
- 2번 Reference Architecture와 3번 Build / Bring / Borrow는 `AAP 통합 구조와 수행 모델`로 통합
- 직접 수행 영역은 보수적으로 정의
- 기술명은 세부 설명이나 부록으로 내리고, 본문은 업무·운영·수행 책임 중심으로 구성
- 4번 구축 프로세스는 후속 논의 또는 부록으로 유지
