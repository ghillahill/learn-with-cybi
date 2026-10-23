import Anthropic from "@anthropic-ai/sdk";
import { connection } from "next/server";
import { findLesson, getGlossary } from "@/lib/content/loader";
import { chatRequestSchema, CYBI_RULES, glossaryBlock, lessonContextBlock } from "@/lib/cybi-ai/prompt";

// Chat "Chiedi a Cybi" (§4.4). La chiave resta sul server: il browser parla
// solo con questa route. Senza ANTHROPIC_API_KEY la chat è disattivata.

const DEFAULT_MODEL = "claude-sonnet-5-5";
// Modelli che accettano il fallback lato server in caso di rifiuto dei filtri di sicurezza.
const FALLBACK_MODELS = new Set(["claude-opus-5-5", "claude-opus-5", "claude-fable-5-1", "claude-sonnet-5-5"]);

// Limite semplice per un'app con un solo utente: richieste per finestra di tempo.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 40;
let recent: number[] = [];

function isEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function rateLimited(now: number): boolean {
  recent = recent.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) return true;
  recent.push(now);
  return false;
}

function error(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

export async function GET() {
  await connection();
  return Response.json({ enabled: isEnabled() });
}

export async function POST(request: Request) {
  if (!isEnabled()) return error(503, "La chat di Cybi non è attiva: manca la chiave API sul server.");

  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error(400, "Richiesta non valida.");
  const { lessonKey, messages } = parsed.data;

  const [moduleId, lessonId] = lessonKey.split("/");
  const found = findLesson(moduleId, lessonId);
  if (!found) return error(404, "Lezione non trovata.");
  if (rateLimited(Date.now())) return error(429, "Troppe domande in poco tempo: riprova tra qualche minuto.");

  const model = process.env.CYBI_MODEL || DEFAULT_MODEL;
  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model,
      max_tokens: 4096,
      // Risposte brevi da chat: basta poco ragionamento.
      output_config: { effort: "low" },
      ...(FALLBACK_MODELS.has(model)
        ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
        : {}),
      system: [
        // Regole e glossario sono uguali per tutte le lezioni: prima parte della cache.
        { type: "text", text: `${CYBI_RULES}\n\n${glossaryBlock(getGlossary())}`, cache_control: { type: "ephemeral" } },
        {
          type: "text",
          text: lessonContextBlock({
            moduleTitle: found.module.title,
            title: found.lesson.title,
            objectives: found.lesson.objectives,
            body: found.lesson.body,
            sources: found.lesson.sources,
          }),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });

    if (response.stop_reason === "refusal") {
      return Response.json({
        reply: "Su questa domanda non posso aiutarti. Prova a chiedermi qualcosa sui concetti della lezione!",
        refused: true,
      });
    }
    const reply = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("\n")
      .trim();
    if (!reply) return error(502, "Cybi non ha trovato le parole: riprova.");
    return Response.json({ reply, refused: false });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return error(429, "Il servizio AI è occupato: riprova tra poco.");
    if (e instanceof Anthropic.AuthenticationError) return error(502, "La chiave API del server non è valida.");
    if (e instanceof Anthropic.APIError) return error(502, "Il servizio AI non risponde: riprova più tardi.");
    throw e;
  }
}
