// Laboratorio hash (lezione 7.3): SHA-256 calcolato nel browser con la Web Crypto API.
// Nessun dato esce dal dispositivo.

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Quanti bit cambiano tra due hash scritti in esadecimale (effetto valanga).
export function bitDifference(hexA: string, hexB: string): number {
  let diff = 0;
  for (let i = 0; i < Math.min(hexA.length, hexB.length); i++) {
    let x = parseInt(hexA[i], 16) ^ parseInt(hexB[i], 16);
    while (x) {
      diff += x & 1;
      x >>= 1;
    }
  }
  return diff;
}

// Vero se i due testi hanno la stessa lunghezza e differiscono in un solo carattere.
export function differsByOneChar(a: string, b: string): boolean {
  const x = [...a];
  const y = [...b];
  if (x.length !== y.length) return false;
  return x.filter((ch, i) => ch !== y[i]).length === 1;
}

export const HASH_BITS = 256;
export const hashStartText = "Cybi ama i biscotti";
