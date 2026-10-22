import { describe, expect, it } from "vitest";
import { moveItem, shuffledIndexes } from "./shuffle";

describe("shuffledIndexes", () => {
  it("restituisce una permutazione di tutti gli indici", () => {
    const result = shuffledIndexes(6);
    expect([...result].sort()).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("non restituisce mai l'ordine di partenza", () => {
    for (let run = 0; run < 200; run++) {
      const result = shuffledIndexes(3);
      expect(result).not.toEqual([0, 1, 2]);
    }
  });

  it("riprova se il generatore produce l'ordine di partenza", () => {
    // Con random() sempre vicino a 1 ogni scambio è con sé stesso: identità.
    const values = [0.99, 0.99, 0, 0];
    let call = 0;
    const result = shuffledIndexes(3, () => values[call++ % values.length]);
    expect(result).not.toEqual([0, 1, 2]);
  });

  it("gestisce liste con meno di due elementi", () => {
    expect(shuffledIndexes(0)).toEqual([]);
    expect(shuffledIndexes(1)).toEqual([0]);
  });
});

describe("moveItem", () => {
  it("sposta un elemento in una nuova posizione", () => {
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveItem(["a", "b", "c"], 2, 1)).toEqual(["a", "c", "b"]);
  });

  it("ignora gli spostamenti fuori dai limiti", () => {
    const list = ["a", "b"];
    expect(moveItem(list, 0, -1)).toBe(list);
    expect(moveItem(list, 1, 2)).toBe(list);
  });
});
