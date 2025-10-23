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
  TrendingUp,
  ArrowRight,
  Rocket
} from "lucide-react";
import LearningModule from "@/components/LearningModule";
import LearningResources from "@/components/LearningResources";

interface Profile {
  id: string;
  name: string;
  icon: string;
  description: string;
  skills: string[];
  color: string;
}

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

const profiles: Profile[] = [
  {
    id: "frontend",
    name: "Frontend Developer",
    icon: "⚛️",
    description: "Web development with React, Vue, Angular",
    skills: ["React", "JavaScript", "CSS", "UI/UX", "HTML"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "backend",
    name: "Backend Developer",
    icon: "☕",
    description: "Server-side development with Java, Node, Python",
    skills: ["Node.js", "Java", "Python", "Databases", "APIs"],
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "fullstack",
    name: "Full Stack Developer",
    icon: "🔗",
    description: "Complete web development across all layers",
    skills: ["React", "Node.js", "Databases", "DevOps", "System Design"],
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "mobile",
    name: "Mobile Developer",
    icon: "📱",
    description: "iOS and Android app development",
    skills: ["React Native", "Swift", "Kotlin", "Mobile UI", "Performance"],
    color: "from-orange-500 to-red-500"
  },
  {
    id: "product",
    name: "Product Manager",
    icon: "📊",
    description: "Product strategy and management skills",
    skills: ["Roadmapping", "Analytics", "User Research", "Strategy", "Leadership"],
    color: "from-indigo-500 to-blue-500"
  },
  {
    id: "devops",
    name: "DevOps Engineer",
    icon: "⚙️",
    description: "Infrastructure and deployment",
    skills: ["Docker", "Kubernetes", "CI/CD", "Cloud", "Monitoring"],
    color: "from-yellow-500 to-orange-500"
  }
];

const levelOptions = [
  { id: "junior", label: "Junior (0-2 years)", duration: "8-12 weeks", difficulty: "Easy" },
  { id: "mid", label: "Mid-level (2-5 years)", duration: "12-16 weeks", difficulty: "Medium" },
  { id: "senior", label: "Senior (5+ years)", duration: "16-20 weeks", difficulty: "Hard" }
];

const generatePrepPlan = (profileId: string, levelId: string): SDEPlan => {
  const profile = profiles.find(p => p.id === profileId);
  const level = levelOptions.find(l => l.id === levelId);
  
  if (!profile || !level) {
    throw new Error("Invalid profile or level");
  }

  const frameworksByProfile = {
    frontend: [
      {
        name: "React Fundamentals",
        icon: "⚛️",
        description: "Master React core concepts",
        topics: ["Components", "Hooks", "State Management", "Routing", "Performance"]
      },
      {
        name: "JavaScript Mastery",
        icon: "📜",
        description: "Advanced JavaScript concepts",
        topics: ["Async/Await", "Closures", "Prototypes", "ES6+", "Functional Programming"]
      },
      {
        name: "CSS & Styling",
        icon: "🎨",
        description: "Modern styling techniques",
        topics: ["Flexbox", "Grid", "Animations", "Responsive Design", "Tailwind CSS"]
      },
      {
        name: "Testing & Quality",
        icon: "✅",
        description: "Ensure code quality",
        topics: ["Unit Testing", "Integration Testing", "E2E Testing", "Debugging"]
      }
    ],
    backend: [
      {
        name: "Node.js & Express",
        icon: "🟢",
        description: "Server-side JavaScript",
        topics: ["Express", "Middleware", "REST APIs", "Authentication", "Error Handling"]
      },
      {
        name: "Databases",
        icon: "🗄️",
        description: "Data persistence",
        topics: ["SQL", "NoSQL", "Schema Design", "Indexing", "Performance"]
      },
      {
        name: "System Design",
        icon: "🏗️",
        description: "Large-scale systems",
        topics: ["Architecture", "Scalability", "Caching", "Microservices"]
      },
      {
        name: "DevOps & Deployment",
        icon: "🚀",
        description: "Deploy and maintain",
        topics: ["Docker", "CI/CD", "Monitoring", "Logging"]
      }
    ],
    fullstack: [
      {
        name: "Full Stack Architecture",
        icon: "🏗️",
        description: "End-to-end development",
        topics: ["Frontend Architecture", "Backend APIs", "Database Design", "DevOps"]
      },
      {
        name: "React & Node.js",
        icon: "🔗",
        description: "JavaScript everywhere",
        topics: ["React", "Express", "Async patterns", "Real-time updates"]
      },
      {
        name: "System Optimization",
        icon: "⚡",
        description: "Performance at scale",
        topics: ["Caching", "CDN", "Database Optimization", "Frontend Performance"]
      },
      {
        name: "Security & Best Practices",
        icon: "🔒",
        description: "Secure applications",
        topics: ["Authentication", "Encryption", "SQL Injection Prevention", "CORS"]
      }
    ],
    mobile: [
      {
        name: "React Native Basics",
        icon: "📱",
        description: "Cross-platform development",
        topics: ["Components", "Navigation", "Native APIs", "State Management"]
      },
      {
        name: "Platform-Specific Skills",
        icon: "🔧",
        description: "iOS and Android",
        topics: ["Swift", "Kotlin", "Native Modules", "Platform APIs"]
      },
      {
        name: "Performance & UX",
        icon: "⚡",
        description: "Smooth mobile experience",
        topics: ["Animations", "Memory Management", "Network Optimization"]
      },
      {
        name: "App Deployment",
        icon: "📦",
        description: "Release to app stores",
        topics: ["App Store Submission", "Google Play", "Beta Testing", "Analytics"]
      }
    ],
    product: [
      {
        name: "Product Strategy",
        icon: "🎯",
        description: "Vision and roadmap",
        topics: ["Market Analysis", "User Research", "Positioning", "Roadmapping"]
      },
      {
        name: "Metrics & Analytics",
        icon: "📊",
        description: "Data-driven decisions",
        topics: ["KPIs", "Funnels", "Cohort Analysis", "A/B Testing"]
      },
      {
        name: "Stakeholder Management",
        icon: "👥",
        description: "Lead cross-functional teams",
        topics: ["Communication", "Prioritization", "Conflict Resolution", "Leadership"]
      },
      {
        name: "Product Management Tools",
        icon: "🛠️",
        description: "PM toolbox",
        topics: ["PRD Writing", "User Stories", "Roadmap Tools", "Feedback Loops"]
      }
    ],
    devops: [
      {
        name: "Containerization",
        icon: "🐳",
        description: "Docker & container orchestration",
        topics: ["Docker", "Kubernetes", "Container Registry", "Networking"]
      },
      {
        name: "CI/CD Pipelines",
        icon: "🔄",
        description: "Automated deployments",
        topics: ["GitHub Actions", "GitLab CI", "Jenkins", "Artifact Management"]
      },
      {
        name: "Cloud Platforms",
        icon: "☁️",
        description: "AWS, Azure, GCP",
        topics: ["Compute", "Storage", "Networking", "Cost Optimization"]
      },
      {
        name: "Monitoring & Observability",
        icon: "📈",
        description: "System health",
        topics: ["Logging", "Metrics", "Tracing", "Alerting"]
      }
    ]
  };

  const selectedFrameworks = (frameworksByProfile[profileId as keyof typeof frameworksByProfile] || []).map((fw, idx) => ({
    id: `${profileId}-fw-${idx}`,
    name: fw.name,
    icon: fw.icon,
    description: fw.description,
    totalXp: 0,
    completedLevels: 0,
    levels: fw.topics.map((topic, topicIdx) => ({
      id: `${profileId}-level-${idx}-${topicIdx}`,
      title: topic,
      description: `Master ${topic}`,
      duration: levelId === "junior" ? "1-2 weeks" : levelId === "mid" ? "2-3 weeks" : "3-4 weeks",
      difficulty: levelId === "junior" ? "Easy" as const : levelId === "mid" ? "Medium" as const : "Hard" as const,
      topics: [topic],
      completed: false,
      locked: topicIdx > 0,
      xp: levelId === "junior" ? 50 + topicIdx * 10 : levelId === "mid" ? 100 + topicIdx * 20 : 150 + topicIdx * 30
    }))
  }));

  return {
    id: `${profileId}-${levelId}`,
    title: `${profile.name} - ${level.label}`,
    description: `Personalized prep plan for ${profile.name}`,
    icon: profile.icon,
    frameworks: selectedFrameworks,
    totalXp: selectedFrameworks.reduce((sum, fw) => sum + fw.levels.reduce((s, l) => s + l.xp, 0), 0),
    estimatedDuration: level.duration
  };
};

export default function PrepPlansPage() {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [personalizedPlan, setPersonalizedPlan] = useState<SDEPlan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<{[key: string]: boolean}>({});
  const [userXp, setUserXp] = useState(0);

  useEffect(() => {
    const savedProgress = localStorage.getItem('prep-plans-progress');
    const savedXp = localStorage.getItem('prep-plans-xp');
    
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
    if (savedXp) {
      setUserXp(parseInt(savedXp));
    }
  }, []);

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfile(profileId);
    setSelectedLevel(null);
    setPersonalizedPlan(null);
  };

  const handleLevelSelect = (levelId: string) => {
    setSelectedLevel(levelId);
    const plan = generatePrepPlan(selectedProfile!, levelId);
    setPersonalizedPlan(plan);
  };

  const handleLevelComplete = (levelId: string, xp: number) => {
    setUserProgress(prev => ({ ...prev, [levelId]: true }));
    setUserXp(prev => prev + xp);
    
    localStorage.setItem('prep-plans-progress', JSON.stringify({ ...userProgress, [levelId]: true }));
    localStorage.setItem('prep-plans-xp', (userXp + xp).toString());
  };

  const getLevelStatus = (level: Level) => {
    if (userProgress[level.id]) return 'completed';
    if (level.locked) return 'locked';
    return 'available';
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="w-full max-w-7xl px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            🎯 Personalized Prep Plans
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Select your profile and level to get a customized learning path
          </p>
          
          {/* Progress Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="bg-[color:var(--surface)] rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">Total XP</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {userXp}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Selection */}
        {!selectedProfile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Step 1: Select Your Profile</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {profiles.map((profile, index) => (
                <motion.button
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleProfileSelect(profile.id)}
                  className="text-left"
                >
                  <div className={`bg-gradient-to-br ${profile.color} rounded-2xl p-6 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 h-full transform hover:scale-105`}>
                    <div className="text-4xl mb-4">{profile.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{profile.name}</h3>
                    <p className="text-white/80 mb-4">{profile.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-xs bg-white/10 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : !selectedLevel ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => setSelectedProfile(null)}
              className="mb-8 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Change Profile
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center">
              Step 2: Select Your Level
            </h2>
            
            {(() => {
              const profile = profiles.find(p => p.id === selectedProfile);
              return (
                <div className="mb-12">
                  <div className="text-center mb-8">
                    <div className="text-5xl mb-4">{profile?.icon}</div>
                    <h3 className="text-3xl font-bold mb-2">{profile?.name}</h3>
                    <p className="text-white/70">{profile?.description}</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {levelOptions.map((level, index) => (
                      <motion.button
                        key={level.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleLevelSelect(level.id)}
                        className="text-left"
                      >
                        <div className="bg-[color:var(--surface)] rounded-2xl p-6 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 h-full transform hover:scale-105">
                          <div className="text-3xl mb-4">
                            {level.id === "junior" ? "🌱" : level.id === "mid" ? "🚀" : "🏆"}
                          </div>
                          <h3 className="text-2xl font-bold mb-4">{level.label}</h3>
                          <div className="space-y-2 text-sm text-white/70">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {level.duration}
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              {level.difficulty}
                            </div>
                          </div>
                          <div className="mt-6 flex items-center justify-between">
                            <span className="text-xs bg-blue-500/20 px-3 py-1 rounded">
                              Get Started
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        ) : personalizedPlan ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-8 flex gap-4">
              <button
                onClick={() => setSelectedLevel(null)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                ← Change Level
              </button>
              <button
                onClick={() => setSelectedProfile(null)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                ← Change Profile
              </button>
            </div>

            {/* Personalized Plan Header */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-8 mb-8 border border-white/20">
              <div className="flex items-start gap-6">
                <div className="text-5xl">{personalizedPlan.icon}</div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{personalizedPlan.title}</h2>
                  <p className="text-white/70 mb-4">{personalizedPlan.description}</p>
                  <div className="flex gap-8">
                    <div>
                      <div className="text-sm text-white/60 mb-1">Duration</div>
                      <div className="text-lg font-bold text-cyan-400">{personalizedPlan.estimatedDuration}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60 mb-1">Total XP</div>
                      <div className="text-lg font-bold text-yellow-400">{personalizedPlan.totalXp} XP</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60 mb-1">Topics</div>
                      <div className="text-lg font-bold text-green-400">{personalizedPlan.frameworks.length} tracks</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Tracks */}
            <h3 className="text-2xl font-bold mb-6">Learning Tracks</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {personalizedPlan.frameworks.map((framework, idx) => (
                <motion.div
                  key={framework.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[color:var(--surface)] rounded-2xl p-6 backdrop-blur-sm border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{framework.icon}</div>
                    <div>
                      <h4 className="text-xl font-bold">{framework.name}</h4>
                      <p className="text-sm text-white/70">{framework.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {framework.levels.map((level, levelIdx) => {
                      const status = getLevelStatus(level);
                      return (
                        <motion.div
                          key={level.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: levelIdx * 0.05 }}
                          className={`p-3 rounded-lg border transition-all ${
                            status === 'completed' 
                              ? 'bg-green-500/20 border-green-500/50' 
                              : status === 'locked'
                              ? 'bg-gray-500/20 border-gray-500/50 opacity-50'
                              : 'bg-white/5 border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : status === 'locked' ? (
                                <Lock className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Play className="w-4 h-4 text-blue-400" />
                              )}
                              <span className="text-sm font-medium">{level.title}</span>
                            </div>
                            <span className="text-xs text-yellow-400">{level.xp} XP</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="text-xs text-white/60 text-center pt-4 border-t border-white/10">
                    {framework.levels.length} topics in this track
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Start Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <button
                onClick={() => setSelectedPlan(personalizedPlan.id)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
              >
                <Rocket className="w-5 h-5" />
                Start Learning Journey
              </button>
            </motion.div>
          </motion.div>
        ) : null}

        {/* Learning Resources */}
        {!selectedProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <LearningResources />
          </motion.div>
        )}
      </div>
    </div>
  );
}