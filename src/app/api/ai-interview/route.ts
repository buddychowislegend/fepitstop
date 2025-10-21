import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const CANDIDATE_MODELS = ['gemini-2.0-flash-exp', 'gemini-1.5-flash-001', 'gemini-1.5-pro-001'];
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function callGeminiWithRetry(prompt: string): Promise<string> {
  const maxAttempts = 3;
  const baseDelayMs = 500;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim();
        console.log('[Gemini][ok]', { modelName, attempt });
        return text;
      } catch (err: any) {
        const msg = err?.message || String(err);
        const status = err?.status || err?.code;
        console.error('[Gemini][error]', { modelName, attempt, msg, status });
        lastError = err;
        // If 404 (model unsupported) or 429 (quota), try next model/attempt
        if (status === 404 || status === 429) {
          console.log(`[Gemini] Skipping ${modelName} due to ${status === 404 ? 'model not found' : 'quota exceeded'}`);
          continue;
        }
      }
    }
    // backoff
    const delay = baseDelayMs * Math.pow(2, attempt - 1);
    await new Promise((r) => setTimeout(r, delay));
  }
  throw lastError || new Error('Gemini failed after retries');
}

function buildContextPrefix(framework?: string, jdText?: string, profile?: string) {
  const role = profile
    ? profile === 'product' ? 'Role: Product Manager.'
      : profile === 'business' ? 'Role: Business Development.'
      : profile === 'qa' ? 'Role: QA Engineer.'
      : profile === 'hr' ? 'Role: HR.'
      : profile === 'backend' ? 'Role: Backend Engineer (Java Spring Boot).'
      : 'Role: Frontend Engineer.'
    : '';
  const fw = framework ? ` Framework: ${framework}.` : '';
  const jd = jdText ? ` Job Description Summary: ${jdText.slice(0, 1200)}.` : '';
  return `${role}${fw}${jd}`.trim();
}

// Enhanced interviewer personality traits
function getInterviewerPersonality(): string {
  const personalities = [
    "You are a senior technical interviewer with 10+ years of experience. You're professional, patient, and encouraging. You help candidates when they're stuck but maintain high standards.",
    "You are a senior engineering manager who conducts technical interviews. You're thorough, detail-oriented, and ask follow-up questions to understand the candidate's depth of knowledge.",
    "You are a principal engineer who interviews candidates. You're experienced, direct, and focus on practical problem-solving skills. You appreciate honesty and clear communication.",
    "You are a senior developer who conducts technical interviews. You're friendly but professional, and you look for both technical skills and communication abilities."
  ];
  
  return personalities[Math.floor(Math.random() * personalities.length)];
}

async function generateQuestion(opts: { level: string; focus?: string; framework?: string; jdText?: string; profile?: string; }) {
  const { level, focus, framework, jdText, profile } = opts;
  const context = buildContextPrefix(framework, jdText, profile);
  const personality = getInterviewerPersonality();
  const prompt = `${personality} ${context}
Generate ONE concise technical interview question tailored to the candidate.
- Difficulty: ${level}
${focus ? `- Focus area: ${focus}
` : ''}
${profile ? `- Target profile: ${profile}.
` : ''}
- Keep it specific to the mentioned framework and JD when provided.
- Make the question engaging and practical.
- Start with a brief, friendly introduction.
Return ONLY the question text.`;

  try {
    const text = await callGeminiWithRetry(prompt);
    return text.replace(/^"|"$/g, '');
  } catch (err: any) {
    console.error('[Gemini][start] error=', err?.message || err);
    throw err;
  }
}

