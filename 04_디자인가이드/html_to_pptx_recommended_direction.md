# HTML → PPTX 변환 도구 추천 방향

> 작성일: 2026-05-22  
> 목적: KT DS AAP 기획안 및 향후 제안서 자동화 도구의 현실적 고도화 방향 정리  
> 핵심 결론: **Path A + `.potx/reference.pptx`를 메인으로 두고, Path B는 시각 충실도용 fallback으로 유지한다. Path C는 지금 전체 구현하지 말고, 반복 패턴이 확인된 뒤 제한적으로 추진한다.**

---

## 1. Executive Summary

현재 HTML → PPTX 변환 도구는 이미 의미 있는 수준까지 도달했다.

- Path A: Markdown → PPTX  
  - 장점: 텍스트 편집 가능
  - 단점: 디자인 표현력 제한
- Path B: HTML → Playwright PNG → PPTX  
  - 장점: 시각 충실도 높음
  - 단점: body 슬라이드 편집 불가
- Path C 후보: Semantic HTML → Native PPT 객체  
  - 장점: 편집 가능성과 디자인 품질의 균형 가능
  - 단점: 구현 난이도 높고 예외가 많음

현재 단계에서 가장 합리적인 선택은 다음이다.

> **Path A를 메인 경로로 삼고, `.potx/reference.pptx` 마스터를 강화한다.  
> Path B는 복잡한 시각 슬라이드용 fallback으로 유지한다.  
> Path C는 지금 만들지 말고, 반복되는 표준 컴포넌트가 충분히 쌓인 뒤 제한 구현한다.**

---

## 2. 왜 Path C를 지금 만들지 않는가

Path C는 매력적이지만, 실제로는 작은 HTML/CSS → PPTX layout engine을 만드는 일에 가깝다.

필요한 구현 요소는 다음과 같다.

- HTML 구조 파싱
- KT DS semantic component 인식
- CSS 일부 해석
- PPT 좌표계 변환
- textbox / shape / table / image / icon 매핑
- overflow 처리
- 카드 그룹 자동 분할
- 폰트, 행간, 여백, 정렬 보정
- 미지원 HTML fallback 처리

특히 body 슬라이드는 자유도가 높기 때문에, `python-pptx` 또는 다른 라이브러리로 모든 HTML을 native 객체화하려 하면 예외 처리가 계속 늘어난다.

따라서 Path C는 다음 조건이 충족된 뒤 추진하는 것이 좋다.

1. AAP 외에 2~3개 이상의 실제 덱에 적용해본다.
2. 반복되는 슬라이드 패턴이 확인된다.
3. 최소 3회 이상 재사용된 컴포넌트만 native 변환 대상으로 삼는다.
4. 자유 HTML 전체가 아니라, 제한된 semantic component만 변환한다.

---

## 3. 권장 아키텍처

최종 구조는 하나의 만능 변환기가 아니라, 입력 유형별로 경로를 나누는 방식이 적합하다.

```text
입력
 ├─ Markdown
 │   └─ Pandoc → KT DS reference.pptx → 편집 가능한 PPTX
 │
 ├─ Semantic HTML
 │   └─ PptxGenJS 또는 python-pptx → native PPT 객체
 │
 └─ Freeform HTML / SVG / 복잡한 CSS layout
     └─ Playwright screenshot → 이미지 슬라이드
```

즉, 모든 HTML을 native PPT로 변환하려 하지 않는다.

대신 HTML을 세 등급으로 나눈다.

| HTML 유형 | 처리 방식 | 예시 |
|---|---|---|
| 기본 문서 구조 | Path A 또는 native 변환 | `h1`, `h2`, `p`, `ul`, `table` |
| 표준 컴포넌트 | 제한적 Path C | `kt-card`, `kt-note`, `kt-kpi`, `capability-card` |
| 복잡한 레이아웃 | Path B fallback | SVG, CSS grid, architecture diagram, dense capability map |

---

## 4. OSS 활용 추천

유명 오픈소스 하나로 모든 문제를 해결하기보다는, 역할별로 검증된 OSS를 조합하는 편이 현실적이다.

