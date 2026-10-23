import { expect, type Page, test } from "@playwright/test";
import { caesarSecret } from "../src/lib/labs/caesar";
import { checklistItems } from "../src/lib/labs/checklist";
import { cipherLetters, correctPlainLetter } from "../src/lib/labs/frequency";
import { phishingEmails } from "../src/lib/labs/phishing";
import { enableFreeMode } from "./helpers";

function lab(page: Page, id: string) {
  return page.locator(`section[data-lab="${id}"]`);
}

async function savedLabs(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("lwc:progress:v1") ?? "{}").labs);
}

test.beforeEach(async ({ page }) => {
  await enableFreeMode(page);
});

test("convertitore: conversione e tre sfide", async ({ page }) => {
  await page.goto("/moduli/come-funziona-computer/bit-byte-numeri");
  const section = lab(page, "convertitore-numeri");

  await section.getByLabel("decimale (base 10)").fill("255");
  await expect(section.getByLabel("esadecimale (base 16)")).toHaveValue("FF");
  await expect(section.getByLabel("binario (base 2)")).toHaveValue("11111111");

  const answers = ["1101", "255", "a5"];
  const challenges = section.locator("ol > li");
  for (const [i, answer] of answers.entries()) {
    await challenges.nth(i).getByRole("textbox").fill(answer);
    await challenges.nth(i).getByRole("button", { name: "Verifica" }).click();
    await expect(challenges.nth(i).getByText(/^Giusto!/)).toBeVisible();
  }
  await expect(section.getByText("Completato")).toBeVisible();
  expect(await savedLabs(page)).toHaveProperty("convertitore-numeri");
});

test("Base64: codifica e messaggio segreto senza chiave", async ({ page }) => {
  await page.goto("/moduli/come-funziona-computer/codificare-dati");
  const section = lab(page, "base64");

  await section.getByLabel("1. Scrivi una frase").fill("foobar");
  await expect(section.getByLabel("Frase codificata in Base64")).toHaveText("Zm9vYmFy");

  const secret = await section.locator("code").innerText();
  await section.getByLabel("Testo in Base64 da decodificare").fill(secret);
  await expect(section.getByLabel("Testo decodificato")).toHaveText("La parola segreta è: biscotto");

  await section.getByLabel("3. Qual è la parola segreta?").fill("biscotto");
  await section.getByRole("button", { name: "Verifica" }).click();
  await expect(section.getByText("Completato")).toBeVisible();
  expect(await savedLabs(page)).toHaveProperty("base64");
});

test("terminale: missioni guidate fino al permesso negato", async ({ page }) => {
  await page.goto("/moduli/come-funziona-computer/sistema-operativo");
  const section = lab(page, "terminale");
  const input = section.getByRole("textbox");

  for (const cmd of ["whoami", "pwd", "ls", "cd documenti", "cat indizio.txt", "cat /root/diario.txt"]) {
    await input.fill(cmd);
    await input.press("Enter");
  }
  await expect(section.getByRole("log")).toContainText("permesso negato");
  await expect(section.getByText("Missioni completate!")).toBeVisible();
  await expect(section.getByText("Completato")).toBeVisible();

  await page.reload();
  await expect(lab(page, "terminale").getByText("Completato")).toBeVisible();
});

test("IP privati: solo i quattro indirizzi dell'RFC 1918", async ({ page }) => {
  await page.goto("/moduli/come-funziona-internet/indirizzi");
  const section = lab(page, "ip-privati");

  await section.getByText("172.32.0.1").click();
  await section.getByRole("button", { name: "Verifica" }).click();
  await expect(section.getByText(/^Non ancora/)).toBeVisible();

  await section.getByText("172.32.0.1").click();
  for (const address of ["192.168.1.10", "10.200.1.1", "172.31.255.254", "172.16.5.4"]) {
    await section.getByText(address, { exact: true }).click();
  }
  await section.getByRole("button", { name: "Verifica" }).click();
  await expect(section.getByText("Completato")).toBeVisible();
  expect(await savedLabs(page)).toHaveProperty("ip-privati");
});

test("viaggio di un pacchetto: tutte le tappe", async ({ page }) => {
  await page.goto("/moduli/come-funziona-internet/http-https");
  const section = lab(page, "viaggio-pacchetto");

  await expect(section.getByText("Qual è l'indirizzo di www.example.com?")).toBeVisible();
  for (let i = 0; i < 4; i++) await section.getByRole("button", { name: "Avanti" }).click();
  await expect(section.getByText("200 OK")).toBeVisible();
  await expect(section.getByText("Completato")).toBeVisible();
});

