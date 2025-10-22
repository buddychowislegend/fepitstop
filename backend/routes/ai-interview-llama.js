const router = require('express').Router();

// Llama 3.x Provider Configuration
const LLAMA_PROVIDERS = [
  {
    name: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile'
  },
  {
    name: 'together',
    baseUrl: 'https://api.together.xyz/v1',
    apiKey: process.env.TOGETHER_API_KEY,
    model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo'
  },
  {
    name: 'replicate',
    baseUrl: 'https://api.replicate.com/v1',
    apiKey: process.env.REPLICATE_API_KEY,
    model: 'meta/llama-3.1-70b-instruct'
  }
];

// Fallback to Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash-exp';

// Llama 3.x API call function
async function callLlamaWithRetry(prompt) {
  const maxAttempts = 3;
  const baseDelayMs = 500;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    for (const provider of LLAMA_PROVIDERS) {
      if (!provider.apiKey) {
        console.log(`[Llama] Skipping ${provider.name} - no API key`);
        continue;
      }

      try {
        const response = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              {
                role: 'system',
                content: 'You are a professional technical interviewer with 10+ years of experience. You conduct thorough, fair, and engaging interviews. You help candidates when they\'re stuck but maintain high standards.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 0.9
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.choices[0]?.message?.content?.trim();
        
        if (!text) {
          throw new Error('No response content from Llama');
        }

        console.log('[Llama][ok]', { provider: provider.name, attempt });
        return text;
      } catch (err) {
        const msg = err?.message || String(err);
        console.error('[Llama][error]', { provider: provider.name, attempt, msg });
        lastError = err;
        
        // If rate limit or quota exceeded, try next provider
        if (msg.includes('rate limit') || msg.includes('quota') || msg.includes('429')) {
          console.log(`[Llama] Skipping ${provider.name} due to rate limit/quota`);
          continue;
        }
      }
    }
    
    // Exponential backoff
    const delay = baseDelayMs * Math.pow(2, attempt - 1);
    await new Promise((r) => setTimeout(r, delay));
  }
  
  throw lastError || new Error('All Llama providers failed');
}

// Gemini fallback
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

// Hybrid function: Try Llama first, fallback to Gemini
async function callAIWithRetry(prompt) {
  try {
    // Try Llama 3.x first
    return await callLlamaWithRetry(prompt);
  } catch (llamaError) {
    console.log('[AI] Llama failed, falling back to Gemini:', llamaError.message);
    
    // Fallback to Gemini
    try {
      return await askGemini(prompt);
    } catch (geminiError) {
      console.error('[AI] Both Llama and Gemini failed');
      throw new Error(`AI service unavailable: ${geminiError.message}`);
    }
  }
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
      const { level = 'mid', focus, framework, jdText } = req.body || {};
      try {
        const context = buildContext(framework, jdText);
        const prompt = `You are a senior interviewer. ${context}
Generate ONE concise technical interview question tailored to the candidate.
- Difficulty: ${level}
${focus ? `- Focus area: ${focus}` : ''}
- Keep it specific to the mentioned framework and JD when provided.
Return ONLY the question text.`;
        
        const question = await callAIWithRetry(prompt);
        res.json({ sessionId: Date.now().toString(), message: question });
      } catch (e) {
        console.error('[AI][start] error=', e?.message || e);
        const fw = framework || 'frontend';
        const jdHint = jdText ? ' (align to the job description context)' : '';
        const fallbackQ = `In ${fw}, how would you approach a relevant scenario${focus ? ` focused on ${focus}` : ''}? Please outline key trade-offs${jdHint}.`;
        res.json({ sessionId: Date.now().toString(), message: fallbackQ, fallback: true });
      }
    }

    if (action === 'respond') {
      const { message: answer, previousQuestion, level = 'mid', focus, framework, jdText } = req.body || {};
      try {
        const context = buildContext(framework, jdText);
        const prompt = `You are a senior interviewer. ${context}
Given the previous question and the candidate's answer, generate the NEXT interview question.
- Previous question: ${previousQuestion}
- Candidate answer: ${answer}
- Difficulty: ${level}
${focus ? `- Focus: ${focus}` : ''}
Make the next question relevant to the framework/JD if given. Return ONLY the question text.`;
        
        const nextQ = await callAIWithRetry(prompt);
        res.json({ message: nextQ });
      } catch (e) {
        console.error('[AI][respond] error=', e?.message || e);
        const fw = framework || 'frontend';
        const jdHint = jdText ? ' considering the JD' : '';
        const followUp = `As a follow-up in ${fw}${jdHint}${focus ? ` focused on ${focus}` : ''}, what potential pitfalls or edge cases would you address, and how would you test them?`;
        res.json({ message: followUp, fallback: true });
      }
    }

    if (action === 'end') {
      const { framework, jdText } = req.body || {};
      try {
        const context = buildContext(framework, jdText);
        const prompt = `You are a senior interviewer. ${context}
Summarize the candidate's performance tailored to the selected role.
Return STRICT JSON with keys: {
  "summary": string,
  "strengths": string[],
  "improvements": string[],
  "categories": object
}
Do not include markdown fences or extra text.`;
        
        const text = await callAIWithRetry(prompt);
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {
          const match = text.match(/\{[\s\S]*\}/);
          json = match ? JSON.parse(match[0]) : null;
        }
        if (!json) {
          json = {
            summary: 'Thanks for participating. We will prepare a detailed analysis.',
            strengths: [],
            improvements: [],
            categories: {}
          };
        }
        res.json({ score: 7, feedback: json });
      } catch (e) {
        console.error('[AI][end] error=', e?.message || e);
        res.json({ score: 7, feedback: 'Thanks for participating. We will prepare a detailed analysis.', fallback: true });
      }
    }

    if (!['start', 'respond', 'end'].includes(action)) {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    console.error('ai-interview error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
