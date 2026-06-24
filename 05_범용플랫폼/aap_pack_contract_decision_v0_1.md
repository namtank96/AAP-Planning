# AAP Domain Pack — 계약 관리 (B) 결정 설계 (P1) v0.1

> **⚠ 정합 보정(260624)**: 본 문서는 판정 함수를 `decide()`로 기술하나, **canonical 표준 = 코어 도메인 무관 `evaluate(caseData, knowledge)`**(`aap_harness_app_bridge_n3` §D·`aap_scenario_harness_spec_v0_2` 확정, app/ 구현 `evaluate.js`에 랜딩됨). 본 문서의 `decide()`는 **개념명**이며, 실제 구현은 **팩이 `knowledge` 데이터만 제공하고 코어 `evaluate()`가 평가**(팩 함수 `decide()`는 복잡 도메인 escape hatch). 이하 `decide()`는 `evaluate()`로 읽을 것.

> **무엇**: (B) 결정 런타임의 **첫 증명 도메인 = 계약 관리**. `aap_decision_runtime_spec_v0_1.md`(범용 (B) 설계)를 계약 도메인에 인스턴스화 — `caseModel`·`knowledge`·`decide()`·verdict·HITL을 **명시지로 인코딩**.
> **유저 확정(260622)**: 후보 비교 후 **계약 관리** 커밋(AskUserQuestion). 기준 = formal·포맷화·AI 실수요·재사용 골격("규정 기반 심사·승인" 아키타입).
> **원칙**: 판정은 **결정론·추적 가능**(LLM 0·mock 데이터), 암묵지(독소조항 해석)는 **HITL**. §9 검증(데이터 구동·추적성·재현성) 통과가 P1 완료 기준.
> **정합**: 범용 (B)=`aap_decision_runtime_spec_v0_1.md` · Pack 스키마=`aap_domain_pack_spec_v0_1.md`(§11 결정 레이어 확장) · 용어=`aap_object_model_glossary_v0_1.md` · 기존 인스턴스=`app/packs/voc.js`(인바운드 트리아지 아키타입과 대비).

---

## 1. 케이스 정의 + 아키타입

- **케이스(L3)** = "계약 검토·승인 건 1건"(신규 체결 / 갱신 / 변경). 예: `CTR-20461 · 클라우드 인프라 용역계약(매입)`.
- **아키타입** = **규정 기반 심사·승인** (voc=인바운드 트리아지와 대비되는 2번째 재사용 골격). 흐름: 접수 → 항목별 규정·기준 대조 → 한도/임계 판정 → **분기(자동승인 / 법무검토 / 반려)** → 결재·체결 → 등록·학습.
- **데모 메시지**: 계약의 **명시지(필수조항·표준편차·결재한도·만기·인지세·제재리스트)는 AAP가 결정론으로 판정**하고, **암묵지(독소조항 실질 위험·협상 여지)는 사람이 판단**한다 — 둘이 화면에서 분리돼 보인다.

---

## 2. `caseModel` — 계약 케이스 슬롯 (L4 온톨로지)

규칙(§3)이 평가할 입력 변수. 모든 규칙 입력은 여기 슬롯으로 존재해야 함(§8 CQ).

```
caseModel = {
  entity: '계약 검토 건',
  slots: [
    { key:'ctrType',   label:'계약 유형',   type:'enum', values:['용역','매매','임대차','NDA','위탁','라이선스'], source:'요청·문서', extract:'llm|manual' },
    { key:'direction', label:'거래 방향',   type:'enum', values:['매입','매출'], source:'요청', extract:'manual' },
    { key:'lifecycle', label:'체결 구분',   type:'enum', values:['신규','갱신','변경'], source:'요청', extract:'manual' },
    { key:'counterparty', label:'거래상대방', type:'string', source:'문서', extract:'doc' },
    { key:'amount',    label:'계약 금액',   type:'number', unit:'원', source:'문서', extract:'doc' },
    { key:'startDate', label:'시작일',      type:'date',   source:'문서', extract:'doc' },
    { key:'endDate',   label:'종료일',      type:'date',   source:'문서', extract:'doc' },
    { key:'autoRenew', label:'자동갱신',    type:'bool',   source:'문서', extract:'doc' },
    { key:'clauses',   label:'포함 조항',   type:'list<string>', source:'문서', extract:'doc' },   // 조항 표제 목록
    { key:'liabilityCapAmt', label:'배상한도', type:'number', unit:'원', source:'문서', extract:'doc' },
    { key:'penaltyAmt',      label:'위약벌',   type:'number', unit:'원', source:'문서', extract:'doc' },
    { key:'governingLaw',    label:'준거법',   type:'string', source:'문서', extract:'doc' },
    { key:'sanctionHit',     label:'제재리스트 매칭', type:'bool', source:'시스템', extract:'rule' },  // Connector 조회 결과
    { key:'today',           label:'기준일',   type:'date',   source:'시스템', extract:'rule' },
  ],
  relations: [
    { from:'계약', rel:'당사자', to:'거래상대방' },
    { from:'계약', rel:'준거', to:'표준계약서' },
    { from:'계약', rel:'적용', to:'위임전결규정' },
  ],
}
```

