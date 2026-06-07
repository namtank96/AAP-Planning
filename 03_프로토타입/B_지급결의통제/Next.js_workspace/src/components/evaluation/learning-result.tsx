import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LearningEntry } from "@/lib/types";
import { ArrowRight, Brain, ShieldCheck, Sparkles, FileBarChart } from "lucide-react";

interface LearningResultProps {
  learnings: LearningEntry[];
}

const TYPE_META: Record<LearningEntry["type"], { label: string; icon: React.ReactNode; tone: string }> = {
  risk_weight: { label: "위험 가중치", icon: <ShieldCheck className="size-3.5" />, tone: "bg-teal text-teal-foreground" },
  new_skill: { label: "새 Skill", icon: <Sparkles className="size-3.5" />, tone: "bg-violet-600 text-white" },
  auto_candidate: { label: "자동화 후보", icon: <Brain className="size-3.5" />, tone: "bg-emerald-600 text-white" },
  decision_log: { label: "Decision Log", icon: <FileBarChart className="size-3.5" />, tone: "bg-sky-700 text-white" },
};

export function LearningResult({ learnings }: LearningResultProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>다음 평가가 학습한 것</CardTitle>
        <CardDescription>
          이번 평가의 결정·결과가 다음 분기 평가의 입력으로 환류 (Operational Learning)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {learnings.map((l, i) => {
            const meta = TYPE_META[l.type];
            return (
              <div
                key={i}
                className="rounded-md border border-border bg-background p-4 flex flex-col gap-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xxs font-black uppercase tracking-wider ${meta.tone}`}>
                    {meta.icon}
                    {meta.label}
                  </span>
                </div>
                <div className="text-sm font-bold leading-snug">{l.title}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-mono">
                    {l.before}
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono font-bold">
                    {l.after}
                  </span>
                </div>
                <p className="text-xxs text-muted-foreground leading-relaxed">{l.detail}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-md border border-dashed border-teal/40 bg-teal/[0.05] p-3 text-xs leading-relaxed">
          <strong className="text-teal">→ 다음 분기 평가에 자동 반영됩니다.</strong>{" "}
          위험 가중치와 새 Skill은 plan 생성 단계에서, 자동화 후보는 샘플링 단계에서 사용됩니다.
          이 환류 메커니즘이 RAG·RPA·KSOX AI 같은 솔루션에서 거의 결여된 부분이며, AAP의 핵심 차별점입니다.
        </div>
      </CardContent>
    </Card>
  );
}
