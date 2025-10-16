"use client";

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="card p-8 text-center">
        {/* Coming Soon Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center ring-1 ring-white/15">
            <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
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
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Community Solutions & Discussions</h1>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Connect with fellow developers, share solutions, ask questions, and learn from the community's collective knowledge.
        </p>

        {/* Features Preview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          <div className="bg-[color:var(--surface)] rounded-2xl p-6 border border-[color:var(--border)]">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Verified Solutions</h3>
            <p className="text-sm text-white/70">Browse community-verified solutions with detailed explanations and best practices</p>
          </div>

          <div className="bg-[color:var(--surface)] rounded-2xl p-6 border border-[color:var(--border)]">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Live Discussions</h3>
            <p className="text-sm text-white/70">Engage in real-time discussions about coding challenges and best practices</p>
          </div>

          <div className="bg-[color:var(--surface)] rounded-2xl p-6 border border-[color:var(--border)]">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Expert Mentorship</h3>
            <p className="text-sm text-white/70">Get guidance from experienced developers and industry professionals</p>
          </div>

          <div className="bg-[color:var(--surface)] rounded-2xl p-6 border border-[color:var(--border)]">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Code Reviews</h3>
            <p className="text-sm text-white/70">Submit your solutions for peer review and constructive feedback</p>
          </div>

          <div className="bg-[color:var(--surface)] rounded-2xl p-6 border border-[color:var(--border)]">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Community Voting</h3>
            <p className="text-sm text-white/70">Vote on the best solutions and help the community identify quality content</p>
          </div>

          <div className="bg-[color:var(--surface)] rounded-2xl p-6 border border-[color:var(--border)]">
            <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Learning Paths</h3>
            <p className="text-sm text-white/70">Follow curated learning paths created by the community and experts</p>
          </div>
        </div>

        {/* Notify Me Button */}
        <div className="mt-12">
          <button className="px-8 py-4 rounded-lg bg-white text-[#3a1670] font-bold text-lg hover:opacity-90 transition shadow-lg">
            🔔 Notify Me When Ready
          </button>
          <p className="text-sm text-white/60 mt-4">
            We'll email you as soon as the Community Discussion feature is available!
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
