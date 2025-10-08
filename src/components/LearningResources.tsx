"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  ExternalLink, 
  Star, 
  Clock, 
  Users,
  Code,
  Video,
  FileText,
  Target,
  Trophy,
  Zap
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "video" | "article" | "course" | "book" | "practice" | "community";
  url: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  source: string;
  xp: number;
}

const learningResources: Resource[] = [
  // React Resources
  {
    id: "react-docs",
    title: "React Official Documentation",
    description: "Comprehensive guide to React from the official team",
    type: "article",
    url: "https://react.dev/",
    duration: "Ongoing",
    difficulty: "Beginner",
    rating: 5,
    source: "React Team",
    xp: 100
  },
  {
    id: "react-tutorial",
    title: "React Tutorial - Tic Tac Toe",
    description: "Interactive tutorial building a tic-tac-toe game",
    type: "practice",
    url: "https://react.dev/learn/tutorial-tic-tac-toe",
    duration: "2 hours",
    difficulty: "Beginner",
    rating: 5,
    source: "React Team",
    xp: 150
  },
  {
    id: "react-patterns",
    title: "React Patterns",
    description: "Common patterns and best practices in React development",
    type: "article",
    url: "https://reactpatterns.com/",
    duration: "3 hours",
    difficulty: "Intermediate",
    rating: 4.8,
    source: "Michael Chan",
    xp: 200
  },
  {
    id: "react-performance",
    title: "React Performance Optimization",
    description: "Advanced techniques for optimizing React applications",
    type: "course",
    url: "https://www.youtube.com/watch?v=BxgvHdP9Z6Y",
    duration: "4 hours",
    difficulty: "Advanced",
    rating: 4.9,
    source: "Ben Awad",
    xp: 300
  },

  // React Native Resources
  {
    id: "rn-docs",
    title: "React Native Documentation",
    description: "Official React Native documentation and guides",
    type: "article",
    url: "https://reactnative.dev/",
    duration: "Ongoing",
    difficulty: "Beginner",
    rating: 5,
    source: "Meta",
    xp: 100
  },
  {
    id: "rn-tutorial",
    title: "React Native Tutorial",
    description: "Build your first React Native app step by step",
    type: "video",
    url: "https://www.youtube.com/watch?v=0-S5a0eXPoc",
    duration: "2.5 hours",
    difficulty: "Beginner",
    rating: 4.7,
    source: "Programming with Mosh",
    xp: 180
  },
  {
    id: "rn-navigation",
    title: "React Navigation",
    description: "Complete guide to navigation in React Native apps",
    type: "course",
    url: "https://reactnavigation.org/",
    duration: "3 hours",
    difficulty: "Intermediate",
    rating: 4.8,
    source: "React Navigation Team",
    xp: 220
  },

  // Testing Resources
  {
    id: "testing-library",
    title: "React Testing Library",
    description: "Simple and complete testing utilities for React",
    type: "article",
    url: "https://testing-library.com/docs/react-testing-library/intro",
    duration: "2 hours",
    difficulty: "Intermediate",
    rating: 4.9,
    source: "Testing Library",
    xp: 150
  },
  {
    id: "jest-docs",
    title: "Jest Documentation",
    description: "JavaScript testing framework documentation",
    type: "article",
    url: "https://jestjs.io/docs/getting-started",
    duration: "3 hours",
    difficulty: "Intermediate",
    rating: 4.8,
    source: "Jest Team",
    xp: 180
  },

  // Advanced Topics
  {
    id: "micro-frontends",
    title: "Micro-frontends Architecture",
    description: "Building scalable frontend applications",
    type: "course",
    url: "https://micro-frontends.org/",
    duration: "6 hours",
    difficulty: "Advanced",
    rating: 4.9,
    source: "Micro Frontends",
    xp: 400
  },
  {
    id: "webpack-guide",
    title: "Webpack Complete Guide",
    description: "Master webpack for modern JavaScript applications",
    type: "course",
    url: "https://webpack.js.org/concepts/",
    duration: "8 hours",
    difficulty: "Advanced",
    rating: 4.7,
    source: "Webpack Team",
    xp: 350
  },

  // Community Resources
  {
    id: "react-community",
    title: "React Community",
    description: "Join the React developer community",
    type: "community",
    url: "https://reactjs.org/community/support.html",
    duration: "Ongoing",
    difficulty: "Beginner",
    rating: 5,
    source: "React Team",
    xp: 50
  },
  {
    id: "stack-overflow",
    title: "Stack Overflow - React",
    description: "Get help from the React community on Stack Overflow",
    type: "community",
    url: "https://stackoverflow.com/questions/tagged/reactjs",
    duration: "Ongoing",
    difficulty: "Beginner",
    rating: 4.8,
    source: "Stack Overflow",
    xp: 30
  },

  // Practice Platforms
  {
    id: "codepen",
    title: "CodePen - React",
    description: "Practice React with online code editor",
    type: "practice",
    url: "https://codepen.io/collection/react",
    duration: "Ongoing",
    difficulty: "Beginner",
    rating: 4.6,
    source: "CodePen",
    xp: 80
  },
  {
    id: "codesandbox",
    title: "CodeSandbox - React",
    description: "Online React development environment",
    type: "practice",
    url: "https://codesandbox.io/s/react",
    duration: "Ongoing",
    difficulty: "Beginner",
    rating: 4.8,
    source: "CodeSandbox",
    xp: 100
  }
];

export default function LearningResources() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All Resources", icon: "📚" },
    { id: "video", name: "Videos", icon: "🎥" },
    { id: "article", name: "Articles", icon: "📄" },
    { id: "course", name: "Courses", icon: "🎓" },
    { id: "practice", name: "Practice", icon: "💻" },
    { id: "community", name: "Community", icon: "👥" }
  ];

  const filteredResources = learningResources.filter(resource => {
    const matchesCategory = selectedCategory === "all" || resource.type === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-5 h-5 text-red-400" />;
      case "article": return <FileText className="w-5 h-5 text-blue-400" />;
      case "course": return <BookOpen className="w-5 h-5 text-purple-400" />;
      case "practice": return <Code className="w-5 h-5 text-green-400" />;
      case "community": return <Users className="w-5 h-5 text-yellow-400" />;
      default: return <BookOpen className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500/20 text-green-400";
      case "Intermediate": return "bg-yellow-500/20 text-yellow-400";
      case "Advanced": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold">Learning Resources</h2>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-blue-400 mb-4"
        />
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getResourceIcon(resource.type)}
                <h3 className="font-semibold text-white">{resource.title}</h3>
              </div>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <p className="text-sm text-white/70 mb-3">{resource.description}</p>

            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                {resource.difficulty}
              </span>
              <span className="text-xs text-white/60">{resource.source}</span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-white/70">{resource.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white/70">{resource.duration}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400 font-medium">{resource.xp} XP</span>
              </div>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Visit
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">No resources found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

