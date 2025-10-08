"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { api } from "@/lib/config";

export default function ProfilePage() {
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Submissions and solved problems
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<any[]>([]);
  const [totalProblems, setTotalProblems] = useState(100);
  
  // Ranking and quiz stats
  const [rankInfo, setRankInfo] = useState<any>(null);
  const [quizStats, setQuizStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  
  // Activity
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Redirect if not authenticated
    if (!token || !user) {
      router.push("/signin");
      return;
    }

    // Fetch profile
    fetch(api(`/auth/me`), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.user);
        setName(data.user.name || "");
        setBio(data.user.bio || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch submissions
    fetch(api(`/submissions/user`), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data.submissions || []);
        
        // Get unique solved problems
        const uniqueSolved = new Set(data.submissions?.map((s: any) => s.problemId) || []);
        
        // Fetch problem details for solved problems
        if (uniqueSolved.size > 0) {
          fetch(api(`/problems`))
            .then((res) => res.json())
            .then((problemsData) => {
              const solved = (problemsData.problems || []).filter((p: any) => 
                uniqueSolved.has(p.id)
              );
              setSolvedProblems(solved);
              setTotalProblems(problemsData.problems?.length || 100);
            });
        } else {
          fetch(api(`/problems`))
            .then((res) => res.json())
            .then((problemsData) => {
              setTotalProblems(problemsData.problems?.length || 100);
            });
        }
      })
      .catch(() => {});

    // Fetch activity
    fetch(api(`/auth/activity`), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setActivities(data.activities || []))
      .catch(() => {});

    // Fetch quiz stats
    fetch(api(`/quiz/stats`), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setQuizStats(data.stats))
      .catch(() => {});

    // Fetch leaderboard
    fetch(api(`/quiz/leaderboard?limit=10`))
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(() => {});
  }, [token, user, authLoading, router]);

  // Calculate rank when component mounts or when submissions/quiz stats change
  useEffect(() => {
    if (!token || !user) return;

    fetch(api(`/auth/rank`), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
    })
      .then((res) => res.json())
      .then((data) => setRankInfo(data.rankInfo))
      .catch(() => {});
  }, [token, user, submissions.length, quizStats]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);

    try {
      const res = await fetch(api(`/auth/profile`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio }),
      });

      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setEditing(false);
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!token) return;
    setPasswordError("");

    try {
      const res = await fetch(api(`/auth/password`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowPasswordChange(false);
        setCurrentPassword("");
        setNewPassword("");
        alert("Password changed successfully!");
      } else {
        setPasswordError(data.error || "Failed to change password");
      }
    } catch (error) {
      setPasswordError("Server error");
    }
  };

  const handleDeleteAccount = async () => {
    if (!token) return;
    setDeleteError("");

    try {
      const res = await fetch(api(`/auth/account`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();
      if (res.ok) {
        logout();
        router.push("/");
      } else {
        setDeleteError(data.error || "Failed to delete account");
      }
    } catch (error) {
      setDeleteError("Server error");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Please sign in to view your profile</p>
          <Link href="/signin" className="px-4 py-2 rounded-lg bg-white text-[#3a1670] font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const solvedCount = solvedProblems.length;
  const solvedPercentage = totalProblems > 0 ? (solvedCount / totalProblems * 100).toFixed(1) : 0;
  
  // Calculate difficulty breakdown
  const easyCount = solvedProblems.filter(p => p.difficulty === 'Easy').length;
  const mediumCount = solvedProblems.filter(p => p.difficulty === 'Medium').length;
  const hardCount = solvedProblems.filter(p => p.difficulty === 'Hard').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-extrabold">My Profile</h1>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 text-sm font-medium"
          >
            Logout
          </button>
        </div>

        {/* Profile Card */}
        <div className="mt-8 rounded-2xl bg-white/10 p-8 ring-1 ring-white/15">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg bg-white/10 px-4 py-2 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full rounded-lg bg-white/10 px-4 py-2 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 rounded-md bg-white text-[#3a1670] font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setName(profile.name);
                        setBio(profile.bio || "");
                      }}
                      className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-white/70 text-sm">{profile.email}</p>
                  {profile.bio && <p className="mt-3 text-white/80">{profile.bio}</p>}
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-4 px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 text-sm"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 p-6 ring-1 ring-emerald-400/20">
            <h3 className="text-sm uppercase tracking-wide text-emerald-300">Problems Solved</h3>
            <p className="mt-2 text-4xl font-extrabold">{solvedCount}/{totalProblems}</p>
            <p className="mt-1 text-sm text-emerald-200/80">{solvedPercentage}% complete</p>
            <div className="mt-3 w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${solvedPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-6 ring-1 ring-blue-400/20">
            <h3 className="text-sm uppercase tracking-wide text-blue-300">Current Streak</h3>
            <p className="mt-2 text-4xl font-extrabold">{profile.streak || 0} days</p>
            <p className="mt-1 text-sm text-blue-200/80">{profile.streak > 0 ? "🔥 On fire!" : "Start your streak!"}</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-6 ring-1 ring-purple-400/20">
            <h3 className="text-sm uppercase tracking-wide text-purple-300">Total Submissions</h3>
            <p className="mt-2 text-4xl font-extrabold">{submissions.length}</p>
            <p className="mt-1 text-sm text-purple-200/80">Attempts made</p>
          </div>
        </div>

        {/* Ranking Section */}
        {rankInfo && (
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-6 ring-1 ring-amber-400/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">🏆 Your Rank</h2>
              <span className="text-3xl font-extrabold text-amber-300">#{rankInfo.rank}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-300">{rankInfo.totalScore}</div>
                <div className="text-xs text-white/60 mt-1">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-300">{rankInfo.problemsSolved}</div>
                <div className="text-xs text-white/60 mt-1">Problems</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300">{rankInfo.quizzesTaken}</div>
                <div className="text-xs text-white/60 mt-1">Quizzes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">{rankInfo.quizAverageScore}%</div>
                <div className="text-xs text-white/60 mt-1">Quiz Avg</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-white/70">
              <p>💡 Earn points by solving problems (10 pts each) and completing quizzes (5 pts + accuracy bonus)</p>
            </div>
          </div>
        )}

        {/* Quiz Stats */}
        {quizStats && quizStats.totalQuizzes > 0 && (
          <div className="mt-8 rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
            <h2 className="text-xl font-bold mb-4">📝 Quiz Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{quizStats.totalQuizzes}</div>
                <div className="text-sm text-white/60 mt-1">Quizzes Taken</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">{quizStats.averageScore}%</div>
                <div className="text-sm text-white/60 mt-1">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">{quizStats.averageRating.toFixed(1)}⭐</div>
                <div className="text-sm text-white/60 mt-1">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{quizStats.totalQuestions}</div>
                <div className="text-sm text-white/60 mt-1">Questions Answered</div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="mt-8 rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
            <h2 className="text-xl font-bold mb-4">🏆 Top 10 Leaderboard</h2>
            <div className="space-y-2">
              {leaderboard.map((leader: any, index: number) => (
                <div
                  key={leader.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition ${
                    leader.id === user?.id
                      ? 'bg-amber-500/20 ring-1 ring-amber-400/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-bold ${
                      index === 0 ? 'text-amber-300' :
                      index === 1 ? 'text-gray-300' :
                      index === 2 ? 'text-orange-400' :
                      'text-white/60'
                    }`}>
                      #{index + 1}
                    </span>
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                      {leader.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{leader.name}</div>
                      <div className="text-xs text-white/60">
                        {leader.totalSolved || 0} problems • {leader.totalQuizzesTaken || 0} quizzes
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-amber-300">{leader.rankScore || 0}</div>
                    <div className="text-xs text-white/60">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty Breakdown */}
        <div className="mt-8 rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
          <h2 className="text-xl font-bold mb-4">Solved by Difficulty</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{easyCount}</div>
              <div className="text-sm text-white/60 mt-1">Easy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{mediumCount}</div>
              <div className="text-sm text-white/60 mt-1">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-rose-400">{hardCount}</div>
              <div className="text-sm text-white/60 mt-1">Hard</div>
            </div>
          </div>
        </div>

        {/* Solved Problems List */}
        {solvedProblems.length > 0 && (
          <div className="mt-8 rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
            <h2 className="text-xl font-bold mb-4">Recently Solved Problems</h2>
            <div className="space-y-2">
              {solvedProblems.slice(0, 10).map((problem: any) => (
                <Link
                  key={problem.id}
                  href={`/problems/${problem.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">✓</span>
                    <span className="font-medium">{problem.title}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    problem.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-300' :
                    problem.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-rose-500/20 text-rose-300'
                  }`}>
                    {problem.difficulty}
                  </span>
                </Link>
              ))}
            </div>
            {solvedProblems.length > 10 && (
              <div className="mt-4 text-center">
                <Link href="/problems" className="text-sm text-blue-300 hover:text-blue-200">
                  View all {solvedProblems.length} solved problems →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Account Info */}
        <div className="mt-8 rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Member Since:</span>
              <span className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Email:</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Account ID:</span>
              <span className="font-mono text-xs text-white/60">{profile.id}</span>
            </div>
          </div>
        </div>

        {/* Activity History */}
        <div className="mt-8 rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          {activities.length === 0 ? (
            <p className="text-white/60 text-sm">No activity yet. Start solving problems!</p>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 10).map((activity: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0f131a]">
                  <div>
                    <p className="font-semibold text-sm">{activity.action}</p>
                    <p className="text-xs text-white/60">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                  {activity.points && (
                    <span className="text-sm text-[#2ad17e]">+{activity.points} pts</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="mt-8 rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
          <h2 className="text-xl font-bold mb-4">Security</h2>
          
          {/* Change Password */}
          {!showPasswordChange ? (
            <button
              onClick={() => setShowPasswordChange(true)}
              className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 text-sm"
            >
              Change Password
            </button>
          ) : (
            <div className="space-y-4 max-w-md">
              {passwordError && (
                <div className="p-3 rounded-lg bg-rose-500/15 ring-1 ring-rose-400/30 text-rose-200 text-sm">
                  {passwordError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg bg-white/10 px-4 py-2 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg bg-white/10 px-4 py-2 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                  minLength={6}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordChange}
                  className="px-4 py-2 rounded-md bg-white text-[#3a1670] font-semibold hover:opacity-90"
                >
                  Update Password
                </button>
                <button
                  onClick={() => {
                    setShowPasswordChange(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setPasswordError("");
                  }}
                  className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="mt-8 rounded-2xl bg-rose-500/10 p-6 ring-1 ring-rose-400/30">
          <h2 className="text-xl font-bold mb-2 text-rose-200">Danger Zone</h2>
          <p className="text-sm text-white/70 mb-4">Once you delete your account, there is no going back.</p>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-4 max-w-md">
              {deleteError && (
                <div className="p-3 rounded-lg bg-rose-500/15 ring-1 ring-rose-400/30 text-rose-200 text-sm">
                  {deleteError}
                </div>
              )}
              <p className="text-sm font-semibold text-rose-200">Are you absolutely sure?</p>
              <div>
                <label className="block text-sm font-medium mb-2">Enter your password to confirm</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full rounded-lg bg-white/10 px-4 py-2 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Your password"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                >
                  Yes, Delete My Account
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                  className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

