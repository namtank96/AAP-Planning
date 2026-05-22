# Agentic AI Platform 기획(안) · v3.0

> 기업의 실제 업무를 처음부터 끝까지 수행하는 **Enterprise Agentic AI Platform**
>
> AAP는 고객의 데이터·문서·시스템을 업무 맥락으로 정리하고, Agent가 판단·실행·검토하며, 그 결과가 다시 지식과 스킬로 쌓이는 구축형 Agentic AI Platform입니다.

**문서 목적** · 공통 고객을 대상으로 Data Platform 다음 과제로 AAP를 소개하고, 후속 논의를 이어가기 위한 자료
**버전** · v3.0 (작성일 2026-05-21)
**선행본** · `aap_proactive_offering_v210_260521.html` (v0.2 작업본)

---

## 목차

1. 기업 AI 활용의 현재 위치
2. 운영까지 가지 못하는 4가지 빈틈
3. 왜 지금 AAP가 필요한가
4. 통합 아키텍처와 수행 모델
5. 적용 레퍼런스
6. 산업별 적용 예시
7. 고객 유형별 진입 패턴
8. 후속 논의 방향
9. 별첨 · Capability별 구현 기술·자산 후보

---

## 01. 기업 AI 활용의 현재 위치

많은 기업이 생성형 AI PoC, 챗봇, 문서 요약, 검색 자동화까지는 이미 경험했습니다.
이제 남은 과제는 AI를 단일 기능이 아니라 **권한·승인·예외 처리·시스템 반영까지 포함하는 실제 업무 운영 체계 안에 안착시키는 일**입니다.

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

| 빈틈 | 내용 |
| --- | --- |
| ① 맥락 | 문서를 검색하고 답변하는 것은 가능하지만, 고객사의 정책·프로세스·권한·예외 기준까지는 이해하지 못합니다. |
| ② 실행 | AI의 답변이나 추천이 ERP, CRM, SCM, 그룹웨어, 결재 시스템에서 실제 업무 처리로 이어지지 않습니다. |
| ③ 통제 | 어떤 근거로 판단했는지, 언제 사람이 검토해야 하는지, 어떤 실행을 막아야 하는지에 대한 기준이 충분히 정리되어 있지 않습니다. |
| ④ 학습 | 판단 근거·실행 결과·실패·예외 처리·사람 검토 이력이 업무 지식이나 Agent 스킬로 다시 쌓이는 구조가 마련되어 있지 않습니다. |

> AAP는 이 네 가지 빈틈을 **개별 기능 도입이 아니라 하나의 구조로 묶어 해결**합니다. 업무 의미화, Agent 실행, 시스템 반영, 운영 통제를 한 자리에 연결해 **운영 가능한 AI 업무 체계**로 전환하는 것이 04장에서 보여드릴 통합 아키텍처입니다.

---

## 03. 왜 지금 AAP가 필요한가

AAP는 기존 데이터 플랫폼이나 AI PoC를 대체하는 것이 아닙니다. 이미 갖춰진 데이터·AI 자산 위에 **업무 맥락, 실행, 통제, 학습을 이어주는 Agentic Layer**를 한 겹 얹는 방식입니다.

- **Data Platform 이후** · 데이터 플랫폼은 수집·분석·시각화의 토대를 마련했습니다. 다만 정책 판단, 승인, 예외 처리, 시스템 반영은 여전히 별도의 업무 절차와 사람의 손에 의존하고 있습니다.
- **PoC 이후** · 생성형 AI PoC로 가능성은 충분히 확인되었습니다. 이제는 단일 기능 검증을 넘어, 업무 맥락·시스템 실행·검토 체계·운영 학습이 한 자리에 모인 플랫폼이 필요합니다.
- **Agentic AI 흐름** · 최신 LLM과 Agent 프레임워크가 자리를 잡으면서, AI의 역할이 답변 생성에서 계획·도구 호출·실행 보조까지 넓어지고 있습니다. 기업 환경에서는 이를 안전하게 돌릴 수 있는 AAP 같은 기반이 필요합니다.

### AAP 정의

> 고객의 데이터, 문서, 시스템을 업무 맥락으로 연결하고, Agent가 **판단·실행·검토 흐름을 안전하게 보조**하도록 만드는 **기업용 Agentic AI Platform**

### 닫힌 루프 구조

```
[Service Experience]  ← 고객이 경험하는 AI 서비스

  Semantic  →  Agentic  →  Action  →  Learning
  의미 이해     판단·계획     시스템 실행    운영 학습
       ↑________________________________________________|
                     운영 학습이 다시 의미 이해로

[Trust · Foundation]  ← 보안 · 감사 · HITL · 폐쇄망
```

운영하면서 쌓인 학습이 다음 단계의 의미 이해와 판단에 반영되어, 시간이 갈수록 더 정확해지는 사이클입니다.

### 기존 접근과의 차이

