"""
AAP PoC Server · 세탁 프랜차이즈 클레임 처리
FastAPI + Anthropic Claude + SQLite

실행:
    pip install -r requirements.txt
    cp .env.example .env  (그리고 ANTHROPIC_API_KEY 입력)
    python server.py
    → http://127.0.0.1:8000
"""

import json
import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from anthropic import Anthropic

# ============================================================
# 환경 설정
# ============================================================
load_dotenv()
ROOT = Path(__file__).parent
DATA_DIR = ROOT / "data"
DB_PATH = ROOT / "decisions.db"
HTML_PATH = ROOT / "index.html"

MODEL_ID = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

# 정적 데이터 로드
POLICIES = json.loads((DATA_DIR / "policies.json").read_text(encoding="utf-8"))
CASES = json.loads((DATA_DIR / "cases.json").read_text(encoding="utf-8"))

# Anthropic 클라이언트
anthropic_client = Anthropic()  # ANTHROPIC_API_KEY 환경변수 사용

# ============================================================
# 데이터베이스 초기화
# ============================================================
def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS claims (
            id TEXT PRIMARY KEY,
            store TEXT, owner TEXT, customer TEXT, item TEXT,
            complaint TEXT, measurement TEXT, original_receipt TEXT,
            material TEXT, symptom TEXT,
            status TEXT, created_at TEXT
        );
        CREATE TABLE IF NOT EXISTS reviews (
            claim_id TEXT PRIMARY KEY,
            findings_json TEXT,
            responsibility_json TEXT,
            case_summary_json TEXT,
            actions_json TEXT,
            similar_cases_json TEXT,
            evidence_json TEXT,
            created_at TEXT
        );
        CREATE TABLE IF NOT EXISTS decisions (
            claim_id TEXT PRIMARY KEY,
            store_pct INTEGER, hq_pct INTEGER, customer_pct INTEGER,
            cause TEXT, compensation TEXT, reason TEXT,
            sms_text TEXT, reviewer TEXT, created_at TEXT
        );
        CREATE TABLE IF NOT EXISTS decision_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            claim_id TEXT, kind TEXT, description TEXT,
            payload_json TEXT, created_at TEXT
        );
        CREATE TABLE IF NOT EXISTS learning_candidates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            claim_id TEXT, title TEXT, description TEXT,
            status TEXT DEFAULT 'pending_review', created_at TEXT
        );
    """)
    conn.commit()
    conn.close()

init_db()

@contextmanager
def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def log_event(claim_id: str, kind: str, description: str, payload=None):
    with db() as conn:
        conn.execute(
            """INSERT INTO decision_log
               (claim_id, kind, description, payload_json, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (claim_id, kind, description,
             json.dumps(payload, ensure_ascii=False) if payload else None,
             datetime.utcnow().isoformat())
        )
        conn.commit()

# ============================================================
# Pydantic 모델
# ============================================================
class ClaimIntake(BaseModel):
    store: str = "강남점"
    owner: str = "박철민"
    customer: str
    item: str
    complaint: str
    measurement: str
    original_receipt: str = ""

class DecisionInput(BaseModel):
    store_pct: int
    hq_pct: int
    customer_pct: int
    cause: str
    compensation: str
    reason: str
    reviewer: str = "이지영"

# ============================================================
# 유틸 — 소재·증상 추출 (간단 키워드 매칭)
# ============================================================
def extract_material(item: str) -> str:
    for m in POLICIES["materials"].keys():
        if m in item:
            return m
    return "캐시미어"  # 데모 기본값

def extract_symptom(complaint: str) -> str:
    keywords = {
        "수축": ["수축", "줄어", "사이즈"],
        "변색": ["변색", "색", "탈색"],
        "오염": ["오염", "묻", "얼룩"],
        "변형": ["변형", "찌그러", "늘어"]
    }
    for symp, kws in keywords.items():
        if any(kw in complaint for kw in kws):
            return symp
    return "수축"  # 데모 기본값

def find_similar_cases(material: str, symptom: str, limit: int = 5):
    matched = [c for c in CASES if c.get("material") == material and c.get("symptom") == symptom]
    return matched[:limit]

