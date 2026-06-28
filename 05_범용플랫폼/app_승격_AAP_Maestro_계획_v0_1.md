# 정본 앱 승격 계획 — `app_v2/` → `maestro/` (AAP Maestro)

**결정(260629)**: 제품형 IA 개편이 끝난 `app_v2/`를 **정본**으로 승격한다. 정본 제품명 = **AAP Maestro**(폴더 `maestro/`). 기존 `app/`은 `_archive/`로 보관(삭제 ✕).

- 명칭 사유: AAP 핵심 메시지("Agent 남발 ✕ → 업무 이해 → 실행구조 구성 → Agent·Module·기존솔루션·Connector·Policy를 **조합·지휘**")의 *지휘자(Maestro)* 메타포. "console/studio/portal"은 내부 기획툴 느낌이라 반려, 제품 브랜드형으로 채택.

## 승격 순서

1. **1단계 정리 완료** (진행 중) — 미정의 아이콘 2(`list-checks`·`receipt`) 등록 + Y2 런타임 자동 surfaceSpec 폭/밀도 보정. `app_v2/` 안에서 끝남.
2. **`app_v2/` → `maestro/` 리네임** (이 세션 소유 — 단독 가능):
   - 상대경로(`core/`·`packs/`) 리네임에 생존 — index.html 내부 참조는 상대라 무변경. 절대/하드코딩 경로만 점검·치환.
   - 브랜드 문자열을 **"AAP Maestro"**로(topbar brand·brand-sub·`<title>`·README류). "app_v2"·"v2" 잔재 제거.
   - 딥링크(`?view=`·`?seed=`·`?dev=1`·`?pipeline=1`) 동작 재검증, 헤드리스 error 0.
   - `git mv`로 이력 보존.
3. **`app/` → `_archive/` 아카이브** (⚠️ **owner 세션 소관**):
   - `app/`은 현재 owner 세션이 **활성 편집 중**(분해 뷰 배선 viz_*·llm_breakdown·pipeline.js·index.html 등). 임의 이동 시 그 세션 작업 손상.
   - owner 세션 작업 일단락 시점에 타이밍 맞춰 `app/` → `_archive/app_<날짜>/`로 이동.
   - 라이브 app/에만 있고 maestro/에 미반영된 변경(있다면)은 이동 전 maestro/로 흡수 여부 확인.
4. **마무리** — 핸드오프 §5·메모리(`project_app_v2_console` → 정본=maestro) 갱신, 잔여(가이드 현행화·더미 정리) 인계.

## 미접촉 가드레일
- `_archive/`, `03_프로토타입/*` 데모, 렌탈 트랙.
- 2·3번 사이 owner 세션과 충돌 방지: app/ 이동은 owner 세션 신호 후.
