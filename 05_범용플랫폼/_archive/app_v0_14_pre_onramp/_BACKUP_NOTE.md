# app/ 백업 노트 — v0.14 (인박스 On-Ramp 적용 직전)

> 셸 `cp`/PowerShell 권한 차단으로 물리 디렉터리 백업 미생성. **git 히스토리로 복원**.

- 직전 커밋: `dedfa26` (feat(app): 경량 워크플로우 편집기 — 스튜디오 팔란티어식 노드 그래프)
- 작업 시작 시 `05_범용플랫폼/app/` 워킹트리 clean 확인.
- 복원 경로: `git checkout dedfa26 -- 05_범용플랫폼/app/`

## 이번 변경(인박스 On-Ramp)에서 수정한 파일
- `app/core/core.js` — promptNewCase 재설계(업무 설명 입력+유형 인식), matchPackByText, createCase seed 인자
- `app/core/pipeline.js` — open(text) 시드 텍스트 인자
- `app/core/platform.css` — On-Ramp 패널 스타일(.nc-* 확장)
