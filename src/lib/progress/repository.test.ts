import { describe, expect, it } from "vitest";
import { parseProgress } from "./repository";
import { emptyProgress } from "./schema";

describe("parseProgress", () => {
  it("accetta un file esportato valido", () => {
    expect(parseProgress(JSON.parse(JSON.stringify(emptyProgress())))).toEqual(emptyProgress());
  });

  it("rifiuta dati non validi", () => {
    expect(parseProgress({ version: 2 })).toBeNull();
    expect(parseProgress("ciao")).toBeNull();
  });

  it("aggiunge le impostazioni mancanti ai file vecchi", () => {
    const old: Record<string, unknown> = { ...emptyProgress() };
    delete old.settings;
    expect(parseProgress(old)?.settings.freeMode).toBe(false);
  });
});
