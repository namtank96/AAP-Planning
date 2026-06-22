# AAP 회의 데모 병합 설계도 (정합표) v0.1

> 목적: `aap_meeting_runtime_explainer_v0_17.html`(구조·계층 렌즈)와 `Agentic_AI_회의_오케스트레이션.html`(라이브 작동 렌즈)을 **정합적으로 합치기 위한 단일 설계도**. 코드 진입 전 기준 문서.
> 원칙: **표준 spine(도메인 무관)** 과 **회의 유형 Pack** 을 분리한다. spine은 선제안서 4-3(표준 운영 객체)·별첨 A-7과 동일 어휘를 쓴다.
>
> **확정 결정 (260618)**: ① 케이스 = **가상 시나리오 "한국무역협회 차세대 AX 무역플랫폼 구축사업"** 맥락의 회의 업무로 통일(주최·참석자는 KT ds 내부, 현대영 책임 / 무역협회는 그 사업의 가상 고객). flagship 회의 = 그 제안서를 준비하는 내부 회의. ② **기본 틀 = v0.17**(vanilla CSS·WORK[]·계층 태깅 그대로 계승). **Tailwind 오케스트레이션 건은 호스트 ✕ → 벤치마킹 소스**(시각화·구체성에서 잘 된 부분만 v0.17 관용구로 **재구현**, 그대로 복사 ✕). ③ **회의 도메인 집중 — 산업 placeholder(claim/control/voc/quality) 삭제**. 표준화는 **같은 가상 시나리오 안에서 회의 상황 교체**(제안 준비 / 주간 점검 / 킥오프)로 시연.

---

## ★ 설계 북극성 — AAP의 본질 (모든 화면이 이걸 증명해야)

> **AAP는 Agent를 많이 띄우는 시스템이 아니다.** 업무 구조를 분석해 실행 경로를 구성하고, Agent·모듈·Connector·정책을 조합하며, 변경을 흡수하고, 자동/확인/차단으로 사람 부담을 줄이고, 충돌을 조율하며, 거버넌스와 범용 Pack을 갖춘 **플랫폼**이다.

| 본질 명제 | 데모에서 보여줄 장면 (어디서) |
|---|---|
| Agent 많이 띄우기 ✕ | 방사형 맵을 "Agent 자랑"으로 쓰지 않음 — **Master가 구조를 분석→경로 구성**하는 과정이 주인공 |
| 업무 구조 분석 → 실행 경로 구성 | 업무 이해(Work Event)→계획(Task Graph): 무엇을·왜·어떤 순서로 (v0.17 explain + 오케 ②③) |
| Agent·모듈·Connector·정책 **조합** | op 단위로 L#·컴포넌트·Connector(메일/캘린더/DB)·정책을 **조합해 점등** (v0.17 ops 매핑) |
| 변경 흡수 | HITL 결정·입력 편집 → **후속 단계 재계획·재검증**(carry-over 전파) (v0.16 carry + 오케 편집/재실행) |
| 자동/확인/차단으로 사람 부담↓ | Coordination Result 3분기(자동·확인·차단) + 책임 지점만 HITL (v0.17 check 단계) |
| 충돌 조율 | 일정 충돌·정책 위반·민감자료를 Supervisor가 조율 (오케 보안 Agent 상시 + verify) |
| 거버넌스 | 보안·컴플라이언스 Agent **횡단 상시** + Trust Foundation(L7·L8) (오케 security 벤치마킹) |
| 범용 Pack | spine 위에서 회의 상황 Pack 교체(§5) — "공통 Runtime + Pack 교체" |

---

## 0. 두 소스의 역할 분담 (확정)

| | v0.17 explainer | 오케스트레이션 |
|---|---|---|
| 렌즈 | **구조·계층** (어느 AAP 계층이 일하나) | **작동·실연** (Agent들이 실제로 어떻게 도나) |
| 역할 | **기본 틀(호스트)** — 그대로 계승 | **벤치마킹 소스** — 좋은 부분만 재구현(복사 ✕) |
| 가져올 것 | AAP 8계층·추론루프·kt ds 자산 **태깅**, 좌우 동기 점등 레이아웃, vanilla CSS, 운영객체 seam | 방사형 오케스트레이션 맵·실시간 로그·열리는 산출물·편집/시나리오·보안 Agent·HITL 상호작용 |
| 버릴 것 | (없음 — 기본 틀로 유지) | **Tailwind CDN 의존**(§6, vanilla로 재구현) |

