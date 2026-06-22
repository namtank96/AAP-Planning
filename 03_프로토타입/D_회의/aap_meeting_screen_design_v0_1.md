# AAP Meeting Runtime Demo — 화면 설계서 v0.1

> 목적: 회의 업무 시나리오를 기반으로, AAP의 형상과 작동 원리를 투명하게 보여주는 데모 화면을 설계한다.  
> 핵심 포지션: 이 데모는 회의 예약 도구나 회의록 요약 도구가 아니다. 사용자의 업무 요청이 AAP 내부에서 어떻게 의미화되고, Agent 작업으로 분해되며, 시스템 실행과 사람 검토를 거쳐 운영 자산으로 축적되는지를 보여주는 **AAP 작동 원리 데모**다.

---

## 0. 설계 원칙

### 0.1 사람들이 궁금한 것

이 데모의 청중은 “AI가 회의를 잡아준다”는 결과보다 다음을 궁금해한다.

```text
AAP 내부는 어떻게 생겼는가?
요청이 들어오면 어떤 계층이 움직이는가?
Agent는 무엇을 나눠서 수행하는가?
데이터는 어떤 중간 객체로 바뀌는가?
어디서 자동 실행하고 어디서 사람에게 넘기는가?
실행 결과는 어디에 남는가?
다음 실행은 어떻게 더 좋아지는가?
```

따라서 화면은 단순 업무 UI가 아니라 **투명한 작동 구조 화면**이어야 한다.

---

### 0.2 자동차 비유 기준

고성능 자동차를 보면 누구나 멋지다는 것은 안다.  
하지만 우리가 만들 수 있으려면 보닛을 열어야 한다.

이 데모의 역할은 다음과 같다.

| 자동차 비유 | AAP 데모에서 보여줄 것 |
|---|---|
| 운전석 | 사용자가 보는 업무 화면 |
| 엔진 | AAP Core Loop: Semantic, Agentic, Action, Learning |
| 센서 | Data & Inputs: 메일, 캘린더, 문서, 조직도, CRM |
| ECU / 제어장치 | Supervisor Agent, Policy Agent, HITL Routing |
| 변속기 | 발산과 수렴의 조율 |
| 브레이크 / 안전장치 | Trust, Guardrail, Approval, PII, Audit |
| 계기판 | Action Log, Decision Log, Run Trace |
| 정비 이력 | Operational Learning, Skill Update |

---

### 0.3 화면 설계 원칙

1. **사용자 화면과 내부 작동 구조를 분리하되 동시에 보여준다.**  
   사용자가 보는 결과와 AAP 내부에서 일어나는 일을 같은 화면에서 연결한다.

2. **중앙은 항상 AAP 작동 구조다.**  
   좌측 사용자 화면이 주인공처럼 보이면 회의 자동화 도구가 된다. 중앙의 발산·수렴 엔진이 주인공이어야 한다.

3. **우측 설명 패널은 필수다.**  
   현재 단계에서 어떤 AAP 계층이 작동하는지, 어떤 데이터 객체가 생성되는지 설명한다.

4. **툴팁은 구조 이해 보조용으로 쓴다.**  
   모든 설명을 본문에 넣지 않고, 중요 노드에 툴팁을 붙인다.

5. **중요 장면은 확대 하이라이트로 보여준다.**  
   Meeting Event 생성, Supervisor 조율, HITL, Writeback, Learning은 확대 모드가 필요하다.

6. **로그는 장식이 아니라 설명 가능성 장치다.**  
   하단 로그는 AAP가 무엇을 조회했고, 어떤 판단을 했고, 무엇을 실행했는지 보여준다.

7. **한 화면에 모든 내용을 밀어넣지 않는다.**  
   전체 시나리오는 단계형으로 진행하고, 각 단계마다 핵심 노드만 강조한다.

---

## 1. 전체 화면 구조

## 1.1 기본 레이아웃

