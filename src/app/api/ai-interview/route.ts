import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const CANDIDATE_MODELS = ['gemini-2.0-flash-exp'];
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
      : profile === 'qa' ? 'Role: QA Engineer.'
      : profile === 'hr' ? 'Role: HR.'
      : profile === 'backend' ? 'Role: Backend Engineer (Java Spring Boot).'
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
          const coverageScore = Math.max(0, Math.min(10, Math.floor(len / 100))); // 0–10 rough by length
          // Simple heuristics for structure
          const hasExamples = /(for example|e\.g\.|example|code|snippet|demo)/i.test(qa.answer) ? 2 : 0;
          const hasTradeoffs = /(trade-?offs?|pros|cons|pitfalls|edge cases|limitations)/i.test(qa.answer) ? 2 : 0;
          const structureBoost = Math.min(3, hasExamples + hasTradeoffs);
          const score = Math.min(10, coverageScore + structureBoost);
          const improvements: string[] = [];
          if (len < 200) improvements.push('Provide more detail and concrete steps.');
          if (hasExamples === 0) improvements.push('Add examples or code snippets.');
          if (hasTradeoffs === 0) improvements.push('Discuss trade-offs and edge cases.');
          return {
            questionNumber: idx + 1,
            question: qa.question,
            answer: qa.answer,
            score,
            feedback: score >= 8 ? 'Strong, well-structured answer.' : score >= 6 ? 'Good answer with room to deepen.' : 'Needs more depth and clarity.',
            strengths: score >= 7 ? ['Clear explanation'] : [],
            improvements
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
