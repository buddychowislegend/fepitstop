const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash-exp'; // Use Gemini 2.0 Flash

// In-memory storage for interview sessions (replace with DB in production)
const interviewSessions = new Map();

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

Question types to cover:
- JavaScript fundamentals (closures, promises, async/await)
- React concepts (hooks, state management, lifecycle)
- CSS and layout (flexbox, grid, responsive design)
- Performance optimization
- Browser APIs and DOM manipulation
- One system design question (if time permits)

Evaluation criteria:
- Technical accuracy
- Communication clarity
- Problem-solving approach
- Code quality (if coding)
- Understanding of trade-offs

Keep responses concise (2-3 paragraphs max) to maintain conversation flow.`;

// Start a new interview session
router.post('/start', auth, async (req, res) => {
  try {
    const { level, focus } = req.body; // level: 'junior' | 'mid' | 'senior', focus: 'javascript' | 'react' | 'fullstack'
    
    const sessionId = `interview_${req.user.id}_${Date.now()}`;
    
    // Initialize session
    const session = {
      id: sessionId,
      userId: req.user.id,
      level: level || 'mid',
      focus: focus || 'fullstack',
      startTime: new Date(),
      messages: [],
      currentQuestion: 0,
      totalQuestions: 7,
      score: null,
      feedback: null,
      status: 'active'
    };
    
    interviewSessions.set(sessionId, session);
    
    // Generate initial greeting from AI
    const initialPrompt = `Start a frontend interview for a ${level || 'mid-level'} position with focus on ${focus || 'fullstack frontend development'}. Greet the candidate and ask the first question.`;
    
    const aiResponse = await callGemini([
      { role: 'user', content: INTERVIEWER_SYSTEM_PROMPT },
      { role: 'user', content: initialPrompt }
    ]);
    
    session.messages.push({
      role: 'interviewer',
      content: aiResponse,
      timestamp: new Date()
    });
    
    res.json({
      sessionId,
      message: aiResponse,
      questionNumber: 1,
      totalQuestions: session.totalQuestions
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
});

// Send user response and get next question
router.post('/respond', auth, async (req, res) => {
  try {
    const { sessionId, message, isVoice } = req.body;
    
    const session = interviewSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }
    
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Add user message to history
    session.messages.push({
      role: 'candidate',
      content: message,
      timestamp: new Date(),
      isVoice: isVoice || false
    });
    
    // Build conversation history for context
    const conversationHistory = [
      { role: 'user', content: INTERVIEWER_SYSTEM_PROMPT },
      ...session.messages.map(msg => ({
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
    
    // Check if interview should end
    const shouldEnd = session.currentQuestion >= session.totalQuestions;
    
    res.json({
      message: aiResponse,
      questionNumber: session.currentQuestion + 1,
      totalQuestions: session.totalQuestions,
      shouldEnd
    });
  } catch (error) {
    console.error('Respond error:', error);
    res.status(500).json({ error: 'Failed to process response' });
  }
});

// End interview and get final feedback
router.post('/end', auth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = interviewSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }
    
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Generate final evaluation
    const conversationHistory = [
      { role: 'user', content: INTERVIEWER_SYSTEM_PROMPT },
      ...session.messages.map(msg => ({
        role: msg.role === 'interviewer' ? 'model' : 'user',
        content: msg.content
      })),
      { 
        role: 'user', 
        content: `The interview is now complete. Please provide:
1. Overall score (out of 10)
2. Strengths demonstrated
3. Areas for improvement
4. Specific recommendations for study
5. Overall assessment

Format your response clearly with sections.` 
      }
    ];
    
    const feedback = await callGemini(conversationHistory);
    
    session.status = 'completed';
    session.endTime = new Date();
    session.feedback = feedback;
    
    // Extract score from feedback (simple regex)
    const scoreMatch = feedback.match(/score[:\s]+(\d+)/i);
    session.score = scoreMatch ? parseInt(scoreMatch[1]) : null;
    
    res.json({
      feedback,
      score: session.score,
      duration: Math.floor((session.endTime - session.startTime) / 1000 / 60), // in minutes
      questionsAsked: session.currentQuestion,
      transcript: session.messages
    });
  } catch (error) {
    console.error('End interview error:', error);
    res.status(500).json({ error: 'Failed to end interview' });
  }
});

// Get interview session
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const session = interviewSessions.get(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json({ session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Helper function to call Gemini API
async function callGemini(messages) {
  try {
    // Format messages for Gemini API
    const contents = messages.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
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
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE'
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API error:', error);
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini call error:', error);
    throw error;
  }
}

module.exports = router;