| 구분 | Data Platform | 개인 AI Tool | 단순 RAG | **AAP** |
| --- | --- | --- | --- | --- |
| 목적 | 데이터 수집·분석·시각화 | 답변·요약·초안 작성 | 문서 검색과 근거 제시 | **업무 판단·실행·검토·학습** |
| 핵심 단위 | 데이터셋, 파이프라인, 대시보드 | 프롬프트, 대화, 문서 | 질문, 문서, 검색 결과 | **업무 사건, 정책, 권한, 도구, 실행 로그** |
| 결과 | 리포트와 인사이트 | 사용자가 직접 다듬어 쓰는 텍스트 | 문서를 근거로 한 답변 | **Workflow, API/RPA 실행, 시스템 반영, 감사 가능한 이력** |
| 운영성 | 이후 판단·처리는 사람 몫 | 개인 생산성 향상 수준에 머묾 | 검색 품질에 초점 | **업무 기준에 따라 처리 경로를 나누고, 사람 검토가 필요한 지점을 따로 표시** |

핵심 차별 포인트:
- **맥락** · 문서 키워드가 아니라 업무 사건과 정책 기준으로 이해
- **판단** · 규정·권한·예외 조건을 함께 두고 의사결정 후보를 만들어 냄
- **실행** · 결과를 Workflow, API, RPA, 시스템 반영까지 이어 줌
- **통제** · 근거·승인·이력·피드백을 남겨 운영 자산으로 쌓아 둠

### 왜 단순 RAG가 아닌가 · 손해사정 심사 시나리오

**단순 RAG** · "약관상 보상에서 제외되는 항목이 있는지 찾아줘"라고 물으면 보험 약관과 판례 문서를 찾아서 요약해 줍니다.

**AAP** ·
1. **사건 정리** · 청구서·진단서·계약·과거 지급 이력을 하나의 사건 단위로 묶어 줍니다.
2. **심사 판단** · 보장 범위, 면책 조건, 중복 청구, 이상 징후를 룰과 근거 문서를 함께 보며 검토합니다.
3. **업무 처리** · 자동 승인, 추가 서류 요청, 조사 배정, 지급 보류 가운데 기준에 맞는 경로로 처리하고 이력을 남깁니다.

RAG는 *문서를 잘 찾아 주는 방식*입니다. AAP는 사건·정책·권한·실행 경로를 함께 다루기 때문에, **전문 심사 업무의 판단과 후속 처리까지 실제 운영 흐름에 태울 수 있습니다.**

### 앞으로 어떻게 발전하는가 · 운영을 끌어올리는 세 축

- **학습 축적** · 실행 이력과 검증된 스킬이 Operational Learning 체계에 쌓여 다음 업무에 다시 쓰입니다. 시간이 갈수록 정확도와 재사용 폭이 늘어납니다.
- **자동 처리·예외 대응** · 위험도와 권한 기준으로 자동 처리할지 사람이 검토할지를 HITL & Action Policy에서 나누고, 실패한 건은 사람 검토와 재실행으로 다시 살립니다.
- **품질·비용 통제** · 품질 회귀 테스트를 Evaluation Pipeline에 자리잡게 하고, 업무 중요도에 맞춰 Usage & Cost Control로 모델 사용량과 쿼터를 관리합니다.

---

## 04. 통합 아키텍처와 수행 모델

AAP는 고객이 이미 보유한 데이터·문서·시스템을 대체하지 않고, 기존 자산을 AAP 실행 구조에 연결합니다. 그 위에 업무 맥락 정리, Agent 판단, 시스템 실행, 운영 학습, 보안·통제를 단계적으로 결합해 **실제 운영 가능한 Enterprise Agentic AI 운영 모델**로 전환합니다.

### Architecture Overview

```
[ Customer Environment ]           [ Core Loop ]                          [ Service Experience ]
 고객 보유 자산                       업무 이해 → 판단 → 실행 → 학습              현업 사용자 서비스

 · Data Platform                    Semantic → Agentic → Action → Learning   · AI Agent Portal
 · ERP / CRM / SCM         ───→     의미 이해   판단·계획   시스템 실행  운영 학습  · Review / Approval
 · Document / KMS                                                              · Workflow / Writeback
 · ...                              ──── Trust Foundation ────                 · Ops Report
                                    권한 · 감사 · HITL · 폐쇄망
```

### Capability Map · 8 Layer × 핵심 capability 3개

> **표기 규칙** · 박스 = 역량, 하위 chip = 표준/스킬셋. 솔루션명은 본문에 두지 않습니다(선제안 단계 기준).
> **범례** · 일반 박스 = kt ds 영역, 점선 박스 = 외부 자산/파트너 영역, ★ = kt ds 차별화 영역.
> **구현 기술 후보**는 09장(별첨)에서 capability별로 정리합니다.

#### Customer Environment · 외부 영역
고객이 이미 보유한 데이터·업무·지식 자산. AAP는 대체하지 않고 연결해 활용합니다.

