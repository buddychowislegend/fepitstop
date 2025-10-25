"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HiringLanding() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/hiring/dashboard');
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-6xl">
        <motion.div 
          className="bg-[#0f1720] rounded-2xl p-8 shadow-2xl ring-1 ring-white/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
      {/* NAVIGATION BAR */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-white/10">
        <div className="text-2xl font-bold text-[#5b8cff]">HireOG</div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-white/70">
          <a href="#how" className="hover:text-[#5b8cff] transition">How It Works</a>
          <a href="#features" className="hover:text-[#5b8cff] transition">Features</a>
          <a href="#faq" className="hover:text-[#5b8cff] transition">FAQ</a>
          <a href="#contact" className="hover:text-[#5b8cff] transition">Contact</a>
        </nav>
        <div className="flex gap-3">
          <button 
            onClick={handleLogin}
            className="border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 transition"
          >
            Log in
          </button>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-extrabold leading-tight text-white">
          Shortlist Smarter with <span className="text-[#5b8cff]">HireOG</span>
          </h1>
        <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
          Say goodbye to manual screening. Identify top talent effortlessly with AI-powered
          video interviews and behavioral analytics.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button onClick={() => window.open("https://forms.gle/s8ACQQC4LgdK2SQX6", '_blank') } className="bg-[#5b8cff] text-white font-semibold px-6 py-3 rounded-lg shadow hover:opacity-95 transition">
            Book a Demo
          </button>
          {/* <button className="border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition">
            Watch Product Video
          </button> */}
            </div>
        <p className="text-sm text-white/60 mt-6">Trusted by 100+ hiring teams and agencies</p>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how" className="py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">How HireOG Works</h2>
        <p className="text-white/80 max-w-2xl mx-auto mb-12">
          Streamline your recruitment process in just 4 simple steps.
        </p>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto px-6">
          <motion.div 
            className="bg-[color:var(--surface)] p-6 rounded-xl border border-[color:var(--border)] hover:bg-white/15 transition group"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <h4 className="font-semibold text-[#5b8cff] mb-2">1️⃣ Create Roles</h4>
            <p className="text-white/70 text-sm">
              Define job roles and select competencies for automated AI interviews.
            </p>
          </motion.div>
          <motion.div 
            className="bg-[color:var(--surface)] p-6 rounded-xl border border-[color:var(--border)] hover:bg-white/15 transition group"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <h4 className="font-semibold text-[#5b8cff] mb-2">2️⃣ Invite Candidates</h4>
            <p className="text-white/70 text-sm">
              Share interview links or connect via ATS — no scheduling hassles.
            </p>
          </motion.div>
          <motion.div 
            className="bg-[color:var(--surface)] p-6 rounded-xl border border-[color:var(--border)] hover:bg-white/15 transition group"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <h4 className="font-semibold text-[#5b8cff] mb-2">3️⃣ AI Evaluation</h4>
            <p className="text-white/70 text-sm">
              Get detailed insights on communication, confidence, and skill fit.
            </p>
          </motion.div>
          <motion.div 
            className="bg-[color:var(--surface)] p-6 rounded-xl border border-[color:var(--border)] hover:bg-white/15 transition group"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <h4 className="font-semibold text-[#5b8cff] mb-2">4️⃣ Hire Faster</h4>
            <p className="text-white/70 text-sm">
              Make data-backed decisions with ranked candidate summaries.
            </p>
          </motion.div>
            </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Why HireOG Stands Out</h3>
          <p className="text-white/80 max-w-2xl mx-auto mb-12">
            Beyond screening — experience structured interviews, actionable analytics, and seamless integration with your favorite tools.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div 
              className="bg-[color:var(--surface)] p-6 rounded-xl border border-[color:var(--border)] hover:bg-white/15 transition group"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <h4 className="font-semibold text-[#5b8cff] mb-2">🎙️ AI Video Interviews</h4>
              <p className="text-white/70 text-sm">
                Candidates engage in realistic video interviews that measure communication and clarity.
              </p>
            </motion.div>
            <motion.div 
              className="bg-[color:var(--surface)] p-6 rounded-xl border border-[color:var(--border)] hover:bg-white/15 transition group"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <h4 className="font-semibold text-[#5b8cff] mb-2">📊 Smart Analytics</h4>
              <p className="text-white/70 text-sm">
                Access instant dashboards with confidence scores, insights, and rankings.
              </p>
            </motion.div>
            <motion.div 
              className="bg-[color:var(--surface)] p-6 rounded-xl border border-[color:var(--border)] hover:bg-white/15 transition group"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <h4 className="font-semibold text-[#5b8cff] mb-2">⚙️ Seamless ATS Integration</h4>
              <p className="text-white/70 text-sm">
                Sync candidate data automatically with Greenhouse, Lever, or your existing ATS.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      {/* <section id="testimonials" className="py-20 text-center">
        <h4 className="text-3xl font-bold text-white mb-10">What Our Clients Say</h4>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
          <motion.div 
            className="bg-[color:var(--surface)] p-6 rounded-xl border border-[color:var(--border)] hover:bg-white/15 transition group"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <p className="text-white/70 italic mb-4">
              "HireOG helped us screen 500+ candidates in two days. We only met the top 10% — our process is twice as fast now."
            </p>
            <h5 className="font-semibold text-[#5b8cff]">Priya Mehta</h5>
            <p className="text-sm text-white/60">HR Head, Finserve India</p>
          </motion.div>
          <motion.div 
            className="bg-[color:var(--surface)] p-6 rounded-xl border border-[color:var(--border)] hover:bg-white/15 transition group"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <p className="text-white/70 italic mb-4">
              "The AI-generated reports give us deeper visibility into candidate soft skills than ever before."
            </p>
            <h5 className="font-semibold text-[#5b8cff]">Ankit Sharma</h5>
            <p className="text-sm text-white/60">Recruitment Lead, TechWorks</p>
          </motion.div>
          <motion.div 
            className="bg-[color:var(--surface)] p-6 rounded-xl border border-[color:var(--border)] hover:bg-white/15 transition group"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <p className="text-white/70 italic mb-4">
              "Our clients appreciate how structured and unbiased our hiring recommendations have become with HireOG."
            </p>
            <h5 className="font-semibold text-[#5b8cff]">Riya Patel</h5>
            <p className="text-sm text-white/60">Director, Talent Agency</p>
          </motion.div>
        </div>
      </section> */}

      {/* FAQ SECTION */}
      <section id="faq" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h4 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h4>
          <div className="space-y-6 text-white/80">
            <motion.div 
              className="bg-[color:var(--surface)] p-6 rounded-xl border border-[color:var(--border)] hover:bg-white/15 transition group"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              whileHover={{ y: -2, scale: 1.01 }}
            >
              <h5 className="font-semibold text-[#5b8cff] mb-2">How does the AI interviewer work?</h5>
              <p className="text-white/70">The AI interviewer simulates structured conversations, evaluating tone, clarity, and confidence in real time.</p>
            </motion.div>
            <motion.div 
              className="bg-[color:var(--surface)] p-6 rounded-xl border border-[color:var(--border)] hover:bg-white/15 transition group"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              whileHover={{ y: -2, scale: 1.01 }}
            >
              <h5 className="font-semibold text-[#5b8cff] mb-2">What types of roles can HireOG assess?</h5>
              <p className="text-white/70">HireOG supports diverse roles across tech, product, sales, and operations — from campus to senior leadership.</p>
            </motion.div>
            <motion.div 
              className="bg-[color:var(--surface)] p-6 rounded-xl border border-[color:var(--border)] hover:bg-white/15 transition group"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              whileHover={{ y: -2, scale: 1.01 }}
            >
              <h5 className="font-semibold text-[#5b8cff] mb-2">Does it integrate with our existing tools?</h5>
              <p className="text-white/70">Yes, HireOG integrates with leading ATS platforms like Greenhouse, Lever, and Zoho.</p>
            </motion.div>
            <motion.div 
              className="bg-[color:var(--surface)] p-6 rounded-xl border border-[color:var(--border)] hover:bg-white/15 transition group"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              whileHover={{ y: -2, scale: 1.01 }}
            >
              <h5 className="font-semibold text-[#5b8cff] mb-2">How accurate is the AI evaluation?</h5>
              <p className="text-white/70">Our models are trained with diverse datasets ensuring fairness and reliability in every evaluation.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="contact" className="bg-gradient-to-r from-[#5b8cff] to-[#a855f7] py-20 text-center text-white">
        <h5 className="text-3xl font-bold mb-4">Hire Faster. Hire Smarter. Hire with HireOG.</h5>
        <p className="text-white/90 max-w-xl mx-auto mb-8">
          Join recruiters and agencies automating their first-round interviews and improving hiring efficiency.
        </p>
        <button onClick={() => window.open("https://forms.gle/s8ACQQC4LgdK2SQX6", '_blank') } className="bg-[#5b8cff] text-white font-semibold px-6 py-3 rounded-lg shadow hover:opacity-95 transition">
            Book a Demo
          </button>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-sm text-white/70">
       
      
    
          <div>
            <h6 className="text-[#5b8cff] font-semibold mb-3">Contact</h6>
            <p>hello@hireog.com</p>
          </div>
        </div>
        <div className="mt-10 text-center text-white/50 text-sm">
          © {new Date().getFullYear()} HireOG. All rights reserved.
        </div>
      </footer>
        </motion.div>
      </div>
    </motion.div>
  );
}