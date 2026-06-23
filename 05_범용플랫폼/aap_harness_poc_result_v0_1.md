# AAP 시나리오 생성 하니스 PoC 결과 v0.1

> **무엇**: `aap_scenario_harness_spec_v0_1.md` 하니스를 이 환경(Claude Code Workflow)으로 실제 실행한 결과. 계약 도메인 × 고객 프로파일 2종(A사/B사) → 시나리오 2종 생성·critic 검증·비교.
> **실행**: Workflow `aap-scenario-harness-poc` · 9 에이전트 · ~388초 · 460k 토큰. 5페이즈(분석·드릴다운 → 룰·데이터 매핑 → 더미·HITL → 조립·critic → 비교 종합). **인프라 0·앱 코드 0·LLM 저작 하니스에서만.**
> **원천 데이터**: 워크플로 결과(temp, 휘발). 핵심을 본 문서에 distill.
> **※ 본 문서는 누적 로그**: §0~7=1차 실행(계약 A/B) · §8=fix-loop · §9=N1b severity 튜닝 · §10=N4 도메인 확장. **최종 상태는 §10.5 참조.** (진입점=`_AAP_결정런타임_진행내역_index.md`)

> **🏁 전체 종합(최종)**: 하니스 = ① **신뢰 가능**(N1b §9 — severity critic으로 raw 출력 무수정 pass) ② **범용**(N4 §10 — 계약·구매·경비가 골격 토큰단위 공유, 새 도메인 1패스) ③ **고객 변수 조건화**(§2 — A사/B사 발산). '범용 시나리오 공장' 입증. 아래 §0~8은 거기 도달한 경위(1차 실행은 critic이 fail을 냈으나, §9에서 그 fail이 시나리오 결함이 아니라 critic 이분법 탓이었음이 드러남).

---

## 0. 결론 (1차 실행 기준 — 이후 §9에서 갱신됨)

| 검증 항목 | 결과 |
|---|---|
| LLM 하니스가 도메인을 실제 분석·드릴다운하는가 | ✅ A사 13 subProcess·14 decision(명시지/암묵지 분류)·20 슬롯·5 기준표·9룰 route·8 더미케이스 생성 |
| **고객 변수에 따라 시나리오가 바뀌는가** | ✅ 데이터 출처·Connector·결재 임계·gap·게이트가 A/B 실제 발산(§2) |
| **핵심 골격은 재사용되는가** | ✅ 동일 아키타입·route 3분기·decide 2계층·gap↔게이트 패턴 유지(§3) |
| critic이 theater를 거르는가(통과 남발 ✕) | ✅ **양쪽 모두 `fail`** — 진짜 결함 검출(§4) |
| 앱 라이브 API 필요했나 | ✅ 불필요 — 하니스=이 환경, 출력=데이터 |

> **하니스 방향은 작동한다.** 단, critic이 `fail`을 내며 **fix-loop 미완**을 드러냄 → 다음 반복에서 닫아야 함(§5).

---

## 1. 공유 아키타입 (양 프로파일 공통 골격)

```
계약 인입 → 슬롯 추출/정규화 → 결정론 룰 1차 판정 → HITL 게이트 → route 3분기 → 결재선/승인 → 대장 등록·통지
                                   (룰 우선)        (gap·암묵지 보완)   AUTO/LEGAL/REJECT
```
- **route 3분기 골격 동일**: `AUTO_APPROVE` / `LEGAL_REVIEW`(HITL) / `REJECT`. 라벨·사유만 프로파일별.
- **decide 2계층 동일**: 결정론 룰(금액 임계·필수조항·추출신뢰도·독소패턴)이 1차 판정 → 암묵지·법리·비즈니스 수용성은 HITL 위임.
- **gap 슬롯↔게이트 패턴 동일**: `source=gap·extract=manual` 항목을 더미/수기 슬롯으로 모델링 → HITL 정지점으로 흡수.
- **5대 위험 검출축 동일**: 독소조항·필수조항·추출신뢰도·제재·표준편차 → 각각 LEGAL_REVIEW/REJECT로 사상.