| Capability | 의미 | 예시 |
| --- | --- | --- |
| Data Platform / Analytics Assets *(외부)* | 기존 데이터 플랫폼·분석 자산을 AAP 업무 판단의 입력으로 활용 | 분석 자산, 카탈로그, 리포트 |
| Business Systems *(외부)* | ERP·CRM·SCM·결재·그룹웨어 등 실제 업무 시스템과 연결 | 기간계, 결재·그룹웨어, 내부 API |
| Document / Knowledge Assets *(외부)* | 사내 규정·매뉴얼·FAQ·KMS 등 문서 지식 자산 | 규정·매뉴얼, FAQ, KMS |

#### Service Experience
현업 사용자가 AAP로 업무를 요청·실행하고, 결과를 검토하는 사용자 접점.

| Capability | 의미 | 예시 |
| --- | --- | --- |
| AI Agent Portal | 업무별 Agent를 찾아 실행하고, 실행 이력과 결과를 한곳에서 확인 | Agent 검색, 실행, 이력 |
| **★ Business Agents** | 공통 업무 Agent + 산업·직무 특화 Agent를 함께 제공 | 공통 업무, 산업 특화, 직무 특화 |
| Review / Approval Workspace | 검토·승인·반려·예외 처리를 지원 | 승인 UI, HITL 콘솔, 감사 뷰 |

#### Enterprise Data & Inputs
고객 자산을 AAP가 사용 가능한 입력으로 연결·정제·검색 가능하게 만드는 계층.

| Capability | 의미 | 예시 |
| --- | --- | --- |
| System & Data Connectors | 기간계·DB·API·파일·분석 자산을 Agent 실행 흐름에 연결 | API, DB, 파일·분석 자산 |
| Document / Knowledge Ingestion *(외부 자산 조합)* | 문서·규정·FAQ를 검색 가능한 업무 지식으로 변환 | 문서 지식화, OCR/파싱, 검색 인덱스 |
| Operational Data Integration | 운영 로그·이벤트·외부 데이터를 업무 판단·학습 흐름에 연결 | 운영 로그, 이벤트, 외부 데이터 |

#### Business Semantic Modeling *(kt ds 차별화 핵심)*
업무 의미·정책·권한·판단 기준을 Agent가 이해·실행할 수 있는 구조로 정리.

| Capability | 의미 | 예시 |
| --- | --- | --- |
| **★ Business Concept Model** | 업무 용어·개념·관계를 표준화해 Agent가 같은 의미로 업무를 해석 | 업무 용어집, 도메인 모델, 지식 그래프 |
| **★ Process & Decision Rule Model** | 업무 절차·판단 규칙·예외 조건을 실제 실행 기준으로 구조화 | 업무 절차, 판단 룰, 예외 조건 |
| **★ Authority & Policy Model** | 권한·승인 기준·예외 조건을 정리해 자동 실행과 사람 검토 경계를 정의 | 권한 매트릭스, 승인 규칙, 자동/수동 경계 |

#### Agentic Reasoning
업무 요청을 단계로 나누고, 지식·도구를 선택해 판단·실행을 분기하는 Agent 판단 계층.

| Capability | 의미 | 예시 |
| --- | --- | --- |
| Planning & Orchestration *(외부 자산 조합)* | 업무를 여러 단계로 쪼개고 Agent 실행 흐름을 조율 | 단계 계획, 실행 조율, 분기 |
| Tool Calling Runtime *(외부 자산 조합)* | Agent가 호출할 도구·API를 등록·관리하고 권한·위험도로 통제 | 도구 등록, 호출 관리, 권한 제어 |
| HITL & Action Policy | 위험도·확신도에 따라 자동/검토/보류 경로 분기 | 확신도, 위험도, 에스컬레이션 |

#### Enterprise Integration & Action
판단 결과를 승인·예외 흐름에 태우고, 실제 업무 시스템에 안전하게 반영하는 실행 계층.

| Capability | 의미 | 예시 |
| --- | --- | --- |
| Workflow & Approval Execution *(외부 자산 조합)* | 승인·예외·재처리 흐름을 업무 프로세스 엔진과 RPA·API 채널로 실행 | 승인 흐름, 재처리, RPA·API |
| System Writeback | 처리 결과를 ERP·CRM·그룹웨어·결재 등 실제 업무 시스템에 반영 | ERP·CRM, 그룹웨어·결재, 실행 경로 |
| Exception & Transaction Control | 실패·재시도·취소·롤백·수동 검토 전환 등 실행 안전장치 정책화 | 실패 큐, 재시도·롤백, 수동 검토 |

#### Operational Learning *(kt ds 차별화 영역)*
실행 이력·피드백·평가 결과를 재사용 가능한 스킬과 개선 후보로 축적.

| Capability | 의미 | 예시 |
| --- | --- | --- |
| **★ Decision / Action Logging** | 판단 근거·도구 호출·실행 결과를 추적 가능한 이력으로 저장 | 판단 근거, 도구 추적, 입출력 기록 |
| **★ Evaluation & Feedback Loop** | 실행 품질·사용자 피드백·정책 위반 여부를 주기적으로 평가 | 사용자 피드백, 회귀 평가, A/B |
| **★ Reusable Skill & Improvement** | 검증된 업무 패턴을 스킬로 재사용하고 정책·지식 개선 후보를 관리 | 스킬 카탈로그, 버전 관리, 개선 후보 |

