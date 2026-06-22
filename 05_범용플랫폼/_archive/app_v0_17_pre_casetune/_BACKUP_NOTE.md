# 백업 노트 — app v0.17 (P5 케이스 튜닝 직전)

> 셸(Bash/PowerShell) cp·복사·삭제 권한 전면 차단 → 물리 디렉터리 백업 불가.
> 본 노트 + git 복원 경로로 직전본을 보존한다.

## 직전 커밋
- **abfb05c** (P4 = 프로젝트 계층, 핸드오프 §5 기준)
- git 복원 경로: `git checkout abfb05c -- 05_범용플랫폼/app/`

## P5에서 변경 예정 파일
- `05_범용플랫폼/app/core/core.js` — case.overrides 격리 적용 엔진(deriveCasePack/openCase/restore)·정의 승격·AAP_CORE API
- `05_범용플랫폼/app/core/wfeditor.js` — 케이스 맥락 편집 시 case.overrides에 기록(⚑ 이 케이스 한정)
- `05_범용플랫폼/app/core/platform.css` — ⚑ 배지·케이스 튜닝 바 스타일
- `05_범용플랫폼/app/index.html` — (필요 시) 안정 ID 추가

## 복원 방법
```
git checkout abfb05c -- 05_범용플랫폼/app/
```
