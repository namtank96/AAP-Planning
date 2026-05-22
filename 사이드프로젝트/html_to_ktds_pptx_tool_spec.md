# HTML → KT DS Design Guide → PPTX 변환 Tool 구축 명세서

## 0. 목적

이 도구는 사용자가 작성한 HTML 기반 제안서/기획안 문서를 입력받아, KT DS 스타일에 가까운 디자인 가이드를 자동 적용한 뒤, PowerPoint 파일(`.pptx`)로 변환하는 로컬 CLI 도구다.

핵심 목표는 다음과 같다.

1. 기존 HTML 문서를 버리지 않고 재사용한다.
2. HTML의 `<section>` 단위를 PPT 슬라이드 1장으로 변환한다.
3. KT DS 템플릿과 유사한 시각 규칙을 적용한다.
4. KT Flow 폰트가 없을 경우 Pretendard를 기본 fallback으로 사용한다.
5. Claude Code 환경에서 반복적으로 실행 가능한 CLI 도구로 구축한다.

---

## 1. 최종 사용자 시나리오

### 1-1. 기본 사용

```bash
python html2ktds_pptx.py input.html --output output.pptx
```

동작:

1. `input.html`을 읽는다.
2. KT DS 스타일 CSS를 주입한다.
3. `<section>` 단위로 슬라이드를 분리한다.
4. 각 슬라이드를 16:9 화면으로 렌더링한다.
5. 렌더링 결과를 PPTX 각 페이지에 삽입한다.
6. `output.pptx`를 생성한다.

### 1-2. HTML 수정본도 함께 저장

```bash
python html2ktds_pptx.py input.html --output output.pptx --save-html styled.html
```

동작:

- PPTX 생성과 함께 디자인 가이드가 적용된 HTML 파일도 저장한다.

### 1-3. 폰트 옵션 지정

```bash
python html2ktds_pptx.py input.html --output output.pptx --font pretendard
```

지원 옵션:

- `pretendard`: 기본값. CDN 또는 로컬 파일 기반.
- `noto`: Noto Sans KR fallback.
- `system`: 시스템 기본 sans-serif.
- `ktflow`: 추후 KT Flow 폰트 파일 확보 시 사용.

---

## 2. 입력 / 출력 정의

## 2-1. 입력

### 필수 입력

- HTML 파일 1개
- UTF-8 인코딩 권장
- 문서 내 슬라이드 구분 기준은 `<section>` 태그

### 권장 HTML 구조

```html
<body>
  <div class="page">
    <section id="s1">
      ... slide 1 ...
    </section>
    <section id="s2">
      ... slide 2 ...
    </section>
  </div>
</body>
```

### 허용 구조

- `<header class="hero">`는 표지 슬라이드로 변환 가능
- `<nav class="toc">`는 목차 슬라이드로 변환 가능
- `<section>`이 없을 경우 전체 body를 1장으로 변환

## 2-2. 출력

### 기본 출력

- `.pptx` 파일

### 선택 출력

- 디자인 가이드가 적용된 `.html` 파일
- 슬라이드별 `.png` 이미지
- 변환 로그 `.json`

---

## 3. 디자인 가이드

## 3-1. 전체 방향

PPT 템플릿 사진 기준으로 다음 방향을 따른다.

- 흰색 캔버스 중심
- 큰 Bold 제목
- 작은 Medium 설명문
- 넓은 여백
- 불필요한 장식 최소화
- 검정/짙은 회색 텍스트 중심
- KT DS red를 포인트 컬러로 사용
- 우하단 `kt ds` 로고 또는 텍스트 마크 배치
- 하단 좌측 날짜/부서/담당자 메타 정보 배치 가능

## 3-2. 폰트 체계

KT Flow 서체 파일이 없다는 전제에서 Pretendard를 기본 사용한다.

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css');

