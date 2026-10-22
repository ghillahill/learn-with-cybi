"use client";

import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CybiBubble } from "@/components/cybi/cybi-bubble";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Quiz } from "@/lib/content/schema";
import { useProgressStore } from "@/lib/progress/store";
import { isAnswerCorrect, quizScore } from "@/lib/quiz/score";
import { cn } from "@/lib/utils";

const typeHint = {
  single: "Una sola risposta corretta.",
  truefalse: "Vero o falso?",
  multiple: "Seleziona tutte le risposte corrette.",
};

export function LessonQuiz({
  quiz,
  lessonKey,
  xp,
}: {
  quiz: Quiz;
  lessonKey: string;
  xp: number;
}) {
  const recordQuiz = useProgressStore((s) => s.recordQuiz);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const question = quiz.questions[index];
  const total = quiz.questions.length;

  function check() {
    setChecked(true);
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = selected;
      return next;
    });
  }

  function next() {
    if (index + 1 < total) {
      setIndex(index + 1);
      setSelected([]);
      setChecked(false);
      return;
    }
    const finalAnswers = [...answers];
    finalAnswers[index] = selected;
    const result = quizScore(quiz.questions, finalAnswers);
    const alreadyCompleted =
      useProgressStore.getState().progress.lessons[lessonKey]?.status === "completed";
    recordQuiz(lessonKey, result, quiz.passingScore, xp);
    setScore(result);
    if (result >= quiz.passingScore && !alreadyCompleted) {
      toast.success(`Lezione completata: +${xp} XP`);
    }
  }

  function restart() {
    setIndex(0);
    setAnswers([]);
    setSelected([]);
    setChecked(false);
    setScore(null);
  }

  if (score !== null) {
    const passed = score >= quiz.passingScore;
    const right = Math.round(score * total);
    return (
      <section aria-labelledby="quiz-title" className="mt-10 rounded-xl border p-5">
        <h2 id="quiz-title" className="text-lg font-semibold">
          Risultato del quiz
        </h2>
        <p className="mt-2 text-sm">
          {right} risposte corrette su {total} ({Math.round(score * 100)}%).
        </p>
        <CybiBubble mood={passed ? "fiero" : "pensieroso"}>
          {passed
            ? "Ottimo lavoro! Hai superato il quiz: la lezione è completata."
            : `Ci sei quasi. Per completare la lezione serve almeno il ${Math.round(
                quiz.passingScore * 100,
              )}% di risposte corrette: rileggi le spiegazioni e riprova.`}
        </CybiBubble>
        <Button variant="outline" onClick={restart}>
          Rifai il quiz
        </Button>
      </section>
    );
  }

  const isRight = checked && isAnswerCorrect(question, selected);

  return (
    <section aria-labelledby="quiz-title" className="mt-10 rounded-xl border p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="quiz-title" className="text-lg font-semibold">
          Quiz finale
        </h2>
        <span className="text-muted-foreground text-sm">
          Domanda {index + 1} di {total}
        </span>
      </div>
      <Progress value={(index / total) * 100} className="mt-3" aria-label="Avanzamento quiz" />

      <fieldset className="mt-5">
        <legend className="font-medium">{question.prompt}</legend>
        <p className="text-muted-foreground mt-1 text-sm">{typeHint[question.type]}</p>

        <div className="mt-4 space-y-2">
          {question.type === "multiple"
            ? question.options.map((option, i) => (
                <OptionRow
                  key={i}
                  checked={checked}
                  isSelected={selected.includes(i)}
                  option={option}
                  control={
                    <Checkbox
                      checked={selected.includes(i)}
                      disabled={checked}
                      onCheckedChange={(on) =>
                        setSelected((prev) =>
                          on ? [...prev, i] : prev.filter((x) => x !== i),
                        )
                      }
                    />
                  }
                />
              ))
            : (
              <RadioGroup
                value={selected[0] === undefined ? null : String(selected[0])}
                onValueChange={(value) => setSelected([Number(value)])}
                disabled={checked}
                className="gap-2"
              >
                {question.options.map((option, i) => (
                  <OptionRow
                    key={i}
                    checked={checked}
                    isSelected={selected.includes(i)}
                    option={option}
                    control={<RadioGroupItem value={String(i)} />}
                  />
                ))}
              </RadioGroup>
            )}
        </div>
      </fieldset>

      {checked && (
        <p
          role="status"
          className={cn("mt-4 text-sm font-medium", isRight ? "text-success" : "text-destructive")}
        >
          {isRight ? "Risposta corretta!" : "Non proprio. Leggi le spiegazioni qui sopra."}
        </p>
      )}

      <div className="mt-5 flex justify-end">
        {checked ? (
          <Button onClick={next}>{index + 1 < total ? "Avanti" : "Vedi il risultato"}</Button>
        ) : (
          <Button onClick={check} disabled={selected.length === 0}>
            Verifica
          </Button>
        )}
      </div>
    </section>
  );
}

function OptionRow({
  option,
  control,
  checked,
  isSelected,
}: {
  option: { text: string; correct: boolean; explain: string };
  control: React.ReactNode;
  checked: boolean;
  isSelected: boolean;
}) {
  const tone = !checked
    ? isSelected
      ? "border-primary/50 bg-muted/50"
      : ""
    : option.correct
      ? "border-success/60 bg-success/5"
      : isSelected
        ? "border-destructive/60 bg-destructive/5"
        : "opacity-80";
  return (
    <label className={cn("flex cursor-pointer gap-3 rounded-lg border px-4 py-3 text-sm", tone)}>
      <span className="mt-0.5">{control}</span>
      <span className="flex-1">
        <span className="flex items-start justify-between gap-2">
          <span>{option.text}</span>
          {checked && option.correct && (
            <CheckIcon className="text-success size-4 shrink-0" aria-label="Risposta corretta" />
          )}
          {checked && !option.correct && isSelected && (
            <XIcon className="text-destructive size-4 shrink-0" aria-label="Risposta sbagliata" />
          )}
        </span>
        {checked && <span className="text-muted-foreground mt-1 block">{option.explain}</span>}
      </span>
    </label>
  );
}
