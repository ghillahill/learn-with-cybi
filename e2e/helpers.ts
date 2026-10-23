import fs from "node:fs";
import path from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";
import { parse } from "yaml";
import { quizSchema, timelineSchema, type Quiz, type QuizQuestion } from "../src/lib/content/schema";

const CONTENT = path.join(process.cwd(), "content");

export function loadQuiz(moduleDir: string, quizId: string): Quiz {
  const file = path.join(CONTENT, "modules", moduleDir, "quizzes", `${quizId}.yaml`);
  return quizSchema.parse(parse(fs.readFileSync(file, "utf8")));
}

export function loadTimeline() {
  return timelineSchema.parse(parse(fs.readFileSync(path.join(CONTENT, "timeline.yaml"), "utf8")));
}

// Attiva la modalità libera prima del caricamento, per aprire moduli bloccati.
export async function enableFreeMode(page: Page) {
  await page.addInitScript(() => {
    if (localStorage.getItem("lwc:progress:v1")) return;
    localStorage.setItem(
      "lwc:progress:v1",
      JSON.stringify({
        version: 1,
        lessons: {},
        xp: 0,
        badges: [],
        streak: { current: 0, lastActiveDate: "" },
        settings: { freeMode: true },
      }),
    );
  });
}

// Riordina una lista `OrderList` con i pulsanti "Sposta su" finché i testi
// non compaiono nell'ordine richiesto.
export async function sortOrderList(list: Locator, wanted: string[]) {
  for (let target = 0; target < wanted.length; target++) {
    // Confronto esatto sull'etichetta del pulsante: "SYN" non deve trovare "SYN-ACK".
    const labels = await list
      .locator("> li")
      .evaluateAll((items) =>
        items.map((li) => li.querySelector('[aria-label^="Sposta su: "]')?.getAttribute("aria-label")),
      );
    let position = labels.indexOf(`Sposta su: ${wanted[target]}`);
    while (position > target) {
      await list.getByRole("button", { name: `Sposta su: ${wanted[target]}`, exact: true }).click();
      position--;
    }
  }
  const texts = await list.locator("> li").allInnerTexts();
  wanted.forEach((text, i) => expect(texts[i]).toContain(text));
}

async function answer(quiz: Locator, question: QuizQuestion) {
  switch (question.type) {
    case "order":
      await sortOrderList(
        quiz.locator("ol"),
        question.items.map((i) => i.text),
      );
      return;
    case "match":
      for (const pair of question.pairs) {
        await quiz.getByLabel(pair.left, { exact: true }).selectOption({ label: pair.right });
      }
      return;
    default:
      for (const option of question.options.filter((o) => o.correct)) {
        await quiz.locator("label").filter({ hasText: option.text }).first().click();
      }
  }
}

// Risponde correttamente a tutte le domande e apre il risultato.
export async function completeQuiz(page: Page, quiz: Quiz) {
  const section = page.locator('section[aria-labelledby="quiz-title"]');
  for (const [i, question] of quiz.questions.entries()) {
    await expect(section.getByText(`Domanda ${i + 1} di ${quiz.questions.length}`)).toBeVisible();
    await answer(section, question);
    await section.getByRole("button", { name: "Verifica" }).click();
    await expect(section.getByRole("status")).toHaveText("Risposta corretta!");
    await section
      .getByRole("button", { name: i + 1 < quiz.questions.length ? "Avanti" : "Vedi il risultato" })
      .click();
  }
  await expect(section.getByRole("heading", { name: "Risultato del quiz" })).toBeVisible();
}
