import { describe, expect, it } from "vitest";
import type { QuizQuestion } from "@/lib/content/schema";
import { isAnswerCorrect, quizScore } from "./score";

const single: QuizQuestion = {
  id: "a",
  type: "single",
  prompt: "?",
  options: [
    { text: "sì", correct: true, explain: "." },
    { text: "no", correct: false, explain: "." },
  ],
};

const multiple: QuizQuestion = {
  id: "b",
  type: "multiple",
  prompt: "?",
  options: [
    { text: "1", correct: true, explain: "." },
    { text: "2", correct: true, explain: "." },
    { text: "3", correct: false, explain: "." },
  ],
};

describe("isAnswerCorrect", () => {
  it("accetta la sola opzione corretta", () => {
    expect(isAnswerCorrect(single, [0])).toBe(true);
    expect(isAnswerCorrect(single, [1])).toBe(false);
  });

  it("nella scelta multipla richiede tutte e sole le opzioni corrette", () => {
    expect(isAnswerCorrect(multiple, [1, 0])).toBe(true);
    expect(isAnswerCorrect(multiple, [0])).toBe(false);
    expect(isAnswerCorrect(multiple, [0, 1, 2])).toBe(false);
  });
});

describe("quizScore", () => {
  it("restituisce la frazione di risposte corrette", () => {
    expect(quizScore([single, multiple], [[0], [0]])).toBe(0.5);
    expect(quizScore([single, multiple], [[0], [0, 1]])).toBe(1);
  });

  it("conta come sbagliate le domande senza risposta", () => {
    expect(quizScore([single, multiple], [[0]])).toBe(0.5);
  });
});
