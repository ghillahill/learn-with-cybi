import { expect, test } from "@playwright/test";
import { completeQuiz, enableFreeMode, loadQuiz } from "./helpers";

async function saved(page: import("@playwright/test").Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("lwc:progress:v1") ?? "{}"));
}

test("modulo completato: bonus, badge e livello nella pagina progressi", async ({ page }) => {
  test.slow();
  await enableFreeMode(page);

  for (const id of ["ciao-sono-cybi", "cose-la-cybersecurity", "hacker-etica-e-legge"]) {
    await page.goto(`/moduli/benvenuto/${id}`);
    await completeQuiz(page, loadQuiz("00-benvenuto", id));
  }
  await expect(page.getByText("Badge sbloccato: Primo passo")).toBeVisible();

  const progress = await saved(page);
  expect(progress.badges).toContain("primo-passo");
  expect(progress.streak.current).toBe(1);
  expect(progress.lessons["benvenuto/ciao-sono-cybi"].quizAttempts).toBe(1);

  await page.goto("/progressi");
  await expect(page.locator('[data-badge="primo-passo"]')).toHaveAttribute("data-earned", "true");
  await expect(page.getByRole("heading", { name: /^Livello: / })).toBeVisible();
  await expect(page.getByRole("radio", { name: /Corona/ })).toBeDisabled();
});

test("un blocco Mito vs Realtà letto viene registrato", async ({ page }) => {
  await enableFreeMode(page);
  await page.goto("/moduli/storia-origini/segreti-prima-dei-computer");
  const myth = page.locator("[data-myth]").first();
  await myth.scrollIntoViewIfNeeded();
  const id = await myth.getAttribute("data-myth");
  await expect.poll(async () => (await saved(page)).mythsSeen ?? [], { timeout: 5000 }).toContain(id);
});

test("accessorio scelto: Cybi lo indossa", async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem("lwc:progress:v1")) return;
    localStorage.setItem(
      "lwc:progress:v1",
      JSON.stringify({
        version: 1,
        lessons: {},
        xp: 800,
        badges: [],
        streak: { current: 0, lastActiveDate: "" },
        settings: { freeMode: true },
      }),
    );
  });
  await page.goto("/progressi");
  await expect(page.getByRole("heading", { name: "Livello: Esploratore" })).toBeVisible();
  await page.getByRole("radio", { name: /Occhiali/ }).click();
  await expect(page.getByRole("radio", { name: /Occhiali/ })).toHaveAttribute("aria-checked", "true");
  expect((await saved(page)).settings.accessory).toBe("occhiali");
});

test("Chiedi a Cybi: domanda, risposta e badge AI (risposte simulate)", async ({ page }) => {
  await enableFreeMode(page);
  let body: { lessonKey: string; messages: { role: string; content: string }[] } | undefined;
  await page.route("**/api/cybi", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: { enabled: true } });
    body = route.request().postDataJSON();
    return route.fulfill({ json: { reply: "Un hash è come un'impronta digitale dei dati!", refused: false } });
  });

  await page.goto("/moduli/crittografia/funzioni-hash");
  await page.getByRole("button", { name: "Chiedi a Cybi" }).click();
  await page.getByLabel("La tua domanda").fill("Cos'è un hash?");
  await page.getByRole("button", { name: "Invia" }).click();

  const log = page.getByRole("log", { name: "Conversazione con Cybi" });
  await expect(log).toContainText("Un hash è come un'impronta digitale dei dati!");
  await expect(log).toContainText("Risposta generata dall'AI");
  expect(body).toEqual({
    lessonKey: "crittografia/funzioni-hash",
    messages: [{ role: "user", content: "Cos'è un hash?" }],
  });
});

test("Chiedi a Cybi: senza chiave API il pulsante non c'è", async ({ page }) => {
  await enableFreeMode(page);
  const status = page.waitForResponse("**/api/cybi");
  await page.goto("/moduli/crittografia/funzioni-hash");
  expect(await (await status).json()).toEqual({ enabled: false });
  await expect(page.getByRole("button", { name: "Chiedi a Cybi" })).toHaveCount(0);
});
