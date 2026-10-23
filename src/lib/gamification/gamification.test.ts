import { describe, expect, it } from "vitest";
import { completeLab, completeLesson, markMythSeen, recordQuiz } from "@/lib/progress/logic";
import { emptyProgress } from "@/lib/progress/schema";
import { earnedBadgeIds, labsInBody, mythId, mythsInBody, newBadgeIds, type BadgeCatalog } from "./badges";
import { LAB_XP, LEVELS, levelFor, PERFECT_QUIZ_BONUS } from "./levels";
import { currentStreak, dateKey, recordActivity } from "./streak";

const now = new Date(2026, 9, 23, 10, 0);

describe("livelli", () => {
  it("parte da Curioso e sale con le soglie", () => {
    expect(levelFor(0).level.name).toBe("Curioso");
    expect(levelFor(249).level.name).toBe("Curioso");
    expect(levelFor(250).level.name).toBe("Apprendista");
    expect(levelFor(5000).level.name).toBe("Guardiano");
  });

  it("calcola l'avanzamento verso il livello successivo", () => {
    expect(levelFor(500).progress).toBeCloseTo(0.5);
    expect(levelFor(5000).next).toBeNull();
    expect(levelFor(5000).progress).toBe(1);
  });

  it("ha soglie crescenti", () => {
    const mins = LEVELS.map((l) => l.minXp);
    expect([...mins].sort((a, b) => a - b)).toEqual(mins);
  });
});

describe("XP", () => {
  it("dà il bonus solo per un quiz perfetto al primo tentativo", () => {
    const perfect = recordQuiz(emptyProgress(), "m/a", 1, 0.7, 50, now);
    expect(perfect.xp).toBe(50 + PERFECT_QUIZ_BONUS);

    const second = recordQuiz(recordQuiz(emptyProgress(), "m/a", 0.5, 0.7, 50, now), "m/a", 1, 0.7, 50, now);
    expect(second.xp).toBe(50);
    expect(second.lessons["m/a"].quizAttempts).toBe(2);
  });

  it("niente bonus su una lezione già completata prima dei tentativi", () => {
    const old = completeLesson(emptyProgress(), "m/a", 50, now);
    expect(recordQuiz(old, "m/a", 1, 0.7, 50, now).xp).toBe(50);
  });

  it("dà gli XP del laboratorio una volta sola", () => {
    const once = completeLab(emptyProgress(), "hash", now);
    expect(once.xp).toBe(LAB_XP);
    expect(completeLab(once, "hash", now).xp).toBe(LAB_XP);
  });
});

describe("serie di giorni", () => {
  it("conta i giorni consecutivi", () => {
    const day1 = recordActivity({ current: 0, lastActiveDate: "" }, new Date(2026, 9, 21));
    const day2 = recordActivity(day1, new Date(2026, 9, 22));
    const sameDay = recordActivity(day2, new Date(2026, 9, 22, 23));
    expect(sameDay).toEqual({ current: 2, lastActiveDate: "2026-10-22" });
  });

  it("riparte da 1 dopo un giorno saltato", () => {
    const streak = recordActivity({ current: 5, lastActiveDate: "2026-10-20" }, new Date(2026, 9, 22));
    expect(streak.current).toBe(1);
  });

  it("attraversa mesi e anni", () => {
    expect(recordActivity({ current: 3, lastActiveDate: "2026-12-31" }, new Date(2027, 0, 1)).current).toBe(4);
    expect(dateKey(new Date(2026, 2, 1))).toBe("2026-03-01");
  });

  it("la serie si mostra fino al giorno dopo l'ultima attività", () => {
    const streak = { current: 4, lastActiveDate: "2026-10-22" };
    expect(currentStreak(streak, new Date(2026, 9, 23))).toBe(4);
    expect(currentStreak(streak, new Date(2026, 9, 24))).toBe(0);
  });

  it("un quiz aggiorna la serie", () => {
    expect(recordQuiz(emptyProgress(), "m/a", 0.2, 0.7, 50, now).streak).toEqual({
      current: 1,
      lastActiveDate: "2026-10-23",
    });
  });
});

describe("badge", () => {
  const catalog: BadgeCatalog = {
    modules: [{ id: "m", title: "Modulo", badge: { id: "badge-m", name: "B" }, lessonKeys: ["m/a"] }],
    mythIds: [mythId("m/a", "mito")],
    labIds: ["hash"],
  };

  it("assegna il badge del modulo completato", () => {
    const p = recordQuiz(emptyProgress(), "m/a", 1, 0.7, 50, now);
    expect(earnedBadgeIds(p, catalog)).toEqual(["badge-m"]);
    expect(newBadgeIds({ ...p, badges: ["badge-m"] }, catalog)).toEqual([]);
  });

  it("assegna i badge speciali", () => {
    const p = completeLab(markMythSeen(emptyProgress(), mythId("m/a", "mito")), "hash", now);
    expect(earnedBadgeIds(p, catalog)).toEqual(["cacciatore-di-miti", "mani-in-pasta"]);
  });

  it("l'id del mito è stabile e dipende da lezione e testo", () => {
    expect(mythId("m/a", "x")).toBe(mythId("m/a", "x"));
    expect(mythId("m/a", "x")).not.toBe(mythId("m/b", "x"));
    expect(mythId("m/a", "x")).not.toBe(mythId("m/a", "y"));
  });

  it("legge miti e laboratori dal corpo MDX", () => {
    const body = '<MythVsFact\n  myth="Uno"\n  fact="F"\n/>\n<Lab id="hash" />\n<MythVsFact myth="Due" fact="G" />';
    expect(mythsInBody(body)).toEqual(["Uno", "Due"]);
    expect(labsInBody(body)).toEqual(["hash"]);
  });
});
