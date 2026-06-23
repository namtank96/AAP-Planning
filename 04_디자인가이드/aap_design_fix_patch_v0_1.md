# 디자인 부채 수정 패치 v0.1 — 즉시 적용용 (260623)

> **성격**: 부채 감사(`aap_design_debt_audit_v0_1.md`)의 D1·D3·D4를 **충돌 없이 붙일 수 있게** 미리 만든 override 패치. app/이 다른 세션 미커밋(platform.css +504·index·core/packs)이라 직접 못 넣음 → **그 세션 체크포인트 커밋 후 적용.**
> **적용 방식(둘 중 택1)**:
> - **(A) override 파일**: 아래 CSS를 `05_범용플랫폼/app/core/platform-fix.css`로 저장 + `index.html` `<head>`에 `platform.css` **다음 줄**에 `<link rel="stylesheet" href="core/platform-fix.css">` 1줄. (platform.css 미편집 → 충돌 0, 캐스케이드로 override)
> - **(B) platform.css 직접**: 레인 분리로 platform.css를 내가 인수하면 :root에 토큰 추가 + 말미에 D1 블록 병합.

---

## 패치 CSS (override 파일 = platform-fix.css 내용)

```css
/* ===== AAP Design Fix v0.1 — 부채 감사 D1·D3·D4 (platform.css 다음 로드) ===== */

/* D1. 스크롤바 비표시 + 스크롤 기능 유지 (§6.7.2) — overflow:auto 18곳 일괄 */
*{ scrollbar-width:none; -ms-overflow-style:none; }
*::-webkit-scrollbar{ width:0; height:0; }
/* 스크롤 가능 신호 = 컨테이너 하단 fade 힌트(스크롤바 대체).
   주요 스크롤 컨테이너에 부여 — 필요 시 클래스 추가. */
.scroll, .run-evid .flow, .run-surface .con-body, .pl-body, .dom-body, .trace{
  position:relative;
}
.scroll::after, .dom-body::after{
  content:""; position:sticky; bottom:0; left:0; right:0; height:18px; display:block;
  background:linear-gradient(transparent, var(--bg)); pointer-events:none; margin-top:-18px;
}

/* D3·D4. 토큰 스케일 정의 (§4.3) — 신규/치환 UI가 참조. 정의만으로는 룩 불변(점진 치환). */
:root{
  --sp-1:4px; --sp-2:6px; --sp-3:9px; --sp-4:11px; --sp-5:14px; --sp-6:18px;
  --r-chip:7px; --r-node:9px; --r-card:12px; --r-panel:15px; --r-pill:999px;
  --fs-micro:9px; --fs-sub:11px; --fs-body:13px; --fs-h:15px; --fs-hero:17px;
}
```

> **주의**: 위 `*{scrollbar-width:none}` 는 전역이라 즉시 효과(D1). 토큰(:root)은 **정의만** — 기존 매직넘버를 var()로 치환하는 건 platform.css 인수 후 점진(룩 변화 0 목표, 감사 D2 다크/soft 색 보존).
> **검증(적용 후)**: 헤드리스로 전 뷰 부팅·스크롤바 안 보임·레이아웃 무회귀·JS 에러 0.

---

## 패치 2 — 접근성(a11y) §5.12 (CSS override + JS 메모)

### 2-A. CSS (platform-fix.css에 이어 붙이기 · override만)
```css
/* 포커스 가시 — 모든 상호작용 요소 teal ring(:focus-visible, 마우스엔 안 뜸) */
.gnav-i:focus-visible, .ty-chip:focus-visible, .cat-card:focus-visible, .cp-btn:focus-visible,
.snode:focus-visible, .dom-tab:focus-visible, .wfp-grp-h:focus-visible, .ev-more:focus-visible,
[data-domtab]:focus-visible, [tabindex]:focus-visible, button:focus-visible{
  outline:2px solid var(--aap); outline-offset:2px; border-radius:var(--r-node);
}
/* 모션 민감 사용자 — §6.9 트랜지션·무한 모션 축소 */
@media (prefers-reduced-motion: reduce){
  *{ animation-duration:.001ms !important; animation-iteration-count:1 !important;
     transition-duration:.001ms !important; scroll-behavior:auto !important; }
}
```
### 2-B. JS-측(app 세션 몫 — core.js/wfeditor.js) 메모
- 클릭만 되는 비-button 요소(`.snode`·노드·`.cat-card` 등)에 `tabindex="0"` + Enter/Space 핸들러.
- 아이콘 단독 버튼에 `aria-label`(이미 다수 `data-tip` 보유 → 병행).
- 상태색 배지에 텍스트 라벨 병행(색각 보조) — 대부분 이미 텍스트 있음, 점검만.

## 패치 3 — 빈/로딩/에러 상태 §5.11 (CSS override + 메모)

### 3-A. CSS (override)
```css
/* 빈 상태 — 중앙 옅은 안내(인박스 .ibx-empty 등 공통 톤) */
.ibx-empty, .empty-state{
  text-align:center; color:var(--faint); font-size:var(--fs-sub);
  padding:32px 16px; line-height:1.7;
}
.empty-state .es-act{ margin-top:10px; } /* 1차 액션 버튼 자리 */
/* 로딩 스켈레톤 — 카드 자리 옅은 박스(깜빡임 없이) */
.skeleton, .sk-box{ background:var(--line); border-radius:var(--r-card); min-height:48px; opacity:.6; }
/* 에러·차단 — red 좌측 보더 + 사유(게이트 0개 차단 .pl-gate-block 패턴 일반화) */
.err-block, .block-note{
  border-left:3px solid var(--red); background:var(--red-soft);
  border-radius:var(--r-node); padding:10px 13px; font-size:var(--fs-sub); color:var(--red);
}
```
### 3-B. 메모
- 빈/에러 문구는 **업무 언어**(raw 스택/JSON ✕). 빈 상태엔 항상 다음 행동(1차 액션).
- 로딩은 §6.9 `spin` + "AAP가 ~중" 1줄 병행.

---

## 적용 순서(체크포인트 후, 한 번에)
1. `core/platform-fix.css` 생성(패치 1·2·3 합본) + index `<link>` 1줄.
2. JS-측(패치 2-B) = app 세션이 tabindex/aria 보강.
3. 헤드리스 검증: 전 뷰 부팅·스크롤바 안 보임·포커스 ring·빈/에러 톤·무회귀·JS 에러 0.

## 남은 부채(패치 범위 밖 — platform.css 인수 후)
- D2 하드코딩 hex ~340 선별 토큰화 / D3·D4 기존 값 → 스케일 토큰 var() 치환 (룩 보존 점진).
