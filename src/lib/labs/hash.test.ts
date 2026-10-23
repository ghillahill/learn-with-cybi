import { describe, expect, it } from "vitest";
import { bitDifference, differsByOneChar, sha256Hex } from "./hash";

describe("laboratorio hash", () => {
  it("calcola SHA-256 come i vettori di prova", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(await sha256Hex("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });

  it("è deterministica: stesso testo, stesso hash", async () => {
    expect(await sha256Hex("ciao")).toBe(await sha256Hex("ciao"));
  });

  it("conta i bit diversi", () => {
    expect(bitDifference("00", "00")).toBe(0);
    expect(bitDifference("0f", "00")).toBe(4);
    expect(bitDifference("ff", "00")).toBe(8);
  });

  it("un carattere diverso cambia molti bit", async () => {
    const diff = bitDifference(await sha256Hex("Cybi ama i biscotti"), await sha256Hex("Cybi ama i biscotto"));
    expect(diff).toBeGreaterThan(64);
    expect(diff).toBeLessThan(192);
  });

  it("riconosce un solo carattere cambiato", () => {
    expect(differsByOneChar("ciao", "ciau")).toBe(true);
    expect(differsByOneChar("ciao", "ciao")).toBe(false);
    expect(differsByOneChar("ciao", "cia")).toBe(false);
    expect(differsByOneChar("ciao", "caio")).toBe(false);
  });
});
