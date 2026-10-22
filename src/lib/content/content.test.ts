import { describe, expect, it } from "vitest";
import { checkContent } from "./check";
import { loadContent, splitFrontmatter } from "./loader";
import { quizQuestionSchema } from "./schema";

describe("contenuti del corso", () => {
  it("si caricano e superano tutti i controlli", async () => {
    const content = loadContent();
    expect(content.modules.length).toBeGreaterThan(0);
    expect(await checkContent(content)).toEqual([]);
  });
});

describe("controlli della timeline", () => {
  it("segnala fonti mancanti, lezioni inesistenti e lastVerified assente", async () => {
    const content = loadContent();
    const [event] = content.timeline.events;
    content.timeline.events = [
      {
        ...event,
        sources: ["fonte-inesistente"],
        lesson: { module: "storia-origini", lesson: "lezione-inesistente" },
        lastVerified: null,
        status: "fonti-verificate",
      },
    ];
    const messages = (await checkContent(content)).map((i) => i.message);
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringContaining('fonte "fonte-inesistente" non elencata'),
        expect.stringContaining('la lezione "storia-origini/lezione-inesistente" non esiste'),
        expect.stringContaining("senza lastVerified"),
      ]),
    );
  });
});

describe("schema dei quiz", () => {
  it("rifiuta una domanda a scelta singola con due risposte corrette", () => {
    const result = quizQuestionSchema.safeParse({
      id: "q",
      type: "single",
      prompt: "?",
      options: [
        { text: "a", correct: true, explain: "." },
        { text: "b", correct: true, explain: "." },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("splitFrontmatter", () => {
  it("separa frontmatter e corpo", () => {
    const { data, body } = splitFrontmatter("---\ntitle: Ciao\n---\nTesto", "x.mdx");
    expect(data).toEqual({ title: "Ciao" });
    expect(body).toBe("Testo");
  });

  it("segnala un file senza frontmatter", () => {
    expect(() => splitFrontmatter("Testo", "x.mdx")).toThrow(/frontmatter/);
  });
});
