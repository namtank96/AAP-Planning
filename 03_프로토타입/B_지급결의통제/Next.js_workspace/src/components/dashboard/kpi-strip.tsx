import { Card } from "@/components/ui/card";
import { Q1_KPI } from "@/lib/mock-data";
import { Clock, FileWarning, Sparkles, Target } from "lucide-react";
import type { ReactNode } from "react";

interface KpiItemProps {
  icon: ReactNode;
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  accent?: boolean;
}

function KpiItem({ icon, label, value, delta, hint, accent }: KpiItemProps) {
  return (
    <Card className="flex flex-col gap-2 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xxs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className={accent ? "text-teal" : "text-muted-foreground"}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tight leading-none">{value}</span>
        {delta && (
          <span className={`text-xs font-bold ${accent ? "text-teal" : "text-emerald-600"}`}>
            {delta}
          </span>
        )}
      </div>
      {hint && <p className="text-xxs text-muted-foreground leading-relaxed">{hint}</p>}
    </Card>
  );
}

export function KpiStrip() {
  const kpi = Q1_KPI;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiItem
        icon={<Target className="size-4" />}
        label="진행 통제"
        value={`${kpi.completedControls}/${kpi.totalControls}`}
        hint={`완료 ${kpi.completedControls} · 진행 ${kpi.inProgressControls} · 대기 ${kpi.pendingControls}`}
      />
      <KpiItem
        icon={<FileWarning className="size-4" />}
        label="미비 발견"
        value={`${kpi.totalFindings}건`}
        delta={`+${kpi.totalFindings - kpi.before.totalFindings}건`}
        hint={`전년 동기 ${kpi.before.totalFindings}건 · 일관성 ↑`}
      />
      <KpiItem
        icon={<Clock className="size-4" />}
        label="평가 소요"
        value={`${kpi.avgTimePerControlHours}h`}
        delta={`vs. ${kpi.before.avgTimePerControlLabel}`}
        hint={`통제 1건 평균 (감사인 검토 포함)`}
        accent
      />
      <KpiItem
        icon={<Sparkles className="size-4" />}
        label="감사인 일관성"
        value={`${(kpi.consistency * 100).toFixed(0)}%`}
        delta="↑ 담당자 편차 ↓"
        hint={`동일 통제 재평가 시 결정 일치율`}
        accent
      />
    </div>
  );
}
