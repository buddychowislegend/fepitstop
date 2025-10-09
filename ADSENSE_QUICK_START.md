# Google AdSense - Quick Start Guide

## 🎉 Your Site is Ready for AdSense!

Google AdSense has been fully integrated into Frontend Pitstop. Follow these simple steps to start earning revenue.

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Sign Up for AdSense
1. Go to: https://www.google.com/adsense/
2. Click **"Get Started"**
3. Enter your website: `https://frontendpitstop.com`
4. Complete the signup process

### Step 2: Get Your Publisher ID
1. Log into AdSense dashboard
2. Go to **Account** → **Account Information**
3. Copy your **Publisher ID** (looks like: `ca-pub-1234567890`)

### Step 3: Add to Vercel
```bash
cd /Users/sagar/Documents/FePitStop/frontendpitstop
echo "ca-pub-YOUR-ID-HERE" | vercel env add NEXT_PUBLIC_ADSENSE_CLIENT_ID production
```

### Step 4: Create Ad Units
1. In AdSense, go to **Ads** → **By ad unit** → **Display ads**
2. Create these ad units:
   - **Header Banner** (Horizontal, Responsive)
   - **Sidebar Ad** (Vertical, Responsive)
   - **In-Content Ad** (Rectangle, Responsive)

### Step 5: Update Ad Slot IDs
Edit `src/components/AdSense.tsx` and replace placeholder IDs:
```typescript
// Line 49: HeaderAd
adSlot="YOUR-HEADER-SLOT-ID"

// Line 58: SidebarAd
adSlot="YOUR-SIDEBAR-SLOT-ID"

// Line 67: InArticleAd
adSlot="YOUR-CONTENT-SLOT-ID"
```

Also update ad slots in these files:
- `src/app/problems/page.tsx` (lines 188, 428)
- `src/app/problems/[id]/page.tsx` (line 655)
- `src/app/page.tsx` (line 12)
- `src/app/quiz/page.tsx` (line 179)
- `src/app/profile/page.tsx` (line 255)

### Step 6: Deploy
```bash
git add -A
git commit -m "Update AdSense slot IDs"
git push origin main
```

### Step 7: Wait for Approval
- AdSense will review your site (24-48 hours)
- Once approved, ads will start showing
- Check AdSense dashboard for status

---

## 📍 Where Ads Are Placed

Your site now has ads on these pages:

| Page | Ad Placement | Format |
|------|-------------|--------|
| **Landing Page** (`/`) | Top banner | Horizontal |
| **Problems List** (`/problems`) | Top banner + Sidebar | Horizontal + Vertical |
| **Problem Detail** (`/problems/[id]`) | Top banner | Horizontal |
| **Quiz Results** (`/quiz`) | Top banner | Horizontal |
| **Profile** (`/profile`) | Top banner | Horizontal |

---

## 💰 Expected Revenue

**Typical Earnings:**
- **Page RPM**: $1-$5 per 1000 page views
- **CTR**: 0.5-2% (clicks per impression)
- **CPC**: $0.10-$2 per click

**Example:**
- 10,000 monthly visitors
- 3 pages per visit = 30,000 page views
- At $2 RPM = **$60/month**
- At $5 RPM = **$150/month**

**Growth Potential:**
- 100,000 monthly visitors = **$600-$1,500/month**
- 500,000 monthly visitors = **$3,000-$7,500/month**

---

## ✅ Verification Checklist

- [ ] Signed up for Google AdSense
- [ ] Got Publisher ID (ca-pub-XXXXXXXXXX)
- [ ] Added to Vercel environment variables
- [ ] Created ad units in AdSense dashboard
- [ ] Updated ad slot IDs in code
- [ ] Committed and pushed changes
- [ ] Site verified in AdSense (wait 24-48h)
- [ ] Ads showing on website
- [ ] Set up payment method in AdSense

---

## 🔍 Testing

### Check if AdSense is Loading
1. Visit: https://frontendpitstop.com
2. Open DevTools (F12) → Console
3. Look for: `adsbygoogle.js` loaded
4. No errors related to AdSense

### Check Ad Spaces
1. Visit any page with ads
2. You should see either:
   - Actual ads (if approved and traffic is sufficient)
   - Blank spaces (normal for new sites)
   - Test ads (if test mode is enabled)

**⚠️ NEVER click your own ads!** This violates AdSense policies.

---

## 📊 Monitor Performance

### AdSense Dashboard
- **Home**: Overview of earnings
- **Reports**: Detailed analytics
- **Optimization**: Revenue suggestions

### Key Metrics to Track
- **Impressions**: How many times ads are shown
- **Clicks**: How many times ads are clicked
- **CTR**: Click-through rate (clicks/impressions)
- **CPC**: Cost per click
- **RPM**: Revenue per 1000 impressions
- **Earnings**: Total revenue

---

## 🚨 Important Rules

### DO:
- ✅ Create quality, original content
- ✅ Drive organic traffic to your site
- ✅ Place ads in visible locations
- ✅ Use responsive ad units
- ✅ Follow AdSense policies

### DON'T:
- ❌ Click your own ads
- ❌ Ask others to click ads
- ❌ Use phrases like "Click here" near ads
- ❌ Modify AdSense code
- ❌ Place ads on prohibited content
- ❌ Use bots or incentivized traffic

---

## 🆘 Troubleshooting

### Ads Not Showing?
1. **Wait 24-48 hours** after adding code
2. **Disable ad blockers** to test
3. **Check AdSense dashboard** for approval status
4. **Verify environment variable** is set correctly
5. **Check browser console** for errors

### Blank Ad Spaces?
- Normal for new sites with low traffic
- AdSense needs time to learn your audience
- Build traffic and ads will improve

### Account Issues?
- Check **Policy Center** in AdSense dashboard
- Ensure site complies with policies
- Contact AdSense support if needed

---

## 📚 Full Documentation

For detailed information, see: **GOOGLE_ADSENSE_SETUP.md**

---

## 🎯 Summary

**What's Done:**
- ✅ AdSense script integrated
- ✅ Reusable ad component created
- ✅ Ads placed on 5 key pages
- ✅ Responsive ad formats
- ✅ Environment variable configured

**What You Need to Do:**
1. Sign up for AdSense
2. Get Publisher ID
3. Add to Vercel
4. Create ad units
5. Update slot IDs
6. Wait for approval
7. Start earning! 💰

**Time to Complete:** ~30 minutes (plus 24-48h for approval)

---

**Questions?** Check the full guide: `GOOGLE_ADSENSE_SETUP.md`

**Ready to monetize?** Let's go! 🚀