데모 화면은 4영역 구조로 설계한다.

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Header: AAP Meeting Runtime Demo · 단계 진행 · 시나리오 상태         │
├─────────────────────────────────────────────────────────────────────┤
│ Step Rail: 0 준비 → 1 요청 → 2 맥락 → 3 의미화 → ... → 12 Playback   │
├───────────────┬───────────────────────────────┬─────────────────────┤
│ 좌측           │ 중앙                           │ 우측                 │
│ 사용자 업무화면 │ AAP 내부 구조 / 발산·수렴 플로우 │ 작동 원리 해석 패널   │
│ 30%            │ 45%                            │ 25%                  │
├───────────────┴───────────────────────────────┴─────────────────────┤
│ 하단: Action Log · Decision Log · Learning Log · Governance Log       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1.2 영역별 역할

| 영역 | 역할 | 반드시 보여줄 것 |
|---|---|---|
| Header | 데모 정체성과 현재 모드 표시 | 시나리오명, 현재 단계, Run ID |
| Step Rail | 전체 시나리오 진행 | 12~14개 단계, 현재 단계 강조 |
| 좌측 사용자 화면 | 현업 사용자가 보는 업무 결과 | 요청, 해석 결과, 실행 패키지, 승인 UI, 회의록 |
| 중앙 AAP 구조 | 내부 작동 원리 | AAP 계층, Agent, 데이터 객체, 발산·수렴 흐름 |
| 우측 해석 패널 | 설명 가능성 | 현재 계층, 입력, 처리, 산출, 판단 근거, HITL 여부 |
| 하단 로그 | 실행 추적성 | Connector, Agent, Policy, Writeback, Learning 로그 |

---

## 1.3 권장 화면 비율

```css
.app-shell {
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  height: 100vh;
}

.main-grid {
  display: grid;
  grid-template-columns: 30% 45% 25%;
  gap: 12px;
}

.log-dock {
  height: 180px;
}
```

---

## 2. Header 설계

## 2.1 구성 요소

| 요소 | 내용 |
|---|---|
| 데모명 | AAP Meeting Runtime Demo |
| 부제 | 모호한 회의 요청이 AAP 내부에서 업무 사건, Agent 실행, Writeback, Learning으로 바뀌는 과정 |
| Run ID | RUN-MEETING-001 |
| 현재 모드 | Core Run / Extended Run / Learning Run / Governance Overlay |
| 설명 토글 | 내부 설명 ON/OFF |

## 2.2 예시 문구

```text
AAP Meeting Runtime Demo
회의 자동화가 아니라, AAP 내부 작동 원리를 보여주는 투명한 실행 데모
Run ID: RUN-MEETING-001 · Scenario: AAP 고객사 킥오프 회의
```

---

## 3. Step Rail 설계

## 3.1 단계 목록

Step Rail은 상단에 가로 진행 바로 둔다.

| Step | 명칭 | 핵심 의미 |
|---|---|---|
| 0 | 준비 상태 | 사용자 권한과 고객 시스템 연결 확인 |
| 1 | 요청 입력 | 자연어 요청 수신 |
| 2 | 맥락 수집 | 메일, 문서, CRM, 조직도, 캘린더 조회 |
| 3 | 업무 의미화 | Meeting Event 생성 |
| 4 | Task 분해 | Supervisor가 Agent 작업 그래프 생성 |
| 5 | Agent 발산 | 참석자, 일정, 자료, 안건, 정책 후보 생성 |
| 6 | 조율 | 충돌, 정책, 신뢰도, 위험도 판단 |
| 7 | 실행 패키지 | Meeting Execution Package 생성 |
| 8 | HITL | 사용자가 책임 수렴점 승인 |
| 9 | Writeback | 캘린더, 메일, 문서함, 회의실 반영 |
| 10 | 회의 진행 | 기록, 결정 후보, 액션 후보 포착 |
| 11 | 사후 처리 | 회의록, 액션아이템, 후속 메일 생성 |
| 12 | Learning | Meeting Skill 업데이트 후보 생성 |
| 13 | Playback | 전체 실행 이력과 Lineage 재생 |

---

## 3.2 Step Rail 인터랙션

- 클릭 시 해당 단계로 이동한다.
- 현재 단계는 진한 색으로 강조한다.
- 완료된 단계는 체크 표시한다.
- 위험 또는 HITL 단계는 별도 아이콘을 표시한다.
- Hover 시 짧은 툴팁을 표시한다.

