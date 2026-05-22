# AAP 기획안 · 통합 버전 기록 · v4.0

> **작성일**: 2026-05-22  
> **현재 산출물**: `공유용/aap_proactive_offering_v250_260522.html` (고객용 선제안서 v0.4)  
> **목적**: v210 → v250까지의 변경 이력과 v250 현재 상태를 한 문서로 정리. 이후 작업은 본 문서를 기준점으로 분기한다.

---

## 0. 버전 체계 한눈에

| 산출물 | 날짜 | 성격 | 문서 버전 | 주요 변화 |
|---|---|---|---|---|
| v210 | 2026-05-21 | 고객용 선제안서 (초안) | v0.2 작업본 | 8 Layer × 슬림 Capability Map · 별첨 기술 후보표 |
| v220 | 2026-05-21 | 내부 사업전략 · 직책자 설득안 | v0.1 (내부용) | 14개 섹션 · 패키지·BBB·로드맵·의사결정 |
| v230 | 2026-05-21 | 고객용 선제안서 (재정렬) | v0.2 (재구성) | v210 흐름 + v220 Capability Map 구조 |
| v240 | 2026-05-21 | 고객용 선제안서 (리뷰 반영) | v0.3 | 02·03·07장 정제 · 익명화 · Type C 색상 |
| **v250** | **2026-05-22** | **고객용 선제안서 (고도화)** | **v0.4** | **04-1 한판 재설계 · 06장 전면 재구성 · 자사 솔루션 마킹** |

---

## 1. v210 — 시작점 · 고객용 v0.2 작업본

- **8 Layer Capability Map 슬림화**: 각 layer당 핵심 capability 3개로 정리
- **별첨**: Capability별 구현 기술·자산 후보 매핑표 추가
- **차별화 표기**: ★ kt ds 차별화 영역 (Business Semantic · Operational Learning)
- **시각 보정**: 점선/실선 contrast 강화, Customer Environment subtle 구분선

---

## 2. v210 → v220 — 내부 전략 분기

용도 분리. 같은 AAP 코어를 사용하되 내부 직책자 설득용 문서로 전환.

- **섹션 재구성**: ES + 01 ~ 12 + Appendix (총 14개)
- **04장 5-band 수직 스택 아키텍처** 도입 (Service Experience → Execution Loop → Control Plane → Customer Environment + Trust Foundation)
- **AI 투자 메이트 현황 업데이트** (2026-05 기준)
  - Qwen 기반 모델 변경 테스트 완료
  - Langfuse AWS 환경, AWS PostgreSQL·OpenSearch 환경 구성 진행
  - Data RAG 기반 구성, VectorDB 구축·운영 안정화 진행
  - Langfuse 기반 AI FinWave 테스트
  - 뉴스 기반 Graph RAG 구축 지속, 로보어드바이저 검토
- **신규 섹션**: 오퍼링 4단계 패키지(Assessment/Pilot/Build/Operate) · Build·Bring·Borrow · 경쟁 구도 · 조직 운영 · 리스크 · 6개월 로드맵 · 의사결정 요청사항

---

## 3. v220 → v230 — 고객용으로 회귀, Capability Map 강화

- 다시 고객용 v0.2 선제안서로 (v220 내부 전략은 별도 트랙으로 유지)
- **v210 기본 흐름 + v220의 "Layer × 대표 Capability × 확장 컴포넌트" 구조 도입**
- 섹션 구조: 7개 본문 + 별첨 A (내부 전략 확장)
- **04장 sub-section 6개**: Architecture Overview / MECE Layer Map / Capability Map / Bridge / Delivery Model / Appendix
- **03-3 closed loop 도식** 추가 (Semantic → Agentic → Action → Learning + 환류)
- **06·07장 신규**: 산업별 4개 카드, 고객 유형별 Type A/B/C

---

## 4. v230 → v240 — v0.3 리뷰 반영

### 4.1 02장 컬럼 재구성
- `빈틈 / 고객 현상 / AAP 연결 영역` → `빈틈 / 현재 가능한 점 / 운영 전환 시 한계`
- AAP 직접 매핑 제거, 고객 공감 우선

### 4.2 03-2 단순화
- closed loop 도식 제거
- AAP 정의 + 4개 구성 원칙 카드 (Service Experience / AAP Execution Loop / Customer Environment / Trust) 추가
- 03/04장 역할 분담 명확화 (03=개념, 04=구현 아키텍처)

