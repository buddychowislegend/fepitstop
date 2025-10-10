# AI Mock Interview - Complete Guide

## 🤖 Overview

Your Frontend Pitstop now has an **AI-powered mock interview system** using Google's Gemini 2.0 Flash model. This feature provides realistic interview practice with intelligent follow-up questions, adaptive difficulty, and comprehensive feedback.

**Current Status:** Development mode only

---

## ✨ Features

### 1. **Intelligent Questioning**
- AI asks relevant frontend interview questions
- Covers JavaScript, React, CSS, HTML, System Design
- Adapts difficulty based on user's answers
- Provides hints when user is stuck

### 2. **Multi-Modal Input**
- ✅ **Text Input**: Type your answers
- ✅ **Voice Input**: Speak your answers (Web Speech API)
- ✅ **Voice Output**: AI reads questions aloud (Text-to-Speech)

### 3. **Natural Conversation Flow**
- Follow-up questions based on your answers
- Professional and encouraging tone
- Simulates real interview environment
- Contextual hints and guidance

### 4. **Comprehensive Feedback**
- Overall score (out of 10)
- Strengths demonstrated
- Areas for improvement
- Specific study recommendations
- Complete interview transcript

### 5. **Customizable Experience**
- **Level**: Junior / Mid / Senior
- **Focus**: JavaScript / React / Fullstack
- 7 questions per interview
- 15-20 minute duration

---

## 🔧 Setup Instructions

### Step 1: Get Gemini API Key

**You already have one, but here's how to get a new one if needed:**

1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy your API key (starts with `AIza...`)

### Step 2: Add to Backend Environment

**Local Development:**

Update `backend/.env`:
```bash
GEMINI_API_KEY=AIzaSy...your_key_here
NODE_ENV=development
```

**Vercel (When Ready for Production):**
```bash
cd backend
vercel env add GEMINI_API_KEY production
# Enter your API key when prompted

# Also set NODE_ENV
vercel env add NODE_ENV production
# Enter: production
```

### Step 3: Enable AI Interview Routes

The AI interview routes are already configured to load **only in development mode**:

```javascript
// backend/server.js
const aiInterviewRoutes = process.env.NODE_ENV !== 'production' 
  ? require('./routes/ai-interview')
  : null;

if (aiInterviewRoutes) {
  app.use('/api/ai-interview', aiInterviewRoutes);
  console.log('✅ AI Interview routes enabled (dev mode)');
}
```