:root {
  --font-main: 'Pretendard Variable', 'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

폰트 weight 기준:

| 용도 | Weight | 크기 |
|---|---:|---:|
| 표지 제목 | 800 | 40~48px |
| 본문 슬라이드 제목 | 800 | 34~42px |
| 섹션 제목 | 700 | 24~32px |
| 본문 | 400~500 | 14~18px |
| 보조 설명 | 300~400 | 12~15px |
| 캡션/메타 | 400 | 10~12px |

## 3-3. 색상 토큰

```css
:root {
  --kt-red: #E60012;
  --kt-black: #111111;
  --kt-dark: #1F2933;
  --kt-gray-900: #111318;
  --kt-gray-700: #374151;
  --kt-gray-500: #6B7280;
  --kt-gray-300: #D1D5DB;
  --kt-gray-100: #F3F4F6;
  --kt-bg: #FFFFFF;
  --kt-soft: #F7F8FA;
}
```

## 3-4. 슬라이드 비율

- 기본 16:9
- PPT 크기: 13.333 x 7.5 inch
- HTML 렌더링 기준: 1600 x 900 px 권장

```css
.kt-slide {
  width: 1600px;
  height: 900px;
  background: #fff;
  position: relative;
  overflow: hidden;
  padding: 82px 96px 72px;
}
```

## 3-5. 제목 슬라이드 스타일

```css
.kt-cover-title {
  font-size: 48px;
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--kt-black);
}

.kt-cover-subtitle {
  margin-top: 22px;
  font-size: 19px;
  line-height: 1.55;
  font-weight: 400;
  color: var(--kt-gray-700);
}
```

## 3-6. 일반 슬라이드 스타일

```css
.kt-slide h1,
.kt-slide h2 {
  font-size: 38px;
  line-height: 1.18;
  font-weight: 800;
  letter-spacing: -0.035em;
  color: var(--kt-black);
  margin: 0 0 28px;
}

.kt-slide .lead {
  font-size: 17px;
  line-height: 1.6;
  color: var(--kt-gray-700);
  margin-bottom: 28px;
}
```

## 3-7. 로고 / 페이지 번호

우하단에 텍스트 기반 임시 로고를 넣는다.

```css
.kt-logo {
  position: absolute;
  right: 76px;
  bottom: 54px;
  font-size: 31px;
  font-weight: 800;
  letter-spacing: -0.08em;
  color: #111;
}

.kt-logo .red {
  color: var(--kt-red);
}

.kt-page-num {
  position: absolute;
  right: 88px;
  bottom: 48px;
  font-size: 12px;
  color: var(--kt-gray-500);
}
```

로고와 페이지 번호는 동시에 쓰지 않는다. 표지/간지에는 로고, 본문에는 페이지 번호 또는 작은 로고 중 하나를 선택한다.

---

## 4. 변환 방식

## 4-1. 권장 방식: HTML 렌더링 이미지 삽입

가장 안정적인 방식은 HTML을 브라우저로 렌더링한 뒤, 각 슬라이드를 PNG로 캡처하고 PPTX에 full-slide image로 삽입하는 것이다.

장점:

- HTML/CSS 시각 결과가 거의 그대로 보존된다.
- 복잡한 grid, flex, badge, chart, diagram을 안정적으로 변환할 수 있다.
- Claude Code에서 구현 난이도가 낮다.

단점:

- PPT 내 텍스트가 편집 가능한 객체가 아니라 이미지가 된다.
- 파일 크기가 커질 수 있다.

초기 버전은 이 방식으로 구현한다.

## 4-2. 향후 고도화: 편집 가능한 PPT 객체 변환

2차 버전에서는 HTML 요소를 pptx 객체로 변환할 수 있다.

- `h1/h2` → text box
- `p/li` → text box
- `.card` → rounded rectangle + text
- `table` → ppt table
- `svg` → image

하지만 초기 버전에서는 안정성을 위해 이미지 삽입 방식을 우선한다.

---

## 5. 기술 스택

## 5-1. Python 패키지

```txt
beautifulsoup4
lxml
playwright
python-pptx
Pillow
```

설치:

```bash
pip install beautifulsoup4 lxml playwright python-pptx Pillow
python -m playwright install chromium
```

## 5-2. 주요 역할

| 패키지 | 역할 |
|---|---|
| BeautifulSoup | HTML 파싱 및 CSS/DOM 주입 |
| Playwright | HTML 렌더링 및 슬라이드 캡처 |
| python-pptx | PPTX 생성 |
| Pillow | 이미지 크기 검증/후처리 |

---

## 6. 파일 구조

Claude Code는 다음 구조로 생성한다.

```text
html-to-ktds-pptx/
├── README.md
├── requirements.txt
├── html2ktds_pptx.py
├── src/
│   ├── __init__.py
│   ├── html_loader.py
│   ├── style_injector.py
│   ├── slide_splitter.py
│   ├── renderer.py
│   ├── pptx_writer.py
│   └── config.py
├── styles/
│   └── ktds_pretendard.css
├── templates/
│   └── base_wrapper.html
├── examples/
│   └── sample.html
└── output/
    └── .gitkeep
```

---

## 7. CLI 명세

```bash
python html2ktds_pptx.py INPUT_HTML [options]
```

Options:

```text
--output, -o          output pptx path. default: output.pptx
--save-html          save styled html path
--export-images      save slide png images
--image-dir          image output directory. default: output/slides
--font               pretendard | noto | system | ktflow. default: pretendard
--logo               text | none | image. default: text
--logo-image         logo image path, used when --logo image
--title-mode         auto | preserve | force. default: auto
--toc                auto | keep | remove. default: auto
--width              render width px. default: 1600
--height             render height px. default: 900
--ppt-width          ppt width inch. default: 13.333
--ppt-height         ppt height inch. default: 7.5
--debug              print verbose logs
```

---

## 8. 처리 로직 상세

## 8-1. HTML 로딩

1. 입력 파일 존재 확인
2. UTF-8로 읽기
3. BeautifulSoup으로 파싱
4. `<html>`, `<head>`, `<body>`가 없으면 자동 생성

## 8-2. 슬라이드 후보 추출

우선순위:

1. `header.hero`가 있으면 cover slide로 사용
2. `nav.toc`가 있으면 toc slide로 사용
3. 모든 `section`을 각각 slide로 사용
4. `section`이 없으면 body 전체를 1개 slide로 사용

## 8-3. 슬라이드 래핑

각 슬라이드 후보를 다음 구조로 감싼다.

```html
<div class="kt-slide" data-slide-index="1">
  <div class="kt-slide-inner">
    <!-- original section content -->
  </div>
  <div class="kt-footer">
    <div class="kt-meta">2026.00.00 | AX BD</div>
    <div class="kt-logo">kt <span class="red">ds</span></div>
  </div>
</div>
```

## 8-4. 기존 CSS 충돌 처리

초기 버전에서는 기존 CSS를 제거하지 않는다. 대신 KT DS override CSS를 가장 마지막에 주입한다.

추후 옵션으로 추가 가능:

```bash
--strip-existing-css
```

## 8-5. CSS 주입

`styles/ktds_pretendard.css`를 `<head>` 마지막에 삽입한다.

```html
<style id="ktds-design-guide">
  ...css...
</style>
```

## 8-6. 렌더링

Playwright Chromium 사용.

1. 임시 HTML 파일 생성
2. 브라우저 실행
3. viewport를 1600 x 900으로 설정
4. 각 `.kt-slide` 요소를 locator로 찾음
5. 요소별 screenshot 저장

중요:

- `device_scale_factor=2`는 이미지 품질을 높이지만 파일 크기가 커진다.
- 기본은 `device_scale_factor=1`로 시작한다.
- 한글 폰트가 시스템에 없으면 렌더링이 깨질 수 있으므로 CDN Pretendard를 우선 사용한다.

## 8-7. PPTX 작성

python-pptx 사용.

1. 새 Presentation 생성
2. slide_width = 13.333 inch
3. slide_height = 7.5 inch
4. 빈 슬라이드 레이아웃 사용
5. 각 PNG를 슬라이드 전체 크기로 삽입

```python
slide.shapes.add_picture(
    image_path,
    0,
    0,
    width=prs.slide_width,
    height=prs.slide_height,
)
```

---

## 9. 에러 처리

## 9-1. 입력 파일 없음

메시지:

```text
ERROR: input html file not found: <path>
```

## 9-2. 슬라이드 추출 실패

메시지:

```text
ERROR: no renderable slide content found. Add <section> tags or provide a valid body.
```

## 9-3. Playwright 미설치

메시지:

```text
ERROR: playwright chromium is not installed. Run: python -m playwright install chromium
```

## 9-4. 이미지 생성 실패

메시지:

```text
ERROR: failed to render slide <n>. Check HTML/CSS validity.
```

---

## 10. 구현 코드 요구사항

Claude Code는 다음 원칙으로 구현한다.

1. 단일 CLI 파일(`html2ktds_pptx.py`)로도 실행 가능하게 만든다.
2. 내부 로직은 `src/` 모듈로 분리한다.
3. 경로는 `pathlib.Path`를 사용한다.
4. 모든 주요 단계에 로그를 출력한다.
5. 함수에는 type hint를 붙인다.
6. 예외 발생 시 사용자가 이해 가능한 메시지를 출력한다.
7. Windows 환경에서도 동작해야 한다.
8. 한글 파일명 경로를 지원해야 한다.

---

## 11. 핵심 함수 설계

## 11-1. `load_html`

```python
def load_html(input_path: Path) -> BeautifulSoup:
    """Load and parse an HTML file as BeautifulSoup."""
```

## 11-2. `inject_design_guide`

```python
def inject_design_guide(
    soup: BeautifulSoup,
    css_text: str,
    font_mode: str = "pretendard",
) -> BeautifulSoup:
    """Inject KT DS design guide CSS into the HTML head."""
```

## 11-3. `split_into_slides`

```python
def split_into_slides(soup: BeautifulSoup) -> list[str]:
    """Return HTML strings for cover, toc, and section slides."""
```

## 11-4. `build_render_html`

```python
def build_render_html(slides: list[str], css_text: str) -> str:
    """Build a standalone renderable HTML containing .kt-slide blocks."""
```

## 11-5. `render_slides_to_png`

```python
async def render_slides_to_png(
    html_path: Path,
    image_dir: Path,
    width: int = 1600,
    height: int = 900,
) -> list[Path]:
    """Render each .kt-slide element to a PNG image."""
```

## 11-6. `create_pptx_from_images`

```python
def create_pptx_from_images(
    image_paths: list[Path],
    output_path: Path,
    ppt_width: float = 13.333,
    ppt_height: float = 7.5,
) -> None:
    """Create a PPTX where each image becomes one full-slide page."""
```

---

## 12. CSS 구현 초안

`styles/ktds_pretendard.css`에 아래 내용을 포함한다.

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css');

:root {
  --kt-red: #E60012;
  --kt-black: #111111;
  --kt-dark: #1F2933;
  --kt-gray-900: #111318;
  --kt-gray-700: #374151;
  --kt-gray-500: #6B7280;
  --kt-gray-300: #D1D5DB;
  --kt-gray-100: #F3F4F6;
  --kt-bg: #FFFFFF;
  --kt-soft: #F7F8FA;
  --font-main: 'Pretendard Variable', 'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

html, body {
  margin: 0;
  padding: 0;
  background: #222;
  font-family: var(--font-main);
  color: var(--kt-black);
}

.kt-deck {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 32px;
  align-items: center;
}

.kt-slide {
  width: 1600px;
  height: 900px;
  background: #fff;
  position: relative;
  overflow: hidden;
  padding: 82px 96px 72px;
  box-sizing: border-box;
}

.kt-slide-inner {
  position: relative;
  z-index: 1;
  height: 100%;
}

.kt-slide h1,
.kt-slide h2 {
  font-size: 38px;
  line-height: 1.18;
  font-weight: 800;
  letter-spacing: -0.035em;
  color: var(--kt-black);
  margin: 0 0 28px;
}

.kt-slide h3 {
  font-size: 22px;
  line-height: 1.28;
  font-weight: 700;
  letter-spacing: -0.025em;
  margin: 0 0 12px;
}

.kt-slide p,
.kt-slide li,
.kt-slide td {
  font-size: 15px;
  line-height: 1.58;
  color: var(--kt-gray-700);
}

.kt-slide .lead {
  font-size: 17px;
  line-height: 1.6;
  color: var(--kt-gray-700);
  margin-bottom: 28px;
}

.kt-slide .card,
.kt-slide .cap-card,
.kt-slide .flow-box,
.kt-slide .detail-row {
  border-radius: 14px !important;
  border: 1px solid #E5E7EB !important;
  box-shadow: none !important;
}

.kt-slide table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}

.kt-slide th {
  background: #111;
  color: #fff;
  font-weight: 700;
}

.kt-slide strong {
  color: var(--kt-black);
  font-weight: 700;
}

.kt-footer {
  position: absolute;
  left: 96px;
  right: 76px;
  bottom: 48px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  pointer-events: none;
}

.kt-meta {
  font-size: 12px;
  line-height: 1;
  color: var(--kt-gray-500);
}

.kt-logo {
  font-size: 31px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.08em;
  color: #111;
}

.kt-logo .red {
  color: var(--kt-red);
}

.kt-page-num {
  font-size: 12px;
  color: var(--kt-gray-500);
}

.kt-cover .kt-slide-inner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 1040px;
}

