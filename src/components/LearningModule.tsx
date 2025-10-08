"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  Play, 
  BookOpen, 
  Code, 
  Video, 
  FileText,
  Trophy,
  Star,
  Clock,
  Target
} from "lucide-react";

interface LearningContent {
  id: string;
  type: "video" | "article" | "coding" | "quiz";
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  xp: number;
  url: string;
}

interface LearningModuleProps {
  levelId: string;
  title: string;
  description: string;
  topics: string[];
  difficulty: string;
  duration: string;
  xp: number;
  onComplete: (xp: number) => void;
}

const learningContent: {[key: string]: LearningContent[]} = {
  "react-basics": [
    {
      id: "jsx-intro",
      type: "video",
      title: "Introduction to JSX",
      description: "Learn the fundamentals of JSX syntax and how it works with React",
      duration: "15 min",
      completed: false,
      xp: 25,
      url: "https://www.youtube.com/watch?v=7Mp1A5p2qV4"
    },
    {
      id: "components-basics",
      type: "article",
      title: "React Components",
      description: "Understanding functional and class components",
      duration: "20 min",
      completed: false,
      xp: 30,
      url: "https://react.dev/learn/your-first-component"
    },
    {
      id: "props-state",
      type: "coding",
      title: "Props and State",
      description: "Hands-on coding exercise with props and state management",
      duration: "30 min",
      completed: false,
      xp: 40,
      url: "https://react.dev/learn/passing-props-to-a-component"
    },
    {
      id: "event-handling",
      type: "quiz",
      title: "Event Handling Quiz",
      description: "Test your knowledge of React event handling",
      duration: "10 min",
      completed: false,
      xp: 20,
      url: "https://react.dev/learn/responding-to-events"
    }
  ],
  "react-hooks": [
    {
      id: "usestate-hook",
      type: "video",
      title: "useState Hook",
      description: "Master the useState hook for state management",
      duration: "20 min",
      completed: false,
      xp: 35,
      url: "https://www.youtube.com/watch?v=O6P86uwfdR0"
    },
    {
      id: "useeffect-hook",
      type: "article",
      title: "useEffect Hook",
      description: "Understanding side effects and lifecycle in functional components",
      duration: "25 min",
      completed: false,
      xp: 40,
      url: "https://react.dev/reference/react/useEffect"
    },
    {
      id: "custom-hooks",
      type: "coding",
      title: "Custom Hooks",
      description: "Build your own custom hooks for reusable logic",
      duration: "45 min",
      completed: false,
      xp: 50,
      url: "https://react.dev/learn/reusing-logic-with-custom-hooks"
    }
  ],
  "react-routing": [
    {
      id: "router-setup",
      type: "video",
      title: "React Router Setup",
      description: "Learn how to set up React Router for navigation",
      duration: "20 min",
      completed: false,
      xp: 35,
      url: "https://www.youtube.com/watch?v=Ul3y1LXxzdU"
    },
    {
      id: "router-basics",
      type: "article",
      title: "React Router Basics",
      description: "Understanding routes, links, and navigation",
      duration: "25 min",
      completed: false,
      xp: 40,
      url: "https://reactrouter.com/en/main/start/tutorial"
    },
    {
      id: "router-advanced",
      type: "coding",
      title: "Advanced Routing",
      description: "Nested routes, route parameters, and protected routes",
      duration: "40 min",
      completed: false,
      xp: 50,
      url: "https://reactrouter.com/en/main/route/route"
    }
  ],
  "rn-setup": [
    {
      id: "rn-environment",
      type: "video",
      title: "React Native Environment Setup",
      description: "Set up your development environment for React Native",
      duration: "30 min",
      completed: false,
      xp: 40,
      url: "https://www.youtube.com/watch?v=0-S5a0eXPoc"
    },
    {
      id: "rn-first-app",
      type: "article",
      title: "Your First React Native App",
      description: "Create your first React Native application",
      duration: "20 min",
      completed: false,
      xp: 30,
      url: "https://reactnative.dev/docs/environment-setup"
    },
    {
      id: "rn-debugging",
      type: "coding",
      title: "Debugging React Native",
      description: "Learn debugging techniques and tools",
      duration: "25 min",
      completed: false,
      xp: 35,
      url: "https://reactnative.dev/docs/debugging"
    }
  ],
  "rn-navigation": [
    {
      id: "rn-stack-nav",
      type: "video",
      title: "Stack Navigator",
      description: "Learn React Navigation stack navigator",
      duration: "25 min",
      completed: false,
      xp: 40,
      url: "https://www.youtube.com/watch?v=9Xa4kSBW9vI"
    },
    {
      id: "rn-tab-nav",
      type: "article",
      title: "Tab Navigator",
      description: "Implement tab-based navigation",
      duration: "20 min",
      completed: false,
      xp: 35,
      url: "https://reactnavigation.org/docs/tab-based-navigation"
    },
    {
      id: "rn-nav-params",
      type: "coding",
      title: "Navigation Parameters",
      description: "Pass data between screens",
      duration: "30 min",
      completed: false,
      xp: 45,
      url: "https://reactnavigation.org/docs/params"
    }
  ],
  "react-performance": [
    {
      id: "react-memo",
      type: "video",
      title: "React.memo Optimization",
      description: "Learn how to optimize components with React.memo",
      duration: "25 min",
      completed: false,
      xp: 50,
      url: "https://www.youtube.com/watch?v=7TaBhrnPH78"
    },
    {
      id: "usememo-callback",
      type: "article",
      title: "useMemo and useCallback",
      description: "Optimize expensive calculations and functions",
      duration: "30 min",
      completed: false,
      xp: 60,
      url: "https://react.dev/reference/react/useMemo"
    },
    {
      id: "code-splitting",
      type: "coding",
      title: "Code Splitting",
      description: "Implement lazy loading and code splitting",
      duration: "40 min",
      completed: false,
      xp: 70,
      url: "https://react.dev/reference/react/lazy"
    }
  ],
  "react-testing": [
    {
      id: "jest-basics",
      type: "video",
      title: "Jest Testing Basics",
      description: "Learn Jest testing framework fundamentals",
      duration: "30 min",
      completed: false,
      xp: 50,
      url: "https://www.youtube.com/watch?v=7r4xVDI2vho"
    },
    {
      id: "rtl-basics",
      type: "article",
      title: "React Testing Library",
      description: "Test React components with RTL",
      duration: "35 min",
      completed: false,
      xp: 60,
      url: "https://testing-library.com/docs/react-testing-library/intro"
    },
    {
      id: "testing-patterns",
      type: "coding",
      title: "Testing Patterns",
      description: "Common testing patterns and best practices",
      duration: "45 min",
      completed: false,
      xp: 70,
      url: "https://kentcdodds.com/blog/common-mistakes-with-react-testing-library"
    }
  ],
  "rn-performance": [
    {
      id: "rn-flatlist",
      type: "video",
      title: "FlatList Optimization",
      description: "Optimize FlatList performance for large datasets",
      duration: "30 min",
      completed: false,
      xp: 60,
      url: "https://www.youtube.com/watch?v=W_Si1WJ8X5Y"
    },
    {
      id: "rn-image-opt",
      type: "article",
      title: "Image Optimization",
      description: "Optimize images in React Native apps",
      duration: "25 min",
      completed: false,
      xp: 50,
      url: "https://reactnative.dev/docs/image"
    },
    {
      id: "rn-memory",
      type: "coding",
      title: "Memory Management",
      description: "Handle memory efficiently in React Native",
      duration: "40 min",
      completed: false,
      xp: 70,
      url: "https://reactnative.dev/docs/performance"
    }
  ],
  "react-architecture": [
    {
      id: "micro-frontends",
      type: "video",
      title: "Micro-frontends Architecture",
      description: "Design large-scale applications with micro-frontends",
      duration: "45 min",
      completed: false,
      xp: 80,
      url: "https://www.youtube.com/watch?v=lKKsjpH09dU"
    },
    {
      id: "state-management",
      type: "article",
      title: "Advanced State Management",
      description: "Redux, Zustand, and other state management solutions",
      duration: "50 min",
      completed: false,
      xp: 90,
      url: "https://redux.js.org/introduction/getting-started"
    },
    {
      id: "api-design",
      type: "coding",
      title: "API Design Patterns",
      description: "Design robust APIs for React applications",
      duration: "60 min",
      completed: false,
      xp: 100,
      url: "https://restfulapi.net/"
    }
  ],
  "rn-architecture": [
    {
      id: "rn-native-modules",
      type: "video",
      title: "Native Modules",
      description: "Create custom native modules for React Native",
      duration: "50 min",
      completed: false,
      xp: 90,
      url: "https://www.youtube.com/watch?v=0MlT74VlLFE"
    },
    {
      id: "rn-bridge",
      type: "article",
      title: "Bridge Communication",
      description: "Understand React Native bridge architecture",
      duration: "40 min",
      completed: false,
      xp: 80,
      url: "https://reactnative.dev/docs/communication-android"
    },
    {
      id: "rn-security",
      type: "coding",
      title: "Mobile Security",
      description: "Implement security best practices in React Native",
      duration: "55 min",
      completed: false,
      xp: 100,
      url: "https://reactnative.dev/docs/security"
    }
  ]
};

