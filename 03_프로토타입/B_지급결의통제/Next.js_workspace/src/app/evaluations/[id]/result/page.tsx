import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getControl } from "@/lib/ontology";
import { getEvaluation } from "@/lib/store";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  FileText,
  Mail,
  RotateCcw,
  Sparkles,
  Ticket,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const control = getControl(id);
  if (!control) notFound();

  const ev = getEvaluation(id);
  if (!ev || ev.status !== "completed") {
    redirect(`/evaluations/${id}`);
  }

  const confirmed = ev.findings.filter((f) => f.decision === "confirmed").length;
  const rejected = ev.findings.filter((f) => f.decision === "rejected").length;
  const requested = ev.findings.filter((f) => f.decision === "requested").length;

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* ─────────── 장면 ③ · 자동 마감 ─────────── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">방금 11초 동안</div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.15] text-balance">
            검토가 끝나자, 나머지는
            <br />
            <span className="text-primary">시스템이 정리했습니다</span>
          </h1>
        </div>

        {/* 감사인이 한 일 요약 */}
        <Card className="p-6 bg-secondary/30">
          <div className="text-xxs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            감사인의 결정
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" />
              <span className="text-2xl font-black tabular-nums">{confirmed}</span>
              <span className="text-sm text-muted-foreground">확정</span>
            </div>
            <div className="flex items-center gap-2">
              <FileSearch className="size-5 text-amber-600" />
              <span className="text-2xl font-black tabular-nums">{requested}</span>
              <span className="text-sm text-muted-foreground">추가증빙</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-5 inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">
                ✕
              </span>
              <span className="text-2xl font-black tabular-nums">{rejected}</span>
              <span className="text-sm text-muted-foreground">반려</span>
            </div>
          </div>
        </Card>

        {/* 시스템이 자동으로 한 일 */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold">시스템이 자동으로 한 일</h2>

          <Card className="divide-y divide-border p-0 overflow-hidden">
            <ActionRow
              icon={<Ticket className="size-5" />}
              tone="bg-emerald-50 text-emerald-700 border-emerald-200"
              title="GRC에 개선과제 3건 발급"
              sub="GRC-2026Q1-FIN-001 ~ 003 · 책임 부서 자동 매핑"
            />
            <ActionRow
              icon={<Mail className="size-5" />}
              tone="bg-sky-50 text-sky-700 border-sky-200"
              title="책임자 3명에게 통보 메일 발송"
              sub="자회사 K 김OO 차장 · 본사 박OO 팀장 · 본사 최OO 대리"
            />
            <ActionRow
              icon={<RotateCcw className="size-5" />}
              tone="bg-violet-50 text-violet-700 border-violet-200"
              title="결재 시스템에 보완 결재 요청"
              sub="거래 3건 · 사후 보완 결재 워크플로 자동 생성"
            />
            <ActionRow
              icon={<FileSearch className="size-5" />}
              tone="bg-amber-50 text-amber-700 border-amber-200"
              title="추가 증빙 요청 메일 1건"
              sub="정OO 대리 · 영수증 보완 + 인보이스 금액 확인 요청"
            />
            <ActionRow
              icon={<FileText className="size-5" />}
              tone="bg-secondary text-foreground border-border"
              title="분기 감사 보고서 초안 PDF 생성"
              sub="audit_2026Q1_C-FIN-007.pdf · 워크스페이스 첨부됨"
              action={
                <button className="text-xs font-bold text-primary hover:underline">
                  내려받기
                </button>
              }
            />
          </Card>

          <p className="text-xs text-muted-foreground leading-relaxed pl-1">
            💡 작년엔 이 일을 수기로 했을 때 평균{" "}
            <strong className="text-foreground">4시간</strong> 소요됐어요. (GRC 폼 12번 입력 + 메일 3통 작성 + 결재 회신 1건씩)
          </p>
        </div>
      </section>

      {/* ─────────── 장면 ④ · 다음 분기 약속 ─────────── */}
      <section className="space-y-6">
        <div className="h-px bg-border" />

        <div className="space-y-2">
          <Badge variant="teal" className="mb-1">
            Operational Learning
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.15] text-balance">
            다음 분기는
            <br />
            이번 결정을 <span className="text-teal">기억합니다</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl pt-2">
            이번 평가의 결정·반려 사유·발견 패턴이 다음 분기의 위험 가중치와 평가 룰에 자동으로 반영됩니다.
          </p>
        </div>

        {/* 큰 숫자 두 개 (Before/After) */}
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="p-7 text-center">
              <div className="text-xxs font-bold uppercase tracking-wider text-primary mb-2">
                미비 발견
              </div>
              <div className="text-5xl font-black tabular-nums">17건</div>
              <div className="text-sm text-muted-foreground mt-2">
                작년 동기{" "}
                <span className="line-through tabular-nums">9건</span>
              </div>
            </div>
            <div className="p-7 text-center">
              <div className="text-xxs font-bold uppercase tracking-wider text-primary mb-2">
                감사인 소요
              </div>
              <div className="text-5xl font-black tabular-nums">0.5h</div>
              <div className="text-sm text-muted-foreground mt-2">
                작년 동기{" "}
                <span className="line-through">3명 × 2주</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 학습 항목 */}
        <div className="space-y-3">
          <LearningCard
            icon={<TrendingUp className="size-5" />}
            badge="위험 가중치"
            title="자회사 K · 11801 계정의 위험도가 자동 상향됐어요"
            value="1.5 → 1.75"
            detail="4분기 연속 같은 패턴이 발견되어, 다음 분기엔 이 계정에서 더 많은 거래를 샘플링합니다."
          />
          <LearningCard
            icon={<Sparkles className="size-5" />}
            badge="새 룰 기억"
            title="'긴급지급 24h 보완 예외 처리' 새 패턴을 기억했어요"
            value="EmergencyPaySupplement v2"
            detail="이번 분기에 반려한 1건(시스템 점검 중 발생)에서 학습했습니다. 다음 분기엔 같은 케이스를 자동 예외 처리합니다."
          />
          <LearningCard
            icon={<TrendingDown className="size-5" />}
            badge="자동화 후보"
            title="미비 후보 중 60%는 단순 룰로 처리 가능"
            value="AI 호출 비용 1/10"
            detail="확정한 5건 중 3건이 '요청자 = 결재자' 같은 단순 패턴이었어요. 다음 분기엔 룰로 사전 필터링한 뒤 LLM은 회색지대만 평가합니다."
          />
        </div>

        {/* Decision log */}
        <Card className="p-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold">감사 추적 기록 1,247건 자동 보존</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              외부 감사 요청 시 1초 안에 모든 판단·도구 호출·결정을 재현할 수 있습니다.
            </div>
          </div>
          <button className="text-xs font-bold text-primary hover:underline whitespace-nowrap">
            PDF 받기 →
          </button>
        </Card>

        <div className="flex justify-end pt-4">
          <Button asChild size="lg" variant="outline">
            <Link href="/">
              분기 대시보드로
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function ActionRow({
  icon,
  tone,
  title,
  sub,
  action,
}: {
  icon: React.ReactNode;
  tone: string;
  title: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors">
      <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
      <span className={`size-9 rounded-md grid place-items-center border shrink-0 ${tone}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold leading-snug">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </div>
      {action}
    </div>
  );
}

function LearningCard({
  icon,
  badge,
  title,
  value,
  detail,
}: {
  icon: React.ReactNode;
  badge: string;
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="p-5 flex items-start gap-4">
      <span className="size-10 rounded-md grid place-items-center bg-teal/10 text-teal shrink-0">
        {icon}
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <Badge variant="teal" className="text-xxs">
          {badge}
        </Badge>
        <h3 className="text-base font-bold leading-snug">{title}</h3>
        <div className="font-mono text-sm bg-secondary/40 rounded px-2 py-1 inline-block font-bold">
          {value}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
      </div>
    </Card>
  );
}