**In Development:** Routes are active
**In Production:** Routes are disabled (until you're ready)

---

## 🎯 How It Works

### Interview Flow

```
1. User selects level (Junior/Mid/Senior) and focus (JS/React/Fullstack)
   ↓
2. AI generates personalized greeting and first question
   ↓
3. User answers (text or voice)
   ↓
4. AI analyzes answer and asks follow-up question
   ↓
5. Repeat for 7 questions total
   ↓
6. AI generates comprehensive feedback with score
   ↓
7. User sees transcript and recommendations
```

### AI System Prompt

The AI acts as an experienced frontend interviewer from top tech companies:

**Responsibilities:**
- Ask relevant frontend questions
- Follow up based on answers
- Provide hints (without giving away answers)
- Evaluate responses
- Adapt difficulty dynamically
- Be professional and encouraging

**Question Coverage:**
- JavaScript fundamentals
- React concepts
- CSS and layouts
- Performance optimization
- Browser APIs
- System design

**Evaluation Criteria:**
- Technical accuracy
- Communication clarity
- Problem-solving approach
- Code quality
- Understanding of trade-offs

---

## 📡 API Endpoints

### Start Interview
```
POST /api/ai-interview/start
Authorization: Bearer <token>

Body:
{
  "level": "mid",        // junior | mid | senior
  "focus": "fullstack"   // javascript | react | fullstack
}

Response:
{
  "sessionId": "interview_123_1234567890",
  "message": "Hi! I'm your AI interviewer today...",
  "questionNumber": 1,
  "totalQuestions": 7
}
```

### Send Response
```
POST /api/ai-interview/respond
Authorization: Bearer <token>

Body:
{
  "sessionId": "interview_123_1234567890",
  "message": "User's answer here",
  "isVoice": false
}

Response:
{
  "message": "Great answer! Now, can you explain...",
  "questionNumber": 2,
  "totalQuestions": 7,
  "shouldEnd": false
}
```

### End Interview
```
POST /api/ai-interview/end
Authorization: Bearer <token>

Body:
{
  "sessionId": "interview_123_1234567890"
}

Response:
{
  "feedback": "Overall Score: 8/10\n\nStrengths:...",
  "score": 8,
  "duration": 18,  // minutes
  "questionsAsked": 7,
  "transcript": [...]
}
```

### Get Session
```
GET /api/ai-interview/session/:sessionId
Authorization: Bearer <token>

Response:
{
  "session": {
    "id": "interview_123_1234567890",
    "userId": "123",
    "level": "mid",
    "focus": "fullstack",
    "messages": [...],
    "score": 8,
    "status": "completed"
  }
}
```

---

## 🎨 Frontend Features

### Setup Screen
- Select experience level (Junior/Mid/Senior)
- Choose focus area (JavaScript/React/Fullstack)
- See what to expect
- Start button

### Interview Screen
- **Header**: Progress indicator, current question number
- **Chat Interface**: Messages from AI and user
- **Text Input**: Multi-line textarea with Enter to send
- **Voice Input**: Microphone button for speech-to-text
- **Voice Output**: AI can read questions aloud
- **End Button**: Exit interview early

### Feedback Screen
- **Score**: Overall rating out of 10
- **Duration**: Total time taken
- **Questions**: Number asked
- **Detailed Feedback**: Strengths, weaknesses, recommendations
- **Transcript**: Complete conversation history
- **Actions**: Start new interview or back to profile

---

## 🎤 Voice Features

### Speech-to-Text (Voice Input)
**Technology:** Web Speech API

**How it works:**
1. Click microphone button
2. Speak your answer
3. Speech automatically converted to text
4. Text appears in input box
5. Send when done

**Browser Support:**
- ✅ Chrome/Edge (full support)
- ✅ Safari (iOS 14+)
- ⚠️ Firefox (limited support)

### Text-to-Speech (Voice Output)
**Technology:** Web Speech Synthesis API

**How it works:**
1. Click "🔊 Read aloud" on AI messages
2. Browser reads message out loud
3. Adjustable speed, pitch, volume

**Browser Support:**
- ✅ All modern browsers

---

## 🔒 Security & Privacy

### Session Management
- Sessions stored in memory (development)
- Each session linked to authenticated user
- Automatic session validation
- Protected endpoints (auth required)

### Data Handling
- Interview data not persisted (dev mode)
- No personal information shared with Gemini
- Conversation history used for context only
- User can end interview anytime

### Production Considerations
- Store sessions in MongoDB
- Add session expiry (30 minutes)
- Implement session cleanup
- Add rate limiting
- Monitor API usage

---

## 💰 Cost Considerations

### Gemini API Pricing
**Gemini 2.0 Flash:**
- **Input**: $0.075 per 1M tokens
- **Output**: $0.30 per 1M tokens

**Average Interview:**
- Input: ~5,000 tokens (conversation + context)
- Output: ~2,000 tokens (AI responses)
- **Cost per interview**: ~$0.001 (₹0.08)

**At Scale:**
- 100 interviews/day = ₹8/day = ₹240/month
- 1,000 interviews/day = ₹80/day = ₹2,400/month

**Very affordable!** ✅

### Rate Limiting Recommendations
- Free users: 2 interviews per day
- Pro users: 10 interviews per day
- Add cooldown period (1 hour between interviews)

---

## 🧪 Testing

### Test in Development Mode

**Step 1: Start Backend**
```bash
cd backend
npm run dev
```

**Step 2: Start Frontend**
```bash
cd ..
npm run dev
```

**Step 3: Test AI Interview**
1. Visit: http://localhost:3000/mock-interview
2. Should redirect to: http://localhost:3000/ai-interview
3. Sign in if not already
4. Select level and focus
5. Click "Start Interview"
6. Answer questions
7. Complete interview and see feedback

### Test Checklist
- [ ] Interview starts successfully
- [ ] AI asks relevant questions
- [ ] Can send text responses
- [ ] Voice input works (if supported)
- [ ] AI provides follow-up questions
- [ ] Interview ends after 7 questions
- [ ] Feedback is generated
- [ ] Score is displayed
- [ ] Transcript is available

---

## 🚀 Going to Production

### Step 1: Test Thoroughly in Dev
- Run 10+ mock interviews
- Test different levels and focuses
- Verify feedback quality
- Check edge cases

### Step 2: Update Environment Check
Change `backend/server.js`:
```javascript
// Enable in production
const aiInterviewRoutes = require('./routes/ai-interview');
app.use('/api/ai-interview', aiInterviewRoutes);
```

### Step 3: Add Database Persistence
Update `ai-interview.js` to store sessions in MongoDB:
```javascript
// Replace Map with MongoDB
const Session = require('../models/InterviewSession');

// Create session
const session = new Session({
  userId: req.user.id,
  level,
  focus,
  messages: [],
  // ...
});
await session.save();
```

### Step 4: Add Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const interviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2, // 2 interviews per hour for free users
  message: 'Too many interviews. Please try again later.'
});

