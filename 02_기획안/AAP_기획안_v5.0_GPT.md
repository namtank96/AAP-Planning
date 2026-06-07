# AAP 기획안 · v5.0

> **작성일**: 2026-05-26  
> **기준 문서**: `AAP_기획안_v4.0.md` / 고객용 선제안서 v0.4(`aap_proactive_offering_v250_260522.html`)  
> **목적**: v4.0까지 정리된 AAP 고객용 선제안서 구조에, 최근 검토된 Data Platform 연계성·AI Agent 시대 데이터 소비 패러다임·Build/Buy/Borrow 기술 채택 전략을 통합해 v5.0 기획 방향을 정의한다.  
> **문서 성격**: 고객용 선제안서 v0.5 작업 기준안 + 내부 리뷰/HTML 반영 가이드

---

## 0. v5.0 한 줄 정의

> **AAP는 기존 Data Platform의 다음 제품이 아니라, AI Agent 시대에 맞춰 데이터·업무·시스템·통제 구조를 재구성하는 Agentic Operation Layer입니다.**  
> 구현 방식 또한 모든 요소를 자체 개발하는 방식이 아니라, 고객 업무 의미화와 시스템 통합은 Build 중심으로 가져가고, 빠르게 발전하는 AI 기술 영역은 Buy/Borrow를 조합해 Time-to-Market과 시장 정합성을 확보하는 구축형 플랫폼 전략입니다.

### v5.0 핵심 메시지

- **Data Platform은 대체 대상이 아니라 AAP의 기반**이다.
- 기존 Data Platform은 주로 **Human Analytics**를 전제로 설계되었다.
- AI Agent가 새로운 업무 수행 주체로 들어오면, 데이터 소비 방식은 **정적 리포트/마트 중심**에서 **사용자 의도·업무 맥락 기반의 동적 조합**으로 바뀐다.
- AAP는 기존 Data Platform의 저장·정제·거버넌스 기반을 유지하면서, 그 위의 소비·실행 계층을 **Business Semantic · Agentic Runtime · Action · HITL · Operational Learning** 중심으로 재구성한다.
- AAP의 구현은 모든 기술을 직접 만드는 방식이 아니라, **Build / Buy / Borrow**를 조합하는 확보 전략으로 가져간다.
- v5.0에서는 이를 04장 본문과 09장 별첨에 나누어 반영한다.

---

## 1. v4.0 기준 현재 상태

v4.0은 v210부터 v250까지의 변경 이력과 현재 고객용 선제안서 v0.4 상태를 정리한 기준 문서다. v250의 핵심 변화는 다음과 같다.

| 영역 | v4.0 기준 현재 상태 |
|---|---|
| 문서 구조 | 8개 섹션: 01 기업 AI 활용의 현재 위치 / 02 운영 전환 공백 / 03 왜 AAP인가 / 04 통합 아키텍처와 수행 모델 / 05 적용 레퍼런스 / 06 산업별 적용 예시 / 07 고객 유형별 진입 패턴 / A 별첨 |
| 04장 | Trust 외곽 프레임 + AAP Execution Loop 5-step + Operational Learning 환류 구조 |
| 04-2 | 8 Layer × 대표 Capability × 확장 컴포넌트 구조 |
| 05장 | 금융 자문형 Agent 검증 사례, 산업 도메인 모델링 검증 사례 중심 |
| 06장 | 금융권 심사·자문, 공공·산업단체, 제조·유통, 국방·방산 폐쇄망 업무의 4개 산업 카드 |
| 07장 | 기존 AI·데이터 자산 보유 고객 / 업무 니즈 명확 고객 / 규제·통제형 고객의 3개 진입 패턴 |
| 별첨 | 내부 검토용 · 사업화 확장 항목으로 정제 |

v5.0은 이 구조를 유지하되, **새 절·장 신설을 최소화**하고, 다음 5개 논리를 현재 섹션 안에 흡수한다.

---

## 2. v5.0에서 추가되는 5개 전략 축

### 2.1 Data Platform ↔ AAP 위치 관계 명시

기존 문서에는 Data Platform이 Customer Environment 또는 Enterprise Data & Inputs에 chip 수준으로 등장한다. v5.0에서는 이를 더 명확하게 표현한다.

> Data Platform은 AAP의 경쟁 대상이나 대체 대상이 아니라, AAP가 올라타는 **신뢰 가능한 데이터·분석 기반**입니다. AAP는 그 위에 업무 의미, Agent 판단, 실행 연계, 사람 검토, 운영 학습을 결합해 분석 중심 플랫폼을 업무 실행형 운영 체계로 확장합니다.

