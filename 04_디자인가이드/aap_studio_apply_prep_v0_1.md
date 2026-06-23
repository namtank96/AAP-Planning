# 스튜디오 3영역(자산·도메인팩·워크플로우) 적용 준비 v0.1 (260623)

> **성격**: `aap_studio_enhancement_review_v0_1.md` §2~4를 **충돌 없이 붙일 ready 아티팩트**(On-Ramp prep과 동일 형식). app/ 다른 세션 미커밋 → **체크포인트 후 적용**.
> **경계**: markup·CSS(override)=적용 가능(내 레인). **데이터 계약(io·ontology·자산 스키마)·core 로직·flow=다른 세션** → "결선 메모"로 제안만.
> **CSS는 platform-fix.css(override)에 합본**(토큰 §4.3 var 사용). 현 클래스: 자산 `.reg/.ag/.asset-scope` · 도메인팩 `.cat-card/.cat-dep/.dom-*` · 워크플로우 `.wf-builder/.wfb-*/.wfr-*/.plg-*`.

---

## A. 자산 — ① 상세·편집 패널 (표준화 우선)
자산 카드 클릭 → 우측 드로어 또는 모달로 **타입별 편집**. (현재 읽기 카탈로그만)

**markup**(자산 뷰에 드로어 호스트 추가 / `core`가 `#assetDrawer` 렌더):
```html
<aside class="asset-drawer" id="assetDrawer" hidden>
  <div class="ad-head"><span class="ty-badge tA">Agent</span><b>이력서 파싱 Agent</b><span class="ad-dep s-green">배포됨</span><button class="ad-x" data-ic="x"></button></div>
  <div class="ad-body">
    <!-- 타입별 필드(아래 결선 메모의 스키마로 동적) -->
    <div class="ad-field"><label>역할·지시(Agent)</label><textarea class="ad-ta"></textarea></div>
    <div class="ad-field"><label>사용 데이터</label><input class="ad-in"></div>
    <div class="ad-field"><label>관여 계층(L)</label><input class="ad-in" value="L5"></div>
  </div>
  <div class="ad-foot"><button class="cp-btn primary">저장</button><button class="cp-btn ghost">배포/배포취소</button></div>
</aside>
```
**결선 메모(app)**: 타입별 편집 스키마 = **Pack 계약(다른 세션)** — Agent{역할/프롬프트/툴} · Module{규칙·입출력} · 기존솔루션{시스템·엔드포인트} · Connector{시스템·인증·엔드포인트} · Policy{규칙·차단조건}. 저장=팩 data 갱신(또는 packOverrides). **편집은 케이스 격리(P5)와 동일 원칙**(공유 자산 변경은 명시 확인).

## A. 자산 — ② 배포 생애주기 + ③ 추가/마켓
- **배포 배지**: 자산 카드(`.ag`)에 도메인팩 `.cat-dep` 패턴 재사용(draft 회색/active green) + 배포 버튼.
- **'+ 자산 추가'**: 자산 뷰 상단(`.asset-scope` 옆)에 버튼 → 5타입 선택 → 신규 자산 draft 생성(또는 표준 라이브러리 검색). (SK AX MCP 재사용 툴·Copilot 카탈로그)
**CSS**:
```css
.asset-drawer{position:absolute;top:0;right:0;bottom:0;width:360px;background:#fff;border-left:1px solid var(--border);box-shadow:-8px 0 24px rgba(15,23,42,.08);display:flex;flex-direction:column;z-index:6;transition:transform .2s;}
.asset-drawer[hidden]{display:none;}
.ad-head{display:flex;align-items:center;gap:var(--sp-2);padding:var(--sp-4);border-bottom:1px solid var(--line);}
.ad-body{flex:1;overflow:auto;padding:var(--sp-4);display:flex;flex-direction:column;gap:var(--sp-4);}
.ad-field label{display:block;font-size:var(--fs-micro);font-weight:800;color:var(--faint);text-transform:uppercase;margin-bottom:4px;}
.ad-ta,.ad-in{width:100%;font-family:inherit;font-size:var(--fs-sub);border:1px solid var(--border);border-radius:var(--r-node);padding:var(--sp-2) var(--sp-3);}
.ad-foot{padding:var(--sp-3) var(--sp-4);border-top:1px solid var(--line);display:flex;gap:var(--sp-2);}
.ag-dep{font-size:var(--fs-micro);font-weight:800;padding:1px 6px;border-radius:var(--r-pill);} /* draft/active 카드 배지 */
```

---

