import { NextResponse } from "next/server";
import { updateFindingDecision } from "@/lib/store";
import type { FindingDecision } from "@/lib/types";

interface DecisionBody {
  findingId: string;
  decision: FindingDecision;
  reason?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: DecisionBody;
  try {
    body = (await request.json()) as DecisionBody;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!body.findingId || !body.decision) {
    return NextResponse.json({ error: "findingId and decision required" }, { status: 400 });
  }
  if (!["confirmed", "rejected", "requested"].includes(body.decision)) {
    return NextResponse.json({ error: "invalid decision value" }, { status: 400 });
  }

  const finding = updateFindingDecision(id, body.findingId, body.decision, body.reason);
  if (!finding) {
    return NextResponse.json({ error: "finding not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    finding: {
      id: finding.id,
      decision: finding.decision,
      decisionReason: finding.decisionReason,
    },
  });
}
