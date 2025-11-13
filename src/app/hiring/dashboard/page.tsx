"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AIConfigurationScreen from "@/components/AIConfigurationScreen";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Target,
  Star,
  Settings,
  CheckCircle,
  Play,
  ArrowLeft,
  ArrowRight,
  Camera,
  Mic,
  Volume2,
  Clock,
  Code,
  MessageCircle,
  Users,
  BarChart3,
  Calendar,
  Lightbulb,
  Trophy,
  Zap,
  Bell,
  Award,
  BookOpen,
  Coffee,
  Monitor,
  Briefcase,
  Activity,
  TrendingUp,
  Eye,
  UserCheck,
  Plus,
  X,
} from "lucide-react";

type ProfileOption = 'frontend' | 'backend' | 'product' | 'business' | 'qa' | 'hr' | 'data';

const mapProfileString = (value?: string | null): ProfileOption => {
  const lower = (value || '').toLowerCase();
  if (lower.includes('back')) return 'backend';
  if (lower.includes('product')) return 'product';
  if (lower.includes('hr') || lower.includes('human')) return 'hr';
  if (lower.includes('business') || lower.includes('sales')) return 'business';
  if (lower.includes('qa') || lower.includes('quality') || lower.includes('test')) return 'qa';
  if (lower.includes('data') || lower.includes('analyt')) return 'data';
  return 'frontend';
};

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
  jobDescription?: string;
  questions?: string[];
  profile?: ProfileOption;
  level?: 'junior' | 'mid' | 'senior';
}

interface NewDriveFormState {
  name: string;
  selectedCandidates: string[];
  jobDescription: string;
  questions: string[];
  profile: ProfileOption;
  level: 'junior' | 'mid' | 'senior';
}

type DriveCreationMode = 'selection' | 'jd' | 'custom';

const createEmptyDriveForm = (): NewDriveFormState => ({
  name: "",
  selectedCandidates: [],
  jobDescription: "",
  questions: [],
  profile: 'frontend',
  level: 'mid',
});