### 툴팁 예시

```text
업무 의미화
사용자의 모호한 요청을 AAP가 실행 가능한 Meeting Event로 바꾸는 단계입니다.
```

---

## 4. 좌측 사용자 업무 화면 설계

좌측은 사용자가 실제로 보는 화면이다.  
단, 단순 업무 결과만 보여주지 않고, “AAP가 해석한 결과”를 단계별로 보여준다.

---

## 4.1 Step 1 — 요청 입력 화면

### 화면 구성

```text
[회의 준비 Agent]
무엇을 도와드릴까요?

입력창:
“다음 주 AAP 고객사 킥오프 회의 잡아줘.
관련 부서 사람들 넣고, 지난번 제안 자료랑 회의록도 같이 정리해줘.”

[실행] [예시 불러오기]
```

### 상태 표시

```text
상태: 요청 수신 전
```

---

## 4.2 Step 3 — AAP 해석 결과 화면

### 화면 구성

```text
AAP 해석 결과

회의 유형
킥오프 회의

회의 목적
AAP 도입 논의 후속으로 착수 범위, 역할, 일정, 보안 조건을 정렬

필요 산출물
- 참석자 후보
- 일정 후보
- 사전 자료 패키지
- 킥오프 안건 초안
- 고객 발송 초대 메일
- 회의록 템플릿

검토 필요
- 참석자 확정
- 외부 고객 초대
- 외부 공유 자료 승인
```

### 하이라이트

- `회의 유형: 킥오프 회의` 카드 강조
- `검토 필요` 항목은 주황색 또는 경고 색상

### 툴팁

```text
회의 유형
AAP는 “킥오프”라는 단어를 회의 이름이 아니라 업무 유형으로 해석합니다.
이 유형에 따라 참석자, 안건, 자료, 승인 기준이 달라집니다.
```

---

## 4.3 Step 7 — 실행 패키지 화면

### 화면 구성

```text
Meeting Execution Package

회의명
AAP 고객사 킥오프 회의

추천 일정
1안. 6월 24일 수요일 10:00-11:30
2안. 6월 25일 목요일 14:00-15:30
3안. 6월 26일 금요일 09:30-11:00

참석자
필수: 영업, PM, AI 아키텍트, 데이터 담당, 보안 담당
외부: 고객사 DX팀장, 고객사 IT기획 담당
선택: 계약 담당, UX 담당

자료 패키지
- AAP 선제안 자료
- AAP 4-2 아키텍처 설명 자료
- 이전 미팅 회의록
- 고객사 Q&A 정리
- 보안 검토 필요사항

안건 초안
1. 회의 목적 확인
2. 적용 후보 업무 논의
3. 고객 데이터·문서·시스템 확인
4. AAP 아키텍처 적용 범위 매핑
5. 보안·권한 조건 확인
6. 다음 액션 정의
```

### 하이라이트

- 실행 패키지 전체를 중앙으로 확대하는 Focus Mode 제공
- 각 카드에 “생성 근거 보기” 링크 제공

---

## 4.4 Step 8 — HITL 승인 화면

### 화면 구성

```text
승인 필요 항목

[ ] 참석자 확정
    계약 담당과 UX 담당은 선택 참석자로 유지할까요?

[ ] 외부 고객 초대
    고객사 DX팀장과 IT기획 담당을 초대할까요?

[ ] 자료 공유
    내부 아키텍처 상세 자료는 마스킹 후 공유 권장

[ ] 초대 메일 문구
    “AAP 도입 후속 킥오프 회의” 표현을 사용할까요?

[승인 후 실행] [수정 요청] [보류]
```

### 하이라이트

- 승인 버튼 클릭 시 중앙의 HITL Gate가 열리는 애니메이션
- Decision Log에 승인 내용이 즉시 기록됨

### 툴팁

```text
HITL
사람 검토는 AI가 부족해서가 아니라, 책임이 따르는 수렴점을 공식 이력으로 남기기 위한 장치입니다.
```

---

