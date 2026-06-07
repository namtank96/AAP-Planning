# HTML → KT DS PPTX 하이브리드 편집 가능 변환 시스템 기획안 v0.3

> 작성일: 2026-05-26  
> 목적: HTML 기반 제안서/기획안 문서를 KT DS 스타일 PPTX로 변환하되, 가능한 요소는 PowerPoint에서 편집 가능한 객체로 생성하고, 복잡한 요소만 이미지 fallback으로 처리하는 하이브리드 변환 시스템을 정의한다.  
> 핵심 결론: **PptxGenJS + Playwright DOM 측정 + Selective Native Mapping + Image Fallback** 조합으로 진행한다.

---

## 1. Executive Summary

기존 MVP는 HTML을 Playwright로 렌더링한 뒤 각 슬라이드를 PNG로 캡처하고, python-pptx로 PPTX 슬라이드 전체에 이미지로 삽입하는 방식이었다. 이 방식은 시각 충실도는 높지만 PPT 안에서 텍스트, 표, 카드 등을 편집할 수 없다는 한계가 있다.

v0.3에서는 목표를 다음과 같이 변경한다.

> **시각 보존만 하는 변환기에서, 편집 가능한 PPTX 객체를 우선 생성하는 하이브리드 변환기로 전환한다.**

최종 방향은 다음과 같다.

```text
HTML slide
 ├─ title / subtitle / paragraph / list → PPT text box
 ├─ simple table → PPT native table
 ├─ kt-card / kt-kpi / kt-note / kt-badge → PPT shape + text box
 ├─ icon / simple svg → SVG image 또는 shape
 ├─ chart / architecture diagram / dense visual map → image fallback
 └─ unsupported element → cropped image fallback
```

즉, 모든 HTML을 무리하게 PPT native 객체로 바꾸지 않는다. 대신 사용자가 자주 수정하는 제목, 본문, 표, 카드, KPI, 라벨을 우선 편집 가능하게 만들고, 복잡한 시각 요소는 이미지로 보존한다.

---

## 2. 문제 정의

### 2-1. 기존 이미지 기반 변환의 장점

- HTML/CSS 렌더링 결과를 거의 그대로 보존한다.
- CSS grid, flex, badge, chart, diagram 등 복잡한 시각 요소를 안정적으로 처리한다.
- 구현 난이도가 낮고, 결과 예측 가능성이 높다.
- 빠르게 AAP 제안서 초안을 만들 수 있다.

### 2-2. 기존 방식의 한계

- PPT 안에서 텍스트를 수정할 수 없다.
- 표 셀을 직접 수정할 수 없다.
- 카드 문구, KPI 숫자, badge 문구를 수정하려면 원본 HTML을 수정하고 다시 변환해야 한다.
- 영업/제안서 작업 특성상 마지막 문구 수정이 잦은데, full-image 방식은 이 흐름과 맞지 않는다.

### 2-3. 새 핵심 요구사항

1. 슬라이드 전체 이미지화는 fallback으로 유지한다.
2. 제목, 본문, 표, 카드, KPI 등 반복 요소는 PPT native 객체로 생성한다.
3. 편집 가능성과 시각 품질 사이에서 균형을 잡는다.
4. native 변환 실패 시 자동으로 이미지 fallback한다.
5. 어떤 요소가 native로 변환됐고 어떤 요소가 이미지로 처리됐는지 manifest/log에 남긴다.

---

## 3. 설계 원칙

### 3-1. 전체 HTML/CSS 변환기를 만들지 않는다

임의의 HTML/CSS 전체를 완벽히 PPT 객체로 재현하는 것은 사실상 작은 브라우저 렌더링 엔진을 만드는 일에 가깝다. 따라서 본 시스템은 다음 전략을 따른다.

```text
CSS 전체 해석 X
의미 있는 DOM 패턴 인식 O
반복 컴포넌트 native 변환 O
복잡 요소 image fallback O
```