**병합 핵심 다리**: 오케스트레이션의 살아있는 Agent/로그/산출물에 v0.17의 `L#·추론루프·자산 배지`를 입힌다 → "범용 Agentic AI"가 "**AAP 플랫폼이 실제로 도는 장면**"이 된다.

---

## 1. 표준 spine vs 회의 유형 Pack 분리

표준화 축 = **산업 교체 ✕ → 회의 유형 교체 ○**. 같은 spine 위에서 회의 유형(제안/주간/킥오프)만 바뀐다.

| 구분 | 내용 | 비고 |
|---|---|---|
| **표준 spine (도메인 무관·유지)** | ① AAP 8계층(L1~L8) ② 추론 루프(Data·Semantic·Reasoning·Decision·Action·Learning) ③ 표준 운영 객체 10종(§3) ④ 표준 Agent 역할군 9종(§2 좌열) ⑤ HITL 정책 모델(§4) | **선제안서 4-3 / A-7과 동일 어휘** |
| **회의 도메인 (구체)** | 구체 Agent 18종(§2)·산출물 13종·그룹웨어/회의실 데이터·12 WORK 단계 | 회의만 완성 |
| **회의 상황 Pack (표준화 시연 축)** | 같은 가상 시나리오 안에서 회의 상황 교체: 제안 준비(**flagship**) / 주간 점검 / 킥오프 — 같은 spine, pack만 교체 | §5. 이게 "공통 Runtime 유지 + Pack 교체"의 **실제 증거** |
| ~~산업 Domain Pack~~ | ~~claim/control/voc/quality placeholder~~ | **삭제** (가짜 교체축 금지) |

> 코드 구조: `SPINE`(역할군·계층·운영객체·HITL) + `MEETING`(구체 Agent·산출물·12단계) + `SCENARIOS`(proposal/weekly/kickoff). **산업 `DOMAIN_PACKS` 딕셔너리는 만들지 않음.**
> 단, spine/pack 분리 자체는 유지 → "같은 메커니즘으로 산업 교체도 가능"은 **선제안서 4-3와 정합하는 원칙(말·구조)으로만** 남기고 이번 데모엔 미구현. 화이트박스(v0.2/v0.3)의 운영객체 seam은 **회의 유형 교체 용도로** 복구해 v0.17 위에 얹는다.

---

## 2. 통합 Agent × AAP 계층 레지스트리 (핵심)

오케스트레이션 18 Agent + Master를 **표준 역할군**에 묶고, v0.17의 계층 태깅을 부여.

| 구체 Agent (회의 Pack) | 표준 역할군 (spine) | 주 계층 | 보조 계층 | kt ds 자산 | 산출 운영객체 |
|---|---|---|---|---|---|
| **Master Agent** | Supervisor / Orchestrator | L3 | 전 계층 조율 | — | Task Graph · Coordination Result |
| 자료 수집(research, RAG) | Context Agent | L5 | L4 | AI:ON-U(OCR) | Context Package |
| 참석자 추천(attendee) | Domain Agent | L4 | L5·L3·L6 | Antbot(충족도) | Candidate Set |
| 일정 조율(sched) | Action-Plan Agent | L3 | L5·L6 | — | Candidate Set → Execution |
| 회의실 예약(room) | Action Agent | L5 | L3 | — | Action Result |
| 안건 작성(agenda) | Domain Agent | L4 | L3 | — | Agenda Draft |
| 분석(analysis) | Evidence/Eval Agent | L6 | L3 | Antbot | Insight |
| 발표자료(slides) | Action(생성) Agent | L3 | L4 | — | Action Result |
| 제안서 작성(proposal) | Action(생성) Agent | L3 | L4·L2 | — | Action Result(문서) |
| 바이브 코딩(vibe) | Build Agent | L2 | L3 | — | Action Result(시제품) |
| 녹취·STT(stt) | Data Agent | L5 | — | — | Raw Meeting Record |
| 통역·번역(translate) | Domain Agent | L4 | L3 | — | — |
| 회의록 작성(minutes) | Domain+Action Agent | L4 | L5·L3 | — | Official Minutes |
| 액션아이템(action) | Action Agent | L3 | L4 | — | Action Item Set |
| 후속관리(followup) | Action Agent | L3 | L8 | — | Action Result |
| 알림·전달(notify) | Writeback Agent | L3 | L1·L8 | — | Action Result |
| KMS 기록(kms) | Writeback Agent | L8 | L4 | — | Run Trace |
| **보안·컴플라이언스(security)** | **Policy/Governance (횡단·상시)** | L7 | L8 | — | Guardrail / Decision |
| 품질 검증(verify) | Review/Eval Agent | L6 | — | Antbot | Evaluation |
| 지식 자산화(learn) | Learning Agent | L7 | L4 | Self-Improving | Skill Update |

