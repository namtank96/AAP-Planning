# AAP 시나리오 생성 하니스 설계 (Scenario Generation Harness) v0.1

> **무엇**: 도메인/업무 설명 + **고객 환경 변수**를 입력받아 LLM 루프로 업무를 깊게 분석·드릴다운하고, **실행 가능한 Domain Pack 시나리오(룰·더미데이터 포함)**를 출력하는 오프라인 저작 하니스. = **harness/loop engineering**.
> **발단(유저, 260622)**: "OCR/STT는 어렵다. LLM으로 ①어떤 업무를 AAP에 적용할지 분석·드릴다운 ②더미데이터 생성 ③고객 레거시 환경 반영(변수에 따라 시나리오가 계속 바뀜). API 호출 해야 하나? 요점은 결국 harness·loop engineering. 플랫폼 AAP는 아직 어려우니, AAP 개념을 적용하기 위해 특정 도메인을 AI로서 디테일하게 파고들어 **시나리오를 결과물로 생성**."
> **유저 확정(AskUserQuestion)**: 소비 방식(오프라인 구움/매트릭스/라이브 백엔드) 결정 전 **"먼저 하니스 설계만"**.
> **정합**: (B) 결정 런타임=`aap_decision_runtime_spec_v0_1.md` · 계약 P1=`aap_pack_contract_decision_v0_1.md` · Pack 스키마=`aap_domain_pack_spec_v0_1.md` · 기존 seam=`app/core/pipeline.js`(`propose*`)·`authoring.js`(`genericAuthor`).

---

## 0. 포지션 — (A) 저작을 '안전하게 진짜로'

| | 이전(theater) | 이번 하니스 |
|---|---|---|
| (A) 저작 | 키워드→캐논 골격(`pipeline.js`) | **LLM 루프가 실제 분석·드릴다운** |
| 출력 | UI 서사만 | **Pack 데이터 + 룰 + 더미데이터**(사람 검토 가능) |
| 무한·블랙박스 문제 | 라이브·임의 텍스트 | **오프라인·도메인별·스키마 타깃·critic 검증**으로 통제 |
| LLM 위치 | (가짜) | **저작 하니스에만**(앱은 결정론 소비자·API 0) |

**원칙 3개**:
1. **앱 안에 라이브 API 0** — file://·단일HTML·포터블·재현 유지. 시나리오 생성은 *저작 시점* 활동.
2. **하니스는 데이터만 emit, 코드 생성 ✕** — `decide()`는 코어의 **범용 선언형 룰 해석기**(§5), 하니스는 `knowledge`·`caseModel`·`seeds` 데이터만 출력 → 검토·검증 가능, 도메인 간 재사용.
3. **고객 환경 = 1급 입력 변수** — 같은 도메인도 프로파일에 따라 다른 시나리오(§3가 슬롯 출처·Connector·더미·일부 룰을 조건화).

---

## 1. 하니스가 도는 곳 — 지금 이 환경

**Claude Code의 Workflow/에이전트 오케스트레이션 = 하니스 그 자체.** "API 호출"은 이 세션이 하는 일이고, 출력을 Pack 데이터로 커밋한다. **인프라 0.** 각 루프 단계(§4) = 한 에이전트/스텝, critic(§6)은 어드버서리얼 검증 스텝.
- 후속 소비 방식(오프라인 구움 / 사전 매트릭스 / 라이브 백엔드)은 **미결**(AskUserQuestion 보류) — 본 설계는 그와 독립(어느 방식이든 하니스 출력=Pack 데이터로 동일).

---

## 2. 입력 — 도메인 + 고객 환경 프로파일(★변수)

```
input = {
  domain: { id:'contract', label:'계약 관리', desc:'...업무 설명...' },
  customerProfile: {
    org: { name:'A사', industry:'제조', size:'중견' },
    legacy: [                                  // 레거시 시스템 인벤토리(★슬롯 출처·Connector 결정)
      { system:'ERP', vendor:'SAP', modules:['MM','FI'], integration:'API', dataAccess:'read' },
      { system:'계약관리', vendor:'자체구축', integration:'DB', dataAccess:'read-write' },
      { system:'문서저장소', vendor:'SharePoint', integration:'file', dataAccess:'read' },
    ],
    dataAvailability: { structured:['계약마스터','거래처'], documents:['계약서PDF'], gaps:['표준템플릿 디지털화 안됨'] },
    policy: { approvalDelegation:'금액구간 위임전결', riskAppetite:'보수', volume:'월 80건' },
    constraints: ['온프레미스 전용','개인정보 국외이전 금지'],
  }
}
```