### 3-2. 의미 기반 변환을 우선한다

예를 들어 아래 HTML은 CSS를 해석해서 변환하는 것이 아니라, `kt-card`라는 의미를 읽어서 PPT 객체로 재구성한다.

```html
<div class="kt-card" data-ppt="native-card">
  <h3>문서 기반 질의응답</h3>
  <p>사내 문서와 정책을 기반으로 응답</p>
</div>
```

변환 결과:

```text
rounded rectangle
 ├─ title textbox
 └─ body textbox
```

### 3-3. 사용자 수정 가능성이 높은 것부터 native화한다

우선순위는 다음과 같다.

| 우선순위 | 대상 | 이유 |
|---:|---|---|
| 1 | 제목/부제/본문 | 제안서에서 가장 자주 수정됨 |
| 2 | 표 | 셀 단위 수정 수요가 큼 |
| 3 | 카드/KPI/Note/Badge | 문구 수정 빈도 높음 |
| 4 | 아이콘/SVG | 위치/크기 조정 필요 |
| 5 | 복잡 도식/차트 | 편집보다 시각 보존이 중요 |

### 3-4. 실패하면 이미지 fallback한다

native 변환기는 완벽할 필요가 없다. 중요한 것은 실패 시 결과물이 깨지지 않는 것이다.

```text
try native mapping
  success → editable PPT object
  fail → cropped screenshot image
```

---

## 4. 권장 기술 조합

### 4-1. PptxGenJS

PPTX 생성의 중심 엔진으로 사용한다.

주요 역할:

- slide 생성
- text box 생성
- table 생성
- shape 생성
- image/SVG 삽입
- master slide 적용
- chart 후보 처리

적합한 이유:

- JavaScript/TypeScript 기반이라 Playwright DOM 측정 결과와 연결하기 쉽다.
- `addText`, `addTable`, `addShape`, `addImage` 등 객체 생성 API가 명확하다.
- HTML table을 PowerPoint slide로 변환하는 `tableToSlides()` 계열 기능을 참고할 수 있다.

### 4-2. Playwright

렌더링과 DOM 측정 담당.

주요 역할:

- HTML을 실제 브라우저에서 렌더링
- 각 element의 bounding box 측정
- computed style 추출
- image fallback용 element screenshot 생성
- 전체 slide screenshot 생성

### 4-3. Selective Native Mapper

본 프로젝트의 핵심 모듈.

주요 역할:

- DOM node를 변환 가능성 기준으로 분류
- native 변환 가능한 요소는 PptxGenJS 객체로 매핑
- 복잡하거나 실패한 요소는 이미지 fallback으로 넘김

### 4-4. Image Fallback Renderer

시각 보존을 위한 안전망.

주요 역할:

- 복잡한 DOM 요소를 element 단위로 캡처
- architecture diagram, chart, dense visual map을 이미지로 삽입
- native 변환 실패 시 fallback 이미지 생성

### 4-5. pptx-automizer, 선택 후보

KT DS 공식 PPT 템플릿을 강하게 활용해야 하는 단계에서 검토한다.

주요 역할 후보:

- 기존 `.pptx` 템플릿 import
- 템플릿 슬라이드 병합
- placeholder 교체
- PptxGenJS와 조합한 객체 생성

초기 v0.3에서는 필수 의존성으로 넣지 않는다. v0.4 이후 템플릿 기반 운영이 중요해지면 도입한다.

---

## 5. 변환 모드

CLI는 세 가지 변환 모드를 제공한다.

### 5-1. `--mode image`

기존 MVP 방식.

```text
각 .kt-slide 전체를 PNG로 캡처
→ PPTX에 full-slide image로 삽입
```

용도:

- 빠른 초안 생성
- 복잡한 장표
- native 변환 품질이 낮은 경우
- 발표용 시각 보존 우선

### 5-2. `--mode native`

가능한 모든 요소를 native PPT 객체로 변환한다.

용도:

- 실험/PoC
- 단순 HTML
- 표준 컴포넌트만 포함된 슬라이드

주의:

- 복잡한 CSS 재현 품질이 낮을 수 있다.
- fallback 없이 native만 강제하면 결과가 깨질 수 있다.

### 5-3. `--mode hybrid` 기본값

권장 기본 모드.

```text
편집 가능한 요소 → native PPT object
복잡한 요소 → image fallback
```

용도:

- 실제 제안서 생성
- PPT에서 후편집이 필요한 경우
- 시각 품질과 편집성을 동시에 확보해야 하는 경우

---

## 6. 변환 대상 분류

### 6-1. Native Text

대상:

```html
<h1>, <h2>, <h3>, <p>, <li>, .lead, .kt-subtitle
```

출력:

```text
PPT text box
```

매핑 항목:

| HTML/CSS | PPT |
|---|---|
| textContent | text |
| font-size | fontSize |
| font-weight | bold |
| color | color |
| line-height | breakLine / fit 보정 |
| text-align | align |
| bounding box | x, y, w, h |

### 6-2. Native Table

대상:

```html
<table data-ppt="native-table">
<table class="kt-table">
```

출력:

```text
PPT native table
```

우선 지원:

- thead/tbody
- th/td 텍스트
- 기본 행/열
- 셀 배경색
- 텍스트 색상
- 정렬
- border
- 기본 column width

초기 제한:

- nested table은 image fallback
- 복잡한 rowspan/colspan은 fallback 또는 partial 지원
- 셀 안의 복잡한 HTML은 텍스트 추출 또는 fallback

판별 기준:

```text
simple table
 ├─ nested table 없음
 ├─ 셀 안의 block 요소 복잡도 낮음
 ├─ rowspan/colspan 없거나 제한적
 └─ 행/열 수가 slide 영역 안에 들어감
```

### 6-3. Native Card

대상:

```html
<div class="kt-card" data-ppt="native-card">
<div class="cap-card">
```

출력:

```text
rounded rectangle + text boxes
```

매핑:

| HTML | PPT |
|---|---|
| card container | roundedRect shape |
| h3/h4 | title text box |
| p | body text box |
| badge | small roundedRect |
| border-left accent | line or narrow rect |

### 6-4. Native KPI

대상:

```html
<div class="kt-kpi" data-ppt="native-kpi">
  <div class="value">30%</div>
  <div class="label">처리시간 절감</div>
</div>
```

출력:

```text
number text box + label text box + optional card shape
```

### 6-5. Native Badge / Tag

대상:

```html
<span class="kt-badge">AI:ON-U</span>
<span class="tag tag--accent">PoC</span>
```

출력:

```text
small rounded rectangle + centered text
```

### 6-6. SVG / Icon

처리 방식:

| 유형 | 처리 |
|---|---|
| 단순 icon SVG | SVG image로 삽입 |
| rect/line/circle 중심 단순 도형 | PPT shape 변환 후보 |
| 복잡 SVG | image fallback |
| CDN icon | 사전 inline SVG 치환 후 처리 |

### 6-7. Chart / Diagram / Complex Visual

대상:

```html
<div class="architecture-diagram">
<div class="capability-map">
<canvas>
<svg class="complex-chart">
```

출력:

```text
cropped image fallback
```

향후 개선:

- chart data가 JSON으로 있으면 PPT native chart 생성
- 단순 flow diagram은 shape + connector로 부분 native화

---

## 7. DOM 측정 및 좌표 변환

### 7-1. 기본 좌표계

HTML 렌더링 기준:

```text
viewport: 1600 x 900 px
slide: 13.333 x 7.5 inch
```

변환 공식:

```text
pptX = domX / 1600 * 13.333
pptY = domY / 900  * 7.5
pptW = domW / 1600 * 13.333
pptH = domH / 900  * 7.5
```

### 7-2. DOM 측정 정보

Playwright에서 수집할 정보:

```ts
interface DomBox {
  selector: string;
  tagName: string;
  className: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  computedStyle: {
    fontSize: string;
    fontWeight: string;
    color: string;
    backgroundColor: string;
    borderColor: string;
    textAlign: string;
    lineHeight: string;
    borderRadius: string;
  };
}
```

### 7-3. 중복 변환 방지

부모가 native component로 변환되면 자식은 개별 변환하지 않는다.

예:

```text
.kt-card native 변환
 ├─ h3는 card 내부 title로 처리
 └─ p는 card 내부 body로 처리
```

---

## 8. HTML 작성 규칙

편집 가능한 변환 품질을 높이려면 HTML에 의미 단서를 넣는다.

### 8-1. 권장 section 구조

```html
<section class="kt-slide kt-body" data-slide-type="body">
  <h1 data-ppt="title">핵심 기능 비교</h1>
  <p class="lead" data-ppt="subtitle">고객 업무 적용 관점에서 기능을 비교합니다.</p>

  <table class="kt-table" data-ppt="native-table">
    ...
  </table>
</section>
```

### 8-2. 권장 컴포넌트 속성

| 속성 | 의미 |
|---|---|
| `data-ppt="title"` | 제목 textbox로 변환 |
| `data-ppt="body"` | 본문 textbox로 변환 |
| `data-ppt="native-table"` | PPT table로 변환 시도 |
| `data-ppt="native-card"` | shape + text로 변환 시도 |
| `data-ppt="image"` | 강제로 이미지 fallback |
| `data-ppt="ignore"` | 변환 제외 |

### 8-3. 컴포넌트 예시

```html
<div class="kt-card" data-ppt="native-card">
  <span class="kt-badge">AI:ON-U</span>
  <h3>문서 기반 질의응답</h3>
  <p>사내 문서와 정책을 기반으로 답변을 생성합니다.</p>
</div>
```

---

## 9. CLI 명세

```bash
node html2ktds-pptx input.html -o output.pptx --mode hybrid
```

### 9-1. 기본 옵션

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `--output, -o` | `output.pptx` | PPTX 출력 경로 |
| `--mode` | `hybrid` | `image | native | hybrid` |
| `--save-html` | off | KT DS 스타일 적용 HTML 저장 |
| `--export-images` | off | fallback 이미지 및 slide screenshot 저장 |
| `--image-dir` | `output/images` | 이미지 저장 경로 |
| `--asset-dir` | `output/assets` | 변환 자산 저장 루트 |
| `--manifest` | on | 변환 manifest JSON 생성 |
| `--debug` | off | verbose log |

### 9-2. Native 변환 옵션

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `--native-text` | on | 제목/본문 native 변환 |
| `--native-table` | on | 단순 table native 변환 |
| `--native-card` | on | card native 변환 |
| `--native-kpi` | on | KPI native 변환 |
| `--native-badge` | on | badge/tag native 변환 |
| `--fallback` | `element-image` | 실패 시 fallback 방식 |
| `--strict-native` | off | fallback 없이 native만 시도 |

### 9-3. 렌더링 옵션

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `--width` | `1600` | HTML viewport width |
| `--height` | `900` | HTML viewport height |
| `--ppt-width` | `13.333` | PPT width inch |
| `--ppt-height` | `7.5` | PPT height inch |
| `--font` | `pretendard` | `pretendard | noto | system | ktflow` |
| `--logo` | `text` | `text | image | none` |
| `--logo-image` | none | 실제 로고 이미지 경로 |

---

## 10. 프로젝트 구조

