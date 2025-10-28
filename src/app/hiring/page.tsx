"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, useAnimation } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HiringLanding() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -25]);

  const handleLogin = () => {
    router.push('/hiring/signin');
  };

  // Mouse move handler for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#5b8cff]/20 to-[#a855f7]/20 rounded-full blur-3xl"
          animate={{ 
            x: mousePosition.x * 0.2,
            y: mousePosition.y * 0.2,
            scale: [1, 1.2, 1],
            rotate: 360
          }}
          transition={{ 
            x: { type: "spring", stiffness: 50 },
            y: { type: "spring", stiffness: 50 },
            scale: { duration: 8, repeat: Infinity },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-[#22d3ee]/30 to-[#5b8cff]/30 rounded-full blur-2xl"
          animate={{ 
            x: -mousePosition.x * 0.15,
            y: -mousePosition.y * 0.15,
            scale: [1.2, 1, 1.2]
          }}
          transition={{ 
            x: { type: "spring", stiffness: 40 },
            y: { type: "spring", stiffness: 40 },
            scale: { duration: 6, repeat: Infinity }
          }}
        />
        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
      {/* NAVIGATION BAR */}
      <motion.header 
        className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center backdrop-blur-sm bg-white/5 border-b border-white/10 rounded-b-2xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div 
          className="text-2xl font-bold bg-gradient-to-r from-[#5b8cff] to-[#a855f7] bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          HireOG
        </motion.div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-white/70">
          {['How It Works', 'Features', 'FAQ', 'Contact'].map((item, index) => (
            <motion.a 
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`} 
              className="hover:text-[#5b8cff] transition-colors relative group"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index + 0.5 }}
            >
              {item}
              <motion.div 
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#5b8cff] to-[#a855f7] group-hover:w-full transition-all duration-300"
              />
            </motion.a>
          ))}
        </nav>
        <motion.div 
          className="flex gap-3"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button 
            onClick={handleLogin}
            className="border border-white/20 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            whileHover={{ scale: 1.05, borderColor: 'rgba(91, 140, 255, 0.5)' }}
            whileTap={{ scale: 0.95 }}
          >
            Log in
          </motion.button>
        </motion.div>
      </motion.header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center relative">
        {/* Animated Hero Illustration */}
        <motion.div 
          className="absolute top-10 right-10 hidden lg:block"
          style={{ y: y1 }}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200" className="text-[#5b8cff]/30">
            <motion.circle 
              cx="100" cy="100" r="80" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeDasharray="10 5"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.rect 
              x="80" y="80" width="40" height="40" 
              fill="currentColor" 
              rx="8"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
        </motion.div>

        <motion.div 
          className="absolute top-20 left-10 hidden lg:block"
          style={{ y: y2 }}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          <svg width="150" height="150" viewBox="0 0 150 150" className="text-[#a855f7]/20">
            <motion.path 
              d="M75 25 L125 125 L25 125 Z" 
              fill="currentColor" 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1 
            className="text-6xl md:text-7xl font-extrabold leading-tight text-white mb-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Shortlist Smarter with{' '}
            <motion.span 
              className="bg-gradient-to-r from-[#5b8cff] via-[#22d3ee] to-[#a855f7] bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              HireOG
            </motion.span>
          </motion.h1>
        </motion.div>

        <motion.p 
          className="mt-6 text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Say goodbye to manual screening. Identify top talent effortlessly with{' '}
          <motion.span 
            className="text-[#22d3ee] font-semibold"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            AI-powered video interviews
          </motion.span>{' '}
          and behavioral analytics.
        </motion.p>

        <motion.div 
          className="mt-12 flex flex-wrap justify-center gap-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.button 
            onClick={() => window.open("https://forms.gle/s8ACQQC4LgdK2SQX6", '_blank')} 
            className="bg-gradient-to-r from-[#5b8cff] to-[#a855f7] text-white font-bold px-8 py-4 rounded-2xl shadow-2xl text-lg relative overflow-hidden group"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-[#22d3ee] to-[#5b8cff] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <span className="relative z-10">Book a Demo ✨</span>
          </motion.button>
          
          {/* <motion.button 
            className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300 font-semibold backdrop-blur-sm"
            whileHover={{ scale: 1.05, borderColor: 'rgba(91, 140, 255, 0.6)' }}
            whileTap={{ scale: 0.95 }}
          >
            Watch Demo 🎥
          </motion.button> */}
        </motion.div>

        <motion.div 
          className="mt-16 flex items-center justify-center gap-8 text-white/60 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Trusted by 100+ hiring teams
          </motion.div>
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            1M+ interviews conducted
          </motion.div>
        </motion.div>
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
      <section id="features" className="py-32 relative overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <motion.rect 
              width="100%" 
              height="100%" 
              fill="url(#grid)"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.h3 
            className="text-5xl font-bold text-white mb-6"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Why{' '}
            <motion.span 
              className="bg-gradient-to-r from-[#5b8cff] to-[#a855f7] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              HireOG
            </motion.span>{' '}
            Stands Out
          </motion.h3>
          
          <motion.p 
            className="text-xl text-white/80 max-w-3xl mx-auto mb-16"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Beyond screening — experience{' '}
            <span className="text-[#22d3ee] font-semibold">structured interviews</span>,{' '}
            <span className="text-[#a855f7] font-semibold">actionable analytics</span>, and{' '}
            <span className="text-[#5b8cff] font-semibold">seamless integration</span>{' '}
            with your favorite tools.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Video Interviews",
                description: "Candidates engage in realistic video interviews that measure communication, clarity, and confidence with advanced behavioral analytics.",
                icon: "🎙️",
                gradient: "from-[#5b8cff] to-[#22d3ee]",
                features: ["Real-time analysis", "Behavioral scoring", "Voice tonality"]
              },
              {
                title: "Smart Analytics",
                description: "Access instant dashboards with confidence scores, detailed insights, and comprehensive candidate rankings powered by AI.",
                icon: "📊",
                gradient: "from-[#22d3ee] to-[#a855f7]",
                features: ["Live dashboards", "Confidence metrics", "Skill mapping"]
              },
              {
                title: "ATS Integration",
                description: "Sync candidate data automatically with Greenhouse, Lever, BambooHR, or your existing ATS for seamless workflow.",
                icon: "⚙️",
                gradient: "from-[#a855f7] to-[#5b8cff]",
                features: ["Auto-sync", "API ready", "Zero setup"]
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ y: 60, opacity: 0, rotateX: -10 }}
                whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <motion.div 
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-full relative overflow-hidden group-hover:border-white/40 transition-all duration-500"
                  whileHover={{ y: -15, rotateY: 5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {/* Animated Background */}
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                  />
                  
                  {/* Floating Icon */}
                  <motion.div 
                    className="relative mb-6"
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-3xl mx-auto mb-4 relative`}>
                      {feature.icon}
                      <motion.div 
                        className="absolute inset-0 rounded-2xl border-2 border-white/30"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      />
                    </div>
                  </motion.div>
                  
                  <h4 className="font-bold text-white mb-4 text-2xl">{feature.title}</h4>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Feature List */}
                  <div className="space-y-2">
                    {feature.features.map((item, i) => (
                      <motion.div 
                        key={i}
                        className="flex items-center gap-3 text-sm text-white/60"
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.2 + i * 0.1 + 0.5 }}
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                        {item}
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Animated Border */}
                  <motion.div 
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                </motion.div>
              </motion.div>
            ))}
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
      <section id="faq" className="py-32 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#5b8cff]/5 via-transparent to-[#a855f7]/5" />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.h4 
            className="text-5xl font-bold text-white mb-4 text-center"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Frequently Asked{' '}
            <motion.span 
              className="bg-gradient-to-r from-[#22d3ee] to-[#a855f7] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            >
              Questions
            </motion.span>
          </motion.h4>
          
          <motion.p 
            className="text-center text-white/70 mb-16 text-lg"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Everything you need to know about HireOG's AI-powered recruitment platform.
          </motion.p>
          
          <div className="space-y-6">
            {[
              {
                question: "How does the AI interviewer work?",
                answer: "The AI interviewer simulates structured conversations, evaluating tone, clarity, and confidence in real time using advanced natural language processing and sentiment analysis.",
                icon: "🤖"
              },
              {
                question: "What types of roles can HireOG assess?",
                answer: "HireOG supports diverse roles across tech, product, sales, marketing, customer success, and operations — from entry-level positions to senior leadership roles.",
                icon: "🎯"
              },
              {
                question: "Does it integrate with our existing tools?",
                answer: "Yes, HireOG seamlessly integrates with leading ATS platforms like Greenhouse, Lever, Zoho, BambooHR, and Workday through our robust API infrastructure.",
                icon: "🔗"
              },
              {
                question: "How accurate is the AI evaluation?",
                answer: "Our models are trained with diverse datasets ensuring 95%+ accuracy in evaluations. We continuously improve fairness and reliability through ongoing machine learning optimization.",
                icon: "📈"
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <motion.div 
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:border-white/40 transition-all duration-300 relative overflow-hidden"
                  whileHover={{ y: -5, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Hover Background */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-[#5b8cff]/10 to-[#22d3ee]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  
                  <div className="flex items-start gap-4 relative z-10">
                    {/* Animated Icon */}
                    <motion.div 
                      className="text-3xl flex-shrink-0"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3
                      }}
                    >
                      {faq.icon}
                    </motion.div>
                    
                    <div className="flex-1">
                      <motion.h5 
                        className="font-bold text-white mb-4 text-xl group-hover:text-[#22d3ee] transition-colors duration-300"
                        whileHover={{ x: 5 }}
                      >
                        {faq.question}
                      </motion.h5>
                      
                      <motion.p 
                        className="text-white/70 leading-relaxed text-lg"
                        initial={{ opacity: 0.7 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        {faq.answer}
                      </motion.p>
                    </div>
                  </div>
                  
                  {/* Animated Border */}
                  <motion.div 
                    className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#5b8cff] to-[#22d3ee] group-hover:w-full transition-all duration-500"
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
          
          {/* Additional Help Section */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p className="text-white/60 mb-6 text-lg">
              Still have questions? We'd love to help!
            </p>
            <motion.button 
              className="bg-gradient-to-r from-[#5b8cff] to-[#22d3ee] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open("mailto:hello@hireog.com")}
            >
              Contact Support 💬
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="contact" className="relative py-32 overflow-hidden">
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-[#5b8cff] via-[#a855f7] to-[#22d3ee]"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            backgroundSize: ['100% 100%', '120% 120%', '100% 100%']
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        {/* Floating Elements */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-white/20 rounded-full"
              style={{
                left: `${20 + (i * 15)}%`,
                top: `${20 + (i * 10)}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.h5 
            className="text-6xl font-bold mb-6 text-white"
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            whileInView={{ y: 0, opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Hire Faster.{' '}
            <motion.span 
              className="block md:inline"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Hire Smarter.
            </motion.span>
            <br />
            <motion.span 
              className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            >
              Hire with HireOG.
            </motion.span>
          </motion.h5>
          
          <motion.p 
            className="text-xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join{' '}
            <motion.span 
              className="font-bold text-white"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              500+ recruiters
            </motion.span>{' '}
            and agencies automating their first-round interviews and improving hiring efficiency by{' '}
            <span className="font-bold text-white">3x</span>.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.button 
              onClick={() => window.open("https://forms.gle/s8ACQQC4LgdK2SQX6", '_blank')} 
              className="bg-white text-[#5b8cff] font-bold px-10 py-4 rounded-2xl shadow-2xl hover:shadow-white/25 transition-all duration-300 text-lg relative overflow-hidden group"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-[#22d3ee] to-[#5b8cff] opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              />
              <span className="relative z-10">Book a Demo ✨</span>
            </motion.button>
            

          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div 
            className="mt-16 flex flex-wrap justify-center gap-8 text-white/80 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            {[
              { icon: "⭐", text: "4.9/5 Rating" },
              { icon: "🚀", text: "2M+ Interviews" },
              { icon: "🏢", text: "500+ Companies" },
              { icon: "🎯", text: "95% Accuracy" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>       </div>     </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-b from-slate-900 to-black py-16 border-t border-white/10 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="footer-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#footer-pattern)"/>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <motion.div 
              className="md:col-span-2"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="text-3xl font-bold bg-gradient-to-r from-[#5b8cff] to-[#a855f7] bg-clip-text text-transparent mb-4"
                whileHover={{ scale: 1.05 }}
              >
                HireOG
              </motion.div>
              <p className="text-white/70 leading-relaxed mb-6 max-w-md">
                HireOG is an AI-driven video interview platform designed for modern recruitment teams. 
                We help companies, HRs, and hiring agencies screen thousands of candidates efficiently 
                through automated assessments and data-driven evaluations.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4">
                {[
                  { icon: "📧", label: "Email", action: () => window.open("mailto:hello@hireog.com") },
                  { icon: "🐦", label: "Twitter", action: () => window.open("https://twitter.com/hireog") },
                  { icon: "💼", label: "LinkedIn", action: () => window.open("https://linkedin.com/company/hireog") }
                ].map((social, index) => (
                  <motion.button
                    key={index}
                    className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 text-xl border border-white/20"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={social.action}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.button>
                ))}
              </div>
            </motion.div>
            
            {/* Quick Links */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h6 className="text-white font-semibold mb-4 text-lg">Quick Links</h6>
              <div className="space-y-3">
                {['How It Works', 'Features', 'Pricing', 'FAQ'].map((link, index) => (
                  <motion.a
                    key={index}
                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                    className="block text-white/60 hover:text-[#5b8cff] transition-colors duration-300"
                    whileHover={{ x: 5 }}
                  >
                    {link}
                  </motion.a>
                ))}
              </div>
            </motion.div>
            
            {/* Contact */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h6 className="text-white font-semibold mb-4 text-lg">Get in Touch</h6>
              <div className="space-y-3">
                <motion.div 
                  className="flex items-center gap-3 text-white/60"
                  whileHover={{ x: 5, color: "rgba(91, 140, 255, 0.8)" }}
                >
                  <span className="text-lg">📧</span>
                  <a href="mailto:hello@hireog.com" className="hover:text-[#5b8cff] transition-colors">
                    hello@hireog.com
                  </a>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-3 text-white/60"
                  whileHover={{ x: 5, color: "rgba(91, 140, 255, 0.8)" }}
                >
                  <span className="text-lg">🌍</span>
                  <span>Global Support</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-3 text-white/60"
                  whileHover={{ x: 5, color: "rgba(91, 140, 255, 0.8)" }}
                >
                  <span className="text-lg">⚡</span>
                  <span>24/7 Customer Care</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          {/* Bottom Bar */}
          <motion.div 
            className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-white/50 text-sm">
              © {new Date().getFullYear()} HireOG. All rights reserved. Built with ❤️ for better hiring.
            </div>
            
            <div className="flex gap-6 text-white/50 text-sm">
              <motion.a 
                href="#" 
                className="hover:text-white transition-colors"
                whileHover={{ y: -2 }}
              >
                Privacy Policy
              </motion.a>
              <motion.a 
                href="#" 
                className="hover:text-white transition-colors"
                whileHover={{ y: -2 }}
              >
                Terms of Service
              </motion.a>
              <motion.a 
                href="#" 
                className="hover:text-white transition-colors"
                whileHover={{ y: -2 }}
              >
                Cookie Policy
              </motion.a>
            </div>
          </motion.div>
        </div>
      </footer>
      </div>
    </div>
  );
}