#### Trust · Security · Governance
접근 권한·데이터 보호·감사 추적·정책 통제·폐쇄망 배포를 관리하는 공통 기반 계층.

| Capability | 의미 | 예시 |
| --- | --- | --- |
| Identity & Access Control *(외부 자산 조합)* | 사용자·조직·역할·권한을 한곳에서 관리 | 사용자·조직, 역할, SSO |
| Audit & Explainability | 판단 근거·참조 출처·실행 이력을 감사 가능한 형태로 저장 | 근거, 출처, 실행 이력 |
| Security Guardrails & Private Deployment | 민감정보 보호·위험 실행 차단·폐쇄망/Private 배포 요건 통합 관리 | 민감정보 보호, 위험 차단, 폐쇄망·Private |

### Delivery Model · 정의하고, 조합하고, 연결하고, 운영으로 넘긴다

AAP 구축은 특정 모델 하나를 들이는 일이 아닙니다. 고객의 업무 기준, 기존 시스템, 그리고 검증된 AI·자동화 자산을 실제로 돌릴 수 있는 흐름으로 이어 주는 작업입니다.

#### 01. Define · 맡길 업무 정의
무엇을 자동화하고 어디까지 사람이 검토할지를 먼저 합의합니다.
- 대상 업무와 사용 시나리오 도출
- 판단 기준·권한·예외 조건 정리
- 자동 처리·사람 검토의 경계 설정
- 성과 지표·운영 기준 합의

연계 영역 · Business Semantic Modeling · Service Experience

#### 02. Compose · 기술 자산 조합
검증된 AI·자동화 자산을 업무 목적에 맞게 조합합니다.
- 모델·검색·문서 처리
- Agent Framework / Tool Runtime
- Ontology / Knowledge Graph
- Workflow / RPA / API Gateway
- 보안·관측·품질 도구

연계 영역 · Agentic Reasoning · Enterprise Integration

#### 03. Connect · 고객 환경 연계
고객 자산과 실행 경로를 AAP 흐름에 이어 줍니다.
- Data Platform 분석 자산 연결
- ERP / CRM / SCM 기간계 처리 연동
- Document Repository · KMS 지식 끌어옴
- Legacy / Internal API 호출 경로 확보
- Security Zone · IAM 권한·감사 체계 연결

연계 영역 · Customer Environment · Enterprise Data & Inputs

#### 04. Operate · 운영·학습 체계화
운영 전환에 필요한 통제 기준과 개선 흐름을 설계하고, 고객 운영 조직이 이어받을 수 있는 기준과 리포트를 남깁니다.
- 검토·승인·예외 처리 운영 흐름 구축
- Decision Log · Audit Trail 누적
- 품질 회귀 점검·비용 통제
- Feedback Store · Skill Library 자산화
- 운영 리포트·개선 후보 도출

연계 영역 · Trust · Security · Governance · Operational Learning

> 수행의 기준은 단순히 구축을 끝내는 데 있지 않습니다. **업무 기준, 고객 자산, 실행 통제, 운영 학습이 하나의 흐름으로 맞물려 돌아가야** 비로소 AAP가 실제 운영 모델이 됩니다.

---

## 05. 적용 레퍼런스

두 사례가 AAP 구조 안에서 어떤 영역을 이미 검증했는지, 그리고 어떤 부분을 더 채우면 같은 패턴을 반복해서 쓸 수 있는 패키지가 되는지 정리합니다.

### Case 1 · AI 투자 메이트 (내부 프로젝트)

**도메인** · 자산운용 · 투자 의사결정

매크로·뉴스·블룸버그 데이터를 한곳에 모아 투자 자문을 만들어 주는 LangGraph 기반 멀티에이전트입니다. 데이터 수집 → 멀티에이전트 분석 → 자문 생성까지 처음부터 끝까지 검증을 마쳤습니다.

#### 현황 *(v3.0 업데이트)*

**AI 모델·운영 환경 구성**
- **모델** · Qwen 기반 모델 변경 테스트 완료
- **관측·품질** · Langfuse AWS 환경 구성 완료, Langfuse 기반 AI FinWave 테스트 진행
- **데이터 인프라** · AWS PostgreSQL · OpenSearch 환경 구성 진행
- **검색·지식** · Data RAG 기반 구성 완료, VectorDB 구축·운영 안정화 진행
- **확장 시도** · 뉴스 기반 Graph RAG 구축 지속, 로보어드바이저 기반 AI 적용 검토 수행

**검증 자산**
- 블룸버그·뉴스·매크로 등 외부 데이터 수집·통합 검증
- LangGraph 멀티에이전트 기반 자문 생성 검증 완료
- 내부 검증 단계 마치고 외부 영업 자료 정리 중

