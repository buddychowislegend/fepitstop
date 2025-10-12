"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/config";

type Message = {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
};

type Interviewer = {
  id: string;
  name: string;
  role: string;
  company: string;
  experience: string;
  avatar: string;
  specialties: string[];
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
  const [currentStep, setCurrentStep] = useState<'setup' | 'interviewer-selection' | 'mic-check' | 'interview' | 'feedback'>('setup');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  
  // Voice recognition
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
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
      specialties: ['React', 'TypeScript', 'System Design']
    },
    {
      id: 'marcus-johnson',
      name: 'Marcus Johnson',
      role: 'Frontend Tech Lead',
      company: 'Meta',
      experience: '10+ years',
      avatar: '/api/placeholder/200/200',
      specialties: ['JavaScript', 'React', 'Performance']
    },
    {
      id: 'priya-sharma',
      name: 'Priya Sharma',
      role: 'Senior Software Engineer',
      company: 'Amazon',
      experience: '6+ years',
      avatar: '/api/placeholder/200/200',
      specialties: ['Full Stack', 'React', 'Node.js']
    },
    {
      id: 'alex-kim',
      name: 'Alex Kim',
      role: 'Principal Engineer',
      company: 'Microsoft',
      experience: '12+ years',
      avatar: '/api/placeholder/200/200',
      specialties: ['Frontend Architecture', 'React', 'Web Performance']
    }
  ];

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin?redirect=/ai-interview');
    }
  }, [authLoading, user, router]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      setMessages(newSession.messages);
      setCurrentStep('interview');
      setTimeRemaining(20 * 60);
    } catch (error) {
      console.error('Error starting interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    if (!session || !token) return;
    
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
      setCurrentStep('feedback');
    } catch (error) {
      console.error('Error ending interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAnswer = async () => {
    try {
      // Start camera for user video
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      // Reset current answer and start recording
      setCurrentAnswer('');
      setIsRecording(true);
      setIsListening(true);
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      // Still allow voice recording even if camera fails
      setCurrentAnswer('');
      setIsRecording(true);
      setIsListening(true);
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    }
  };

  const stopAnswer = async () => {
    console.log('Stop answer clicked, current answer:', currentAnswer);
    
    setIsRecording(false);
    setIsListening(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Wait a moment for any final speech recognition results
    await new Promise(resolve => setTimeout(resolve, 500));

    // Send the current answer to AI
    const answerToSubmit = currentAnswer.replace(/\[.*?\]/g, '').trim(); // Remove interim text
    console.log('Final answer to submit:', answerToSubmit);
    console.log('Current answer state:', currentAnswer);
    
    if (answerToSubmit && session) {
      console.log('Submitting answer to AI...');
      
      // Add candidate message to conversation
      const candidateMessage: Message = {
        role: 'candidate',
        content: answerToSubmit,
        timestamp: new Date(),
        isVoice: true
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
      // Even if no voice was captured, submit an empty response to continue the interview
      console.log('No voice captured, submitting empty response to continue interview...');
      
      const candidateMessage: Message = {
        role: 'candidate',
        content: 'I need to think about this question.',
        timestamp: new Date(),
        isVoice: true
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
              {/* Interviewer Avatar */}
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      {session.interviewer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">{session.interviewer.name}</h3>
                    <p className="text-purple-600 text-xs font-semibold">{session.interviewer.role}</p>
                    <p className="text-gray-600 text-xs">{session.interviewer.company}</p>
                  </div>
                </div>
              </div>

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

  // Feedback Screen
  if (currentStep === 'feedback' && feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-extrabold text-white mb-2">Interview Complete!</h1>
              <p className="text-xl text-white/80">Here's your detailed feedback</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Overall Score</h2>
                <div className="bg-white/10 rounded-xl p-6 text-center">
                  <div className="text-6xl font-bold text-green-400 mb-2">{feedback.score}/10</div>
                  <p className="text-white/80">Great performance!</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Key Strengths</h2>
                <div className="space-y-3">
                  {feedback.strengths?.map((strength: string, index: number) => (
                    <div key={index} className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-white">{strength}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Areas for Improvement</h2>
              <div className="space-y-3">
                {feedback.improvements?.map((improvement: string, index: number) => (
                  <div key={index} className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">💡</span>
                      <span className="text-white">{improvement}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setCurrentStep('setup');
                  setSession(null);
                  setMessages([]);
                  setFeedback(null);
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                Start New Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}