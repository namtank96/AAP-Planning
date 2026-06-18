# AAP Standard Runtime & Industry Expansion Strategy v0.1

> 목적: 지금까지의 회의 업무 × AAP 논의를 압축해, AAP의 표준 작동 문법을 정의하고 다른 산업·고객군으로 확장하기 위한 전략을 정리한다.  
> 핵심 관점: 회의 데모는 최종 상품이 아니라, AAP의 구조와 작동 원리를 투명하게 보여주는 **Reference Runtime Instance**다.

---

## 0. Executive Summary

지금까지의 회의 업무 데모 논의는 단순히 “회의를 자동화하는 AI”를 만들기 위한 것이 아니다.  
회의 업무는 AAP의 내부 형상과 작동 원리를 설명하기 위한 첫 번째 기준 시나리오다.

사람들이 궁금해하는 것은 AAP가 멋진지 여부가 아니다.  
정말 궁금한 것은 다음이다.

```text
AAP 내부는 어떻게 생겼는가?
요청이 들어오면 어떤 계층이 움직이는가?
Agent들은 무엇을 나눠서 하는가?
데이터는 어떤 객체로 바뀌는가?
어디서 자동 실행하고 어디서 사람에게 넘기는가?
실행 결과는 어디에 남는가?
다음 실행은 어떻게 더 좋아지는가?
```

따라서 회의 데모는 다음 역할을 해야 한다.

> 회의 데모는 AAP의 첫 상품이 아니라, AAP가 어떤 구조로 작동하고 어떻게 다른 산업으로 복제될 수 있는지를 보여주는 표준 Runtime Reference다.

이 문서의 결론은 다음과 같다.

```text
공통 Runtime Grammar는 유지한다.
산업별 Domain Pack만 교체한다.
고객군별 진입 메시지를 다르게 가져간다.
실행 결과와 피드백은 Skill Library로 자산화한다.
```

---

## 1. 세션 메모리 압축

## 1.1 AAP는 기능 묶음이 아니라 닫힌 운영 루프다

AAP는 개별 LLM, RAG, Agent Framework 묶음이 아니다.  
AAP는 고객의 데이터, 문서, 시스템을 업무 의미로 구조화하고, Agent가 판단·실행·검토하며, 운영 결과를 지식·스킬·판단 이력으로 축적하는 기업용 Agentic AI Platform이다.

따라서 데모도 단일 기능 시연이 아니라, 업무 요청이 다음 루프를 통과하는 모습을 보여줘야 한다.

```text
Business Semantic Modeling
→ Agentic Reasoning
→ Enterprise Integration & Action
→ Operational Learning
→ 다시 Business Semantic으로 환류
```

## 1.2 회의 업무는 첫 샘플이지 최종 상품이 아니다

회의는 누구나 이해할 수 있는 일반 업무다.  
따라서 AAP의 형상과 작동 원리를 설명하기 좋은 소재다.

그러나 회의 데모가 다음처럼 보이면 실패다.

```text
회의를 자동으로 잡아주는 AI
회의록을 정리해주는 AI
캘린더 자동화 도구
```

회의 데모는 다음 표준 패턴을 보여주는 예시여야 한다.

```text
모호한 요청
→ 업무 사건
→ 데이터·Agent·도구·정책 발산
→ 실행 패키지
→ 사람 검토
→ 시스템 반영
→ 운영 학습
```

## 1.3 핵심 차별화는 Business Semantic Modeling이다

AAP의 차별화는 문서 검색이나 답변 생성이 아니다.  
핵심은 업무 용어, 정책, 권한, 절차, 판단 기준을 Agent가 이해 가능한 구조로 바꾸는 것이다.

회의 업무에서는 다음이 Business Semantic Modeling 대상이다.

```text
회의 유형
회의 목적
참석자 역할
필요 자료
안건 구조
외부 공유 정책
공식 회의록 확정 기준
액션아이템 책임 기준
```

산업 확장에서도 핵심은 “Agent 몇 개를 더 만드는 것”이 아니라, 산업별 업무 의미 모델을 어떻게 재사용·치환할 것인가다.