#### 과제 *(보완 영역 매핑)*
- 투자 정책·룰·권한 체계 미정리 → **Business Semantic Modeling 보완**
- 주문·기록 시스템 반영 경로 미구축 → **Enterprise Integration & Action 보완**
- Decision Log · HITL · 감사 등 운영 통제 체계 부재 → **Operational Learning · Trust 보완**

#### Strategy · 가까운 시일의 도전 · 내부 검증을 외부 영업으로 옮기기

자산운용 자문을 외부 영업 자리로 옮기고, 인접 자문 도메인(법무·세무)에 같은 패턴을 한 번 적용해 보는 것까지가 가까운 시일의 목표입니다.

| 시점 | 내용 |
| --- | --- |
| 현재 | 내부 검증 완료, Qwen 전환·Langfuse·VectorDB 등 운영 환경 안정화 진행, **외부 영업용 자료 정리** |
| 단기 · FY26 2H | KT그룹 금융 채널 PoC, **자산운용사 1~2곳 영업 진입** |
| 중기 · FY27 1H | 법무·세무 자문 도메인 **1곳 확장 PoC** |

**PLAY 1 · 금융 자문·통제 패키징**
운용 한도·감사 추적·HITL 통제를 AAP의 Semantic·Foundation에 얹은 "금융 자문 AAP" 패키지로 정리 → 금융권 영업 자리에서 바로 꺼내 보일 수 있는 형태

**PLAY 2 · 파트너 결합형 통합 SI 제안**
비투엔(RAG) · 인핸스(온톨로지)와 묶은 통합 SI 제안서로 **자체 모델이 약한 부분을 파트너 자산으로 보완** → 수주 경쟁력 확보

---

### Case 2 · 한국기계산업진흥회 온톨로지 (PoC 선제안 · 1차 완료)

**도메인** · 공공·협회 · 기계산업

국제 정세·통상 규제·환율 변화를 기계산업 도메인 온톨로지로 정리해, 회원사별로 어떤 영향을 받는지 분석하고 알려 주는 의사결정 자동화입니다. 1차 사업을 마쳤고, 현재 기술 세미나를 진행 중입니다.

#### 현황
- 기계산업 도메인 온톨로지·KG 1차 설계 완료
- 회원사 영향도 분석 룰 설계 검증
- 도메인 SME 협업 기반 규제·정책 모델링 방법론 확보

#### 과제 *(보완 영역 매핑)*
- 정세·환율·규제 외부 데이터 자동 수집 미구축 → **Enterprise Data & Inputs 보완**
- 자율 추론·도구 호출 자동화 부재 → **Agentic Reasoning 보완**
- 회원사 통보·리포팅 Workflow 미구현 → **Enterprise Integration & Action 보완**
- 폐쇄망·감사 등 공공 요건 대응 필요 → **Trust · Security · Governance 보완**

#### Strategy · 가까운 시일의 도전 · 본 사업 수주 후 유사 단체 1곳 확장

진흥회 본 사업을 발판으로, 1년 안에 비슷한 성격의 산업단체 1곳에 같은 모델을 옮겨 가는 것이 가까운 시일의 목표입니다.

| 시점 | 내용 |
| --- | --- |
| 현재 | 1차 사업 완료, **본 사업 RFP 대응 중** |
| 단기 · FY26 2H | 본 사업 수주, **회원사 통보 자동화 본 구축** |
| 중기 · FY27 1H | 자동차·무역 등 **유사 단체 1곳 확장 PoC** |

**PLAY 1 · 산업단체 온톨로지 표준 템플릿화**
1차 사업에서 만든 기계산업 온톨로지를 다시 쓸 수 있는 **"산업단체 도메인 템플릿"**으로 정리 → 새 단체에 들어갈 때 준비 기간 단축

**PLAY 2 · 공공 폐쇄망 결합 제안**
KT그룹의 보안·망분리·감사 자산에 보안 파트너(디피니트 등)를 더해 **공공 통제형 AAP 패키지**로 정리 → 공공 시장 진입 카드로 활용

---

> **두 사례는 서로 다른 축에서 검증과 요구를 보여줍니다.** AI 투자 메이트는 *Inputs · Agentic · Service*를, 진흥회 온톨로지는 *Semantic*을 검증했고, 한쪽에서 비어 있는 영역이 다른 쪽의 강점과 맞물리는 구조입니다. AAP는 이 두 흐름을 묶어 일반화해, 다른 산업과 고객에도 같은 방식으로 적용할 수 있는 형태로 만들어 둡니다.

---

## 06. 산업별 적용 예시

AAP는 공통 구조를 그대로 가져가되, 산업에 따라 어떤 메시지로 진입하고 어떤 영역부터 먼저 적용할지를 다르게 조정할 수 있습니다.

### 06-1. 공공·협회 · 정책 변화 영향 분석 및 통보 자동화

