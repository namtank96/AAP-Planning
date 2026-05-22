# KT-Onto Design System v1.0

**작성일**: 2026-05-22
**작성자**: KT DS AX컨설팅팀 김기욱
**목적**: KOAMI 온톨로지 사업 관련 프로토타입(HR Studio · 손해사정 포털 · 자동차 영향도 분석) 및 PPT 발표 자료의 공통 디자인 시스템 정의
**스타일**: 검정/회색 + KT 레드 강조의 미니멀·심플·가시성 우선

---

## 1. 참고 레퍼런스 — 5개 핵심 사례

| 사이트 | 컬러 시스템 | 타이포 | 시각 특징 | 적용도 |
|---|---|---|---|---|
| **Palantir** | 순흑(#000) + 순백(#FFF), accent X | Sans-serif 대형 | 미니멀 극단, dense data viz | ★★★ 가장 가까운 톤 |
| **Linear** | 다크 + warm grey + purple accent | Inter | 3-token 시스템 (base·accent·contrast) | ★★★ 시스템 정교 |
| **Enhans** | 다크 + 화이트 + blue accent | Sans-serif | 카드 모듈 + 여백, 화살표 인터랙션 | ★★★ 동일 도메인 (Ontology) |
| **Vercel** | 다크 + grayscale + 단일 accent | Geist | 개발자 친화, 타이포 dominant | ★★ |
| **Tesla** | 검정 + 빨강 accent | Custom sans | 검정+빨강 미니멀의 정석 | ★★★ 컬러 매칭 정확 |

→ KT-Onto Design System = **Palantir 미니멀 discipline + Linear 토큰 정교 + Tesla 컬러 매칭 + Enhans 도메인 일치** 융합.

---

## 2. 디자인 원칙 (Design Principles)

1. **미니멀 우선** — 정보 밀도보다 여백 우선. 한 화면/페이지 여백 비율 40% 이상.
2. **검정·회색·강조 1색** — 컬러 팔레트 최소화. KT 레드는 강조 5% 이하 면적에만.
3. **타이포가 시각 주도** — 색상·일러스트보다 타이포 위계로 정보 전달.
4. **데이터 dense 영역만 예외** — KG 도식·표·시뮬레이션 영역은 정보 밀도 ↑ 허용.
5. **접근성 보장** — WCAG AA 기준(텍스트 4.5:1 대비) 준수.

---

## 3. Color Tokens — 3-Tier 토큰 시스템

### 3.1 Core Tokens (Foundation)

#### Dark Mode (프로토타입 기본)

```css
/* Neutrals — 순흑 X, deep charcoal */
--color-bg-base       : #0A0A0B;    /* 페이지 배경 */
--color-bg-elevated   : #141416;    /* 1단계 elevation (카드) */
--color-bg-overlay    : #1C1C1F;    /* modal · dialog */
--color-bg-subtle     : #232327;    /* sub-section · table header */

/* Text — 순백 X, off-white */
--color-text-primary  : #F5F5F7;    /* 본문 · 헤딩 */
--color-text-secondary: #A1A1A6;    /* 보조 텍스트 */
--color-text-tertiary : #6E6E73;    /* 캡션 · 메타 */
--color-text-disabled : #48484A;

/* Borders */
--color-border-subtle : #2C2C2E;
--color-border-default: #38383A;
--color-border-strong : #48484A;

/* Accent — KT Red 계열 */
--color-accent-base   : #E60012;    /* KT 레드 메인 */
--color-accent-hover  : #FF1A2E;    /* 10% 밝게 (interactive) */
--color-accent-muted  : #4A1014;    /* 다크 배경 위 미세 강조 (배경용) */
--color-accent-on     : #FFFFFF;    /* accent 위 텍스트 */

/* Semantic (선택 사용) */
--color-success       : #30D158;
--color-warning       : #FF9F0A;
--color-danger        : #FF453A;    /* KT 레드와 차별 위해 별도 */
```

#### Light Mode (PPT · 인쇄 호환)

발표 자료(PPT)는 light 권장 — 프로젝터·인쇄 가시성:

```css
--color-bg-base       : #FFFFFF;
--color-bg-elevated   : #F5F5F7;
--color-bg-subtle     : #FAFAFA;
--color-text-primary  : #111111;
--color-text-secondary: #555555;
--color-text-tertiary : #888888;
--color-border-subtle : #EEEEEE;
--color-border-default: #E5E5EA;
--color-border-strong : #D1D1D6;
--color-accent-base   : #E60012;    /* 동일 */
--color-accent-hover  : #C5000F;
--color-accent-muted  : #FFF0F2;    /* light 배경용 옅은 핑크 */
--color-accent-on     : #FFFFFF;
```

### 3.2 Alias Tokens (Context)

```css
--surface-page        : var(--color-bg-base);
--surface-card        : var(--color-bg-elevated);
--surface-emphasis    : var(--color-bg-subtle);
--text-heading        : var(--color-text-primary);
--text-body           : var(--color-text-secondary);
--text-caption        : var(--color-text-tertiary);
--accent-primary      : var(--color-accent-base);
--accent-on-surface   : var(--color-accent-on);
```

### 3.3 Component Tokens (사용 예시)

```css
--btn-primary-bg      : var(--accent-primary);
--btn-primary-text    : var(--accent-on-surface);
--card-bg             : var(--surface-card);
--card-border         : var(--color-border-subtle);
--card-accent-bar     : var(--accent-primary);
```

### 3.4 KT 레드 사용 원칙

- **면적 5% 이하** 적용 (Palantir "accent X" 원칙의 KOAMI 적용)
- 적용 위치: **강조 막대 · ★ 마커 · 핵심 키워드 굵게 · CTA 버튼 · 도식 강조 노드**
- **본문 텍스트 컬러로 사용 비권장** (가독성·진동 효과)
- 텍스트 강조 필요 시 → **off-white + 굵게** 우선 사용

---

## 4. Typography Scale

### 4.1 폰트 패밀리

```css
--font-sans     : "Pretendard", -apple-system, BlinkMacSystemFont,
                  "Segoe UI", Roboto, sans-serif;
--font-mono     : "JetBrains Mono", "D2Coding", "SF Mono", monospace;
```

→ **Pretendard 통일** (한글·영문 일관성).

### 4.2 Type Scale (8pt base)

| 토큰 | 크기 | Line Height | Weight | 용도 |
|---|---|---|---|---|
| `--text-display` | 56pt | 1.1 | 800 | 표지 헤드라인 |
| `--text-h1` | 40pt | 1.2 | 700 | Part 표지 |
| `--text-h2` | 32pt | 1.25 | 700 | 페이지 메인 제목 |
| `--text-h3` | 24pt | 1.3 | 600 | 섹션 제목 |
| `--text-h4` | 18pt | 1.35 | 600 | 카드 제목 |
| `--text-body-lg` | 16pt | 1.5 | 400 | 본문 강조 |
| `--text-body` | 14pt | 1.5 | 400 | 본문 |
| `--text-caption` | 12pt | 1.4 | 400 | sub-라벨 · 메타 |
| `--text-micro` | 10pt | 1.3 | 500 | 배지 · tag |

### 4.3 Weight

```css
--weight-regular: 400;
--weight-medium : 500;
--weight-semi   : 600;
--weight-bold   : 700;
--weight-ex     : 800;
```

---

## 5. Spacing Scale (8pt 기반)

```css
--space-1  : 4px;
--space-2  : 8px;
--space-3  : 12px;
--space-4  : 16px;
--space-5  : 24px;
--space-6  : 32px;
--space-7  : 48px;
--space-8  : 64px;
--space-9  : 96px;
--space-10 : 128px;
```

**원칙**: 한 페이지/화면 여백 비율 **40% 이상** (Palantir·Linear 정석).

---

## 6. Layout Grid

```css
/* 12 컬럼 그리드 */
--container-max  : 1280px;
--gutter         : 24px;     /* var(--space-5) */
--margin-x       : 64px;     /* var(--space-8) */

/* 페이지 영역 */
--header-height  : 64px;
--sidebar-width  : 280px;
--content-padding: 32px;     /* var(--space-6) */
```

---

## 7. Components — 7종 표준

### 7.1 Card

```css
.card {
  background: var(--surface-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: 12px;
  padding: 24px;
}

.card--emphasis {
  border-left: 3px solid var(--accent-primary);
  padding-left: 21px;
}
```

### 7.2 Button

```css
/* Primary */
.btn-primary {
  background: var(--accent-primary);
  color: var(--accent-on-surface);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 150ms ease-out;
}
.btn-primary:hover { background: var(--color-accent-hover); }

/* Secondary */
.btn-secondary {
  background: transparent;
  border: 1px solid var(--color-border-default);
  color: var(--text-heading);
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--text-body);
  padding: 10px 20px;
}
```

### 7.3 Badge (★ · 카운터 · 라벨)

```css
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 700;
  border-radius: 4px;
}

.badge--accent { background: var(--accent-primary); color: white; }
.badge--subtle { background: var(--color-bg-subtle); color: var(--text-body); }
```

### 7.4 Divider

```css
.divider { border-top: 1px solid var(--color-border-subtle); }

.section-divider {
  border-left: 3px solid var(--accent-primary);
  padding-left: 12px;
  font-weight: 700;
}
```

### 7.5 Table

```css
.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: var(--surface-emphasis);
}

.table th {
  color: var(--text-heading);
  font-weight: 600;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--color-border-default);
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
  color: var(--text-body);
}

.table tr:nth-child(even) { background: var(--surface-emphasis); }

/* 강조 컬럼 (예: KG+Ontology) */
.table .col--emphasis {
  background: var(--color-accent-muted);
  border-left: 2px solid var(--accent-primary);
  color: var(--text-heading);
  font-weight: 600;
}
```

### 7.6 Tag / Chip

```css
.tag {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: var(--color-bg-subtle);
  color: var(--text-body);
  border: 1px solid var(--color-border-subtle);
}

.tag--accent {
  background: var(--color-accent-muted);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}
```

### 7.7 Header / Navigation

```css
.header {
  height: var(--header-height);
  background: var(--surface-page);
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  padding: 0 var(--margin-x);
}
```

---

## 8. Motion — 애니메이션

### 8.1 Duration

```css
--motion-fast   : 150ms;   /* hover · focus · button */
--motion-base   : 250ms;   /* page transition */
--motion-slow   : 400ms;   /* modal · dialog · overlay */
```

### 8.2 Easing

```css
--ease-out      : cubic-bezier(0.16, 1, 0.3, 1);   /* Linear · Vercel 표준 */
--ease-in-out   : cubic-bezier(0.4, 0, 0.2, 1);
```

### 8.3 원칙

- **최소 모션** — 발표·시연 자료에 과한 애니메이션 X
- **fade + slide** 1단계만 권장
- 데이터 viz · KG 그래프 인터랙션만 예외 (필요한 곳만)

---

## 9. Iconography

- **라이브러리 추천**: [Lucide Icons](https://lucide.dev/) 또는 [Phosphor Icons](https://phosphoricons.com/) (오픈소스 · 라인 스타일)
- **두께**: 1.5px 일관
- **크기**: 16 · 20 · 24px (text scale와 매칭)
- **색상**: `--text-secondary` 기본, 강조 시 `--accent-primary`

---

## 10. Data Visualization (KG · 온톨로지 도식)

### 10.1 색상

- **노드 색상**: `--text-secondary` (회색) 기본 / `--accent-primary` (강조)
- **엣지 색상**: `--color-border-default`
- **다단계 추론 경로 (Multi-hop)**: `--accent-primary` 굵게 (2.5px)

### 10.2 라이브러리

- **[D3.js](https://d3js.org/)** — 정교한 커스텀
- **[Cytoscape.js](https://js.cytoscape.org/)** — 그래프 specialized
- **[React Flow](https://reactflow.dev/)** — React 기반 노드·엣지 에디터

---

## 11. 직접 참고 사이트 — Top 10

| # | 사이트 | URL | 참고 포인트 |
|---|---|---|---|
| 1 | **Enhans** | https://enhans.ai | 도메인 동일 (Ontology 기반 AI OS), 카드 모듈 + 여백 |
| 2 | **Palantir** | https://palantir.com | 미니멀 극단, 검정+흰색, 타이포 dominant |
| 3 | **Linear** | https://linear.app | 3-token 시스템, dark warm-grey + accent |
| 4 | **Vercel** | https://vercel.com | 다크 + grayscale, Geist 디자인 시스템 오픈소스 |
| 5 | **Tesla** | https://tesla.com | 검정 + 빨강 미니멀의 정석 |
| 6 | **Anthropic** | https://anthropic.com | 클린, 따뜻한 톤 |
| 7 | **Stripe** | https://stripe.com | 라이트 미니멀 + 강조 컬러 (PPT light mode 참고) |
| 8 | **토스(Toss)** | https://toss.im / https://toss.tech | 한국 미니멀 정석, 명료한 한글 타이포 |
| 9 | **Cloudflare** | https://cloudflare.com | 다크 + 오렌지 accent (KT 레드 대체 위치) |
| 10 | **Databricks** | https://databricks.com | 데이터·AI 도메인 컬러·도식 참고 |

### 오픈소스 디자인 시스템 (직접 활용 가능)

| 시스템 | URL | 활용 가치 |
|---|---|---|
| **Blueprint** | https://blueprintjs.com | Palantir 오픈소스. 검정+흰색 미니멀 + 데이터 dense UI 컴포넌트 |
| **Geist** | https://vercel.com/geist | Next.js 친화 + 다크 모드 토큰 |
| **shadcn/ui** | https://ui.shadcn.com | Tailwind 기반 무료 컴포넌트 — 프로토타입 빠른 구축 |
| **Radix UI** | https://radix-ui.com | Headless 컴포넌트, 접근성 표준 |

### 한국어 폰트 reference

- **Pretendard** (기본 권장) — 한글·영문 통일감, KT DS 자료 일관성
- **Spoqa Han Sans Neo** — 토스·국내 IT 표준
- **Wanted Sans** — 원티드랩 오픈소스, 모던

→ **Pretendard 유지 권장**.

---

## 12. 프로토타입 공통 적용 가이드

### 12.1 즉시 적용 단계 (1~2일)

1. **CSS 변수 파일 1개** 생성 (`tokens.css`)
2. **3개 프로토타입 HTML에 import**:
   - `HR_AI_Studio_Prototype_v0.26_260112.html`
   - `손해사정 AI 포털_PoC 최종 파일_v1.0_20260112.html`
   - `AI_자동차_플랫폼_영향도_분석.html`
3. **기존 hex 값 → CSS 변수 치환** (find & replace)

### 12.2 컴포넌트 통일 (3~5일)

| 컴포넌트 | 통일 사항 |
|---|---|
| Card | 모든 박스 → `--surface-card` 배경 + 12px radius + 24px padding |
| Button | Primary는 KT 레드, Secondary는 outline |
| Header | 64px 고정, 다크 배경 |
| Badge | 마커(★ · 카운터) 통일 |
| Table | 5차원 비교 표 형식 표준화 |

### 12.3 KG 도식 통일 (선택)

- 모든 노드: 회색 기본 / 강조 노드만 KT 레드
- 엣지: 회색 1px / 강조 경로만 KT 레드 2.5px
- React Flow 또는 D3.js 라이브러리 통일

### 12.4 최소 적용 — 시간 압박 시 80% 효과

```css
:root {
  --bg: #0A0A0B;
  --surface: #141416;
  --text: #F5F5F7;
  --text-sub: #A1A1A6;
  --border: #2C2C2E;
  --accent: #E60012;
}
```

이 6줄 CSS만 3개 프로토타입에 적용해도 즉시 통일감 확보.

---

## 13. 운영 가이드 — Dark / Light 분리 전략

| 매체 | 모드 | 이유 |
|---|---|---|
| **PPT** (발표 자료) | **Light** | 프로젝터 · 인쇄 가시성 |
| **웹 프로토타입** (HR · 손해사정 · 자동차) | **Dark** | 데이터 dense + 프리미엄 톤 |

→ 동일 토큰 체계 + 모드만 다르게. KT 레드는 양쪽 모두 동일 (#E60012).

---

## 14. 다음 단계 — 디자인 시스템 문서화 로드맵

| 단계 | 기간 | 산출물 |
|---|---|---|
| **Phase 1** | 1~2일 | CSS 토큰 파일 1개 → 3개 프로토타입 적용 |
| **Phase 2** | 3~5일 | 컴포넌트 7종 통일 (Card · Button · Table 등) |
| **Phase 3** | 1~2주 | Figma 디자인 시스템 파일 생성 (토큰 · 컴포넌트 · 아이콘) |
| **Phase 4** | 2~4주 | Storybook 또는 Figma Dev Mode 핸드오프 + KG 도식 통일 |

---

## 15. 컨설턴트 관점 인사이트

### Enhans 사례가 가장 직접적 reference

Enhans = Ontology 기반 산업 특화 AI OS (KOAMI 본 사업 목표와 동형). 도메인 동일 + 다크 톤 + 카드 모듈 + 화살표 인터랙션. 강조 컬러만 블루 → KT 레드로 치환.

### Palantir의 "accent X" 원칙

Palantir는 brand accent color 없음. 검정+흰색만. KOAMI는 KT 레드 1개만 추가 — 여전히 절제된 미니멀 유지.

**KT 레드는 5% 이하 면적**에만 적용. 강조 막대 · ★ 마커 · 핵심 키워드 · CTA 버튼 · 도식 강조 노드.

### Linear의 3-token 정교성

Linear가 98개 변수 → 3개로 압축한 사례 = 디자인 시스템 정석. KT-Onto도 **3 토큰 (base · accent · contrast)** 구조로 유지하면 다크/라이트 모드 자동 전환 가능.

### KT 레드 가독성 주의

KT 레드 #E60012는 다크 배경에서 살짝 진동(vibration) 효과 가능. 대응:
- 텍스트 색상으로는 비권장 (가독성 ↓)
- 배경 · 테두리 · 마커에만 사용
- 텍스트 강조 시 off-white + 굵게로 대체

---

## 16. 변경 이력

| 버전 | 일자 | 변경 |
|---|---|---|
| v1.0 | 2026-05-22 | 초안 — Color · Typography · Spacing · 7 Components · Motion · Iconography · Data Viz · References |

---

**문서 끝. 프로토타입 적용·Figma 문서화 진행 시 본 문서 기준으로 작업.**
