# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Progetto

LearnWithCybi è una web app per imparare la cybersecurity da zero, con la mascotte Cybi. La specifica completa è in [LEARNWITHCYBI.md](LEARNWITHCYBI.md): è la fonte di verità per scelte di prodotto, formato dei contenuti, curriculum e roadmap. Leggila prima di implementare una funzionalità o scrivere una lezione.

Utente unico, nessun login: i progressi vivono nel browser (`localStorage`, chiave `lwc:progress:v1`) dietro l'interfaccia `ProgressRepository`, così un backend si potrà aggiungere senza toccare i componenti (§6.3).

## Comandi

```bash
npm run dev            # server di sviluppo su http://localhost:3000 (mostra anche le lezioni non pubblicate)
npm run build          # content:check + build di produzione (mostra solo le lezioni `pubblicata`)
LWC_SHOW_DRAFTS=1 npm run build   # build che include anche bozze e lezioni non pubblicate
npm run lint           # ESLint
npm test               # Vitest (src/**/*.test.ts)
npm run test:e2e       # Playwright (e2e/*.spec.ts); riusa `npm run dev` se è già attivo su :3000
npx vitest run src/lib/quiz/score.test.ts   # un singolo file di test
npm run content:check  # valida contenuti, riferimenti, fonti e sintassi MDX
npx shadcn@latest add <componente>   # aggiunge un componente shadcn/ui in src/components/ui/
```

Non lanciare `npm run build` mentre `npm run dev` è attivo: condividono `.next/` e il dev server può restare con CSS vecchio (in quel caso: fermalo, `rm -rf .next`, riavvialo).

## Stack