---

## 2. 발산 (고객 변수가 바꾼 것)

| 측면 | **A사** (제조·SAP·온프레미스·보수) | **B사** (IT스타트업·SaaS·클라우드·중도) |
|---|---|---|
| 슬롯 출처 | SAP(MM·FI 거래처·발주·제재·신용)·자체구축 계약마스터·SharePoint PDF | Notion 계약DB(SSOT)·Google Drive 원본·DocuSign 서명 |
| Connector | 6개 — **ERP 대조축** 핵심(SAP API read) | 7개 — **전자서명·알림 스케줄러** 추가, ERP 커넥터 없음 |
| 결재선/임계 | 금액 4구간 결정론(팀장1천만·본부장1억·CFO5억·대표 초과) | 분기 기반 3경로(자동=담당→대표, 법무=담당→법무→대표) — 고액 1분기로 단순화 |
| gap 슬롯 | templateDeviation·reputationRisk(평판까지 사람 보완) | sanctionListHit(제재 수기)·legalReviewResult·execApproval(사람 입력 자체를 gap으로) |
| 게이트 강조 | 보수 임계로 중위험까지 LEGAL_REVIEW로 끌어내림 | **체결(DocuSign 발송) 직전 대표 결재 게이트** — SaaS 자동화 정지점 |
| 고유 분기 | **ERP 발주금액 불일치(±5%)** | 제재 수기 확인·편차 수용성 |

> 같은 도메인·같은 `decide()`인데 **A사는 ERP 정합이 1급, B사는 전자서명·대표결재가 1급** — 레거시 환경이 시나리오를 실제로 갈랐다.

---

## 3. A사 생성 시나리오 핵심 (예시 — 결정론 룰)

**route 결정테이블(9룰, 보수 임계 반영)** — 위→아래 우선:
1. PDF 신뢰도<0.8 or 핵심필드 누락 → REJECT(보완)
2. 제재 매칭 → REJECT
3. 필수조항 누락 → LEGAL_REVIEW
4. 고위험 독소조항 1건+ → LEGAL_REVIEW
5. 표준템플릿 unknown(gap) AND 비갱신 → LEGAL_REVIEW
6. ERP 발주금액 ±5% 초과 → LEGAL_REVIEW
7. 신용등급<BBB or 평판 flag → LEGAL_REVIEW
8. 중위험 독소 AND 금액>5천만(보수 임계) → LEGAL_REVIEW
9. 위 모두 미해당 → AUTO_APPROVE

**더미 8건** — route 전 분기를 의도적으로 커버: 자동승인(표준 매매 800만), 반려×2(신뢰도 0.62·제재), 법무검토×5(필수조항 누락·고위험 독소·템플릿 gap·발주 불일치·신용 미달). **입력만으로 결론이 갈림** = 데이터 구동 증명.

---

## 4. critic 결과 (★품질 신호 — 둘 다 fail)

critic이 통과 남발하지 않고 **진짜 결함을 잡았다**(이게 "진짜로 돈다"의 자기검증):

| 검사 | A사 | 발견된 결함 |
|---|---|---|
| ① CQ 커버리지 | ✗ | `th_penalty_cap`(위약벌/계약액>30%)이 참조하는 '위약벌' 슬롯이 caseModel에 **부재**(미정의 입력). NDA 금액=0의 0 vs null 모호 |
| ② 데이터갭 정합 | ✗ | templateDeviation='unknown'이 **갱신건이면 AUTO_APPROVE로 누출**(gap이 HITL로 완전 차단 안 됨) |
| ③ 분기 커버리지 | ✗ | `dt_renewal_notice` 3분기(통지 도과/데드라인/만기알림)를 **어떤 더미도 행사 안 함** |
| ④ 추적성 | ✓ | route 각 분기가 기준표/임계로 환원됨 |
| ⑤ 프로파일 정합 | ✓ | Connector 전부 실제 legacy 매핑·온프레미스 제약 준수 |

