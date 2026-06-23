# 결정층 드롭인 — app/ 통합 가이드 (단일 writer 세션용)

> **무엇**: 검증된 결정 엔진(`evaluate.js`)과 결정층 데이터(`pack_contract_A.decision.json`)를 앱에 붙이는 **최소 차분**. app/ 단일 writer 세션이 결정층 단계에 도달하면 적용.
> **전제(Explore 260623 확인)**: Pack Contract v2의 **`flow`·`kind`·`loopPhase`·`gate.decisions`는 이미 코드 랜딩**(`packs/meeting.js`·core `stKind`/`stLoop` `core.js:204–219`). **결정층(`caseModel`·`knowledge`·`evaluate`·flow `next`)만 공백** — 이 드롭인이 채움. 런타임 `decide(v)`(`core.js:1454`)는 현재 기록만.

## 파일
| 파일 | → 위치 |
|---|---|
| `evaluate.js` | `app/core/evaluate.js`(신규) — 순수·결정론·안전 DSL. `window.AAP_EVALUATE` 노출 |
| `pack_contract_A.decision.json` · `pack_procurement.decision.json` · `pack_expense.decision.json` | 각 팩에 `caseModel`+`knowledge` 필드로 병합. **3팩 모두 하니스 자동생성 + evaluate 게이트 통과 + 독립 재검증(10/10·11/11·11/11)** |

## 통합 4스텝 (≈3줄 + 1 헬퍼)

### 1. 엔진 적재 (1줄)
`index.html`에 코어보다 **먼저**:
```html
<script src="core/evaluate.js"></script>
```

### 2. 팩에 결정층 필드 (데이터)
대상 팩 export에 추가(register `core.js:1951`가 그대로 저장 — `normalizePack`이 미지의 필드를 strip하지 않는지만 확인):
```js
caseModel: { slots:[ {key,type,...} ] },          // 입력 슬롯 정의
knowledge: { route:{ rules:[{id,outcome,label,basis,when}], default } },  // when=파싱된 DSL 객체
```
(`pack_contract_A.decision.json`의 caseModel·knowledge 그대로.)

### 3. flow `next` 분기 = verdict.outcome (헬퍼 1개 + gate 단계 next)
v2 §3.1 `next`는 **미구현** — 추가. gate 단계에 outcome→다음단계 맵:
```js
// 팩 flow 의 라우팅 gate 단계
{ id:'route', label:'분기 판정', kind:'gate', loopPhase:'Decision',
  next:{ AUTO_APPROVE:'prepare', LEGAL_REVIEW:'legalReview', REJECT:'reject' } }
```
코어 진행 로직(`playNext`/`setSel` 부근 `core.js:~1467`)에 헬퍼:
```js
function nextStage(stage, S){
  if(stage.next && PACK.knowledge){
    const v = AAP_EVALUATE.evaluate(S.caseData, PACK.knowledge);  // ★결정 실행
    S.verdict = v;                                                 // basis 근거 레일용
    if(typeof stage.next==='object') return stage.next[v.outcome] || defaultNext(stage);
  }
  return defaultNext(stage);  // 기존 선형 다음
}
```

### 4. pre-gate 근거 + io.editable (선택, UX)
- **gate 모달 전**: `S.verdict`(위에서 계산)로 권고 분기 + `v.basis`(어느 룰)·`v.inputs`(읽은 슬롯)를 우측 근거 레일에 표시. `decide(v)`(`core.js:1454`)는 그대로 — verdict는 **권고**, 최종은 사람.
- **io.editable**(v2 §3.2): 임계 수정 → `AAP_EVALUATE.evaluate` 재실행 → 재라우팅(세탁 PoC '직접 체감').

## caseData 채우기
케이스의 슬롯값 = `io.inputs`(폼·문서) + `io.connectors`(레거시) → `caseModel.slots`. 데모는 seed가 제공. evaluate는 **caseData에 route 참조 슬롯이 모두 있어야** 정확(아래 주의).

## 데이터 품질 게이트 (evaluate-in-the-loop로 해소됨)
`evaluate`는 엔진일 뿐 knowledge 품질을 보장하지 않는다. 자동 생성 DSL에서 2결함이 실측됐고(슬롯 drift·분기 커버리지 구멍 — `../verify_harness_dsl.js`), **하니스 생성 루프에 결정론 게이트를 넣어 자동 해소**함(`../verify_evalgate.js`):
- 게이트가 생성 DSL을 실행 → drift·misroute 검출 → evalFix가 보완(슬롯 추가·**보완 룰 자동 생성**) → 게이트 통과까지 루프(A·B 1라운드 PASS).
→ **이 드롭인 `pack_contract_A.decision.json` = 하니스 자동생성 + evaluate 게이트 통과본**(수기 0). 표준 `evaluate.js` 독립 재검증 10/10. (원 수기 golden은 `../contract_A.structured.json`에 보존.) **앞으로 자동 bake되는 팩도 같은 게이트 통과분만 채택.**

## 무회귀
- 기존 flow/kind/loopPhase 팩(meeting·voc·recruiting)은 `knowledge` 없음 → `nextStage`가 선형 폴백 → **무영향**.
- `evaluate.js` = 신규 파일. `index.html` 1줄 + `nextStage` 헬퍼 1개 + gate `next` 데이터. core.js 기존 로직 거의 불변 → 머지 충돌 최소.