test("triade RID: dieci incidenti classificati", async ({ page }) => {
  await page.goto("/moduli/concetti-chiave-sicurezza/triade-rid");
  const section = lab(page, "triade-rid");
  const answers = ["Riservatezza", "Integrità", "Disponibilità", "Riservatezza", "Integrità",
    "Disponibilità", "Riservatezza", "Integrità", "Disponibilità", "Riservatezza"];

  const groups = section.getByRole("group");
  await groups.nth(0).getByRole("button", { name: "Disponibilità" }).click();
  await section.getByRole("button", { name: "Verifica" }).click();
  await expect(section.getByText(/^Hai classificato 1 incidenti/)).toBeVisible();

  for (const [i, answer] of answers.entries()) {
    await groups.nth(i).getByRole("button", { name: answer }).click();
  }
  await section.getByRole("button", { name: "Verifica" }).click();
  await expect(section.getByText("Completato")).toBeVisible();
  expect(await savedLabs(page)).toHaveProperty("triade-rid");
});

test("detective del phishing: sei email", async ({ page }) => {
  await page.goto("/moduli/minacce-attacchi/detective-phishing");
  const section = lab(page, "detective-phishing");
  const email = section.getByRole("article");

  await section.getByRole("button", { name: "È phishing" }).click();
  await section.getByRole("button", { name: "Verifica", exact: true }).click();
  await expect(section.getByText(/^Non ancora: hai trovato 0 indizi/)).toBeVisible();

  for (const [i, data] of phishingEmails.entries()) {
    const parts = email.getByRole("button");
    for (const [j, part] of data.parts.entries()) {
      if (part.suspicious) await parts.nth(j).click();
    }
    await section.getByRole("button", { name: data.verdict === "phishing" ? "È phishing" : "È legittima" }).click();
    await section.getByRole("button", { name: "Verifica", exact: true }).click();
    await expect(section.getByText(/^Giusto!/)).toBeVisible();
    if (i < phishingEmails.length - 1) await section.getByRole("button", { name: "Prossima email" }).click();
  }
  await expect(section.getByText("Completato")).toBeVisible();
  expect(await savedLabs(page)).toHaveProperty("detective-phishing");
});

test("forza delle password: calcolatore e due sfide", async ({ page }) => {
  await page.goto("/moduli/minacce-attacchi/attacchi-password");
  const section = lab(page, "forza-password");

  await expect(section.getByTestId("tempo-medio")).toHaveText("meno di un secondo");
  for (let i = 0; i < 8; i++) await section.getByRole("button", { name: "Un carattere in più" }).click();
  await expect(section.getByTestId("tempo-medio")).toHaveText(/^circa \d+ anni$/);

  await section.getByLabel(/^1\. Solo lettere minuscole/).fill("15");
  await section.getByLabel(/^2\. Tutti e quattro/).fill("12");
  await section.getByRole("button", { name: "Verifica" }).click();
  await expect(section.getByText(/^Non ancora/)).toBeVisible();

  await section.getByLabel(/^1\. Solo lettere minuscole/).fill("16");
  await section.getByRole("button", { name: "Verifica" }).click();
  await expect(section.getByText("Completato")).toBeVisible();
  expect(await savedLabs(page)).toHaveProperty("forza-password");
});

test("Cesare: cifratura e forza bruta sul messaggio intercettato", async ({ page }) => {
  await page.goto("/moduli/crittografia/cifratura-simmetrica");
  const section = lab(page, "cesare");

  await expect(section.getByLabel("Messaggio cifrato")).toHaveText("FLDR");
  await section.getByRole("button", { name: "Prova tutte le 25 chiavi" }).click();
  await expect(section.getByRole("list", { name: "Tutte le decifrature possibili" })).toContainText(caesarSecret.plaintext);

  await section.getByLabel("3. Qual era la chiave?").fill("3");
  await section.getByRole("button", { name: "Verifica" }).click();
  await expect(section.getByText(/^Non è questa/)).toBeVisible();

  await section.getByLabel("3. Qual era la chiave?").fill(String(caesarSecret.key));
  await section.getByRole("button", { name: "Verifica" }).click();
  await expect(section.getByText("Completato")).toBeVisible();
  expect(await savedLabs(page)).toHaveProperty("cesare");
});

test("Cesare: il lab compare anche nella lezione 1.1", async ({ page }) => {
  await page.goto("/moduli/storia-origini/segreti-prima-dei-computer");
  await expect(lab(page, "cesare")).toBeVisible();
});

