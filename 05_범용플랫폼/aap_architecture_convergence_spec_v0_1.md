# AAP 아키텍처 수렴 스펙 v0.1 — 패치워크 → 하나의 표준

> **왜**: 3중 감사(surface/렌더·일반화·결정층) 결과 = run 뷰가 **하나의 표준이 아니라 빠른 반복으로 쌓인 평행 경로 패치워크**. 그래서 폴리시(깜빡임·속도)가 끝없이 재발했다(패치워크를 다듬어서). 이 문서가 **수렴의 표준**이다. 모든 후속 구현은 이 표준으로 수렴해야 "완료".
> **기준 정합**: 북극성 `aap_run_console_experience_spec_v0_1.md` · 하니스 다리 `aap_harness_app_bridge_n3_v0_1.md`(evaluate) · `aap_pack_contract_v2_spec.md`(flow/io) · 결정엔진 `_decision_engine/evaluate.js`.
> 적용: `05_범용플랫폼/app/`. **단일 writer 세션(app/) 몫.**

---

## 1. 표준 (THE 표준) — "계약 모델"이 정답

> **데이터(caseModel · knowledge · io)만 있으면 → 코어가 일반 렌더 → `evaluate()` 판정 → steering=`io.editable` → 재평가 → verdict + basis → HITL.**

- **계약(`contract_a`)은 이미 이 표준의 사례**: 슬롯+룰 데이터만, 판정=코어 `evaluate()`, steering→재평가, 근거=basis.
- **목표**: 채용·구매·경비·하니스 생성 팩 **전부 이 표준으로 수렴**. 도메인 추가 = *데이터만* (surface 손코딩 ✕).

---

## 2. 감사로 드러난 어긋남 5 (수렴 대상)

| # | 어긋남 | 현재 | 표준 |
|---|---|---|---|
| ① | **조작형 콘솔이 일반 렌더 ✕** | 팩마다 `surface.opstage` 손코딩(채용·계약 각자), 없으면 스트림 폴백 | **코어 일반 "데이터→콘솔" 렌더** — caseModel/knowledge/verdict/io만으로 |
| ② | **결정 메커니즘 2개** | 계약=`evaluate()` / 채용=`cutThreshold`·`mOf`·`screenVerdict` 자체 | **`evaluate(case, knowledge)` 1개** |
| ③ | **flow next ↔ verdict 미연결** | `playNext` 선형 | verdict.outcome → flow 분기(v2 §8) |
| ④ | **렌더 2패러다임 + 좀비 40%** | 조작형(부분갱신) vs 스트림(통째교체·깜빡임) + `wsProgress`/`wsTabBar`/`wsStepDetail`/`setWsTab` 사문화 | 부분갱신 1패러다임 + 좀비 제거 |
| ⑤ | **자동저작이 데이터 미생성** | `genericAuthor`가 caseModel/knowledge/surface 안 만듦 → 얕은 스트림 | 자동저작이 caseModel/knowledge 생성(하니스 어댑터 동형) |

---

## 3. 표준 콘솔 = caseModel "shape" 적응형 (① 핵심 설계)

코어 일반 렌더(`renderDataConsole`)가 **caseModel의 shape**에 따라 형태를 고른다 — 팩 surface 함수 ✕:

| shape | 예 | 렌더 |
|---|---|---|
| **single-case** | 계약·구매·경비 (한 건의 슬롯 + 판정) | 슬롯 패널 + **판정 카드(verdict+basis)** + 참조 룩업 + io.editable steering |
| **scored-list** | 채용 (점수화된 항목 N개의 랭킹) | 랭킹 리스트 + 근거 분해 막대 + io.editable(가중) steering + 매칭 그래프 |

- **공통 척추**(코어 일반): steering(`io.editable`) → `evaluate()`/compute 재실행 → **verdict/재랭킹 + basis** → FLIP/트윈 부분갱신(깜빡임 0, 북극성 §2-D) → HITL 게이트.
- 팩은 **데이터만**: `caseModel{shape, slots|items, axes?}` · `knowledge{route, lookupTables, thresholds}` · `io{inputs, editable, connectors}`. (라벨·포맷 등 표현 힌트는 caseModel 메타로, 함수 ✕)

---

## 4. 단계 (실행 순서)

### 1차 — ① 코어 일반 콘솔 + ② 채용 evaluate 통합 (표준의 핵심)
- **1a. 코어 일반 "데이터→콘솔" 렌더 (single-case shape)**: `contract_a`의 `opstage` HTML 생성 로직을 **코어 일반 렌더로 추출**(caseModel.slots + verdict + lookupTables + io.editable 소비). `contract_a`는 데이터만 남김.
  - **★증명**: bake된 **구매(`pack_procurement`)·경비(`pack_expense`)** 를 register → **surface 손코딩 0인데 조작형 결정 콘솔 자동 표출**(같은 shape). = "데이터만 넣으면 콘솔" 실증.