## 4.5 Step 10 — 회의 진행 화면

### 화면 구성

```text
AAP 고객사 킥오프 회의 진행 패널

현재 안건
1. 회의 목적 확인

진행 상태
- 참석자 7명 중 6명 참석
- 고객사 IT기획 담당 5분 지연
- 안건 1/7 진행 중

AAP 보조
- 이전 회의 주요 질의 표시
- 관련 자료 바로가기
- 결정사항 후보 실시간 표시
- 액션아이템 후보 실시간 표시
```

### 하이라이트

- “결정사항 후보”와 “액션아이템 후보”가 실시간으로 생성되는 카드
- 회의 중 발언이 Decision Candidate로 바뀌는 과정 확대 가능

---

## 4.6 Step 11 — 회의록·액션아이템 화면

### 화면 구성

```text
회의 결과 초안

회의 요약
AAP 고객사 킥오프 회의에서는 1차 적용 후보로 회의 업무 Agent를 검토하기로 했으며,
고객 환경의 캘린더·문서함·그룹웨어 연계 가능성을 우선 확인하기로 했다.

결정사항
1. 1차 데모 업무는 킥오프 회의 준비·운영 시나리오로 한다.
2. 고객 환경 연계 대상은 캘린더, 문서함, 그룹웨어부터 확인한다.
3. 보안 검토는 외부 공유 자료와 사용자 권한 기준부터 정리한다.

액션아이템
- 고객 IT기획: 사용 가능한 그룹웨어·문서함 API 목록 공유 / 6월 28일
- KT DS AI팀: AAP 회의 데모 화면 초안 작성 / 7월 2일
- KT DS 보안 담당: 외부 공유 자료 기준 정리 / 6월 30일

확인 필요
- 결정사항 2번 표현 확정
- 액션아이템 담당자와 기한 확정
- 고객 공유용 회의록 문구 확인
```

---

## 5. 중앙 AAP 내부 구조 화면 설계

중앙은 데모의 핵심이다.  
AAP가 내부에서 어떻게 움직이는지 보여주는 “엔진 룸”이다.

---

## 5.1 기본 구조

중앙은 항상 다음 구조를 유지한다.

```text
Customer Environment
      ↓
Data & Inputs
      ↓
Business Semantic
      ↓
Agentic Core
      ↓
Action & Integration
      ↓
Operational Learning

Trust · Security · Governance는 전체를 감싸는 프레임
```

다만 각 Step에 따라 특정 계층과 노드를 활성화한다.

---

## 5.2 중앙 플로우의 기본 형태

```text
Raw Request
  ↓ Converge
Meeting Event
  ↓ Diverge
Agent Tasks
  ↓ Coordinate
Supervisor / Policy / Evaluation
  ↓ Re-Converge
Execution Package
  ↓ Action
Calendar / Mail / Docs / Workflow
  ↓ Extended Run
Meeting Record / Decisions / Action Items
  ↓ Learning
Skill / Feedback / Evaluation
```

---

## 5.3 주요 노드 정의

| 노드 | 의미 | 시각 표현 |
|---|---|---|
| Raw Request | 사용자 원시 요청 | 회색 입력 카드 |
| Context Package | 수집된 맥락 묶음 | 파란 데이터 카드 |
| Meeting Event | 업무 사건 | 보라색 핵심 카드 |
| Supervisor | 중앙 조율 Agent | 진한 색 허브 노드 |
| Agent Tasks | 하위 Agent 작업 | 방사형 또는 swimlane 노드 |
| Policy Gate | 정책 판단 | 주황색 게이트 |
| HITL Gate | 사람 검토 | 주황색 승인 게이트 |
| Execution Package | 실행 패키지 | 초록색 패키지 카드 |
| Writeback Targets | 캘린더·메일·문서함 | 시스템 아이콘 카드 |
| Meeting Run | 회의 중 기록·결정 | 진행형 노드 |
| Learning Store | Skill·Feedback·Log | 금색 또는 amber 저장소 |
| Trust Frame | 보안·감사·권한 | 외곽 프레임 |

---

## 5.4 발산·수렴 시각 규칙

