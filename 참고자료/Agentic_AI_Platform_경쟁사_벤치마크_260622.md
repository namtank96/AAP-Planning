# 엔터프라이즈 Agentic AI Platform 경쟁 제품 비교 보고서

> **기준일**: 2026-06-22 · **목적**: KT DS AAP(Agentic AI Platform) 기획 벤치마크
> **조사 방식**: deep-research(다중 WebSearch·소스 fetch) → Sonnet 종합. verify(적대 검증) 단계는 토큰 절감 위해 중단 — 한국 SI 3사 기능 주장은 벤더 선언/언론 보도 수준임에 유의.
> **요약본**: `…/memory/reference_agentic_platform_benchmark.md` (매 세션 자동 로드)

---

## 1. 제품별 정리

### 1-A. Palantir AIP (Artificial Intelligence Platform)

#### 기능 구성
**플랫폼 3분 구조**: AIP(Generative AI) + Foundry(데이터 운영) + Apollo(자율 배포) = "Enterprise Operating System".

**핵심 빌더 도구 2종:**

| 도구 | 역할 |
|------|------|
| **AIP Logic** | LLM 기반 함수·워크플로우 빌더(no-code). 블록 기반(Use LLM / Apply Action / Execute Function / Conditionals / Loops / Create Variable) 시각적 구성. 온톨로지 객체를 입력으로 받고 온톨로지 편집을 출력 |
| **AIP Chatbot Studio** (구 AIP Agent Studio, 2026-04-27 리브랜드) | 에이전트(Chatbot) 빌더. LLM + 온톨로지 + 문서 + 커스텀 툴 조합. 운영앱(Workshop) 위젯으로 임베드 |

**에이전트 도구 타입(Chatbot Studio, 6종+레거시)**: Action(온톨로지 편집, 자동/사람확인 선택) / Object Query(객체 접근·필터·집계·링크 탐색) / Function(AIP Logic 호출) / Update Application Variable / Command(타 앱 트리거) / Request Clarification (+레거시: Ontology Semantic Search).

**온톨로지(L4 핵심)**: 조직의 "디지털 트윈" — 데이터셋·모델 위의 시맨틱 레이어. LLM이 온톨로지를 통해서만 데이터에 접근(governed reasoning). "AIP Logic·Chatbot Studio·Evals는 모두 온톨로지 위에서 작동".

**HITL/거버넌스**:
- Action을 "자동 실행" 또는 "사용자 확인 후 실행" 2가지로 설정
- AIP Logic 온톨로지 편집 → 자동 적용 OR 사람 검토 스테이징(Proposals 탭, Agent decision log, 24h 가시성)
- Global Branching: 에이전트가 사람과 동일 플랫폼 기반(동일 권한·변경관리)으로 동작
- AIP Evals: 평가·모니터링. 플랫폼 전체 동일 보안 모델(최소 권한)

#### UI·디자인 패턴
- **AIP Logic 빌더 — 3패널**: 좌(입력/블록/출력 구성) · 중(Debugger — LLM 체인 시각화, 블록 카드 펼치기/접기, 툴콜 리뷰) · 우(Run 패널 — 실행·테스트·평가·히스토리)
- **Workshop(운영앱 빌더)**: 모듈 = Header(영구 툴바) + Pages + Sections + Overlays. 섹션 레이아웃 Columns/Rows/Tabs/Flow/Toolbar/Loop. **Overlays = 드로어(화면 가장자리 슬라이드) 또는 모달(중앙), 변수 기반 가시성 제어**. 빈 섹션 hover → "+ Add widget". **Blueprint 디자인 시스템** 기반 스타일링.
- **AIP Chatbot 위젯**: 운영 화면 안에 대화형 어시스턴트 임베드, 앱 변수 read/write **양방향 바인딩**
- "View reasoning"으로 LLM 추론 검사. Prompted 툴콜링(전 도구·순차) vs Native 툴콜링(병렬·빠름·4종 제한)

#### 차별화
1. 온톨로지 중심 — LLM은 온톨로지를 통해서만 데이터 접근(블랙박스 ✕, 결정론적 reasoning)
2. 에이전트-사람 동일 플랫폼 기반(Global Branching) — HITL이 플랫폼 내재
3. 모델 불가지론(k-LLM) — 모델 교체·버전관리·평가 내장
4. Workshop = 에이전트가 운영 앱 안에 임베드(독립 챗봇 ✕)