> 표준 역할군 9종 = Supervisor · Context · Domain · Evidence · Policy · Action · Review/Writeback · Learning (+ Build). 산업이 바뀌면 **역할군은 유지·구체 Agent만 교체**(손해사정: research→청구/약관 수집, attendee→과실 판단 등).

---

## 3. 표준 운영 객체 모델 ↔ 단계 매핑 (spine)

선제안서 4-3과 동일 10객체. 회의 단계가 객체를 생성하는 순서:

| 운영 객체 (spine) | 생성 단계(회의) | 산출 Agent |
|---|---|---|
| Work Event (업무 사건) | 업무 이해 | Master(의미화) |
| Context Package (맥락 묶음) | 자료 확인 | research |
| Task Graph (작업 그래프) | 계획 수립 | Master |
| Candidate Set (후보군) | 참석자·일정·안건 | attendee·sched·agenda |
| Coordination Result (조율 결과) | 확인 항목(분기) | Master + security + verify |
| Execution Package (실행 패키지) | HITL① 계획 승인 직전 | Master |
| Human Review Decision | HITL①·②·③ | (사람) |
| Action Result (실행 결과) | 시스템 반영·공유·기록 | writeback군(notify·kms·room…) |
| Run Trace (실행 이력) | 전 구간 누적 | kms·로그 |
| Skill Update (운영 스킬) | 재사용 | learn |

---

## 4. HITL 관문 통합 모델

오케스트레이션 3관문 + v0.17 인라인 게이트를 **3 유형 + 산출물 확정**으로 통일.

| 유형 | 트리거 | 회의 적용 지점 | 책임 성격 |
|---|---|---|---|
| **HITL① 계획 승인** | 실행 전 | 참석자·자료·**시각 선택**·계획 승인/수정 | 구성·자원 결정 |
| **HITL② 진행 통제** | 회의 진행 | "회의 시작/종료" 신호 → 실시간 Agent(STT·통역·회의록) 가동/정지 | 실행 시점 통제 |
| **HITL③ 최종 실행 승인** | 외부/되돌리기 어려운 행동 직전 | 메일 발송·외부 공유·KMS 기록 (보안 Agent 검수 후) | 대외 책임 |
| (보조) 산출물 확정 | 산출물 생성 후 | 회의록 확정·자료 마스킹 제외 | 기록 책임 |

> v0.17의 인라인 게이트(외부초대·공유·발송·회의록확정)는 위 3유형 중 하나에 흡수. HITL 결정은 **후속 단계로 전파**(v0.16 carry-over) — 예: 외부초대 제외 → 발송 단계 "제외됨".

---

## 5. 시나리오 세트 (= 표준화 시연 축)

**가상 시나리오 = "한국무역협회 차세대 AX 무역플랫폼 구축사업"**(가상 고객·사업). 이 한 맥락 안에서 **회의 상황만 교체**하며 같은 spine이 도는 걸 보여줌. 주최·참석자는 KT ds 내부(현대영 책임 외).

| 회의 상황 | 트리거 | 강조점 |
|---|---|---|
| **★ 제안 준비 회의 (flagship)** | 사람 요청("무역협회 사업 제안서 작성 회의 잡아줘") | 전체 8단계 + 제안서 초안·바이브코딩 시제품. 표준화 시연 주 무대 |
| 주간 점검 회의 | ⏰ 자동 트리거(매주 월 09:00) | 지난주 기록 자동 로드·가벼운 HITL·**자동화/학습** |
| 킥오프 회의 | 사람 요청(수주 후 narrative 연결 가능) | 전부서 매트릭스·범위/리스크 분석·프로젝트 헌장·R&R |

