import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for dev (replace with DB in production)
const sessions = new Map<string, any>();

// System prompt for AI interviewer
const INTERVIEWER_SYSTEM_PROMPT = `You are an experienced frontend interview conductor at a top tech company (Google, Meta, Amazon).

Your role:
1. Ask relevant frontend interview questions (JavaScript, React, CSS, HTML, System Design)
2. Follow up on user's answers with deeper questions
3. Provide hints if the user is stuck (but don't give away answers)
4. Evaluate answers and provide constructive feedback
5. Adapt difficulty based on user's performance
6. Be professional, encouraging, and supportive

Interview structure:
- Start with a warm greeting and brief introduction
- Ask 5-7 questions total
- Mix of theoretical and practical questions
- Include at least one coding problem
- End with user's questions and overall feedback

Keep responses concise (2-3 paragraphs max) to maintain conversation flow.`;

// Helper to call Gemini API
async function callGemini(messages: any[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  // Format messages for Gemini
  const contents = messages.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini API error:', error);
    throw new Error('Gemini API request failed');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, message, level, focus } = body;
    
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Simple token validation (in production, verify with JWT)
    if (!token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    switch (action) {
      case 'start': {
        const newSessionId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const session = {
          id: newSessionId,
          level: level || 'mid',
          focus: focus || 'fullstack',
          startTime: new Date(),
          messages: [],
          currentQuestion: 0,
          totalQuestions: 7,
          status: 'active'
        };
        
        sessions.set(newSessionId, session);
        
        // Generate initial greeting
        const initialPrompt = `Start a frontend interview for a ${level || 'mid-level'} position with focus on ${focus || 'fullstack frontend development'}. Greet the candidate warmly and ask the first question. Be encouraging and professional.`;
        
        const aiResponse = await callGemini([
          { role: 'user', content: INTERVIEWER_SYSTEM_PROMPT },
          { role: 'user', content: initialPrompt }
        ]);
        
        session.messages.push({
          role: 'interviewer',
          content: aiResponse,
          timestamp: new Date()
        });
        
        return NextResponse.json({
          sessionId: newSessionId,
          message: aiResponse,
          questionNumber: 1,
          totalQuestions: session.totalQuestions
        });
      }
      
      case 'respond': {
        const session = sessions.get(sessionId);
        if (!session) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        
        // Add user message
        session.messages.push({
          role: 'candidate',
          content: message,
          timestamp: new Date()
        });
        
        // Build conversation history
        const conversationHistory = [
          { role: 'user', content: INTERVIEWER_SYSTEM_PROMPT },
          ...session.messages.map((msg: any) => ({
            role: msg.role === 'interviewer' ? 'model' : 'user',
            content: msg.content
          }))
        ];
        
        // Get AI response
        const aiResponse = await callGemini(conversationHistory);
        
        session.messages.push({
          role: 'interviewer',
          content: aiResponse,
          timestamp: new Date()
        });
        
        session.currentQuestion++;
        
        const shouldEnd = session.currentQuestion >= session.totalQuestions;
        
        return NextResponse.json({
          message: aiResponse,
          questionNumber: session.currentQuestion + 1,
          totalQuestions: session.totalQuestions,
          shouldEnd
        });
      }
      
      case 'end': {
        const session = sessions.get(sessionId);
        if (!session) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        
        // Generate final feedback
        const conversationHistory = [
          { role: 'user', content: INTERVIEWER_SYSTEM_PROMPT },
          ...session.messages.map((msg: any) => ({
            role: msg.role === 'interviewer' ? 'model' : 'user',
            content: msg.content
          })),
          { 
            role: 'user', 
            content: `The interview is complete. Provide comprehensive feedback with:\n1. Overall score (out of 10)\n2. Key strengths\n3. Areas for improvement\n4. Specific study recommendations\n\nBe constructive and specific.`
          }
        ];
        
        const feedback = await callGemini(conversationHistory);
        
        session.status = 'completed';
        session.endTime = new Date();
        session.feedback = feedback;
        
        // Extract score
        const scoreMatch = feedback.match(/score[:\s]+(\d+)/i);
        session.score = scoreMatch ? parseInt(scoreMatch[1]) : null;
        
        const duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60);
        
        return NextResponse.json({
          feedback,
          score: session.score,
          duration,
          questionsAsked: session.currentQuestion,
          transcript: session.messages
        });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('AI Interview API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