test("analisi di frequenza: suggerimento e messaggio decifrato", async ({ page }) => {
  await page.goto("/moduli/crittografia/cifratura-simmetrica");
  const section = lab(page, "analisi-frequenza");

  await section.getByRole("button", { name: "Suggeriscimi una lettera" }).click();
  await expect(section.getByLabel(`Lettera cifrata ${cipherLetters[0]} →`)).toHaveValue(correctPlainLetter(cipherLetters[0]));
  await section.getByRole("button", { name: "Verifica" }).click();
  await expect(section.getByText(`Hai indovinato 1 lettere su ${cipherLetters.length}`, { exact: false })).toBeVisible();

  for (const c of cipherLetters.slice(1)) {
    await section.getByLabel(`Lettera cifrata ${c} →`).fill(correctPlainLetter(c).toLowerCase());
  }
  await section.getByRole("button", { name: "Verifica" }).click();
  await expect(section.getByText("Completato")).toBeVisible();
  expect(await savedLabs(page)).toHaveProperty("analisi-frequenza");
});

test("scambio di chiavi: colori e numeri", async ({ page }) => {
  await page.goto("/moduli/crittografia/cifratura-asimmetrica");
  const section = lab(page, "scambio-chiavi");

  await section.getByLabel("Segreto di Alice (a)").fill("6");
  await section.getByLabel("Segreto di Bob (b)").fill("15");
  await expect(section.getByText("Alice spedisce A = g^a mod p = 5^6 mod 23 = 8")).toBeVisible();
  await section.getByLabel(/^Qual è il segreto comune/).fill("2");
  await section.getByRole("button", { name: "Verifica" }).click();
  await expect(section.getByText(/^Esatto: 2.*completa anche i passi/)).toBeVisible();

  for (let i = 0; i < 3; i++) await section.getByRole("button", { name: "Avanti" }).click();
  await expect(section.getByText("colore finale", { exact: true })).toHaveCount(2);
  await expect(section.getByText("Completato")).toBeVisible();
  expect(await savedLabs(page)).toHaveProperty("scambio-chiavi");
});

test("hash: un carattere cambiato e la domanda finale", async ({ page }) => {
  await page.goto("/moduli/crittografia/funzioni-hash");
  const section = lab(page, "hash");

  await expect(section.getByTestId("bit-diversi")).toHaveText(/^Stesso testo, stesso hash/);
  await section.getByRole("textbox", { name: "Testo 1" }).fill("abc");
  await expect(section.getByLabel("SHA-256 del testo 1")).toHaveText(
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
  await section.getByRole("textbox", { name: "Testo 2" }).fill("abd");
  await expect(section.getByTestId("bit-diversi")).toHaveText(/^Bit diversi: \d+ su 256\. Ed è cambiato un solo carattere!$/);

  await section.getByRole("button", { name: /^No, un hash non si/ }).click();
  await expect(section.getByText("Completato")).toBeVisible();
  expect(await savedLabs(page)).toHaveProperty("hash");
});

test("checklist di sicurezza: risposte salvate nei progressi", async ({ page }) => {
  await page.goto("/moduli/igiene-digitale/privacy-navigazione");
  const section = lab(page, "checklist-sicurezza");
  const groups = section.getByRole("group");

  await groups.nth(0).getByRole("button", { name: "Fatto" }).click();
  await groups.nth(1).getByRole("button", { name: "Da fare" }).click();
  await expect(section.getByTestId("riepilogo-checklist")).toHaveText(
    `Fatti: 1 · Da fare: 1 · Senza risposta: ${checklistItems.length - 2}`,
  );
  await expect(section.getByText("Il tuo piano")).toBeVisible();

  await page.reload();
  const reloaded = lab(page, "checklist-sicurezza");
  await expect(reloaded.getByRole("group").nth(0).getByRole("button", { name: "Fatto" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  for (let i = 2; i < checklistItems.length; i++) {
    await reloaded.getByRole("group").nth(i).getByRole("button", { name: "Fatto" }).click();
  }
  await expect(reloaded.getByText("Completato")).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lwc:progress:v1") ?? "{}"));
  expect(saved.labs).toHaveProperty("checklist-sicurezza");
  expect(saved.checklist[checklistItems[1].id]).toBe("da-fare");
});

test("forza delle password: il lab compare anche nella lezione 8.1", async ({ page }) => {
  await page.goto("/moduli/igiene-digitale/password-passkey");
  await expect(lab(page, "forza-password")).toBeVisible();
});