- **1b. scored-list shape 일반 렌더 + 채용 마이그레이션**: 채용을 `caseModel{shape:'scored-list', items, axes}` + `knowledge`(가중=thresholds·컷=route·screenVerdict=rules)로. 점수=산술(evaluate thresholds expr 확장 또는 코어 generic compute) → 판정=`evaluate()`. `cutThreshold`/`mOf`/`screenVerdict` 자체 결정론 제거. 채용 surface 손코딩 → 일반 렌더로 대체.

### 2차 — ③④⑤
- ③ `playNext` → `nextStage(verdict.outcome)` 함수형 라우팅(v2 §8). ④ 스트림 모델 표준화 or 폐기 + 좀비(`wsProgress` 등) 제거 + 렌더 1패러다임. ⑤ `genericAuthor`/`pipeline.js`가 caseModel/knowledge 생성(어댑터 동형) → 자동저작 팩도 표준 콘솔.

---

## 5. 보존·금칙
- 결정론·재현성(LLM 0)·case.overrides(P5)·HITL·자산/로그/거버넌스·삭제·Contract v2·**demo.js 안정 ID**·file://(외부 라이브러리 0·인라인 SVG)·Lucide 인라인·이모지 ✕·**신규 hex 0(가이드 토큰만)**·**1차 디자인 마감(platform-fix.css) 룩 불변**·북극성 §2-D(부분갱신·깜빡임0)·§2-A(속도·근거). **코어 도메인 무관**(팩=데이터). **회의·VOC 무회귀**(2차에서 표준 편입 전까지 스트림 유지 graceful).
- 금칙: 새 팩에 surface HTML 함수 강요(①로 제거), 결정 메커니즘 2개 유지, 통째 innerHTML 교체.

## 6. 검증 = 수렴 여부
- 1a 통과 = **구매/경비가 surface 코드 0으로 콘솔 표출**(코드로 입증: `procurement`/`expense` 팩에 opstage 함수 없음 + 콘솔 정상).
- 1b 통과 = 채용이 `evaluate()` 경로 사용(자체 `cutThreshold`/`mOf` 결정 제거), 일반 렌더로 동작.
- 무회귀 + `node --check` + 북극성 §2 박스.

---

## 7. 진행 상태 (실측)
- **1a = ✅ 완료·작동 검증(260624)**. 코어 `renderDataConsole`(+`dcSteer/dcMain/dcAside/dcVerdictCard/dcSlotPanel/dcLookups/dcSteerHook/dcWire/hasDataConsole/opstageOf`) 추가, `contract_a` 데이터화. **구매(`procurement.js`)·경비(`expense.js`) = surface 함수 0줄 데이터 팩** 신규 등록(`SEED_PACK_IDS`+index.html). 검증: node `evaluate` 22/22 시드 의도대로 분기(REJECT/LEGAL_REVIEW/AUTO_APPROVE), 헤드리스 프로브 `{opBody:true,slots:8,verdict:"검토(HITL)",basis:✓,lookups:4,steerBtns:12,hitlBar:true}` — 구매 케이스가 코어 일반 콘솔로 풀 표출. 테스트 하니스 `app/_dctest.html`.
- **1b = ✅ 결정 통합 완료·검증(260624)**. 핵심 어긋남 ②(결정 메커니즘 2개) 해소: 채용 `screenVerdict`가 자체 부등식 → **코어 `evaluate(SCREEN_ROUTE)` 라우팅**(통과/보류/탈락 = AUTO_APPROVE/LEGAL_REVIEW/REJECT 매핑). 채용에 `caseModel{shape:'scored-list', items, axes, scoreKey:'match'}`+`knowledge{route:SCREEN_ROUTE, weights, thresholds}` 추가(표준 정합). 코어 `evalCase`에 scored-list 가드(단일케이스 판정 skip — 항목별 evaluate). **점수 산술(`mOf`)·steering 임계(`cutThreshold`)는 결정이 아니라 도메인 연산/조종 → 유지**(어긋남 ②는 "결정"의 이중화였고, 그 결정만 evaluate로 통합). 검증: 10후보 evaluate 판정이 원본과 **100% 동일**(경계값 90/84/82/80/75/65 포함), recruiting ATS surface 무회귀(opBody·후보·bodyLen 19K), contract_a 단일케이스 evaluate 정상(AUTO_APPROVE), meeting/voc graceful, `node --check` OK.
  - **의도적 보류(2차로)**: 채용 surface 손코딩 → **generic scored-list 렌더 교체**. 이유=채용 surface는 단일 결정 콘솔이 아니라 다단계 리치(스크리닝·면접·오퍼·파이프라인 board·매칭그래프)라, 통째 generic 교체는 showcase 회귀 위험이 큼. caseModel/knowledge는 이미 데이터로 준비됨 → 2차에서 generic scored-list 렌더를 **스크리닝/매칭 단계에 우선 적용**, 면접·오퍼는 점진. 결정 통합(②)이 "같은 표준"의 본질이고 이미 달성.
