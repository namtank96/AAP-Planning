# AAP 결정 런타임 명세 — 명시지 기반 결정론 실행 (B) v0.1

> **무엇**: Domain Pack에 **결정 레이어(Decision Layer)**를 더해, 케이스 실데이터를 명시지(SOP·기준표·임계 규칙)에 걸어 **결정론 판정**을 내리고, 그 판정이 **규칙+데이터로 100% 추적·재현**되게 만드는 런타임 설계.
> **발단**: "지금 '새 업무 요청'은 LLM 추론이 아니라 회의 흐름과 같은 키워드→캐논 골격이다. 암묵지는 아직 어렵다. 한 도메인의 명시지(일반 업무 프로세스)를 넣어 처리하는 방향이 맞나? — 의견" (유저, 260622)
> **유저 확정(260622)**: 도메인 커밋 전에 **'(B) 런타임을 명시지 Pack 스키마 + 결정론 판정 + HITL로 만드는 범용 설계'부터** (AskUserQuestion → "먼저 설계만").
> **정합**: 용어=`aap_object_model_glossary_v0_1.md`(SSOT) · Pack 스키마=`aap_domain_pack_spec_v0_1.md`(본 문서가 §11 **결정 레이어 필드**로 확장) · 8계층=핸드오프 §2.

---

## 0. 핵심 구분 — 이 문서가 만드는 것과 안 만드는 것

두 레이어를 분리한다. **혼동이 모든 문제의 출발점이었다.**

| | **(A) 저작(격상)** | **(B) 런타임(실행)** ← 본 문서 |
|---|---|---|
| 하는 일 | 임의 텍스트 → 실행 가능 Pack 생성 | **한 케이스를 실제로 판정·처리** |
| 현재 구현 | `pipeline.js` 키워드 사전→캐논 골격 (theater) | Pack `ops[].out` = **하드코딩 문자열**(판정 없음) |
| 진짜로 만들려면 | LLM 필요 + **범위 무한 = 검증 불가** | 명시지(규칙·기준표) + 케이스 데이터 → **결정론** |
| 결정 | **비전/티저로 유지**(자동저작은 후속) | **여기를 진짜로 만든다 = 증명 대상** |

