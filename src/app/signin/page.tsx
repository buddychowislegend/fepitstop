"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Script from "next/script";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/problems");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      // Initialize Google Sign-In
      if (typeof window !== 'undefined' && window.google) {
        // Use the One Tap or Popup flow
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: async (response: any) => {
            try {
              console.log('Google callback received:', response);
              
                  const res = await fetch('/api/auth/google-exchange', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: response.credential }),
                  });

              const data = await res.json();
              console.log('API response:', data);

              if (data.success) {
                // Update auth context
                googleLogin(data.user, data.token);
                
                // Redirect to problems page
                router.push('/problems');
              } else {
                setError(data.error || 'Google sign-in failed');
              }
            } catch (err: any) {
              console.error('Google sign-in error:', err);
              setError(err.message || 'Google sign-in failed');
            } finally {
              setGoogleLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Use the popup flow for sign-in
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Try alternative sign-in method
            console.log('One Tap not available, trying popup');
            window.google.accounts.oauth2.initCodeClient({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
              scope: 'email profile',
              callback: async (response: any) => {
                try {
                  console.log('OAuth callback received:', response);
                  
                  // Exchange authorization code for token
                      const res = await fetch('/api/auth/google-exchange', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                          code: response.code,
                          type: 'oauth2'
                        }),
                      });

                  const data = await res.json();
                  console.log('API response:', data);

                  if (data.success) {
                    // Update auth context
                    googleLogin(data.user, data.token);
                    
                    // Redirect to problems page
                    router.push('/problems');
                  } else {
                    setError(data.error || 'Google sign-in failed');
                  }
                } catch (err: any) {
                  console.error('Google sign-in error:', err);
                  setError(err.message || 'Google sign-in failed');
                } finally {
                  setGoogleLoading(false);
                }
              },
            }).requestCode();
          }
        });
      } else {
        setError('Google Sign-In not loaded. Please refresh the page.');
        setGoogleLoading(false);
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Google sign-in failed');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-6">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold">Welcome Back</h1>
          <p className="mt-2 text-white/80">Sign in to continue your prep journey</p>
        </div>

        <div className="rounded-2xl bg-[color:var(--surface)] p-8 border border-[color:var(--border)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/15 ring-1 ring-rose-400/30 text-rose-200 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Password</label>
                <Link 
                  href="/forgot-password"
                  className="text-xs text-blue-300 hover:text-blue-200 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 rounded-md bg-white text-[#3a1670] font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-white/60">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="mt-4 w-full rounded-lg bg-white/10 px-4 py-3 font-medium text-white ring-1 ring-white/15 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {googleLoading ? "Signing in with Google..." : "Continue with Google"}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-white/70">
            Don't have an account?{" "}
            <Link href="/signup" className="text-white font-semibold hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
        </div>
      </div>

      {/* Google Sign-In Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={() => {
          console.log('Google Sign-In script loaded');
        }}
      />
    </div>
  );
}

