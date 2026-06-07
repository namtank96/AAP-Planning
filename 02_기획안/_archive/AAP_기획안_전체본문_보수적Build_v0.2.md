# Agentic AI Platform (AAP) 기획안

> **버전**: v0.2 전체 본문 정리본  
> **목적**: 고객 선제안용 + 내부 사업화/수행 논의용  
> **작성 관점**: 고객에게는 Data Platform 이후의 다음 과제로 AAP를 인식시키고, 내부에는 KT DS가 어떤 영역을 직접 수행하고 어떤 영역을 외부 자산과 조합할지 판단할 수 있도록 정리

---

## 한 줄 정의

> **Data Platform이 정보를 보게 했다면, AAP는 업무를 수행하게 합니다.**

**AAP**는 고객의 데이터·문서·시스템을 **업무 의미로 구조화**하고, Agent가 **판단·실행·검토**하며, 운영 결과를 **지식·스킬·판단 이력으로 축적**하는 **구축형 Enterprise Agentic AI Platform**입니다.

AAP는 특정 LLM, 챗봇, RAG 솔루션, Agent Framework 하나를 의미하지 않습니다. 고객의 기존 데이터 플랫폼과 업무 시스템 위에 **업무 맥락, Agent 실행, 시스템 반영, 운영 통제, 학습 구조**를 더하는 실행 계층입니다.

### 핵심 키워드

- Data Platform 이후의 업무 실행 계층
- Business Semantic 중심의 업무 의미화
- Agentic Reasoning + Tool Use + Workflow
- Enterprise System Writeback
- HITL / Audit / Guardrails / Closed Network
- 운영 학습과 Skill 자산화
- SI 경험 기반의 구축형 오퍼링

---

## 01. 기업 AI 활용의 현재 위치

많은 기업이 생성형 AI PoC, 챗봇, 문서 요약, 사내 검색 자동화까지는 이미 경험했습니다. 이제 다음 과제는 **AI를 실제 업무 흐름 안에서 실행 가능한 운영 체계로 전환하는 것**입니다.

### 1-1. 가능성은 확인했지만, 운영 전환은 제한적

생성형 AI PoC는 데모와 파일럿 단계에서 충분한 가능성을 보여주었습니다. 그러나 실제 업무 프로세스에 연결되어 지속적으로 사용되는 운영형 사례는 아직 제한적입니다.

많은 PoC는 특정 문서를 요약하거나, FAQ를 답변하거나, 일부 보고서를 자동 생성하는 수준에서 멈춥니다. 업무 담당자가 실제로 처리해야 하는 승인, 예외 판단, 시스템 입력, 결과 추적까지 이어지지 못하는 경우가 많습니다.

### 1-2. 챗봇·요약·검색 등 점 단위 활용에 머무름

FAQ 챗봇, 문서 요약, 사내 검색, RPA 보조 등은 개별 업무의 생산성을 높이고 있습니다. 다만 업무 흐름 전체를 이해하고 다음 단계까지 이어서 처리하는 구조로는 확장되지 못하고 있습니다.

기존 AI 활용은 대체로 다음과 같은 형태입니다.

- 질문에 답변
- 문서 또는 메일 요약
- 보고서 초안 생성
- 사내 자료 검색
- 반복 입력 업무의 일부 보조

이러한 활용은 유용하지만, 고객이 기대하는 “업무 수행형 AI”와는 거리가 있습니다. 고객이 원하는 것은 단순 답변이 아니라, **업무 기준을 이해하고, 필요한 데이터를 찾아보고, 판단 근거를 제시하며, 필요한 경우 시스템 실행까지 이어지는 구조**입니다.

### 1-3. 판단·승인·실행은 여전히 사람이 담당

AI가 답변과 초안을 만들더라도 정책 판단, 예외 처리, 승인, 시스템 입력은 여전히 현업과 IT가 수행합니다. 결국 AI와 업무 시스템 사이의 마지막 공백을 사람이 메우는 구조가 남아 있습니다.

이 지점이 AAP의 출발점입니다. AAP는 사람이 하던 모든 업무를 자동화하자는 개념이 아닙니다. 오히려 **AI가 수행할 수 있는 판단·실행 영역과 사람이 검토해야 하는 영역을 구분하고, 이를 업무 시스템 안에서 안전하게 운영하는 구조**를 만드는 것입니다.

---

## 02. AI의 운영 전환을 막는 4가지 공백

AI PoC가 운영으로 확장되지 못한 이유는 기술 가능성이 부족해서만은 아닙니다. 실제 업무에 적용되기 위해 필요한 **맥락·실행·통제·학습 구조**가 함께 갖춰지지 않았기 때문입니다.

### 2-1. 맥락 공백 — 업무 맥락 부족

문서 검색과 답변은 가능하지만, 고객사의 정책, 프로세스, 권한, 예외 기준까지 이해하지는 못합니다.

예를 들어 AI가 규정 문서를 찾아 요약할 수는 있어도, 특정 고객·부서·직무·권한·거래 유형에 따라 어떤 정책이 적용되는지까지 판단하려면 업무 의미 구조가 필요합니다. 이 구조가 없으면 AI는 답변은 할 수 있지만, 업무를 수행하기는 어렵습니다.

### 2-2. 실행 공백 — 시스템 실행 연계 부족