> **원칙**: (A)를 진짜로 만들려 하지 않는다. "아무 업무나 자동 분해"는 LLM을 붙여도 끝나지 않고 신뢰도 검증이 불가능하다. 증명은 **(B)** — 한 도메인 안에서 명시지로 판정이 실제로 굴러가고, 매 판정이 어떤 규칙·어떤 데이터에서 나왔는지 추적되는 것. **이건 LLM 없이도 된다**(손해사정 `compute()`/R## 규칙이 이미 그 방식).

### 0.1 명시지 vs 암묵지 (범위 못박음)
- **담는다(명시지·explicit)**: 문서로 떨어지는 것 — SOP·규정·결재 한도·판정 기준표(예: KNIA 과실표, 상해등급→통상치료기간)·임계값·결정 테이블. → **선언형 데이터로 인코딩 → 결정론 규칙 엔진이 평가.**
- **안 담는다(암묵지·tacit)**: 숙련자 머릿속의 비정형 판단. → v0.1 범위 밖. 대신 **그 지점을 HITL 게이트로 둔다**(사람이 판단, AAP는 근거만 제시).

---

## 1. "진짜로 돈다"의 정의 (수용 기준)

데모가 "그럴듯하게 보이는 것"과 "진짜로 도는 것"을 가르는 **검증 가능한 3조건**:

1. **데이터 구동(Data-driven)**: 판정 결과는 케이스 입력값에서 계산된다. 입력을 바꾸면 결과가 바뀐다. (하드코딩 문자열 ✕)
2. **추적성(Traceable)**: 모든 판정(verdict)은 `{발화한 규칙 ID, 입력값, 출력, 근거(기준표 행/임계)}`를 가진다. "왜 이 결론?"에 규칙+데이터로 답한다.
3. **재현성(Reproducible)**: 같은 입력 → 항상 같은 출력. **판정 경로에 LLM 없음**(LLM은 §6 입력 추출·초안에만, 판정 앞단).

> 이 3조건을 코드로 강제하는 테스트(§9)를 통과해야 "(B) 진짜로 돈다"로 인정. 통과 못 하면 여전히 theater.

---

## 2. 현행 갭 분석 (왜 지금은 theater인가)

| 갭 | 현재 | 필요 |
|---|---|---|
| 케이스 데이터 모델 없음 | `surface`가 보여줄 문자열만 있음 | **L4 Case Model**(타입 있는 슬롯) — 입력의 구조 |
| 명시지 저장소 없음 | 규칙이 코드 `if`문에 흩어짐 | **Knowledge Base**(결정 테이블·기준표·임계 = 선언형 데이터) |
| 판정 엔진이 스키마 밖 | 손해사정 `compute()`는 standalone, Pack 무관 | **`decide(caseData, KB)` 순수 함수** → Pack 1급 필드 |
| `ops.out`이 죽은 문자열 | `out:'공구 마모 주원인'` 하드코딩 | ops가 **verdict에서 값을 끌어옴**(데이터 구동) |
| 추적 불가 | Run Trace = 단계 나열 | trace가 **규칙 ID·입력값·기준 행** 기록 |

→ **추가할 것은 결정 레이어 하나.** 기존 `work/ops/surface/HITL` 골격은 그대로 두고, ops가 참조하는 **판정 결과의 출처**를 정적 문자열에서 결정론 엔진 출력으로 바꾼다.

---

## 3. 결정 런타임 — 레이어 구조

```
케이스 입력(원천: 폼·문서·음성)
   │  ── §6 입력 추출(LLM seam, HITL 검증) ──▶  L4 Case Model (타입 슬롯 채움)
   ▼
┌─────────────────────────────────────────────────────────┐
│ 결정 레이어 (결정론 · LLM 없음)                            │
│   Knowledge Base(명시지)         decide(caseData, KB)     │
│   ├ 결정 테이블 (조건→결과)   ──▶  규칙 평가              │
│   ├ 기준표 (등급·유형 룩업)                                │
│   └ 임계 규칙 (수치 한계)        =  verdicts[]             │
│                                    각 {ruleId,inputs,out,basis}│
└─────────────────────────────────────────────────────────┘
   │
   ▼  work[].ops 가 verdict 값을 렌더(데이터 구동) + stepLoop 배지
   ▼  HITL 게이트: verdict 제시 → 사람 결정(암묵지 지점·책임 지점)
   ▼  Action/Writeback: 결정 반영 (mock → §7 실연동 seam)
   ▼  Run Trace/Decision Log: ruleId·입력·기준 행 기록 (추적성)
   ▼  Learning: 패턴 자산화 (후속)
```

---

## 4. L4 Case Model (온톨로지 슬롯) — 입력의 구조

명시지 규칙이 평가하려면 케이스가 **타입 있는 슬롯**으로 구조화돼야 한다. 한 도메인이면 **손으로 직접 저작**한다(범용 CQ 엔진 먼저 만들 필요 ✕).

```
caseModel = {
  entity: '손해사정 청구',                 // 케이스가 무엇인가
  slots: [
    { key:'injuryGrade', label:'상해등급', type:'enum', values:[1..14], required:true,
      source:'진단서', extract:'doc' },      // 어디서 채우나 + 추출 방식(§6)
    { key:'treatDays', label:'치료일수', type:'number', unit:'일', source:'진료기록', extract:'doc' },
    { key:'ourFault', label:'당사 과실율', type:'number', unit:'%', source:'사고분석', extract:'rule' },
    ...
  ],
  relations: [ { from:'청구', rel:'has', to:'대인피해' }, ... ]   // 관계(판정에 필요한 것만)
}
```

- **슬롯 = 규칙의 입력 변수.** 규칙이 참조하는 모든 값은 슬롯으로 존재해야 한다(§4.1 CQ).
- `extract`: `manual`(폼 입력) / `doc`(문서 OCR·파싱) / `rule`(다른 슬롯에서 계산) / `llm`(추출 seam §6).
- L4 매핑: 이 모델이 8계층 **L4 지식·시맨틱**의 Domain Ontology 인스턴스.

### 4.1 CQ(Competency Questions)로 모델 검증 — 범용 엔진이 아니라 **체크리스트**
온톨로지가 "판정에 필요한 걸 다 담았나"를 검증하는 방법. 거창한 CQ 엔진을 만드는 게 아니라, **저작 시 체크리스트**로 쓴다:

1. 각 결정 규칙(§5)을 나열한다.
2. 규칙이 참조하는 입력값이 **모두 `caseModel.slots`에 있는가?** → 없으면 슬롯 추가(커버리지 갭).
3. 각 슬롯이 **누구에 의해 채워지는가**(`extract` 명시)? → 채울 길 없는 슬롯은 데이터 갭(이슈로 표면화).
4. 각 HITL 게이트가 **어떤 verdict를 근거로 멈추는가?** → 근거 없는 게이트 = 형식적 HITL(제거 대상).

> CQ = "이 도메인 모델로 답해야 할 질문 목록". 통과 = 모든 질문이 슬롯+규칙으로 답해짐. (코드 ✕, 저작 산물의 검수 게이트.)

---

## 5. Knowledge Base + 규칙 엔진 (결정론 핵심)

명시지를 **3종 선언형 데이터**로 인코딩하고, `decide()`가 평가한다.

### 5.1 명시지 3종
```
knowledge = {
  decisionTables: [          // 조건 조합 → 결과 (SOP 분기)
    { id:'route', when:[['fraudScore','>=',70]], then:{ route:'SIU', label:'특별조사 의뢰' } },
    { id:'route', when:[['fraudScore','<',70],['docComplete','==',true]], then:{ route:'auto' } },
  ],
  lookupTables: [            // 기준표 (등급·유형 룩업) — KNIA·상해등급 같은 것
    { id:'gradeToTreatDays', key:'injuryGrade',
      rows:{ 12:[14,17], 14:[3,5], ... }, ret:'통상치료일수범위' },
  ],
  thresholds: [              // 임계 규칙 (수치 한계)
    { id:'overTreat', expr:'treatDays > lookup.gradeToTreatDays[injuryGrade].max', flag:'과잉진료 의심' },
    { id:'autoLimit', expr:'payAmount <= 1_000_000', allow:'자동 지급' },
  ],
}
```

### 5.2 `decide(caseData, knowledge) → verdicts[]` (Pack 1급 함수)
- **순수 함수**: 부수효과 0, 같은 입력 → 같은 출력(재현성).
- **출력 = verdict 배열**, 각 항목:
```
{ id:'overTreat', label:'과잉진료 의심',
  inputs:{ treatDays:35, injuryGrade:12 },        // 무엇을 보고
  output:{ flag:true, excessDays:18 },            // 무엇을 판정
  basis:{ table:'gradeToTreatDays', row:'12→[14,17]', rule:'treatDays>max' }, // 근거(추적성)
  loop:'Reasoning', gate:null }                   // stepLoop 배지 / 게이트 연결
```
- **추적성 강제**: `basis` 없는 verdict는 invalid(§9 테스트). 모든 판정이 기준표 행·임계식으로 환원돼야 한다.
- 손해사정 데모 `compute()/analyze(c,ov)`가 이 `decide()`의 **레퍼런스 구현** — 단 Pack 스키마 안으로 들여오고 verdict에 `basis`를 부착한다.

### 5.3 ops ↔ verdict 바인딩 (데이터 구동으로 전환)
현재 `{g,feed,out:'공구 마모 주원인',...}` → verdict 참조로:
```
{ g:1, feed:'원인 분석·조치 산정', out:'@verdict:rootCause.label', L:'L3', comp:'코어·실행 엔진',
  detail:'@verdict:rootCause.basis' }
```
- 코어 렌더러가 `@verdict:<id>.<path>`를 런타임 verdict에서 해석. → ops 결과가 **케이스 데이터에서 계산된 값**(입력 바꾸면 바뀜).
- 정적 문자열은 서사용으로만 잔존 허용(판정값 ✕).

---

## 6. LLM seam (제한적·검증 가능·HITL 뒤)

LLM은 **자유 분해(✕)가 아니라 3개 좁은 자리에만**. 전부 결정론 판정 **앞단**이고, 출력은 검증·HITL을 거친다.

| seam | 역할 | 입력→출력 | 검증 |
|---|---|---|---|
| **추출(extract)** | 문서/음성 → 슬롯 채움 | 비정형 → `caseModel.slots` 값 | 타입 검증 + 신뢰도 낮으면 HITL 확인 |
| **검색(RAG)** | 명시지 KB 근거 인용 | 질의 → KB 조항 + 출처 | 인용 출처 필수(없으면 무효) |
| **초안(draft)** | 산출물 문서 초안 | verdict → 안내문/보고서 초안 | 사람 검토·수정 후 발송(HITL ②) |

> **금지**: LLM이 `decide()`의 판정(verdict)을 내리는 것. 판정은 항상 결정론. LLM이 채운 슬롯값조차 규칙은 결정론적으로 평가한다. → 재현성·추적성 보존.
> **단계 도입**: v0.1 설계는 seam **위치만 못박고**, 실제 LLM 연결은 후속. 지금은 `extract:'manual'`(폼) + mock 슬롯값으로 (B)를 먼저 증명한다.

---

## 7. 데이터 유입 seam (OCR/STT → DB) — 막지 말고 나중에 갈아끼움

- **Connector 추상화**(8계층 L5): 슬롯의 `source`/`extract`가 유입 경로를 선언. 코어는 **추상 Connector 인터페이스**만 안다.
- **현재 = mock**: `source` 문서를 구조화된 mock 데이터로 제공(파일 업로드 없이 슬롯 채움).
- **swap 지점**: 문서 1종(예: 진단서)만 OCR Connector로, 음성 1종만 STT Connector로 교체 → 슬롯 채움. **전체 파이프라인을 먼저 만들지 않는다.**
- DB화: 채워진 Case Model은 케이스 store에 영속(객체모델 §3.2 trace store와 정합). 후속.

> 순서: **mock 데이터로 (B) 판정 증명 → seam 1종 실연동 → 확장.** 유입 레이어 완성을 (B) 증명의 선결조건으로 두지 않는다.

---

## 8. HITL — 암묵지·책임 지점의 처리

- **게이트는 verdict를 소비한다**: 각 HITL 게이트는 "어떤 verdict가 왜 사람 결정을 요구하는가"를 명시(§4.1 CQ-4).
- **2종 게이트**:
  - **계획 승인(HITL ①)**: 결정론이 옵션을 산출하되, **선택은 사람**(암묵지·재량 지점). verdict가 옵션 후보 + 각 근거 제시.
  - **최종 반영(HITL ②)**: 외부 영향·되돌리기 어려움 직전. Policy(L7) 점검 결과 verdict + 사람 승인.
- **AAP는 판정·근거를 제시, 사람은 책임 결정**. 명시지로 자동화된 부분과 암묵지로 사람에게 남긴 부분이 화면에서 분리돼 보인다(손해사정 데모의 'AAP 확인 vs 담당자 판단' 분리 원칙 계승).

---

## 9. 검증 테스트 (theater ↔ 진짜 판별 · 코드 강제)

(B)가 "진짜로 돈다"를 자동 검증하는 체크(도메인 무관 러너):

1. **데이터 구동**: 슬롯값 N개를 변형 → verdict가 규칙대로 바뀌는가. (불변이면 하드코딩 = fail)
2. **추적성**: 모든 verdict에 `basis`(기준표 행 또는 임계식)가 있는가. 없으면 fail.
3. **재현성**: 같은 입력 100회 → 동일 출력. `decide()` 안에 LLM·난수·시계 호출 0.
4. **CQ 커버리지**: 모든 규칙 입력이 `caseModel.slots`에 존재. 모든 게이트가 verdict 근거를 가짐.
5. **무회귀**: 기존 surface/HITL/Run Trace 골격 정상.

> 1~4 통과 = (B) 인정. **이 테스트가 "그럴듯한 데모"를 거른다.**

---

## 10. 단계 (도메인 커밋 후)

- **설계(현재)**: 본 문서 — 결정 레이어 스키마·검증 기준 확정.
- **P1 한 도메인 (B) 증명**: 도메인 1개 선택 → caseModel·knowledge·`decide()`를 명시지에서 인코딩 → ops verdict 바인딩 → §9 테스트 통과. **LLM 0·mock 데이터.** (후보: 손해사정=`compute()` 재사용 최단 / 내부통제 / 제조 품질 quality 팩.)
- **P2 LLM seam 1종**: 추출(extract) 또는 RAG 1개를 실제 LLM로, HITL 검증 뒤.
- **P3 유입 seam 1종**: 문서 OCR 또는 STT 1종 실연동 → 슬롯 채움.

---

## 11. Domain Pack 스키마 확장 (결정 레이어 필드)

`aap_domain_pack_spec_v0_1.md` §1 최상위 필드에 **추가**(기존 필드 불변·하위호환):

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `caseModel` | object | (B)필수 | L4 온톨로지 슬롯 + 관계 (§4) |
| `knowledge` | object | (B)필수 | 명시지 3종: `decisionTables`·`lookupTables`·`thresholds` (§5.1) |
| `decide` | `(caseData,knowledge)→verdicts[]` | (B)필수 | 결정론 판정 순수 함수 (§5.2) |
| `seeds[].input` | object | ⬜ | 시드 케이스의 슬롯 초기값(mock 데이터) |

- ops `out`/`detail`에 `@verdict:<id>.<path>` 참조 문법 허용(§5.3) — 코어 렌더러가 해석.
- **하위호환**: 결정 레이어 없는 기존 팩(meeting·voc)은 정적 ops로 그대로 작동(서사형). 결정 레이어는 "(B) 진짜 판정"을 원하는 팩만 채운다.
- **코어 보장 추가**: `decide()` 호출·verdict 캐시·`@verdict` 해석·trace에 `basis` 기록.

---

## 12. 참조
- Pack 스키마: `aap_domain_pack_spec_v0_1.md`(본 문서 §11이 확장) · 객체모델 SSOT: `aap_object_model_glossary_v0_1.md`
- 레퍼런스 결정론 구현: 손해사정 데모 `compute()/analyze(c,ov)`(`03_프로토타입/D_회의/` 외 손해사정 트랙) — verdict `basis` 부착해 `decide()`로 정규화 대상.
- 현행 theater: `app/core/pipeline.js`(키워드→캐논, (A) 저작) · `app/core/authoring.js`(`genericAuthor` 골격).
- 변경 라우팅: `_AGENT_핸드오프_변경기록.md` §5.
