import { NextResponse } from "next/server";
import { commitActions } from "@/lib/store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ev = commitActions(id);
  if (!ev) {
    return NextResponse.json({ error: "evaluation not found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    evaluationId: ev.id,
    actionsCount: ev.actions.length,
    learningsCount: ev.learnings.length,
    status: ev.status,
  });
}