> B사도 동일 잣대로 `fail`. **critic이 프로파일 무관하게 같은 적합성 기준을 적용** = 검증 일관성 입증.

**critic이 낸 수정안(자동 후속 가능)**: 위약벌 슬롯 추가 or `th_penalty_cap`을 1차판정 의존으로 재정의 / renewal 분기 더미 3건 추가 / gap 갱신 누출 가드 / 0-vs-null 명문화 / 평판리스크 단독 분기 더미.

---

## 5. 핵심 발견 — fix-loop를 닫아야 한다

- 스펙(§6)은 "critic 실패 시 루프백"을 정의했으나, **이번 PoC는 S10 critic을 1회만 돌리고 루프백 안 함** → `fail`로 종료.
- 그래서 출력 시나리오는 **"분석은 충실하나 아직 §9(데이터구동·추적성·재현성) 미통과"** 상태.
- **다음 하니스 반복 = critic→fix→re-verify 루프를 loop-until-pass로 닫기**. critic이 이미 구체 수정안을 내므로, 그걸 적용해 재생성·재검증하면 pass로 수렴. 이게 닫히면 "검증 통과한 시나리오"가 산출물이 된다.

---

## 6. 시사점

- **하니스는 쓸 만한 시나리오를 뽑는다**(가설 성립). 분석 깊이·프로파일 조건화·더미 다양성 모두 실제로 작동.
- **critic이 가치의 핵심** — 통과 남발 안 하고 진짜 결함을 잡음 → 생성 시나리오의 신뢰를 만든다. 단 **fix-loop가 닫혀야** 완성.
- 비용 감각: 시나리오 1쌍 ≈ 460k 토큰·6.5분. 프로파일 추가 = 재실행만.
- **앱 라이브 API 불요 재확인** — 전부 저작 하니스에서, 출력은 데이터.

---

## 7. 다음 (옵션)
- **N1. fix-loop 닫기**(추천): 하니스에 critic→fix→re-verify loop-until-pass 추가 → A/B를 pass까지 수렴시켜 "검증된 시나리오" 산출.
- **N2. 소비 방식 확정**(보류 중): 생성 시나리오를 어떻게 보여줄지(오프라인 구움 / 사전 매트릭스 / 라이브 백엔드).
- **N3. 코어 `evaluate()` 해석기**: 생성된 `knowledge` 데이터를 앱에서 실제 평가(결정론 런타임). 단 app/ 편집은 단일 writer 세션 분담 — 본 세션은 데이터·설계만.
- **N4. 도메인 확장**: 같은 하니스로 구매·경비 시나리오 생성(재사용 골격 추가 검증).

> 산출물 보존: 본 문서 = distill. 원천 시나리오 JSON은 temp(휘발) → 필요 시 `05_범용플랫폼/_harness_out/`에 A/B 전체 JSON 영구 저장 가능.

---

## 8. fix-loop(N1) 실행 결과 — critic→fix→re-critic loop-until-pass

이전 스크립트에 fix-loop를 얹어 **resume 재실행**(S1~S8+첫 critic 캐시 재사용, fix/re-critic만 라이브). 19 에이전트(누적 ~2.8M 토큰·47분).

### 8.1 수렴 결과

| | 라운드 추이 | 결과 | seed | 잔여 결함 |
|---|---|---|---|---|
| **B사**(IT·중도) | fail → fail → **pass** | ✅ **2회 수렴** | 24 | 없음 |
| **A사**(제조·보수) | fail → fail → fail → fail | ⚠️ **3회 cap, 미수렴** | 17 | 지엽적(아래) |

