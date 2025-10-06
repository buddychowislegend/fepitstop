"use client";
import { useEffect, useState } from "react";

type Plan = {
  id: string;
  name: string;
  duration: string;
  level: string;
  topics: string[];
};

import { api } from "@/lib/config";

export default function PrepPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Plan | null>(null);

  useEffect(() => {
    fetch(api(`/prep-plans`))
      .then((res) => res.json())
      .then((data) => {
        setPlans(data.plans || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Personalized Prep Plans</h1>
        <p className="mt-2 text-white/80">Choose a study plan based on your experience level and target companies.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {loading ? (
            <p className="text-white/60 col-span-2">Loading plans...</p>
          ) : (
            plans.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl p-6 ring-1 transition cursor-pointer ${
                selected?.id === p.id ? "bg-white text-[#1f1144] ring-white" : "bg-white/10 ring-white/15 hover:bg-white/15"
              }`}
              onClick={() => setSelected(p)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{p.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${selected?.id === p.id ? "bg-[#1f1144]/10" : "bg-white/10"}`}>{p.level}</span>
              </div>
              <p className={`mt-2 text-sm ${selected?.id === p.id ? "text-[#1f1144]/80" : "text-white/80"}`}>Duration: {p.duration}</p>
              <ul className={`mt-4 space-y-1 text-sm ${selected?.id === p.id ? "text-[#1f1144]/70" : "text-white/70"}`}>
                {p.topics.slice(0, 3).map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
                {p.topics.length > 3 && <li className="text-xs">+ {p.topics.length - 3} more topics</li>}
              </ul>
            </div>
            ))
          )}
        </div>

        {selected && (
          <div className="mt-8 rounded-2xl bg-white text-[#1f1144] p-6">
            <h2 className="text-2xl font-bold">Your Selected Plan: {selected.name}</h2>
            <p className="mt-2 text-[#1f1144]/80">Complete {selected.duration} of focused study covering:</p>
            <ul className="mt-4 grid sm:grid-cols-2 gap-2">
              {selected.topics.map((t, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#2ad17e]"></span>
                  {t}
                </li>
              ))}
            </ul>
            <button className="mt-6 px-5 py-3 rounded-md bg-[#3a1670] text-white font-semibold hover:opacity-90">Start Learning</button>
          </div>
        )}
      </div>
    </div>
  );
}

