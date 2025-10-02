"use client";
import { useState, useEffect, useRef } from "react";

type InterviewTopic = {
  id: string;
  name: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number; // in minutes
  questions: string[];
};

type InterviewState = "setup" | "interview" | "feedback" | "completed";

const interviewTopics: InterviewTopic[] = [
  {
    id: "react-fundamentals",
    name: "React Fundamentals",
    description: "Core React concepts, hooks, and component lifecycle",
    difficulty: "Beginner",
    duration: 30,
    questions: [
      "What is React and what problems does it solve?",
      "Explain the difference between functional and class components",
      "What are React hooks and why were they introduced?",
      "Explain useState and useEffect hooks",
      "What is the virtual DOM and how does it work?",
      "How do you handle events in React?",
      "What is JSX and how does it work?",
      "Explain component props and state",
      "What is the difference between controlled and uncontrolled components?",
      "How do you handle forms in React?"
    ]
  },
  {
    id: "javascript-advanced",
    name: "Advanced JavaScript",
    description: "Closures, prototypes, async programming, and ES6+ features",
    difficulty: "Intermediate",
    duration: 45,
    questions: [
      "Explain closures in JavaScript with examples",
      "What is the difference between var, let, and const?",
      "Explain the prototype chain in JavaScript",
      "What are promises and how do they work?",
      "Explain async/await and how it relates to promises",
      "What is the event loop in JavaScript?",
      "Explain hoisting in JavaScript",
      "What are arrow functions and how do they differ from regular functions?",
      "Explain destructuring assignment",
      "What are modules in JavaScript and how do you use them?"
    ]
  },
  {
    id: "system-design",
    name: "Frontend System Design",
    description: "Designing scalable frontend architectures and applications",
    difficulty: "Advanced",
    duration: 60,
    questions: [
      "How would you design a scalable component library?",
      "Explain different state management patterns in React",
      "How would you optimize a React application for performance?",
      "Design a real-time chat application frontend",
      "How would you handle authentication in a SPA?",
      "Explain micro-frontend architecture",
      "How would you implement code splitting in a large application?",
      "Design a dashboard with real-time data updates",
      "How would you handle internationalization in a React app?",
      "Explain different caching strategies for frontend applications"
    ]
  },
  {
    id: "css-advanced",
    name: "Advanced CSS & Styling",
    description: "CSS Grid, Flexbox, animations, and modern styling techniques",
    difficulty: "Intermediate",
    duration: 30,
    questions: [
      "Explain the difference between CSS Grid and Flexbox",
      "How do you create responsive designs with CSS Grid?",
      "Explain CSS custom properties (CSS variables)",
      "How do you implement CSS animations and transitions?",
      "What is the CSS box model?",
      "Explain different CSS positioning methods",
      "How do you handle CSS specificity and inheritance?",
      "What are CSS preprocessors and their benefits?",
      "How do you implement dark mode in CSS?",
      "Explain CSS-in-JS and its advantages"
    ]
  }
];

type InterviewSession = {
  id: string;
  topic: InterviewTopic;
  startTime: Date;
  endTime?: Date;
  currentQuestionIndex: number;
  answers: { question: string; answer: string; timestamp: Date }[];
  feedback?: {
    overallScore: number;
    strengths: string[];
    improvements: string[];
    detailedFeedback: string;
  };
};

