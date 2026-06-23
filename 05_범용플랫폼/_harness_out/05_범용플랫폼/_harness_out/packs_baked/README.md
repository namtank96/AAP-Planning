# packs_baked/ — 하니스 출력을 앱 Pack v2로 bake한 결과 (다리 1)

> `../adapter_harness_to_pack_v0_1.js`가 하니스 생성 시나리오(`../*.json`의 `finalPack`)를 **앱 Pack v2 스키마 + 결정층**으로 결정론 변환한 것. = `aap_harness_app_bridge_n3_v0_1.md` §C(다리 1) 참조 구현·산출물.
> **app/ 무관**: 여기 파일은 `app/packs/`에 아직 넣지 않음(단일 writer 세션과 협의 후 드롭). 지금은 **타깃 형태 증명 + 핸드오프 자료**.

## 파일
| 파일 | 도메인·프로파일 | flow(input/auto/gate) | 결정층 |
|---|---|---|---|
| `pack_contract_A.json` | 계약 · A사(제조·SAP·보수) | 13(1/8/4) | 슬롯 28 · 룰표 16 · seed 10 |
| `pack_contract_B.json` | 계약 · B사(IT·SaaS·중도) | 10(1/6/3) | 슬롯 24 · 룰표 17 · seed 9 |
| `pack_procurement.json` | 구매·조달 | 7(1/5/1) | 슬롯 33 · 룰표 19 · seed 11 |
| `pack_expense.json` | 경비·지출 | 7(1/4/2) | 슬롯 48 · 룰표 21 · seed 11 |

## 구조 (Pack v2 + 결정층)
- **`flow[]`** — 단계 그래프. `{id,label,kind('input'|'auto'|'gate'),loopPhase,gate?,explain}`. (Pack Contract v2 §3.1)
- **`io{inputs,connectors,editable}`** — 인터랙션 훅. inputs=수기/문서 슬롯, connectors=레거시(stub), **editable=각 threshold → `recompute:'evaluate(case,knowledge)'`** (v2 §3.2 + N3 §D).
- **`caseModel`·`knowledge`·`seeds`** — ★결정층(하니스 1:1 통과·정밀). `evaluate(case,knowledge)`가 소비.
- `components`·`compose`·`stepLoop`·`govern`·`surfaceSpec`(stub) — 구조·뷰.
- `provenance{reviewedBy:null}` — 미검토 표식. `_adapterNotes` — 정밀/휴리스틱 구분.

## 정밀도 (정직)
- **정밀(1:1)**: caseModel·knowledge·seeds·components — 하니스 출력 그대로. **이게 어댑터의 핵심 가치.**
- **휴리스틱(v0.1)**: flow의 kind·loopPhase·gate.decisions, surfaceSpec(stub). → **app/ 세션이 Pack Contract v2 2b에서 정통화.**

## 재생성
```
node ../adapter_harness_to_pack_v0_1.js   # _harness_out/에서 실행 → 이 폴더 갱신
```
하니스를 다시 돌려 `finalPack`이 바뀌면 어댑터만 재실행하면 됨.

## app/ 연결(후속 — 단일 writer 세션)
1. 코어 `evaluate(case, knowledge)` 추가(N3 §D) → `knowledge` 소비.
2. flow gate `next`를 route verdict에 바인딩(N3 §G-1, v2 §8).
3. `pack_<id>.json` → `app/packs/<id>.js`로 래핑(`window.AAP_PACKS.<id>=...`) → register.
4. surfaceSpec stub을 generic 렌더러로 채움 + flow 정통화(2b).
