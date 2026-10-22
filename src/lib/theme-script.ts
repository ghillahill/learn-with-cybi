export const THEME_KEY = "lwc:theme";

// Eseguito prima dell'idratazione (vedi layout): applica il tema salvato,
// altrimenti quello del sistema, senza far lampeggiare la pagina.
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
