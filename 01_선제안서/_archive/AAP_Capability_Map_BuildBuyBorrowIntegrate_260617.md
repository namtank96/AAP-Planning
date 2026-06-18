# AAP Capability Map — 확보 방식 (Build · Buy · Borrow · Integrate)

> **목적**: AAP 8계층 아키텍처의 상세 구성요소(Capability)를 **어떻게 확보할 것인가**의 관점에서 4가지 방식으로 분류한 맵. 선제안서 4-3 소관 내용.
> **핵심 메시지**: **차별화는 직접 만들고(Build) · 자사 검증 자산은 도입하고(Buy) · 범용은 차용하고(Borrow) · 고객 자산은 연계한다(Integrate)**.
> **작성일**: 2026-06-17 · Simulation/제안 단계 가정, 최종은 아키텍처·구매 검토 후 확정.

---

## 1. 4가지 확보 방식 정의

| 방식 | 의미 | 적용 원칙 | 대표 영역 |
|---|---|---|---|
| 🔨 **Build (구축)** | 직접 개발 | 표준 제품이 못 채우는 **차별화·도메인 특화** | L4 의미모델 · L7 통제/학습 · L3 런타임 로직 · 감사 추적 |
| 💳 **Buy (도입)** | 자사(KT DS) 제품·상용 솔루션 도입 | 검증된 자산 재사용으로 **속도·신뢰성** 확보 | KT DS 자산(AI:ON-U·BEAST·Antbot·Agent Registry)·상용 IAM/모델 |
| 🔗 **Borrow (차용)** | 오픈소스·프레임워크·Foundation Model API | **범용·비차별화** 영역은 만들지 않고 활용 | L3 Agent 프레임워크 · L5 검색 · L8 인프라 |
| 🔌 **Integrate (연계)** | 고객 보유 시스템·데이터 연결 | **대체 ✕ 연결 ○** — 고객 자산 위에 작동 | 고객 ERP·CRM·결재·계약DB·IAM·폐쇄망 |

---

## 2. 한눈에 — 계층별 주(主) 확보 방식

| 계층 | 차별화 | 주 확보 방식 | 한 줄 |
|---|---|---|---|
| **L1 경험 / 접근** | | Build + Borrow | 검토·승인 화면은 Build, 채널·게이트웨이는 Borrow |
| **L2 설계 / 개발** | | Buy + Build | 스튜디오·레지스트리(자사 Buy), 정책·룰 설계(Build) |
| **L3 에이전트 실행환경** | ★ core | Build + Borrow + Buy | 런타임 로직 Build / 프레임워크 Borrow / BEAST Buy |
| **L4 지식 / 시맨틱** | ★ kt ds 차별화 | **Build** (대부분) | 손해사정 의미모델·지식그래프·근거 — 차별화 핵심 |
| **L5 데이터 / 연동** | | Integrate + Buy + Borrow | 커넥터 Integrate / OCR=AI:ON-U Buy / 검색 Borrow |
| **L6 AI 품질 / 평가** | | Buy + Build | Antbot·BEAST(Buy) + Decision Log·평가기준(Build) |
| **L7 컨트롤 / 거버넌스** | ★ kt ds 차별화 | **Build** + Integrate | 정책·승인·운영학습 Build / IAM 연계 Integrate |
| **L8 인프라** | | Borrow + Integrate | OSS 인프라 Borrow / 고객 폐쇄망 Integrate |

> **수주 가치(Build 집중 영역)**: L4 지식/시맨틱 · L7 컨트롤/거버넌스 · L3 런타임 · L6 감사 추적. = AAP의 ★ 차별화 4영역.

---

## 3. 계층별 상세 — 구성요소 × 확보 방식 × 확보 방법

### L1 경험 / 접근 (Experience / Access)
| 구성요소 그룹 | 대표 컴포넌트 | 확보 방식 | 확보 방법 |
|---|---|---|---|
| 사용자 접점 | Agent Portal · Copilot/Chat UI · Knowledge Assistant | 🔨 Build (+🔗 framework) | 손해사정사 워크스페이스 직접 구축, UI 프레임워크 차용 |
| 검토·승인 | HITL Console · Evidence View · Approval Queue · Audit View | 🔨 **Build** | 도메인 검토·승인 화면 직접 구축(차별화) |
| 접근·채널 | API Gateway/SDK · Web · Mobile | 🔗 Borrow | 기성 게이트웨이·웹/모바일 프레임워크 |
| 협업 채널 | Teams · Slack · Email | 🔌 Integrate | 고객 협업 도구 커넥터 연계 |

### L2 설계 / 개발 (Design / Development)
| 구성요소 그룹 | 대표 컴포넌트 | 확보 방식 | 확보 방법 |
|---|---|---|---|
| Agent·프로세스 설계 | Agent Studio · Process Designer · Prompt/Skill Template | 💳 Buy (자사 AAP 스튜디오) | 자사 Low-Code 스튜디오 도입 |
| 정책·룰 설계 | Policy/Rule Designer · Approval Scenario · Decision Rule | 🔨 **Build** | 손해사정 정책·승인 시나리오 직접 설계 |
| 등록·버전 | Tool Registry · **Agent Registry** · Version Management | 💳 Buy (**자사 검증 Agent**) | 자사 Agent Registry(카탈로그·버전·배포) |
| 테스트·배포 | Test / Sandbox · Deployment | 🔗 Borrow | 기성 CI/CD·샌드박스 |

