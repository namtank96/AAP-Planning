# 백업 노트 — app_v0_9_pre_runview (실행 뷰 재구조화 직전)

> 셸(Bash/PowerShell) cp·diagnostics 권한이 전부 차단되어 파일 복사를 수행하지 못했습니다.
> 대신 변경 파일 목록과 git 복원 경로를 기록합니다. **무변경 파일은 git 히스토리에 그대로 보존**됩니다.

## 작업
실행(run) 뷰를 'AAP 작동 중심' 풀폭으로 재구조화 (좌 고객 서비스 화면 패널 제거 + HITL 모달 run 영역 오버레이로 승격). 로드맵 §6 + v0.32 참조.

## 이 작업에서 변경된 파일 (이 폴더가 백업했어야 할 직전본)
- `05_범용플랫폼/app/index.html`        — run 뷰 `.panel.left` 제거 → `.run-main/.run-surface` 풀폭, `#cmodal` run 오버레이로 이동
- `05_범용플랫폼/app/core/core.js`       — `renderConsole()` = `renderCModal()`만, `restoreStep` baseOnly=true, 주석
- `05_범용플랫폼/app/core/platform.css`  — `.main`(grid 2분할) → `.run-main/.run-surface/.rs-head/.rs-scroll`, `.explain` 중앙정렬

## 변경 없음 (보존만 — git 히스토리 의존)
- `core/demo.js` · `core/pipeline.js` · `core/authoring.js` · `core/icons.js`
- `packs/meeting.js` · `packs/voc.js` · `packs/recruiting.js`
  - ⚠ recruiting.js `PACK.surface`(ATS 보드) · meeting.js `surfaceSpec` = **삭제하지 않고 보존**.
    운영 실행 뷰에서만 미호출(좌 고객화면 제거), 시연 모드(demo.js)용으로 코드 유지.

## 직전본 복원
```
git log --oneline -- 05_범용플랫폼/app/index.html
git checkout <이 작업 직전 커밋> -- 05_범용플랫폼/app/
```
직전 상태 = 커밋 `597a41e` (또는 이 작업 시작 시점 HEAD) 기준.