| 흐름 | 표현 |
|---|---|
| 수렴 | 여러 노드가 하나의 큰 카드로 모임 |
| 발산 | 하나의 노드에서 여러 Agent 또는 데이터 소스로 퍼짐 |
| 조율 | 여러 결과가 Supervisor로 들어가고 Auto / HITL / Blocked로 분기 |
| 실행 | Execution Package에서 외부 시스템으로 선이 연결됨 |
| 학습 | Log와 Feedback이 Skill Store로 모임 |

---

## 5.5 Step별 중앙 하이라이트

| Step | 중앙에서 강조할 것 |
|---|---|
| 1 요청 입력 | Raw Request 생성 |
| 2 맥락 수집 | Customer Environment로 발산 |
| 3 업무 의미화 | Context Package가 Meeting Event로 수렴 |
| 4 Task 분해 | Meeting Event가 Agent Task Graph로 발산 |
| 5 Agent 발산 | 하위 Agent별 후보 생성 |
| 6 조율 | Supervisor가 Auto / HITL / Blocked로 분기 |
| 7 실행 패키지 | 여러 결과가 Execution Package로 재수렴 |
| 8 HITL | HITL Gate 활성화 |
| 9 Writeback | Calendar, Mail, Docs, Room으로 실행선 이동 |
| 10 회의 진행 | Record, Decision Candidate, Action Candidate 생성 |
| 11 사후 처리 | Minutes, Decisions, Action Items로 수렴 |
| 12 Learning | Logs와 Feedback이 Meeting Skill로 수렴 |
| 13 Playback | 전체 경로를 순차적으로 하이라이트 |

---

## 6. 우측 AAP 작동 해석 패널 설계

우측 패널은 데모의 설명 가능성 핵심이다.  
각 단계에서 “지금 AAP 내부에서 무엇이 일어나는지”를 읽어주는 역할을 한다.

---

## 6.1 패널 기본 구조

```text
현재 단계
Business Semantic Modeling

무엇을 하는가
사용자 요청과 수집된 맥락을 실행 가능한 Meeting Event로 구조화합니다.

입력
- Raw Request
- Context Package
- Meeting Type Ontology
- Policy Rules

처리
- 회의 유형 분류
- 목적 추론
- 필요 산출물 정의
- 검토 필요 항목 식별

산출
- Meeting Event
- Policy Flags

AAP 계층
- Business Semantic Modeling
- Trust Foundation

발산/수렴
수렴: 여러 맥락을 하나의 업무 사건으로 정리

왜 중요한가
이 단계가 없으면 AAP는 회의를 일정 예약으로만 처리합니다.
```

---

## 6.2 패널 구성 항목

| 항목 | 설명 |
|---|---|
| 현재 단계 | 사용자가 보고 있는 시나리오 단계 |
| 활성 계층 | AAP 4-2 아키텍처상 작동 중인 계층 |
| 입력 | 이 단계에 들어온 데이터 객체 |
| 처리 | Agent 또는 계층이 수행하는 판단 |
| 산출 | 새로 생성된 데이터 객체 |
| 발산/수렴 | 이 단계의 리듬 |
| 자동/HITL | 자동 실행인지 사람 검토인지 |
| 근거 | 판단 근거, 정책, 참조 데이터 |
| 툴팁 | 주요 개념 설명 |

---

## 6.3 단계별 우측 패널 문구 샘플

### Step 2. 맥락 수집

```text
현재 단계: Enterprise Data & Inputs

무엇을 하는가:
사용자의 짧은 요청을 보완하기 위해 고객 환경의 여러 시스템에서 관련 맥락을 수집합니다.

입력:
Raw Request, User Context

호출 시스템:
Mail, Docs, CRM, Org Chart, Calendar

산출:
Context Package

발산/수렴:
발산. 하나의 요청이 여러 데이터 소스로 확장됩니다.
```

### Step 4. Task 분해

```text
현재 단계: Agentic Reasoning & Execution

무엇을 하는가:
Supervisor Agent가 Meeting Event를 여러 Agent 작업으로 분해합니다.

입력:
Meeting Event

산출:
Execution Plan, Task Graph

발산/수렴:
발산. 하나의 업무 사건이 참석자, 일정, 자료, 안건, 정책, 실행 작업으로 나뉩니다.
```

