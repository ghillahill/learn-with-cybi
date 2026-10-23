// Serie di giorni consecutivi con almeno un'attività: una lezione, un quiz
// o un laboratorio (§8.4). Le date sono quelle locali del dispositivo.

export type Streak = { current: number; lastActiveDate: string };

export function dateKey(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function previousDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return dateKey(new Date(y, m - 1, d - 1));
}

export function recordActivity(streak: Streak, now: Date): Streak {
  const today = dateKey(now);
  if (streak.lastActiveDate === today) return streak;
  const current = streak.lastActiveDate === previousDay(today) ? streak.current + 1 : 1;
  return { current, lastActiveDate: today };
}

// La serie resta valida fino alla fine del giorno dopo l'ultima attività.
export function currentStreak(streak: Streak, now: Date): number {
  const today = dateKey(now);
  if (streak.lastActiveDate === today || streak.lastActiveDate === previousDay(today)) {
    return streak.current;
  }
  return 0;
}
