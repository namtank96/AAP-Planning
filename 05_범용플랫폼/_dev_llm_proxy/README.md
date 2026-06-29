# AAP 분해 프록시 (Phase 2 라이브 LLM)

요청 텍스트 → Claude(Sonnet 4.6) 구조화 출력 → 표준 분해 JSON(work·compose·gates·ontology·lineage).
정본 `maestro/`의 `core/llm_breakdown.js`(+`viz_bridge.js`)가 이 프록시를 호출하고, **프록시가 꺼져 있으면 결정론 폴백**(`viz_bridge.js`의 `detViz`)으로 떨어집니다 → file:// 데모는 항상 작동.

## 왜 프록시인가
- maestro는 단일 HTML·외부 라이브러리 0·`file://` 더블클릭이 원칙. 브라우저에 **API 키를 둘 수 없음**.
- 프록시(이 서버)에만 키를 두고, 브라우저는 `localhost:8787/breakdown`만 호출 → 키 노출 0.
- 구조화 출력(`output_config.format` + json_schema)으로 Pack/viz 스키마를 **서버에서 강제** → 환각·파싱 위험 ↓.

## 설치·실행
```bash
cd 05_범용플랫폼/_dev_llm_proxy
npm install                       # @anthropic-ai/sdk 1개만
# 키 주입 후 실행 (셸 환경변수)
#  macOS/Linux/Git-Bash:
ANTHROPIC_API_KEY=sk-ant-... npm start
#  Windows PowerShell:
$env:ANTHROPIC_API_KEY="sk-ant-..."; npm start
```
→ `http://localhost:8787` 기동. `GET /health`로 확인.

> ⚠️ **비용**: 호출당 1회 LLM 요청(분해 시점에만 — 케이스 실행마다 ✕). 기본 모델 `claude-sonnet-4-6`($3/$15·1M). 더 저렴하게는 `AAP_MODEL=claude-haiku-4-5`($1/$5). 시스템 프롬프트는 프롬프트 캐싱(반복 호출 시 입력 ~0.1×).

## 엔드포인트
| | |
|---|---|
| `GET /health` | `{ok:true, model}` |
| `POST /breakdown` | body `{text, model?}` → 표준 분해 JSON. `model`은 `claude-sonnet-4-6`/`claude-haiku-4-5`만 허용(기본=env) |

## 환경변수
- `ANTHROPIC_API_KEY` (필수)
- `PORT` (기본 8787)
- `AAP_MODEL` (기본 `claude-sonnet-4-6`)

## 보안
- 키는 서버 환경변수에만. `.env`/키는 **커밋 금지**(`.env.example`만 공유).
- 이 프록시는 **로컬 개발용**. 운영 배포 시 인증·rate limit·도메인 제한 필요.

## maestro 연동
`INTEGRATION.md` 참고 — **이미 maestro에 배선 완료**(index.html script 3개 + 새 업무 요청·AI FDE가 `AAP_VIZ_BRIDGE.analyze` 호출). 프록시만 켜면 라이브, 끄면 결정론 폴백. 코드 변경 0.
