"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Target, Star, Settings, CheckCircle, Play, 
  ArrowLeft, ArrowRight, Camera, Mic, Volume2, 
  Clock, Code, MessageCircle, Users, BarChart3, 
  Calendar, Lightbulb, Trophy, Zap, Bell
} from "lucide-react";

export default function MockInterviewPage() {
  const router = useRouter();
  // Check if AI interview is enabled (via environment variable)
  const aiInterviewEnabled = process.env.NEXT_PUBLIC_AI_INTERVIEW_ENABLED === 'true';
  
  // Mouse tracking for background animations
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Redirect to AI interview if enabled
  useEffect(() => {
    if (aiInterviewEnabled) {
      router.push('/ai-interview');
    }
  }, [aiInterviewEnabled, router]);

  // Show coming soon if not enabled
  if (!aiInterviewEnabled) {
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
              scale: { duration: 6, repeat: Infinity },
              rotate: { duration: 25, repeat: Infinity, ease: "linear" }
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-[#6f5af6]/20 to-[#5cd3ff]/20 rounded-full blur-3xl"
            animate={{ 
              x: -mousePosition.x * 0.15,
              y: -mousePosition.y * 0.15,
              scale: [1.2, 1, 1.2],
              rotate: -360
            }}
            transition={{ 
              x: { type: "spring", stiffness: 30 },
              y: { type: "spring", stiffness: 30 },
              scale: { duration: 8, repeat: Infinity },
              rotate: { duration: 30, repeat: Infinity, ease: "linear" }
            }}
          />

          {/* Floating Interview Icons */}
          {[Camera, Mic, Users, Brain, Trophy, Zap].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10"
              style={{
                left: `${15 + i * 15}%`,
                top: `${10 + i * 12}%`,
              }}
              animate={{
                y: [-15, 15, -15],
                rotate: [0, 180, 360],
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              <Icon className="w-16 h-16" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <motion.div 
            className="max-w-6xl mx-auto px-6 py-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Animated Coming Soon Icon */}
            <motion.div 
              className="mb-12"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <motion.div 
                className="w-32 h-32 mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center relative"
                animate={{ 
                  rotate: [0, 360],
                  boxShadow: [
                    "0 0 0 0 rgba(255, 255, 255, 0.1)",
                    "0 0 0 20px rgba(255, 255, 255, 0)",
                    "0 0 0 0 rgba(255, 255, 255, 0.1)"
                  ]
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  boxShadow: { duration: 3, repeat: Infinity }
                }}
                whileHover={{ scale: 1.1 }}
              >
                <Calendar className="w-16 h-16 text-white/80" />
                
                {/* Orbit particles */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] rounded-full"
                    style={{
                      left: "50%",
                      top: "50%",
                    }}
                    animate={{
                      x: [0, Math.cos(i * 90 * Math.PI / 180) * 80],
                      y: [0, Math.sin(i * 90 * Math.PI / 180) * 80],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.25,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* Animated Coming Soon Badge */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.span 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-2 border-yellow-500/30 backdrop-blur-sm"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(234, 179, 8, 0.3)",
                    "0 0 40px rgba(234, 179, 8, 0.5)",
                    "0 0 20px rgba(234, 179, 8, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  🚀
                </motion.div>
                Coming Soon
              </motion.span>
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              className="text-6xl sm:text-7xl font-extrabold mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <span className="bg-gradient-to-r from-[#2ad17e] via-[#5cd3ff] to-[#ffb21e] bg-clip-text text-transparent">
                Mock Interview
          </span>
              <br />
              <span className="text-white">Center</span>
            </motion.h1>
            
            <motion.p 
              className="text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              Practice with{' '}
              <span className="text-[#2ad17e] font-semibold">AI-powered interviews</span>, schedule{' '}
              <span className="text-[#5cd3ff] font-semibold">peer interviews</span>, and get{' '}
              <span className="text-[#ffb21e] font-semibold">detailed feedback</span>{' '}
              to ace your frontend interviews.
            </motion.p>

            {/* Animated Features Preview */}
            <motion.div 
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-16"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 1.0
                  }
                }
              }}
            >
              {[
                {
                  title: "AI-Powered Interviews",
                  description: "Practice with intelligent AI that asks relevant questions and provides detailed feedback",
                  icon: Brain,
                  color: "from-[#2ad17e] to-[#20c997]",
                  bgColor: "from-[#2ad17e]/10 to-[#20c997]/10",
                  borderColor: "border-[#2ad17e]/30"
                },
                {
                  title: "Peer Interviews",
                  description: "Schedule mock interviews with other developers and get real-world practice",
                  icon: Users,
                  color: "from-[#5cd3ff] to-[#3b82f6]",
                  bgColor: "from-[#5cd3ff]/10 to-[#3b82f6]/10",
                  borderColor: "border-[#5cd3ff]/30"
                },
                {
                  title: "Detailed Analytics",
                  description: "Track your progress with comprehensive feedback and performance analytics",
                  icon: BarChart3,
                  color: "from-[#6f5af6] to-[#9f7aea]",
                  bgColor: "from-[#6f5af6]/10 to-[#9f7aea]/10",
                  borderColor: "border-[#6f5af6]/30"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border-2 ${feature.borderColor} shadow-lg overflow-hidden group cursor-pointer`}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    boxShadow: "0 25px 50px rgba(255, 255, 255, 0.1)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Background Gradient Animation */}
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}
                  />

                  {/* Floating Icon */}
                  <motion.div 
                    className="relative z-10 mb-6"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4 + index,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    <motion.div 
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto relative`}
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <feature.icon className="w-10 h-10 text-white" />
                      
                      {/* Pulsing ring */}
                      <motion.div 
                        className="absolute inset-0 rounded-2xl border-4 border-white/30"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10 text-center">
                    <motion.h3 
                      className="text-2xl font-bold mb-4 text-white"
                      whileHover={{ color: feature.color.split(' ')[1].replace('to-[', '').replace(']', '') }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.title}
                    </motion.h3>
                    
                    <motion.p 
                      className="text-white/80 leading-relaxed"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {feature.description}
                    </motion.p>
                  </div>
                  
                  {/* Hover particles */}
                  <motion.div 
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [-20, 20, -20],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </motion.div>

                  {/* Corner decorations */}
                  <motion.div 
                    className="absolute top-4 right-4 w-3 h-3 bg-white/20 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                  />
                  <motion.div 
                    className="absolute bottom-4 left-4 w-2 h-2 bg-white/30 rounded-full"
                    animate={{ scale: [1, 1.8, 1] }}
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.4 }}
                  />
                </motion.div>
              ))}
            </motion.div>
                  
        {/* Notify Me Button */}
            <motion.div 
              className="mt-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <motion.div
                className="relative inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.button 
                  className="group relative px-12 py-6 rounded-2xl bg-gradient-to-r from-white to-gray-100 text-[#0b1020] font-bold text-xl shadow-2xl overflow-hidden border-4 border-white/20 backdrop-blur-sm"
                  animate={{ 
                    boxShadow: [
                      "0 0 30px rgba(255, 255, 255, 0.3)",
                      "0 0 50px rgba(255, 255, 255, 0.5)",
                      "0 0 30px rgba(255, 255, 255, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {/* Background Animation */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  
                  {/* Content */}
                  <motion.span 
                    className="relative z-10 flex items-center gap-3"
                    animate={{ color: ["#0b1020", "#0b1020"] }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Bell className="w-6 h-6" />
                    </motion.div>
                    Notify Me When Ready
                  </motion.span>

                  {/* Floating particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-[#2ad17e] rounded-full opacity-0 group-hover:opacity-100"
                      style={{
                        left: `${20 + i * 10}%`,
                        top: `${30 + (i % 2) * 40}%`,
                      }}
                      animate={{
                        y: [-10, 10, -10],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.button>

                {/* Animated Ring */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl border-4 border-white/30 pointer-events-none"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
              
              <motion.p 
                className="text-lg text-white/70 mt-6 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ delay: 1.7, duration: 3, repeat: Infinity }}
              >
                We'll email you as soon as the{' '}
                <span className="text-[#ffb21e] font-semibold">Mock Interview feature</span>{' '}
                is available! 🚀
              </motion.p>

              {/* Additional Benefits */}
              <motion.div 
                className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 1.8
                    }
                  }
                }}
              >
                {[
                  { icon: Trophy, text: "Expert Feedback", color: "#2ad17e" },
                  { icon: Target, text: "Real Scenarios", color: "#5cd3ff" },
                  { icon: Zap, text: "Quick Setup", color: "#ffb21e" },
                  { icon: Star, text: "Premium Quality", color: "#6f5af6" }
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit.text}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1 }
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <motion.div 
                      className="p-2 rounded-xl bg-gradient-to-r from-white/10 to-white/5"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8 + index * 2, repeat: Infinity, ease: "linear" }}
                    >
                      <benefit.icon 
                        className="w-5 h-5" 
                        style={{ color: benefit.color }}
                      />
                    </motion.div>
                    <span className="text-white/90 font-medium text-sm">{benefit.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
      </div>
    </div>
    );
  }

  // Loading state while redirecting in dev
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] flex items-center justify-center text-white relative overflow-hidden">
      {/* Animated Background */}
      <motion.div 
        className="absolute top-1/3 right-1/3 w-96 h-96 bg-gradient-to-r from-[#2ad17e]/20 to-[#5cd3ff]/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: 360
        }}
        transition={{ 
          scale: { duration: 4, repeat: Infinity },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" }
        }}
      />
      
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="w-16 h-16 mx-auto mb-6 border-4 border-[#2ad17e] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.p 
          className="text-xl font-semibold"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Redirecting to AI Interview...
        </motion.p>
      </motion.div>
    </div>
  );
}