AI의 답변이나 추천이 ERP, CRM, SCM, 그룹웨어, 결재 시스템의 실제 업무 처리로 이어지지 못합니다.

기업 업무에서 중요한 것은 답변 자체가 아니라, 그 답변이 다음 단계의 업무 처리로 연결되는 것입니다. 고객 등록, 계약 검토, 승인 요청, 리스크 점검, 통보 발송, 결과 기록 등은 대부분 기존 업무 시스템과 연결되어야 합니다.

### 2-3. 통제 공백 — 신뢰·통제 체계 부족

어떤 근거로 판단했는지, 언제 사람이 검토해야 하는지, 어떤 실행을 제한해야 하는지에 대한 기준이 약합니다.

운영형 AI는 답변 품질뿐 아니라 다음과 같은 통제 조건을 만족해야 합니다.

- 판단 근거와 출처를 남길 수 있는가
- 실행 이력을 감사할 수 있는가
- 위험 업무는 사람 승인으로 전환할 수 있는가
- 권한 없는 정보나 시스템 실행을 제한할 수 있는가
- 폐쇄망 또는 Private 환경에서 운영할 수 있는가

### 2-4. 학습 공백 — 운영 학습 구조 부족

질문, 답변, 실패, 예외 처리 이력이 다시 업무 지식과 Agent 스킬로 축적되는 구조가 부족합니다.

운영 과정에서 쌓이는 실행 이력은 중요한 자산입니다. 어떤 판단이 맞았는지, 어떤 예외가 발생했는지, 어떤 정책이 자주 충돌하는지, 어떤 스킬이 재사용 가능한지 축적되어야 합니다. 이 구조가 없으면 AI 시스템은 시간이 지나도 고객 업무에 맞게 진화하지 못합니다.

---

## 03. 왜 지금 AAP가 필요한가

AAP는 기존 데이터 플랫폼이나 AI PoC를 대체하는 개념이 아닙니다. 이미 구축된 데이터·AI 자산 위에 **업무 맥락, 실행, 통제, 학습을 연결하는 Agentic Layer**를 더하는 접근입니다.

### 3-1. Data Platform 이후 — 데이터 기반은 마련됐지만, 업무 실행 계층은 비어 있음

데이터 플랫폼은 수집, 분석, 시각화 기반을 만들었습니다. 그러나 정책 판단, 승인, 예외 처리, 시스템 반영은 여전히 별도의 업무 절차와 사람의 개입에 의존하고 있습니다.

Data Platform이 기업 데이터를 볼 수 있게 했다면, AAP는 그 데이터와 업무 시스템을 기반으로 **AI가 업무를 수행할 수 있는 구조**를 만듭니다.

### 3-2. PoC 이후 — AI 실험을 운영 가능한 구조로 전환해야 함

생성형 AI PoC를 통해 가능성은 확인되었습니다. 이제는 단일 기능 검증을 넘어, 업무 맥락과 시스템 실행, 검토 체계, 운영 학습이 결합된 플랫폼 구조가 필요합니다.

AAP는 PoC 결과물을 버리고 새로 시작하는 방식이 아닙니다. 기존 PoC, RAG, 챗봇, 데이터 플랫폼, KMS, 업무 시스템을 연결하고, 이를 운영 가능한 업무 실행 구조로 확장하는 접근입니다.

### 3-3. Agentic AI 흐름 — 답변형 AI에서 업무 수행형 AI로 이동

프론티어 모델과 Agent Framework의 성숙으로 AI의 역할은 답변 생성에서 계획, 도구 호출, 실행 보조로 확장되고 있습니다. 기업 환경에서는 이를 안전하게 운영할 수 있는 구조가 필요합니다.

Agentic AI는 단순히 더 똑똑한 챗봇이 아닙니다. 목표를 이해하고, 필요한 정보를 찾고, 절차를 계획하고, 도구를 호출하고, 결과를 검토하며, 필요한 경우 사람에게 승인을 요청하는 구조입니다.

### 3-4. Data Platform / 개인 AI Tool / AAP 비교

| 구분 | Data Platform | 개인 AI Tool | AAP |
|---|---|---|---|
| 목적 | 데이터 수집·저장·분석 | 질의응답·요약·초안 생성 | 업무 이해·판단·실행·검토 |
| 핵심 단위 | 데이터셋, 파이프라인, 대시보드 | 프롬프트, 대화, 문서 | 업무 프로세스, 정책, 도구, 결정, 실행 로그 |
| 결과물 | BI, 리포트, 데이터 서비스 | 답변, 문서 초안, 요약 | Copilot, Workflow, API/RPA 실행, 시스템 반영 |
| 운영 전환 한계 | 맥락·실행·통제·학습을 사람이 수행 | 시스템 연계·권한·감사·학습 구조가 약함 | 업무 의미화, 실행 연결, HITL, 운영 학습을 포함 |

### 3-5. AAP는 무엇이며, 어디로 향하는가

AAP는 개별 AI 기술의 묶음이 아니라, 기업 업무를 처음부터 끝까지 수행하기 위한 닫힌 루프 구조입니다.

```text
Service Experience
        ↓
Business Semantic → Agentic Reasoning → Enterprise Action → Operational Learning
        ↑                                                        ↓
        └──────────────── 운영 학습 결과 환류 ─────────────────┘

Trust · Security · Governance
```

