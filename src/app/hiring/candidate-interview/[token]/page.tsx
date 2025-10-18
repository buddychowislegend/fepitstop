"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface CandidateData {
  name: string;
  email: string;
  profile: string;
  companyName: string;
  driveName: string;
}

export default function CandidateInterview() {
  const params = useParams();
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  // Sample interview questions based on profile
  const getQuestionsForProfile = (profile: string) => {
    const questions = {
      "Frontend Developer": [
        "Tell me about yourself and your experience with frontend development.",
        "Explain the difference between React and Vue.js.",
        "How do you handle state management in a large React application?",
        "Describe your approach to responsive web design.",
        "What are your thoughts on performance optimization in web applications?"
      ],
      "React Developer": [
        "What are React hooks and how do they work?",
        "Explain the difference between controlled and uncontrolled components.",
        "How would you optimize a React application for better performance?",
        "Describe your experience with React Router and state management.",
        "What testing strategies do you use for React components?"
      ],
      "Full Stack Developer": [
        "Walk me through your full-stack development experience.",
        "How do you handle API design and database optimization?",
        "Explain your approach to authentication and security.",
        "Describe your experience with both frontend and backend technologies.",
        "How do you ensure scalability in your applications?"
      ]
    };
    return questions[profile as keyof typeof questions] || questions["Frontend Developer"];
  };

  useEffect(() => {
    // Fetch candidate data from backend using token
    const token = params.token;
    fetchCandidateData(token);
  }, [params.token]);

  const fetchCandidateData = async (token: string) => {
    try {
      const response = await fetch(`/api/company/interview/${token}`);
      
      if (response.ok) {
        const data = await response.json();
        setCandidateData(data.candidate);
        setLoading(false);
      } else {
        // Fallback to sample data
        setCandidateData({
          name: "John Doe",
          email: "john@example.com",
          profile: "Frontend Developer",
          companyName: "HireOG",
          driveName: "Frontend Screening - Jan 2024"
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching candidate data:', error);
      // Fallback to sample data
      setCandidateData({
        name: "John Doe",
        email: "john@example.com",
        profile: "Frontend Developer",
        companyName: "HireOG",
        driveName: "Frontend Screening - Jan 2024"
      });
      setLoading(false);
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
  };

  const handleAnswerSubmit = async (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
    
    if (currentQuestion < getQuestionsForProfile(candidateData?.profile || "").length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Interview completed - submit to backend
      await submitInterviewResponse(newAnswers);
    }
  };

  const submitInterviewResponse = async (finalAnswers: string[]) => {
    try {
      const response = await fetch(`/api/company/interview/${params.token}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: finalAnswers })
      });
      
      if (response.ok) {
        alert("Interview completed! Thank you for your time. Your responses have been submitted successfully.");
      } else {
        alert("Interview completed! Thank you for your time.");
      }
    } catch (error) {
      console.error('Error submitting interview response:', error);
      alert("Interview completed! Thank you for your time.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1720] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!candidateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1720] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Interview Link</h1>
          <p className="text-white/60">This interview link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const questions = getQuestionsForProfile(candidateData.profile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1720] via-[#1a1a2e] to-[#16213e]">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/logo-simple.svg" alt="HireOG" width={32} height={32} />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                HireOG
              </span>
            </div>
            <div className="text-white/60 text-sm">
              {candidateData.companyName} Screening
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!interviewStarted ? (
          /* Pre-Interview Screen */
          <div className="text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold text-white mb-4">
                Welcome to Your Interview
              </h1>
              
              <div className="space-y-4 mb-8">
                <div className="text-left bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Candidate Information</h3>
                  <p className="text-white/80"><strong>Name:</strong> {candidateData.name}</p>
                  <p className="text-white/80"><strong>Email:</strong> {candidateData.email}</p>
                  <p className="text-white/80"><strong>Profile:</strong> {candidateData.profile}</p>
                </div>
                
                <div className="text-left bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Interview Details</h3>
                  <p className="text-white/80"><strong>Company:</strong> {candidateData.companyName}</p>
                  <p className="text-white/80"><strong>Drive:</strong> {candidateData.driveName}</p>
                  <p className="text-white/80"><strong>Questions:</strong> {questions.length} questions</p>
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
                <h4 className="text-blue-400 font-semibold mb-2">Instructions</h4>
                <ul className="text-blue-300 text-sm text-left space-y-1">
                  <li>• This is an AI-powered interview with voice interaction</li>
                  <li>• You'll be asked {questions.length} questions related to {candidateData.profile}</li>
                  <li>• Speak clearly and take your time to answer each question</li>
                  <li>• The interview will be recorded for evaluation purposes</li>
                </ul>
              </div>

              <button
                onClick={startInterview}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-lg"
              >
                Start Interview
              </button>
            </div>
          </div>
        ) : (
          /* Interview Interface */
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Question {currentQuestion + 1} of {questions.length}</span>
                <span className="text-white/60 text-sm">
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">
                {questions[currentQuestion]}
              </h2>
              
              <div className="space-y-4">
                <textarea
                  value={answers[currentQuestion] || ""}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[currentQuestion] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                  className="w-full h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Type your answer here..."
                />
                
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAnswerSubmit(answers[currentQuestion] || "")}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {currentQuestion === questions.length - 1 ? "Complete Interview" : "Next Question"}
                  </button>
                  
                  {currentQuestion > 0 && (
                    <button
                      onClick={() => setCurrentQuestion(currentQuestion - 1)}
                      className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Interview Info */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>Interview for: {candidateData.companyName}</span>
                <span>Profile: {candidateData.profile}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
