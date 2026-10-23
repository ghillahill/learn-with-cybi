// Fuori da cybi-avatar.tsx (componente client), così il codice server può
// importare l'elenco come valore e non come riferimento client.
export const cybiMoods = [
  "felice",
  "pensieroso",
  "sorpreso",
  "preoccupato",
  "fiero",
  "detective",
] as const;

export type CybiMood = (typeof cybiMoods)[number];