## 1.4 AAP의 투명성은 Run Trace다

AAP의 투명성은 단순히 근거 문서를 보여주는 것이 아니다.  
AAP의 투명성은 전체 실행 경로를 재생할 수 있는 구조다.

Run Trace는 다음을 보여줘야 한다.

```text
무엇을 입력으로 받았는가?
어떤 시스템을 조회했는가?
어떤 업무 의미 모델을 적용했는가?
어떤 Agent가 어떤 작업을 했는가?
어디서 자동 실행했고 어디서 HITL로 넘겼는가?
어떤 시스템에 무엇을 반영했는가?
무엇이 로그와 Skill로 남았는가?
```

따라서 화면 구조도 다음 4영역으로 설계해야 한다.

```text
좌측: 사용자 업무 화면
중앙: AAP 내부 Runtime 구조
우측: 작동 해석 패널
하단: Action / Decision / Governance / Learning Log
```

## 1.5 확장은 화면 복제가 아니라 운영 객체 복제다

회의 화면을 다른 산업에 그대로 복사하면 안 된다.  
복제해야 하는 것은 화면이 아니라 AAP의 운영 객체다.

표준 운영 객체는 다음과 같다.

```text
Work Event
Context Package
Agent Task Graph
Candidate Set
Coordination Result
Execution Package
Human Review Decision
Action Result
Run Trace
Skill Update
```

이 객체들이 AAP의 표준 실행 단위가 된다.

## 1.6 고객 유형별 진입 전략은 달라야 한다

AAP는 고객 유형에 따라 다른 메시지와 진입 Pack이 필요하다.

```text
대기업 / 자체 AI 조직 보유
→ 기존 AI·Data Platform 위에 Agentic Runtime Layer를 얹는 접근

산업 특화 중견
→ 반복 업무와 승인·예외처리 중심의 Vertical Agent 접근

공공·금융·국방
→ 폐쇄망, 권한, 감사, HITL을 포함한 통제형 AAP 접근
```

---

## 2. AAP Standard Runtime Grammar

## 2.1 표준 작동 문법

AAP를 표준화하려면 산업별 화면이 아니라 공통 Runtime Grammar를 만들어야 한다.

모든 산업·업무는 다음 문법으로 번역되어야 한다.

```text
Request
→ Work Event
→ Context Package
→ Task Graph
→ Candidate Sets
→ Coordination Result
→ Execution Package
→ HITL Decision
→ System Writeback
→ Run Trace
→ Skill Update
```

회의 업무는 이 문법의 첫 번째 Reference Instance다.

## 2.2 Runtime Grammar 설명

| 단계 | 설명 | 회의 업무 예시 |
|---|---|---|
| Request | 사용자의 자연어 또는 시스템 이벤트 입력 | “AAP 고객사 킥오프 회의 잡아줘” |
| Work Event | 요청을 업무 사건으로 구조화 | Meeting Event |
| Context Package | 관련 데이터·문서·시스템 맥락 묶음 | 메일, 캘린더, 조직도, 제안서, 이전 회의록 |
| Task Graph | Supervisor가 하위 Agent 작업으로 분해 | 참석자, 일정, 자료, 안건, 정책, 실행 Task |
| Candidate Sets | Agent가 생성한 후보군 | 참석자 후보, 시간 후보, 자료 후보, 안건 초안 |
| Coordination Result | 후보·정책·신뢰도·충돌 조율 결과 | 자동 실행, HITL, 제한 항목 분리 |
| Execution Package | 실행 가능한 업무 패키지 | 회의명, 참석자, 일정, 자료, 안건, 승인 항목 |
| HITL Decision | 사람의 검토·승인·수정 이력 | 참석자 확정, 외부 자료 승인 |
| System Writeback | 실제 업무 시스템 반영 | 캘린더, 메일, 문서함, To-do 등록 |
| Run Trace | 실행 전 과정의 추적 가능 로그 | 조회, 판단, 승인, 실행, 학습 이력 |
| Skill Update | 반복 가능한 업무 패턴 저장 | Kickoff Meeting Skill 업데이트 |