**고객 상황** · 공공기관·진흥기관·협회는 정책·규제·산업 동향·통상 이슈를 모은 뒤, 회원사나 대상 기관에 어떤 영향을 미치는지 분석해서 안내해야 합니다. 데이터와 문서는 여러 곳에 흩어져 있고, 영향도 판단과 통보는 담당자 개인의 경험에 기대고 있는 경우가 많습니다.

**AAP 적용 방향**
- 산업별 개념·품목·회원사 관계 정리 (Ontology)
- 정책·규제·통상 이벤트 수집
- 회원사·품목·시장·매출에 미치는 영향 범위 정리
- 영향도 판단 룰 정리
- 회원사별 통보 우선순위와 대응 가이드 작성
- 통보 이력과 피드백 누적

**강조 영역** · Business Semantic Modeling · Enterprise Data & Inputs · Enterprise Integration & Action · Operational Learning · Audit & Explainability

### 06-2. 금융 · 내부통제·심사·투자 자문 Agent

**고객 상황** · 금융권은 AI를 쓰고 싶다는 수요는 높지만, 규제·감사·내부통제·폐쇄망·설명 가능성에 대한 요구도 함께 강합니다. 단순한 챗봇이나 문서 요약만으로는 실제 업무에 붙이기 어렵습니다.

**AAP 적용 방향**
- 금융 정책·규정·내부통제 기준 정리
- 심사·승인·예외 처리 프로세스 모델링
- 투자 자문 보조 또는 리스크 검토 Agent 설계
- 의사결정의 근거와 출처를 함께 기록
- 고위험 업무에 대한 HITL 승인
- 감사할 수 있는 Decision Log 구축

**강조 영역** · Business Semantic Modeling · HITL & Action Policy · Decision / Action Logging · Trust · Security · Governance · Private Deployment

### 06-3. 제조 · 품질·설비·공급망 업무 Agent

**고객 상황** · 제조기업은 설비·품질·생산·공급망·고객 VOC 데이터가 많지만, 이 데이터들이 여러 시스템에 흩어져 있습니다. 현장 판단은 숙련자의 경험에 많이 기대고 있어, 이상 상황 대응이나 지식 전수가 쉽지 않습니다.

**AAP 적용 방향**
- 설비·품질·공정 데이터 연계
- 불량 원인 분석 지식 정리
- 공급망 리스크 이벤트 수집
- 조치 추천과 작업 지시 후보 생성 및 담당자 검토 연계
- 예외 상황에 대한 담당자 승인
- 조치 이력과 재발 방지 지식의 누적

**강조 영역** · Enterprise Data & Inputs · Business Semantic Modeling · Enterprise Integration & Action · Operational Learning

### 06-4. 유통·서비스 · VOC·고객 대응·운영 업무 Agent

**고객 상황** · 유통·서비스 기업에는 고객 문의·VOC·주문·배송·환불·매장 운영 이슈가 반복해서 발생합니다. 지금까지의 챗봇은 답변에 머무르고, 실제 처리와 시스템 반영은 결국 사람이 맡습니다.

**AAP 적용 방향**
- VOC·상담·주문·배송 데이터 통합
- 고객 유형과 정책 기준 정리
- 환불·교환·보상 기준에 따른 처리 경로 추천
- 필요 시 상담원이나 현업의 승인으로 넘어가는 분기 처리
- CRM·주문·배송 시스템에 반영
- 반복되는 이슈와 대응 스킬의 누적

**강조 영역** · Business Agents · Review / Approval · Workflow / Writeback · Evaluation & Feedback Loop · Reusable Skill & Improvement

### 06-5. 국방·보안 민감 산업 · 폐쇄망 기반 통제형 Agent

**고객 상황** · 국방·보안·중요 인프라 영역은 외부 SaaS형 AI를 들이기가 쉽지 않고, 폐쇄망·망분리·권한·감사·보안 정책이 도입 가능 여부를 좌우합니다.

**AAP 적용 방향**
- 폐쇄망 또는 Private 환경에 배포
- 내부 규정·운영 문서·보안 지식을 기반으로 한 통제형 Agent 구축
- 권한별 정보 접근 제어
- 실행 이력과 감사 로그를 함께 저장
- 고위험 실행은 사람이 승인하도록 분기
- 보안 정책에 따라 Tool 사용 범위 제한

**강조 영역** · Security Guardrails & Private Deployment · Identity & Access Control · Audit & Explainability

---

## 07. 고객 유형별 진입 패턴

06장이 **"무엇을 제안할 수 있는가"**를 산업별로 보여준다면, 07장은 **"어떤 메시지와 범위로 먼저 들어갈 것인가"**를 고객 성숙도·규제 수준에 따라 정리합니다.

### Type A · 대기업 / 자체 AI 조직 보유

**상황** · Data Platform과 AI 조직은 이미 있지만, 이를 실제 업무 운영으로 옮기는 데서 막혀 있습니다.

**제안 메시지** · 기존 데이터·AI 플랫폼 위에 **업무 판단·실행·검토를 연결하는 Agentic Layer**를 얹어, 운영 전환 속도를 끌어올립니다.