export default function LearningModule({ 
  levelId, 
  title, 
  description, 
  topics, 
  difficulty, 
  duration, 
  xp, 
  onComplete 
}: LearningModuleProps) {
  const [currentContent, setCurrentContent] = useState<LearningContent | null>(null);
  const [completedContent, setCompletedContent] = useState<{[key: string]: boolean}>({});
  const [showModule, setShowModule] = useState(true); // Start with module open

  const content = learningContent[levelId] || [];
  const completedCount = Object.values(completedContent).filter(Boolean).length;
  const progress = content.length > 0 ? (completedCount / content.length) * 100 : 0;

  const handleContentComplete = (contentId: string, contentXp: number) => {
    setCompletedContent(prev => ({ ...prev, [contentId]: true }));
    
    // Check if all content is completed
    const newCompleted = { ...completedContent, [contentId]: true };
    const allCompleted = content.every(item => newCompleted[item.id]);
    
    if (allCompleted) {
      onComplete(xp);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-5 h-5 text-red-400" />;
      case "article": return <FileText className="w-5 h-5 text-blue-400" />;
      case "coding": return <Code className="w-5 h-5 text-green-400" />;
      case "quiz": return <Target className="w-5 h-5 text-purple-400" />;
      default: return <BookOpen className="w-5 h-5 text-gray-400" />;
    }
  };

  if (!showModule) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowModule(true)}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5" />
        Start Learning Module
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20"
    >
      {/* Module Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold">{title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
              difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {difficulty}
            </span>
          </div>
          <p className="text-white/70">{description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {duration}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              {xp} XP
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowModule(false)}
          className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
        >
          ✕ Close Module
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-white/70">{completedCount}/{content.length} completed</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Topics */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Topics Covered:</h4>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic, index) => (
            <span
              key={index}
              className="bg-white/10 px-3 py-1 rounded-full text-sm"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Learning Content */}
      <div className="space-y-4">
        {content.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              completedContent[item.id]
                ? 'bg-green-500/20 border-green-500/50'
                : 'bg-white/5 border-white/20 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {getContentIcon(item.type)}
                <h4 className="font-semibold">{item.title}</h4>
                {completedContent[item.id] && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/10 px-2 py-1 rounded">
                  {item.duration}
                </span>
                <span className="text-xs text-yellow-400">
                  {item.xp} XP
                </span>
              </div>
            </div>
            
            <p className="text-sm text-white/70 mb-3">{item.description}</p>
            
            {!completedContent[item.id] && (
              <div className="flex gap-2">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2"
                >
                  {item.type === 'video' && '▶ Watch Video'}
                  {item.type === 'article' && '📖 Read Article'}
                  {item.type === 'coding' && '💻 Start Coding'}
                  {item.type === 'quiz' && '🎯 Take Quiz'}
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleContentComplete(item.id, item.xp)}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2"
                >
                  ✓ Mark Complete
                </motion.button>
              </div>
            )}
            
            {completedContent[item.id] && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Completed!</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Completion Status */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 border border-green-500/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h4 className="text-lg font-bold">Level Completed!</h4>
          </div>
          <p className="text-sm text-white/70 mb-3">
            Congratulations! You've earned {xp} XP and completed this level.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">+{xp} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm">{duration}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
