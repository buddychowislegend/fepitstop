"use client";
import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/config";
import AzureTTSPlayer from "@/components/AzureTTSPlayer";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Volume2, VolumeX, Clock, Target, Brain, Star, CheckCircle, Play, Pause, RotateCcw, Camera, Settings, Code, MessageCircle } from "lucide-react";

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

function AIInterviewContent() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
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
  
  // Company interview parameters
  const [companyParams, setCompanyParams] = useState<{
    token?: string;
    company?: string;
    profile?: string;
    level?: string;
    candidateName?: string;
    candidateEmail?: string;
  } | null>(null);
  
  // Interview flow states
  const [currentStep, setCurrentStep] = useState<'setup' | 'interviewer-selection' | 'mic-check' | 'interview' | 'thank-you' | 'analysis'>('setup');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  // FreeTTS/voice generation loading indicator
  const [isAIAudioLoading, setIsAIAudioLoading] = useState(false);
  // Track latest interviewer gender for TTS selection even if session is not yet set
  const lastInterviewerGenderRef = useRef<'male' | 'female' | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<'uploading' | 'analyzing' | 'creating-feedback' | 'complete'>('uploading');
  
  // Voice recognition
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const audioVisualizerRef = useRef<NodeJS.Timeout | null>(null);
  const avatarVideoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
  const [profile, setProfile] = useState<'frontend' | 'product' | 'business' | 'qa' | 'hr' | 'backend'>(user?.profile as any || 'frontend');
  const [level, setLevel] = useState<'junior' | 'mid' | 'senior'>('mid');
  const [focus, setFocus] = useState<'javascript' | 'react' | 'fullstack'>('fullstack');
  const [framework, setFramework] = useState<'react' | 'react-native' | 'vue' | 'angular' | 'svelte' | 'nextjs'>('react');
  const [jdText, setJdText] = useState<string>('');
  const [jdUploading, setJdUploading] = useState<boolean>(false);
  const [selectedInterviewer, setSelectedInterviewer] = useState<Interviewer | null>(null);
  
  // Mic check states
  const [micPermission, setMicPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [micTestPassed, setMicTestPassed] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Timer
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      ]
    };

    return interviewerPools[profile as keyof typeof interviewerPools] || interviewerPools.frontend;
  };

  const interviewers = getInterviewersByProfile(profile);

  // Reset selected interviewer when profile changes
  useEffect(() => {
    setSelectedInterviewer(null);
  }, [profile]);

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
        setCompanyParams({
          token,
          company,
          profile: profile || 'frontend',
          level: level || 'mid',
          candidateName: candidateName || undefined,
          candidateEmail: candidateEmail || undefined
        });

        // Auto-select profile and level for company interviews
        if (profile) {
          setProfile(profile as any);
        }
        if (level) {
          setLevel(level as any);
        }

        // Skip setup and go directly to interviewer selection for company interviews
        setCurrentStep('interviewer-selection');
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
    if (!user || !token || !selectedInterviewer) return;
    
    // Track interview start
    trackAIEvent('interview_started', {
      interviewer: selectedInterviewer.name,
      profile: profile,
      level: level
    });
    
    setLoading(true);
    try {
      const response = await fetch('/api/ai-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'start',
          profile,
          level,
          ...(profile === 'frontend' ? { focus, framework } : {}),
          jdText,
          interviewer: selectedInterviewer
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start interview');
      }

      const data = await response.json();
      
      const newSession: InterviewSession = {
        id: data.sessionId,
        interviewer: selectedInterviewer,
        level,
        focus,
        startTime: new Date(),
        messages: [{
          role: 'interviewer',
          content: data.message,
          timestamp: new Date()
        }],
        currentQuestion: 1,
        totalQuestions: 7,
        status: 'active',
        timeRemaining: 20 * 60
      };

      setSession(newSession);
      lastInterviewerGenderRef.current = selectedInterviewer.gender;
      setMessages(newSession.messages);
      setCurrentStep('interview');
      setTimeRemaining(20 * 60);
      
      // Start camera for the interview
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
      
      // Make AI read the initial greeting with D-ID video
      console.log('🚀 Starting interview, will call speakTextOrVideo in 1 second');
      console.log('📊 Session state after setSession:', session);
      setTimeout(() => {
        console.log('⏰ Timeout triggered, calling speakTextOrVideo');
        console.log('📊 Session state in timeout:', session);
        console.log('📊 NewSession data:', newSession);
        speakTextOrVideo(data.message, newSession);
      }, 1000);
    } catch (error) {
      console.error('Error starting interview:', error);
    } finally {
      setLoading(false);
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
      // Build Q/A pairs from conversation
      const qaPairs: Array<{ question: string; answer: string; hasVideo: boolean }> = [];
      const candidateMsgs = messages.filter(m => m.role === 'candidate');
      let ci = 0;
      for (const m of messages) {
        if (m.role === 'interviewer') {
          const q = m.content;
          // pick the next candidate message as answer
          let a = '';
          let hasVideo = false;
          while (ci < candidateMsgs.length && a.trim().length === 0) {
            const cand = candidateMsgs[ci++];
            a = (cand.content || '').replace(/\[.*?\]/g, '').trim();
            hasVideo = !!cand.videoUrl;
          }
          qaPairs.push({ question: q, answer: a, hasVideo });
        }
      }

      // Handle company interviews differently
      if (companyParams) {
        // Submit to backend company interview API
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
        const response = await fetch(`${backendUrl}/api/company/interview/${companyParams.token}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Company-ID': 'hireog',
            'X-Company-Password': 'manasi22'
          },
          credentials: 'include',
          body: JSON.stringify({
            candidateName: companyParams.candidateName,
            candidateEmail: companyParams.candidateEmail,
            profile: companyParams.profile,
            level: companyParams.level,
            company: companyParams.company,
            qaPairs,
            score: 0, // Will be calculated by backend
            feedback: '',
            completedAt: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error('Failed to submit company interview');
        }

        const data = await response.json();
        setFeedback(data);
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
      setFeedback(data);
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
    // Reset current answer and start recording
    setCurrentAnswer('');
    actualSpokenTextRef.current = ''; // Reset the ref
    setIsRecording(true);
    setIsListening(true);
    
    // Start video recording
    if (streamRef.current && !videoRecorderRef.current) {
      try {
        videoChunksRef.current = [];
        const videoRecorder = new MediaRecorder(streamRef.current, {
          mimeType: 'video/webm;codecs=vp8,opus'
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
    
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
    
    console.log('Started recording answer');
  };

  const stopAnswer = async () => {
    console.log('Stop answer clicked, current answer:', currentAnswer);
    
    setIsRecording(false);
    setIsListening(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
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
        const response = await fetch('/api/ai-interview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            action: 'respond',
            sessionId: session.id,
            message: answerToSubmit,
            previousQuestion: messages.filter(m => m.role === 'interviewer').slice(-1)[0]?.content || '',
            profile,
            level,
            ...(profile === 'frontend' ? { focus, framework } : {}),
            jdText
          })
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('AI response:', data);
          
          setMessages(prev => [...prev, {
            role: 'interviewer',
            content: data.message,
            timestamp: new Date()
          }]);
          
          setSession(prev => prev ? {
            ...prev,
            currentQuestion: prev.currentQuestion + 1
          } : null);
          
          // Make AI read the next question with D-ID video
          setTimeout(() => {
            speakTextOrVideo(data.message, session);
          }, 500);
        } else {
          const errorData = await response.text();
          console.error('API error:', errorData);
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
        const response = await fetch('/api/ai-interview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            action: 'respond',
            sessionId: session.id,
            message: 'I need to think about this question.',
            previousQuestion: messages.filter(m => m.role === 'interviewer').slice(-1)[0]?.content || '',
            profile,
            level,
            ...(profile === 'frontend' ? { focus, framework } : {}),
            jdText
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('AI response:', data);
          
          setMessages(prev => [...prev, {
            role: 'interviewer',
            content: data.message,
            timestamp: new Date()
          }]);
          
          setSession(prev => prev ? {
            ...prev,
            currentQuestion: prev.currentQuestion + 1
          } : null);
          
          // Make AI read the next question with D-ID video
          setTimeout(() => {
            speakTextOrVideo(data.message, session);
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
    if (sessionData?.interviewer?.gender) {
      lastInterviewerGenderRef.current = sessionData.interviewer.gender;
    }
    // Azure TTS will be handled by the AzureTTSPlayer component
    console.log('🔄 Azure TTS will be handled by component');
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
              {/* Header */}
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

            {/* Action Buttons */}
            <motion.div 
              className="flex justify-center gap-6 mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              <motion.button
                onClick={() => setCurrentStep('interviewer-selection')}
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
                onClick={startInterview}
                disabled={!micTestPassed || loading}
                className={`group relative inline-flex items-center justify-center gap-3 px-8 py-3 font-bold rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
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
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] relative overflow-hidden">
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

        {/* Header */}
        <motion.div 
          className="relative z-10 border-b border-white/10 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl p-6 flex items-center justify-between"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
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
              <motion.p 
                className="text-[#5cd3ff] text-sm font-medium"
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
              >
                {session.interviewer.role} • {session.interviewer.company}
              </motion.p>
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

        {/* Main Content */}
        <motion.div 
          className="flex-1 flex relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* Left Panel - Conversation */}
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
                  Question {session.currentQuestion} of {session.totalQuestions}
                </motion.span>
              </motion.div>
            </motion.div>

            <div className="flex-1 p-6 overflow-y-auto">
              {/* Current Question Display */}
              <div className="mb-6">
                {messages.filter(msg => msg.role === 'interviewer').slice(-1).map((message, index) => (
                  <div key={index} className="card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {session.interviewer.gender === 'female' ? (
                        <img
                          src={buildAvatarImageUrl(session.interviewer.avatar, 'female')}
                          alt={`${session.interviewer.name} avatar`}
                          className="w-23 h-23 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                          {session.interviewer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{session.interviewer.name}</h3>
                        <p className="text-sm opacity-80">{session.interviewer.role}</p>
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
                        voice={session.interviewer.gender === 'female' ? 'en-IN-AnanyaNeural' : 'en-IN-KunalNeural'}
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
                      {session.interviewer.gender === 'female' ? (
                        <img
                          src={buildAvatarImageUrl(session.interviewer.avatar, 'female')}
                          alt={`${session.interviewer.name} avatar`}
                          className="w-23 h-23 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">
                          {session.interviewer.name.split(' ').map(n => n[0]).join('')}
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

          {/* Right Panel - Interviewer & User Video */}
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
                          {session.interviewer.gender === 'female' ? (
                            <img
                              src={buildAvatarImageUrl(session.interviewer.avatar, 'female')}
                              alt={`${session.interviewer.name} avatar`}
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
                              {session.interviewer.name.split(' ').map(n => n[0]).join('')}
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
                    
                    <h3 className="text-sm font-bold text-white-800">{session.interviewer.name}</h3>
                    <p className="text-purple-600 text-xs font-semibold">{session.interviewer.role}</p>
                    <p className="text-gray-600 text-xs">{session.interviewer.company}</p>
                    
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
        </motion.div>
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
                    {Math.round(feedback.overallScore || 85)}
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
                    {Math.round(feedback.technicalScore || 82)}
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
                    {Math.round(feedback.communicationScore || 88)}
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
                  {(() => {
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
                                  {feedbackData.strengths.map((strength, index) => (
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
                                  {feedbackData.improvements.map((improvement, index) => (
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
                                {Object.entries(feedbackData.categories).map(([category, score]) => (
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
                  })()}
              </div>
              </motion.div>
            </motion.div>

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