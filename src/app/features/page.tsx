"use client";
import Link from "next/link";
import { useState } from "react";

type Feature = {
  icon: string;
  title: string;
  description: string;
  highlight: boolean;
  badge?: string | null;
};

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<'free' | 'pro'>('pro');

  const freeFeatures: Feature[] = [
    {
      icon: "📝",
      title: "100 Interview Questions",
      description: "Access to carefully curated frontend interview questions covering HTML, CSS, JavaScript basics, and sample React problems.",
      highlight: false,
      badge: null
    },
    {
      icon: "💻",
      title: "Interactive Code Editor",
      description: "Write and test your code directly in the browser with our Monaco editor (same as VS Code).",
      highlight: false,
      badge: null
    },
    {
      icon: "✅",
      title: "Basic Test Cases",
      description: "Validate your solutions with fundamental test cases to ensure correctness.",
      highlight: false,
      badge: null
    },
    {
      icon: "🏆",
      title: "Public Leaderboard",
      description: "Compete with other developers and track your progress on our global leaderboard.",
      highlight: false,
      badge: null
    },
    {
      icon: "📧",
      title: "Daily Question via Email",
      description: "Receive a new interview question every day to keep your skills sharp.",
      highlight: false,
      badge: null
    },
    {
      icon: "📚",
      title: "Blog Articles & Guides",
      description: "Access our library of tutorials, interview tips, and preparation guides.",
      highlight: false,
      badge: null
    },
    {
      icon: "👥",
      title: "Community Access",
      description: "Join discussions, ask questions, and learn from other developers.",
      highlight: false,
      badge: null
    }
  ];

  const proFeatures: Feature[] = [
    {
      icon: "🚀",
      title: "1000+ Interview Questions",
      description: "10x more questions than free tier! Comprehensive coverage of all frontend topics from basic to advanced.",
      highlight: true,
      badge: "10x More"
    },
    {
      icon: "📚",
      title: "Structured Prep Roadmap",
      description: "Follow our proven learning path: HTML → CSS → JavaScript → React → System Design. Know exactly what to study and when.",
      highlight: true,
      badge: "Exclusive"
    },
    {
      icon: "🎯",
      title: "Topic-based Mock Tests",
      description: "Take timed mock tests on specific topics. Simulate real interview conditions and identify weak areas.",
      highlight: true,
      badge: "New"
    },
    {
      icon: "🎥",
      title: "Solution Videos & Explanations",
      description: "Watch detailed video explanations for every problem. Understand multiple approaches and best practices.",
      highlight: true,
      badge: "Premium"
    },
    {
      icon: "📄",
      title: "Downloadable PDFs & Cheat Sheets",
      description: "Download comprehensive PDFs, quick reference guides, and cheat sheets for offline study.",
      highlight: true,
      badge: "Exclusive"
    },
    {
      icon: "💬",
      title: "Priority Discord/Slack Access",
      description: "Get faster responses in our premium community channels. Network with other serious learners.",
      highlight: true,
      badge: "Priority"
    },
    {
      icon: "⏱️",
      title: "Interview Simulator",
      description: "Practice with time constraints just like real interviews. Build speed and confidence under pressure.",
      highlight: true,
      badge: "Pro Only"
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "Track your progress with detailed analytics. See your strengths, weaknesses, and improvement over time.",
      highlight: true,
      badge: "Premium"
    },
    {
      icon: "🏆",
      title: "Pro Badge & Profile",
      description: "Stand out with a Pro badge on your profile. Showcase your commitment to learning.",
      highlight: false,
      badge: null
    },
    {
      icon: "⚡",
      title: "Priority Support",
      description: "Get faster responses to your queries. Direct access to our support team.",
      highlight: true,
      badge: "Priority"
    },
    {
      icon: "🎯",
      title: "Company-Specific Questions",
      description: "Filter questions by company (Google, Meta, Amazon, etc.). Prepare for your target company.",
      highlight: true,
      badge: "Exclusive"
    },
    {
      icon: "📈",
      title: "Progress Tracking",
      description: "Visualize your learning journey with detailed progress reports and achievement milestones.",
      highlight: false,
      badge: null
    }
  ];

  const addOns = [
    {
      icon: "🎥",
      title: "1:1 Mock Interview",
      price: "₹999",
      duration: "45 minutes",
      description: "Live mock interview with experienced frontend developers from top companies.",
      features: [
        "Real interview environment",
        "Detailed feedback report",
        "Personalized improvement tips",
        "Session recording for review",
        "Follow-up Q&A session"
      ]
    },
    {
      icon: "📄",
      title: "Resume & LinkedIn Review",
      price: "₹999",
      duration: "30-45 minutes",
      description: "Professional review and optimization of your resume and LinkedIn profile.",
      features: [
        "Detailed resume analysis",
        "ATS optimization tips",
        "LinkedIn profile review",
        "Industry-specific suggestions",
        "Before/after comparison"
      ]
    },
    {
      icon: "💻",
      title: "Personal Project Review",
      price: "₹1,499",
      duration: "60 minutes",
      description: "In-depth code review and feedback on your portfolio project.",
      features: [
        "Architecture feedback",
        "Code quality analysis",
        "Best practices suggestions",
        "Performance optimization",
        "Deployment guidance"
      ]
    },
    {
      icon: "🚀",
      title: "Career Roadmap Consultation",
      price: "₹1,999",
      duration: "90 minutes",
      description: "Personalized career guidance and learning path planning.",
      features: [
        "Skill gap analysis",
        "Personalized learning path",
        "Company-specific prep strategy",
        "Salary negotiation tips",
        "Long-term career planning"
      ]
    }
  ];

  const comparisons = [
    {
      feature: "Interview Questions",
      free: "100 questions",
      pro: "1000+ questions",
      highlight: true
    },
    {
      feature: "Structured Roadmap",
      free: "❌",
      pro: "✅ Complete path",
      highlight: true
    },
    {
      feature: "Solution Videos",
      free: "❌",
      pro: "✅ All questions",
      highlight: true
    },
    {
      feature: "Mock Tests",
      free: "❌",
      pro: "✅ Unlimited",
      highlight: true
    },
    {
      feature: "Downloadable PDFs",
      free: "❌",
      pro: "✅ Full library",
      highlight: true
    },
    {
      feature: "Interview Simulator",
      free: "❌",
      pro: "✅ Time-based",
      highlight: true
    },
    {
      feature: "Priority Support",
      free: "❌",
      pro: "✅ Fast response",
      highlight: false
    },
    {
      feature: "Advanced Analytics",
      free: "Basic",
      pro: "✅ Detailed insights",
      highlight: false
    },
    {
      feature: "Community Access",
      free: "✅ Public",
      pro: "✅ Priority channels",
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-7xl">
        <div className="card p-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
            <div className="relative text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6">
            Everything You Need to
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ace Frontend Interviews
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-10">
            From 100 free questions to 1000+ premium resources, structured roadmaps, and personalized mentorship. 
            Choose the plan that fits your goals.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/pricing"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-4 rounded-lg font-semibold text-lg transition"
            >
              View Pricing
            </Link>
            <Link
              href="/problems"
              className="bg-white/10 hover:bg-white/20 px-8 py-4 rounded-lg font-semibold text-lg transition"
            >
              Try Free
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-center mb-12">
          <div className="bg-[color:var(--surface)] rounded-lg p-1 inline-flex border border-[color:var(--border)]">
            <button
              onClick={() => setActiveTab('free')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'free'
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Free Features
            </button>
            <button
              onClick={() => setActiveTab('pro')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'pro'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Pro Features ✨
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {(activeTab === 'free' ? freeFeatures : proFeatures).map((feature, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 backdrop-blur-sm transition-all hover:scale-105 ${
                feature.highlight
                  ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 ring-2 ring-purple-400'
                  : 'bg-[color:var(--surface)]'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{feature.icon}</div>
                {feature.badge && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    {feature.badge}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mb-20">
          <h2 className="text-4xl font-extrabold text-center mb-10">
            Free vs Pro Comparison
          </h2>
          <div className="bg-[color:var(--surface)] rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-6 font-semibold">Feature</th>
                    <th className="text-center p-6 font-semibold">Free</th>
                    <th className="text-center p-6 font-semibold bg-gradient-to-r from-purple-600/20 to-pink-600/20">
                      Pro ✨
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((item, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-white/10 ${
                        item.highlight ? 'bg-[color:var(--surface)]' : ''
                      }`}
                    >
                      <td className="p-6">{item.feature}</td>
                      <td className="p-6 text-center text-white/60">{item.free}</td>
                      <td className="p-6 text-center font-semibold text-green-400">
                        {item.pro}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4">
              Boost Your Success with Mentorship
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Get personalized guidance from experienced developers. Available as add-ons to any plan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {addOns.map((addon, idx) => (
              <div
                key={idx}
                className="bg-[color:var(--surface)] rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{addon.icon}</div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-400">{addon.price}</div>
                    <div className="text-sm text-white/60">{addon.duration}</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">{addon.title}</h3>
                <p className="text-white/70 mb-6">{addon.description}</p>
                <ul className="space-y-2">
                  {addon.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-20">
          <h2 className="text-4xl font-extrabold text-center mb-12">
            Success Stories
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[color:var(--surface)] rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                  R
                </div>
                <div>
                  <div className="font-semibold">Rahul Kumar</div>
                  <div className="text-sm text-white/60">Frontend Developer @ Google</div>
                </div>
              </div>
              <p className="text-white/80 italic">
                "The structured roadmap and mock tests helped me land my dream job at Google. 
                The Pro plan was worth every rupee!"
              </p>
            </div>
            <div className="bg-[color:var(--surface)] rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                  P
                </div>
                <div>
                  <div className="font-semibold">Priya Sharma</div>
                  <div className="text-sm text-white/60">React Developer @ Meta</div>
                </div>
              </div>
              <p className="text-white/80 italic">
                "The 1:1 mock interview gave me the confidence I needed. Got an offer from Meta within 2 months!"
              </p>
            </div>
            <div className="bg-[color:var(--surface)] rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-xl font-bold">
                  A
                </div>
                <div>
                  <div className="font-semibold">Amit Patel</div>
                  <div className="text-sm text-white/60">Senior Engineer @ Amazon</div>
                </div>
              </div>
              <p className="text-white/80 italic">
                "1000+ questions and solution videos are a game-changer. Best investment in my career!"
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-extrabold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <details className="bg-[color:var(--surface)] rounded-lg p-6 backdrop-blur-sm">
              <summary className="font-semibold cursor-pointer">
                What's the difference between Free and Pro?
              </summary>
              <p className="mt-4 text-white/80">
                Free gives you 100 questions to get started. Pro unlocks 1000+ questions, 
                structured roadmaps, solution videos, mock tests, downloadable resources, 
                and priority support. It's designed for serious learners who want to land their dream job.
              </p>
            </details>
            <details className="bg-[color:var(--surface)] rounded-lg p-6 backdrop-blur-sm">
              <summary className="font-semibold cursor-pointer">
                Can I upgrade from Free to Pro anytime?
              </summary>
              <p className="mt-4 text-white/80">
                Yes! You can upgrade to Pro at any time. Your progress and solved questions 
                will be preserved. You'll instantly get access to all Pro features.
              </p>
            </details>
            <details className="bg-[color:var(--surface)] rounded-lg p-6 backdrop-blur-sm">
              <summary className="font-semibold cursor-pointer">
                What if I'm not satisfied with Pro?
              </summary>
              <p className="mt-4 text-white/80">
                We offer a 7-day money-back guarantee. If you're not satisfied with Pro, 
                contact us within 7 days for a full refund, no questions asked.
              </p>
            </details>
            <details className="bg-[color:var(--surface)] rounded-lg p-6 backdrop-blur-sm">
              <summary className="font-semibold cursor-pointer">
                How do the mentorship add-ons work?
              </summary>
              <p className="mt-4 text-white/80">
                After purchasing an add-on, you'll receive a booking link to schedule a session 
                with our experienced mentors. Sessions are conducted via Zoom/Google Meet. 
                You'll receive detailed feedback and recordings after each session.
              </p>
            </details>
            <details className="bg-[color:var(--surface)] rounded-lg p-6 backdrop-blur-sm">
              <summary className="font-semibold cursor-pointer">
                Is Pro worth it for beginners?
              </summary>
              <p className="mt-4 text-white/80">
                Absolutely! Pro includes a structured roadmap that takes you from basics to advanced. 
                The solution videos explain concepts clearly, making it perfect for beginners. 
                Start with Free to try it out, then upgrade when you're ready.
              </p>
            </details>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-12 backdrop-blur-sm">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Level Up Your Interview Prep?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who have landed jobs at top companies with Frontend Pitstop.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/pricing"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-4 rounded-lg font-semibold text-lg transition"
              >
                View Pricing Plans
              </Link>
              <Link
                href="/problems"
                className="bg-white/10 hover:bg-white/20 px-8 py-4 rounded-lg font-semibold text-lg transition"
              >
                Start Free Trial
              </Link>
            </div>
            <p className="mt-6 text-white/60 text-sm">
              No credit card required for Free tier • 7-day money-back guarantee on Pro
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