> P1: `extract`는 전부 `manual|rule`(폼·mock·시스템)로 시작. `doc`(OCR/파싱)·`llm`(유형 분류) seam은 위치만 선언, 실연동은 P2/P3.

---

## 3. `knowledge` — 명시지 3종 (선언형 데이터)

### 3.1 `lookupTables` (기준표 — 룩업)
```
requiredClausesByType: {            // 계약유형별 필수조항 (있다/없다 판정의 기준)
  용역: ['목적','대가','기간','검수','하자담보','지체상금','비밀유지','분쟁해결'],
  매매: ['목적물','대금','인도','소유권이전','하자담보','위약','분쟁해결'],
  NDA:  ['비밀정보범위','목적외사용금지','반환·파기','존속기간','위반시책임'],
  ... }

approvalLineByAmount: [             // 위임전결: 금액 구간 → 결재선
  { max:    10_000_000, line:['팀장'] },
  { max:   100_000_000, line:['팀장','본부장'] },
  { max:   500_000_000, line:['팀장','본부장','CFO'] },
  { max:  Infinity,     line:['팀장','본부장','CFO','대표이사'] },
]

stampDutyByAmount: [               // 인지세액 구간표(명시지 세액)
  { max:   10_000_000, duty:0 },
  { max:   30_000_000, duty:20_000 },
  { max:  100_000_000, duty:40_000 },
  { max: 1000_000_000, duty:70_000 },
  { max:  Infinity,    duty:350_000 },
]

riskClausePatterns: [              // 독소조항 후보 패턴(명시지 1차 스캔 — 해석은 HITL)
  { id:'unilateralTerm', label:'일방 해지', match:['일방적으로 해지','사전 통지 없이 해지'], severity:'high' },
  { id:'unlimitedLiab',  label:'무한 책임', match:['일체의 손해','무한책임','한도 없이'], severity:'high' },
  { id:'ipAssign',       label:'지재권 전부 양도', match:['모든 지식재산권을 양도'], severity:'mid' },
  { id:'foreignLaw',     label:'외국 준거법', match:[], severity:'mid', expr:'governingLaw != "대한민국"' },
]
```

### 3.2 `decisionTables` (조건 조합 → 분기)
```
route: [   // 위→아래 우선순위, 첫 매칭 채택
  { when:[['sanctionHit','==',true]],                         then:{ decision:'반려', reason:'제재리스트 거래상대방' } },
  { when:[['missingRequired.count','>',0]],                    then:{ decision:'법무검토', reason:'필수조항 누락' } },
  { when:[['riskFlags.high','>',0]],                           then:{ decision:'법무검토', reason:'고위험 조항' } },
  { when:[['templateDeviation.count','>',0]],                  then:{ decision:'법무검토', reason:'표준템플릿 편차' } },
  { when:[['amount','<=',10_000_000],['riskFlags.count','==',0]], then:{ decision:'자동승인', reason:'소액·표준·무위험' } },
  { when:[],                                                   then:{ decision:'법무검토', reason:'표준 검토' } },  // default
]
```

### 3.3 `thresholds` (수치 임계)
```
renewalNotice: { expr:'autoRenew == true',                                   // 자동갱신이면
  deadline:'endDate - 60일',  flagWhen:'(deadline - today) <= 30일',         // 갱신거절 통지 마감 D-30 임박
  flag:'갱신 통지기한 임박' }
liabilityRatio: { expr:'liabilityCapAmt == 0 || penaltyAmt > amount * 0.3',  // 배상한도 없음 or 위약벌>계약액30%
  flag:'배상·위약 과도' }
amountAuthority: { expr:'true', derive:'approvalLineByAmount lookup' }        // 금액→결재선 도출
```

---

## 4. `decide(caseData, knowledge) → verdicts[]` (결정론 판정)

순수 함수. 부수효과 0·재현성 보장. 각 verdict에 `basis`(추적성) 강제.

