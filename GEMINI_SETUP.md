# Gemini Flash Integration Guide

## 🔑 Getting Your Gemini API Key

### Step 1: Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API Key" or "Create API Key"
3. Sign in with your Google account
4. Create a new API key
5. **⚠️ Copy the key immediately - keep it secure!**

### Step 2: Set Up Billing (Optional)
- Gemini Flash has generous free tier
- Free tier: 15 requests per minute, 1M tokens per day
- Paid tier: $0.000075 per 1K input tokens, $0.0003 per 1K output tokens

## 💰 Cost Comparison

### Gemini Flash vs OpenAI
- **Gemini Flash**: $0.000075/1K input, $0.0003/1K output
- **GPT-4**: $0.03/1K input, $0.06/1K output
- **Savings**: ~400x cheaper than GPT-4!

### Monthly Cost Estimates (1000 interviews)
- **Gemini Flash**: ~$2-5
- **GPT-4**: ~$50-150
- **Savings**: ~95% cost reduction!

## 🔧 Environment Setup

### Create .env.local file:
```bash
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Set usage limits
GEMINI_MAX_TOKENS=1000
GEMINI_TEMPERATURE=0.7

# Application Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🚀 Installation

### Install Google Generative AI SDK
```bash
npm install @google/generative-ai
```

## 📊 Features Comparison

| Feature | Gemini Flash | GPT-4 |
|---------|-------------|-------|
| Speed | ⚡ Very Fast | 🐌 Slower |
| Cost | 💰 Very Cheap | 💸 Expensive |
| Quality | 🎯 Good | 🏆 Excellent |
| Free Tier | ✅ Generous | ❌ Limited |
| Multimodal | ✅ Yes | ✅ Yes |

## 🛡️ Security Best Practices

### 1. Environment Variables
```bash
# Never commit API keys
echo ".env.local" >> .gitignore
```

### 2. Rate Limiting
```javascript
// Gemini has built-in rate limiting
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

## 🔍 Troubleshooting

### Common Issues
1. **"API Key Invalid"**: Check key format and permissions
2. **"Quota Exceeded"**: Wait or upgrade plan
3. **"Model Not Found"**: Use correct model name
4. **"Content Filtered"**: Adjust prompt content

### Debug Mode
```javascript
console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');
```

## 📈 Performance Tips

### 1. Optimize Prompts
```javascript
// Good: Specific and concise
const prompt = `Generate 5 React interview questions for ${difficulty} level.`;

// Bad: Too verbose
const prompt = `Please generate exactly five interview questions about React...`;
```

### 2. Use Streaming (Optional)
```javascript
const result = await model.generateContentStream(prompt);
for await (const chunk of result.stream) {
  console.log(chunk.text());
}
```

### 3. Cache Responses
```javascript
const cache = new Map();
const getCachedResponse = async (key, fetcher) => {
  if (cache.has(key)) return cache.get(key);
  const result = await fetcher();
  cache.set(key, result);
  return result;
};
```

## 🎯 Next Steps

1. **Get API Key**: Follow steps above
2. **Install SDK**: `npm install @google/generative-ai`
3. **Update Code**: Replace OpenAI with Gemini
4. **Test Integration**: Run the app
5. **Monitor Usage**: Check Google AI Studio dashboard

## 📞 Support

- **Google AI Studio**: https://aistudio.google.com/
- **Gemini Documentation**: https://ai.google.dev/docs
- **Community**: https://developers.googleblog.com/

---

**✅ Gemini Flash is perfect for your mock interview system - fast, cheap, and effective!**
