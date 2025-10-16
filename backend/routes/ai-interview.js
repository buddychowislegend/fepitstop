const router = require('express').Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash-exp';

async function askGemini(prompt) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
  });
  if (!resp.ok) {
    const errTxt = await resp.text();
    throw new Error(`Gemini error ${resp.status}: ${errTxt}`);
  }
  const data = await resp.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

function buildContext(framework, jdText) {
  const p = [];
  if (framework) p.push(`Framework: ${framework}.`);
  if (jdText) p.push(`JD: ${String(jdText).slice(0, 1200)}.`);
  return p.join(' ');
}

router.post('/', async (req, res) => {
  try {
    const { action } = req.body || {};

    if (action === 'start') {
      const { level = 'mid', focus = 'fullstack', framework, jdText } = req.body || {};
      const context = buildContext(framework, jdText);
      const prompt = `You are a senior interviewer. ${context}\nGenerate ONE concise technical interview question.\n- Difficulty: ${level}\n- Focus: ${focus}\nReturn ONLY the question text.`;
      try {
        const text = (await askGemini(prompt)).replace(/^\"|\"$/g, '');
        return res.json({ sessionId: Date.now().toString(), message: text });
      } catch (e) {
        const fw = framework ? `${framework}` : 'frontend';
        const jdHint = jdText ? ' (align to the job description context)' : '';
        const fallbackQ = `In ${fw}, how would you design and implement a feature related to ${focus}? Please outline key trade-offs${jdHint}.`;
        return res.json({ sessionId: Date.now().toString(), message: fallbackQ, fallback: true });
      }
    }

    if (action === 'respond') {
      const { message: answer, previousQuestion = 'Previous question not provided', level = 'mid', focus = 'fullstack', framework, jdText } = req.body || {};
      const context = buildContext(framework, jdText);
      const prompt = `You are a senior interviewer. ${context}\nGiven the previous question and candidate's answer, generate the NEXT interview question.\n- Previous question: ${previousQuestion}\n- Candidate answer: ${answer}\n- Difficulty: ${level}\n- Focus: ${focus}\nReturn ONLY the question text.`;
      try {
        const text = (await askGemini(prompt)).replace(/^\"|\"$/g, '');
        return res.json({ message: text });
      } catch (e) {
        const fw = framework ? `${framework}` : 'frontend';
        const jdHint = jdText ? ' considering the JD' : '';
        const followUp = `As a follow-up in ${fw}${jdHint}, what potential pitfalls or edge cases would you address for your approach, and how would you test them?`;
        return res.json({ message: followUp, fallback: true });
      }
    }

    if (action === 'end') {
      const { framework, jdText, profile, qaPairs } = req.body || {};
      
      try {
        // Generate AI-powered feedback using Gemini
        const context = buildContext(framework, jdText);
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

        const aiFeedback = await askGemini(prompt);
        let feedback;
        try {
          feedback = JSON.parse(aiFeedback);
        } catch {
          // attempt to extract JSON
          const match = aiFeedback.match(/\{[\s\S]*\}/);
          feedback = match ? JSON.parse(match[0]) : null;
        }
        
        if (!feedback) {
          feedback = {
            summary: 'Thanks for participating. We will prepare a detailed analysis.',
            strengths: [],
            improvements: [],
            categories: {}
          };
        }

        // Compute per-question scoring if qaPairs provided
        const normalized = Array.isArray(qaPairs)
          ? qaPairs.filter((p) => p && typeof p.question === 'string').map((p) => ({ question: p.question, answer: String(p.answer || '') }))
          : [];
        
        const questionAnalysis = normalized.map((qa, idx) => {
          const len = qa.answer.trim().length;
          const coverageScore = Math.max(0, Math.min(10, Math.floor(len / 100))); // 0–10 rough by length
          // Simple heuristics for structure
          const hasExamples = /(for example|e\.g\.|example|code|snippet|demo)/i.test(qa.answer) ? 2 : 0;
          const hasTradeoffs = /(trade-?offs?|pros|cons|pitfalls|edge cases|limitations)/i.test(qa.answer) ? 2 : 0;
          const structureBoost = Math.min(3, hasExamples + hasTradeoffs);
          const score = Math.min(10, coverageScore + structureBoost);
          const improvements = [];
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
        
        const answeredCount = normalized.filter((qa) => qa.answer && qa.answer.trim().length > 0).length;
        const avg = questionAnalysis.length > 0 ? Math.round(questionAnalysis.reduce((s, q) => s + (q.score || 0), 0) / questionAnalysis.length) : 7;
        // Factor in number of questions answered: scale by coverage ratio
        const coverage = normalized.length > 0 ? answeredCount / normalized.length : 1;
        const overallScore = Math.max(1, Math.min(10, Math.round(avg * (0.6 + 0.4 * coverage))));

        return res.json({ 
          score: overallScore, 
          feedback: feedback, 
          questionAnalysis 
        });
      } catch (e) {
        console.error('Error generating AI feedback:', e);
        return res.json({ 
          score: 7, 
          feedback: 'Thanks for participating. We will prepare a detailed analysis.', 
          questionAnalysis: [],
          fallback: true 
        });
      }
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('Backend ai-interview error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