**프로파일이 조건화하는 것**:
| 프로파일 항목 | 영향받는 출력 |
|---|---|
| `legacy[]` | `caseModel.slots[].source`/`extract` · `components`의 Connector 타깃(SAP/DB/file) |
| `dataAvailability.gaps` | 채울 길 없는 슬롯 → **HITL 보완 게이트**로 전환(§6 CQ-2) |
| `policy.approvalDelegation` | `knowledge.approvalLineByAmount` 결재선 |
| `policy.riskAppetite` | `knowledge.thresholds` 임계 강도(보수=낮은 임계) |
| `org.industry`·`volume` | `seeds` 더미데이터 사실성·규모 |
| `constraints` | `govern` 정책·Connector 가능 여부 |

> **"변수에 따라 시나리오가 바뀜"** = 같은 `domain` + 다른 `customerProfile` → 다른 슬롯 출처·Connector·더미·일부 룰. A사(SAP·보수) ≠ B사(자체구축·중도).

---

## 3. 출력 계약 — Domain Pack 시나리오 (데이터만)

하니스 출력 = `aap_domain_pack_spec` 스키마 + (B) 결정 레이어, **전부 데이터**:
```
pack = {
  id, label,                                   // 식별
  workDef, work[], compose[], components[],    // 서사·실행구조 (기존 스키마)
  surfaceSpec,                                 // 선언형 화면 (코드 ✕)
  caseModel:{ slots[], relations[] },          // (B) L4 온톨로지 — 슬롯 source=레거시 매핑
  knowledge:{ decisionTables[], lookupTables[], thresholds[] },  // (B) 명시지 룰 (데이터)
  seeds:[{ input:{slotValues}, label }],       // (B) 더미 케이스 — 모든 route 분기 커버
  gates[], govern[], stepLoop{},               // HITL·거버넌스
  provenance:{ profileRef, generatedBy:'harness', model, reviewedBy:null },  // ★검토 추적
}
```
- **`decide()` 함수는 출력 안 함** — §5 범용 해석기가 `knowledge`를 평가. 하니스는 룰을 **데이터**로만.
- `provenance` = 생성 출처·검토자 기록(블랙박스 방지, 사람 승인 전엔 `reviewedBy:null` → 미검증 표식).

---

## 4. 루프 — 10단계 (각 = LLM 스텝, 프로파일 관통)

| # | 단계 | 입력 | 출력 | 프로파일 영향 |
|---|---|---|---|---|
| S1 | 업무 이해·범위 | domain.desc, profile | `{goal, actors, outputs, scope}` | industry |
| S2 | **WBS 드릴다운**(꼼꼼히) | S1 | `subProcesses:[{id,label,detail,inputs,outputs,decisionPoints[]}]` | volume |
| S3 | 의사결정 분류 | S2 | `decisions:[{id, kind:'explicit\|tacit', why}]` | riskAppetite |
| S4 | **명시지 룰 생성** | S3.explicit, profile.policy | `knowledge{decisionTables,lookupTables,thresholds}` | **approvalDelegation·riskAppetite** |
| S5 | **데이터·시스템 매핑** | S2, profile.legacy | `caseModel{slots[],relations[]}` (slot.source→레거시 or gap) | **legacy·gaps** |
| S6 | 구성요소 매핑(5타입) | S4,S5, profile.legacy | `compose[],components[]` (Connector=레거시 타깃) | **legacy·constraints** |
| S7 | **더미데이터 생성** | S5,S4 | `seeds[]` — **모든 route 분기 타게 설계** | industry·volume |
| S8 | HITL 배치 | S3.tacit, S5.gaps | `gates[]`(암묵지 결정 + 데이터갭) | gaps |
| S9 | 시나리오 조립 | S1~S8 | `pack`(work/ops `@verdict` 바인딩·surfaceSpec 포함) | — |
| S10 | **Critic 검증**(§6) | pack | `{checks[], fixes[]}` → 실패 시 해당 단계 루프백 | — |

> S4·S5·S6·S7이 프로파일의 핵심 조건화 지점. critic(S10)이 통과시킬 때까지 루프.

---

## 5. `decide()` = 코어 범용 선언형 해석기 (하니스가 코드 안 만들게)

