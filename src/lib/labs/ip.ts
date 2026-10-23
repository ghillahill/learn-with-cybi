// Indirizzi IPv4 privati (RFC 1918), per il laboratorio della lezione 4.2.

export const privateBlocks = [
  { cidr: "10.0.0.0/8", first: "10.0.0.0", last: "10.255.255.255" },
  { cidr: "172.16.0.0/12", first: "172.16.0.0", last: "172.31.255.255" },
  { cidr: "192.168.0.0/16", first: "192.168.0.0", last: "192.168.255.255" },
] as const;

// Converte "a.b.c.d" in un numero a 32 bit; null se non è un IPv4 valido.
export function parseIPv4(address: string): number | null {
  const parts = address.trim().split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    value = value * 256 + octet;
  }
  return value;
}

// Restituisce il blocco privato che contiene l'indirizzo, o null.
export function privateBlockOf(address: string): (typeof privateBlocks)[number] | null {
  const value = parseIPv4(address);
  if (value === null) return null;
  return (
    privateBlocks.find(
      (b) => value >= parseIPv4(b.first)! && value <= parseIPv4(b.last)!,
    ) ?? null
  );
}

// Indirizzi del laboratorio: alcuni vicinissimi ai confini dei blocchi.
export const ipChallenge = [
  "192.168.1.10",
  "151.20.30.40",
  "10.200.1.1",
  "172.32.0.1",
  "172.31.255.254",
  "192.169.0.1",
  "11.0.0.1",
  "172.16.5.4",
];

export function isIpSelectionCorrect(selected: string[]): boolean {
  const wanted = ipChallenge.filter((a) => privateBlockOf(a) !== null);
  return selected.length === wanted.length && wanted.every((a) => selected.includes(a));
}
