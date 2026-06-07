import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Q1_KPI } from "@/lib/mock-data";
import { ArrowRight } from "lucide-react";

interface RowProps {
  metric: string;
  before: string;
  after: string;
  hint?: string;
}

function Row({ metric, before, after, hint }: RowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_24px_1fr] gap-3 md:items-center py-3 border-b border-border last:border-0">
      <div>
        <div className="text-xs font-bold text-foreground">{metric}</div>
        {hint && <div className="text-xxs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <div className="rounded-md bg-secondary px-3 py-2.5 text-sm text-muted-foreground">
        {before}
      </div>
      <div className="hidden md:flex items-center justify-center text-muted-foreground">
        <ArrowRight className="size-4" />
      </div>
      <div className="rounded-md bg-primary/5 border border-primary/30 px-3 py-2.5 text-sm font-semibold text-foreground">
        {after}
      </div>
    </div>
  );
}

export function BeforeAfterCard() {
  const kpi = Q1_KPI;
  return (
    <Card>
      <CardHeader className="flex flex-row items-baseline justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle>이번 분기 vs 지난해 Q1</CardTitle>
          <CardDescription>AAP 도입 전 · 후 비교 — 같은 통제, 같은 분기, 같은 규모</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-muted-foreground">Before</Badge>
          <Badge variant="default">After</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border bg-background px-1">
          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_24px_1fr] gap-3 py-2 px-3 border-b border-border bg-secondary/40 text-xxs font-bold uppercase tracking-wider text-muted-foreground">
            <span>지표</span>
            <span>지난해 Q1 (수기)</span>
            <span />
            <span className="text-primary">이번 분기 (AAP)</span>
          </div>
          <div className="px-3">
            <Row
              metric="평가 소요"
              hint="통제 1건 평균"
              before={kpi.before.avgTimePerControlLabel}
              after={`${kpi.avgTimePerControlHours}h (감사인 검토 포함)`}
            />
            <Row
              metric="투입 인력"
              before={kpi.before.teamSize}
              after="감사인 0.5명 + AI 자동"
            />
            <Row
              metric="미비 발견"
              hint="분기 누적"
              before={`${kpi.before.totalFindings}건`}
              after={`${kpi.totalFindings}건 · 누락된 통제 패턴까지 발견`}
            />
            <Row
              metric="판단 일관성"
              before={kpi.before.consistencyLabel}
              after={`${(kpi.consistency * 100).toFixed(0)}% · 재평가 시 일치`}
            />
            <Row
              metric="근거 추적"
              hint="외부 감사 대응"
              before="PDF에서 수기 추적"
              after="Decision Log · 클릭 1회 재현"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
