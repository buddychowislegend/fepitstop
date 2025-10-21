"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Target, Brain, ClipboardList } from "lucide-react";

export default function NewLandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="bg-[#0f1720] rounded-2xl p-8 shadow-2xl ring-1 ring-white/10">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-sky-500 rounded-md flex items-center justify-center text-white font-bold text-lg">OG</div>
            <div>
              <h1 className="font-semibold text-lg tracking-tight">HireOG</h1>
              <p className="text-xs text-slate-500">AI Interview & Career Growth Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#why" className="hover:text-indigo-600 transition">Why</a>
            <a href="#features" className="hover:text-indigo-600 transition">Features</a>
            <a href="#how" className="hover:text-indigo-600 transition">How</a>
            <a href="#tools" className="hover:text-indigo-600 transition">Tools</a>
            <a href="#scenarios" className="hover:text-indigo-600 transition">Roles</a>
            <a href="#reviews" className="hover:text-indigo-600 transition">Reviews</a>
            <a href="#faq" className="hover:text-indigo-600 transition">FAQ</a>
            <a href="/signin" className="px-3 py-2 bg-white rounded-md border border-slate-200 hover:bg-slate-100">Log in</a>
            <a href="/signup" className="px-3 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 flex items-center gap-2">Get Started <ArrowRight size={14} /></a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="grid lg:grid-cols-2 gap-10 items-center">
        <div className="py-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/15">Interactive</div>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            Turn Anxiety into <span className="text-[#ffb21e]">Confidence</span>
          </h1>
          <p className="mt-5 text-white/80 text-base sm:text-lg max-w-xl">
            Practice role-specific interviews, get AI feedback on clarity & confidence, and improve with targeted learning — all in one place.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a 
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2ad17e] text-[#0e1a12] px-5 py-3 font-semibold hover:opacity-95 transition"
            >
              <span>Start Free Practice</span>
              <span>→</span>
            </a>
            <a 
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-5 py-3 font-semibold text-white hover:bg-white/10 transition"
            >
              How it works
              <span>📝</span>
            </a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#2ad17e]"></span>AI Feedback</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#5cd3ff]"></span>Role-Specific</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-white/70"></span>Confidence Building</div>
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-2xl bg-[#151a24] ring-1 ring-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#0f131a] border-b border-white/5 text-white/70 text-sm">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]"></span>
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]"></span>
              <span className="h-3 w-3 rounded-full bg-[#27c93f]"></span>
              <span className="ml-3">ai-interview.js</span>
            </div>
            <pre className="p-5 text-sm leading-6 text-white/90 overflow-x-auto"><code>{`function analyzeInterview() {
  const feedback = {
    confidence: "High",
    clarity: "Clear",
    tone: "Professional"
  };
  return feedback;
}`}</code></pre>
          </div>
        </div>
      </section>

      {/* WHY HIREOG */}
      <section className="mt-20 sm:mt-24">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Why Job Seekers Love HireOG</h2>
          <p className="mt-3 text-white/80 max-w-3xl mx-auto">
            Our platform provides comprehensive preparation tools for interview success
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#6f5af6]/15 flex items-center justify-center">
              <Target className="w-6 h-6 text-[#6f5af6]" />
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Identify Hidden Gaps</h3>
            <p className="mt-2 text-white/70">
              Our AI finds communication, technical or confidence issues you can fix quickly.
            </p>
            <ul className="mt-4 space-y-2 text-white/80">
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Communication analysis</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Confidence tracking</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Technical assessment</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#20c997]/15 flex items-center justify-center">
              <Brain className="w-6 h-6 text-[#20c997]" />
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Personalized Practice</h3>
            <p className="mt-2 text-white/70">
              Simulate real interviews for your role with adaptive questions and instant AI feedback.
            </p>
            <ul className="mt-4 space-y-2 text-white/80">
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Role-specific questions</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Adaptive difficulty</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Instant feedback</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#f59f00]/15 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-[#f59f00]" />
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Data-Driven Confidence</h3>
            <p className="mt-2 text-white/70">
              Track growth with visual dashboards and AI-generated progress reports.
            </p>
            <ul className="mt-4 space-y-2 text-white/80">
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Progress tracking</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Performance analytics</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Growth insights</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mt-20 sm:mt-24">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Powerful AI Features</h2>
          <p className="mt-3 text-white/80 max-w-3xl mx-auto">
            Everything you need to ace your interviews in one platform
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* AI Interview Feedback */}
          <a href="/ai-interview" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#6f5af6]/15 flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">AI Interview Feedback</h3>
            <p className="mt-2 text-white/70">
              Tone, pacing, clarity, facial cues, and confidence — analyzed instantly by AI.
            </p>
          </a>

          {/* Role-Specific Questions */}
          <a href="/prep-plans" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#20c997]/15 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Role-Specific Questions</h3>
            <p className="mt-2 text-white/70">
              Curated prompts for software, product, sales, and marketing roles.
            </p>
          </a>

          {/* Performance Analytics */}
          <a href="/progress" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#2ad17e]/15 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Performance Analytics</h3>
            <p className="mt-2 text-white/70">
              Measure improvement across communication, accuracy, and confidence.
            </p>
          </a>

          {/* Mock Interviews */}
          <a href="/mock-interview" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#a78bfa]/15 flex items-center justify-center">
              <span className="text-2xl">🎤</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Mock Interviews</h3>
            <p className="mt-2 text-white/70">
              Schedule practice interviews and get targeted feedback
            </p>
          </a>

          {/* Resume Builder */}
          <a href="/resume" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#f59f00]/15 flex items-center justify-center">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">AI Resume Builder</h3>
            <p className="mt-2 text-white/70">
              Create polished, ATS-friendly resumes in minutes with tailored suggestions.
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
        </div>
      </section>

      {/* FREE TOOLS */}
      <section className="mt-20 sm:mt-24">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Free AI Career Tools</h2>
          <p className="mt-3 text-white/80 max-w-3xl mx-auto">
            Create professional resumes and cover letters, then simulate job-specific interviews with AI feedback.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* AI Resume Builder */}
          <a href="/resume" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#6f5af6]/15 flex items-center justify-center">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">AI Resume Builder</h3>
            <p className="mt-2 text-white/70">
              Create polished, ATS-friendly resumes in minutes with tailored suggestions.
            </p>
          </a>

          {/* AI Cover Letter Generator */}
          <a href="/cover-letter" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#f59f00]/15 flex items-center justify-center">
              <span className="text-2xl">✍️</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">AI Cover Letter Generator</h3>
            <p className="mt-2 text-white/70">
              Instantly craft professional cover letters aligned with your target job.
            </p>
          </a>

          {/* JD-Based Interview Simulator */}
          <a href="/ai-interview" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#5cd3ff]/15 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">JD-Based Interview Simulator</h3>
            <p className="mt-2 text-white/70">
              Upload your resume and job description to simulate realistic interviews.
            </p>
          </a>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-20 sm:mt-24">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How HireOG Works</h2>
          <p className="mt-3 text-white/80 max-w-3xl mx-auto">
            Simple steps to transform your interview performance
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#6f5af6]/15 flex items-center justify-center">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Record</h3>
            <p className="mt-2 text-white/70">
              Answer role-driven prompts in a relaxed, asynchronous environment.
            </p>
            <ul className="mt-4 space-y-2 text-white/80">
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Video recording</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Audio analysis</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Confidence tracking</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#20c997]/15 flex items-center justify-center">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Analyze</h3>
            <p className="mt-2 text-white/70">
              AI pinpoints content & delivery gaps — tone, confidence, and technical depth.
            </p>
            <ul className="mt-4 space-y-2 text-white/80">
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Tone analysis</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Content gaps</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Technical depth</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#f59f00]/15 flex items-center justify-center">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Improve</h3>
            <p className="mt-2 text-white/70">
              Follow guided AI exercises, short learning resources, and retake simulations until you're ready.
            </p>
            <ul className="mt-4 space-y-2 text-white/80">
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Guided exercises</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Learning resources</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2ad17e]"></span>Practice simulations</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ROLES & SCENARIOS */}
      <section className="mt-20 sm:mt-24">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Preparation for Every Role</h2>
          <p className="mt-3 text-white/80 max-w-3xl mx-auto">
            Whether you're a developer debugging your problem-solving flow, a PM practicing roadmap storytelling, or sales refining pitch delivery — HireOG provides role-specific simulations, feedback, and exercises that map directly to what employers evaluate.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Software Dev */}
          <a href="/prep-plans" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#6f5af6]/15 flex items-center justify-center">
              <span className="text-2xl">💻</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Software Dev</h3>
            <p className="mt-2 text-white/70">
              Technical interviews, coding challenges, and system design practice
            </p>
          </a>

          {/* Product Manager */}
          <a href="/prep-plans" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#20c997]/15 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Product Manager</h3>
            <p className="mt-2 text-white/70">
              Product strategy, roadmap planning, and stakeholder management
            </p>
          </a>

          {/* Sales & Biz */}
          <a href="/prep-plans" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#f59f00]/15 flex items-center justify-center">
              <span className="text-2xl">💼</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Sales & Biz</h3>
            <p className="mt-2 text-white/70">
              Pitch delivery, negotiation skills, and business strategy
            </p>
          </a>

          {/* Data */}
          <a href="/prep-plans" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#5cd3ff]/15 flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Data</h3>
            <p className="mt-2 text-white/70">
              Analytics, machine learning, and data science interviews
            </p>
          </a>

          {/* Operations */}
          <a href="/prep-plans" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#2ad17e]/15 flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">Operations</h3>
            <p className="mt-2 text-white/70">
              Process optimization, team management, and efficiency
            </p>
          </a>

          {/* HR */}
          <a href="/prep-plans" className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <div className="h-11 w-11 rounded-xl bg-[#a78bfa]/15 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="mt-4 text-xl font-bold group-hover:text-[#ffb21e] transition">HR</h3>
            <p className="mt-2 text-white/70">
              Talent acquisition, employee relations, and organizational development
            </p>
          </a>
        </div>

        <div className="mt-10 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/prep-plans" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2ad17e] text-[#0e1a12] px-5 py-3 font-semibold hover:opacity-95 transition">
              <span>Start Preparation</span>
              <span>→</span>
            </a>
            <a href="/ai-interview" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-5 py-3 font-semibold text-white hover:bg-white/10 transition">
              Try AI Interview
              <span>🎯</span>
            </a>
          </div>
          <p className="text-sm text-white/60 mt-4">Role packs include 50+ scenario prompts, targeted feedback points, and short micro-lessons to close gaps fast.</p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mt-20 sm:mt-24">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">What Our Users Say</h2>
          <p className="mt-3 text-white/80 max-w-3xl mx-auto">
            Join thousands of candidates who built their confidence and got hired with HireOG
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Testimonial 1 */}
          <div className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <p className="text-white/70 italic mb-4">"HireOG gave me the clarity and confidence I needed. I aced my next three interviews effortlessly!"</p>
            <p className="font-semibold text-white group-hover:text-[#ffb21e] transition">— Rohit, Software Engineer</p>
          </div>

          {/* Testimonial 2 */}
          <div className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <p className="text-white/70 italic mb-4">"AI insights helped me fix communication gaps I wasn't even aware of. This platform truly works!"</p>
            <p className="font-semibold text-white group-hover:text-[#ffb21e] transition">— Priya, Product Manager</p>
          </div>

          {/* Testimonial 3 */}
          <div className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <p className="text-white/70 italic mb-4">"Within two weeks, I went from anxious to assured — and landed my dream role in fintech!"</p>
            <p className="font-semibold text-white group-hover:text-[#ffb21e] transition">— Ankit, Sales Professional</p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="mt-20 sm:mt-24 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Transform Your Interview Performance?</h2>
          <p className="text-lg mb-8 text-white/80">Join thousands of candidates who built their confidence and got hired with HireOG.</p>
          <a href="/signup" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2ad17e] text-[#0e1a12] px-6 py-3 font-semibold hover:opacity-95 transition">
            <span>Start Free Practice Now</span>
            <span>→</span>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-20 sm:mt-24">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          <p className="mt-3 text-white/80 max-w-3xl mx-auto">
            Everything you need to know about HireOG
          </p>
        </div>

        <div className="mt-10 max-w-3xl mx-auto space-y-4">
          <details className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <summary className="font-medium cursor-pointer text-white hover:text-[#ffb21e] transition">Is HireOG free to use?</summary>
            <p className="text-white/70 mt-3">Yes, you can start practicing for free. Advanced analytics and recruiter features are part of premium plans.</p>
          </details>

          <details className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <summary className="font-medium cursor-pointer text-white hover:text-[#ffb21e] transition">How accurate is AI feedback?</summary>
            <p className="text-white/70 mt-3">Our models use NLP, speech and vision AI to provide reliable, bias-aware assessments for each response.</p>
          </details>

          <details className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <summary className="font-medium cursor-pointer text-white hover:text-[#ffb21e] transition">Can I use HireOG for specific roles?</summary>
            <p className="text-white/70 mt-3">Yes! Practice tailored interviews for Software, Product, Sales, Marketing, Operations and more.</p>
          </details>

          <details className="rounded-2xl bg-[color:var(--surface)] p-6 border border-[color:var(--border)] hover:bg-white/15 transition group">
            <summary className="font-medium cursor-pointer text-white hover:text-[#ffb21e] transition">Will HireOG help me find a job?</summary>
            <p className="text-white/70 mt-3">HireOG partners with recruiters to connect job-ready candidates with real opportunities and provides shareable scorecards.</p>
          </details>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-20 sm:mt-24 bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold text-white mb-3">About HireOG</h4>
            <p className="text-sm">HireOG helps candidates overcome interview anxiety and build confidence with AI-powered insights, tools, and learning resources.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:underline">About Us</a></li>
              <li><a href="/contact" className="hover:underline">Contact</a></li>
              <li><a href="/blog" className="hover:underline">Blog</a></li>
              <li><a href="/faq" className="hover:underline">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: <a href="mailto:support@hireog.com" className="hover:underline">support@hireog.com</a></li>
              <li>Address: Bengaluru, India</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">LinkedIn</a>
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">Instagram</a>
            </div>
          </div>
        </div>
        <div className="mt-10 text-center text-xs text-slate-500 border-t border-slate-700 pt-6">© 2025 HireOG — All rights reserved.</div>
      </footer>
        </div>
      </div>
    </div>
  );
}