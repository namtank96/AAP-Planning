import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CONTROLS } from "@/lib/ontology";
import { listEvaluations } from "@/lib/store";
import { ArrowRight, Activity, CheckCircle2, Pause, PlayCircle } from "lucide-react";
import type { Control, ControlStatus } from "@/lib/types";

function statusBadge(status: ControlStatus) {
  switch (status) {
    case "completed":
      return <Badge variant="success"><CheckCircle2 className="size-3 mr-1 -ml-0.5" />완료</Badge>;
    case "running":
      return <Badge variant="info"><Activity className="size-3 mr-1 -ml-0.5" />평가 중</Badge>;
    case "review":
      return <Badge variant="warning">검토 대기</Badge>;
    case "pending":
    default:
      return <Badge variant="outline"><Pause className="size-3 mr-1 -ml-0.5" />대기</Badge>;
  }
}

function riskBadge(level: Control["riskLevel"]) {
  if (level === "high") return <Badge variant="default">고위험</Badge>;
  if (level === "medium") return <Badge variant="muted">중위험</Badge>;
  return <Badge variant="outline">저위험</Badge>;
}

export function ControlList() {
  const evaluations = listEvaluations();
  const evMap = new Map(evaluations.map((e) => [e.controlId, e]));

  return (
    <div className="space-y-2">
      {CONTROLS.map((c) => {
        const ev = evMap.get(c.id);
        const status = ev?.status ?? c.status;
        const progress = ev?.progress ?? 0;

        return (
          <Card
            key={c.id}
            className="p-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center hover:border-primary/40 hover:shadow-card transition-all"
          >
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xxs font-mono font-bold text-muted-foreground">{c.id}</span>
                {statusBadge(status)}
                {riskBadge(c.riskLevel)}
                <span className="text-xxs text-muted-foreground">{c.domain}</span>
              </div>
              <h3 className="text-base font-bold tracking-tight">{c.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">{c.description}</p>
              {status === "running" && (
                <div className="flex items-center gap-2 mt-1 max-w-md">
                  <Progress value={progress * 100} className="h-1.5" />
                  <span className="text-xxs font-bold text-muted-foreground tabular-nums">{Math.round(progress * 100)}%</span>
                </div>
              )}
              {status === "completed" && (
                <div className="text-xxs text-muted-foreground">
                  완료 {ev?.completedAt?.slice(0, 10).replaceAll("-", ".")} · 미비 {c.findingsCount ?? ev?.findings.length ?? 0}건
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 justify-end">
              {status === "pending" && c.id === "C-FIN-007" && (
                <Button asChild size="sm">
                  <Link href={`/evaluations/${c.id}`}>
                    <PlayCircle className="size-4" />
                    평가 시작
                    <ArrowRight className="size-3.5 -mr-0.5" />
                  </Link>
                </Button>
              )}
              {status === "pending" && c.id !== "C-FIN-007" && (
                <Button asChild size="sm" variant="outline" disabled>
                  <Link href={`#`} aria-disabled="true">
                    데모 범위 외
                  </Link>
                </Button>
              )}
              {status !== "pending" && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/evaluations/${c.id}`}>
                    상세 보기 <ArrowRight className="size-3.5 -mr-0.5" />
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
