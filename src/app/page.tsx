import Image from "next/image";
import Link from "next/link";
import AdSense from "@/components/AdSense";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="card p-8">
        {/* Top Banner Ad */}
 
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="py-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/15">Interactive</div>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Master Frontend Interviews with <span className="text-[#ffb21e]">Real</span> Questions
            </h1>
            <p className="mt-5 text-white/80 text-base sm:text-lg max-w-xl">
              Practice frontend interview questions from top tech companies. Code in our interactive editor and ace your next interview.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link 
                href="/problems"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2ad17e] text-[#0e1a12] px-5 py-3 font-semibold hover:opacity-95 transition"
              >
                <span>Start Practicing</span>
                <span>→</span>
              </Link>
              <Link 
                href="/problems"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-5 py-3 font-semibold text-white hover:bg-white/10 transition"
              >
                View Questions
                <span>📝</span>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#2ad17e]"></span>500+ Questions</div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#5cd3ff]"></span>50+ Companies</div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-white/70"></span>Live Code Editor</div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl bg-[#151a24] ring-1 ring-white/10 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0f131a] border-b border-white/5 text-white/70 text-sm">
                <span className="h-3 w-3 rounded-full bg-[#ff5f56]"></span>
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]"></span>
                <span className="h-3 w-3 rounded-full bg-[#27c93f]"></span>
                <span className="ml-3">code-editor.js</span>
              </div>
              <pre className="p-5 text-sm leading-6 text-white/90 overflow-x-auto"><code>{`function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}`}</code></pre>
            </div>
          </div>
        </section>

        {/* Platform Features Section */}
        <section className="mt-20 sm:mt-24">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Explore All Features</h2>
            <p className="mt-3 text-white/80 max-w-3xl mx-auto">
              Everything you need to ace your frontend interviews in one platform
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Problems */}
            <a href="/problems" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
              <div className="h-11 w-11 rounded-xl bg-[#6f5af6]/15 flex items-center justify-center">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Problems</h3>
              <p className="mt-2 text-white/70">
                500+ curated frontend interview questions with interactive code editor
              </p>
            </a>

            {/* System Design */}
            <a href="/system-design" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
              <div className="h-11 w-11 rounded-xl bg-[#20c997]/15 flex items-center justify-center">
                <span className="text-2xl">🏗️</span>
              </div>
              <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">System Design</h3>
              <p className="mt-2 text-white/70">
                Step-by-step scenarios to design scalable UI components and apps
              </p>
            </a>

            {/* Prep Plans */}
            <a href="/prep-plans" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
              <div className="h-11 w-11 rounded-xl bg-[#f59f00]/15 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Prep Plans</h3>
              <p className="mt-2 text-white/70">
                Personalized study plans based on your level and target companies
              </p>
            </a>

            {/* Community */}
            <a href="/community" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
              <div className="h-11 w-11 rounded-xl bg-[#5cd3ff]/15 flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Community</h3>
              <p className="mt-2 text-white/70">
                Share solutions, discuss approaches, and learn from peers
              </p>
            </a>

            {/* Progress & Leaderboard */}
            <a href="/progress" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
              <div className="h-11 w-11 rounded-xl bg-[#2ad17e]/15 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Progress Tracking</h3>
              <p className="mt-2 text-white/70">
                Track your journey, earn achievements, and compete on leaderboards
              </p>
            </a>

            {/* Quiz */}
            <a href="/quiz" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
              <div className="h-11 w-11 rounded-xl bg-[#ff6b6b]/15 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Quiz & Trivia</h3>
              <p className="mt-2 text-white/70">
                Quick revision sessions with JS, CSS, and HTML questions
              </p>
            </a>

            {/* Mock Interview */}
            <a href="/mock-interview" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
              <div className="h-11 w-11 rounded-xl bg-[#a78bfa]/15 flex items-center justify-center">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Mock Interviews</h3>
              <p className="mt-2 text-white/70">
                Schedule practice interviews and get targeted feedback
              </p>
            </a>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="mt-20 sm:mt-24">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Why Frontend Pitstop?</h2>
            <p className="mt-3 text-white/80 max-w-3xl mx-auto">
              Our platform provides comprehensive preparation tools for frontend engineering interviews
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl bg-white text-[#0f1720] p-6 sm:p-7 shadow-xl ring-1 ring-black/5 transition transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 [animation:fadeUp_700ms_ease-out_0ms_both]">
              <div className="h-11 w-11 rounded-xl bg-[#6f5af6]/15 flex items-center justify-center">
                <span className="text-xl">?</span>
              </div>
              <h3 className="mt-4 text-xl font-bold">Real Interview Questions</h3>
              <p className="mt-2 text-[#415466]">
                Practice with actual questions asked at Google, Meta, Amazon, and other top tech companies.
              </p>
              <ul className="mt-4 space-y-2 text-[#0f1720]">
                <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>JavaScript fundamentals</li>
                <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>React & Vue.js</li>
                <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>CSS & HTML challenges</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl bg-white text-[#0f1720] p-6 sm:p-7 shadow-xl ring-1 ring-black/5 transition transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 [animation:fadeUp_700ms_ease-out_120ms_both]">
              <div className="h-11 w-11 rounded-xl bg-[#20c997]/15 flex items-center justify-center">
                <span className="text-xl">{`</>`}</span>
              </div>
              <h3 className="mt-4 text-xl font-bold">Interactive Code Editor</h3>
              <p className="mt-2 text-[#415466]">
                Write, test, and debug your solutions in our powerful browser-based code editor.
              </p>
              <ul className="mt-4 space-y-2 text-[#0f1720]">
                <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Syntax highlighting</li>
                <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Auto-completion</li>
                <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Live preview</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl bg-white text-[#0f1720] p-6 sm:p-7 shadow-xl ring-1 ring-black/5 transition transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 [animation:fadeUp_700ms_ease-out_240ms_both]">
              <div className="h-11 w-11 rounded-xl bg-[#f59f00]/15 flex items-center justify-center">
                <span className="text-xl">#</span>
              </div>
              <h3 className="mt-4 text-xl font-bold">Company-Specific Prep</h3>
              <p className="mt-2 text-[#415466]">
                Filter questions by company and round to focus your prep effectively.
              </p>
              <ul className="mt-4 space-y-2 text-[#0f1720]">
                <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>50+ tech companies</li>
                <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Round-wise questions</li>
                <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Difficulty levels</li>
              </ul>
            </div>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}