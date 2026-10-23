import { describe, expect, it } from "vitest";
import { ciaIncidents, isCiaAnswerCorrect, isCiaChallengeSolved, type CiaAnswers } from "./cia";

const solution: CiaAnswers = Object.fromEntries(ciaIncidents.map((i) => [i.id, i.answer]));

describe("classificazione degli incidenti RID", () => {
  it("ha dieci incidenti con id univoci e tutte e tre le proprietà", () => {
    expect(ciaIncidents).toHaveLength(10);
    expect(new Set(ciaIncidents.map((i) => i.id)).size).toBe(10);
    expect(new Set(ciaIncidents.map((i) => i.answer))).toEqual(new Set(["R", "I", "D"]));
  });

  it("controlla ogni risposta", () => {
    const [first] = ciaIncidents;
    expect(isCiaAnswerCorrect(first, { [first.id]: first.answer })).toBe(true);
    expect(isCiaAnswerCorrect(first, {})).toBe(false);
  });

  it("è risolto solo se tutte le risposte sono giuste", () => {
    expect(isCiaChallengeSolved(solution)).toBe(true);
    expect(isCiaChallengeSolved({ ...solution, stipendi: "D" })).toBe(false);
    expect(isCiaChallengeSolved({ ...solution, stipendi: undefined })).toBe(false);
  });
});
