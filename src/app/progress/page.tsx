"use client";

type User = {
  rank: number;
  name: string;
  solved: number;
  streak: number;
};

const leaderboard: User[] = [
  { rank: 1, name: "code_master", solved: 145, streak: 23 },
  { rank: 2, name: "js_wizard", solved: 132, streak: 18 },
  { rank: 3, name: "react_pro", solved: 128, streak: 15 },
  { rank: 4, name: "dev_ninja", solved: 119, streak: 12 },
  { rank: 5, name: "frontend_ace", solved: 107, streak: 10 },
];

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Progress Tracking & Leaderboards</h1>
        <p className="mt-2 text-white/80">Track your journey, earn achievements, and compete with peers.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
            <h3 className="text-sm uppercase tracking-wide text-white/60">Problems Solved</h3>
            <p className="mt-2 text-4xl font-extrabold">42</p>
            <p className="mt-1 text-sm text-white/70">Keep it up!</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
            <h3 className="text-sm uppercase tracking-wide text-white/60">Current Streak</h3>
            <p className="mt-2 text-4xl font-extrabold">7 days</p>
            <p className="mt-1 text-sm text-white/70">🔥 On fire!</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
            <h3 className="text-sm uppercase tracking-wide text-white/60">Rank</h3>
            <p className="mt-2 text-4xl font-extrabold">#42</p>
            <p className="mt-1 text-sm text-white/70">Top 10% globally</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold">Weekly Leaderboard</h2>
          <div className="mt-4 rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-white/60 border-b border-white/10">
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">User</th>
                  <th className="pb-2">Solved</th>
                  <th className="pb-2">Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((u) => (
                  <tr key={u.rank} className="border-b border-white/5">
                    <td className="py-3">#{u.rank}</td>
                    <td className="py-3 font-semibold">{u.name}</td>
                    <td className="py-3">{u.solved}</td>
                    <td className="py-3">{u.streak} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