router.post('/start', auth, interviewLimiter, async (req, res) => {
  // ...
});
```

### Step 5: Monitor Usage
- Track API calls in Gemini dashboard
- Monitor costs
- Set up billing alerts
- Analyze user feedback

---

## 📊 Analytics Integration

### Metrics to Track
- Total interviews started
- Completion rate
- Average score
- Average duration
- Popular focus areas
- User satisfaction

### Database Schema for Production
```javascript
{
  userId: ObjectId,
  sessionId: String,
  level: String,
  focus: String,
  startTime: Date,
  endTime: Date,
  messages: Array,
  score: Number,
  feedback: String,
  status: String,
  duration: Number,
  questionsAsked: Number
}
```

---

## 🎯 Future Enhancements

### Phase 2 Features
- [ ] Save interview history
- [ ] Review past interviews
- [ ] Compare performance over time
- [ ] Share interview results
- [ ] Leaderboard for scores

### Phase 3 Features
- [ ] Video interviews (camera support)
- [ ] Screen sharing for coding
- [ ] Live code editor during interview
- [ ] Multiple AI interviewer personas
- [ ] Company-specific interview styles

### Premium Features
- [ ] Unlimited interviews for Pro users
- [ ] Priority access to AI
- [ ] Advanced feedback analysis
- [ ] Personalized study plans based on interviews
- [ ] 1:1 review of AI interview with human expert

---

## 🔍 Troubleshooting

### Issue: AI not responding
**Check:**
1. GEMINI_API_KEY is set in .env
2. Backend server is running
3. NODE_ENV is set correctly
4. Check browser console for errors

### Issue: Voice input not working
**Check:**
1. Browser supports Web Speech API (Chrome/Safari)
2. Microphone permissions granted
3. HTTPS connection (required for mic access)
4. Try different browser

### Issue: "Development mode only" error
**Solution:**
- This is expected in production
- Feature is intentionally disabled
- Enable by changing NODE_ENV check

---

## 📚 Resources

### Documentation
- Gemini API Docs: https://ai.google.dev/docs
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- Speech Recognition: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition

### Related Files
- Backend: `backend/routes/ai-interview.js`
- Frontend: `src/app/ai-interview/page.tsx`
- Redirect: `src/app/mock-interview/page.tsx`

---

## ✅ Quick Start

### Local Development

1. **Set environment variable:**
   ```bash
   cd backend
   echo "GEMINI_API_KEY=your_key_here" >> .env
   echo "NODE_ENV=development" >> .env
   ```

2. **Start servers:**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd ..
   npm run dev
   ```

3. **Test interview:**
   ```
   Visit: http://localhost:3000/mock-interview
   Or: http://localhost:3000/ai-interview
   ```

4. **Sign in and start interview!**

---

## 🎉 Summary

**What's Implemented:**
- ✅ AI interview backend with Gemini 2.0 Flash
- ✅ Text and voice input support
- ✅ Voice output (read aloud)
- ✅ Session management
- ✅ Intelligent questioning
- ✅ Follow-up questions
- ✅ Scoring and feedback
- ✅ Interview transcript
- ✅ Beautiful UI
- ✅ Dev-only mode

**Features:**
- 🤖 AI-powered interviews
- 🎤 Voice input/output
- 💬 Natural conversation
- 📊 Detailed feedback
- 🎯 Customizable (level + focus)
- ⏱️ Progress tracking

**Cost:** ~₹0.08 per interview (very affordable!)

**Your AI interview system is ready to test in development mode!** 🚀

---

**Need Help?**
- Check browser console for errors
- Verify GEMINI_API_KEY is set
- Ensure NODE_ENV=development
- Test with different browsers

**Ready to Launch in Production?**
- Follow "Going to Production" section above
- Add database persistence
- Implement rate limiting
- Monitor usage and costs

Good luck with AI interviews! 🎉

