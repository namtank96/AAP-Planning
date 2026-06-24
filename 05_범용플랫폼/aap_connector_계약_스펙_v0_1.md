# AAP Connector 계약 스펙 — slot 충전 인터페이스 v0.1

> **무엇**: 서비스화 로드맵(`aap_서비스화_로드맵_v0_1.md`) P-connector1·§4가 지목한 **app-무관 선행 작업**. 결정 런타임의 `caseModel.slot.{source,extract}`를 **백엔드가 구현할 어댑터 인터페이스**로 못박는다.
> **위치**: 8계층 **L5(데이터·연동)** = DB/API/SaaS Connector·OCR·Parser·Writeback·System Sync. 결정 엔진(`_decision_engine/evaluate.js`)은 **순수·결정론**이라 외부를 모름 → Connector가 evaluate() **이전**에 `caseData`를 채우고, evaluate() **이후**에 verdict를 외부로 되쓴다(writeback).
> **이 트랙 역할**: 스펙화(계약). **구현=백엔드**. app/ 세션=소비(슬롯 충전 호출부·HITL 폴백 UI). 코드 0.

---

## 0. 한 줄 — Connector는 결정의 양쪽 끝

```
[외부 시스템/문서]  --read connector-->  caseData(슬롯)  --evaluate()-->  verdict  --write connector-->  [외부 원장]
        L5                                  L4/L3            L3/L6              L5
```
- 결정 엔진은 `caseData`(평평한 슬롯 객체)와 `knowledge`만 받는다 — **출처를 모른다**(재현성·테스트 가능성).
- Connector는 **슬롯을 채우는 책임**(read)과 **결정을 반영하는 책임**(write)만 진다. 판정 로직 ✕.
- **신뢰도(confidence)** 가 임계 미만이면 슬롯은 "미확정"으로 표시 → **HITL 게이트로 승격**(자동 판정 금지).

---

## 1. 슬롯 계약 (caseModel.slot — 이미 확정된 형)

`caseModel.slots[]` 각 원소:
```json
{ "key":"dsr", "label":"DSR", "type":"number",
  "source":"여신코어 API / 부채현황 테이블",
  "extract":"connector" }
```
| 필드 | 의미 | Connector 관점 |
|---|---|---|
| `key` | caseData 키(evaluate `$key` 참조) | **충전 대상 식별자** |
| `type` | number/string/array/boolean/date | **반환값 강제 캐스팅 타입** |
| `source` | 사람이 읽는 출처(레거시 어디서) | 어느 connector 인스턴스가 담당하는지 라우팅 힌트 |
| `extract` | 충전 방식 enum | **어댑터 종류 선택 키** ↓ |

`extract` enum → 어댑터 종류:
| extract | 어댑터 | 입력 | 신뢰도 |
|---|---|---|---|
| `manual` | (없음) | 사람이 입력 | 1.0(사람) |
| `rule` | 파생 | 다른 슬롯에서 계산 | 1.0(결정론) |
| `connector` | **DB/API/SaaS read** | 시스템 키(계좌·사업자번호) | 1.0(정형) 또는 소스 제공값 |
| `doc` | **OCR/Parser** | 문서(PDF/이미지) | **모델 confidence(<1)** ★HITL 트리거 |
| `llm` | LLM 추출 | 비정형 텍스트 | 모델 confidence(<1) ★HITL |

> **핵심 분기**: `connector`(정형, 신뢰=1) vs `doc`/`llm`(비정형, 신뢰<1 → 임계 미달 시 HITL). 세탁·손해사정 데모의 "AAP가 확인 vs 담당자 판단"이 여기서 갈린다.

---

## 2. Read Connector 인터페이스 (슬롯 충전)

### 2.1 시그니처 (백엔드 구현 대상)
```
ConnectorRead.fetch(req) -> SlotFill[]

req  = { caseId, connectorId, slotKeys:[..], keys:{ 조회키 } }
SlotFill = {
  slotKey,                       // caseModel.slot.key
  value,                         // type으로 캐스팅된 값(null=조회 실패·미존재)
  confidence,                    // 0..1 (정형 connector=1.0, doc/llm=모델값)
  source:{ system, ref, ts },    // 추적성: 어느 시스템·레코드·시각(감사·재현)
  status                         // 'ok' | 'not_found' | 'low_confidence' | 'error'
}
```

### 2.2 충전 → caseData 조립 규칙
1. 각 슬롯을 담당 connector로 라우팅(`source`/매핑 테이블 기준).
2. `SlotFill.value`를 `caseData[slotKey]`에 주입(`type` 캐스팅: number→Number, array→`·` split 등 — `_coerce` 규칙 재사용).
3. `confidence < slot.threshold(기본 0.85)` 또는 `status≠ok` → 해당 슬롯 **`pending`** 마킹 → 그 슬롯에 의존하는 route 룰은 **평가 보류**, 케이스를 HITL 게이트로.
4. `caseData`가 완성되면(또는 pending 포함 상태로) `evaluate(caseData, knowledge)` 호출.

