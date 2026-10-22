import type { QuizQuestion } from "@/lib/content/schema";

export function correctIndexes(question: QuizQuestion): number[] {
  return question.options.flatMap((o, i) => (o.correct ? [i] : []));
}

// Una risposta è giusta solo se le opzioni scelte coincidono esattamente
// con quelle corrette (vale anche per la scelta multipla).
export function isAnswerCorrect(question: QuizQuestion, selected: number[]): boolean {
  const correct = correctIndexes(question);
  const chosen = new Set(selected);
  return chosen.size === correct.length && correct.every((i) => chosen.has(i));
}

export function quizScore(questions: QuizQuestion[], answers: number[][]): number {
  if (questions.length === 0) return 0;
  const right = questions.filter((q, i) => isAnswerCorrect(q, answers[i] ?? [])).length;
  return right / questions.length;
}