### Step 6. 조율

```text
현재 단계: Supervisor Coordination

무엇을 하는가:
여러 Agent의 결과를 모아 자동 실행, 사람 검토, 제한 항목으로 분류합니다.

입력:
Participant Set, Time Set, Material Package, Agenda Draft, Policy Review

산출:
Coordination Result

발산/수렴:
수렴. 여러 후보가 실행 정책으로 정리됩니다.

HITL:
참석자 확정, 외부 발송, 외부 공유 자료는 사람 검토가 필요합니다.
```

---

## 7. 하단 로그 패널 설계

하단 로그는 AAP 투명성을 보여주는 영역이다.

---

## 7.1 로그 탭 구성

| 탭 | 내용 |
|---|---|
| Action Log | 시스템 호출과 실행 결과 |
| Decision Log | 판단, 분기, HITL 결정 |
| Agent Log | 각 Agent의 입력과 산출 |
| Governance Log | 권한, PII, 외부 공유, 감사 |
| Learning Log | Skill, Feedback, Evaluation |
| Run Trace | 전체 실행 이력 |

---

## 7.2 로그 표시 예시

```text
[10:03:11] [Request] Raw request captured
[10:03:14] [Connector:Mail] 14 related emails found
[10:03:16] [Connector:Docs] 6 related documents found
[10:03:18] [Semantic] Meeting type classified: Kickoff
[10:03:20] [Supervisor] Task graph generated
[10:03:25] [Policy] External sharing approval required
[10:03:30] [HITL] Human review requested
[10:04:11] [Writeback:Calendar] Event created
[10:04:12] [Writeback:Docs] Material folder created
[10:45:03] [MeetingRun] 3 decision candidates detected
[11:02:30] [Learning] Kickoff Meeting Skill update candidate created
```

---

## 7.3 로그 설계 원칙

- 로그는 너무 많으면 안 된다.
- 각 Step마다 3~5개 핵심 로그만 추가한다.
- 사용자가 특정 로그를 클릭하면 중앙 노드와 우측 설명 패널이 해당 단계로 이동한다.
- 로그는 단순 텍스트가 아니라 Lineage 탐색의 시작점이다.

---

## 8. 툴팁 설계

툴팁은 “용어 설명”이 아니라 내부 구조 이해를 돕는 짧은 해설이어야 한다.

---

## 8.1 주요 툴팁 문구

| 대상 | 툴팁 문구 |
|---|---|
| Meeting Event | 사용자의 요청과 수집된 맥락을 하나의 실행 가능한 업무 사건으로 구조화한 객체입니다. |
| Context Package | 메일, 문서, CRM, 조직도 등에서 수집한 관련 맥락 묶음입니다. |
| Supervisor Agent | 여러 Agent의 작업을 계획하고, 결과를 조율하며, 실행 전 정책을 적용하는 중앙 제어 장치입니다. |
| Task Routing | 하나의 업무 사건을 참석자, 일정, 자료, 안건, 정책, 실행 작업으로 분배하는 과정입니다. |
| A2A | Agent 간 결과를 공유하는 구조입니다. 예를 들어 Knowledge Agent의 자료 결과를 Agenda Agent가 사용합니다. |
| MCP / Tool Calling | Agent가 캘린더, 메일, 문서함 같은 외부 시스템을 호출하는 실행 인터페이스입니다. |
| HITL | 책임 있는 수렴점에서 사람의 검토와 승인을 받아 실행하는 구조입니다. |
| Writeback | AAP의 판단 결과를 실제 업무 시스템에 반영하는 단계입니다. |
| Decision Log | 어떤 판단이 어떤 근거로 내려졌는지를 남기는 이력입니다. |
| Action Log | 어떤 시스템에 어떤 실행을 했는지 남기는 이력입니다. |
| Meeting Skill | 반복 가능한 회의 처리 패턴을 다음 업무에 재사용할 수 있도록 자산화한 것입니다. |
| Run Trace | 요청부터 실행, 승인, 학습까지 전체 경로를 재생할 수 있는 실행 이력입니다. |