export default function MockInterviewPage() {
  const [currentView, setCurrentView] = useState<"schedule" | "ai-interview">("schedule");
  const [selectedTopic, setSelectedTopic] = useState<InterviewTopic | null>(null);
  const [interviewState, setInterviewState] = useState<InterviewState>("setup");
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState<InterviewSession[]>([]);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('default');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load available voices and interview history
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await fetch('/api/text-to-speech');
        const data = await response.json();
        if (data.success) {
          setAvailableVoices(data.voices);
        }
      } catch (error) {
        console.error('Error loading voices:', error);
      }
    };

    const mockHistory: InterviewSession[] = [
      {
        id: "1",
        topic: interviewTopics[0],
        startTime: new Date("2025-09-28T10:00:00"),
        endTime: new Date("2025-09-28T10:30:00"),
        currentQuestionIndex: 10,
        answers: [],
        feedback: {
          overallScore: 8.5,
          strengths: ["Strong understanding of React hooks", "Good problem-solving approach"],
          improvements: ["Work on explaining concepts more clearly", "Practice with more complex state management"],
          detailedFeedback: "Excellent technical knowledge with room for improvement in communication."
        }
      }
    ];
    
    setInterviewHistory(mockHistory);
    loadVoices();
  }, []);

  const startInterview = async () => {
    if (!selectedTopic) return;
    
    try {
      // Generate AI questions for the selected topic
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-questions',
          topic: selectedTopic.id,
          difficulty: selectedTopic.difficulty,
          count: 5
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Create interview session with AI-generated questions
        const session: InterviewSession = {
          id: data.sessionId,
          topic: {
            ...selectedTopic,
            questions: data.questions
          },
          startTime: new Date(),
          currentQuestionIndex: 0,
          answers: []
        };
        
        // Save session to database
        await fetch('/api/interview-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create-session',
            sessionId: session.id,
            sessionData: {
              userId: 'current-user', // Replace with actual user ID
              topic: selectedTopic.id,
              difficulty: selectedTopic.difficulty,
              questions: data.questions
            }
          })
        });
        
        setCurrentSession(session);
        setInterviewState("interview");
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      // Fallback to original questions if AI fails
      const session: InterviewSession = {
        id: Date.now().toString(),
        topic: selectedTopic,
        startTime: new Date(),
        currentQuestionIndex: 0,
        answers: []
      };
      setCurrentSession(session);
      setInterviewState("interview");
    }
  };

  const submitAnswer = async () => {
    if (!currentSession || !userAnswer.trim()) return;
    
    const currentQuestion = currentSession.topic.questions[currentSession.currentQuestionIndex];
    
    try {
      // Get AI feedback for the answer
      const feedbackResponse = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate-answer',
          question: currentQuestion,
          answer: userAnswer,
          topic: currentSession.topic.id
        })
      });
      
      const feedbackData = await feedbackResponse.json();
      
      const answer = {
        question: currentQuestion,
        answer: userAnswer,
        timestamp: new Date(),
        feedback: feedbackData.success ? feedbackData.feedback : null
      };
      
      const updatedSession = {
        ...currentSession,
        answers: [...currentSession.answers, answer],
        currentQuestionIndex: currentSession.currentQuestionIndex + 1
      };
      
      // Update session in database
      await fetch('/api/interview-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-session',
          sessionId: currentSession.id,
          answer: answer
        })
      });
      
      setCurrentSession(updatedSession);
      setUserAnswer("");
      
      // Check if interview is complete
      if (updatedSession.currentQuestionIndex >= currentSession.topic.questions.length) {
        endInterview(updatedSession);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      // Fallback to original behavior
      const answer = {
        question: currentQuestion,
        answer: userAnswer,
        timestamp: new Date()
      };
      
      const updatedSession = {
        ...currentSession,
        answers: [...currentSession.answers, answer],
        currentQuestionIndex: currentSession.currentQuestionIndex + 1
      };
      
      setCurrentSession(updatedSession);
      setUserAnswer("");
      
      if (updatedSession.currentQuestionIndex >= currentSession.topic.questions.length) {
        endInterview(updatedSession);
      }
    }
  };

  const endInterview = (session: InterviewSession) => {
    const endTime = new Date();
    const completedSession = {
      ...session,
      endTime,
      feedback: generateFeedback(session)
    };
    
    setCurrentSession(completedSession);
    setInterviewState("feedback");
    
    // Add to history
    setInterviewHistory(prev => [completedSession, ...prev]);
  };

  const generateFeedback = (session: InterviewSession) => {
    // Mock AI feedback generation
    const score = Math.random() * 3 + 7; // 7-10 range
    const strengths = [
      "Good technical knowledge",
      "Clear problem-solving approach",
      "Effective use of examples"
    ];
    const improvements = [
      "Work on explaining concepts more clearly",
      "Practice with more complex scenarios",
      "Improve time management"
    ];
    
    return {
      overallScore: Math.round(score * 10) / 10,
      strengths,
      improvements,
      detailedFeedback: `You demonstrated solid understanding of ${session.topic.name}. Your answers showed good technical knowledge, though there's room for improvement in explaining complex concepts more clearly. Consider practicing with more advanced scenarios to further strengthen your skills.`
    };
  };

  const startRecording = async () => {
    try {
      console.log("Starting recording...");
      
      // Check if Web Speech API is available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        startSpeechRecognition();
      } else {
        // Fallback to MediaRecorder
        startMediaRecorder();
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Error accessing microphone. Please check your browser permissions.");
      setIsRecording(false);
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsRecording(true);
      setTranscriptionText('');
    };
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      const fullTranscript = finalTranscript + interimTranscript;
      setTranscriptionText(fullTranscript);
      setUserAnswer(prev => prev + (prev ? ' ' : '') + fullTranscript);
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsRecording(false);
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  const startMediaRecorder = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      } 
    });
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    
    mediaRecorder.ondataavailable = (event) => {
      console.log("Audio data available:", event.data.size, "bytes");
      audioChunksRef.current.push(event.data);
    };
    
    mediaRecorder.onstop = async () => {
      console.log("Recording stopped, processing audio...");
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log("Audio blob size:", audioBlob.size, "bytes");
      await transcribeAudio(audioBlob);
      
      // Stop all tracks to release microphone
      stream.getTracks().forEach(track => track.stop());
    };
    
    mediaRecorder.onerror = (event) => {
      console.error("MediaRecorder error:", event);
      setIsRecording(false);
    };
    
    mediaRecorder.start(1000); // Collect data every second
    setIsRecording(true);
    console.log("Recording started successfully");
  };

  const stopRecording = () => {
    console.log("Stopping recording...");
    
    // Stop Web Speech API if active
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      console.log("Speech recognition stopped");
    }
    
    // Stop MediaRecorder if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("MediaRecorder stopped");
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      console.log("Transcribing audio...");
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      console.log("Transcription response:", data);
      
      if (data.success && data.transcription) {
        setUserAnswer(prev => prev + (prev ? ' ' : '') + data.transcription);
        console.log("Transcription added to answer");
      } else {
        console.error("Transcription failed:", data.error);
        alert("Failed to transcribe audio. Please try again.");
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert("Error transcribing audio. Please try again.");
    }
  };

  const speakQuestion = async (question: string) => {
    try {
      setIsPlayingQuestion(true);
      
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: question,
          voice: selectedVoice,
          speed: 1.0
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.audioUrl) {
        if (audioRef.current) {
          audioRef.current.src = data.audioUrl;
          audioRef.current.play();
          
          audioRef.current.onended = () => {
            setIsPlayingQuestion(false);
          };
        }
      }
    } catch (error) {
      console.error('Error speaking question:', error);
      setIsPlayingQuestion(false);
    }
  };

  const resetInterview = () => {
    setCurrentSession(null);
    setInterviewState("setup");
    setUserAnswer("");
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <audio ref={audioRef} />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">Mock Interview Center</h1>
            <p className="mt-2 text-white/80">Practice with AI-powered interviews or schedule with peers.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentView("schedule")}
              className={`px-4 py-2 rounded-lg transition ${
                currentView === "schedule" 
                  ? "bg-white text-[#3a1670]" 
                  : "bg-white/10 text-white/80 hover:bg-white/15"
              }`}
            >
              Schedule Interview
            </button>
            <button
              onClick={() => setCurrentView("ai-interview")}
              className={`px-4 py-2 rounded-lg transition ${
                currentView === "ai-interview" 
                  ? "bg-white text-[#3a1670]" 
                  : "bg-white/10 text-white/80 hover:bg-white/15"
              }`}
            >
              AI Interview
            </button>
          </div>
        </div>

        {currentView === "schedule" && (
          <div className="mt-8">
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { id: "1", date: "Oct 5, 2025", time: "10:00 AM", type: "Automated", available: true },
                { id: "2", date: "Oct 5, 2025", time: "2:00 PM", type: "Peer", available: true },
                { id: "3", date: "Oct 6, 2025", time: "11:00 AM", type: "Automated", available: true },
                { id: "4", date: "Oct 6, 2025", time: "3:00 PM", type: "Peer", available: false },
              ].map((slot) => (
                <div
                  key={slot.id}
                  className={`rounded-2xl p-6 ring-1 transition ${
                    slot.available ? "bg-white/10 ring-white/15 hover:bg-white/15" : "bg-white/5 ring-white/5 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{slot.date}</h3>
                      <p className="text-sm text-white/70">{slot.time}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-white/10">{slot.type}</span>
                  </div>
                  {slot.available ? (
                    <button className="mt-4 px-4 py-2 rounded-md bg-white text-[#3a1670] font-semibold hover:opacity-90">
                      Book Slot
                    </button>
                  ) : (
                    <button disabled className="mt-4 px-4 py-2 rounded-md bg-white/20 text-white/50 cursor-not-allowed">
                      Unavailable
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === "ai-interview" && (
          <div className="mt-8">
            {interviewState === "setup" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Choose Your Interview Topic</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {interviewTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`rounded-2xl p-6 ring-1 cursor-pointer transition ${
                        selectedTopic?.id === topic.id
                          ? "bg-white text-[#3a1670] ring-white"
                          : "bg-white/10 ring-white/15 hover:bg-white/15"
                      }`}
                      onClick={() => setSelectedTopic(topic)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold">{topic.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          topic.difficulty === "Beginner" ? "bg-green-500/20 text-green-300" :
                          topic.difficulty === "Intermediate" ? "bg-yellow-500/20 text-yellow-300" :
                          "bg-red-500/20 text-red-300"
                        }`}>
                          {topic.difficulty}
                        </span>
                      </div>
                      <p className="text-sm opacity-80 mb-3">{topic.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span>⏱️ {topic.duration} min</span>
                        <span>❓ {topic.questions.length} questions</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedTopic && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={startInterview}
                      className="px-8 py-3 rounded-lg bg-white text-[#3a1670] font-bold text-lg hover:opacity-90 transition"
                    >
                      Start AI Interview
                    </button>
                  </div>
                )}
              </div>
            )}

            {interviewState === "interview" && currentSession && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 rounded-2xl p-6 ring-1 ring-white/15">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold">{currentSession.topic.name}</h2>
                      <p className="text-sm opacity-80">
                        Question {currentSession.currentQuestionIndex + 1} of {currentSession.topic.questions.length}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          isRecording 
                            ? "bg-red-500 text-white animate-pulse" 
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        {isRecording ? (
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            Stop Recording
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            🎤 Start Recording
                          </span>
                        )}
                      </button>
                      {isRecording && (
                        <span className="text-xs text-red-300 animate-pulse">
                          Recording...
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        {currentSession.topic.questions[currentSession.currentQuestionIndex]}
                      </h3>
                      <button
                        onClick={() => speakQuestion(currentSession.topic.questions[currentSession.currentQuestionIndex])}
                        disabled={isPlayingQuestion}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                          isPlayingQuestion 
                            ? "bg-blue-500 text-white" 
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        {isPlayingQuestion ? "🔊 Playing..." : "🔊 Listen"}
                      </button>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Interviewer Voice:</label>
                      <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                      >
                        {availableVoices.map((voice) => (
                          <option key={voice.id} value={voice.id} className="bg-gray-800">
                            {voice.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="relative">
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here or use voice recording..."
                        className="w-full h-32 p-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                      {isRecording && transcriptionText && (
                        <div className="absolute bottom-2 left-2 right-2 bg-blue-500/20 text-blue-200 text-xs p-2 rounded border border-blue-400/30">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                            <span>Live transcription: {transcriptionText}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={resetInterview}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                    >
                      Exit Interview
                    </button>
                    <button
                      onClick={submitAnswer}
                      disabled={!userAnswer.trim()}
                      className="px-6 py-2 rounded-lg bg-white text-[#3a1670] font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {currentSession.currentQuestionIndex + 1 >= currentSession.topic.questions.length 
                        ? "Finish Interview" 
                        : "Next Question"
                      }
                    </button>
                  </div>
                </div>
              </div>
            )}

            {interviewState === "feedback" && currentSession?.feedback && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 rounded-2xl p-6 ring-1 ring-white/15">
                  <h2 className="text-2xl font-bold mb-6">Interview Feedback</h2>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Overall Score</h3>
                      <div className="text-4xl font-bold text-green-400">
                        {currentSession.feedback.overallScore}/10
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Interview Duration</h3>
                      <div className="text-2xl font-semibold">
                        {currentSession.endTime && currentSession.startTime 
                          ? Math.round((currentSession.endTime.getTime() - currentSession.startTime.getTime()) / 60000)
                          : 0
                        } minutes
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-green-400">Strengths</h3>
                      <ul className="space-y-2">
                        {currentSession.feedback.strengths.map((strength, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-yellow-400">Areas for Improvement</h3>
                      <ul className="space-y-2">
                        {currentSession.feedback.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="text-yellow-400">⚠</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Detailed Feedback</h3>
                    <p className="text-white/80 leading-relaxed">
                      {currentSession.feedback.detailedFeedback}
                    </p>
                  </div>
                  
                  <div className="mt-8 flex justify-center gap-4">
                    <button
                      onClick={resetInterview}
                      className="px-6 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                    >
                      Start New Interview
                    </button>
                    <button
                      onClick={() => setCurrentView("schedule")}
                      className="px-6 py-3 rounded-lg bg-white text-[#3a1670] font-semibold hover:opacity-90 transition"
                    >
                      View All Interviews
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interview History */}
        <div className="mt-10 rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
          <h2 className="text-xl font-bold mb-4">Interview History</h2>
          <div className="space-y-3">
            {interviewHistory.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-[#0f131a]">
                <div>
                  <p className="font-semibold">{session.topic.name}</p>
                  <p className="text-sm text-white/60">
                    {session.startTime.toLocaleDateString()} • {session.topic.difficulty} • 
                    {session.feedback ? ` Score: ${session.feedback.overallScore}/10` : " In Progress"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/15 transition">
                    View Details
                  </button>
                  {session.feedback && (
                    <button className="text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/15 transition">
                      Download Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

