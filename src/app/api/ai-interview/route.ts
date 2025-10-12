import { NextRequest, NextResponse } from 'next/server';

// Types
type Message = {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
};

type Interviewer = {
  id: string;
  name: string;
  role: string;
  company: string;
  experience: string;
  avatar: string;
  specialties: string[];
  gender: 'male' | 'female';
};

type Session = {
  id: string;
  interviewer?: Interviewer;
  level: string;
  focus: string;
  startTime: Date;
  endTime?: Date;
  messages: Message[];
  currentQuestion: number;
  totalQuestions: number;
  score?: number | null;
  feedback?: string;
  status: 'active' | 'completed';
};

// Simple in-memory storage for dev (replace with DB in production)
const sessions = new Map<string, Session>();

// System prompt for AI interviewer
const INTERVIEWER_SYSTEM_PROMPT = `You are an experienced frontend interview conductor at a top tech company (Google, Meta, Amazon).

Your role:
1. Ask relevant frontend interview questions (JavaScript, React, CSS, HTML, System Design)
2. Focus on THEORETICAL questions for this interview - NO CODING PROBLEMS
3. Follow up on user's answers with deeper questions
4. Provide hints if the user is stuck (but don't give away answers)
5. Evaluate answers and provide constructive feedback
6. Adapt difficulty based on user's performance
7. Be professional, encouraging, and supportive

Interview structure:
- Start with a warm greeting and brief introduction
- Ask 5-7 THEORETICAL questions total (concepts, best practices, architecture)
- NO CODING PROBLEMS - focus on understanding and knowledge
- Ask follow-up questions based on their answers
- End with overall feedback and recommendations

Keep responses concise (2-3 sentences max) to maintain conversation flow.
Always end your response with "What's your answer?" to prompt the candidate.`;