### L3 에이전트 실행환경 (Agent Runtime) ★ core
| 구성요소 그룹 | 대표 컴포넌트 | 확보 방식 | 확보 방법 |
|---|---|---|---|
| 오케스트레이션 | Supervisor · Task Routing · Agent Coordination (A2A) | 🔨 Build (on 🔗 framework) | 오케스트레이션 프레임워크 차용 + 도메인 분해·라우팅 로직 구축 |
| 모델·도구·메모리 | Model Gateway · Tool Calling · Memory / Context | 🔗 Borrow (+💳 BEAST) | 프레임워크/게이트웨이 차용, 도구 비용·성능은 BEAST |
| 판단·통제 | HITL Runtime Gate · Runtime Guardrail | 🔨 **Build** (+💳 BEAST) | 도메인 런타임 게이트·가드레일 기준 직접 구축 |

### L4 지식 / 시맨틱 (Knowledge / Semantic) ★ kt ds 차별화
| 구성요소 그룹 | 대표 컴포넌트 | 확보 방식 | 확보 방법 |
|---|---|---|---|
| 의미 모델 | **Domain Ontology** · Business Concept Model · Policy/Rule Model · Authority/Role Model | 🔨 **Build** ★ | 손해사정 도메인 온톨로지·개념·정책 의미모델 직접 구축 — **최우선 차별화** |
| 관계 지식 | Knowledge Graph · Relation Mapping · Hybrid Knowledge Store | 🔨 Build (+🔗 GraphDB) | 도메인 지식그래프 구축, 저장소는 차용 |
| 근거 구성 | Context Assembly · Grounded Context · Evidence/Citation · Decision Knowledge · RAG | 🔨 Build (+🔗 RAG framework) | 근거 조합·인용 로직 구축, RAG 파이프라인 차용 |

### L5 데이터 / 연동 (Data / Integration)
| 구성요소 그룹 | 대표 컴포넌트 | 확보 방식 | 확보 방법 |
|---|---|---|---|
| 연결·수집 | DB · API · SaaS Connector · File/SFTP · Event/Batch | 🔌 **Integrate** | 고객 청구·계약·정비 시스템 커넥터 연계 |
| 문서 처리 | Document Processing · **OCR** · Parser · Chunking | 💳 Buy (**AI:ON-U**) | OCR=자사 AI:ON-U, 파싱/청킹은 기성 |
| 검색·참조 | Embedding · Vector Index · Retrieval Policy · Hybrid Search | 🔗 Borrow | OSS 임베딩·벡터 인덱스, 검색 정책만 설정 |
| 데이터 관리 | Data Quality · Schema/Metadata · Lineage | 🔨 Build / 🔗 Borrow | 품질·리니지 도구 차용, 도메인 규칙 구축 |
| 연동·반영 | Writeback Connector · System Sync | 🔌 **Integrate** | 판단 결과를 고객 보상·결재 시스템에 반영 |

### L6 AI 품질 / 평가 (AI Quality / Evaluation)
| 구성요소 그룹 | 대표 컴포넌트 | 확보 방식 | 확보 방법 |
|---|---|---|---|
| 실행 추적 | **Decision Log** · Execution Trace · Replay/Audit Evidence | 🔨 **Build** | 판단·근거 추적·재현 — 거버넌스 핵심 직접 구축 |
| 품질·근거 평가 | Quality Evaluation · Grounding Evaluation · Evaluation Dataset | 💳 Buy (**Antbot**) + 🔨 Build | 워크플로우 평가=Antbot, 평가셋·기준은 구축 |
| 안전·책임 평가 | RAI / Safety Evaluation · Regression Test | 🔗 Borrow / 🔨 Build | 평가 프레임워크 차용 + 도메인 안전 기준 |
| 성능·비용·피드백 | **Performance/Cost Monitoring** · User Feedback | 💳 Buy (**BEAST**) | 성능·비용 모니터링=BEAST(tool) |

### L7 컨트롤 / 거버넌스 (Control / Governance) ★ kt ds 차별화
| 구성요소 그룹 | 대표 컴포넌트 | 확보 방식 | 확보 방법 |
|---|---|---|---|
| 정책 관리 | **Policy Management** · Control Rule · No-go Policy · Model Usage Policy | 🔨 **Build** ★ | 통제 정책·금지 규칙 직접 구축 — 차별화 |
| 권한 관리 | Agent Access Control · IAM/SSO · RBAC/ABAC · Tenant Boundary | 🔌 Integrate (+💳 상용 IAM) | 고객 IAM/SSO 연계, Agent 권한 모델 구축 |
| 승인 기준 | **HITL Approval Criteria** · Approval Matrix · Human Review Boundary | 🔨 **Build** | 도메인 승인·검토 경계 기준 직접 구축 |
| 가드레일·배포 | Usage/Cost Guardrail · Release Gate · Deployment Approval | 🔨 Build (+💳 BEAST) | 사용량·배포 통제 구축, 비용 가드레일 BEAST |
| 운영 개선 | **Self-Improving** · Skill/Rule Improvement Approval | 🔨 **Build** ★ | 운영 학습 자산화·개선 승인 직접 구축 — 차별화 |

