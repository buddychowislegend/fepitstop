# 🚀 Gemini Flash Quick Start Guide

## ⚡ Get Started in 5 Minutes

### 1. Get Your Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API Key" 
3. Sign in with Google account
4. Create new API key
5. **Copy the key immediately!**

### 2. Run Setup Script
```bash
node setup-gemini.js
```

### 3. Install Dependencies
```bash
npm install @google/generative-ai
```

### 4. Start Development
```bash
npm run dev
```

## 💰 Cost Comparison

| Service | Input Cost | Output Cost | Speed |
|---------|-------------|--------------|-------|
| **Gemini Flash** | $0.000075/1K | $0.0003/1K | ⚡ Very Fast |
| GPT-4 | $0.03/1K | $0.06/1K | 🐌 Slower |
| **Savings** | **400x cheaper** | **200x cheaper** | **Much faster** |

## 🎯 Features

✅ **AI Question Generation** - Dynamic questions based on topic  
✅ **Real-time Feedback** - Instant AI evaluation of answers  
✅ **Speech-to-Text** - Voice recording and transcription  
✅ **Text-to-Speech** - AI interviewer voice  
✅ **Session Management** - Track progress and history  
✅ **Cost Effective** - 95% cheaper than GPT-4  

## 🔧 Environment Variables

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MAX_TOKENS=1000
GEMINI_TEMPERATURE=0.7
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🚀 Production Deployment

### Vercel Deployment
1. Add environment variables in Vercel dashboard
2. Deploy with `vercel --prod`
3. Monitor usage in Google AI Studio

### Environment Variables for Production
```bash
GEMINI_API_KEY=your_production_key
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
```

## 📊 Usage Monitoring

### Google AI Studio Dashboard
- Monitor API usage and costs
- Set usage limits and alerts
- Track request patterns

### Free Tier Limits
- **15 requests per minute**
- **1M tokens per day**
- **Perfect for development and testing**

## 🛡️ Security Best Practices

### 1. Never Commit API Keys
```bash
echo ".env.local" >> .gitignore
```

### 2. Use Environment Variables
```javascript
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
```

### 3. Set Usage Limits
- Monitor daily usage
- Set spending alerts
- Implement rate limiting

## 🔍 Troubleshooting

### Common Issues
1. **"API Key Invalid"**: Check key format and permissions
2. **"Quota Exceeded"**: Wait or upgrade plan
3. **"Model Not Found"**: Use correct model name "gemini-1.5-flash"

### Debug Mode
```javascript
console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');
```

## 📈 Performance Tips

### 1. Optimize Prompts
```javascript
// Good: Specific and concise
const prompt = `Generate 5 React questions for ${difficulty} level.`;

// Bad: Too verbose
const prompt = `Please generate exactly five interview questions...`;
```

### 2. Use Caching
```javascript
const cache = new Map();
const getCachedResponse = async (key, fetcher) => {
  if (cache.has(key)) return cache.get(key);
  const result = await fetcher();
  cache.set(key, result);
  return result;
};
```

### 3. Error Handling
```javascript
try {
  const result = await model.generateContent(prompt);
} catch (error) {
  if (error.message.includes('quota')) {
    // Handle rate limit
  }
}
```

## 🎉 You're Ready!

Your AI-powered mock interview system is now ready with:
- **Gemini Flash integration** ⚡
- **Cost-effective AI** 💰
- **Real-time feedback** 🎯
- **Voice capabilities** 🎤
- **Session management** 📊

Start interviewing and get AI-powered feedback on your answers!

---

**💡 Pro Tip**: Gemini Flash is perfect for your use case - fast, cheap, and effective for interview questions and feedback!
