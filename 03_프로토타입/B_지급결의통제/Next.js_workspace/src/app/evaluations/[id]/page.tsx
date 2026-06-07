import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ReviewShell } from "@/components/evaluation/review-shell";
import { getControl } from "@/lib/ontology";
import { getEvaluation, startEvaluation } from "@/lib/store";
import { ArrowLeft } from "lucide-react";

export default async function EvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const control = getControl(id);
  if (!control) notFound();

  if (id !== "C-FIN-007") {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-5">
        <h1 className="text-2xl font-bold">데모 범위 외 통제입니다</h1>
        <p className="text-muted-foreground">
          이 프로토타입은 <strong>지급결의 분리원칙 통제(C-FIN-007)</strong> 한 건을 끝까지 시연하도록 구성되어 있습니다.
        </p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="size-4" />
            대시보드로 돌아가기
          </Link>
        </Button>
      </div>
    );
  }

  let evaluation = getEvaluation(id);
  if (!evaluation) evaluation = startEvaluation(id);

  if (evaluation.status === "completed") {
    redirect(`/evaluations/${id}/result`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <ReviewShell controlId={id} findings={evaluation.findings} />
    </div>
  );
}
