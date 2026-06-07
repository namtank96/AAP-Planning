import type { Finding, QuarterKPI, ActionTaken, LearningEntry, Evaluation } from "./types";

export const FINDINGS_C_FIN_007: Finding[] = [
  {
    id: "F1",
    controlId: "C-FIN-007",
    txId: "TX-20260117-001",
    date: "2026-01-17",
    amount: 72_500_000,
    account: "11801",
    accountName: "자회사 K 출자금",
    requester: "김OO 차장 (자회사 K · 재무팀)",
    approver: "김OO 차장 (자회사 K · 재무팀)",
    riskType: "분리원칙 위배",
    summary: "요청자와 1차 결재자가 동일 인물 (회계규정 §12-3)",
    detail:
      "거래 2026-01-17 14:23 · 출자금 송금. ERP 워크플로 로그상 요청·1차 결재 모두 동일 사번(K10472). 사내 회계 규정 §12-3 분리원칙 위반.",
    confidence: 0.87,
    evidence: ["영수증", "인보이스", "결재이력"],
    policies: ["회계규정 §12-3"],
    histories: ["'25 Q3·Q4 자회사 K · 11801 권한위반 ×2건"],
    suggestedActions: ["GRC 개선과제", "책임자 메일", "결재 회신"],
    recommendation: "HITL",
  },
  {
    id: "F2",
    controlId: "C-FIN-007",
    txId: "TX-20260203-014",
    date: "2026-02-03",
    amount: 158_200_000,
    account: "11802",
    accountName: "단기지급금",
    requester: "이OO 과장 (본사 · 구매팀)",
    approver: "박OO 팀장 (본사 · 구매팀)",
    riskType: "결재권한 초과",
    summary: "LV1 결재자가 LV2 권한 구간(5천만~3억)의 거래를 단독 승인",
    detail:
      "거래 1.58억원. 권한 매트릭스상 LV2 결재자(이사급) 필요. 그러나 1·2차 결재 모두 LV1 권한(팀장)이 수행. 권한 매트릭스 위반.",
    confidence: 0.81,
    evidence: ["인보이스", "결재이력"],
    policies: ["회계규정 §12", "K-SOX 4.3"],
    histories: [],
    suggestedActions: ["GRC 개선과제", "책임자 메일", "결재 회신"],
    recommendation: "HITL",
  },
  {
    id: "F3",
    controlId: "C-FIN-007",
    txId: "TX-20260219-027",
    date: "2026-02-19",
    amount: 64_800_000,
    account: "11801",
    accountName: "자회사 K 출자금",
    requester: "정OO 대리 (자회사 K · 재무팀)",
    approver: "윤OO 부장 (자회사 K · 재무팀)",
    riskType: "증빙 미비 + 금액 불일치",
    summary: "영수증 누락 · 인보이스와 ERP 금액 1.2백만 차이",
    detail:
      "KMS에 영수증 첨부 없음. 인보이스 63.6백만, ERP 64.8백만. OCR/ERP 불일치 1.2백만. 분리원칙은 통과(요청자≠결재자).",
    confidence: 0.78,
    evidence: ["인보이스", "결재이력"],
    policies: ["K-SOX 4.3"],
    histories: ["'25 Q3·Q4 자회사 K · 11801 권한위반 ×2건"],
    suggestedActions: ["추가 증빙 요청"],
    recommendation: "HITL",
  },
  {
    id: "F4",
    controlId: "C-FIN-007",
    txId: "TX-20260308-041",
    date: "2026-03-08",
    amount: 91_300_000,
    account: "11800",
    accountName: "일반관리비",
    requester: "최OO 대리 (본사 · 총무팀)",
    approver: "최OO 대리 (본사 · 총무팀)",
    riskType: "분리원칙 위배 + 증빙 일자 불일치",
    summary: "요청자=결재자 동일 · 영수증 발행일이 거래일보다 23일 뒤",
    detail:
      "회계규정 §12-3 위반. 추가로 영수증 발행일 2026-03-31이 ERP 거래 등록일 2026-03-08보다 23일 늦음. 사후 증빙 의심.",
    confidence: 0.83,
    evidence: ["영수증", "인보이스", "결재이력"],
    policies: ["회계규정 §12-3"],
    histories: [],
    suggestedActions: ["GRC 개선과제", "책임자 메일", "결재 회신"],
    recommendation: "HITL",
  },
  {
    id: "F5",
    controlId: "C-FIN-007",
    txId: "TX-20260322-048",
    date: "2026-03-22",
    amount: 53_700_000,
    account: "11803",
    accountName: "외상지급금",
    requester: "신OO 차장 (본사 · 자금팀)",
    approver: "한OO 부장 (본사 · 자금팀)",
    riskType: "긴급지급 24h 보완 미비 (의심)",
    summary: "긴급지급 후 보완 증빙이 28h 후 등록 (4h 초과)",
    detail:
      "긴급지급 사후 보완 증빙 규정(§12-5) 24h 이내. 실제 28h 후 등록. 다만 시스템 점검 시간 2h + 주말 포함 — 예외 조항 적용 검토 필요.",
    confidence: 0.71,
    evidence: ["영수증", "결재이력"],
    policies: ["회계규정 §12-5"],
    histories: [],
    suggestedActions: ["감사인 검토 필요"],
    recommendation: "HITL",
  },
];

