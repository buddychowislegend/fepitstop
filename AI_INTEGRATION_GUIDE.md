# AI Integration Guide for Mock Interview System

This guide explains how to integrate real AI services into the mock interview system.

## 🚀 Current Implementation

The system currently uses **mock AI services** that simulate real AI behavior. To make it production-ready, you need to integrate with actual AI providers.

## 🔧 AI Services Integration

### 1. OpenAI Integration

#### Environment Variables
```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key_here
```

#### Question Generation
Replace the mock implementation in `/src/app/api/interview/route.ts`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateQuestions = async (topic: string, difficulty: string, count: number = 5) => {
  const prompt = `Generate ${count} interview questions for ${topic} at ${difficulty} level. 
  Focus on practical, real-world scenarios that would be asked in frontend engineering interviews.`;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1000,
  });
  
  return JSON.parse(completion.choices[0].message.content);
};
```

#### Answer Evaluation
```typescript
const generateFeedback = async (question: string, answer: string, topic: string) => {
  const prompt = `Evaluate this interview answer:
  
  Question: ${question}
  Answer: ${answer}
  Topic: ${topic}
  
  Provide:
  1. Score (1-10)
  2. 3 strengths
  3. 3 areas for improvement
  4. Detailed feedback
  
  Format as JSON.`;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
  });
  
  return JSON.parse(completion.choices[0].message.content);
};
```

### 2. Speech-to-Text (OpenAI Whisper)

#### Environment Variables
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

#### Implementation
Replace the mock in `/src/app/api/speech-to-text/route.ts`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const transcribeAudio = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  
  const response = await openai.audio.transcriptions.create({
    file: audioBlob,
    model: "whisper-1",
  });
  
  return response.text;
};
```

### 3. Text-to-Speech (OpenAI TTS)

#### Implementation
Replace the mock in `/src/app/api/text-to-speech/route.ts`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateSpeech = async (text: string, voice: string = 'alloy') => {
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: voice,
    input: text,
  });
  
  const buffer = Buffer.from(await response.arrayBuffer());
  const base64 = buffer.toString('base64');
  
  return {
    audioUrl: `data:audio/mp3;base64,${base64}`,
    duration: Math.ceil(text.length / 10),
    voice: voice
  };
};
```

## 🗄️ Database Integration

### Option 1: Supabase (Recommended)

#### Setup
1. Create a Supabase project
2. Install the client: `npm install @supabase/supabase-js`

#### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Database Schema
```sql
-- Interview sessions table
CREATE TABLE interview_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  topic VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'in-progress',
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  questions JSONB,
  answers JSONB,
  feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User answers table
CREATE TABLE user_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES interview_sessions(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  audio_url TEXT,
  feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Implementation
Replace the mock database in `/src/app/api/interview-sessions/route.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const { action, sessionData, sessionId, answer, feedback } = await request.json();

  switch (action) {
    case 'create-session':
      const { data, error } = await supabase
        .from('interview_sessions')
        .insert([{
          user_id: sessionData.userId,
          topic: sessionData.topic,
          difficulty: sessionData.difficulty,
          questions: sessionData.questions,
          status: 'in-progress'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json({ success: true, session: data });
  }
}
```

### Option 2: PostgreSQL with Prisma

#### Setup
1. Install Prisma: `npm install prisma @prisma/client`
2. Initialize: `npx prisma init`

#### Schema
```prisma
// prisma/schema.prisma
model InterviewSession {
  id        String   @id @default(cuid())
  userId    String
  topic     String
  difficulty String
  status    String   @default("in-progress")
  startTime DateTime
  endTime   DateTime?
  questions Json
  answers   Json     @default("[]")
  feedback  Json?
  createdAt DateTime @default(now())
}
```

## 🎯 Advanced Features

### 1. Real-time Interview with WebRTC
```typescript
// Real-time audio streaming
const startRealTimeInterview = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  
  mediaRecorder.ondataavailable = async (event) => {
    // Stream audio to AI for real-time feedback
    const transcription = await transcribeAudio(event.data);
    // Get real-time feedback
    const feedback = await getRealTimeFeedback(transcription);
  };
};
```

### 2. Video Interview Support
```typescript
// Add video recording for complete interview simulation
const startVideoInterview = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    audio: true, 
    video: { width: 1280, height: 720 } 
  });
  
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9'
  });
};
```

### 3. Advanced Analytics
```typescript
// Track interview performance metrics
const analyzePerformance = (session: InterviewSession) => {
  const metrics = {
    averageAnswerTime: calculateAverageTime(session.answers),
    confidenceScore: analyzeConfidence(session.answers),
    technicalAccuracy: evaluateTechnicalAccuracy(session.answers),
    communicationScore: evaluateCommunication(session.answers)
  };
  
  return metrics;
};
```

## 🔐 Security Considerations

### 1. API Rate Limiting
```typescript
// Implement rate limiting for AI API calls
const rateLimiter = new Map();

const checkRateLimit = (userId: string) => {
  const now = Date.now();
  const userCalls = rateLimiter.get(userId) || [];
  const recentCalls = userCalls.filter((time: number) => now - time < 60000);
  
  if (recentCalls.length >= 10) {
    throw new Error('Rate limit exceeded');
  }
  
  rateLimiter.set(userId, [...recentCalls, now]);
};
```

### 2. Content Moderation
```typescript
// Moderate AI-generated content
const moderateContent = async (text: string) => {
  const response = await openai.moderations.create({
    input: text,
  });
  
  if (response.results[0].flagged) {
    throw new Error('Content flagged by moderation');
  }
};
```

## 📊 Monitoring and Analytics

### 1. Performance Tracking
```typescript
// Track AI service performance
const trackAIPerformance = async (service: string, duration: number, success: boolean) => {
  await fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({
      service,
      duration,
      success,
      timestamp: new Date()
    })
  });
};
```

### 2. User Analytics
```typescript
// Track user interview patterns
const trackUserProgress = (userId: string, session: InterviewSession) => {
  // Analyze improvement over time
  // Identify weak areas
  // Suggest personalized learning paths
};
```

## 🚀 Deployment Considerations

### 1. Environment Variables
```bash
# Production environment
OPENAI_API_KEY=your_production_key
SUPABASE_URL=your_production_url
SUPABASE_ANON_KEY=your_production_key
```

### 2. API Optimization
```typescript
// Cache AI responses to reduce costs
const cache = new Map();

const getCachedResponse = async (key: string, fetcher: () => Promise<any>) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = await fetcher();
  cache.set(key, result);
  return result;
};
```

## 💰 Cost Optimization

### 1. Smart Caching
- Cache common questions and feedback
- Use cheaper models for simple tasks
- Implement response compression

### 2. Usage Monitoring
```typescript
// Monitor API usage and costs
const trackUsage = (service: string, tokens: number, cost: number) => {
  // Log usage for billing and optimization
};
```

This guide provides a complete roadmap for integrating real AI services into your mock interview system. Start with OpenAI integration and gradually add more advanced features as needed.