```text
html-to-ktds-pptx/
├── README.md
├── package.json
├── tsconfig.json
├── src/
│   ├── cli.ts
│   ├── config.ts
│   ├── html/
│   │   ├── loadHtml.ts
│   │   ├── splitSlides.ts
│   │   ├── injectDesignSystem.ts
│   │   └── normalizeHtml.ts
│   ├── measure/
│   │   ├── playwrightSession.ts
│   │   ├── measureSlide.ts
│   │   ├── extractComputedStyle.ts
│   │   └── screenshotElement.ts
│   ├── classify/
│   │   ├── classifyNode.ts
│   │   ├── classifyTable.ts
│   │   └── nativeEligibility.ts
│   ├── pptx/
│   │   ├── createDeck.ts
│   │   ├── addNativeText.ts
│   │   ├── addNativeTable.ts
│   │   ├── addNativeCard.ts
│   │   ├── addNativeKpi.ts
│   │   ├── addNativeBadge.ts
│   │   ├── addImageFallback.ts
│   │   └── coordinate.ts
│   ├── manifest/
│   │   ├── createManifest.ts
│   │   └── types.ts
│   └── types/
│       ├── dom.ts
│       ├── slide.ts
│       └── options.ts
├── design_system/
│   ├── VERSION
│   ├── tokens.css
│   └── ktds_base.css
├── slide_templates/
│   ├── cover.html
│   ├── divider.html
│   ├── toc.html
│   └── body.html
├── snippets/
│   ├── card.html
│   ├── kpi.html
│   ├── note.html
│   ├── badge.html
│   └── comparison_table.html
├── examples/
│   ├── sample_hybrid.html
│   └── sample_table.html
└── output/
    ├── images/
    └── assets/
```

---

## 11. 핵심 타입 설계

### 11-1. ConvertOptions

```ts
export interface ConvertOptions {
  mode: 'image' | 'native' | 'hybrid';
  output: string;
  saveHtml?: string;
  exportImages: boolean;
  imageDir: string;
  assetDir: string;
  width: number;
  height: number;
  pptWidth: number;
  pptHeight: number;
  font: 'pretendard' | 'noto' | 'system' | 'ktflow';
  logo: 'text' | 'image' | 'none';
  logoImage?: string;
  native: {
    text: boolean;
    table: boolean;
    card: boolean;
    kpi: boolean;
    badge: boolean;
  };
  fallback: 'slide-image' | 'element-image' | 'none';
  debug: boolean;
}
```

### 11-2. SlideSpec

```ts
export interface SlideSpec {
  index: number;
  type: 'cover' | 'divider' | 'toc' | 'body';
  id?: string;
  title?: string;
  rawHtml: string;
  wrappedHtml: string;
}
```

### 11-3. NativeObjectPlan

```ts
export interface NativeObjectPlan {
  id: string;
  selector: string;
  kind:
    | 'native-text'
    | 'native-table'
    | 'native-card'
    | 'native-kpi'
    | 'native-badge'
    | 'image-fallback'
    | 'ignore';
  box: DomBox;
  reason?: string;
  childrenConsumed?: string[];
}
```

### 11-4. ConversionManifest

```ts
export interface ConversionManifest {
  runId: string;
  sourceHtml: string;
  generatedAt: string;
  mode: 'image' | 'native' | 'hybrid';
  designSystemVersion: string;
  slideCount: number;
  slides: Array<{
    index: number;
    type: string;
    title?: string;
    objects: Array<{
      selector: string;
      kind: string;
      editable: boolean;
      fallback: boolean;
      reason?: string;
    }>;
    images?: string[];
  }>;
}
```

---

## 12. 처리 흐름

### 12-1. Hybrid 변환 전체 흐름

```text
1. HTML load
2. DOM normalize
3. KT DS design CSS inject
4. section → slide split
5. Playwright render
6. slide별 DOM box 측정
7. node classify
8. native conversion plan 생성
9. PptxGenJS deck 생성
10. slide별 native object 추가
11. 실패/복잡 요소 image fallback 추가
12. manifest/log 저장
13. output.pptx 저장
```

### 12-2. Slide 처리 흐름

