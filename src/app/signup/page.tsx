"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/config";

type SignupStep = 'email' | 'otp' | 'password';

export default function SignUpPage() {
  const [step, setStep] = useState<SignupStep>('email');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();
  
  // Refs for OTP inputs
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(api('/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSuccess(`Verification code sent to ${email}! Please check your inbox and spam folder.`);
      
      setStep('otp');
      setResendTimer(60); // 60 second cooldown
      
      // Focus first OTP input
      setTimeout(() => otpInputs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
    
    // Focus last filled input or first empty
    const nextIndex = Math.min(pastedData.length, 5);
    otpInputs.current[nextIndex]?.focus();
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setStep('password');
    setSuccess('Email verified! Now create your password.');
  };

  // Step 3: Complete signup with password
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const otpCode = otp.join('');
      const res = await fetch(api('/auth/verify-otp-and-signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode, password })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store token and user
      localStorage.setItem('fp_token', data.token);
      localStorage.setItem('fp_user', JSON.stringify(data.user));
      
      // Redirect to problems
      router.push("/problems");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(api('/auth/resend-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setSuccess('New verification code sent! Please check your inbox and spam folder.');
      
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      otpInputs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold">Create Account</h1>
          <p className="mt-2 text-white/80">Join thousands preparing for frontend interviews</p>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className={`h-2 w-16 rounded-full transition ${step === 'email' ? 'bg-white' : step === 'otp' || step === 'password' ? 'bg-green-400' : 'bg-white/20'}`}></div>
            <div className={`h-2 w-16 rounded-full transition ${step === 'otp' ? 'bg-white' : step === 'password' ? 'bg-green-400' : 'bg-white/20'}`}></div>
            <div className={`h-2 w-16 rounded-full transition ${step === 'password' ? 'bg-white' : 'bg-white/20'}`}></div>
          </div>
          <p className="mt-2 text-xs text-white/60">
            Step {step === 'email' ? '1' : step === 'otp' ? '2' : '3'} of 3
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-8 ring-1 ring-white/15">
          {/* Messages */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/15 ring-1 ring-rose-400/30 text-rose-200 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-400/30 text-emerald-200 text-sm">
              {success}
            </div>
          )}

          {/* Step 1: Email and Name */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="you@example.com"
                  required
                />
                <p className="mt-1 text-xs text-white/60">We'll send a verification code to this email</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-5 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? "Sending code..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-center">Enter Verification Code</label>
                <p className="text-xs text-white/60 text-center mb-4">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
                
                <div className="flex gap-2 justify-center" onPaste={handleOTPPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-lg bg-white/10 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || loading}
                    className="text-sm text-blue-300 hover:text-blue-200 disabled:text-white/40 disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 
                      ? `Resend code in ${resendTimer}s` 
                      : 'Resend verification code'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 px-5 py-3 rounded-lg bg-white/10 hover:bg-white/15 font-medium transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={otp.join('').length !== 6}
                  className="flex-1 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition"
                >
                  Verify Code
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Password */}
          {step === 'password' && (
            <form onSubmit={handleCompleteSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Create Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <p className="mt-1 text-xs text-white/60">At least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('otp')}
                  className="flex-1 px-5 py-3 rounded-lg bg-white/10 hover:bg-white/15 font-medium transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition"
                >
                  {loading ? "Creating account..." : "Complete Signup"}
                </button>
              </div>
            </form>
          )}

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link href="/signin" className="text-white font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

