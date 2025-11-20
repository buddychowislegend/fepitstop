"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HiringSignIn() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Configured credentials for hiring module (multi-company)
  const validUsers: Array<{ username: string; password: string; companyId: string; companyPassword: string }> = [
    { username: "admin@hireog.com", password: "hireog123", companyId: "hireog", companyPassword: "manasi22" },
    // New company user
    { username: "hr@xtremesolution.in", password: "Xtreme@2025!", companyId: "xtremesolution", companyPassword: "Xtreme@2025!" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First check hardcoded users (for backward compatibility)
      const matched = validUsers.find(u => u.username === credentials.username && u.password === credentials.password);
      if (matched) {
        localStorage.setItem('hiring_authenticated', 'true');
        localStorage.setItem('hiring_user', matched.username);
        localStorage.setItem('hiring_company_id', matched.companyId);
        localStorage.setItem('hiring_company_password', matched.companyPassword);
        router.push('/hiring/dashboard');
        setLoading(false);
        return;
      }

      // If not in hardcoded list, verify with backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      const response = await fetch(`${backendUrl}/api/company/verify-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          localStorage.setItem('hiring_authenticated', 'true');
          localStorage.setItem('hiring_user', data.username || credentials.username);
          localStorage.setItem('hiring_company_id', data.companyId);
          localStorage.setItem('hiring_company_password', data.companyPassword);
          router.push('/hiring/dashboard');
        } else {
          setError("Invalid username or password. Please try again.");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Invalid username or password. Please try again.");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Failed to connect to server. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md">
        <motion.div 
          className="bg-[#0f1720] rounded-2xl p-8 shadow-2xl ring-1 ring-white/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">HireOG</h1>
            <p className="text-white/70">Hiring Dashboard Access</p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-2">
                Username
              </label>
              <input
                type="email"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#5b8cff] focus:border-transparent transition"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#5b8cff] focus:border-transparent transition"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <motion.div 
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5b8cff] text-white py-3 rounded-lg font-semibold hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>


          {/* Back to Landing */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/hiring')}
              className="text-white/60 hover:text-white transition text-sm"
            >
              ← Back to Hiring Page
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