```ts
async function renderHybridSlide(slideSpec, pptxSlide, page) {
  const measurements = await measureSlide(page, slideSpec);
  const plan = createNativePlan(measurements);

  for (const item of plan) {
    try {
      if (item.kind === 'native-text') addNativeText(pptxSlide, item);
      else if (item.kind === 'native-table') addNativeTable(pptxSlide, item);
      else if (item.kind === 'native-card') addNativeCard(pptxSlide, item);
      else if (item.kind === 'native-kpi') addNativeKpi(pptxSlide, item);
      else if (item.kind === 'native-badge') addNativeBadge(pptxSlide, item);
      else if (item.kind === 'image-fallback') await addImageFallback(pptxSlide, item);
    } catch (error) {
      await addImageFallback(pptxSlide, item, { reason: error.message });
    }
  }
}
```

---

## 13. Table 변환 상세

### 13-1. Simple Table 판별

native table 변환 가능 조건:

```text
- table 내부에 nested table 없음
- 각 cell의 주요 내용이 text/strong/em/br/span 정도로 제한
- 이미지, chart, card가 cell 안에 없음
- rowspan/colspan이 없거나 단순함
- 행/열 개수가 과도하지 않음
```

### 13-2. Table 변환 로직

```text
HTML table
 → rows 추출
 → cell text 추출
 → computed style 추출
 → column width 계산
 → row height 계산
 → PptxGenJS addTable(rows, options)
```

### 13-3. Table fallback 기준

다음이면 image fallback한다.

- nested table 존재
- cell 안에 복잡한 div/card/chart 존재
- rowspan/colspan이 다중으로 얽힘
- cell별 스타일이 지나치게 복잡함
- slide 영역을 벗어날 정도로 큼

### 13-4. Table 출력 전략

| 입력 | 출력 |
|---|---|
| 단순 비교표 | PPT native table |
| 제품/기능 매트릭스 | PPT native table 우선 |
| 복잡한 capability map 표 | image fallback |
| 병합 셀 많은 표 | partial native 또는 fallback |

---

## 14. Fallback 전략

### 14-1. Element Image Fallback

hybrid 기본 fallback.

```text
복잡한 element만 crop screenshot
→ 해당 위치에 image 삽입
```

장점:

- 편집 가능한 요소와 이미지 요소를 한 슬라이드에 공존시킬 수 있다.
- 전체 슬라이드 이미지보다 편집성이 높다.

### 14-2. Slide Image Fallback

슬라이드 전체가 복잡하거나 native 변환이 무의미한 경우.

```text
slide 전체 screenshot
→ full-slide image 삽입
```

적합한 장표:

- architecture overview
- complex SVG diagram
- dashboard형 dense slide
- canvas/chart 중심 slide

### 14-3. Fallback priority

```text
1. data-ppt="image"가 있으면 강제 image
2. native eligibility 실패 시 element image
3. element screenshot 실패 시 slide image
4. strict-native면 오류로 종료
```

---

## 15. Design System 반영

### 15-1. 기본 디자인 원칙

- 흰색 캔버스 중심
- 큰 Bold 제목
- 작은 Medium 설명
- 넓은 여백
- 검정/짙은 회색 텍스트
- KT red는 포인트 컬러로 제한 사용
- body 슬라이드는 우하단 페이지 번호만 사용

### 15-2. Color Token

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

### 15-3. Slide Type

| 타입 | 용도 | 처리 |
|---|---|---|
| cover | 표지 | title/subtitle/meta/logo native 우선 |
| divider | 챕터 간지 | logo/mark native 우선 |
| toc | 목차 | list native 우선 |
| body | 본문 | hybrid 기본 |

---

## 16. 자산화 구조

v0.2의 4계층 자산화 구조를 유지한다.

```text
L1 Design System
- tokens.css
- ktds_base.css
- VERSION

L2 Slide Templates
- cover.html
- divider.html
- toc.html
- body.html

L3 Snippets
- card.html
- kpi.html
- note.html
- badge.html
- comparison_table.html

L4 Per-conversion Extracts
- output/assets/<run-id>/slide_001.html
- output/assets/<run-id>/manifest.json
- fallback images
- native mapping log
```