### 2.2 Human Analytics → Agentic Operation 패러다임 전환

기존 Data Platform은 인간 분석가와 BI 사용자를 주요 소비자로 전제했다. v5.0은 소비 주체의 변화를 전면에 둔다.

| 기존 관점 | v5.0 관점 |
|---|---|
| 사람이 대시보드와 리포트를 해석 | Agent가 사용자 요청과 업무 맥락에 맞춰 데이터·정책·도구를 조합 |
| 사전 정의된 데이터마트·KPI·리포트 | 요청 시점에 구성되는 Context Package·판단 근거·조치안 |
| BI/분석 결과 제공 | Workflow·Writeback·승인·감사·운영 학습까지 연결 |
| 개인화 = 화면/권한/필터 개인화 | 맞춤형 = 의도·권한·정책·업무 상황 기반의 동적 판단·실행 |

### 2.3 Data Platform 아키텍처의 분해·재구성

Medallion, Dimension, Lakehouse, Data Catalog, BI는 버릴 대상이 아니다. 다만 AI Agent 시대에는 이들이 최종 산출물이 아니라, Agent가 활용할 **신뢰 가능한 기반 자산**이 된다.

```text
기존 구조
Source → Lakehouse / Medallion → Mart / Dimension → BI / Dashboard → Human Judgment

v5.0 관점
Source → Lakehouse / Medallion → Business Semantic / Context → Agentic Runtime → Action / Learning
```

핵심은 **Storage·Processing·Governance는 유지**하되, **Serving·Consumption·Action 계층을 Agentic 방식으로 재구성**하는 것이다.

### 2.4 Build / Buy / Borrow 기술 채택 전략

AAP는 모든 기술을 자체 개발하는 단일 제품 전략이 아니다. 고객 환경에서 운영 가능한 Agentic AI 체계를 만들기 위해, capability별로 확보 방식을 나눠야 한다.

| 확보 방식 | 의미 | 적용 방향 |
|---|---|---|
| **Build** | 직접 설계·구축 | 고객 업무 의미화, 시스템 통합, 권한·승인·감사 구조, 업무별 Agent 설계 |
| **Buy** | 자사 검증 솔루션 또는 상용 솔루션 활용 | RAG·문서 처리, RPA/Workflow, 포털/업무 도구, 검증된 솔루션 자산 |
| **Borrow** | 외부 검증 자산·오픈소스·파트너 기술 조합 | Agent Framework, EvalOps, Guardrails, Observability, Reliability Tooling |

### 2.5 Now / Near / Next 시간축

v5.0에서는 capability를 현재 구현 가능성 기준으로 나눈다. 이 구조는 수행부서의 구현 현실성과 기획/BD의 미래 확장성을 동시에 담는다.

| 단계 | 의미 | 예시 |
|---|---|---|
| **Now** | 즉시 구현·검증 가능 | RAG, Tool Calling, API 연계, HITL UI, Workflow 연계, Audit Log |
| **Near** | 단기 고도화 가능 | Agent Routing, Evaluation Pipeline, Guardrails, Usage/Cost Control, Prompt/Skill Versioning |
| **Next** | 파트너·글로벌 자산 활용 포함한 확장 | Self-Improving Loop, Autonomous Skill Optimization, Multi-Agent Collaboration, Continuous Reliability Testing |

---

## 3. v5.0 목차 구조

v5.0은 v4.0의 고객용 선제안서 구조를 유지한다. 단, 08장 후속 논의와 09장 별첨을 다시 명시해, 고객 미팅 이후 실제 진단·Pilot 설계로 이어지는 흐름을 강화한다.

1. 기업 AI 활용의 현재 위치
2. 운영 전환에서 드러나는 4가지 공백
3. 왜 지금 AAP가 필요한가
4. **AAP 통합 아키텍처와 수행 모델**
5. 적용 레퍼런스
6. 산업별 적용 예시
7. 고객 유형별 진입 패턴
8. **후속 논의 방향**
9. **별첨 · Capability 확보 전략**

> 권장: 고객용 HTML에서는 08·09장을 본문에 포함하되, 09장은 미팅 목적에 따라 외부 공유본에서 분리 가능하도록 설계한다.

---

## 4. 섹션별 v5.0 반영 방향

## 01. 기업 AI 활용의 현재 위치

### 유지할 방향