---

## 9. 하이라이트 / 확대 화면 설계

중요 장면은 별도의 확대 모드가 필요하다.  
확대 모드는 모달 또는 중앙 Focus Panel로 구현한다.

---

## 9.1 확대가 필요한 장면

| 장면 | 확대 이유 |
|---|---|
| Meeting Event 생성 | AAP가 단순 요청을 업무 사건으로 바꾸는 핵심 장면 |
| Task Graph 생성 | Supervisor가 내부 Agent 구조를 만드는 장면 |
| Agent 발산 | 여러 Agent가 각자 후보를 만드는 구조 설명 |
| Coordination Result | 자동 / HITL / 제한 항목 분기 설명 |
| HITL Gate | 책임 있는 수렴점 설명 |
| Writeback | 실제 시스템 반영 설명 |
| Meeting Run | 회의 중 비정형 입력이 결정 후보로 바뀌는 장면 |
| Learning | 운영 경험이 Skill로 축적되는 장면 |
| Playback | 전체 실행 경로를 투명하게 재생하는 장면 |

---

## 9.2 확대 화면 기본 구조

```text
┌─────────────────────────────────────────────┐
│ Focus: Meeting Event 생성                    │
├─────────────────────────────────────────────┤
│ 입력                                         │
│ - Raw Request                                │
│ - Context Package                            │
│ - Meeting Type Ontology                      │
│                                             │
│ 처리                                         │
│ - 회의 유형 분류                              │
│ - 목적 추론                                  │
│ - 필요 산출물 정의                            │
│ - 정책 플래그 생성                            │
│                                             │
│ 산출                                         │
│ - Meeting Event                              │
│ - Policy Flags                               │
│                                             │
│ 설명                                         │
│ 이 단계가 없으면 회의 요청은 단순 일정 예약으로 축소됩니다. │
└─────────────────────────────────────────────┘
```

---

## 10. 색상과 시각 체계

색상은 너무 많지 않게 제한하되 역할별 의미를 유지한다.

| 의미 | 색상 계열 | 사용처 |
|---|---|---|
| 사용자 / 입력 | Slate / Gray | Raw Request, User Context |
| 데이터 / 입력 소스 | Blue | Mail, Docs, Calendar, CRM |
| 의미화 / 업무 객체 | Purple | Meeting Event, Ontology |
| Agent / 실행 코어 | Teal | Supervisor, Agent Tasks |
| 정책 / HITL / 통제 | Amber | Policy Gate, HITL Gate |
| 위험 / 제한 | Red | Blocked, PII, External Risk |
| 실행 / Writeback | Green | Calendar, Mail, Docs writeback |
| 학습 / 자산화 | Gold / Amber | Skill, Feedback, Learning Store |
| Trust Frame | Dark / Charcoal | 외곽 프레임 |

---

## 11. 화면별 상태 데이터 설계

향후 HTML 구현을 위해 각 단계는 하나의 상태 객체로 관리한다.

```javascript
const STEPS = [
  {
    id: 'request',
    title: '요청 입력',
    activeLayers: ['Service Experience', 'Business Semantic'],
    mode: 'input',
    focusNode: 'RawRequest',
    rhythm: 'pre-diverge',
    userPanel: 'requestInput',
    explanationPanel: 'requestExplanation',
    logs: ['Raw request captured']
  },
  {
    id: 'context',
    title: '맥락 수집',
    activeLayers: ['Enterprise Data & Inputs', 'Trust Foundation'],
    mode: 'diverge',
    focusNode: 'ContextPackage',
    rhythm: 'diverge',
    userPanel: 'contextLoading',
    explanationPanel: 'contextExplanation',
    logs: ['Mail searched', 'Docs searched', 'CRM matched']
  }
];
```

---

## 12. 구현 컴포넌트 목록