### 16-1. 자산 승격 기준

다음 조건을 만족하면 L4에서 L2/L3로 승격한다.

- 2개 이상 덱에서 재사용 가능
- 고객명/수치/프로젝트명 제거 가능
- 입력 변수 3~7개로 일반화 가능
- PPT에서 수작업 수정이 적음
- 3회 이상 반복 사용됨

---

## 17. 구현 단계

### Phase 0. 기존 MVP 보존

목표:

- `--mode image`를 유지한다.
- 기존 Playwright slide screenshot → PPT full-image 방식은 fallback으로 남긴다.

산출물:

- 안정적인 image mode
- 기존 sample 변환 성공

### Phase 1. TypeScript/PptxGenJS 기반 전환

목표:

- PptxGenJS 기반 deck writer를 만든다.
- Playwright 측정 결과를 PptxGenJS 좌표로 변환한다.

산출물:

- `createDeck.ts`
- `coordinate.ts`
- 빈 슬라이드 생성
- 이미지 삽입 기능

### Phase 2. Native Text

목표:

- h1/h2/h3/p/li를 textbox로 변환한다.

산출물:

- 제목/본문 편집 가능 PPTX
- text style 일부 반영
- text manifest 기록

### Phase 3. Native Table

목표:

- 단순 HTML table을 PPT native table로 변환한다.

산출물:

- `classifyTable.ts`
- `addNativeTable.ts`
- table fallback 기준
- sample_table.html 테스트

### Phase 4. Native Components

목표:

- kt-card, kt-kpi, kt-note, kt-badge를 shape + text로 변환한다.

산출물:

- `addNativeCard.ts`
- `addNativeKpi.ts`
- `addNativeBadge.ts`
- snippets 확장

### Phase 5. Element Image Fallback

목표:

- 복잡 요소만 crop screenshot으로 삽입한다.

산출물:

- `screenshotElement.ts`
- `addImageFallback.ts`
- fallback image manifest

### Phase 6. Template Integration

목표:

- KT DS `.pptx` 템플릿 또는 master slide 기반 생성 검토.

후보:

- PptxGenJS master slide
- pptx-automizer
- reference.pptx placeholder 교체

---

## 18. 테스트 기준

### 18-1. 기능 테스트

```bash
node html2ktds-pptx examples/sample_hybrid.html \
  -o output/sample_hybrid.pptx \
  --mode hybrid \
  --export-images \
  --debug
```

검증:

- PPTX 생성
- 제목/본문 편집 가능
- 단순 table 셀 편집 가능
- card 텍스트 편집 가능
- 복잡 diagram은 이미지로 보존
- manifest 생성

### 18-2. 편집성 테스트

PowerPoint에서 직접 확인:

| 대상 | 기대 결과 |
|---|---|
| 제목 | 텍스트 선택/수정 가능 |
| 본문 | 텍스트 선택/수정 가능 |
| 표 | 셀 선택/수정 가능 |
| 카드 제목 | 텍스트 수정 가능 |
| KPI 숫자 | 텍스트 수정 가능 |
| 복잡 도식 | 이미지로 위치/크기 수정 가능 |

### 18-3. 시각 품질 테스트

기준:

- image mode 대비 hybrid mode 시각 유사도 80% 이상
- 텍스트 위치 오차 ±8px 이내
- 표 위치/크기 오차 ±12px 이내
- fallback 이미지는 원본과 동일 품질

### 18-4. 한글 테스트

- 한글 제목/본문/표 셀 깨짐 없음
- Pretendard/Noto fallback 정상
- 한글 파일명 입력/출력 가능

---

## 19. 주요 리스크와 대응

