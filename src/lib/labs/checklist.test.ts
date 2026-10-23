import { describe, expect, it } from "vitest";
import { checklistItems, checklistSummary, isChecklistReviewed, type ChecklistAnswers } from "./checklist";

describe("checklist personale", () => {
  it("ha id unici", () => {
    const ids = checklistItems.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("conta fatti, da fare e mancanti", () => {
    expect(checklistSummary({ mfa: "fatto", backup: "da-fare" })).toEqual({
      done: 1,
      todo: 1,
      missing: checklistItems.length - 2,
    });
  });

  it("è completata quando ogni voce ha una risposta, anche da fare", () => {
    const allTodo: ChecklistAnswers = Object.fromEntries(checklistItems.map((i) => [i.id, "da-fare"]));
    expect(isChecklistReviewed(allTodo)).toBe(true);
    expect(isChecklistReviewed({})).toBe(false);
  });

  it("ignora voci che non esistono più", () => {
    expect(checklistSummary({ vecchia: "fatto" }).done).toBe(0);
  });
});