export const Q1_KPI: QuarterKPI = {
  quarter: "2026 Q1",
  totalControls: 12,
  completedControls: 8,
  inProgressControls: 1,
  pendingControls: 3,
  totalFindings: 17,
  confirmedFindings: 11,
  rejectedFindings: 4,
  requestedFindings: 2,
  avgTimePerControlHours: 3.4,
  consistency: 0.94,
  before: {
    label: "지난해 Q1 · 수기 평가",
    avgTimePerControlLabel: "2주 (3명 × 70%)",
    totalFindings: 9,
    consistencyLabel: "담당자 의존 · 편차 큼",
    teamSize: "감사 3명 풀타임",
  },
};

export interface CompletedControlItem {
  id: string;
  name: string;
  findings: number;
  completedAt: string;
}

export const COMPLETED_CONTROLS: CompletedControlItem[] = [
  { id: "C-OPS-021", name: "IT 변경 통제", findings: 0, completedAt: "2026-05-25" },
  { id: "C-HR-005", name: "급여 지급 통제", findings: 0, completedAt: "2026-05-26" },
  { id: "C-FIN-012", name: "계정 잔액 확인 통제", findings: 2, completedAt: "2026-05-26" },
  { id: "C-FIN-003", name: "매출 인식 통제", findings: 1, completedAt: "2026-05-27" },
  { id: "C-FIN-005", name: "재고 실사 통제", findings: 3, completedAt: "2026-05-27" },
  { id: "C-IT-008", name: "접근 권한 통제", findings: 0, completedAt: "2026-05-28" },
  { id: "C-OPS-014", name: "벤더 관리 통제", findings: 1, completedAt: "2026-05-28" },
  { id: "C-FIN-019", name: "외화 환산 통제", findings: 0, completedAt: "2026-05-28" },
];

