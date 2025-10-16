"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Star, 
  BookOpen, 
  Code, 
  Target, 
  Clock, 
  CheckCircle, 
  Lock,
  Play,
  Award,
  Zap,
  Users,
  TrendingUp
} from "lucide-react";
import LearningModule from "@/components/LearningModule";
import LearningResources from "@/components/LearningResources";

interface Level {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  completed: boolean;
  locked: boolean;
  xp: number;
}

interface Framework {
  id: string;
  name: string;
  icon: string;
  description: string;
  levels: Level[];
  totalXp: number;
  completedLevels: number;
}

interface SDEPlan {
  id: string;
  title: string;
  description: string;
  icon: string;
  frameworks: Framework[];
  totalXp: number;
  estimatedDuration: string;
}

const prepPlans: SDEPlan[] = [
  {
    id: "sde1",
    title: "SDE 1 (0-2 years)",
    description: "Entry-level software engineer preparation",
    icon: "🌱",
    totalXp: 0,
    estimatedDuration: "8-12 weeks",
    frameworks: [
      {
        id: "react-sde1",
        name: "React Fundamentals",
        icon: "⚛️",
        description: "Master React basics for SDE 1 level",
        totalXp: 0,
        completedLevels: 0,
        levels: [
          {
            id: "react-basics",
            title: "React Basics",
            description: "Components, JSX, Props, State",
            duration: "2 weeks",
            difficulty: "Easy",
            topics: ["JSX", "Components", "Props", "State", "Event Handling"],
            completed: false,
            locked: false,
            xp: 100
          },
          {
            id: "react-hooks",
            title: "React Hooks",
            description: "useState, useEffect, custom hooks",
            duration: "2 weeks",
            difficulty: "Medium",
            topics: ["useState", "useEffect", "useContext", "Custom Hooks"],
            completed: false,
            locked: true,
            xp: 150
          },
          {
            id: "react-routing",
            title: "React Router",
            description: "Navigation and routing in React",
            duration: "1 week",
            difficulty: "Medium",
            topics: ["React Router", "Navigation", "Route Parameters"],
            completed: false,
            locked: true,
            xp: 120
          }
        ]
      },
      {
        id: "react-native-sde1",
        name: "React Native Basics",
        icon: "📱",
        description: "Mobile development with React Native",
        totalXp: 0,
        completedLevels: 0,
        levels: [
          {
            id: "rn-setup",
            title: "React Native Setup",
            description: "Environment setup and first app",
            duration: "1 week",
            difficulty: "Easy",
            topics: ["Environment Setup", "Expo", "First App", "Debugging"],
            completed: false,
            locked: false,
            xp: 80
          },
          {
            id: "rn-navigation",
            title: "Navigation",
            description: "Navigation between screens",
            duration: "2 weeks",
            difficulty: "Medium",
            topics: ["Stack Navigator", "Tab Navigator", "Navigation Props"],
            completed: false,
            locked: true,
            xp: 130
          }
        ]
      }
    ]
  },
  {
    id: "sde2",
    title: "SDE 2 (2-5 years)",
    description: "Mid-level software engineer preparation",
    icon: "🚀",
    totalXp: 0,
    estimatedDuration: "12-16 weeks",
    frameworks: [
      {
        id: "react-sde2",
        name: "Advanced React",
        icon: "⚛️",
        description: "Advanced React patterns and optimization",
        totalXp: 0,
        completedLevels: 0,
        levels: [
          {
            id: "react-performance",
            title: "Performance Optimization",
            description: "Memoization, lazy loading, code splitting",
            duration: "3 weeks",
            difficulty: "Hard",
            topics: ["React.memo", "useMemo", "useCallback", "Code Splitting"],
            completed: false,
            locked: false,
            xp: 200
          },
          {
            id: "react-testing",
            title: "Testing React Apps",
            description: "Unit testing, integration testing",
            duration: "2 weeks",
            difficulty: "Medium",
            topics: ["Jest", "React Testing Library", "Mocking", "E2E Testing"],
            completed: false,
            locked: true,
            xp: 180
          }
        ]
      },
      {
        id: "react-native-sde2",
        name: "Advanced React Native",
        icon: "📱",
        description: "Advanced mobile development patterns",
        totalXp: 0,
        completedLevels: 0,
        levels: [
          {
            id: "rn-performance",
            title: "Performance Optimization",
            description: "Optimizing React Native apps",
            duration: "3 weeks",
            difficulty: "Hard",
            topics: ["FlatList Optimization", "Image Optimization", "Memory Management"],
            completed: false,
            locked: false,
            xp: 220
          }
        ]
      }
    ]
  },
  {
    id: "sde3",
    title: "SDE 3 (5+ years)",
    description: "Senior software engineer preparation",
    icon: "🏆",
    totalXp: 0,
    estimatedDuration: "16-20 weeks",
    frameworks: [
      {
        id: "react-sde3",
        name: "React Architecture",
        icon: "⚛️",
        description: "Large-scale React applications",
        totalXp: 0,
        completedLevels: 0,
        levels: [
          {
            id: "react-architecture",
            title: "System Architecture",
            description: "Designing large-scale React applications",
            duration: "4 weeks",
            difficulty: "Hard",
            topics: ["Micro-frontends", "State Management", "API Design", "Scalability"],
            completed: false,
            locked: false,
            xp: 300
          }
        ]
      },
      {
        id: "react-native-sde3",
        name: "React Native Architecture",
        icon: "📱",
        description: "Enterprise mobile app development",
        totalXp: 0,
        completedLevels: 0,
        levels: [
          {
            id: "rn-architecture",
            title: "Mobile Architecture",
            description: "Designing scalable mobile applications",
            duration: "4 weeks",
            difficulty: "Hard",
            topics: ["Native Modules", "Bridge Communication", "Performance", "Security"],
            completed: false,
            locked: false,
            xp: 350
          }
        ]
      }
    ]
  }
];

