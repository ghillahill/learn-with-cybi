import { describe, expect, it } from "vitest";
import { base64Secret, decodeBase64, encodeBase64, isSecretFound } from "./base64";

describe("Base64", () => {
  it("codifica come nell'RFC 4648", () => {
    // Vettori di prova della sezione 10 dell'RFC 4648.
    expect(encodeBase64("f")).toBe("Zg==");
    expect(encodeBase64("foob")).toBe("Zm9vYg==");
    expect(encodeBase64("foobar")).toBe("Zm9vYmFy");
  });

  it("gestisce i caratteri non ASCII con UTF-8", () => {
    expect(decodeBase64(encodeBase64("perché è così"))).toBe("perché è così");
  });

  it("restituisce null per input non valido", () => {
    expect(decodeBase64("%%%")).toBeNull();
  });

  it("il messaggio segreto si decodifica senza chiave", () => {
    expect(decodeBase64(encodeBase64(base64Secret.message))).toBe(base64Secret.message);
    expect(isSecretFound(" Biscotto ")).toBe(true);
    expect(isSecretFound("cookie")).toBe(false);
  });
});
