const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroq(prompt) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a senior technical interviewer with deep expertise in crafting interview questions. Keep outputs concise and follow instructions exactly.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 1200,
      top_p: 0.9
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('Groq response did not contain any content');
  }
  return text;
}

async function generateQuestionsFromJD(jobDescription, options = {}) {
  const {
    count = 10,
    includeSoftSkills = true,
  } = options;

  const prompt = `You are a senior interviewer. Based on the job description below, generate ${count} targeted interview questions.

Job Description:
${jobDescription}

Guidelines:
- Cover core technical skills, problem solving, architecture/design, and practical experience.
- ${includeSoftSkills ? 'Include at least one question that evaluates communication, leadership, or cultural fit.' : 'Focus strictly on hard technical skills.'}
- Questions must be concise but specific.
- Avoid numbering the questions.
- Return ONLY a valid JSON array of strings, e.g. ["Question 1", "Question 2"] with no additional commentary.`;

  try {
    const raw = await callGroq(prompt);

    // Attempt to parse JSON array from response
    let questions = [];
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = raw
          .split('\n')
          .map(q => q.replace(/^\d+[\.\)]\s*/, '').replace(/^["']|["']$/g, '').trim())
          .filter(Boolean);
      }
    } catch (parseError) {
      questions = raw
        .split('\n')
        .map(q => q.replace(/^\d+[\.\)]\s*/, '').replace(/^["']|["']$/g, '').trim())
        .filter(Boolean);
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Unable to parse questions from Groq response');
    }

    return questions.slice(0, count);
  } catch (error) {
    console.error('[QuestionGenerator] Failed to generate questions via Groq:', error?.message || error);
    throw error;
  }
}

module.exports = {
  generateQuestionsFromJD,
};

