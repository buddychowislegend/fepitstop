"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdSense from "@/components/AdSense";

type Question = {
  id: string;
  question: string;
  options: string[];
  correct: number;
  category?: string;
  difficulty?: string;
};

type Answer = {
  questionId: string;
  question: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
};

import { api } from "@/lib/config";

export default function QuizPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  
  // Timer and rating
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rankInfo, setRankInfo] = useState<any>(null);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to signin with return URL
      router.push('/signin?redirect=/quiz');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!user) return;
    
    fetch(api(`/quiz/random/10`))
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
        setStartTime(Date.now());
        setQuestionStartTime(Date.now());
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleNext = () => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = selected === questions[current].correct;
    
    // Record answer
    const answer: Answer = {
      questionId: questions[current].id,
      question: questions[current].question,
      selectedAnswer: selected!,
      correctAnswer: questions[current].correct,
      isCorrect,
      timeSpent
    };
    
    setAnswers([...answers, answer]);
    
    if (isCorrect) {
      setScore((s) => s + 1);
    }
    
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setQuestionStartTime(Date.now());
    } else {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      setTotalTimeSpent(totalTime);
      setFinished(true);
      setShowRating(true);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!token || !user) {
      router.push('/signin');
      return;
    }

    if (rating === 0) {
      alert('Please rate your quiz experience!');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(api('/quiz/complete'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          score,
          totalQuestions: questions.length,
          rating,
          timeSpent: totalTimeSpent,
          answers
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRankInfo(data.rankInfo);
        setShowRating(false);
      } else {
        alert(data.error || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setAnswers([]);
    setRating(0);
    setShowRating(false);
    setRankInfo(null);
    setLoading(true);
    fetch(api(`/quiz/random/10`))
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
        setStartTime(Date.now());
        setQuestionStartTime(Date.now());
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
    const percentage = Math.round((score / questions.length) * 100);
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const minutes = Math.floor(totalTimeSpent / 60);
    const seconds = totalTimeSpent % 60;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Top Banner Ad */}
          <div className="mb-6">
            <AdSense
              adSlot="1234567896"
              adFormat="horizontal"
              style={{ display: "block", minHeight: "90px" }}
            />
          </div>

          {/* Rating Screen */}
          {showRating && (
            <div className="rounded-2xl bg-white/10 p-8 ring-1 ring-white/15">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
                </div>
                <h1 className="text-4xl font-extrabold mb-2">Quiz Complete!</h1>
                <p className="text-xl text-white/80 mb-6">
                  You scored <span className="font-bold text-emerald-400">{score}</span> out of {questions.length}
                </p>
                
                {/* Score Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-3xl font-bold text-emerald-400">{percentage}%</div>
                    <div className="text-sm text-white/60 mt-1">Accuracy</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-400">{correctAnswers}/{questions.length}</div>
                    <div className="text-sm text-white/60 mt-1">Correct</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-3xl font-bold text-purple-400">{minutes}:{seconds.toString().padStart(2, '0')}</div>
                    <div className="text-sm text-white/60 mt-1">Time</div>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Rate Your Experience</h2>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-5xl transition-all hover:scale-110 ${
                          star <= rating ? 'opacity-100' : 'opacity-30'
                        }`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="mt-2 text-sm text-white/60">
                      {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good!' : rating === 2 ? 'Fair' : 'Needs improvement'}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                {user && token ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting || rating === 0}
                    className="px-8 py-3 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {submitting ? 'Submitting...' : 'Submit & Save Progress'}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-white/70">Sign in to save your progress and earn points!</p>
                    <Link
                      href="/signin"
                      className="inline-block px-8 py-3 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition"
                    >
                      Sign In to Save
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Screen (after submission) */}
          {!showRating && rankInfo && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 p-8 ring-1 ring-emerald-400/20 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h1 className="text-4xl font-extrabold mb-2">Progress Saved!</h1>
                <p className="text-xl text-white/80">
                  You earned <span className="font-bold text-emerald-400">{Math.round(5 + (percentage / 10))}</span> points!
                </p>
              </div>

              {/* Rank Info */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-6 ring-1 ring-amber-400/20">
                <h2 className="text-2xl font-bold mb-4">🏆 Your Ranking</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-300">#{rankInfo.rank}</div>
                    <div className="text-sm text-white/60 mt-1">Global Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-300">{rankInfo.totalScore}</div>
                    <div className="text-sm text-white/60 mt-1">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-300">{rankInfo.problemsSolved}</div>
                    <div className="text-sm text-white/60 mt-1">Problems</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-300">{rankInfo.quizzesTaken}</div>
                    <div className="text-sm text-white/60 mt-1">Quizzes</div>
                  </div>
                </div>
              </div>

              {/* Answer Review */}
              <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
                <h2 className="text-2xl font-bold mb-4">📝 Answer Review</h2>
                <div className="space-y-3">
                  {answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        answer.isCorrect ? 'bg-emerald-500/10 ring-1 ring-emerald-400/30' : 'bg-rose-500/10 ring-1 ring-rose-400/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-2xl ${answer.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {answer.isCorrect ? '✓' : '✗'}
                            </span>
                            <span className="font-semibold">Question {index + 1}</span>
                          </div>
                          <p className="text-sm text-white/80 mb-2">{answer.question}</p>
                          <div className="text-xs text-white/60">
                            {!answer.isCorrect && (
                              <p className="text-rose-300">Correct answer: {questions[index]?.options[answer.correctAnswer]}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-xs text-white/60">
                          {answer.timeSpent}s
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={reset}
                  className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/15 font-semibold transition"
                >
                  Take Another Quiz
          </button>
                <Link
                  href="/profile"
                  className="px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
                >
                  View Profile
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  // Parse question to extract code snippet if present
  const parseQuestion = (question: string) => {
    const codeBlockRegex = /```js\n([\s\S]*?)\n```/;
    const match = question.match(codeBlockRegex);
    
    if (match) {
      const textBefore = question.substring(0, match.index).trim();
      const codeSnippet = match[1];
      return { text: textBefore, code: codeSnippet, hasCode: true };
    }
    
    return { text: question, code: null, hasCode: false };
  };

  const parsedQuestion = parseQuestion(q.question);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Curated Quiz & Trivia</h1>
        <p className="mt-2 text-white/80">Test your knowledge with quick revision questions.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/70">Progress</span>
            <span className="text-sm font-semibold text-white/90">
              {current + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-400 to-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-2xl bg-white/10 p-8 ring-1 ring-white/15">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-white/60">
              Question {current + 1}
            </span>
            {q.category && (
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
                {q.category}
              </span>
            )}
          </div>
          
          {/* Question Text */}
          <h2 className="text-xl font-bold mb-4 leading-relaxed">{parsedQuestion.text}</h2>
          
          {/* Code Snippet (if present) */}
          {parsedQuestion.hasCode && (
            <div className="mb-6 rounded-lg overflow-hidden ring-1 ring-white/20">
              {/* Code Editor Header */}
              <div className="flex items-center gap-2 px-4 py-2 bg-[#0f131a] border-b border-white/10">
                <span className="h-3 w-3 rounded-full bg-[#ff5f56]"></span>
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]"></span>
                <span className="h-3 w-3 rounded-full bg-[#27c93f]"></span>
                <span className="ml-2 text-xs text-white/50">javascript</span>
              </div>
              {/* Code Content */}
              <pre className="p-4 bg-[#1e1e1e] overflow-x-auto">
                <code className="text-sm font-mono text-white/90 leading-relaxed">
                  {parsedQuestion.code}
                </code>
              </pre>
            </div>
          )}
          
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-full text-left px-5 py-4 rounded-lg transition-all ${
                  selected === i
                    ? "bg-white text-[#3a1670] ring-2 ring-white shadow-lg transform scale-[1.02]"
                    : "bg-white/10 hover:bg-white/20 hover:transform hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    selected === i ? 'bg-[#3a1670] text-white' : 'bg-white/20 text-white/80'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-white/60">
              {selected !== null ? '✓ Answer selected' : 'Select an answer to continue'}
          </div>
          <button
            onClick={handleNext}
            disabled={selected === null}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
              {current + 1 === questions.length ? "Finish Quiz" : "Next Question"} →
          </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{score}</div>
            <div className="text-xs text-white/60 mt-1">Correct</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{current - score}</div>
            <div className="text-xs text-white/60 mt-1">Incorrect</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{questions.length - current - 1}</div>
            <div className="text-xs text-white/60 mt-1">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
}
