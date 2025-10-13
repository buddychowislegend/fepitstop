"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/config";

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

export default function AIInterviewPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // Interview flow states
  const [currentStep, setCurrentStep] = useState<'setup' | 'interviewer-selection' | 'mic-check' | 'interview' | 'thank-you' | 'analysis'>('setup');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  // ElevenLabs/voice generation loading indicator
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
    // Use a known-good photorealistic face that D-ID accepts (ends with .jpeg)
    const didSampleFace = 'https://create-images-results.d-id.com/google-oauth2%7C117408431483365796674/upl_kF-rKCg5Ym8RMgqrXxRnl/image.jpeg';
    const fallbackFemale = didSampleFace;
    const fallbackMale = didSampleFace;
    const defaultUrl = gender === 'female' ? fallbackFemale : fallbackMale;

    if (!rawUrl) return defaultUrl;

    // If already absolute and has valid image extension, use as is
    const hasValidExt = /(\.jpg|\.jpeg|\.png)(\?.*)?$/i.test(rawUrl);
    const isAbsolute = /^https?:\/\//i.test(rawUrl);
    if (isAbsolute && hasValidExt) return rawUrl;

    // If it's a relative path or missing extension, fall back to a valid stock image
    return defaultUrl;
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
  const [level, setLevel] = useState<'junior' | 'mid' | 'senior'>('mid');
  const [focus, setFocus] = useState<'javascript' | 'react' | 'fullstack'>('fullstack');
  const [selectedInterviewer, setSelectedInterviewer] = useState<Interviewer | null>(null);
  
  // Mic check states
  const [micPermission, setMicPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [micTestPassed, setMicTestPassed] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Timer
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Available interviewers
  const interviewers: Interviewer[] = [
    {
      id: 'sarah-chen',
      name: 'Sarah Chen',
      role: 'Senior Frontend Engineer',
      company: 'Google',
      experience: '8+ years',
      avatar: '/api/placeholder/200/200',
      specialties: ['React', 'TypeScript', 'System Design'],
      gender: 'female'
    },
    {
      id: 'marcus-johnson',
      name: 'Marcus Johnson',
      role: 'Frontend Tech Lead',
      company: 'Meta',
      experience: '10+ years',
      avatar: '/api/placeholder/200/200',
      specialties: ['JavaScript', 'React', 'Performance'],
      gender: 'male'
    },
    {
      id: 'priya-sharma',
      name: 'Priya Sharma',
      role: 'Senior Software Engineer',
      company: 'Amazon',
      experience: '6+ years',
      avatar: '/api/placeholder/200/200',
      specialties: ['Full Stack', 'React', 'Node.js'],
      gender: 'female'
    },
    {
      id: 'alex-kim',
      name: 'Alex Kim',
      role: 'Principal Engineer',
      company: 'Microsoft',
      experience: '12+ years',
      avatar: '/api/placeholder/200/200',
      specialties: ['Frontend Architecture', 'React', 'Web Performance'],
      gender: 'male'
    }
  ];

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin?redirect=/ai-interview');
    }
  }, [authLoading, user, router]);

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
        recognition.lang = 'en-US';
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
          level,
          focus,
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
      const response = await fetch('/api/ai-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'end',
          sessionId: session.id
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
            message: answerToSubmit
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
            message: 'I need to think about this question.'
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
    // Try D-ID video first, fall back to browser speech
    const videoUrl = await generateAvatarVideo(text, sessionData);
    console.log('🎥 D-ID video result:', videoUrl);
    if (!videoUrl) {
      // Fallback already handled in generateAvatarVideo
      console.log('🔄 Using fallback speech synthesis');
      // Explicitly speak via TTS path (ElevenLabs → SpeechSynthesis)
      speakText(text);
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
    utterance.rate = 1.0; // Increased speed by 20% (was 0.8, now 1.0)
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
    
    // Get all available voices and log them for debugging
    console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
    
    let selectedVoice = null;
    
    if (session?.interviewer) {
      console.log(`Selecting voice for ${session.interviewer.name} (${session.interviewer.gender})`);
      
      if (session.interviewer.gender === 'female') {
        // Try multiple strategies to find female voice
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('karen') ||
          voice.name.toLowerCase().includes('susan') ||
          voice.name.toLowerCase().includes('victoria') ||
          voice.name.toLowerCase().includes('zira') ||
          voice.name.toLowerCase().includes('hazel') ||
          voice.name.toLowerCase().includes('allison') ||
          voice.name.toLowerCase().includes('monica') ||
          voice.name.toLowerCase().includes('serena') ||
          voice.name.toLowerCase().includes('tessa') ||
          voice.name.toLowerCase().includes('veena') ||
          voice.name.toLowerCase().includes('priya') ||
          (voice.name.toLowerCase().includes('google') && voice.name.toLowerCase().includes('female')) ||
          (voice.name.toLowerCase().includes('microsoft') && voice.name.toLowerCase().includes('female')) ||
          (voice.name.toLowerCase().includes('samantha')) ||
          (voice.name.toLowerCase().includes('karen'))
        );
        
        // If no specific female voice found, try by checking voice properties
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('google') && 
            !voice.name.toLowerCase().includes('male') &&
            !voice.name.toLowerCase().includes('man')
          );
        }
        
        // Last resort: try any voice that's not explicitly male
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            !voice.name.toLowerCase().includes('male') && 
            !voice.name.toLowerCase().includes('man') &&
            !voice.name.toLowerCase().includes('david') &&
            !voice.name.toLowerCase().includes('mark') &&
            !voice.name.toLowerCase().includes('daniel') &&
            !voice.name.toLowerCase().includes('alex') &&
            !voice.name.toLowerCase().includes('tom') &&
            !voice.name.toLowerCase().includes('richard')
          );
        }
      } else {
        // Try multiple strategies to find male voice
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('male') || 
          voice.name.toLowerCase().includes('man') ||
          voice.name.toLowerCase().includes('david') ||
          voice.name.toLowerCase().includes('mark') ||
          voice.name.toLowerCase().includes('daniel') ||
          voice.name.toLowerCase().includes('alex') ||
          voice.name.toLowerCase().includes('tom') ||
          voice.name.toLowerCase().includes('richard') ||
          voice.name.toLowerCase().includes('john') ||
          voice.name.toLowerCase().includes('michael') ||
          voice.name.toLowerCase().includes('james') ||
          voice.name.toLowerCase().includes('robert') ||
          voice.name.toLowerCase().includes('william') ||
          voice.name.toLowerCase().includes('charles') ||
          (voice.name.toLowerCase().includes('google') && voice.name.toLowerCase().includes('male')) ||
          (voice.name.toLowerCase().includes('microsoft') && voice.name.toLowerCase().includes('male'))
        );
      }
    }
    
    // Fallback to any natural voice if gender-specific not found
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('google') || 
        voice.name.toLowerCase().includes('microsoft') || 
        voice.name.toLowerCase().includes('natural') ||
        voice.name.toLowerCase().includes('enhanced')
      ) || voices[0]; // Use first available voice as last resort
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`✅ Using voice: "${selectedVoice.name}" for ${session?.interviewer?.name} (${session?.interviewer?.gender})`);
    } else {
      console.log('⚠️ No voice selected, using default');
    }

    // Prefer ElevenLabs TTS; fallback to browser SpeechSynthesis
    const tryEleven = async () => {
      try {
        const gender = session?.interviewer?.gender || lastInterviewerGenderRef.current || 'female';
        const vId = (gender === 'male') ? 'Y6nOpHQlW4lnf9GRRc8f' : 'SZfY4K69FwXus87eayHK';
        console.log('🔊 ElevenLabs TTS: sending request', { voiceId: vId, textPreview: text.substring(0, 40) });
        setIsAIAudioLoading(true);
        const resp = await fetch('/api/elevenlabs/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voiceId: vId })
        });
        console.log('🔊 ElevenLabs TTS: response status', resp.status);
        if (resp.ok) {
          const data = await resp.json();
          console.log('🔊 ElevenLabs TTS: payload keys', Object.keys(data || {}));
          if (data.audioUrl) {
            const audio = new Audio(data.audioUrl);
            audio.onplay = () => { setIsAISpeaking(true); setIsAIAudioLoading(false); startAudioVisualization(); };
            audio.onended = () => { setIsAISpeaking(false); stopAudioVisualization(); };
            audio.onerror = () => { setIsAISpeaking(false); setIsAIAudioLoading(false); stopAudioVisualization(); };
            await audio.play();
            return true;
          }
        }
      } catch {}
      finally { setIsAIAudioLoading(false); }
      return false;
    };

    (async () => {
      const ok = await tryEleven();
      if (!ok) {
        console.log('🔊 ElevenLabs TTS fallback → using SpeechSynthesis');
        speechSynthesisRef.current = utterance;
        speechSynthesis.speak(utterance);
      }
    })();
    
    console.log('AI is speaking:', text);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Setup Screen
  if (currentStep === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🤖</div>
              <h1 className="text-4xl font-extrabold text-white mb-2">AI Mock Interview</h1>
              <p className="text-xl text-white/80">
                Practice with professional AI interviewers from top tech companies
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-white mb-4">Experience Level</label>
                <div className="space-y-3">
                  {(['junior', 'mid', 'senior'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        level === lvl
                          ? 'bg-purple-600 text-white border-2 border-purple-400'
                          : 'bg-white/10 text-white/80 hover:bg-white/20 border-2 border-transparent'
                      }`}
                    >
                      <div className="font-semibold capitalize">{lvl} Level</div>
                      <div className="text-sm opacity-80">
                        {lvl === 'junior' && '0-2 years experience'}
                        {lvl === 'mid' && '3-5 years experience'}
                        {lvl === 'senior' && '6+ years experience'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-4">Focus Area</label>
                <div className="space-y-3">
                  {(['javascript', 'react', 'fullstack'] as const).map((foc) => (
                    <button
                      key={foc}
                      onClick={() => setFocus(foc)}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        focus === foc
                          ? 'bg-purple-600 text-white border-2 border-purple-400'
                          : 'bg-white/10 text-white/80 hover:bg-white/20 border-2 border-transparent'
                      }`}
                    >
                      <div className="font-semibold capitalize">{foc}</div>
                      <div className="text-sm opacity-80">
                        {foc === 'javascript' && 'Core JavaScript concepts'}
                        {foc === 'react' && 'React ecosystem & patterns'}
                        {foc === 'fullstack' && 'Full-stack development'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setCurrentStep('interviewer-selection')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                Continue to Interviewer Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interviewer Selection Screen
  if (currentStep === 'interviewer-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white mb-2">Choose Your Interviewer</h1>
            <p className="text-xl text-white/80">Select from our team of AI interviewers</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {interviewers.map((interviewer) => (
              <div
                key={interviewer.id}
                onClick={() => setSelectedInterviewer(interviewer)}
                className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 transition-all cursor-pointer hover:scale-105 ${
                  selectedInterviewer?.id === interviewer.id
                    ? 'border-purple-400 bg-purple-600/20'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white">
                    {interviewer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{interviewer.name}</h3>
                  <p className="text-purple-300 text-sm mb-2">{interviewer.role}</p>
                  <p className="text-white/60 text-xs mb-3">{interviewer.company} • {interviewer.experience}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {interviewer.specialties.map((specialty) => (
                      <span key={specialty} className="bg-white/20 text-white text-xs px-2 py-1 rounded">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setCurrentStep('setup')}
              className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all"
            >
              Back
            </button>
            <button
              onClick={() => {
                checkPermissions();
                setCurrentStep('mic-check');
              }}
              disabled={!selectedInterviewer}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Continue to Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mic & Quality Check Modal
  if (currentStep === 'mic-check') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-white mb-2">Practice Prerequisite</h1>
              <p className="text-white/80">Let's ensure everything is working perfectly</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Instructions */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Interview Practice Instructions</h2>
                
                {/* Video placeholder */}
                <div className="bg-gray-800 rounded-lg p-8 mb-6 text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white">
                    {selectedInterviewer?.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <p className="text-white/80 text-sm">AI Interviewer Video Feed</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <p className="text-white/90 text-sm">Your interview will be taken by an AI Interviewer - wait for its introduction before starting.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <p className="text-white/90 text-sm">After each question, click 'Start Answer' to begin and 'Stop Answer' when you finish. The next question will then appear.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <p className="text-white/90 text-sm">Give detailed answers for better scores and feedback.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                    <p className="text-white/90 text-sm">Answer all questions to receive your final analytics report.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                    <p className="text-white/90 text-sm">Use headphones/earphones for the best experience.</p>
                  </div>
                </div>
              </div>

              {/* Right: Compatibility Test */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Compatibility Test</h2>
                
                <div className="bg-white/5 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-semibold">Setup Checklist (3/6)</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-white/90 text-sm">Your browser is compatible with our system.</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        micPermission ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        <span className="text-white text-xs">{micPermission ? '✓' : '?'}</span>
                      </div>
                      <span className="text-white/90 text-sm">The microphone is enabled.</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        cameraPermission ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        <span className="text-white text-xs">{cameraPermission ? '✓' : '?'}</span>
                      </div>
                      <span className="text-white/90 text-sm">The Camera is enabled.</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        micTestPassed ? 'bg-green-500' : 'bg-blue-500'
                      }`}>
                        <span className="text-white text-xs">{micTestPassed ? '✓' : '...'}</span>
                      </div>
                      <span className="text-white/90 text-sm">Please speak to verify the functionality of your microphone.</span>
                    </div>
                  </div>

                  {/* Microphone test */}
                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-6 h-6 text-purple-400">🎤</div>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-200"
                          style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <button
                      onClick={testMicrophone}
                      disabled={micTestPassed}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {micTestPassed ? 'Microphone Test Passed ✓' : 'Test Microphone'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentStep('interviewer-selection')}
                className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all"
              >
                Back
              </button>
              <button
                onClick={startInterview}
                disabled={!micTestPassed || loading}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Starting Interview...' : 'Start Interview'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full-Screen Interview Interface
  if (currentStep === 'interview' && session) {
    return (
      <div className="h-screen bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {session.interviewer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-white font-semibold">{session.interviewer.name}</h1>
              <p className="text-gray-400 text-sm">{session.interviewer.role} • {session.interviewer.company}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-white">
              <span className="text-2xl font-mono">{formatTime(timeRemaining)}</span>
            </div>
            <button
              onClick={endInterview}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
            >
              End Interview
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Panel - Conversation */}
          <div className="w-1/2 bg-white border-r border-gray-300 flex flex-col">
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Frontend Interview
                </span>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Question {session.currentQuestion} of {session.totalQuestions}
                </span>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {/* Current Question Display */}
              <div className="mb-6">
                {messages.filter(msg => msg.role === 'interviewer').slice(-1).map((message, index) => (
                  <div key={index} className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {session.interviewer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{session.interviewer.name}</h3>
                        <p className="text-sm text-gray-600">{session.interviewer.role}</p>
                      </div>
                    </div>
                    <div className="text-gray-800 leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* User's Recent Answers */}
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-gray-700 text-sm">Your Recent Answers:</h4>
                {messages.filter(msg => msg.role === 'candidate').slice(-3).map((message, index) => (
                  <div key={index} className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
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
                    <p className="text-gray-800 text-sm">{message.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {loading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-purple-100 border-l-4 border-purple-500 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        {session.interviewer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={endInterview}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                <span>↻</span>
                EXIT INTERVIEW
              </button>
            </div>
          </div>

          {/* Right Panel - Interviewer & User Video */}
          <div className="w-1/2 bg-white flex flex-col">
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-800">INTERVIEW ROOM</h2>
            </div>

            {/* Video Feeds */}
            <div className="relative flex-1 bg-gray-100">
              {/* Animated Interviewer Avatar with D-ID Video */}
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
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
                    
                    <h3 className="text-sm font-bold text-gray-800">{session.interviewer.name}</h3>
                    <p className="text-purple-600 text-xs font-semibold">{session.interviewer.role}</p>
                    <p className="text-gray-600 text-xs">{session.interviewer.company}</p>
                    
                    {/* Status indicator */}
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isAISpeaking ? 'bg-green-500 animate-pulse' : 
                        isAIAudioLoading ? 'bg-blue-500 animate-pulse' : 
                        loading ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
                      }`} />
                      <span className="text-xs text-gray-600">
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
            <div className="bg-gray-50 border-t border-gray-200 p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Voice Controls</h3>
                
                {/* Current Answer Preview */}
                {currentAnswer && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Your Answer:</h4>
                    <p className="text-gray-700 text-sm">{currentAnswer}</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
        </div>
      </div>
    );
  }

  // Thank You Screen
  if (currentStep === 'thank-you') {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-purple-600 text-white p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">FP</span>
              </div>
              <h1 className="text-xl font-bold">Frontend Pitstop</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thank you {user?.name || 'sagar bhatnagar'}. You have completed the interview.
            </h1>
          </div>

          {/* Progress Steps */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="space-y-4">
              <div className={`flex items-center gap-4 p-4 rounded-lg ${
                analysisProgress === 'uploading' ? 'bg-purple-50 border-l-4 border-purple-500' : 
                ['analyzing', 'creating-feedback', 'complete'].includes(analysisProgress) ? 'bg-green-50 border-l-4 border-green-500' : 'bg-gray-50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  analysisProgress === 'uploading' ? 'bg-purple-500' : 
                  ['analyzing', 'creating-feedback', 'complete'].includes(analysisProgress) ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <span className="text-white text-sm">
                    {['analyzing', 'creating-feedback', 'complete'].includes(analysisProgress) ? '✓' : '⏳'}
                  </span>
                </div>
                <span className="font-medium">Uploading your responses...</span>
              </div>

              <div className={`flex items-center gap-4 p-4 rounded-lg ${
                analysisProgress === 'analyzing' ? 'bg-purple-50 border-l-4 border-purple-500' : 
                ['creating-feedback', 'complete'].includes(analysisProgress) ? 'bg-green-50 border-l-4 border-green-500' : 'bg-gray-50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  analysisProgress === 'analyzing' ? 'bg-purple-500 animate-pulse' : 
                  ['creating-feedback', 'complete'].includes(analysisProgress) ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <span className="text-white text-sm">
                    {['creating-feedback', 'complete'].includes(analysisProgress) ? '✓' : '⏳'}
                  </span>
                </div>
                <span className="font-medium">Analyzing your interview...</span>
              </div>

              <div className={`flex items-center gap-4 p-4 rounded-lg ${
                analysisProgress === 'creating-feedback' ? 'bg-purple-50 border-l-4 border-purple-500' : 
                analysisProgress === 'complete' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-gray-50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  analysisProgress === 'creating-feedback' ? 'bg-purple-500 animate-pulse' : 
                  analysisProgress === 'complete' ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <span className="text-white text-sm">
                    {analysisProgress === 'complete' ? '✓' : '⏳'}
                  </span>
                </div>
                <span className="font-medium">Creating actionable feedback...</span>
              </div>
            </div>
          </div>

          {/* Interview Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Position</h3>
              <p className="text-2xl font-bold text-purple-600">Frontend Developer</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Round</h3>
              <p className="text-2xl font-bold text-blue-600">Technical Interview</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Completed</h3>
              <p className="text-2xl font-bold text-green-600">
                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">JD Based Interview</h3>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Role Name" 
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <input 
                  type="text" 
                  placeholder="Interview Type" 
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
                  Start Interview
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">AI-Powered Performance Review</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Generic Review</h4>
                  <input 
                    type="text" 
                    placeholder="Role Name" 
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="Candidate Name" 
                    className="w-full p-2 border border-gray-300 rounded text-sm mt-2"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Personalized Review</h4>
                  <input 
                    type="text" 
                    placeholder="Role Name" 
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="Company Name" 
                    className="w-full p-2 border border-gray-300 rounded text-sm mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Mock Interview for Salary Negotiation</h3>
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="w-full h-24 bg-gray-300 rounded flex items-center justify-center">
                  <span className="text-gray-500">Video Preview</span>
                </div>
              </div>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                Start Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Analysis Report Screen
  if (currentStep === 'analysis' && feedback) {
    const interviewLevel = feedback.score >= 8 ? 'Expert' : feedback.score >= 6 ? 'Advanced' : feedback.score >= 4 ? 'Professional' : 'Entry-Level';
    const technicalCompetency = feedback.score >= 8 ? 'Expert' : feedback.score >= 6 ? 'Advanced' : feedback.score >= 4 ? 'Professional' : 'Entry-Level';
    
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-purple-600 text-white p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">FP</span>
              </div>
              <h1 className="text-xl font-bold">Frontend Pitstop</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">Welcome, {user?.name || 'sagar'}</span>
            </div>
          </div>
        </div>

        {/* Interview Details */}
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-purple-600 font-semibold">Position: Frontend Developer</p>
              <p className="text-purple-600 font-semibold">Round: Technical Interview</p>
              <p className="text-purple-600 font-semibold">Completed: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="flex gap-4">
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                TRY SAME INTERVIEW AGAIN
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2">
                <span>📄</span>
                REPORT
              </button>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                CERTIFICATE
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">You Are Here</span>
              <span className="text-sm font-medium text-gray-700">{interviewLevel}</span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((feedback.score / 10) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Incomplete</span>
                <span>Entry-Level</span>
                <span>Professional</span>
                <span>Advanced</span>
                <span>Expert</span>
                <span>Extraordinary</span>
              </div>
            </div>
          </div>

          {/* Performance Gauges */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Interview Level Gauge */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Interview Level</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - feedback.score / 10)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{interviewLevel}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Competency Gauge */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Technical Competency</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - feedback.score / 10)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{technicalCompetency}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Per-Question Detailed Analysis */}
          {feedback.questionAnalysis && feedback.questionAnalysis.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Question-by-Question Analysis</h2>
              <div className="space-y-6">
                {feedback.questionAnalysis.map((qa: any, index: number) => {
                  // Find the corresponding message with video
                  const candidateMsg = messages.find((msg, i) => 
                    msg.role === 'candidate' && msg.content === qa.answer
                  );
                  
                  return (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      {/* Question Header */}
                      <div className="bg-purple-50 p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Question {qa.questionNumber}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Score:</span>
                            <span className={`text-lg font-bold ${
                              qa.score >= 8 ? 'text-green-600' : 
                              qa.score >= 6 ? 'text-blue-600' : 
                              qa.score >= 4 ? 'text-yellow-600' : 
                              'text-red-600'
                            }`}>
                              {qa.score}/10
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Question */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Question:</h4>
                          <p className="text-gray-800 bg-gray-50 p-3 rounded">{qa.question}</p>
                        </div>

                        {/* Answer with Video */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Your Answer:</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Video Playback */}
                            {candidateMsg?.videoUrl && (
                              <div className="bg-black rounded-lg overflow-hidden">
                                <video 
                                  src={candidateMsg.videoUrl} 
                                  controls 
                                  className="w-full h-auto"
                                  style={{ maxHeight: '300px' }}
                                >
                                  Your browser does not support video playback.
                                </video>
                              </div>
                            )}
                            
                            {/* Answer Text */}
                            <div className={candidateMsg?.videoUrl ? '' : 'md:col-span-2'}>
                              <p className="text-gray-800 bg-gray-50 p-3 rounded h-full">{qa.answer}</p>
                            </div>
                          </div>
                        </div>

                        {/* Feedback */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Feedback:</h4>
                          <p className="text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-500">{qa.feedback}</p>
                        </div>

                        {/* Strengths and Improvements */}
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Strengths */}
                          {qa.strengths && qa.strengths.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-green-700 mb-2">✓ Strengths:</h4>
                              <ul className="space-y-1">
                                {qa.strengths.map((strength: string, i: number) => (
                                  <li key={i} className="text-sm text-gray-700 bg-green-50 p-2 rounded flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">•</span>
                                    <span>{strength}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Improvements */}
                          {qa.improvements && qa.improvements.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-yellow-700 mb-2">💡 Areas to Improve:</h4>
                              <ul className="space-y-1">
                                {qa.improvements.map((improvement: string, i: number) => (
                                  <li key={i} className="text-sm text-gray-700 bg-yellow-50 p-2 rounded flex items-start gap-2">
                                    <span className="text-yellow-600 mt-0.5">•</span>
                                    <span>{improvement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Overall Summary */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Overall Summary</h2>
          
          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Strengths */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Strengths</h3>
              <div className="space-y-3">
                {feedback.strengths?.map((strength: string, index: number) => (
                  <div key={index} className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-800">{strength}</span>
                    </div>
                  </div>
                )) || [
                  "Good understanding of basic concepts",
                  "Clear communication style",
                  "Willingness to learn and improve"
                ].map((strength, index) => (
                  <div key={index} className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-800">{strength}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
              <div className="space-y-3">
                {feedback.improvements?.map((improvement: string, index: number) => (
                  <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">💡</span>
                      <span className="text-gray-800">{improvement}</span>
                    </div>
                  </div>
                )) || [
                  "Practice more coding problems",
                  "Study advanced JavaScript concepts",
                  "Improve system design knowledge"
                ].map((improvement, index) => (
                  <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">💡</span>
                      <span className="text-gray-800">{improvement}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance</h3>
              <div className="text-6xl font-bold text-purple-600 mb-2">{feedback.score || 7}/10</div>
              <p className="text-gray-600 mb-4">Great job! Keep practicing to reach the next level.</p>
            </div>
          </div>

          {/* Personalized Study Plan */}
          {feedback.studyPlan && (
            <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-8 shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">📚 Your Personalized 30-Day Study Plan</h2>
                <p className="text-gray-600">Based on your interview performance, here's a customized roadmap to improve</p>
              </div>

              {/* Daily Practice */}
              <div className="bg-white rounded-lg p-6 mb-6 border border-purple-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">⏰ Daily Practice Routine</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">{feedback.studyPlan.dailyPractice.problems}</div>
                    <div className="text-sm text-gray-600 mt-1">Coding Problems</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{feedback.studyPlan.dailyPractice.readingTime} min</div>
                    <div className="text-sm text-gray-600 mt-1">Reading</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{feedback.studyPlan.dailyPractice.videoTime} min</div>
                    <div className="text-sm text-gray-600 mt-1">Videos</div>
                  </div>
                </div>
              </div>

              {/* Weekly Goals */}
              <div className="bg-white rounded-lg p-6 mb-6 border border-purple-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 Weekly Breakdown</h3>
                <div className="space-y-4">
                  {feedback.studyPlan.weeklyGoals.map((week: any, index: number) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">Week {week.week}</span>
                        <h4 className="font-semibold text-gray-900">{week.focus}</h4>
                      </div>
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Goals:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {week.goals.map((goal: string, i: number) => (
                            <li key={i}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Resources:</p>
                        <div className="flex flex-wrap gap-2">
                          {week.resources.map((resource: string, i: number) => (
                            <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {resource}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Resources */}
              <div className="bg-white rounded-lg p-6 mb-6 border border-purple-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📖 Recommended Resources</h3>
                <div className="flex flex-wrap gap-2">
                  {feedback.studyPlan.keyResources.map((resource: string, index: number) => (
                    <span key={index} className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium">
                      {resource}
                    </span>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="bg-white rounded-lg p-6 border border-purple-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🏆 Milestones to Achieve</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {feedback.studyPlan.milestones.map((milestone: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span className="text-sm text-gray-700">{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => {
                setCurrentStep('setup');
                setSession(null);
                setMessages([]);
                setFeedback(null);
              }}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 font-semibold"
            >
              Start New Interview
            </button>
            <button className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold">
              Download Report
            </button>
            {feedback.studyPlan && (
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 font-semibold">
                Save Study Plan
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}