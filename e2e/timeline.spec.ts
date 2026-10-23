import { expect, test } from "@playwright/test";
import { loadTimeline } from "./helpers";

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
