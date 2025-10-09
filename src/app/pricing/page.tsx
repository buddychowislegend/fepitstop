"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/config";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Plan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  popular?: boolean;
  features: string[];
  limitations?: string[];
  highlights?: string[];
};

export default function PricingPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    fetchPlans();
    if (user && token) {
      fetchSubscription();
    }
  }, [user, token]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(api("/payment/plans"));
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch(api("/payment/subscription"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!user || !token) {
      router.push("/signin?redirect=/pricing");
      return;
    }

    if (planId === "free") {
      return; // Already on free plan
    }

    if (subscription?.plan === "premium") {
      alert("You already have a premium subscription!");
      return;
    }

    setProcessing(true);

    try {
      // Create order
      const orderResponse = await fetch(api("/payment/create-order"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.error || "Failed to create order");
      }

      const orderData = await orderResponse.json();

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Frontend Pitstop",
          description: "Premium Subscription",
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyResponse = await fetch(api("/payment/verify-payment"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
              });

              if (verifyResponse.ok) {
                alert("🎉 Payment successful! Welcome to Premium!");
                router.push("/profile");
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              alert("Payment verification failed. Please contact support.");
            } finally {
              setProcessing(false);
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#6a2fb5",
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(error.message || "Failed to process payment");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white flex items-center justify-center">
        <p>Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Start for free, upgrade when you're ready. One-time payment, lifetime access.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-gradient-to-br from-purple-600/20 to-pink-600/20 ring-2 ring-purple-400"
                  : "bg-white/5"
              } backdrop-blur-sm`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    🔥 Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-extrabold">₹{plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-white/60 text-lg">one-time</span>
                  )}
                </div>
                <p className="text-white/60 mt-2">{plan.duration}</p>
              </div>

              {/* Highlights */}
              {plan.highlights && (
                <div className="mb-6 p-4 bg-white/5 rounded-lg">
                  {plan.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-green-300">
                      <span>✓</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-white/90">{feature}</span>
                  </div>
                ))}
                {plan.limitations && plan.limitations.map((limitation, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">✗</span>
                    <span className="text-white/60">{limitation}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={
                  processing ||
                  (subscription?.plan === "premium" && plan.id === "premium")
                }
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    : "bg-white/10 hover:bg-white/20"
                } ${
                  processing || (subscription?.plan === "premium" && plan.id === "premium")
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {processing
                  ? "Processing..."
                  : subscription?.plan === "premium" && plan.id === "premium"
                  ? "Current Plan"
                  : plan.id === "free"
                  ? "Get Started Free"
                  : "Upgrade to Premium"}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">
                Is this really a one-time payment?
              </h3>
              <p className="text-white/80">
                Yes! Pay ₹500 once and get lifetime access to all premium features. No recurring fees, no hidden charges.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">
                What is resume referral?
              </h3>
              <p className="text-white/80">
                We'll refer your resume to our partner companies and recruiters, increasing your chances of getting interviews at top tech companies.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">
                How do mock interviews work?
              </h3>
              <p className="text-white/80">
                Schedule live 1-on-1 mock interviews with experienced engineers from top companies. Get real-time feedback and improve your interview skills.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">
                Can I get a refund?
              </h3>
              <p className="text-white/80">
                Yes! We offer a 7-day money-back guarantee. If you're not satisfied, we'll refund your payment, no questions asked.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-white/80">
                We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay's secure payment gateway.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-12 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Ace Your Interviews?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who have landed their dream jobs with Frontend Pitstop.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleUpgrade("premium")}
                disabled={processing}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-3 rounded-lg font-semibold transition"
              >
                Get Premium Now
              </button>
              <Link
                href="/problems"
                className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-lg font-semibold transition inline-block"
              >
                Try Free First
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

