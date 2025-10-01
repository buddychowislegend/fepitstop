"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  
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
    if (!token) {
      router.push("/signin");
      return;
    }

    // Fetch profile
    fetch(`${API_URL}/auth/me`, {
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

    // Fetch activity
    fetch(`${API_URL}/auth/activity`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setActivities(data.activities || []))
      .catch(() => {});
  }, [token, router]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
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
      const res = await fetch(`${API_URL}/auth/password`, {
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
      const res = await fetch(`${API_URL}/auth/account`, {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white flex items-center justify-center">
        <p>Please sign in to view your profile</p>
      </div>
    );
  }

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
          <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
            <h3 className="text-sm uppercase tracking-wide text-white/60">Problems Solved</h3>
            <p className="mt-2 text-4xl font-extrabold">{profile.totalSolved || 0}</p>
            <p className="mt-1 text-sm text-white/70">Keep practicing!</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
            <h3 className="text-sm uppercase tracking-wide text-white/60">Current Streak</h3>
            <p className="mt-2 text-4xl font-extrabold">{profile.streak || 0} days</p>
            <p className="mt-1 text-sm text-white/70">{profile.streak > 0 ? "🔥 On fire!" : "Start your streak!"}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
            <h3 className="text-sm uppercase tracking-wide text-white/60">Global Rank</h3>
            <p className="mt-2 text-4xl font-extrabold">#{profile.rank || "—"}</p>
            <p className="mt-1 text-sm text-white/70">Keep climbing!</p>
          </div>
        </div>

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