| 역할 | 추천 OSS / 도구 | 판단 |
|---|---|---|
| Markdown → PPTX | Pandoc | Path A 메인으로 유지 |
| PPTX native 생성 | PptxGenJS 또는 python-pptx | Path C 후보 |
| HTML 렌더링 | Playwright | Path B 유지 |
| HTML 파싱 | BeautifulSoup 또는 cheerio | 현재 구조 유지 가능 |
| 아이콘 | Lucide static SVG | CDN 의존 제거 필요 |
| 웹 UI | Streamlit | 내부 사용성 확보에 적합 |

## 4-1. Pandoc

Pandoc은 Path A의 핵심으로 유지한다.

권장 방향:

- Markdown 작성 규칙을 명확히 한다.
- `.potx/reference.pptx`를 강화한다.
- 표지, 목차, 본문, 요약, 로드맵 등 일반 장표는 Path A로 생성한다.
- 생성 후 PowerPoint에서 최소 수정만 하도록 스타일을 정비한다.

## 4-2. PptxGenJS

Path C를 실험한다면 `PptxGenJS`를 우선 검토할 만하다.

잘 맞는 영역:

- card layout
- KPI card
- comparison table
- capability map
- icon + text block
- 2-column layout
- 반복되는 reference case layout

다만 PptxGenJS도 HTML/CSS 전체 변환기가 아니다.  
따라서 다음과 같은 방식이 적합하다.

```html
<div class="kt-card" data-variant="primary">
  <h3>문서 기반 질의응답</h3>
  <p>사내 문서와 정책을 기반으로 응답</p>
  <span class="kt-badge">AI:ON-U</span>
</div>
```

이를 PPT에서는 다음 객체로 매핑한다.

```text
rounded rectangle
title textbox
body textbox
badge shape
optional icon
```

즉, CSS를 해석하는 것이 아니라 **컴포넌트 의미를 PPT 객체로 조립**하는 방식이다.

## 4-3. Playwright

Playwright 기반 Path B는 유지한다.

적합한 장표:

- Architecture Overview
- Capability Map
- 대시보드형 KPI
- 복잡한 SVG/diagram
- 고객에게 보여줄 시각 중심 슬라이드

단, body 전체를 이미지로 넣는 방식은 편집성이 떨어지므로 “특수 슬라이드용 fallback”으로 역할을 제한한다.

---

## 5. 단기 실행 전략: AAP v250 완성

단기 목표는 도구 완성이 아니라 **발표 가능한 AAP PPTX 완성**이다.

권장 방식:

1. Path C 개발은 중단한다.
2. Path A 기반으로 전체 PPTX 골격을 만든다.
3. `.potx/reference.pptx`를 먼저 강화한다.
4. 04-1 Architecture Overview, 04-2 Capability Map 등 복잡한 장표만 Path B 이미지로 삽입한다.
5. 최종 polish는 PowerPoint에서 수작업으로 한다.
6. 발표 후 수정이 반복된 영역을 다음 도구 기능 후보로 기록한다.

## 5-1. AAP 덱별 추천 경로

| 장표 유형 | 추천 경로 | 이유 |
|---|---|---|
| 표지 | Path A 또는 native template | 편집 가능성 중요 |
| 목차 | Path A | 수정 빈도 높음 |
| 01~03장 문제 인식 | Path A | 텍스트 중심 |
| 04-1 Architecture Overview | Path B | 시각 구조 보존 중요 |
| 04-2 Capability Map | Path B 우선, 추후 Path C PoC | 복잡도 높음 |
| 04-3 수행 모델 | Path A 또는 부분 native | 구조화 가능 |
| 05장 레퍼런스 | Path A + 일부 시각 블록 | 사례 설명 수정 가능성 높음 |
| 07장 고객 유형 | Path A | 영업 문구 수정 가능성 높음 |
| 부록 | Path A | 내부 검토용 |

---

## 6. `.potx/reference.pptx` 강화 방향

Path A의 품질은 `.potx/reference.pptx` 품질에 크게 좌우된다.

