import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Check, Search, FileSearch, ShieldCheck, Database, FileText } from "lucide-react";
import type { Evaluation } from "@/lib/types";
import { formatKRWShort } from "@/lib/utils";

interface AgentTraceProps {
  evaluation: Evaluation;
}

interface Step {
  icon: React.ReactNode;
  label: string;
  detail: string;
  done: boolean;
}

export function AgentTrace({ evaluation }: AgentTraceProps) {
  const findingsCount = evaluation.findings.length;
  const sampleSize = evaluation.sampleSize;

  const steps: Step[] = [
    {
      icon: <Database className="size-3.5" />,
      label: "통제 정의 이해",
      detail: "회계규정 §12 · K-SOX 4.3 · 4개 계정 · 3종 증빙 · 권한 매트릭스 3단계",
      done: true,
    },
    {
      icon: <Search className="size-3.5" />,
      label: "모집단 추출 · 위험 가중 샘플링",
      detail: `ERP ${evaluation.populationSize.toLocaleString()}건 → 위험기반 ${sampleSize}건 선정 (자회사 K·11801 ×1.5)`,
      done: true,
    },
    {
      icon: <FileSearch className="size-3.5" />,
      label: "증빙 수집 · 결재 이력 매칭",
      detail: "결재 시스템 · KMS · OCR 병렬 호출 → 증빙 127개 매칭 (OCR 실패 5건 자동 복구)",
      done: true,
    },
    {
      icon: <Bot className="size-3.5" />,
      label: "LLM 평가 · 미비 후보 도출",
      detail: `claude-sonnet-4-5 · ${sampleSize}건 평가 → 미비 후보 ${findingsCount}건 (신뢰도 0.7 이상)`,
      done: true,
    },
    {
      icon: <FileText className="size-3.5" />,
      label: "근거 카드 자동 생성",
      detail: "거래·증빙·정책·과거이력·LLM 판단을 한 카드로 정리",
      done: true,
    },
    {
      icon: <ShieldCheck className="size-3.5" />,
      label: "HITL 라우팅",
      detail: "감사인 검토 대기 · 결정은 Decision Log에 기록",
      done: evaluation.status !== "review",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">AI가 자동으로 수행한 일</CardTitle>
            <CardDescription>감사인 검토 전 · 약 1분 7초 소요</CardDescription>
          </div>
          <Badge variant="teal">자동 완료</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-5">
        <ol className="space-y-2.5">
          {steps.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-3 group"
            >
              <span
                className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md ${
                  s.done
                    ? "bg-teal text-teal-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {s.done ? <Check className="size-3.5" /> : s.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-foreground leading-tight">{s.label}</div>
                <div className="text-xxs text-muted-foreground mt-0.5 leading-relaxed">
                  {s.detail}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 pt-4 border-t border-border grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-muted-foreground">모집단</div>
            <div className="text-base font-black tabular-nums mt-0.5">
              {evaluation.populationSize.toLocaleString()}건
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">샘플</div>
            <div className="text-base font-black tabular-nums mt-0.5">{sampleSize}건</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">미비 후보</div>
            <div className="text-base font-black tabular-nums mt-0.5 text-primary">
              {findingsCount}건
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