**강조점**
- 기존 플랫폼을 대체하지 않고 보완
- 업무 맥락 정리와 실제 실행의 연계
- Writeback
- Operational Learning
- 내부 AI 조직과 함께 일할 수 있는 구조

### Type B · 산업 특화 중견

**상황** · AI 조직 규모는 크지 않지만, 반복 업무·문서·승인·예외 처리에 대한 요구가 또렷합니다.

**제안 메시지** · 업무와 시스템에 맞춘 **구축형 AAP**로 작은 영역부터 빠르게 시작합니다.

**강조점**
- 제한된 업무 범위에서 시작해 성과 확인 후 확장 (Small Start)
- Business Agents (산업·직무 특화)
- 현업 프로세스에 기반한 설계
- SI 구축과 운영 지원
- 외부 솔루션을 조합하는 방식

### Type C · 공공·금융·국방 등 규제·통제형 고객

**상황** · 보안·감사·망분리·승인 체계가 AI 도입 가능 여부를 사실상 좌우합니다.

**제안 메시지** · 권한·감사·HITL·폐쇄망 요건을 함께 반영한 **통제형 AAP**로 접근합니다.

**강조점**
- Security Guardrails & Private Deployment
- Identity & Access Control / Audit
- HITL & Action Policy
- 실행 이력과 설명 가능성
- 보안 솔루션 및 파트너와의 조합

---

## 08. 후속 논의 방향

이 AAP 기획안이 채택되면, 기술 조직과 함께 **실제 구축 범위·외부 자산 조합·파트너 역할·비용 산정 기준**를 차례로 구체화해 갑니다.

지금 단계에서는 구축 프로세스를 먼저 꺼내기보다, **AAP의 정의와 통합 구조, 단계별 구축 범위**에 대한 합의를 먼저 맞추는 것이 더 중요합니다. 이후 논의에서는 아래 순서로 구체화해 갑니다.

| Step | 내용 | 설명 |
| --- | --- | --- |
| 1 | 업무 후보 선정 | 반복이 많고, 판단이 필요하고, 문서·데이터 의존도가 높고, 시스템에 실행으로 이어져야 하는 업무를 우선 골라냅니다. |
| 2 | 업무 맥락과 정책 정리 | 업무 개념, 정책, 권한, 예외, 프로세스, 판단 기준을 함께 정리해 둡니다. |
| 3 | 시스템·데이터 연계 진단 | Data Platform·ERP/CRM/SCM·KMS·문서 저장소·외부 API 연계가 어느 수준까지 가능한지 확인합니다. |
| 4 | Agent 실행 흐름 설계 | Agent가 어떤 정보를 참고하고, 어떤 도구를 부르며, 어느 시점에 사람 검토로 넘길지를 정합니다. |
| 5 | 통제형 Pilot 설계 | 단순 기능 검증(PoC)이 아니라 **제한된 업무 범위·권한·실행 대상을 정한 운영형 Pilot**으로 설계합니다. |
| 6 | 운영 학습 체계 설계 | Decision Log, Feedback, **Evaluation**, Skill Catalog를 묶어 **품질 점검과 운영 개선이 반복되는 구조**를 만듭니다. |

### 내부 협업이 필요한 영역

| 영역 | 협업 포인트 |
| --- | --- |
| 사업개발 | 타겟 산업·고객 유형·오퍼링 메시지·파트너 전략 |
| 영업 | 고객의 핵심 고민·제안 진입 시나리오·레퍼런스 활용 |
| 수행 총괄 | 프로젝트 범위·일정·리스크·견적 구조·수행 책임 |
| 기술 조직 | 아키텍처 검증·솔루션 선정·보안/인프라 설계·운영 기준 |
| 파트너 | 전문 솔루션·KG/Ontology·LLM·EvalOps·보안·RPA |
| 보안 / 컴플라이언스 | 개인정보·보안정책·감사·폐쇄망·규제 요건 검토 |

---

## 09. 별첨 · Capability별 구현 기술·자산 후보

위 Capability Map은 의미 중심의 슬림 버전입니다. 본 부록은 실제 구축 시 검토되는 **구현 기술·자산 후보**를 capability 단위로 펼친 참고용입니다. **특정 제품/스택 채택을 의미하지 않으며**, 고객 환경과 RFP 요건에 따라 선택·조합됩니다.
★ 표시는 kt ds 차별화 영역입니다.

### Customer Environment · 고객 보유 자산 · 외부 영역

| Capability | 구현 기술·자산 후보 |
| --- | --- |
| Data Platform / Analytics Assets | Lakehouse · Warehouse · Catalog · BI/분석 자산 |
| Business Systems | ERP · CRM · SCM · 그룹웨어 · 전자결재 · Internal API · EAI |
| Document / Knowledge Assets | KMS · Document Repository · 규정·매뉴얼 · FAQ |

### Service Experience · 사용자 접점

