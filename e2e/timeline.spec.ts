import { expect, test } from "@playwright/test";
import { loadTimeline, sortOrderList } from "./helpers";

test("i filtri per categoria riducono gli eventi", async ({ page }) => {
  const { events } = loadTimeline();
  await page.goto("/timeline");
  const count = page.getByRole("status");
  await expect(count).toHaveText(`${events.length} eventi`);

  await page.getByRole("button", { name: "Leggi", exact: true }).click();
  const withoutLaws = events.filter((e) => e.category !== "leggi").length;
  await expect(count).toHaveText(`${withoutLaws} eventi`);

  await page.getByRole("button", { name: /Maskelyne/ }).click();
  await expect(page.getByRole("link", { name: "Vai alla lezione" })).toHaveAttribute(
    "href",
    "/moduli/storia-origini/il-primo-hacker",
  );
});

test("Metti in ordine: un round risolto dà 5 su 5", async ({ page }) => {
  const { events } = loadTimeline();
  const dateOf = new Map(events.map((e) => [e.title, e.date]));

  await page.goto("/timeline");
  await page.getByRole("tab", { name: "Metti in ordine" }).click();
  await page.getByRole("button", { name: "Inizia" }).click();

  const list = page.getByRole("tabpanel").locator("ol");
  const titles = await list.locator("> li > span:nth-child(2) > span:first-child > span:first-child").allInnerTexts();
  expect(titles).toHaveLength(5);
  const sorted = [...titles].sort((a, b) => dateOf.get(a)!.localeCompare(dateOf.get(b)!));
  await sortOrderList(list, sorted);

  await page.getByRole("button", { name: "Verifica" }).click();
  await expect(page.getByText("Perfetto, tutti al posto giusto!")).toBeVisible();
});
