import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const CANDIDATE_MODELS = ['gemini-2.0-flash-exp', 'gemini-1.5-flash'];
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
        console.error('[Gemini][error]', { modelName, attempt, msg });
        lastError = err;
        // If 404 (model unsupported) or 429 (quota), try next model/attempt
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
      : 'Role: Frontend Engineer.'
    : '';
  const fw = framework ? ` Framework: ${framework}.` : '';
  const jd = jdText ? ` Job Description Summary: ${jdText.slice(0, 1200)}.` : '';
  return `${role}${fw}${jd}`.trim();
}

async function generateQuestion(opts: { level: string; focus?: string; framework?: string; jdText?: string; profile?: string; }) {
  const { level, focus, framework, jdText, profile } = opts;
  const context = buildContextPrefix(framework, jdText, profile);
  const prompt = `You are a senior interviewer. ${context}
Generate ONE concise technical interview question tailored to the candidate.
- Difficulty: ${level}
${focus ? `- Focus area: ${focus}
` : ''}
${profile ? `- Target profile: ${profile}.
` : ''}
- Keep it specific to the mentioned framework and JD when provided.
Return ONLY the question text.`;

  try {
    const text = await callGeminiWithRetry(prompt);
    return text.replace(/^"|"$/g, '');
  } catch (err: any) {
    console.error('[Gemini][start] error=', err?.message || err);
    throw err;
  }
}

async function generateFollowUp(opts: { answer: string; previousQuestion: string; framework?: string; jdText?: string; level: string; focus?: string; profile?: string; }) {
  const { answer, previousQuestion, framework, jdText, level, focus, profile } = opts;
  const context = buildContextPrefix(framework, jdText, profile);
  const prompt = `You are a senior interviewer. ${context}
Given the previous question and the candidate's answer, generate the NEXT interview question.
- Previous question: ${previousQuestion}
- Candidate answer: ${answer}
- Difficulty: ${level}
${focus ? `- Focus: ${focus}
` : ''}
${profile ? `- Target profile: ${profile}.
` : ''}
Make the next question relevant to the framework/JD if given. Return ONLY the question text.`;
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
  const prompt = `You are a senior interviewer. ${context}
Provide a short closing message thanking the candidate and indicating that a detailed analysis will be prepared.`;
  try {
    const text = await callGeminiWithRetry(prompt);
    return text.trim();
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
      const { framework, jdText, profile } = body || {};
      try {
        const closing = await generateEndSummary({ framework, jdText, profile });
        return NextResponse.json({ score: 7, feedback: closing, questionAnalysis: [] });
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
