# maestro 연동 가이드 — 라이브 LLM 분해 (배선 완료 · 켜기만)

> **현재 상태(260629)**: 정본 `05_범용플랫폼/maestro/`에 라이브 LLM 분해 배선이 **이미 들어가 있습니다.** 아래는 "어떻게 켜고 검증하는가"입니다. (구 app/ owner-세션 패치 가이드는 폐기 — 승격으로 maestro가 정본.)

## 0. 배선 현황 (maestro에 적용됨)
`maestro/index.html`이 공용 모듈 3개를 로드합니다:
```html
<script src="core/viz_decomp.js"></script>     <!-- 공용 분해·온톨로지·Lineage 렌더 (window.AAP_VIZ) -->
<script src="core/llm_breakdown.js"></script>  <!-- 라이브 LLM 분해 어댑터 (window.AAP_LLM_BREAKDOWN) -->
<script src="core/viz_bridge.js"></script>     <!-- 업무설명→분해뷰 연결 (window.AAP_VIZ_BRIDGE.analyze) -->
```
**새 업무 요청 모달**(2차)과 **AI FDE 전역 패널**(3b)이 `AAP_VIZ_BRIDGE.analyze(text, el)`을 호출합니다:
1. **즉시** 결정론 `detViz(text)`로 분해 뷰 렌더(빈 화면·지연 0)
2. 프록시 가동 중이면 `AAP_LLM_BREAKDOWN.run(text)`로 **조용히 라이브 업그레이드**(온톨로지·Lineage 탭 포함)
3. 프록시 없으면(`.catch`) 결정론 유지 → **`file://` 더블클릭 데모는 항상 작동**

즉, **selective-API**: API는 "분해 생성 순간"에만 닿고, 매칭·게이트·런타임·계보는 결정론. → `memory/project_decomposition_demo`.

## 1. 라이브 켜기 (프록시 기동)
```bash
cd 05_범용플랫폼/_dev_llm_proxy
npm install                                    # @anthropic-ai/sdk 1개
# 키 주입 후 실행 (셸 환경변수 — server.js는 process.env 직접 사용)
#  Git-Bash/macOS/Linux:  ANTHROPIC_API_KEY=sk-ant-... npm start
#  PowerShell:            $env:ANTHROPIC_API_KEY="sk-ant-..."; npm start
```
→ `http://localhost:8787` 기동(`GET /health`로 확인). 이 상태에서 maestro의 **새 업무 요청/AI FDE 분해가 자동으로 라이브**가 됩니다(코드 변경 0).

- 포트·주소 override: 브라우저에서 `window.AAP_LLM_ENDPOINT='http://localhost:9000'`(기본 `localhost:8787`).
- `file://`에서도 `localhost` 프록시 호출은 동작(CORS 허용). 단 프록시가 떠 있어야 함.

## 2. 데이터 shape — 라이브 분해 = viz가 바로 소비
프록시/어댑터 반환 객체가 **`AAP_VIZ.mount(el, data)` 입력 그대로**(server.js SCHEMA가 강제):
`{label,type,purpose, work[{id,nm,can,actor,gate,actions,data,dec,risk,why,ops[{ty,L,nm,desc,reads,out,why}]}], compose[], gates[], ontology{objects,links,touch}, lineage{output,chain}}`
- 결정론 폴백(`detViz`)은 `work·compose·gates`만 — ontology/lineage는 **라이브 LLM만** 생성(조건부 탭, 빈 탭 ✕).

## 3. 검증
- **격리 체인**: `test_live.html` 더블클릭 → 업무 설명 입력 → 3탭(분해·재구성/온톨로지/Lineage) 라이브 렌더되면 프록시+어댑터+모듈 OK.
- **정본 E2E**: maestro에서 프록시 켠 채 "＋ 새 업무 요청" → 입력 → 분해 뷰가 라이브로 갱신(온톨로지·Lineage 탭 등장)되는지. 프록시 끄면 결정론만(탭 2개) — 폴백 정상.

## 4. (선택) 심화 — Pack 생성까지 라이브
현재 라이브는 **분해 뷰**(AAP_VIZ_BRIDGE.analyze)까지. `buildPackFromDecomp`는 결정론 분해 기준으로 Pack을 만듭니다.
라이브 분해 결과(`work/compose/gates/ontology/lineage`)를 `buildPackFromDecomp`에 넘겨 **신규 Pack·런타임까지 라이브화**하려면 async 경로 1곳 추가 필요(결정론 폴백 경로 유지 필수·회귀 검증). 별도 승인 작업.

## 5. 모델·비용
- 기본 `claude-sonnet-4-6`($3/$15). 저가 `AAP_MODEL=claude-haiku-4-5`($1/$5).
- 분해는 **요청 분석 시 1회**(케이스 실행마다 ✕) → 호출 희소. 시스템 프롬프트 캐싱 적용(반복 시 입력 ~0.1×).
- 키는 프록시(서버)에만 — 브라우저 0.
