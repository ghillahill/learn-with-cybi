import { describe, expect, it } from "vitest";
import {
  allDecryptions,
  caesarDecrypt,
  caesarSecret,
  caesarSecretCiphertext,
  caesarShift,
  isCaesarKeyFound,
} from "./caesar";

describe("cifrario di Cesare", () => {
  it("sposta le lettere come nella lezione 1.1", () => {
    expect(caesarShift("CIAO", 3)).toBe("FLDR");
    expect(caesarShift("xyz", 3)).toBe("ABC");
  });

  it("lascia spazi e punteggiatura e toglie gli accenti", () => {
    expect(caesarShift("Perché, sì!", 1)).toBe("QFSDIF, TJ!");
  });

  it("decifra con la stessa chiave", () => {
    expect(caesarDecrypt(caesarShift("ATTACCO ALL'ALBA", 7), 7)).toBe("ATTACCO ALL'ALBA");
  });

  it("la forza bruta prova 25 chiavi e una sola dà il messaggio", () => {
    const all = allDecryptions(caesarSecretCiphertext);
    expect(all).toHaveLength(25);
    expect(all.filter((d) => d.text === caesarSecret.plaintext).map((d) => d.key)).toEqual([caesarSecret.key]);
  });

  it("verifica la chiave trovata", () => {
    expect(isCaesarKeyFound(" 11 ")).toBe(true);
    expect(isCaesarKeyFound("3")).toBe(false);
  });
});
