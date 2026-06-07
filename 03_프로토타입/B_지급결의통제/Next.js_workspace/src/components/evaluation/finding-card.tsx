"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";
import { formatKRW } from "@/lib/utils";
import type { Finding, FindingDecision } from "@/lib/types";

interface FindingCardProps {
  finding: Finding;
  onDecided?: (id: string, decision: FindingDecision) => void;
}

export function FindingCard({ finding, onDecided }: FindingCardProps) {
  const [rationale, setRationale] = useState<string | undefined>(finding.rationale);
  const [rationaleSource, setRationaleSource] = useState<"claude" | "fallback" | undefined>(
    finding.rationaleSource,
  );
  const [loadingRationale, setLoadingRationale] = useState(!finding.rationale);
  const [decision, setDecision] = useState<FindingDecision | undefined>(finding.decision);
  const [busy, setBusy] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current || rationale) return;
    fetched.current = true;
    fetch(`/api/evaluations/${finding.controlId}/rationale`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ findingId: finding.id }),
    })
      .then((r) => r.json())
      .then((data: { rationale: string; source: "claude" | "fallback" }) => {
        setRationale(data.rationale);
        setRationaleSource(data.source);
        setLoadingRationale(false);
      })
      .catch(() => setLoadingRationale(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decide = async (d: FindingDecision) => {
    if (busy || decision) return;
    setBusy(true);
    const reason =
      d === "rejected"
        ? "회계규정 §12-5 긴급지급 예외 조항 적용 (시스템 점검 2h + 주말 포함)"
        : undefined;
    try {
      await fetch(`/api/evaluations/${finding.controlId}/decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ findingId: finding.id, decision: d, reason }),
      });
      setDecision(d);
      onDecided?.(finding.id, d);
    } finally {
      setBusy(false);
    }
  };

  const sameRequester = finding.requester === finding.approver;
  const evidenceCount =
    finding.evidence.length + finding.policies.length + finding.histories.length;

  return (
    <Card className="overflow-hidden">
      {/* Transaction fact block */}
      <div className="p-6 sm:p-8 bg-secondary/30 border-b border-border">
        <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <div className="text-sm text-muted-foreground font-mono">
              {finding.txId} · {finding.date}
            </div>
            <div className="text-4xl sm:text-5xl font-black mt-1 tabular-nums tracking-tight">
              {formatKRW(finding.amount)}
            </div>
            <div className="text-base text-muted-foreground mt-2 font-medium">
              {finding.accountName} (계정 {finding.account})
            </div>
          </div>
          <div className="text-sm sm:text-right space-y-1.5">
            <div>
              요청 <strong className="font-semibold">{finding.requester}</strong>
            </div>
            <div>
              결재 <strong className="font-semibold">{finding.approver}</strong>
              {sameRequester && (
                <span className="ml-2 inline-flex items-center gap-1 text-primary text-xs font-bold">
                  <AlertTriangle className="size-3.5" />
                  같은 사람
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI judgment */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-teal" />
            <span className="text-xs font-black uppercase tracking-wider text-teal">
              AI 판단
            </span>
            {rationaleSource === "claude" && (
              <span className="text-xxs text-muted-foreground">claude-sonnet-4-5</span>
            )}
            {rationaleSource === "fallback" && (
              <span className="text-xxs text-muted-foreground">로컬 fallback</span>
            )}
          </div>
          {loadingRationale ? (
            <div className="flex items-center gap-2 text-base text-muted-foreground py-2">
              <Loader2 className="size-4 animate-spin" />
              근거 정리 중...
            </div>
          ) : (
            <p className="text-lg sm:text-xl leading-relaxed font-medium text-foreground/95">
              &ldquo;{rationale ?? finding.detail}&rdquo;
            </p>
          )}
        </div>

        {/* Evidence (collapsible) */}
        <details className="rounded-md border border-border bg-secondary/30 group">
          <summary className="px-4 py-3 cursor-pointer text-sm font-bold flex items-center justify-between hover:bg-secondary/60 transition-colors">
            <span>근거 {evidenceCount}건 보기</span>
            <span className="text-xs text-muted-foreground group-open:hidden">▼ 펼치기</span>
            <span className="text-xs text-muted-foreground hidden group-open:inline">
              ▲ 접기
            </span>
          </summary>
          <div className="px-4 py-3 border-t border-border space-y-2 text-sm">
            {finding.evidence.map((e) => (
              <div key={e} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-muted-foreground" />
                <span className="font-semibold w-20 text-muted-foreground">증빙</span>
                <span>{e}</span>
              </div>
            ))}
            {finding.policies.map((p) => (
              <div key={p} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-violet-500" />
                <span className="font-semibold w-20 text-muted-foreground">인용 정책</span>
                <span className="text-violet-800">{p}</span>
              </div>
            ))}
            {finding.histories.map((h) => (
              <div key={h} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-pink-500" />
                <span className="font-semibold w-20 text-muted-foreground">과거 패턴</span>
                <span className="text-pink-800">{h}</span>
              </div>
            ))}
          </div>
        </details>

        {/* Decision row */}
        {decision ? (
          <DecisionResult decision={decision} />
        ) : (
          <div className="space-y-3 pt-2">
            <div className="text-sm font-semibold text-muted-foreground">
              감사인이 할 일은 한 가지
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                size="lg"
                onClick={() => decide("confirmed")}
                disabled={busy}
                className="h-14 text-base"
              >
                <CheckCircle2 className="size-5" />
                확정
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => decide("requested")}
                disabled={busy}
                className="h-14 text-base border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <FileSearch className="size-5" />
                추가증빙
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => decide("rejected")}
                disabled={busy}
                className="h-14 text-base"
              >
                <XCircle className="size-5" />
                반려
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Comparison footer */}
      <div className="px-6 sm:px-8 py-4 bg-muted/40 border-t border-border text-xs sm:text-sm text-muted-foreground leading-relaxed">
        💡 작년엔 이런 한 건당 평균 <strong className="text-foreground">2시간 30분</strong>
        {" "}소요했어요 (ERP 열기 → 결재 시스템 열기 → 증빙 찾기 → 규정 확인). 지금은 AI가 미리 정리해두어 클릭 한 번이면 됩니다.
      </div>
    </Card>
  );
}

function DecisionResult({ decision }: { decision: FindingDecision }) {
  if (decision === "confirmed") {
    return (
      <div className="rounded-md border border-primary/30 bg-primary/[0.05] p-4 flex items-start gap-3">
        <CheckCircle2 className="size-5 text-primary mt-0.5 shrink-0" />
        <div>
          <div className="font-bold text-base">확정됨</div>
          <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
            GRC 개선과제 · 책임자 메일 · 결재 회신이 자동 실행됩니다.
          </div>
        </div>
      </div>
    );
  }
  if (decision === "requested") {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
        <FileSearch className="size-5 text-amber-700 mt-0.5 shrink-0" />
        <div>
          <div className="font-bold text-base">추가 증빙 요청됨</div>
          <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
            담당자에게 보완 증빙 요청 메일이 자동 발송됩니다.
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-border bg-muted/40 p-4 flex items-start gap-3">
      <XCircle className="size-5 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <div className="font-bold text-base">반려됨</div>
        <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
          사유: 회계규정 §12-5 긴급지급 예외 조항 적용 (시스템 점검 2h + 주말 포함).
          이 결정은 다음 평가의 학습 입력으로 환류됩니다.
        </div>
      </div>
    </div>
  );
}
