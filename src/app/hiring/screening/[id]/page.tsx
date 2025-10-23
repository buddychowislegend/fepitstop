"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: 'invited' | 'in-progress' | 'completed' | 'not-started';
  score?: number;
  completedDate?: string;
  invitedDate: string;
  progress: number;
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

  useEffect(() => {
    loadScreeningDetails();
  }, [screeningId]);

  const loadScreeningDetails = async () => {
    try {
      // Mock data for now - replace with actual API call
      setScreening({
        id: screeningId,
        name: "HR Manager",
        status: "active",
        createdDate: "24/10/2025",
        totalCandidates: 0,
        completedCandidates: 0,
        inProgressCandidates: 0,
        averageScore: 0
      });
      
      setCandidates([]);
    } catch (error) {
      console.error('Error loading screening details:', error);
    }
  };

  const handleInviteCandidates = async () => {
    if (!inviteEmails.trim()) return;
    
    setIsInviting(true);
    try {
      const emails = inviteEmails.split('\n').map(email => email.trim()).filter(email => email);
      
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCandidates = emails.map((email, index) => ({
        id: `candidate-${Date.now()}-${index}`,
        name: email.split('@')[0],
        email: email,
        status: 'invited' as const,
        invitedDate: new Date().toISOString().split('T')[0],
        progress: 0
      }));
      
      setCandidates([...candidates, ...newCandidates]);
      setInviteEmails("");
      setShowInviteModal(false);
      
      // Update screening stats
      setScreening(prev => prev ? {
        ...prev,
        totalCandidates: prev.totalCandidates + emails.length
      } : null);
      
    } catch (error) {
      console.error('Error inviting candidates:', error);
      alert('Failed to invite candidates');
    } finally {
      setIsInviting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'invited': return 'bg-yellow-100 text-yellow-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <div>
                <h1 className="text-2xl font-bold text-white">{screening?.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                    AI Assisted
                  </span>
                  <button className="text-white hover:text-white/80">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <button className="text-white hover:text-white/80">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">Created: {screening?.createdDate}</span>
            </div>
            <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
              {screening?.status}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSortBy('top-performer')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'top-performer'
                      ? 'bg-[color:var(--brand-start)]/20 text-[color:var(--brand-start)]'
                      : 'bg-[color:var(--surface)] text-[color:var(--foreground)]/70 hover:bg-white/10'
                  }`}
                >
                  <span className="mr-1">#</span> Top Performer ↑
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'name'
                      ? 'bg-[color:var(--brand-start)]/20 text-[color:var(--brand-start)]'
                      : 'bg-[color:var(--surface)] text-[color:var(--foreground)]/70 hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Name
                </button>
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'date'
                      ? 'bg-[color:var(--brand-start)]/20 text-[color:var(--brand-start)]'
                      : 'bg-[color:var(--surface)] text-[color:var(--foreground)]/70 hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Date
                </button>
                <button className="px-3 py-1 rounded-lg text-sm font-medium bg-[color:var(--surface)] text-[color:var(--foreground)]/70 hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  Filter
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button className="text-[color:var(--brand-start)] hover:text-[color:var(--brand-end)] mr-3">View</button>
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
