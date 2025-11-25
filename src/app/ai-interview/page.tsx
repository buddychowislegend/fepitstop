"use client";
import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/config";
import AzureTTSPlayer from "@/components/AzureTTSPlayer";
import AntiCheatMonitor, { CheatingIncident } from "@/components/AntiCheatMonitor";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Volume2, VolumeX, Clock, Target, Brain, Star, CheckCircle, Play, Pause, RotateCcw, Camera, Settings, Code, MessageCircle, Wifi, HelpCircle, Lightbulb, List, AlertTriangle, X } from "lucide-react";

type Message = {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  videoBlob?: Blob;
  videoUrl?: string;
};

type Interviewer = {
  id: string;
  name: string;
  role: string;
  company: string;
  experience: string;
  avatar: string;
  specialties: string[];
  gender: 'male' | 'female';
};

type InterviewSession = {
  id: string;
  interviewer: Interviewer;
  level: string;
  focus: string;
  startTime: Date;
  endTime?: Date;
  messages: Message[];
  currentQuestion: number;
  totalQuestions: number;
  score?: number | null;
  feedback?: string;
  status: 'active' | 'completed';
  timeRemaining: number;
};

type ProfileOption = 'frontend' | 'backend' | 'product' | 'business' | 'qa' | 'hr' | 'data';

const FRONTEND_FOCUS_OPTIONS = [
  { id: 'javascript', title: 'JavaScript', desc: 'Core JavaScript concepts', icon: '⚡', gradient: 'from-[#ffb21e] to-[#f59f00]' },
  { id: 'react', title: 'React', desc: 'React ecosystem & patterns', icon: '⚛️', gradient: 'from-[#5cd3ff] to-[#6f5af6]' },
  { id: 'fullstack', title: 'Fullstack', desc: 'Full-stack development', icon: '🌐', gradient: 'from-[#a855f7] to-[#6f5af6]' }
] as const;

const FRONTEND_FRAMEWORKS = ['react', 'react-native', 'vue', 'angular', 'svelte', 'nextjs'] as const;

const PROFILE_FOCUS_MAP: Record<ProfileOption, string> = {
  frontend: 'fullstack',
  backend: 'backend_architecture',
  product: 'product_strategy',
  business: 'business_development',
  qa: 'quality_assurance',
  hr: 'hr_processes',
  data: 'data_analytics'
};

const PROFILE_FRAMEWORK_MAP: Record<ProfileOption, string> = {
  frontend: 'react',
  backend: 'spring_boot',
  product: 'product_management',
  business: 'business_strategy',
  qa: 'qa_automation',
  hr: 'hr_operations',
  data: 'data_tooling'
};

const mapProfileString = (value?: string | null): ProfileOption => {
  const lower = (value || '').toLowerCase();
  if (lower.includes('back')) return 'backend';
  if (lower.includes('product')) return 'product';
  if (lower.includes('hr') || lower.includes('human')) return 'hr';
  if (lower.includes('business') || lower.includes('sales')) return 'business';
  if (lower.includes('qa') || lower.includes('quality') || lower.includes('test')) return 'qa';
  if (lower.includes('data') || lower.includes('analyt')) return 'data';
  return 'frontend';
};