#### 출처
- https://www.palantir.com/docs/foundry/aip/overview
- https://palantir.com/docs/foundry/agent-studio/overview/
- https://www.palantir.com/docs/foundry/logic/overview
- https://www.palantir.com/docs/foundry/agent-studio/tools
- https://www.palantir.com/docs/foundry/workshop/concepts-layouts
- https://www.palantir.com/docs/foundry/workshop/widgets-aip-agent
- https://www.palantir.com/docs/foundry/logic/blocks
- https://www.palantir.com/docs/foundry/announcements/2026-04 (리브랜드 공지)

---

### 1-B. SK AX — AXgenticWire / Agentic Builder Platform

**제품명 확정**: "axgentic wire?" = **AXgenticWire**(정확 명칭). "Soler"·"Ania"는 공개 출처 미확인.
**브랜드 계층**: AXgenticWire(우산) > Agentic Builder Platform(빌드·오케스트레이션) > A.X LLM(모델, SKT 자체 34B·7B Lite 등).

#### 기능 구성
**AXgenticWire 레이어(AXO — AX Optimization Offering):**

| 레이어 | 내용 |
|--------|------|
| AXO Infra | 인프라 |
| Data & Knowledge | 데이터·지식 |
| LLM | A.X 모델 |
| **Agent Ops** | 성능·품질 모니터링 / 비용 최적화 / 정책·컴플라이언스 / HITL / 감사·트레이스 로그 |
| **Platform & Orchestration** | Workflow·Task 오케스트레이션 / 툴·함수 호출 / 메모리 관리 / 프롬프트·정책 / 멀티에이전트 관리 |
| Agent Services & Applications | 도메인 에이전트·앱 |

**Agentic Builder Platform**:
- **Recipe Board**: no/low-code "업무 설명 → AI 에이전트 생성 → 실행 테스트" 3단계. Step/Action Recipe 보드로 비개발자 구성
- **Knowledge Engine**: 내외부 문서·설비 로그·점검 이력 자동 수집·정제 후 구조화
- **MCP 기반**: Agent / Tool / Memory 유연 확장. Memory + Feedback Loop로 지속 개선
- 재사용 표준 툴·레시피(설비점검기록 자동생성·부품재고조회·공정보고서 등), Citizen AI(현장팀 직접 구축)

**AI Studio**(2026-03-25 Cloud Impact): 데이터 준비→모델 개발→테스트→배포 통합(코딩 없이), MCP로 데이터↔AI툴 양방향 연결, 모니터링 워크플로우.
**제조 수직**: 시장가격 예측 / 공정운영 지능화 / 소재 물성 예측 Agent, SCM 실시간 배포 사례.

#### UI·디자인 패턴
- Recipe Board: 단계/액션 카드형 구성(좌→우 또는 상→하 플로우), 비개발자 중심 시각 빌더
- AI Studio: 데이터·모델·테스트·배포 단일 인터페이스
- 구체적 화면/스크린샷 공개 제한적(skax.co.kr 접근 필요)

#### 차별화
1. "AX Rewiring Architect" — SK Group 반도체·배터리·화학 실운영 경험 기반(구현자 포지션)
2. "Beyond PoC" — IMAGINE AX 2026 "Beyond AI: The Agentic Enterprise"
3. 분산 AI 도구 통합(fragmented → cohesive)
4. OpenAI 파트너십(2026-05) — ChatGPT Enterprise 기반 맞춤+컨설팅+멀티에이전트+거버넌스+변화관리

#### 출처
- https://www.skax.co.kr/ax-services/agentic-builder-platform
- https://www.skax.co.kr/insight/trend/3676 (브랜드 런칭 2026-03-19)
- https://www.thelec.net/news/articleView.html?idxno=5972
- https://www.koreaittimes.com/news/articleView.html?idxno=152113
- https://www.ddaily.co.kr/page/view/2026032515425070306 (AI Studio·MCP)
- https://m.ajupress.com/amp/20260616150470608 (IMAGINE AX 2026)
- https://en.sedaily.com/technology/2026/06/16/sk-ax-hosts-imagine-ax-2026-conference-shares-industry-ai

---

