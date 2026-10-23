// Codifica e decodifica Base64 (RFC 4648) di testo UTF-8, per la lezione 3.3.
// Tutto avviene nel browser: nessuna chiave, nessuna rete.

export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

// Restituisce null se il testo non è Base64 valido o non è UTF-8.
export function decodeBase64(encoded: string): string | null {
  try {
    const binary = atob(encoded.replace(/\s+/g, ""));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

export const base64Secret = {
  message: "La parola segreta è: biscotto",
  answer: "biscotto",
};

export function isSecretFound(answer: string): boolean {
  return answer.trim().toLowerCase() === base64Secret.answer;
}