---

## 3. 표준화해야 할 5개 레벨

## 3.1 Level 1. Work Event 표준화

가장 먼저 표준화할 것은 업무 사건이다.

회의에서는 Meeting Event였지만, 산업이 바뀌면 다음처럼 바뀐다.

| 산업/업무 | Work Event 예시 |
|---|---|
| 회의 업무 | Meeting Event |
| 손해사정 | Claim Assessment Event |
| 금융 내부통제 | Control Review Event |
| 투자 자문 | Investment Advisory Event |
| 제조 품질 | Quality Issue Event |
| 공급망 | Supply Risk Event |
| VOC 대응 | Customer Complaint Event |
| 공공 민원 | Civil Request Event |
| 교육 행정 | Student Record / Evaluation Event |

각 Work Event는 공통 필드를 가져야 한다.

```text
event_id
event_type
business_context
actors
artifacts
policies
required_outputs
risk_level
available_actions
hitl_points
expected_logs
learning_targets
```

이 필드를 표준화하면 AAP는 어떤 업무든 업무 사건으로 받아들일 수 있다.

## 3.2 Level 2. Context Package 표준화

Context Package는 AAP가 발산하기 위한 연료다.  
산업별로 구성은 다르지만 역할은 같다.

| 산업/업무 | Context Package 구성 |
|---|---|
| 회의 | 메일, 캘린더, 조직도, 이전 회의록, 제안서 |
| 손해사정 | 청구서, 약관, 진단서, 계약, 과거 지급 이력 |
| 내부통제 | 규정, 승인 이력, 거래 로그, 예외 내역, 권한 매트릭스 |
| 투자 자문 | 시장 데이터, 뉴스, 포트폴리오, 투자 성향, 리스크 기준 |
| 제조 품질 | 설비 로그, 검사 결과, 불량 이력, 공정 조건, 작업 지시 |
| VOC | 상담 이력, 주문 정보, 고객 등급, 정책, 보상 기준 |
| 공공 민원 | 민원 내용, 법령, 처리 기준, 이전 유사 사례, 담당 부서 |

## 3.3 Level 3. Agent Task Graph 표준화

회의 업무에서는 다음 Agent들이 작동했다.

```text
Supervisor Agent
Participant Agent
Calendar Agent
Knowledge Agent
Agenda Agent
Policy Agent
Meeting Run Agent
Action Item Agent
Writeback Agent
Learning Agent
```

산업이 바뀌어도 공통 역할군은 유지된다.

```text
Supervisor Agent
Context Agent
Domain Reasoning Agent
Evidence Agent
Policy Agent
Action Agent
Review Agent
Writeback Agent
Learning Agent
```

산업별 Agent 매핑은 다음과 같다.

| 공통 Agent 역할 | 회의 | 손해사정 | 제조 품질 | 금융 내부통제 |
|---|---|---|---|---|
| Context Agent | 관련 메일·자료 수집 | 청구·계약·진단서 수집 | 설비·검사 로그 수집 | 규정·거래 로그 수집 |
| Domain Agent | 회의 유형 판단 | 보장 범위 판단 | 불량 원인 후보 판단 | 통제 위반 후보 판단 |
| Evidence Agent | 자료 패키지 구성 | 근거 문서·약관 매핑 | 검사 근거·이력 매핑 | 규정·증빙 매핑 |
| Policy Agent | 외부 공유 판단 | 지급·면책 기준 판단 | 조치 승인 기준 판단 | 승인·예외 기준 판단 |
| Action Agent | 초대·문서 생성 | 서류 요청·지급 보류 | 작업 지시·조치 등록 | 승인 요청·보고 등록 |
| Learning Agent | 회의 Skill 저장 | 심사 패턴 저장 | 재발 방지 패턴 저장 | 예외 처리 패턴 저장 |

Agent 표준화는 이름 표준화가 아니라 역할군 표준화여야 한다.

