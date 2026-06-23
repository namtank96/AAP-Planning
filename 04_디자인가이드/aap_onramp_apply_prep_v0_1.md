# On-Ramp(새 업무 요청) index.html 적용 준비 v0.1 (260623)

> **성격**: `aap_studio_enhancement_review_v0_1.md` §1(On-Ramp ①②③)을 **충돌 없이 붙일 ready 아티팩트**. app/(`index.html`·`core.js`)이 다른 세션 미커밋이라 직접 못 넣음 → **체크포인트 후 적용**.
> **현재 대상**: `core/core.js` `promptNewCase(anchor)`가 `.nc-menu.nc-onramp` 패널을 문자열로 생성 + `matchPackByText(text)` 매칭 + `#ncReco` 렌더. CSS는 platform.css(또는 platform-fix.css override).
> **경계**: markup/CSS = 적용 가능. **`io` 계약·matchPackByText 로직 = 다른 세션(Pack Contract v2·core)** → 아래 "결선 메모"로 제안만.

---

## ① 입력 다양화 (텍스트 + 파일 + 필드)
**패널 markup 추가**(현 textarea 아래):
```html
<!-- io.inputs 기반 동적 — 활성/후보 팩의 inputs 선언으로 렌더 -->
<div class="nc-inputs" id="ncInputs">
  <!-- type:file  --> <label class="nc-drop"><span data-ic="file-text"></span>이력서·JD 끌어두기 / 선택<input type="file" hidden multiple></label>
  <!-- type:field --> <div class="nc-field"><span class="nc-fl">직무</span><input class="nc-fi" placeholder="예: 백엔드 개발 2명"></div>
</div>
```
**결선 메모(app)**: `promptNewCase`가 매칭된(또는 후보) 팩의 `io.inputs[]`를 읽어 `type`(text/file/field)별로 위 markup을 동적 생성. 파일=mock 파싱(이름·건수만, 실파싱=Phase3). 필드값→`ncSeed`에 합쳐 `createCase(seed)`.

## ② 명확화 질문 (모호 시 되묻기)
**markup**(reco 위, 조건부):
```html
<div class="nc-clarify" id="ncClarify" hidden>
  <div class="nc-cl-h"><span data-ic="help-circle"></span>몇 가지만 확인할게요</div>
  <!-- 질문 칩(선택형) 또는 짧은 입력 -->
  <div class="nc-cl-q"></div>
</div>
```
**결선 메모(app)**: 입력 토큰이 부족/모호(매칭 신뢰도 낮음·필수 필드 결측)면 `#ncClarify` 노출 → 1~2개 보완 질문(유형/규모 등) → 답을 seed·매칭에 반영. 결정론 규칙으로 질문 생성(예: 매칭<임계 & 필드 결측 → 해당 질문). 실제 LLM 되묻기=Phase3. (Palantir "Request Clarification")

## ③ 유형 인식 governed — 신뢰도 + 복수 후보 + 근거
**현 `#ncReco`(단일 매칭) → top-N + 신뢰도 바 + 근거**:
```html
<div class="nc-reco-h">인식된 유형 <span class="nc-reco-sub">신뢰도순</span></div>
<button class="nc-reco-i" data-pick="recruiting">
  <span class="ty-badge tA">채용</span>
  <span class="nc-conf"><i style="width:82%"></i></span><span class="nc-conf-n">82%</span>
  <span class="nc-why">매칭 근거: '채용·이력서·면접' 토큰 3</span>
  <span class="nc-reco-go">이 유형으로 실행 ›</span>
</button>
<!-- 차순위 후보 1~2개 동일 구조 + 하단 '새 유형으로 격상' -->
```
**결선 메모(app)**: `matchPackByText`가 이미 `{id,score,hits}` 산출 → **top-N(예 3) 반환**으로 확장, score→신뢰도%·hits→근거 토큰 표기. 임계 미달 전부면 ② 명확화 또는 격상 유도. (Palantir governed reasoning: 근거 보임)

---

## CSS (platform-fix.css override · 내 레인 적용 가능)
```css
.nc-inputs{display:flex;flex-direction:column;gap:var(--sp-2);margin:var(--sp-3) 0;}
.nc-drop{display:flex;align-items:center;gap:var(--sp-2);border:1.5px dashed var(--border);border-radius:var(--r-node);
  padding:var(--sp-3);font-size:var(--fs-sub);color:var(--muted);cursor:pointer;}
.nc-drop:hover{border-color:var(--aap-border);background:var(--aap-soft);}
.nc-field{display:flex;align-items:center;gap:var(--sp-2);} .nc-fl{font-size:var(--fs-sub);color:var(--faint);width:48px;}
.nc-fi{flex:1;font-size:var(--fs-sub);border:1px solid var(--border);border-radius:var(--r-chip);padding:var(--sp-2) var(--sp-3);font-family:inherit;}
.nc-clarify{border:1px solid var(--amber-border);background:var(--amber-soft);border-radius:var(--r-node);padding:var(--sp-3);margin:var(--sp-2) 0;}
.nc-cl-h{font-size:var(--fs-sub);font-weight:800;color:var(--amber-ink);display:flex;align-items:center;gap:6px;margin-bottom:var(--sp-2);}
.nc-conf{display:inline-block;width:54px;height:5px;border-radius:var(--r-pill);background:var(--line);overflow:hidden;vertical-align:middle;margin:0 6px;}
.nc-conf i{display:block;height:100%;background:var(--aap);border-radius:var(--r-pill);}
.nc-conf-n{font-size:var(--fs-micro);font-weight:800;color:var(--aap-ink);}
.nc-why{display:block;font-size:var(--fs-micro);color:var(--faint);margin-top:2px;}
```
필요 아이콘: `file-text`(있음)·`help-circle`(icons.js 추가 — app 세션).

## 적용 순서 (체크포인트 후)
1. CSS = platform-fix.css에 합본(내 레인) 또는 platform.css 인수 시 병합.
2. markup/결선 = `core.js promptNewCase`·`matchPackByText`·`io.inputs` (app 세션). 위 markup·메모 그대로 참조.
3. 검증: 새 업무 요청 → 파일·필드 입력·복수 후보 신뢰도·(모호 시) 명확화 → 실행/격상. 헤드리스 무에러.