Next.js 16 (App Router, `src/`) + React 19 + TypeScript, Tailwind CSS v4 (configurato in `src/app/globals.css`, non c'è `tailwind.config`), **shadcn/ui** come libreria di componenti. Contenuti in MDX (compilati a runtime lato server con `@mdx-js/mdx` `evaluate`) e YAML (pacchetto `yaml`), validati con Zod 4; stato dei progressi con Zustand; test con Vitest (logica) e Playwright (flussi principali, solo Chromium).

- Next.js 16 ha cambiamenti incompatibili rispetto alle versioni precedenti: leggi [AGENTS.md](AGENTS.md) e la guida in `node_modules/next/dist/docs/` prima di scrivere codice Next.
- shadcn/ui usa il preset `base-nova` (componenti basati su Base UI, non su Radix: verifica le API nel file del componente). Configurazione in `components.json`, componenti in `src/components/ui/`, utility `cn()` in `src/lib/utils.ts`. Usa questi componenti prima di scriverne di nuovi; non modificare a mano i file in `ui/` se puoi personalizzare tramite `className` o varianti.
- `cacheComponents` è attivo in `next.config.ts`: le pagine dinamiche leggono `params` dentro un `<Suspense>` (vedi `src/app/moduli/[modulo]/page.tsx`), non usano `dynamicParams`, e `generateStaticParams` deve restituire almeno un risultato (per questo elenca tutte le lezioni, anche quelle nascoste, e la pagina risponde 404).
- Il layout radice monta `TooltipProvider`, il `Toaster` di sonner, `ProgressSync` e lo script dell'accento. L'app è solo scura (palette Tokyo Night in `globals.css`, classe `dark` fissa su `<html>`, font JetBrains Mono). Il colore di accento (blu, viola, verde, ciano) si sceglie dal selettore in header: attributo `data-accent` su `<html>`, gestito in `src/lib/accent.ts` + `src/lib/accent-script.ts`. `src/components/ui/sonner.tsx` è stato modificato per usare sempre il tema scuro.
- Gli script Node che importano codice di `src/` (es. `scripts/content-check.mts`) girano con `tsx`; i pacchetti solo ESM come `@mdx-js/mdx` vanno importati con `import()` dinamico.

## Architettura

Il corso è modulare: aggiungere un modulo vuol dire aggiungere una cartella in `content/modules/`, senza toccare il codice dell'app.

- `content/modules/<NN-slug>/module.yaml`: manifest del modulo (ordine, prerequisiti, badge, ordine delle lezioni). Schema in §7.1.
- `content/modules/<NN-slug>/lessons/*.mdx`: una lezione. Il frontmatter contiene `status`, `lastVerified`, `sources` e l'id del quiz (`quiz`). Il corpo usa solo i componenti elencati in `LESSON_COMPONENTS` (`src/lib/content/keys.ts`): `<Cybi mood>`, `<Cite id>`, `<Term id>`, `<MythVsFact myth fact source>`, `<KeyPoints>`, `<Callout type>`, `<Lab id>`. L'MDX è compilato senza GFM: niente tabelle Markdown, usa elenchi puntati.
- `content/modules/<NN-slug>/quizzes/<id>.yaml`: il quiz finale della lezione. Tipi `single`, `multiple`, `truefalse` (`options`, ognuna con `explain`), `order` (`items` scritti nell'ordine corretto, l'app li mescola) e `match` (`pairs` left/right, l'app mescola la colonna destra). Nei valori YAML che contengono `: ` usa le virgolette.
- `content/timeline.yaml`: fonti condivise (`sources`) ed eventi (`events`) della pagina `/timeline`. Ogni evento cita le fonti per id, ha `status`/`lastVerified` come le lezioni, una `date` parziale (AAAA, AAAA-MM o AAAA-MM-GG) e una `note` per stime e date incerte; il link `lesson` deve puntare a una lezione esistente.
- `content/glossary.yaml`: termini usati da `<Term>`, ognuno con almeno una fonte.
- Codice: schemi Zod in `src/lib/content/schema.ts` → `loader.ts` legge i file (in sviluppo a ogni richiesta, in produzione una volta) e filtra per stato → `check.ts` fa i controlli incrociati (citazioni, termini, componenti, `lastVerified`, fonti solo C, sintassi MDX, riferimenti della timeline). `src/components/lesson/lesson-body.tsx` collega i componenti MDX alle fonti della lezione e al glossario.
- Laboratori simulati (§8.3): logica pura e testata in `src/lib/labs/`, componenti client in `src/components/labs/` dentro `LabFrame`. Per aggiungerne uno: id in `LAB_IDS` (`keys.ts`), componente nel registro di `lab.tsx`. Il completamento si salva in `progress.labs`; le risposte della checklist personale (lab `checklist-sicurezza`, 8.5) in `progress.checklist`.
- Progressi: logica pura in `src/lib/progress/logic.ts` (testata), store Zustand in `store.ts`, salvataggio tramite `ProgressRepository` (`repository.ts`), caricamento/salvataggio automatico in `progress-sync.tsx`. Chiave lezione = `modulo/lezione` (`lessonKey`). I componenti client leggono lo store solo dopo `hydrated` per evitare differenze di idratazione.

## Regole sui contenuti (vincolanti)

L'utente impara da questi contenuti senza poterli verificare: un fatto sbagliato viene imparato sbagliato.

- Ogni fatto (data, nome, numero, definizione) deve avere una fonte di livello A o B (§3.1). Non aggiungere fatti dalla memoria senza una fonte.
- Una lezione passa per gli stati `bozza → fonti-verificate → revisionata → pubblicata`, e in produzione l'app mostra solo `pubblicata` (§3.2). Le scalette in §9 sono già `fonti verificate`. Prima di segnare una lezione `revisionata`, chiudi i punti ⚠ elencati nel registro §13.
- Stime, attribuzioni contestate e date in conflitto vanno presentate come tali, mai come fatti certi.
- I laboratori sono solo simulati nel browser: niente rete e niente sistemi reali. Nessuna istruzione operativa contro sistemi reali, nemmeno nella chat di Cybi AI.
- Lingua dei contenuti: italiano. I termini tecnici restano in inglese e vanno spiegati alla prima occorrenza.
- Il tono di Cybi è "amico curioso": fumetti di 2–3 frasi al massimo, dà del tu, ironia mai sullo studente (§4.2).

## Cybi AI

La chat è opzionale: senza API key l'app funziona con il solo Cybi scritto. La chiamata al modello passa solo da una route API server (`/api/cybi`): la chiave non arriva mai al browser. Il modello si configura da variabile d'ambiente. Ogni risposta mostra il badge "Risposta generata dall'AI" (§4.4).
