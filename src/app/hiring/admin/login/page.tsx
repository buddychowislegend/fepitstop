"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Shield, Lock, User } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fixed admin credentials
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "admin@hireog2025";
  // Admin key - use environment variable if available, otherwise use default
  const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "admin_key_hireog_secure_2025";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check credentials
    if (
      credentials.username === ADMIN_USERNAME &&
      credentials.password === ADMIN_PASSWORD
    ) {
      // Store authentication state
      localStorage.setItem("admin_authenticated", "true");
      localStorage.setItem("admin_user", credentials.username);
      localStorage.setItem("admin_key", ADMIN_KEY);

      // Redirect to admin dashboard
      router.push("/hiring/admin");
    } else {
      setError("Invalid username or password. Please try again.");
    }

    setLoading(false);
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md">
        <motion.div
          className="bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl ring-1 ring-white/10 border border-white/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-white/70">Hiring System Administration</p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter admin username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
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
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In to Admin Dashboard"
              )}
            </button>
          </form>

          {/* Back to Landing */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/hiring")}
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

