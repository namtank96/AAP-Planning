import Anthropic from "@anthropic-ai/sdk";
import type { Finding } from "./types";
import { getControl } from "./ontology";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured. Copy .env.local.example to .env.local and set your key.");
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export function isClaudeConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

const SYSTEM_PROMPT = `당신은 한국 금융지주 감사팀의 K-SOX 내부통제 운영평가를 보조하는 AI 어시스턴트입니다.
지급결의 통제(C-FIN-007)의 미비 후보 1건에 대해, 감사인이 한 카드로 읽고 확정/반려를 즉시 결정할 수 있도록
**자연어 근거 한 단락(3~5문장)**을 작성합니다.

작성 규칙:
- 거래 사실 → 위반 항목 → 인용 정책 → 권장 결정 순서로 응축.
- 회계 용어를 정확히 사용 (분리원칙, 권한 매트릭스, 증빙 일치 등).
- 단정 어조 금지. "...로 추정됩니다 / 검토가 필요합니다 / ...에 해당합니다" 등 감사 어조.
- 100~200자 한국어. 마크다운·줄바꿈 사용 금지. 한 단락.
- 회사명·이름은 입력으로 주어진 그대로 (가명 OO 유지).`;

export async function generateRationale(finding: Finding): Promise<string> {
  const client = getClient();
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
  const control = getControl(finding.controlId);

  const userPrompt = `통제 정의:
- 통제 ID: ${finding.controlId}
- 통제명: ${control?.name ?? ""}
- 적용 정책: ${(control?.policies ?? []).join(" · ")}

미비 후보:
- 거래 ID: ${finding.txId}
- 거래 일자: ${finding.date}
- 금액: ${finding.amount.toLocaleString("ko-KR")}원
- 계정: ${finding.account} (${finding.accountName})
- 요청자: ${finding.requester}
- 1차 결재자: ${finding.approver}
- 위반 유형: ${finding.riskType}
- 요약: ${finding.summary}
- 상세: ${finding.detail}
- 인용 정책: ${finding.policies.join(" · ")}
- 과거 이력: ${finding.histories.join(" · ") || "없음"}
- LLM 신뢰도: ${finding.confidence.toFixed(2)}

위 정보를 바탕으로 감사인이 즉시 판단할 수 있는 자연어 근거 한 단락을 작성해주세요.`;

  const response = await client.messages.create({
    model,
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = response.content[0];
  const text = block?.type === "text" ? block.text : "";
  return text.trim();
}

export function fallbackRationale(finding: Finding): string {
  const policies = finding.policies.join(", ");
  return `${finding.date} ${finding.account} 계정 ${finding.amount.toLocaleString("ko-KR")}원 거래에서 ${finding.riskType}가 의심됩니다. ${finding.summary} ${policies ? `${policies} 위반 가능성이 있으며, ` : ""}LLM 신뢰도 ${finding.confidence.toFixed(2)}로 감사인 검토가 필요합니다.`;
}
