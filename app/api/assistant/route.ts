import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

// Compact farm context the client sends with each question.
interface AssistantContext {
  farm: string;
  location: string;
  currency: string;
  netMargin: number;
  conflicts: { parcel: string; resource: string; loss: number; actionCost: number; actionLabel: string }[];
  weatherRisks: { kind: string; day: string; impact: number }[];
  livestock: { marginAtRisk: number; ready: number; underTreatment: number };
}

interface Body {
  question: string;
  lang: "en" | "es";
  context: AssistantContext;
}

const money = (n: number, cur: string) => `${cur === "USD" ? "$" : ""}${Math.round(n).toLocaleString("en-US")}`;

function contextBlock(c: AssistantContext): string {
  const conflicts = c.conflicts.map((x) => `- ${x.parcel} (${x.resource}): at risk ${money(x.loss, c.currency)}; fix "${x.actionLabel}" costs ${money(x.actionCost, c.currency)}`).join("\n");
  const risks = c.weatherRisks.map((r) => `- ${r.kind} on ${r.day}: ${money(r.impact, c.currency)} at risk`).join("\n") || "- none";
  return [
    `Farm: ${c.farm} (${c.location}). Currency: ${c.currency}.`,
    `Projected weekly net margin: ${money(c.netMargin, c.currency)}.`,
    `Conflicts (executable gaps):\n${conflicts || "- none"}`,
    `Weather risks:\n${risks}`,
    `Livestock: ${money(c.livestock.marginAtRisk, c.currency)} at risk, ${c.livestock.ready} pen(s) ready, ${c.livestock.underTreatment} under treatment.`,
  ].join("\n");
}

// Deterministic, helpful answer when there's no API key — keeps the demo free.
function mockAnswer(c: AssistantContext): string {
  const top = [...c.conflicts].sort((a, b) => b.loss - a.loss)[0];
  const totalRisk = c.conflicts.reduce((s, x) => s + x.loss, 0);
  const risk = c.weatherRisks[0];
  if (!top) return `Your plan looks executable. Net margin is ${money(c.netMargin, c.currency)} with no open conflicts this week.`;
  const lines = [
    `Today's highest-value move: ${top.actionLabel} on ${top.parcel}. It protects ${money(top.loss, c.currency)} for a cost of ${money(top.actionCost, c.currency)} — net ${money(top.loss - top.actionCost, c.currency)}.`,
    `Across the week you have ${money(totalRisk, c.currency)} of margin at risk from ${c.conflicts.length} conflict(s).`,
  ];
  if (risk) lines.push(`Watch the weather: ${risk.kind} on ${risk.day} puts ${money(risk.impact, c.currency)} at risk.`);
  if (c.livestock.underTreatment > 0) lines.push(`Note: ${c.livestock.underTreatment} pen(s) are under a vet withdrawal window — they can't be sold yet.`);
  return lines.join(" ");
}

function mockAnswerEs(c: AssistantContext): string {
  const top = [...c.conflicts].sort((a, b) => b.loss - a.loss)[0];
  const totalRisk = c.conflicts.reduce((s, x) => s + x.loss, 0);
  const risk = c.weatherRisks[0];
  if (!top) return `Tu plan se ve ejecutable. El margen neto es ${money(c.netMargin, c.currency)} y no hay conflictos abiertos esta semana.`;
  const lines = [
    `La acción de mayor valor hoy: ${top.actionLabel} en ${top.parcel}. Protege ${money(top.loss, c.currency)} por un coste de ${money(top.actionCost, c.currency)} — neto ${money(top.loss - top.actionCost, c.currency)}.`,
    `En la semana tienes ${money(totalRisk, c.currency)} de margen en riesgo por ${c.conflicts.length} conflicto(s).`,
  ];
  if (risk) lines.push(`Ojo al clima: ${risk.kind} el ${risk.day} pone ${money(risk.impact, c.currency)} en riesgo.`);
  if (c.livestock.underTreatment > 0) lines.push(`Nota: ${c.livestock.underTreatment} corral(es) están en ventana de retiro veterinario — aún no se pueden vender.`);
  return lines.join(" ");
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const { question, lang, context } = body;
  if (!question || !context) return Response.json({ error: "missing_fields" }, { status: 400 });

  // No key → free, deterministic fallback. The demo works at $0.
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ answer: lang === "es" ? mockAnswerEs(context) : mockAnswer(context), source: "demo" });
  }

  try {
    const client = new Anthropic();
    const system =
      "You are FarmPredictor's operations assistant for non-technical farm owners. " +
      "Answer in plain language and in dollars — never use jargon (no NDVI, no scores). " +
      "Be concise (2–5 sentences). Recommend the single highest-value action to take today and what it's worth. " +
      `Reply in ${lang === "es" ? "Spanish" : "English"}.`;

    const msg = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      // Stable instructions are cached; the volatile farm context + question follow.
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [
        { role: "user", content: `Farm context:\n${contextBlock(context)}\n\nQuestion: ${question}` },
      ],
    });

    const text = msg.content.find((b): b is Anthropic.TextBlock => b.type === "text")?.text ?? "";
    return Response.json({ answer: text || (lang === "es" ? mockAnswerEs(context) : mockAnswer(context)), source: "claude" });
  } catch {
    // Any API failure → graceful fallback rather than a broken UI.
    return Response.json({ answer: lang === "es" ? mockAnswerEs(context) : mockAnswer(context), source: "demo" });
  }
}
