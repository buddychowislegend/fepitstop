const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// Get pricing plans
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: 'free',
      name: 'Free Tier',
      price: 0,
      currency: 'INR',
      duration: 'Forever',
      subtitle: 'Perfect for getting started',
      features: [
        '✅ 100 Frontend Interview Questions',
        '✅ Basic HTML/CSS/JS Challenges',
        '✅ Sample React Problems',
        '✅ Interactive Code Editor',
        '✅ Basic Test Cases',
        '✅ Public Leaderboard',
        '✅ Daily Question via Email',
        '✅ Blog Articles & Guides',
        '✅ Community Access'
      ],
      limitations: [
        '❌ Limited to 100 questions',
        '❌ No structured roadmap',
        '❌ No solution videos',
        '❌ No mock tests',
        '❌ No downloadable resources',
        '❌ No priority support'
      ],
      cta: 'Start Free'
    },
    {
      id: 'pro_monthly',
      name: 'Pro Monthly',
      price: 499,
      currency: 'INR',
      duration: 'per month',
      popular: true,
      subtitle: 'For serious learners',
      features: [
        '🎯 Everything in Free Tier',
        '🚀 1000+ Interview Questions',
        '📚 Structured Prep Roadmap',
        '📝 HTML → CSS → JS → React → System Design',
        '🎯 Topic-based Mock Tests',
        '🎥 Solution Videos & In-depth Explanations',
        '📄 Downloadable PDFs & Cheat Sheets',
        '💬 Priority Discord/Slack Access',
        '⏱️ Interview Simulator (Time-based Practice)',
        '📊 Advanced Analytics & Progress Tracking',
        '🏆 Pro Badge & Profile Highlights',
        '⚡ Priority Support'
      ],
      highlights: [
        'Cancel anytime',
        'Full access to all features',
        '7-day money-back guarantee',
        'New content added weekly'
      ],
      cta: 'Start Pro Monthly',
      savings: null
    },
    {
      id: 'pro_yearly',
      name: 'Pro Yearly',
      price: 4499,
      currency: 'INR',
      duration: 'per year',
      originalPrice: 5988,
      discount: 25,
      subtitle: 'Best value - Save 25%',
      badge: '🔥 Best Value',
      features: [
        '🎯 Everything in Pro Monthly',
        '💰 Save ₹1,489 per year',
        '🎁 Exclusive yearly bonuses',
        '📚 Premium resource library',
        '🎯 Career guidance sessions',
        '📧 Direct email support',
        '🏆 Yearly achievement badges',
        '🎉 Early access to new features'
      ],
      highlights: [
        'Save 25% vs monthly',
        'Pay once, use all year',
        'Exclusive yearly perks',
        '7-day money-back guarantee'
      ],
      cta: 'Get Pro Yearly',
      savings: '₹1,489'
    }
  ];

  const addOns = [
    {
      id: 'mock_interview',
      name: '1:1 Mock Interview',
      price: 999,
      currency: 'INR',
      duration: 'per session',
      description: 'Live mock interview with experienced frontend developers',
      features: [
        '45-minute live session',
        'Real interview environment',
        'Detailed feedback report',
        'Personalized improvement tips',
        'Recording of the session'
      ],
      icon: '🎥'
    },
    {
      id: 'resume_review',
      name: 'Resume & LinkedIn Review',
      price: 999,
      currency: 'INR',
      duration: 'per session',
      description: 'Professional resume review and LinkedIn optimization',
      features: [
        'Detailed resume analysis',
        'ATS optimization tips',
        'LinkedIn profile review',
        'Industry-specific suggestions',
        'Before/after comparison'
      ],
      icon: '📄'
    },
    {
      id: 'project_review',
      name: 'Personal Project Review',
      price: 1499,
      currency: 'INR',
      duration: 'per session',
      description: 'In-depth review of your portfolio project',
      features: [
        '60-minute code review',
        'Architecture feedback',
        'Best practices suggestions',
        'Performance optimization tips',
        'Deployment guidance'
      ],
      icon: '💻'
    },
    {
      id: 'career_consultation',
      name: 'Career Roadmap Consultation',
      price: 1999,
      currency: 'INR',
      duration: 'per session',
      description: 'Personalized frontend career guidance',
      features: [
        '90-minute consultation',
        'Personalized learning path',
        'Company-specific prep strategy',
        'Salary negotiation tips',
        'Long-term career planning'
      ],
      icon: '🚀'
    }
  ];
  
  res.json({ plans, addOns });
});

