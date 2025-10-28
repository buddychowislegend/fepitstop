"use client";
import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, Target, Brain, ClipboardList } from "lucide-react";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -25]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
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
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#2ad17e]/20 to-[#ffb21e]/20 rounded-full blur-3xl"
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
          className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-[#5cd3ff]/30 to-[#6f5af6]/30 rounded-full blur-2xl"
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
        {[...Array(15)].map((_, i) => (
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

      <div className="relative z-10 max-w-7xl mx-auto px-6">
      {/* HERO */}
      <section className="grid lg:grid-cols-2 gap-12 items-center py-20 relative">
        {/* Animated Hero Illustrations */}
        <motion.div 
          className="absolute top-10 right-10 hidden xl:block"
          style={{ y: y1 }}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <svg width="180" height="180" viewBox="0 0 180 180" className="text-[#2ad17e]/30">
            <motion.circle 
              cx="90" cy="90" r="70" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeDasharray="8 4"
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
            <motion.path 
              d="M60 90 L90 120 L130 60" 
              stroke="currentColor" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </svg>
        </motion.div>

        <motion.div 
          className="absolute top-32 left-10 hidden xl:block"
          style={{ y: y2 }}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          <svg width="140" height="140" viewBox="0 0 140 140" className="text-[#ffb21e]/20">
            <motion.polygon 
              points="70,20 120,120 20,120" 
              fill="currentColor" 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </motion.div>

        <motion.div 
          className="py-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight text-white mb-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Turn Anxiety into{' '}
            <motion.span 
              className="bg-gradient-to-r from-[#ffb21e] via-[#2ad17e] to-[#5cd3ff] bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              Confidence
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-white/80 max-w-2xl leading-relaxed mb-10"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Practice{' '}
            <motion.span 
              className="text-[#2ad17e] font-semibold"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              role-specific interviews
            </motion.span>
            , get AI feedback on clarity & confidence, and improve with targeted learning — all in one place.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 mb-10"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.a 
              href="/ai-interview"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white px-8 py-4 font-bold text-lg shadow-2xl relative overflow-hidden group"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-[#ffb21e] to-[#2ad17e] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span className="relative z-10">Start Free Practice ✨</span>
              <motion.span 
                className="relative z-10"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.a>
            
            <motion.button 
              onClick={() => scrollToSection('how')}
              className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-white/30 px-8 py-4 font-bold text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-lg"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.6)' }}
              whileTap={{ scale: 0.95 }}
            >
              How it works 📝
            </motion.button>
          </motion.div>

          <motion.div 
            className="flex flex-wrap gap-8 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[
              { color: "bg-[#2ad17e]", text: "AI Feedback" },
              { color: "bg-[#5cd3ff]", text: "Role-Specific" },
              { color: "bg-[#ffb21e]", text: "Confidence Building" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-3 text-white/80"
                whileHover={{ scale: 1.05, color: "rgba(255, 255, 255, 1)" }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.span 
                  className={`h-3 w-3 rounded-full ${item.color}`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                />
                {item.text}
              </motion.div>
            ))}
          </motion.div>
          </motion.div>

        <motion.div 
          className="relative"
          initial={{ x: 100, opacity: 0, rotateY: -15 }}
          animate={{ x: 0, opacity: 1, rotateY: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.div 
            className="relative rounded-3xl bg-gradient-to-br from-[#151a24] to-[#0f131a] ring-1 ring-white/20 shadow-2xl overflow-hidden backdrop-blur-sm"
            whileHover={{ rotateY: 5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-[#0f131a] to-[#1a1f2e] border-b border-white/10 text-white/70 text-sm"
            >
              <motion.span 
                className="h-3 w-3 rounded-full bg-[#ff5f56]"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.span 
                className="h-3 w-3 rounded-full bg-[#ffbd2e]"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />
              <motion.span 
                className="h-3 w-3 rounded-full bg-[#27c93f]"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              />
              <span className="ml-3 font-mono">ai-interview.js</span>
            </motion.div>
            
            <div className="p-6">
              <motion.pre 
                className="text-sm leading-6 text-white/90 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                >
                  <span className="text-[#6f5af6]">function</span> <span className="text-[#2ad17e]">analyzeInterview</span>() &#123;
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.7, duration: 0.5 }}
                >
                  {'  '}<span className="text-[#6f5af6]">const</span> <span className="text-white">feedback</span> = &#123;
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.9, duration: 0.5 }}
                >
                  {'    '}<span className="text-[#ffb21e]">confidence</span>: <span className="text-[#2ad17e]">"High"</span>,
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.1, duration: 0.5 }}
                >
                  {'    '}<span className="text-[#ffb21e]">clarity</span>: <span className="text-[#2ad17e]">"Clear"</span>,
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.3, duration: 0.5 }}
                >
                  {'    '}<span className="text-[#ffb21e]">tone</span>: <span className="text-[#2ad17e]">"Professional"</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5, duration: 0.5 }}
                >
                  {'  '}&#125;;
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.7, duration: 0.5 }}
                >
                  {'  '}<span className="text-[#6f5af6]">return</span> <span className="text-white">feedback</span>;
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.9, duration: 0.5 }}
                >
                  &#125;
                </motion.div>
              </motion.pre>
            </div>
            
            {/* Animated Cursor */}
            <motion.div 
              className="absolute bottom-8 right-6 w-2 h-5 bg-[#2ad17e]"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* WE UNDERSTAND YOUR STRUGGLE */}
      <section className="py-32 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2ad17e]/5 to-transparent" />
        
          <motion.div 
          className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-5xl font-extrabold tracking-tight text-white mb-6"
          >
            We Understand Your{' '}
            <motion.span 
              className="bg-gradient-to-r from-[#ffb21e] to-[#2ad17e] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            >
              Struggle
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/70 max-w-3xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Whether you're starting fresh or climbing higher, interview anxiety is real. Let's fix it together.
          </motion.p>
          </motion.div>

        <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
          {/* For Freshers */}
          <motion.div 
            className="group relative"
            initial={{ x: -60, opacity: 0, rotateY: -10 }}
            whileInView={{ x: 0, opacity: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-full relative overflow-hidden group-hover:border-[#2ad17e]/40 transition-all duration-500"
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Animated Icon */}
              <motion.div 
                className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#2ad17e] to-[#20c997] flex items-center justify-center text-3xl mx-auto mb-6 relative"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                🌱
                <motion.div 
                  className="absolute inset-0 rounded-2xl border-2 border-white/30"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
          </motion.div>
              
              <h3 className="text-2xl font-bold text-center mb-6 group-hover:text-[#2ad17e] transition-colors duration-300">
                For Freshers
              </h3>
              
              <div className="space-y-4">
                {[
                  "Unsure how to express your potential during interviews",
                  "Struggle to handle unexpected questions",
                  "Lack of feedback and guidance after rejection"
                ].map((item, index) => (
          <motion.div 
                    key={index}
                    className="flex items-start gap-4"
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <motion.div
                      className="w-6 h-6 rounded-full bg-gradient-to-r from-[#2ad17e] to-[#20c997] flex items-center justify-center flex-shrink-0 mt-0.5"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
                    </motion.div>
                    <span className="text-white/80 leading-relaxed">{item}</span>
                  </motion.div>
                ))}
            </div>
              
              {/* Hover Effect */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2ad17e] to-[#20c997] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            </motion.div>
          </motion.div>

          {/* For Experienced Professionals */}
          <motion.div 
            className="group relative"
            initial={{ x: 60, opacity: 0, rotateY: 10 }}
            whileInView={{ x: 0, opacity: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-full relative overflow-hidden group-hover:border-[#ffb21e]/40 transition-all duration-500"
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Animated Icon */}
              <motion.div 
                className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#ffb21e] to-[#f59f00] flex items-center justify-center text-3xl mx-auto mb-6 relative"
                animate={{ 
                  rotate: [0, -5, 5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              >
                🎯
                <motion.div 
                  className="absolute inset-0 rounded-2xl border-2 border-white/30"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
          </motion.div>

              <h3 className="text-2xl font-bold text-center mb-6 group-hover:text-[#ffb21e] transition-colors duration-300">
                For Experienced Professionals
              </h3>
              
              <div className="space-y-4">
                {[
                  "Low confidence despite deep expertise",
                  "Difficulty framing achievements clearly", 
                  "Missed roles due to weak communication or storytelling"
                ].map((item, index) => (
          <motion.div 
                    key={index}
                    className="flex items-start gap-4"
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <motion.div
                      className="w-6 h-6 rounded-full bg-gradient-to-r from-[#ffb21e] to-[#f59f00] flex items-center justify-center flex-shrink-0 mt-0.5"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
                    </motion.div>
                    <span className="text-white/80 leading-relaxed">{item}</span>
                  </motion.div>
                ))}
            </div>
              
              {/* Hover Effect */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ffb21e] to-[#f59f00] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* WHY HIREOG */}
      <section className="py-32 relative overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="why-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <motion.rect 
              width="100%" 
              height="100%" 
              fill="url(#why-grid)"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
          </svg>
        </div>

          <motion.div 
          className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-5xl font-extrabold tracking-tight text-white mb-6"
          >
            Why Job Seekers{' '}
            <motion.span 
              className="bg-gradient-to-r from-[#6f5af6] via-[#2ad17e] to-[#5cd3ff] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            >
              Love HireOG
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/80 max-w-4xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our platform provides{' '}
            <span className="text-[#2ad17e] font-semibold">comprehensive preparation tools</span>{' '}
            for interview success with AI-powered insights
          </motion.p>
          </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {[
            {
              icon: <Target className="w-8 h-8" />,
              title: "Identify Hidden Gaps",
              description: "Our AI finds communication, technical or confidence issues you can fix quickly.",
              gradient: "from-[#6f5af6] to-[#a855f7]",
              features: ["Communication analysis", "Confidence tracking", "Technical assessment"]
            },
            {
              icon: <Brain className="w-8 h-8" />,
              title: "Personalized Practice",
              description: "Simulate real interviews for your role with adaptive questions and instant AI feedback.",
              gradient: "from-[#20c997] to-[#2ad17e]",
              features: ["Role-specific questions", "Adaptive difficulty", "Instant feedback"]
            },
            {
              icon: <ClipboardList className="w-8 h-8" />,
              title: "Data-Driven Confidence",
              description: "Track growth with visual dashboards and AI-generated progress reports.",
              gradient: "from-[#f59f00] to-[#ffb21e]",
              features: ["Progress tracking", "Performance analytics", "Growth insights"]
            }
          ].map((card, index) => (
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
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                />
                
                {/* Floating Icon */}
                <motion.div 
                  className="relative mb-6"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.8
                  }}
                >
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${card.gradient} flex items-center justify-center text-white mb-4 relative mx-auto`}>
                    {card.icon}
                    <motion.div 
                      className="absolute inset-0 rounded-2xl border-2 border-white/30"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.4 }}
                    />
            </div>
          </motion.div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#ffb21e] transition-colors duration-300 text-center">
                  {card.title}
                </h3>
                
                <p className="text-white/70 mb-6 leading-relaxed text-center">
                  {card.description}
                </p>
                
                {/* Feature List */}
                <div className="space-y-3">
                  {card.features.map((feature, i) => (
          <motion.div 
                      key={i}
                      className="flex items-center gap-3"
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.2 + i * 0.1 + 0.5 }}
                    >
                      <motion.div 
                        className={`w-3 h-3 rounded-full bg-gradient-to-r ${card.gradient}`}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                      />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </motion.div>
                  ))}
            </div>
                
                {/* Animated Border */}
                <motion.div 
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
          </motion.div>
          </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-32 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="features-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1.5" fill="rgba(45, 209, 126, 0.1)"/>
              <circle cx="5" cy="5" r="1" fill="rgba(255, 178, 30, 0.1)"/>
              <circle cx="15" cy="15" r="0.8" fill="rgba(92, 211, 255, 0.1)"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#features-pattern)"/>
          </svg>
        </div>

        <motion.div 
          className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-5xl font-extrabold tracking-tight text-white mb-6"
          >
            <motion.span 
              className="bg-gradient-to-r from-[#2ad17e] via-[#5cd3ff] to-[#6f5af6] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
            >
              Powerful AI
            </motion.span>{' '}
            Features
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/80 max-w-4xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Everything you need to{' '}
            <span className="text-[#2ad17e] font-semibold">ace your interviews</span>{' '}
            in one powerful platform
          </motion.p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {[
            {
              href: "/ai-interview",
              icon: "🤖",
              title: "AI Interview Feedback", 
              description: "Tone, pacing, clarity, facial cues, and confidence — analyzed instantly by AI."
            },
            {
              href: "/prep-plans",
              icon: "🎯", 
              title: "Role-Specific Questions",
              description: "Curated prompts for software, product, sales, and marketing roles."
            },
            {
              href: "/progress",
              icon: "📊",
              title: "Performance Analytics", 
              description: "Measure improvement across communication, accuracy, and confidence."
            },
            {
              href: "/mock-interview",
              icon: "🎤",
              title: "Mock Interviews",
              description: "Schedule practice interviews and get targeted feedback from experts."
            },
            {
              href: "/resume",
              icon: "📄",
              title: "AI Resume Builder",
              description: "Create polished, ATS-friendly resumes in minutes with tailored suggestions."
            },
            {
              href: "/community", 
              icon: "👥",
              title: "Community",
              description: "Share solutions, discuss approaches, and learn from peers worldwide."
            }
          ].map((feature, index) => (
          <motion.a 
              key={index}
              href={feature.href}
              className="group relative block"
              initial={{ y: 60, opacity: 0, scale: 0.9 }}
              whileInView={{ y: 0, opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-full relative overflow-hidden group-hover:border-white/40 transition-all duration-500"
                whileHover={{ y: -10, scale: 1.03, rotateZ: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Floating Icon */}
                <motion.div 
                  className="relative mb-6"
                  animate={{ 
                    y: [0, -8, 0],
                    rotate: [0, 3, -3, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                >
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] flex items-center justify-center text-3xl mb-4 relative mx-auto shadow-2xl">
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                      {feature.icon}
                    </motion.span>
                    
                    {/* Pulsing rings */}
                    <motion.div 
                      className="absolute inset-0 rounded-3xl border-2 border-white/20"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.4 }}
                    />
            </div>
                </motion.div>
                
                <motion.h3 
                  className="text-2xl font-bold text-white mb-4 group-hover:text-[#ffb21e] transition-colors duration-300 text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  {feature.title}
                </motion.h3>
                
                <motion.p 
                  className="text-white/70 leading-relaxed text-center"
                  initial={{ opacity: 0.7 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  {feature.description}
                </motion.p>
                
                {/* Animated Arrow */}
                <motion.div 
                  className="flex justify-center mt-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.15 + 0.8 }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] flex items-center justify-center"
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <span className="text-white text-sm">→</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* FREE TOOLS */}
      <section className="py-32 relative overflow-hidden">
        <motion.div 
          className="text-center mb-16"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-5xl font-extrabold tracking-tight text-white mb-6"
          >
            Free AI{' '}
            <motion.span 
              className="bg-gradient-to-r from-[#ffb21e] via-[#2ad17e] to-[#5cd3ff] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            >
              Career Tools
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/80 max-w-4xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Create professional resumes and cover letters, then simulate job-specific interviews with AI feedback.
          </motion.p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {[
            {
              href: "/resume",
              icon: "📄",
              title: "AI Resume Builder",
              description: "Create polished, ATS-friendly resumes in minutes with tailored suggestions.",
              gradient: "from-[#6f5af6] to-[#a855f7]"
            },
            {
              href: "/cover-letter",
              icon: "✍️",
              title: "AI Cover Letter Generator",
              description: "Instantly craft professional cover letters aligned with your target job.",
              gradient: "from-[#f59f00] to-[#ffb21e]"
            },
            {
              href: "/ai-interview",
              icon: "🎯",
              title: "JD-Based Interview Simulator",
              description: "Upload your resume and job description to simulate realistic interviews.",
              gradient: "from-[#5cd3ff] to-[#6f5af6]"
            }
          ].map((tool, index) => (
            <motion.a
              key={index}
              href={tool.href}
              className="group relative block"
              initial={{ y: 60, opacity: 0, rotateX: -15 }}
              whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-full relative overflow-hidden group-hover:border-white/40 transition-all duration-500"
                whileHover={{ y: -15, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {/* Animated Background */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-500`}
                />
                
                {/* Icon */}
                <motion.div 
                  className="text-6xl mb-6 text-center"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.6
                  }}
                >
                  {tool.icon}
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#ffb21e] transition-colors duration-300 text-center">
                  {tool.title}
                </h3>
                
                <p className="text-white/70 leading-relaxed text-center">
                  {tool.description}
                </p>
                
                {/* Animated Border */}
                <motion.div 
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
              </motion.div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-32 relative overflow-hidden">
        {/* Section Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#5b8cff]/5 to-transparent" />
        
          <motion.div 
          className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-5xl font-bold text-white mb-6"
          >
            How{' '}
            <motion.span 
              className="bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            >
              HireOG
            </motion.span>{' '}
            Works
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/80 max-w-3xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Simple steps to transform your interview performance
          </motion.p>
          </motion.div>

        {/* Process Flow */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              step: "1",
              title: "Record",
              description: "Answer role-driven prompts in a relaxed, asynchronous environment.",
              icon: "🎥",
              features: ["Video recording", "Audio analysis", "Confidence tracking"]
            },
            {
              step: "2", 
              title: "Analyze",
              description: "AI pinpoints content & delivery gaps — tone, confidence, and technical depth.",
              icon: "🧠",
              features: ["Tone analysis", "Content gaps", "Technical depth"]
            },
            {
              step: "3",
              title: "Improve",
              description: "Follow guided AI exercises, short learning resources, and retake simulations until you're ready.",
              icon: "🚀",
              features: ["Guided exercises", "Learning resources", "Practice simulations"]
            }
          ].map((item, index) => (
          <motion.div 
              key={index}
              className="relative group"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 h-full relative overflow-hidden group-hover:border-white/40 transition-all duration-300"
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Step Number */}
                <motion.div 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] flex items-center justify-center text-white font-bold text-xl mx-auto mb-6 relative"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  {item.step}
                  <motion.div 
                    className="absolute inset-0 rounded-full border-2 border-white/30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  />
          </motion.div>

                {/* Icon */}
          <motion.div 
                  className="text-4xl mb-4 text-center"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                >
                  {item.icon}
          </motion.div>
                
                <h4 className="font-bold text-white mb-4 text-xl text-center">{item.title}</h4>
                <p className="text-white/70 leading-relaxed text-center mb-6">
                  {item.description}
                </p>
                
                {/* Features */}
                <div className="space-y-2">
                  {item.features.map((feature, i) => (
                    <motion.div 
                      key={i}
                      className="flex items-center gap-2 text-sm text-white/60"
                      initial={{ x: -10, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.2 + i * 0.1 + 0.5 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-[#2ad17e]" />
                      {feature}
                    </motion.div>
                  ))}
            </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="text-center py-20">
        <motion.h2 
          className="text-4xl font-bold text-white mb-6"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          Ready to Transform Your Interview Performance?
        </motion.h2>
        <motion.p 
          className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Join thousands of candidates who built their confidence and got hired with HireOG.
        </motion.p>
        <motion.a 
          href="/ai-interview" 
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white px-8 py-4 font-bold text-lg hover:shadow-lg transition-all duration-300"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Start Free Practice Now</span>
          <span>→</span>
        </motion.a>
      </section>

      {/* ROLES & SCENARIOS */}
      <section className="py-32 relative overflow-hidden">
        <motion.div 
          className="text-center mb-16"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-5xl font-extrabold tracking-tight text-white mb-6"
          >
            Preparation for{' '}
            <motion.span 
              className="bg-gradient-to-r from-[#6f5af6] via-[#2ad17e] to-[#ffb21e] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            >
              Every Role
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/80 max-w-4xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Whether you're a developer debugging your problem-solving flow, a PM practicing roadmap storytelling, or sales refining pitch delivery — HireOG provides role-specific simulations, feedback, and exercises that map directly to what employers evaluate.
          </motion.p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {[
            {
              href: "/prep-plans",
              icon: "💻",
              title: "Software Dev",
              description: "Technical interviews, coding challenges, and system design practice",
              gradient: "from-[#6f5af6] to-[#a855f7]"
            },
            {
              href: "/prep-plans",
              icon: "📊",
              title: "Product Manager",
              description: "Product strategy, roadmap planning, and stakeholder management",
              gradient: "from-[#20c997] to-[#2ad17e]"
            },
            {
              href: "/prep-plans",
              icon: "💼",
              title: "Sales & Biz",
              description: "Pitch delivery, negotiation skills, and business strategy",
              gradient: "from-[#f59f00] to-[#ffb21e]"
            },
            {
              href: "/prep-plans",
              icon: "📈",
              title: "Data",
              description: "Analytics, machine learning, and data science interviews",
              gradient: "from-[#5cd3ff] to-[#6f5af6]"
            },
            {
              href: "/prep-plans",
              icon: "⚙️",
              title: "Operations",
              description: "Process optimization, team management, and efficiency",
              gradient: "from-[#2ad17e] to-[#20c997]"
            },
            {
              href: "/prep-plans",
              icon: "👥",
              title: "HR",
              description: "Talent acquisition, employee relations, and organizational development",
              gradient: "from-[#a78bfa] to-[#6f5af6]"
            }
          ].map((role, index) => (
            <motion.a
              key={index}
              href={role.href}
              className="group relative block"
              initial={{ y: 60, opacity: 0, rotateX: -10 }}
              whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
            >
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-full relative overflow-hidden group-hover:border-white/40 transition-all duration-500"
                whileHover={{ y: -12, scale: 1.03, rotateY: 2 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {/* Animated Background */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-500`}
                />
                
                {/* Icon */}
                <motion.div 
                  className="text-5xl mb-6 text-center"
                  animate={{ 
                    rotate: [0, 8, -8, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.4
                  }}
                >
                  {role.icon}
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#ffb21e] transition-colors duration-300 text-center">
                  {role.title}
                </h3>
                
                <p className="text-white/70 leading-relaxed text-center">
                  {role.description}
                </p>
                
                {/* Animated Border */}
                <motion.div 
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
              </motion.div>
            </motion.a>
          ))}
            </div>

        <motion.div 
          className="text-center mt-16"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.a 
              href="/prep-plans" 
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white px-8 py-4 font-bold text-lg hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Start Preparation</span>
              <span>→</span>
            </motion.a>
            <motion.a 
              href="/ai-interview" 
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 px-8 py-4 font-bold text-white hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.6)' }}
              whileTap={{ scale: 0.95 }}
            >
              Try AI Interview
              <span>🎯</span>
            </motion.a>
          </div>
          <motion.p 
            className="text-sm text-white/60 mt-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Role packs include 50+ scenario prompts, targeted feedback points, and short micro-lessons to close gaps fast.
          </motion.p>
        </motion.div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 relative overflow-hidden">
        <motion.div 
          className="text-center mb-16"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-5xl font-extrabold tracking-tight text-white mb-6"
          >
            What Our{' '}
            <motion.span 
              className="bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            >
              Users Say
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/80 max-w-3xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join thousands of candidates who built their confidence and got hired with HireOG
          </motion.p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {[
            {
              quote: "HireOG gave me the clarity and confidence I needed. I aced my next three interviews effortlessly!",
              author: "Rohit, Software Engineer",
              gradient: "from-[#6f5af6] to-[#a855f7]"
            },
            {
              quote: "AI insights helped me fix communication gaps I wasn't even aware of. This platform truly works!",
              author: "Priya, Product Manager", 
              gradient: "from-[#2ad17e] to-[#20c997]"
            },
            {
              quote: "Within two weeks, I went from anxious to assured — and landed my dream role in fintech!",
              author: "Ankit, Sales Professional",
              gradient: "from-[#f59f00] to-[#ffb21e]"
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={{ y: 50, opacity: 0, rotateX: -10 }}
              whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-full relative overflow-hidden group-hover:border-white/40 transition-all duration-500"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Quote Icon */}
                <motion.div 
                  className="text-6xl text-white/20 mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                >
                  "
                </motion.div>
                
                <p className="text-white/80 italic mb-6 text-lg leading-relaxed">
                  {testimonial.quote}
                </p>
                
                <motion.p 
                  className="font-bold text-white group-hover:text-[#ffb21e] transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  — {testimonial.author}
                </motion.p>
                
                {/* Animated Border */}
                <motion.div 
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${testimonial.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-32 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2ad17e]/5 via-transparent to-[#5cd3ff]/5" />
        
          <motion.div 
          className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-5xl font-bold text-white mb-6"
          >
            Frequently Asked{' '}
            <motion.span 
              className="bg-gradient-to-r from-[#22d3ee] to-[#a855f7] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            >
              Questions
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/80 max-w-3xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Everything you need to know about HireOG
          </motion.p>
          </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {[
            {
              question: "Is HireOG free to use?",
              answer: "Yes, you can start practicing for free. Advanced analytics and recruiter features are part of premium plans.",
              icon: "💳"
            },
            {
              question: "How accurate is AI feedback?",
              answer: "Our models use NLP, speech and vision AI to provide reliable, bias-aware assessments for each response.",
              icon: "🎯"
            },
            {
              question: "Can I use HireOG for specific roles?",
              answer: "Yes! Practice tailored interviews for Software, Product, Sales, Marketing, Operations and more.",
              icon: "🎭"
            },
            {
              question: "Will HireOG help me find a job?",
              answer: "HireOG partners with recruiters to connect job-ready candidates with real opportunities and provides shareable scorecards.",
              icon: "🚀"
            }
          ].map((faq, index) => (
          <motion.div 
              key={index}
              className="group"
            initial={{ y: 30, opacity: 0 }}
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
                  className="absolute inset-0 bg-gradient-to-r from-[#2ad17e]/10 to-[#5cd3ff]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                      className="font-bold text-white mb-4 text-xl group-hover:text-[#2ad17e] transition-colors duration-300"
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
                  className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] group-hover:w-full transition-all duration-500"
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="text-center py-20">
        <motion.h2 
          className="text-4xl font-bold text-white mb-6"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          Start Your Interview Journey Today
        </motion.h2>
        <motion.p 
          className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Join thousands of candidates who built their confidence and got hired with HireOG.
        </motion.p>
        <motion.a 
          href="/ai-interview" 
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white px-8 py-4 font-bold text-lg hover:shadow-lg transition-all duration-300"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
            <span>Start Free Practice Now</span>
            <span>→</span>
        </motion.a>
      </section>

      {/* FOOTER */}
      <footer className="relative overflow-hidden py-20">
        {/* Footer Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2ad17e]/10 via-transparent to-[#6f5af6]/10" />
        
        <motion.div 
          className="relative z-10"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {/* Company Info */}
            <div>
              <motion.h3 
                className="text-2xl font-bold text-white mb-6"
                whileHover={{ color: "#2ad17e" }}
                transition={{ duration: 0.3 }}
              >
                HireOG
              </motion.h3>
              <p className="text-white/60 mb-6 leading-relaxed">
                Transform your interview performance with AI-powered practice and personalized feedback.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4">
                {[
                  { icon: "📧", href: "mailto:hello@hireog.com" },
                  { icon: "🐦", href: "#" },
                  { icon: "💼", href: "#" }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg hover:bg-white/20 transition-colors duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
        </div>

            {/* Quick Links */}
            <div>
              <motion.h4 
                className="font-bold text-white mb-6"
                whileHover={{ color: "#ffb21e" }}
                transition={{ duration: 0.3 }}
              >
                Features
              </motion.h4>
              <ul className="space-y-3">
                {[
                  { text: "AI Interview Practice", href: "/ai-interview" },
                  { text: "Resume Builder", href: "/resume" },
                  { text: "Mock Interviews", href: "/mock-interview" },
                  { text: "Progress Tracking", href: "/progress" }
                ].map((link, index) => (
                  <li key={index}>
                    <motion.a
                      href={link.href}
                      className="text-white/60 hover:text-white transition-colors duration-300"
                      whileHover={{ x: 5, color: "#2ad17e" }}
                    >
                      {link.text}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Prep Plans */}
            <div>
              <motion.h4 
                className="font-bold text-white mb-6"
                whileHover={{ color: "#5cd3ff" }}
                transition={{ duration: 0.3 }}
              >
                Prep Plans
              </motion.h4>
              <ul className="space-y-3">
                {[
                  { text: "Software Engineering", href: "/prep-plans" },
                  { text: "Product Management", href: "/prep-plans" },
                  { text: "Sales & Business", href: "/prep-plans" },
                  { text: "Data Science", href: "/prep-plans" }
                ].map((link, index) => (
                  <li key={index}>
                    <motion.a
                      href={link.href}
                      className="text-white/60 hover:text-white transition-colors duration-300"
                      whileHover={{ x: 5, color: "#2ad17e" }}
                    >
                      {link.text}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <motion.h4 
                className="font-bold text-white mb-6"
                whileHover={{ color: "#a855f7" }}
                transition={{ duration: 0.3 }}
              >
                Support
              </motion.h4>
              <ul className="space-y-3">
                {[
                  { text: "Help Center", href: "#" },
                  { text: "Contact Us", href: "mailto:hello@hireog.com" },
                  { text: "Privacy Policy", href: "#" },
                  { text: "Terms of Service", href: "#" }
                ].map((link, index) => (
                  <li key={index}>
                    <motion.a
                      href={link.href}
                      className="text-white/60 hover:text-white transition-colors duration-300"
                      whileHover={{ x: 5, color: "#2ad17e" }}
                    >
                      {link.text}
                    </motion.a>
                  </li>
                ))}
              </ul>
        </div>
          </div>
          
          {/* Footer Bottom */}
          <motion.div 
            className="border-t border-white/10 mt-12 pt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-white/40 text-sm">
              © 2024 HireOG. All rights reserved. Made with ❤️ for job seekers everywhere.
            </p>
        </motion.div>
    </motion.div>
      </footer>
      </div>
    </div>
  );
}