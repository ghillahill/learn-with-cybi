// Permutazione casuale degli indici 0..length-1 (Fisher–Yates).
// Con almeno due elementi non restituisce mai l'ordine di partenza:
// in una domanda `order` sarebbe già la soluzione.
export function shuffledIndexes(length: number, random: () => number = Math.random): number[] {
  const result = Array.from({ length }, (_, i) => i);
  if (length < 2) return result;
  do {
    for (let i = length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
  } while (result.every((value, i) => value === i));
  return result;
}

// Sposta l'elemento in posizione `from` alla posizione `to`.
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