AAP의 핵심은 다음 흐름입니다.

1. **Semantic** — 고객 업무의 의미, 정책, 권한, 판단 기준을 구조화
2. **Agentic** — Agent가 업무 목표를 해석하고 실행 계획을 수립
3. **Action** — Workflow, API, RPA, Writeback을 통해 실제 시스템에 반영
4. **Learning** — 실행 이력, 피드백, 예외, 스킬을 운영 자산으로 축적
5. **Trust** — 권한, 감사, 설명성, 보안, 사람 검토 체계를 전 영역에 적용

### 3-6. 왜 단순 RAG가 아닌가

RAG는 문서 검색의 기법입니다. AAP는 업무 의미·정책·권한을 Agent가 사용할 수 있는 구조로 전환하고, 실행과 학습까지 연결합니다.

예를 들어 진흥회 회원사 통보 시나리오를 보면 다음과 같이 차이가 납니다.

| 구분 | 단순 RAG | AAP |
|---|---|---|
| 기본 응답 | “미국이 X 품목에 25% 관세를 부과합니다.”라는 문서 요약 | 해당 정책 변화가 어떤 회원사에 어떤 영향을 주는지 판단 |
| 업무 맥락 | 문서 내용 중심 | 회원사, 품목, 수출 국가, 매출 노출도, 등급, 대응 정책을 함께 고려 |
| 실행 방식 | 사람이 후속 조치 | 회원사별 영향도 분석, 통보 우선순위, 대응 가이드 생성 |
| 운영 자산화 | 검색 결과 중심 | 판단 기준, 실행 이력, 피드백이 다음 업무에 재사용 |

---

## 04. AAP 통합 구조와 수행 모델

AAP는 단일 AI 도구나 개별 솔루션 묶음이 아닙니다. 고객의 기존 데이터·문서·시스템을 대체하지 않고 연결한 뒤, 업무 의미화, Agent 판단, 시스템 실행, 운영 학습, 보안·통제를 하나의 실행 구조로 묶는 **Enterprise Agentic AI 운영 모델**입니다.

이 장은 기존의 Offering Map과 Build/Bring/Borrow 관점을 하나로 통합한 구조입니다. 다만 고객 선제안 및 상부 보고에서 복잡해 보이지 않도록, 기술 라벨이나 태그를 과도하게 노출하지 않고 **직접 수행 영역과 외부 자산 조합 영역을 시각적으로 구분**하는 방식으로 정리합니다.

### 4-1. 구조도 읽는 법

| 표현 방식 | 의미 |
|---|---|
| 검정 실선 영역 | KT DS가 직접 설계·구축·통합을 주도하는 영역 |
| 회색 점선 영역 | 고객 기존 자산, 외부 솔루션, 파트너 전문성을 연결·조합하는 영역 |
| 강조 영역 | AAP의 차별화가 누적되는 핵심 영역 |

> 이때 KT DS의 직접 수행 영역은 보수적으로 정의합니다. KT DS가 모든 AI 기술을 자체 개발한다는 의미가 아니라, 일반 대형 SI사가 현재 AI 사업에서 현실적으로 책임질 수 있는 **업무 분석, 통합 설계, 시스템 연계, 운영 통제, 프로젝트 수행 관리**를 중심으로 봅니다.

### 4-2. 통합 구조 개요

```text
[Service Experience]
현업이 사용하는 AI 업무 서비스
AI Agent Portal · Horizontal Agents · Vertical Agents · Review / Approval UI

        ↓

[Customer Environment] ──→ [Enterprise Data & Inputs] ──→ [Business Semantic Modeling]
고객 기존 자산            데이터·문서·시스템 연결        업무 의미·정책·권한 구조화

        → [Agentic Reasoning & Execution] → [Enterprise Integration & Action]
          Agent 판단·계획·도구 호출          Workflow · API/RPA · Writeback

        → [Operational Learning]
          실행 이력·피드백·스킬 자산화
          ↺ 다음 업무 의미화와 실행 정책에 환류

[Trust · Security · Governance]
권한 · 감사 · 설명성 · Guardrails · 폐쇄망 · 운영 통제
```

### 4-3. Customer Environment — 고객 기존 자산

**AAP가 새로 대체하지 않고 연결하는 고객 기존 자산**입니다.

주요 대상:

- Data Platform
- ERP / CRM / SCM
- Groupware / KMS
- Document Repository
- External API
- Security Zone
- 업무 운영 로그

고객의 기존 데이터 플랫폼과 업무 시스템은 AAP의 입력이자 실행 대상입니다. AAP는 이를 대체하지 않고, Agent가 이해하고 실행할 수 있는 업무 구조로 연결합니다.

이 영역은 원칙적으로 **고객 자산 연결 영역**입니다. KT DS는 고객 시스템을 직접 소유하거나 대체하지 않고, 연계 구조 진단, 인터페이스 정의, 통합 설계, 연동 구현을 수행합니다.

### 4-4. Service Experience — 현업 사용자가 접하는 AI 업무 서비스

Service Experience는 고객이 실제로 사용하는 AI 업무 면입니다. 고객에게는 AAP의 기술 구조보다 이 영역이 먼저 보입니다.

주요 구성:

- **AI Agent Portal**  
  업무별 Agent를 검색·실행하고, 실행 이력과 결과를 확인하는 업무 진입점

