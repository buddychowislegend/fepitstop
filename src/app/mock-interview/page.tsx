"use client";
import { useState } from "react";

type Slot = {
  id: string;
  date: string;
  time: string;
  type: "Automated" | "Peer";
  available: boolean;
};

const slots: Slot[] = [
  { id: "1", date: "Oct 5, 2025", time: "10:00 AM", type: "Automated", available: true },
  { id: "2", date: "Oct 5, 2025", time: "2:00 PM", type: "Peer", available: true },
  { id: "3", date: "Oct 6, 2025", time: "11:00 AM", type: "Automated", available: true },
  { id: "4", date: "Oct 6, 2025", time: "3:00 PM", type: "Peer", available: false },
];

export default function MockInterviewPage() {
  const [booked, setBooked] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Mock Interview Scheduling</h1>
        <p className="mt-2 text-white/80">Schedule mock interviews with automated or peer interviewers and get feedback.</p>

        {booked ? (
          <div className="mt-8 rounded-2xl bg-white text-[#1f1144] p-6">
            <h2 className="text-2xl font-bold">Interview Booked!</h2>
            <p className="mt-2">Your mock interview is scheduled. Check your email for details and preparation tips.</p>
            <button onClick={() => setBooked(null)} className="mt-4 px-4 py-2 rounded-md bg-[#3a1670] text-white font-semibold hover:opacity-90">
              Book Another
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {slots.map((s) => (
              <div
                key={s.id}
                className={`rounded-2xl p-6 ring-1 transition ${
                  s.available ? "bg-white/10 ring-white/15 hover:bg-white/15" : "bg-white/5 ring-white/5 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{s.date}</h3>
                    <p className="text-sm text-white/70">{s.time}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-white/10">{s.type}</span>
                </div>
                {s.available ? (
                  <button onClick={() => setBooked(s.id)} className="mt-4 px-4 py-2 rounded-md bg-white text-[#3a1670] font-semibold hover:opacity-90">
                    Book Slot
                  </button>
                ) : (
                  <button disabled className="mt-4 px-4 py-2 rounded-md bg-white/20 text-white/50 cursor-not-allowed">
                    Unavailable
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
          <h2 className="text-xl font-bold">Previous Recordings</h2>
          <p className="mt-2 text-white/80 text-sm">Review your past mock interviews and feedback.</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f131a]">
              <div>
                <p className="font-semibold">Mock Interview - Sep 28, 2025</p>
                <p className="text-xs text-white/60">Feedback: Strong technical skills, improve communication</p>
              </div>
              <button className="text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/15">Watch</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