| 컴포넌트 | 역할 |
|---|---|
| AppHeader | 데모명, Run ID, 현재 모드 표시 |
| StepRail | 단계 이동과 현재 단계 표시 |
| UserWorkPanel | 좌측 사용자 업무 화면 |
| RuntimeDiagram | 중앙 AAP 내부 구조 다이어그램 |
| ArchitectureLayerMap | AAP 계층 활성화 표시 |
| ExplainPanel | 우측 작동 원리 설명 |
| LogDock | 하단 로그 탭 |
| Tooltip | 주요 노드 설명 |
| FocusModal | 중요 화면 확대 |
| HighlightController | 현재 단계별 노드 강조 |
| PlaybackController | 실행 이력 재생 |

---

## 13. 인터랙션 설계

## 13.1 기본 진행

- 사용자는 `다음 단계` 버튼을 눌러 시나리오를 진행한다.
- Step Rail 클릭으로 특정 단계 이동 가능.
- 각 단계 진입 시 중앙 노드가 애니메이션으로 활성화된다.
- 우측 설명 패널 내용이 함께 바뀐다.
- 하단 로그에 해당 단계 로그가 추가된다.

---

## 13.2 툴팁

- 노드 hover 시 2~3문장 설명 표시.
- 툴팁은 화면을 가리지 않도록 우측 또는 상단에 배치.
- 모바일 또는 좁은 화면에서는 클릭형 설명으로 대체.

---

## 13.3 확대 하이라이트

- 중요 노드에는 `자세히 보기` 버튼 제공.
- 클릭 시 Focus Modal 표시.
- Focus Modal에는 입력, 처리, 산출, 근거, AAP 계층을 표시.

---

## 13.4 로그 클릭 연동

- 로그 클릭 시 해당 노드가 중앙에서 하이라이트된다.
- 우측 패널은 해당 로그의 근거와 관련 데이터 객체를 보여준다.

---

## 13.5 Playback 모드

마지막 단계에서는 전체 실행 이력을 자동 재생한다.

```text
Raw Request
→ Context Package
→ Meeting Event
→ Task Graph
→ Agent Outputs
→ Coordination Result
→ Execution Package
→ HITL Decision
→ Writeback Results
→ Minutes / Action Items
→ Skill Update
```

- 각 단계가 1~2초 간격으로 하이라이트된다.
- 하단 Run Trace가 함께 스크롤된다.
- 우측 패널은 현재 재생 중인 단계의 설명을 표시한다.

---

## 14. 데모에서 피해야 할 화면

| 피해야 할 것 | 이유 |
|---|---|
| 캘린더 UI 중심 화면 | 회의 예약 도구처럼 보임 |
| 회의록 요약만 강조 | 기존 AI 기능과 차별 약함 |
| Agent를 너무 많이 나열 | 조율 구조가 아니라 기능 목록처럼 보임 |
| 모든 로그를 동시에 노출 | 화면 과밀 |
| 거버넌스 경고를 과도하게 강조 | 회의 업무의 자연스러운 위험 수준을 넘어섬 |
| 아키텍처 용어만 가득한 화면 | 현업 사용자가 이해하기 어려움 |

---

## 15. 최종 화면 포지션

이 화면은 다음을 동시에 만족해야 한다.

```text
사용자는 회의 준비가 어떻게 되는지 본다.
설명자는 AAP 내부 계층이 어떻게 움직이는지 설명한다.
개발자는 어떤 데이터 객체와 Agent가 필요한지 이해한다.
기획자는 데모 범위와 가치 메시지를 잡는다.
영업은 고객에게 AAP가 단순 자동화가 아니라 운영 플랫폼임을 설명한다.
```

최종 포지션:

> 이 데모 화면은 회의 자동화 화면이 아니라, AAP 내부 엔진이 업무 요청을 어떻게 해석하고, 분해하고, 조율하고, 실행하고, 검토받고, 학습하는지를 투명하게 보여주는 작동 원리 화면이다.

---

## 16. 다음 단계

이 화면 설계서를 기준으로 다음 산출물을 만든다.

1. HTML 구현 지시서 v0.1
2. 더미 데이터 JSON
3. 단계별 UI 문구 세트
4. Runtime Diagram 노드·엣지 정의
5. Tooltip 문구 사전
6. Focus Modal 상세 문구
7. 구현 검증 체크리스트

