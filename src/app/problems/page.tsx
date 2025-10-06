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


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

  useEffect(() => {
    fetch(`${API_URL}/problems`)
      .then((res) => res.json())
      .then((data) => {
        setProblems(data.problems || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const matchesQuery = p.title.toLowerCase().includes(query.toLowerCase());
      const matchesDiff = difficulty === "All" ? true : p.difficulty === difficulty;
      return matchesQuery && matchesDiff;
    });
  }, [problems, query, difficulty]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">Problems</h1>
            <p className="mt-2 text-white/80">Search and filter frontend interview questions.</p>
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
          </div>
        </header>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-white/60 col-span-3">Loading problems...</p>
          ) : filtered.length === 0 ? (
            <p className="text-white/60 col-span-3">No problems found</p>
          ) : (
            filtered.map((p, idx) => (
            <article
              key={p.id}
              className="rounded-2xl bg-[#151a24] p-5 ring-1 ring-white/10 shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 [animation:fadeUp_700ms_ease-out_calc(var(--i,0)*120ms)_both]"
              style={{ ["--i" as any]: idx } as CSSProperties}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{p.title}</h3>
                <span className={`text-xs px-2 py-1 rounded ${difficultyColors[p.difficulty as keyof typeof difficultyColors]}`}>{p.difficulty}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
                {p.tags.map((t) => (
                  <span key={t} className="px-2 py-1 rounded bg-white/5 ring-1 ring-white/10">{t}</span>
                ))}
              </div>
              <Link href={`/problems/${p.id}`} className="mt-5 inline-flex items-center justify-center rounded-md bg-white text-[#3a1670] font-semibold px-4 py-2 hover:opacity-90">
                Solve
              </Link>
            </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


