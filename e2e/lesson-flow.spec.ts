import { expect, test } from "@playwright/test";
import { completeQuiz, enableFreeMode, loadQuiz } from "./helpers";

test("lezione → quiz → progressi salvati dopo il ricaricamento", async ({ page }) => {
  const quiz = loadQuiz("00-benvenuto", "ciao-sono-cybi");

  await page.goto("/moduli/benvenuto/ciao-sono-cybi");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await completeQuiz(page, quiz);
  await expect(page.getByText(`${quiz.questions.length} risposte corrette su`)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/\d+ XP$/).first()).not.toHaveText("0 XP");

  await page.goto("/moduli/benvenuto");
  const lessonRow = page.getByRole("listitem").filter({ hasText: "Ciao, sono Cybi" });
  await expect(lessonRow.getByLabel("Completata")).toBeVisible();
});

test("un quiz sotto la soglia non completa la lezione", async ({ page }) => {
  const quiz = loadQuiz("00-benvenuto", "ciao-sono-cybi");

  await page.goto("/moduli/benvenuto/ciao-sono-cybi");
  const section = page.locator('section[aria-labelledby="quiz-title"]');
  for (const [i, question] of quiz.questions.entries()) {
    if (question.type === "order" || question.type === "match") throw new Error("tipo inatteso");
    const wrong = question.options.find((o) => !o.correct)!;
    await section.locator("label").filter({ hasText: wrong.text }).first().click();
    await section.getByRole("button", { name: "Verifica" }).click();
    await section
      .getByRole("button", { name: i + 1 < quiz.questions.length ? "Avanti" : "Vedi il risultato" })
      .click();
  }
  await expect(section.getByText(/^0 risposte corrette/)).toBeVisible();
  await expect(section.getByRole("button", { name: "Rifai il quiz" })).toBeVisible();

  await page.goto("/moduli/benvenuto");
  const lessonRow = page.getByRole("listitem").filter({ hasText: "Ciao, sono Cybi" });
  await expect(lessonRow.getByLabel("In corso")).toBeVisible();
});

test("quiz con domande order e match", async ({ page }) => {
  await enableFreeMode(page);

  await page.goto("/moduli/storia-origini/enigma");
  await completeQuiz(page, loadQuiz("01-storia-origini", "enigma"));

  await page.goto("/moduli/storia-origini/arpanet-creeper-crittografia");
  await completeQuiz(page, loadQuiz("01-storia-origini", "arpanet-creeper-crittografia"));
});

test("tutti i quiz del Modulo 2 si completano con le risposte corrette", async ({ page }) => {
  test.slow();
  await enableFreeMode(page);

  for (const id of [
    "anni-90-web",
    "worm-di-massa",
    "crimine-industria",
    "stati-cyberguerra",
    "vulnerabilita-internet",
    "supply-chain-ransomware",
    "oggi-e-domani",
  ]) {
    const quiz = loadQuiz("02-storia-evoluzione", id);
    await page.goto(`/moduli/storia-evoluzione/${id}`);
    await completeQuiz(page, quiz);
    await expect(page.getByText(`${quiz.questions.length} risposte corrette su`)).toBeVisible();
  }
});

test("tutti i quiz del Modulo 3 si completano con le risposte corrette", async ({ page }) => {
  test.slow();
  await enableFreeMode(page);

  for (const id of [
    "dentro-la-scatola",
    "bit-byte-numeri",
    "codificare-dati",
    "sistema-operativo",
    "bug-vulnerabilita",
  ]) {
    const quiz = loadQuiz("03-computer", id);
    await page.goto(`/moduli/come-funziona-computer/${id}`);
    await completeQuiz(page, quiz);
    await expect(page.getByText(`${quiz.questions.length} risposte corrette su`)).toBeVisible();
  }
});

test("tutti i quiz del Modulo 4 si completano con le risposte corrette", async ({ page }) => {
  test.slow();
  await enableFreeMode(page);

  for (const id of ["cose-una-rete", "indirizzi", "pacchetti-livelli", "tcp-udp-porte", "dns", "http-https"]) {
    const quiz = loadQuiz("04-internet", id);
    await page.goto(`/moduli/come-funziona-internet/${id}`);
    await completeQuiz(page, quiz);
    await expect(page.getByText(`${quiz.questions.length} risposte corrette su`)).toBeVisible();
  }
});