> **계약 P1 설계 보정**: `aap_pack_contract_decision_v0_1.md`는 `decide`를 팩 함수로 적었으나, **하니스 경로에서는 코어의 범용 `evaluate()`가 표준**(하니스는 데이터만). 팩 함수 `decide()`는 복잡 도메인 전용 escape hatch로만.

```
core.evaluate(caseData, knowledge) → verdicts[]   // 도메인 무관·1회 작성
  · lookupTables: key→row 룩업 verdict
  · thresholds:   expr 평가(슬롯·룩업 참조) → flag verdict
  · decisionTables: when[] 조건 첫매칭 → 분기 verdict (1차 verdict 집계 허용)
  각 verdict = {id, inputs, output, basis, loop, gate}   // basis=룰 id/행/식 (추적성)
```
- **표현력 경계**: `when`/`expr`는 **제한된 안전 DSL**(비교·논리·룩업참조·산술만, 임의 코드 ✕). 하니스가 이 DSL 데이터를 emit → 코어가 평가. → 코드 생성 위험 0·검증 가능.
- 이 해석기가 `knowledge` 데이터만으로 계약·구매·경비를 다 굴림(재사용 골격).

---

## 6. Critic 검증 (S10) — theater·블랙박스 차단

생성 Pack을 어드버서리얼로 검증, 실패 시 루프백:
1. **CQ 커버리지**: 모든 룰 입력이 `caseModel.slots`/1차 verdict에 존재. 모든 게이트가 verdict 근거 보유.
2. **데이터갭 정합**: `source=gap` 슬롯이 HITL 보완 게이트로 연결됐는가(채울 길 없는데 자동 판정 ✕).
3. **분기 커버리지**: `seeds`가 **모든 `decisionTables.route` 분기를 최소 1건씩** 실제로 타는가(§9-1 데이터 구동 사전 증명).
4. **추적성**: 모든 verdict basis 보유, DSL이 안전 경계 내.
5. **재현성**: `evaluate(seed)` 2회 동일.
6. **프로파일 정합**: Connector가 실제 `legacy`에 매핑, `constraints` 위반 구성 없음.

> critic이 곧 §9(데이터구동·추적성·재현성) 자동 검사. 통과 = "진짜로 도는 시나리오".

---

## 7. 기존 코드 seam 정합

- `pipeline.js` 주석: "Phase 3에서 `proposeBreakdown`/`proposeCompose`/`proposeGates`를 LLM으로 교체" → **S2/S6/S8이 정확히 그 자리.** 키워드 매칭 → LLM 단계.
- `authoring.js` `genericAuthor(text)` → S9 조립이 이를 확장(결정 레이어·더미·프로파일 추가).
- 출력 Pack은 기존 코어가 그대로 소비(하위호환). 신규 = `caseModel`·`knowledge`·`seeds`·`provenance` + 코어 `evaluate()`.

---

## 8. 소비 방식 (미결 — 하니스와 독립)

AskUserQuestion 보류. 어느 방식이든 하니스 출력=Pack 데이터로 동일:
- **A. 오프라인 구움**(추천 시작): 하니스 → Pack 커밋, 앱 API 0. 프로파일 조합은 생성한 것만.
- **B. 사전 매트릭스**: 핵심 변수 조합 N개 사전 생성, 앱 드롭다운 전환(인터랙티브 느낌·앱 API 0).
- **C. 라이브 백엔드**: 앱→프록시→API 즉석 재생성(유연·단일HTML 깨짐·나중).

---

## 9. 단계 · 다음
- **본 건 = 하니스 설계 문서만**(코드 0).
- **다음 후보**: ① 코어 `evaluate()` 선언형 해석기 + 안전 DSL 먼저(앱 결정론 기반) → 계약 P1을 `knowledge` 데이터로 구동·§6 critic 통과. ② 하니스를 이 환경 Workflow로 프로토타입(계약 도메인 + A사/B사 프로파일 2종 → 시나리오 2종 생성). ③ 소비 방식 확정(§8).
- **표준화 agent 과제**: `evaluate()` 안전 DSL 문법·verdict 스키마·`provenance`를 `aap_domain_pack_spec`에 반영.
- **금지**: 하니스가 `decide()`/`surface` **코드** emit(데이터만) · 앱 라이브 API · critic 없는 시나리오 채택(미검증 `reviewedBy:null` 노출).
