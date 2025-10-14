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
      return res.json({ score: 7, feedback: 'Thanks for participating. We will prepare a detailed analysis.' });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('Backend ai-interview error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


