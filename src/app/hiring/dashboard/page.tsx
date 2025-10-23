"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AIConfigurationScreen from "@/components/AIConfigurationScreen";

interface Candidate {
  id: string;
  name: string;
  email: string;
  profile: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
  score: number;
  addedDate: string;
  lastActivity: string;
  avatar?: string;
}

interface InterviewDrive {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  candidates: string[];
  createdDate: string;
  completedDate?: string;
  totalCandidates: number;
  completedInterviews: number;
}

export default function CompanyDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'screenings' | 'candidates'>('dashboard');
  const [aiInput, setAiInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviewDrives, setInterviewDrives] = useState<InterviewDrive[]>([]);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showCreateDrive, setShowCreateDrive] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: "", email: "", profile: "" });
  const [newDrive, setNewDrive] = useState({ name: "", selectedCandidates: [] as string[] });
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("companyAuth");
    if (!isAuthenticated) {
      router.push("/hiring");
      return;
    }

    // Load data from backend
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      const response = await fetch(`${backendUrl}/api/company/dashboard`, {
        headers: {
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          profile: c.profile,
          status: c.status || 'applied',
          score: c.score || Math.floor(Math.random() * 40) + 60,
          addedDate: c.createdAt.split('T')[0],
          lastActivity: new Date().toISOString().split('T')[0]
        })));
        setInterviewDrives(data.interviewDrives.map((d: any) => ({
          id: d.id,
          name: d.name,
          status: d.status,
          candidates: d.candidateIds,
          createdDate: d.createdAt.split('T')[0],
          totalCandidates: d.candidateIds?.length || 0,
          completedInterviews: Math.floor(Math.random() * (d.candidateIds?.length || 0))
        })));
      } else {
        // Fallback to sample data
        setCandidates([
          { id: "1", name: "John Doe", email: "john@example.com", profile: "Frontend Developer", status: "interview", score: 85, addedDate: "2024-01-15", lastActivity: "2024-01-20" },
          { id: "2", name: "Jane Smith", email: "jane@example.com", profile: "React Developer", status: "screening", score: 78, addedDate: "2024-01-16", lastActivity: "2024-01-19" },
          { id: "3", name: "Mike Johnson", email: "mike@example.com", profile: "Full Stack Developer", status: "offer", score: 92, addedDate: "2024-01-17", lastActivity: "2024-01-21" }
        ]);
        setInterviewDrives([
          { id: "1", name: "Frontend Screening - Jan 2024", status: "completed", candidates: ["1", "2"], createdDate: "2024-01-15", totalCandidates: 2, completedInterviews: 2 },
          { id: "2", name: "React Developer Assessment", status: "active", candidates: ["2", "3"], createdDate: "2024-01-18", totalCandidates: 2, completedInterviews: 1 }
        ]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleAiScreeningCreation = async () => {
    if (!aiInput.trim()) return;
    
    setAiPrompt(aiInput);
    setShowAIConfig(true);
    setAiInput("");
  };

  const handleCreateDriveFromAI = async (details: any) => {
    try {
      const screeningName = `AI Generated: ${details.positionTitle}`;
      const newScreening = {
        id: Date.now().toString(),
        name: screeningName,
        status: "draft" as const,
        candidates: [],
        createdDate: new Date().toISOString().split('T')[0],
        totalCandidates: 0,
        completedInterviews: 0
      };
      
      setInterviewDrives([...interviewDrives, newScreening]);
      setShowAIConfig(false);
      setActiveTab('screenings');
      
      // Show success message
      alert(`AI screening "${screeningName}" created successfully!`);
    } catch (error) {
      console.error('Error creating AI screening:', error);
      alert('Failed to create AI screening');
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      const response = await fetch(`${backendUrl}/api/company/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22'
        },
        body: JSON.stringify(newCandidate)
      });
      
      if (response.ok) {
        const data = await response.json();
        const candidate: Candidate = {
          id: data.id,
          name: newCandidate.name,
          email: newCandidate.email,
          profile: newCandidate.profile,
          status: "applied",
          score: 0,
          addedDate: new Date().toISOString().split('T')[0],
          lastActivity: new Date().toISOString().split('T')[0]
        };
        
        setCandidates([...candidates, candidate]);
        setNewCandidate({ name: "", email: "", profile: "" });
        setShowAddCandidate(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding candidate:', error);
      alert('Failed to add candidate');
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      const response = await fetch(`${backendUrl}/api/company/drives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22'
        },
        body: JSON.stringify({
          name: newDrive.name,
          candidateIds: newDrive.selectedCandidates
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const drive: InterviewDrive = {
          id: data.id,
          name: newDrive.name,
          status: "draft",
          candidates: newDrive.selectedCandidates,
          createdDate: new Date().toISOString().split('T')[0],
          totalCandidates: newDrive.selectedCandidates.length,
          completedInterviews: 0
        };
        setInterviewDrives([...interviewDrives, drive]);
        setNewDrive({ name: "", selectedCandidates: [] });
        setShowCreateDrive(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating drive:', error);
      alert('Failed to create interview drive');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("companyAuth");
    localStorage.removeItem("companyId");
    router.push("/hiring");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-500/20 text-blue-400';
      case 'screening': return 'bg-yellow-500/20 text-yellow-400';
      case 'interview': return 'bg-purple-500/20 text-purple-400';
      case 'offer': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Show AI Configuration Screen
  if (showAIConfig) {
    return (
      <AIConfigurationScreen
        aiPrompt={aiPrompt}
        onBack={() => setShowAIConfig(false)}
        onCreateDrive={handleCreateDriveFromAI}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1720] via-[#1a1a2e] to-[#16213e] flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[color:var(--surface)] border-r border-[color:var(--border)] transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-[color:var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[color:var(--brand-start)] to-[color:var(--brand-end)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FP</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-[color:var(--foreground)] font-bold text-lg">FePitStop</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white' 
                  : 'text-[color:var(--foreground)]/60 hover:bg-white/10 hover:text-[color:var(--foreground)]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </button>

            <button
              onClick={() => setActiveTab('screenings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'screenings' 
                  ? 'bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white' 
                  : 'text-[color:var(--foreground)]/60 hover:bg-white/10 hover:text-[color:var(--foreground)]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {!sidebarCollapsed && <span>Screenings</span>}
            </button>

            <button
              onClick={() => setActiveTab('candidates')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'candidates' 
                  ? 'bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white' 
                  : 'text-[color:var(--foreground)]/60 hover:bg-white/10 hover:text-[color:var(--foreground)]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              {!sidebarCollapsed && <span>Candidates</span>}
            </button>
          </div>

          <div className="mt-8 space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[color:var(--foreground)]/60 hover:bg-white/10 hover:text-[color:var(--foreground)] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {!sidebarCollapsed && <span>Subscriptions</span>}
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[color:var(--foreground)]/60 hover:bg-white/10 hover:text-[color:var(--foreground)] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {!sidebarCollapsed && <span>Help & Support</span>}
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[color:var(--foreground)]/60 hover:bg-white/10 hover:text-[color:var(--foreground)] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {!sidebarCollapsed && <span>Settings</span>}
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[color:var(--foreground)]/60 hover:bg-white/10 hover:text-[color:var(--foreground)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[color:var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[color:var(--brand-start)] to-[color:var(--brand-end)] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">SB</span>
            </div>
            {!sidebarCollapsed && (
              <div>
                <div className="text-[color:var(--foreground)] font-medium text-sm">sagar bhatnagar</div>
                <div className="text-[color:var(--foreground)]/60 text-xs">Recruiter</div>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-1/2 -right-3 w-6 h-6 bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] rounded-full flex items-center justify-center text-white hover:opacity-90 transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[color:var(--surface)] border-b border-[color:var(--border)] px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[color:var(--foreground)]">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'screenings' && 'Screenings'}
              {activeTab === 'candidates' && 'Candidates'}
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={loadDashboardData}
                className="text-[color:var(--foreground)]/60 hover:text-[color:var(--foreground)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div className="max-w-4xl mx-auto">
              {/* AI Input Section */}
              <div className="text-center mb-8">
                <div className="mb-6">
                  <h2 className="text-4xl font-bold mb-2">
                    <span className="bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] bg-clip-text text-transparent">FePitStop</span>
                    <span className="text-[color:var(--foreground)]"> AI</span>
                  </h2>
                  <p className="text-[color:var(--foreground)]/60">Create AI-powered screening assessments</p>
                </div>

                {/* AI Input Field */}
                <div className="relative max-w-2xl mx-auto">
                  <div className="bg-[color:var(--surface)] rounded-xl shadow-lg border border-[color:var(--border)] p-4">
                    <textarea
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="I want to create a Backend developer screening"
                      className="w-full h-20 resize-none border-none outline-none text-[color:var(--foreground)] placeholder-[color:var(--foreground)]/50 bg-transparent"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <button className="text-[color:var(--foreground)]/40 hover:text-[color:var(--foreground)]/60">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </button>
                      <button
                        onClick={handleAiScreeningCreation}
                        disabled={!aiInput.trim() || isGenerating}
                        className="bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white p-2 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isGenerating ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <button
                  onClick={() => setActiveTab('screenings')}
                  className="flex flex-col items-center p-6 bg-[color:var(--surface)] rounded-xl shadow-lg border border-[color:var(--border)] hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[color:var(--brand-start)]/20 to-[color:var(--brand-end)]/20 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[color:var(--brand-start)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[color:var(--foreground)] mb-2">Screenings</h3>
                  <p className="text-[color:var(--foreground)]/60 text-sm text-center">Manage your screening assessments</p>
                </button>

                <button
                  onClick={() => setActiveTab('candidates')}
                  className="flex flex-col items-center p-6 bg-[color:var(--surface)] rounded-xl shadow-lg border border-[color:var(--border)] hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[color:var(--foreground)] mb-2">Candidates</h3>
                  <p className="text-[color:var(--foreground)]/60 text-sm text-center">View and manage candidates</p>
                </button>

                <button className="flex flex-col items-center p-6 bg-[color:var(--surface)] rounded-xl shadow-lg border border-[color:var(--border)] hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[color:var(--foreground)] mb-2">AI Settings</h3>
                  <p className="text-[color:var(--foreground)]/60 text-sm text-center">Configure AI preferences</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'screenings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[color:var(--foreground)]">Screening Assessments</h2>
                <button
                  onClick={() => setShowCreateDrive(true)}
                  className="bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
                >
                  Create Screening
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {interviewDrives.map((drive) => (
                  <div key={drive.id} className="bg-[color:var(--surface)] rounded-xl shadow-lg border border-[color:var(--border)] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{drive.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        drive.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400'
                          : drive.status === 'active'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {drive.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[color:var(--foreground)]/60">Candidates:</span>
                        <span className="text-[color:var(--foreground)]">{drive.totalCandidates}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[color:var(--foreground)]/60">Completed:</span>
                        <span className="text-[color:var(--foreground)]">{drive.completedInterviews}</span>
                      </div>
                      <div className="w-full bg-[color:var(--surface)]/50 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(drive.completedInterviews / drive.totalCandidates) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <p className="text-[color:var(--foreground)]/60 text-xs mb-4">
                      Created: {drive.createdDate}
                    </p>
                    
                    {drive.status === 'draft' && (
                      <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                        Send Links to Candidates
                      </button>
                    )}
                    
                  {drive.status === 'active' && (
                    <div className="flex gap-2">
                      <Link
                        href={`/hiring/screening/${drive.id}`}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm text-center"
                      >
                        View Details
                      </Link>
                      <button className="flex-1 bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white py-2 px-4 rounded-lg hover:opacity-90 transition-colors text-sm">
                        Analytics
                      </button>
                    </div>
                  )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'candidates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[color:var(--foreground)]">Candidates</h2>
                <button
                  onClick={() => setShowAddCandidate(true)}
                  className="bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
                >
                  Add Candidate
                </button>
              </div>

              <div className="bg-[color:var(--surface)] rounded-xl shadow-lg border border-[color:var(--border)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[color:var(--surface)]/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Candidate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Profile</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Last Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--border)]">
                      {candidates.map((candidate) => (
                        <tr key={candidate.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[color:var(--brand-start)] to-[color:var(--brand-end)] rounded-full flex items-center justify-center text-white font-semibold">
                                {candidate.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-[color:var(--foreground)] font-medium">{candidate.name}</div>
                                <div className="text-[color:var(--foreground)]/60 text-sm">{candidate.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[color:var(--foreground)]">{candidate.profile}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(candidate.status)}`}>
                              {candidate.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {candidate.score > 0 ? (
                              <span className="text-sm font-medium text-[color:var(--foreground)]">
                                {candidate.score}/100
                              </span>
                            ) : (
                              <span className="text-[color:var(--foreground)]/40 text-sm">Not scored</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[color:var(--foreground)]/60">{candidate.lastActivity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-[color:var(--brand-start)] hover:text-[color:var(--brand-end)] mr-3">View</button>
                            <button className="text-blue-400 hover:text-blue-300 mr-3">Edit</button>
                            <button className="text-red-400 hover:text-red-300">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6">
        <button className="w-14 h-14 bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white rounded-full shadow-lg hover:opacity-90 transition-colors flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Add Candidate Modal */}
      {showAddCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[color:var(--surface)] rounded-2xl p-6 w-full max-w-md border border-[color:var(--border)]">
            <h3 className="text-xl font-bold text-[color:var(--foreground)] mb-4">Add New Candidate</h3>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">Name</label>
                <input
                  type="text"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg bg-[color:var(--surface)] text-[color:var(--foreground)] focus:ring-2 focus:ring-[color:var(--brand-start)] focus:border-transparent"
                  placeholder="Enter candidate name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">Email</label>
                <input
                  type="email"
                  value={newCandidate.email}
                  onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                  className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg bg-[color:var(--surface)] text-[color:var(--foreground)] focus:ring-2 focus:ring-[color:var(--brand-start)] focus:border-transparent"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">Profile</label>
                <input
                  type="text"
                  value={newCandidate.profile}
                  onChange={(e) => setNewCandidate({ ...newCandidate, profile: e.target.value })}
                  className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg bg-[color:var(--surface)] text-[color:var(--foreground)] focus:ring-2 focus:ring-[color:var(--brand-start)] focus:border-transparent"
                  placeholder="e.g., Frontend Developer"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white py-2 px-4 rounded-lg hover:opacity-90 transition-colors"
                >
                  Add Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCandidate(false)}
                  className="flex-1 bg-[color:var(--surface)] text-[color:var(--foreground)] py-2 px-4 rounded-lg hover:bg-white/10 transition-colors border border-[color:var(--border)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Drive Modal */}
      {showCreateDrive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Screening Drive</h3>
            <form onSubmit={handleCreateDrive} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Drive Name</label>
                <input
                  type="text"
                  value={newDrive.name}
                  onChange={(e) => setNewDrive({ ...newDrive, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Frontend Screening - Jan 2024"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Candidates</label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {candidates.map((candidate) => (
                    <label key={candidate.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={newDrive.selectedCandidates.includes(candidate.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewDrive({
                              ...newDrive,
                              selectedCandidates: [...newDrive.selectedCandidates, candidate.id]
                            });
                          } else {
                            setNewDrive({
                              ...newDrive,
                              selectedCandidates: newDrive.selectedCandidates.filter(id => id !== candidate.id)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-700 text-sm">{candidate.name} ({candidate.profile})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Drive
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateDrive(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}