v4.0의 안전한 톤을 유지한다. “AI가 모든 것을 자동 수행한다”가 아니라, **업무 기준에 따라 판단 후보를 만들고 사람 검토와 시스템 반영으로 이어지도록 한다**는 표현을 계속 사용한다.

### v5.0 보강 포인트

기존에는 “PoC 이후 운영 전환”이 중심이었다면, v5.0에서는 **운영 전환의 배경에 리소스 유형 변화가 있다**는 관점을 한 문단 추가한다.

#### 삽입 후보 문안

> 지금까지 기업 AI 활용은 주로 사람이 AI 도구를 사용해 답변·요약·분석 결과를 얻는 방식이었습니다. 그러나 앞으로는 AI Agent가 데이터와 업무 시스템 사이에서 판단 후보를 만들고, 필요한 도구를 호출하며, 사람 검토와 실행 흐름을 보조하는 새로운 업무 수행 주체로 들어오게 됩니다. 따라서 기업 AI의 다음 과제는 단일 기능의 도입이 아니라, 사람과 Agent가 함께 일할 수 있는 운영 구조를 만드는 것입니다.

---

## 02. 운영 전환에서 드러나는 4가지 공백

### 유지할 방향

v4.0의 4개 공백 구조는 유지한다.

- 맥락 공백
- 실행 공백
- 통제 공백
- 학습 공백

### v5.0 보강 포인트

Data Platform 보유 고객 관점에서 공백을 한 번 더 해석한다.

| 공백 | Data Platform 보유 고객에게 남는 문제 |
|---|---|
| 맥락 | 데이터와 리포트는 있지만, 업무 사건·정책·권한·예외 기준으로 해석되지 않음 |
| 실행 | 분석 결과가 ERP/CRM/SCM/그룹웨어의 실제 조치로 이어지지 않음 |
| 통제 | AI 판단 후보의 근거, 승인 경로, 실행 제한 기준이 부족함 |
| 학습 | 사람의 검토·반려·예외 처리 결과가 다음 Agent 판단에 재사용되지 않음 |

---

## 03. 왜 지금 AAP가 필요한가

### 유지할 방향

v4.0의 안전화된 AAP 정의와 손해사정 미니 시나리오 구조를 유지한다.

### v5.0 보강 포인트

03장은 너무 무거워지면 안 된다. 따라서 **Human → Agent 리소스 유형 변화**와 **Data Platform 이후의 질문 변화**를 짧게만 추가한다.

#### 삽입 후보 문안

> Data Platform 이후의 질문은 “어떤 데이터를 볼 수 있는가”에서 “이 업무 상황에서 어떤 판단과 조치를 할 수 있는가”로 바뀌고 있습니다. 기존에는 사람이 대시보드와 리포트를 해석해 후속 업무를 수행했다면, AAP에서는 Agent가 사용자의 요청 의도와 업무 맥락을 바탕으로 필요한 데이터·정책·도구를 조합하고, 사람 검토가 필요한 지점과 시스템 반영이 가능한 지점을 구분합니다.

### v5.0 AAP 정의 보강안

> AAP는 고객의 데이터·문서·시스템을 업무 맥락으로 연결하고, Agent가 업무 기준에 따라 판단 후보를 만들며, 필요한 지점에서 사람 검토와 시스템 반영으로 이어지도록 만드는 구축형 Agentic AI 운영 체계입니다.  
> v5.0에서는 이를 기존 Data Platform의 소비·실행 계층을 AI Agent 시대에 맞게 재구성하는 **Agentic Operation Layer**로 정의합니다.

---

## 04. AAP 통합 아키텍처와 수행 모델

v5.0의 핵심 장이다. 기존 v4.0의 Trust 외곽 프레임, Service Experience & Outcome, AAP Execution Loop, Customer Environment 구조는 유지하되, 04장 도입부에 **Data Platform → AAP 발전 박스**와 **Build/Buy/Borrow 기술 채택 전략 단락**을 추가한다.

---

### 04-0. Data Platform에서 Agentic Operation으로

#### 목적

03장의 개념 설명과 04장의 아키텍처를 연결하는 다리 역할을 한다.

#### 삽입 후보 문안

