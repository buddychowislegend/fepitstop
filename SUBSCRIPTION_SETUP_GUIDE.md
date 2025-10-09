# Subscription System Setup Guide

## 🎯 Overview

Your Frontend Pitstop now has a complete subscription system with:
- **Free Plan**: Access to all basic features
- **Premium Plan**: ₹500 one-time payment for lifetime access

### Premium Features:
- ✨ Resume Referral to Top Companies
- 🎥 Live Mock Interviews with Experts
- 👥 Peer-to-Peer Coding Sessions
- 💼 Access to Freelancing Projects
- 🎯 Personalized Learning Path
- ⚡ Priority Support
- 📊 Advanced Analytics
- 🏆 Premium Badge

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
npm install razorpay mongoose
```

### Step 2: Create Razorpay Account

1. Go to: https://razorpay.com/
2. Sign up for an account
3. Complete KYC verification (required for live payments)
4. Go to **Settings** → **API Keys**
5. Generate API keys

**You'll get:**
- Test Key ID: `rzp_test_XXXXXXXXXXXX`
- Test Key Secret: `XXXXXXXXXXXX`
- Live Key ID: `rzp_live_XXXXXXXXXXXX` (after KYC)
- Live Key Secret: `XXXXXXXXXXXX` (after KYC)

### Step 3: Add Environment Variables

**Backend `.env` file:**
```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXX

# For production, use live keys:
# RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
# RAZORPAY_KEY_SECRET=XXXXXXXXXXXX

# MongoDB (already configured)
MONGODB_URI=your_mongodb_connection_string

# JWT Secret (already configured)
JWT_SECRET=your_jwt_secret

# Admin Key (already configured)
ADMIN_KEY=your_admin_key
```

**Vercel Environment Variables:**
```bash
cd backend
vercel env add RAZORPAY_KEY_ID production
# Enter: rzp_test_XXXXXXXXXXXX (or rzp_live_XXXXXXXXXXXX for production)

vercel env add RAZORPAY_KEY_SECRET production
# Enter: your_secret_key
```

### Step 4: Deploy Backend

```bash
cd backend
git add -A
git commit -m "Add subscription system with Razorpay"
git push origin main
```

Vercel will automatically redeploy.

---

## 📊 Database Schema

### Subscription Model

```javascript
{
  userId: ObjectId,              // Reference to User
  plan: 'free' | 'premium',      // Plan type
  status: 'active' | 'expired' | 'cancelled',
  amount: Number,                // 500 for premium
  currency: 'INR',
  startDate: Date,
  endDate: Date,                 // 100 years for lifetime
  paymentId: String,             // Razorpay payment ID
  orderId: String,               // Razorpay order ID
  razorpaySignature: String,     // Payment signature
  features: {
    resumeReferral: Boolean,
    liveMockInterviews: Boolean,
    peerToPeerCoding: Boolean,
    freelancingProjects: Boolean,
    prioritySupport: Boolean
  },
  autoRenew: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### User Model (Updated)

```javascript
{
  // ... existing fields
  isPremium: Boolean,            // Quick check for premium status
  subscriptionId: ObjectId       // Reference to Subscription
}
```

---

## 🔌 API Endpoints

### Get Pricing Plans
```
GET /api/payment/plans
```

**Response:**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free Plan",
      "price": 0,
      "features": ["..."]
    },
    {
      "id": "premium",
      "name": "Premium Plan",
      "price": 500,
      "features": ["..."]
    }
  ]
}
```

### Create Order
```
POST /api/payment/create-order
Authorization: Bearer <token>
```

**Request:**
```json
{
  "planId": "premium"
}
```

**Response:**
```json
{
  "orderId": "order_XXXXXXXXXXXX",
  "amount": 50000,
  "currency": "INR",
  "keyId": "rzp_test_XXXXXXXXXXXX"
}
```

### Verify Payment
```
POST /api/payment/verify-payment
Authorization: Bearer <token>
```

**Request:**
```json
{
  "orderId": "order_XXXXXXXXXXXX",
  "paymentId": "pay_XXXXXXXXXXXX",
  "signature": "XXXXXXXXXXXX"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription activated successfully!",
  "subscription": {
    "plan": "premium",
    "status": "active",
    "features": {...},
    "endDate": "2125-01-09"
  }
}
```

### Get User Subscription
```
GET /api/payment/subscription
Authorization: Bearer <token>
```

**Response:**
```json
{
  "plan": "premium",
  "status": "active",
  "features": {
    "resumeReferral": true,
    "liveMockInterviews": true,
    "peerToPeerCoding": true,
    "freelancingProjects": true,
    "prioritySupport": true
  },
  "startDate": "2025-01-09",
  "endDate": "2125-01-09",
  "daysRemaining": 36500,
  "isActive": true
}
```

### Cancel Subscription
```
POST /api/payment/cancel
Authorization: Bearer <token>
```

### Admin: Get All Subscriptions
```
GET /api/payment/admin/subscriptions
X-Admin-Key: your_admin_key
```

**Response:**
```json
{
  "subscriptions": [...],
  "stats": {
    "total": 150,
    "active": 145,
    "expired": 3,
    "cancelled": 2,
    "revenue": 75000
  }
}
```

---

## 💳 Payment Flow

### 1. User Journey

```
User clicks "Upgrade to Premium"
    ↓
