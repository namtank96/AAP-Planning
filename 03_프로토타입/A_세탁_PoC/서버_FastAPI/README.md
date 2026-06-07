# AAP PoC Server · 세탁 프랜차이즈 클레임 처리

**실제 서버가 작동하는** AAP PoC 시뮬레이션.
v0.6의 정적 HTML 프로토타입을 FastAPI + Anthropic Claude + SQLite로 백엔드화.

## 무엇이 v0.6과 다른가

| 항목 | v0.6 (정적) | **v0.7 (서버)** |
|---|---|---|
| 데이터 | HTML 내 인라인 JSON | **JSON 파일 + SQLite 영속** |
| LLM | 없음 (사전 정의) | **실제 Claude 호출** (원인·SMS) |
| 상태 | 메모리 (새로고침 시 사라짐) | **SQLite 영속** (감사 추적 가능) |
| 다양성 | 항상 같은 답 | **실제 LLM이라 자연스러운 변동** |
| 확장 | v0.6 코드 직접 수정 | **JSON·정책 파일만 갱신** |

## 폴더 구조

```
aap_poc_server/
├── server.py              # FastAPI 메인 (6 endpoints + LLM 호출)
├── index.html             # 프론트엔드 (v0.6 구조 + fetch)
├── requirements.txt
├── .env.example
├── README.md (this)
├── data/
│   ├── policies.json      # 소재·정책·클레임 유형 (편집 가능)
│   └── cases.json         # 본사 유사 사례 풀 (편집 가능)
└── decisions.db           # SQLite (실행 시 자동 생성)
```

## 빠른 시작

### 1. 의존성 설치

```bash
cd 공유용/aap_poc_server
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

### 2. API 키 설정

```bash
# .env.example을 .env로 복사 후 편집
copy .env.example .env          # Windows
# cp .env.example .env          # macOS/Linux

# .env 파일 열어 ANTHROPIC_API_KEY 입력
# 발급: https://console.anthropic.com/
```

> API 키가 없어도 서버는 작동합니다 (LLM 호출 실패 시 자동 fallback). 다만 "실제 LLM 동작"을 보여주려면 키가 필요합니다.

### 3. 서버 실행

```bash
python server.py
```

콘솔에 다음과 같이 출력됩니다:
```
  AAP PoC Server
  Model: claude-sonnet-4-6
  Anthropic Key: SET
  Policies: 6 소재 등록
  Cases: 8 유사 사례 풀

  → http://127.0.0.1:8000
```

### 4. 브라우저 열기

[http://127.0.0.1:8000](http://127.0.0.1:8000)

## API 엔드포인트

| Method | Path | 설명 |
|---|---|---|
| GET | `/` | index.html 서빙 |
| GET | `/api/health` | 서버·키·정책 로드 상태 |
| GET | `/api/scenario-defaults` | Stage 1 폼 기본값 |
| POST | `/api/claims` | 클레임 신규 접수 (SQLite 저장) |
| POST | `/api/claims/{id}/prepare-review` | **LLM 호출 1** — 원인 후보 + 책임 비율 |
| POST | `/api/claims/{id}/escalate` | 본사 HITL 분기 |
| POST | `/api/claims/{id}/decide` | **LLM 호출 2** — 고객 SMS 생성 + 결정 저장 |
| GET | `/api/claims/{id}` | 케이스 전체 상태 (감사·디버깅) |

## 시나리오 변경 방법

### 다른 소재·증상으로 시험
- Stage 1 폼에서 의류·사유·측정값을 직접 수정 → [→ 검토 자료 준비]
- LLM이 새 정보로 원인 후보를 다시 생성

### 정책·사례 풀 확장
- [data/policies.json](data/policies.json) — 소재 추가·정상 범위 조정
- [data/cases.json](data/cases.json) — 본사 유사 사례 추가
- 서버 재시작 후 자동 반영

### 다른 산업으로 복제 (예: 금융 내부통제)
1. `data/policies.json` → 통제 항목·기준으로 교체
2. `data/cases.json` → 위반 사례로 교체
3. `server.py` 의 `extract_material()`·`extract_symptom()` 도메인 어휘 조정
4. `index.html` 의 hero·persona 데이터 조정

## 감사 추적 (Decision Log)

모든 단계가 SQLite에 영속 저장됩니다:

```bash
# DB 직접 조회 (선택)
python -c "import sqlite3, json; conn=sqlite3.connect('decisions.db'); conn.row_factory=sqlite3.Row; rows=conn.execute('SELECT * FROM decision_log ORDER BY id').fetchall(); [print(dict(r)) for r in rows]"

# 또는 API로 조회
curl http://127.0.0.1:8000/api/claims/{CLAIM_ID}
```

테이블:
- `claims` — 클레임 기본 정보
- `reviews` — LLM이 산출한 검토 자료
- `decisions` — 본사 최종 결정 + 생성된 SMS
- `decision_log` — 모든 단계 시간순 이력 (감사 추적용)
- `learning_candidates` — 본사 결재 대기 학습 자산

## 다음 단계

| 항목 | 작업 |
|---|---|
| 1. 시연 안정성 | 응답 캐싱·prompt caching·fallback 견고화 |
| 2. 다른 시나리오 | 신규 점주 교육 / 본사 운영 학습 추가 |
| 3. 도메인 확장 | 금융 내부통제·손해사정 등 같은 구조 복제 |
| 4. 실제 통합 | 가짜 POS·ERP 대신 실제 시스템 어댑터 |
| 5. 권한·인증 | 매장·본사 별 로그인·역할 기반 권한 |
| 6. UI 마이그레이션 | React/Next.js로 전환 (PoC 본 단계 진입) |

## 트러블슈팅

### 서버가 안 떠요
- Python 3.9+ 필요
- `pip install -r requirements.txt` 재실행
- 8000 포트 충돌 시 `server.py` 마지막 줄에서 port 변경

### API 키 오류
- `.env` 파일이 server.py 와 같은 폴더에 있어야 함
- 키 값에 따옴표 없이 입력
- 환경변수로 직접 설정도 가능: `set ANTHROPIC_API_KEY=...` (Windows)

### LLM 응답이 이상해요
- Claude는 확률적이라 같은 입력에도 응답이 조금씩 다릅니다 (정상)
- JSON 파싱 실패 시 fallback이 자동 동작합니다
- `server.py` 콘솔에서 LLM raw 응답 확인 가능
