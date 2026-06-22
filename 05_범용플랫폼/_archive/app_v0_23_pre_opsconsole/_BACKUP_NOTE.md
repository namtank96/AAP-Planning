# 백업 노트 — app v0.23 직전(운영 콘솔 확장 전)

> 셸(Bash/PowerShell) cp·복사·삭제 및 헤드리스 런처가 권한 차단되어 **물리 디렉터리 백업 불가**.
> git 으로 직전 상태 복원하세요.

## 복원 기준
- HEAD(작업 직전): **b9cc20d**
- 복원: `git checkout b9cc20d -- "05_범용플랫폼/app/"`

## 이번 변경(운영 콘솔 = Eval + RBAC + Agent Ops)
- `app/core/core.js` — `renderGovern` 확장(Eval 지표 trace 도출 · RBAC 역할×권한 매트릭스 · Agent Ops KPI · 배포 연결). 헬퍼 신규: `_evalMetrics`/`_agentOpsKpi`/`renderGovern` 내부.
- `app/index.html` — govern 뷰에 섹션 컨테이너 추가(govStrip 유지).
- `app/core/platform.css` — 운영 콘솔 섹션 CSS(.ops-*, .eval-*, .rbac-* 신규, 토큰 재사용).

무회귀 대상: 통합인박스·케이스·영속(SCHEMA_VER)·X1·8계층·HITL·자동저작·wfeditor·pipeline·On-Ramp·P2~P5(★P5 격리)·배포 생애주기·스튜디오 3분할·온톨로지 L4·demo.js·meeting/voc/recruiting.