## 3.4 Level 4. HITL / Action Policy 표준화

AAP가 산업에 들어가려면 어디까지 자동이고 어디서 사람이 책임지는가가 표준화되어야 한다.

| 처리 경로 | 기준 | 예시 |
|---|---|---|
| Auto | 위험 낮음, 근거 충분, 시스템 영향 작음 | 후보 조회, 초안 생성, 내부 폴더 생성 |
| Review | 대외 영향, 권한 판단, 민감 정보 포함 | 외부 발송, 자료 공유, 공식 문서 확정 |
| Approval | 비용·계약·지급·규제·고위험 의사결정 | 지급 승인, 투자 권고, 통제 예외 승인 |
| Block | 정책 위반, 권한 없음, 근거 부족 | 민감 자료 외부 전송, 무권한 시스템 변경 |

산업 확장 전략의 핵심은 자동화율을 높이는 것만이 아니다.  
자동, 검토, 승인, 차단의 경계를 고객별로 설계하는 것이다.

## 3.5 Level 5. Operational Learning 표준화

AAP의 해자는 한 번 만든 Agent가 아니라 운영하면서 쌓이는 Decision Log, Action Log, Feedback, Skill Library다.

공통 표준은 다음과 같다.

```text
Decision Log
- 어떤 판단을 했는가
- 어떤 근거를 사용했는가
- 누가 승인했는가
- 어떤 정책을 적용했는가

Action Log
- 어떤 도구를 호출했는가
- 어떤 시스템에 무엇을 반영했는가
- 성공/실패/보류 결과는 무엇인가

Feedback Log
- 사용자가 무엇을 수정했는가
- 어떤 추천이 거절되었는가
- 어떤 결과가 반복적으로 보정되는가

Skill Update
- 재사용 가능한 업무 패턴은 무엇인가
- 어떤 조건에서 적용 가능한가
- 버전과 검증 상태는 무엇인가
```

---

## 4. 확장 전략: 3개 축

## 4.1 축 1. Horizontal Work Pack

Horizontal Work Pack은 산업 공통 업무다.  
회의 데모는 여기에 속한다.

| Pack | 적용 업무 | 메시지 |
|---|---|---|
| Meeting Runtime Pack | 회의 준비, 진행, 회의록, 액션아이템 | AAP의 작동 원리를 가장 쉽게 설명 |
| Report / Briefing Pack | 보고서, 임원 브리핑, 주간 보고 | 문서 생성 + 근거 + 승인 + 배포 |
| Approval Support Pack | 결재 검토, 승인 의견, 예외 처리 | HITL과 Action Policy 강조 |
| Knowledge Work Pack | 사내자료 검색, FAQ, 업무 Q&A | 단순 RAG와 AAP 차이 설명 |
| VOC Response Pack | 고객 문의, 불만, 보상 정책 | 응대 품질 + 정책 + 후속 처리 |

Horizontal Pack은 PoC 진입 장벽이 낮다.  
다만 업무 임팩트가 작아 보일 수 있으므로 반드시 Writeback, HITL, Learning까지 보여줘야 한다.

## 4.2 축 2. Vertical Decision Pack

Vertical Decision Pack은 산업 특화 판단 업무다.

| Pack | 대상 산업 | 핵심 메시지 |
|---|---|---|
| Claim Assessment Pack | 보험·손해사정 | 청구 사건을 의미화하고 심사·보류·추가 요청까지 연결 |
| Internal Control Pack | 금융·공공·대기업 | 규정·권한·예외·승인 이력을 구조화 |
| Investment Advisory Pack | 금융·자산운용 | 데이터·뉴스·정책을 조합해 자문 근거 생성 |
| Quality Issue Pack | 제조 | 불량·설비·공정 데이터를 조합해 조치 후보 생성 |
| Supply Risk Pack | 제조·물류 | 공급망 이벤트와 대응 시나리오 자동화 |
| Civil Service Pack | 공공 | 민원·법령·처리 기준·담당 부서 연결 |
| Education Record Pack | 교육 | 학생 기록·평가·코멘트·규정 검토 연결 |