| verdict.id | 무엇을 판정 | 입력(inputs) | 출력(output) | basis(근거) | loop |
|---|---|---|---|---|---|
| `requiredClauses` | 필수조항 충족 | `ctrType`, `clauses` | `{missing:['하자담보'], present:[…]}` | `requiredClausesByType[용역]` | Reasoning |
| `templateDeviation` | 표준 편차 | `clauses`(vs 표준) | `{added:['독점공급'], removed:['지체상금']}` | 표준계약서 조항셋 차집합 | Reasoning |
| `riskClauses` | 독소조항 후보 | `clauses`, `governingLaw` | `{flags:[{id:'unilateralTerm',sev:'high'}]}` | `riskClausePatterns` 매칭 | Reasoning |
| `approvalLine` | 결재선 | `amount` | `{line:['팀장','본부장','CFO']}` | `approvalLineByAmount: 1억~5억` | Decision |
| `renewal` | 만기·갱신 | `autoRenew`,`endDate`,`today` | `{deadline, dday:-12, flag:'임박'}` | `thresholds.renewalNotice 60/30일` | Reasoning |
| `stampDuty` | 인지세 | `amount` | `{duty:70_000}` | `stampDutyByAmount: 1억~10억` | Action |
| `liability` | 배상·위약 적정 | `liabilityCapAmt`,`penaltyAmt`,`amount` | `{flag:true}` | `thresholds.liabilityRatio` | Reasoning |
| `sanction` | 제재 매칭 | `sanctionHit`,`counterparty` | `{hit:false}` | 제재리스트 Connector | Decision |
| `route` | **종합 분기** | 위 verdict 집계 | `{decision:'법무검토', reasons:['필수조항 누락','고위험 조항']}` | `decisionTables.route` 첫매칭 | Decision |

> `route`는 다른 verdict를 입력으로 받는 **2차 판정**(decide 내부 순서: 1차 항목별 → 집계 → route). 모든 분기 사유가 1차 verdict의 basis로 환원됨(추적성).

---

## 5. 명시지 / 암묵지 분리 (★ 데모 핵심)

| | AAP 자동 (명시지·결정론) | 사람 (암묵지·HITL) |
|---|---|---|
| 필수조항 누락 검출 | ✅ `requiredClauses` | — |
| 표준템플릿 편차 검출 | ✅ `templateDeviation` | — |
| 금액 → 결재선 | ✅ `approvalLine` | — |
| 만기·갱신 통지 D-day | ✅ `renewal` | — |
| 인지세·제재리스트 | ✅ `stampDuty`·`sanction` | — |
| 독소조항 **후보 표시** | ✅ `riskClauses`(패턴 매칭) | **실질 위험·수용 여부 해석** |
| 누락조항 **보완 결정** | 누락 목록 제시 | **보완·예외 승인 판단** |
| 종합 분기 제안 | ✅ `route` 권고 | **최종 검토·체결 승인** |

> AAP는 **"무엇이 규정 위반·임박·과도한가"를 근거와 함께 짚고**, 사람은 **"그래서 이 계약을 받을 것인가"를 판단**한다.

---

## 6. `work[]` 8단계 매핑 + `@verdict` 바인딩

| 단계 | id | actor | 핵심 ops (→ verdict 바인딩) |
|---|---|---|---|
| 계약 접수 | request | human | 검토 요청 수신 · 메타 추출(`@slot:*`) |
| 계약 이해 | understand | aap | 유형 분류 · 컴플라이언스 플래그(`@verdict:sanction`) |
| 실행 구조 구성 | compose | aap | 작업 분해(조항·편차·위험·한도·만기) · 구성요소 배정 |
| **법무 검토 승인** | approve | **hitl ①** | `@verdict:route` 제시 → 누락·위험·편차 근거 + 사람 판단 |
| 검토 실행 | prepare | aap | `@verdict:approvalLine`·`stampDuty`·`renewal` 산출 · 계약대장 반영 준비 |
| **체결 승인** | commit | **hitl ②** | Policy(제재·전결) 점검 → 결재권자 최종 승인 |
| 등록·기록·학습 | share | aap | 계약관리대장 등록 · 만기 알림 등록 · 편차/위험 패턴 학습 |

ops 예시(정적 문자열 → 데이터 구동):
```
{ g:0, feed:'필수조항 점검', out:'@verdict:requiredClauses.summary',  // "누락 1: 하자담보"
  L:'L4', comp:'온톨로지·시맨틱', detail:'@verdict:requiredClauses.basis' }
{ g:1, feed:'종합 분기 판정', out:'@verdict:route.decision',           // "법무검토"
  L:'L3', comp:'코어·실행 엔진', detail:'@verdict:route.reasons' }
```