- **Horizontal Agents**  
  문서 검색, 보고서 작성, 회의록, VOC, 사내 질의응답 등 부서 공통 업무 Agent

- **Vertical Agents**  
  금융, 공공, 제조, 유통, 협회, 국방 등 산업·직무별 판단 기준을 반영한 전문 Agent

- **Review / Approval UI**  
  사람 검토가 필요한 단계에서 근거 확인, 승인, 반려, 예외 처리를 지원하는 검토 화면

#### 수행 관점

KT DS가 보수적으로 직접 수행 가능한 영역은 다음입니다.

- 고객 업무 화면 요구사항 정리
- Agent Portal 또는 업무 화면의 SI 구축
- Review / Approval UI 설계·구축
- 기존 그룹웨어·포털·업무 시스템과의 화면/권한 연계
- 표준 Agent 템플릿의 업무 적용 및 커스터마이징

외부 자산 조합이 필요한 영역은 다음입니다.

- 범용 Copilot 솔루션
- 전문 Agent UI 솔루션
- 고도화된 대화형 UX 엔진
- 산업별 전문 Agent 패키지

### 4-5. Enterprise Data & Inputs — 고객 데이터·문서·시스템 연결

고객의 데이터 플랫폼, 업무 시스템, 문서 저장소, 외부 API, 운영 로그를 AAP가 사용할 수 있는 입력으로 연결합니다.

주요 구성:

- System Connectors
- Data Platform Integration
- Document / Knowledge Integration
- Operational Log Integration
- Metadata & Lineage
- External Data Interface

#### 수행 관점

KT DS가 보수적으로 직접 수행 가능한 영역은 다음입니다.

- 고객 데이터·시스템 현황 진단
- 연계 대상 시스템 식별
- API, DB, File, Batch, Event 연동 설계
- 데이터 수집·정제·적재 파이프라인 구축
- 문서 저장소, KMS, 그룹웨어 연계
- 운영 로그 수집 구조 설계
- 데이터 품질·메타데이터 관리 체계 설계

외부 자산 조합이 필요한 영역은 다음입니다.

- 고도화된 Document Parser
- OCR 엔진
- Vector DB
- 검색 엔진
- 데이터 카탈로그 솔루션
- 외부 데이터 구독 서비스
- 전문 데이터 품질 솔루션

### 4-6. Business Semantic Modeling — 업무 의미·정책·권한 구조화

문서와 데이터를 단순 검색 대상으로 두지 않고, 고객 업무의 개념, 프로세스, 정책, 권한, 예외 기준으로 구조화합니다.

이 영역은 AAP의 핵심 차별화 영역입니다. 다만 KT DS가 온톨로지 엔진이나 Knowledge Graph 플랫폼 자체를 모두 개발한다는 의미는 아닙니다. KT DS의 보수적 수행 범위는 **업무 분석, 의미 모델 설계, 정책·프로세스 구조화, 시스템 매핑, 전문 솔루션 통합**입니다.

주요 구성:

- Domain Ontology
- Knowledge Graph
- Process / Decision Map
- Decision Rule Repository
- Authority Matrix
- System Map
- Semantic Quality Check

#### 수행 관점

KT DS가 보수적으로 직접 수행 가능한 영역은 다음입니다.

- 업무 프로세스 분석
- 고객 업무 용어, 정책, 판단 기준 정리
- 업무 개념과 시스템 데이터 간 매핑
- 권한·승인·예외 기준 정리
- Process Map, Decision Map 작성
- Rule Repository 요구사항 정의
- 도메인 SME 인터뷰 및 지식 구조화 워크숍 운영
- Ontology/KG 전문 솔루션 도입 시 통합 PMO 및 SI 수행

외부 자산 조합이 필요한 영역은 다음입니다.

- Ontology Modeling 전문 도구
- Knowledge Graph DB / RDF Triplestore / Property Graph
- 자동 지식 추출 엔진
- 고도화된 Semantic Reasoning 엔진
- 도메인별 전문 SME
- 온톨로지·KG 전문 파트너

### 4-7. Agentic Reasoning & Execution — Agent 판단·계획·도구 호출

Agent는 업무 맥락과 정책 기준을 참조해 실행 단계를 계획하고, 필요한 도구와 API를 호출합니다.

이 영역은 시장 변화가 빠르고 전문 프레임워크가 계속 등장하고 있으므로, KT DS가 직접 프레임워크를 만드는 것보다는 **고객 업무 흐름에 맞게 Agent 실행 구조를 설계하고, 검증된 프레임워크와 모델을 조합하는 방식**이 현실적입니다.

주요 구성:

- Planning & Orchestration
- Work Context Memory
- Tool Registry / Runtime
- HITL & Action Policy
- Agent Routing
- Cost-Aware Routing

#### 수행 관점

KT DS가 보수적으로 직접 수행 가능한 영역은 다음입니다.

- 업무별 Agent Flow 설계
- Agent가 호출할 도구/API 목록 정의
- Tool 사용 권한과 실행 조건 설계
- HITL 분기 기준 설계
- 프롬프트·스킬 템플릿의 업무 적용
- 모델·프레임워크 적용 검증
- 고객 환경에 맞춘 Agent 실행 시나리오 테스트
- 운영 정책과 실행 로그 요구사항 정의

외부 자산 조합이 필요한 영역은 다음입니다.

