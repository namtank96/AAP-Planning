# AAP 서비스화 로드맵 — PoC/데모 → 실서비스 v0.1

> **무엇**: 정합성 검토(`aap_정합성_서비스수준_검토_v0_1.md` §2)가 식별한 서비스 수준 갭을 **단계(Tier)·의존성·아키텍처 결정·소유**로 구체화. "데모 기준"을 "범용 플랫폼 운영"으로 끌어올리는 경로.
> **정합**: `aap_platform_to_runtime_roadmap_v0_1.md`(데모→운영, 3축·Phase 0~4)·객체모델 P1~P5(`aap_object_model_glossary` §5)를 **서비스 수준 렌즈로 재배열·확장**(중복 ✕). 결정런타임/하니스=`_AAP_결정런타임_진행내역_index.md`.

---

## 0. 프레이밍 — 8계층으로 본 "무엇이 남았나"

데모·하니스가 **이미 증명한 층**(상위) ↔ 서비스화가 **실체화할 층**(하위·통제):

| 8계층 | 상태 | 서비스화 과제 |
|---|---|---|
| L1 경험·접근 | ◑ 데모 UI | 멀티테넌트 진입·권한별 뷰 |
| L2 설계·개발 | ◑ 스튜디오 | 저작 파이프라인(하니스 제품화) |
| **L3 에이전트 코어** | ● 증명 | (유지) |
| **L4 지식·시맨틱** | ● 증명(caseModel·knowledge) | knowledge 자산화·버전 |
| **L5 데이터·연동** | ○ **mock** | **★실 Connector·OCR/STT·writeback** |
| **L6 AI 품질·평가** | ● 증명(critic·evaluate 게이트) | 운영 평가·드리프트 모니터 |
| **L7 컨트롤·거버넌스** | ○ **정적 표시** | **★RBAC enforcement·감사·정책 강제** |
| **L8 인프라** | ○ **file://** | **★영속·멀티테넌트·스케일·관측** |

> **핵심: 데모는 L3/L4/L6(지능)이 강하고, 서비스화는 L5/L7/L8(연동·통제·인프라)을 실체화하는 일.** 지능은 됐고, 신뢰·운영을 붙이는 단계.

---

## 1. 서비스 Tier 정의

| Tier | 정체 | 한 줄 |
|---|---|---|
| **T0**(현재) | 검증된 PoC | 결정 런타임 + 하니스 공장 증명. mock·file://·단일 |
| **T1** | 단일 고객·단일 도메인 파일럿 | **한 고객이 한 업무(계약)를 실데이터로 굴려 케이스가 누적·감사되는 내부 운영 도구** |
| **T2** | 멀티 도메인 프로덕션 | 한 고객이 계약·구매·경비 등 **여러 도메인 팩을 배포·운영**(하니스 공장이 공급) |
| **T3** | 멀티테넌트 플랫폼 | **다고객 SaaS형 범용 AAP** |

> **MVS(최소 실서비스) = T1의 P-persist + P-connector1 + P-rbac-basic.** 이 3개가 "데모"와 "서비스"의 경계.

---

## 2. 단계별 역량 (필요·의존·아키 결정·소유)

### T1 — 단일 고객 파일럿 (MVS 포함)
| 역량 | 무엇 | 아키텍처 결정 | 소유 |
|---|---|---|---|
| **P-persist** 🔴 | 케이스·trace·decision log 영속(세션 넘어 누적·감사·재현) | **local-first(IndexedDB) → 준실제 백엔드(SQLite/Postgres)**. STATE.trace→영속 store. case=`{id,packId,caseData,verdict,trace,decisions,ts}` | app/ + 백엔드 |
| **P-connector1** 🔴 | 실 read connector 1종(계약 마스터 DB/CSV→슬롯) + OCR 1종(계약서 PDF→슬롯) | **어댑터 패턴**: `caseModel.slot.{source,extract}`가 계약. extract='connector'/'doc' seam. 신뢰도<임계→HITL | 백엔드/connector |
| **P-rbac-basic** 🔴 | 역할(담당/검토/승인/관리)별 액션 게이팅(deploy·HITL승인·편집) | 현 govern RBAC 매트릭스를 **enforce**(표시→강제). 액션 전 권한 체크 훅 | app/ |
| **P-obs-basic** 🟡 | 영속 데이터 위 KPI(런·HITL율·게이트차단·자동승인율·도메인별) | 현 Agent Ops/Eval를 **영속 소스로** 재배선(전역 집계+케이스 드릴다운, 객체모델 §3.2) | app/ |
| **P-studio-decision** 🟡 | 결정층 스튜디오 노출(C1)+flow `next`(C2) | 검토 핸드오프(도메인팩=route/슬롯/임계 탭, 자산=knowledge, 워크플로우=분기 시각화) | app/ |
> **T1 산출**: "한 고객이 계약 심사를 실데이터로 돌리는, 감사·재현 가능한 운영 도구." (= 1차 PoC 내부통제 콘솔의 실제화 경로)

