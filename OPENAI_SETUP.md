# OpenAI API Setup Guide

## 🔑 Getting Your OpenAI API Key

### Step 1: Create OpenAI Account
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Click "Sign up" or "Log in"
3. Complete registration with email and phone verification

### Step 2: Get API Key
1. Navigate to [API Keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Name it "Frontend Pitstop AI Interview"
4. **⚠️ Copy the key immediately - you won't see it again!**

### Step 3: Set Up Billing
1. Go to [Billing](https://platform.openai.com/account/billing)
2. Add payment method (credit card required)
3. Set usage limits (start with $10-20)
4. Monitor usage in dashboard

## 💰 Cost Estimates

### OpenAI Pricing (2024)
- **GPT-4**: $0.03/1K input tokens, $0.06/1K output tokens
- **GPT-3.5-turbo**: $0.001/1K input tokens, $0.002/1K output tokens  
- **Whisper**: $0.006/minute of audio
- **TTS**: $0.015/1K characters

### Monthly Cost Estimates
- **100 interviews**: ~$5-15
- **500 interviews**: ~$25-75
- **1000 interviews**: ~$50-150

## 🔧 Environment Setup

### Create .env.local file:
```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_actual_api_key_here

# Optional: Set usage limits
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Database Configuration (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Application Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🚀 Quick Start

### 1. Install OpenAI SDK
```bash
npm install openai
```

### 2. Update API Routes
Replace mock implementations in:
- `/src/app/api/interview/route.ts`
- `/src/app/api/speech-to-text/route.ts`  
- `/src/app/api/text-to-speech/route.ts`

### 3. Test Integration
```bash
npm run dev
```

## 🛡️ Security Best Practices

### 1. Never Commit API Keys
- Add `.env.local` to `.gitignore`
- Use environment variables in production
- Rotate keys regularly

### 2. Set Usage Limits
```javascript
// In your API routes
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 30000
});
```

### 3. Monitor Usage
- Check OpenAI dashboard regularly
- Set up billing alerts
- Monitor token usage per request

## 🔍 Troubleshooting

### Common Issues
1. **"Invalid API Key"**: Check key is copied correctly
2. **"Insufficient Credits"**: Add payment method
3. **"Rate Limit Exceeded"**: Implement retry logic
4. **"Model Not Available"**: Check model name spelling

### Debug Mode
```javascript
// Add to your API routes for debugging
console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Missing');
```

## 📊 Monitoring Usage

### Track API Calls
```javascript
const trackUsage = async (tokens, cost) => {
  // Log to your analytics service
  console.log(`Tokens used: ${tokens}, Cost: $${cost}`);
};
```

### Set Alerts
- OpenAI dashboard: Set spending alerts
- Monitor daily/weekly usage
- Set hard limits to prevent overage

## 🎯 Next Steps

1. **Get API Key**: Follow steps above
2. **Add to Environment**: Create `.env.local` file
3. **Test Integration**: Run the app and test AI features
4. **Monitor Usage**: Check costs and optimize
5. **Deploy**: Add environment variables to production

## 📞 Support

- **OpenAI Documentation**: https://platform.openai.com/docs
- **OpenAI Community**: https://community.openai.com/
- **OpenAI Support**: Available for paid accounts

---

**⚠️ Important**: Keep your API key secure and never share it publicly!
