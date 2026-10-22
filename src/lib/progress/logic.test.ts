import { describe, expect, it } from "vitest";
import {
  completeLesson,
  isModuleUnlocked,
  lessonProgress,
  recordQuiz,
  startLesson,
} from "./logic";
import { emptyProgress } from "./schema";

const now = new Date("2026-10-22T10:00:00Z");

describe("progressi", () => {
  it("startLesson segna la lezione come iniziata una sola volta", () => {
    const p = startLesson(emptyProgress(), "m/a");
    expect(lessonProgress(p, "m/a").status).toBe("in_progress");
    expect(startLesson(p, "m/a")).toBe(p);
  });

  it("assegna gli XP solo al primo completamento", () => {
    const once = completeLesson(emptyProgress(), "m/a", 50, now);
    const twice = completeLesson(once, "m/a", 50, now);
    expect(twice.xp).toBe(50);
    expect(lessonProgress(twice, "m/a").completedAt).toBe(now.toISOString());
  });

  it("recordQuiz completa la lezione solo sopra la soglia e tiene il punteggio migliore", () => {
    const failed = recordQuiz(emptyProgress(), "m/a", 0.5, 0.7, 40, now);
    expect(lessonProgress(failed, "m/a").status).toBe("in_progress");
    expect(failed.xp).toBe(0);

    const passed = recordQuiz(failed, "m/a", 0.75, 0.7, 40, now);
    expect(lessonProgress(passed, "m/a").status).toBe("completed");
    expect(passed.xp).toBe(40);

    const worse = recordQuiz(passed, "m/a", 0.25, 0.7, 40, now);
    expect(lessonProgress(worse, "m/a").bestQuizScore).toBe(0.75);
    expect(lessonProgress(worse, "m/a").status).toBe("completed");
  });

  it("sblocca un modulo quando i moduli richiesti sono completati", () => {
    const required = [["m/a", "m/b"]];
    let p = completeLesson(emptyProgress(), "m/a", 10, now);
    expect(isModuleUnlocked(p, required)).toBe(false);
    p = completeLesson(p, "m/b", 10, now);
    expect(isModuleUnlocked(p, required)).toBe(true);
  });

  it("in modalità libera tutto è sbloccato", () => {
    const p = { ...emptyProgress(), settings: { freeMode: true } };
    expect(isModuleUnlocked(p, [["m/a"]])).toBe(true);
  });
});
