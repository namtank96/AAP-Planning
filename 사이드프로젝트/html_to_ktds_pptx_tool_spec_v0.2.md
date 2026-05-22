# HTML → KT DS Design Guide → PPTX 변환 시스템 명세서 · v0.2

> **버전**: v0.2 — Spec-driven Development 기반 자산화 시스템
> **변경 사항**: v0.1 대비 ① KT DS 실제 템플릿 사진 기준으로 슬라이드 타입 4종(cover/divider/toc/body) 분리 · ② 폰트 사이즈 pt 단위 매핑 보정 · ③ 4계층 자산화(Design System / Slide Templates / Snippets / Per-conversion 추출) 추가 · ④ 기업비밀 등급 라벨 지원 추가

---

## 0. 목적

HTML 기반 제안서/기획안을 입력받아 KT DS 디자인 가이드를 자동 적용하고 PPTX(.pptx)로 변환하는 **로컬 CLI 시스템**.

핵심 목표는 다음과 같다.

1. 기존 HTML 문서를 버리지 않고 재사용한다.
2. HTML의 `<section>` 단위를 PPT 슬라이드 1장으로 변환한다.
3. KT DS 실제 템플릿(cover · divider · toc · body 4종) 시각 규칙을 적용한다.
4. KT Flow 폰트가 없을 경우 Pretendard를 기본 fallback으로 사용한다.
5. Claude Code 환경에서 반복적으로 실행 가능한 CLI로 동작한다.
6. **(NEW)** 변환 1회로 끝나지 않고, **재사용 가능한 자산(design system · slide templates · snippets · per-conversion extracts)이 누적**되도록 한다.

---

## 1. 최종 사용자 시나리오

### 1-1. 기본 사용

```bash
python html2ktds_pptx.py input.html --output output.pptx
```

### 1-2. 스타일 적용된 HTML 동시 저장

```bash
python html2ktds_pptx.py input.html --output output.pptx --save-html styled.html
```

### 1-3. 슬라이드별 자산 추출

```bash
python html2ktds_pptx.py input.html --output output.pptx --extract-assets
```

→ `output/assets/<run-id>/slide_001.html`, `slide_002.html`, ... + `manifest.json` 생성. 잘 나온 슬라이드는 다음 덱의 시작점으로 재사용 가능.

### 1-4. 폰트 옵션

```bash
python html2ktds_pptx.py input.html -o output.pptx --font pretendard
```

- `pretendard` (기본 · CDN 또는 로컬)
- `noto` (Noto Sans KR fallback)
- `system` (시스템 sans-serif)
- `ktflow` (KT Flow 파일 확보 시)

### 1-5. 기업비밀 등급 라벨

```bash
python html2ktds_pptx.py input.html -o output.pptx --confidential "기업비밀 II급"
```

→ 표지 좌상단에 보안 등급 라벨 삽입.

---

## 2. 입력 / 출력 정의

### 2-1. 입력

- HTML 파일 1개 (UTF-8 권장)
- 슬라이드 구분: `<section>` 태그
- 슬라이드 타입 분류 단서:
  - `<header class="hero">` → cover
  - `<nav class="toc">` 또는 `<section class="kt-toc">` → toc
  - `<section class="kt-divider" data-chapter="...">` → divider
  - 그 외 `<section>` → body

### 2-2. 출력

| 출력 | 위치 | 비고 |
|---|---|---|
| PPTX | `--output` 지정 경로 | 필수 |
| Styled HTML | `--save-html` 지정 | 옵션 |
| 슬라이드 PNG | `output/slides/slide_NNN.png` | `--export-images` 지정 시 |
| **슬라이드별 HTML (L4 자산)** | `output/assets/<run-id>/slide_NNN.html` | `--extract-assets` 지정 시 |
| **자산 manifest** | `output/assets/<run-id>/manifest.json` | `--extract-assets` 지정 시 |
| 변환 로그 | `output/logs/<run-id>.json` | `--debug` 지정 시 |

---

## 3. 디자인 가이드 (KT DS 템플릿 기준)

### 3-1. 전체 방향