# ============================================================
# LLM 호출 — 검토 자료 준비 (원인 후보 + 책임 비율)
# ============================================================
PREPARE_SYSTEM = """당신은 세탁 프랜차이즈의 클레임 처리를 돕는 운영 보조 시스템입니다.
입력된 클레임 정보, 본사 정책, 유사 사례를 종합해 가능한 원인 후보와 책임 비율 후보를 정리합니다.

원칙:
- 원인을 단정하지 말고 4개 후보와 각각의 가능성(weight, 합계 100)을 제시
- 처리 기록이 정상 범위면 처리 오류 가능성은 낮게
- 정책상 정상 범위에 들면 자연 발생 가능성을 고려
- 사람이 최종 결정할 수 있도록 근거(detail)를 함께 제공
- detail은 한국어로 1문장 (30자 내외)

출력은 반드시 다음 JSON 형식만 출력하세요 (마크다운 코드블록·다른 텍스트 없이):
{
  "findings": [
    {"name": "원인명", "detail": "근거 한 문장", "weight": int, "level": "low"|"med"|"high"}
  ],
  "responsibility_proposal": {"store": int, "hq": int, "customer": int},
  "case_summary": {
    "customer": "고객 정보 한 줄",
    "item": "의류",
    "originalReceipt": "원 접수 정보",
    "processingNote": "처리 기록 요약",
    "customerConsent": "고객 동의 범위",
    "todayComplaint": "오늘의 호소 (동의 범위와의 관계)"
  },
  "recommended_actions": ["권장 액션 1", "권장 액션 2", "권장 액션 3"]
}

weight 합계는 100. responsibility 합계도 100."""

def call_llm_prepare(claim: dict, material: str, symptom: str, similar: list):
    policy = POLICIES.get("materials", {}).get(material, {})
    stain_info = ""
    for stain_name, stain in POLICIES.get("stains", {}).items():
        if stain_name in (claim.get("original_receipt") or ""):
            stain_info = f"\n- 원 처리 얼룩: {stain_name} ({stain.get('residue_warning', '')})"
            break

    user_prompt = f"""## 클레임 정보
- 클레임 ID: {claim['id']}
- 매장: {claim['store']} · 점주: {claim['owner']}
- 고객: {claim['customer']}
- 의류: {claim['item']} (소재 추정: {material})
- 호소 증상: {symptom}
- 원 접수: {claim['original_receipt']}{stain_info}
- 클레임 사유: {claim['complaint']}
- 측정값: {claim['measurement']}

## 본사 정책 ({material})
- 정상 수축/변화 범위: {policy.get('natural_shrinkage_range_cm', '미등록')} cm
- 위험 프로파일: {policy.get('risk_profile', 'unknown')}
- 권장 처리 온도 최대: {policy.get('process_temp_max_c', 'N/A')}℃
- 비고: {policy.get('notes', '')}

## 본사 유사 사례 풀 (최근 12개월, 같은 소재·증상)
{json.dumps(similar, ensure_ascii=False, indent=2)}

위 정보를 종합해 JSON으로 출력하세요. 마크다운 없이 JSON만."""

    msg = anthropic_client.messages.create(
        model=MODEL_ID,
        max_tokens=2000,
        system=PREPARE_SYSTEM,
        messages=[{"role": "user", "content": user_prompt}]
    )

    raw = msg.content[0].text.strip()
    # ```json 코드블록 제거
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(lines[1:-1]) if lines[-1].startswith("```") else "\n".join(lines[1:])
    return json.loads(raw)

# ============================================================
# LLM 호출 — 고객 SMS 생성
# ============================================================
def call_llm_sms(claim: dict, decision: DecisionInput) -> str:
    sms_prompt = f"""다음 세탁 프랜차이즈 클레임 처리 결정에 대해 고객에게 보낼 공손한 한국어 SMS를 작성하세요.

요건:
- 200자 내외
- 처리 결과·사유·보상안을 명확히 전달
- 정중하지만 사무적으로 (과한 사과 X)
- 매장명·클레임번호 명시
- 마지막에 "감사합니다" 정중하게 마무리

정보:
- 매장: CleanOps {claim['store']}
- 클레임 번호: {claim['id']}
- 고객: {claim['customer']}
- 의류: {claim['item']}
- 채택된 원인: {decision.cause}
- 책임: 매장 {decision.store_pct}% / 본사 {decision.hq_pct}% / 고객 {decision.customer_pct}%
- 보상안: {decision.compensation}

SMS 본문만 출력하세요 (헤더·서명·설명 없이, 본문 텍스트만):"""

    msg = anthropic_client.messages.create(
        model=MODEL_ID,
        max_tokens=500,
        messages=[{"role": "user", "content": sms_prompt}]
    )
    return msg.content[0].text.strip()

# ============================================================
# FastAPI 앱
# ============================================================
app = FastAPI(title="AAP PoC Server", version="0.7.0")

