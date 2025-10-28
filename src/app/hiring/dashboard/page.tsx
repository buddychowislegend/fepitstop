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
  status: 'draft' | 'active' | 'completed' | 'archived';
  candidates: string[];
  createdDate: string;
  completedDate?: string;
  totalCandidates: number;
  completedInterviews: number;
}

export default function CompanyDashboard() {
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
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("hiring_authenticated");
    if (!isAuthenticated) {
      router.push("/hiring/signin");
      return;
    }

    // Load data from backend
    loadDashboardData();
    loadScreenings();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = `?_t=${Date.now()}`;
      const response = await fetch(`${backendUrl}/api/company/dashboard${cacheBuster}`, {
        method: 'GET',
        headers: {
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include',
        cache: 'no-store' // Prevent browser caching
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
      } else {
        // Fallback to sample data
        setCandidates([
          { id: "1", name: "John Doe", email: "john@example.com", profile: "Frontend Developer", status: "interview", score: 85, addedDate: "2024-01-15", lastActivity: "2024-01-20" },
          { id: "2", name: "Jane Smith", email: "jane@example.com", profile: "React Developer", status: "screening", score: 78, addedDate: "2024-01-16", lastActivity: "2024-01-19" },
          { id: "3", name: "Mike Johnson", email: "mike@example.com", profile: "Full Stack Developer", status: "offer", score: 92, addedDate: "2024-01-17", lastActivity: "2024-01-21" }
        ]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadScreenings = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = `?_t=${Date.now()}`;
      const response = await fetch(`${backendUrl}/api/company/screenings${cacheBuster}`, {
        method: 'GET',
        headers: {
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include',
        cache: 'no-store' // Prevent browser caching
      });
      
      if (response.ok) {
        const data = await response.json();
        const screenings = data.screenings.map((s: any) => ({
          id: s.id,
          name: s.name,
          status: s.status,
          candidates: s.candidateIds || [],
          createdDate: s.createdAt.split('T')[0],
          totalCandidates: s.totalCandidates || 0,
          completedInterviews: s.completedInterviews || 0
        }));
        setInterviewDrives(screenings);
      }
    } catch (error) {
      console.error('Error loading screenings:', error);
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
      
      // Create screening in backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      const response = await fetch(`${backendUrl}/api/company/screenings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: screeningName,
          positionTitle: details.positionTitle,
          language: details.language,
          mustHaves: details.mustHaves,
          goodToHaves: details.goodToHaves,
          culturalFit: details.culturalFit,
          estimatedTime: details.estimatedTime,
          status: 'active'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const newScreening = {
          id: data.id,
          name: screeningName,
          status: "active" as const,
          candidates: [],
          createdDate: new Date().toISOString().split('T')[0],
          totalCandidates: 0,
          completedInterviews: 0
        };
        
        setInterviewDrives([...interviewDrives, newScreening]);
        setShowAIConfig(false);
        setActiveTab('screenings');
        
        // Reload screenings to get the latest data
        loadScreenings();
        
        // Show success message
        alert(`AI screening "${screeningName}" created successfully!`);
      } else {
        throw new Error('Failed to create screening in backend');
      }
    } catch (error) {
      console.error('Error creating AI screening:', error);
      alert('Failed to create AI screening. Please try again.');
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
        credentials: 'include',
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
        credentials: 'include',
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
          status: "active",
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
    localStorage.removeItem("hiring_authenticated");
    localStorage.removeItem("hiring_user");
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

  // Context menu functions
  const handleContextMenu = (e: React.MouseEvent, screeningId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      id: screeningId,
      x: e.clientX,
      y: e.clientY
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleArchiveScreening = async (screeningId: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      const response = await fetch(`${backendUrl}/api/company/screenings/${screeningId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22'
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'archived' })
      });

      if (response.ok) {
        // Update local state
        setInterviewDrives(prev => 
          prev.map(drive => 
            drive.id === screeningId 
              ? { ...drive, status: 'archived' as const }
              : drive
          )
        );
        closeContextMenu();
        alert('Screening archived successfully!');
      } else {
        throw new Error('Failed to archive screening');
      }
    } catch (error) {
      console.error('Error archiving screening:', error);
      alert('Failed to archive screening. Please try again.');
    }
  };

  const handleDeleteScreening = async (screeningId: string) => {
    if (!confirm('Are you sure you want to delete this screening? This action cannot be undone.')) {
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      const response = await fetch(`${backendUrl}/api/company/screenings/${screeningId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22'
        },
        credentials: 'include'
      });

      if (response.ok) {
        // Remove from local state
        setInterviewDrives(prev => prev.filter(drive => drive.id !== screeningId));
        closeContextMenu();
        alert('Screening deleted successfully!');
      } else {
        throw new Error('Failed to delete screening');
      }
    } catch (error) {
      console.error('Error deleting screening:', error);
      alert('Failed to delete screening. Please try again.');
    }
  };

  const handleSendInviteLinks = async (screeningId: string) => {
    if (!confirm('Are you sure you want to send interview links to all candidates? This will activate the screening.')) {
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      const response = await fetch(`${backendUrl}/api/company/drives/${screeningId}/send-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update screening status to active in local state
        setInterviewDrives(prev => 
          prev.map(drive => 
            drive.id === screeningId 
              ? { ...drive, status: 'active' as const }
              : drive
          )
        );

        // Show success message with details
        const totalLinks = data.links?.length || 0;
        const successfulEmails = data.emailResults?.filter((r: any) => r.emailSent).length || 0;
        
        alert(`Interview links sent successfully!\n\nTotal candidates: ${totalLinks}\nEmails sent: ${successfulEmails}\n\nThe screening is now active.`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send interview links');
      }
    } catch (error) {
      console.error('Error sending interview links:', error);
      alert('Failed to send interview links. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f1720] via-[#1a1a2e] to-[#16213e]">
      {/* Header */}
      <header className="bg-[color:var(--surface)] border-b border-[color:var(--border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[color:var(--brand-start)] to-[color:var(--brand-end)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🤖</span>
              </div>
              <span className="text-[color:var(--foreground)] font-bold text-xl">AI Recruit</span>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-1 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'text-[color:var(--brand-start)] border-b-2 border-[color:var(--brand-start)]' 
                    : 'text-[color:var(--foreground)]/60 hover:text-[color:var(--foreground)]'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('screenings')}
                className={`px-1 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'screenings' 
                    ? 'text-[color:var(--brand-start)] border-b-2 border-[color:var(--brand-start)]' 
                    : 'text-[color:var(--foreground)]/60 hover:text-[color:var(--foreground)]'
                }`}
              >
                Drives
              </button>
              <button
                onClick={() => setActiveTab('candidates')}
                className={`px-1 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'candidates' 
                    ? 'text-[color:var(--brand-start)] border-b-2 border-[color:var(--brand-start)]' 
                    : 'text-[color:var(--foreground)]/60 hover:text-[color:var(--foreground)]'
                }`}
              >
                Candidates
              </button>
              <button className="px-1 py-2 text-sm font-medium text-[color:var(--foreground)]/60 hover:text-[color:var(--foreground)] transition-colors">
                Reports
              </button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Create New Drive Button */}
            <button
              onClick={() => {
                setAiPrompt("Create a new screening drive for...");
                setShowAIConfig(true);
              }}
              className="bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Drive
            </button>
            
            {/* Notifications */}
            <button className="p-2 text-[color:var(--foreground)]/60 hover:text-[color:var(--foreground)] hover:bg-white/5 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5V17z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.94 2.06l-.94-.94L9.06 2.06A1.5 1.5 0 008 3.5v.5H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2v-.5A1.5 1.5 0 0014.94 2.06l-.94.94-.94-.94z" />
              </svg>
            </button>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-[color:var(--border)]">
              <div className="w-8 h-8 bg-gradient-to-br from-[color:var(--brand-start)] to-[color:var(--brand-end)] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">SB</span>
              </div>
              <div className="text-sm">
                <div className="text-[color:var(--foreground)] font-medium">Sagar Bhatnagar</div>
                <div className="text-[color:var(--foreground)]/60">Innovate Inc.</div>
              </div>
            </div>
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-[color:var(--foreground)]/60 hover:text-[color:var(--foreground)] hover:bg-white/5 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold text-[color:var(--foreground)] mb-2">
                Welcome Back, Innovate Inc!
              </h1>
              <p className="text-[color:var(--foreground)]/60">
                Here's your recruitment snapshot for today.
              </p>
            </div>

            {/* AI Screening Creator */}
            <div className="bg-[color:var(--surface)] rounded-xl border border-[color:var(--border)] p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] bg-clip-text text-transparent">AI Recruit</span>
                  <span className="text-[color:var(--foreground)]"> Assistant</span>
                </h2>
                <p className="text-[color:var(--foreground)]/60">Create AI-powered screening assessments in seconds</p>
              </div>

              {/* AI Input Field */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-[color:var(--surface)] rounded-xl border border-[color:var(--border)] p-4">
                  <textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="I want to create a Backend Developer screening for a mid-level position..."
                    className="w-full h-20 resize-none border-none outline-none text-[color:var(--foreground)] placeholder-[color:var(--foreground)]/50 bg-transparent"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-[color:var(--foreground)]/40">
                      Describe the role, skills, and experience level you're looking for
                    </div>
                    <button
                      onClick={handleAiScreeningCreation}
                      disabled={!aiInput.trim() || isGenerating}
                      className="bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Create Drive
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Active Drives */}
              <div className="bg-[color:var(--surface)] rounded-xl p-6 border border-[color:var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm text-[color:var(--foreground)]/60 mb-1">Active Drives</div>
                <div className="text-3xl font-bold text-[color:var(--foreground)]">
                  {interviewDrives.filter(d => d.status === 'active').length}
                </div>
              </div>

              {/* Total Candidates */}
              <div className="bg-[color:var(--surface)] rounded-xl p-6 border border-[color:var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm text-[color:var(--foreground)]/60 mb-1">Total Candidates</div>
                <div className="text-3xl font-bold text-[color:var(--foreground)]">
                  {interviewDrives.reduce((sum, d) => sum + (d.totalCandidates || 0), 0)}
                </div>
              </div>

              {/* Interviews Completed */}
              <div className="bg-[color:var(--surface)] rounded-xl p-6 border border-[color:var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm text-[color:var(--foreground)]/60 mb-1">Interviews Completed</div>
                <div className="text-3xl font-bold text-[color:var(--foreground)]">
                  {interviewDrives.reduce((sum, d) => sum + (d.completedInterviews || 0), 0)}
                </div>
              </div>

              {/* Candidates Hired */}
              <div className="bg-[color:var(--surface)] rounded-xl p-6 border border-[color:var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm text-[color:var(--foreground)]/60 mb-1">Candidates Hired</div>
                <div className="text-3xl font-bold text-[color:var(--foreground)]">
                  {candidates.filter(c => c.status === 'offer').length}
                </div>
              </div>
            </div>

            {/* Recent Drives Section */}
            <div className="bg-[color:var(--surface)] rounded-xl border border-[color:var(--border)]">
              <div className="flex items-center justify-between p-6 border-b border-[color:var(--border)]">
                <h2 className="text-xl font-semibold text-[color:var(--foreground)]">Recent Drives</h2>
                <button
                  onClick={() => setActiveTab('screenings')}
                  className="text-[color:var(--brand-start)] hover:text-[color:var(--brand-end)] text-sm font-medium"
                >
                  View All Drives
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[color:var(--surface)]/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Drive Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Candidates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Created On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--border)]">
                    {interviewDrives.slice(0, 4).map((drive) => (
                      <tr key={drive.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-[color:var(--foreground)] font-medium">{drive.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            drive.status === 'completed' 
                              ? 'bg-green-500/20 text-green-400'
                              : drive.status === 'active'
                              ? 'bg-blue-500/20 text-blue-400'
                              : drive.status === 'archived'
                              ? 'bg-gray-500/20 text-gray-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {drive.status === 'active' ? 'Active' : drive.status === 'completed' ? 'Completed' : drive.status === 'draft' ? 'Closing Soon' : drive.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[color:var(--foreground)]">
                          {drive.totalCandidates}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[color:var(--foreground)]/60">
                          {drive.createdDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-white/10 rounded">
                              <svg className="w-4 h-4 text-[color:var(--foreground)]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                              </svg>
                            </button>
                            <button className="p-1 hover:bg-white/10 rounded">
                              <svg className="w-4 h-4 text-[color:var(--foreground)]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button className="p-1 hover:bg-white/10 rounded">
                              <svg className="w-4 h-4 text-[color:var(--foreground)]/60" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Candidate Pipeline Overview */}
            <div className="bg-[color:var(--surface)] rounded-xl border border-[color:var(--border)]">
              <div className="p-6 border-b border-[color:var(--border)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[color:var(--foreground)]">Candidate Pipeline Overview</h2>
                  <button className="p-2 hover:bg-white/10 rounded">
                    <svg className="w-5 h-5 text-[color:var(--foreground)]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Simple chart representation */}
                <div className="flex items-end gap-2 h-32">
                  {[
                    { label: 'Applied', value: candidates.filter(c => c.status === 'applied').length, color: 'bg-blue-500' },
                    { label: 'Screening', value: candidates.filter(c => c.status === 'screening').length, color: 'bg-yellow-500' },
                    { label: 'Interview', value: candidates.filter(c => c.status === 'interview').length, color: 'bg-purple-500' },
                    { label: 'Offer', value: candidates.filter(c => c.status === 'offer').length, color: 'bg-green-500' },
                  ].map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className={`w-full ${item.color} rounded-t transition-all duration-300`}
                        style={{ height: `${Math.max((item.value / Math.max(...candidates.map(c => 1)) * 80), 8)}px` }}
                      ></div>
                      <div className="mt-2 text-center">
                        <div className="text-sm font-medium text-[color:var(--foreground)]">{item.value}</div>
                        <div className="text-xs text-[color:var(--foreground)]/60">{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          )}

        {activeTab === 'screenings' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[color:var(--foreground)] mb-2">Screening Drives</h1>
                <p className="text-[color:var(--foreground)]/60">Manage your interview drives and assessments</p>
              </div>
            </div>

            {/* Screenings Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {interviewDrives.map((drive) => (
                  <div key={drive.id} className="bg-[color:var(--surface)] rounded-xl shadow-lg border border-[color:var(--border)] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{drive.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          drive.status === 'completed' 
                            ? 'bg-green-500/20 text-green-400'
                            : drive.status === 'active'
                            ? 'bg-blue-500/20 text-blue-400'
                            : drive.status === 'archived'
                            ? 'bg-gray-500/20 text-gray-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {drive.status}
                        </span>
                        <button
                          onClick={(e) => handleContextMenu(e, drive.id)}
                          className="p-1 hover:bg-[color:var(--surface)]/50 rounded-full transition-colors"
                        >
                          <svg className="w-4 h-4 text-[color:var(--foreground)]/60" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
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
                      <button 
                        onClick={() => handleSendInviteLinks(drive.id)}
                        className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                      >
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
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[color:var(--foreground)] mb-2">Candidates</h1>
                <p className="text-[color:var(--foreground)]/60">Manage your candidate database</p>
              </div>
              <button
                onClick={() => setShowAddCandidate(true)}
                className="bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
              >
                Add Candidate
              </button>
            </div>

            {/* Candidates Table */}
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

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <button
            onClick={() => handleArchiveScreening(contextMenu.id)}
            className="w-full px-4 py-2 text-left text-sm text-[color:var(--foreground)] hover:bg-[color:var(--surface)]/50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
            </svg>
            Archive
          </button>
          <button
            onClick={() => handleDeleteScreening(contextMenu.id)}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}

      {/* Overlay to close context menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeContextMenu}
        />
      )}
    </div>
  );
}