// Enhanced response classification for handling nonsense questions
function classifyResponse(answer: string, previousQuestion: string): {
  type: 'nonsense' | 'off-topic' | 'incomplete' | 'inappropriate' | 'valid' | 'joke' | 'random';
  confidence: number;
  reason: string;
} {
  const lowerAnswer = answer.toLowerCase().trim();
  const lowerQuestion = previousQuestion.toLowerCase();
  
  // Detect nonsense responses
  const nonsensePatterns = [
    /^(lol|haha|hehe|lmao|rofl)$/,
    /^(yes|no|maybe|sure|ok|alright)$/,
    /^(i don't know|idk|dunno|not sure)$/,
    /^(what|huh|eh|um|uh)$/,
    /^(random|stuff|things|whatever)$/,
    /^(banana|pizza|cat|dog|elephant)$/,
    /^(123|456|789|abc|xyz)$/,
    /^(test|testing|hello|hi|hey)$/
  ];
  
  // Detect inappropriate content
  const inappropriatePatterns = [
    /(fuck|shit|damn|hell|bitch|ass)/,
    /(stupid|dumb|idiot|moron)/
  ];
  
  // Detect jokes or memes
  const jokePatterns = [
    /(why did the chicken|knock knock|dad joke)/,
    /(meme|joke|funny|haha)/,
    /(rick roll|rick and morty|meme)/
  ];
  
  // Detect off-topic responses
  const offTopicPatterns = [
    /(weather|food|sports|movie|music|game)/,
    /(politics|religion|personal life)/
  ];
  
  // Check for very short responses
  if (lowerAnswer.length < 10) {
    return { type: 'incomplete', confidence: 0.9, reason: 'Response too short' };
  }
  
  // Check for nonsense
  if (nonsensePatterns.some(pattern => pattern.test(lowerAnswer))) {
    return { type: 'nonsense', confidence: 0.95, reason: 'Matches nonsense patterns' };
  }
  
  // Check for inappropriate content
  if (inappropriatePatterns.some(pattern => pattern.test(lowerAnswer))) {
    return { type: 'inappropriate', confidence: 0.9, reason: 'Contains inappropriate language' };
  }
  
  // Check for jokes
  if (jokePatterns.some(pattern => pattern.test(lowerAnswer))) {
    return { type: 'joke', confidence: 0.8, reason: 'Appears to be a joke or meme' };
  }
  
  // Check for off-topic
  if (offTopicPatterns.some(pattern => pattern.test(lowerAnswer))) {
    return { type: 'off-topic', confidence: 0.7, reason: 'Seems off-topic' };
  }
  
  // Check if answer is completely unrelated to question
  const questionKeywords = lowerQuestion.split(' ').filter(word => word.length > 3);
  const answerKeywords = lowerAnswer.split(' ').filter(word => word.length > 3);
  const commonKeywords = questionKeywords.filter(keyword => 
    answerKeywords.some(answerWord => answerWord.includes(keyword) || keyword.includes(answerWord))
  );
  
  if (commonKeywords.length === 0 && answerKeywords.length > 5) {
    return { type: 'off-topic', confidence: 0.6, reason: 'No keyword overlap with question' };
  }
  
  return { type: 'valid', confidence: 0.8, reason: 'Appears to be a valid response' };
}

async function generateFollowUp(opts: { answer: string; previousQuestion: string; framework?: string; jdText?: string; level: string; focus?: string; profile?: string; }) {
  const { answer, previousQuestion, framework, jdText, level, focus, profile } = opts;
  const context = buildContextPrefix(framework, jdText, profile);
  
  // Classify the response first
  const responseClassification = classifyResponse(answer, previousQuestion);
  
  let prompt = '';
  
  if (responseClassification.type === 'nonsense') {
    const personality = getInterviewerPersonality();
    prompt = `${personality} ${context}
The candidate gave a nonsensical or inappropriate response: "${answer}"
Previous question: ${previousQuestion}

Respond professionally but firmly. You should:
1. Acknowledge their response briefly
2. Politely redirect them back to the technical question
3. Ask a more specific follow-up question
4. Maintain a professional tone
5. Show understanding that they might be nervous

Examples of good responses:
- "I understand you might be nervous. Let's focus on the technical aspect - [specific question]"
- "That's an interesting response. For this role, I'd like to understand [specific technical area]"
- "Let me rephrase that - [more specific technical question]"

Return ONLY your response as the interviewer.`;
  } else if (responseClassification.type === 'inappropriate') {
    const personality = getInterviewerPersonality();
    prompt = `${personality} ${context}
The candidate used inappropriate language: "${answer}"
Previous question: ${previousQuestion}

Respond professionally and redirect:
1. Briefly acknowledge without repeating the inappropriate content
2. Redirect to the technical question
3. Ask a more specific follow-up
4. Maintain professionalism
5. Show understanding but maintain boundaries

Return ONLY your response as the interviewer.`;
  } else if (responseClassification.type === 'joke') {
    const personality = getInterviewerPersonality();
    prompt = `${personality} ${context}
The candidate responded with a joke or meme: "${answer}"
Previous question: ${previousQuestion}

Respond professionally:
1. Acknowledge their attempt at humor briefly
2. Redirect to the serious technical discussion
3. Ask a more specific technical question
4. Maintain a professional but not overly stern tone
5. Show that you appreciate their attempt to lighten the mood

Return ONLY your response as the interviewer.`;
  } else if (responseClassification.type === 'off-topic') {
    const personality = getInterviewerPersonality();
    prompt = `${personality} ${context}
The candidate gave an off-topic response: "${answer}"
Previous question: ${previousQuestion}

Respond professionally:
1. Acknowledge their response briefly
2. Redirect them back to the technical question
3. Ask a more specific follow-up question
4. Help them understand what you're looking for
5. Be encouraging and supportive

Return ONLY your response as the interviewer.`;
  } else if (responseClassification.type === 'incomplete') {
    const personality = getInterviewerPersonality();
    prompt = `${personality} ${context}
The candidate gave a very brief response: "${answer}"
Previous question: ${previousQuestion}

Respond professionally:
1. Acknowledge their response
2. Ask for more detail or clarification
3. Provide a more specific follow-up question
4. Encourage them to elaborate
5. Show that you're interested in their thoughts

Return ONLY your response as the interviewer.`;
  } else {
    // Valid response - use original logic with enhanced personality
    const personality = getInterviewerPersonality();
    prompt = `${personality} ${context}
Given the previous question and the candidate's answer, generate the NEXT interview question.
- Previous question: ${previousQuestion}
- Candidate answer: ${answer}
- Difficulty: ${level}
${focus ? `- Focus: ${focus}
` : ''}
${profile ? `- Target profile: ${profile}.
` : ''}
Make the next question relevant to the framework/JD if given. 
- Acknowledge their previous answer briefly
- Build on their response naturally
- Ask a follow-up that shows interest in their approach
Return ONLY the question text.`;
  }
  
  try {
    const text = await callGeminiWithRetry(prompt);
    return text.replace(/^"|"$/g, '');
  } catch (err: any) {
    console.error('[Gemini][respond] error=', err?.message || err);
    throw err;
  }
}

async function generateEndSummary(opts: { framework?: string; jdText?: string; profile?: string; }) {
  const { framework, jdText, profile } = opts;
  const context = buildContextPrefix(framework, jdText, profile);
  const profileCriteria = profile === 'product'
    ? `Provide ratings for: product_sense, execution, strategy, communication.`
    : profile === 'business'
    ? `Provide ratings for: sales, partnerships, negotiation, GTM.`
    : profile === 'qa'
    ? `Provide ratings for: manual_testing, automation, test_strategy, tooling.`
    : profile === 'hr'
    ? `Provide ratings for: behavioral, culture_fit, processes, compliance.`
    : profile === 'backend'
    ? `Provide ratings for: java_knowledge, spring_framework, microservices, database_design, system_architecture.`
    : `Provide ratings for: javascript, framework_knowledge, system_design, communication.`;
  const prompt = `You are a senior interviewer. ${context}
Summarize the candidate's performance tailored to the selected role.
Return STRICT JSON with keys: {
  "summary": string,
  "strengths": string[],
  "improvements": string[],
  "categories": object // ${profileCriteria}
}
Do not include markdown fences or extra text.`;
  try {
    const text = await callGeminiWithRetry(prompt);
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      // attempt to extract JSON
      const match = text.match(/\{[\s\S]*\}/);
      json = match ? JSON.parse(match[0]) : null;
    }
    if (!json) {
      return {
        summary: 'Thanks for participating. We will prepare a detailed analysis.',
        strengths: [],
        improvements: [],
        categories: {}
      };
    }
    return json;
  } catch (err: any) {
    console.error('[Gemini][end] error=', err?.message || err);
    throw err;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body || {};

    if (action === 'start') {
      const { level = 'mid', focus, framework, jdText, profile } = body || {};
      try {
        const question = await generateQuestion({ level, focus, framework, jdText, profile });
        return NextResponse.json({ sessionId: Date.now().toString(), message: question });
      } catch (e: any) {
        // Graceful fallback (e.g., Gemini quota)
        const fw = profile ? profile : (framework || 'frontend');
        const jdHint = jdText ? ' (align to the job description context)' : '';
        const fallbackQ = `In ${fw}, how would you approach a relevant scenario${focus ? ` focused on ${focus}` : ''}? Please outline key trade-offs${jdHint}.`;
        return NextResponse.json({ sessionId: Date.now().toString(), message: fallbackQ, fallback: true });
      }
    }

    if (action === 'respond') {
      const { message: answer, previousQuestion, level = 'mid', focus, framework, jdText, profile } = body || {};
      try {
        const nextQ = await generateFollowUp({ answer, previousQuestion: previousQuestion || 'Previous question not provided', framework, jdText, level, focus, profile });
        return NextResponse.json({ message: nextQ });
      } catch (e: any) {
        const fw = profile ? profile : (framework || 'frontend');
        const jdHint = jdText ? ' considering the JD' : '';
        const followUp = `As a follow-up in ${fw}${jdHint}${focus ? ` focused on ${focus}` : ''}, what potential pitfalls or edge cases would you address, and how would you test them?`;
        return NextResponse.json({ message: followUp, fallback: true });
      }
    }

    if (action === 'end') {
      const { framework, jdText, profile, qaPairs } = body || {};
      try {
        const closing = await generateEndSummary({ framework, jdText, profile });
        // Compute per-question scoring if qaPairs provided
        const normalized: Array<{ question: string; answer: string }> = Array.isArray(qaPairs)
          ? qaPairs.filter((p: any) => p && typeof p.question === 'string').map((p: any) => ({ question: p.question, answer: String(p.answer || '') }))
          : [];
        const questionAnalysis = normalized.map((qa, idx) => {
          const len = qa.answer.trim().length;
          
          // Classify the response to adjust scoring
          const responseClassification = classifyResponse(qa.answer, qa.question);
          
          let baseScore = 0;
          let improvements: string[] = [];
          let strengths: string[] = [];
          let feedback = '';
          
          // Handle different response types
          if (responseClassification.type === 'nonsense') {
            baseScore = 1;
            feedback = 'Inappropriate or nonsensical response. Please provide a serious technical answer.';
            improvements = ['Give a proper technical response', 'Focus on the question asked', 'Avoid nonsensical answers'];
          } else if (responseClassification.type === 'inappropriate') {
            baseScore = 0;
            feedback = 'Inappropriate language used. Please maintain professionalism.';
            improvements = ['Use professional language', 'Focus on technical content', 'Maintain appropriate tone'];
          } else if (responseClassification.type === 'joke') {
            baseScore = 2;
            feedback = 'This is a professional interview. Please provide a serious technical response.';
            improvements = ['Give a serious technical answer', 'Focus on the technical question', 'Maintain professional tone'];
          } else if (responseClassification.type === 'off-topic') {
            baseScore = 3;
            feedback = 'Response is off-topic. Please address the technical question directly.';
            improvements = ['Answer the specific question asked', 'Stay focused on the technical topic', 'Provide relevant examples'];
          } else if (responseClassification.type === 'incomplete') {
            baseScore = 4;
            feedback = 'Response is too brief. Please provide more detail.';
            improvements = ['Elaborate on your answer', 'Provide specific examples', 'Explain your reasoning'];
          } else {
            // Valid response - use original scoring logic
            const coverageScore = Math.max(0, Math.min(10, Math.floor(len / 100))); // 0–10 rough by length
            // Simple heuristics for structure
            const hasExamples = /(for example|e\.g\.|example|code|snippet|demo)/i.test(qa.answer) ? 2 : 0;
            const hasTradeoffs = /(trade-?offs?|pros|cons|pitfalls|edge cases|limitations)/i.test(qa.answer) ? 2 : 0;
            const structureBoost = Math.min(3, hasExamples + hasTradeoffs);
            baseScore = Math.min(10, coverageScore + structureBoost);
            
            if (baseScore >= 8) {
              feedback = 'Strong, well-structured answer.';
              strengths = ['Clear explanation', 'Good structure', 'Comprehensive'];
            } else if (baseScore >= 6) {
              feedback = 'Good answer with room to deepen.';
              strengths = ['Clear explanation'];
            } else {
              feedback = 'Needs more depth and clarity.';
            }
            
            if (len < 200) improvements.push('Provide more detail and concrete steps.');
            if (hasExamples === 0) improvements.push('Add examples or code snippets.');
            if (hasTradeoffs === 0) improvements.push('Discuss trade-offs and edge cases.');
          }
          
          return {
            questionNumber: idx + 1,
            question: qa.question,
            answer: qa.answer,
            score: baseScore,
            feedback,
            strengths,
            improvements,
            responseType: responseClassification.type,
            confidence: responseClassification.confidence
          };
        });
        const answeredCount = normalized.filter((qa: any) => qa.answer && qa.answer.trim().length > 0).length;
        const avg = questionAnalysis.length > 0 ? Math.round(questionAnalysis.reduce((s, q) => s + (q.score || 0), 0) / questionAnalysis.length) : 7;
        // Factor in number of questions answered: scale by coverage ratio
        const coverage = normalized.length > 0 ? answeredCount / normalized.length : 1;
        const overallScore = Math.max(1, Math.min(10, Math.round(avg * (0.6 + 0.4 * coverage))));

        return NextResponse.json({ score: overallScore, feedback: closing, questionAnalysis });
      } catch (e: any) {
        return NextResponse.json({ score: 7, feedback: 'Thanks for participating. We will prepare a detailed analysis.', questionAnalysis: [], fallback: true });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('ai-interview error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