> **추적성**: 모든 SlotFill의 `source{system,ref,ts}`를 case trace에 적재 → evaluate `inputs`(읽은 슬롯)와 결합해 "어느 값이 어디서 왔고 어느 룰에 쓰였나" 완전 재현(L7 감사).

### 2.3 어댑터 3종 (구현 시드)
| 종류 | 예 | 반환 | 에러 폴백 |
|---|---|---|---|
| **DB/API** | 여신코어·CB사·e나라도움 | 정형값, conf=1 | timeout/auth fail → `status:error` → HITL(자동 판정 ✕) |
| **OCR/Doc** | 소득증빙PDF·신청서 | 추출값+conf | conf<임계 → `low_confidence` → 담당자 확인 슬롯 |
| **SaaS** | DocuSign·Notion(B사 프로파일) | 상태/메타 | rate-limit → 재시도(백오프)→ 실패 시 HITL |

---

## 3. Write Connector 인터페이스 (verdict writeback)

evaluate 후 `verdict.outcome`이 확정(또는 HITL 승인)되면 외부 원장에 반영.
```
ConnectorWrite.commit(req) -> WriteResult

req = { caseId, connectorId, action, payload, idempotencyKey }
WriteResult = { status:'committed'|'rejected'|'error', ref, ts, message }
```
- `action` = 팩의 `writeback` 대상(여신원장 등록·예산 차감·전표 생성·계약 체결).
- **idempotencyKey** 필수 — 멱등(재생/재시도가 이중 반영 ✕). 데모 `dispatchAction` 멱등 가드의 실제판.
- **권한 경계**(L7): write는 **HITL 승인·결재 권한 통과 후에만**. Connector는 "준비·요청"까지, 최종 확정은 RBAC enforce(P-rbac-basic) 통과 필요. (데모 v0.55 권한 경계 문구의 실제 강제.)
- 실패 시 `status:error` + 케이스 상태 롤백 표시(부분 반영 금지 — 보상 트랜잭션 또는 재시도 큐).

---

## 4. 신뢰도·HITL 폴백 (L5↔L7 접점)

| 상황 | 슬롯 status | 결정 처리 | UI(app/ 소비) |
|---|---|---|---|
| 정형 connector ok | ok, conf=1 | 즉시 평가 | 자동 확인 표시 |
| doc conf≥임계 | ok | 평가(근거에 출처·conf 표기) | "AAP 확인(신뢰 0.9x)" |
| doc conf<임계 | low_confidence | **슬롯 pending** → 의존 룰 보류 → HITL | "담당자 확인 필요" 슬롯 강조 |
| 조회 실패 | not_found/error | HITL(자동 판정 ✕) | "조회 실패 — 수기 입력" |

> **원칙**: Connector 불확실성은 **결정을 막지 않고(엔진은 돈다) 슬롯을 미확정으로** 만들어 **HITL로 승격**. 명시지(정형)=자동, 암묵지·저신뢰(비정형)=사람. 데모 전반의 핵심 메시지를 인프라 계약으로 못박은 것.

---

## 5. 인증·운영 (백엔드 구현 항목)

| 항목 | 계약 |
|---|---|
| **auth** | connector별 자격(API key/OAuth/mTLS) — 테넌트 스코프(T3). 자격은 Connector 레지스트리에 보관, 슬롯 스펙엔 노출 ✕ |
| **레지스트리** | `connectorId → { kind, endpoint, auth, slotMap, retry, timeout }`. 팩은 `connectorId`만 참조(느슨한 결합) |
| **에러** | 모든 어댑터 공통 `status` enum. 절대 throw로 결정 엔진까지 전파 ✕(엔진은 caseData만 받음) |
| **재시도** | rate-limit/timeout=지수 백오프, 한도 초과 시 HITL 폴백(워크플로우 evalfix 레이트리밋 교훈 동일) |
| **관측** | fetch/commit 지연·실패율·conf 분포 = P-obs-basic KPI 소스 |

---

## 6. 이 스펙으로 닫히는 것 · 핸드오프

| | 상태 |
|---|---|
| **이 트랙(app-무관)** | ✅ slot.extract 계약·read/write 시그니처·신뢰도 HITL 폴백·에러 enum 스펙화 |
| **백엔드(신규)** | Connector 레지스트리·어댑터 3종(DB/OCR/SaaS)·writeback 멱등·auth·재시도 **구현** |
| **app/ 세션** | 슬롯 충전 호출부(evaluate 전 fetch)·pending 슬롯 HITL 승격 UI·write 전 RBAC 게이트 |

> **다음 한 수**: 백엔드 착수 시 이 §2.1/§3 시그니처가 곧 인터페이스. 결정 엔진(`evaluate.js`)·게이트통과 팩(`packs_baked_v2/`)은 **이미 준비**됐고, Connector는 그 **양쪽 끝(슬롯 충전·verdict 반영)** 만 채우면 T1(MVS) 임계선의 P-connector1이 선다.