.kt-cover h1 {
  font-size: 48px;
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.045em;
}

.kt-cover p {
  font-size: 19px;
  line-height: 1.55;
  color: var(--kt-gray-700);
  max-width: 900px;
}
```

---

## 13. MVP 구현 순서

Claude Code는 아래 순서로 작업한다.

1. 프로젝트 폴더 생성
2. `requirements.txt` 작성
3. `styles/ktds_pretendard.css` 작성
4. `src/` 모듈 작성
5. `html2ktds_pptx.py` CLI 작성
6. `examples/sample.html` 작성
7. 샘플 변환 실행
8. 생성된 PPTX 열림 여부 확인
9. README 작성

---

## 14. 테스트 기준

## 14-1. 기능 테스트

다음 명령이 성공해야 한다.

```bash
python html2ktds_pptx.py examples/sample.html -o output/sample.pptx --save-html output/sample_styled.html --export-images
```

검증:

- `output/sample.pptx` 생성
- 슬라이드 수가 HTML section 수와 일치
- `output/sample_styled.html` 생성
- `output/slides/slide_001.png` 등 이미지 생성

## 14-2. 디자인 테스트

확인 항목:

- 16:9 비율 유지
- 제목이 크고 굵게 표시됨
- 본문이 Pretendard 계열로 표시됨
- 하단 로고 또는 페이지 번호가 잘리지 않음
- 표/카드/그리드가 슬라이드 밖으로 과도하게 넘치지 않음

## 14-3. 한글 테스트

- 한글 제목, 본문, 표가 깨지지 않아야 한다.
- 한글 파일명 입력이 가능해야 한다.

---

## 15. README에 포함할 내용

README는 다음 섹션으로 작성한다.

1. What this tool does
2. Installation
3. Quick start
4. Input HTML rules
5. Design guide
6. Font handling
7. Limitations
8. Roadmap

Limitations에는 반드시 다음을 적는다.

- MVP는 PPT 텍스트를 편집 가능한 객체로 변환하지 않는다.
- 각 슬라이드는 이미지로 삽입된다.
- 복잡한 긴 HTML section은 한 슬라이드 안에서 overflow될 수 있으므로 section을 나누는 것이 좋다.
- KT Flow 폰트는 포함하지 않는다. 폰트 파일이 제공되면 로컬 font-face 방식으로 확장 가능하다.

---

## 16. 향후 개선 과제

1. PPT 객체 기반 변환
2. KT Flow 로컬 폰트 지원
3. 실제 KT DS 로고 이미지 삽입 지원
4. PPT 템플릿 `.pptx` 기반 생성
5. 긴 section 자동 분할
6. 표를 PowerPoint table 객체로 변환
7. 다크/화이트 테마 선택
8. 장표별 레이아웃 자동 판별
9. 섹션 번호/목차 자동 생성
10. PDF 출력 옵션 추가

---

## 17. Claude Code 작업 지시문

아래 문장을 Claude Code에 그대로 넣고 작업을 시작한다.

```text
이 명세서를 기준으로 Python CLI 도구를 구현해줘.

