"use client";
import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Trophy, Star, UserPlus, Linkedin, Twitter, Instagram, Briefcase, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ContestIntroAnimation from "@/components/ContestIntroAnimation";

export default function ContestPage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -25]);

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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <>
      {/* Intro Animation */}
      {showIntro && (
        <ContestIntroAnimation onComplete={handleIntroComplete} />
      )}

      {/* Main Contest Page */}
      <div className={`min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] relative overflow-hidden ${showIntro ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'}`}>
      {/* Animated Background with Geometric Pattern */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div 
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#5cd3ff]/20 to-[#6f5af6]/20 rounded-full blur-3xl"
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

        {/* Circuit Board Pattern - More Detailed */}
        <div className="absolute inset-0 opacity-15">
          <svg width="100%" height="100%" className="absolute inset-0" preserveAspectRatio="none">
            <defs>
              <pattern id="circuit-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                {/* Nodes - Static circles */}
                <circle cx="10" cy="10" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="50" cy="10" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="90" cy="10" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="130" cy="10" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="170" cy="10" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="10" cy="50" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="50" cy="50" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="90" cy="50" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="130" cy="50" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="170" cy="50" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="10" cy="90" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="50" cy="90" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="90" cy="90" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="130" cy="90" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="170" cy="90" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="10" cy="130" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="50" cy="130" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="90" cy="130" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="130" cy="130" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="170" cy="130" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="10" cy="170" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="50" cy="170" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="90" cy="170" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="130" cy="170" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="170" cy="170" r="1.5" fill="#5cd3ff" opacity="0.4" />
                
                {/* Circuit Traces */}
                <path d="M 10 10 L 50 10 L 50 50 L 90 50" stroke="#5cd3ff" strokeWidth="0.5" fill="none" opacity="0.15" />
                <path d="M 130 10 L 170 10 L 170 50 L 130 50" stroke="#5cd3ff" strokeWidth="0.5" fill="none" opacity="0.15" />
                <path d="M 10 90 L 50 90 L 50 130 L 90 130" stroke="#5cd3ff" strokeWidth="0.5" fill="none" opacity="0.15" />
                <path d="M 130 90 L 170 90 L 170 130 L 130 130" stroke="#5cd3ff" strokeWidth="0.5" fill="none" opacity="0.15" />
                <path d="M 50 50 L 130 50" stroke="#5cd3ff" strokeWidth="0.5" fill="none" opacity="0.15" />
                <path d="M 50 130 L 130 130" stroke="#5cd3ff" strokeWidth="0.5" fill="none" opacity="0.15" />
                <path d="M 90 10 L 90 90" stroke="#5cd3ff" strokeWidth="0.5" fill="none" opacity="0.15" />
                <path d="M 90 130 L 90 170" stroke="#5cd3ff" strokeWidth="0.5" fill="none" opacity="0.15" />
                {/* Diagonal connections */}
                <path d="M 10 50 L 50 90" stroke="#5cd3ff" strokeWidth="0.3" fill="none" opacity="0.1" />
                <path d="M 170 50 L 130 90" stroke="#5cd3ff" strokeWidth="0.3" fill="none" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
          </svg>
          
          {/* Animated glowing nodes using divs */}
          {Array.from({ length: 25 }, (_, i) => {
            const x = (i % 5) * 20 + 10;
            const y = Math.floor(i / 5) * 20 + 10;
            return (
              <motion.div
                key={`node-${i}`}
                className="absolute rounded-full border border-[#5cd3ff]"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: '6px',
                  height: '6px',
                }}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{
                  duration: 3 + (i % 3) * 0.5,
                  repeat: Infinity,
                  delay: (i % 5) * 0.2,
                }}
              />
            );
          })}
        </div>

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#5cd3ff]/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
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
        {/* HEADER */}
        <motion.header 
          className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="text-2xl font-bold text-white uppercase tracking-wider"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            HIREOG
          </motion.div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-white">
            {['How it Works', 'Prizes', 'Partners'].map((item, index) => (
              <motion.a 
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="hover:text-[#5cd3ff] transition-colors cursor-pointer relative group"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index + 0.5 }}
              >
                {item}
                <motion.div 
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] group-hover:w-full transition-all duration-300"
                />
              </motion.a>
            ))}
          </nav>
          <motion.button
            onClick={() => router.push('/contest/register')}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Register Now
          </motion.button>
        </motion.header>

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-20 text-center relative">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.p 
              className="text-lg text-white/80 uppercase tracking-wider mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              INDIA'S FIRST
            </motion.p>
            <motion.h1 
              className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-tight"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <span className="bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] bg-clip-text text-transparent">
                INTERVIEW
              </span>{' '}
              COMPETITION
            </motion.h1>
            <motion.p 
              className="text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Your skills are your greatest asset. Prove them in the ultimate arena, win epic prizes, and get fast-tracked into India's leading tech companies.
            </motion.p>
            <motion.button
              onClick={() => router.push('/contest/register')}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] text-white font-bold text-lg uppercase tracking-wide hover:opacity-90 transition-opacity shadow-2xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              ENTER THE ARENA
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </motion.button>

            {/* Metric Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              {[
                { value: "₹10L+", label: "Prizes & Gadgets", icon: "💰" },
                { value: "50+", label: "Hiring Partners", icon: "🤝" },
                { value: "1 Pass", label: "To Your Dream Job", icon: "⭐" }
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-[#5cd3ff]/50 transition-all duration-300"
                  whileHover={{ y: -10, scale: 1.05 }}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                >
                  <motion.div 
                    className="text-4xl mb-4"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    {metric.icon}
                  </motion.div>
                  <div className="text-4xl font-bold text-white mb-2">{metric.value}</div>
                  <div className="text-white/70 text-sm">{metric.label}</div>
                  <motion.div 
                    className="absolute inset-0 rounded-2xl border-2 border-[#5cd3ff]/30 opacity-0 hover:opacity-100 transition-opacity"
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* LEVEL UP YOUR CAREER SECTION */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-5xl font-bold text-white mb-4"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Level Up Your Career
            </motion.h2>
            <motion.p 
              className="text-xl text-white/80"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Just three simple steps to unlock your potential.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-[#5cd3ff]/30 via-[#6f5af6]/30 to-[#5cd3ff]/30" />
            
            {[
              {
                step: 1,
                icon: <UserPlus className="w-8 h-8" />,
                title: "Register",
                description: "Create your profile and enter the competition. It's free and open for all."
              },
              {
                step: 2,
                icon: <Trophy className="w-8 h-8" />,
                title: "Compete",
                description: "Showcase your skills in a series of interview rounds against the best talent in India."
              },
              {
                step: 3,
                icon: <Star className="w-8 h-8" />,
                title: "Win & Get Hired",
                description: "Top performers win amazing gadgets and a golden ticket to skip the first round at partner companies."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <motion.div 
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center hover:border-[#5cd3ff]/50 transition-all duration-300"
                  whileHover={{ y: -10, scale: 1.05 }}
                >
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] flex items-center justify-center text-white mx-auto mb-6 relative"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                      scale: { duration: 2, repeat: Infinity }
                    }}
                  >
                    {item.icon}
                    <motion.div 
                      className="absolute inset-0 rounded-full border-2 border-white/30"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-white/70 leading-relaxed">{item.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* THE WINNER'S SPOILS SECTION */}
        <section id="prizes" className="max-w-7xl mx-auto px-6 py-20">
          <motion.h2 
            className="text-5xl font-bold text-white mb-12"
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            The Winner's Spoils
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Top Tech Gadgets",
                description: "Win the latest gear like MacBook Pros, flagship smartphones, and high-end accessories to power up your workspace.",
                image: (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-700/50 bg-black">
                    {/* MacBook Image */}
                    <motion.div
                      className="relative w-full h-full"
                      animate={{ 
                        y: [0, -5, 0],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Image
                        src="/images/macbook_contest.png"
                        alt="MacBook Pro"
                        fill
                        className="object-cover"
                        priority
                      />
                      {/* Overlay glow effect */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-[#5cd3ff]/10 to-transparent"
                        animate={{ opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      {/* Floating particles overlay */}
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-[#5cd3ff] rounded-full"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${30 + (i % 2) * 40}%`,
                          }}
                          animate={{
                            y: [-10, 10, -10],
                            opacity: [0.3, 1, 0.3],
                            scale: [1, 1.5, 1],
                          }}
                          transition={{
                            duration: 2 + i * 0.5,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                )
              },
              {
                title: "Interview Fast-Track",
                description: "The ultimate prize: Top contestants get a direct pass to final interview rounds with our prestigious partner companies.",
                image: (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-yellow-500/30 bg-black">
                    {/* Golden Ticket Image */}
                    <motion.div
                      className="relative w-full h-full"
                      animate={{ 
                        y: [0, -5, 0],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    >
                      <Image
                        src="/images/golden_ticket_contest.png"
                        alt="Golden Ticket"
                        fill
                        className="object-cover"
                        priority
                      />
                      {/* Overlay glow effect */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent"
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                      />
                      {/* Enhanced golden glow */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10"
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      />
                      {/* Floating golden particles overlay */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full"
                          style={{
                            left: `${15 + i * 10}%`,
                            top: `${20 + (i % 3) * 30}%`,
                          }}
                          animate={{
                            y: [-8, 8, -8],
                            opacity: [0.4, 1, 0.4],
                            scale: [1, 1.8, 1],
                          }}
                          transition={{
                            duration: 2.5 + i * 0.4,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                )
              },
              {
                title: "Exclusive Swag & Perks",
                description: "Get your hands on exclusive HIREOG merchandise, premium subscriptions, and other cool perks from our sponsors.",
                image: (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-700/50 bg-black">
                    {/* Swag Merchandise Image */}
                    <motion.div
                      className="relative w-full h-full"
                      animate={{ 
                        y: [0, -5, 0],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    >
                      <Image
                        src="/images/swag_contest.png"
                        alt="Exclusive Swag & Perks"
                        fill
                        className="object-cover"
                        priority
                      />
                      {/* Overlay glow effect */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-[#5cd3ff]/10 to-transparent"
                        animate={{ opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                      />
                      {/* Enhanced teal glow */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-[#5cd3ff]/10 via-transparent to-[#5cd3ff]/10"
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      />
                      {/* Floating teal particles overlay */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 bg-[#5cd3ff] rounded-full"
                          style={{
                            left: `${15 + i * 12}%`,
                            top: `${20 + (i % 3) * 25}%`,
                          }}
                          animate={{
                            y: [-8, 8, -8],
                            opacity: [0.4, 1, 0.4],
                            scale: [1, 1.8, 1],
                          }}
                          transition={{
                            duration: 2.5 + i * 0.3,
                            repeat: Infinity,
                            delay: i * 0.2 + 1,
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                )
              }
            ].map((prize, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-[#5cd3ff]/50 transition-all duration-300 overflow-hidden"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {prize.image}
                <h3 className="text-2xl font-bold text-white mt-6 mb-4">{prize.title}</h3>
                <p className="text-white/70 leading-relaxed">{prize.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

   

        {/* FOOTER */}
        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="text-2xl font-bold text-white uppercase tracking-wider mb-2">
                HIREOG
              </div>
              <p className="text-white/70 text-sm">India's Premier Interview Competition.</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
              <div className="flex gap-6">
                {[
                  { icon: Linkedin, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Instagram, href: "#" }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="text-white/60 hover:text-white transition-colors"
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
              <p className="text-white/50 text-xs text-center md:text-right">
                © 2025 HIREOG. All rights reserved. Let the games begin.
              </p>
            </div>
          </div>
        </footer>
      </div>
      </div>
    </>
  );
}