export const PRE_GENERATED_ACTIONS: ActionTaken[] = [
  { id: "A1", type: "grc", title: "GRC 개선과제 발급", target: "GRC-2026Q1-FIN-F1", detail: "자회사 K · 11801 · 분리원칙 위배", status: "completed" },
  { id: "A2", type: "mail", title: "책임자 메일 통보", target: "김OO 차장 · 자회사 K", detail: "F1 사후 보완 결재 요청", status: "completed" },
  { id: "A3", type: "approval-return", title: "결재 시스템 회신", target: "TX-20260117-001", detail: "사후 보완 결재 요청", status: "completed" },
  { id: "A4", type: "grc", title: "GRC 개선과제 발급", target: "GRC-2026Q1-FIN-F2", detail: "본사 구매팀 · 결재권한 초과", status: "completed" },
  { id: "A5", type: "mail", title: "책임자 메일 통보", target: "박OO 팀장 · 본사 구매팀", detail: "F2 권한 매트릭스 재확인 요청", status: "completed" },
  { id: "A6", type: "approval-return", title: "결재 시스템 회신", target: "TX-20260203-014", detail: "LV2 결재자 재승인 필요", status: "completed" },
  { id: "A7", type: "grc", title: "GRC 개선과제 발급", target: "GRC-2026Q1-FIN-F4", detail: "본사 총무팀 · 분리원칙 + 증빙 일자", status: "completed" },
  { id: "A8", type: "mail", title: "책임자 메일 통보", target: "최OO 대리 · 본사 총무팀", detail: "F4 사후 증빙 보완 요청", status: "completed" },
  { id: "A9", type: "approval-return", title: "결재 시스템 회신", target: "TX-20260308-041", detail: "사후 보완 결재 요청", status: "completed" },
  { id: "A10", type: "kms-request", title: "보완 증빙 요청 발송", target: "정OO 대리 · 자회사 K", detail: "F3 영수증 누락 보완", status: "completed" },
  { id: "A11", type: "report", title: "감사 보고서 초안 PDF", target: "audit_2026Q1_C-FIN-007.pdf", detail: "워크스페이스 첨부 완료", status: "completed" },
];

export const PRE_GENERATED_LEARNINGS: LearningEntry[] = [
  {
    type: "risk_weight",
    title: "위험 가중치 갱신",
    before: "ACC-11801 ×1.50",
    after: "ACC-11801 ×1.75",
    detail: "자회사 K · 11801에서 4분기 연속 미비 발생 · 다음 분기 샘플링에서 더 많이 추출됩니다.",
  },
  {
    type: "new_skill",
    title: "새 Skill 등록 · 긴급지급 예외 처리 v2",
    before: "(없음)",
    after: "EmergencyPaySupplement_v2",
    detail: "F5 반려 사유에서 학습 · '24h + 시스템 점검 시간 차감 + 주말 포함' 룰을 재사용 가능한 평가 패턴으로 등록.",
  },
  {
    type: "auto_candidate",
    title: "자동화 후보 발견 · 분리원칙 단순 룰",
    before: "LLM 평가 (모든 50건)",
    after: "룰 기반 사전 필터 (LLM 호출 ×1/10)",
    detail: "5건 중 3건이 '요청자 = 1차결재자' 패턴. 다음 분기부터 룰로 사전 필터 후 LLM은 회색지대만 평가.",
  },
  {
    type: "decision_log",
    title: "Decision Log 적재",
    before: "—",
    after: "총 1,247 rows",
    detail: "모든 판단·도구호출·HITL·시스템 반영이 불변 로그로 저장. 외부 감사 요청 시 1초 안에 재현 가능.",
  },
];

export function buildSeededEvaluations(): Evaluation[] {
  return [
    {
      id: "EV-C-FIN-008",
      controlId: "C-FIN-008",
      quarter: "2026 Q1",
      status: "running",
      startedAt: "2026-05-26T10:14:00Z",
      populationSize: 856,
      sampleSize: 40,
      findings: [],
      actions: [],
      learnings: [],
      progress: 0.6,
    },
    {
      id: "EV-C-OPS-021",
      controlId: "C-OPS-021",
      quarter: "2026 Q1",
      status: "completed",
      startedAt: "2026-05-13T09:00:00Z",
      completedAt: "2026-05-14T16:42:00Z",
      populationSize: 312,
      sampleSize: 30,
      findings: [],
      actions: [],
      learnings: [],
      progress: 1,
    },
  ];
}