- LLM / sLLM
- Agent Framework
- Multi-agent Orchestration Framework
- Function Calling / Tool Calling Runtime
- MCP / A2A 등 상호운용 프로토콜
- 장기 메모리 엔진
- 모델 라우터
- 고도화된 비용 최적화 엔진

### 4-8. Enterprise Integration & Action — 업무 실행·시스템 반영

AAP의 차이는 답변 생성에서 끝나지 않고, 승인, 예외, 재처리, API/RPA 호출, 시스템 Writeback까지 연결한다는 점입니다.

이 영역은 일반 대형 SI사가 가장 현실적으로 강점을 가질 수 있는 영역입니다. 레거시·기간계 시스템 연동, 업무 프로세스 통합, 트랜잭션 처리, 장애 대응, 운영 전환은 SI 수행 경험이 중요합니다.

주요 구성:

- Workflow Engine
- API / RPA Connector
- Writeback Connector
- Report / Delivery
- Exception Queue
- Transaction Guard
- Runbook Packaging

#### 수행 관점

KT DS가 보수적으로 직접 수행 가능한 영역은 다음입니다.

- 업무 시스템 연동 설계
- API 연계 및 인터페이스 구현
- RPA 적용 구간 식별 및 연계
- Workflow 설계 및 구현
- 결재·승인·예외 처리 흐름 구현
- 시스템 Writeback 시나리오 설계
- 실행 전 확인, 재시도, 실패 처리 정책 설계
- 운영 Runbook 작성
- 운영 전환 및 장애 대응 체계 수립

외부 자산 조합이 필요한 영역은 다음입니다.

- Workflow Engine 솔루션
- RPA 솔루션
- API Gateway
- BPM / Process Mining 도구
- 특수 레거시 시스템 전문 파트너
- Transaction Monitoring 솔루션

### 4-9. Operational Learning — 실행 결과의 축적과 개선

Agent가 수행한 판단 근거, 도구 호출, 실행 결과, 사용자 피드백, 예외 처리 이력을 운영 자산으로 축적합니다.

이 영역은 AAP가 시간이 지날수록 고객 업무에 더 잘 맞게 진화하는 기반입니다. 다만 KT DS가 모든 EvalOps나 LLMOps 솔루션을 직접 개발한다기보다, **운영 데이터 구조, 피드백 프로세스, 품질 점검 체계, 스킬 관리 체계를 설계·구축하고 필요한 도구를 조합**하는 방식이 현실적입니다.

주요 구성:

- Decision / Action Log
- Feedback Store
- Evaluation Pipeline
- Skill Library
- Skill Approval Workflow
- Experiment & Versioning
- Improvement Candidate

#### 수행 관점

KT DS가 보수적으로 직접 수행 가능한 영역은 다음입니다.

- Decision Log / Action Log 설계
- 실행 이력 저장 구조 설계
- 사용자 피드백 수집 프로세스 설계
- 운영 리포트 요구사항 정의
- 품질 점검 기준 수립
- Skill Library 운영 방식 설계
- 스킬 승인·배포 프로세스 설계
- 운영 개선 후보 관리 프로세스 설계

외부 자산 조합이 필요한 영역은 다음입니다.

- EvalOps 솔루션
- LLMOps / MLOps 솔루션
- 모델 평가 자동화 도구
- Observability 플랫폼
- Experiment Tracking 도구
- 고도화된 자동 개선 추천 엔진

### 4-10. Trust · Security · Governance — 기업 환경 운영 기반

AAP는 업무 실행형 AI이기 때문에, 보안·권한·감사·설명 가능성·사람 검토 체계가 전 영역에 공통으로 적용되어야 합니다.

특히 공공, 금융, 국방 등 규제 산업에서는 폐쇄망·Private Deployment와 감사 가능한 실행 이력이 도입 조건이 됩니다.

주요 구성:

- IAM / SSO
- Data Security
- Audit / Explainability
- Guardrails / Policy
- Closed / Private Deployment
- Usage & Cost Control
- Agent Observability
- Quality Review

#### 수행 관점

KT DS가 보수적으로 직접 수행 가능한 영역은 다음입니다.

- 고객 보안·권한 요구사항 분석
- IAM / SSO 연계 설계
- 역할 기반 접근 통제 설계
- 감사 로그 요구사항 정의
- 폐쇄망·Private 구축 환경 설계 및 인프라 연계
- 보안 정책 적용을 위한 SI 통합
- 운영 정책, 승인 체계, 통제 프로세스 설계
- 보안 솔루션 도입 시 통합 PMO 및 구축 관리

외부 자산 조합이 필요한 영역은 다음입니다.

- IAM 솔루션
- DLP / DRM / 개인정보 보호 솔루션
- SIEM / Audit 솔루션
- Guardrail 솔루션
- Policy-as-Code 엔진
- 보안 취약점 점검 전문 파트너
- 망분리·폐쇄망 전문 솔루션

### 4-11. 보수적 수행 모델 요약

AAP는 모든 기술을 자체 개발하는 방식이 아닙니다. KT DS는 고객 업무와 시스템 통합, 실행·통제·운영 구조를 직접 책임지고, 범용 모델·프레임워크·전문 도구는 검증된 솔루션과 파트너 자산을 조합합니다.