export default function CompanyDashboard() {
  // Mouse tracking for background animations
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'screenings' | 'candidates'>('dashboard');
  const [aiInput, setAiInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviewDrives, setInterviewDrives] = useState<InterviewDrive[]>([]);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showCreateDrive, setShowCreateDrive] = useState(false);
  const [driveCreationMode, setDriveCreationMode] = useState<DriveCreationMode>('selection');
  const [newCandidate, setNewCandidate] = useState({ name: "", email: "", profile: "" });
  const [newDrive, setNewDrive] = useState<NewDriveFormState>(() => createEmptyDriveForm());
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [companyDisplayName, setCompanyDisplayName] = useState<string>("Company");
  const router = useRouter();

  const profileOptions: Array<{ value: ProfileOption; label: string }> = [
    { value: 'frontend', label: 'Frontend Engineering' },
    { value: 'backend', label: 'Backend Engineering' },
    { value: 'product', label: 'Product Management' },
    { value: 'business', label: 'Business & Sales' },
    { value: 'qa', label: 'Quality Assurance' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'data', label: 'Data & Analytics' },
  ];

  const levelOptions: Array<{ value: 'junior' | 'mid' | 'senior'; label: string }> = [
    { value: 'junior', label: 'Junior (0-2 yrs)' },
    { value: 'mid', label: 'Mid (3-6 yrs)' },
    { value: 'senior', label: 'Senior (7+ yrs)' },
  ];

  const handleOpenCreateDrive = () => {
    setDriveCreationMode('selection');
    setNewDrive(createEmptyDriveForm());
    setNewQuestion("");
    setIsGeneratingQuestions(false);
    setShowCreateDrive(true);
  };

  const handleCloseCreateDrive = () => {
    setShowCreateDrive(false);
    setDriveCreationMode('selection');
    setNewDrive(createEmptyDriveForm());
    setNewQuestion("");
    setIsGeneratingQuestions(false);
  };

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("hiring_authenticated");
    if (!isAuthenticated) {
      router.push("/hiring/signin");
      return;
    }

    // Derive company display name from username email between '@' and '.in'
    const userEmail = localStorage.getItem('hiring_user') || '';
    const match = userEmail.match(/@(.*?)\.in/i);
    let derived = match && match[1] ? match[1] : (localStorage.getItem('hiring_company_id') || 'Company');
    // Beautify: replace separators and title-case
    derived = derived
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    setCompanyDisplayName(derived);

    // Load data from backend
    loadDashboardData();
    loadScreenings();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const companyId = localStorage.getItem('hiring_company_id') || 'hireog';
      const companyPassword = localStorage.getItem('hiring_company_password') || 'manasi22';
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = `?_t=${Date.now()}`;
      const response = await fetch(`${backendUrl}/api/company/dashboard${cacheBuster}`, {
        method: 'GET',
        headers: {
          'X-Company-ID': companyId,
          'X-Company-Password': companyPassword,
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
      const companyId = localStorage.getItem('hiring_company_id') || 'hireog';
      const companyPassword = localStorage.getItem('hiring_company_password') || 'manasi22';
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = `?_t=${Date.now()}`;
      const response = await fetch(`${backendUrl}/api/company/screenings${cacheBuster}`, {
        method: 'GET',
        headers: {
          'X-Company-ID': companyId,
          'X-Company-Password': companyPassword,
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
          createdDate: s.createdAt ? s.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          totalCandidates: s.totalCandidates || 0,
          completedInterviews: s.completedInterviews || 0,
          jobDescription: s.jobDescription || '',
          questions: s.questions || [],
          profile: ((s.profile || 'frontend') as string).toLowerCase() as ProfileOption,
          level: ((s.level || 'mid') as string).toLowerCase() as 'junior' | 'mid' | 'senior',
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
      const derivedProfile = mapProfileString(details.positionTitle || details.jobDescription || '');
      
      if (!details.questions || details.questions.length === 0) {
        alert('Please generate or add interview questions before creating the drive.');
        return;
      }
      
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
          status: 'active',
          jobDescription: details.jobDescription || '',
          profile: derivedProfile,
          level: details.experienceLevel || 'mid',
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
          completedInterviews: 0,
          profile: derivedProfile,
          level: (details.experienceLevel || 'mid') as 'junior' | 'mid' | 'senior',
          jobDescription: details.jobDescription || '',
          questions: details.questions,
        };
        
        setInterviewDrives(prev => [...prev, newScreening]);

        // Create corresponding interview drive with generated questions
        try {
          const driveResponse = await fetch(`${backendUrl}/api/company/drives`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Company-ID': 'hireog',
              'X-Company-Password': 'manasi22'
            },
            credentials: 'include',
            body: JSON.stringify({
              name: screeningName,
              candidateIds: [],
              jobDescription: details.jobDescription || aiPrompt || '',
              questions: details.questions,
              profile: derivedProfile,
              level: details.experienceLevel || 'mid',
              screeningId: data.id
            })
          });

          if (!driveResponse.ok) {
            const driveError = await driveResponse.json().catch(() => ({}));
            console.error('Failed to create AI drive:', driveError);
          }
        } catch (driveError) {
          console.error('Error creating AI drive:', driveError);
        }

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

  const handleGenerateQuestions = async () => {
    if (driveCreationMode !== 'jd') {
      return;
    }

    if (!newDrive.jobDescription.trim()) {
      alert('Please enter a job description first');
      return;
    }

    setIsGeneratingQuestions(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      const response = await fetch(`${backendUrl}/api/company/drives/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22'
        },
        credentials: 'include',
        body: JSON.stringify({
          jobDescription: newDrive.jobDescription
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNewDrive(prev => ({
          ...prev,
          questions: data.questions || []
        }));
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to generate questions'}`);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAddQuestion = () => {
    const trimmed = newQuestion.trim();
    if (!trimmed) return;

    setNewDrive(prev => ({
      ...prev,
      questions: [...prev.questions, trimmed]
    }));
    setNewQuestion("");
  };

  const handleRemoveQuestion = (index: number) => {
    setNewDrive(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isJDMode = driveCreationMode === 'jd';

    if (!newDrive.name.trim()) {
      alert('Please provide a drive name');
      return;
    }

    if (newDrive.questions.length === 0) {
      alert('Please add at least one interview question');
      return;
    }

    if (!isJDMode && newDrive.selectedCandidates.length === 0) {
      alert('Please select at least one candidate');
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';

      // Step 1: create screening so it appears in the drives list
      const screeningPayload = {
        name: newDrive.name.trim(),
        positionTitle: newDrive.name.trim(),
        language: 'en-us',
        mustHaves: [] as string[],
        goodToHaves: [] as string[],
        culturalFit: [] as string[],
        estimatedTime: {
          mustHaves: 5,
          goodToHaves: 3,
          culturalFit: 2
        },
        status: 'active' as const,
        jobDescription: newDrive.jobDescription,
        profile: newDrive.profile,
        level: newDrive.level,
        questions: newDrive.questions,
      };

      let screeningId: string | null = null;

      const screeningResponse = await fetch(`${backendUrl}/api/company/screenings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22'
        },
        credentials: 'include',
        body: JSON.stringify(screeningPayload)
      });

      if (!screeningResponse.ok) {
        const screeningError = await screeningResponse.json().catch(() => ({}));
        throw new Error(screeningError.error || 'Failed to create screening');
      }

      const screeningData = await screeningResponse.json();
      screeningId = screeningData?.id || null;

      // Step 2: create interview drive linked to that screening
      const driveResponse = await fetch(`${backendUrl}/api/company/drives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newDrive.name.trim(),
          candidateIds: isJDMode ? [] : newDrive.selectedCandidates,
          jobDescription: newDrive.jobDescription,
          questions: newDrive.questions,
          screeningId: screeningId ?? undefined,
          profile: newDrive.profile,
          level: newDrive.level,
        })
      });
      
      if (driveResponse.ok) {
        await driveResponse.json().catch(() => ({}));

        // Refresh drives/screenings so UI reflects the new entry
        await loadScreenings();
        setNewDrive(createEmptyDriveForm());
        setNewQuestion("");
        handleCloseCreateDrive();
      } else {
        const error = await driveResponse.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating drive:', error);
      alert('Failed to create interview drive');
    }
  };

  const renderDriveTypeSelection = () => (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-2"
      >
        <h3 className="text-3xl font-bold text-white">Create Interview Drive</h3>
        <p className="text-white/60 max-w-2xl">
          Choose how you want to build this drive&apos;s interview experience. Pick an AI-powered JD flow or craft a custom question set from scratch.
        </p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2">
        <motion.button
          type="button"
          onClick={() => {
            setNewDrive(createEmptyDriveForm());
            setNewQuestion("");
            setDriveCreationMode('jd');
          }}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/2 to-white/5 p-6 text-left transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.05 }}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-r from-[#5cd3ff]/20 via-[#6f5af6]/10 to-[#2ad17e]/20 blur-lg" />
          </div>
          <div className="relative flex h-full flex-col gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#5cd3ff]/30 via-[#6f5af6]/30 to-[#2ad17e]/30 text-[#5cd3ff]">
              <Brain className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-semibold text-white">JD-based Drive</h4>
              <p className="text-sm text-white/60 leading-relaxed">
                Paste a job description and let AI craft a tailored question set. Perfect for rapid, role-aligned interviews with minimal manual work.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#5cd3ff] transition-colors group-hover:text-white">
              Use AI question builder
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => {
            setNewDrive(createEmptyDriveForm());
            setNewQuestion("");
            setDriveCreationMode('custom');
          }}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-white/5 p-6 text-left transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.15 }}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff7de9]/15 via-[#a855f7]/10 to-[#ffb21e]/15 blur-lg" />
          </div>
          <div className="relative flex h-full flex-col gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#a855f7]/40 via-[#ff7de9]/30 to-[#ffb21e]/30 text-[#ff9bd6]">
              <Settings className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-semibold text-white">Custom Drive</h4>
              <p className="text-sm text-white/60 leading-relaxed">
                Start from scratch and build your own list of interview questions. Ideal for bespoke rounds, leadership panels, or experimental hiring flows.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#a855f7] transition-colors group-hover:text-white">
              Build manually
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderDriveForm = () => {
    const isJDMode = driveCreationMode === 'jd';

    const questionSection = (
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-white">
          Interview Questions <span className="text-red-400">*</span> ({newDrive.questions.length})
        </label>
        <div className="space-y-2 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
          {newDrive.questions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/20 bg-white/[0.04] p-6 text-center text-sm text-white/50">
              {isJDMode
                ? 'Generate questions from the JD or add your own.'
                : 'Add the questions you want to ask candidates in this drive.'}
            </div>
          ) : (
            newDrive.questions.map((question, index) => (
              <div key={index} className="flex items-start gap-2 rounded-lg bg-white/[0.08] p-3 shadow-inner">
                <span className="mt-1 text-sm text-white/40">{index + 1}.</span>
                <span className="flex-1 text-sm leading-relaxed text-white/90">{question}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(index)}
                  className="text-red-400 transition-colors hover:text-red-300"
                  title="Remove question"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddQuestion();
              }
            }}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#5cd3ff] focus:outline-none focus:ring-2 focus:ring-[#5cd3ff]/40 placeholder:text-white/40"
            placeholder="Add a custom question..."
          />
          <button
            type="button"
            onClick={handleAddQuestion}
            className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            Add
          </button>
        </div>
        {newDrive.questions.length === 0 && (
          <p className="text-xs text-red-400">At least one question is required</p>
        )}
      </div>
    );

    return (
      <motion.form
        onSubmit={handleCreateDrive}
        className="space-y-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-white">
              {isJDMode ? 'JD-based Interview Drive' : 'Custom Interview Drive'}
            </h3>
            <p className="text-sm text-white/60 max-w-2xl">
              {isJDMode
                ? 'Paste your JD and fine-tune the generated questions before sending invites.'
                : 'Craft your own question set and send invites when you’re ready.'}
            </p>
          </div>
       
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-white">
            Drive Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={newDrive.name}
            onChange={(e) => setNewDrive(prev => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-[#5cd3ff] focus:outline-none focus:ring-2 focus:ring-[#5cd3ff]/40 placeholder:text-white/40"
            placeholder="e.g., Frontend Screening - January 2026"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Target Profile <span className="text-red-400">*</span>
            </label>
            <select
              value={newDrive.profile}
              onChange={(e) => setNewDrive(prev => ({ ...prev, profile: e.target.value as ProfileOption }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#5cd3ff] focus:outline-none focus:ring-2 focus:ring-[#5cd3ff]/40"
            >
              {profileOptions.map(option => (
                <option key={option.value} value={option.value} className="text-black">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Experience Level <span className="text-red-400">*</span>
            </label>
            <select
              value={newDrive.level}
              onChange={(e) => setNewDrive(prev => ({ ...prev, level: e.target.value as 'junior' | 'mid' | 'senior' }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#5cd3ff] focus:outline-none focus:ring-2 focus:ring-[#5cd3ff]/40"
            >
              {levelOptions.map(option => (
                <option key={option.value} value={option.value} className="text-black">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isJDMode ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-white">
                Job Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={newDrive.jobDescription}
                onChange={(e) => setNewDrive(prev => ({ ...prev, jobDescription: e.target.value }))}
                placeholder="Paste the job description here. We'll tailor the questions to this JD."
                className="min-h-[14rem] w-full rounded-xl border border-white/10 bg-[#0f1729]/70 px-3 py-3 text-sm leading-relaxed text-white focus:border-[#5cd3ff] focus:outline-none focus:ring-2 focus:ring-[#5cd3ff]/40 placeholder:text-white/40"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleGenerateQuestions}
                  disabled={isGeneratingQuestions || !newDrive.jobDescription.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-[0_12px_30px_rgba(108,90,246,0.35)] disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10"
                >
                  {isGeneratingQuestions ? 'Generating…' : '🤖 Generate Questions from JD'}
                </button>
                <p className="text-xs text-white/50 sm:ml-2">
                  AI generates ~10 questions aligned to this JD. Edit or add more anytime.
                </p>
              </div>
            </div>
            {questionSection}
          </div>
        ) : (
          questionSection
        )}

        {!isJDMode && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Select Candidates <span className="text-red-400">*</span>
            </label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              {candidates.length === 0 ? (
                <p className="text-sm text-white/60">
                  No candidates available yet. Add candidates first to invite them to this drive.
                </p>
              ) : (
                candidates.map((candidate) => (
                  <label key={candidate.id} className="flex items-center gap-3 rounded-lg bg-white/[0.08] p-3 shadow-inner">
                    <input
                      type="checkbox"
                      checked={newDrive.selectedCandidates.includes(candidate.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewDrive(prev => ({
                            ...prev,
                            selectedCandidates: [...prev.selectedCandidates, candidate.id]
                          }));
                        } else {
                          setNewDrive(prev => ({
                            ...prev,
                            selectedCandidates: prev.selectedCandidates.filter(id => id !== candidate.id)
                          }));
                        }
                      }}
                      className="rounded border-white/20 bg-transparent text-[#5cd3ff] focus:ring-[#5cd3ff]"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{candidate.name}</div>
                      <div className="text-xs text-white/60">{candidate.profile}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
          <button
            type="submit"
            disabled={
              newDrive.questions.length === 0 ||
              (!isJDMode && newDrive.selectedCandidates.length === 0)
            }
            className="w-full rounded-lg bg-gradient-to-r from-[#6f5af6] via-[#5cd3ff] to-[#2ad17e] px-4 py-2 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(92,211,255,0.25)] transition-all hover:shadow-[0_20px_50px_rgba(92,211,255,0.35)] disabled:cursor-not-allowed disabled:from-white/10 disabled:via-white/10 disabled:to-white/10 sm:flex-1"
          >
            Create Drive
          </button>
          <button
            type="button"
            onClick={handleCloseCreateDrive}
            className="w-full rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:flex-1"
          >
            Cancel
          </button>
        </div>
      </motion.form>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#2ad17e]/15 to-[#ffb21e]/15 rounded-full blur-3xl"
          animate={{ 
            x: mousePosition.x * 0.1,
            y: mousePosition.y * 0.1,
            scale: [1, 1.05, 1],
            rotate: 360
          }}
          transition={{ 
            x: { type: "spring", stiffness: 30 },
            y: { type: "spring", stiffness: 30 },
            scale: { duration: 8, repeat: Infinity, type: "tween" },
            rotate: { duration: 30, repeat: Infinity, ease: "linear" }
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-[#6f5af6]/15 to-[#5cd3ff]/15 rounded-full blur-3xl"
          animate={{ 
            x: -mousePosition.x * 0.08,
            y: -mousePosition.y * 0.08,
            scale: [1.05, 1, 1.05],
            rotate: -360
          }}
          transition={{ 
            x: { type: "spring", stiffness: 25 },
            y: { type: "spring", stiffness: 25 },
            scale: { duration: 10, repeat: Infinity, type: "tween" },
            rotate: { duration: 40, repeat: Infinity, ease: "linear" }
          }}
        />

        {/* Floating HR/Tech Icons */}
        {[Users, Brain, Briefcase, Trophy, BarChart3].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-white/8"
            style={{
              left: `${10 + i * 18}%`,
              top: `${15 + i * 15}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              rotate: [0, 10, -10, 0],
              opacity: [0.08, 0.2, 0.08],
            }}
            transition={{
              duration: 6 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              type: "tween"
            }}
          >
            <Icon className="w-20 h-20" />
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-b border-white/20 px-6 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-[#2ad17e] to-[#20c997] rounded-xl flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-white font-bold text-xl">AI Recruit</span>
            </motion.div>
            
            {/* Navigation */}
            <motion.nav 
              className="flex items-center space-x-8"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.3
                  }
                }
              }}
            >
              {[
                { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { key: 'screenings', label: 'Drives', icon: Briefcase },
                { key: 'candidates', label: 'Candidates', icon: Users },
              ].map((item) => (
                <motion.button
                  key={item.key}
                  onClick={() => setActiveTab(item.key as any)}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === item.key
                      ? 'text-[#2ad17e]' 
                      : 'text-white/60 hover:text-white'
                  }`}
                  variants={{
                    hidden: { opacity: 0, y: -20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  
                  {/* Active Indicator */}
                  {activeTab === item.key && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 w-8 h-0.5 bg-gradient-to-r from-[#2ad17e] to-[#20c997] rounded-full"
                      layoutId="activeTab"
                      style={{ x: '-50%' }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  )}
                </motion.button>
              ))}
              
              <motion.button 
                className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-all duration-300 flex items-center gap-2"
                variants={{
                  hidden: { opacity: 0, y: -20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Activity className="w-4 h-4" />
                Reports
              </motion.button>
            </motion.nav>
          </div>
          
          <motion.div 
            className="flex items-center gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.5
                }
              }
            }}
          >
            {/* Create New Drive Button */}
            <motion.button
              onClick={handleOpenCreateDrive}
              className="group relative bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-[#2ad17e]/20 transition-all duration-300 flex items-center gap-2 overflow-hidden"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 }
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(42, 209, 126, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Plus className="w-4 h-4" />
              </motion.div>
              Create New Drive
              
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#20c997] to-[#2ad17e]"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            
            {/* Notifications */}
            <motion.button 
              className="group relative p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 }
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 20, -20, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatDelay: 3,
                  type: "tween"
                }}
              >
                <Bell className="w-5 h-5" />
              </motion.div>
              
              {/* Notification Badge */}
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-[#ff6b6b] to-[#ee5a24] rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, type: "tween" }}
              />
            </motion.button>
            
            {/* User Profile */}
            <motion.div 
              className="flex items-center gap-3 pl-4 border-l border-white/20"
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0 }
              }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-[#2ad17e] to-[#20c997] rounded-full flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-white font-bold text-sm">XS</span>
              </motion.div>
              <div className="text-sm">
                <motion.div 
                  className="text-white font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {companyDisplayName}
                </motion.div>
                <motion.div 
                  className="text-white/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                </motion.div>
              </div>
            </motion.div>
            
            {/* Logout */}
            <motion.button
              onClick={handleLogout}
              className="group p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 }
              }}
              whileHover={{ 
                scale: 1.1,
                rotate: 5
              }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Welcome Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.h1 
                  className="text-4xl font-bold text-white mb-4"
                  animate={{ 
                    backgroundPosition: ["0%", "100%", "0%"]
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <span className="bg-gradient-to-r from-[#2ad17e] via-[#5cd3ff] to-[#ffb21e] bg-clip-text text-transparent bg-[length:200%_100%]">
                    Welcome Back, {companyDisplayName}!
                  </span>
                </motion.h1>
                <motion.p 
                  className="text-white/80 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Here's your recruitment snapshot for today.
                </motion.p>
              </motion.div>

              {/* AI Screening Creator */}
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border-2 border-white/20 p-10 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Background Pattern */}
                <motion.div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(42, 209, 126, 0.3) 0%, transparent 50%),
                                      radial-gradient(circle at 80% 20%, rgba(92, 211, 255, 0.3) 0%, transparent 50%),
                                      radial-gradient(circle at 40% 80%, rgba(255, 178, 30, 0.3) 0%, transparent 50%)`
                  }}
                />
                
                {/* Floating AI Icons */}
                {[Brain, Lightbulb, Target].map((Icon, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-white/10"
                    style={{
                      left: `${20 + i * 40}%`,
                      top: `${10 + i * 20}%`,
                    }}
                    animate={{
                      y: [-10, 10, -10],
                      rotate: [0, 180, 360],
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                      duration: 5 + i,
                      repeat: Infinity,
                      delay: i * 0.5,
                      type: "tween"
                    }}
                  >
                    <Icon className="w-16 h-16" />
                  </motion.div>
                ))}

                <motion.div 
                  className="relative text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.div
                    className="inline-flex items-center gap-3 mb-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] rounded-2xl flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="w-6 h-6 text-white" />
                    </motion.div>
                    <h2 className="text-3xl font-bold">
                      <span className="bg-gradient-to-r from-[#2ad17e] to-[#5cd3ff] bg-clip-text text-transparent">AI Recruit</span>
                      <span className="text-white"> Assistant</span>
                    </h2>
                  </motion.div>
                  <motion.p 
                    className="text-white/80 text-lg"
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, type: "tween" }}
                  >
                    Create AI-powered screening assessments in seconds
                  </motion.p>
                </motion.div>

                {/* AI Input Field */}
                <motion.div 
                  className="max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.div 
                    className="bg-gradient-to-br from-white/15 to-white/5 rounded-2xl border-2 border-white/20 p-6 backdrop-blur-xl"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.textarea
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="I want to create a Backend Developer screening for a mid-level position..."
                      className="w-full h-24 resize-none border-none outline-none text-white placeholder-white/60 bg-transparent text-lg"
                      whileFocus={{ scale: 1.01 }}
                    />
                    <div className="flex items-center justify-between mt-4">
                      <motion.div 
                        className="text-sm text-white/60 flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0 }}
                      >
                        <Lightbulb className="w-4 h-4" />
                        Describe the role, skills, and experience level you're looking for
                      </motion.div>
                      <motion.button
                        onClick={handleAiScreeningCreation}
                        disabled={!aiInput.trim() || isGenerating}
                        className="group relative bg-gradient-to-r from-[#2ad17e] to-[#20c997] text-white px-6 py-3 rounded-xl font-bold shadow-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ 
                          scale: (!aiInput.trim() || isGenerating) ? 1 : 1.05,
                          boxShadow: (!aiInput.trim() || isGenerating) ? undefined : "0 20px 40px rgba(42, 209, 126, 0.4)"
                        }}
                        whileTap={{ scale: (!aiInput.trim() || isGenerating) ? 1 : 0.95 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {isGenerating ? (
                            <>
                              <motion.div
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5" />
                              Create Drive
                            </>
                          )}
                        </span>
                        
                        {/* Animated Background */}
                        {!isGenerating && aiInput.trim() && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-[#20c997] to-[#2ad17e]"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "0%" }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        
                        {/* Success Particles */}
                        {!isGenerating && aiInput.trim() && (
                          <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                          >
                            {[...Array(4)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-white rounded-full"
                                style={{
                                  left: `${15 + i * 25}%`,
                                  top: `${25 + i * 15}%`,
                                }}
                                animate={{
                                  scale: [0, 1, 0],
                                  opacity: [0, 1, 0],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                  type: "tween"
                                }}
                              />
                            ))}
                          </motion.div>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Corner Decorations */}
                <motion.div 
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-r from-white/20 to-white/30 opacity-50"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute bottom-4 left-4 w-4 h-4 rounded-full bg-gradient-to-r from-[#2ad17e]/30 to-[#5cd3ff]/30"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity, type: "tween" }}
                />
              </motion.div>

              {/* Metrics Cards */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 1.0
                    }
                  }
                }}
              >
                {[
                  {
                    title: "Active Drives",
                    value: interviewDrives.filter(d => d.status === 'active').length,
                    icon: Briefcase,
                    color: "from-[#5cd3ff] to-[#6f5af6]",
                    bgColor: "from-[#5cd3ff]/20 to-[#6f5af6]/20"
                  },
                  {
                    title: "Total Candidates",
                    value: interviewDrives.reduce((sum, d) => sum + (d.totalCandidates || 0), 0),
                    icon: Users,
                    color: "from-[#2ad17e] to-[#20c997]",
                    bgColor: "from-[#2ad17e]/20 to-[#20c997]/20"
                  },
                  {
                    title: "Interviews Completed", 
                    value: interviewDrives.reduce((sum, d) => sum + (d.completedInterviews || 0), 0),
                    icon: Activity,
                    color: "from-[#ffb21e] to-[#ff6b6b]",
                    bgColor: "from-[#ffb21e]/20 to-[#ff6b6b]/20"
                  },
                  {
                    title: "Candidates Hired",
                    value: candidates.filter(c => c.status === 'offer').length,
                    icon: Trophy,
                    color: "from-[#ff6b6b] to-[#ee5a24]",
                    bgColor: "from-[#ff6b6b]/20 to-[#ee5a24]/20"
                  }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.title}
                    className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/20 relative overflow-hidden"
                    variants={{
                      hidden: { opacity: 0, y: 40, scale: 0.9 },
                      visible: { opacity: 1, y: 0, scale: 1 }
                    }}
                    whileHover={{ 
                      y: -10, 
                      scale: 1.05,
                      boxShadow: "0 25px 50px rgba(255,255,255,0.1)"
                    }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {/* Background Pattern */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${metric.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}
                    />
                    
                    {/* Icon */}
                    <motion.div 
                      className="flex items-center justify-between mb-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                    >
                      <motion.div 
                        className={`p-4 bg-gradient-to-r ${metric.color} rounded-2xl relative`}
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                          scale: { duration: 2, repeat: Infinity, type: "tween" }
                        }}
                        whileHover={{ scale: 1.2 }}
                      >
                        <metric.icon className="w-6 h-6 text-white" />
                        
                        {/* Pulsing Ring */}
                        <motion.div 
                          className="absolute inset-0 rounded-2xl border-2 border-white/30"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                        />
                      </motion.div>
                      
                      {/* Trend Indicator */}
                      <motion.div
                        className="text-right"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4 + index * 0.1 }}
                      >
                        <TrendingUp className="w-5 h-5 text-[#2ad17e] ml-auto" />
                      </motion.div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 + index * 0.1 }}
                    >
                      <div className="text-sm text-white/70 mb-2 font-medium">{metric.title}</div>
                      <motion.div 
                        className="text-4xl font-bold text-white mb-1"
                        animate={{ 
                          scale: [1, 1.05, 1],
                          textShadow: [
                            "0px 0px 0px rgba(255,255,255,0)",
                            "0px 0px 20px rgba(255,255,255,0.3)",
                            "0px 0px 0px rgba(255,255,255,0)"
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity, type: "tween" }}
                      >
                        {metric.value}
                      </motion.div>
                    </motion.div>

                    {/* Hover Particles */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full"
                          style={{
                            left: `${20 + i * 30}%`,
                            top: `${30 + i * 20}%`,
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                            type: "tween"
                          }}
                        />
                      ))}
                    </motion.div>

                    {/* Corner Decoration */}
                    <motion.div 
                      className="absolute top-3 right-3 w-4 h-4 rounded-full bg-gradient-to-r from-white/20 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                ))}
              </motion.div>

            {/* Recent Drives Section */}
            <div className="bg-[color:var(--surface)] rounded-xl border border-[color:var(--border)]">
              <div className="flex items-center justify-between gap-3 p-6 border-b border-[color:var(--border)] flex-wrap">
                <h2 className="text-xl font-semibold text-[color:var(--foreground)]">Recent Drives</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpenCreateDrive}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#5b8cff] to-[#22d3ee] text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    New Drive
                  </button>
                  <button
                    onClick={() => setActiveTab('screenings')}
                    className="text-[color:var(--brand-start)] hover:text-[color:var(--brand-end)] text-sm font-medium"
                  >
                    View All Drives
                  </button>
                </div>
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
                        style={{ height: `${Math.max((item.value - 1 / Math.max(...candidates.map(c => 1)) * 80), 8)}px` }}
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
            </motion.div>
          )}
        </AnimatePresence>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1020]/95 via-[#10162a]/95 to-[#1a0f2e]/95 shadow-[0_40px_100px_rgba(9,12,24,0.65)]"
          >
            <div className="pointer-events-none absolute -top-20 -right-24 h-72 w-72 rounded-full bg-gradient-to-bl from-[#6f5af6]/50 via-[#5cd3ff]/20 to-transparent blur-3xl opacity-70" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-[#2ad17e]/40 via-[#ffb21e]/20 to-transparent blur-3xl opacity-60" />
            <div className="relative p-8 md:p-10">
              <button
                type="button"
                onClick={handleCloseCreateDrive}
                className="absolute right-4 top-4 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {driveCreationMode === 'selection' ? renderDriveTypeSelection() : renderDriveForm()}
            </div>
          </motion.div>
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