| Capability | 구현 기술·자산 후보 |
| --- | --- |
| AI Agent Portal | Agent Catalog · Execution UI · Run History · User Workspace |
| ★ Business Agents | 공통 업무 Agent (검색·요약·VOC·보고서) · 산업 특화 (금융·공공·제조) · 직무 특화 (HR·재무·CS) |
| Review / Approval Workspace | Approval UI · HITL Console · Audit View · Evidence Panel |

### Enterprise Data & Inputs · 고객 자산 → AAP 입력

| Capability | 구현 기술·자산 후보 |
| --- | --- |
| System & Data Connectors | REST/SOAP API · DB Connector · File/SFTP · Lakehouse·Warehouse 연계 · Message Bus |
| Document / Knowledge Ingestion | RAG Pipeline · OCR · Document Parser · Embedding · Vector Store |
| Operational Data Integration | Event Log · Audit Trail · Stream (Kafka 등) · Public API · Subscription |

### Business Semantic Modeling · kt ds 차별화 핵심

| Capability | 구현 기술·자산 후보 |
| --- | --- |
| ★ Business Concept Model | 업무 용어집 · 도메인 모델 · Knowledge Graph · Property Graph · OWL/RDF/SKOS (선택) · SPARQL/Cypher (선택) |
| ★ Process & Decision Rule Model | 업무 절차 정의 · 판단 룰 · 예외 조건 · BPMN/DMN (선택) · Rule Repository · Versioning |
| ★ Authority & Policy Model | 권한 매트릭스 · 승인 규칙 · RBAC/ABAC · 자동/수동 처리 경계 정의 |

### Agentic Reasoning · Agent 판단 계층

| Capability | 구현 기술·자산 후보 |
| --- | --- |
| Planning & Orchestration | Agent Framework (LangGraph · AutoGen · Semantic Kernel 등) · Multi-step Plan · Branching |
| Tool Calling Runtime | MCP · OpenAPI · Function Calling · Tool Registry · Work Context/State Store |
| HITL & Action Policy | Confidence Threshold · Risk Score · Escalation Policy · Guardrail Hook |

### Enterprise Integration & Action · 실행·시스템 반영

| Capability | 구현 기술·자산 후보 |
| --- | --- |
| Workflow & Approval Execution | Workflow Engine (Camunda · Temporal · n8n 등) · API Gateway (Kong 등) · RPA (UiPath · Power Automate 등) |
| System Writeback | ERP/CRM/SCM Writeback · 그룹웨어·결재 연계 · Internal API 호출 |
| Exception & Transaction Control | Retry/Rollback Rule · Pre-check · Manual Review Queue · SLA 관리 |

### Operational Learning · 운영 학습·자산화

| Capability | 구현 기술·자산 후보 |
| --- | --- |
| ★ Decision / Action Logging | Decision Basis · Tool Call Trace · I/O Capture · Action Lineage |
| ★ Evaluation & Feedback Loop | User Feedback · Outcome Data · Eval Set · Regression Test · A/B Test · **Langfuse 등 관측·평가 도구** |
| ★ Reusable Skill & Improvement | Validated Skill Catalog · Versioning · 정책·스킬·지식 개선 후보 |

### Trust · Security · Governance · 공통 기반

| Capability | 구현 기술·자산 후보 |
| --- | --- |
| Identity & Access Control | IAM · SSO · OIDC/SAML · MFA |
| Audit & Explainability | Evidence Store · Citation · Action Lineage · Audit Trail |
| Security Guardrails & Private Deployment | Encryption/Masking/Tokenization · Input/Output Filter · Policy Engine (OPA 등) · On-premise · VPC · 폐쇄망 |

---

## 변경 이력

### v3.0 (2026-05-21)

- **본문 Capability Map 슬림화** · 8 Layer × 핵심 capability 3개로 압축. chip은 의미 중심 한글 용어로 통일.
- **별첨 신설** · 본문에서 뺀 구현 기술 후보(OWL/RDF/SKOS/SPARQL/Cypher/BPMN/DMN/MCP/LangGraph/AutoGen/Semantic Kernel/Camunda/Temporal/n8n/Kong/UiPath/Power Automate/OIDC/SAML/OPA 등)를 capability별 매핑표로 정리.
- **범례 재구성** · "차별화 요소"를 별도 색인에서 제거 → ★ 별표 표기로 일원화. 범례는 책임 영역(kt ds / 외부 자산) 2축만 유지.
- **AI 투자 메이트 현황 업데이트**
  - Qwen 기반 모델 변경 테스트 완료
  - Langfuse AWS 환경 구성 완료 + Langfuse 기반 AI FinWave 테스트 진행
  - AWS PostgreSQL · OpenSearch 환경 구성 진행
  - Data RAG 기반 구성 완료, VectorDB 구축·운영 안정화 진행
  - 뉴스 기반 Graph RAG 구축 지속
  - 로보어드바이저 기반 AI 적용 검토 수행

### v0.2 (선행본)
- 8 Layer × 4~5 capability 기반 상세 맵 작성 (선행 HTML 작업본 `aap_proactive_offering_v210_260521.html`)
