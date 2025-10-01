"use client";
import { useEffect, useState } from "react";

type Scenario = {
  id: string;
  title: string;
  description: string;
  steps: { title: string; guidance: string; complete: boolean }[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function SystemDesignPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Scenario | null>(null);
  const [steps, setSteps] = useState<Scenario["steps"]>([]);

  useEffect(() => {
    fetch(`${API_URL}/system-design`)
      .then((res) => res.json())
      .then((data) => {
        setScenarios(data.scenarios || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const startScenario = (s: Scenario) => {
    setSelected(s);
    setSteps(s.steps.map((st) => ({ ...st })));
  };

  const toggleStep = (idx: number) => {
    setSteps((prev) => prev.map((st, i) => (i === idx ? { ...st, complete: !st.complete } : st)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">System Design Simulator</h1>
        <p className="mt-2 text-white/80">Step-by-step interactive scenarios to design scalable UI components and apps.</p>

        {!selected ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {loading ? (
              <p className="text-white/60 col-span-2">Loading scenarios...</p>
            ) : (
              scenarios.map((s) => (
                <div key={s.id} className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15 hover:bg-white/15 transition">
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-white/80">{s.description}</p>
                  <button onClick={() => startScenario(s)} className="mt-4 px-4 py-2 rounded-md bg-white text-[#3a1670] font-semibold hover:opacity-90">
                    Start Scenario
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="mt-8">
            <button onClick={() => setSelected(null)} className="text-sm text-white/80 hover:text-white mb-4">
              ← Back to scenarios
            </button>
            <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
              <h2 className="text-2xl font-bold">{selected.title}</h2>
              <p className="mt-2 text-white/80">{selected.description}</p>
              <div className="mt-6 space-y-4">
                {steps.map((st, idx) => (
                  <div key={idx} className="rounded-lg bg-[#0f131a] p-4 ring-1 ring-white/10">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={st.complete} onChange={() => toggleStep(idx)} className="mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{st.title}</h4>
                        <p className="mt-1 text-sm text-white/70">{st.guidance}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-sm text-white/60">
                Completed: {steps.filter((s) => s.complete).length} / {steps.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
