# 백업 노트 — app_v0_20_pre_designpolish

> 셸(Bash/PowerShell) cp·복사·삭제 및 node/IDE 실행이 이 환경에서 전면 차단되어
> 물리 디렉터리 백업을 생성하지 못함. **git 복원 기준**으로 대체한다.

## 복원 기준
- **직전 안정 커밋(HEAD)**: `9c1f028` (feat(app): 도메인 팩 배포 생애주기 draft/deployed)
- 복원 명령: `git checkout 9c1f028 -- "05_범용플랫폼/app/"`

## 이번 폴리시(v0.20)에서 변경한 파일 (시각만 · 골격/함수/ID/뷰키 불변)
- `app/core/platform.css` — 말미에 "aap-design v0.20 · 전반 일괄 폴리시" 블록 추가
  (실행 보드 카드 등장 모션·현재 단계 컬럼 하이라이트·후보 매칭 점수 바·근거 레일 doing 마커·
   인박스 hover·도메인 팩 배포 배지 점·로그 KPI hover). 신규 hex 0.
- `app/packs/recruiting.js` — `candCard`에 `.rc-bar`(매칭 점수 바) 마크업 1줄 추가,
  `board`에 현재 진행 프런티어 컬럼 `.live` 클래스 부여(표시용 className·로직 불변).

> 변경 범위 = 마크업 클래스·CSS·아이콘만. 함수 시그니처/DOM id/뷰 키/data-* 타깃 미변경.
