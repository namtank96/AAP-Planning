# 백업 — app v0.6 (채용 Pack 추가 직전)

작성 260619, aap-platform 페르소나.

채용(recruiting) 도메인 네이티브 Pack 신규 구축 작업 직전의 `app/` 스냅샷.

**셸(PowerShell/Bash) 권한이 차단되어** 전체 디렉터리 복사 대신, 이번 작업에서 **실제로 변경되는 파일**을 이 폴더에 개별 백업한다:
- `index.html` — `<script src="packs/recruiting.js">` 한 줄 추가 (그 외 무변경)
- `core/platform.css` — 채용 surface 전용 CSS 블록 말미 append (그 외 무변경)

변경하지 않는 파일(`core/core.js`·`core/icons.js`·`core/authoring.js`·`core/pipeline.js`·`packs/meeting.js`·`packs/voc.js`)은 원본이 그대로 유지되므로 별도 백업 생략(필요 시 git 히스토리로 복원).

> 코어 도메인 무관성 유지: 채용 Pack은 `PACK.surface`(함수형 커스텀 렌더)로 ATS 화면을 그리며, 코어에는 채용 전용 분기를 추가하지 않음.
