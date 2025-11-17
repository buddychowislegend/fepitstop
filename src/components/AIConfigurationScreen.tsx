"use client";
import { useState, useEffect } from "react";
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
  Monitor,
  Briefcase,
  Activity,
  TrendingUp,
  Eye,
  UserCheck,
  Plus,
  Edit3,
  Globe,
  Sparkles,
  X,
  Trash2
} from "lucide-react";

interface ScreeningDetails {
  positionTitle: string;
  language: string;
  mustHaves: string[];
  goodToHaves: string[];
  culturalFit: string[];
  estimatedTime: {
    mustHaves: number;
    goodToHaves: number;
    culturalFit: number;
  };
  jobDescription: string;
  questions: string[];
}

interface AIConfigurationScreenProps {
  aiPrompt: string;
  onBack: () => void;
  onCreateDrive: (details: ScreeningDetails) => void;
  hideJDGeneration?: boolean;
}

const languages = [
  { code: 'en-us', name: 'US English', flag: '🇺🇸' },
  { code: 'en-uk', name: 'UK English', flag: '🇬🇧' },
  { code: 'en-au', name: 'Australia English', flag: '🇦🇺' },
  { code: 'en-in', name: 'India English', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' }
];

const AIConfigurationScreen = ({ aiPrompt, onBack, onCreateDrive, hideJDGeneration = false }: AIConfigurationScreenProps) => {
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

  const [screeningDetails, setScreeningDetails] = useState<ScreeningDetails>({
    positionTitle: '',
    language: 'en-us',
    mustHaves: [],
    goodToHaves: [],
    culturalFit: [],
    estimatedTime: {
      mustHaves: 0,
      goodToHaves: 0,
      culturalFit: 0
    },
    jobDescription: '',
    questions: []
  });
  const [isGenerating, setIsGenerating] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    generateScreeningDetails();
  }, [aiPrompt]);

  // Auto-generate questions when hideJDGeneration is true (AI Assistant mode)
  useEffect(() => {
    if (hideJDGeneration && screeningDetails.jobDescription.trim() && screeningDetails.questions.length === 0 && !isGeneratingQuestions && !isGenerating) {
      const generateQuestionsAuto = async () => {
        setIsGeneratingQuestions(true);
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
          const response = await fetch(`${backendUrl}/api/company/drives/generate-questions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Company-ID': 'hireog',
              'X-Company-Password': 'manasi22'
            },
            credentials: 'include',
            body: JSON.stringify({
              jobDescription: screeningDetails.jobDescription
            })
          });

          if (response.ok) {
            const data = await response.json();
            setScreeningDetails(prev => ({
              ...prev,
              questions: data.questions || []
            }));
          }
        } catch (error) {
          console.error('Error auto-generating questions:', error);
        } finally {
          setIsGeneratingQuestions(false);
        }
      };
      generateQuestionsAuto();
    }
  }, [hideJDGeneration, screeningDetails.jobDescription, screeningDetails.questions.length, isGeneratingQuestions, isGenerating]);

  const generateScreeningDetails = async () => {
    try {
      setIsGenerating(true);
      
      // Call AI API to generate screening details
      const response = await fetch('/api/ai-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate a comprehensive screening assessment for: ${aiPrompt}. 
          Please provide:
          1. Position title
          2. Must-have technical skills (3-5 items)
          3. Good-to-have skills (3-5 items) 
          4. Cultural fit attributes (2-3 items)
          5. Estimated time for each section
          
          Format as JSON with this structure:
          {
            "positionTitle": "string",
            "mustHaves": ["skill1", "skill2", "skill3"],
            "goodToHaves": ["skill1", "skill2", "skill3"],
            "culturalFit": ["attribute1", "attribute2"],
            "estimatedTime": {
              "mustHaves": 4,
              "goodToHaves": 2,
              "culturalFit": 2
            }
          }`
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        let generatedDetails;
        try {
          // Parse the response as JSON
          generatedDetails = JSON.parse(data.response || '{}');
        } catch (parseError) {
          console.error('Failed to parse API response as JSON:', parseError);
          // If parsing fails, try to use the response directly
          generatedDetails = data.response || {};
        }
        
        setScreeningDetails({
          positionTitle: generatedDetails.positionTitle || extractPositionFromPrompt(),
          language: 'en-us',
          mustHaves: generatedDetails.mustHaves || getDefaultMustHaves(),
          goodToHaves: generatedDetails.goodToHaves || getDefaultGoodToHaves(),
          culturalFit: generatedDetails.culturalFit || getDefaultCulturalFit(),
          estimatedTime: generatedDetails.estimatedTime || {
            mustHaves: 4,
            goodToHaves: 2,
            culturalFit: 2
          },
          jobDescription: aiPrompt || '',
          questions: []
        });
      } else {
        // Fallback to default values
        setScreeningDetails({
          positionTitle: extractPositionFromPrompt(),
          language: 'en-us',
          mustHaves: getDefaultMustHaves(),
          goodToHaves: getDefaultGoodToHaves(),
          culturalFit: getDefaultCulturalFit(),
          estimatedTime: {
            mustHaves: 4,
            goodToHaves: 2,
            culturalFit: 2
          },
          jobDescription: aiPrompt || '',
          questions: []
        });
      }
    } catch (error) {
      console.error('Error generating screening details:', error);
      // Fallback to default values
      setScreeningDetails({
        positionTitle: extractPositionFromPrompt(),
        language: 'en-us',
        mustHaves: getDefaultMustHaves(),
        goodToHaves: getDefaultGoodToHaves(),
        culturalFit: getDefaultCulturalFit(),
        estimatedTime: {
          mustHaves: 4,
          goodToHaves: 2,
          culturalFit: 2
        },
        jobDescription: aiPrompt || '',
        questions: []
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const extractPositionFromPrompt = () => {
    const lowerPrompt = aiPrompt.toLowerCase();
    if (lowerPrompt.includes('backend')) return 'Backend Developer';
    if (lowerPrompt.includes('frontend')) return 'Frontend Developer';
    if (lowerPrompt.includes('full stack')) return 'Full Stack Developer';
    if (lowerPrompt.includes('devops')) return 'DevOps Engineer';
    if (lowerPrompt.includes('mobile')) return 'Mobile Developer';
    if (lowerPrompt.includes('product')) return 'Product Manager';
    return 'Software Engineer';
  };

  const getDefaultMustHaves = () => {
    const lowerPrompt = aiPrompt.toLowerCase();
    if (lowerPrompt.includes('backend')) {
      return [
        '5+ years backend development experience',
        'Proficient in Python or Java',
        'RESTful API development expertise',
        'Database design and optimization',
        'Version control with Git'
      ];
    }
    if (lowerPrompt.includes('frontend')) {
      return [
        '5+ years frontend development experience',
        'Proficient in React or Vue.js',
        'JavaScript ES6+ expertise',
        'CSS/SCSS and responsive design',
        'Version control with Git'
      ];
    }
    return [
      '5+ years software development experience',
      'Strong programming fundamentals',
      'Problem-solving skills',
      'Version control with Git',
      'Agile development experience'
    ];
  };

  const getDefaultGoodToHaves = () => {
    const lowerPrompt = aiPrompt.toLowerCase();
    if (lowerPrompt.includes('backend')) {
      return [
        'Experience with Docker/Kubernetes',
        'Familiarity with SQL and NoSQL databases',
        'Knowledge of microservices architecture',
        'Cloud platform experience (AWS/Azure/GCP)',
        'CI/CD pipeline experience'
      ];
    }
    if (lowerPrompt.includes('frontend')) {
      return [
        'Experience with state management (Redux/Vuex)',
        'Testing frameworks (Jest/Cypress)',
        'Build tools (Webpack/Vite)',
        'TypeScript experience',
        'Performance optimization skills'
      ];
    }
    return [
      'Cloud platform experience',
      'Containerization knowledge',
      'Testing frameworks experience',
      'Performance optimization',
      'Security best practices'
    ];
  };

  const getDefaultCulturalFit = () => {
    return [
      'Strong communication skills',
      'Willingness to mentor junior developers',
      'Collaborative team player',
      'Adaptability to new technologies',
      'Problem-solving mindset'
    ];
  };

  const handleCreateDrive = async () => {
    if (!hideJDGeneration && !screeningDetails.questions.length) {
      alert('Please generate or add at least one interview question.');
      return;
    }
    setIsCreating(true);
    try {
      await onCreateDrive(screeningDetails);
    } finally {
      setIsCreating(false);
    }
  };

  const addRequirement = (section: 'mustHaves' | 'goodToHaves' | 'culturalFit') => {
    const newRequirement = prompt(`Add a new ${section.replace(/([A-Z])/g, ' $1').toLowerCase()} requirement:`);
    if (newRequirement && newRequirement.trim()) {
      setScreeningDetails(prev => ({
        ...prev,
        [section]: [...prev[section], newRequirement.trim()]
      }));
    }
  };

  const removeRequirement = (section: 'mustHaves' | 'goodToHaves' | 'culturalFit', index: number) => {
    setScreeningDetails(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const clearSection = (section: 'mustHaves' | 'goodToHaves' | 'culturalFit') => {
    if (confirm(`Clear all ${section.replace(/([A-Z])/g, ' $1').toLowerCase()}?`)) {
      setScreeningDetails(prev => ({
        ...prev,
        [section]: []
      }));
    }
  };

  const handleGenerateQuestions = async () => {
    if (!screeningDetails.jobDescription.trim()) {
      alert('Please paste a job description first.');
      return;
    }

    setIsGeneratingQuestions(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      const response = await fetch(`${backendUrl}/api/company/drives/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22'
        },
        credentials: 'include',
        body: JSON.stringify({
          jobDescription: screeningDetails.jobDescription
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate questions');
      }

      const data = await response.json();
      setScreeningDetails(prev => ({
        ...prev,
        questions: data.questions || []
      }));
    } catch (error: any) {
      console.error('Error generating questions:', error);
      alert(error?.message || 'Failed to generate questions. Please try again.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setScreeningDetails(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion.trim()]
    }));
    setNewQuestion('');
  };

  const handleRemoveQuestion = (index: number) => {
    setScreeningDetails(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  if (isGenerating) {
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

          {/* Floating AI Icons */}
          {[Brain, Sparkles, Target, Lightbulb, Settings].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10"
              style={{
                left: `${15 + i * 18}%`,
                top: `${10 + i * 20}%`,
              }}
              animate={{
                y: [-15, 15, -15],
                rotate: [0, 360, 0],
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
            {/* AI Brain Icon */}
            <motion.div
              className="relative w-20 h-20 mx-auto mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] rounded-2xl flex items-center justify-center shadow-2xl"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, type: "tween" }
                }}
              >
                <Brain className="w-10 h-10 text-white" />
              </motion.div>
              
              {/* Orbiting Particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-[#ffb21e] to-[#ff6b6b] rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    x: '-50%',
                    y: '-50%',
                    transformOrigin: `${30 + i * 8}px center`
                  }}
                  animate={{
                    rotate: 360,
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    rotate: { 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "linear",
                      delay: i * 0.5 
                    },
                    scale: { 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.3,
                      type: "tween"
                    }
                  }}
                />
              ))}
            </motion.div>

            {/* Title */}
            <motion.h2 
              className="text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="bg-gradient-to-r from-[#2ad17e] via-[#5cd3ff] to-[#ffb21e] bg-clip-text text-transparent">
                Generating AI Screening
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p 
              className="text-white/80 text-lg mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Creating your personalized screening assessment...
            </motion.p>

            {/* Progress Dots */}
            <motion.div 
              className="flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff]"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#2ad17e]/15 to-[#ffb21e]/15 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-[#6f5af6]/15 to-[#5cd3ff]/15 rounded-full blur-3xl"
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

        {/* Floating Configuration Icons */}
        {[Settings, Brain, CheckCircle, Globe, Edit3].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-white/8"
            style={{
              left: `${10 + i * 20}%`,
              top: `${15 + i * 15}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              rotate: [0, 10, -10, 0],
              opacity: [0.08, 0.2, 0.08],
            }}
            transition={{
              duration: 6 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              type: "tween"
            }}
          >
            <Icon className="w-18 h-18" />
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="relative z-10 max-w-5xl mx-auto px-6 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <motion.div 
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="flex items-center justify-center gap-4 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <motion.div 
              className="w-12 h-12 bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] rounded-2xl flex items-center justify-center shadow-2xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Settings className="w-6 h-6 text-white" />
            </motion.div>
            <motion.h1 
              className="text-4xl font-bold"
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
                AI Screening Configuration
              </span>
            </motion.h1>
          </motion.div>
          <motion.p 
            className="text-white/80 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Review and modify the screening details
          </motion.p>
        </motion.div>

        {/* Position Title */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.label 
            className="flex items-center gap-2 text-sm font-semibold text-white mb-3"
            whileHover={{ scale: 1.02 }}
          >
            <Briefcase className="w-4 h-4 text-[#2ad17e]" />
            Position Title
          </motion.label>
          <motion.input
            type="text"
            value={screeningDetails.positionTitle}
            onChange={(e) => setScreeningDetails(prev => ({ ...prev, positionTitle: e.target.value }))}
            className="w-full px-6 py-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20 rounded-2xl focus:border-[#2ad17e] focus:outline-none text-white placeholder-white/60 text-lg transition-all duration-300"
            placeholder="Enter position title"
            whileFocus={{ 
              scale: 1.02,
              boxShadow: "0 0 30px rgba(42, 209, 126, 0.3)"
            }}
          />
        </motion.div>

        {/* Interview Language & Accent */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.label 
            className="flex items-center gap-2 text-sm font-semibold text-white mb-4"
            whileHover={{ scale: 1.02 }}
          >
            <Globe className="w-4 h-4 text-[#5cd3ff]" />
            Interview Language & Accent
          </motion.label>
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
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
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                onClick={() => setScreeningDetails(prev => ({ ...prev, language: lang.code }))}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-300 ${
                  screeningDetails.language === lang.code
                    ? 'bg-gradient-to-r from-[#2ad17e] to-[#20c997] border-[#2ad17e] text-white shadow-xl shadow-[#2ad17e]/20'
                    : 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 text-white hover:border-white/40 hover:from-white/15'
                }`}
                variants={{
                  hidden: { opacity: 0, scale: 0.8, y: 20 },
                  visible: { opacity: 1, scale: 1, y: 0 }
                }}
                whileHover={{ 
                  y: -2, 
                  scale: 1.05,
                  boxShadow: screeningDetails.language === lang.code 
                    ? "0 20px 40px rgba(42, 209, 126, 0.3)"
                    : "0 10px 25px rgba(255,255,255,0.1)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span 
                  className="text-xl"
                  animate={{ rotate: screeningDetails.language === lang.code ? [0, 10, -10, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {lang.flag}
                </motion.span>
                <span className="text-sm font-medium">{lang.name}</span>
                
                {/* Selection Indicator */}
                <AnimatePresence>
                  {screeningDetails.language === lang.code && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <CheckCircle className="w-4 h-4 text-[#2ad17e]" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hover Particles */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  {[...Array(2)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: `${30 + i * 40}%`,
                        top: `${40 + i * 20}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                        type: "tween"
                      }}
                    />
                  ))}
                </motion.div>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Must Haves */}
        <motion.div 
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border-2 border-white/20 p-8 mb-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 25px 50px rgba(42, 209, 126, 0.1)"
          }}
        >
          {/* Background Pattern */}
          <motion.div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(42, 209, 126, 0.3) 0%, transparent 50%)`
            }}
          />

          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4 }}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-r from-[#2ad17e] to-[#20c997] rounded-2xl flex items-center justify-center shadow-lg"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, type: "tween" }
                }}
                whileHover={{ scale: 1.2 }}
              >
                <CheckCircle className="w-6 h-6 text-white" />
              </motion.div>
              <motion.h3 
                className="text-2xl font-bold text-white"
                whileHover={{ scale: 1.05 }}
              >
                Must Haves
              </motion.h3>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => clearSection('mustHaves')}
                className="flex items-center gap-2 text-white/70 hover:text-white text-xs px-3 py-1 rounded-lg border border-white/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Trash2 className="w-3 h-3" /> Clear all
              </motion.button>
              <motion.div
                className="flex items-center gap-2 bg-gradient-to-r from-[#2ad17e]/20 to-[#20c997]/20 px-4 py-2 rounded-xl border border-[#2ad17e]/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.6, type: "spring", stiffness: 300 }}
              >
                <Clock className="w-4 h-4 text-[#2ad17e]" />
                <span className="text-sm font-semibold text-white">{screeningDetails.estimatedTime.mustHaves} min</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.ul 
            className="space-y-3 mb-6"
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
            {screeningDetails.mustHaves.map((item, index) => (
              <motion.li 
                key={index} 
                className="flex items-start gap-4 group"
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0 }
                }}
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="w-3 h-3 bg-gradient-to-r from-[#2ad17e] to-[#20c997] rounded-full mt-2 flex-shrink-0 shadow-lg"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    boxShadow: ["0 0 0 rgba(42, 209, 126, 0)", "0 0 20px rgba(42, 209, 126, 0.5)", "0 0 0 rgba(42, 209, 126, 0)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                />
                <motion.span 
                  className="text-white/90 leading-relaxed group-hover:text-white transition-colors flex-1"
                  initial={{ opacity: 0.9 }}
                  whileHover={{ opacity: 1 }}
                >
                  {item}
                </motion.span>
                <button
                  type="button"
                  onClick={() => removeRequirement('mustHaves', index)}
                  className="opacity-60 hover:opacity-100 text-white/80 bg-white/10 border border-white/20 rounded-md px-2 py-1 text-xs"
                >
                  Remove
                </button>
              </motion.li>
            ))}
          </motion.ul>

          <motion.button
            onClick={() => addRequirement('mustHaves')}
            className="group flex items-center gap-2 text-[#2ad17e] hover:text-[#20c997] text-sm font-semibold transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-6 h-6 bg-gradient-to-r from-[#2ad17e] to-[#20c997] rounded-full flex items-center justify-center"
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Plus className="w-3 h-3 text-white" />
            </motion.div>
            Add more requirements
          </motion.button>

          {/* Corner Decoration */}
          <motion.div 
            className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r from-white/20 to-white/30 opacity-30"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Good to Haves */}
        <motion.div 
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border-2 border-white/20 p-8 mb-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 25px 50px rgba(93, 211, 255, 0.1)"
          }}
        >
          {/* Background Pattern */}
          <motion.div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 80% 50%, rgba(93, 211, 255, 0.3) 0%, transparent 50%)`
            }}
          />

          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6 }}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] rounded-2xl flex items-center justify-center shadow-lg"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 12, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2.5, repeat: Infinity, type: "tween" }
                }}
                whileHover={{ scale: 1.2 }}
              >
                <Plus className="w-6 h-6 text-white" />
              </motion.div>
              <motion.h3 
                className="text-2xl font-bold text-white"
                whileHover={{ scale: 1.05 }}
              >
                Good to Haves
              </motion.h3>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => clearSection('goodToHaves')}
                className="flex items-center gap-2 text-white/70 hover:text-white text-xs px-3 py-1 rounded-lg border border-white/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.8 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Trash2 className="w-3 h-3" /> Clear all
              </motion.button>
              <motion.div
                className="flex items-center gap-2 bg-gradient-to-r from-[#5cd3ff]/20 to-[#6f5af6]/20 px-4 py-2 rounded-xl border border-[#5cd3ff]/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.8, type: "spring", stiffness: 300 }}
              >
                <Clock className="w-4 h-4 text-[#5cd3ff]" />
                <span className="text-sm font-semibold text-white">{screeningDetails.estimatedTime.goodToHaves} min</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.ul 
            className="space-y-3 mb-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 2.0
                }
              }
            }}
          >
            {screeningDetails.goodToHaves.map((item, index) => (
              <motion.li 
                key={index} 
                className="flex items-start gap-4 group"
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0 }
                }}
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="w-3 h-3 bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] rounded-full mt-2 flex-shrink-0 shadow-lg"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    boxShadow: ["0 0 0 rgba(93, 211, 255, 0)", "0 0 20px rgba(93, 211, 255, 0.5)", "0 0 0 rgba(93, 211, 255, 0)"]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, type: "tween" }}
                />
                <motion.span 
                  className="text-white/90 leading-relaxed group-hover:text-white transition-colors flex-1"
                  initial={{ opacity: 0.9 }}
                  whileHover={{ opacity: 1 }}
                >
                  {item}
                </motion.span>
                <button
                  type="button"
                  onClick={() => removeRequirement('goodToHaves', index)}
                  className="opacity-60 hover:opacity-100 text-white/80 bg-white/10 border border-white/20 rounded-md px-2 py-1 text-xs"
                >
                  Remove
                </button>
              </motion.li>
            ))}
          </motion.ul>

          <motion.button
            onClick={() => addRequirement('goodToHaves')}
            className="group flex items-center gap-2 text-[#5cd3ff] hover:text-[#6f5af6] text-sm font-semibold transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4 }}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-6 h-6 bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] rounded-full flex items-center justify-center"
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            >
              <Plus className="w-3 h-3 text-white" />
            </motion.div>
            Add more skills
          </motion.button>

          {/* Corner Decoration */}
          <motion.div 
            className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r from-white/20 to-white/30 opacity-30"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Cultural Fit */}
        <motion.div 
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border-2 border-white/20 p-8 mb-10 relative overflow-hidden"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 25px 50px rgba(255, 178, 46, 0.1)"
          }}
        >
          {/* Background Pattern */}
          <motion.div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 20%, rgba(255, 178, 46, 0.3) 0%, transparent 50%)`
            }}
          />

          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8 }}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-r from-[#ffb21e] to-[#ff6b6b] rounded-2xl flex items-center justify-center shadow-lg"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 14, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, type: "tween" }
                }}
                whileHover={{ scale: 1.2 }}
              >
                <Users className="w-6 h-6 text-white" />
              </motion.div>
              <motion.h3 
                className="text-2xl font-bold text-white"
                whileHover={{ scale: 1.05 }}
              >
                Cultural Fit
              </motion.h3>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => clearSection('culturalFit')}
                className="flex items-center gap-2 text-white/70 hover:text-white text-xs px-3 py-1 rounded-lg border border-white/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Trash2 className="w-3 h-3" /> Clear all
              </motion.button>
              <motion.div
                className="flex items-center gap-2 bg-gradient-to-r from-[#ffb21e]/20 to-[#ff6b6b]/20 px-4 py-2 rounded-xl border border-[#ffb21e]/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.0, type: "spring", stiffness: 300 }}
              >
                <Clock className="w-4 h-4 text-[#ffb21e]" />
                <span className="text-sm font-semibold text-white">{screeningDetails.estimatedTime.culturalFit} min</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.ul 
            className="space-y-3 mb-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 2.2
                }
              }
            }}
          >
            {screeningDetails.culturalFit.map((item, index) => (
              <motion.li 
                key={index} 
                className="flex items-start gap-4 group"
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0 }
                }}
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="w-3 h-3 bg-gradient-to-r from-[#ffb21e] to-[#ff6b6b] rounded-full mt-2 flex-shrink-0 shadow-lg"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    boxShadow: ["0 0 0 rgba(255, 178, 46, 0)", "0 0 20px rgba(255, 178, 46, 0.5)", "0 0 0 rgba(255, 178, 46, 0)"]
                  }}
                  transition={{ duration: 3, repeat: Infinity, type: "tween" }}
                />
                <motion.span 
                  className="text-white/90 leading-relaxed group-hover:text-white transition-colors flex-1"
                  initial={{ opacity: 0.9 }}
                  whileHover={{ opacity: 1 }}
                >
                  {item}
                </motion.span>
                <button
                  type="button"
                  onClick={() => removeRequirement('culturalFit', index)}
                  className="opacity-60 hover:opacity-100 text-white/80 bg-white/10 border border-white/20 rounded-md px-2 py-1 text-xs"
                >
                  Remove
                </button>
              </motion.li>
            ))}
          </motion.ul>

          <motion.button
            onClick={() => addRequirement('culturalFit')}
            className="group flex items-center gap-2 text-[#ffb21e] hover:text-[#ff6b6b] text-sm font-semibold transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6 }}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-6 h-6 bg-gradient-to-r from-[#ffb21e] to-[#ff6b6b] rounded-full flex items-center justify-center"
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Plus className="w-3 h-3 text-white" />
            </motion.div>
            Add cultural attributes
          </motion.button>

          {/* Corner Decoration */}
          <motion.div 
            className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r from-white/20 to-white/30 opacity-30"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* JD & Question Generation */}
        {!hideJDGeneration && (
        <motion.div
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border-2 border-white/20 p-8 mb-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 2.4, type: "spring", stiffness: 200 }}
        >
          <motion.div 
            className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.5 }}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] rounded-2xl flex items-center justify-center shadow-lg"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, type: "tween" }
                }}
                whileHover={{ scale: 1.2 }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <motion.h3 
                  className="text-2xl font-bold text-white"
                  whileHover={{ scale: 1.05 }}
                >
                  AI Question Builder
                </motion.h3>
                <p className="text-white/70 text-sm max-w-md">
                  Paste the job description to generate tailored interview questions. You can edit or add custom questions before launching the drive.
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={handleGenerateQuestions}
              disabled={isGeneratingQuestions || !screeningDetails.jobDescription.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              whileHover={{ scale: isGeneratingQuestions ? 1 : 1.05 }}
              whileTap={{ scale: isGeneratingQuestions ? 1 : 0.95 }}
            >
              {isGeneratingQuestions ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Settings className="w-4 h-4" />
                  </motion.div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Questions
                </>
              )}
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.7 }}
            >
              <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#5cd3ff]" />
                Job Description
              </label>
              <textarea
                value={screeningDetails.jobDescription}
                onChange={(e) => setScreeningDetails(prev => ({ ...prev, jobDescription: e.target.value }))}
                rows={10}
                className="w-full px-5 py-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#5cd3ff] focus:ring-2 focus:ring-[#5cd3ff]/30 transition-all duration-300"
                placeholder="Paste the job description or key responsibilities here..."
              />
              <p className="text-xs text-white/60">
                Tip: include tech stack, experience level, and responsibilities to get more targeted questions.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.9 }}
            >
              <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#6f5af6]" />
                Generated Questions ({screeningDetails.questions.length})
              </label>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {screeningDetails.questions.length === 0 ? (
                  <div className="text-white/50 text-sm bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    {isGeneratingQuestions
                      ? 'Generating questions...'
                      : 'No questions yet. Paste the JD and click "Generate Questions" or add custom ones below.'}
                  </div>
                ) : (
                  screeningDetails.questions.map((question, index) => (
                    <motion.div
                      key={`${question}-${index}`}
                      className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <span className="text-white/60 text-sm mt-1">{index + 1}.</span>
                      <span className="flex-1 text-white/90 text-sm leading-relaxed">{question}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(index)}
                        className="text-white/60 hover:text-red-400 transition-colors"
                        title="Remove question"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddQuestion();
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#6f5af6] focus:ring-2 focus:ring-[#6f5af6]/30 transition-all duration-300 text-sm"
                  placeholder="Add a custom question..."
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-colors"
                >
                  Add
                </button>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-gradient-to-r from-white/20 to-white/30 opacity-30"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8 }}
        >
          <motion.button
            onClick={onBack}
            className="group relative px-8 py-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 text-white font-semibold hover:border-white/40 transition-all duration-300 overflow-hidden"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(255, 255, 255, 0.1)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div className="flex items-center gap-3">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </motion.div>

            {/* Hover Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10"
              initial={{ x: "-100%" }}
              whileHover={{ x: "0%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          <motion.button
            onClick={handleCreateDrive}
            disabled={isCreating || (!hideJDGeneration && screeningDetails.questions.length === 0) || isGeneratingQuestions}
            className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden min-w-[200px]"
            whileHover={{ 
              scale: isCreating ? 1 : 1.05,
              boxShadow: isCreating ? "0 20px 40px rgba(42, 209, 126, 0.3)" : "0 25px 50px rgba(42, 209, 126, 0.4)"
            }}
            whileTap={{ scale: isCreating ? 1 : 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div className="relative z-10 flex items-center justify-center gap-3">
              {isCreating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Settings className="w-5 h-5" />
                  </motion.div>
                  Creating Drive...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create Drive
                </>
              )}
            </motion.div>

            {/* Animated Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#20c997] to-[#2ad17e]"
              initial={{ x: "-100%" }}
              whileHover={{ x: "0%" }}
              transition={{ duration: 0.3 }}
            />

            {/* Success Particles */}
            <AnimatePresence>
              {!isCreating && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + (i % 2) * 40}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        y: [0, -10, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                        type: "tween"
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pulsing Ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-white/30"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                type: "tween"
              }}
            />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AIConfigurationScreen;