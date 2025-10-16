"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MockInterviewPage() {
  const router = useRouter();
  // Check if AI interview is enabled (via environment variable)
  const aiInterviewEnabled = process.env.NEXT_PUBLIC_AI_INTERVIEW_ENABLED === 'true';

  // Redirect to AI interview if enabled
  useEffect(() => {
    if (aiInterviewEnabled) {
      router.push('/ai-interview');
    }
  }, [aiInterviewEnabled, router]);

  // Show coming soon if not enabled
  if (!aiInterviewEnabled) {
    return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        {/* Coming Soon Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center ring-1 ring-white/15">
            <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Coming Soon Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30">
            🚀 Coming Soon
          </span>
                    </div>

        {/* Main Content */}
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Mock Interview Center</h1>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Practice with AI-powered interviews, schedule peer interviews, and get detailed feedback to ace your frontend interviews.
        </p>

        {/* Features Preview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          <div className="bg-white/10 rounded-2xl p-6 ring-1 ring-white/15">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">AI-Powered Interviews</h3>
            <p className="text-sm text-white/70">Practice with intelligent AI that asks relevant questions and provides detailed feedback</p>
                </div>
                
                <div className="bg-white/10 rounded-2xl p-6 ring-1 ring-white/15">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
                    </div>
            <h3 className="text-lg font-bold mb-2">Peer Interviews</h3>
            <p className="text-sm text-white/70">Schedule mock interviews with other developers and get real-world practice</p>
                  </div>
                  
                <div className="bg-white/10 rounded-2xl p-6 ring-1 ring-white/15">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
                      </div>
            <h3 className="text-lg font-bold mb-2">Detailed Analytics</h3>
            <p className="text-sm text-white/70">Track your progress with comprehensive feedback and performance analytics</p>
                    </div>
                  </div>
                  
        {/* Notify Me Button */}
        <div className="mt-12">
          <button className="px-8 py-4 rounded-lg bg-white text-[#3a1670] font-bold text-lg hover:opacity-90 transition shadow-lg">
            🔔 Notify Me When Ready
                    </button>
          <p className="text-sm text-white/60 mt-4">
            We'll email you as soon as the Mock Interview feature is available!
          </p>
        </div>
      </div>
    </div>
    );
  }

  // Loading state while redirecting in dev
  return (
    <div className="min-h-screen flex items-center justify-center text-white flex items-center justify-center">
      <p>Redirecting to AI Interview...</p>
    </div>
  );
}

