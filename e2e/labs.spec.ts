import { expect, type Page, test } from "@playwright/test";
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