Vertical Pack은 고객 가치가 크다.  
다만 도메인 의미 모델과 정책 모델이 필요하므로 구축 난이도가 높다.

## 4.3 축 3. Regulated / Closed AAP Pack

Regulated / Closed AAP Pack은 규제·폐쇄망·감사 요구가 강한 고객군을 대상으로 한다.

| Pack | 대상 | 강조점 |
|---|---|---|
| Financial Control AAP | 금융권 | 규정, 승인, 감사, Decision Log |
| Public Closed AAP | 공공 | 폐쇄망, 권한, 민원, 법령, 감사 |
| Defense / Security AAP | 국방·보안 | 망분리, 접근 통제, 기록 추적 |
| Enterprise Governance AAP | 대기업 | 내부 정책, 승인 체계, 예외 관리 |

이 축에서는 AI 성능보다 통제 가능한 운영 구조가 더 중요하다.

---

## 5. 고객군별 표준 진입 전략

## 5.1 Type A. 대기업 / 자체 AI 조직 보유

### 고객 상황

이미 Data Platform, AI 조직, 일부 LLM PoC가 있다.  
하지만 실제 업무 실행, 운영 전환, 통제, 재사용이 막혀 있다.

### 제안 방향

```text
기존 AI와 데이터 플랫폼을 버리자는 것이 아닙니다.
그 위에 업무 실행형 Agentic Layer를 얹어 운영 가능한 구조로 전환하자는 것입니다.
```

### 진입 Pack

```text
Meeting Runtime Pack
Report / Briefing Pack
Approval Support Pack
Internal Knowledge Work Pack
```

### 강조 Capability

```text
Enterprise Data & Inputs
Business Semantic Modeling
Enterprise Integration & Action
Operational Learning
```

### 설득 포인트

```text
기존 자산 재사용
시스템 Writeback
운영 로그
Skill Library
내부 AI 조직과 공동 구축 가능
```

## 5.2 Type B. 산업 특화 중견

### 고객 상황

AI 조직은 크지 않지만 반복 업무, 문서 처리, 승인, 예외 처리 니즈가 명확하다.

### 제안 방향

```text
거대한 전사 AI 플랫폼부터 만들 필요는 없습니다.
반복적이고 판단 기준이 있는 업무 하나를 잡아 Vertical Agent로 시작할 수 있습니다.
```

### 진입 Pack

```text
VOC Response Pack
Quality Issue Pack
Claim Assessment Pack
Report / Approval Pack
```

### 강조 Capability

```text
Vertical Agent
Business Semantic Modeling
Workflow / Writeback
HITL
```

### 설득 포인트

```text
빠른 적용 가능
특정 업무 단위 ROI 설명 용이
현업 프로세스 기반 구축
이후 Pack 확장 가능
```

## 5.3 Type C. 공공·금융·국방 등 규제·폐쇄망 고객

### 고객 상황

AI를 쓰고 싶지만, 보안·감사·망분리·승인 체계가 도입 가능 여부를 결정한다.

### 제안 방향

```text
AI 기능보다 중요한 것은 통제 가능한 운영 구조입니다.
AAP는 권한, 감사, HITL, 폐쇄망 배포를 포함한 통제형 Agentic AI 구조입니다.
```

### 진입 Pack

```text
Internal Control Pack
Public Closed AAP
Financial Control AAP
Civil Service Pack
```

### 강조 Capability

```text
Trust · Security · Governance
HITL & Action Policy
Audit & Explainability
Closed / Private Deployment
Decision / Action Logging
```

### 설득 포인트

```text
무분별한 자동화가 아님
승인·감사·근거 추적 가능
폐쇄망·Private 배포 가능
고위험 업무는 HITL로 제어
```

---

## 6. 표준 자산화 전략

## 6.1 AAP Standard Runtime Kit

모든 데모와 고객 제안의 공통 기반이다.

구성:

```text
1. Runtime Flow Diagram
2. Work Event Schema
3. Context Package Schema
4. Agent Task Graph Template
5. HITL / Action Policy Template
6. Writeback Pattern
7. Run Trace Template
8. Skill Update Template
```

회의 데모는 이 Kit의 첫 번째 Reference Instance가 된다.

## 6.2 Domain Pack

산업별로 바뀌는 부분이다.

구성:

```text
1. Domain Ontology
2. Process Map
3. Decision Rule Model
4. Authority Matrix
5. Policy / Risk Rule
6. Evidence Map
7. System Connector Map
8. Vertical Skill Template
```

예시:

| Domain Pack | 핵심 구성 |
|---|---|
| Meeting Pack | 회의 유형, 참석자 역할, 자료 패키지, 회의록, 액션아이템 |
| Claim Pack | 청구 유형, 약관, 면책, 지급 기준, 서류 요청 |
| Control Pack | 규정, 권한, 승인, 예외, 감사 |
| Manufacturing Pack | 설비, 품질, 공정, 불량, 조치 |
| VOC Pack | 고객 유형, 문의 유형, 보상 정책, 후속 처리 |

## 6.3 Demo Pack

고객에게 보여주는 화면 자산이다.

구성:

```text
1. Whitebox Runtime Demo
2. Scenario Script
3. Screen Design
4. Tooltip Dictionary
5. Focus Highlight Scenes
6. Run Trace Playback
7. Industry Switcher
8. Customer Type Message Variant
```

중요한 것은 Industry Switcher다.  
회의 데모를 기본으로 두되, 사용자가 산업을 바꾸면 다음이 바뀌게 할 수 있다.

```text
Work Event 이름
Context Package 구성
Agent 이름
HITL 지점
Writeback 대상 시스템
Learning Skill 이름
정책·거버넌스 강조점
```

그러면 하나의 데모로 여러 산업 확장성을 설명할 수 있다.

## 6.4 Delivery Playbook

실제 사업화와 수행을 위한 표준 방법론이다.

| 단계 | 표준 산출물 |
|---|---|
| Define | Work Event 정의, HITL 기준, KPI, 고객 유형 진단 |
| Compose | Agent Task Graph, Skill Template, Tool Registry |
| Connect | Data/Input 연결, API/Writeback, IAM/SSO |
| Operate | Decision Log, Action Log, Feedback, Skill Catalog |

---

## 7. 회의 데모의 역할 재정의

## 7.1 나쁜 포지션

```text
회의를 자동으로 잡아주는 AI
회의록을 정리해주는 AI
회의 업무 Agent
```

이렇게 가면 너무 작아 보인다.

## 7.2 좋은 포지션

```text
AAP의 표준 Runtime을 투명하게 보여주는 Whitebox Reference Demo
```

즉 회의 데모는 고객에게 팔 첫 상품이라기보다, AAP가 어떻게 생겼고 어떻게 작동하는지 보여주는 표준 엔진 분해도다.

자동차 비유로 정리하면 다음과 같다.

```text
회의 데모 = 투명 보닛이 달린 첫 번째 테스트카
회의 업무 = 주행 시나리오
AAP Runtime = 엔진·변속기·제어장치
Run Trace = 계기판·블랙박스
Operational Learning = 정비 이력과 주행 데이터 기반 튜닝
Domain Pack = 차종별 바디와 용도별 세팅
```

---

## 8. 확장 우선순위 제안

## 8.1 1순위. Meeting Runtime Pack

### 목적

```text
AAP 형상과 작동 원리 설명
내부/고객 모두 이해 가능한 기준 데모 확보
Whitebox Runtime 구조 완성
```

### 산출물

```text
시나리오 스크립트
화면 설계서
HTML 데모
Runtime Object Schema
Tooltip Dictionary
Run Trace Playback
```

## 8.2 2순위. Claim Assessment Pack

### 목적

```text
판단, 근거, 정책, HITL, Writeback이 강한 업무로 확장
AAP의 업무 심화 가능성 입증
```

### 특징