| 리스크 | 설명 | 대응 |
|---|---|---|
| CSS 완전 재현 불가 | PPT와 브라우저 렌더링 모델 차이 | 의미 기반 매핑 + fallback |
| 텍스트 줄바꿈 차이 | PPT text box와 HTML line-height 차이 | box 여유값, font scale 보정 |
| table 병합 셀 처리 | rowspan/colspan 복잡 | 단순 table부터 지원, 복잡 table fallback |
| 카드 내부 layout 차이 | flex/grid 재현 어려움 | 표준 kt-card DOM 규칙 제한 |
| 폰트 차이 | KT Flow 부재 | Pretendard 기본, ktflow 옵션 |
| PowerPoint 호환성 | SVG/폰트/OOXML 차이 | PNG fallback 유지 |

---

## 20. Claude Code 작업 지시문

아래 지시문을 기준으로 구현을 시작한다.

```text
HTML → KT DS PPTX 변환 시스템을 v0.3 하이브리드 편집 가능 구조로 구현해줘.

목표는 기존 full-slide image 방식만 사용하는 것이 아니라,
PptxGenJS + Playwright DOM 측정 + selective native mapping + image fallback 조합으로
가능한 요소는 PowerPoint에서 편집 가능한 객체로 생성하는 것이야.

핵심 요구사항:
1. TypeScript/Node 기반 CLI로 구현
2. PptxGenJS로 PPTX 생성
3. Playwright로 HTML 렌더링, DOM bounding box, computed style 측정
4. --mode image | native | hybrid 지원
5. 기본값은 --mode hybrid
6. h1/h2/h3/p/li는 native text box로 변환
7. 단순 table은 native PPT table로 변환
8. kt-card / kt-kpi / kt-note / kt-badge는 shape + text box로 변환
9. 복잡한 chart/diagram/SVG/unsupported element는 element screenshot image fallback
10. 변환 결과 manifest.json 생성
11. 각 object가 native인지 fallback인지 기록
12. 기존 image mode도 유지
13. Windows + 한글 파일명/한글 텍스트 지원
14. KT DS design_system/tokens.css, ktds_base.css 구조 유지
15. examples/sample_hybrid.html과 examples/sample_table.html 포함

프로젝트 구조는 다음을 기준으로 해줘.
- src/html
- src/measure
- src/classify
- src/pptx
- src/manifest
- design_system
- slide_templates
- snippets
- examples
- output

구현 순서:
1. package.json, tsconfig.json, CLI 골격
2. HTML load/split/inject
3. Playwright render/measure
4. PptxGenJS deck writer
5. image mode 구현
6. native text 구현
7. native table 구현
8. native card/kpi/badge 구현
9. element image fallback 구현
10. manifest/log 구현
11. sample_hybrid.html 변환 테스트
12. README 작성

중요:
- 모든 HTML/CSS를 완벽히 native로 바꾸려고 하지 마.
- 변환 불가능하거나 복잡한 요소는 반드시 image fallback해.
- 편집 가능성이 높은 제목/본문/표/카드/KPI부터 우선 native화해.
- 최종 PPTX는 사용자가 PowerPoint에서 주요 텍스트와 표를 수정할 수 있어야 해.
```

---

## 21. 최종 권고

이제 프로젝트의 핵심은 “HTML을 PPT 이미지로 바꾸는 도구”가 아니다.

핵심은 다음이다.

> **HTML 기반 제안서 자산을 PowerPoint에서 후편집 가능한 KT DS 표준 장표로 재구성하는 도구**

따라서 최종 기본 전략은 다음으로 고정한다.

```text
기본 모드: hybrid
엔진: PptxGenJS
측정: Playwright
편집 가능화: selective native mapping
안전망: image fallback
자산화: manifest + L1/L2/L3/L4 구조
```

우선 구현 범위는 다음 네 가지로 제한한다.

1. Native text
2. Native table
3. Native card/KPI/badge
4. Element image fallback

이 네 가지가 안정화되면, 이후 KT DS 템플릿 기반 생성, pptx-automizer 연계, chart native화, connector/flow diagram native화로 확장한다.