> 기존 Data Platform은 데이터를 수집·정제·저장·분석·시각화하는 기반을 만들었습니다. 그러나 AI Agent가 새로운 업무 수행 주체로 들어오면, 데이터는 더 이상 정적 리포트나 사전 정의된 마트로만 소비되지 않습니다. 사용자의 요청 의도, 역할과 권한, 업무 상황, 관련 정책, 실행 가능한 도구에 따라 필요한 데이터와 근거가 그때그때 조합되어야 합니다.
>
> AAP는 기존 Data Platform의 저장·정제·거버넌스 기반을 유지하면서, 그 위에 Business Semantic, Agentic Runtime, Enterprise Action, HITL, Operational Learning을 결합해 Human Analytics 중심의 데이터 플랫폼을 Agentic Operation 중심의 업무 실행 체계로 확장합니다.

#### 구조도 후보

```text
[기존 Data Platform]
Source → Lakehouse / Medallion → Mart / Dimension → BI / Dashboard
                                              ↓
                                         Human Analytics

[v5.0 AAP 확장]
Source → Lakehouse / Medallion → Business Semantic / Context
       → Agentic Runtime → Action / HITL → Operational Learning
                                              ↓
                                      Agentic Operation
```

#### 3단계 발전 박스

| 단계 | 핵심 역할 | 주요 산출물 | 한계 / 다음 과제 |
|---|---|---|---|
| **1. Data Platform** | 수집·정제·저장·분석 기반 | Lakehouse, Medallion, Mart, BI, Catalog | 분석 결과 이후의 판단·승인·실행은 사람에게 남음 |
| **2. Data Intelligence** | 데이터 품질·카탈로그·메타데이터·분석 자산화 | Metadata, Data Product, Feature/Metric, Knowledge Asset | 업무 정책·권한·실행 경로까지는 부족 |
| **3. Agentic Operation** | 업무 의미·Agent 판단·실행·검토·학습 | Semantic Context, Agent Skill, Workflow, Decision Log, Feedback Loop | AAP의 핵심 운영 구조 |

---

### 04-0-1. AAP 기술 채택 전략 · Build / Buy / Borrow

#### 삽입 후보 문안

> AAP는 모든 기술 요소를 자체 개발하는 단일 제품 전략이 아닙니다. 고객 업무 의미화, 시스템 통합, 권한·승인·감사 구조처럼 고객 맥락 이해와 SI 역량이 필요한 영역은 Build 중심으로 설계하고, LLM·Agent Framework·EvalOps·Guardrails·Observability처럼 기술 변화가 빠른 영역은 자사 검증 솔루션, 상용 솔루션, 글로벌 검증 자산을 Buy/Borrow 방식으로 조합합니다.  
> 핵심은 개별 AI 기술 자체의 보유가 아니라, 고객의 데이터·업무·시스템·보안·감사 환경 안에서 Agentic AI를 운영 가능한 구조로 통합·검증·운영하는 능력입니다.

#### 문장 톤 원칙

- “우리가 다 만들겠다”는 표현은 피한다.
- “우리가 못 만들어서 외부 자산을 쓴다”는 인식도 피한다.
- “핵심 차별 영역은 Build, 빠른 기술 변화 영역은 Buy/Borrow로 가속”이라는 균형을 유지한다.

---

### 04-1. Architecture Overview

v4.0 구조 유지. 단, Customer Environment와 AAP Execution Loop 사이에 **Data Platform / Context Assembly**의 의미를 더 명확히 한다.

#### v5.0 권장 구조

