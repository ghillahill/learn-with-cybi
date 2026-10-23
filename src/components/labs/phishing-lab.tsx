"use client";

import { FlagIcon, PaperclipIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  checkEmail,
  phishingContext,
  phishingEmails,
  type EmailAnswer,
  type EmailPart,
  type PhishingVerdict,
} from "@/lib/labs/phishing";
import { cn } from "@/lib/utils";
import { LabFeedback, LabFrame } from "./lab-frame";

const partLabels: Record<EmailPart["kind"], string> = {
  mittente: "Da",
  oggetto: "Oggetto",
  saluto: "Saluto",
  testo: "Testo",
  link: "Link",
  allegato: "Allegato",
  firma: "Firma",
};

// Lab della lezione 6.4: trovare gli indizi in sei email finte e decidere
// se sono phishing o legittime.
export function PhishingLab() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, EmailAnswer>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const email = phishingEmails[index];
  const answer = answers[email.id] ?? { flagged: [] };
  const result = checkEmail(email, answer);
  const isChecked = checked[email.id] ?? false;
  const solvedCount = phishingEmails.filter(
    (e) => checked[e.id] && checkEmail(e, answers[e.id] ?? { flagged: [] }).solved,
  ).length;
  const emailSolved = isChecked && result.solved;

  function update(change: Partial<EmailAnswer>) {
    setAnswers((prev) => ({ ...prev, [email.id]: { ...answer, ...change } }));
    setChecked((prev) => ({ ...prev, [email.id]: false }));
  }

  function toggleFlag(id: string) {
    const flagged = answer.flagged.includes(id)
      ? answer.flagged.filter((f) => f !== id)
      : [...answer.flagged, id];
    update({ flagged });
  }

  function feedback(): string {
    const problems: string[] = [];
    if (!result.verdictOk) problems.push("il verdetto non è quello giusto");
    if (result.found < result.total) {
      problems.push(`hai trovato ${result.found} ${result.found === 1 ? "indizio" : "indizi"} su ${result.total}`);
    }
    if (result.wrongFlags.length > 0) problems.push("hai segnalato qualcosa che non è sospetto");
    return `Non ancora: ${problems.join(", ")}.`;
  }

  return (
    <LabFrame
      id="detective-phishing"
      title="Detective del phishing"
      objective="trovare gli indizi in sei email e decidere quali sono phishing e quali sono legittime."
      intro="Clicca le parti sospette di ogni email, poi dai il tuo verdetto. Attento: non tutte le email sono trappole, e un falso allarme conta come errore!"
      conclusion="Sei email, sei verdetti giusti! Ricorda la regola d'oro: nel dubbio non cliccare, e verifica usando un canale che conosci già."
      solved={solvedCount === phishingEmails.length}
    >
      <div className="bg-muted/40 rounded-lg border p-3">
        <p className="font-medium">Chi sei in questa simulazione</p>
        <ul className="text-muted-foreground mt-1 space-y-0.5 text-xs">
          <li>
            Ti chiami {phishingContext.name} e lavori alla {phishingContext.company} (dominio{" "}
            <span className="text-foreground font-mono">{phishingContext.companyDomain}</span>).
          </li>
          <li>
            La tua banca è {phishingContext.bank} (dominio{" "}
            <span className="text-foreground font-mono">{phishingContext.bankDomain}</span>).
          </li>
          <li>Non stai aspettando nessun pacco. Nomi e domini sono inventati.</li>
        </ul>
      </div>

      <nav aria-label="Email da analizzare" className="flex flex-wrap gap-2">
        {phishingEmails.map((e, i) => {
          const done = checked[e.id] && checkEmail(e, answers[e.id] ?? { flagged: [] }).solved;
          return (
            <Button
              key={e.id}
              size="sm"
              variant={i === index ? "default" : "outline"}
              aria-current={i === index ? "step" : undefined}
              onClick={() => setIndex(i)}
              className={cn(done && i !== index && "border-success/60 text-success")}
            >
              Email {i + 1}
              {done && <span className="sr-only"> (risolta)</span>}
            </Button>
          );
        })}
      </nav>

      <article aria-label={`Email ${index + 1} di ${phishingEmails.length}`} className="rounded-lg border">
        <p className="text-muted-foreground border-b px-3 py-2 text-xs">
          Email {index + 1} di {phishingEmails.length} — clicca le parti sospette
        </p>
        <ul className="divide-y">
          {email.parts.map((part) => {
            const flagged = answer.flagged.includes(part.id);
            const showExplain = isChecked && (part.suspicious || flagged);
            return (
              <li key={part.id}>
                <button
                  type="button"
                  aria-pressed={flagged}
                  disabled={emailSolved}
                  onClick={() => toggleFlag(part.id)}
                  className={cn(
                    "hover:bg-muted/50 flex w-full items-start gap-3 px-3 py-2 text-left transition-colors",
                    flagged && "bg-destructive/10",
                    isChecked && part.suspicious && flagged && "bg-success/10",
                  )}
                >
                  <span className="text-muted-foreground w-16 shrink-0 text-xs leading-5">{partLabels[part.kind]}</span>
                  <span className="min-w-0 flex-1">
                    <PartText part={part} />
                    {showExplain && (
                      <span className="text-muted-foreground mt-1 block text-xs">
                        {part.suspicious ? (flagged ? "Indizio trovato: " : "Indizio mancato: ") : "Non è sospetto: "}
                        {part.explain}
                      </span>
                    )}
                  </span>
                  <FlagIcon
                    aria-hidden
                    className={cn("mt-0.5 size-4 shrink-0", flagged ? "text-destructive" : "text-muted-foreground/40")}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </article>

      <div role="group" aria-label="Verdetto" className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground">Verdetto:</span>
        {(["phishing", "legittima"] as PhishingVerdict[]).map((v) => (
          <Button
            key={v}
            size="sm"
            variant={answer.verdict === v ? "default" : "outline"}
            aria-pressed={answer.verdict === v}
            disabled={emailSolved}
            onClick={() => update({ verdict: v })}
          >
            {v === "phishing" ? "È phishing" : "È legittima"}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          onClick={() => setChecked((prev) => ({ ...prev, [email.id]: true }))}
          disabled={emailSolved || !answer.verdict}
        >
          Verifica
        </Button>
        {isChecked && (
          <LabFeedback ok={result.solved}>{result.solved ? `Giusto! ${email.summary}` : feedback()}</LabFeedback>
        )}
        {emailSolved && index < phishingEmails.length - 1 && (
          <Button onClick={() => setIndex(index + 1)}>Prossima email</Button>
        )}
      </div>
      <p className="text-muted-foreground text-xs">
        Email risolte: {solvedCount} su {phishingEmails.length}
      </p>
    </LabFrame>
  );
}

function PartText({ part }: { part: EmailPart }) {
  if (part.kind === "link") {
    return (
      <span>
        <span className="text-cybi underline underline-offset-2">{part.text}</span>
        <span className="text-muted-foreground block font-mono text-xs break-all">
          Destinazione reale: {part.href}
        </span>
      </span>
    );
  }
  if (part.kind === "allegato") {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs">
        <PaperclipIcon aria-hidden className="size-3.5" />
        {part.text}
      </span>
    );
  }
  return <span className={cn(part.kind === "mittente" && "font-mono text-xs break-all")}>{part.text}</span>;
}
