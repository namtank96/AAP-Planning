# 05_범용플랫폼

> **역할: 범용 AAP 플랫폼의 "확정 산출물·표준 스펙" 전용 폴더.**

## 무엇이 여기 들어가나
- 도메인에 종속되지 않는 **AAP 표준 런타임 문법·아키텍처·확장 전략** 문서
- 회의/손해사정/내부통제 등 도메인 데모에서 검증되어 **플랫폼 표준으로 승격된** 산출물

## 무엇이 여기 안 들어가나 (역할 구분)
- **작업·프로토타입 진행물은 `03_프로토타입/`에 둔다.** 특히 현재 고도화 중인
  범용 플랫폼 데모 본체 = `03_프로토타입/D_회의/aap_meeting_runtime_builder_*.html`.
  → D_회의는 "Reference Runtime Instance"(작업장), 05는 거기서 확정된 표준만 흡수.
- 회의 데모 빌드용 문서(merge_blueprint, screen_design, BUILD_PLAN 등)는 D_회의 유지.

## 현재 문서·구현
- **`app/`** — **범용 플랫폼 구현체 v0.1** (회의 데모 v0_22에서 추출·포팅). 멀티파일·`<script src>` 적재라 **더블클릭(file://)으로도 동작**(localhost 불필요).
  - `index.html` (셸) · `core/platform.css` · `core/core.js` (도메인 무관: 셸·실행엔진·우측 8계층·구성/관리 뷰, `window.AAP_PACK`을 읽어 부팅) · `packs/meeting.js` (회의 Domain Pack: 데이터 + 좌측 고객 서비스 화면 렌더러).
  - 핵심 분리: **코어=불변 / 팩=교체.** 새 도메인 = `packs/<domain>.js` 추가(데이터 5종 + surface). 4뷰(실행/구성/관리/HITL) 헤드리스 검증 OK.
  - 진행: **Step A·B·C 완료 — 3렌즈(정합·표준화·자율) 모두 데모로 충족.**
    - A: 데이터·surface 경계 분리(코어/팩).
    - B: ①구성 뷰 'Architecture Coherence' 정합 뷰(Operating Loop·8계층·Trust·도메인 경유 계층 점등) ②관리 뷰 'Run Trace · Decision Log'(자율 판단·HITL·반영 누적=거버넌스 증거) ③실행 뷰 '추론 루프' 배지 + compose 동적 구성요소 조합 칩.
    - C: **2번째 Domain Pack `packs/voc.js`(VOC 대응) + 상단 Domain Pack 드롭다운 스위처.** 같은 셸·엔진·8계층·HITL·정합 뷰·Run Trace로 **회의 ↔ VOC 무중단 교체** = "공통 Runtime 유지 + Domain Pack 교체"를 객관 입증(meeting 8단계·3게이트 ↔ VOC 7단계·2게이트, '회의 시각 선택' 슬롯 = 'VOC 보상 수준 선택'으로 코어 수정 0). `?pack=voc`로도 진입.
    - **자동 저작(Auto-Authoring) PoC**: 상단 **[＋ 업무 학습]** → 업무 소스 → AAP가 스스로 분해(의미화·**WBS**·역할·데이터·HITL·산출물) 애니메이션 → **선언형 Domain Pack 생성·등록·로드**(코드 ✕ 데이터만). 동반 **surface 선언형화**(`surfaceSpec`)로 함수 없이 데이터만으로 좌측 화면 렌더 → **AI가 emit 가능**. 생성 예시=제조 품질(런타임 생성). `core/authoring.js` + 코어 `headSpec/baseSpec/cmodalSpec`·`window.AAP_CORE`. `?author=1|run`.
    - **자동 저작 고도화 1·2 완료(260618)**: ① **전 팩 surfaceSpec 통일** — meeting·voc·quality 모두 함수 없이 **데이터(`surfaceSpec`)만**으로 작동(코어 generic 렌더가 아바타·회의 라이브·결과 카드·동적 상태까지 커버). ② **자유 소스 매핑** — [＋ 업무 학습] '직접 입력'에 임의 업무 설명 → `genericAuthor()`가 표준 7단계 골격 Pack 자동 생성·실행(제목 자동 추출). **→ 이제 팩 = 100% 데이터 = AI emit 타깃.** (meeting/voc에 미사용 surface 함수 잔존 — cleanup 후보)
    - 다음(후보): **실제 LLM 연동**(genericAuthor 자리에 LLM 호출, emit 타깃=이 스키마 / 앱 내 실시간은 localhost 서버 필요) · meeting/voc 잔존 함수 정리 · 라이브 Run Trace 실행 뷰 노출.
- `aap_platform_form_spec_v0_1.md` — **AAP 범용 플랫폼 형태 스펙** (form spec). 플랫폼 불변 vs Domain Pack 분리, Pack 인터페이스. (구현체 `app/`의 기준)
- `aap_domain_pack_spec_v0_1.md` — **Domain Pack 포맷 명세**(실행 가능 계약). 검증된 2팩(meeting·voc)에서 추출한 스키마 — 최상위 필드·work/ops·surface 계약·검증 규칙·작성 스켈레톤. **단기=손작성 기준 / 장기=AI 자동 저작(RFP→WBS식 도메인 breakdown)의 출력 타깃.** §9에 자동저작 매핑 + surface 선언형화 과제.
- `aap_runtime_expansion_strategy_v0_1.md` — AAP 표준 런타임 & 산업확장 전략
  (회의 데모를 최종 상품이 아닌 표준 작동 원리의 레퍼런스로 규정)
