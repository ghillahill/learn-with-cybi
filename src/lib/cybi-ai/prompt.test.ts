import { describe, expect, it } from "vitest";
import { chatRequestSchema, glossaryBlock, lessonContextBlock, MAX_MESSAGE_CHARS, MAX_MESSAGES } from "./prompt";

const user = (content: string) => ({ role: "user" as const, content });
const assistant = (content: string) => ({ role: "assistant" as const, content });

describe("richiesta a Cybi AI", () => {
  it("accetta una conversazione che alterna studente e Cybi", () => {
    const ok = chatRequestSchema.safeParse({
      lessonKey: "crittografia/funzioni-hash",
      messages: [user("Cos'è un hash?"), assistant("Un'impronta!"), user("E il sale?")],
    });
    expect(ok.success).toBe(true);
  });

  it("rifiuta conversazioni malformate", () => {
    const bad = [
      { lessonKey: "crittografia/funzioni-hash", messages: [] },
      { lessonKey: "crittografia/funzioni-hash", messages: [assistant("ciao")] },
      { lessonKey: "crittografia/funzioni-hash", messages: [user("a"), assistant("b")] },
      { lessonKey: "crittografia/funzioni-hash", messages: [user("a"), user("b"), user("c")] },
      { lessonKey: "../segreti", messages: [user("a")] },
      { lessonKey: "crittografia/funzioni-hash", messages: [user("x".repeat(MAX_MESSAGE_CHARS + 1))] },
      { lessonKey: "crittografia/funzioni-hash", messages: [user("   ")] },
    ];
    for (const body of bad) expect(chatRequestSchema.safeParse(body).success).toBe(false);
  });

  it("limita la lunghezza della conversazione", () => {
    const messages = Array.from({ length: MAX_MESSAGES + 1 }, (_, i) => (i % 2 === 0 ? user("a") : assistant("b")));
    expect(chatRequestSchema.safeParse({ lessonKey: "a/b", messages }).success).toBe(false);
  });
});

describe("contesto della lezione", () => {
  it("include titolo, obiettivi, testo e fonti", () => {
    const block = lessonContextBlock({
      moduleTitle: "Crittografia di base",
      title: "Funzioni di hash",
      objectives: ["Capire SHA-256"],
      body: "Una funzione di hash...",
      sources: [{ id: "fips", level: "A", title: "FIPS 180-4", publisher: "NIST", year: 2015 }],
    });
    expect(block).toContain("Lezione: Funzioni di hash");
    expect(block).toContain("- Capire SHA-256");
    expect(block).toContain("Una funzione di hash...");
    expect(block).toContain("- FIPS 180-4, NIST, 2015");
  });

  it("elenca il glossario", () => {
    expect(glossaryBlock([{ id: "sale", term: "Sale", definition: "Valore casuale.", sources: [] }])).toContain(
      "- Sale: Valore casuale.",
    );
  });
});
