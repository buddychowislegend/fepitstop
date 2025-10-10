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

export default function AIInterviewPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(7);
  
  // Voice recognition
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Settings
  const [level, setLevel] = useState<'junior' | 'mid' | 'senior'>('mid');
  const [focus, setFocus] = useState<'javascript' | 'react' | 'fullstack'>('fullstack');

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
        
        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setInput(prev => prev + finalTranscript);
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startInterview = async () => {
    if (!user || !token) return;
    
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
          focus 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setMessages([{
          role: 'interviewer',
          content: data.message,
          timestamp: new Date()
        }]);
        setQuestionNumber(data.questionNumber);
        setTotalQuestions(data.totalQuestions);
        setStarted(true);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start interview');
      }
    } catch (error) {
      console.error('Start interview error:', error);
      alert('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || loading) return;
    
    const userMessage: Message = {
      role: 'candidate',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
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
          sessionId,
          message: input.trim()
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          role: 'interviewer',
          content: data.message,
          timestamp: new Date()
        }]);
        setQuestionNumber(data.questionNumber);
        
        if (data.shouldEnd) {
          setTimeout(() => endInterview(), 2000);
        }
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    if (!sessionId) return;
    
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
          sessionId 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
        setEnded(true);
      }
    } catch (error) {
      console.error('End interview error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Feedback screen
  if (ended && feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {feedback.score >= 8 ? '🎉' : feedback.score >= 6 ? '👍' : '💪'}
              </div>
              <h1 className="text-4xl font-extrabold mb-2">Interview Complete!</h1>
              <div className="flex gap-6 justify-center mt-6 text-sm">
                {feedback.score && (
                  <div className="bg-white/10 px-4 py-2 rounded-lg">
                    <div className="text-white/60">Score</div>
                    <div className="text-2xl font-bold text-purple-400">{feedback.score}/10</div>
                  </div>
                )}
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <div className="text-white/60">Duration</div>
                  <div className="text-2xl font-bold">{feedback.duration} min</div>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <div className="text-white/60">Questions</div>
                  <div className="text-2xl font-bold">{feedback.questionsAsked}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Detailed Feedback</h2>
              <div className="whitespace-pre-wrap text-white/80">
                {feedback.feedback}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Interview Transcript</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {feedback.transcript?.map((msg: any, idx: number) => (
                  <div key={idx} className={`${msg.role === 'interviewer' ? 'bg-purple-500/10' : 'bg-blue-500/10'} rounded-lg p-4`}>
                    <div className="font-semibold mb-1">
                      {msg.role === 'interviewer' ? '🤖 Interviewer' : '👤 You'}
                    </div>
                    <div className="text-white/80">{msg.content}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStarted(false);
                  setEnded(false);
                  setMessages([]);
                  setSessionId(null);
                  setFeedback(null);
                }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-lg font-semibold transition"
              >
                Start New Interview
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="flex-1 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold transition"
              >
                Back to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Setup screen
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🤖</div>
              <h1 className="text-4xl font-extrabold mb-2">AI Mock Interview</h1>
              <p className="text-xl text-white/80">
                Practice with an AI interviewer powered by Gemini 2.0 Flash
              </p>
            </div>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-semibold mb-2">Experience Level</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['junior', 'mid', 'senior'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      className={`px-4 py-3 rounded-lg font-semibold transition ${
                        level === lvl
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white/70'
                      }`}
                    >
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Focus Area</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['javascript', 'react', 'fullstack'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFocus(f)}
                      className={`px-4 py-3 rounded-lg font-semibold transition ${
                        focus === f
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white/70'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6 mb-8">
              <h3 className="font-semibold mb-3">What to Expect:</h3>
              <ul className="space-y-2 text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>7 questions covering frontend fundamentals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>AI adapts questions based on your answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Text or voice input supported</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Detailed feedback at the end</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Estimated duration: 15-20 minutes</span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={startInterview}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-4 rounded-lg font-semibold text-lg transition disabled:opacity-50"
            >
              {loading ? 'Starting Interview...' : 'Start Interview'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interview screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="bg-white/5 rounded-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl">🤖</div>
            <div>
              <div className="font-semibold">AI Mock Interview</div>
              <div className="text-sm text-white/60">
                Question {questionNumber} of {totalQuestions} • {level} level • {focus}
              </div>
            </div>
          </div>
          <button
            onClick={endInterview}
            disabled={loading}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            End Interview
          </button>
        </div>
        
        {/* Messages */}
        <div className="bg-white/5 rounded-2xl p-6 mb-4 h-[500px] overflow-y-auto backdrop-blur-sm">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === 'interviewer'
                      ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30'
                      : 'bg-blue-600/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold">
                      {msg.role === 'interviewer' ? '🤖 AI Interviewer' : '👤 You'}
                    </span>
                    {msg.isVoice && (
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">🎤 Voice</span>
                    )}
                  </div>
                  <div className="text-white/90 whitespace-pre-wrap">{msg.content}</div>
                  {msg.role === 'interviewer' && (
                    <button
                      onClick={() => speakMessage(msg.content)}
                      className="mt-2 text-xs text-white/60 hover:text-white/90 transition"
                      title="Read aloud"
                    >
                      🔊 Read aloud
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse">🤖 AI Interviewer is thinking...</div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input */}
        <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your answer... (Press Enter to send, Shift+Enter for new line)"
              className="flex-1 bg-white/10 text-white px-4 py-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              disabled={loading}
            />
            <div className="flex flex-col gap-2">
              {isSupported && (
                <button
                  onClick={toggleVoice}
                  className={`px-4 py-3 rounded-lg font-semibold transition ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title={isListening ? 'Stop recording' : 'Start voice input'}
                >
                  {isListening ? '🔴' : '🎤'}
                </button>
              )}
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-white/60">
            {isListening ? '🎤 Listening... Speak your answer' : 'Type your answer or use voice input'}
          </div>
        </div>
      </div>
    </div>
  );
}

