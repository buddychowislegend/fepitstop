"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ExcelUpload from "@/components/ExcelUpload";

interface Candidate {
  id: string;
  name: string;
  email: string;
  profile: string;
  status: 'active' | 'inactive';
  addedDate: string;
}

interface InterviewDrive {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  candidates: string[];
  createdDate: string;
  completedDate?: string;
}

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState<'candidates' | 'interviews'>('candidates');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviewDrives, setInterviewDrives] = useState<InterviewDrive[]>([]);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showCreateDrive, setShowCreateDrive] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
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
      // Use local API routes
      const response = await fetch('/api/company/dashboard', {
        headers: {
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data received:', data);
        console.log('Debug info:', data.debug);
        
        setCandidates(data.candidates.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          profile: c.profile,
          status: c.status,
          addedDate: c.createdAt.split('T')[0]
        })));
        setInterviewDrives(data.interviewDrives.map(d => ({
          id: d.id,
          name: d.name,
          status: d.status,
          candidates: d.candidateIds,
          createdDate: d.createdAt.split('T')[0]
        })));
      } else {
        console.log('API request failed, using fallback data');
        // Fallback to sample data if API fails
        setCandidates([
          { id: "1", name: "John Doe", email: "john@example.com", profile: "Frontend Developer", status: "active", addedDate: "2024-01-15" },
          { id: "2", name: "Jane Smith", email: "jane@example.com", profile: "React Developer", status: "active", addedDate: "2024-01-16" },
          { id: "3", name: "Mike Johnson", email: "mike@example.com", profile: "Full Stack Developer", status: "inactive", addedDate: "2024-01-17" }
        ]);
        setInterviewDrives([
          { id: "1", name: "Frontend Screening - Jan 2024", status: "completed", candidates: ["1", "2"], createdDate: "2024-01-15", completedDate: "2024-01-20" },
          { id: "2", name: "React Developer Assessment", status: "active", candidates: ["2", "3"], createdDate: "2024-01-18" }
        ]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Use sample data as fallback
      setCandidates([
        { id: "1", name: "John Doe", email: "john@example.com", profile: "Frontend Developer", status: "active", addedDate: "2024-01-15" },
        { id: "2", name: "Jane Smith", email: "jane@example.com", profile: "React Developer", status: "active", addedDate: "2024-01-16" },
        { id: "3", name: "Mike Johnson", email: "mike@example.com", profile: "Full Stack Developer", status: "inactive", addedDate: "2024-01-17" }
      ]);
      setInterviewDrives([
        { id: "1", name: "Frontend Screening - Jan 2024", status: "completed", candidates: ["1", "2"], createdDate: "2024-01-15", completedDate: "2024-01-20" },
        { id: "2", name: "React Developer Assessment", status: "active", candidates: ["2", "3"], createdDate: "2024-01-18" }
      ]);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/company/candidates', {
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
        console.log('Candidate added successfully:', data);
        
        const candidate: Candidate = {
          id: data.id,
          name: newCandidate.name,
          email: newCandidate.email,
          profile: newCandidate.profile,
          status: "active",
          addedDate: new Date().toISOString().split('T')[0]
        };
        
        setCandidates([...candidates, candidate]);
        setNewCandidate({ name: "", email: "", profile: "" });
        setShowAddCandidate(false);
        
        console.log('Updated candidates list:', [...candidates, candidate]);
      } else {
        const error = await response.json();
        console.error('Error adding candidate:', error);
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
      const response = await fetch('/api/company/drives', {
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
          createdDate: new Date().toISOString().split('T')[0]
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

  const handleSendLinks = async (driveId: string) => {
    try {
      const response = await fetch(`/api/company/drives/${driveId}/send-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Interview links generated successfully! ${data.links.length} links created.`);
        // Update drive status to active
        setInterviewDrives(prev => prev.map(d => 
          d.id === driveId ? { ...d, status: 'active' } : d
        ));
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending links:', error);
      alert('Failed to send interview links');
    }
  };

  const handleExcelUpload = (candidates: Candidate[]) => {
    // Add candidates from Excel upload
    const newCandidates = candidates.map(candidate => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: candidate.name,
      email: candidate.email,
      profile: candidate.profile,
      status: "active" as const,
      addedDate: new Date().toISOString().split('T')[0]
    }));
    setCandidates([...candidates, ...newCandidates]);
    setShowExcelUpload(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1720] via-[#1a1a2e] to-[#16213e]">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/logo-simple.svg" alt="HireOG" width={32} height={32} />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                HireOG
              </span>
              <span className="text-white/60">Company Portal</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/60 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Company Dashboard</h1>
          <p className="text-white/60">Manage candidates and conduct screening interviews</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'candidates'
                ? 'bg-purple-600 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Candidates
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'interviews'
                ? 'bg-purple-600 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Interview Drives
          </button>
        </div>

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Candidate Database</h2>
              <div className="flex gap-3">
                <button
                  onClick={loadDashboardData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setShowAddCandidate(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Candidate
                </button>
                <button 
                  onClick={() => setShowExcelUpload(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Upload Excel
                </button>
              </div>
            </div>

            {/* Candidates Table */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Profile</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Added Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {candidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{candidate.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white/80">{candidate.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white/80">{candidate.profile}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            candidate.status === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {candidate.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white/60">{candidate.addedDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-purple-400 hover:text-purple-300 mr-3">Edit</button>
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

        {/* Interviews Tab */}
        {activeTab === 'interviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Interview Drives</h2>
              <button
                onClick={() => setShowCreateDrive(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Screening
              </button>
            </div>

            {/* Interview Drives Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {interviewDrives.map((drive) => (
                <div key={drive.id} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{drive.name}</h3>
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
                  <p className="text-white/60 text-sm mb-4">
                    {drive.candidates.length} candidates selected
                  </p>
                  <p className="text-white/40 text-xs mb-4">
                    Created: {drive.createdDate}
                  </p>
                  {drive.status === 'draft' && (
                    <button
                      onClick={() => handleSendLinks(drive.id)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Send Links to Candidates
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Candidate Modal */}
      {showAddCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Add New Candidate</h3>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Name</label>
                <input
                  type="text"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                  placeholder="Enter candidate name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <input
                  type="email"
                  value={newCandidate.email}
                  onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Profile</label>
                <input
                  type="text"
                  value={newCandidate.profile}
                  onChange={(e) => setNewCandidate({ ...newCandidate, profile: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                  placeholder="e.g., Frontend Developer"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCandidate(false)}
                  className="flex-1 bg-white/10 text-white py-2 px-4 rounded-lg hover:bg-white/20 transition-colors"
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
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Create Screening Drive</h3>
            <form onSubmit={handleCreateDrive} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Drive Name</label>
                <input
                  type="text"
                  value={newDrive.name}
                  onChange={(e) => setNewDrive({ ...newDrive, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                  placeholder="e.g., Frontend Screening - Jan 2024"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Select Candidates</label>
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
                        className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-white/80 text-sm">{candidate.name} ({candidate.profile})</span>
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
                  className="flex-1 bg-white/10 text-white py-2 px-4 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Upload Modal */}
      {showExcelUpload && (
        <ExcelUpload
          onUpload={handleExcelUpload}
          onClose={() => setShowExcelUpload(false)}
        />
      )}
    </div>
  );
}
