import { describe, expect, it } from "vitest";
import { checkEmail, phishingEmails } from "./phishing";

describe("detective del phishing", () => {
  it("ha email con id univoci, sia phishing sia legittime", () => {
    expect(new Set(phishingEmails.map((e) => e.id)).size).toBe(phishingEmails.length);
    expect(new Set(phishingEmails.map((e) => e.verdict))).toEqual(new Set(["phishing", "legittima"]));
  });

  it("le email di phishing hanno indizi, quelle legittime no", () => {
    for (const email of phishingEmails) {
      const clues = email.parts.filter((p) => p.suspicious).length;
      expect(clues > 0).toBe(email.verdict === "phishing");
      expect(new Set(email.parts.map((p) => p.id)).size).toBe(email.parts.length);
    }
  });

  it("serve il verdetto giusto, tutti gli indizi e nessun falso allarme", () => {
    const email = phishingEmails[0];
    const clues = email.parts.filter((p) => p.suspicious).map((p) => p.id);
    expect(checkEmail(email, { flagged: clues, verdict: "phishing" }).solved).toBe(true);
    expect(checkEmail(email, { flagged: clues, verdict: "legittima" }).solved).toBe(false);

    const partial = checkEmail(email, { flagged: clues.slice(1), verdict: "phishing" });
    expect(partial).toMatchObject({ solved: false, found: clues.length - 1, total: clues.length });

    const extra = checkEmail(email, { flagged: [...clues, "firma"], verdict: "phishing" });
    expect(extra).toMatchObject({ solved: false, wrongFlags: ["firma"] });
  });

  it("un'email legittima si risolve senza segnalare niente", () => {
    const legit = phishingEmails.find((e) => e.verdict === "legittima")!;
    expect(checkEmail(legit, { flagged: [], verdict: "legittima" }).solved).toBe(true);
  });
});