// Create Razorpay order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { planId, addOnId } = req.body;
    
    // Define plan prices
    const planPrices = {
      'pro_monthly': 49900,  // ₹499 in paise
      'pro_yearly': 449900,  // ₹4499 in paise
      'mock_interview': 99900,  // ₹999 in paise
      'resume_review': 99900,   // ₹999 in paise
      'project_review': 149900, // ₹1499 in paise
      'career_consultation': 199900 // ₹1999 in paise
    };
    
    const itemId = addOnId || planId;
    const amount = planPrices[itemId];
    
    if (!amount) {
      return res.status(400).json({ error: 'Invalid plan or add-on' });
    }
    
    // Check if user already has active subscription (for subscription plans only)
    if (planId && !addOnId) {
      const user = await User.findById(req.user.id);
      if (user.isPremium) {
        const subscription = await Subscription.findById(user.subscriptionId);
        if (subscription && subscription.isActive()) {
          return res.status(400).json({ 
            error: 'You already have an active subscription',
            currentPlan: subscription.plan
          });
        }
      }
    }
    
    // Create Razorpay order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user.id,
        planId: planId || null,
        addOnId: addOnId || null,
        type: addOnId ? 'addon' : 'subscription'
      }
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
      itemId: itemId
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment and activate subscription
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { orderId, paymentId, signature, planId, addOnId } = req.body;
    
    // Verify signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(body.toString())
      .digest('hex');
    
    const isAuthentic = expectedSignature === signature;
    
    if (!isAuthentic) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }
    
    // Handle add-on purchases (no subscription creation)
    if (addOnId) {
      // TODO: Create add-on purchase record
      // For now, just return success
      return res.json({
        success: true,
        message: 'Add-on purchased successfully!',
        type: 'addon',
        addOnId: addOnId
      });
    }
    
    // Handle subscription
    const planDetails = {
      'pro_monthly': { duration: 30, amount: 499, name: 'Pro Monthly' },
      'pro_yearly': { duration: 365, amount: 4499, name: 'Pro Yearly' }
    };
    
    const plan = planDetails[planId];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    
    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);
    
    const subscription = new Subscription({
      userId: req.user.id,
      plan: planId,
      status: 'active',
      amount: plan.amount,
      currency: 'INR',
      startDate: new Date(),
      endDate: endDate,
      paymentId: paymentId,
      orderId: orderId,
      razorpaySignature: signature,
      features: {
        resumeReferral: false,  // Not included in Pro plan
        liveMockInterviews: false,  // Available as add-on
        peerToPeerCoding: true,
        freelancingProjects: false,  // Not included
        prioritySupport: true
      }
    });
    
    await subscription.save();
    
    // Update user
    await User.findByIdAndUpdate(req.user.id, {
      isPremium: true,
      subscriptionId: subscription._id
    });
    
    res.json({
      success: true,
      message: `${plan.name} subscription activated successfully!`,
      subscription: {
        plan: subscription.plan,
        planName: plan.name,
        status: subscription.status,
        features: subscription.features,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        daysRemaining: plan.duration
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get user subscription
router.get('/subscription', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.id });
    
    if (!subscription) {
      return res.json({
        plan: 'free',
        status: 'active',
        features: {}
      });
    }
    
    // Check if expired
    if (subscription.isExpired()) {
      subscription.status = 'expired';
      await subscription.save();
      
      // Update user
      await User.findByIdAndUpdate(req.user.id, { isPremium: false });
    }
    
    res.json({
      plan: subscription.plan,
      status: subscription.status,
      features: subscription.features,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      daysRemaining: subscription.daysRemaining(),
      isActive: subscription.isActive()
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// Cancel subscription (for future recurring subscriptions)
router.post('/cancel', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.id });
    
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }
    
    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Admin: Get all subscriptions
router.get('/admin/subscriptions', async (req, res) => {
  try {
    // Check admin key
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const subscriptions = await Subscription.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      expired: subscriptions.filter(s => s.status === 'expired').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      revenue: subscriptions.reduce((sum, s) => sum + s.amount, 0)
    };
    
    res.json({ subscriptions, stats });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to get subscriptions' });
  }
});

module.exports = router;