### 4.3 04-2 범례 문구 완화
- `직접 구축 영역` → `설계·통합 주도 영역`
- `외부 자산·파트너 조합` → `검증 자산·파트너 조합 영역`
- `차별화 영역` → `차별화 축적 영역`

### 4.4 05장 익명화
- AI 투자 메이트 → 금융 자문형 사례
- 산업단체 온톨로지 PoC → 산업 도메인 모델링 사례
- LangGraph → 멀티에이전트 기반 자문 생성 구조
- AAP Pack → 적용 패턴

### 4.5 07장 정제
- Type C 헤더 색상: `--teal-strong` (#007f7f) → `#176b6a` (deep teal)

### 4.6 별첨 A 명확화
- 외부 공유 시 분리 운용 권장 안내

---

## 5. v240 → v250 — v0.4 고도화 (현재 산출물)

### 5.1 표현 안전화 (Hero/01/02/03장)

| 영역 | Before → After |
|---|---|
| Hero | "Agent가 판단·실행·검토" → "**업무 기준에 따라 판단 후보를 만들며**, 사람 검토와 시스템 반영으로 이어지도록" |
| 01장 제목 | "AI 도입의 1차 사이클이 끝난다" → "**PoC 이후, 운영 전환이 다음 과제**" |
| 01 카드 ② | "단일 Agent 중심" → "개별 기능 중심" |
| 01 카드 ③ | "사람이 담당" → "사람에게 집중" |
| 02장 제목 | "운영까지 가지 못하는 4가지 빈틈" → "**운영 전환에서 드러나는 4가지 공백**" |
| 02장 ④ 학습 행 | "PoC별 결과 정리" → "**단위 개선은 가능**, 업무 지식·정책 개선·Agent 스킬로 재사용되는 구조 부족" |
| 03-1 카드 ③ | "업무 수행형 AI" → "**업무 실행을 보조하는 Agentic AI**" |

### 5.2 04-1 Architecture Overview 한판 재설계 (핵심)

**Trust를 외곽 프레임으로** 전체를 감싸는 구조로 변경:

```text
┌─ Trust · Security · Governance · 공통 기반 ─────────┐
│                                                     │
│  [Service Experience & Outcome]                     │
│  [AAP Execution Loop]                               │
│   Enterprise Data & Inputs                          │
│   → ★ Business Semantic Modeling                    │
│   → Agentic Reasoning                               │
│   → Enterprise Integration & Action                 │
│   → ★ Operational Learning                          │
│      ↺ feedback to Semantic · Agentic               │
│  [Customer Environment]                             │
└─────────────────────────────────────────────────────┘
```

- Service Experience → **Service Experience & Outcome** 으로 확장 (Workflow/Writeback/Ops Report 포함)
- Customer Environment에 Internal API 추가
- ★ 표기 강조 (Semantic · Operational Learning)
- Operational Learning → Semantic/Agentic 피드백 환류선 명시

### 5.3 04-2 Capability chip 정리

| capability | chip 변경 |
|---|---|
| [5] Planning & Orchestration | Function Calling 제거, State Memory · Work Context 추가 |
| [5] Tool Calling Runtime → **Tool & API Execution Control** | 명칭 변경 |
| [6] Writeback Integration → **Business System Writeback** | 명칭 변경 |
| [6] Exception → **Exception Handling & Transaction Safety** | Durable Execution chip 추가 |
| [7] Decision Logging | `Trace`·`Prompt/Response Log` → `Decision Basis`·`Audit Link` (chain-of-thought 노출 회피) |
| [7] Evaluation → **Quality Evaluation & Feedback Loop** | 명칭 변경 |
| [5] `[5]   Agentic Reasoning` | 공백 정리 |

### 5.4 04-3 수행 모델 정합화
- 표 헤더 5컬럼 → **4컬럼** (빈 5번째 컬럼 제거)
- 마무리 문구: "비로소 실제 운영 모델이 됩니다" → "**운영 가능한 업무 체계로 자리잡습니다**"

### 5.5 03-3 미니 시나리오 신규 추가
손해사정 심사 6요소(사건 정리 / 정책·권한 / 처리 경로 / Workflow·Writeback / HITL·감사 / 운영 학습) 박스 형태.

### 5.6 05장 익명화 (v240 연장)
- 헤더 부제목 추가: "금융 자문형 Agent 검증 사례", "산업 도메인 모델링 검증 사례"
- "Case 1 · 내부 프로젝트" → "Case 1 · 금융 자문형 Agent 검증"

### 5.7 06장 1차 보강 (5행 구조)
- 각 카드에 `핵심 AAP 영역` 행 신설
- 타깃 4 보강: "국방·보안 등" → "**국방·방산** · 망분리·기밀 등급 관리"

### 5.8 07장 MECE 안내 + Type 명칭 수정
- Lead 아래 MECE 방어 문장 추가 ("산업 분류가 아니라 AI 성숙도·기존 자산·통제 요구 수준에 따른 진입 패턴")
- Type 명칭:
  - A: "대기업·자체 AI 조직" → "**기존 AI·데이터 자산 보유 고객**"
  - B: "산업 특화 중견" → "**업무 니즈는 명확하지만 AI 기반이 약한 고객**"
  - C: "공공·금융·국방" → "**규제·통제형 고객**"

### 5.9 별첨 A 정제
- 제목: "내부 전략/방향성 제안" → "**내부 검토용 · 사업화 확장 항목**"
- 상단 안내 note: 외부 공유 시 분리 운용 권장
- 표 헤더: "내부 보강 항목" → "**내부 검토 항목 / 추후 상세화 방향**"

### 5.10 HTML 오류 일괄 수정
- `<br></b>` → `<br/>`
- 빈 `<p class="lead">` 제거
- `[5]   Agentic Reasoning` 공백 정리
- `</strong></div>p>` → `</strong></p>` (RAG 카드 본문 깨짐 복구)

### 5.11 자사 솔루션 chip 마킹 (신규 도입)

**CSS 클래스 `.ours` 도입 — 옵션 B (테두리 + 빨간 글자, 배경 없음)**

```css
.cap-chips span.ours { border:1.5px solid var(--red); background:#fff; color:var(--red); font-weight:700 }
```

**범례에 "자사 솔루션 활용" 항목 추가**

**적용 위치**

| Layer · Capability | 자사 솔루션 | 마킹된 chip |
|---|---|---|
| [3] Enterprise Data & Inputs · RAG·Knowledge Ingestion | **AI:ON-U** | OCR · Parser · Chunking · Embedding · Vector Index (5개) |
| [6] Enterprise Integration · Workflow & Approval Execution | **Antbot · AI:ON-U** | Workflow Engine · RPA (2개) |

**미적용/보류**
- beast ai · 매핑 위치 결정 대기 ([2] Business Agents 후보)
- ai:on-u의 [2] AI Agent Portal 추가 마킹 여부 결정 대기

### 5.12 06장 전면 재구성 (v0.4 후반부 핵심 작업)

**문제 진단**: 4개 카드의 메시지 깊이가 균일하지 않음. 어떤 카드는 구체 Pilot 제안서, 어떤 카드는 산업군 소개 수준.

**해결 — 5행 구조로 통일 + 카드 헤더 정제**

**라벨 재구성**
| Before | After |
|---|---|
| 고객 상황 | **고객 과제** |
| 적용 업무 영역 | **AAP 진입 업무** |
| 핵심 AAP 영역 (기술명 나열) | **핵심 적용 구조** (작동 구조 언어) |
| 기대 효과 + 1순위 Pilot | **첫 Pilot** (시나리오 2~3문장) |
| 없음 | **확장 방향** (신설) |

**카드 헤더 정제**
| Before | After |
|---|---|
| 금융·보험·자산운용 | **금융권 심사·자문 업무** |
| 공공·협회·산업단체 | **공공·산업단체** |
| 제조·유통 | **제조·유통 운영 업무** |
| 국방·방산 | **국방·방산 폐쇄망 업무** |

**핵심 적용 구조 — 기술명에서 작동 구조 언어로 전환**
| 산업 | Before (기술명) | After (작동 구조) |
|---|---|---|
| 금융 | Business Semantic · HITL · Audit · System Writeback | 사건 단위 정리 · 정책/룰 판단 · HITL 승인 · 감사 이력 |
| 공공 | Business Semantic · External Data Integration · Reporting Workflow | 산업 온톨로지 · 외부 데이터 수집 · 영향도 판단 · 통보 Workflow |
| 제조 | Enterprise Integration · Exception Control · Operational Learning | 품질·계약 기준 의미화 · 예외 처리 분기 · 시스템 반영 · 재발 학습 |
| 국방 | Trust · Private/Closed Deployment | 폐쇄망 지식 검색 · 권한 통제 · 조치 후보 제안 · 감사 이력 |

**국방 Pilot 자체 교체** (단순 RAG로 보이지 않게)
- Before: "정비·군수 매뉴얼 작성 보조 — 표준 절차 부합 초안 생성"
- After: "**정비·군수 조치 검토 보조** — 정비 이력·부품 상태·과거 조치 사례 묶음 → 조치 후보 제안 + 담당자 승인 전 실행 없음 + 감사 이력 저장"

**확장 방향 신설 (사업개발 자료 연결성 확보)**
- 금융: 손해사정 → 내부통제 → 투자 자문 → **금융권 의사결정 Pack**
- 공공: 산업단체 → 유관 협회 → 공공 정책 분석 → **공공·산업단체 정책 영향도 Pack**
- 제조: 클레임 → 구매·계약 → 공급망 리스크 → **제조 운영 Pack**
- 국방: 매뉴얼 검색 → 정비·군수 검토 → 조달·규정 영향도 → **폐쇄망 AAP Pack**

---

## 6. v250 현재 상태 요약

### 6.1 문서 메타
- **파일**: `공유용/aap_proactive_offering_v250_260522.html`
- **버전 표기**: v0.4 / v250 고도화
- **작성일**: 2026-05-22

### 6.2 섹션 구조 (8개)
1. 기업 AI 활용의 현재 위치
2. 운영 전환에서 드러나는 4가지 공백
3. 왜 지금 AAP가 필요한가
4. **AAP 통합 아키텍처와 수행 모델** (핵심 장)
5. 적용 레퍼런스
6. 산업별 적용 예시
7. 고객 유형별 진입 패턴
A. (별첨) 내부 검토용 · 사업화 확장 항목

### 6.3 04장 sub-section 구조
- **4-1** Architecture Overview · 한판 (Trust 외곽 프레임 + AAP Execution Loop 5-step inline + 피드백 환류)
- **4-2** 주요 영역 및 필요 역량 (Layer × 대표 Capability × 확장 컴포넌트, 8개 layer)
- **4-3** 수행 모델 (Define → Compose → Connect → Operate, 4단계 표)

### 6.4 06장 4개 카드 (5행 동일 구조)
- 행: 고객 과제 / AAP 진입 업무 / 핵심 적용 구조 / 첫 Pilot / 확장 방향
- 타깃 1: 금융권 심사·자문 업무 · 손해사정 심사 보조 Pilot
- 타깃 2: 공공·산업단체 · 통상규제 회원사 영향도 분석 Pilot
- 타깃 3: 제조·유통 운영 업무 · 품질 클레임 처리 보조 Pilot
- 타깃 4: 국방·방산 폐쇄망 업무 · 정비·군수 조치 검토 보조 Pilot

### 6.5 자사 솔루션 마킹 (옵션 B · 빨간 테두리 + 빨간 글자)
- [3] RAG·Knowledge Ingestion: **AI:ON-U** → OCR · Parser · Chunking · Embedding · Vector Index
- [6] Workflow & Approval Execution: **Antbot · AI:ON-U** → Workflow Engine · RPA

---

## 7. 향후 작업 (보류·결정 대기)

| 항목 | 상태 | 결정 대기 |
|---|---|---|
| beast ai 자사 솔루션 chip 매핑 | 보류 | [2] Business Agents 후보 |
| ai:on-u의 [2] AI Agent Portal 추가 마킹 | 보류 | [3]·[6] 외 추가 위치 검토 |
| 내부 전략 보고용 문서(v220 계열) v4.0 통합 | 미정 | 별도 트랙 유지 vs 통합 |
| 산업별 1순위 Pilot 후보 변경 | 자유 | 예: 금융 손해사정 외 다른 Pilot 후보 검토 |
| 외부 공유본에서 별첨 A 분리 | 권장 | 외부 미팅 시점 적용 |

---

## 8. 부록 · 파일 인덱스

### HTML 산출물 (공유용/)
- `aap_proactive_offering_v210_260521.html` — v0.2 작업본
- `aap_proactive_offering_v220_260521.html` — 내부 사업전략 v0.1
- `aap_proactive_offering_v230_260521.html` — 고객용 v0.2 재구성
- `aap_proactive_offering_v240_260521.html` — 고객용 v0.3
- **`aap_proactive_offering_v250_260522.html`** — 고객용 v0.4 (현재)

### 기획안 md (기획안 md/)
- `AAP_기획안_v1.0.md`
- `AAP_기획안_v2.0.md`
- `AAP_기획안_v3.0.md`
- **`AAP_기획안_v4.0.md`** — 본 문서
- `AAP_고객용_선제안서_v0.2_v210기반_아키텍처강화.md` — v230 작업 기준
- `AAP_내부용_사업전략_및_직책자설득_v0.1.md` — v220 작업 기준
- `AAP_v240_고도화_가이드_v250작업안.md` — v250 작업 기준