### L8 인프라 (Infrastructure)
| 구성요소 그룹 | 대표 컴포넌트 | 확보 방식 | 확보 방법 |
|---|---|---|---|
| Compute | Compute/GPU · Model Serving | 💳 Buy / 🔗 Borrow | 상용 GPU·서빙 도입/차용 |
| 컨테이너·런타임 | Container · Kubernetes · Runtime Isolation | 🔗 Borrow | OSS K8s·컨테이너 |
| 네트워크·보안 | Network · Firewall · Secret Manager | 🔌 Integrate (+🔗) | 고객 네트워크·보안 인프라 연계 |
| Storage | RDB · Object Storage · Log Store · Backup/DR | 🔗 Borrow / 💳 Buy | OSS·상용 스토리지 |
| 특화 저장소 | VectorDB · GraphDB | 🔗 Borrow | OSS 벡터·그래프 DB |
| 배포 | On-premises · Private Cloud · Closed Network | 🔌 **Integrate** | 고객 폐쇄망·온프레 환경에 배포 |

---

## 4. 확보 방식별 역집계 (무엇을 어떻게)

### 🔨 Build — 직접 구축 (차별화·수주 가치)
- **L4 지식/시맨틱**: Domain Ontology · 개념/정책 의미모델 · 지식그래프 · 근거 구성 *(최우선)*
- **L7 컨트롤/거버넌스**: 정책 관리 · No-go 정책 · HITL 승인 기준 · Self-Improving(운영학습)
- **L3 런타임**: 도메인 오케스트레이션·분해·라우팅 · HITL 게이트/가드레일 기준
- **L6 감사**: Decision Log · 실행 추적 · 평가 기준/데이터셋
- **L1 검토 화면**: HITL Console · Evidence View · Approval Queue
- **L2 정책 설계**: Policy/Rule Designer · 승인 시나리오

### 💳 Buy — 도입 (KT DS 자산 + 상용)
| 자산/제품 | 적용 계층 | 역할 |
|---|---|---|
| **AI:ON-U** | L5 | OCR·문서 디지털화 |
| **Antbot** | L6 | 워크플로우 품질·근거 평가 |
| **BEAST** | L3·L6·L7 | 도구·성능·비용 모니터링/가드레일 |
| **Agent Registry** | L2 | 자사 검증 Agent 카탈로그·버전·배포 |
| Agent Studio (자사) | L2 | Low-Code Agent·프로세스 설계 |
| 상용 IAM/SSO · GPU·서빙·스토리지 | L7·L8 | 보안·인프라 검증 제품 |

### 🔗 Borrow — 차용 (OSS·프레임워크·모델)
- **L3**: Agent 오케스트레이션 프레임워크 · Model Gateway · Memory
- **L5**: Embedding · Vector Index · Parser · Chunking · RAG 파이프라인
- **L8**: Kubernetes · Container · RDB · Object Storage · VectorDB · GraphDB
- **L1**: API Gateway · Web/Mobile 프레임워크
- **공통**: Foundation Model (Claude 등) API

### 🔌 Integrate — 연계 (고객 자산)
- **고객 시스템**: 청구시스템 · 계약 DB · ERP · CRM · 결재 시스템 · 정비/병원 데이터
- **L5 커넥터**: DB/API/SaaS Connector · Writeback Connector · System Sync (판단 결과 반영)
- **L7 권한**: 고객 IAM/SSO 연계
- **L8 배포**: 고객 폐쇄망·온프레미스 환경
- **협업 채널**: Teams · Slack · Email

---

## 5. 핵심 메시지 (요약)

1. **AAP의 가치 = Build 영역의 깊이.** 손해사정 의미모델(L4)·통제/운영학습(L7)·런타임 판단 로직(L3)·감사 추적(L6)은 표준 제품으로 대체 불가 → **직접 구축**이 수주 가치.
2. **속도·신뢰성은 자사 자산(Buy)으로.** AI:ON-U·BEAST·Antbot·Agent Registry로 OCR·평가·비용·레지스트리를 검증된 자산으로 채워 **구축 범위를 차별화에 집중**.
3. **범용은 만들지 않는다(Borrow).** Agent 프레임워크·검색·인프라는 OSS·기성 활용으로 **원가·기간 절감**.
4. **고객 자산은 대체가 아니라 연계(Integrate).** 기존 시스템·데이터·폐쇄망 위에 작동 → 도입 저항 ↓.

> 모든 분류는 제안 단계 가정값이며, Build/Buy 경계(예: 스튜디오·평가·IAM)는 **아키텍처·라이선스·TCO 검토 후 확정**합니다.
