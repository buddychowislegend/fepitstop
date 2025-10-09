"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdSense from "@/components/AdSense";

type Problem = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  companies?: string[];
  timeLimit?: string;
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
  const [selectedCompany, setSelectedCompany] = useState<string>("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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
        // Filter out UI design questions and problems without proper test cases
        const validProblems = (data.problems || []).filter((problem: any) => {
          // Exclude UI design questions
          const isUIDesign = problem.tags?.some((tag: string) => 
            tag.toLowerCase().includes('ui') || 
            tag.toLowerCase().includes('design') ||
            tag.toLowerCase().includes('css') ||
            tag.toLowerCase().includes('html')
          );
          
          // Exclude problems without proper test cases
          const hasValidTestCases = problem.testCases && 
            problem.testCases.length >= 3 &&
            problem.testCases[0].input !== "standard input" &&
            problem.testCases[0].input !== "basic input";
          
          return !isUIDesign && hasValidTestCases;
        });
        
        setProblems(validProblems);
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

  // Extract unique companies and tags
  const allCompanies = useMemo(() => {
    const companies = new Set<string>();
    problems.forEach(p => {
      if (p.companies && Array.isArray(p.companies)) {
        p.companies.forEach(c => companies.add(c));
      }
    });
    return Array.from(companies).sort();
  }, [problems]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    problems.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [problems]);

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
      
      const matchesCompany = selectedCompany === "All" 
        ? true 
        : p.companies?.includes(selectedCompany) || false;
      
      const matchesTags = selectedTags.length === 0
        ? true
        : selectedTags.every(tag => p.tags.includes(tag));
      
      return matchesQuery && matchesDiff && matchesCompletion && matchesCompany && matchesTags;
    });
  }, [problems, query, difficulty, showCompleted, selectedCompany, selectedTags, completedProblems]);

  const completedCount = problems.filter(p => completedProblems.has(p.id)).length;
  const totalCount = problems.length;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-[1600px] mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-8">
          {/* Top Banner Ad */}
          <div className="mb-6">
            <AdSense
              adSlot="1234567890"
              adFormat="horizontal"
              style={{ display: "block", minHeight: "90px" }}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold">Problems</h1>
              <p className="mt-2 text-white/80">{totalCount} frontend interview challenges from top companies</p>
            </div>
            {isAuthenticated && (
              <div className="flex items-center gap-4 text-sm">
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
          
          {/* Search bar */}
          <input
            className="w-full rounded-lg bg-white/10 placeholder-white/60 px-4 py-3 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 text-base"
            placeholder="Search problems by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </header>

        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-6 space-y-6">
              {/* Difficulty Filter */}
              <div className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Difficulty</h3>
                <div className="space-y-2">
                  {["All", "Easy", "Medium", "Hard"].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff as any)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                        difficulty === diff
                          ? 'bg-white/20 text-white font-medium'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              {isAuthenticated && (
                <div className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
                  <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Status</h3>
                  <div className="space-y-2">
                    {["All", "Completed", "Not Completed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setShowCompleted(status as any)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                          showCompleted === status
                            ? 'bg-white/20 text-white font-medium'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Filter */}
              <div className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Tags</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {allTags.slice(0, 15).map((tag) => (
                    <label key={tag} className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        className="rounded"
                      />
                      <span className="text-sm text-white/80">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content - Problems List */}
          <main className="flex-1 min-w-0">
            <div className="bg-white/5 rounded-lg ring-1 ring-white/10 overflow-hidden">
              {/* List Header */}
              <div className="bg-white/10 px-6 py-3 border-b border-white/10">
                <div className="flex items-center gap-4 text-sm font-semibold text-white/90">
                  <div className="w-12">Status</div>
                  <div className="flex-1">Title</div>
                  <div className="w-24">Difficulty</div>
                  <div className="w-32 hidden md:block">Time</div>
                  <div className="w-48 hidden xl:block">Companies</div>
                  <div className="w-24">Action</div>
                </div>
              </div>

              {/* Problems List */}
              <div className="divide-y divide-white/10">
                {loading ? (
                  <div className="px-6 py-12 text-center text-white/60">
                    Loading problems...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="px-6 py-12 text-center text-white/60">
                    No problems found. Try adjusting your filters.
                  </div>
                ) : (
                  filtered.map((p) => {
                    const isCompleted = completedProblems.has(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`px-6 py-4 hover:bg-white/5 transition ${
                          isCompleted ? 'bg-green-500/5' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Status Icon */}
                          <div className="w-12 flex justify-center">
                            {isCompleted ? (
                              <span className="text-green-400 text-xl" title="Completed">✓</span>
                            ) : (
                              <span className="text-white/20 text-xl">○</span>
                            )}
                          </div>

                          {/* Title and Tags */}
                          <div className="flex-1 min-w-0">
                            <Link 
                              href={`/problems/${p.id}`}
                              className="font-medium hover:text-blue-300 transition"
                            >
                              {p.title}
                            </Link>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {p.tags.slice(0, 3).map((t) => (
                                <span 
                                  key={t} 
                                  className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/70"
                                >
                                  {t}
                                </span>
                              ))}
                              {p.tags.length > 3 && (
                                <span className="text-xs text-white/50">+{p.tags.length - 3}</span>
                              )}
                            </div>
                          </div>

                          {/* Difficulty */}
                          <div className="w-24">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${difficultyColors[p.difficulty]}`}>
                              {p.difficulty}
                            </span>
                          </div>

                          {/* Time Limit */}
                          <div className="w-32 hidden md:block text-sm text-white/60">
                            {p.timeLimit || '30mins'}
                          </div>

                          {/* Companies */}
                          <div className="w-48 hidden xl:block">
                            {p.companies && p.companies.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {p.companies.slice(0, 2).map((company) => (
                                  <span 
                                    key={company}
                                    className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30"
                                  >
                                    {company}
                                  </span>
                                ))}
                                {p.companies.length > 2 && (
                                  <span className="text-xs text-white/50">+{p.companies.length - 2}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-white/40">—</span>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="w-24">
                            <Link
                              href={`/problems/${p.id}`}
                              className={`inline-flex items-center justify-center px-4 py-1.5 rounded-md text-sm font-medium transition ${
                                isCompleted
                                  ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                                  : 'bg-white/10 text-white hover:bg-white/20'
                              }`}
                            >
                              {isCompleted ? 'Review' : 'Solve'}
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Results count */}
              {!loading && (
                <div className="px-6 py-3 bg-white/5 border-t border-white/10 text-center text-sm text-white/60">
                  Showing {filtered.length} of {totalCount} problems
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar - Company Filter */}
          <aside className="w-72 flex-shrink-0 hidden xl:block">
            <div className="sticky top-6 space-y-4">
              {/* Sidebar Ad */}
              <div className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
                <AdSense
                  adSlot="1234567891"
                  adFormat="vertical"
                  style={{ display: "block", minHeight: "250px" }}
                />
              </div>

              <div className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Filter by Company</h3>
                <div className="space-y-1 max-h-[600px] overflow-y-auto">
                  <button
                    onClick={() => setSelectedCompany("All")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                      selectedCompany === "All"
                        ? 'bg-white/20 text-white font-medium'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    All Companies ({totalCount})
                  </button>
                  {allCompanies.map((company) => {
                    const count = problems.filter(p => p.companies?.includes(company)).length;
                    return (
                      <button
                        key={company}
                        onClick={() => setSelectedCompany(company)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition flex items-center justify-between ${
                          selectedCompany === company
                            ? 'bg-white/20 text-white font-medium'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <span>{company}</span>
                        <span className="text-xs text-white/50">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile filters (shown on small screens) */}
        <div className="lg:hidden mt-6 space-y-4">
          <details className="bg-white/5 rounded-lg p-4 ring-1 ring-white/10">
            <summary className="font-semibold cursor-pointer">Filters</summary>
            <div className="mt-4 space-y-4">
              {/* Mobile Difficulty */}
              <div>
                <h4 className="text-sm font-medium mb-2">Difficulty</h4>
                <div className="flex gap-2">
                  {["All", "Easy", "Medium", "Hard"].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff as any)}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        difficulty === diff
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-white/70'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Company */}
              <div>
                <h4 className="text-sm font-medium mb-2">Company</h4>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full rounded-md bg-white/10 px-3 py-2 ring-1 ring-white/15"
                >
                  <option value="All">All Companies</option>
                  {allCompanies.map((company) => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}


