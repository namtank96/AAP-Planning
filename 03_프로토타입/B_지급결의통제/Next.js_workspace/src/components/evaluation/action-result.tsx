import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ActionTaken } from "@/lib/types";
import { CheckCircle2, FileText, Mail, RotateCcw, Ticket, Search } from "lucide-react";

interface ActionResultProps {
  actions: ActionTaken[];
}

const ICONS: Record<ActionTaken["type"], { icon: React.ReactNode; tone: string }> = {
  grc: { icon: <Ticket className="size-4" />, tone: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  mail: { icon: <Mail className="size-4" />, tone: "text-sky-700 bg-sky-50 border-sky-200" },
  "approval-return": { icon: <RotateCcw className="size-4" />, tone: "text-violet-700 bg-violet-50 border-violet-200" },
  "kms-request": { icon: <Search className="size-4" />, tone: "text-amber-700 bg-amber-50 border-amber-200" },
  report: { icon: <FileText className="size-4" />, tone: "text-foreground bg-secondary border-border" },
};

export function ActionResult({ actions }: ActionResultProps) {
  const total = actions.length;
  const completed = actions.filter((a) => a.status === "completed").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>시스템 반영 결과</CardTitle>
            <CardDescription>
              확정된 미비 → GRC · 메일 · 결재 시스템에 자동 분기 반영 완료
            </CardDescription>
          </div>
          <Badge variant="success">
            <CheckCircle2 className="size-3 mr-1 -ml-0.5" />
            {completed}/{total} 완료
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((a) => {
            const meta = ICONS[a.type];
            return (
              <div
                key={a.id}
                className="grid grid-cols-[36px_1fr_auto] items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-background"
              >
                <span className={`grid h-8 w-8 place-items-center rounded-md border ${meta.tone}`}>
                  {meta.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold leading-snug">{a.title}</div>
                  <div className="text-xxs text-muted-foreground font-mono mt-0.5 truncate">
                    {a.target}
                  </div>
                  <div className="text-xxs text-muted-foreground mt-0.5">{a.detail}</div>
                </div>
                <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
                  완료
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
