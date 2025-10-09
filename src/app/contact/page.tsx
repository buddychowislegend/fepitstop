"use client";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Get in Touch</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Have questions, feedback, or need support? We'd love to hear from you!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="bug">Report a Bug</option>
                  <option value="feature">Feature Request</option>
                  <option value="partnership">Partnership Opportunity</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>

              {status === 'success' && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-300">
                  ✓ Message sent successfully! We'll get back to you soon.
                </div>
              )}

              {status === 'error' && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
                  ✗ Failed to send message. Please try again or email us directly.
                </div>
              )}
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📧</div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href="mailto:fepitstop@gmail.com" className="text-blue-400 hover:underline">
                      fepitstop@gmail.com
                    </a>
                    <p className="text-sm text-white/60 mt-1">We typically respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-3xl">💬</div>
                  <div>
                    <h3 className="font-semibold mb-1">Community Support</h3>
                    <p className="text-white/80">Join our Discord server for community help</p>
                    <p className="text-sm text-white/60 mt-1">Coming soon</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-3xl">🐛</div>
                  <div>
                    <h3 className="font-semibold mb-1">Report a Bug</h3>
                    <a href="mailto:fepitstop@gmail.com" className="text-blue-400 hover:underline">
                      fepitstop@gmail.com
                    </a>
                    <p className="text-sm text-white/60 mt-1">Help us improve by reporting issues</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-3xl">💼</div>
                  <div>
                    <h3 className="font-semibold mb-1">Business Inquiries</h3>
                    <a href="mailto:fepitstop@gmail.com" className="text-blue-400 hover:underline">
                      fepitstop@gmail.com
                    </a>
                    <p className="text-sm text-white/60 mt-1">Partnerships, sponsorships, collaborations</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6">FAQ</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How quickly do you respond?</h3>
                  <p className="text-white/70 text-sm">
                    We aim to respond to all inquiries within 24 hours during business days.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Can I suggest new features?</h3>
                  <p className="text-white/70 text-sm">
                    Absolutely! We love hearing from our users. Use the "Feature Request" subject in the form.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                  <p className="text-white/70 text-sm">
                    Yes, we offer a 7-day money-back guarantee on all Pro subscriptions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

