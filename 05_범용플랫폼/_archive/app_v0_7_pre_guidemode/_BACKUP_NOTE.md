# 백업 — app/ v0.7 (시연 모드/Guide Mode 추가 직전)

> 생성: 260619, aap-platform agent (시연 모드 빌드 직전)
> 셸 cp/rm 권한 차단 환경 → **변경 대상 파일만** Read+Write로 수기 백업.
> 무변경 파일(core/core.js·core/authoring.js·core/pipeline.js·packs/meeting.js·packs/voc.js)은
> 이 시점 그대로이며 git 히스토리(직전 커밋)로 복원 가능.

## 이 시점에서 변경된(=여기 백업된) 파일
- `index.html` — gnav '시연' 항목 + demo 뷰 섹션 + `<script src="core/demo.js">` 추가 예정
- `core/icons.js` — `presentation`·`mouse-pointer`·`pause` 등 Lucide path 추가 예정
- `core/platform.css` — `.demo-*`(시나리오 선택) + `.guide-*`(스포트라이트/말풍선/커서) 스타일 추가 예정
- `packs/recruiting.js` — `demoScenario`(시연 스텝 데이터, 데이터 기반) 추가 예정

## 신규 파일(백업 대상 아님 — 직전엔 없었음)
- `core/demo.js` — 가이드 투어 엔진(코어·도메인 무관) + 시나리오 레지스트리 렌더

## 복원
변경 파일을 이 폴더에서 app/ 동일 경로로 덮어쓰고, `core/demo.js`를 삭제 + index.html의
demo 관련 추가분을 되돌리면 v0.7(시연 모드 이전)로 복귀.