export default function PrepPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<{[key: string]: boolean}>({});
  const [userXp, setUserXp] = useState(0);

  useEffect(() => {
    // Load user progress from localStorage
    const savedProgress = localStorage.getItem('prep-plans-progress');
    const savedXp = localStorage.getItem('prep-plans-xp');
    
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
    if (savedXp) {
      setUserXp(parseInt(savedXp));
    }
  }, []);

  const handleLevelComplete = (levelId: string, xp: number) => {
    setUserProgress(prev => ({ ...prev, [levelId]: true }));
    setUserXp(prev => prev + xp);
    
    // Save to localStorage
    localStorage.setItem('prep-plans-progress', JSON.stringify({ ...userProgress, [levelId]: true }));
    localStorage.setItem('prep-plans-xp', (userXp + xp).toString());
  };

  const getLevelStatus = (level: Level) => {
    if (userProgress[level.id]) return 'completed';
    if (level.locked) return 'locked';
    return 'available';
  };

  const getTotalCompletedLevels = () => {
    return Object.values(userProgress).filter(Boolean).length;
  };

  const getTotalXp = () => {
    return userXp;
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="w-full max-w-7xl">
        <div className="card p-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            🎯 Prep Plans
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Gamified learning paths for frontend engineers
          </p>
          
          {/* Progress Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="bg-[color:var(--surface)] rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">Levels Completed</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {getTotalCompletedLevels()}
              </div>
            </div>
            <div className="bg-[color:var(--surface)] rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">Total XP</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {getTotalXp()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* SDE Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {prepPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[color:var(--surface)] rounded-2xl p-6 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{plan.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                <p className="text-white/70 mb-4">{plan.description}</p>
                <div className="flex justify-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {plan.estimatedDuration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {plan.frameworks.length} tracks
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Plan Details */}
        <AnimatePresence>
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[color:var(--surface)] rounded-2xl p-6 backdrop-blur-sm border border-white/20 mb-8"
            >
              {(() => {
                const plan = prepPlans.find(p => p.id === selectedPlan);
                if (!plan) return null;

                return (
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-3xl">{plan.icon}</div>
                      <div>
                        <h2 className="text-3xl font-bold">{plan.title}</h2>
                        <p className="text-white/70">{plan.description}</p>
                      </div>
                    </div>

                    {/* Framework Tracks */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {plan.frameworks.map((framework, index) => (
                        <motion.div
                          key={framework.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/5 rounded-xl p-4 border border-white/10"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="text-2xl">{framework.icon}</div>
                            <div>
                              <h3 className="text-xl font-bold">{framework.name}</h3>
                              <p className="text-white/70 text-sm">{framework.description}</p>
                            </div>
                          </div>

                          {/* Levels */}
                          <div className="space-y-3">
                            {framework.levels.map((level, levelIndex) => {
                              const status = getLevelStatus(level);
                              return (
                                <motion.div
                                  key={level.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: levelIndex * 0.05 }}
                                  className={`p-3 rounded-lg border transition-all duration-200 ${
                                    status === 'completed' 
                                      ? 'bg-green-500/20 border-green-500/50' 
                                      : status === 'locked'
                                      ? 'bg-gray-500/20 border-gray-500/50 opacity-50'
                                      : 'bg-white/5 border-white/20 hover:bg-[color:var(--surface)]'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {status === 'completed' ? (
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                      ) : status === 'locked' ? (
                                        <Lock className="w-5 h-5 text-gray-400" />
                                      ) : (
                                        <Play className="w-5 h-5 text-blue-400" />
                                      )}
                                      <h4 className="font-semibold">{level.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">
                                        {level.difficulty}
                                      </span>
                                      <span className="text-xs text-yellow-400">
                                        {level.xp} XP
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-white/70 mb-2">{level.description}</p>
                                  
                                  <div className="flex items-center gap-4 text-xs text-white/60">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {level.duration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <BookOpen className="w-3 h-3" />
                                      {level.topics.length} topics
                                    </span>
                                  </div>

                                  {/* Topics */}
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {level.topics.map((topic, topicIndex) => (
                                      <span
                                        key={topicIndex}
                                        className="text-xs bg-[color:var(--surface)] px-2 py-1 rounded"
                                      >
                                        {topic}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Action Button */}
                                  {status === 'available' && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => setSelectedLevel(level.id)}
                                      className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                                    >
                                      Start Learning
                                    </motion.button>
                                  )}
                                  
                                  {status === 'completed' && (
                                    <div className="mt-3 flex items-center gap-2 text-green-400">
                                      <CheckCircle className="w-4 h-4" />
                                      <span className="text-sm">Completed!</span>
                                    </div>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Learning Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <LearningResources />
        </motion.div>

        {/* Learning Module */}
        <AnimatePresence>
          {selectedLevel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8"
            >
              {(() => {
                // Find the selected level data
                let levelData = null;
                for (const plan of prepPlans) {
                  for (const framework of plan.frameworks) {
                    const level = framework.levels.find(l => l.id === selectedLevel);
                    if (level) {
                      levelData = level;
                      break;
                    }
                  }
                  if (levelData) break;
                }

                if (!levelData) return null;

                return (
                  <LearningModule
                    levelId={levelData.id}
                    title={levelData.title}
                    description={levelData.description}
                    topics={levelData.topics}
                    difficulty={levelData.difficulty}
                    duration={levelData.duration}
                    xp={levelData.xp}
                    onComplete={(xp) => {
                      handleLevelComplete(levelData.id, xp);
                      setSelectedLevel(null);
                    }}
                  />
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}