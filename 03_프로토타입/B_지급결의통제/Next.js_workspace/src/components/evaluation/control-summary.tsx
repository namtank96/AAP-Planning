import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Control } from "@/lib/types";
import { ShieldCheck } from "lucide-react";

export function ControlSummary({ control }: { control: Control }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              통제 정의
            </CardTitle>
            <CardDescription className="font-mono mt-1">{control.id}</CardDescription>
          </div>
          {control.riskLevel === "high" && <Badge variant="default">고위험</Badge>}
          {control.riskLevel === "medium" && <Badge variant="muted">중위험</Badge>}
        </div>
      </CardHeader>
      <CardContent className="text-xs space-y-3 pb-5">
        <p className="font-bold text-foreground leading-snug">{control.name}</p>
        <p className="text-muted-foreground leading-relaxed">{control.description}</p>

        <dl className="grid grid-cols-[80px_1fr] gap-y-1.5 gap-x-2 pt-2 border-t border-border text-xxs">
          <dt className="text-muted-foreground">적용 정책</dt>
          <dd className="font-semibold">{control.policies.join(" · ")}</dd>

          <dt className="text-muted-foreground">증빙 타입</dt>
          <dd className="font-semibold">{control.evidenceTypes.join(" · ")}</dd>

          {control.accounts.length > 0 && (
            <>
              <dt className="text-muted-foreground">적용 계정</dt>
              <dd className="font-mono font-semibold">{control.accounts.join(", ")}</dd>
            </>
          )}

          <dt className="text-muted-foreground">평가 도메인</dt>
          <dd className="font-semibold">{control.domain}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