@app.get("/")
def serve_index():
    return FileResponse(HTML_PATH)

@app.get("/api/scenario-defaults")
def scenario_defaults():
    """Stage 1 폼 기본값 — 시연용 기본 케이스"""
    return {
        "store": "강남점",
        "owner": "박철민",
        "customer": "최민수 (#M-2851 · 정기 회원 · 5년)",
        "item": "캐시미어 코트",
        "original_receipt": "#20260512-031 · 2026-05-12 와인 얼룩 처리",
        "complaint": "한 사이즈 줄었다. 입을 수 없다고 호소. 어깨 폭이 줄어 보임.",
        "measurement": "어깨 너비 -2cm, 기장 변화 없음"
    }

@app.post("/api/claims")
def create_claim(intake: ClaimIntake):
    """클레임 신규 접수 → DB 저장 후 claim_id 반환"""
    date_part = datetime.utcnow().strftime("%y%m%d")
    rand_part = str(uuid.uuid4())[:3].upper()
    claim_id = f"#{date_part}-CL-{rand_part}"

    material = extract_material(intake.item)
    symptom = extract_symptom(intake.complaint)

    with db() as conn:
        conn.execute(
            """INSERT INTO claims (id, store, owner, customer, item, complaint,
                                    measurement, original_receipt, material, symptom,
                                    status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (claim_id, intake.store, intake.owner, intake.customer, intake.item,
             intake.complaint, intake.measurement, intake.original_receipt,
             material, symptom, "submitted", datetime.utcnow().isoformat())
        )
        conn.commit()

    log_event(claim_id, "intake", f"클레임 {claim_id} 접수 (점주 {intake.owner})", intake.model_dump())
    return {"claim_id": claim_id, "material": material, "symptom": symptom, "status": "submitted"}

@app.post("/api/claims/{claim_id}/prepare-review")
def prepare_review(claim_id: str):
    """검토 자료 준비 — LLM 호출 → 원인 후보 + 책임 비율 + 유사 사례 + 권장 액션"""
    with db() as conn:
        row = conn.execute("SELECT * FROM claims WHERE id=?", (claim_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Claim not found")
        claim = dict(row)

    material = claim["material"]
    symptom = claim["symptom"]

    # 유사 사례 추출
    similar = find_similar_cases(material, symptom, limit=5)
    log_event(claim_id, "tool", f"유사 사례 검색 → {len(similar)}건",
              {"material": material, "symptom": symptom, "count": len(similar)})

    # LLM 호출
    log_event(claim_id, "tool", f"LLM 호출: 검토 자료 준비 (model={MODEL_ID})", {"model": MODEL_ID})
    try:
        review = call_llm_prepare(claim, material, symptom, similar)
    except Exception as e:
        # Fallback for demo robustness
        log_event(claim_id, "error", f"LLM 호출 실패, fallback 사용: {str(e)[:100]}", {"error": str(e)})
        review = _fallback_review(claim, material, similar)

    # Evidence 구성 (정책 + 유사사례 + 처리기록을 종합)
    evidence = [
        {"icon": "처", "title": f"처리 이력 {claim['original_receipt'] or '-'}",
         "detail": "본점 처리실 · 약품·온도 정상 범위 기록"},
        {"icon": "동", "title": "고객 동의서 (디지털 서명)",
         "detail": "접수 시점 사전 안내 동의 — 동의 범위와 호소 범위 비교 필요"},
        {"icon": "정", "title": f"{material} 정상 범위 정책",
         "detail": f"{POLICIES['materials'].get(material, {}).get('natural_shrinkage_range_cm', '미등록')} cm 등록됨"},
        {"icon": "사", "title": "본사 유사 사례 풀",
         "detail": f"{len(similar)}건 직접 비교 가능 ({', '.join(c['id'] for c in similar[:3])})"},
        {"icon": "측", "title": "매장 정밀 측정 결과",
         "detail": "본사 검토 단계에서 점주에게 자동 요청됨"}
    ]

    # 저장
    with db() as conn:
        conn.execute("DELETE FROM reviews WHERE claim_id=?", (claim_id,))
        conn.execute(
            """INSERT INTO reviews (claim_id, findings_json, responsibility_json,
                                    case_summary_json, actions_json, similar_cases_json,
                                    evidence_json, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (claim_id,
             json.dumps(review["findings"], ensure_ascii=False),
             json.dumps(review["responsibility_proposal"], ensure_ascii=False),
             json.dumps(review["case_summary"], ensure_ascii=False),
             json.dumps(review["recommended_actions"], ensure_ascii=False),
             json.dumps(similar, ensure_ascii=False),
             json.dumps(evidence, ensure_ascii=False),
             datetime.utcnow().isoformat())
        )
        conn.execute("UPDATE claims SET status='under_review' WHERE id=?", (claim_id,))
        conn.commit()

    log_event(claim_id, "reason",
              f"원인 후보 {len(review['findings'])}개 + 책임 비율 후보 산출",
              review)

    threshold = POLICIES["claim_policies"].get(symptom, {}).get("hitl_threshold_pct", 10)
    rp = review["responsibility_proposal"]
    hitl_required = max(rp["store"], rp["hq"]) >= threshold

    return {
        "claim_id": claim_id,
        "case_summary": review["case_summary"],
        "similar_cases": [
            {"ref": c["id"], "reason": c.get("cause_adopted", "-"), "outcome": c.get("outcome", "-")}
            for c in similar[:3]
        ],
        "findings": review["findings"],
        "responsibility_proposal": review["responsibility_proposal"],
        "recommended_actions": review["recommended_actions"],
        "evidence": evidence,
        "hitl_required": hitl_required,
        "hitl_threshold": threshold,
        "hitl_trigger": f"책임 비율 {threshold}% 이상 추정 — 본사 결정 필수"
    }

def _fallback_review(claim, material, similar):
    """LLM 실패 시 fallback (시연 안정성)"""
    return {
        "findings": [
            {"name": "측정 오차", "detail": "고객 측 측정 방법 미검증", "weight": 30, "level": "med"},
            {"name": "자연 수축", "detail": f"{material} 특성상 정상 범위 가능", "weight": 30, "level": "med"},
            {"name": "처리 오류", "detail": "이력 검토 결과 정상 범위", "weight": 25, "level": "low"},
            {"name": "소재 결함", "detail": "제조사 책임 가능성", "weight": 15, "level": "low"}
        ],
        "responsibility_proposal": {"store": 30, "hq": 20, "customer": 50},
        "case_summary": {
            "customer": claim["customer"],
            "item": claim["item"],
            "originalReceipt": claim["original_receipt"],
            "processingNote": "본점 처리실 · 약품·온도 정상 범위",
            "customerConsent": "옅은 잔류·변색 사전 안내 동의",
            "todayComplaint": "수축 호소 (동의 범위 외)"
        },
        "recommended_actions": [
            "매장에서 정밀 측정 (어깨·소매·기장 3축)",
            "본사 클레임팀 검토 이관 (책임 비율 10% 이상은 본사 결정 필수)",
            "본사 결정 수신 후 고객 응대 완료"
        ]
    }

@app.post("/api/claims/{claim_id}/escalate")
def escalate(claim_id: str):
    """본사 HITL 이관"""
    with db() as conn:
        conn.execute("UPDATE claims SET status='escalated_hq' WHERE id=?", (claim_id,))
        conn.commit()
    log_event(claim_id, "hitl", "본사 클레임팀 검토 요청 (HITL 분기)",
              {"reason": "책임 비율 10% 이상으로 추정"})
    return {"claim_id": claim_id, "status": "escalated_hq"}

@app.post("/api/claims/{claim_id}/decide")
def decide(claim_id: str, decision: DecisionInput):
    """본사 최종 결정 → SMS 생성 (LLM) → 시스템 반영 → 학습 자산 후보 등록"""
    with db() as conn:
        row = conn.execute("SELECT * FROM claims WHERE id=?", (claim_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Claim not found")
        claim = dict(row)

    # SMS 생성 (LLM)
    log_event(claim_id, "tool", f"LLM 호출: 고객 SMS 생성 (model={MODEL_ID})", {"model": MODEL_ID})
    try:
        sms_text = call_llm_sms(claim, decision)
    except Exception as e:
        log_event(claim_id, "error", f"SMS LLM 호출 실패, fallback 사용", {"error": str(e)[:100]})
        sms_text = (
            f"{claim['customer']}님,\n\n"
            f"[CleanOps {claim['store']}] 클레임 {claim_id} 검토 결과를 안내드립니다.\n\n"
            f"채택된 원인: {decision.cause}\n"
            f"보상: {decision.compensation}\n\n"
            f"자세한 사유는 매장 방문 시 안내드리겠습니다. 감사합니다."
        )

    with db() as conn:
        conn.execute("DELETE FROM decisions WHERE claim_id=?", (claim_id,))
        conn.execute(
            """INSERT INTO decisions (claim_id, store_pct, hq_pct, customer_pct,
                                       cause, compensation, reason, sms_text, reviewer, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (claim_id, decision.store_pct, decision.hq_pct, decision.customer_pct,
             decision.cause, decision.compensation, decision.reason, sms_text,
             decision.reviewer, datetime.utcnow().isoformat())
        )
        conn.execute("UPDATE claims SET status='resolved' WHERE id=?", (claim_id,))

        # 학습 자산 후보 등록 (자연 원인이 우세하면 정책 보강 후보 등록)
        if decision.customer_pct >= 40:
            conn.execute(
                """INSERT INTO learning_candidates (claim_id, title, description, created_at)
                   VALUES (?, ?, ?, ?)""",
                (claim_id, f"{claim['material']} 정상 범위 데이터 보강",
                 f"본 케이스 결정 사유를 운영 정책에 반영 후보로 등록 — 전국 매장 즉시 활용 가능",
                 datetime.utcnow().isoformat())
            )
            conn.execute(
                """INSERT INTO learning_candidates (claim_id, title, description, created_at)
                   VALUES (?, ?, ?, ?)""",
                (claim_id, f"{claim['material']} 사전 안내 멘트 가이드",
                 f"{claim['item']} 접수 시 점주가 고객에게 사전 안내할 멘트 템플릿 자동 생성",
                 datetime.utcnow().isoformat())
            )
        conn.commit()

    log_event(claim_id, "hitl",
              f"본사 결정: {decision.cause} (매장 {decision.store_pct}% / 본사 {decision.hq_pct}% / 고객 {decision.customer_pct}%)",
              decision.model_dump())
    log_event(claim_id, "action", "POS·SMS·시스템 반영 완료", {"sms_preview": sms_text[:80]})
    log_event(claim_id, "learning", "운영 자산 후보 등록 (본사 결재 대기)", None)

    # 통계 계산
    with db() as conn:
        log_count = conn.execute("SELECT COUNT(*) as c FROM decision_log WHERE claim_id=?",
                                  (claim_id,)).fetchone()["c"]
        learn_count = conn.execute("SELECT COUNT(*) as c FROM learning_candidates WHERE claim_id=?",
                                    (claim_id,)).fetchone()["c"]
        learn_items = conn.execute(
            "SELECT title FROM learning_candidates WHERE claim_id=? ORDER BY id",
            (claim_id,)
        ).fetchall()

    return {
        "claim_id": claim_id,
        "sms_text": sms_text,
        "decision_recorded": True,
        "log_count": log_count,
        "learning_count": learn_count,
        "learning_items": [dict(l)["title"] for l in learn_items]
    }

@app.get("/api/claims/{claim_id}")
def get_claim(claim_id: str):
    """케이스 전체 상태 조회 (감사·디버깅용)"""
    with db() as conn:
        claim = conn.execute("SELECT * FROM claims WHERE id=?", (claim_id,)).fetchone()
        if not claim:
            raise HTTPException(404, "Claim not found")
        review = conn.execute("SELECT * FROM reviews WHERE claim_id=?", (claim_id,)).fetchone()
        decision = conn.execute("SELECT * FROM decisions WHERE claim_id=?", (claim_id,)).fetchone()
        logs = conn.execute(
            "SELECT * FROM decision_log WHERE claim_id=? ORDER BY id", (claim_id,)
        ).fetchall()
        learning = conn.execute(
            "SELECT * FROM learning_candidates WHERE claim_id=?", (claim_id,)
        ).fetchall()

    return {
        "claim": dict(claim),
        "review": dict(review) if review else None,
        "decision": dict(decision) if decision else None,
        "logs": [dict(l) for l in logs],
        "learning_candidates": [dict(l) for l in learning]
    }

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "model": MODEL_ID,
        "anthropic_key_set": bool(os.getenv("ANTHROPIC_API_KEY")),
        "policies_loaded": len(POLICIES.get("materials", {})),
        "cases_loaded": len(CASES)
    }

if __name__ == "__main__":
    import uvicorn
    print(f"\n  AAP PoC Server")
    print(f"  Model: {MODEL_ID}")
    print(f"  Anthropic Key: {'SET' if os.getenv('ANTHROPIC_API_KEY') else 'NOT SET (필수)'}")
    print(f"  Policies: {len(POLICIES.get('materials', {}))} 소재 등록")
    print(f"  Cases: {len(CASES)} 유사 사례 풀")
    print(f"\n  → http://127.0.0.1:8000\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)
