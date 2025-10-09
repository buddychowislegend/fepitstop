"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/config";

type AnalyticsSummary = {
  totalViews: number;
  uniqueVisitors: number;
  avgTimeSpent: number;
  topPages: Array<{
    path: string;
    views: number;
    uniqueVisitors: number;
  }>;
  dateRange: {
    start: string;
    end: string;
  };
};

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [days, setDays] = useState(7);

  const ADMIN_PASSWORD = "manasi22";
  const ADMIN_API_KEY = "admin_key_frontendpitstop_secure_2025";

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch(api(`/analytics/summary?days=${days}`), {
        headers: {
          'X-Admin-Key': ADMIN_API_KEY
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if authenticated in session
    const isAuth = sessionStorage.getItem('fp_analytics_auth') === 'true';
    if (isAuth) {
      setAuthenticated(true);
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchAnalytics();
    }
  }, [days]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem('fp_analytics_auth', 'true');
      fetchAnalytics();
    } else {
      setError('Incorrect password');
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 ring-1 ring-white/15">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-white/70 text-sm">
                Enter password to view analytics
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/15 ring-1 ring-red-400/30 text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-white/40"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Verifying...' : 'Access Analytics'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">📊 Analytics Dashboard</h1>
            <p className="mt-2 text-white/80">Track visitor behavior and site performance</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-4 py-2 rounded-lg bg-white/10 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
            >
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button
              onClick={() => {
                sessionStorage.removeItem('fp_analytics_auth');
                setAuthenticated(false);
                setPassword("");
                setSummary(null);
              }}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {summary && (
          <>
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-6 ring-1 ring-blue-400/20">
                <h3 className="text-sm uppercase tracking-wide text-blue-300">Total Page Views</h3>
                <p className="mt-2 text-4xl font-extrabold">{summary.totalViews.toLocaleString()}</p>
                <p className="mt-1 text-sm text-blue-200/80">All page visits</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 p-6 ring-1 ring-emerald-400/20">
                <h3 className="text-sm uppercase tracking-wide text-emerald-300">Unique Visitors</h3>
                <p className="mt-2 text-4xl font-extrabold">{summary.uniqueVisitors.toLocaleString()}</p>
                <p className="mt-1 text-sm text-emerald-200/80">Different sessions</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-6 ring-1 ring-purple-400/20">
                <h3 className="text-sm uppercase tracking-wide text-purple-300">Avg Time Spent</h3>
                <p className="mt-2 text-4xl font-extrabold">{formatTime(summary.avgTimeSpent)}</p>
                <p className="mt-1 text-sm text-purple-200/80">Per page visit</p>
              </div>
            </div>

            {/* Top Pages */}
            <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
              <h2 className="text-2xl font-bold mb-6">📈 Most Visited Pages</h2>
              <div className="space-y-3">
                {summary.topPages.map((page, index) => (
                  <div
                    key={page.path}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className={`text-2xl font-bold ${
                        index === 0 ? 'text-amber-300' :
                        index === 1 ? 'text-gray-300' :
                        index === 2 ? 'text-orange-400' :
                        'text-white/60'
                      }`}>
                        #{index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{page.path}</div>
                        <div className="text-xs text-white/60 mt-1">
                          {page.uniqueVisitors} unique visitor{page.uniqueVisitors !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-300">{page.views}</div>
                      <div className="text-xs text-white/60">views</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range Info */}
            <div className="mt-6 text-center text-sm text-white/60">
              <p>
                Data from {new Date(summary.dateRange.start).toLocaleDateString()} to{' '}
                {new Date(summary.dateRange.end).toLocaleDateString()}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