// Helper to call Gemini API
async function callGemini(messages: any[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('callGemini - API Key exists:', !!apiKey);
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  // Format messages for Gemini
  const contents = messages.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  
  console.log('callGemini - Sending request with', contents.length, 'messages');
  
  try {
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

    console.log('callGemini - Response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error response:', error);
      throw new Error(`Gemini API request failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('callGemini - Response received, has candidates:', !!data.candidates);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('callGemini - Invalid response structure:', JSON.stringify(data));
      throw new Error('Invalid response from Gemini API');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    console.error('callGemini - Error:', error.message);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== AI Interview API Called ===');
    
    const body = await request.json();
    const { action, sessionId, message, level, focus, interviewer } = body;
    
    console.log('Action:', action);
    console.log('Body keys:', Object.keys(body));
    
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Simple token validation (in production, verify with JWT)
    if (!token) {
      console.error('No token found');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    console.log('Token validated');
    
    switch (action) {
      case 'start': {
        try {
          const newSessionId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          console.log('Starting new interview session:', newSessionId);
          console.log('Interviewer:', interviewer?.name);
          console.log('Level:', level, 'Focus:', focus);
          
          const session: Session = {
            id: newSessionId,
            interviewer: interviewer,
            level: level || 'mid',
            focus: focus || 'fullstack',
            startTime: new Date(),
            messages: [],
            currentQuestion: 0,
            totalQuestions: 7,
            status: 'active' as const
          };
          
          sessions.set(newSessionId, session);
          console.log('Session created and stored');
          
          // Generate initial greeting
          const initialPrompt = `Start a frontend interview for a ${level || 'mid-level'} position with focus on ${focus || 'fullstack frontend development'}. Greet the candidate warmly and ask the first question. Be encouraging and professional.`;
          
          console.log('Calling Gemini API for initial greeting...');
          const aiResponse = await callGemini([
            { role: 'user', content: INTERVIEWER_SYSTEM_PROMPT },
            { role: 'user', content: initialPrompt }
          ]);
          console.log('Got initial AI response:', aiResponse.substring(0, 100) + '...');
        
          session.messages.push({
            role: 'interviewer',
            content: aiResponse,
            timestamp: new Date()
          });
          
          console.log('Returning success response');
          
          return NextResponse.json({
            sessionId: newSessionId,
            message: aiResponse,
            questionNumber: 1,
            totalQuestions: session.totalQuestions
          });
        } catch (error: any) {
          console.error('Error in start action:', error);
          return NextResponse.json({ 
            error: 'Failed to start interview', 
            details: error.message 
          }, { status: 500 });
        }
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
        console.log('Calling Gemini with conversation history:', conversationHistory.length, 'messages');
        const aiResponse = await callGemini(conversationHistory);
        console.log('Got AI response:', aiResponse);
        
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
        
        console.log('Ending interview, session:', sessionId);
        console.log('Messages count:', session.messages.length);
        
        // Generate per-question analysis
        const questionAnalysis = [];
        const qaExchanges: any[] = [];
        
        try {
          // Group messages into Q&A pairs
          for (let i = 0; i < session.messages.length; i++) {
            if (session.messages[i].role === 'interviewer') {
              const question = session.messages[i];
              const answer = session.messages[i + 1];
              
              if (answer && answer.role === 'candidate') {
                qaExchanges.push({
                  question: question.content,
                  answer: answer.content,
                  questionNumber: qaExchanges.length + 1
                });
                i++; // Skip the answer in next iteration
              }
            }
          }
          
          console.log('Found Q&A pairs:', qaExchanges.length);
          
          // Get detailed analysis for each Q&A pair (with timeout protection)
          for (const qa of qaExchanges) {
            try {
              const analysisPrompt = `Analyze this interview question and answer. Respond ONLY with valid JSON:

Question: ${qa.question}
Answer: ${qa.answer}

JSON format:
{
  "score": 7,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "feedback": "Brief constructive feedback"
}`;

              console.log(`Analyzing Q${qa.questionNumber}...`);
              
              const analysisText = await Promise.race([
                callGemini([
                  { role: 'user', content: analysisPrompt }
                ]),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Analysis timeout')), 10000)
                )
              ]) as string;
              
              console.log(`Q${qa.questionNumber} analysis response:`, analysisText.substring(0, 100));
              
              // Try to parse JSON from response
              const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  const analysis = JSON.parse(jsonMatch[0]);
                  questionAnalysis.push({
                    questionNumber: qa.questionNumber,
                    question: qa.question,
                    answer: qa.answer,
                    score: analysis.score || 7,
                    strengths: analysis.strengths || ['Attempted to answer'],
                    improvements: analysis.improvements || ['Could provide more detail'],
                    feedback: analysis.feedback || 'Good effort'
                  });
                  console.log(`Q${qa.questionNumber} analyzed successfully`);
                } catch (parseError) {
                  console.error(`JSON parse error for Q${qa.questionNumber}:`, parseError);
                  throw parseError;
                }
              } else {
                console.warn(`No JSON found in response for Q${qa.questionNumber}`);
                throw new Error('No JSON in response');
              }
            } catch (error) {
              console.error(`Error analyzing Q${qa.questionNumber}:`, error);
              // Add fallback analysis
              questionAnalysis.push({
                questionNumber: qa.questionNumber,
                question: qa.question,
                answer: qa.answer,
                score: 7,
                strengths: ['Participated in the interview', 'Attempted to answer the question'],
                improvements: ['Could provide more detailed explanations'],
                feedback: 'Good effort on this question. Keep practicing to improve your answers.'
              });
            }
          }
        } catch (error) {
          console.error('Error in per-question analysis:', error);
          // Continue without per-question analysis if it fails
        }
        
        // Generate overall feedback
        let feedback = 'Great job completing the interview! You demonstrated good communication skills and technical knowledge.';
        let overallScore = null;
        
        try {
          console.log('Generating overall feedback...');
          const conversationHistory = [
            { role: 'user', content: INTERVIEWER_SYSTEM_PROMPT },
            ...session.messages.map((msg: any) => ({
              role: msg.role === 'interviewer' ? 'model' : 'user',
              content: msg.content
            })),
            { 
              role: 'user', 
              content: `The interview is complete. Provide comprehensive overall feedback with:\n1. Overall score (out of 10)\n2. Key strengths (3-5 points)\n3. Areas for improvement (3-5 points)\n4. Specific study recommendations\n\nBe constructive and specific.`
            }
          ];
          
          feedback = await Promise.race([
            callGemini(conversationHistory),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Feedback timeout')), 15000)
            )
          ]) as string;
          
          console.log('Overall feedback generated successfully');
          
          // Extract score from feedback
          const scoreMatch = feedback.match(/score[:\s]+(\d+)/i);
          if (scoreMatch) {
            overallScore = parseInt(scoreMatch[1]);
          }
        } catch (error) {
          console.error('Error generating overall feedback:', error);
          // Use fallback feedback
          feedback = `Thank you for completing the interview! 

Key Strengths:
- Demonstrated good communication skills
- Showed willingness to engage with questions
- Maintained professional demeanor throughout

Areas for Improvement:
- Continue practicing technical concepts
- Work on providing more detailed explanations
- Study common interview patterns

Overall Score: 7/10

Keep practicing and you'll continue to improve!`;
          overallScore = 7;
        }
        
        session.status = 'completed';
        session.endTime = new Date();
        session.feedback = feedback;
        
        // Calculate overall score from question scores
        const avgScore = questionAnalysis.length > 0
          ? Math.round(questionAnalysis.reduce((sum, qa) => sum + qa.score, 0) / questionAnalysis.length * 10) / 10
          : null;
        
        session.score = avgScore || overallScore || 7;
        
        const duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60);
        
        console.log('Interview ended successfully, score:', session.score);
        
        return NextResponse.json({
          feedback,
          score: session.score,
          duration,
          questionsAsked: session.currentQuestion,
          transcript: session.messages,
          questionAnalysis // New: detailed per-question analysis
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