```text
┌─ Trust · Security · Governance · 공통 기반 ──────────────────────┐
│                                                                  │
│  [Service Experience & Outcome]                                  │
│  AI Agent Portal · Review/Approval · Workflow/Writeback · Ops     │
│                                                                  │
│  [AAP Execution Loop]                                            │
│  Enterprise Data & Inputs                                        │
│  → ★ Business Semantic Modeling                                  │
│  → Agentic Reasoning & Orchestration                             │
│  → Enterprise Integration & Action                               │
│  → ★ Operational Learning                                        │
│      ↺ feedback to Semantic · Agentic                            │
│                                                                  │
│  [Customer Environment]                                          │
│  Data Platform · ERP/CRM/SCM · Document/KMS · Internal API        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### 보강 문구

> Customer Environment의 Data Platform은 AAP가 대체할 대상이 아니라, Agent가 사용할 수 있는 데이터·분석·운영 로그 기반입니다. AAP는 이 기반 위에서 업무 의미, 정책, 권한, 실행 도구, 검토 이력을 연결해 사용자의 요청 맥락에 맞는 판단 후보와 실행 경로를 구성합니다.

---

### 04-2. 주요 영역 및 필요 역량

v4.0의 8 Layer Capability Map은 유지한다. v5.0에서는 범례를 Build / Buy / Borrow 기준으로 재라벨링한다.

#### 범례 변경안

| 기존 표현 | v5.0 표현 |
|---|---|
| DS 설계·통합 주도 | **Build · DS 설계·통합 주도** |
| 자사 솔루션 활용 | **Buy · 자사/상용 솔루션 활용** |
| 검증 자산·파트너 조합 | **Borrow · 검증 자산·파트너 조합** |
| ★ 핵심 요소 | **★ 차별 축적 영역** |

#### Capability Map 하단 note 후보

> 각 Capability는 자체 개발 모듈만을 의미하지 않습니다. 업무 의미화·시스템 통합·통제 설계처럼 고객 맥락이 핵심인 영역은 Build 중심으로, 기술 변화가 빠른 Agent Framework·평가·신뢰성·Guardrails 영역은 Buy/Borrow를 포함해 고객 환경에 가장 적합한 방식으로 조합합니다.

---

### 04-3. 수행 모델

v4.0의 Define → Compose → Connect → Operate 4단계를 유지하되, v5.0에서는 Compose 단계에 Build/Buy/Borrow 매핑을 포함한다.

| 단계 | v4.0 수행 내용 | v5.0 보강 |
|---|---|---|
| Define | 대상 업무, 정책, 권한, 판단 기준 정의 | Data Platform 보유 자산과 Agent 소비 시나리오 함께 진단 |
| Compose | Semantic, Agent, Tool, HITL 구성 | Capability별 Build / Buy / Borrow 매핑 |
| Connect | Data Platform, 업무 시스템, API, 보안 영역 연결 | Lakehouse·Catalog·BI·Operational Log를 Agent-ready Context로 연결 |
| Operate | 운영, 모니터링, 피드백, 개선 | Now / Near / Next 로드맵에 따른 단계적 고도화 |

---

## 05. 적용 레퍼런스

### 유지할 방향

기존 Case 1, Case 2의 익명화 톤을 유지한다.

- Case 1 · 금융 자문형 Agent 검증
- Case 2 · 산업 도메인 모델링 검증

### v5.0 신규 제안: Case 3 추가

#### Case 3 · Data Platform PoC 기반 AAP 확장 후보

> 본 사례는 AAP 전체 구현 사례라기보다, AAP의 Customer Environment · Enterprise Data & Inputs · Trust 기반에 해당하는 Data Platform/연계/보안 구조를 검증한 사례입니다. 향후 Business Semantic, Agentic Reasoning, Workflow/Writeback, HITL, Operational Learning을 추가하면 기존 분석 플랫폼을 Agentic Operation 체계로 확장할 수 있습니다.

| 항목 | 내용 |
|---|---|
| 검증된 기반 | Data Platform, Lakehouse, 데이터 수집·정제·분석, BI, 보안·모니터링 기반 |
| AAP 연결 위치 | Customer Environment, Enterprise Data & Inputs, Trust Foundation |
| 추가 필요 영역 | Business Semantic, Agentic Reasoning, Action/Writeback, HITL, Operational Learning |
| 사업적 의미 | 기존 Data Platform 고객 대상 AAP 고도화 / Cross-sell / 단계형 로드맵 제안 가능 |

#### Case 3 문구 주의

- 금지: “AAP 구축 사례”, “Agentic AI Platform PoC 완료”
- 권장: “Pre-AAP 기반 검증”, “Data Platform 기반 AAP 확장 후보”, “AAP 하부 기반 검증 사례”

---

## 06. 산업별 적용 예시

v4.0의 4개 산업 카드 구조를 유지한다. v5.0에서는 각 산업의 확장 방향에 **Data Platform 보유 고객의 Agentic Operation 전환**을 한 줄씩 반영한다.

| 산업 | v5.0 보강 방향 |
|---|---|
| 금융권 심사·자문 업무 | 내부통제·심사·자문 데이터를 사건 단위로 묶고, 정책/룰 판단과 HITL 승인, 감사 이력으로 연결 |
| 공공·산업단체 | 외부 데이터와 회원사/정책 데이터를 연결해 영향도 판단과 차등 통보 Workflow로 확장 |
| 제조·유통 운영 업무 | 품질·계약·물류·클레임 데이터를 Agent가 맥락별로 조합해 예외 처리와 재발 학습으로 연결 |
| 국방·방산 폐쇄망 업무 | 폐쇄망 지식과 정비·군수 데이터를 권한·감사 체계 안에서 조치 후보 검토로 확장 |

### 공통 보강 문구

> 산업별 AAP 적용은 신규 AI 기능을 별도로 붙이는 방식이 아니라, 고객이 이미 보유한 데이터 플랫폼·업무 시스템·문서 자산을 Agentic Operation 구조로 재구성하는 방식으로 접근합니다.

---

## 07. 고객 유형별 진입 패턴

v4.0의 Type A/B/C 구조를 유지한다. v5.0에서는 Type A를 가장 중요하게 보강한다.

### Type A · 기존 AI·데이터 자산 보유 고객

| 항목 | v5.0 메시지 |
|---|---|
| 상황 | Data Platform, BI, AI PoC, 내부 AI 조직은 있으나 업무 실행·검토·학습 구조는 분리되어 있음 |
| 제안 메시지 | 기존 Data Platform의 소비·실행 계층을 Agentic Operation Layer로 확장 |
| 강조점 | Data Platform 투자 보존, Agent-ready Context, Workflow/Writeback, Operational Learning |
| 진입 방식 | Data Platform 자산 진단 → Agentic 업무 후보 선정 → 통제형 Pilot → 운영 학습 고도화 |

### Type B · 업무 니즈는 명확하지만 AI 기반이 약한 고객

| 항목 | v5.0 메시지 |
|---|---|
| 상황 | 반복 업무·문서·승인·예외 처리 니즈는 명확하나 AI/데이터 기반은 제한적 |
| 제안 메시지 | 전체 플랫폼이 아니라 특정 업무 Agentic Pilot으로 시작 |
| 강조점 | Vertical Agent, Business Semantic, Workflow 연계 |
| 진입 방식 | 소규모 업무 정의 → 문서/데이터 연결 → HITL 기반 Pilot |

### Type C · 규제·통제형 고객

| 항목 | v5.0 메시지 |
|---|---|
| 상황 | 보안·감사·망분리·승인 체계가 AI 도입 가능 여부를 결정 |
| 제안 메시지 | 폐쇄망·권한·감사·HITL을 전제로 하는 통제형 AAP |
| 강조점 | Trust Foundation, Audit, Explainability, Private Deployment |
| 진입 방식 | 보안/권한 체계 진단 → 허용 가능한 Agent 업무 범위 정의 → 승인형 Pilot |

---

## 08. 후속 논의 방향

v5.0에서는 후속 논의를 단순 미팅 제안이 아니라, **AAP 전환 진단 프로세스**로 정리한다.

### 08-1. 후속 논의 5단계

| 단계 | 질문 | 산출물 |
|---|---|---|
| 1. Data Foundation 진단 | 어떤 데이터 플랫폼·BI·문서·업무 시스템을 보유하고 있는가? | Customer Environment Map |
| 2. Semantic Foundation 진단 | 어떤 업무 개념·정책·권한·판단 기준이 필요한가? | Business Semantic 후보 |
| 3. Build / Buy / Borrow 매핑 | 어떤 capability를 직접 구축하고, 어떤 자산을 활용·차용할 것인가? | Capability 확보 전략 |
| 4. Agentic Pilot 설계 | 어떤 업무를 첫 Pilot으로 검증할 것인가? | Pilot Scope / HITL / Action Flow |
| 5. Operational Learning 설계 | 실행 결과와 피드백을 어떻게 축적·개선할 것인가? | Decision Log / Feedback Loop / Near-Next Roadmap |

### 08-2. 고객에게 던질 질문

- 현재 Data Platform, BI, Catalog, Lakehouse, 문서/KMS, 업무 시스템은 어떤 범위로 구축되어 있는가?
- 분석 결과 이후 사람이 수작업으로 판단·승인·시스템 반영하는 업무는 무엇인가?
- AI Agent가 판단 후보를 만들 수 있는 업무와 반드시 사람이 검토해야 하는 업무는 어떻게 나뉘는가?
- 시스템 Writeback이 가능한 업무와 검토/승인까지만 가능한 업무는 무엇인가?
- 운영 결과를 정책·룰·Agent Skill 개선으로 환류할 수 있는 로그 구조가 있는가?
- 어떤 capability는 내부 구축이 필요하고, 어떤 capability는 자사/상용/외부 검증 자산 활용이 적합한가?

---

## 09. 별첨 · Capability 확보 전략

> 본 별첨은 외부 고객에게는 선택적으로 공유한다. 수행부서·기획/BD·경영진이 모두 같은 기대 수준을 갖도록, AAP Capability별 확보 방식과 시간축을 정리하는 내부 기준표로 사용한다.

---

### 09-1. Build / Buy / Borrow 원칙

| 원칙 | 설명 |
|---|---|
| Build 중심 영역 | 고객 업무 맥락, 업무 의미화, 시스템 통합, 승인·감사·통제 구조처럼 고객별 차이가 크고 SI 역량이 필요한 영역 |
| Buy 활용 영역 | 자사 검증 솔루션 또는 상용 솔루션으로 빠르게 확보할 수 있는 영역 |
| Borrow 조합 영역 | 외부 검증 자산, 오픈소스, 글로벌 프레임워크, 파트너 기술을 조합해 Time-to-Market을 줄일 수 있는 영역 |
| 단계적 확장 | Now에서 Pilot 가능 범위를 확보하고, Near에서 운영 품질·통제를 고도화하며, Next에서 자가개선·멀티에이전트·지속 평가로 확장 |

---

### 09-2. Capability별 확보 전략 매트릭스

| Capability | Build 필요성 | 권장 확보 방식 | Now | Near | Next |
|---|:-:|---|---|---|---|
| **Business Semantic Modeling** | ★★★ | Build 중심 + 고객 업무 분석 | 업무 용어·정책·권한·프로세스 정리 | Domain Ontology / Decision Rule 고도화 | 산업별 Semantic Pack 자산화 |
| **Enterprise Integration / Writeback** | ★★★ | Build 중심 | API/RPA/Workflow 연계 | Transaction Safety / Exception Handling | 복수 시스템 조치 자동화 확대 |
| **HITL / Approval** | ★★ | Build + 기존 Workflow 연계 | 승인/반려 UI, 검토 큐 | 위험도 기반 라우팅 | 정책 기반 자동 승인/보류 분기 고도화 |
| **RAG / Knowledge Ingestion** | ★★ | Buy + Build 조합 | OCR, Parser, Chunking, Embedding, Vector Index | 지식 품질 평가, 문서 버전 관리 | 자동 지식 갱신 Workflow |
| **LLM / Agent Framework** | ★ | Buy/Borrow 우선 | Tool Calling, 기본 Agent Flow | Agent Routing, State Memory, Work Context | Multi-Agent Collaboration |
| **EvalOps / Reliability** | ★★ | Borrow + 내부 기준 설계 | 평가 데이터셋, Human Review | Regression Test, Reliability Score | Continuous Reliability Testing |
| **Guardrails / Policy Engine** | ★★ | Buy/Borrow + 고객 정책 커스터마이징 | 금지행위, 권한, 민감정보 제한 | 정책 기반 실행 제한 | 동적 정책 적용 / 위험도 기반 제어 |
| **Observability / Trace / Audit** | ★★ | 기존 도구 + Agent 로그 확장 | Decision Basis, Audit Link, Action Log | Cost/Usage/Quality Dashboard | Cross-Agent 운영 관측 |
| **Operational Learning** | ★★ | Build + Buy/Borrow 혼합 | Decision Log, Feedback Store | Skill Versioning, Feedback Loop | Self-Improving Loop / Skill Optimization |
| **Service Experience** | ★★ | Build + 자사/상용 솔루션 활용 | Agent Portal, Review UI | 업무별 Copilot/Agent UX | Role-based Adaptive Experience |

---

### 09-3. Now / Near / Next 로드맵

| 단계 | 기간 감각 | 목표 | 주요 capability |
|---|---|---|---|
| **Now** | Pilot / 초기 구축 | 업무별 Agentic Pilot 구현 | RAG, Tool Calling, API 연계, HITL UI, Audit Log, 기초 Semantic |
| **Near** | 운영 전환 | 품질·통제·운영 안정화 | Agent Routing, Evaluation Pipeline, Guardrails, Usage/Cost Control, Skill Versioning |
| **Next** | 확장/고도화 | 운영 학습과 자율성 확대 | Self-Improving Loop, Multi-Agent Collaboration, Continuous Reliability Testing, Agent Marketplace |

---

### 09-4. Build / Buy / Borrow 의사결정 기준

| 판단 기준 | Build 우선 | Buy 우선 | Borrow 우선 |
|---|---|---|---|
| 고객 업무 특수성 | 높음 | 중간 | 낮음 |
| 보안·통제 요구 | 높음 | 중간 | 검증된 자산에 한정 |
| 기술 변화 속도 | 낮거나 고객화 중요 | 중간 | 매우 빠름 |
| Time-to-Market | 여유 있음 | 빠른 확보 필요 | 빠른 실험/검증 필요 |
| 차별화 축적 가능성 | 높음 | 자사 솔루션이면 높음 | 낮거나 간접적 |
| 운영 책임 | 직접 책임 필요 | 벤더/자사 솔루션 책임 병행 | 내부 검증 후 제한적 적용 |

---

## 10. v5.0 HTML 반영 가이드

### 10.1 우선 반영 순서

| 우선순위 | 반영 항목 | 위치 |
|---|---|---|
| 1 | Data Platform → Agentic Operation 발전 박스 | 04장 lead 직후 |
| 2 | Build / Buy / Borrow 기술 채택 전략 단락 | 04장 발전 박스 다음 |
| 3 | 04-2 범례 Build / Buy / Borrow 재라벨링 | 04-2 Capability Map |
| 4 | Case 3 · Data Platform PoC 기반 AAP 확장 후보 | 05장 적용 레퍼런스 |
| 5 | Type A 보강 | 07장 고객 유형별 진입 패턴 |
| 6 | 후속 논의 5단계 | 08장 신규/복원 |
| 7 | Capability 확보 전략 매트릭스 | 09장 별첨 |

### 10.2 디자인/분량 원칙

- 본문은 과도하게 무겁게 만들지 않는다.
- 04장에 메시지 집중, 09장 별첨에 전략 상세를 배치한다.
- 09장은 외부 공유본에서는 접거나 분리할 수 있도록 별첨 구조를 유지한다.
- Build/Buy/Borrow는 “우리가 못 만들어서 외부 자산을 쓴다”가 아니라 “핵심 Build + 가속 Buy/Borrow”로 표현한다.
- Data Platform은 “낡은 것”이 아니라 “신뢰 가능한 기반”으로 표현한다.
- Medallion/Dimension/Lakehouse는 폐기 대상이 아니라 Agentic Operation의 기반으로 재해석한다.

---

## 11. v5.0 변경 요약

| 영역 | v4.0 | v5.0 |
|---|---|---|
| 최상위 메시지 | 구축형 Agentic AI 운영 체계 | Data Platform의 소비·실행 계층을 재구성하는 Agentic Operation Layer |
| Data Platform 관계 | Customer Environment / Data Inputs 수준 | AAP의 기반이자 Agentic Operation 전환 대상 |
| 패러다임 | 운영 전환 중심 | Human Analytics → Agentic Operation 전환 명시 |
| 아키텍처 | Trust 외곽 + AAP Execution Loop | Data Platform → Data Intelligence → Agentic Operation 브릿지 추가 |
| 기술 확보 전략 | 자사 솔루션 마킹 중심 | Build / Buy / Borrow 명시화 |
| 시간축 | 명시 약함 | Now / Near / Next 로드맵 추가 |
| 레퍼런스 | 금융 자문형, 산업 도메인 모델링 | Data Platform PoC 기반 AAP 확장 후보 추가 |
| 후속 논의 | 약함/별도 관리 | Data Foundation → Semantic → BBB → Pilot → Learning 5단계 |
| 별첨 | 내부 검토용 사업화 확장 항목 | Capability 확보 전략 매트릭스 |

---

## 12. v5.0 최종 결론

v5.0의 방향은 다음 한 문장으로 정리된다.

> **AAP는 기존 Data Platform 위에 AI 기능을 붙이는 것이 아니라, AI Agent 시대에 맞춰 데이터·업무·시스템·통제 구조를 재구성하는 Agentic Operation Layer입니다. KT DS는 고객 업무 의미화와 시스템 통합·통제 설계는 Build 중심으로 가져가고, 빠르게 발전하는 AI 기술은 Buy/Borrow를 조합해 Time-to-Market과 시장 정합성을 확보하는 구축형 플랫폼 전략으로 AAP를 제안해야 합니다.**

이 방향은 v4.0의 안전한 고객용 메시지를 유지하면서도, 다음 세 가지를 보강한다.

1. **시대 인식**: 인간 분석가 중심 데이터 플랫폼에서 AI Agent 중심 업무 실행 체계로 전환
2. **구조 정합성**: Lakehouse/Medallion/Governance를 기반으로 Semantic/Agentic/Action/Learning 계층 확장
3. **실행 가능성**: Build/Buy/Borrow와 Now/Near/Next로 수행 현실성·시장 대응력 동시 확보