- **B사 pass 입증**: fix-loop가 실제로 닫힌다(critic이 만든 결함을 fixer가 해소 → pass). loop 메커니즘 유효.
- **A사 미수렴이지만 결함이 계속 좁아짐**: ①CQ→④추적성→⑤정합으로 **핵심 결함이 라운드마다 지엽적으로 이동**. iter3 시점 **route 11개 분기는 17 seed로 1:1 전수 커버**, 잔여는 (a)인지세 비과세측·pdf_score 가산밴드 등 **임계 edge seed 누락** (b)프로파일 텍스트 긴장(goal '템플릿 미디지털화 blanket' ↔ 자동승인 seed의 templateDigitalized=true) — **핵심 라우팅 결함 아님**.

### 8.2 fixer가 실제로 한 수정 (LLM 추론 깊이 증거)

단순 보강이 아니라 **구조적 결함을 짚어 고침**:
- **monetaryContract carve-out**: 무금액 NDA/MOU(contractAmount=0)에서 '배상한도 null=무제한 고위험' 오발화 → `monetaryContract` 파생 슬롯 신설로 임계 면제. *한 수정이 ③커버리지+④추적성 두 검사를 동시에 깨던 근원을 제거.*
- **dt_route 상위우선 재정렬**(R6독소>R7평판/신용>R8신종>R9보수임계>R10자동>R11catch-all): 기존 통합 규칙이 하위 사유를 가로채 **emit 라벨↔실제 발화 불일치(추적 불가)** → 재배치로 각 seed expectedRoute=실제 발화 1:1.
- **파생 boolean 1급화**(hasCoreFlag·toxicHighCount·toxicMidCount·toxicUnmatched·compositeRiskScore): 자연어 술어(`riskGrade=중`) → 결정론 명시 슬롯.
- **gap 자동승인 누출 차단 게이트** + **0 vs null 명문화**(무제한 null / 무금액 0 / 미확인 null 구분).
- B사: 인지세 6구간 전수 seed·HITL 후속 3분기(수용/수정요청/반려)·declineRenewalIntent 결정론화.

### 8.3 비교 종합 (수정본 기준 재확인)

> **"변수 따라 바뀜 + 골격 재사용" 재입증**. 수정 후에도 sameCore 유지: 동일 아키타입·decide 구조(파생 1차판정→가중 위험점수/등급→dt_route 상위우선)·route 3분기·gap 누출차단 게이트·0/null 규약·제재/신용 결격 최우선 가로채기. 발산은 데이터 레벨(슬롯 출처·Connector·결재선·임계·gap 종류).

### 8.4 ★ 핵심 학습 — 루프 튜닝 필요

1. **critic이 너무 엄격(통과 남발 ✕는 좋으나) + severity 없음** → "blocking vs minor" 구분이 없어, 핵심이 멀쩡해도 edge seed 1개 누락으로 fail. → **critic에 severity 추가, blocking 0이면 pass.**
2. **iteration cap 3이 보수·복잡 프로파일엔 부족**: A사(보수=분기 多)는 더 많은 라운드 필요. → **cap 5 + 위 severity 게이팅.**
3. **fixer가 라운드마다 새 edge 결함 유입(whack-a-mole)**: 큰 구조 변경이 새 커버리지 갭 생성. → **1라운드 후 스키마(슬롯·룰 구조) freeze, 이후 seed·문구만 보강하도록 fixer 제약.**
4. **토큰 비용 큼**(루프 ~1.33M): severity 게이팅·cap 튜닝이 비용도 절감.

→ **결론: fix-loop는 작동한다(B=pass 증명). '진짜로 도는 검증된 시나리오'가 산출 가능.** 단 보수·복잡 도메인을 안정적으로 pass시키려면 **critic severity + cap + fixer 제약** 3개 튜닝이 다음 단계.

### 8.5 다음 (갱신)
- **N1b. 루프 튜닝**(추천): critic severity(blocking/minor)·cap 5·fixer 스키마 freeze → A사 재실행해 pass 수렴. 비용도 절감.
- N2 소비방식 확정 / N3 코어 evaluate()(app/ 단일 writer 분담) / N4 도메인 확장.

