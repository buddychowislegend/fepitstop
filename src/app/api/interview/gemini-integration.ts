// Gemini Flash Integration for Mock Interview System
// Replace the mock implementations with this real Gemini integration

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Generate AI questions for interview topics
export async function generateQuestions(topic: string, difficulty: string, count: number = 5) {
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
}

// Evaluate candidate answers with AI feedback
export async function evaluateAnswer(question: string, answer: string, topic: string) {
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
    console.error('Error evaluating answer with Gemini:', error);
    return {
      score: 7.0,
      strengths: ["Good technical knowledge"],
      improvements: ["Work on explaining concepts more clearly"],
      detailedFeedback: "Your answer shows understanding of the topic. Consider providing more specific examples."
    };
  }
}

// Generate follow-up questions based on the answer
export async function generateFollowUp(question: string, answer: string, topic: string) {
  try {
    const prompt = `Based on this interview answer, generate a relevant follow-up question:
    
    Original Question: ${question}
    Answer: ${answer}
    Topic: ${topic}
    
    Generate one follow-up question that would help assess the candidate's deeper understanding.
    Return only the question as a string.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text.trim();
  } catch (error) {
    console.error('Error generating follow-up with Gemini:', error);
    return "Can you provide more details about your approach?";
  }
}

// Generate comprehensive interview feedback
export async function generateInterviewFeedback(session: any) {
  try {
    const prompt = `Analyze this complete interview session and provide comprehensive feedback:
    
    Topic: ${session.topic}
    Difficulty: ${session.difficulty}
    Questions: ${session.questions.length}
    Answers: ${session.answers.length}
    
    Provide a JSON response with:
    1. overallScore (number 1-10)
    2. strengths (array of 3-5 strings)
    3. improvements (array of 3-5 strings)
    4. detailedFeedback (string)
    5. recommendations (array of 3 strings)
    
    Be comprehensive and constructive. Return only valid JSON.`;

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
      overallScore: 7.5,
      strengths: ["Good technical knowledge", "Clear communication"],
      improvements: ["Work on explaining concepts more clearly", "Practice with more complex scenarios"],
      detailedFeedback: "You demonstrated solid understanding of the topic. Your answers showed good technical knowledge, though there's room for improvement in explaining complex concepts more clearly.",
      recommendations: ["Practice with more advanced scenarios", "Work on time management", "Study system design patterns"]
    };
  } catch (error) {
    console.error('Error generating interview feedback with Gemini:', error);
    return {
      overallScore: 7.5,
      strengths: ["Good technical knowledge"],
      improvements: ["Work on explaining concepts more clearly"],
      detailedFeedback: "You demonstrated solid understanding of the topic.",
      recommendations: ["Practice with more advanced scenarios"]
    };
  }
}

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

  return fallbackQuestions[topic as keyof typeof fallbackQuestions] || [
    "Explain your approach to this problem",
    "What are the trade-offs of your solution?",
    "How would you handle edge cases?",
    "Can you provide a code example?",
    "What would you do differently next time?"
  ];
}

// Usage example in your API route:
/*
export async function POST(request: NextRequest) {
  try {
    const { action, topic, difficulty, question, answer, sessionId } = await request.json();

    switch (action) {
      case 'generate-questions':
        const questions = await generateQuestions(topic, difficulty, 5);
        return NextResponse.json({ 
          success: true, 
          questions,
          sessionId: sessionId || Date.now().toString()
        });

      case 'evaluate-answer':
        const feedback = await evaluateAnswer(question, answer, topic);
        return NextResponse.json({ 
          success: true, 
          feedback 
        });

      case 'generate-followup':
        const followupQuestion = await generateFollowUp(question, answer, topic);
        return NextResponse.json({ 
          success: true, 
          followupQuestion 
        });

      case 'generate-interview-feedback':
        const interviewFeedback = await generateInterviewFeedback(sessionData);
        return NextResponse.json({ 
          success: true, 
          feedback: interviewFeedback 
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
*/