### 1-C. 메가존클라우드 — AIR Studio

#### 기능 구성
**4대 핵심 기능**: 에이전트 빌더 / 문서 자동화(표준 템플릿·리서치 보고서) / RAG·벡터 검색 Q&A(문서→벡터DB→맥락 응답) / 비즈니스 프로세스 통합(에이전트 즉시 연결).

**거버넌스·보안**: 단일 콘솔(RBAC·데이터보안·사용정책) · 부서·역할·사용자 단위 실시간 사용 대시보드 · PII 필터·감사 로그(Shadow AI→통제 전환) · **한국 MSP 최초 ISO/IEC 42001(AI 관리시스템) 인증(2025-10-14)**.

**모델·인프라**: 모델 무관(AWS Bedrock / GCP Vertex AI / Azure OpenAI) · Amazon Bedrock + Claude Sonnet 4.5 + RAG · 프라이빗/온프레미스 · **토큰 기반 과금**(좌석 ✕).
**GTM**: AIR Consulting + AIR Build, 2주 PoC 패키지. **타깃: 금융·제약·공공(규제 산업)**.

#### UI·디자인 패턴
- 통합 콘솔(빌더·챗봇·문서자동화·RAG Q&A 단일 환경)
- 부서·역할·사용자 단위 실시간 사용 분석 대시보드
- 구체적 빌더 화면 공개 제한적

#### 차별화
1. 거버넌스·컴플라이언스 퍼스트(ISO/IEC 42001) — 규제 산업 "안전 운영" 포지셔닝
2. 모델 무관 아키텍처(벤더 Lock-in ✕)
3. 컨설팅 주도 GTM(2주 PoC + 컨설팅·구축 묶음, 한국 SI 전형)
4. Shadow AI → 통제 환경 전환 스토리

#### 출처
- https://www.megazone.com/resources/newsroom/44 (공식 뉴스룸, 2025-08)
- https://www.prnewswire.com/news-releases/megazoneclouds-air-studio-earns-koreas-first-isoiec-42001-certification-for-ai-management-systems-302584233.html (ISO 인증, 2025-10-14)
- https://www.economidaily.com/view/20250811170457561 (출시 보도)

> **신뢰도 주의**: 에이전트 빌더 오케스트레이션 메커니즘·UI 스크린샷 공개 부족. 거버넌스 포지셔닝은 1차 소스(PR Newswire·공식 뉴스룸) 확인, 빌더 세부는 국내 2차 보도.

---

### 1-D. LG CNS — AgenticWorks + AX Sync

#### 기능 구성
**AgenticWorks — 6모듈 풀스택:**

| 모듈 | 역할 |
|------|------|
| **Builder** | 코드 기반 에이전트 개발 |
| **Studio** | no-code 에이전트 개발(비전문가) |
| **Knowledge Lake** | 데이터 전처리·RAG 준비 |
| **Hub** | 기업 시스템 통합(MCP + A2A) |
| **Refiner** | AI 모델 최적화(효율·비용) |
| **Router** | 최적 AI 모델 자동 추천·실행 |

**Builder/Studio UX**: 인튜이티브 프롬프트 빌더(템플릿) · 도메인 최적화 에이전트 설정 · 워크플로우 디자이너(비기술 팀) · 온프레미스·클라우드 양쪽.
**보안 — SecureXper AI**: 에이전트-인프라 통합 지점 민감정보 필터·이상탐지(preemptive + anomaly + 자동 대응).
**AX Sync(= a:xinx, "AX+EX+Think")**: 7가지 오피스 업무 에이전틱 전환(이메일·음성 브리핑·회의 자동 스케줄링·실시간 번역·보고서). **"수퍼 에이전트"** = 회의·결재·브리핑 조율 코디네이팅 에이전트. ERP·그룹웨어 통합 + 우선순위 기반 개인화.
**기술 기반**: DAP GenAI(자체) + Cohere 협력 + Exaone(LG AI Research). 500+ AX 프로젝트 경험 기반 도메인 특화.
**DevOn Agentic AIND**(2026-06-08 별도 제품): IT 시스템 개발·운영 전 주기 에이전틱화(요구분석→설계→코딩→테스트). **Knowledge Foundation** = 개발표준·보안규칙·소스·IT 아티팩트 저장 기업 온톨로지.
**거버넌스·운영**: 저코드/노코드·어댑티브 러닝·거버넌스 내장. 데이터 커넥터·RAG·평가·모니터링·접근제어 기업급.