| 구분 | KT DS 직접 수행 가능 영역 | 외부 자산 조합 영역 |
|---|---|---|
| Service Experience | 업무 화면 설계, Portal/UI 구축, Approval UI, 기존 시스템 화면 연계 | 전문 Copilot UI, 산업별 Agent 패키지 |
| Data & Inputs | 데이터·시스템 연계 설계, API/DB/File 연동, 문서/KMS 연계, 로그 수집 구조 | OCR, Parser, Vector DB, Search, Data Catalog |
| Business Semantic | 업무 분석, 정책·권한·프로세스 구조화, 시스템 매핑, SME 워크숍, 통합 PMO | Ontology/KG 도구, Semantic Reasoning, 전문 SME |
| Agentic Reasoning | Agent Flow 설계, Tool 사용 정책, HITL 기준, 프롬프트·스킬 적용, 검증 | LLM, Agent Framework, MCP/A2A, Model Router |
| Integration & Action | Workflow/API/RPA 연계, Writeback, 예외 처리, Runbook, 운영 전환 | Workflow Engine, RPA, API Gateway, 레거시 전문 솔루션 |
| Operational Learning | Decision Log, Feedback Process, Skill 운영 체계, 품질 기준, 운영 리포트 | EvalOps, LLMOps, Observability, Experiment Tool |
| Trust & Governance | 권한·감사 요구사항, SSO 연계, 폐쇄망 설계, 통제 프로세스, 보안 SI | IAM, Guardrail, SIEM, DLP, Policy Engine |

> KT DS의 역할은 특정 모델이나 도구를 자체 보유하는 데 있지 않습니다. 고객의 업무 의미, 권한, 시스템, 검토 절차, 운영 기준을 하나의 실행 가능한 Agentic AI 구조로 연결하고, 이를 실제 운영 가능한 SI 오퍼링으로 구현하는 데 있습니다.

---

## 05. 적용 레퍼런스 — 검증된 것과 사업 확장 방향

AAP는 완전히 새로운 개념을 무리하게 제안하는 것이 아닙니다. 이미 내부 프로젝트와 선제안 PoC에서 AAP의 일부 구성 요소가 작동·검증되고 있으며, 이를 통합·일반화한 것이 AAP입니다.

### 5-1. AI 투자 메이트 — 자산운용 의사결정 Agent

**도메인**: 자산운용 · 투자 의사결정  
**성격**: 내부 프로젝트 / Reference Instance

매크로, 뉴스, 블룸버그 데이터를 통합해 투자 자문을 생성하는 LangGraph 기반 멀티에이전트입니다. 데이터 수집, 멀티에이전트 분석, 자문 생성까지 E2E 흐름을 검증했습니다.

#### 검증된 영역

- 외부 데이터 통합
- 멀티에이전트 분석
- 투자 자문 생성
- Vertical Agent 서비스화 가능성

#### AAP로 보완할 영역

- 투자 정책·룰·권한 구조화
- 주문·기록 시스템 Writeback
- Decision Log
- HITL / 감사 / 설명성
- 운영 학습 구조

#### 사업 확장 방향

AI 투자 메이트는 단일 자문 Agent에서 출발해 금융·자문형 의사결정 Pack으로 확장할 수 있습니다.

- 자산운용 1차 진입
- 법무·세무·M&A 등 자문형 의사결정 영역으로 패턴 복제
- 금융 컴플라이언스, 내부통제, 투자 심의 등으로 확장
- Vertical Decision Agent 표준 Pack 자산화

### 5-2. 한국기계산업진흥회 온톨로지 — 산업단체 정책·통상 영향 분석

**도메인**: 공공 · 협회 · 기계산업  
**성격**: 선제안 PoC / 1차 완료

국제 정세, 통상 규제, 환율 변화 등을 기계산업 도메인 온톨로지로 구조화하고, 회원사별 영향도를 분석·통보하는 의사결정 자동화 사례입니다.

#### 검증된 영역

- 기계산업 도메인 온톨로지
- Knowledge Graph 기반 관계 구조화
- 회원사 영향도 분석 룰 설계
- 도메인 SME 협업
- 규제·정책 모델링

#### AAP로 보완할 영역

- 외부 데이터 자동 수집
- Agentic Reasoning / Tool Calling
- 회원사 통보 Workflow
- 통보 이력 관리
- 폐쇄망·감사 요구 대응
- 운영 학습 구조

#### 사업 확장 방향

진흥회 온톨로지 사례는 Public Decision Pack으로 확장할 수 있습니다.

- 본 사업 RFP 대응
- 회원사 통보 자동화 본 구축
- 자동차·반도체·무역·섬유 등 유사 산업단체로 수평 복제
- 공공 진흥기관 정책분석 카테고리화
- 산업단체 온톨로지 표준 템플릿화

### 5-3. 두 케이스의 상호 보완성

| 축 | AI 투자 메이트 | 진흥회 온톨로지 |
|---|---|---|
| 검증된 영역 | Data Inputs, Agentic, Service | Business Semantic |
| 보완 필요 영역 | Semantic, Action, Learning, Trust | Inputs, Agentic, Action, Trust |
| 확장 방향 | Vertical Decision Pack | Public Decision Pack |

두 케이스는 서로 다른 축을 검증했습니다. AI 투자 메이트는 Agentic 실행과 데이터 통합을, 진흥회 온톨로지는 업무 의미화와 도메인 구조화를 검증했습니다. AAP는 이 둘을 통합해 산업·고객에 재적용 가능한 형태로 일반화하는 오퍼링입니다.

