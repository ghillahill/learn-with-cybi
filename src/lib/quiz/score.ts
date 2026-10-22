import type { ChoiceQuestion, QuizQuestion } from "@/lib/content/schema";

// Una risposta è un elenco di indici, con un significato diverso per tipo:
// - single/multiple/truefalse: le opzioni scelte;
// - order: gli elementi (indici originali) nell'ordine scelto;
// - match: per ogni voce di sinistra, l'indice della voce di destra abbinata.
export type Answer = number[];

export function correctIndexes(question: ChoiceQuestion): number[] {
  return question.options.flatMap((o, i) => (o.correct ? [i] : []));
}

function isIdentity(answer: Answer, length: number): boolean {
  return answer.length === length && answer.every((value, i) => value === i);
}

// Una risposta è giusta solo se è esatta: tutte e sole le opzioni corrette,
// tutti gli elementi al loro posto, tutte le coppie abbinate bene.
export function isAnswerCorrect(question: QuizQuestion, answer: Answer): boolean {
  switch (question.type) {
    case "order":
      return isIdentity(answer, question.items.length);
    case "match":
      return isIdentity(answer, question.pairs.length);
    default: {
      const correct = correctIndexes(question);
      const chosen = new Set(answer);
      return chosen.size === correct.length && correct.every((i) => chosen.has(i));
    }
  }
}

export function quizScore(questions: QuizQuestion[], answers: Answer[]): number {
  if (questions.length === 0) return 0;
  const right = questions.filter((q, i) => isAnswerCorrect(q, answers[i] ?? [])).length;
  return right / questions.length;
}