- 흰색 캔버스 중심
- 큰 Bold 제목, 작은 Medium 설명
- 넓은 여백, 장식 최소화
- 검정/짙은 회색 텍스트
- KT DS red(`#E60012`)를 포인트 컬러로 한정 사용
- `kt ds` 텍스트 로고 — cover · divider에만 표시, body는 페이지 번호만

### 3-2. 폰트 체계 (KT 사진 기준, pt → px 환산 반영)

KT Flow 부재 시 Pretendard를 기본 사용한다.

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css');
:root {
  --font-main: 'KT Flow', 'Pretendard Variable', 'Pretendard', 'Noto Sans KR',
               -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

| 용도 | Weight | KT 사진 (pt) | 96DPI 환산 (px) | 채택 (px) |
|---|---:|---:|---:|---:|
| 표지 제목 | 800 (Bold) | 36~45 | 48~60 | **52** |
| 표지 부제 | 500 (Medium) | 14~20 | 19~27 | **22** |
| 표지 좌하단 메타 | 400 | 10~12 | 13~16 | **13** |
| 본문 슬라이드 제목 | 800 (Bold) | 24~36 | 32~48 | **36** |
| 본문 슬라이드 부제 | 500 (Medium) | 14~20 | 19~27 | **18** |
| 본문 텍스트 | 400~500 | 14~18 | 19~24 | **20** |
| 보조/캡션 | 400 | 10~12 | 13~16 | **13** |
| 페이지 번호 | 400 | 10~12 | 13~16 | **14** |
| TOC 본문 | 500 (Medium) | 20 | 27 | **24** |

### 3-3. 색상 토큰

```css
:root {
  --kt-red:      #E60012;
  --kt-black:    #111111;
  --kt-dark:     #1F2933;
  --kt-gray-900: #111318;
  --kt-gray-700: #374151;
  --kt-gray-500: #6B7280;
  --kt-gray-300: #D1D5DB;
  --kt-gray-100: #F3F4F6;
  --kt-bg:       #FFFFFF;
  --kt-soft:     #F7F8FA;
}
```

### 3-4. 슬라이드 비율

- 16:9 고정
- PPT 크기: 13.333 × 7.5 inch
- HTML 렌더링: **1600 × 900 px**
- 슬라이드 내부 padding: 위 82px / 좌우 96px / 아래 72px

### 3-5. 슬라이드 타입 — 4종

| 타입 | 클래스 | 용도 | 푸터 |
|---|---|---|---|
| **cover** | `.kt-slide.kt-cover` | 표지 | 좌하단 날짜·팀, 우하단 kt ds 로고 |
| **divider** | `.kt-slide.kt-divider` | 챕터 간지 | 중앙에 큰 kt ds 로고만 (좌/우하단 비움) |
| **toc** | `.kt-slide.kt-toc` | 목차 | 페이지 번호만 (좌하단 비움) |
| **body** | `.kt-slide.kt-body` | 본문 | 우하단 페이지 번호만 (좌하단·로고 비움) |

### 3-6. 표지 슬라이드 (cover)

KT 사진 기준 레이아웃:

```text
┌────────────────────────────────────────────┐
│ [기업비밀 II급]                            │  ← 좌상단 confidentiality marker
│                                            │
│                                            │
│   제목 — KT Flow Bold 52px                 │  ← 본문 영역 좌측 정렬
│   부제 — KT Flow Medium 22px               │
│                                            │
│                                            │
│                                            │
│                                          ds│  ← 우하단 kt ds 로고
│   2025.00.00 | 000본부 000담당 000팀   kt  │  ← 좌하단 메타
└────────────────────────────────────────────┘
```

```css
.kt-cover .kt-confidential {
  position: absolute;
  top: 64px; left: 96px;
  font-size: 13px; color: var(--kt-gray-500);
  letter-spacing: -0.01em;
}
.kt-cover .kt-cover-body {
  position: absolute;
  top: 38%; left: 96px; right: 96px;
  max-width: 1040px;
}
.kt-cover h1 {
  font-size: 52px;
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.045em;
  color: var(--kt-black);
  margin: 0 0 18px;
}
.kt-cover .kt-cover-subtitle {
  font-size: 22px;
  line-height: 1.55;
  font-weight: 500;
  color: var(--kt-gray-700);
}
.kt-cover .kt-cover-meta {
  position: absolute;
  left: 96px; bottom: 64px;
  font-size: 13px;
  color: var(--kt-gray-500);
}
.kt-cover .kt-logo {
  position: absolute;
  right: 96px; bottom: 60px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.08em;
}
.kt-cover .kt-logo .red { color: var(--kt-red); }
```

### 3-7. 간지 슬라이드 (divider)

KT 사진 기준 — `kt ds` 로고만 가운데에. 옵션으로 챕터 번호·제목 표시 가능.

```css
.kt-divider {
  display: flex;
  align-items: center;
  justify-content: center;
}
.kt-divider .kt-logo-large {
  font-size: 72px;
  font-weight: 800;
  letter-spacing: -0.08em;
}
.kt-divider .kt-chapter-mark {
  position: absolute;
  top: 96px; left: 96px;
  font-size: 14px;
  letter-spacing: .16em;
  color: var(--kt-gray-500);
  text-transform: uppercase;
}
```

HTML 패턴:

```html
<section class="kt-slide kt-divider" data-chapter="01">
  <div class="kt-chapter-mark">CHAPTER 01 · 기업 AI 활용의 현재 위치</div>
  <div class="kt-logo-large">kt <span class="red">ds</span></div>
</section>
```

### 3-8. 목차 슬라이드 (toc)

KT 사진 기준 — 좌측에 `Contents` 큰 영문, 우측에 번호·항목 목록.

```css
.kt-toc {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 64px;
  align-items: center;
}
.kt-toc h1 {
  font-size: 52px;
  font-weight: 800;
  letter-spacing: -0.035em;
  margin: 0;
}
.kt-toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.kt-toc-list li {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 32px;
  align-items: baseline;
}
.kt-toc-list .toc-num {
  font-size: 22px;
  font-weight: 700;
  color: var(--kt-black);
}
.kt-toc-list .toc-title {
  font-size: 24px;
  font-weight: 500;
  color: var(--kt-gray-700);
  letter-spacing: -0.01em;
}
```

### 3-9. 본문 슬라이드 (body)

KT 사진 기준 — 좌상단 제목, 부제, 본문 (체크박스·원형 불릿), 우하단 페이지 번호. **로고 없음**.

```css
.kt-body h1, .kt-body h2 {
  font-size: 36px;
  line-height: 1.18;
  font-weight: 800;
  letter-spacing: -0.035em;
  color: var(--kt-black);
  margin: 0 0 14px;
}
.kt-body .kt-subtitle {
  font-size: 18px;
  font-weight: 500;
  color: var(--kt-gray-700);
  margin: 0 0 28px;
}
.kt-body p, .kt-body li {
  font-size: 20px;
  line-height: 1.6;
  color: var(--kt-gray-700);
}
.kt-body .lead {
  font-size: 22px;
  font-weight: 500;
  color: var(--kt-gray-700);
  margin-bottom: 24px;
}
.kt-page-num {
  position: absolute;
  right: 96px; bottom: 72px;
  font-size: 14px;
  font-weight: 500;
  color: var(--kt-gray-500);
}
```

### 3-10. 푸터 처리 매트릭스

| 슬라이드 | 좌상단 | 좌하단 | 우하단 |
|---|---|---|---|
| cover | confidentiality marker | 날짜 \| 본부 \| 담당 \| 팀 | kt ds 로고 (소) |
| divider | (chapter mark 옵션) | — | — (로고는 중앙) |
| toc | — | — | — (또는 페이지 번호) |
| body | — | — | 페이지 번호 |

---

## 4. 변환 방식

### 4-1. MVP — HTML 렌더링 이미지 삽입

- HTML을 Playwright Chromium으로 렌더링
- 각 `.kt-slide`를 PNG 캡처
- python-pptx로 슬라이드 full-image 삽입

장점: 시각 충실도 100% / 단점: PPT 내 텍스트 편집 불가

### 4-2. v2 (향후) — 편집 가능 객체 변환

- 텍스트는 textbox, 표는 PPT table, SVG는 image 등으로 매핑
- 슬라이드 타입별 레이아웃 알고리즘 필요

MVP는 4-1만 구현한다.

---

## 5. 기술 스택

```txt
beautifulsoup4
lxml
playwright
python-pptx
Pillow
```

```bash
pip install -r requirements.txt
python -m playwright install chromium
```

---

## 6. 프로젝트 파일 구조 (자산화 반영)

```text
html-to-ktds-pptx/
├── README.md
├── requirements.txt
├── html2ktds_pptx.py              # CLI entry
├── src/
│   ├── __init__.py
│   ├── config.py                  # 사이즈/색상/폰트 상수
│   ├── html_loader.py             # HTML 파싱
│   ├── slide_splitter.py          # 슬라이드 후보 추출 + 타입 분류
│   ├── styler.py                  # CSS 주입 + 슬라이드 타입별 래핑
│   ├── renderer.py                # Playwright 렌더링
│   ├── pptx_writer.py             # PPTX 작성
│   └── asset_extractor.py         # 슬라이드별 HTML 추출 + manifest
├── design_system/                 # ── L1 자산
│   ├── VERSION                    # semver (예: 0.2.0)
│   ├── tokens.css                 # 색상·폰트·간격 토큰
│   └── ktds_base.css              # base + 슬라이드 타입 4종 스타일
├── slide_templates/               # ── L2 자산
│   ├── cover.html
│   ├── divider.html
│   ├── toc.html
│   └── body.html
├── snippets/                      # ── L3 자산
│   ├── card.html
│   ├── note.html
│   ├── badge.html
│   └── comparison_table.html
├── examples/
│   └── sample.html
└── output/
    ├── slides/                    # PNG 렌더 캐시
    └── assets/<run-id>/           # ── L4 자산 (변환마다 누적)
        ├── manifest.json
        ├── slide_001.html
        ├── slide_002.html
        └── ...
```

---

## 7. 자산화 아키텍처 (4계층)

### 7-1. 설계 의도

> 변환은 1회성 작업이지만, 변환의 부산물은 **다음 덱의 시작점**이 되어야 한다.

### 7-2. 4계층 구조

**L1 · Design System** (`design_system/`)
- semver로 버전 관리 (`VERSION` 파일)
- `tokens.css` — 색상·폰트·간격 변수만
- `ktds_base.css` — 4종 슬라이드 타입 + 공통 컴포넌트 스타일
- 새 HTML 덱을 만들 때 이 두 파일만 import하면 KT DS 룩이 적용된다

**L2 · Slide Templates** (`slide_templates/`)
- cover/divider/toc/body 4종의 **빈 슬라이드 HTML**
- 새 슬라이드 추가 시 이 템플릿을 복사해 콘텐츠만 채움
- placeholder는 `{{...}}` 형식

**L3 · Snippets** (`snippets/`)
- body 슬라이드 안에 들어가는 **재사용 가능한 본문 컴포넌트**
- card / note / badge / comparison_table / timeline 등
- MVP에는 4종 정도만 시작, 누적해 확장

**L4 · Per-Conversion Extracts** (`output/assets/<run-id>/`)
- 변환할 때마다 슬라이드별 **standalone HTML**과 `manifest.json`을 생성
- 잘 나온 슬라이드를 **L2 templates** 또는 **L3 snippets**으로 승격시킬 수 있는 입력
- run-id 예: `aap_v210_20260521_1530`

### 7-3. Asset Manifest JSON 스키마

```json
{
  "run_id": "aap_v210_20260521_1530",
  "source_html": "공유용/aap_proactive_offering_v210_260521.html",
  "design_system_version": "0.2.0",
  "generated_at": "2026-05-21T15:30:00+09:00",
  "slide_count": 12,
  "slides": [
    {
      "index": 1,
      "type": "cover",
      "title": "기업의 실제 업무를 처음부터 끝까지 수행하는 ...",
      "source_section_id": "top",
      "html_path": "slide_001.html",
      "png_path": "../../slides/slide_001.png"
    },
    {
      "index": 2,
      "type": "toc",
      "title": "Contents",
      "source_section_id": "toc",
      "html_path": "slide_002.html"
    }
  ]
}
```

### 7-4. 버저닝

- Design system은 semver (`MAJOR.MINOR.PATCH`)
  - MAJOR — 토큰 이름/구조 변경 (breaking)
  - MINOR — 신규 컴포넌트 추가
  - PATCH — 색상값·간격 미세 조정
- Manifest에 항상 사용된 design_system_version 기록

---

## 8. CLI 명세

```bash
python html2ktds_pptx.py INPUT_HTML [options]
```

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `--output, -o` | `output.pptx` | PPTX 출력 경로 |
| `--save-html` | (off) | 스타일 적용된 HTML 저장 경로 |
| `--export-images` | (off) | 슬라이드 PNG 저장 |
| `--image-dir` | `output/slides` | PNG 저장 경로 |
| `--extract-assets` | (off) | **슬라이드별 HTML + manifest 추출 (L4 자산화)** |
| `--asset-dir` | `output/assets` | L4 자산 루트 |
| `--run-id` | 자동 생성 | L4 자산 디렉토리 이름 |
| `--font` | `pretendard` | `pretendard \| noto \| system \| ktflow` |
| `--confidential` | (none) | 표지 좌상단 보안 등급 (예: "기업비밀 II급") |
| `--meta-left` | (none) | 표지 좌하단 메타 ("2026.05.21 \| AX BD") |
| `--logo` | `text` | `text \| none \| image` |
| `--logo-image` | (none) | `--logo image` 사용 시 로고 이미지 경로 |
| `--width` | `1600` | 렌더링 width (px) |
| `--height` | `900` | 렌더링 height (px) |
| `--ppt-width` | `13.333` | PPT 너비 (inch) |
| `--ppt-height` | `7.5` | PPT 높이 (inch) |
| `--debug` | (off) | verbose 로그 + run 로그 JSON 저장 |

---

## 9. 처리 로직 상세

### 9-1. HTML 로딩
1. 입력 파일 존재 확인
2. UTF-8 디코딩
3. BeautifulSoup(lxml) 파싱
4. `<html>`, `<head>`, `<body>` 자동 보완

### 9-2. 슬라이드 후보 추출 & 타입 분류

우선순위 (위→아래로 1회 스캔):

1. `<header class="hero">` 또는 `<section class="kt-cover">` → **cover**
2. `<section class="kt-divider">` 또는 `<div class="divider">` → **divider**
3. `<nav class="toc">` 또는 `<section class="kt-toc">` → **toc**
4. 그 외 `<section>` → **body**
5. `<section>`이 없으면 body 전체를 단일 **body** 슬라이드로 처리

### 9-3. 슬라이드 래핑 (타입별)

**cover 예시:**
```html
<div class="kt-slide kt-cover" data-slide-index="1">
  {{#if confidential}}<div class="kt-confidential">{{confidential}}</div>{{/if}}
  <div class="kt-cover-body">
    <h1>{{title}}</h1>
    <div class="kt-cover-subtitle">{{subtitle}}</div>
  </div>
  {{#if metaLeft}}<div class="kt-cover-meta">{{metaLeft}}</div>{{/if}}
  <div class="kt-logo">kt <span class="red">ds</span></div>
</div>
```

**body 예시:**
```html
<div class="kt-slide kt-body" data-slide-index="N">
  <div class="kt-slide-inner">
    <!-- original section content -->
  </div>
  <div class="kt-page-num">{{padded_index}}</div>
</div>
```

### 9-4. CSS 주입

`design_system/tokens.css` + `design_system/ktds_base.css`를 `<style id="ktds-design-guide">`로 합쳐 `<head>` 마지막에 삽입. 기존 CSS는 제거하지 않는다 (override 방식).

### 9-5. 렌더링

- Playwright Chromium headless
- viewport 1600×900 (`device_scale_factor=1`)
- 각 `.kt-slide`를 locator로 잡아 `screenshot()` 호출
- 출력: `output/slides/slide_NNN.png`

### 9-6. PPTX 작성

```python
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)
for png in pngs:
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
    slide.shapes.add_picture(png, 0, 0,
                             width=prs.slide_width,
                             height=prs.slide_height)
```

### 9-7. L4 자산 추출 (`--extract-assets`)

1. 각 슬라이드를 standalone HTML로 저장 (design_system CSS는 relative path import)
2. `manifest.json`에 슬라이드 메타 기록
3. run-id로 폴더 분리

---

## 10. 에러 처리

| 상황 | 메시지 |
|---|---|
| 입력 파일 없음 | `ERROR: input html file not found: <path>` |
| 슬라이드 추출 실패 | `ERROR: no renderable slide content found.` |
| Playwright 미설치 | `ERROR: playwright chromium is not installed. Run: python -m playwright install chromium` |
| 렌더링 실패 | `ERROR: failed to render slide <n>. Check HTML/CSS validity.` |
| 출력 경로 권한 없음 | `ERROR: cannot write to <path>. Check permissions.` |

---

## 11. 구현 코드 요구사항

1. 단일 진입점 `html2ktds_pptx.py`로 실행 가능
2. 로직은 `src/` 모듈로 분리, 각 모듈은 60~150 라인 내외
3. 경로는 `pathlib.Path`
4. 주요 단계마다 로그 출력 (`--debug` 시 verbose)
5. type hints 의무
6. 예외 발생 시 사용자가 이해 가능한 메시지로 변환
7. **Windows 환경에서 동작** + **한글 파일명/경로 지원**

---

## 12. 핵심 함수 시그니처

```python
def load_html(input_path: Path) -> BeautifulSoup: ...
def classify_slide(section: Tag) -> Literal["cover","divider","toc","body"]: ...
def split_into_slides(soup: BeautifulSoup) -> list[SlideSpec]: ...
def wrap_slide(spec: SlideSpec, cli_opts: CliOpts) -> str: ...
def inject_design_guide(soup: BeautifulSoup, css_text: str) -> BeautifulSoup: ...
def build_render_html(slide_htmls: list[str], css_text: str) -> str: ...
async def render_slides_to_png(html_path: Path, image_dir: Path,
                               width: int, height: int) -> list[Path]: ...
def create_pptx_from_images(image_paths: list[Path], output_path: Path,
                            ppt_w: float, ppt_h: float) -> None: ...
def extract_per_slide_assets(slide_specs: list[SlideSpec],
                             asset_dir: Path, run_id: str,
                             design_system_version: str) -> Path: ...
```

```python
@dataclass
class SlideSpec:
    index: int
    type: Literal["cover","divider","toc","body"]
    title: str
    subtitle: str | None
    source_section_id: str | None
    raw_html: str       # original section content
    wrapped_html: str   # after wrap_slide()
```

---

## 13. MVP 구현 순서

1. 프로젝트 폴더 생성 (자산화 4계층 반영)
2. `requirements.txt` 작성
3. **L1**: `design_system/` 작성 (tokens.css, ktds_base.css, VERSION)
4. **L2**: `slide_templates/` 작성 (cover/divider/toc/body)
5. **L3**: `snippets/` starter set (card/note/badge)
6. `src/config.py` — 상수
7. `src/html_loader.py` + `src/slide_splitter.py` — 입력 처리
8. `src/styler.py` — CSS 주입 + 슬라이드 래핑
9. `src/renderer.py` — Playwright
10. `src/pptx_writer.py` — PPTX 작성
11. `src/asset_extractor.py` — L4 추출
12. `html2ktds_pptx.py` — CLI
13. `examples/sample.html` — KT 사진 4종 타입을 모두 포함
14. README

---

## 14. 테스트 기준

### 14-1. 기능 테스트

```bash
python html2ktds_pptx.py examples/sample.html \
  -o output/sample.pptx \
  --save-html output/sample_styled.html \
  --export-images \
  --extract-assets \
  --confidential "기업비밀 II급" \
  --meta-left "2026.05.21 | AX BD"
```

검증:
- `output/sample.pptx` 생성
- 슬라이드 수가 HTML section + cover/toc/divider 합과 일치
- `output/sample_styled.html` 생성
- `output/slides/slide_001.png` 등 이미지 생성
- `output/assets/<run-id>/manifest.json` + slide_NNN.html 생성

### 14-2. 디자인 테스트

- 16:9 비율 유지
- cover: 좌상단 confidentiality / 큰 제목 / 좌하단 메타 / 우하단 로고
- divider: 중앙에 큰 `kt ds` 로고만
- toc: 좌측 Contents 큰 글자 + 우측 번호 목록
- body: 우하단 페이지 번호만 (로고 없음)
- 한글 폰트 정상 렌더링

### 14-3. 자산화 테스트

- `manifest.json` 스키마 유효
- 각 `slide_NNN.html`이 standalone으로 브라우저 오픈 가능 (design_system CSS relative import)
- design_system VERSION이 manifest에 정확히 기록

---

## 15. README 구성

1. What this tool does
2. Quick start
3. Input HTML rules (slide type 분류 단서)
4. Design guide overview
5. 4-layer asset architecture (L1~L4)
6. Font handling
7. Limitations
8. Roadmap

Limitations에 명시:
- MVP는 PPT 텍스트를 편집 가능한 객체로 변환하지 않는다 (이미지 삽입)
- KT Flow 파일을 포함하지 않는다 — 로컬 font-face 추가 시 동작
- 긴 section은 한 슬라이드 안에서 overflow될 수 있음 (section을 나누거나 향후 자동 분할 기능 도입)

---

## 16. 향후 개선 과제

1. PPT 편집 가능 객체 변환 (text/table/shape)
2. KT Flow 폰트 로컬 font-face 지원
3. KT DS 실제 로고 이미지 삽입
4. PPT `.potx` 마스터 기반 생성
5. 긴 section 자동 분할
6. L4 자산 → L2/L3 자산 승격 도구 (`promote-asset` 서브커맨드)
7. 챕터 자동 감지 → divider 자동 삽입
8. PDF 출력 옵션
9. 다크/화이트 테마 토글

---

## 17. Claude Code 작업 지시문

```text
이 명세서(v0.2)를 기준으로 자산화 시스템을 구현해줘.

목표는 HTML 파일을 입력받아 KT DS 4종 슬라이드 타입(cover/divider/toc/body)으로
분류·렌더링한 뒤 PPTX로 변환하고, 동시에 design system / slide templates / snippets /
per-conversion extracts를 4계층 자산으로 누적 가능한 구조를 만드는 것이야.

MVP에서는 시각 보존을 위해 Playwright + python-pptx 이미지 삽입 방식으로 구현해줘.

반드시 포함:
1. requirements.txt
2. design_system/ (L1 자산)
3. slide_templates/ (L2 자산)
4. snippets/ starter (L3 자산)
5. src/ 모듈 (config/loader/splitter/styler/renderer/pptx_writer/asset_extractor)
6. html2ktds_pptx.py CLI
7. examples/sample.html — 4종 타입 모두 포함
8. README.md

Windows + 한글 파일명·경로 지원 의무.
```

---

## 18. 구현 완료 후 기대 결과

```text
html-to-ktds-pptx/
├── README.md
├── requirements.txt
├── html2ktds_pptx.py
├── src/                         (7 files)
├── design_system/               (3 files — VERSION + 2 CSS)
├── slide_templates/             (4 files)
├── snippets/                    (4 files starter)
├── examples/
│   └── sample.html
└── output/
    ├── sample.pptx
    ├── sample_styled.html
    ├── slides/
    │   ├── slide_001.png
    │   └── ...
    └── assets/<run-id>/
        ├── manifest.json
        ├── slide_001.html
        └── ...
```

이후 실제 AAP HTML 변환:

```bash
python html2ktds_pptx.py 공유용/aap_proactive_offering_v210_260521.html \
  -o output/aap_v210.pptx \
  --save-html output/aap_v210_styled.html \
  --extract-assets \
  --confidential "기업비밀 II급" \
  --meta-left "2026.05.21 | AX BD"
```