```text
회의보다 도메인 복잡도 높음
Business Semantic과 Decision Rule이 강하게 드러남
고객 가치가 더 큼
```

## 8.3 3순위. Internal Control / Financial Control Pack

### 목적

```text
규제·감사·권한·폐쇄망 고객군에 대응
Trust Foundation과 HITL을 전면에 제시
```

### 특징

```text
금융권/공공권 진입 메시지로 적합
감사 가능한 Decision Log가 핵심
```

## 8.4 4순위. VOC / Customer Response Pack

### 목적

```text
서비스·유통·통신 고객군에 적용
고객 문의 → 정책 판단 → 보상/응대 → 후속 처리까지 연결
```

### 특징

```text
고객 접점 업무라 이해가 쉬움
운영 로그와 품질 평가가 자연스러움
```

## 8.5 5순위. Manufacturing Quality Pack

### 목적

```text
제조 고객군에 확장
설비·품질·공정·조치 이력 기반 AAP 적용
```

### 특징

```text
Data & Inputs가 강함
조치 추천과 작업 지시 Writeback이 중요
```

---

## 9. 지금 바로 해야 할 다음 작업

## Step 1. AAP Standard Runtime Pattern 문서화

문서명 예시:

```text
AAP Standard Runtime Pattern v0.1
```

내용:

```text
Request
Work Event
Context Package
Task Graph
Candidate Set
Coordination Result
Execution Package
HITL Decision
Writeback Result
Run Trace
Skill Update
```

이 문서가 가장 중요하다.  
회의, 손해사정, 내부통제, VOC, 제조 품질이 모두 이 문서를 상속해야 한다.

## Step 2. Industry Expansion Matrix 작성

문서명 예시:

```text
AAP Industry Expansion Matrix v0.1
```

내용:

```text
산업별 Work Event
필요 Context Package
핵심 Agent
HITL 지점
Writeback 대상
Learning 자산
제안 메시지
```

## Step 3. Meeting Demo에 Industry Switcher 반영

HTML 데모를 만들 때 처음부터 확장성을 넣는다.

```text
기본: Meeting
전환 예시: Claim / Control / VOC / Quality
```

모든 산업을 깊게 만들 필요는 없다.  
Meeting만 깊게 만들고, 다른 산업은 패턴 치환이 가능하다는 것을 보여주는 정도가 적절하다.

## Step 4. 고객 유형별 제안 메시지 세트 작성

같은 AAP라도 고객 유형에 따라 메시지가 달라야 한다.

```text
대기업: 기존 AI·데이터 플랫폼 위의 Agentic Runtime Layer
중견: 특정 반복 업무에서 시작하는 Vertical Agent Pack
공공·금융·국방: 통제 가능한 폐쇄형 Agentic AI 운영 구조
```

---

## 10. 최종 판단

지금 필요한 것은 더 많은 화면을 만드는 것이 아니라, 세션 메모리를 압축해 AAP의 표준 작동 문법으로 바꾸는 것이다.

회의 업무에서 뽑아낸 패턴은 다음과 같다.

```text
Request
→ Work Event
→ Context Package
→ Agent Task Graph
→ Coordination
→ Execution Package
→ HITL
→ Writeback
→ Run Trace
→ Skill Update
```

이것이 AAP의 표준 Runtime Grammar다.

산업 확장은 다음 방식으로 가야 한다.

```text
공통 Runtime Grammar는 유지한다.
산업별 Domain Pack만 교체한다.
고객군별 진입 메시지를 다르게 가져간다.
실행 결과와 피드백은 Skill Library로 자산화한다.
```

한 문장으로 정리하면 다음과 같다.

> 회의 데모는 AAP의 첫 상품이 아니라, AAP가 어떤 구조로 작동하고 어떻게 다른 산업으로 복제될 수 있는지를 보여주는 표준 Runtime Reference다. 이제부터는 “회의 데모 만들기”가 아니라 “AAP Standard Runtime을 정의하고, 산업별 Domain Pack으로 확장하는 전략”으로 전환해야 한다.