목표는 HTML 파일을 입력받아 KT DS 스타일 디자인 가이드를 적용하고, 각 section을 16:9 슬라이드 이미지로 렌더링한 뒤 PPTX로 변환하는 도구야.

MVP에서는 PPT 텍스트 편집 가능성보다 시각 보존을 우선해줘. 즉, Playwright로 각 .kt-slide를 PNG로 캡처하고 python-pptx로 전체 슬라이드 이미지 삽입 방식으로 구현해줘.

반드시 다음을 포함해줘.
1. requirements.txt
2. html2ktds_pptx.py CLI
3. src 모듈 분리
4. styles/ktds_pretendard.css
5. examples/sample.html
6. README.md
7. output 폴더

Windows에서도 실행 가능해야 하고, 한글 HTML과 한글 파일명을 처리할 수 있어야 해.
구현 후 sample.html로 변환 테스트까지 수행해줘.
```

---

## 18. 구현 완료 후 기대 결과

```text
html-to-ktds-pptx/
├── README.md
├── requirements.txt
├── html2ktds_pptx.py
├── src/
├── styles/
├── examples/
└── output/
    ├── sample.pptx
    ├── sample_styled.html
    └── slides/
        ├── slide_001.png
        ├── slide_002.png
        └── ...
```

이 상태가 되면, 이후에는 실제 AAP HTML을 다음처럼 변환하면 된다.

```bash
python html2ktds_pptx.py aap_proactive_offering.html -o aap_ktds_style.pptx --save-html aap_ktds_style.html --export-images
```