Frontend: Check if user is logged in
    ↓
Backend: Create Razorpay order
    ↓
Frontend: Open Razorpay checkout
    ↓
User: Complete payment
    ↓
Razorpay: Return payment details
    ↓
Backend: Verify payment signature
    ↓
Backend: Create subscription record
    ↓
Backend: Update user to premium
    ↓
Frontend: Redirect to profile
```

### 2. Technical Flow

```javascript
// 1. Create Order
const orderResponse = await fetch('/api/payment/create-order', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ planId: 'premium' })
});

// 2. Open Razorpay Checkout
const options = {
  key: orderData.keyId,
  amount: orderData.amount,
  currency: orderData.currency,
  order_id: orderData.orderId,
  handler: async function(response) {
    // 3. Verify Payment
    await fetch('/api/payment/verify-payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature
      })
    });
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

---

## 🎨 Frontend Pages

### Pricing Page
**URL:** `/pricing`
**Features:**
- Display Free vs Premium plans
- Highlight premium features
- One-click upgrade
- FAQ section
- Responsive design

### Profile Page (Updated)
**URL:** `/profile`
**New Features:**
- Display subscription status
- Premium badge
- Days remaining (for lifetime: 36500 days)
- Upgrade button (if free)

---

## 🧪 Testing

### Test Mode (Use Test Keys)

**Test Cards:**
```
Success:
Card: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date

Failure:
Card: 4000 0000 0000 0002
```

**Test UPI:**
```
success@razorpay
failure@razorpay
```

**Test Wallets:**
All test wallets will show success/failure options

### Testing Checklist

- [ ] User can view pricing page
- [ ] User can click upgrade button
- [ ] Razorpay checkout opens
- [ ] Payment succeeds with test card
- [ ] Subscription is created in database
- [ ] User.isPremium is set to true
- [ ] Profile shows premium badge
- [ ] User can access premium features

---

## 🚀 Going Live

### Step 1: Complete KYC on Razorpay
1. Submit business documents
2. Wait for approval (1-2 days)
3. Get live API keys

### Step 2: Update Environment Variables
```bash
# Replace test keys with live keys
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXX
```

### Step 3: Test with Small Amount
- Make a real payment of ₹1
- Verify it works end-to-end
- Check payment in Razorpay dashboard

### Step 4: Enable Webhooks (Optional)
1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://fepit.vercel.app/api/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Save webhook secret

---

## 💰 Revenue Tracking

### Admin Dashboard
**URL:** `/analytics`
**Password:** `manasi22`

**Metrics:**
- Total subscriptions
- Active subscriptions
- Total revenue
- Revenue by month
- Conversion rate

### Razorpay Dashboard
- Real-time payments
- Settlement details
- Refund management
- Customer details

---

## 🎯 Premium Features Implementation

### 1. Resume Referral

**Create endpoint:**
```javascript
// backend/routes/premium.js
router.post('/resume-referral', auth, premiumOnly, async (req, res) => {
  // Check if user is premium
  // Accept resume upload
  // Store in database
  // Send to partner companies
});
```

**Frontend:**
```javascript
// src/app/premium/resume-referral/page.tsx
// Upload resume form
// Show referral status
// List of companies
```

### 2. Live Mock Interviews

**Create endpoint:**
```javascript
// backend/routes/premium.js
router.post('/schedule-interview', auth, premiumOnly, async (req, res) => {
  // Check if user is premium
  // Accept date/time
  // Create calendar event
  // Send confirmation email
});
```

**Frontend:**
```javascript
// src/app/premium/mock-interview/page.tsx
// Calendar for scheduling
// List of available slots
// Interview history
```

