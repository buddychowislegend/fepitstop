"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: 'invited' | 'in-progress' | 'completed' | 'not-started';
  hiringStatus?: 'shortlisted' | 'on-hold' | 'rejected' | 'hired' | 'pending';
  score?: number;
  technicalScore?: number;
  communicationScore?: number;
  completedDate?: string;
  invitedDate: string;
  progress: number;
  feedback?: string | {
    summary?: string;
    strengths?: string[];
    improvements?: string[];
    categories?: Record<string, number>;
  };
  detailedFeedback?: {
    summary?: string;
    strengths?: string[];
    improvements?: string[];
    categories?: Record<string, number>;
  };
  questionAnalysis?: Array<{
    questionNumber?: number;
    question: string;
    answer: string;
    score: number;
    feedback?: string;
    strengths?: string[];
    improvements?: string[];
    responseType?: string;
    confidence?: number;
  }>;
  qaPairs?: Array<{
    question: string;
    answer: string;
    score?: number;
  }>;
}

interface Screening {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  createdDate: string;
  totalCandidates: number;
  completedCandidates: number;
  inProgressCandidates: number;
  averageScore: number;
}

export default function ScreeningDetailPage() {
  const router = useRouter();
  const params = useParams();
  const screeningId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<'candidates' | 'analytics' | 'settings'>('candidates');
  const [screening, setScreening] = useState<Screening | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'top-performer' | 'name' | 'date'>('top-performer');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [scoreFilter, setScoreFilter] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });

  useEffect(() => {
    loadScreeningDetails();
  }, [screeningId]);

  const loadScreeningDetails = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = `?_t=${Date.now()}`;
      const response = await fetch(`${backendUrl}/api/company/screenings/${screeningId}/details${cacheBuster}`, {
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
        
        // Format the screening data
        const formattedScreening = {
          id: data.screening.id,
          name: data.screening.name,
          status: data.screening.status,
          createdDate: new Date(data.screening.createdAt).toLocaleDateString(),
          totalCandidates: data.screening.totalCandidates,
          completedCandidates: data.screening.completedCandidates,
          inProgressCandidates: data.screening.inProgressCandidates,
          averageScore: data.screening.averageScore
        };
        
        // Format the candidates data
        const formattedCandidates = data.candidates.map((candidate: any) => ({
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          status: candidate.status,
          hiringStatus: candidate.hiringStatus || 'pending',
          score: candidate.score,
          completedDate: candidate.completedDate ? new Date(candidate.completedDate).toLocaleDateString() : undefined,
          invitedDate: new Date(candidate.invitedDate).toLocaleDateString(),
          progress: candidate.progress,
          feedback: candidate.feedback,
          qaPairs: candidate.qaPairs
        }));
        
        setScreening(formattedScreening);
        setCandidates(formattedCandidates);
      } else {
        throw new Error('Failed to load screening details');
      }
    } catch (error) {
      console.error('Error loading screening details:', error);
      // Fallback to empty state on error
      setScreening({
        id: screeningId,
        name: "Screening Not Found",
        status: "draft",
        createdDate: new Date().toLocaleDateString(),
        totalCandidates: 0,
        completedCandidates: 0,
        inProgressCandidates: 0,
        averageScore: 0
      });
      setCandidates([]);
    }
  };

  const handleInviteCandidates = async () => {
    if (!inviteEmails.trim()) return;
    
    setIsInviting(true);
    try {
      const emails = inviteEmails.split('\n').map(email => email.trim()).filter(email => email);
      
      // Format candidates data
      const candidates = emails.map(email => ({
        name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format name nicely
        email: email,
        profile: screening?.name?.includes('Frontend') ? 'Frontend Developer' : 'General'
      }));
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      
      // Add candidates to screening and send invites in one call
      const response = await fetch(`${backendUrl}/api/company/screenings/${screeningId}/invite-candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({ candidates })
      });

      if (response.ok) {
        const data = await response.json();
        setInviteEmails("");
        setShowInviteModal(false);
        
        // Reload screening details to get updated data
        await loadScreeningDetails();
        
        const totalAdded = data.addedCandidates?.length || 0;
        const successfulEmails = data.emailResults?.filter((r: any) => r.emailSent).length || 0;
        
        alert(`Successfully added ${totalAdded} candidates to this screening!\n\nEmails sent: ${successfulEmails}/${totalAdded}\n\nThe screening is now active and candidates can start their interviews.`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite candidates');
      }
      
    } catch (error) {
      console.error('Error inviting candidates:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to invite candidates: ${errorMessage}\n\nPlease try again.`);
    } finally {
      setIsInviting(false);
    }
  };

  const handleViewResults = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowResultsModal(true);
  };

  const handleEditName = () => {
    if (screening) {
      setEditedName(screening.name);
      setIsEditingName(true);
    }
  };

  const handleSaveName = async () => {
    if (!screening || !editedName.trim()) return;
    
    setIsSavingName(true);
    try {
      const companyId = localStorage.getItem('hiring_company_id') || 'hireog';
      const companyPassword = localStorage.getItem('hiring_company_password') || 'manasi22';
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      
      const response = await fetch(`${backendUrl}/api/company/screenings/${screeningId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': companyId,
          'X-Company-Password': companyPassword
        },
        credentials: 'include',
        body: JSON.stringify({ name: editedName.trim() })
      });

      if (response.ok) {
        setScreening(prev => prev ? { ...prev, name: editedName.trim() } : null);
        setIsEditingName(false);
        alert('Screening name updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update name'}`);
      }
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update screening name');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const handleUpdateHiringStatus = async (candidateId: string, newStatus: 'shortlisted' | 'on-hold' | 'rejected' | 'hired' | 'pending') => {
    try {
      const companyId = localStorage.getItem('hiring_company_id') || 'hireog';
      const companyPassword = localStorage.getItem('hiring_company_password') || 'manasi22';
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      
      const response = await fetch(`${backendUrl}/api/company/candidates/${candidateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': companyId,
          'X-Company-Password': companyPassword
        },
        credentials: 'include',
        body: JSON.stringify({ hiringStatus: newStatus })
      });

      if (response.ok) {
        // Update local state
        setCandidates(prev => 
          prev.map(c => 
            c.id === candidateId 
              ? { ...c, hiringStatus: newStatus }
              : c
          )
        );
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update hiring status'}`);
        // Reload to get correct state
        loadScreeningDetails();
      }
    } catch (error) {
      console.error('Error updating hiring status:', error);
      alert('Failed to update hiring status');
      // Reload to get correct state
      loadScreeningDetails();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400';
      case 'invited': return 'bg-yellow-500/20 text-yellow-400';
      case 'not-started': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getHiringStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'bg-blue-500/20 text-blue-400';
      case 'on-hold': return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'hired': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getHiringStatusLabel = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'Shortlisted for next round';
      case 'on-hold': return 'On Hold';
      case 'rejected': return 'Rejected';
      case 'hired': return 'Hired';
      case 'pending': return 'Pending';
      default: return 'Pending';
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    // Search filter
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(candidate.status);
    
    // Score filter
    const candidateScore = candidate.score || 0;
    const matchesScore = (!scoreFilter.min || candidateScore >= scoreFilter.min) &&
      (!scoreFilter.max || candidateScore <= scoreFilter.max);
    
    return matchesSearch && matchesStatus && matchesScore;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    switch (sortBy) {
      case 'top-performer':
        return (b.score || 0) - (a.score || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.invitedDate).getTime() - new Date(a.invitedDate).getTime();
      default:
        return 0;
    }
  });

  const progressPercentage = screening ? 
    (screening.completedCandidates / Math.max(screening.totalCandidates, 1)) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1720] via-[#1a1a2e] to-[#16213e] flex">
      {/* Sidebar */}
      <div className="w-64 bg-[color:var(--surface)] border-r border-[color:var(--border)] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[color:var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[color:var(--brand-start)] to-[color:var(--brand-end)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FP</span>
            </div>
            <span className="text-[color:var(--foreground)] font-bold text-lg">FePitStop</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <Link
              href="/hiring/dashboard"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[color:var(--foreground)]/60 hover:bg-white/10 hover:text-[color:var(--foreground)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Screenings</span>
            </div>

            <Link
              href="/hiring/dashboard?tab=candidates"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[color:var(--foreground)]/60 hover:bg-white/10 hover:text-[color:var(--foreground)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>Candidates</span>
            </Link>
          </div>

          <div className="mt-8 space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[color:var(--foreground)]/60 hover:bg-white/10 hover:text-[color:var(--foreground)] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Subscriptions</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[color:var(--foreground)]/60 hover:bg-white/10 hover:text-[color:var(--foreground)] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Help & Support</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[color:var(--foreground)]/60 hover:bg-white/10 hover:text-[color:var(--foreground)] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 00-1.066 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[color:var(--foreground)]/60 hover:bg-white/10 hover:text-[color:var(--foreground)] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[color:var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[color:var(--brand-start)] to-[color:var(--brand-end)] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">SB</span>
            </div>
            <div>
              <div className="text-[color:var(--foreground)] font-medium text-sm">sagar bhatnagar</div>
              <div className="text-[color:var(--foreground)]/60 text-xs">Recruiter</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-white hover:text-white/80 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveName();
                        } else if (e.key === 'Escape') {
                          handleCancelEditName();
                        }
                      }}
                      className="text-2xl font-bold text-white bg-white/20 border border-white/30 rounded px-2 py-1 flex-1 min-w-0 focus:outline-none focus:border-white/50"
                      autoFocus
                      disabled={isSavingName}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isSavingName || !editedName.trim()}
                      className="text-white hover:text-white/80 disabled:opacity-50"
                      title="Save"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleCancelEditName}
                      disabled={isSavingName}
                      className="text-white hover:text-white/80 disabled:opacity-50"
                      title="Cancel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h1 className="text-2xl font-bold text-white truncate">{screening?.name || 'Loading...'}</h1>
                    <button
                      onClick={handleEditName}
                      className="text-white/60 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit name"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full whitespace-nowrap">
                    AI Assisted
                  </span>
                </div>
              </div>
            </div>
            <button className="text-white hover:text-white/80">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-6 mt-4 flex-wrap">
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm whitespace-nowrap">Created: {screening?.createdDate || 'N/A'}</span>
            </div>
            <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full whitespace-nowrap capitalize">
              {screening?.status || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[color:var(--surface)] border-b border-[color:var(--border)]">
          <div className="px-6">
            <div className="flex space-x-8">
              {[
                { id: 'candidates', label: 'Candidates', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
                { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 00-1.066 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[color:var(--brand-start)] text-[color:var(--brand-start)]'
                      : 'border-transparent text-[color:var(--foreground)]/60 hover:text-[color:var(--foreground)]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {activeTab === 'candidates' && (
            <div className="space-y-6">
              {/* Search and Invite Bar */}
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search candidates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-[color:var(--border)] rounded-md leading-5 bg-[color:var(--surface)] placeholder-[color:var(--foreground)]/50 text-[color:var(--foreground)] focus:outline-none focus:placeholder-[color:var(--foreground)]/70 focus:ring-1 focus:ring-[color:var(--brand-start)] focus:border-[color:var(--brand-start)]"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Invite Candidates
                </button>
              </div>

              {/* Sort and Filter */}
              <div className="flex items-center gap-3 flex-wrap">
        
                <button
                  onClick={() => setShowFilterModal(true)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border ${
                    statusFilter.length > 0 || scoreFilter.min !== null || scoreFilter.max !== null
                      ? 'bg-[color:var(--brand-start)]/20 text-[color:var(--brand-start)] border-[color:var(--brand-start)]/30'
                      : 'bg-[color:var(--surface)] text-[color:var(--foreground)]/70 hover:bg-white/10 border-[color:var(--border)]'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  Filter
                  {(statusFilter.length > 0 || scoreFilter.min !== null || scoreFilter.max !== null) && (
                    <span className="ml-1 px-1.5 py-0.5 bg-[color:var(--brand-start)]/30 rounded-full text-xs">
                      {statusFilter.length + (scoreFilter.min !== null ? 1 : 0) + (scoreFilter.max !== null ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>

              {/* Progress */}
              <div className="flex items-center justify-between text-sm text-[color:var(--foreground)]/60">
                <span>{screening?.completedCandidates || 0} of {screening?.totalCandidates || 0} completed ({screening?.inProgressCandidates || 0} in progress)</span>
                <span>{Math.round(progressPercentage)}% progress</span>
              </div>

              {/* Candidates List or Empty State */}
              {candidates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-[color:var(--surface)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-[color:var(--foreground)]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-[color:var(--foreground)] mb-2">No candidates yet</h3>
                  <p className="text-[color:var(--foreground)]/60 mb-6">Start by inviting candidates to take this assessment</p>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Invite Candidates
                  </button>
                </div>
              ) : (
                <div className="bg-[color:var(--surface)] rounded-lg shadow-sm border border-[color:var(--border)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[color:var(--surface)]/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Candidate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Progress</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Hiring Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)]/60 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[color:var(--border)]">
                        {sortedCandidates.map((candidate) => (
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(candidate.status)}`}>
                                {candidate.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {candidate.score ? (
                                <span className="text-[color:var(--foreground)] font-medium">{candidate.score}/100</span>
                              ) : (
                                <span className="text-[color:var(--foreground)]/40">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-24 bg-[color:var(--surface)]/50 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${candidate.progress}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={candidate.hiringStatus || 'pending'}
                                onChange={(e) => handleUpdateHiringStatus(candidate.id, e.target.value as 'shortlisted' | 'on-hold' | 'rejected' | 'hired' | 'pending')}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-start)] focus:border-[color:var(--brand-start)] transition-colors min-w-[180px]"
                              >
                                <option value="pending">Pending</option>
                                <option value="shortlisted">Shortlisted for next round</option>
                                <option value="on-hold">On Hold</option>
                                <option value="rejected">Rejected</option>
                                <option value="hired">Hired</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button 
                                onClick={() => handleViewResults(candidate)}
                                className="text-[color:var(--brand-start)] hover:text-[color:var(--brand-end)] mr-3"
                              >
                                {candidate.status === 'completed' ? 'View Results' : 'View'}
                              </button>
                              <button className="text-blue-400 hover:text-blue-300 mr-3">Resend</button>
                              <button className="text-red-400 hover:text-red-300">Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[color:var(--foreground)]">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[color:var(--surface)] p-6 rounded-lg shadow-sm border border-[color:var(--border)]">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">Completion Rate</h3>
                  <div className="text-3xl font-bold text-[color:var(--brand-start)]">{Math.round(progressPercentage)}%</div>
                  <p className="text-[color:var(--foreground)]/60 text-sm">Candidates completed</p>
                </div>
                <div className="bg-[color:var(--surface)] p-6 rounded-lg shadow-sm border border-[color:var(--border)]">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">Average Score</h3>
                  <div className="text-3xl font-bold text-green-400">{screening?.averageScore || 0}</div>
                  <p className="text-[color:var(--foreground)]/60 text-sm">Out of 100</p>
                </div>
                <div className="bg-[color:var(--surface)] p-6 rounded-lg shadow-sm border border-[color:var(--border)]">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">Total Candidates</h3>
                  <div className="text-3xl font-bold text-blue-400">{screening?.totalCandidates || 0}</div>
                  <p className="text-[color:var(--foreground)]/60 text-sm">Invited</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[color:var(--foreground)]">Settings</h2>
              <div className="bg-[color:var(--surface)] p-6 rounded-lg shadow-sm border border-[color:var(--border)]">
                <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-4">Screening Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">Screening Name</label>
                    <input
                      type="text"
                      value={screening?.name || ''}
                      className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg bg-[color:var(--surface)] text-[color:var(--foreground)] focus:ring-2 focus:ring-[color:var(--brand-start)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">Status</label>
                    <select className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg bg-[color:var(--surface)] text-[color:var(--foreground)] focus:ring-2 focus:ring-[color:var(--brand-start)] focus:border-transparent">
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Candidates Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[color:var(--surface)] rounded-2xl p-6 w-full max-w-md border border-[color:var(--border)]">
            <h3 className="text-xl font-bold text-[color:var(--foreground)] mb-4">Invite Candidates</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">Email Addresses</label>
                <textarea
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  placeholder="Enter email addresses, one per line"
                  className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg bg-[color:var(--surface)] text-[color:var(--foreground)] focus:ring-2 focus:ring-[color:var(--brand-start)] focus:border-transparent h-24"
                />
                <p className="text-[color:var(--foreground)]/60 text-sm mt-1">Separate multiple emails with new lines</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleInviteCandidates}
                  disabled={!inviteEmails.trim() || isInviting}
                  className="flex-1 bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isInviting ? 'Sending...' : 'Send Invites'}
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 bg-[color:var(--surface)] text-[color:var(--foreground)] py-2 px-4 rounded-lg hover:bg-white/10 transition-colors border border-[color:var(--border)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[color:var(--surface)] rounded-2xl p-6 w-full max-w-md border border-[color:var(--border)]">
            <h3 className="text-xl font-bold text-[color:var(--foreground)] mb-4">Filter Candidates</h3>
            <div className="space-y-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-[color:var(--foreground)] mb-3">Status</label>
                <div className="space-y-2">
                  {['completed', 'in-progress', 'invited', 'not-started'].map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={statusFilter.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStatusFilter([...statusFilter, status]);
                          } else {
                            setStatusFilter(statusFilter.filter(s => s !== status));
                          }
                        }}
                        className="rounded border-[color:var(--border)] text-[color:var(--brand-start)] focus:ring-[color:var(--brand-start)]"
                      />
                      <span className="text-[color:var(--foreground)] capitalize">{status.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Score Filter */}
              <div>
                <label className="block text-sm font-medium text-[color:var(--foreground)] mb-3">Score Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[color:var(--foreground)]/60 mb-1">Min Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreFilter.min || ''}
                      onChange={(e) => setScoreFilter({ ...scoreFilter, min: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg bg-[color:var(--surface)] text-[color:var(--foreground)] focus:ring-2 focus:ring-[color:var(--brand-start)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[color:var(--foreground)]/60 mb-1">Max Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreFilter.max || ''}
                      onChange={(e) => setScoreFilter({ ...scoreFilter, max: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg bg-[color:var(--surface)] text-[color:var(--foreground)] focus:ring-2 focus:ring-[color:var(--brand-start)] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setStatusFilter([]);
                    setScoreFilter({ min: null, max: null });
                  }}
                  className="flex-1 bg-[color:var(--surface)] text-[color:var(--foreground)] py-2 px-4 rounded-lg hover:bg-white/10 transition-colors border border-[color:var(--border)]"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white py-2 px-4 rounded-lg hover:opacity-90 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Results Modal */}
      {showResultsModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-br from-[#0b1020]/95 to-[#0f1427]/95 backdrop-blur-xl border-b border-white/10 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#5b8cff] to-[#a855f7] bg-clip-text text-transparent">
                    {selectedCandidate.status === 'completed' ? 'Interview Analysis Report' : 'Candidate Details'}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">{selectedCandidate.name} • {selectedCandidate.email}</p>
                </div>
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Candidate Info */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-[#5cd3ff]">👤</span>
                  Candidate Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-white/60 text-sm">Name:</span>
                    <p className="text-white font-medium">{selectedCandidate.name}</p>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Email:</span>
                    <p className="text-white font-medium">{selectedCandidate.email}</p>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Status:</span>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getStatusColor(selectedCandidate.status)}`}>
                      {selectedCandidate.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60 text-sm">Invited Date:</span>
                    <p className="text-white font-medium">{selectedCandidate.invitedDate}</p>
                  </div>
                  {selectedCandidate.completedDate && (
                    <div>
                      <span className="text-white/60 text-sm">Completed Date:</span>
                      <p className="text-white font-medium">{selectedCandidate.completedDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Score Cards - Only show if completed */}
              {selectedCandidate.status === 'completed' && (
                <>
                  <motion.div 
                    className="grid md:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Overall Score */}
                    <motion.div 
                      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center relative overflow-hidden"
                      whileHover={{ scale: 1.02, y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div 
                        className="text-5xl font-bold mb-3"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                      >
                        <span className="bg-gradient-to-r from-[#2ad17e] to-[#20c997] bg-clip-text text-transparent">
                          {Math.round((selectedCandidate.score || 0))}
                        </span>
                        <span className="text-xl text-white/60">%</span>
                      </motion.div>
                      <p className="text-white font-semibold text-lg">Overall Score</p>
                      <p className="text-white/70 text-sm mt-2">
                        {(selectedCandidate.score || 0) >= 90 ? 'Excellent Performance!' : 
                         (selectedCandidate.score || 0) >= 80 ? 'Great Job!' : 
                         (selectedCandidate.score || 0) >= 70 ? 'Good Performance' : 
                         (selectedCandidate.score || 0) >= 60 ? 'Satisfactory' : 
                         'Room for Improvement'}
                      </p>
                    </motion.div>

                    {/* Technical Skills */}
                    {selectedCandidate.technicalScore !== undefined && (
                      <motion.div 
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center relative overflow-hidden"
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div 
                          className="text-5xl font-bold mb-3"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2.5, repeat: Infinity, type: "tween" }}
                        >
                          <span className="bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] bg-clip-text text-transparent">
                            {Math.round(selectedCandidate.technicalScore)}
                          </span>
                          <span className="text-xl text-white/60">%</span>
                        </motion.div>
                        <p className="text-white font-semibold text-lg">Technical Skills</p>
                        <p className="text-white/70 text-sm mt-2">Code quality & problem solving</p>
                      </motion.div>
                    )}

                    {/* Communication */}
                    {selectedCandidate.communicationScore !== undefined && (
                      <motion.div 
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center relative overflow-hidden"
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div 
                          className="text-5xl font-bold mb-3"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 3, repeat: Infinity, type: "tween" }}
                        >
                          <span className="bg-gradient-to-r from-[#ffb21e] to-[#ff6b6b] bg-clip-text text-transparent">
                            {Math.round(selectedCandidate.communicationScore)}
                          </span>
                          <span className="text-xl text-white/60">%</span>
                        </motion.div>
                        <p className="text-white font-semibold text-lg">Communication</p>
                        <p className="text-white/70 text-sm mt-2">Clarity & articulation</p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Detailed Feedback */}
                  {(selectedCandidate.detailedFeedback || (typeof selectedCandidate.feedback === 'object' && selectedCandidate.feedback)) && (
                    <motion.div 
                      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.h2 
                        className="text-xl font-bold text-white mb-6 flex items-center gap-3"
                      >
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                          <MessageCircle className="w-6 h-6 text-[#2ad17e]" />
                        </motion.div>
                        Detailed Feedback
                      </motion.h2>
                      
                      <div className="text-white/90 leading-relaxed space-y-6">
                        {(() => {
                          const feedbackData = selectedCandidate.detailedFeedback || (typeof selectedCandidate.feedback === 'object' ? selectedCandidate.feedback : null);
                          
                          if (!feedbackData) {
                            const feedbackText = typeof selectedCandidate.feedback === 'string' ? selectedCandidate.feedback : '';
                            return feedbackText ? <div className="whitespace-pre-wrap">{feedbackText}</div> : null;
                          }
                          
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
                              {feedbackData.strengths && Array.isArray(feedbackData.strengths) && feedbackData.strengths.length > 0 && (
                                <div>
                                  <h3 className="text-lg font-semibold text-[#5cd3ff] mb-3">Strengths</h3>
                                  <ul className="space-y-2">
                                    {feedbackData.strengths.map((strength: string, index: number) => (
                                      <li key={index} className="flex items-start gap-3">
                                        <span className="text-[#2ad17e] mt-1">✓</span>
                                        <span className="text-white/90">{strength}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Improvements */}
                              {feedbackData.improvements && Array.isArray(feedbackData.improvements) && feedbackData.improvements.length > 0 && (
                                <div>
                                  <h3 className="text-lg font-semibold text-[#ffb21e] mb-3">Areas for Improvement</h3>
                                  <ul className="space-y-2">
                                    {feedbackData.improvements.map((improvement: string, index: number) => (
                                      <li key={index} className="flex items-start gap-3">
                                        <span className="text-[#ffb21e] mt-1">→</span>
                                        <span className="text-white/90">{improvement}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Categories/Skills */}
                              {feedbackData.categories && (
                                <div>
                                  <h3 className="text-lg font-semibold text-[#6f5af6] mb-3">Skill Categories</h3>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    {Object.entries(feedbackData.categories).map(([category, score]: [string, any]) => (
                                      <div key={category} className="bg-white/5 rounded-2xl p-4">
                                        <div className="flex justify-between items-center">
                                          <span className="text-white/90 capitalize">{category.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                                          <span className="text-[#2ad17e] font-semibold">
                                            {typeof score === 'number' ? `${Math.round(score)}/10` : score}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}

                  {/* Per-Question Analysis */}
                  {selectedCandidate.questionAnalysis && selectedCandidate.questionAnalysis.length > 0 && (
                    <motion.div 
                      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="text-[#5cd3ff]">📋</span>
                        Question-by-Question Analysis
                      </h2>
                      <div className="space-y-4">
                        {selectedCandidate.questionAnalysis.map((qa: any, idx: number) => (
                          <motion.div 
                            key={idx} 
                            className="rounded-2xl bg-white/5 p-6 border border-white/10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                          >
                            <div className="flex flex-col gap-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <p className="text-white/70 text-sm mb-2">Question {qa.questionNumber || idx + 1}</p>
                                  <p className="text-white font-semibold text-lg mb-3">{qa.question}</p>
                                  
                                  <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-white/80 mb-2">Candidate Answer:</h4>
                                    <p className="bg-white/5 p-3 rounded-lg border border-white/10 text-white/90 text-sm whitespace-pre-wrap">
                                      {qa.answer || 'No answer provided'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-white/70 text-xs mb-1">Score</p>
                                  <motion.div
                                    className={`text-3xl font-bold ${
                                      qa.score >= 8 ? 'text-[#2ad17e]' : 
                                      qa.score >= 6 ? 'text-[#5cd3ff]' : 
                                      qa.score >= 4 ? 'text-[#ffb21e]' : 
                                      'text-[#ff6b6b]'
                                    }`}
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    {typeof qa.score === 'number' ? qa.score.toFixed(1) : qa.score || 'N/A'}
                                  </motion.div>
                                  <p className="text-white/50 text-xs mt-1">/10</p>
                                </div>
                              </div>
                              
                              {/* Detailed Feedback */}
                              {qa.feedback && (
                                <div className="mt-4 p-4 bg-white/5 rounded-xl border-l-4 border-[#5cd3ff]">
                                  <h4 className="text-sm font-semibold text-[#5cd3ff] mb-2">Detailed Feedback:</h4>
                                  <p className="text-white/90 text-sm leading-relaxed">{qa.feedback}</p>
                                </div>
                              )}
                              
                              {/* Strengths and Improvements */}
                              <div className="grid md:grid-cols-2 gap-4 mt-4">
                                {Array.isArray(qa.strengths) && qa.strengths.length > 0 && (
                                  <div className="bg-gradient-to-br from-[#2ad17e]/10 to-[#2ad17e]/5 rounded-xl p-4 border border-[#2ad17e]/20">
                                    <p className="text-[#2ad17e] font-semibold mb-3 flex items-center gap-2">
                                      <span>✓</span>
                                      Strengths
                                    </p>
                                    <ul className="list-disc list-inside text-white/85 text-sm space-y-2">
                                      {qa.strengths.map((s: string, i: number) => (
                                        <li key={i} className="leading-relaxed">{s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {Array.isArray(qa.improvements) && qa.improvements.length > 0 && (
                                  <div className="bg-gradient-to-br from-[#ffb21e]/10 to-[#ffb21e]/5 rounded-xl p-4 border border-[#ffb21e]/20">
                                    <p className="text-[#ffb21e] font-semibold mb-3 flex items-center gap-2">
                                      <span>→</span>
                                      Improvements
                                    </p>
                                    <ul className="list-disc list-inside text-white/85 text-sm space-y-2">
                                      {qa.improvements.map((s: string, i: number) => (
                                        <li key={i} className="leading-relaxed">{s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Fallback: Basic Q&A Pairs if no questionAnalysis */}
                  {(!selectedCandidate.questionAnalysis || selectedCandidate.questionAnalysis.length === 0) && selectedCandidate.qaPairs && selectedCandidate.qaPairs.length > 0 && (
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-[#5cd3ff]">💬</span>
                        Interview Questions & Answers
                      </h4>
                      <div className="space-y-4">
                        {selectedCandidate.qaPairs.map((qa, index) => (
                          <div key={index} className="border-l-4 border-[#5cd3ff] pl-4 bg-white/5 rounded-r-xl p-4">
                            <div className="mb-2">
                              <span className="text-white/60 text-sm font-medium">Q{index + 1}:</span>
                              <p className="text-white font-medium mt-1">{qa.question}</p>
                            </div>
                            <div className="mb-2">
                              <span className="text-white/60 text-sm font-medium">Answer:</span>
                              <p className="text-white/80 mt-1 whitespace-pre-wrap">{qa.answer || 'No answer provided'}</p>
                            </div>
                            {qa.score !== undefined && (
                              <div>
                                <span className="text-white/60 text-sm font-medium">Score:</span>
                                <span className="text-[#2ad17e] font-bold ml-2">{qa.score}/10</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* No Results Message */}
              {selectedCandidate.status !== 'completed' && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                    <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Interview Not Completed</h4>
                  <p className="text-white/60">
                    {selectedCandidate.status === 'invited' 
                      ? 'The candidate has been invited but hasn\'t started the interview yet.'
                      : 'The candidate has not completed the interview yet.'}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gradient-to-br from-[#0b1020]/95 to-[#0f1427]/95 backdrop-blur-xl border-t border-white/10 p-6 flex justify-end">
              <motion.button
                onClick={() => setShowResultsModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 border-2 border-white/20 text-white font-semibold rounded-xl hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button className="w-12 h-12 bg-[color:var(--surface)] text-[color:var(--foreground)] rounded-full shadow-lg hover:bg-white/10 transition-colors flex items-center justify-center border border-[color:var(--border)]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        <button className="w-12 h-12 bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white rounded-full shadow-lg hover:opacity-90 transition-colors flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
