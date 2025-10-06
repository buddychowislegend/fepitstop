"use client";
import { useEffect, useState } from "react";

type Question = {
  id: string;
  question: string;
  options: string[];
  correct: number;
};

import { api } from "@/lib/config";

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    fetch(api(`/quiz/random/5`))
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleNext = () => {
    if (selected === questions[current].correct) {
      setScore((s) => s + 1);
    }
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  const reset = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setLoading(true);
    fetch(api(`/quiz/random/5`))
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white flex items-center justify-center">
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-extrabold">Quiz Complete!</h1>
          <p className="mt-4 text-xl">
            Your Score: <span className="font-bold text-[#2ad17e]">{score}</span> / {questions.length}
          </p>
          <button onClick={reset} className="mt-6 px-5 py-3 rounded-md bg-white text-[#3a1670] font-semibold hover:opacity-90">
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Curated Quiz & Trivia</h1>
        <p className="mt-2 text-white/80">Test your knowledge with quick revision questions.</p>

        <div className="mt-8 rounded-2xl bg-white/10 p-8 ring-1 ring-white/15">
          <div className="text-sm text-white/60">
            Question {current + 1} of {questions.length}
          </div>
          <h2 className="mt-4 text-2xl font-bold">{q.question}</h2>
          <div className="mt-6 space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  selected === i ? "bg-white text-[#3a1670] ring-2 ring-white" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={selected === null}
            className="mt-6 px-5 py-3 rounded-md bg-[#2ad17e] text-[#0e1a12] font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {current + 1 === questions.length ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
