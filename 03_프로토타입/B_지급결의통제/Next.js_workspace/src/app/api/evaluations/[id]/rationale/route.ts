import { NextResponse } from "next/server";
import { getEvaluation, setFindingRationale } from "@/lib/store";
import { generateRationale, isClaudeConfigured, fallbackRationale } from "@/lib/anthropic";

export const runtime = "nodejs";

interface Body {
  findingId: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.findingId) {
    return NextResponse.json({ error: "findingId required" }, { status: 400 });
  }

  const ev = getEvaluation(id);
  if (!ev) return NextResponse.json({ error: "evaluation not found" }, { status: 404 });
  const finding = ev.findings.find((f) => f.id === body.findingId);
  if (!finding) return NextResponse.json({ error: "finding not found" }, { status: 404 });

  // Cached
  if (finding.rationale) {
    return NextResponse.json({
      rationale: finding.rationale,
      source: finding.rationaleSource ?? "claude",
      cached: true,
    });
  }

  if (!isClaudeConfigured()) {
    const rationale = fallbackRationale(finding);
    setFindingRationale(id, body.findingId, rationale, "fallback");
    return NextResponse.json({ rationale, source: "fallback", cached: false });
  }

  try {
    const rationale = await generateRationale(finding);
    if (!rationale) {
      const fb = fallbackRationale(finding);
      setFindingRationale(id, body.findingId, fb, "fallback");
      return NextResponse.json({ rationale: fb, source: "fallback", cached: false });
    }
    setFindingRationale(id, body.findingId, rationale, "claude");
    return NextResponse.json({ rationale, source: "claude", cached: false });
  } catch (err) {
    console.error("[rationale] Claude API error:", err);
    const fb = fallbackRationale(finding);
    setFindingRationale(id, body.findingId, fb, "fallback");
    return NextResponse.json({ rationale: fb, source: "fallback", cached: false, warning: "claude-failed" });
  }
}