- **채용 경험 레이어 수정 완료(260624)** — 사용자 실사용 피드백("첫 화면부터 이상·요건분석 안 보이고 게이트 직행·모달 닫기 없음·전체 문제 많음")을 재현·수정. **(코어, 도메인 무관)**: ① 게이트 HITL 모달이 `baseOnly` 존중(`currentCM` line 1730 `!STATE.baseOnly`) → 진입 즉시 모달 갇힘 해소·닫기 동작 ② 모든 게이트 모달 공통 닫기 ×(`renderCModal` 주입) ③ `renderRunAction` await = 클릭 가능 "결정하기"(`openGate`: baseOnly 해제→모달 재open). 모든 명시 경로(stream 게이트 카드 `gotoGate`→`setSel`→`runStep`, autoplay)는 baseOnly=false라 모달 정상. **(채용 팩)**: ④ showcase 시드 `atStep` 게이트→`intake`(접수→요건분석→실행구조 자동 재생 ~2.3초/단계 후 게이트) ⑤ **렌더 패러다임 통일(④ 부분 달성)** — intake·analyze·record가 stream 폴백이었던 것을 `opKind='info'`+`opInfoMain/opInfoAside`로 op-console 프레임에 편입(그 단계 ops를 구성요소·feed→out·detail 카드로), `opStages`=전체 9단계 strip → **단계마다 stream↔보드 점프 제거**(전 단계 동일 프레임, 메인만 모핑). SCHEMA_VER 6→7(시드 재적용). 검증(헤드리스): 진입 modal:false·닫기 X 동작·재open·intake/analyze op-console 렌더(strip 9)·proc/contract/meeting/voc 무회귀. **교훈: "검증 OK"라 했지만 사용자처럼 플로우를 끝까지 안 돌려봐 모달·진입·패러다임 문제를 놓침 — 결정/로드만 본 검증은 불완전. 실제 진입→진행→게이트→닫기→재open 전 구간을 헤드리스 프로브로 봐야 함.**
- **2차 = 대기**(③ flow next↔verdict, ④ 잔여=좀비 제거 + generic scored-list 렌더(채용 surface는 통일됐으나 contract식 데이터 구동은 아직), ⑤ 자동저작 데이터 생성). 회의·VOC는 여전히 stream(graceful) — 표준 편입은 후속.

---

## 8. 팩 표준 적합도 대장 (audit_track 자동 산출)

> **왜**: '기존' 팩을 일괄 재작성하지 않고 **상태로 관리**한다. 신규=머지 게이트에서 A 강제(팩 스펙 v0.2 §8.1 체크리스트), 기존=등급 기록 + 기회주의적 승급. 이 표는 `_decision_engine/audit_track.js`(검사 G)가 `app/packs/*.js`를 스캔해 **자동 갱신**한다 — 코드=SSOT, 이 표=사람이 읽는 뷰. 수기 편집 ✕(아래 마커 사이는 스크립트가 덮어씀).
>
> **등급**: **A 수렴**=전용 surface 없음 + caseModel + knowledge.route(코어 일반 콘솔로 표출) · **B 부분**=결정은 표준(caseModel+route)이나 전용 surface 잔존 · **C 미수렴**=caseModel/route 없음(구 stream/surfaceSpec).
>
> **두 트랙(처방이 반대)**: A등급은 데이터가 이미 맞으니 **공유 렌더러(`renderDataConsole`) 품질**만 올리면 동시 개선(트랙 A) · B·C등급은 **수렴 마이그레이션**(트랙 B, 백로그·점진).

<!-- LEDGER:START (audit_track.js 검사 G 가 덮어씀 · 수기 편집 ✕) -->
| 팩 | 줄수 | 전용 surface | caseModel+route | 적합도 | 트랙 |
|---|---|---|---|---|---|
| procurement | 242 | × | ○ | **A** 수렴 | A · 공유 렌더러 폴리시 |
| expense | 226 | × | ○ | **A** 수렴 | A · 공유 렌더러 폴리시 |
| contract_a | 473 | × | ○ | **A** 수렴 | A · 공유 렌더러 폴리시 |
| recruiting | 1420 | ○ | ○ | **B** 부분 | B · 수렴 마이그레이션 |
| meeting | 344 | × | × | **C** 미수렴 | B · 수렴 마이그레이션 |
| voc | 263 | × | × | **C** 미수렴 | B · 수렴 마이그레이션 |

_audit_track.js 검사 G 자동 산출 · 갱신 260624_
<!-- LEDGER:END -->

**관리 규칙**
- **신규**: 머지 전 `audit_track` 검사 G 가 A 가 아니면 minor 경고(리치 팩은 §5.3 surface 허용 예외 — 사유를 팩 헤더 주석에 명시). 디자인 토큰은 `normalizePack()`/`DC` 가 load 시 강제(별도).
- **기존**: 등급을 본 대장에 자동 기록. 승급은 건드릴 일 있을 때 한 등급씩(일괄 ✕). recruiting(B)은 **트랙 A 후 재판단**(generic scored-list 가 리치 surface 대체 가능한지 실측 → §5.3 예외 인정 vs 수렴 2차).
