# 백업 노트 — app_v0_11_pre_datafunc (채용 데이터·기능 고도화 직전)

> 셸(Bash/PowerShell) cp 권한 차단 → 변경될 파일은 이 폴더에 Read+Write 수기 복사로 물리 백업.
> 무변경 파일은 git 히스토리에 보존(현 작업 시작 HEAD = `597a41e` 이후 clean).

## 작업
채용(recruiting) Pack 데이터·기능 고도화 + 설명 캡션 정리.
- 후보 6→10명, 점수 가중 분해(스킬·경력·도메인), 플래그, JD 요건, 산출물 실내용.
- ATS 보드 인터랙션: 후보 카드 클릭→상세 모달, 정렬·필터, HITL 결정→보드/카운트/상태 갱신·영속.
- 도메인/시연 뷰 나레이션형 sec-sub 설명 단락 제거(인박스 기준).

## 이 작업에서 변경되는 파일 (직전본을 이 폴더에 물리 백업)
- `05_범용플랫폼/app/packs/recruiting.js`   — 데이터셋·surface·HITL 확장 (핵심)
- `05_범용플랫폼/app/core/core.js`          — decide 일반화(팩 콜백)·근거 레일 데이터 연동 (도메인 무관)
- `05_범용플랫폼/app/index.html`            — sec-sub 나레이션 단락 제거
- `05_범용플랫폼/app/core/platform.css`     — 후보 상세 모달·정렬바 스타일 추가

## 변경 없음 (보존 — git 히스토리)
- `core/demo.js` · `core/pipeline.js` · `core/authoring.js` · `core/icons.js`
- `packs/meeting.js` · `packs/voc.js`

## 직전본 복원
```
git checkout 597a41e -- 05_범용플랫폼/app/
```
또는 이 폴더의 물리 백업본을 app/ 로 복사.