#### UI·디자인 패턴
- Builder(개발자) + Studio(비개발자) 분리 — 페르소나별 UX 분기
- 워크플로우 디자이너(시각적 자동화 설계)
- AX Sync "수퍼 에이전트" 대시보드 개념 (구체 UI 미확보)

#### 차별화
1. 한국 SI 중 가장 상세한 모듈 분류(6모듈 풀스택) — **AAP 계층 구조와 구조적으로 最유사**
2. Exaone 자체 모델 + 외부 파트너(OpenAI·Anthropic) 병행(주권 AI + 외부 협력)
3. AX Sync 수퍼 에이전트 — 개별 태스크가 아닌 조율 에이전트("에이전트 위의 에이전트")
4. ROI 수치 공개(LG Display 생산성 10%↑, 연 100억 원+ 절감, 채용 26%↑) — 도입 설득 자료
5. DevOn AIND — SW 개발 생명주기 자체를 에이전틱화한 별도 수직 제품

#### 출처
- https://aimresearch.co/product/lg-cns-agenticworks-platform-launch (2025-08-25)
- https://www.koreaherald.com/article/10561390
- https://www.theinvestor.co.kr/article/10561364
- https://www.lgcns.com/en/service/ai/ax-platform (공식)
- https://softwareanalytic.com/lg-cns-unveils-agentic-ai-platform-and-service-to-accelerate-enterprise-ai-adoption
- https://letsdatascience.com/news/lg-cns-launches-agentic-ai-development-platform-877f8cf1

---

## 2. 횡단 비교

| 항목 | Palantir AIP | SK AX AXgenticWire | 메가존 AIR Studio | LG CNS AgenticWorks |
|------|-------------|-------------------|-----------------|-------------------|
| 빌더 UX | no-code(AIP Logic 블록 + Chatbot Studio) | no-code Recipe Board + AI Studio | 챗봇·에이전트 빌더 | Builder(코드) + Studio(no-code) |
| 지식·시맨틱 | **온톨로지(핵심 차별화)** | Knowledge Engine | 벡터DB·RAG | Knowledge Lake + Knowledge Foundation |
| 오케스트레이션 | 멀티에이전트 + Workshop 임베드 | 멀티에이전트 + MCP | 에이전트-프로세스 즉시 연결 | Hub + 수퍼 에이전트(AX Sync) |
| HITL/거버넌스 | Global Branching + Action 확인 | Agent Ops(HITL + 감사) | ISO 42001 + 단일 콘솔 RBAC | SecureXper AI + 거버넌스 모듈 |
| 운영·모니터링 | AIP Evals + 감사 로그 | Agent Ops(성능·비용) | 실시간 사용 대시보드 | Refiner + 평가·모니터링 |
| 모델 전략 | k-LLM(불가지론) | A.X 자체 | 모델 무관(멀티클라우드) | Exaone 자체 + Cohere + 외부 |

**공통 트렌드**: ① no-code/low-code 빌더 필수 ② 멀티에이전트 오케스트레이션(단일→기업 전체 조율) ③ 보안·거버넌스 내장(HITL + 감사 + 접근제어) ④ "Beyond PoC" 운영 배포가 2026 화두.

**디자인 패턴 비교:**

| 패턴 | Palantir(검증된 참조) | 한국 SI 제품군 |
|------|----------------------|--------------|
| 빌더 레이아웃 | 좌 구성 / 중 Debugger / 우 Run(3패널) | 공개 부족(Recipe Board 카드형 추정) |
| 실행 화면 | Workshop 운영앱 + Chatbot 위젯 임베드 | 단일 콘솔(메가존), 대시보드형(LG CNS) |
| 설명 레이어 | 드로어(Overlay) + 변수 바인딩 | 미확인 |
| 온톨로지 시각화 | 온톨로지 그래프(Foundry) | 미확인 |
| HITL UI | Proposals 탭 + Agent decision log | Agent Ops 패널(SK AX), RBAC 콘솔(메가존) |

---

## 3. KT DS AAP 기획 시사점