---

## 06. 산업별 적용 예시

AAP는 공통 구조를 유지하되, 산업별로 진입 메시지와 우선 적용 영역을 다르게 가져갈 수 있습니다.

### 6-1. 공공·협회 — 정책 변화 영향 분석 및 통보 자동화

#### 고객 상황

공공기관, 진흥기관, 협회는 정책, 규제, 산업 동향, 통상 이슈를 수집하고 회원사 또는 대상 기관에 영향을 분석해 안내해야 합니다. 그러나 데이터와 문서가 분산되어 있고, 영향도 판단과 통보는 담당자 경험에 의존하는 경우가 많습니다.

#### AAP 적용 방향

- 산업 도메인 온톨로지 구축
- 정책·규제·통상 이벤트 수집
- 회원사·품목·시장·매출 노출도 매핑
- 영향도 판단 룰 구조화
- 회원사별 통보 우선순위 및 대응 가이드 생성
- 통보 이력과 피드백 축적

#### 강조 영역

- Business Semantic Modeling
- Enterprise Data & Inputs
- Enterprise Integration & Action
- Operational Learning
- Closed / Private Governance

### 6-2. 금융 — 내부통제·심사·투자 자문 Agent

#### 고객 상황

금융권은 AI 활용 수요가 높지만, 규제, 감사, 내부통제, 폐쇄망, 설명 가능성 요구가 강합니다. 단순 챗봇이나 문서 요약만으로는 실제 업무 적용이 어렵습니다.

#### AAP 적용 방향

- 금융 정책·규정·내부통제 기준 구조화
- 심사·승인·예외 처리 프로세스 모델링
- 투자 자문 또는 리스크 판단 Agent 설계
- 의사결정 근거와 출처 기록
- 고위험 업무 HITL 승인
- 감사 가능한 Decision Log 구축

#### 강조 영역

- Business Semantic Modeling
- HITL & Action Policy
- Decision / Action Log
- Trust · Security · Governance
- Closed / Private Deployment

### 6-3. 제조 — 품질·설비·공급망 업무 Agent

#### 고객 상황

제조기업은 설비, 품질, 생산, 공급망, 고객 VOC 데이터가 많지만, 데이터가 여러 시스템에 흩어져 있습니다. 현장 판단은 숙련자 경험에 의존하며, 이상 상황 대응과 지식 전수가 어렵습니다.

#### AAP 적용 방향

- 설비·품질·공정 데이터 연계
- 불량 원인 분석 지식 구조화
- 공급망 리스크 이벤트 수집
- 조치 추천 및 작업 지시 연계
- 예외 상황 담당자 승인
- 조치 이력과 재발 방지 지식 축적

#### 강조 영역

- Enterprise Data & Inputs
- Business Semantic Modeling
- Enterprise Integration & Action
- Operational Learning

### 6-4. 유통·서비스 — VOC·고객 대응·운영 업무 Agent

#### 고객 상황

유통·서비스 기업은 고객 문의, VOC, 주문, 배송, 환불, 매장 운영 이슈가 반복적으로 발생합니다. 기존 챗봇은 답변 중심이고, 실제 처리와 시스템 반영은 사람이 담당합니다.

#### AAP 적용 방향

- VOC·상담·주문·배송 데이터 통합
- 고객 유형과 정책 기준 구조화
- 환불·교환·보상 기준 판단
- 상담원 또는 현업 승인 분기
- CRM·주문·배송 시스템 반영
- 반복 이슈와 대응 스킬 축적

#### 강조 영역

- Horizontal / Vertical Agents
- Tool Registry / Runtime
- Workflow / Writeback
- Feedback Store
- Skill Library

### 6-5. 국방·보안 민감 산업 — 폐쇄망 기반 통제형 Agent

#### 고객 상황

국방, 보안, 중요 인프라 영역은 외부 SaaS형 AI 도입이 어렵고, 폐쇄망·망분리·권한·감사·보안 정책이 도입 가능 여부를 결정합니다.

#### AAP 적용 방향

- 폐쇄망 또는 Private 환경 배포
- 내부 문서·지식 기반 Agent 구축
- 권한별 정보 접근 제어
- 실행 이력과 감사 로그 저장
- 고위험 실행의 사람 승인
- 보안 정책 기반 Tool 사용 제한

#### 강조 영역

- Closed / Private Deployment
- IAM / SSO
- Data Security
- Guardrails / Policy
- Audit / Explainability

---

## 07. 고객 유형별 진입 패턴

공통 Offering 구조는 유지하되, 고객 유형에 따라 진입 메시지를 다르게 가져갑니다.

### 7-1. Type A — 대기업 / 자체 AI 조직 보유

#### 상황

이미 Data Platform과 AI 조직이 있으나, 운영 전환과 실제 업무 실행이 병목입니다.

#### 제안 메시지

기존 데이터·AI 플랫폼 위에 **업무 실행형 Agentic Layer**를 얹어 운영 전환 속도를 높입니다.

#### 강조점

- 기존 플랫폼 대체가 아니라 보완
- 업무 의미화와 실행 연계
- Writeback
- Operational Learning
- 내부 AI 조직과 협업 가능한 구조