function AIInterviewContent() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Mouse tracking for background animations
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const initialProfile = useMemo(() => mapProfileString(user?.profile), [user?.profile]);
  const [companyParams, setCompanyParams] = useState<{
    token?: string;
    company?: string;
    profile?: ProfileOption;
    level?: 'junior' | 'mid' | 'senior';
    candidateName?: string;
    candidateEmail?: string;
    // Screening configuration
    positionTitle?: string;
    language?: string;
    mustHaves?: string[];
    goodToHaves?: string[];
    culturalFit?: string[];
    estimatedTime?: {
      mustHaves: number;
      goodToHaves: number;
      culturalFit: number;
    };
    // Drive questions
    driveQuestions?: string[];
    driveProfile?: string;
    driveLevel?: 'junior' | 'mid' | 'senior';
    interviewDuration?: number; // Interview duration in minutes
    jobDescription?: string; // Job description for AI question generation
  } | null>(null);
  
  // Track drive questions separately for easier access
  const [driveQuestions, setDriveQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [shouldAutoStart, setShouldAutoStart] = useState(false);
const autoStartTriggeredRef = useRef(false);
  
  // Interview flow states
  const [currentStep, setCurrentStep] = useState<'setup' | 'interviewer-selection' | 'mic-check' | 'interview' | 'thank-you' | 'analysis'>('setup');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [questionAnalysis, setQuestionAnalysis] = useState<any[]>([]);
  // FreeTTS/voice generation loading indicator
  const [isAIAudioLoading, setIsAIAudioLoading] = useState(false);
  // Track latest interviewer gender for TTS selection even if session is not yet set
  const lastInterviewerGenderRef = useRef<'male' | 'female' | null>(null);
  // Listen button state for question audio
  const [isQuestionAudioPlaying, setIsQuestionAudioPlaying] = useState(false);
  const questionAudioRef = useRef<HTMLAudioElement | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<'uploading' | 'analyzing' | 'creating-feedback' | 'complete'>('uploading');
  
  // Voice recognition
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [useAzureSTT, setUseAzureSTT] = useState(true); // Use Azure STT by default
  const [sttSource, setSttSource] = useState<'azure' | 'google' | 'browser' | 'none'>('none');
  const [sttConfidence, setSttConfidence] = useState<number>(0);
  const audioVisualizerRef = useRef<NodeJS.Timeout | null>(null);
  const avatarVideoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const azureAudioChunksRef = useRef<Blob[]>([]);
  const azureMediaRecorderRef = useRef<MediaRecorder | null>(null);
  // Ensure avatar URLs sent to D-ID are absolute and end with image extensions
  const buildAvatarImageUrl = (rawUrl?: string, gender: 'male' | 'female' = 'female'): string => {
    // Prefer local assets placed in public/
    const localFemale = '/female-interviewer.jpg';
    const localMale = '/male-interviewer.jpg';
    // Remote safe fallback image that D-ID accepts
    const didSampleFace = 'https://create-images-results.d-id.com/google-oauth2%7C117408431483365796674/upl_kF-rKCg5Ym8RMgqrXxRnl/image.jpeg';
    const defaultUrl = gender === 'female' ? localFemale : localMale;

    if (!rawUrl) return defaultUrl;

    // If already has valid image extension, accept it (both absolute and relative paths)
    const hasValidExt = /(\.jpg|\.jpeg|\.png)(\?.*)?$/i.test(rawUrl);
    if (hasValidExt) return rawUrl;

    // If it's a relative path without extension, fall back to gender-based image
    if (rawUrl.startsWith('/')) return defaultUrl;

    // Otherwise use gender-based default
    return defaultUrl || didSampleFace;
  };
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const actualSpokenTextRef = useRef<string>(''); // Track actual spoken text
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const currentQuestionStartTimeRef = useRef<Date | null>(null);
  
  // Settings
  const [profile, setProfile] = useState<ProfileOption>(initialProfile);
  const [level, setLevel] = useState<'junior' | 'mid' | 'senior'>('mid');
  const [focus, setFocus] = useState<string>(PROFILE_FOCUS_MAP[initialProfile]);
  const [framework, setFramework] = useState<string>(PROFILE_FRAMEWORK_MAP[initialProfile]);
  const [jdText, setJdText] = useState<string>('');
  const [jdUploading, setJdUploading] = useState<boolean>(false);
  const [selectedInterviewer, setSelectedInterviewer] = useState<Interviewer | null>(null);
  
  // Mic check states
  const [micPermission, setMicPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [micTestPassed, setMicTestPassed] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Timer - use configured duration or default to 20 minutes
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // Default to 20 minutes initially
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update timer when companyParams is set with interviewDuration
  useEffect(() => {
    if (companyParams?.interviewDuration) {
      setTimeRemaining(companyParams.interviewDuration * 60);
    }
  }, [companyParams?.interviewDuration]);
  
  // Anti-cheat monitoring
  const [cheatingIncidents, setCheatingIncidents] = useState<CheatingIncident[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [violations, setViolations] = useState<string[]>([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  
  // Handle cheating incidents
  const handleCheatingIncident = async (incident: CheatingIncident) => {
    setCheatingIncidents(prev => [...prev, incident]);
    
    // Log incident to backend
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      await fetch(`${backendUrl}/api/interview/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session?.id,
          userId: user?.id,
          incident: {
            type: incident.type,
            timestamp: incident.timestamp.toISOString(),
            severity: incident.severity,
            description: incident.description,
            metadata: incident.metadata
          }
        })
      });
    } catch (error) {
      console.error('Error logging incident:', error);
    }
  };
  
  const handleWarning = (message: string) => {
    setWarnings(prev => [...prev, message]);
    setShowWarningModal(true);
    // Auto-hide after 5 seconds
    setTimeout(() => setShowWarningModal(false), 5000);
  };
  
  const handleViolation = (message: string) => {
    setViolations(prev => [...prev, message]);
    setShowViolationModal(true);
    // Violation modal stays open until user acknowledges
  };

  // Available interviewers by profile
  const getInterviewersByProfile = (profile: string): Interviewer[] => {
    const interviewerPools = {
      frontend: [
    {
      id: 'sarah-chen',
      name: 'Sarah Chen',
      role: 'Senior Frontend Engineer',
      company: 'Google',
      experience: '8+ years',
      avatar: '/interviewer-1.jpg',
      specialties: ['React', 'TypeScript', 'System Design'],
          gender: 'female' as const
    },
    {
          id: 'arjun-patel',
          name: 'Arjun Patel',
      role: 'Frontend Tech Lead',
          company: 'Microsoft',
      experience: '10+ years',
      avatar: '/interviewer-2.jpg',
      specialties: ['JavaScript', 'React', 'Performance'],
          gender: 'male' as const
    },
    {
      id: 'priya-sharma',
      name: 'Priya Sharma',
      role: 'Senior Software Engineer',
      company: 'Amazon',
      experience: '6+ years',
      avatar: '/female-interviewer.jpg',
      specialties: ['Full Stack', 'React', 'Node.js'],
          gender: 'female' as const
    },
    {
          id: 'vikram-singh',
          name: 'Vikram Singh',
      role: 'Principal Engineer',
          company: 'Meta',
      experience: '12+ years',
      avatar: '/male-interviewer.jpg',
      specialties: ['Frontend Architecture', 'React', 'Web Performance'],
          gender: 'male' as const
        }
      ],
      backend: [
        {
          id: 'deepika-reddy',
          name: 'Deepika Reddy',
          role: 'Senior Backend Engineer',
          company: 'Google',
          experience: '9+ years',
          avatar: '/interviewer-5.jpg',
          specialties: ['Java', 'Spring Boot', 'Microservices'],
          gender: 'female' as const
        },
        {
          id: 'rajesh-kumar',
          name: 'Walter White',
          role: 'Backend Tech Lead',
          company: 'Amazon',
          experience: '11+ years',
          avatar: '/interviewer-6.jpg',
          specialties: ['Java', 'Spring', 'AWS'],
          gender: 'male' as const
        },
        {
          id: 'Anna Gunn',
          name: 'Anna Gunn',
          role: 'Principal Backend Engineer',
          company: 'Microsoft',
          experience: '13+ years',
          avatar: '/interviewer-7.jpg',
          specialties: ['Java', 'Spring Boot', 'Distributed Systems'],
          gender: 'female' as const
        },
        {
          id: 'Gaurav kapoor',
          name: 'Gaurav Kapoor',
          role: 'Senior Software Engineer',
          company: 'Netflix',
          experience: '7+ years',
          avatar: '/interviewer-8.jpg',
          specialties: ['Java', 'Spring', 'API Design'],
          gender: 'female' as const
        }
      ],
      product: [
        {
          id: 'rohit-agarwal',
          name: 'Rohit Agarwal',
          role: 'Senior Product Manager',
          company: 'Google',
          experience: '8+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Product Strategy', 'User Research', 'Metrics'],
          gender: 'male' as const
        },
        {
          id: 'kavya-nair',
          name: 'Kavya Nair',
          role: 'Principal Product Manager',
          company: 'Meta',
          experience: '10+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Product Vision', 'Growth', 'Analytics'],
          gender: 'female' as const
        },
        {
          id: 'manish-gupta',
          name: 'Manish Gupta',
          role: 'Senior Product Manager',
          company: 'Amazon',
          experience: '9+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Product Planning', 'Stakeholder Management', 'Roadmaps'],
          gender: 'male' as const
        },
        {
          id: 'shreya-bansal',
          name: 'Shreya Bansal',
          role: 'Group Product Manager',
          company: 'Microsoft',
          experience: '12+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Product Leadership', 'Strategy', 'Team Building'],
          gender: 'female' as const
        }
      ],
      business: [
        {
          id: 'aditya-malhotra',
          name: 'Aditya Malhotra',
          role: 'Senior Business Development Manager',
          company: 'Google',
          experience: '8+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Partnerships', 'Sales Strategy', 'Market Analysis'],
          gender: 'male' as const
        },
        {
          id: 'rashmi-iyer',
          name: 'Rashmi Iyer',
          role: 'Business Development Director',
          company: 'Microsoft',
          experience: '11+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Enterprise Sales', 'Strategic Partnerships', 'GTM'],
          gender: 'female' as const
        },
        {
          id: 'nitin-chopra',
          name: 'Nitin Chopra',
          role: 'Senior BD Manager',
          company: 'Amazon',
          experience: '9+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Channel Partnerships', 'Sales Operations', 'Revenue Growth'],
          gender: 'male' as const
        },
        {
          id: 'meera-krishnan',
          name: 'Meera Krishnan',
          role: 'Business Development Lead',
          company: 'Meta',
          experience: '7+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Strategic Sales', 'Partnership Development', 'Market Expansion'],
          gender: 'female' as const
        }
      ],
      qa: [
        {
          id: 'pradeep-sharma',
          name: 'Pradeep Sharma',
          role: 'Senior QA Engineer',
          company: 'Google',
          experience: '8+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Test Automation', 'Quality Strategy', 'Performance Testing'],
          gender: 'male' as const
        },
        {
          id: 'swati-mehta',
          name: 'Swati Mehta',
          role: 'QA Tech Lead',
          company: 'Amazon',
          experience: '10+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Test Engineering', 'CI/CD', 'Quality Assurance'],
          gender: 'female' as const
        },
        {
          id: 'amit-verma',
          name: 'Amit Verma',
          role: 'Principal QA Engineer',
          company: 'Microsoft',
          experience: '12+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Test Architecture', 'Quality Metrics', 'Process Improvement'],
          gender: 'male' as const
        },
        {
          id: 'poonam-singh',
          name: 'Poonam Singh',
          role: 'Senior QA Engineer',
          company: 'Netflix',
          experience: '7+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Manual Testing', 'Test Planning', 'Bug Tracking'],
          gender: 'female' as const
        }
      ],
      hr: [
        {
          id: 'neha-kapoor',
          name: 'Neha Kapoor',
          role: 'Senior HR Manager',
          company: 'Google',
          experience: '9+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Talent Acquisition', 'Culture Building', 'Employee Relations'],
          gender: 'female' as const
        },
        {
          id: 'rahul-jain',
          name: 'Rahul Jain',
          role: 'HR Business Partner',
          company: 'Microsoft',
          experience: '8+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['HR Strategy', 'Performance Management', 'Organizational Development'],
          gender: 'male' as const
        },
        {
          id: 'sneha-reddy',
          name: 'Sneha Reddy',
          role: 'Senior HR Manager',
          company: 'Amazon',
          experience: '10+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Recruitment', 'HR Operations', 'Policy Development'],
          gender: 'female' as const
        },
        {
          id: 'vivek-sharma',
          name: 'Vivek Sharma',
          role: 'HR Director',
          company: 'Meta',
          experience: '12+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Leadership Development', 'Change Management', 'HR Analytics'],
          gender: 'male' as const
        }
      ],
      data: [
        {
          id: 'ananya-iyer',
          name: 'Ananya Iyer',
          role: 'Lead Data Analyst',
          company: 'Google',
          experience: '9+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['SQL', 'Data Modeling', 'A/B Testing'],
          gender: 'female' as const
        },
        {
          id: 'rohan-mehta',
          name: 'Rohan Mehta',
          role: 'Senior Analytics Manager',
          company: 'Amazon',
          experience: '11+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Business Intelligence', 'Forecasting', 'Dashboards'],
          gender: 'male' as const
        },
        {
          id: 'sarah-williams',
          name: 'Sarah Williams',
          role: 'Principal Data Scientist',
          company: 'Meta',
          experience: '10+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Machine Learning', 'Statistics', 'Experimentation'],
          gender: 'female' as const
        },
        {
          id: 'li-wei',
          name: 'Li Wei',
          role: 'Analytics Lead',
          company: 'Netflix',
          experience: '8+ years',
          avatar: '/api/placeholder/200/200',
          specialties: ['Data Storytelling', 'Product Analytics', 'ETL Pipelines'],
          gender: 'male' as const
        }
      ]
    };

    return interviewerPools[profile as keyof typeof interviewerPools] || interviewerPools.frontend;
  };

const selectDefaultInterviewer = (profile: ProfileOption, fallbackInterviewer?: Interviewer | null): Interviewer => {
  const pool = getInterviewersByProfile(profile);
  const chosen =
    pool.find(i => i.gender === 'female') ||
    pool[0] ||
    fallbackInterviewer ||
    {
      id: 'default-female',
      name: 'Sophia',
      role: '',
      company: '',
      experience: '',
      avatar: '/female-interviewer.jpg',
      specialties: [],
      gender: 'female' as const,
    };

  return {
    ...chosen,
    role: '',
    company: '',
    experience: '',
    specialties: [],
  };
};

  const interviewers = getInterviewersByProfile(profile);

  // Reset selected interviewer when profile changes
useEffect(() => {
  if (!companyParams) {
    setSelectedInterviewer(null);
  }
}, [profile, companyParams]);

useEffect(() => {
  if (companyParams) {
    const normalizedProfile = mapProfileString(companyParams.driveProfile || companyParams.profile);
    const defaultInterviewer = selectDefaultInterviewer(normalizedProfile, selectedInterviewer);
    setSelectedInterviewer(defaultInterviewer);
    autoStartTriggeredRef.current = false;
    setShouldAutoStart(true);
  }
}, [companyParams]);

useEffect(() => {
  if (shouldAutoStart && selectedInterviewer && !autoStartTriggeredRef.current) {
    autoStartTriggeredRef.current = true;
    startInterview();
  }
}, [shouldAutoStart, selectedInterviewer]);

  // Sync profile/level with company drive configuration when it arrives
  useEffect(() => {
    if (companyParams) {
      const normalizedProfile = mapProfileString(companyParams.driveProfile || companyParams.profile);
      if (normalizedProfile !== profile) {
        setProfile(normalizedProfile);
        setFocus(PROFILE_FOCUS_MAP[normalizedProfile] || PROFILE_FOCUS_MAP['frontend']);
        setFramework(PROFILE_FRAMEWORK_MAP[normalizedProfile] || PROFILE_FRAMEWORK_MAP['frontend']);
      }

      const driveLevel = companyParams.driveLevel || companyParams.level;
      if (driveLevel && (driveLevel === 'junior' || driveLevel === 'mid' || driveLevel === 'senior')) {
        setLevel(driveLevel);
      }
    }
  }, [companyParams, profile]);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin?redirect=/ai-interview');
    }
  }, [authLoading, user, router]);

  // Handle company interview parameters
  useEffect(() => {
    if (searchParams) {
      const token = searchParams.get('token');
      const company = searchParams.get('company');
      const profile = searchParams.get('profile');
      const level = searchParams.get('level');
      const candidateName = searchParams.get('candidateName');
      const candidateEmail = searchParams.get('candidateEmail');

      if (token && company) {
        // Fetch interview data from backend using token
        const fetchInterviewConfig = async () => {
          try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
            
            // First try to get interview config (for screenings)
            const configResponse = await fetch(`${backendUrl}/api/company/interview/config/${token}`);
            
            if (configResponse.ok) {
              const configData = await configResponse.json();
              const config = configData.config;
              
              // Set company parameters with actual screening configuration
              setDriveQuestions(Array.isArray(config.questions) ? config.questions : []);
              // Use screening profile if available, otherwise derive from position title or candidate profile
              const normalizedConfigProfile = config.profile || mapProfileString(config.positionTitle || config.candidateProfile);
              setCompanyParams({
                token: config.token,
                company: config.companyName,
                profile: normalizedConfigProfile,
                level: (config.experienceLevel || 'mid') as 'junior' | 'mid' | 'senior',
                candidateName: config.candidateName,
                candidateEmail: config.candidateEmail,
                // Include screening configuration
                positionTitle: config.positionTitle,
                language: config.language,
                mustHaves: config.mustHaves,
                goodToHaves: config.goodToHaves,
                culturalFit: config.culturalFit,
                estimatedTime: config.estimatedTime,
                driveQuestions: Array.isArray(config.questions) ? config.questions : [],
                driveProfile: config.profile || normalizedConfigProfile, // Use screening profile
                driveLevel: config.experienceLevel || 'mid',
                interviewDuration: config.interviewDuration || 15, // Use configured duration or default to 15 minutes
                jobDescription: config.jobDescription || '', // Include job description for AI question generation
              });
              
              // Update timer with configured duration
              const duration = config.interviewDuration || 15;
              setTimeRemaining(duration * 60);
              
              // Set job description for AI question generation if no drive questions
              if (config.jobDescription) {
                setJdText(config.jobDescription);
              }

              // Auto-select profile based on screening configuration
              // Use the profile from screening config if available, otherwise derive from position title
              const screeningProfile: ProfileOption = (config.profile || mapProfileString(config.positionTitle)) as ProfileOption;
              setProfile(screeningProfile);
              setFocus(PROFILE_FOCUS_MAP[screeningProfile] || PROFILE_FOCUS_MAP['frontend']);
              setFramework(PROFILE_FRAMEWORK_MAP[screeningProfile] || PROFILE_FRAMEWORK_MAP['frontend']);
              
              if (config.experienceLevel) {
                const normalizedLevel = (config.experienceLevel || 'mid').toLowerCase();
                if (normalizedLevel === 'junior' || normalizedLevel === 'mid' || normalizedLevel === 'senior') {
                  setLevel(normalizedLevel as 'junior' | 'mid' | 'senior');
                }
              }

              // Skip interviewer selection for company interviews
              setCurrentStep('setup');
            } else {
              // If config endpoint fails, try the interview token endpoint (for drives)
              try {
                const interviewResponse = await fetch(`${backendUrl}/api/company/interview/${token}`);
                if (interviewResponse.ok) {
                  const interviewData = await interviewResponse.json();
                  const driveQuestions = interviewData.drive?.questions || [];
                  const driveProfile = interviewData.drive?.profile;
                  const driveLevel = interviewData.drive?.level;
                  
                  setDriveQuestions(driveQuestions);
                  const normalizedDriveProfile = mapProfileString(driveProfile || interviewData.candidate?.profile || profile || 'frontend');
                  setCompanyParams({
                    token,
                    company: interviewData.candidate?.companyName || company,
                    profile: normalizedDriveProfile,
                    level: (driveLevel || level || 'mid') as 'junior' | 'mid' | 'senior',
                    candidateName: interviewData.candidate?.name || candidateName || undefined,
                    candidateEmail: interviewData.candidate?.email || candidateEmail || undefined,
                    driveQuestions: driveQuestions,
                    driveProfile: driveProfile,
                    driveLevel: driveLevel,
                    interviewDuration: interviewData.drive?.interviewDuration || 15, // Use configured duration or default to 15 minutes
                    jobDescription: interviewData.drive?.jobDescription || '', // Include job description for AI question generation
                  });
                  
                  // Update timer with configured duration
                  const duration = interviewData.drive?.interviewDuration || 15;
                  setTimeRemaining(duration * 60);
                  
                  // Set job description for AI question generation if no drive questions
                  if (interviewData.drive?.jobDescription) {
                    setJdText(interviewData.drive.jobDescription);
                  }
                  
                  if (driveProfile) {
                    const normalizedProfile = mapProfileString(driveProfile);
                    setProfile(normalizedProfile);
                    setFocus(PROFILE_FOCUS_MAP[normalizedProfile] || PROFILE_FOCUS_MAP['frontend']);
                    setFramework(PROFILE_FRAMEWORK_MAP[normalizedProfile] || PROFILE_FRAMEWORK_MAP['frontend']);
                  } else if (interviewData.candidate?.profile) {
                    const normalizedProfile = mapProfileString(interviewData.candidate.profile);
                    setProfile(normalizedProfile);
                    setFocus(PROFILE_FOCUS_MAP[normalizedProfile] || PROFILE_FOCUS_MAP['frontend']);
                    setFramework(PROFILE_FRAMEWORK_MAP[normalizedProfile] || PROFILE_FRAMEWORK_MAP['frontend']);
                  } else if (profile) {
                    setProfile(profile as any);
                  }
                  
                  if (driveLevel) {
                    setLevel(driveLevel as 'junior' | 'mid' | 'senior');
                  } else if (level) {
                    setLevel(level as 'junior' | 'mid' | 'senior');
                  }
                  setCurrentStep('setup');
                } else {
                  throw new Error('Failed to fetch interview data');
                }
              } catch (fetchError) {
                console.error('Failed to fetch interview configuration:', fetchError);
                // Fallback to URL parameters if API fails
                const fallbackLevel = level ? level.toLowerCase() : undefined;
                const normalizedFallbackLevel = fallbackLevel && (fallbackLevel === 'junior' || fallbackLevel === 'mid' || fallbackLevel === 'senior')
                  ? (fallbackLevel as 'junior' | 'mid' | 'senior')
                  : undefined;
                setCompanyParams({
                  token,
                  company,
                  profile: (profile || 'frontend') as ProfileOption,
                  level: normalizedFallbackLevel || 'mid',
                  candidateName: candidateName || undefined,
                  candidateEmail: candidateEmail || undefined,
                  driveQuestions: [],
                  driveProfile: profile || undefined,
                  driveLevel: normalizedFallbackLevel,
                });

                if (normalizedFallbackLevel) {
                  setLevel(normalizedFallbackLevel);
                } else {
                  setLevel('mid');
                }

                if (profile) {
                  const normalizedFromQuery = mapProfileString(profile);
                  setProfile(normalizedFromQuery);
                  setFocus(PROFILE_FOCUS_MAP[normalizedFromQuery] || PROFILE_FOCUS_MAP['frontend']);
                  setFramework(PROFILE_FRAMEWORK_MAP[normalizedFromQuery] || PROFILE_FRAMEWORK_MAP['frontend']);
                }
                setCurrentStep('setup');
              }
            }
          } catch (error) {
            console.error('Error fetching interview configuration:', error);
            // Fallback to URL parameters if API fails
            const fallbackLevel = level ? level.toLowerCase() : undefined;
            const normalizedFallbackLevel = fallbackLevel && (fallbackLevel === 'junior' || fallbackLevel === 'mid' || fallbackLevel === 'senior')
              ? (fallbackLevel as 'junior' | 'mid' | 'senior')
              : undefined;
            setCompanyParams({
              token,
              company,
              profile: (profile || 'frontend') as ProfileOption,
              level: normalizedFallbackLevel || 'mid',
              candidateName: candidateName || undefined,
              candidateEmail: candidateEmail || undefined,
              driveQuestions: [],
              driveProfile: profile || undefined,
              driveLevel: normalizedFallbackLevel,
            });

            if (normalizedFallbackLevel) {
              setLevel(normalizedFallbackLevel);
            } else {
              setLevel('mid');
            }

            if (profile) {
              const normalizedFromQuery = mapProfileString(profile);
              setProfile(normalizedFromQuery);
              setFocus(PROFILE_FOCUS_MAP[normalizedFromQuery] || PROFILE_FOCUS_MAP['frontend']);
              setFramework(PROFILE_FRAMEWORK_MAP[normalizedFromQuery] || PROFILE_FRAMEWORK_MAP['frontend']);
            }
            setCurrentStep('setup');
          }
        };

        fetchInterviewConfig();
      }
    }
  }, [searchParams]);

  // Initialize speech recognition and load voices
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load voices if they're not already loaded
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', () => {
          console.log('Voices loaded:', speechSynthesis.getVoices().map(v => ({ name: v.name, lang: v.lang })));
        });
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';
        recognition.maxAlternatives = 1;
        
        recognition.onresult = (event: any) => {
          console.log('Speech recognition result event:', event);
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            console.log(`Result ${i}: "${transcript}" (isFinal: ${event.results[i].isFinal})`);
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            console.log('Final transcript to add:', finalTranscript);
            setCurrentAnswer(prev => {
              const cleanedPrev = prev.replace(/\[.*?\]/g, ''); // Remove interim text
              const newAnswer = cleanedPrev ? cleanedPrev + ' ' + finalTranscript.trim() : finalTranscript.trim();
              console.log('Previous answer:', cleanedPrev);
              console.log('New answer after adding final:', newAnswer);
              
              // Update the ref with the actual spoken text
              actualSpokenTextRef.current = newAnswer;
              console.log('Updated actualSpokenTextRef:', actualSpokenTextRef.current);
              
              return newAnswer;
            });
          }
          
          // Update interim results for real-time display
          if (interimTranscript) {
            console.log('Interim transcript:', interimTranscript);
            setCurrentAnswer(prev => {
              const baseAnswer = prev.replace(/\[.*?\]/g, ''); // Remove any previous interim text
              return baseAnswer + ' [' + interimTranscript + ']';
            });
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
          // If we're still recording, restart recognition
          if (isRecording) {
            setTimeout(() => {
              if (isRecording && recognitionRef.current) {
                console.log('Restarting speech recognition');
                recognitionRef.current.start();
              }
            }, 100);
          }
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (currentStep === 'interview' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentStep, timeRemaining]);

  // Auto-scroll to bottom
  useEffect(() => {
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleVoiceInput = (transcript: string) => {
    if (currentStep === 'interview' && isRecording) {
      console.log('Adding to current answer:', transcript);
      // Update current answer being built
      setCurrentAnswer(prev => {
        const newAnswer = prev ? prev + ' ' + transcript.trim() : transcript.trim();
        console.log('Updated answer:', newAnswer);
        return newAnswer;
      });
    }
  };

  const startInterview = async () => {
    if (!selectedInterviewer) return;
    
    const focusForRequest = profile === 'frontend' ? focus : (PROFILE_FOCUS_MAP[profile] || profile);
    const frameworkForRequest = profile === 'frontend' ? framework : (PROFILE_FRAMEWORK_MAP[profile] || profile);
    const questionsToUse = driveQuestions.length > 0 ? driveQuestions : (companyParams?.driveQuestions || []);
    const hasDriveQuestions = questionsToUse.length > 0;

    // Allow interview to proceed if:
    // 1. We have drive questions, OR
    // 2. User is authenticated (has user and token), OR
    // 3. It's a company interview (has companyParams)
    if (!hasDriveQuestions && (!user || !token) && !companyParams) {
      return;
    }
    
    // Track interview start
    trackAIEvent('interview_started', {
      interviewer: selectedInterviewer.name,
      profile: profile,
      level: level
    });
    
    setLoading(true);
    try {
      let firstQuestion = '';
      let introduction = '';
      
      if (hasDriveQuestions) {
        // Use drive questions
        setCurrentQuestionIndex(0);
        firstQuestion = questionsToUse[0];
        const interviewerName = selectedInterviewer.name;
        introduction = `Hello! I'm ${interviewerName}. Welcome to your interview! I'm really excited to learn about your skills and experience. Don't worry about being perfect - I'm here to help you showcase what you know and we'll work through the questions together. Take your time, think out loud, and remember that showing your thought process is just as important as the final answer. You've got this! Let's begin with our first question.`;
      } else {
        // Generate question using AI
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        // Only add Authorization header if token is available
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('/api/ai-interview', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            action: 'start',
            profile,
            level,
            focus: focusForRequest,
            framework: frameworkForRequest,
            jdText: jdText || companyParams?.jobDescription || '', // Use job description from company params if available
            interviewer: selectedInterviewer
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to start interview:', response.status, errorText);
          throw new Error(`Failed to start interview: ${response.status}`);
        }

        const data = await response.json();
        // The API returns the full message with introduction and question combined
        // For normal AI interview flow, use the full message as-is
        const fullResponse = data.message || '';
        
        if (!fullResponse || fullResponse.trim() === '') {
          throw new Error('Empty response from AI service');
        }
        
        // Store the full response - it already contains introduction + question
        // The API format is: "Introduction\n\nQuestion"
        introduction = '';
        firstQuestion = fullResponse; // The full message from API includes intro + question
      }

      // Construct the full message to display
      // If we have drive questions, combine intro + question
      // If AI-generated, the firstQuestion already contains the full message (intro + question)
      const fullMessage = questionsToUse.length > 0 
        ? `${introduction}\n\n${firstQuestion}`
        : firstQuestion; // firstQuestion already contains intro + question from AI
      
      const interviewerForSession: Interviewer = companyParams ? {
        ...selectedInterviewer,
        role: '',
        company: '',
        experience: '',
        specialties: [],
      } : selectedInterviewer;

      const newSession: InterviewSession = {
        id: Date.now().toString(),
        interviewer: interviewerForSession,
        level,
        focus: focusForRequest,
        startTime: new Date(),
        messages: [{
          role: 'interviewer',
          content: fullMessage,
          timestamp: new Date()
        }],
        currentQuestion: 1,
        totalQuestions: questionsToUse.length > 0 ? questionsToUse.length : 7,
        status: 'active',
        timeRemaining: companyParams?.interviewDuration ? companyParams.interviewDuration * 60 : 20 * 60
      };

      setSession(newSession);
      setShouldAutoStart(false);
      lastInterviewerGenderRef.current = selectedInterviewer.gender;
      setMessages(newSession.messages);
      setCurrentStep('interview');
      // Use configured duration or default to 20 minutes
      const duration = companyParams?.interviewDuration || 20;
      setTimeRemaining(duration * 60);
      
      // Start camera for the interview with optimized constraints to reduce file size
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 15, max: 30 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
      
      // Reset anti-cheat monitoring
      setCheatingIncidents([]);
      setWarnings([]);
      setViolations([]);
      
      // Make AI read the initial greeting with D-ID video
      console.log('🚀 Starting interview, will call speakTextOrVideo in 1 second');
      console.log('📊 Session state after setSession:', session);
      setTimeout(() => {
        console.log('⏰ Timeout triggered, calling speakTextOrVideo');
        console.log('📊 Session state in timeout:', session);
        console.log('📊 NewSession data:', newSession);
        speakTextOrVideo(fullMessage, newSession);
      }, 1000);
    } catch (error) {
      console.error('Error starting interview:', error);
      setShouldAutoStart(false);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to upload video to S3 or return base64
  const uploadVideoToS3 = async (
    videoBlob: Blob,
    interviewId: string,
    questionIndex: string
  ): Promise<{ success: boolean; videoUrl?: string; videoData?: string; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('video', videoBlob, `question-${questionIndex}.webm`);
      formData.append('interviewId', interviewId);
      formData.append('questionIndex', questionIndex);

      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Error uploading video:', error);
      // Fallback to base64
      try {
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(videoBlob);
        });
        return { success: true, videoData: base64String };
      } catch (base64Error) {
        return { success: false, error: 'Failed to process video' };
      }
    }
  };

  const endInterview = async () => {
    if (!session || !token) return;
    
    // Track interview completion
    trackAIEvent('interview_completed', {
      interviewer: session.interviewer.name,
      profile: profile,
      level: level,
      duration: Math.floor((Date.now() - (session.startTime ? new Date(session.startTime).getTime() : Date.now())) / 1000)
    });
    
    // Stop camera stream when interview ends
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Stop any ongoing speech
    if (speechSynthesisRef.current) {
      speechSynthesis.cancel();
    }
    
    setLoading(true);
    try {
      // Build Q/A pairs from conversation with video data
      const qaPairs: Array<{ question: string; answer: string; hasVideo: boolean; videoUrl?: string; videoData?: string }> = [];
      const candidateMsgs = messages.filter(m => m.role === 'candidate');
      let ci = 0;
      const candidateMsgRefs: Message[] = []; // Track which candidate message corresponds to which qaPair
      
      // First pass: Build qaPairs structure and track candidate messages
      for (const m of messages) {
        if (m.role === 'interviewer') {
          const q = m.content;
          // pick the next candidate message as answer
          let a = '';
          let hasVideo = false;
          let videoUrl: string | undefined;
          let candidateMsg: Message | undefined;
          
          while (ci < candidateMsgs.length && a.trim().length === 0) {
            candidateMsg = candidateMsgs[ci++];
            a = (candidateMsg.content || '').replace(/\[.*?\]/g, '').trim();
            // Video submission disabled - always set hasVideo to false
            hasVideo = false;
            videoUrl = undefined;
          }
          
          qaPairs.push({ question: q, answer: a, hasVideo: false, videoUrl: undefined });
          candidateMsgRefs.push(candidateMsg!); // Store reference to candidate message
        }
      }
      
      // Video submission disabled - skip video processing
      // Second pass: Upload videos to S3 or convert to base64 (async) - DISABLED
      // Videos are recorded but not submitted to reduce payload size and processing time
      console.log('Video submission disabled - skipping video processing');
      
      // Clear video data from qaPairs
      qaPairs.forEach((qa, index) => {
        qa.hasVideo = false;
        delete qa.videoUrl;
        delete qa.videoData;
      });

      // Handle company interviews differently
      if (companyParams) {
        // First, calculate the score and analysis using AI
        let analysisData: any = null;
        try {
          const analysisResponse = await fetch('/api/ai-interview', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              action: 'end',
              profile: companyParams.profile || profile,
              ...((companyParams.profile || profile) === 'frontend' ? { framework } : {}),
              jdText: jdText || companyParams?.jobDescription || '',
              qaPairs: qaPairs.map(({ question, answer }) => ({ question, answer })) // Remove video data for AI analysis
            })
          });

          if (analysisResponse.ok) {
            analysisData = await analysisResponse.json();
          }
        } catch (error) {
          console.error('Error calculating interview analysis:', error);
          // Continue with submission even if analysis fails
        }

        // Submit to backend company interview API with calculated scores
        const companyId = localStorage.getItem('hiring_company_id') || 'hireog';
        const companyPassword = localStorage.getItem('hiring_company_password') || 'manasi22';
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
        const response = await fetch(`${backendUrl}/api/company/interview/${companyParams.token}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Company-ID': companyId,
            'X-Company-Password': companyPassword
          },
          credentials: 'include',
          body: JSON.stringify({
            candidateName: companyParams.candidateName,
            candidateEmail: companyParams.candidateEmail,
            profile: companyParams.profile || profile,
            level: companyParams.level || level,
            company: companyParams.company,
            qaPairs,
            score: analysisData?.score || 0,
            overallScore: analysisData?.score || 0,
            technicalScore: analysisData?.technicalScore || null,
            communicationScore: analysisData?.communicationScore || null,
            feedback: typeof analysisData?.feedback === 'string' ? analysisData.feedback : (analysisData?.feedback?.summary || ''),
            detailedFeedback: analysisData?.feedback || null,
            questionAnalysis: Array.isArray(analysisData?.questionAnalysis) ? analysisData.questionAnalysis.map((qa: any, idx: number) => ({
              ...qa,
              // Add video data from qaPairs to questionAnalysis
              hasVideo: qaPairs[idx]?.hasVideo || false,
              videoUrl: qaPairs[idx]?.videoUrl,
              videoData: qaPairs[idx]?.videoData
            })) : null,
            completedAt: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error('Failed to submit company interview');
        }

        const data = await response.json();
        // Map backend response to UI-friendly shape when possible
        try {
          const mapped = {
            overallScore: typeof data?.score === 'number' ? Math.round(data.score * 10) : undefined,
            detailedFeedback: typeof data?.feedback === 'string' ? data.feedback : undefined,
            summary: typeof data?.feedback === 'object' ? data.feedback?.summary : undefined,
            strengths: typeof data?.feedback === 'object' ? data.feedback?.strengths : undefined,
            improvements: typeof data?.feedback === 'object' ? data.feedback?.improvements : undefined,
            categories: typeof data?.feedback === 'object' ? data.feedback?.categories : undefined,
          };
          setFeedback(Object.keys(mapped).some((k) => (mapped as any)[k] !== undefined) ? mapped : data);
          setQuestionAnalysis(Array.isArray(data?.questionAnalysis) ? data.questionAnalysis : []);
        } catch {
          setFeedback(data);
        }
        setCurrentStep('thank-you');
        
        // For company interviews, don't show analysis - just thank you
        return;
      }

      // Regular interview submission
      const response = await fetch('/api/ai-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'end',
          sessionId: session.id,
          profile,
          ...(profile === 'frontend' ? { framework } : {}),
          jdText,
          qaPairs
        })
      });

      if (!response.ok) {
        throw new Error('Failed to end interview');
      }

      const data = await response.json();
      // Map backend response to UI-friendly shape and store per-question analysis
      try {
        const mapped = {
          overallScore: typeof data?.score === 'number' ? Math.round(data.score * 10) : undefined,
          technicalScore: typeof data?.technicalScore === 'number' ? data.technicalScore : undefined,
          communicationScore: typeof data?.communicationScore === 'number' ? data.communicationScore : undefined,
          detailedFeedback: typeof data?.feedback === 'string' ? data.feedback : undefined,
          summary: typeof data?.feedback === 'object' ? data.feedback?.summary : undefined,
          strengths: typeof data?.feedback === 'object' ? data.feedback?.strengths : undefined,
          improvements: typeof data?.feedback === 'object' ? data.feedback?.improvements : undefined,
          categories: typeof data?.feedback === 'object' ? data.feedback?.categories : undefined,
        };
        setFeedback(Object.keys(mapped).some((k) => (mapped as any)[k] !== undefined) ? mapped : data);
        setQuestionAnalysis(Array.isArray(data?.questionAnalysis) ? data.questionAnalysis : []);
      } catch {
        setFeedback(data);
      }
      setCurrentStep('thank-you');
      
      // Simulate analysis progress
      setTimeout(() => setAnalysisProgress('analyzing'), 2000);
      setTimeout(() => setAnalysisProgress('creating-feedback'), 4000);
      setTimeout(() => {
        setAnalysisProgress('complete');
        setCurrentStep('analysis');
      }, 6000);
    } catch (error) {
      console.error('Error ending interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAnswer = async () => {
    // Pause any playing TTS audio when candidate starts answering
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    // Also pause any HTML audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      if (!audio.paused) {
        audio.pause();
      }
    });
    
    // Reset current answer and start recording
    setCurrentAnswer('');
    actualSpokenTextRef.current = ''; // Reset the ref
    setIsRecording(true);
    setIsListening(true);
    setSttSource('none');
    setSttConfidence(0);
    
    // Start Azure STT recording if enabled
    if (useAzureSTT && streamRef.current) {
      try {
        azureAudioChunksRef.current = [];
        const audioStream = streamRef.current.getAudioTracks();
        if (audioStream.length > 0) {
          const mediaRecorder = new MediaRecorder(streamRef.current, {
            mimeType: 'audio/webm;codecs=opus'
          });
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              azureAudioChunksRef.current.push(event.data);
            }
          };
          
          azureMediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start(1000); // Collect chunks every second for real-time processing
          setSttSource('azure');
          console.log('Started Azure STT recording');
        }
      } catch (error) {
        console.error('Error starting Azure STT recording:', error);
        setUseAzureSTT(false); // Fallback to browser STT
      }
    }
    
    // Start video recording
    if (streamRef.current && !videoRecorderRef.current) {
      try {
        videoChunksRef.current = [];
        // Use optimized settings to reduce file size
        // Try VP9 first (better compression), fallback to VP8
        const preferredMimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : 'video/webm;codecs=vp8,opus';
        
        const videoRecorder = new MediaRecorder(streamRef.current, {
          mimeType: preferredMimeType,
          videoBitsPerSecond: 500000 // 500 kbps (reduces file size significantly)
        });
        
        videoRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            videoChunksRef.current.push(event.data);
          }
        };
        
        videoRecorderRef.current = videoRecorder;
        videoRecorder.start();
        currentQuestionStartTimeRef.current = new Date();
        console.log('Started video recording for answer');
      } catch (error) {
        console.error('Error starting video recording:', error);
      }
    }
    
    // Start browser STT as fallback or if Azure is disabled
    if (!useAzureSTT && recognitionRef.current) {
      recognitionRef.current.start();
      setSttSource('browser');
      console.log('Started browser STT (fallback)');
    }
    
    console.log('Started recording answer');
  };

  const stopAnswer = async () => {
    console.log('Stop answer clicked, current answer:', currentAnswer);
    
    setIsRecording(false);
    setIsListening(false);
    
    // Stop browser STT if running
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Process Azure STT audio if available
    let azureTranscription = '';
    if (useAzureSTT && azureMediaRecorderRef.current && azureMediaRecorderRef.current.state === 'recording') {
      try {
        azureMediaRecorderRef.current.stop();
        await new Promise(resolve => {
          if (azureMediaRecorderRef.current) {
            azureMediaRecorderRef.current.onstop = resolve;
          } else {
            resolve(undefined);
          }
        });

        if (azureAudioChunksRef.current.length > 0) {
          const audioBlob = new Blob(azureAudioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          
          // Send to Azure STT API
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          formData.append('language', 'en-IN');
          formData.append('provider', 'azure');
          
          try {
            const response = await fetch('/api/speech-to-text', {
              method: 'POST',
              body: formData,
            });
            
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.transcription) {
                azureTranscription = result.transcription;
                setSttSource(result.source || 'azure');
                setSttConfidence(result.confidence || 0);
                console.log('Azure STT transcription:', azureTranscription, 'Confidence:', result.confidence);
                
                // Update current answer with Azure transcription
                if (azureTranscription.trim()) {
                  setCurrentAnswer(prev => {
                    const cleaned = prev.replace(/\[.*?\]/g, '').trim();
                    const combined = cleaned ? `${cleaned} ${azureTranscription}` : azureTranscription;
                    actualSpokenTextRef.current = combined;
                    return combined;
                  });
                }
              }
            }
          } catch (error) {
            console.error('Azure STT API error:', error);
            // Fallback to browser STT result
          }
        }
      } catch (error) {
        console.error('Error processing Azure STT:', error);
      }
    }

    // Stop video recording
    let videoBlob: Blob | undefined;
    let videoUrl: string | undefined;
    
    if (videoRecorderRef.current && videoRecorderRef.current.state === 'recording') {
      return new Promise<void>((resolve) => {
        if (videoRecorderRef.current) {
          videoRecorderRef.current.onstop = async () => {
            if (videoChunksRef.current.length > 0) {
              videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
              videoUrl = URL.createObjectURL(videoBlob);
              console.log('Video recorded, size:', videoBlob.size, 'bytes');
            }
            videoRecorderRef.current = null;
            
            // Continue with answer submission
            await submitAnswerWithVideo(videoBlob, videoUrl);
            resolve();
          };
          
          videoRecorderRef.current.stop();
        } else {
          resolve();
        }
      });
    } else {
      // No video recording, submit without video
      await submitAnswerWithVideo(undefined, undefined);
    }
  };

  const submitAnswerWithVideo = async (videoBlob?: Blob, videoUrl?: string) => {
    // Track answer submission with video
    trackAIEvent('answer_submitted_with_video', {
      interviewer: session?.interviewer.name,
      profile: profile,
      has_video: !!videoBlob || !!videoUrl
    });
    
    // Wait a moment for any final speech recognition results
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use the ref to get the actual spoken text, fallback to state
    const actualSpokenText = actualSpokenTextRef.current.trim();
    const stateAnswer = currentAnswer.replace(/\[.*?\]/g, '').trim();
    const answerToSubmit = actualSpokenText || stateAnswer;
    
    console.log('Actual spoken text from ref:', actualSpokenText);
    console.log('Current answer from state:', stateAnswer);
    console.log('Final answer to submit:', answerToSubmit);
    
    if (answerToSubmit && session) {
      console.log('Submitting answer to AI...');
      
      // Add candidate message to conversation with video
      const candidateMessage: Message = {
        role: 'candidate',
        content: answerToSubmit,
        timestamp: new Date(),
        isVoice: true,
        videoBlob,
        videoUrl
      };
      
      setMessages(prev => [...prev, candidateMessage]);
      
      setLoading(true);
      try {
        // Check if we have drive questions to use
        const questionsToUse = driveQuestions.length > 0 ? driveQuestions : (companyParams?.driveQuestions || []);
        
        let nextQuestion = '';
        let shouldEndInterview = false;
        
        if (questionsToUse.length > 0) {
          // Use drive questions in sequence
          const nextIndex = currentQuestionIndex + 1;
          
          if (nextIndex < questionsToUse.length) {
            nextQuestion = questionsToUse[nextIndex];
            setCurrentQuestionIndex(nextIndex);
          } else {
            // Last question was just answered - show thank you message and auto-end
            shouldEndInterview = true;
            nextQuestion = "Thank you for answering all the questions! That concludes our interview. We'll review your responses and get back to you soon.";
          }
        } else {
          // Generate next question using AI
          const focusForRequest = profile === 'frontend' ? focus : (PROFILE_FOCUS_MAP[profile] || profile);
          const frameworkForRequest = profile === 'frontend' ? framework : (PROFILE_FRAMEWORK_MAP[profile] || profile);
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          // Only add Authorization header if token is available
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch('/api/ai-interview', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              action: 'respond',
              sessionId: session.id,
              message: answerToSubmit,
              previousQuestion: messages.filter(m => m.role === 'interviewer').slice(-1)[0]?.content || '',
              profile,
              level,
              currentQuestion: session.currentQuestion,
              focus: focusForRequest,
              framework: frameworkForRequest,
              jdText: jdText || companyParams?.jobDescription || '' // Use job description from company params if available
            })
          });

          if (!response.ok) {
            throw new Error('Failed to get next question');
          }

          const data = await response.json();
          nextQuestion = data.message;
          shouldEndInterview = data.shouldEnd || false;
        }
        
        const updatedSession = session ? {
          ...session,
          currentQuestion: session.currentQuestion + 1
        } : null;
        
        setMessages(prev => [...prev, {
          role: 'interviewer',
          content: nextQuestion,
          timestamp: new Date()
        }]);
        
        setSession(updatedSession);
        
        // Check if interview should end (after last question is answered, or if AI explicitly says to end)
        if (shouldEndInterview) {
          // Auto-end after showing thank you message (after last question is answered)
          setTimeout(() => {
            endInterview();
          }, 2000);
        } else {
          // Make AI read the next question with D-ID video
          setTimeout(() => {
            speakTextOrVideo(nextQuestion, updatedSession || session);
          }, 500);
        }
      } catch (error) {
        console.error('Error sending response:', error);
      } finally {
        setLoading(false);
      }
    } else if (session) {
      // Only submit fallback if we actually tried to record and got nothing
      console.log('No voice captured after recording attempt, submitting fallback response...');
      
      const candidateMessage: Message = {
        role: 'candidate',
        content: 'I need to think about this question.',
        timestamp: new Date(),
        isVoice: true,
        videoBlob,
        videoUrl
      };
      
      setMessages(prev => [...prev, candidateMessage]);
      
      setLoading(true);
      try {
        // Check if we have drive questions to use
        const questionsToUse = driveQuestions.length > 0 ? driveQuestions : (companyParams?.driveQuestions || []);
        
        let nextQuestion = '';
        let shouldEndInterview = false;
        
        if (questionsToUse.length > 0) {
          // Use drive questions in sequence
          const nextIndex = currentQuestionIndex + 1;
          
          if (nextIndex < questionsToUse.length) {
            nextQuestion = questionsToUse[nextIndex];
            setCurrentQuestionIndex(nextIndex);
          } else {
            // Last question was just answered - show thank you message and auto-end
            shouldEndInterview = true;
            nextQuestion = "Thank you for answering all the questions! That concludes our interview. We'll review your responses and get back to you soon.";
          }
        } else {
          // Generate next question using AI
          const focusForRequest = profile === 'frontend' ? focus : (PROFILE_FOCUS_MAP[profile] || profile);
          const frameworkForRequest = profile === 'frontend' ? framework : (PROFILE_FRAMEWORK_MAP[profile] || profile);
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          // Only add Authorization header if token is available
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch('/api/ai-interview', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              action: 'respond',
              sessionId: session.id,
              message: 'I need to think about this question.',
              previousQuestion: messages.filter(m => m.role === 'interviewer').slice(-1)[0]?.content || '',
              profile,
              level,
              currentQuestion: session.currentQuestion,
              focus: focusForRequest,
              framework: frameworkForRequest,
              jdText: jdText || companyParams?.jobDescription || '' // Use job description from company params if available
            })
          });

          if (!response.ok) {
            throw new Error('Failed to get next question');
          }

          const data = await response.json();
          nextQuestion = data.message;
          shouldEndInterview = data.shouldEnd || false;
        }
        
        const updatedSession = session ? {
          ...session,
          currentQuestion: session.currentQuestion + 1
        } : null;
        
        setMessages(prev => [...prev, {
          role: 'interviewer',
          content: nextQuestion,
          timestamp: new Date()
        }]);
        
        setSession(updatedSession);
        
        // Check if interview should end (after last question is answered, or if AI explicitly says to end)
        if (shouldEndInterview) {
          // Auto-end after showing thank you message (after last question is answered)
          setTimeout(() => {
            endInterview();
          }, 2000);
        } else {
          // Make AI read the next question with D-ID video
          setTimeout(() => {
            speakTextOrVideo(nextQuestion, updatedSession || session);
          }, 500);
        }
      } catch (error) {
        console.error('Error sending response:', error);
      } finally {
        setLoading(false);
      }
    } else {
      console.log('No session available');
    }
    
    // Reset current answer
    setCurrentAnswer('');
    actualSpokenTextRef.current = '';
  };

  const checkPermissions = async () => {
    try {
      // Check microphone permission
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      micStream.getTracks().forEach(track => track.stop());

      // Check camera permission
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission(true);
      cameraStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Permission check failed:', error);
    }
  };

  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      microphone.connect(analyser);
      analyser.fftSize = 256;

      let testTimeout: NodeJS.Timeout;
      let animationFrameId: number;

      const checkAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);

        if (average > 5) { // Lower threshold for detecting speech
          setMicTestPassed(true);
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
          if (testTimeout) clearTimeout(testTimeout);
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
        } else {
          animationFrameId = requestAnimationFrame(checkAudio);
        }
      };

      // Start checking for audio
      checkAudio();

      // Auto-pass after 10 seconds even if no speech detected
      testTimeout = setTimeout(() => {
        if (!micTestPassed) {
          setMicTestPassed(true);
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
        }
      }, 10000);

    } catch (error) {
      console.error('Microphone test failed:', error);
      // Still mark as passed if user can't test (permission denied, etc.)
      setMicTestPassed(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startAudioVisualization = () => {
    // Simulate audio waveform animation
    let level = 0;
    let direction = 1;
    
    audioVisualizerRef.current = setInterval(() => {
      level += direction * (Math.random() * 15 + 10);
      if (level >= 80) direction = -1;
      if (level <= 20) direction = 1;
      setAudioLevel(level);
    }, 100);
  };

  const stopAudioVisualization = () => {
    if (audioVisualizerRef.current) {
      clearInterval(audioVisualizerRef.current);
      audioVisualizerRef.current = null;
    }
    setAudioLevel(0);
  };

  const generateAvatarVideo = async (_text: string, _sessionData?: InterviewSession) => {
    // D-ID removed: always return null so TTS path is used
    return null;
  };

  const speakTextOrVideo = async (text: string, sessionData?: InterviewSession) => {
    console.log('🎤 speakTextOrVideo called with text:', text.substring(0, 50));
    
    // Cancel any browser speechSynthesis to prevent duplicate audio
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    if (sessionData?.interviewer?.gender) {
      lastInterviewerGenderRef.current = sessionData.interviewer.gender;
    }
    
    // Azure TTS is handled by AzureTTSPlayer component in the UI
    // The component will auto-play when the message is updated
    // We do NOT call browser speechSynthesis here - only Azure TTS should play
    setIsAISpeaking(true);
    
    // Set a timeout to mark as done speaking (approximate based on text length)
    // This timeout is just for UI state, actual audio is controlled by AzureTTSPlayer
    const estimatedDuration = Math.max(3000, text.length * 50); // ~50ms per character, minimum 3s
    setTimeout(() => {
      setIsAISpeaking(false);
    }, estimatedDuration);
  };

  // Track AI interview events
  const trackAIEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'ai_interview',
        event_label: eventName,
        value: 1,
        ...parameters
      });
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any existing speech
      if (speechSynthesisRef.current) {
        speechSynthesis.cancel();
      }

      // Wait a bit for voices to load if they're not ready
      const getVoices = () => {
        let voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
          // If no voices, wait a bit and try again
          setTimeout(() => {
            voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
              speakWithVoice(text, voices);
            } else {
              // Use default voice
              speakWithVoice(text, []);
            }
          }, 100);
          return;
        }
        speakWithVoice(text, voices);
      };

      getVoices();
    }
  };

  const speakWithVoice = (text: string, voices: SpeechSynthesisVoice[]) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;      // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Track speaking state for avatar animation
    utterance.onstart = () => {
      setIsAISpeaking(true);
      startAudioVisualization();
    };
    
    utterance.onend = () => {
      setIsAISpeaking(false);
      stopAudioVisualization();
    };
    
    utterance.onerror = () => {
      setIsAISpeaking(false);
      stopAudioVisualization();
    };
    
    console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
    
    let selectedVoice = null;
    
    // Priority 1: Look for Indian English voices (en-IN)
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
        voice.lang && voice.lang.includes('en-IN')
      );
      if (selectedVoice) {
        console.log(`✅ Selected Indian English voice: "${selectedVoice.name}"`);
      }
    }
    
    // Priority 2: Look for Indian voice by name (Google Play Services, Microsoft voices)
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('hindi') ||
        voice.name.toLowerCase().includes('indian') ||
        voice.name.toLowerCase().includes('veena') ||  // Google India voice
        voice.name.toLowerCase().includes('rishi') ||  // Rishi is male Indian
        voice.name.toLowerCase().includes('priya') ||  // Female Indian name
        (voice.name.toLowerCase().includes('google') && voice.lang?.includes('en-IN'))
      );
      if (selectedVoice) {
        console.log(`✅ Selected Indian voice by name: "${selectedVoice.name}"`);
      }
    }
    
    // Priority 3: Handle gender-specific selection if needed
    if (!selectedVoice && session?.interviewer?.gender) {
      if (session.interviewer.gender === 'female') {
          selectedVoice = voices.find(voice => 
          voice.lang?.includes('en-IN') ||
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('veena')
        );
      } else {
        selectedVoice = voices.find(voice => 
          voice.lang?.includes('en-IN') ||
          voice.name.toLowerCase().includes('male') || 
          voice.name.toLowerCase().includes('rishi')
        );
      }
      if (selectedVoice) {
        console.log(`✅ Selected ${session.interviewer.gender} Indian voice: "${selectedVoice.name}"`);
      }
    }
    
    // Priority 4: Fallback to any available voice
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[1];
      console.log(`⚠️ No Indian voice found, using default: "${selectedVoice.name}"`);
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = 'en-IN'; // Ensure language is set to Indian English
      console.log(`🎤 Using voice: "${selectedVoice.name}" (${selectedVoice.lang})`);
    } else {
      utterance.lang = 'en-IN'; // Set language even if no specific voice found
      console.log('⚠️ No voice selected, using browser default with en-IN locale');
    }

    // Try FreeTTS first with Indian locale
    const tryFreeTTS = async () => {
      try {
        const gender = session?.interviewer?.gender || lastInterviewerGenderRef.current || 'female';
        console.log('🔊 FreeTTS: sending request with Indian voice', { voiceType: gender, locale: 'en-IN' });
        setIsAIAudioLoading(true);
        const resp = await fetch('/api/freetts/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text, 
            voiceType: gender,
            locale: 'en-IN',  // Indian English locale
            rate: 0.9,        // Clear speech
            clearness: 'high' // High clarity
          })
        });
        console.log('🔊 FreeTTS: response status', resp.status);
        if (resp.ok) {
          const data = await resp.json();
          console.log('🔊 FreeTTS: payload keys', Object.keys(data || {}));
          if (data.audioUrl) {
            const audio = new Audio(data.audioUrl);
            audio.onplay = () => { 
              setIsAISpeaking(true); 
              setIsAIAudioLoading(false); 
              startAudioVisualization(); 
            };
            audio.onended = () => { 
              setIsAISpeaking(false); 
              stopAudioVisualization(); 
            };
            audio.onerror = () => { 
              setIsAISpeaking(false); 
              setIsAIAudioLoading(false); 
              stopAudioVisualization(); 
            };
            await audio.play();
            return true;
          }
        }
      } catch {}
      finally { 
        setIsAIAudioLoading(false); 
      }
      return false;
    };

    (async () => {
      const ok = await tryFreeTTS();
      if (!ok) {
        console.log('🔊 FreeTTS fallback → using Browser SpeechSynthesis with Indian English');
        speechSynthesisRef.current = utterance;
        speechSynthesis.speak(utterance);
      }
    })();
    
    console.log('AI is speaking:', text);
  };

  // Loading state
  if (authLoading) {
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
              scale: { duration: 4, repeat: Infinity },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
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
              scale: { duration: 5, repeat: Infinity },
              rotate: { duration: 25, repeat: Infinity, ease: "linear" }
            }}
          />
        </div>
        
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
              Preparing AI Interview
            </motion.h1>
            <motion.div 
              className="flex justify-center gap-2"
            >
              {[0, 1, 2].map((i) => (
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
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Setup Screen
  if (currentStep === 'setup') {
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
              scale: { duration: 4, repeat: Infinity },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
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
              scale: { duration: 5, repeat: Infinity },
              rotate: { duration: 25, repeat: Infinity, ease: "linear" }
            }}
          />

          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
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

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <motion.div 
            className="w-full max-w-6xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-10 relative overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Header with Animated Icons */}
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="flex justify-center gap-4 mb-6"
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
                        delay: index * 0.2
                      }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.h1 
                  className="text-5xl font-extrabold mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="bg-gradient-to-r from-[#2ad17e] via-[#5cd3ff] to-[#ffb21e] bg-clip-text text-transparent">
                    AI Mock Interview
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-white/80 max-w-3xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Practice with professional AI interviewers from top tech companies.{' '}
                  <span className="text-[#2ad17e] font-semibold">Get instant feedback</span>{' '}
                  and improve your interview skills.
                </motion.p>
              </motion.div>

            {/* Profile Selection */}
            <motion.div 
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.label 
                className="block text-lg font-semibold mb-6 text-white"
                whileHover={{ x: 5 }}
              >
                Select Your Profile
              </motion.label>
              
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    id: 'frontend',
                    title: 'Frontend Engineer',
                    desc: 'UI engineering, JS/TS, frameworks',
                    icon: '🎨',
                    gradient: 'from-[#6f5af6] to-[#a855f7]'
                  },
                  {
                    id: 'backend',
                    title: 'Backend Spring Boot',
                    desc: 'Java, Spring, microservices, APIs',
                    icon: '⚙️',
                    gradient: 'from-[#2ad17e] to-[#20c997]'
                  },
                  {
                    id: 'product',
                    title: 'Product Manager',
                    desc: 'Product sense, metrics, prioritization',
                    icon: '📊',
                    gradient: 'from-[#f59f00] to-[#ffb21e]'
                  },
                  {
                    id: 'business',
                    title: 'Business Development',
                    desc: 'Sales, partnerships, GTM',
                    icon: '💼',
                    gradient: 'from-[#5cd3ff] to-[#6f5af6]'
                  },
                  {
                    id: 'qa',
                    title: 'QA Engineer',
                    desc: 'Manual/Automation testing, QA strategy',
                    icon: '🔍',
                    gradient: 'from-[#a78bfa] to-[#6f5af6]'
                  },
                  {
                    id: 'hr',
                    title: 'HR',
                    desc: 'Behavioral, culture fit, processes',
                    icon: '👥',
                    gradient: 'from-[#22d3ee] to-[#a855f7]'
                  }
                ].map((profileOption, index) => (
                  <motion.button
                    key={profileOption.id}
                    onClick={() => setProfile(profileOption.id as 'frontend' | 'backend' | 'product' | 'business' | 'qa' | 'hr')}
                    className={`group relative w-full p-6 rounded-2xl text-left transition-all duration-300 ${
                      profile === profileOption.id 
                        ? 'bg-gradient-to-br from-white/20 to-white/10 border-2 border-[#2ad17e] text-white' 
                        : 'bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 text-white/80 hover:border-white/40'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Animated Icon */}
                    <motion.div 
                      className="text-3xl mb-4"
                      animate={{ 
                        rotate: profile === profileOption.id ? [0, 10, -10, 0] : 0,
                        scale: profile === profileOption.id ? [1, 1.1, 1] : 1
                      }}
                      transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                    >
                      {profileOption.icon}
                    </motion.div>
                    
                    <motion.div 
                      className="font-bold text-lg mb-2 group-hover:text-[#2ad17e] transition-colors duration-300"
                      whileHover={{ x: 5 }}
                    >
                      {profileOption.title}
                    </motion.div>
                    
                    <motion.div 
                      className="text-sm opacity-70"
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {profileOption.desc}
                    </motion.div>
                    
                    {/* Selection Indicator */}
                    <AnimatePresence>
                      {profile === profileOption.id && (
                        <motion.div 
                          className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r from-[#2ad17e] to-[#20c997] flex items-center justify-center"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Animated Border */}
                    <motion.div 
                      className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${profileOption.gradient} ${
                        profile === profileOption.id ? 'w-full' : 'w-0 group-hover:w-full'
                      } transition-all duration-500`}
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 gap-8 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              {/* Experience Level */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
              >
                <motion.label 
                  className="block text-lg font-semibold mb-6 text-white"
                  whileHover={{ x: 5 }}
                >
                  Experience Level
                </motion.label>
                <div className="space-y-4">
                  {[
                    { id: 'junior', title: 'Junior Level', desc: '0-2 years experience', icon: '🌱', gradient: 'from-[#2ad17e] to-[#20c997]' },
                    { id: 'mid', title: 'Mid Level', desc: '3-5 years experience', icon: '⚡', gradient: 'from-[#f59f00] to-[#ffb21e]' },
                    { id: 'senior', title: 'Senior Level', desc: '6+ years experience', icon: '🚀', gradient: 'from-[#6f5af6] to-[#a855f7]' }
                  ].map((levelOption, index) => (
                    <motion.button
                      key={levelOption.id}
                      onClick={() => setLevel(levelOption.id as 'junior' | 'mid' | 'senior')}
                      className={`group relative w-full p-5 rounded-2xl text-left transition-all duration-300 ${
                        level === levelOption.id
                          ? 'bg-gradient-to-br from-white/20 to-white/10 border-2 border-[#2ad17e] text-white'
                          : 'bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 text-white/80 hover:border-white/40'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.5 + index * 0.1 }}
                      whileHover={{ x: 5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div 
                          className="text-2xl"
                          animate={{ 
                            rotate: level === levelOption.id ? [0, 10, -10, 0] : 0
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {levelOption.icon}
                        </motion.div>
                        <div className="flex-1">
                          <motion.div 
                            className="font-bold text-lg group-hover:text-[#2ad17e] transition-colors duration-300"
                          >
                            {levelOption.title}
                          </motion.div>
                          <motion.div 
                            className="text-sm opacity-70"
                          >
                            {levelOption.desc}
                          </motion.div>
                      </div>
                        
                        {/* Selection Indicator */}
                        <AnimatePresence>
                          {level === levelOption.id && (
                            <motion.div 
                              className="w-6 h-6 rounded-full bg-gradient-to-r from-[#2ad17e] to-[#20c997] flex items-center justify-center"
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 90 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <CheckCircle className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* Animated Border */}
                      <motion.div 
                        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${levelOption.gradient} ${
                          level === levelOption.id ? 'w-full' : 'w-0 group-hover:w-full'
                        } transition-all duration-500`}
                      />
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Focus Area - Only for Frontend */}
              <AnimatePresence>
              {profile === 'frontend' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: 1.4 }}
                  >
                    <motion.label 
                      className="block text-lg font-semibold mb-6 text-white"
                      whileHover={{ x: 5 }}
                    >
                      Focus Area
                    </motion.label>
                    <div className="space-y-4">
                      {[
                        { id: 'javascript', title: 'JavaScript', desc: 'Core JavaScript concepts', icon: '⚡', gradient: 'from-[#ffb21e] to-[#f59f00]' },
                        { id: 'react', title: 'React', desc: 'React ecosystem & patterns', icon: '⚛️', gradient: 'from-[#5cd3ff] to-[#6f5af6]' },
                        { id: 'fullstack', title: 'Fullstack', desc: 'Full-stack development', icon: '🌐', gradient: 'from-[#a855f7] to-[#6f5af6]' }
                      ].map((focusOption, index) => (
                        <motion.button
                          key={focusOption.id}
                          onClick={() => setFocus(focusOption.id as 'javascript' | 'react' | 'fullstack')}
                          className={`group relative w-full p-5 rounded-2xl text-left transition-all duration-300 ${
                            focus === focusOption.id
                              ? 'bg-gradient-to-br from-white/20 to-white/10 border-2 border-[#2ad17e] text-white'
                              : 'bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 text-white/80 hover:border-white/40'
                          }`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.5 + index * 0.1 }}
                          whileHover={{ x: -5, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-4">
                            <motion.div 
                              className="text-2xl"
                              animate={{ 
                                rotate: focus === focusOption.id ? [0, 10, -10, 0] : 0
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {focusOption.icon}
                            </motion.div>
                            <div className="flex-1">
                              <motion.div 
                                className="font-bold text-lg group-hover:text-[#2ad17e] transition-colors duration-300"
                              >
                                {focusOption.title}
                              </motion.div>
                              <motion.div 
                                className="text-sm opacity-70"
                              >
                                {focusOption.desc}
                              </motion.div>
                        </div>
                            
                            {/* Selection Indicator */}
                            <AnimatePresence>
                              {focus === focusOption.id && (
                                <motion.div 
                                  className="w-6 h-6 rounded-full bg-gradient-to-r from-[#2ad17e] to-[#20c997] flex items-center justify-center"
                                  initial={{ scale: 0, rotate: -90 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0, rotate: 90 }}
                                  transition={{ type: "spring", stiffness: 300 }}
                                >
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          
                          {/* Animated Border */}
                          <motion.div 
                            className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${focusOption.gradient} ${
                              focus === focusOption.id ? 'w-full' : 'w-0 group-hover:w-full'
                            } transition-all duration-500`}
                          />
                        </motion.button>
                    ))}
                  </div>
                  </motion.div>
              )}
              </AnimatePresence>
            </motion.div>

            {/* Framework and JD Upload */}
            <motion.div 
              className="grid md:grid-cols-2 gap-8 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              <AnimatePresence>
              {profile === 'frontend' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: 1.9 }}
                  >
                    <motion.label 
                      className="block text-lg font-semibold mb-4 text-white"
                      whileHover={{ x: 5 }}
                    >
                      Framework
                    </motion.label>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value as any)}
                        className="w-full p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 text-white focus:border-[#2ad17e] focus:outline-none transition-all duration-300"
                      >
                        <option className="text-black bg-white" value="react">React</option>
                        <option className="text-black bg-white" value="react-native">React Native</option>
                        <option className="text-black bg-white" value="nextjs">Next.js</option>
                        <option className="text-black bg-white" value="vue">Vue</option>
                        <option className="text-black bg-white" value="angular">Angular</option>
                        <option className="text-black bg-white" value="svelte">Svelte</option>
                  </select>
                      <motion.div
                        className="absolute top-4 right-4 text-[#2ad17e]"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <Settings className="w-5 h-5" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.0 }}
              >
                <motion.label 
                  className="block text-lg font-semibold mb-4 text-white"
                  whileHover={{ x: 5 }}
                >
                  Job Description (Optional)
                </motion.label>
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.01 }}
                >
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the job description here to tailor questions to your specific role..."
                    className="w-full p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 text-white placeholder-white/50 focus:border-[#2ad17e] focus:outline-none transition-all duration-300 min-h-[140px] resize-y"
                />
                  <AnimatePresence>
                {jdText && (
                      <motion.div 
                        className="mt-3 text-xs text-[#2ad17e] font-semibold"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        ✓ {jdText.length} characters - Questions will be tailored to this role
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Continue Button */}
            {!companyParams && (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.1 }}
            >
              <motion.button
                onClick={() => setCurrentStep('interviewer-selection')}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white font-bold text-lg rounded-2xl shadow-lg overflow-hidden"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(42, 209, 126, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#20c997] to-[#2ad17e]"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Content */}
                <motion.span 
                  className="relative z-10"
                  whileHover={{ x: -5 }}
              >
                Continue to Interviewer Selection
                </motion.span>
                
                <motion.div
                  className="relative z-10"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                >
                  →
                </motion.div>
                
                {/* Particles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/30 rounded-full"
                    style={{
                      left: `${20 + i * 20}%`,
                      top: `${20 + i * 10}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </motion.button>
            </motion.div>
            )}
          </motion.div>
        </motion.div>
        </div>
      </div>
    );
  }

  // Interviewer Selection Screen
  if (currentStep === 'interviewer-selection') {
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
              scale: { duration: 4, repeat: Infinity },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
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
              scale: { duration: 5, repeat: Infinity },
              rotate: { duration: 25, repeat: Infinity, ease: "linear" }
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

        <div className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="flex justify-center gap-4 mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                {[Brain, Target, Star].map((Icon, index) => (
                  <motion.div
                    key={index}
                    className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] flex items-center justify-center"
                    animate={{ 
                      y: [0, -8, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                ))}
              </motion.div>

              <motion.h1 
                className="text-5xl font-extrabold mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-[#2ad17e] via-[#5cd3ff] to-[#ffb21e] bg-clip-text text-transparent">
                  Choose Your Interviewer
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-white/80 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Select from our team of{' '}
                <span className="text-[#2ad17e] font-semibold">professional AI interviewers</span>{' '}
                from top tech companies
              </motion.p>
            </motion.div>

            {/* Interviewer Cards */}
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {interviewers.map((interviewer, index) => (
                <motion.div
                key={interviewer.id}
                onClick={() => setSelectedInterviewer(interviewer)}
                  className={`group relative cursor-pointer transition-all duration-300 ${
                  selectedInterviewer?.id === interviewer.id
                      ? 'transform scale-105'
                      : ''
                  }`}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, type: "spring", stiffness: 200 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 rounded-3xl p-6 h-full relative overflow-hidden ${
                      selectedInterviewer?.id === interviewer.id
                        ? 'border-[#2ad17e] shadow-2xl shadow-[#2ad17e]/20'
                        : 'border-white/20 group-hover:border-white/40'
                    }`}
                  >
                    {/* Animated Background */}
                    <motion.div 
                      className={`absolute inset-0 bg-gradient-to-br from-[#2ad17e]/10 to-[#5cd3ff]/10 ${
                        selectedInterviewer?.id === interviewer.id ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'
                      } transition-opacity duration-500`}
                    />
                    
                    <div className="relative z-10 text-center">
                      {/* Avatar */}
                      <motion.div 
                        className="relative mb-6"
                        animate={{ 
                          scale: selectedInterviewer?.id === interviewer.id ? [1, 1.05, 1] : 1
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <motion.img
                          src={buildAvatarImageUrl(interviewer.avatar, interviewer.gender)}
                    alt={`${interviewer.name} avatar`}
                          className="w-32 h-32 rounded-full mx-auto object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                        
                        {/* Pulsing Ring */}
                        <motion.div 
                          className={`absolute inset-0 rounded-full border-2 ${
                            selectedInterviewer?.id === interviewer.id 
                              ? 'border-[#2ad17e]' 
                              : 'border-white/30 group-hover:border-[#2ad17e]'
                          } transition-colors duration-300`}
                          animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3, type: "tween" }}
                        />

                        {/* Selection Indicator */}
                        <AnimatePresence>
                          {selectedInterviewer?.id === interviewer.id && (
                            <motion.div 
                              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-[#2ad17e] to-[#20c997] flex items-center justify-center"
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 90 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <CheckCircle className="w-5 h-5 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      
                      {/* Details */}
                      <motion.h3 
                        className={`text-xl font-bold mb-2 ${
                          selectedInterviewer?.id === interviewer.id 
                            ? 'text-[#2ad17e]' 
                            : 'text-white group-hover:text-[#2ad17e]'
                        } transition-colors duration-300`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {interviewer.name}
                      </motion.h3>
                      
                      {!companyParams && (
                        <>
                          <motion.p 
                            className="text-[#5cd3ff] text-sm mb-2 font-semibold"
                            initial={{ opacity: 0.8 }}
                            whileHover={{ opacity: 1 }}
                          >
                            {interviewer.role}
                          </motion.p>
                          
                          <motion.p 
                            className="text-white/60 text-xs mb-4"
                            initial={{ opacity: 0.6 }}
                            whileHover={{ opacity: 0.8 }}
                          >
                            {interviewer.company} • {interviewer.experience}
                          </motion.p>
                          
                          {/* Specialties */}
                          <div className="flex flex-wrap gap-2 justify-center">
                            {interviewer.specialties.map((specialty, specIndex) => (
                              <motion.span 
                                key={specialty} 
                                className="bg-gradient-to-r from-white/10 to-white/5 text-white/80 text-xs px-3 py-1 rounded-full border border-white/20"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 + index * 0.1 + specIndex * 0.05 }}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(42, 209, 126, 0.2)' }}
                              >
                                {specialty}
                              </motion.span>
                            ))}
                          </div>
                        </>
                      )}
                </div>
                    
                    {/* Animated Border */}
                    <motion.div 
                      className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] ${
                        selectedInterviewer?.id === interviewer.id ? 'w-full' : 'w-0 group-hover:w-full'
                      } transition-all duration-500`}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              className="flex justify-center gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <motion.button
              onClick={() => setCurrentStep('setup')}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 text-white font-semibold rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  animate={{ x: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                >
                  ←
                </motion.span>
                <span>Back</span>
              </motion.button>
              
              <motion.button
              onClick={() => {
                checkPermissions();
                setCurrentStep('mic-check');
              }}
              disabled={!selectedInterviewer}
                className={`group relative inline-flex items-center justify-center gap-3 px-8 py-3 font-bold rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                  selectedInterviewer
                    ? 'bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white hover:shadow-2xl hover:shadow-[#2ad17e]/30'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed'
                }`}
                whileHover={selectedInterviewer ? { 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(42, 209, 126, 0.3)"
                } : {}}
                whileTap={selectedInterviewer ? { scale: 0.95 } : {}}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Animated Background */}
                {selectedInterviewer && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#20c997] to-[#2ad17e]"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                
                {/* Content */}
                <motion.span className="relative z-10">
              Continue to Setup
                </motion.span>
                
                <motion.div
                  className="relative z-10"
                  animate={selectedInterviewer ? { x: [0, 5, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                >
                  →
                </motion.div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Mic & Quality Check Modal
  if (currentStep === 'mic-check') {
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
              scale: { duration: 4, repeat: Infinity },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
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
              scale: { duration: 5, repeat: Infinity },
              rotate: { duration: 25, repeat: Infinity, ease: "linear" }
            }}
          />

          {/* Floating Tech Icons */}
          {[Camera, Mic, Volume2, Settings].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10"
              style={{
                left: `${20 + i * 20}%`,
                top: `${15 + i * 15}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                rotate: [0, 180, 360],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.8,
              }}
            >
              <Icon className="w-12 h-12" />
            </motion.div>
          ))}
            </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 py-6">
          <motion.div 
            className="w-full max-w-6xl flex flex-col"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-10 relative overflow-visible sm:overflow-hidden flex flex-col"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <motion.div 
                className="text-center mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="flex justify-center gap-4 mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  {[Settings, CheckCircle, Play].map((Icon, index) => (
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
                        delay: index * 0.2
                      }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.h1 
                  className="text-5xl font-extrabold mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="bg-gradient-to-r from-[#2ad17e] via-[#5cd3ff] to-[#ffb21e] bg-clip-text text-transparent">
                    Practice Prerequisite
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-white/80 max-w-3xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Let's ensure everything is working perfectly for your{' '}
                  <span className="text-[#2ad17e] font-semibold">AI interview experience</span>
                </motion.p>
              </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 gap-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {/* Left: Instructions */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <motion.h2 
                  className="text-2xl font-bold text-white mb-6"
                  whileHover={{ x: 5, color: "#2ad17e" }}
                  transition={{ duration: 0.3 }}
                >
                  Interview Practice Instructions
                </motion.h2>
                
                {/* Animated Interviewer Avatar */}
                <motion.div 
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-8 text-center relative overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  {/* Animated Avatar */}
                  <motion.div 
                    className="relative w-32 h-32 mx-auto mb-4"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 4, repeat: Infinity, type: "tween" }}
                  >
                    <motion.div 
                      className="w-full h-full bg-gradient-to-br from-[#2ad17e] to-[#5cd3ff] rounded-full flex items-center justify-center text-4xl font-bold text-white relative"
                      whileHover={{ scale: 1.1 }}
                    >
                    {selectedInterviewer?.name.split(' ').map(n => n[0]).join('') || 'AI'}
                      
                      {/* Pulsing Ring */}
                      <motion.div 
                        className="absolute inset-0 rounded-full border-4 border-white/30"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                      />
                    </motion.div>
                  </motion.div>
                  
                  <motion.p 
                    className="text-[#5cd3ff] font-semibold text-sm"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity, type: "tween" }}
                  >
                    AI Interviewer Video Feed
                  </motion.p>
                  
                  {/* Background decoration */}
                  <motion.div 
                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] opacity-20"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5, type: "tween" }}
                  />
                </motion.div>

                {/* Animated Instructions */}
                <div className="space-y-4">
                  {[
                    "Your interview will be taken by an AI Interviewer - wait for its introduction before starting.",
                    "After each question, click 'Start Answer' to begin and 'Stop Answer' when you finish. The next question will then appear.",
                    "Give detailed answers for better scores and feedback.",
                    "Answer all questions to receive your final analytics report.",
                    "Use headphones/earphones for the best experience."
                  ].map((instruction, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      whileHover={{ x: 5, scale: 1.02 }}
                    >
                      <motion.div 
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white font-bold flex items-center justify-center flex-shrink-0 mt-1"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {index + 1}
                      </motion.div>
                      <motion.p 
                        className="text-white/90 leading-relaxed"
                        initial={{ opacity: 0.8 }}
                        whileHover={{ opacity: 1 }}
                      >
                        {instruction}
                      </motion.p>
                    </motion.div>
                  ))}
                  </div>
              </motion.div>

              {/* Right: Compatibility Test */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.h2 
                  className="text-2xl font-bold text-white mb-6"
                  whileHover={{ x: -5, color: "#5cd3ff" }}
                  transition={{ duration: 0.3 }}
                >
                  Compatibility Test
                </motion.h2>
                
                <motion.div 
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-8 relative overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  {/* Progress Header */}
                  <motion.div 
                    className="flex items-center justify-between mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                  >
                    <motion.span 
                      className="font-bold text-lg text-[#2ad17e]"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                    >
                      Setup Checklist
                    </motion.span>
                    <motion.div 
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white font-bold text-sm"
                      whileHover={{ scale: 1.1 }}
                    >
                      3/6
                    </motion.div>
                  </motion.div>
                  
                  {/* Animated Checklist Items */}
                  <div className="space-y-5">
                    {[
                      { text: "Your browser is compatible with our system.", status: true, icon: "🌐" },
                      { text: "The microphone is enabled.", status: micPermission, icon: "🎤" },
                      { text: "The Camera is enabled.", status: cameraPermission, icon: "📷" },
                      { text: "Please speak to verify the functionality of your microphone.", status: micTestPassed, icon: "🔊", isTest: true }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 + index * 0.1 }}
                        whileHover={{ x: -5, scale: 1.02 }}
                      >
                        {/* Status Indicator */}
                        <motion.div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center relative ${
                            item.status 
                              ? 'bg-gradient-to-r from-[#2ad17e] to-[#20c997]' 
                              : item.isTest 
                                ? 'bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6]'
                                : 'bg-gradient-to-r from-gray-600 to-gray-700'
                          }`}
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          animate={item.status ? { 
                            scale: [1, 1.1, 1],
                            rotate: [0, 360]
                          } : {}}
                          transition={{ 
                            scale: { duration: 2, repeat: Infinity, type: "tween" },
                            rotate: { duration: 3, repeat: Infinity, type: "tween" }
                          }}
                        >
                          <motion.span 
                            className="text-white text-sm font-bold"
                            initial={item.status ? { scale: 0 } : {}}
                            animate={item.status ? { scale: 1 } : {}}
                            transition={{ delay: 1.2 + index * 0.1, type: "spring" }}
                          >
                            {item.status ? '✓' : (item.isTest ? '...' : '?')}
                          </motion.span>
                          
                          {/* Pulsing ring for active items */}
                          {!item.status && (
                            <motion.div 
                              className="absolute inset-0 rounded-full border-2 border-white/30"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                            />
                          )}
                        </motion.div>
                        
                        {/* Icon */}
                        <motion.div 
                          className="text-2xl"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity, delay: index * 0.5, type: "tween" }}
                        >
                          {item.icon}
                        </motion.div>
                        
                        {/* Text */}
                        <motion.span 
                          className="text-white/90 leading-relaxed flex-1"
                          initial={{ opacity: 0.8 }}
                          whileHover={{ opacity: 1 }}
                        >
                          {item.text}
                        </motion.span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Animated Microphone Test */}
                  <motion.div 
                    className="mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                  >
                    {/* Audio Level Visualizer */}
                    <motion.div 
                      className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10"
                      whileHover={{ scale: 1.02 }}
                    >
                      <motion.div 
                        className="text-3xl"
                        animate={{ 
                          scale: audioLevel > 0 ? [1, 1.2, 1] : 1,
                          rotate: audioLevel > 0 ? [0, 10, -10, 0] : 0
                        }}
                        transition={{ duration: 0.5, repeat: audioLevel > 0 ? Infinity : 0 }}
                      >
                        🎤
                      </motion.div>
                      
                      <div className="flex-1">
                        <motion.div 
                          className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-full h-3 relative overflow-hidden"
                        >
                          <motion.div 
                            className="bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] h-full rounded-full transition-all duration-200 relative"
                          style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                            animate={audioLevel > 0 ? {
                              boxShadow: [
                                "0 0 0px rgba(42, 209, 126, 0.4)",
                                "0 0 20px rgba(42, 209, 126, 0.8)",
                                "0 0 0px rgba(42, 209, 126, 0.4)"
                              ]
                            } : {}}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          />
                          
                          {/* Animated particles */}
                          {audioLevel > 0 && [...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute top-1/2 w-1 h-1 bg-white rounded-full"
                              style={{ left: `${20 + i * 30}%` }}
                              animate={{
                                y: [-5, 5, -5],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    {/* Test Button */}
                    <motion.button
                      onClick={testMicrophone}
                      disabled={micTestPassed}
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden ${
                        micTestPassed
                          ? 'bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white'
                          : 'bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] text-white hover:shadow-lg hover:shadow-[#5cd3ff]/30'
                      }`}
                      whileHover={!micTestPassed ? { 
                        scale: 1.02,
                        boxShadow: "0 10px 30px rgba(92, 211, 255, 0.3)"
                      } : {}}
                      whileTap={{ scale: 0.98 }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.6 }}
                    >
                      {/* Background Animation */}
                      {!micTestPassed && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-[#6f5af6] to-[#5cd3ff]"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "0%" }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      
                      {/* Content */}
                      <motion.span 
                        className="relative z-10 flex items-center justify-center gap-2"
                        animate={micTestPassed ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                      >
                        {micTestPassed ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Microphone Test Passed
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5" />
                            Test Microphone
                          </>
                        )}
                      </motion.span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
            </div>

            {/* Action Buttons - Fixed at Bottom */}
            <motion.div 
              className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-8 sm:mt-12 pt-6 border-t border-white/10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              {!companyParams && (
                <motion.button
                  onClick={() => setCurrentStep('interviewer-selection')}
                  className="group relative inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-white/10 to-white/5 text-white font-semibold rounded-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-300 w-full sm:w-auto"
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    animate={{ x: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                  >
                    ←
                  </motion.span>
                  <span>Back</span>
                </motion.button>
              )}
              
              <motion.button
                onClick={startInterview}
                disabled={!micTestPassed || loading}
                className={`group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-sm sm:text-base rounded-2xl shadow-lg overflow-hidden transition-all duration-300 w-full sm:w-auto ${
                  micTestPassed && !loading
                    ? 'bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white hover:shadow-2xl hover:shadow-[#2ad17e]/30'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed opacity-50'
                }`}
                whileHover={micTestPassed && !loading ? { 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(42, 209, 126, 0.3)"
                } : {}}
                whileTap={micTestPassed && !loading ? { scale: 0.95 } : {}}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Animated Background */}
                {micTestPassed && !loading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#20c997] to-[#2ad17e]"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                
                {/* Content */}
                <motion.span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Starting Interview...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Interview
                    </>
                  )}
                </motion.span>
                
                {micTestPassed && !loading && (
                  <motion.div
                    className="relative z-10"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                  >
                    →
                  </motion.div>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      </div>
    );
  }

  // Full-Screen Interview Interface
  if (currentStep === 'interview' && session) {
    // Get current question text
    const currentQuestion = messages.filter(msg => msg.role === 'interviewer').slice(-1)[0]?.content || '';
    const questionCategory = profile === 'frontend' ? 'Technical' : profile === 'backend' ? 'Technical' : profile === 'product' ? 'Product Management' : profile === 'business' ? 'Business' : profile === 'qa' ? 'Quality Assurance' : 'Behavioral';
    const estimatedTimePerQuestion = 2; // minutes
    
    // Get latest interviewer message for auto-play TTS
    const latestInterviewerMessage = messages.filter(msg => msg.role === 'interviewer').slice(-1)[0];
    
    // Preparation tips based on profile
    const getPreparationTips = () => {
      if (profile === 'frontend' || profile === 'backend') {
        return [
          'Use clear examples from your past projects',
          'Explain your thought process step by step',
          'Ask clarifying questions if needed'
        ];
      } else if (profile === 'product') {
        return [
          'Use the STAR method: Situation, Task, Action, Result',
          'Speak clearly and maintain a steady pace',
          'Ensure your background is professional and free of distractions'
        ];
      } else {
        return [
          'Use the STAR method: Situation, Task, Action, Result',
          'Speak clearly and maintain a steady pace',
          'Ensure your background is professional and free of distractions'
        ];
      }
    };

    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] relative overflow-hidden overflow-y-auto">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <motion.div 
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-[#2ad17e]/10 to-[#ffb21e]/10 rounded-full blur-3xl"
            animate={{ 
              x: mousePosition.x * 0.1,
              y: mousePosition.y * 0.1,
              scale: [1, 1.1, 1],
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
            className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-[#6f5af6]/10 to-[#5cd3ff]/10 rounded-full blur-3xl"
            animate={{ 
              x: -mousePosition.x * 0.08,
              y: -mousePosition.y * 0.08,
              scale: [1.1, 1, 1.1],
              rotate: -360
            }}
            transition={{ 
              x: { type: "spring", stiffness: 25 },
              y: { type: "spring", stiffness: 25 },
              scale: { duration: 10, repeat: Infinity, type: "tween" },
              rotate: { duration: 40, repeat: Infinity, ease: "linear" }
            }}
          />
        </div>

        {/* Enhanced Top Header with Branding */}
        <motion.div 
          className="relative z-10 border-b border-white/10 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl px-6 py-4 flex items-center justify-between"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Left: Branding */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Brain className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-white">HireOG AI Interview</span>
          </motion.div>

          {/* Right: Utility Icons */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
      
          </motion.div>
        </motion.div>

        {/* Old Header (keeping for backward compatibility with timer) */}
        <motion.div 
          className="relative z-10 border-b border-white/5 bg-gradient-to-r from-white/5 to-white/0 backdrop-blur-xl px-6 py-3 flex items-center justify-between"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Left: Interviewer Info */}
          <motion.div 
            className="flex items-center gap-6"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Animated Avatar */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
            {session.interviewer.gender === 'female' ? (
                <motion.img
                src={buildAvatarImageUrl(session.interviewer.avatar, 'female')}
                alt={`${session.interviewer.name} avatar`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#2ad17e]"
                  animate={{ 
                    boxShadow: [
                      "0 0 0 0 rgba(42, 209, 126, 0.4)",
                      "0 0 0 10px rgba(42, 209, 126, 0)",
                      "0 0 0 0 rgba(42, 209, 126, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
              />
            ) : (
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-[#2ad17e] to-[#5cd3ff] rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white/20"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    boxShadow: [
                      "0 0 0 0 rgba(42, 209, 126, 0.4)",
                      "0 0 0 8px rgba(42, 209, 126, 0)",
                      "0 0 0 0 rgba(42, 209, 126, 0)"
                    ]
                  }}
                  transition={{ 
                    rotate: { duration: 4, repeat: Infinity },
                    boxShadow: { duration: 2, repeat: Infinity }
                  }}
                >
                {session.interviewer.name.split(' ').map(n => n[0]).join('')}
                </motion.div>
              )}
              
              {/* Online Indicator */}
              <motion.div 
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#2ad17e] rounded-full border-2 border-white flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, type: "tween" }}
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
            </motion.div>
            
            {/* Interviewer Details */}
            <div>
              <motion.h1 
                className="text-xl font-bold text-white"
                whileHover={{ color: "#2ad17e" }}
                transition={{ duration: 0.3 }}
              >
                {session.interviewer.name}
              </motion.h1>
              {!companyParams && (session.interviewer.role || session.interviewer.company) && (
                <motion.p 
                  className="text-[#5cd3ff] text-sm font-medium"
                  initial={{ opacity: 0.7 }}
                  whileHover={{ opacity: 1 }}
                >
                  {session.interviewer.role}
                  {session.interviewer.role && session.interviewer.company ? ' • ' : ''}
                  {session.interviewer.company}
                </motion.p>
              )}
            </div>
          </motion.div>
          
          {/* Right: Timer and Controls */}
          <motion.div 
            className="flex items-center gap-6"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Animated Timer */}
            <motion.div 
              className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 border border-white/20"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="w-5 h-5 text-[#ffb21e]" />
              </motion.div>
              <motion.span 
                className="text-2xl font-mono text-white font-bold"
                animate={timeRemaining <= 300 ? { 
                  color: ["#ffffff", "#ff6b6b", "#ffffff"] 
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {formatTime(timeRemaining)}
              </motion.span>
            </motion.div>
            
            {/* End Interview Button */}
            <motion.button
              onClick={endInterview}
              className="group relative px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500/10 to-red-600/10 border-2 border-red-500/30 text-red-400 hover:border-red-400 hover:text-red-300 font-semibold transition-all duration-300"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(239, 68, 68, 0.2)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span className="relative z-10">End Interview</motion.span>
              
              {/* Hover background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Main Content - Enhanced Layout */}
        <motion.div 
          className="flex-1 flex relative z-10 min-h-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* Left Panel - Video Feeds (Wider) */}
          <motion.div 
            className="flex-[2] flex flex-col border-r border-white/10 bg-gradient-to-br from-[#0b1020] to-[#0f1427]"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          >
            {/* Anti-Cheat Monitoring */}
            {currentStep === 'interview' && session && (
              <AntiCheatMonitor
                isInterviewActive={true}
                onIncident={handleCheatingIncident}
                onWarning={handleWarning}
                onViolation={handleViolation}
                videoRef={videoRef}
                streamRef={streamRef}
              />
            )}
            
            {/* Auto-play TTS for latest interviewer message */}
            {latestInterviewerMessage && (
              <div className="absolute opacity-0 pointer-events-none" style={{ width: '1px', height: '1px', overflow: 'hidden' }}>
                <AzureTTSPlayer
                  text={latestInterviewerMessage.content}
                  key={`auto-tts-${latestInterviewerMessage.content.substring(0, 50)}-${latestInterviewerMessage.timestamp.getTime()}`}
                  autoPlay={true}
                  voice={session.interviewer.gender === 'female' ? 'en-IN-AnanyaNeural' : 'en-IN-KunalNeural'}
                  rate={0.9}
                  pitch={0}
                  onLoadingChange={(loading) => setIsAIAudioLoading(loading)}
                  onComplete={() => {
                    setIsAISpeaking(false);
                    console.log('✅ Azure TTS autoplay completed');
                  }}
                />
              </div>
            )}

            {/* Video Feeds Container */}
            <div className="flex-1 flex  justify-center gap-6 px-8 pt-8 pb-8 mb-6 min-h-0">
              {/* AI Interviewer Video Frame */}
              <motion.div 
                className="relative flex-1 max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
              >
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl aspect-video">
                  {/* Interviewer Avatar/Video */}
                  {avatarVideoUrl ? (
                    <video
                      ref={avatarVideoRef}
                      src={avatarVideoUrl}
                      autoPlay
                      muted={false}
                      playsInline
                      className="w-full h-full object-cover"
                      onEnded={() => {
                        setIsAISpeaking(false);
                        setAvatarVideoUrl(null);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {session.interviewer.gender === 'female' ? (
                        <img
                          src={buildAvatarImageUrl(session.interviewer.avatar, 'female')}
                          alt={`${session.interviewer.name} avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                          <span className="text-6xl font-bold text-white">
                            {session.interviewer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                      {/* Glow effect when speaking */}
                      {isAISpeaking && (
                        <motion.div 
                          className="absolute inset-0 bg-purple-500/30"
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </div>
                  )}
                  
                  {/* Badge at bottom left */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white text-xs font-semibold">
                      {session.interviewer.name} - AI Interviewer
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* User Video Frame */}
              <motion.div 
                className="relative flex-1 max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!streamRef.current && (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <span className="text-4xl">👤</span>
                        </div>
                        <p className="text-sm font-medium">Your Video</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Badge at bottom left */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-blue-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Camera className="w-3 h-3 text-white" />
                    <span className="text-white text-xs font-semibold">You</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Action Button Section */}
            <div className=" mt-12 px-8 pb-20 pt-4 flex flex-col  items-center gap-4 flex-shrink-0">
              <motion.button
                onClick={!isRecording ? startAnswer : stopAnswer}
                disabled={loading && !isRecording}
                className={`mt-6 px-12 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  isRecording 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                }`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mic className="w-5 h-5" />
                {isRecording ? 'Stop Answering' : 'Start Answering'}
              </motion.button>
              
              {/* Timer Text */}
              <motion.p 
                className="text-white/70 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                You will have {estimatedTimePerQuestion} minutes to answer the question.
              </motion.p>
            </div>
          </motion.div>

          {/* Right Sidebar - Question & Tips (Narrower) */}
          <motion.div 
            className="flex-1 flex flex-col border-l border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm overflow-y-auto min-h-0"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          >
            <div className="p-6 space-y-6 pb-8">
              {/* Question Card */}
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <List className="w-5 h-5 text-white" />
                  </div>
                { session.currentQuestion <= session.totalQuestions &&  <h3 className="text-xl font-bold text-white">
                    Question {session.currentQuestion}/{session.totalQuestions}
                  </h3>}
                </div>

                {/* Question Text */}
                <p className="text-white/90 leading-relaxed mb-4 text-base">
                  {currentQuestion || 'Loading question...'}
                </p>

                {/* Listen Button */}
                {currentQuestion && (
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-white/70 text-sm font-medium">Listen:</span>
                    <div className="flex items-center gap-2">
                      <AzureTTSPlayer
                        text={currentQuestion}
                        autoPlay={false}
                        voice={session.interviewer.gender === 'female' ? 'en-IN-AnanyaNeural' : 'en-IN-KunalNeural'}
                        rate={0.9}
                        pitch={0}
                      />
                    </div>
                  </div>
                )}

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-white/70 text-sm">
                    <strong className="text-white">Category:</strong> {questionCategory}
                  </span>
                  <span className="text-white/70 text-sm">
                    <strong className="text-white">Time Allotment:</strong> {estimatedTimePerQuestion} min
                  </span>
                </div>
              </motion.div>

              {/* Preparation Tips Card */}
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Preparation Tips
                  </h3>
                </div>

                {/* Tips List */}
                <ul className="space-y-3">
                  {getPreparationTips().map((tip, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 text-sm leading-relaxed">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>

          {/* Hidden: Keep old conversation panel for backward compatibility but make it optional */}
          {false && (
          <motion.div 
            className="w-1/2 flex flex-col border-r border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          >
            {/* Panel Header */}
            <motion.div 
              className="border-b border-white/10 p-6 bg-gradient-to-r from-white/5 to-white/10"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div 
                className="flex items-center gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                <motion.span 
                  className="bg-gradient-to-r from-[#6f5af6] to-[#9f7aea] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                  variants={{
                    hidden: { scale: 0, opacity: 0 },
                    visible: { scale: 1, opacity: 1 }
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Code className="w-4 h-4" />
                  Frontend Interview
                </motion.span>
                
                <motion.span 
                  className="bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                  variants={{
                    hidden: { scale: 0, opacity: 0 },
                    visible: { scale: 1, opacity: 1 }
                  }}
                  whileHover={{ scale: 1.05 }}
                  animate={{ 
                    boxShadow: [
                      "0 0 0 0 rgba(42, 209, 126, 0.4)",
                      "0 0 0 6px rgba(42, 209, 126, 0)",
                      "0 0 0 0 rgba(42, 209, 126, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Question {session?.currentQuestion || 0} of {session?.totalQuestions || 7}
                </motion.span>
              </motion.div>
            </motion.div>

            <div className="flex-1 p-6 overflow-y-auto">
              {/* Current Question Display */}
              <div className="mb-6">
                {messages.filter(msg => msg.role === 'interviewer').slice(-1).map((message, index) => (
                  <div key={index} className="card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {session?.interviewer?.gender === 'female' ? (
                        <img
                          src={buildAvatarImageUrl(session?.interviewer?.avatar, 'female')}
                          alt={`${session?.interviewer?.name || 'Interviewer'} avatar`}
                          className="w-23 h-23 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                          {session?.interviewer?.name?.split(' ').map(n => n[0]).join('') || 'AI'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{session?.interviewer?.name || 'AI Interviewer'}</h3>
                        <p className="text-sm opacity-80">{session?.interviewer?.role || 'Interviewer'}</p>
                      </div>
                    </div>
                    <div className="leading-relaxed mb-3">
                      {message.content}
                    </div>
                    
                    {/* Azure TTS Player for interviewer messages */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Listen:</span>
                      <AzureTTSPlayer 
                        text={message.content}
                        key={message.content}
                        autoPlay={true} // Auto-play latest message
                        voice={session?.interviewer?.gender === 'female' ? 'en-IN-AnanyaNeural' : 'en-IN-KunalNeural'}
                        rate={0.9}
                        pitch={0}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* User's Recent Answers */}
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-sm">Your Recent Answers:</h4>
                {messages.filter(msg => msg.role === 'candidate').slice(-3).map((message, index) => (
                  <div key={index} className="card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        You
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      {message.isVoice && (
                        <span className="text-xs text-gray-500">🎤</span>
                      )}
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {loading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-purple-100 border-l-4 border-purple-500 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      {session?.interviewer?.gender === 'female' ? (
                        <img
                          src={buildAvatarImageUrl(session?.interviewer?.avatar, 'female')}
                          alt={`${session?.interviewer?.name || 'Interviewer'} avatar`}
                          className="w-23 h-23 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">
                          {session?.interviewer?.name?.split(' ').map(n => n[0]).join('') || 'AI'}
                        </div>
                      )}
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

         
            </div>
          </motion.div>
          )}

          {/* Old Right Panel - Commented out, replaced by new enhanced layout above */}
          {false && (
          <div className="w-1/2 flex flex-col">
            <div className="border-b border-white/10 p-4">
              <h2 className="text-lg font-semibold">INTERVIEW ROOM</h2>
            </div>

            {/* Video Feeds */}
            <div className="relative flex-1 bg-[color:var(--surface)]">
              {/* Animated Interviewer Avatar with D-ID Video */}
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-[color:var(--surface)] backdrop-blur-sm rounded-lg p-4 shadow-lg border border-[color:var(--border)]">
                  <div className="text-center">
                    {/* D-ID Talking Avatar Video or Animated Circle */}
                    <div className="relative mb-3">
                   {avatarVideoUrl ? (
                        // D-ID realistic talking avatar
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-400 shadow-xl">
                          <video
                            ref={avatarVideoRef}
                            src={avatarVideoUrl || undefined}
                            autoPlay
                            muted={false}
                            playsInline
                            className="w-full h-full object-cover"
                            onEnded={() => {
                              setIsAISpeaking(false);
                              setAvatarVideoUrl(null);
                            }}
                          />
                          {/* Glow effect when speaking */}
                          <div 
                            className="absolute inset-0 rounded-full pointer-events-none"
                            style={{
                              boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)',
                              animation: 'pulse 1.5s ease-in-out infinite'
                            }}
                          />
                        </div>
                      ) : (
                        // Fallback animated circle
                        <>
                          {/* Outer glow ring when speaking */}
                          <div 
                            className={`absolute inset-0 rounded-full transition-all duration-300 ${
                              isAISpeaking 
                                ? 'animate-pulse bg-purple-400/30 scale-125' 
                                : 'bg-transparent scale-100'
                            }`}
                            style={{
                              boxShadow: isAISpeaking ? '0 0 30px rgba(168, 85, 247, 0.6)' : 'none'
                            }}
                          />
                          
                          {/* Main avatar circle */}
                          {session?.interviewer?.gender === 'female' ? (
                            <img
                              src={buildAvatarImageUrl(session?.interviewer?.avatar, 'female')}
                              alt={`${session?.interviewer?.name || 'Interviewer'} avatar`}
                              className={`relative w-40 h-40 rounded-full mx-auto object-cover shadow-lg transition-all duration-300 ${
                                isAISpeaking ? 'scale-110' : 'scale-100'
                              }`}
                              style={{
                                animation: isAISpeaking ? 'none' : 'breathe 3s ease-in-out infinite'
                              }}
                            />
                          ) : (
                            <div 
                              className={`relative w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white shadow-lg transition-all duration-300 ${
                                isAISpeaking ? 'scale-110' : 'scale-100'
                              }`}
                              style={{
                                animation: isAISpeaking ? 'none' : 'breathe 3s ease-in-out infinite'
                              }}
                            >
                              {session?.interviewer?.name?.split(' ').map(n => n[0]).join('') || 'AI'}
                            </div>
                          )}
                          
                          {/* Audio waveform bars */}
                          {isAISpeaking && (
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1 bg-purple-500 rounded-full"
                                  style={{
                                    height: `${Math.max(4, audioLevel * 0.3 + Math.random() * 10)}px`,
                                    animation: `wave 0.5s ease-in-out infinite`,
                                    animationDelay: `${i * 0.1}s`
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    <h3 className="text-sm font-bold text-white-800">{session?.interviewer?.name || 'AI Interviewer'}</h3>
                    <p className="text-purple-600 text-xs font-semibold">{session?.interviewer?.role || 'Interviewer'}</p>
                    <p className="text-gray-600 text-xs">{session?.interviewer?.company || ''}</p>
                    
                    {/* Status indicator */}
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isAISpeaking ? 'bg-green-500 animate-pulse' : 
                        isAIAudioLoading ? 'bg-blue-500 animate-pulse' : 
                        loading ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
                      }`} />
                      <span className="text-xs text-white-600">
                        {isAIAudioLoading ? 'Generating voice…' : isAISpeaking ? 'Speaking…' : loading ? 'Thinking…' : 'Listening'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <style jsx>{`
                @keyframes breathe {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.05); }
                }
                @keyframes wave {
                  0%, 100% { transform: scaleY(0.5); }
                  50% { transform: scaleY(1); }
                }
                .spinner {
                  width: 18px; height: 18px; border-radius: 9999px;
                  border: 2px solid rgba(59,130,246,.3);
                  border-top-color: rgba(59,130,246,1);
                  animation: spin .8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
              `}</style>

              {/* User Video Feed */}
              <div className="absolute bottom-4 right-4 z-10">
                <div className="w-64 h-48 bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!streamRef.current && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-2xl">👤</span>
                        </div>
                        <p className="text-xs">Your Video</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timer overlay */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-white text-lg font-mono">
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>

              {/* Current Answer Display */}
              {isRecording && currentAnswer && (
                <div className="absolute bottom-4 left-4 z-10 max-w-md">
                  <div className="bg-blue-500/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-semibold">Recording...</span>
                    </div>
                    <p className="text-white text-sm">{currentAnswer}</p>
                  </div>
                </div>
              )}

              {/* Current Answer Being Built */}
              {currentAnswer && !isRecording && (
                <div className="absolute bottom-4 left-4 z-10 max-w-md">
                  <div className="bg-green-500/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-white text-sm font-semibold">Ready to Submit</span>
                    </div>
                    <p className="text-white text-sm">{currentAnswer.replace(/\[.*?\]/g, '')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Voice Controls */}
            <div className="bg-[color:var(--surface)] border-t border-gray-200 p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white-800 mb-4">Voice Controls</h3>
                
                {/* Current Answer Preview */}
                {currentAnswer && (
                  <div className="bg-[color:var(--surface)] border border-blue-400/30 rounded-lg p-4 mb-4 text-left">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">Your Answer:</h4>
                    <p className="text-sm">{currentAnswer}</p>
                  </div>
                )}
                
                {/* Start/Stop Answer Buttons */}
                <div className="flex gap-4 justify-center mb-4">
                  {!isRecording ? (
                    <button
                      onClick={startAnswer}
                      disabled={loading}
                      className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-all transform hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <span className="text-2xl">🎤</span>
                      START ANSWER
                    </button>
                  ) : (
                    <button
                      onClick={stopAnswer}
                      className="bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-red-700 transition-all transform hover:scale-105 flex items-center gap-3"
                    >
                      <span className="text-2xl">⏹️</span>
                      STOP ANSWER
                    </button>
                  )}
                </div>

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="font-semibold">Recording your answer...</span>
                  </div>
                )}

                {/* Voice Processing Indicator */}
                {!isRecording && currentAnswer && (
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="font-semibold">Voice captured! Click Stop Answer to submit.</span>
                  </div>
                )}

                {/* Text Input Fallback */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Or type your answer:
                  </label>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                  />
                </div>

                {/* Instructions */}
                <div className="text-sm text-gray-600 mt-4">
                  <p>Click "Start Answer" to begin recording your response</p>
                  <p>Click "Stop Answer" when you're done speaking</p>
                  <p className="text-xs text-gray-500 mt-2">Your video will be recorded during the interview</p>
                  <p className="text-xs text-gray-500">You can also type your answer in the text area above</p>
                </div>
              </div>
            </div>
          </div>
          )}
        </motion.div>
        
        {/* Warning Modal */}
        <AnimatePresence>
          {showWarningModal && warnings.length > 0 && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-black/80 backdrop-blur-md rounded-2xl border-2 border-yellow-500/50 p-6 max-w-md w-full shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-xl font-bold text-white">Warning</h3>
                </div>
                <p className="text-white/90 mb-4">{warnings[warnings.length - 1]}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowWarningModal(false)}
                    className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg font-semibold transition-colors"
                  >
                    Understood
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Violation Modal */}
        <AnimatePresence>
          {showViolationModal && violations.length > 0 && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-black/90 backdrop-blur-md rounded-2xl border-2 border-red-500/50 p-6 max-w-md w-full shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <h3 className="text-xl font-bold text-white">Serious Violation</h3>
                </div>
                <p className="text-white/90 mb-4">{violations[violations.length - 1]}</p>
                <p className="text-white/70 text-sm mb-4">
                  This incident has been logged and your interview may be flagged for review.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowViolationModal(false)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold transition-colors"
                  >
                    Acknowledge
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Thank You Screen
  if (currentStep === 'thank-you') {
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

          {/* Floating Success Icons */}
          {[CheckCircle, Star, Target, Settings].map((Icon, i) => (
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
                type: "tween",
              }}
            >
              <Icon className="w-16 h-16" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <motion.div 
            className="w-full max-w-6xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
          >
            <motion.div 
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-12 relative overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Header */}
              <motion.div 
                className="flex items-center justify-between mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="flex items-center gap-6"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-[#2ad17e] to-[#5cd3ff] rounded-2xl flex items-center justify-center relative"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      boxShadow: [
                        "0 0 0 0 rgba(42, 209, 126, 0.4)",
                        "0 0 0 15px rgba(42, 209, 126, 0)",
                        "0 0 0 0 rgba(42, 209, 126, 0)"
                      ]
                    }}
                    transition={{ 
                      rotate: { duration: 4, repeat: Infinity },
                      boxShadow: { duration: 2, repeat: Infinity }
                    }}
                  >
                    <span className="text-white font-bold text-2xl">HO</span>
                  </motion.div>
                  <motion.h1 
                    className="text-3xl font-bold text-white"
                    whileHover={{ color: "#2ad17e" }}
                    transition={{ duration: 0.3 }}
                  >
                    HireOG
                  </motion.h1>
                </motion.div>

                {/* Completion Badge */}
                <motion.div 
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white font-bold flex items-center gap-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Interview Completed
                </motion.div>
              </motion.div>

        {/* Main Content */}
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  className="mb-8"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                >
                  <motion.div 
                    className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#2ad17e] to-[#20c997] rounded-full flex items-center justify-center relative"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, type: "tween" }
                    }}
                  >
                    <CheckCircle className="w-12 h-12 text-white" />
                    
                    {/* Success Particles */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-[#ffb21e] rounded-full"
                        style={{
                          left: "50%",
                          top: "50%",
                        }}
                        animate={{
                          x: [0, Math.cos(i * 60 * Math.PI / 180) * 60],
                          y: [0, Math.sin(i * 60 * Math.PI / 180) * 60],
                          opacity: [1, 0],
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>

                <motion.h1 
                  className="text-5xl font-extrabold mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <span className="bg-gradient-to-r from-[#2ad17e] via-[#5cd3ff] to-[#ffb21e] bg-clip-text text-transparent">
                {companyParams ? (
                  <>
                        Thank you {companyParams.candidateName || user?.name || 'Candidate'}!
                    <br />
                        <span className="text-3xl">
                          You've completed the interview for{' '}
                          <span className="text-[#2ad17e]">{companyParams.company}</span>
                        </span>
                  </>
                ) : (
                      `Thank you ${user?.name || 'Candidate'}! Interview Complete.`
                )}
                  </span>
                </motion.h1>
                
              {companyParams && (
                  <motion.div
                    className="max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <motion.p 
                      className="text-xl text-white/80 leading-relaxed"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 3, repeat: Infinity, type: "tween" }}
                    >
                      The HR team will get back to you with the results.{' '}
                      <span className="text-[#5cd3ff] font-semibold">This interview link has now expired.</span>
                    </motion.p>
                    
                    {/* Decorative Elements */}
                    <motion.div 
                      className="flex justify-center gap-4 mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      {[Brain, Target, Star].map((Icon, index) => (
                        <motion.div
                          key={index}
                          className="w-8 h-8 text-[#ffb21e]/60"
                          animate={{ 
                            y: [0, -10, 0],
                            rotate: [0, 180, 360]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            delay: index * 0.3
                          }}
                        >
                          <Icon className="w-full h-full" />
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>

          {/* Progress Steps */}
              <motion.div 
                className="max-w-3xl mx-auto mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
              >
                <motion.h2 
                  className="text-2xl font-bold text-white text-center mb-8"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                >
                  🚀 Processing Your Interview
                </motion.h2>

                <div className="space-y-6">
                  {[
                    { 
                      id: 'uploading', 
                      title: 'Uploading your responses...', 
                      icon: '📤',
                      description: 'Securely saving your interview data'
                    },
                    { 
                      id: 'analyzing', 
                      title: 'Analyzing your interview...', 
                      icon: '🧠',
                      description: 'AI is evaluating your technical skills and communication'
                    },
                    { 
                      id: 'creating-feedback', 
                      title: 'Creating actionable feedback...', 
                      icon: '📊',
                      description: 'Generating personalized improvement suggestions'
                    }
                  ].map((step, index) => {
                    const isActive = analysisProgress === step.id;
                    const isComplete = ['analyzing', 'creating-feedback', 'complete'].includes(analysisProgress) && 
                                     ['uploading', 'analyzing', 'creating-feedback'].indexOf(step.id) < 
                                     ['uploading', 'analyzing', 'creating-feedback'].indexOf(analysisProgress);
                    const isCompleteAll = analysisProgress === 'complete';
    
    return (
                      <motion.div
                        key={step.id}
                        className={`relative p-6 rounded-3xl border-2 transition-all duration-500 ${
                          isActive 
                            ? 'bg-gradient-to-r from-[#6f5af6]/20 to-[#9f7aea]/20 border-[#6f5af6] shadow-lg shadow-[#6f5af6]/20' 
                            : (isComplete || isCompleteAll)
                              ? 'bg-gradient-to-r from-[#2ad17e]/20 to-[#20c997]/20 border-[#2ad17e] shadow-lg shadow-[#2ad17e]/20'
                              : 'bg-gradient-to-r from-white/5 to-white/10 border-white/20'
                        }`}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.5 + index * 0.2 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        {/* Progress Line */}
                        {index < 2 && (
                          <motion.div 
                            className="absolute left-8 top-full w-0.5 h-6 bg-gradient-to-b from-white/30 to-transparent"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 1.7 + index * 0.2 }}
                          />
                        )}

                        <div className="flex items-center gap-6">
                          {/* Status Indicator */}
                          <motion.div 
                            className={`relative w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                              isActive 
                                ? 'bg-gradient-to-r from-[#6f5af6] to-[#9f7aea]' 
                                : (isComplete || isCompleteAll)
                                  ? 'bg-gradient-to-r from-[#2ad17e] to-[#20c997]'
                                  : 'bg-gradient-to-r from-gray-600 to-gray-700'
                            }`}
                            animate={isActive ? { 
                              scale: [1, 1.1, 1],
                              rotate: [0, 360]
                            } : (isComplete || isCompleteAll) ? {
                              scale: [1, 1.2, 1]
                            } : {}}
                            transition={{ 
                              scale: { duration: 2, repeat: Infinity, type: "tween" },
                              rotate: { duration: 3, repeat: Infinity, type: "tween" }
                            }}
                          >
                            {/* Background glow */}
                            {isActive && (
                              <motion.div 
                                className="absolute inset-0 rounded-full bg-[#6f5af6] blur-lg"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                              />
                            )}

                            <span className="relative z-10 text-white">
                              {(isComplete || isCompleteAll) ? '✓' : isActive ? step.icon : '⏳'}
                  </span>

                            {/* Spinning loader for active state */}
                            {isActive && (
                              <motion.div 
                                className="absolute inset-0 border-4 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                            )}
                          </motion.div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <motion.h3 
                              className={`text-xl font-bold mb-2 ${
                                isActive ? 'text-[#6f5af6]' : 
                                (isComplete || isCompleteAll) ? 'text-[#2ad17e]' : 'text-white'
                              }`}
                              animate={isActive ? { opacity: [0.8, 1, 0.8] } : {}}
                              transition={{ duration: 1.5, repeat: Infinity, type: "tween" }}
                            >
                              {step.title}
                            </motion.h3>
                            <motion.p 
                              className="text-white/70 text-sm"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.6 + index * 0.2 }}
                            >
                              {step.description}
                            </motion.p>
              </div>

                          {/* Animation Elements */}
                          {isActive && (
                            <motion.div 
                              className="flex gap-1"
                              initial="hidden"
                              animate="visible"
                              variants={{
                                visible: {
                                  transition: {
                                    staggerChildren: 0.1,
                                    repeat: Infinity,
                                    repeatType: "loop" 
                                  }
                                }
                              }}
                            >
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-2 h-2 bg-[#6f5af6] rounded-full"
                                  variants={{
                                    hidden: { opacity: 0.3, scale: 0.8 },
                                    visible: { opacity: 1, scale: 1.2 }
                                  }}
                                  transition={{ duration: 0.5 }}
                                />
                              ))}
                            </motion.div>
                          )}
                </div>
                      </motion.div>
                  );
                })}
              </div>
              </motion.div>

          {/* Interview Summary Cards */}
              <motion.div 
                className="grid md:grid-cols-3 gap-6 mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0 }}
              >
                {[
                  { 
                    title: 'Position', 
                    value: profile === 'frontend' ? 'Frontend Developer' : 
                           profile === 'backend' ? 'Backend Developer' : 
                           'Developer',
                    icon: '💻', 
                    color: 'from-[#6f5af6] to-[#9f7aea]',
                    textColor: 'text-[#9f7aea]'
                  },
                  { 
                    title: 'Round', 
                    value: 'Technical Interview', 
                    icon: '🎯', 
                    color: 'from-[#5cd3ff] to-[#3b82f6]',
                    textColor: 'text-[#5cd3ff]'
                  },
                  { 
                    title: 'Completed', 
                    value: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 
                    icon: '✅', 
                    color: 'from-[#2ad17e] to-[#20c997]',
                    textColor: 'text-[#2ad17e]'
                  }
                ].map((card, index) => (
                  <motion.div
                    key={card.title}
                    className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-lg overflow-hidden group"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.1 + index * 0.1, type: "spring", stiffness: 200 }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -10,
                      boxShadow: "0 20px 40px rgba(255, 255, 255, 0.1)"
                    }}
                  >
                    {/* Animated Background Gradient */}
                    <motion.div 
                      className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10 rounded-3xl`}
                      whileHover={{ opacity: 0.2 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Floating Icon */}
                    <motion.div 
                      className="absolute top-4 right-4 text-4xl"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 4 + index,
                        repeat: Infinity,
                        delay: index * 0.5,
                        type: "tween"
                      }}
                    >
                      {card.icon}
                    </motion.div>

                    <div className="relative z-10">
                      <motion.h3 
                        className="text-white/80 font-semibold mb-4 text-lg"
                        whileHover={{ color: "#ffffff" }}
                        transition={{ duration: 0.3 }}
                      >
                        {card.title}
                      </motion.h3>
                      
                      <motion.p 
                        className={`text-2xl font-bold ${card.textColor} leading-tight`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {card.value}
                      </motion.p>
          </div>

                    {/* Hover particles */}
                    <motion.div 
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`absolute w-1 h-1 bg-gradient-to-r ${card.color} rounded-full`}
                          style={{
                            left: `${20 + i * 30}%`,
                            top: `${30 + i * 20}%`,
                          }}
                          animate={{
                            y: [-10, 10, -10],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        />
                      ))}
                    </motion.div>

                    {/* Border Animation */}
                    <motion.div 
                      className="absolute inset-0 rounded-3xl border-2 border-transparent"
                      whileHover={{
                        borderImageSource: `linear-gradient(45deg, ${card.color.split(' ')[1]}, ${card.color.split(' ')[3]})`,
                        borderImageSlice: 1,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Next Steps Section */}
              {!companyParams && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.6 }}
                >
                  <motion.h2 
                    className="text-3xl font-bold text-white mb-8"
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    What's Next?
                  </motion.h2>

                  <motion.div 
                    className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.2
                        }
                      }
                    }}
                  >
                    {[
                      {
                        title: "View Results",
                        description: "Check your detailed interview analysis and personalized feedback",
                        icon: "📊",
                        action: "View Analysis",
                        color: "from-[#2ad17e] to-[#20c997]"
                      },
                      {
                        title: "Practice More",
                        description: "Take another AI interview to improve your skills further",
                        icon: "🚀",
                        action: "New Interview",
                        color: "from-[#5cd3ff] to-[#6f5af6]"
                      }
                    ].map((item, index) => (
                      <motion.div
                        key={item.title}
                        className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 group cursor-pointer overflow-hidden"
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 }
                        }}
                        whileHover={{ 
                          scale: 1.02, 
                          y: -5,
                          boxShadow: "0 20px 40px rgba(255, 255, 255, 0.1)"
                        }}
                        onClick={() => {
                          if (index === 0) {
                            // Navigate to results
                            router.push('/progress');
                          } else {
                            // Start new interview
                            window.location.reload();
                          }
                        }}
                      >
                        {/* Background Animation */}
                        <motion.div 
                          className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`}
                        />

                        {/* Floating Icon */}
                        <motion.div 
                          className="text-6xl mb-4 text-center"
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 3 + index,
                            repeat: Infinity,
                            delay: index * 0.5,
                            type: "tween"
                          }}
                        >
                          {item.icon}
                        </motion.div>

                        <div className="text-center relative z-10">
                          <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                          <p className="text-white/80 mb-6 leading-relaxed">{item.description}</p>
                          
                          <motion.button
                            className={`px-8 py-3 rounded-2xl bg-gradient-to-r ${item.color} text-white font-bold shadow-lg transition-all duration-300 group-hover:shadow-xl`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {item.action}
                          </motion.button>
                </div>

                        {/* Particle Effects on Hover */}
                        <motion.div 
                          className="absolute inset-0 pointer-events-none"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-white rounded-full"
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
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Completion Message for Company Interviews */}
              {companyParams && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.6, type: "spring", stiffness: 200 }}
                >
                  <motion.div 
                    className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#2ad17e] to-[#20c997] rounded-full flex items-center justify-center"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                      scale: { duration: 3, repeat: Infinity, type: "tween" }
                    }}
                  >
                    <span className="text-4xl">🎉</span>
                  </motion.div>
                  
                  <motion.p 
                    className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed"
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, type: "tween" }}
                  >
                    You can now close this window. Thank you for your time and effort!
                  </motion.p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Analysis Screen (Interview Results & Score)
  if (currentStep === 'analysis' && feedback) {
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
        </div>

        {/* Main Content */}
        <div className="relative z-10 p-6">
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#2ad17e] to-[#20c997] rounded-full flex items-center justify-center"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, type: "tween" }
                }}
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              
              <motion.h1 
                className="text-4xl font-extrabold mb-4"
                animate={{ opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, type: "tween" }}
              >
                <span className="bg-gradient-to-r from-[#2ad17e] via-[#5cd3ff] to-[#ffb21e] bg-clip-text text-transparent">
                  Interview Analysis Complete
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-white/80 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Here's your detailed performance analysis and personalized feedback
              </motion.p>
            </motion.div>

            {/* Score Overview */}
            <motion.div 
              className="grid md:grid-cols-3 gap-6 mb-12"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, staggerChildren: 0.2 }}
            >
          {/* Overall Score */}
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-6xl font-bold mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                >
                  <span className="bg-gradient-to-r from-[#2ad17e] to-[#20c997] bg-clip-text text-transparent">
                    {Math.round(feedback.overallScore || 0)}
                  </span>
                  <span className="text-2xl text-white/60">%</span>
                </motion.div>
                <p className="text-white font-semibold text-lg">Overall Score</p>
                <p className="text-white/70 text-sm mt-2">
                  {feedback.overallScore >= 90 ? 'Excellent Performance!' : 
                   feedback.overallScore >= 80 ? 'Great Job!' : 
                   feedback.overallScore >= 70 ? 'Good Performance' : 
                   'Room for Improvement'}
                </p>

                {/* Background decoration */}
                <motion.div 
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r from-[#2ad17e] to-[#20c997] opacity-20"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 3, repeat: Infinity, type: "tween" }}
                />
              </motion.div>

              {/* Technical Skills */}
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-6xl font-bold mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, type: "tween" }}
                >
                  <span className="bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] bg-clip-text text-transparent">
                    {Math.round(feedback.technicalScore || 0)}
                            </span>
                  <span className="text-2xl text-white/60">%</span>
                </motion.div>
                <p className="text-white font-semibold text-lg">Technical Skills</p>
                <p className="text-white/70 text-sm mt-2">Code quality & problem solving</p>

                {/* Background decoration */}
                <motion.div 
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] opacity-20"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, type: "tween" }}
                />
              </motion.div>

              {/* Communication */}
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-6xl font-bold mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, type: "tween" }}
                >
                  <span className="bg-gradient-to-r from-[#ffb21e] to-[#ff6b6b] bg-clip-text text-transparent">
                    {Math.round(feedback.communicationScore || 0)}
                            </span>
                  <span className="text-2xl text-white/60">%</span>
                </motion.div>
                <p className="text-white font-semibold text-lg">Communication</p>
                <p className="text-white/70 text-sm mt-2">Clarity & articulation</p>

                {/* Background decoration */}
                <motion.div 
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r from-[#ffb21e] to-[#ff6b6b] opacity-20"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                />
              </motion.div>
            </motion.div>

            {/* Detailed Feedback */}
            <motion.div 
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              whileHover={{ scale: 1.01 }}
            >
              <motion.h2 
                className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <MessageCircle className="w-8 h-8 text-[#2ad17e]" />
                </motion.div>
                Detailed Feedback
              </motion.h2>
              
              <motion.div 
                className="prose prose-invert max-w-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                <div className="text-white/90 leading-relaxed space-y-6">
                  {/* Handle different feedback formats */}
                  {((): React.ReactNode => {
                    const feedbackData = feedback.detailedFeedback || feedback.feedback || feedback;
                    
                    // If feedback is a string, render it directly
                    if (typeof feedbackData === 'string') {
                      return <div className="whitespace-pre-wrap">{feedbackData}</div>;
                    }
                    
                    // If feedback is an object with structured data
                    if (typeof feedbackData === 'object' && feedbackData !== null) {
                      return (
                        <div className="space-y-6">
                          {/* Summary */}
                          {feedbackData.summary && (
                            <div>
                              <h3 className="text-lg font-semibold text-[#2ad17e] mb-3">Summary</h3>
                              <p className="text-white/90">{feedbackData.summary}</p>
                        </div>
                          )}

                          {/* Strengths */}
                          {feedbackData.strengths && (
                            <div>
                              <h3 className="text-lg font-semibold text-[#5cd3ff] mb-3">Strengths</h3>
                              {Array.isArray(feedbackData.strengths) ? (
                                <ul className="space-y-2">
                                  {feedbackData.strengths.map((strength: string, index: number) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <span className="text-[#2ad17e] mt-1">✓</span>
                                      <span className="text-white/90">{strength}</span>
                                  </li>
                                ))}
                              </ul>
                              ) : (
                                <p className="text-white/90">{feedbackData.strengths}</p>
                              )}
                            </div>
                          )}

                          {/* Improvements */}
                          {feedbackData.improvements && (
                            <div>
                              <h3 className="text-lg font-semibold text-[#ffb21e] mb-3">Areas for Improvement</h3>
                              {Array.isArray(feedbackData.improvements) ? (
                                <ul className="space-y-2">
                                  {feedbackData.improvements.map((improvement: string, index: number) => (
                                    <li key={index} className="flex items-start gap-3">
                                      <span className="text-[#ffb21e] mt-1">→</span>
                                      <span className="text-white/90">{improvement}</span>
                                  </li>
                                ))}
                              </ul>
                              ) : (
                                <p className="text-white/90">{feedbackData.improvements}</p>
                              )}
            </div>
          )}

                          {/* Categories/Skills */}
                          {feedbackData.categories && (
                            <div>
                              <h3 className="text-lg font-semibold text-[#6f5af6] mb-3">Skill Categories</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                                {Object.entries(feedbackData.categories as Record<string, number | string>).map(([category, score]: [string, number | string]) => (
                                  <div key={category} className="bg-white/5 rounded-2xl p-4">
                                    <div className="flex justify-between items-center">
                                      <span className="text-white/90 capitalize">{category.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                                      <span className="text-[#2ad17e] font-semibold">
                                        {typeof score === 'number' ? `${Math.round(score)}%` : score}
                                      </span>
                            </div>
                            </div>
                                ))}
              </div>
            </div>
          )}
                    </div>
                      );
                    }
                    
                    // Fallback if no feedback structure is recognized
                  return (
                      <div className="text-white/90">
                        Great job! You demonstrated strong technical skills and clear communication throughout the interview. 
                        Your problem-solving approach was methodical and well-structured. Consider practicing more complex 
                        algorithms to further enhance your performance.
                    </div>
                  );
                  })() as React.ReactNode}
              </div>
              </motion.div>
            </motion.div>
            {/* Per-Question Analysis */}
            {questionAnalysis && questionAnalysis.length > 0 && (
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.01 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-[#5cd3ff]">📋</span>
                  Question-by-Question Analysis
                </h2>
                <div className="space-y-4">
                  {questionAnalysis.map((qa: any, idx: number) => (
                    <div key={idx} className="rounded-2xl bg-white/5 p-4 border border-white/10">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-white/70 text-sm">Question {qa.questionNumber || idx + 1}</p>
                            <p className="text-white font-semibold">{qa.question}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/70 text-xs">Score</p>
                            <p className="text-[#2ad17e] font-bold text-lg">{typeof qa.score === 'number' ? qa.score.toFixed(1) : qa.score}</p>
                          </div>
                        </div>
                        {qa.feedback && (
                          <p className="text-white/80 text-sm mt-1">{qa.feedback}</p>
                        )}
                        <div className="grid md:grid-cols-2 gap-4 mt-3">
                          {Array.isArray(qa.strengths) && qa.strengths.length > 0 && (
                            <div>
                              <p className="text-[#5cd3ff] font-semibold mb-1">Strengths</p>
                              <ul className="list-disc list-inside text-white/85 text-sm space-y-1">
                                {qa.strengths.map((s: string, i: number) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {Array.isArray(qa.improvements) && qa.improvements.length > 0 && (
                            <div>
                              <p className="text-[#ffb21e] font-semibold mb-1">Improvements</p>
                              <ul className="list-disc list-inside text-white/85 text-sm space-y-1">
                                {qa.improvements.map((s: string, i: number) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        {qa.responseType && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
                            <span className="opacity-80">Detected type:</span>
                            <span className="uppercase tracking-wide font-semibold text-white/70">{qa.responseType}</span>
                            {typeof qa.confidence === 'number' && (
                              <span className="ml-auto">Confidence: {(qa.confidence * 100).toFixed(0)}%</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          {/* Action Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
            >
              <motion.button
                className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white font-bold shadow-lg overflow-hidden"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(42, 209, 126, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => setCurrentStep('setup')}
              >
                <motion.span className="relative z-10">Practice Again</motion.span>
                
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#20c997] to-[#2ad17e]"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Particles */}
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
              </motion.button>

              <motion.button
                className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 border-2 border-white/20 text-white font-bold hover:border-white/40 transition-all duration-300"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(255, 255, 255, 0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => router.push('/')}
              >
                <motion.span className="relative z-10">Back to Home</motion.span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}

export default function AIInterviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AIInterviewContent />
    </Suspense>
  );
}