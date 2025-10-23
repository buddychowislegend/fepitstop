"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function CompanyLogin() {
  const [credentials, setCredentials] = useState({
    companyId: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simple authentication for demo
    if (credentials.companyId === "hireog" && credentials.password === "manasi22") {
      // Store company session
      localStorage.setItem("companyAuth", "true");
      localStorage.setItem("companyId", credentials.companyId);
      router.push("/hiring/dashboard");
    } else {
      setError("Invalid company credentials");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1720] via-[#1a1a2e] to-[#16213e] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logo-simple.svg" alt="HireOG" width={48} height={48} />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              HireOG
            </span>
          </Link>
          <p className="mt-2 text-white/60">Company Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Company Login
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="companyId" className="block text-sm font-medium text-white/80 mb-2">
                Company ID
              </label>
              <input
                id="companyId"
                type="text"
                value={credentials.companyId}
                onChange={(e) => setCredentials({ ...credentials, companyId: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter company ID"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

        </div>

        {/* Back to main site */}

      
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            ← Back to HireOG
          </Link>
        </div>
      </div>
    </div>
  );
}
