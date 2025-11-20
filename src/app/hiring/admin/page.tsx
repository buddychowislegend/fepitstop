"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  CreditCard,
  Users,
  Briefcase,
  UserCheck,
  TrendingUp,
  RefreshCw,
  X,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  LogOut,
} from "lucide-react";

interface Company {
  id: string;
  credits: number;
  totalCandidates: number;
  totalDrives: number;
  totalScreenings: number;
  candidatesInvited: number;
  candidatesShortlisted: number;
  completedInterviews: number;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Create company form state
  const [newCompany, setNewCompany] = useState({
    companyId: "",
    companyPassword: "",
    name: "",
    email: "",
    initialCredits: 1000,
  });

  // Recharge form state
  const [rechargeAmount, setRechargeAmount] = useState(0);

  // Get admin key from localStorage
  const getAdminKey = () => {
    return localStorage.getItem("admin_key") || process.env.NEXT_PUBLIC_ADMIN_KEY || "admin_key_hireog_secure_2025";
  };

  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://fepit.vercel.app";
      const adminKey = getAdminKey();
      const response = await fetch(`${backendUrl}/api/company/admin/companies`, {
        method: "GET",
        headers: {
          "X-Admin-Key": adminKey,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to load companies");
      }
    } catch (err) {
      console.error("Error loading companies:", err);
      setError("Failed to load companies. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem("admin_authenticated");
    if (authStatus !== "true") {
      router.push("/hiring/admin/login");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // Load companies when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCompanies();
    }
  }, [isAuthenticated, loadCompanies]);

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_key");
    router.push("/hiring/admin/login");
  };


  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newCompany.companyId || !newCompany.companyPassword) {
      setError("Company ID and password are required");
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://fepit.vercel.app";
      const adminKey = getAdminKey();
      const response = await fetch(`${backendUrl}/api/company/admin/companies`, {
        method: "POST",
        headers: {
          "X-Admin-Key": adminKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCompany),
      });

      if (response.ok) {
        const data = await response.json();
        // Show credentials in a more readable format
        const credentialsText = `Company created successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOGIN CREDENTIALS (for /hiring/signin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username (Email): ${data.credentials.username}
Password: ${data.credentials.password}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API CREDENTIALS (for API calls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Company ID: ${data.credentials.companyId}
Company Password: ${data.credentials.companyPassword}

⚠️ Please save these credentials securely!`;
        
        setSuccess(credentialsText);
        setNewCompany({
          companyId: "",
          companyPassword: "",
          name: "",
          email: "",
          initialCredits: 1000,
        });
        setShowCreateModal(false);
        loadCompanies();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create company");
      }
    } catch (err) {
      console.error("Error creating company:", err);
      setError("Failed to create company. Please try again.");
    }
  };

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedCompany || rechargeAmount <= 0) {
      setError("Please enter a valid credit amount");
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://fepit.vercel.app";
      const adminKey = getAdminKey();
      const response = await fetch(
        `${backendUrl}/api/company/admin/companies/${selectedCompany.id}/recharge`,
        {
          method: "POST",
          headers: {
            "X-Admin-Key": adminKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ credits: rechargeAmount }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuccess(
          `Credits recharged! Previous: ${data.company.previousCredits}, Added: ${data.company.creditsAdded}, New Total: ${data.company.newCredits}`
        );
        setRechargeAmount(0);
        setShowRechargeModal(false);
        setSelectedCompany(null);
        loadCompanies();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to recharge credits");
      }
    } catch (err) {
      console.error("Error recharging credits:", err);
      setError("Failed to recharge credits. Please try again.");
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.name && company.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <motion.header
        className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Building2 className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-white/60 text-sm">Company Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={loadCompanies}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </motion.button>
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                Create Company
              </motion.button>
              <motion.button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-200">{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-200">{success}</span>
              <button
                onClick={() => setSuccess("")}
                className="ml-auto text-green-400 hover:text-green-300"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Companies Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No companies found</p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Drives
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Candidates Invited
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Shortlisted
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Interviews
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCompanies.map((company, idx) => (
                    <motion.tr
                      key={company.id}
                      className="hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{company.id}</div>
                            {company.name && (
                              <div className="text-sm text-white/60">{company.name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-yellow-400" />
                          <span className="font-semibold text-yellow-400">
                            {company.credits.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-400" />
                          <span className="font-semibold">{company.totalDrives}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-4 h-4 text-green-400" />
                          <span className="font-semibold">{company.candidatesInvited}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <UserCheck className="w-4 h-4 text-purple-400" />
                          <span className="font-semibold">{company.candidatesShortlisted}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <TrendingUp className="w-4 h-4 text-cyan-400" />
                          <span className="font-semibold">{company.completedInterviews}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowRechargeModal(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Recharge
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Create Company Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl border border-white/10 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Create New Company</h2>
                  <p className="text-sm text-white/60 mt-1">Company will receive login credentials</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Company ID *
                  </label>
                  <input
                    type="text"
                    value={newCompany.companyId}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, companyId: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Company Password *
                  </label>
                  <input
                    type="password"
                    value={newCompany.companyPassword}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, companyPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional: Company display name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Email <span className="text-yellow-400">*</span>
                    <span className="text-xs text-white/60 ml-2">(Used as login username)</span>
                  </label>
                  <input
                    type="email"
                    value={newCompany.email}
                    onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="hr@company.com (required for login)"
                    required
                  />
                  <p className="text-xs text-white/60 mt-1">
                    If not provided, username will be: {newCompany.companyId || 'companyid'}@company.com
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Initial Credits
                  </label>
                  <input
                    type="number"
                    value={newCompany.initialCredits}
                    onChange={(e) =>
                      setNewCompany({
                        ...newCompany,
                        initialCredits: parseInt(e.target.value) || 1000,
                      })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recharge Credits Modal */}
      <AnimatePresence>
        {showRechargeModal && selectedCompany && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowRechargeModal(false);
              setSelectedCompany(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl border border-white/10 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recharge Credits</h2>
                <button
                  onClick={() => {
                    setShowRechargeModal(false);
                    setSelectedCompany(null);
                  }}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-6">
                <div className="text-white/60 text-sm mb-2">Company</div>
                <div className="text-white font-semibold text-lg">{selectedCompany.id}</div>
                <div className="text-white/60 text-sm mt-1">
                  Current Credits: <span className="text-yellow-400">{selectedCompany.credits}</span>
                </div>
              </div>
              <form onSubmit={handleRecharge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Credits to Add *
                  </label>
                  <input
                    type="number"
                    value={rechargeAmount || ""}
                    onChange={(e) => setRechargeAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    min="1"
                    required
                  />
                </div>
                {rechargeAmount > 0 && (
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-white/60 text-sm">New Total</div>
                    <div className="text-yellow-400 font-bold text-2xl">
                      {(selectedCompany.credits + rechargeAmount).toLocaleString()}
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRechargeModal(false);
                      setSelectedCompany(null);
                    }}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Recharge
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