### T2 — 멀티 도메인 프로덕션
| 역량 | 무엇 | 의존 | 소유 |
|---|---|---|---|
| **P-project**(L2) 🟡 | 프로젝트 계층 실체화(SLA·리스크성향·에스컬레이션·케이스 묶음) | P-persist | app/(객체모델 P4) |
| **P-asset-global** 🟡 | 전역 자산 카탈로그 + **knowledge(임계표·룰) 자산화** + lineage(사용 팩/케이스) | — | app/(객체모델 P2) |
| **P-variant** 🟡 | 고객 프로파일→variant 선택(케이스 생성 시 어느 시나리오) | 하니스 프로파일 매트릭스 | 이 트랙 + app/ |
| **P-authoring** 🟢 | 하니스를 사내 **반자동 저작 파이프라인**으로(오프라인 bake→검토→배포) | 하니스 v0.2·어댑터 v0.2 | 이 트랙 + app/ |
| **P-connector-N** | 도메인별 connector 확장(ERP write-back·발주·전표) | P-connector1 | 백엔드 |
> **T2 산출**: "한 고객의 백오피스 여러 업무를 AAP로 운영." 하니스가 새 도메인을 게이트 통과본으로 공급.

### T3 — 멀티테넌트 플랫폼
| 역량 | 무엇 | 의존 | 소유 |
|---|---|---|---|
| **P-tenant** 🔴 | 테넌트 격리(팩·케이스·자산·로그·정책 스코프) | P-persist 재설계 | 백엔드 |
| **P-rbac-full** 🔴 | 테넌트×역할×리소스 RBAC + ISO42001/AI 거버넌스 인증 매핑 | P-rbac-basic·P-tenant | 백엔드 |
| **P-scale** | 영속·실행·관측 스케일(큐·워커·메트릭 백엔드·알림) | P-persist·P-obs | 인프라 |
| **P-sla** | SLA·감사 보존·드리프트/모델 모니터(L6 운영) | P-obs | 인프라 |
> **T3 산출**: "범용 AAP 플랫폼(다고객 SaaS)" = 선제안서 "범용 플랫폼" 주장의 운영 실체.

---

## 3. 의존성 그래프 (시퀀싱)

```
P-persist(루트) ──┬─ P-obs-basic ── P-sla
                  ├─ P-rbac-basic ── P-rbac-full
                  ├─ P-project
                  └─ P-tenant ─────── P-scale
P-connector1 ─── P-connector-N        (persist와 결합 시 실가치)
P-studio-decision (C1/C2, persist 무관·독립 가능)
P-asset-global / P-variant / P-authoring (T2, 독립도 높음)
```
- **P-persist가 루트** — 관측·RBAC·프로젝트·테넌트 다 의존. **가장 먼저.**
- **P-connector1·P-studio-decision은 독립** — 병렬 착수 가능(빠른 가치).
- **MVS 임계선** = persist + connector1 + rbac-basic 셋이 동시에 서면 "서비스".

---

## 4. 이 트랙(하니스/결정) 역할 vs 핸드오프

| 항목 | 이 트랙(app/ 무관) | app/ 세션 | 백엔드/인프라(신규) |
|---|---|---|---|
| 결정 시나리오·게이트통과 팩 공급 | ✅ 완료(`packs_baked_v2/`) | 로드·교체 | — |
| 결정층/`evaluate`/검증 표준 | ✅ 스펙·엔진 | 통합 | — |
| **Connector 계약 스펙**(slot.source/extract 인터페이스) | ◐ 스펙화 가능 | 소비 | 구현 |
| 하니스 저작 파이프라인(P-authoring) | ✅ 주도 | bake 소비 | — |
| variant 매트릭스(프로파일 조합) | ✅ 생성 | 선택 UI | — |
| 영속·RBAC·멀티테넌트·관측·스튜디오 UI | 설계·검토만 | **구현** | 인프라 |

> **이 트랙이 더 할 app-무관 작업**: ① Connector 계약 스펙(어댑터 인터페이스: read/write·auth·신뢰도·에러·HITL 폴백) ② variant 매트릭스 생성(도메인×프로파일) ③ 하니스 저작 파이프라인 문서화. — 인프라·UI는 핸드오프.

---

## 5. 권고 — 다음 한 수
**P-persist + P-connector1을 동시에 띄우는 게 데모→서비스 임계선.** 그 전에 **결정층 스튜디오 노출(C1)·flow next(C2)**는 persist와 무관하게 즉시 가치(거버넌스 가시성)라 병렬 착수 권장. 이 트랙은 **Connector 계약 스펙**을 먼저 써 두면(app-무관) 백엔드 착수 시 바로 물림.

> 결론: 지능(L3/L4/L6)은 증명됐다. **서비스화 = L5(연동)·L7(통제)·L8(인프라)를 mock→실체로.** 루트는 영속(P-persist), 임계선은 persist+connector+rbac-basic(MVS), 범용 플랫폼은 멀티테넌트(T3).