## B. 도메인 팩 — ① 데이터소스/커넥터 섹션 + ② 배포 이력
**markup**(도메인 팩 개요 탭에 섹션 추가):
```html
<p class="sec-title">연결 데이터·시스템</p>
<div class="pk-conn">
  <span class="pk-conn-i tC"><span data-ic="plug"></span>인사 DB</span>
  <span class="pk-conn-i tS"><span data-ic="server"></span>ATS</span>
  <span class="pk-conn-i tC"><span data-ic="calendar"></span>캘린더</span>
</div>
<p class="sec-title">배포 이력</p>
<div class="pk-rel"><div class="pk-rel-r"><b>v1.2</b><span>배포됨 · 승인자 김</span><span class="pk-rel-t">현행</span></div>
  <div class="pk-rel-r"><b>v1.1</b><span>draft</span><button class="cp-btn ghost">롤백</button></div></div>
```
**결선 메모(app)**: `pk-conn` = 팩 `io.connectors`(Pack v2, 다른 세션) 렌더. 배포 이력 = `packStatus`에 version·이력 확장(현 draft/deployed → +version·승인자·timestamp). 롤백=이전 버전 packOverrides 복원. (Palantir Foundry 소스 · Apollo 배포)

## B. 도메인 팩 — ③ 템플릿 복제
- 카탈로그 카드에 '복제' 액션 → 기존 팩 data 복사 → 새 id·draft. (생산성)
**CSS**:
```css
.pk-conn{display:flex;flex-wrap:wrap;gap:var(--sp-2);}
.pk-conn-i{display:flex;align-items:center;gap:5px;font-size:var(--fs-sub);border:1px solid var(--border);border-radius:var(--r-node);padding:var(--sp-2) var(--sp-3);}
.pk-conn-i.tC{color:var(--blue);} .pk-conn-i.tS{color:var(--cyan,#0891b2);}
.pk-rel-r{display:flex;align-items:center;gap:var(--sp-3);font-size:var(--fs-sub);padding:var(--sp-2) 0;border-top:1px solid var(--line);}
.pk-rel-r b{font-variant-numeric:tabular-nums;} .pk-rel-t{margin-left:auto;font-size:var(--fs-micro);color:var(--green);font-weight:800;}
```

---

## C. 워크플로우 — ① 디버거 강화 (Run 패널)
현 `.wfb-run` dry-run 요약 → **블록별 입출력·step 펼침**(AIP Logic Debugger).
**markup**(Run 패널 각 step):
```html
<div class="wfr-step">
  <div class="wfr-st-h"><span class="wfr-st-n">매칭·랭킹</span><span class="ev-kind llm">LLM</span><button class="wfr-st-x" data-ic="chevron-down"></button></div>
  <div class="wfr-st-io"><div class="wfr-io"><span>입력</span> 후보 12·JD 요건</div><div class="wfr-io"><span>출력</span> 매칭% 산출</div></div>
</div>
```
**결선 메모(app)**: dry-run(`renderRun`)이 step별 입력/출력/blockKind를 펼침 행으로. 실제 추론 표시는 Phase3(LLM). "View reasoning" 토글.

## C. 워크플로우 — ② 조건 분기(next) 캔버스 표현
- 캔버스(`.plg-*`)에서 `gate` 단계의 `next` 분기를 **두 갈래 엣지**(예: 통과→다음 / 보류→재스크리닝)로. (현 선형)
**결선 메모(app)**: Pack v2 `next:(S)=>id` 분기를 캔버스 엣지로 렌더. 분기 라벨=decisions. (다른 세션 flow 계약)
**CSS**:
```css
.wfr-step{border:1px solid var(--border);border-radius:var(--r-node);margin-bottom:var(--sp-2);}
.wfr-st-h{display:flex;align-items:center;gap:var(--sp-2);padding:var(--sp-2) var(--sp-3);}
.wfr-st-n{font-weight:700;font-size:var(--fs-sub);} .wfr-st-x{margin-left:auto;border:0;background:none;cursor:pointer;}
.wfr-st-io{padding:0 var(--sp-3) var(--sp-2);display:flex;flex-direction:column;gap:3px;}
.wfr-io{font-size:var(--fs-micro);color:var(--muted);} .wfr-io span{font-weight:800;color:var(--faint);margin-right:5px;}
```

---

## 적용 순서 (체크포인트 후)
1. CSS = platform-fix.css 합본(내 레인) 또는 platform.css 인수 시 병합. 필요 아이콘(plug·server·calendar=있음 / 없으면 icons.js, app).
2. markup·결선 = app 세션이 자산 드로어 렌더·도메인팩 섹션·Run 디버거·분기 캔버스 구현(위 스키마·메모 참조).
3. 우선순위: **자산 ① 편집**(표준화 핵심) → 도메인팩 ① 데이터소스 → 워크플로우 ① 디버거.
4. 검증: 각 뷰 헤드리스 무에러·무회귀·드로어/섹션 렌더.

## 경계
자산 편집 스키마·io.connectors·flow next·packStatus version = **다른 세션 계약**. 본 문서=UX·markup·CSS·적용 가이드.