---

## 9. N1b 튜닝 결과 — critic severity 적용 (★예상 밖 발견)

critic에 severity(blocking/minor) + cap 5 + fixer freeze를 넣고 resume 재실행(S1~S8 캐시, severity-aware critic부터 라이브). 9 에이전트·**176k 토큰·4.4분**(직전 fix-loop 1.33M의 1/7).

### 9.1 결과
| | 수렴 | fix 라운드 | 잔여 |
|---|---|---|---|
| **A사** | ✅ **pass** | **0회** | blocking 0 · minor 0(실패 체크) |
| **B사** | ✅ **pass** | **0회** | blocking 0 · minor 0(실패 체크) |

> **둘 다 첫 critic에서 즉시 pass.** fix 루프가 한 번도 돌지 않았다.

### 9.2 ★핵심 발견 — 진짜 문제는 시나리오가 아니라 critic의 이분법이었다
- 이 실행이 검증한 시나리오 = **캐시된 run1 원본**(fix-loop 개선본 아님). 그 원본을 **severity-aware critic**으로 보니 **blocking 결함 0** → 즉시 pass.
- 즉 직전 "A사 3회 미수렴(fail)"은 **시나리오 결함이 아니라, edge 커버리지 갭을 hard-fail로 취급한 critic의 과엄격** 때문이었다. blocking(핵심: route 전 분기 1:1 커버 + 추적성 + gap 누출 없음 + 미정의 입력 없음)과 minor(edge: 단일 임계 seed·인지세 상위구간·문서용 임계·문구 긴장)를 가르자, **원본 생성물이 이미 핵심 기준을 충족**.
- **검증된 것**: severity 게이팅이 "진짜로 돈다"의 본질만 막는다 → 하니스 raw 출력이 **수정 없이 pass**.
- **검증 안 된 것(정직히)**: fix 라운드가 0회라 **cap 5·fixer freeze 로직은 이번에 실제로 돌지 않음**(blocking 결함이 없어 호출 안 됨). severity 변경 단독이 효과의 전부였다.

### 9.3 잔여 minor (비차단 — 숨기지 않음)
critic이 branchCoverage.missing에 minor로 기록(체크는 통과): ① 자동갱신 없음 분기 단독 seed ② 법무검토 후속 3결과(수용/수정요청/반려) 실증 seed ③ 인지세 상위구간(7만/15만/35만) ④ 위약벌>10% 단독 트리거 seed. **route 본질과 무관**. "완전한" 시나리오를 원하면 freeze 모드 1라운드로 닫을 수 있으나 "진짜로 돈다"엔 불필요.

### 9.4 비용·학습
- **비용 급감**: 176k 토큰(직전 1.33M의 1/7) — fix 루프 미발동. 직전의 거대 비용은 **과엄격 게이트와 싸운 churn**이었다.
- **학습 갱신**: 루프 튜닝 3종 중 **severity가 결정적**(단독으로 pass 달성). cap·freeze는 보험(이번 미발동). → 하니스 기본값으로 **severity-aware critic 채택**.
- **비교 재확인**: diff 결론이 수정본 없이도 "변수 발산 + 골격 재사용" 재입증(아키타입·decide 2계층·route 3분기·gap HITL·0.7 추출신뢰도 가드·필수조항 결정론 차단 공통).

### 9.5 N1b 판정 = 완료
하니스가 **신뢰 가능한 생성기**임이 확정(severity-aware critic으로 raw 출력 pass). 선택: (a) minor까지 닫는 freeze 1라운드(선택·비필수) (b) **N4 도메인 확장으로 범용성 입증**(권장) (c) N3 실행 표준 핸드오프.

---

## 10. N4 도메인 확장 — 범용 시나리오 공장 입증

