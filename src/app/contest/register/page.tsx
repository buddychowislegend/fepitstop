"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Trophy, Rocket, Users, Send, CheckCircle, XCircle, Linkedin, Facebook, Instagram } from "lucide-react";
import Image from "next/image";
import { api } from "@/lib/config";

export default function ContestRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    currentRole: "",
    yearsOfExperience: "",
    linkedinProfile: "",
    participationReason: "",
    agreedToTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Primary skills removed per request

  const roleOptions = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Scientist",
    "Machine Learning Engineer",
    "Product Manager",
    "UI/UX Designer",
    "Digital Marketer",
    "Business Analyst",
    "DevOps Engineer",
    "QA Engineer",
    "Other"
  ];

  const experienceOptions = [
    "0-1 years (Fresher)",
    "1-3 years",
    "3-5 years",
    "5-8 years",
    "8+ years"
  ];

  // Highest education removed per request

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Primary skills selection removed

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      agreedToTerms: e.target.checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(api('/contest/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          currentRole: formData.currentRole,
          yearsOfExperience: formData.yearsOfExperience,
          linkedinProfile: formData.linkedinProfile,
          participationReason: formData.participationReason,
          agreedToTerms: formData.agreedToTerms,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Registration successful! You will receive a confirmation email within 24 hours.'
        });
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            currentRole: "",
            yearsOfExperience: "",
            linkedinProfile: "",
            participationReason: "",
            agreedToTerms: false,
          });
        }, 2000);
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Registration failed. Please try again.'
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] relative overflow-hidden">
      {/* Animated Background with Geometric Pattern */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div 
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#5cd3ff]/20 to-[#6f5af6]/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: 360
          }}
          transition={{ 
            scale: { duration: 8, repeat: Infinity },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-[#5cd3ff]/30 to-[#6f5af6]/30 rounded-full blur-2xl"
          animate={{ 
            scale: [1.2, 1, 1.2]
          }}
          transition={{ 
            scale: { duration: 6, repeat: Infinity }
          }}
        />

        {/* Circuit Board Pattern */}
        <div className="absolute inset-0 opacity-15">
          <svg width="100%" height="100%" className="absolute inset-0" preserveAspectRatio="none">
            <defs>
              <pattern id="circuit-pattern-register" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="50" cy="10" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="90" cy="10" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="130" cy="10" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <circle cx="170" cy="10" r="1.5" fill="#5cd3ff" opacity="0.4" />
                <path d="M 10 10 L 50 10 L 50 50 L 90 50" stroke="#5cd3ff" strokeWidth="0.5" fill="none" opacity="0.15" />
                <path d="M 130 10 L 170 10 L 170 50 L 130 50" stroke="#5cd3ff" strokeWidth="0.5" fill="none" opacity="0.15" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit-pattern-register)" />
          </svg>
        </div>

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#5cd3ff]/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <motion.header 
          className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="text-2xl font-bold text-white uppercase tracking-wider cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/contest')}
          >
            PORTAL
          </motion.div>
          <motion.button
            onClick={() => router.push('/contest')}
            className="px-6 py-2 rounded-lg border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Contest
          </motion.button>
        </motion.header>

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-12 text-center relative">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              ENTER THE{' '}
              <span className="bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] bg-clip-text text-transparent">
                COMPETITION
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Register now for India's first interview competition. Showcase your skills, win amazing prizes, and fast-track your career.
            </motion.p>
          </motion.div>
        </section>

        {/* REGISTRATION FORM SECTION */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">Join the Arena</h2>
              <p className="text-white/80 text-lg">
                Fill out the form below to secure your spot in India's premier interview competition
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              {/* Two Column Fields */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#5cd3ff] focus:ring-2 focus:ring-[#5cd3ff]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#5cd3ff] focus:ring-2 focus:ring-[#5cd3ff]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#5cd3ff] focus:ring-2 focus:ring-[#5cd3ff]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#5cd3ff] focus:ring-2 focus:ring-[#5cd3ff]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Current Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="currentRole"
                    value={formData.currentRole}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#5cd3ff] focus:ring-2 focus:ring-[#5cd3ff]/50 transition-all"
                  >
                    <option value="">Select your current role</option>
                    {roleOptions.map(role => (
                      <option key={role} value={role} className="bg-gray-900">{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Years of Experience
                  </label>
                  <select
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#5cd3ff] focus:ring-2 focus:ring-[#5cd3ff]/50 transition-all"
                  >
                    <option value="">Select experience level</option>
                    {experienceOptions.map(exp => (
                      <option key={exp} value={exp} className="bg-gray-900">{exp}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Primary skills removed per request */}

              {/* Full Width Fields */}
              <div className="space-y-6 mb-6">
                {/* Highest education removed per request */}
         
        
              </div>

              {/* Terms and Conditions */}
              <div className="mb-8">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={handleTermsChange}
                    required
                    className="mt-1 w-4 h-4 rounded bg-white/10 border-white/20 text-[#5cd3ff] focus:ring-[#5cd3ff] focus:ring-2"
                  />
                  <span className="text-white/80 text-sm group-hover:text-white transition-colors">
                    I agree to the{' '}
                    <a href="/terms" className="text-[#5cd3ff] hover:underline">Terms and Conditions</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-[#5cd3ff] hover:underline">Privacy Policy</a>.
                    I understand that this is a competitive event and my participation data may be used for evaluation purposes.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] text-white font-bold text-lg uppercase tracking-wide hover:opacity-90 transition-opacity shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    Register
                    <Send className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {/* Status Message */}
              {submitStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                    submitStatus.type === 'success'
                      ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                      : 'bg-red-500/20 border border-red-500/50 text-red-400'
                  }`}
                >
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <span>{submitStatus.message}</span>
                </motion.div>
              )}

              {/* Registration Info */}
              <p className="text-white/60 text-sm text-center mt-6">
                Registration is completely free. You'll receive a confirmation email within 24 hours.
              </p>
            </form>
          </motion.div>
        </section>

        {/* WHY REGISTER SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <motion.h2 
            className="text-5xl font-bold text-white text-center mb-12"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Why Register?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Trophy className="w-8 h-8" />,
                title: "Win Amazing Prizes",
                description: "Get your hands on the latest gadgets, cash prizes, and exclusive merchandise worth ₹10L+"
              },
              {
                icon: <Rocket className="w-8 h-8" />,
                title: "Fast-Track Your Career",
                description: "Skip the first round at 50+ partner companies and get direct access to final interviews"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Network with the Best",
                description: "Connect with industry leaders, top performers, and like-minded professionals"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center hover:border-[#5cd3ff]/50 transition-all duration-300"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <motion.div 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] flex items-center justify-center text-white mx-auto mb-6"
                  animate={{ 
             
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
        {/* FOOTER */}
        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="text-2xl font-bold text-white uppercase tracking-wider mb-2">
                HIREOG
              </div>
              <p className="text-white/70 text-sm">India's Premier Interview Competition.</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
              <div className="flex gap-6">
                {[
                  { icon: Linkedin, href: "https://www.linkedin.com/company/hireog" },
                  { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61582513187245" },
                  { icon: Instagram, href: "https://www.instagram.com/hireog_com" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="text-white/60 hover:text-white transition-colors"
                    target="_blank" rel="noopener noreferrer"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
              <p className="text-white/50 text-xs text-center md:text-right">
                © 2025 HIREOG. All rights reserved. Let the games begin.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

