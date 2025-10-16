import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini Flash
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Generate AI questions using Gemini Flash
const generateQuestions = async (topic: string, difficulty: string, count: number = 5) => {
  try {
    const prompt = `Generate ${count} interview questions for ${topic} at ${difficulty} level. 
    Focus on practical, real-world scenarios that would be asked in frontend engineering interviews.
    Return only the questions as a JSON array of strings.
    
    Example format: ["Question 1", "Question 2", "Question 3"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      return questions;
    }
    
    // Fallback: split by lines if JSON parsing fails
    return text.split('\n').filter(line => line.trim().length > 0);
  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    // Fallback to predefined questions
    return getFallbackQuestions(topic);
  }
};

// Fallback questions if Gemini fails
function getFallbackQuestions(topic: string) {
  const fallbackQuestions = {
    'react-fundamentals': [
      "What is React and what problems does it solve?",
      "Explain the difference between functional and class components",
      "What are React hooks and why were they introduced?",
      "Explain useState and useEffect hooks",
      "What is the virtual DOM and how does it work?"
    ],
    'javascript-advanced': [
      "Explain closures in JavaScript with examples",
      "What is the difference between var, let, and const?",
      "Explain the prototype chain in JavaScript",
      "What are promises and how do they work?",
      "Explain async/await and how it relates to promises"
    ],
    'system-design': [
      "How would you design a scalable component library?",
      "Explain different state management patterns in React",
      "How would you optimize a React application for performance?",
      "Design a real-time chat application frontend",
      "How would you handle authentication in a SPA?"
    ],
    'css-advanced': [
      "Explain the difference between CSS Grid and Flexbox",
      "How do you create responsive designs with CSS Grid?",
      "Explain CSS custom properties (CSS variables)",
      "How do you implement CSS animations and transitions?",
      "What is the CSS box model?"
    ]
  };

  return fallbackQuestions[topic as keyof typeof fallbackQuestions] || [];
}

const generateFeedback = async (question: string, answer: string, topic: string) => {
  try {
    const prompt = `Evaluate this interview answer:
    
    Question: ${question}
    Answer: ${answer}
    Topic: ${topic}
    
    Provide a JSON response with:
    1. score (number 1-10)
    2. strengths (array of 3 strings)
    3. improvements (array of 3 strings)
    4. detailedFeedback (string)
    
    Be constructive and specific in your feedback. Return only valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const feedback = JSON.parse(jsonMatch[0]);
      return feedback;
    }
    
    // Fallback feedback
    return {
      score: 7.0,
      strengths: ["Good technical knowledge"],
      improvements: ["Work on explaining concepts more clearly"],
      detailedFeedback: "Your answer shows understanding of the topic. Consider providing more specific examples."
    };
  } catch (error) {
    console.error('Error generating feedback with Gemini:', error);
    // Fallback feedback
    return {
      score: 7.0,
      strengths: ["Good technical knowledge"],
      improvements: ["Work on explaining concepts more clearly"],
      detailedFeedback: "Your answer shows understanding of the topic. Consider providing more specific examples."
    };
  }
};

export async function POST(request: NextRequest) {
  try {
    const { action, topic, difficulty, question, answer, sessionId } = await request.json();

    switch (action) {
      case 'generate-questions':
        const questions = await generateQuestions(topic, difficulty);
        return NextResponse.json({ 
          success: true, 
          questions,
          sessionId: sessionId || Date.now().toString()
        });

      case 'evaluate-answer':
        const feedback = await generateFeedback(question, answer, topic);
        return NextResponse.json({ 
          success: true, 
          feedback 
        });

      case 'generate-followup':
        // Generate follow-up questions based on the answer
        const followupQuestions = [
          "Can you elaborate on that point?",
          "How would you handle edge cases?",
          "What are the trade-offs of your approach?",
          "Can you provide a code example?"
        ];
        return NextResponse.json({ 
          success: true, 
          followupQuestion: followupQuestions[Math.floor(Math.random() * followupQuestions.length)]
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Interview API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
