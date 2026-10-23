import { describe, expect, it } from "vitest";
import { formatInBase, isChallengeSolved, numberChallenges, parseInBase } from "./numbers";

describe("convertitore", () => {
  it("interpreta i numeri nelle tre basi", () => {
    expect(parseInBase("1101", 2)).toBe(13);
    expect(parseInBase("1010 0101", 2)).toBe(165);
    expect(parseInBase("ff", 16)).toBe(255);
    expect(parseInBase("42", 10)).toBe(42);
  });

  it("rifiuta cifre non valide per la base", () => {
    expect(parseInBase("102", 2)).toBeNull();
    expect(parseInBase("G1", 16)).toBeNull();
    expect(parseInBase("", 10)).toBeNull();
    expect(parseInBase("-3", 10)).toBeNull();
  });

  it("scrive i numeri in maiuscolo", () => {
    expect(formatInBase(165, 16)).toBe("A5");
    expect(formatInBase(13, 2)).toBe("1101");
  });

  it("ogni sfida accetta la sua risposta e rifiuta le altre", () => {
    for (const c of numberChallenges) {
      expect(isChallengeSolved(c, formatInBase(c.value, c.answerBase))).toBe(true);
      expect(isChallengeSolved(c, formatInBase(c.value + 1, c.answerBase))).toBe(false);
    }
  });
});