### 기능 측면
1. **Palantir 온톨로지 패턴 → AAP L4 강화**: 온톨로지를 "에이전트가 접근하는 유일한 의미 레이어"로. **결정론 Action 블록 / 비결정론 Use LLM 블록 분리**(AAP 결정론 엔진 원칙과 정합). Action "자동 실행 vs 사용자 확인" 2분기 → HITL 게이트 설계 기준.
2. **LG CNS 6모듈 → AAP 8계층 매핑 검증**: Builder/Studio(빌더) + Knowledge Lake(L4) + Hub(L5) + Refiner(L6) + Router(L3) + SecureXper(L7). **명시적 모델 Router 레이어** 검토. Knowledge Foundation(기업 온톨로지) → 도메인 팩 지식 구조화 참조.
3. **SK AX Recipe Board → AAP 빌더 UX**: 비개발자 "업무설명→생성→테스트" 3단계. MCP 재사용 툴/레시피 → AAP 컴포넌트 마켓플레이스. Agent Ops(HITL+감사+비용) → L7 거버넌스 체크리스트.
4. **메가존 → AAP 거버넌스 포지셔닝**: ISO/IEC 42001 인증 로드맵(규제 산업). Shadow AI→통제 전환 GTM 메시지. 토큰 vs 좌석 과금 모델.

### UI·디자인 측면
1. **Palantir 3패널 빌더 직접 차용**: 좌(구성 블록·컴포넌트) / 중(디버거·실행 흐름 시각화) / 우(테스트·히스토리 Run). AAP 빌더에서 "구성 ↔ 실행 흐름 ↔ 결과 검사" 분리.
2. **Workshop 드로어(Overlay) = AAP 현행과 직접 대응**: 운영 화면 + 우측 드로어(설명/근거/HITL) = AAP "업무 콘솔 + AAP 설명 Drawer" 패턴과 동일(검증된 참조). 변수 가시성 제어 → HITL 게이트 트리거 시 드로어 자동 노출.
3. **에이전트 위젯 임베드 + 양방향 바인딩**: "에이전트가 독립 화면 ✕, 업무 화면 안에 존재". 에이전트 판단이 업무 화면 상태를 직접 갱신 → 손해사정·회의 데모 철학과 일치.
4. **거버넌스 콘솔 UX**: 메가존 "부서·역할 단위 실시간 사용 대시보드" + SK AX Agent Ops "성능·품질·비용 한 화면" → AAP L7/운영 설정 화면 구성.

---

## 4. 정보 신뢰도/공백

### 고신뢰(1차 소스 검증)
- Palantir AIP 전체 기능·Workshop 레이아웃·HITL: 공식 docs 직접 WebFetch, 다수 에이전트 교차 확인(最高)
- SK AX AXgenticWire 브랜드/레이어: THE ELEC·Korea IT Times·SK AX 공식 페이지
- LG CNS 6모듈·AX Sync: Korea Herald·AIM Research·The Investor 교차
- 메가존 AIR Studio 기능·ISO 42001: 공식 뉴스룸·PR Newswire(1차)

### 공백·불확실
- SK AX "Soler"·"Ania": 공개 소스 미확인(내부 프로젝트명 또는 오기억 가능성 높음)
- 한국 SI 3사 빌더 **실제 화면·스크린샷·오케스트레이션 세부**: 대부분 미공개 → 화면 레벨은 YouTube 데모 별도 확인 필요
- 메가존 에이전트 간 오케스트레이션(A2A·MCP 지원 여부) 불명확
- 한국 SI 실제 배포 온톨로지 구조: LG CNS Knowledge Foundation은 개념만, 실제 스키마 미공개
- Palantir 실제 화면 스크린샷: 공식 docs는 텍스트·개념 위주

### 방법론 주의
- 한국 SI 3사: 국내 언론 + 공식 뉴스룸 기반, 기능 주장은 **벤더 자체 선언 수준**
- 메가존 AIM Research URL: 직접 fetch 시 404 → 검색 캐시 + Korea Times/Herald 교차
- Palantir: "AIP Agent Studio" → "AIP Chatbot Studio" 리브랜드(2026-04-27)로 일부 docs URL 변경(/agent-studio/ → /chatbot-studio/ 리디렉트)
- **본 조사는 적대 검증(verify) 단계를 중단**한 종합본 — Palantir 외 항목은 추가 검증 시 일부 수정 가능
