"use client";

import { CheckIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  HOME,
  initialTerminalState,
  runCommand,
  terminalMissions,
  type TerminalState,
} from "@/lib/labs/terminal";
import { cn } from "@/lib/utils";
import { LabFrame } from "./lab-frame";

type Line = { kind: "input" | "output" | "error"; text: string };

function prompt(state: TerminalState) {
  const where = state.cwd.startsWith(HOME) ? `~${state.cwd.slice(HOME.length)}` : state.cwd;
  return `${state.user}@cybi-lab:${where}$`;
}

// Lab della lezione 3.4: terminale simulato con missioni guidate.
export function TerminalLab() {
  const [state, setState] = useState(initialTerminalState);
  const [lines, setLines] = useState<Line[]>([
    { kind: "output", text: "Terminale simulato di LearnWithCybi. Scrivi help per l'elenco dei comandi." },
  ]);
  const [input, setInput] = useState("");
  const [mission, setMission] = useState(0);
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    screenRef.current?.scrollTo({ top: screenRef.current.scrollHeight });
  }, [lines]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = runCommand(state, input);
    const echo: Line = { kind: "input", text: `${prompt(state)} ${input}` };
    const out = result.output.map<Line>((text) => ({ kind: result.ok ? "output" : "error", text }));
    setLines((prev) => (result.clear ? [] : [...prev, echo, ...out]));
    setState(result.state);
    setInput("");
    if (mission < terminalMissions.length && terminalMissions[mission].isDone(result)) {
      setMission(mission + 1);
    }
  }

  const solved = mission === terminalMissions.length;

  return (
    <LabFrame
      id="terminale"
      title="Terminale simulato"
      objective="usare i comandi base di un terminale e scoprire cosa succede quando un utente non ha i permessi."
      intro="Questo è un terminale finto: niente di quello che scrivi tocca il tuo computer. Segui le missioni una alla volta. Se ti blocchi, leggi il suggerimento."
      conclusion={
        <>
          Missioni completate! Il “permesso negato” non è un errore: è il sistema operativo che fa il
          suo lavoro. Il tuo utente ha solo i privilegi che gli servono, e il diario
          dell&apos;amministratore non è tra questi.
        </>
      }
      solved={solved}
    >
      <ol aria-label="Missioni" className="space-y-1">
        {terminalMissions.map((m, i) => (
          <li
            key={m.id}
            aria-current={i === mission ? "step" : undefined}
            className={cn(
              "flex items-start gap-2 rounded-md px-2 py-1",
              i === mission && "bg-cybi/10",
              i > mission && "text-muted-foreground",
            )}
          >
            <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center">
              {i < mission ? (
                <CheckIcon className="text-success size-4" aria-label="Fatta" />
              ) : (
                <span className="text-xs">{i + 1}.</span>
              )}
            </span>
            <span>
              {m.goal}
              {i === mission && (
                <span className="text-muted-foreground block text-xs">Suggerimento: {m.hint}</span>
              )}
            </span>
          </li>
        ))}
      </ol>

      <div className="overflow-hidden rounded-lg border bg-zinc-950 font-mono text-[13px] text-zinc-100">
        <div
          ref={screenRef}
          role="log"
          aria-label="Uscita del terminale"
          aria-live="polite"
          className="h-56 overflow-y-auto p-3"
        >
          {lines.map((line, i) => (
            <p
              key={i}
              className={cn(
                "break-all whitespace-pre-wrap",
                line.kind === "input" && "text-emerald-300",
                line.kind === "error" && "text-red-300",
              )}
            >
              {line.text}
            </p>
          ))}
        </div>
        <form
          onSubmit={submit}
          className="flex flex-wrap items-center gap-x-2 border-t border-zinc-800 px-3 py-2"
        >
          <label htmlFor="terminal-input" className="break-all text-emerald-300">
            {prompt(state)}
          </label>
          <input
            id="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-32 flex-1 bg-transparent outline-none"
          />
        </form>
      </div>
    </LabFrame>
  );
}