### 7-2. Type B — 산업 특화 중견

#### 상황

AI 조직은 크지 않지만, 반복 업무, 문서, 승인, 예외 처리 니즈가 명확합니다.

#### 제안 메시지

업무와 시스템에 맞춘 **구축형 AAP**로 작은 영역부터 빠르게 시작합니다.

#### 강조점

- 업무 단위 빠른 시작
- Vertical Agent
- 현업 프로세스 기반 설계
- SI 구축과 운영 지원
- 외부 솔루션 조합형 접근

### 7-3. Type C — 공공·금융·국방 등 규제·폐쇄망 고객

#### 상황

보안, 감사, 망분리, 승인 체계가 도입 가능 여부를 결정합니다.

#### 제안 메시지

폐쇄망, 권한, 감사, HITL을 포함한 **통제형 AAP**로 접근합니다.

#### 강조점

- Closed / Private Deployment
- IAM / Audit
- HITL
- 실행 이력과 설명 가능성
- 보안 솔루션·파트너 조합

---

## 08. 후속 논의 방향

AAP 기획안이 채택되면, 기술 조직과 협업하여 실제 Build 범위, 솔루션 조합, 파트너 역할, 견적 산출 구조를 구체화해야 합니다.

다만 현 단계에서는 구축 프로세스를 전면에 내세우기보다, AAP의 정의와 통합 구조, KT DS의 보수적 수행 가능 영역을 먼저 합의하는 것이 중요합니다.

### 8-1. 후속 논의 시 확인할 질문

- 어떤 고객 업무를 1차 적용 대상으로 삼을 것인가
- 해당 업무는 반복성, 판단성, 시스템 실행 필요성이 충분한가
- 고객 데이터·문서·시스템 접근 조건은 무엇인가
- 폐쇄망, 권한, 감사, 개인정보 요건은 어느 수준인가
- 기존 고객 시스템과의 Writeback 가능성은 어느 정도인가
- Agent가 자동 실행해도 되는 영역과 사람 검토가 필요한 영역은 어디인가
- 운영 후 Decision Log와 Feedback을 어떻게 활용할 것인가
- KT DS가 직접 수행할 영역과 파트너가 필요한 영역은 어디인가

### 8-2. AAP 도입 구체화 절차

후속 논의에서는 다음 순서로 구체화합니다.

1. **업무 후보 선정**  
   반복성, 판단성, 문서·데이터 의존도, 시스템 실행 필요성이 높은 업무를 선별합니다.

2. **업무 의미·정책 구조화**  
   업무 개념, 정책, 권한, 예외, 프로세스, 판단 기준을 정리합니다.

3. **시스템·데이터 연계 진단**  
   Data Platform, ERP/CRM/SCM, KMS, 문서 저장소, 외부 API 등 연계 가능성을 확인합니다.

4. **Agent 실행 흐름 설계**  
   Agent가 어떤 정보를 참조하고, 어떤 도구를 호출하며, 언제 사람 검토로 넘길지 정의합니다.

5. **통제형 Pilot 설계**  
   제한된 업무 범위, 제한된 권한, 제한된 실행 대상으로 운영형 Pilot을 설계합니다.

6. **운영 학습 체계 설계**  
   Decision Log, Feedback, Evaluation, Skill Library를 통해 운영 개선 구조를 만듭니다.

### 8-3. 내부 협업 필요 영역

AAP는 사업개발, 영업, 수행 총괄, 기술 조직이 함께 정리해야 하는 주제입니다.

| 영역 | 필요 협업 |
|---|---|
| 사업개발 | 타겟 산업, 고객 유형, 오퍼링 메시지, 파트너 전략 |
| 영업 | 고객 pain point, 제안 진입 시나리오, 레퍼런스 활용 |
| 수행 총괄 | 프로젝트 범위, 일정, 리스크, 견적 구조, 수행 책임 |
| 기술 조직 | 아키텍처 검증, 솔루션 선정, 보안/인프라 설계, 운영 기준 |
| 파트너 | 전문 솔루션, KG/Ontology, LLM, EvalOps, 보안, RPA |

---

## 09. 최종 메시지

AAP는 단일 AI 도구를 판매하는 제안이 아닙니다. 고객의 기존 데이터·문서·시스템을 기반으로, AI가 업무를 이해하고 실행하며, 그 결과를 운영 자산으로 축적하는 **구축형 Enterprise Agentic AI 오퍼링**입니다.

KT DS는 모든 AI 기술을 직접 개발하는 것이 아니라, 고객 업무와 시스템을 가장 잘 이해하고 통합할 수 있는 SI 역량을 기반으로 다음 영역을 주도합니다.

- 고객 업무 분석과 의미 구조화
- 데이터·문서·시스템 연계 설계
- Agent 실행 흐름과 사람 검토 기준 설계
- Workflow, API/RPA, Writeback 연계
- Decision Log, Feedback, Skill Library 운영 구조
- 권한, 감사, 폐쇄망, 보안 통제 체계
- 외부 솔루션과 파트너를 조합한 통합 구축

따라서 AAP의 핵심 제안은 다음과 같습니다.

> **KT DS는 고객의 데이터 플랫폼 이후 과제를 ‘업무 실행형 Agentic AI’로 전환하고, 고객 업무·시스템·권한·운영 기준을 하나의 실행 가능한 구조로 통합합니다.**

