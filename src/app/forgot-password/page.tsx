"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(api('/auth/forgot-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to send reset link');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Back to Sign In */}
        <Link 
          href="/signin"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition"
        >
          <span>←</span>
          <span>Back to Sign In</span>
        </Link>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 ring-1 ring-white/15">
          {!success ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
                <p className="text-white/70 text-sm">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/15 ring-1 ring-red-400/30 text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-white/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              {/* Additional Help */}
              <div className="mt-6 text-center">
                <p className="text-sm text-white/60">
                  Remember your password?{' '}
                  <Link href="/signin" className="text-blue-300 hover:text-blue-200 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
                <p className="text-white/70 mb-6">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>

                <div className="bg-blue-500/10 rounded-lg p-4 ring-1 ring-blue-400/30 mb-6">
                  <p className="text-sm text-blue-200">
                    📧 The link will expire in 30 minutes. If you don't see the email, check your spam folder.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                    className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/15 font-medium transition"
                  >
                    Send Another Link
                  </button>
                  <Link
                    href="/signin"
                    className="block w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition text-center"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center text-xs text-white/50">
          <p>🔒 For security reasons, we don't disclose whether an email exists in our system.</p>
        </div>
      </div>
    </div>
  );
}