우선 반영할 요소:

- KT DS 로고 위치
- 표지 레이아웃
- 장표 제목 위치
- 푸터
- 페이지 번호
- 보안/공유 등급 라벨
- KT red 포인트 라인
- 본문 폰트
- 표 스타일
- bullet hierarchy
- section divider layout
- quote / note / appendix layout

## 6-1. 최소 레이아웃 세트

초기에는 아래 8개 레이아웃만 있어도 충분하다.

| 레이아웃 | 용도 |
|---|---|
| Cover | 표지 |
| Agenda | 목차 |
| Section Divider | 장 구분 |
| Title + Body | 일반 본문 |
| Two Column | 비교/대안 |
| Table | 표 중심 |
| Case Study | 레퍼런스 |
| Appendix | 부록 |

---

## 7. Path C는 이렇게 제한적으로 추진

Path C는 “전체 HTML 변환기”가 아니라 “KT DS 표준 컴포넌트 native 변환기”로 정의한다.

## 7-1. 1차 Path C 대상

우선순위가 높은 컴포넌트:

1. `kt-card`
2. `kt-kpi`
3. `kt-note`
4. `kt-badge`
5. `kt-table`
6. `icon-text`
7. `capability-card`

## 7-2. Path C PoC 추천 주제

가장 좋은 PoC는 **04-2 Capability Map 한 장**이다.

성공 기준:

| 기준 | 합격선 |
|---|---|
| 텍스트 편집 가능 | 예 |
| 디자인 품질 | 현재 이미지 버전의 70~80% |
| 생성 시간 | 5초 이내 |
| 코드량 | 200~300라인 이내 |
| 수작업 대비 이점 | 명확해야 함 |

실패 기준:

- 코드가 500라인 이상으로 커진다.
- CSS 예외 처리가 계속 늘어난다.
- 이미지 버전 대비 품질이 너무 낮다.
- PowerPoint 수작업보다 빠르지 않다.
- 다른 덱에 재사용하기 어렵다.

---

## 8. AAP 기획안 표현 개선

## 8-1. Capability Map

자사 제품 명시는 유지하되, 분류명을 고객 가치 중심으로 바꾼다.

| 기존 | 권장 표현 |
|---|---|
| KT DS 자사 솔루션 | 즉시 활용 가능 자산 |
| 외부 검증 자산 | 검증 완료 / 연계 가능 자산 |
| 추가 개발 필요 | 고객 환경 맞춤 개발 영역 |

제품명은 숨기지 않는다.  
다만 제품 홍보처럼 보이지 않게 capability 설명 안에 자연스럽게 넣는다.

예:

> 문서 기반 질의응답 — AI:ON-U 활용 가능  
> 회의록 요약 Agent — 내부 검증 자산 기반 확장 가능

## 8-2. Reference

05장 레퍼런스는 자사 사례, 외부 사례, PoC 후보를 명확히 구분한다.

추천 라벨:

| 라벨 | 의미 |
|---|---|
| KT DS 수행 / 검증 | 내부 또는 고객 프로젝트 기반 |
| 외부 공개 사례 기반 | 공개 사례를 AAP 관점으로 재해석 |
| PoC 후보 시나리오 | 아직 수행 전이나 제안 가능한 시나리오 |

## 8-3. 고객 유형

Type A/B/C는 고객이 바로 이해할 수 있는 표현으로 바꾼다.

| 기존 | 고객용 표현 | 진입 제안 |
|---|---|---|
| Type A | AI 활용 초기 기업 | 단일 업무 PoC부터 시작 |
| Type B | 현업별 AI 과제 보유 기업 | 부서 Agent 묶음으로 확장 |
| Type C | 전사 AI 운영체계 필요 기업 | AAP 플랫폼/거버넌스 구축 |

각 유형에는 다음 항목을 넣는다.

- 현재 상태
- Pain Point
- 첫 진입 과제
- 3개월 후 확장 그림

---

## 9. 자산 승격 전략

`promote-asset` CLI는 지금 만들지 않는다.

먼저 수동 승격 기준을 만든다.