### 3. Peer-to-Peer Coding

**Create endpoint:**
```javascript
// backend/routes/premium.js
router.post('/create-session', auth, premiumOnly, async (req, res) => {
  // Check if user is premium
  // Create coding session
  // Generate session link
  // Return session details
});
```

**Frontend:**
```javascript
// src/app/premium/peer-coding/page.tsx
// Create/join session
// Real-time code editor
// Video chat integration
```

### 4. Freelancing Projects

**Create endpoint:**
```javascript
// backend/routes/premium.js
router.get('/projects', auth, premiumOnly, async (req, res) => {
  // Check if user is premium
  // Fetch available projects
  // Return project list
});
```

**Frontend:**
```javascript
// src/app/premium/projects/page.tsx
// List of projects
// Project details
// Apply to projects
```

---

## 🔒 Premium-Only Middleware

**Create middleware:**
```javascript
// backend/middleware/premiumOnly.js
const User = require('../models/User');
const Subscription = require('../models/Subscription');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.isPremium) {
      return res.status(403).json({ 
        error: 'Premium subscription required',
        upgradeUrl: '/pricing'
      });
    }
    
    const subscription = await Subscription.findById(user.subscriptionId);
    
    if (!subscription || !subscription.isActive()) {
      return res.status(403).json({ 
        error: 'Active subscription required',
        upgradeUrl: '/pricing'
      });
    }
    
    req.subscription = subscription;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
```

**Usage:**
```javascript
const premiumOnly = require('../middleware/premiumOnly');

router.post('/premium-feature', auth, premiumOnly, async (req, res) => {
  // Only premium users can access this
});
```

---

## 📊 Analytics & Metrics

### Key Metrics to Track

**Conversion Funnel:**
1. Visitors to pricing page
2. Click on upgrade button
3. Razorpay checkout opened
4. Payment completed
5. Subscription activated

**Revenue Metrics:**
- Daily revenue
- Monthly revenue
- Average revenue per user (ARPU)
- Lifetime value (LTV)
- Conversion rate

**User Metrics:**
- Free users
- Premium users
- Churn rate (for future recurring)
- Upgrade rate

---

## 🛠️ Troubleshooting

### Payment Fails

**Check:**
1. Razorpay keys are correct
2. Amount is in paise (500 INR = 50000 paise)
3. User is authenticated
4. Signature verification is correct

### Subscription Not Activated

**Check:**
1. Payment was successful in Razorpay dashboard
2. Verify payment endpoint was called
3. Subscription record was created
4. User.isPremium was updated

### Razorpay Checkout Not Opening

**Check:**
1. Razorpay script is loaded
2. Order ID is valid
3. Key ID is correct
4. Browser console for errors

---

## 📞 Support

### Razorpay Support
- Dashboard: https://dashboard.razorpay.com
- Docs: https://razorpay.com/docs
- Support: support@razorpay.com

### Common Issues

**Issue:** "Invalid key_id"
**Solution:** Check RAZORPAY_KEY_ID in environment variables

**Issue:** "Signature verification failed"
**Solution:** Check RAZORPAY_KEY_SECRET is correct

**Issue:** "Order not found"
**Solution:** Ensure order was created successfully

---

## ✅ Launch Checklist

### Before Launch:
- [ ] Razorpay account created
- [ ] KYC completed (for live payments)
- [ ] Test keys working
- [ ] Test payment successful
- [ ] Subscription created correctly
- [ ] User upgraded to premium
- [ ] Premium badge showing

### After Launch:
- [ ] Switch to live keys
- [ ] Test with real payment
- [ ] Monitor first 10 payments
- [ ] Check Razorpay dashboard
- [ ] Verify settlements
- [ ] Set up webhooks

---

## 🎉 Summary

**What's Implemented:**
- ✅ Complete subscription system
- ✅ Razorpay payment integration
- ✅ Free and Premium plans
- ✅ Pricing page with FAQ
- ✅ Payment verification
- ✅ Subscription database
- ✅ User premium status
- ✅ Admin dashboard

**What's Next:**
1. Complete Razorpay KYC
2. Get live API keys
3. Test with real payment
4. Implement premium features
5. Launch and promote!

**Revenue Potential:**
- 1,000 users × ₹500 = ₹5,00,000
- 5,000 users × ₹500 = ₹25,00,000
- 10,000 users × ₹500 = ₹50,00,000

**Your subscription system is ready to go live!** 🚀

Good luck with monetization! 💰

