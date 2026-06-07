"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FindingCard } from "./finding-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import type { Finding, FindingDecision } from "@/lib/types";

interface ReviewShellProps {
  controlId: string;
  findings: Finding[];
}

export function ReviewShell({ controlId, findings }: ReviewShellProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, FindingDecision>>(() => {
    const m: Record<string, FindingDecision> = {};
    findings.forEach((f) => {
      if (f.decision) m[f.id] = f.decision;
    });
    return m;
  });
  const [committing, setCommitting] = useState(false);

  const total = findings.length;
  const current = findings[index];
  const decidedCount = Object.keys(decisions).length;
  const allDecided = decidedCount === total;

  const counts = {
    confirmed: Object.values(decisions).filter((d) => d === "confirmed").length,
    rejected: Object.values(decisions).filter((d) => d === "rejected").length,
    requested: Object.values(decisions).filter((d) => d === "requested").length,
  };

  const onDecided = (id: string, d: FindingDecision) => {
    setDecisions((prev) => ({ ...prev, [id]: d }));
    // 0.6초 후 자동으로 다음 카드로 이동 (마지막이 아니면)
    setTimeout(() => {
      setIndex((i) => (i < total - 1 ? i + 1 : i));
    }, 600);
  };

  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
  };
  const goNext = () => {
    if (index < total - 1) setIndex(index + 1);
  };

  const commit = async () => {
    if (committing) return;
    setCommitting(true);
    await fetch(`/api/evaluations/${controlId}/commit`, { method: "POST" });
    router.push(`/evaluations/${controlId}/result`);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-3 text-sm">
        <Button asChild variant="ghost" size="sm" className="h-auto px-2 py-1 text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="size-3.5" />
            대시보드
          </Link>
        </Button>
        <span className="font-mono text-xs text-muted-foreground">
          C-FIN-007 · 지급결의 분리원칙
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            검토 <span className="tabular-nums">{index + 1}</span>
            <span className="text-muted-foreground"> / {total}</span>
          </h1>
          <div className="text-xs sm:text-sm text-muted-foreground tabular-nums">
            확정 <strong className="text-foreground">{counts.confirmed}</strong> · 추가증빙{" "}
            <strong className="text-foreground">{counts.requested}</strong> · 반려{" "}
            <strong className="text-foreground">{counts.rejected}</strong>
          </div>
        </div>
        <Progress
          value={(decidedCount / total) * 100}
          indicatorClassName="bg-teal"
          className="h-2"
        />
      </div>

      {/* Card */}
      <FindingCard
        key={current.id}
        finding={{ ...current, decision: decisions[current.id] }}
        onDecided={onDecided}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button variant="outline" onClick={goPrev} disabled={index === 0}>
          <ArrowLeft className="size-4" />
          이전
        </Button>

        <div className="flex items-center gap-1.5">
          {findings.map((f, i) => {
            const d = decisions[f.id];
            const isActive = i === index;
            const baseClass =
              "size-8 rounded-md text-xs font-bold transition-all border";
            const tone = isActive
              ? "bg-foreground text-background border-foreground"
              : d === "confirmed"
                ? "bg-primary/10 text-primary border-primary/40"
                : d === "rejected"
                  ? "bg-muted text-muted-foreground border-border"
                  : d === "requested"
                    ? "bg-amber-50 text-amber-700 border-amber-300"
                    : "bg-secondary text-muted-foreground border-border";
            return (
              <button
                key={f.id}
                onClick={() => setIndex(i)}
                className={`${baseClass} ${tone}`}
                aria-label={`${i + 1}번 카드로 이동`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {allDecided ? (
          <Button onClick={commit} disabled={committing} className="min-w-[120px]">
            {committing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                조치 실행
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={goNext} disabled={index === total - 1}>
            다음
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
