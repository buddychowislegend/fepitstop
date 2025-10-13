# D-ID Talking Avatar Setup Guide

## 🎬 What is D-ID?

D-ID creates realistic talking avatars from static images with perfect lip synchronization. Your AI interviewer will now have a realistic face that speaks with proper lip movements!

---

## 💰 Pricing

### Free Tier:
- ✅ 20 video credits per month
- ✅ Perfect for testing
- ✅ No credit card required

### Paid Plans:
- **Lite**: $5.90/month - 100 credits
- **Basic**: $29/month - 500 credits  
- **Advanced**: $196/month - 5000 credits

**Cost per interview**: ~$0.05 (1 credit per question, 5-7 questions per interview)

---

## 🚀 Setup Instructions

### Step 1: Create D-ID Account

1. Go to: https://studio.d-id.com/
2. Click "Sign Up" (use Google/GitHub for quick signup)
3. Verify your email

### Step 2: Get API Key

1. Go to: https://studio.d-id.com/account-settings
2. Click on "API Key" tab
3. Click "Create API Key"
4. Copy the key (starts with `Basic ...`)

### Step 3: Add to Environment Variables

Add to your `.env.local` file:

```bash
DID_API_KEY=your_api_key_here
```

**Example:**
```bash
DID_API_KEY=Basic YourBase64EncodedKeyHere
```

### Step 4: Restart Dev Server

```bash
npm run dev
```

### Step 5: Test!

1. Go to http://localhost:3000/ai-interview
2. Start an interview
3. Watch the AI interviewer's face speak with lip sync! 🎉

---

## 🎭 How It Works

### With D-ID (When API key is configured):
1. User answers a question
2. AI generates response text
3. **D-ID creates talking avatar video** (2-5 seconds)
4. **Realistic face speaks** with perfect lip sync
5. Video plays automatically

### Without D-ID (Fallback):
1. User answers a question
2. AI generates response text
3. **Browser speech synthesis** speaks the text
4. **Animated avatar circle** pulses with waveform

---

## 🎨 Avatar Customization

You can use custom avatar images for each interviewer:

### Option 1: Use D-ID Studio Avatars
1. Go to https://studio.d-id.com/
2. Browse their avatar library
3. Copy the avatar URL
4. Update `interviewer.avatar` in your code

### Option 2: Upload Custom Images
1. Upload a photo to D-ID
2. Get the image URL
3. Use it as `avatarUrl` in the API call

### Recommended Avatar Images:
- **Format**: JPG or PNG
- **Size**: 512x512px or larger
- **Face**: Clear, front-facing
- **Background**: Clean, professional
- **Expression**: Neutral or slight smile

---

## 🔧 Troubleshooting

### "DID_API_KEY not configured" error:
- ✅ Check `.env.local` file exists
- ✅ Verify key starts with `Basic `
- ✅ Restart dev server after adding key

### Video generation is slow:
- ⏱️ First video takes 3-5 seconds (normal)
- ⏱️ Subsequent videos are faster
- ✅ Fallback to browser speech if timeout

### Quota exceeded:
- 📊 Free tier: 20 videos/month
- 💰 Upgrade plan or wait for reset
- ✅ Automatic fallback to browser speech

---

## 📊 Monitoring Usage

Check your D-ID usage:
1. Go to https://studio.d-id.com/account-settings
2. Click "Usage" tab
3. See credits used and remaining

---

## 🎯 Production Recommendations

### For Production:
1. **Use paid plan** ($29/month for 500 credits)
2. **Cache videos** (same question = same video)
3. **Pregenerate common questions** (faster response)
4. **Monitor usage** (set up alerts)

### Cost Optimization:
- Cache frequently asked questions
- Use shorter responses (fewer tokens = cheaper)
- Batch video generation
- Set up usage alerts

---

## 🆚 Comparison: With vs Without D-ID

| Feature | With D-ID | Without D-ID |
|---------|-----------|--------------|
| Realism | ⭐⭐⭐⭐⭐ Photorealistic | ⭐⭐⭐ Animated circle |
| Lip Sync | ✅ Perfect | ❌ No lips |
| Voice Quality | ✅ Professional | ✅ Browser voices |
| Cost | ~$0.05/interview | Free |
| Speed | 3-5 seconds delay | Instant |
| Engagement | 🔥 Very High | 👍 Good |

---

## 💡 Alternative: Use Pre-recorded Videos

If you want to save costs, you can:

1. **Record videos once** for common questions
2. **Store in cloud storage** (Cloudinary, S3)
3. **Play pre-recorded videos** (instant, free)
4. **Use D-ID only for dynamic responses**

---

## ✅ Next Steps

1. **Get D-ID API key** (5 minutes)
2. **Add to .env.local** (1 minute)
3. **Test the feature** (2 minutes)
4. **Enjoy realistic interviews!** 🎉

**Total setup time: ~10 minutes**

---

Need help? Check:
- D-ID Docs: https://docs.d-id.com/
- D-ID Support: support@d-id.com
- Frontend Pitstop: Your platform is ready to go!

