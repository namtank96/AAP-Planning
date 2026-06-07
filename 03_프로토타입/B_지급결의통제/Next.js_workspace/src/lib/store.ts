import { FINDINGS_C_FIN_007, PRE_GENERATED_ACTIONS, PRE_GENERATED_LEARNINGS, buildSeededEvaluations } from "./mock-data";
import { getControl } from "./ontology";
import type { Evaluation, Finding, FindingDecision } from "./types";

interface Store {
  evaluations: Map<string, Evaluation>;
}

declare global {
  // eslint-disable-next-line no-var
  var __aapStore: Store | undefined;
}

function createStore(): Store {
  const evaluations = new Map<string, Evaluation>();
  buildSeededEvaluations().forEach((ev) => evaluations.set(ev.controlId, ev));
  return { evaluations };
}

function getStore(): Store {
  if (!global.__aapStore) {
    global.__aapStore = createStore();
  }
  return global.__aapStore;
}

export function getEvaluation(controlId: string): Evaluation | undefined {
  return getStore().evaluations.get(controlId);
}

export function listEvaluations(): Evaluation[] {
  return Array.from(getStore().evaluations.values());
}

export function startEvaluation(controlId: string): Evaluation {
  const store = getStore();
  const control = getControl(controlId);
  if (!control) throw new Error(`Control ${controlId} not found`);

  const existing = store.evaluations.get(controlId);
  if (existing && existing.status !== "pending") return existing;

  const isFin007 = controlId === "C-FIN-007";
  const findings: Finding[] = isFin007
    ? FINDINGS_C_FIN_007.map((f) => ({ ...f }))
    : [];

  const evaluation: Evaluation = {
    id: `EV-${controlId}`,
    controlId,
    quarter: "2026 Q1",
    status: "review",
    startedAt: new Date().toISOString(),
    populationSize: control.populationSize,
    sampleSize: control.sampleSize,
    findings,
    actions: [],
    learnings: [],
    progress: 1,
  };

  store.evaluations.set(controlId, evaluation);
  return evaluation;
}

export function updateFindingDecision(controlId: string, findingId: string, decision: FindingDecision, reason?: string): Finding | undefined {
  const ev = getEvaluation(controlId);
  if (!ev) return undefined;
  const finding = ev.findings.find((f) => f.id === findingId);
  if (!finding) return undefined;
  finding.decision = decision;
  finding.decisionReason = reason;
  return finding;
}

export function setFindingRationale(controlId: string, findingId: string, rationale: string, source: "claude" | "fallback"): Finding | undefined {
  const ev = getEvaluation(controlId);
  if (!ev) return undefined;
  const finding = ev.findings.find((f) => f.id === findingId);
  if (!finding) return undefined;
  finding.rationale = rationale;
  finding.rationaleSource = source;
  finding.rationaleGeneratedAt = new Date().toISOString();
  return finding;
}

export function commitActions(controlId: string): Evaluation | undefined {
  const ev = getEvaluation(controlId);
  if (!ev) return undefined;
  if (ev.actions.length > 0) return ev;

  const confirmed = ev.findings.filter((f) => f.decision === "confirmed");
  const requested = ev.findings.filter((f) => f.decision === "requested");

  const now = new Date().toISOString();
  // 시연용으로 사전 생성된 액션 세트 일부를 결정에 맞춰 가공
  const built = [...PRE_GENERATED_ACTIONS]
    .filter((a) => {
      if (a.type === "kms-request") return requested.length > 0;
      if (a.type === "report") return true;
      return confirmed.length > 0;
    })
    .map((a) => ({ ...a, ts: now }));

  ev.actions = built;
  ev.learnings = PRE_GENERATED_LEARNINGS;
  ev.status = "completed";
  ev.completedAt = now;
  return ev;
}

export function resetEvaluation(controlId: string) {
  getStore().evaluations.delete(controlId);
}