> **표준화 메시지**: "같은 AAP Runtime spine이 **회의 상황만 바꿔 끼우면** 제안 준비·주간 점검·킥오프를 모두 처리한다"(전처리 분석 PDF Part 6 회의 유형별 Skill Library + 선제안서 4-3 "같은 운영 구조, 다른 업무"). 산업 교체는 미구현(원칙으로만).
> 코드 키는 중립적으로(`prep`/`weekly`/`kickoff` 등) — "proposal=회의 유형"이라는 오해 방지.

---

## 6. 화면·기술 베이스 결정

**기본 틀 = v0.17 그대로 계승** (호스트). vanilla CSS·자족적 단일 HTML·`WORK[]` 데이터 모델·op별 `L#·comp·micro·asset·agent·a2a` 계층 태깅·좌(업무 드릴다운+agentic 콘솔)/우(AAP 작동 구조 동기 점등)/하단 구조를 유지한다. **Tailwind는 안 씀** (산출물 규약 "외부 라이브러리 0" + Play CDN 인터넷 필요 → 폐쇄망 시연 불가 + 프로덕션 비권장).

**오케스트레이션 = 벤치마킹 소스** (그대로 복사 ✕, 좋은 부분만 v0.17 관용구로 재구현):

| 오케에서 벤치마킹할 강점 | v0.17에 녹이는 방식 |
|---|---|
| 방사형 **오케스트레이션 맵**(Master 중심·토큰 이동·A2A 선) | v0.17 우측/콘솔에 **Master→Agent 디스패치·A2A 핸드오프 시각**으로 재구현(단, "Agent 자랑" ✕ 경로 구성이 주인공) |
| **실시간 동작 로그**(4레이어: Master→근거→가동→데이터동작→응답) | v0.17 콘솔 피드를 **로그 스트림 감**으로 강화 + 각 줄에 L# 태깅 |
| **열리는 구체 산출물**(초대장·회의록·슬라이드·**바이브코딩 시제품** 모달) | v0.17 결과를 **클릭 시 제품형 모달**로(이미 v0.17에 `modal` seam 있음 → 확장) |
| **편집 가능 입력 + 재실행**(그룹웨어 500명·회의실·자료) | v0.17에 **입력 편집→재계획/재검증**(변경 흡수 시연) 추가 |
| **시나리오 전환**(제안 준비/주간/킥오프) | v0.17 상단에 시나리오 셀렉터, `SCENARIOS` 데이터로 |
| **보안·컴플라이언스 Agent 상시 모니터링** | Trust Foundation 횡단 + 발송 전 검수 게이트로 재현(거버넌스 본질 §북극성) |

> 레이아웃은 어차피 재저작 → 오케 시각요소를 vanilla CSS로 옮기는 비용은 감수. v0.17이 이미 vanilla로 동급 품질 증명.

---

## 7. 확정 결정 (260618)

1. ✅ **케이스 통일** → 가상 시나리오 "한국무역협회 차세대 AX 무역플랫폼 구축사업" 맥락의 회의 업무(KT ds 내부, 현대영 책임 / 무역협회=가상 고객). flagship=제안 준비 회의. v0.17의 대한제조 킥오프는 폐기.
2. ✅ **기본 틀 = v0.17** (vanilla CSS·WORK[]·계층 태깅 호스트). 오케스트레이션은 **벤치마킹 소스**일 뿐(§6) — 잘 된 시각화·구체성만 v0.17 관용구로 재구현, 그대로 복사 ✕. Tailwind 미사용.
3. ✅ **표준화 깊이** → 회의 도메인 집중. **산업 placeholder(claim/control/voc/quality) 삭제.** 표준화는 회의 유형 교체(제안/주간/킥오프)로 시연, 무역협회 제안이 flagship. 산업 교체는 원칙으로만 남김(미구현).

---

## 8. 다음 단계

이 설계도 승인 → 통합 데이터 모델(`SPINE` + `DOMAIN_PACKS.meeting`) 작성 → v0.17 셸 위에 라이브 맵/로그/산출물 그래프트(vanilla CSS) → 계층 배지·HITL 통일 → 검증.
