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

  it("aggiunge i laboratori mancanti ai file vecchi", () => {
    const old: Record<string, unknown> = { ...emptyProgress() };
    delete old.labs;
    expect(parseProgress(old)?.labs).toEqual({});
  });

  it("aggiunge la checklist mancante ai file vecchi", () => {
    const old: Record<string, unknown> = { ...emptyProgress() };
    delete old.checklist;
    expect(parseProgress(old)?.checklist).toEqual({});
  });

  it("rifiuta stati sconosciuti nella checklist", () => {
    expect(parseProgress({ ...emptyProgress(), checklist: { mfa: "forse" } })).toBeNull();
  });
});
