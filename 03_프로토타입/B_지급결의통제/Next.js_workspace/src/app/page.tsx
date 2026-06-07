import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { COMPLETED_CONTROLS } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Time of day + persona */}
      <div className="flex items-baseline gap-3 text-sm text-muted-foreground">
        <Clock className="size-4 text-muted-foreground" />
        <span>월요일 09:14 · 출근 직후</span>
      </div>

      {/* Big headline */}
      <section className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.12] text-balance">
          AI가 주말 동안
          <br />
          12개 통제 중 <span className="text-primary">8개를</span> 평가했어요
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl pt-2 leading-relaxed">
          미비 후보 5건만 검토하시면 분기 마감이 끝납니다. 예상 소요{" "}
          <strong className="text-foreground">약 30분</strong>.
        </p>
      </section>

      {/* This Q vs Last Year */}
      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="p-6 sm:p-7 bg-card">
            <div className="text-xxs font-bold uppercase tracking-wider text-primary">
              이번 분기 · AI 도입 후
            </div>
            <dl className="mt-5 space-y-3.5">
              <div className="flex items-baseline justify-between">
                <dt className="text-sm text-muted-foreground">통제 평가 완료</dt>
                <dd className="text-3xl font-black tabular-nums">8 / 12</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-sm text-muted-foreground">감사인 투입</dt>
                <dd className="text-3xl font-black tabular-nums">0 명</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-sm text-muted-foreground">마감까지</dt>
                <dd className="text-3xl font-black tabular-nums">14 일</dd>
              </div>
            </dl>
          </div>
          <div className="p-6 sm:p-7 bg-secondary/40">
            <div className="text-xxs font-bold uppercase tracking-wider text-muted-foreground">
              작년 같은 날
            </div>
            <dl className="mt-5 space-y-3.5">
              <div className="flex items-baseline justify-between">
                <dt className="text-sm text-muted-foreground">통제 평가 완료</dt>
                <dd className="text-3xl font-black tabular-nums text-muted-foreground">1 / 12</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-sm text-muted-foreground">감사인 투입</dt>
                <dd className="text-3xl font-black tabular-nums text-muted-foreground">3 명 야근</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-sm text-muted-foreground">마감까지</dt>
                <dd className="text-3xl font-black tabular-nums text-muted-foreground">14 일</dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      {/* Today's task */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold">오늘 할 일</h2>
          <span className="text-sm text-muted-foreground">예상 소요 30분</span>
        </div>
        <Card className="p-6 border-primary/40 bg-primary/[0.03] hover:shadow-card transition-all">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-[260px] space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default">검토 대기</Badge>
                <span className="text-xxs text-muted-foreground font-mono">C-FIN-007</span>
              </div>
              <h3 className="text-2xl font-black tracking-tight">지급결의 분리원칙 통제</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                AI가 모집단 <strong className="text-foreground">1,247건</strong>을 검토하고,
                위험기반으로 50건을 샘플링해{" "}
                <strong className="text-foreground">미비 후보 5건</strong>을 추렸습니다.
                근거까지 정리되어 있어, 카드별로 확정/반려만 결정하면 됩니다.
              </p>
            </div>
            <Button asChild size="lg" className="text-base h-12 px-7">
              <Link href="/evaluations/C-FIN-007">
                검토 시작
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* Already done */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          이미 끝난 것 (감사인 확인 불필요)
        </h2>
        <Card className="divide-y divide-border p-0 overflow-hidden">
          {COMPLETED_CONTROLS.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-secondary/40 transition-colors"
            >
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span className="text-xxs text-muted-foreground font-mono w-24 shrink-0">{c.id}</span>
              <span className="text-sm font-semibold flex-1 truncate">{c.name}</span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {c.findings > 0
                  ? `미비 ${c.findings}건 · 자동 처리됨`
                  : "미비 없음"}
              </span>
              <span className="text-xxs text-muted-foreground font-mono w-20 text-right">
                {c.completedAt.slice(5).replace("-", ".")}
              </span>
            </div>
          ))}
        </Card>
        <p className="text-xxs text-muted-foreground leading-relaxed">
          AI가 단독 판정한 통제는 미비가 발견되면 자동으로 GRC에 개선과제가 발급되고 책임자에게 통보되었습니다.
          감사인이 다시 검토할 필요는 없으며, 모든 처리는 Decision Log에 기록되어 외부 감사 시 1초 안에 재현됩니다.
        </p>
      </section>
    </div>
  );
}
