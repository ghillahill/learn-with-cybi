import { describe, expect, it } from "vitest";
import {
  alphabetSize,
  averageSeconds,
  averageYears,
  combinations,
  formatCount,
  formatDuration,
  minLengthFor,
  passwordChallenges,
} from "./password";

describe("stima della forza bruta", () => {
  it("somma gli alfabeti scelti", () => {
    expect(alphabetSize(["minuscole"])).toBe(26);
    expect(alphabetSize(["minuscole", "maiuscole", "cifre", "simboli"])).toBe(94);
    expect(alphabetSize([])).toBe(0);
  });

  it("conta le combinazioni e prende in media metà dello spazio", () => {
    expect(combinations(["cifre"], 4)).toBe(10_000);
    expect(averageSeconds(["cifre"], 4, "lenta")).toBe(5);
  });

  it("allungare la password conta più che aggiungere simboli", () => {
    const longer = averageYears(["minuscole"], 13, "veloce");
    const richer = averageYears(["minuscole", "maiuscole", "cifre", "simboli"], 8, "veloce");
    expect(longer).toBeGreaterThan(richer);
  });

  it("trova la lunghezza minima delle sfide", () => {
    expect(minLengthFor(["minuscole"], "veloce")).toBe(16);
    expect(minLengthFor(["minuscole", "maiuscole", "cifre", "simboli"], "veloce")).toBe(12);
    expect(passwordChallenges.map((c) => c.answer)).toEqual([16, 12]);
  });

  it("scrive i numeri grandi in parole", () => {
    expect(formatCount(10_000)).toBe("10.000");
    expect(formatCount(26 ** 8)).toBe("circa 208,8 miliardi");
    expect(formatCount(94 ** 8)).toBe("circa 6,1 milioni di miliardi");
    expect(formatCount(26 ** 16)).toBe("circa 4,4 × 10²²");
  });

  it("scrive i tempi in parole", () => {
    expect(formatDuration(0.2)).toBe("meno di un secondo");
    expect(formatDuration(5)).toBe("circa 5 secondi");
    expect(formatDuration(3600)).toBe("circa 1 ora");
    expect(formatDuration(3 * 24 * 3600)).toBe("circa 3 giorni");
    expect(formatDuration(1e20)).toMatch(/^più di .* miliardi di anni$/);
  });
});
