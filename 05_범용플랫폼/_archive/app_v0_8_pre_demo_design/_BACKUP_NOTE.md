# 백업 노트 — app_v0_8_pre_demo_design (시연 모드 시각 정교화 직전)

> 작업: 시연 모드(Guide Mode) 시각 정교화 (aap-design · 260619)
> 환경 제약: 이 셸은 Bash/PowerShell(cp/rm) 전면 차단 → 디렉터리 일괄 복사 불가.
> 따라서 **현행본 일괄 백업 대신 변경 파일 목록 + git 히스토리 복원 경로**로 백업을 대체한다.

## 이번 작업에서 변경한 파일 (시각만)
- `app/core/platform.css` — `.demo-*`(시나리오 카드·flow 칩) / `.guide-*`·`.gb-*`(투어 오버레이) 시각 재작성
- `app/core/demo.js` — 말풍선 마크업(진행 도트·역할 태그·꼬리)·카드 flow 칩·HITL 악센트 토글(시각 클래스/마크업만, 함수 시그니처·로직 불변)
- `app/core/icons.js` — Lucide path 3종 추가(circle-dot·user-check·bot)

## 변경하지 않은 파일 (무회귀)
- `app/index.html`, `app/core/core.js`, `app/core/pipeline.js`,
  `app/packs/{meeting,voc,recruiting}.js` — 미변경(시연 엔진 로직·운영 모드 무회귀)

## 직전 상태 복원 방법
변경 직전 커밋(시연 모드 골격 반영본)에서:
```
git checkout <직전커밋> -- 05_범용플랫폼/app/core/platform.css \
  05_범용플랫폼/app/core/demo.js 05_범용플랫폼/app/core/icons.js
```
무변경 파일은 git 히스토리에 그대로 보존되어 별도 백업 불필요.