## 9-1. 승격 기준

다음 조건을 만족하는 슬라이드만 L2/L3 자산으로 승격한다.

- 특정 고객명/수치/프로젝트명을 제거할 수 있다.
- 2개 이상 덱에서 재사용 가능하다.
- 입력 변수 3~7개로 일반화 가능하다.
- PPT에서 수정할 필요가 적다.
- KT DS 디자인 시스템과 충돌하지 않는다.
- 3회 이상 반복 사용되었다.

## 9-2. 권장 프로세스

```text
output/assets/<run-id>/slide_NNN.html
 → 사람이 선별
 → 의미 있는 이름 부여
 → placeholder 정리
 → snippets 또는 slide_templates에 수동 등록
 → 3회 이상 반복되면 promote-asset CLI 후보로 등록
```

---

## 10. Lucide 오프라인 fallback

Lucide CDN 의존성은 장기적으로 제거하는 것이 좋다.

권장 방식:

1. 큐레이트 50개 아이콘을 static SVG로 저장한다.
2. `design_system/icons/_sprite.svg`를 만든다.
3. 변환 시점에 `<i data-lucide>`를 inline SVG로 치환한다.
4. PPTX에는 SVG 또는 PNG로 고정 삽입한다.
5. 인터넷 차단 환경에서도 동일하게 렌더링되도록 한다.

우선순위는 중간 이하이다.  
단기 AAP 완성 기준에서는 `.potx/reference.pptx` 강화가 먼저다.

---

## 11. 로드맵

## 11-1. 1~2주: AAP PPT 완성

| 우선순위 | 작업 |
|---:|---|
| 1 | Path C 개발 중단 |
| 2 | `.potx/reference.pptx` 강화 |
| 3 | Path A로 전체 골격 생성 |
| 4 | 복잡 장표만 Path B 이미지 삽입 |
| 5 | PowerPoint에서 최종 polish |
| 6 | Capability Map / Reference / Type A/B/C 표현 정리 |

## 11-2. 1개월: 실사용성 개선

| 우선순위 | 작업 |
|---:|---|
| 1 | Streamlit UI에 Path A 추가 |
| 2 | Markdown 작성 가이드 보강 |
| 3 | KT DS 표준 snippets 정리 |
| 4 | Lucide offline fallback |
| 5 | AAP 외 다른 덱 1~2개 적용 |

## 11-3. 3개월: 제한적 Path C

| 우선순위 | 작업 |
|---:|---|
| 1 | 반복 패턴 분석 |
| 2 | Capability Map native PoC |
| 3 | kt-card / kt-kpi / kt-note 변환 |
| 4 | PptxGenJS vs python-pptx 비교 |
| 5 | asset promotion 수동 프로세스 정착 |

## 11-4. 6개월: 공용 자산화

| 우선순위 | 작업 |
|---:|---|
| 1 | 사내 표준 template 배포 |
| 2 | 사용 사례 5개 이상 확보 |
| 3 | 공용 snippets library 구축 |
| 4 | 문서/가이드 정비 |
| 5 | 중복 도구 여부 확인 후 통합 논의 |

---

## 12. 최종 권고

이 프로젝트의 핵심 가치는 “HTML을 PPTX로 변환하는 것” 자체가 아니다.

진짜 가치는 다음이다.

- KT DS 제안서 작성 규칙을 구조화한다.
- 반복되는 장표 패턴을 자산화한다.
- AAP 같은 복잡한 사업기획안을 빠르게 초안화한다.
- 발표 전 수작업 시간을 줄인다.
- 향후 사내 공용 제안서 시스템으로 확장할 수 있다.

따라서 지금은 변환 엔진 완성에 몰입하기보다, 실제 덱 완성과 반복 패턴 축적에 집중해야 한다.

> **추천 방향: Path A + `.potx/reference.pptx`를 메인으로 안정화하고, Path B는 복잡 시각 슬라이드 fallback으로 유지한다.  
> Path C는 전체 HTML 변환기가 아니라, 반복 검증된 KT DS semantic component native 변환기로 제한 추진한다.**
