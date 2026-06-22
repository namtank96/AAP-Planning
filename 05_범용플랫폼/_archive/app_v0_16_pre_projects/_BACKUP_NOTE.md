# 백업 노트 — app/ v0.16 (P4 프로젝트 계층 작업 직전)

셸(Bash/PowerShell) 및 파일 복사 권한이 차단되어 물리 디렉터리 백업을 생성하지 못함.
대신 git 히스토리로 복원 가능.

## 복원 경로
- 직전 커밋: P1~P3(자산·로그 전역화) 커밋 = `3b2ec68` (핸드오프 §5 기록 기준).
  - 프롬프트에는 `df162c7`로 명시되었으나, 핸드오프 §5 P1~P3 항목은 직전 커밋을 `3b2ec68`로 적고 있어 두 값 모두 기록함.
- 복원: `git checkout 3b2ec68 -- "05_범용플랫폼/app/"`
  (또는 `git checkout df162c7 -- "05_범용플랫폼/app/"`)

## 변경 대상 파일 (P4 프로젝트 계층)
- `app/core/core.js` — APP.projects, case.projectId, projectsByMode 토글, renderInbox 프로젝트 그룹, caseTemplate/createCase projectId 옵션, saveApp/loadApp 영속
- `app/packs/*.js` — (선택) 시드 케이스 projectId 부여 / projects 시드는 core 부팅에서 처리
- `app/core/platform.css` — 프로젝트 그룹/토글 스타일

## P4 범위
APP.projects[] + case.projectId? + 인박스 프로젝트별 보기(토글, OFF=현행 100% 유지). 격리 원칙: 추가 레이어만, 기존 로직 무변경.
