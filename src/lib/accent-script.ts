export const ACCENT_KEY = "lwc:accent";

export const ACCENTS = [
  { id: "blu", label: "Blu" },
  { id: "viola", label: "Viola" },
  { id: "verde", label: "Verde" },
  { id: "ciano", label: "Ciano" },
] as const;

export type Accent = (typeof ACCENTS)[number]["id"];

export const DEFAULT_ACCENT: Accent = "blu";

// Eseguito prima dell'idratazione (vedi layout): applica l'accento salvato
// senza far lampeggiare la pagina. I colori sono in globals.css.
export const accentScript = `(function(){try{var a=localStorage.getItem("${ACCENT_KEY}");if(${JSON.stringify(ACCENTS.map((a) => a.id))}.indexOf(a)>-1)document.documentElement.dataset.accent=a}catch(e){}})()`;
