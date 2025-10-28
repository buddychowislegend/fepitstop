"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdSense from "@/components/AdSense";
import { useAnalytics } from "@/hooks/useAnalytics";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Target, 
  Star, 
  Settings, 
  CheckCircle, 
  Play, 
  ArrowLeft, 
  ArrowRight, 
  Camera, 
  Mic, 
  Volume2, 
  Clock, 
  Code, 
  MessageCircle, 
  Users, 
  BarChart3, 
  Calendar, 
  Lightbulb, 
  Trophy, 
  Zap, 
  Bell,
  Award,
  BookOpen,
  Coffee,
  Monitor
} from "lucide-react";

type Question = {
  id: string;
  question: string;
  options: string[];
  correct: number;
  category?: string;
  difficulty?: string;
};

type Answer = {
  questionId: string;
  question: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
};

import { api } from "@/lib/config";

export default function QuizPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
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
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showProfileSelection, setShowProfileSelection] = useState(true);

  // Timer and rating
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rankInfo, setRankInfo] = useState<any>(null);

  const profiles = [
    { id: 'frontend', name: 'Frontend', icon: Monitor, description: 'React, JavaScript, TypeScript', color: 'from-[#2ad17e] to-[#20c997]', emoji: '⚛️' },
    { id: 'backend', name: 'Backend Spring Boot', icon: Coffee, description: 'Java, Spring, Microservices', color: 'from-[#5cd3ff] to-[#6f5af6]', emoji: '☕' },
    { id: 'product', name: 'Product Manager', icon: BarChart3, description: 'Product Strategy, Metrics', color: 'from-[#ffb21e] to-[#ff6b6b]', emoji: '📊' },
    { id: 'hr', name: 'HR', icon: Users, description: 'Recruitment, Culture', color: 'from-[#ff6b6b] to-[#ee5a24]', emoji: '👥' },
    { id: 'business', name: 'Sales', icon: Trophy, description: 'Enterprise, Partnerships', color: 'from-[#6f5af6] to-[#9f7aea]', emoji: '💼' }
  ];

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfile(profileId);
    setShowProfileSelection(false);
    setLoading(true);
    // Fetch questions for selected profile
    fetch(api(`/quiz/random/10?profile=${encodeURIComponent(profileId)}`))
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
        setStartTime(Date.now());
        setQuestionStartTime(Date.now());
      })
      .catch(() => setLoading(false));
  };

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to signin with return URL
      router.push('/signin?redirect=/quiz');
    }
  }, [authLoading, user, router]);

  // Auto-load user's default profile if available
  useEffect(() => {
    if (!authLoading && user && showProfileSelection) {
      const userProfile = (user as any)?.profile;
      if (userProfile && profiles.some(p => p.id === userProfile)) {
        handleProfileSelect(userProfile);
      }
    }
  }, [authLoading, user]);

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!user) return;
    
    const profile = (user as any)?.profile;
    const url = profile ? api(`/quiz/random/10?profile=${encodeURIComponent(profile)}`) : api(`/quiz/random/10`);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
        setStartTime(Date.now());
        setQuestionStartTime(Date.now());
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleNext = () => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = selected === questions[current].correct;
    
    // Record answer
    const answer: Answer = {
      questionId: questions[current].id,
      question: questions[current].question,
      selectedAnswer: selected!,
      correctAnswer: questions[current].correct,
      isCorrect,
      timeSpent
    };
    
    setAnswers([...answers, answer]);
    
    if (isCorrect) {
      setScore((s) => s + 1);
    }
    
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setQuestionStartTime(Date.now());
    } else {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      setTotalTimeSpent(totalTime);
      setFinished(true);
      setShowRating(true);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!token || !user) {
      router.push('/signin');
      return;
    }

    if (rating === 0) {
      alert('Please rate your quiz experience!');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(api('/quiz/complete'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          score,
          totalQuestions: questions.length,
          rating,
          timeSpent: totalTimeSpent,
          answers
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRankInfo(data.rankInfo);
        setShowRating(false);
      } else {
        alert(data.error || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setAnswers([]);
    setRating(0);
    setShowRating(false);
    setRankInfo(null);
    setLoading(true);
    setShowProfileSelection(true);
    setSelectedProfile(null);
  };

  if (loading) {
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
              scale: { duration: 6, repeat: Infinity, type: "tween" },
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
              scale: { duration: 8, repeat: Infinity, type: "tween" },
              rotate: { duration: 30, repeat: Infinity, ease: "linear" }
            }}
          />

          {/* Floating Quiz Icons */}
          {[BookOpen, Brain, Target, Lightbulb].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10"
              style={{
                left: `${15 + i * 20}%`,
                top: `${10 + i * 20}%`,
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
                type: "tween"
              }}
            >
              <Icon className="w-16 h-16" />
            </motion.div>
          ))}
        </div>

        {/* Loading Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] flex items-center justify-center"
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, type: "tween" }
              }}
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold text-white mb-4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, type: "tween" }}
            >
              Preparing Your Quiz
            </motion.h1>
            <motion.div 
              className="flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff]"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    type: "tween"
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Profile Selection Screen
  if (showProfileSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#2ad17e]/20 to-[#ffb21e]/20 rounded-full blur-3xl"
            animate={{ 
              x: mousePosition.x * 0.1,
              y: mousePosition.y * 0.1,
              scale: [1, 1.05, 1],
              rotate: 360
            }}
            transition={{ 
              x: { type: "spring", stiffness: 30 },
              y: { type: "spring", stiffness: 30 },
              scale: { duration: 8, repeat: Infinity, type: "tween" },
              rotate: { duration: 30, repeat: Infinity, ease: "linear" }
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-[#6f5af6]/20 to-[#5cd3ff]/20 rounded-full blur-3xl"
            animate={{ 
              x: -mousePosition.x * 0.08,
              y: -mousePosition.y * 0.08,
              scale: [1.05, 1, 1.05],
              rotate: -360
            }}
            transition={{ 
              x: { type: "spring", stiffness: 25 },
              y: { type: "spring", stiffness: 25 },
              scale: { duration: 10, repeat: Infinity, type: "tween" },
              rotate: { duration: 40, repeat: Infinity, ease: "linear" }
            }}
          />

          {/* Floating Quiz Elements */}
          {[Brain, BookOpen, Trophy, Star, Target].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute text-white/5"
              style={{
                left: `${10 + i * 18}%`,
                top: `${5 + i * 15}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                rotate: [0, 10, -10, 0],
                opacity: [0.05, 0.15, 0.05],
              }}
              transition={{
                duration: 6 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.8,
                type: "tween"
              }}
            >
              <Icon className="w-20 h-20" />
            </motion.div>
          ))}
          </div>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <motion.div
            className="w-full max-w-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="flex justify-center gap-4 mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                {[Brain, Target, Star].map((Icon, index) => (
                  <motion.div
                    key={index}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] flex items-center justify-center"
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.2,
                      type: "tween"
                    }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                ))}
              </motion.div>

              <motion.h1 
                className="text-5xl font-extrabold mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span className="bg-gradient-to-r from-[#2ad17e] via-[#5cd3ff] to-[#ffb21e] bg-clip-text text-transparent">
                  Select Your Quiz Profile
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Choose the profile that matches your role to get{' '}
                <span className="text-[#2ad17e] font-semibold">personalized questions</span>
              </motion.p>
            </motion.div>

            {/* Profile Cards */}
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.15
                  }
                }
              }}
            >
            {profiles.map((profile, index) => (
                <motion.button
                key={profile.id}
                onClick={() => handleProfileSelect(profile.id)}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-8 text-left overflow-hidden transition-all duration-300 hover:border-white/40"
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.9 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {/* Animated Background Gradient */}
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${profile.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`}
                    whileHover={{ scale: 1.1 }}
                  />
                  
                  {/* Floating Icon */}
                  <motion.div 
                    className="relative w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <profile.icon className="w-10 h-10 text-white" />
                    
                    {/* Pulsing Ring */}
                    <motion.div 
                      className="absolute inset-0 rounded-2xl border-2 border-white/30"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                    />
                  </motion.div>
                  
                  {/* Content */}
                  <div className="relative z-10 text-center">
                    <motion.h3 
                      className="text-2xl font-bold mb-3 text-white"
                      whileHover={{ scale: 1.05 }}
                    >
                      {profile.name}
                    </motion.h3>
                    <motion.p 
                      className="text-white/70 text-sm leading-relaxed"
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {profile.description}
                    </motion.p>
                </div>

                  {/* Hover Particles */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${20 + i * 30}%`,
                          top: `${30 + i * 20}%`,
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                          type: "tween"
                        }}
                      />
                    ))}
                  </motion.div>

                  {/* Corner Decoration */}
                  <motion.div 
                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r from-white/20 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const minutes = Math.floor(totalTimeSpent / 60);
    const seconds = totalTimeSpent % 60;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#2ad17e]/20 to-[#ffb21e]/20 rounded-full blur-3xl"
            animate={{ 
              x: mousePosition.x * 0.1,
              y: mousePosition.y * 0.1,
              scale: [1, 1.05, 1],
              rotate: 360
            }}
            transition={{ 
              x: { type: "spring", stiffness: 30 },
              y: { type: "spring", stiffness: 30 },
              scale: { duration: 8, repeat: Infinity, type: "tween" },
              rotate: { duration: 30, repeat: Infinity, ease: "linear" }
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-[#6f5af6]/20 to-[#5cd3ff]/20 rounded-full blur-3xl"
            animate={{ 
              x: -mousePosition.x * 0.08,
              y: -mousePosition.y * 0.08,
              scale: [1.05, 1, 1.05],
              rotate: -360
            }}
            transition={{ 
              x: { type: "spring", stiffness: 25 },
              y: { type: "spring", stiffness: 25 },
              scale: { duration: 10, repeat: Infinity, type: "tween" },
              rotate: { duration: 40, repeat: Infinity, ease: "linear" }
            }}
          />

          {/* Floating Celebration Icons */}
          {[Trophy, Star, Award, CheckCircle].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10"
              style={{
                left: `${10 + i * 20}%`,
                top: `${15 + i * 20}%`,
              }}
              animate={{
                y: [-15, 15, -15],
                rotate: [0, 360, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                delay: i * 0.5,
                type: "tween"
              }}
            >
              <Icon className="w-16 h-16" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen text-white">
          <motion.div 
            className="max-w-5xl mx-auto px-6 py-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
          {/* Rating Screen */}
          {showRating && (
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-10 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
              <div className="text-center">
                  {/* Celebration Icon */}
                  <motion.div 
                    className="text-8xl mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <motion.span
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                    >
                  {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
                    </motion.span>
                  </motion.div>

                  {/* Main Title */}
                  <motion.h1 
                    className="text-5xl font-extrabold mb-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="bg-gradient-to-r from-[#2ad17e] via-[#5cd3ff] to-[#ffb21e] bg-clip-text text-transparent">
                      Quiz Complete!
                    </span>
                  </motion.h1>

                  {/* Score Summary */}
                  <motion.p 
                    className="text-2xl text-white/90 mb-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    You scored{' '}
                    <motion.span 
                      className="font-bold bg-gradient-to-r from-[#2ad17e] to-[#20c997] bg-clip-text text-transparent"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                    >
                      {score}
                    </motion.span>
                    {' '}out of {questions.length}
                  </motion.p>
                
                {/* Score Stats */}
                  <motion.div 
                    className="grid grid-cols-3 gap-6 mb-12"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.2,
                          delayChildren: 0.8
                        }
                      }
                    }}
                  >
                    <motion.div 
                      className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-6 relative overflow-hidden"
                      variants={{
                        hidden: { opacity: 0, y: 40, scale: 0.9 },
                        visible: { opacity: 1, y: 0, scale: 1 }
                      }}
                      whileHover={{ y: -5, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <motion.div 
                        className="text-4xl font-bold text-[#2ad17e] mb-2"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          textShadow: ["0px 0px 0px rgba(42, 209, 126, 0)", "0px 0px 25px rgba(42, 209, 126, 0.6)", "0px 0px 0px rgba(42, 209, 126, 0)"]
                        }}
                        transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                      >
                        {percentage}%
                      </motion.div>
                      <div className="text-sm text-white/80 font-semibold">Accuracy</div>
                      
                      {/* Animated Background Decoration */}
                      <motion.div 
                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#2ad17e]/30"
                        animate={{ scale: [1, 1.3, 1], rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, type: "tween" }}
                      />
                    </motion.div>

                    <motion.div 
                      className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-6 relative overflow-hidden"
                      variants={{
                        hidden: { opacity: 0, y: 40, scale: 0.9 },
                        visible: { opacity: 1, y: 0, scale: 1 }
                      }}
                      whileHover={{ y: -5, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <motion.div 
                        className="text-4xl font-bold text-[#5cd3ff] mb-2"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          textShadow: ["0px 0px 0px rgba(92, 211, 255, 0)", "0px 0px 25px rgba(92, 211, 255, 0.6)", "0px 0px 0px rgba(92, 211, 255, 0)"]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, type: "tween" }}
                      >
                        {correctAnswers}/{questions.length}
                      </motion.div>
                      <div className="text-sm text-white/80 font-semibold">Correct</div>
                      
                      {/* Animated Background Decoration */}
                      <motion.div 
                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#5cd3ff]/30"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, -360] }}
                        transition={{ duration: 2.8, repeat: Infinity, type: "tween" }}
                      />
                    </motion.div>

                    <motion.div 
                      className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-6 relative overflow-hidden"
                      variants={{
                        hidden: { opacity: 0, y: 40, scale: 0.9 },
                        visible: { opacity: 1, y: 0, scale: 1 }
                      }}
                      whileHover={{ y: -5, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <motion.div 
                        className="text-4xl font-bold text-[#ffb21e] mb-2"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          textShadow: ["0px 0px 0px rgba(255, 178, 30, 0)", "0px 0px 25px rgba(255, 178, 30, 0.6)", "0px 0px 0px rgba(255, 178, 30, 0)"]
                        }}
                        transition={{ duration: 1.8, repeat: Infinity, type: "tween" }}
                      >
                        {minutes}:{seconds.toString().padStart(2, '0')}
                      </motion.div>
                      <div className="text-sm text-white/80 font-semibold">Time</div>
                      
                      {/* Animated Background Decoration */}
                      <motion.div 
                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#ffb21e]/30"
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 2.2, repeat: Infinity, type: "tween" }}
                      />
                    </motion.div>
                  </motion.div>

                {/* Rating Section */}
                  <motion.div 
                    className="mb-10"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                  >
                    <motion.h2 
                      className="text-2xl font-bold mb-6 text-center"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 3, repeat: Infinity, type: "tween" }}
                    >
                      <span className="bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] bg-clip-text text-transparent">
                        Rate Your Experience
                      </span>
                    </motion.h2>
                    
                    <motion.div 
                      className="flex justify-center gap-4 mb-6"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.1,
                            delayChildren: 1.6
                          }
                        }
                      }}
                    >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                        key={star}
                        onClick={() => setRating(star)}
                          className={`text-6xl transition-all duration-300 ${
                            star <= rating ? 'opacity-100 drop-shadow-lg' : 'opacity-40'
                          }`}
                          variants={{
                            hidden: { opacity: 0, scale: 0, rotate: -180 },
                            visible: { opacity: star <= rating ? 1 : 0.4, scale: 1, rotate: 0 }
                          }}
                          whileHover={{ 
                            scale: 1.2, 
                            rotate: [0, -10, 10, 0],
                            filter: "brightness(1.2)"
                          }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <motion.span
                            animate={star <= rating ? {
                              textShadow: ["0px 0px 0px rgba(255, 215, 0, 0)", "0px 0px 20px rgba(255, 215, 0, 0.8)", "0px 0px 0px rgba(255, 215, 0, 0)"]
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                          >
                            ⭐
                          </motion.span>
                        </motion.button>
                      ))}
                    </motion.div>
                    
                    <AnimatePresence>
                  {rating > 0 && (
                        <motion.p 
                          className="text-center text-lg font-semibold"
                          initial={{ opacity: 0, y: 20, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <span className={`${
                            rating === 5 ? 'text-[#2ad17e]' : 
                            rating === 4 ? 'text-[#5cd3ff]' : 
                            rating === 3 ? 'text-[#ffb21e]' : 
                            rating === 2 ? 'text-[#ff6b6b]' : 'text-white/70'
                          }`}>
                            {rating === 5 ? '🎉 Excellent!' : 
                             rating === 4 ? '🚀 Great!' : 
                             rating === 3 ? '👍 Good!' : 
                             rating === 2 ? '😊 Fair' : 
                             '📈 Needs improvement'}
                          </span>
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                {/* Submit Button */}
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                  >
                {user && token ? (
                      <motion.button
                    onClick={handleSubmitQuiz}
                    disabled={submitting || rating === 0}
                        className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white font-bold shadow-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ 
                          scale: (submitting || rating === 0) ? 1 : 1.05,
                          boxShadow: (submitting || rating === 0) ? undefined : "0 25px 50px rgba(42, 209, 126, 0.4)"
                        }}
                        whileTap={{ scale: (submitting || rating === 0) ? 1 : 0.95 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <motion.span className="relative z-10 flex items-center gap-3">
                          {submitting ? (
                            <>
                              <motion.div
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Trophy className="w-5 h-5" />
                              Submit & Save Progress
                            </>
                          )}
                        </motion.span>
                        
                        {/* Animated Background */}
                        {!submitting && rating > 0 && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-[#20c997] to-[#2ad17e]"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "0%" }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        
                        {/* Success Particles */}
                        {!submitting && rating > 0 && (
                          <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                          >
                            {[...Array(4)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-white rounded-full"
                                style={{
                                  left: `${15 + i * 25}%`,
                                  top: `${25 + i * 15}%`,
                                }}
                                animate={{
                                  scale: [0, 1, 0],
                                  opacity: [0, 1, 0],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                  type: "tween"
                                }}
                              />
                            ))}
                          </motion.div>
                        )}
                      </motion.button>
                    ) : (
                      <motion.div 
                        className="space-y-6"
                        variants={{
                          visible: {
                            transition: {
                              staggerChildren: 0.2
                            }
                          }
                        }}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.p 
                          className="text-lg text-white/80"
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                        >
                          Sign in to save your progress and earn points!
                        </motion.p>
                        <motion.div
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                        >
                    <Link
                      href="/signin"
                            className="group inline-block"
                          >
                            <motion.button
                              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white font-bold shadow-xl overflow-hidden relative"
                              whileHover={{ 
                                scale: 1.05,
                                boxShadow: "0 25px 50px rgba(42, 209, 126, 0.4)"
                              }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              <span className="relative z-10 flex items-center gap-3">
                                <Users className="w-5 h-5" />
                      Sign In to Save
                              </span>
                              
                              {/* Animated Background */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-[#20c997] to-[#2ad17e]"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "0%" }}
                                transition={{ duration: 0.3 }}
                              />
                            </motion.button>
                    </Link>
                        </motion.div>
                      </motion.div>
                )}
                  </motion.div>
              </div>
              </motion.div>
          )}

          {/* Results Screen (after submission) */}
          {!showRating && rankInfo && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 p-8 ring-1 ring-emerald-400/20 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h1 className="text-4xl font-extrabold mb-2">Progress Saved!</h1>
                <p className="text-xl text-white/80">
                  You earned <span className="font-bold text-emerald-400">{Math.round(5 + (percentage / 10))}</span> points!
                </p>
              </div>

              {/* Rank Info */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-6 ring-1 ring-amber-400/20">
                <h2 className="text-2xl font-bold mb-4">🏆 Your Ranking</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-300">#{rankInfo.rank}</div>
                    <div className="text-sm text-white/60 mt-1">Global Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-300">{rankInfo.totalScore}</div>
                    <div className="text-sm text-white/60 mt-1">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-300">{rankInfo.problemsSolved}</div>
                    <div className="text-sm text-white/60 mt-1">Problems</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-300">{rankInfo.quizzesTaken}</div>
                    <div className="text-sm text-white/60 mt-1">Quizzes</div>
                  </div>
                </div>
              </div>

              {/* Answer Review */}
              <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
                <h2 className="text-2xl font-bold mb-4">📝 Answer Review</h2>
                <div className="space-y-3">
                  {answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        answer.isCorrect ? 'bg-emerald-500/10 ring-1 ring-emerald-400/30' : 'bg-rose-500/10 ring-1 ring-rose-400/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-2xl ${answer.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {answer.isCorrect ? '✓' : '✗'}
                            </span>
                            <span className="font-semibold">Question {index + 1}</span>
                          </div>
                          <p className="text-sm text-white/80 mb-2">{answer.question}</p>
                          <div className="text-xs text-white/60">
                            {!answer.isCorrect && (
                              <p className="text-rose-300">Correct answer: {questions[index]?.options[answer.correctAnswer]}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-xs text-white/60">
                          {answer.timeSpent}s
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={reset}
                  className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/15 font-semibold transition"
                >
                  Take Another Quiz
          </button>
                <Link
                  href="/profile"
                  className="px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
                >
                  View Profile
                </Link>
              </div>
            </div>
          )}
          </motion.div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
 
  const currentProfile = profiles.find(p => p.id === selectedProfile);

  // Parse question to extract code snippet if present
  const parseQuestion = (question: string) => {
    const codeBlockRegex = /```js\n([\s\S]*?)\n```/;
    const match = question.match(codeBlockRegex);
    
    if (match) {
      const textBefore = question.substring(0, match.index).trim();
      const codeSnippet = match[1];
      return { text: textBefore, code: codeSnippet, hasCode: true };
    }
    
    return { text: question, code: null, hasCode: false };
  };

  const parsedQuestion = q ? parseQuestion(q.question) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#2ad17e]/15 to-[#ffb21e]/15 rounded-full blur-3xl"
          animate={{ 
            x: mousePosition.x * 0.08,
            y: mousePosition.y * 0.08,
            scale: [1, 1.1, 1],
            rotate: 360
          }}
          transition={{ 
            x: { type: "spring", stiffness: 30 },
            y: { type: "spring", stiffness: 30 },
            scale: { duration: 10, repeat: Infinity, type: "tween" },
            rotate: { duration: 35, repeat: Infinity, ease: "linear" }
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-[#6f5af6]/15 to-[#5cd3ff]/15 rounded-full blur-3xl"
          animate={{ 
            x: -mousePosition.x * 0.06,
            y: -mousePosition.y * 0.06,
            scale: [1.1, 1, 1.1],
            rotate: -360
          }}
          transition={{ 
            x: { type: "spring", stiffness: 25 },
            y: { type: "spring", stiffness: 25 },
            scale: { duration: 12, repeat: Infinity, type: "tween" },
            rotate: { duration: 45, repeat: Infinity, ease: "linear" }
          }}
        />

        {/* Floating Question Mark Icons */}
        {[Brain, Lightbulb, Target, CheckCircle].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-white/8"
            style={{
              left: `${5 + i * 22}%`,
              top: `${8 + i * 20}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              rotate: [0, 15, -15, 0],
              opacity: [0.08, 0.2, 0.08],
            }}
            transition={{
              duration: 7 + i * 0.5,
              repeat: Infinity,
              delay: i * 1.2,
              type: "tween"
            }}
          >
            <Icon className="w-16 h-16" />
          </motion.div>
        ))}
        </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen text-white">
        <motion.div 
          className="max-w-5xl mx-auto px-6 py-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header Section */}
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h1 
              className="text-4xl sm:text-5xl font-extrabold mb-4"
              animate={{ 
                backgroundPosition: ["0%", "100%", "0%"]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <span className="bg-gradient-to-r from-[#2ad17e] via-[#5cd3ff] to-[#ffb21e] bg-clip-text text-transparent bg-[length:200%_100%]">
                Knowledge Challenge
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl text-white/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Test your expertise with curated questions
            </motion.p>
          </motion.div>

        {/* Profile Badge */}
        {currentProfile && (
            <motion.div 
              className="mb-8 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20 rounded-2xl">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <currentProfile.icon className="w-6 h-6 text-white" />
                </motion.div>
            <div>
                  <div className="font-bold text-lg text-white">{currentProfile.name}</div>
                  <div className="text-sm text-white/70">{currentProfile.description}</div>
            </div>
          </div>
            </motion.div>
        )}

        {/* Progress Bar */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <motion.span 
                className="text-sm text-white/80 font-semibold"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, type: "tween" }}
              >
                Question Progress
              </motion.span>
              <motion.span 
                className="text-sm font-bold text-white bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] px-3 py-1 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
              {current + 1} / {questions.length}
              </motion.span>
          </div>
            <div className="relative w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-[#2ad17e] via-[#5cd3ff] to-[#ffb21e] h-full rounded-full relative"
              style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Animated Glow */}
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full"
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
          </div>
          </motion.div>

        {/* Question Card */}
          <motion.div 
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-8 overflow-hidden relative"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.01 }}
          >
            {/* Header */}
            <motion.div 
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-lg font-bold text-white">
              Question {current + 1}
            </span>
              </motion.div>
              
            {q.category && (
                <motion.span 
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#6f5af6] to-[#9f7aea] text-white text-sm font-semibold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.0, type: "spring", stiffness: 300 }}
                  whileHover={{ scale: 1.1 }}
                >
                {q.category}
                </motion.span>
            )}
            </motion.div>
          
          {/* Question Text */}
            <motion.h2 
              className="text-2xl font-bold mb-6 leading-relaxed text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              {parsedQuestion?.text}
            </motion.h2>
          
          {/* Code Snippet (if present) */}
          {parsedQuestion?.hasCode && (
              <motion.div 
                className="mb-8 rounded-2xl overflow-hidden border-2 border-white/20 bg-[#0a0a0a]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.02 }}
              >
              {/* Code Editor Header */}
                <motion.div 
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border-b border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                >
                  <div className="flex gap-2">
                    <motion.span 
                      className="h-3 w-3 rounded-full bg-[#ff5f56]"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0, type: "tween" }}
                    />
                    <motion.span 
                      className="h-3 w-3 rounded-full bg-[#ffbd2e]"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.2, type: "tween" }}
                    />
                    <motion.span 
                      className="h-3 w-3 rounded-full bg-[#27c93f]"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.4, type: "tween" }}
                    />
              </div>
                  <span className="ml-2 text-sm text-white/70 font-mono">javascript</span>
                </motion.div>
                
              {/* Code Content */}
                <motion.pre 
                  className="p-6 bg-[#1a1a1a] overflow-x-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                >
                <code className="text-sm font-mono text-white/90 leading-relaxed">
                  {parsedQuestion.code}
                </code>
                </motion.pre>
              </motion.div>
            )}
            
            {/* Answer Options */}
            <motion.div 
              className="space-y-4 mb-8"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: parsedQuestion?.hasCode ? 1.8 : 1.2
                  }
                }
              }}
            >
            {q.options.map((opt, i) => (
                <motion.button
                key={i}
                onClick={() => setSelected(i)}
                  className={`group relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                  selected === i
                      ? "bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white border-[#2ad17e] shadow-2xl shadow-[#2ad17e]/20"
                      : "bg-gradient-to-br from-white/10 to-white/5 border-white/20 text-white hover:border-white/40 hover:from-white/15 hover:to-white/10"
                  }`}
                  variants={{
                    hidden: { opacity: 0, x: -50, scale: 0.9 },
                    visible: { opacity: 1, x: 0, scale: 1 }
                  }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {/* Background Pattern */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)`
                    }}
                  />
                  
                  <div className="relative flex items-center gap-4">
                    <motion.div 
                      className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                        selected === i 
                          ? 'bg-white/20 text-white shadow-lg' 
                          : 'bg-gradient-to-r from-white/20 to-white/10 text-white/80'
                      }`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                    {String.fromCharCode(65 + i)}
                    </motion.div>
                    
                    <motion.span 
                      className="flex-1 font-medium"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {opt}
                    </motion.span>

                    {/* Selection Indicator */}
                    <AnimatePresence>
                      {selected === i && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <CheckCircle className="w-6 h-6 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                </div>

                  {/* Hover Particles */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {[...Array(2)].map((_, particleIndex) => (
                      <motion.div
                        key={particleIndex}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${30 + particleIndex * 40}%`,
                          top: `${20 + particleIndex * 40}%`,
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: particleIndex * 0.3,
                          type: "tween"
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.button>
              ))}
            </motion.div>
            
            {/* Action Section */}
            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: parsedQuestion?.hasCode ? 2.2 : 1.8 }}
            >
              <motion.div 
                className="flex items-center gap-2 text-sm text-white/80"
                animate={{ 
                  opacity: selected !== null ? [1, 0.8, 1] : [0.6, 1, 0.6] 
                }}
                transition={{ duration: 2, repeat: Infinity, type: "tween" }}
              >
                {selected !== null ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-[#2ad17e]" />
                    Answer selected
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    Select an answer to continue
                  </>
                )}
              </motion.div>
              
              <motion.button
            onClick={handleNext}
            disabled={selected === null}
                className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white font-bold shadow-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ 
                  scale: selected !== null ? 1.05 : 1,
                  boxShadow: selected !== null ? "0 20px 40px rgba(42, 209, 126, 0.3)" : undefined
                }}
                whileTap={{ scale: selected !== null ? 0.95 : 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <motion.span className="relative z-10 flex items-center gap-2">
                  {current + 1 === questions.length ? "Finish Quiz" : "Next Question"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.span>
                
                {/* Animated Background */}
                {selected !== null && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#20c997] to-[#2ad17e]"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                
                {/* Particles */}
                {selected !== null && (
                  <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${20 + i * 30}%`,
                          top: `${30 + i * 20}%`,
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                          type: "tween"
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.button>
            </motion.div>

            {/* Decorative Corner Elements */}
            <motion.div 
              className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r from-white/20 to-white/30 opacity-30"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute bottom-4 left-4 w-4 h-4 rounded-full bg-gradient-to-r from-[#2ad17e]/30 to-[#5cd3ff]/30"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, type: "tween" }}
            />
          </motion.div>

        {/* Quick Stats */}
          <motion.div 
            className="mt-8 grid grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: parsedQuestion?.hasCode ? 2.6 : 2.2, staggerChildren: 0.1 }}
          >
            <motion.div 
              className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-6 text-center relative overflow-hidden"
              whileHover={{ y: -5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div 
                className="text-3xl font-bold text-[#2ad17e] mb-2"
                animate={{ 
                  scale: [1, 1.1, 1],
                  textShadow: ["0px 0px 0px rgba(42, 209, 126, 0)", "0px 0px 20px rgba(42, 209, 126, 0.5)", "0px 0px 0px rgba(42, 209, 126, 0)"]
                }}
                transition={{ duration: 2, repeat: Infinity, type: "tween" }}
              >
                {score}
              </motion.div>
              <div className="text-sm text-white/80 font-medium">Correct</div>
              
              {/* Background Decoration */}
              <motion.div 
                className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#2ad17e]/30"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, type: "tween" }}
              />
            </motion.div>
            
            <motion.div 
              className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-6 text-center relative overflow-hidden"
              whileHover={{ y: -5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div 
                className="text-3xl font-bold text-[#ffb21e] mb-2"
                animate={{ 
                  scale: [1, 1.1, 1],
                  textShadow: ["0px 0px 0px rgba(255, 178, 30, 0)", "0px 0px 20px rgba(255, 178, 30, 0.5)", "0px 0px 0px rgba(255, 178, 30, 0)"]
                }}
                transition={{ duration: 2.5, repeat: Infinity, type: "tween" }}
              >
                {current - score}
              </motion.div>
              <div className="text-sm text-white/80 font-medium">Incorrect</div>
              
              {/* Background Decoration */}
              <motion.div 
                className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#ffb21e]/30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2.3, repeat: Infinity, type: "tween" }}
              />
            </motion.div>
            
            <motion.div 
              className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-6 text-center relative overflow-hidden"
              whileHover={{ y: -5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div 
                className="text-3xl font-bold text-[#5cd3ff] mb-2"
                animate={{ 
                  scale: [1, 1.1, 1],
                  textShadow: ["0px 0px 0px rgba(92, 211, 255, 0)", "0px 0px 20px rgba(92, 211, 255, 0.5)", "0px 0px 0px rgba(92, 211, 255, 0)"]
                }}
                transition={{ duration: 1.8, repeat: Infinity, type: "tween" }}
              >
                {questions.length - current - 1}
              </motion.div>
              <div className="text-sm text-white/80 font-medium">Remaining</div>
              
              {/* Background Decoration */}
              <motion.div 
                className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#5cd3ff]/30"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.7, repeat: Infinity, type: "tween" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