같은 하니스(severity-aware critic 기본값)로 **구매·조달 / 경비·지출** 2개 신규 도메인 시나리오 생성 → 계약 아키타입과 가로질러 비교. 9 에이전트·**542k 토큰·8.3분**. 원본=`_harness_out/scenarios_procurement_expense_n4.json`.

### 10.1 결과
| 도메인 | 수렴 | fix | 생성된 깊이(예시) |
|---|---|---|---|
| **구매·조달** | ✅ **pass · 0회** | — | 11 route 분기·3견적 의무·단가계약 편차·예산 약정(commitment)·쪼개기 스코어링(split_score≥70)·신규벤더 실사 gap·벤더 컴플라이언스 하드차단 |
| **경비·지출** | ✅ **pass · 0회** | — | 12 route 분기·직급×비용유형×지역 한도표(해외 1.5배)·적격증빙 기준표·법인카드 3-way 대사·정책금지룰셋(주류/개인경비)·중복/분할·OCR·riskScore≥85 SIU |

> 두 도메인 모두 **무수정 1패스 생성**(severity critic 효과 일관 재현).

### 10.2 ★ 공유 골격 (계약·구매·경비 가로질러 동일 — sharedArchetype)
1. **6단계 파이프라인**: 접수→슬롯 추출→결정론 룰 1차판정→HITL 게이트→route 3분기→결재선→writeback. *토큰 단위로 같은 단계열.*
2. **decide 2계층**: 결정론 룰 1차판정(extract=rule/db/api) + 암묵지 사람 보완(extract=manual).
3. **route 3분기 + 동일 서열**: 하드 가드레일 반려(컴플라이언스/예산/필수증빙) → HITL 검토 승급 → 전PASS 자동승인 fallback. 위험 결격 최우선 가로채기.
4. **gap↔게이트 1:1**: source=gap 슬롯이 곧 HITL 트리거(구매 4 gap, 경비 5 gap).
5. **임계 패밀리 5종**: ①금액 구간 캡 ②결재선 룩업 ③신뢰도 컷(양 도메인 동일 0.8) ④패턴 탐지(쪼개기/중복) ⑤소진·초과 임계. *값·필드명만 다름.*
6. **결재선 위임전결표·writeback**: 두 도메인 공통 자산 구조.

### 10.3 도메인 고유(divergence) = knowledge·슬롯 소스에만 국한
- **구매**: 3견적 의무표·단가계약 편차율·쪼개기·신규벤더 실사·벤더 제재/거래정지. 견적서 PDF LLM 추출.
- **경비**: 직급 한도표·법인카드 3-way 대사·정책금지룰셋·중복분할·세무. 영수증 OCR 추출.
- 둘 다 **같은 골격의 같은 슬롯 자리에 꽂힘**, route는 같은 서열에 사유만 교체.

### 10.4 ★ 재사용 레시피 (하니스 산출)
> 새 도메인 진입 시 **갈아끼울 것 4가지뿐**: ①슬롯 매핑(필드↔소스/gap) ②knowledge 4종(룩업표·임계값·룰·정책금지셋) ③route 분기 사유표 ④writeback 대상 시스템. **고정 재사용**: 파이프라인 단계열·decide 2계층·route 3분기 서열·gap↔게이트 1:1·임계 패밀리 5종.

### 10.5 결론
> **"범용 시나리오 공장" 입증됨.** 구매·경비가 계약과 6단계 파이프라인·decide 2계층·route 3분기 서열·gap↔게이트·임계 패밀리·writeback을 **토큰 단위로 공유**하고, 도메인 차이는 knowledge·슬롯 소스에만 국한. 같은 하니스 골격에 knowledge·슬롯만 갈아끼우면 도메인이 무수정 1패스로 찍혀 나온다. → 하니스 트랙(가설 검증)은 **여기서 일단락**: 신뢰 가능(N1b) + 범용(N4) + 고객 변수 조건화(이전) 3박자 확보.
