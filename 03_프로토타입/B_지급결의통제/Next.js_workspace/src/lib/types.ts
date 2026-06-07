export type ControlStatus = "pending" | "running" | "review" | "completed";
export type RiskLevel = "high" | "medium" | "low";

export interface Control {
  id: string;
  name: string;
  domain: string;
  riskLevel: RiskLevel;
  status: ControlStatus;
  description: string;
  policies: string[];
  evidenceTypes: string[];
  accounts: string[];
  populationSize: number;
  sampleSize: number;
  findingsCount?: number;
  lastEvaluated?: string;
}

export type FindingDecision = "confirmed" | "rejected" | "requested";

export interface Finding {
  id: string;
  controlId: string;
  txId: string;
  date: string;
  amount: number;
  account: string;
  accountName: string;
  requester: string;
  approver: string;
  riskType: string;
  summary: string;
  detail: string;
  confidence: number;
  evidence: string[];
  policies: string[];
  histories: string[];
  suggestedActions: string[];
  recommendation: "HITL" | "AUTO" | "HOLD";
  decision?: FindingDecision;
  decisionReason?: string;
  rationale?: string;
  rationaleGeneratedAt?: string;
  rationaleSource?: "claude" | "fallback";
}

export type ActionType = "grc" | "mail" | "approval-return" | "kms-request" | "report";
export type ActionStatus = "pending" | "completed";

export interface ActionTaken {
  id: string;
  type: ActionType;
  title: string;
  target: string;
  detail: string;
  status: ActionStatus;
  ts?: string;
}

export interface LearningEntry {
  type: "risk_weight" | "new_skill" | "auto_candidate" | "decision_log";
  title: string;
  before: string;
  after: string;
  detail: string;
}

export interface Evaluation {
  id: string;
  controlId: string;
  quarter: string;
  status: ControlStatus;
  startedAt?: string;
  completedAt?: string;
  populationSize: number;
  sampleSize: number;
  findings: Finding[];
  actions: ActionTaken[];
  learnings: LearningEntry[];
  progress: number;
}

export interface QuarterKPI {
  quarter: string;
  totalControls: number;
  completedControls: number;
  inProgressControls: number;
  pendingControls: number;
  totalFindings: number;
  confirmedFindings: number;
  rejectedFindings: number;
  requestedFindings: number;
  avgTimePerControlHours: number;
  consistency: number;
  before: {
    label: string;
    avgTimePerControlLabel: string;
    totalFindings: number;
    consistencyLabel: string;
    teamSize: string;
  };
}
