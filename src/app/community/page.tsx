"use client";
import { useState } from "react";

type Solution = {
  id: string;
  problemTitle: string;
  author: string;
  upvotes: number;
  snippet: string;
  tags: string[];
};

const solutions: Solution[] = [
  {
    id: "1",
    problemTitle: "Implement debounce()",
    author: "alex_dev",
    upvotes: 42,
    snippet: "function debounce(fn, delay) { let id; return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), delay); }; }",
    tags: ["js", "performance"],
  },
  {
    id: "2",
    problemTitle: "Two Sum Variant",
    author: "code_ninja",
    upvotes: 38,
    snippet: "const twoSum = (nums, target) => { const map = {}; for (let i = 0; i < nums.length; i++) { if (map[target - nums[i]] !== undefined) return [map[target - nums[i]], i]; map[nums[i]] = i; } };",
    tags: ["arrays", "hash-map"],
  },
  {
    id: "3",
    problemTitle: "Autocomplete Component",
    author: "react_master",
    upvotes: 55,
    snippet: "const Autocomplete = () => { const [query, setQuery] = useState(''); const debouncedQuery = useDebounce(query, 300); /* fetch suggestions */ };",
    tags: ["react", "hooks"],
  },
];

export default function CommunityPage() {
  const [filter, setFilter] = useState("");

  const filtered = solutions.filter((s) => s.problemTitle.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Community Solutions & Discussions</h1>
        <p className="mt-2 text-white/80">Explore community-verified solutions, share your code, and learn from peers.</p>

        <div className="mt-6">
          <input
            className="w-full max-w-md rounded-md bg-white/10 placeholder-white/60 px-4 py-2 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
            placeholder="Search solutions..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="mt-8 space-y-6">
          {filtered.map((s) => (
            <div key={s.id} className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15 hover:bg-white/15 transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{s.problemTitle}</h3>
                  <p className="text-sm text-white/70 mt-1">by {s.author}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>▲</span>
                  <span className="font-semibold">{s.upvotes}</span>
                </div>
              </div>
              <pre className="mt-4 p-3 rounded-lg bg-[#0f131a] text-sm overflow-x-auto text-white/90">{s.snippet}</pre>
              <div className="mt-3 flex gap-2">
                {s.tags.map((t) => (
                  <span key={t} className="text-xs px-2 py-1 rounded bg-white/10">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