---

## 7. `seeds[]` — mock 케이스 (데이터 구동 증명용)

입력이 다르면 verdict·route가 달라짐을 보이는 3건:

| 케이스 | 입력 요지 | 기대 route | 근거 verdict |
|---|---|---|---|
| `CTR-A` 소액 표준 NDA | 800만·NDA·필수조항 완비·위험 0 | **자동승인** | requiredClauses 완비·riskFlags 0·amount≤1천만 |
| `CTR-B` 용역 매입 1.2억 | 하자담보 누락·일방해지 조항·금액 1.2억 | **법무검토** | missingRequired 1·riskFlags.high 1·approvalLine 3단 |
| `CTR-C` 제재 상대방 | 제재리스트 매칭 | **반려** | sanctionHit=true(최우선 분기) |
| `CTR-D` 자동갱신 임박 | autoRenew·종료 D-45 | 검토 + **만기 플래그** | renewal dday -15(통지 마감 임박) |

> 같은 `decide()`가 입력만으로 4가지 결론을 낸다 = **theater 아님**(§9-1 데이터 구동).

---

## 8. CQ 체크리스트 (저작 검수 — §4.1 범용)

1. 모든 `decisionTables`/`thresholds` 입력이 `caseModel.slots` 또는 1차 verdict에 존재하는가? → `missingRequired`,`riskFlags`,`templateDeviation` 등 파생값은 1차 verdict로 정의됨 ✅
2. 각 슬롯이 채워지는 길(`extract`)이 있는가? → `doc` 슬롯(amount·clauses…)은 P1 mock, `rule` 슬롯(sanctionHit·today)은 시스템 ✅
3. 각 HITL 게이트가 소비하는 verdict가 있는가? → approve=`route`(+근거 verdict), commit=`sanction`·`approvalLine`(Policy) ✅
4. `route`의 모든 분기 사유가 1차 verdict basis로 환원되는가? ✅

---

## 9. §9 검증 시나리오 (P1 완료 기준)

1. **데이터 구동**: `CTR-B`의 `clauses`에 '하자담보' 추가 → `requiredClauses.missing` 0 → `route` 사유에서 '필수조항 누락' 사라짐. (불변이면 fail)
2. **추적성**: 모든 verdict에 `basis`(기준표 행/패턴 id/임계식). `route.reasons`는 1차 verdict 참조. basis 없으면 fail.
3. **재현성**: 같은 seed 100회 → 동일 verdict. `decide()` 내 LLM·난수·`Date.now` 0(`today`는 슬롯으로 주입).
4. **CQ 커버리지**: §8 4항 통과.
5. **무회귀**: surface/HITL/Run Trace 골격, meeting·voc 정상.

---

## 10. 재사용 — 이 골격을 구매·경비로 옮길 때

`decide()` **구조와 코어는 그대로**, `knowledge` 데이터와 `caseModel.slots`만 교체:

| 계약 관리 | → 구매·조달 | → 경비·지출 |
|---|---|---|
| requiredClausesByType | 필수 견적·증빙 by 품목 | 필수 증빙 by 비용유형 |
| approvalLineByAmount | 발주 금액 결재선 | 지출 결재선 |
| riskClausePatterns | 분할발주·단가이탈 탐지 | 중복·분할결제 탐지 |
| route(자동/법무검토/반려) | route(자동/구매검토/반려) | route(자동승인/검토/반려) |

> = **"규정 기반 심사·승인" 아키타입의 재사용**. 새 도메인 진입 = 데이터(knowledge·slots) 저작 + `decide()` 규칙 평가 로직 재사용. 이게 유저가 말한 "다른 도메인 진입 시 활용"의 실체.

---

## 11. 미구현 · 다음
- **본 건 = P1 설계 문서만**(코드 0). 구현 = `app/packs/contract.js`(데이터) + 코어 `decide()` 훅·`@verdict` 해석·검증 러너(`aap_decision_runtime_spec` §11).
- **P1 구현 범위**: `caseModel`·`knowledge`·`decide()`·seeds(mock) + ops `@verdict` 바인딩 + §9 검증 통과. **LLM 0·OCR 0.**
- **P2**: 유형 분류(`llm`) 또는 표준편차 RAG 1종 실연동(HITL 뒤).
- **P3**: 계약서 OCR/파싱 → `doc` 슬롯 채움 1종.
- **표준화 agent 과제**: `decide()`·verdict·`@verdict` 문법을 `aap_domain_pack_spec`에 정식 반영(`aap_decision_runtime_spec` §11 기반).
