import { describe, expect, it } from "vitest";
import {
  isValidSecret,
  MAX_SECRET,
  MIN_SECRET,
  mix,
  modPow,
  publicPaint,
  publicValue,
  secretPaints,
  sharedSecret,
} from "./key-exchange";

describe("scambio di chiavi", () => {
  it("la miscela non dipende dall'ordine dei colori", () => {
    for (const a of secretPaints) {
      for (const b of secretPaints) {
        expect(mix([publicPaint, a, b])).toBe(mix([publicPaint, b, a]));
      }
    }
  });

  it("scrive la miscela come colore esadecimale", () => {
    expect(mix([publicPaint])).toBe("#facc15");
  });

  it("calcola le potenze modulo p", () => {
    expect(modPow(5, 6, 23)).toBe(8);
    expect(modPow(5, 15, 23)).toBe(19);
  });

  it("Alice e Bob ottengono lo stesso segreto per ogni scelta", () => {
    for (let a = MIN_SECRET; a <= MAX_SECRET; a++) {
      for (let b = MIN_SECRET; b <= MAX_SECRET; b++) {
        expect(sharedSecret(a, publicValue(b))).toBe(sharedSecret(b, publicValue(a)));
      }
    }
    expect(sharedSecret(6, publicValue(15))).toBe(2);
  });

  it("accetta solo segreti interi nell'intervallo", () => {
    expect(isValidSecret(2)).toBe(true);
    expect(isValidSecret(21)).toBe(true);
    expect(isValidSecret(1)).toBe(false);
    expect(isValidSecret(22)).toBe(false);
    expect(isValidSecret(3.5)).toBe(false);
  });
});
