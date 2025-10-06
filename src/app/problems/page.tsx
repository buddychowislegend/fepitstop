"use client";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";

type Problem = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
};


import { api } from "@/lib/config";

const difficultyColors: Record<Problem["difficulty"], string> = {
  Easy: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20",
  Medium: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20",
  Hard: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20",
};

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<"All" | Problem["difficulty"]>("All");
  const [showCompleted, setShowCompleted] = useState<"All" | "Completed" | "Not Completed">("All");
  const [completedProblems, setCompletedProblems] = useState<Set<string>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch user's completed problems
  const fetchCompletedProblems = async () => {
    try {
      const token = localStorage.getItem('fp_token');
      if (!token) return;

      // First try to get from server
      const response = await fetch(api('/submissions/user'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const serverCompleted = new Set<string>(data.submissions.map((s: any) => s.problemId));
        
        // Also check localStorage for any locally completed problems
        const localCompleted = JSON.parse(localStorage.getItem('fp_completed_problems') || '[]');
        const localCompletedSet = new Set<string>(localCompleted);
        
        // Merge server and local completions
        const allCompleted = new Set([...serverCompleted, ...localCompletedSet]);
        setCompletedProblems(allCompleted);
        setIsAuthenticated(true);
        
        // Update localStorage with merged data
        localStorage.setItem('fp_completed_problems', JSON.stringify([...allCompleted]));
      }
    } catch (error) {
      console.error('Error fetching completed problems:', error);
      
      // Fallback to localStorage if server fails
      const localCompleted = JSON.parse(localStorage.getItem('fp_completed_problems') || '[]');
      setCompletedProblems(new Set<string>(localCompleted));
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('fp_token');
    if (token) {
      setIsAuthenticated(true);
      fetchCompletedProblems();
    }

    // Fetch problems
    fetch(api(`/problems`))
      .then((res) => res.json())
      .then((data) => {
        setProblems(data.problems || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Debug function to manually mark problems as completed (for testing)
  const markProblemCompleted = (problemId: string) => {
    const completedProblems = JSON.parse(localStorage.getItem('fp_completed_problems') || '[]');
    if (!completedProblems.includes(problemId)) {
      completedProblems.push(problemId);
      localStorage.setItem('fp_completed_problems', JSON.stringify(completedProblems));
      setCompletedProblems(new Set(completedProblems));
      console.log(`Marked problem ${problemId} as completed`);
    }
  };

  // Debug function to clear all completions (for testing)
  const clearAllCompletions = () => {
    localStorage.removeItem('fp_completed_problems');
    setCompletedProblems(new Set());
    console.log('Cleared all completions');
  };

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const matchesQuery = p.title.toLowerCase().includes(query.toLowerCase());
      const matchesDiff = difficulty === "All" ? true : p.difficulty === difficulty;
      const isCompleted = completedProblems.has(p.id);
      
      let matchesCompletion = true;
      if (showCompleted === "Completed") {
        matchesCompletion = isCompleted;
      } else if (showCompleted === "Not Completed") {
        matchesCompletion = !isCompleted;
      }
      
      return matchesQuery && matchesDiff && matchesCompletion;
    });
  }, [problems, query, difficulty, showCompleted, completedProblems]);

  const completedCount = problems.filter(p => completedProblems.has(p.id)).length;
  const totalCount = problems.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">Problems</h1>
            <p className="mt-2 text-white/80">Search and filter frontend interview questions.</p>
            {isAuthenticated && (
              <div className="mt-3 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-white/80">
                    {completedCount}/{totalCount} completed
                  </span>
                </div>
                <div className="w-32 bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              className="w-full sm:w-80 rounded-md bg-white/10 placeholder-white/60 px-4 py-2 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="Search problems..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="rounded-md bg-white/10 px-3 py-2 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
            >
              <option>All</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            {isAuthenticated && (
              <select
                className="rounded-md bg-white/10 px-3 py-2 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                value={showCompleted}
                onChange={(e) => setShowCompleted(e.target.value as any)}
              >
                <option>All</option>
                <option>Completed</option>
                <option>Not Completed</option>
              </select>
            )}
            
            {/* Debug buttons for testing */}
            {process.env.NODE_ENV === 'development' && (
              <div className="flex gap-2">
                <button
                  onClick={() => markProblemCompleted('two-sum')}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                >
                  Mark Two Sum
                </button>
                <button
                  onClick={clearAllCompletions}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-white/60 col-span-3">Loading problems...</p>
          ) : filtered.length === 0 ? (
            <p className="text-white/60 col-span-3">No problems found</p>
          ) : (
            filtered.map((p, idx) => {
              const isCompleted = completedProblems.has(p.id);
              return (
                <article
                  key={p.id}
                  className={`rounded-2xl p-5 ring-1 shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 [animation:fadeUp_700ms_ease-out_calc(var(--i,0)*120ms)_both] ${
                    isCompleted 
                      ? 'bg-green-500/10 ring-green-400/20 border-green-400/30' 
                      : 'bg-[#151a24] ring-white/10'
                  }`}
                  style={{ ["--i" as any]: idx } as CSSProperties}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{p.title}</h3>
                      {isCompleted && (
                        <span className="text-green-400 text-lg" title="Completed">✓</span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${difficultyColors[p.difficulty as keyof typeof difficultyColors]}`}>{p.difficulty}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
                    {p.tags.map((t) => (
                      <span key={t} className="px-2 py-1 rounded bg-white/5 ring-1 ring-white/10">{t}</span>
                    ))}
                  </div>
                  <Link 
                    href={`/problems/${p.id}`} 
                    className={`mt-5 inline-flex items-center justify-center rounded-md font-semibold px-4 py-2 hover:opacity-90 ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white text-[#3a1670]'
                    }`}
                  >
                    {isCompleted ? '✓ Completed' : 'Solve'}
                  </Link>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}


