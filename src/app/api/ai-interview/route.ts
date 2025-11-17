import { NextRequest, NextResponse } from 'next/server';

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

// Fallback to Gemini if Llama fails
const CANDIDATE_MODELS = ['gemini-2.0-flash-exp', 'gemini-1.5-flash-001', 'gemini-1.5-pro-001'];

// Llama 3.x API call function
async function callLlamaWithRetry(prompt: string): Promise<string> {
  const maxAttempts = 3;
  const baseDelayMs = 500;
  let lastError: any = null;

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

        console.log('x[ok]', { provider: provider.name, attempt });
        return text;
      } catch (err: any) {
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

// Hybrid function: Try Llama first, fallback to Gemini
async function callAIWithRetry(prompt: string): Promise<string> {
  try {
    // Try Llama 3.x first
    return await callLlamaWithRetry(prompt);
  } catch (llamaError: any) {
    console.log('[AI] Llama failed, falling back to Gemini:', llamaError.message);
    
    // Fallback to Gemini
    try {
      return await callGeminiWithRetry(prompt);
    } catch (geminiError: any) {
      console.error('[AI] Both Llama and Gemini failed');
      throw new Error(`AI service unavailable: ${geminiError.message}`);
    }
  }
}

async function callGeminiWithRetry(prompt: string): Promise<string> {
  // Try to use Gemini API if available
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (geminiApiKey) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text && text.trim()) {
        return text.trim();
      }
    } catch (error: any) {
      console.error('[Gemini] API call failed:', error?.message || error);
    }
  }
  
  // Fallback: Generate a proper question based on the prompt
  // Extract profile and level from prompt if possible
  const promptLower = prompt.toLowerCase();
  let profileType = 'technical';
  let level = 'mid';
  
  if (promptLower.includes('product')) profileType = 'product management';
  else if (promptLower.includes('backend')) profileType = 'backend development';
  else if (promptLower.includes('frontend')) profileType = 'frontend development';
  
  if (promptLower.includes('junior')) level = 'junior';
  else if (promptLower.includes('senior')) level = 'senior';
  
  // Generate a proper question instead of the broken fallback
  const questions = [
    `Can you walk me through your approach to solving a typical ${profileType} problem at the ${level} level?`,
    `Describe a challenging ${profileType} scenario you've encountered and how you handled it.`,
    `What are the key considerations when working on ${profileType} projects?`,
    `How do you approach problem-solving in ${profileType}? Can you give me an example?`,
    `What's your experience with ${profileType}? Walk me through a project you're proud of.`
  ];
  
  return questions[Math.floor(Math.random() * questions.length)];
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

// Enhanced interviewer personality traits with confidence-boosting focus
function getInterviewerPersonality(): string {
  const personalities = [
    "You are a senior technical interviewer with 10+ years of experience. You're professional, patient, and HIGHLY ENCOURAGING. You boost candidates' confidence with positive reinforcement like 'Great thinking!', 'Excellent approach!', 'You're on the right track!'. You help candidates when they're stuck by providing gentle hints and maintaining high standards while being supportive. You celebrate their successes and make them feel valued.",
    "You are a senior engineering manager who conducts technical interviews. You're thorough, detail-oriented, and HIGHLY SUPPORTIVE. You ask follow-up questions to understand the candidate's depth while providing encouragement like 'That's a solid foundation!', 'I like how you're thinking about this!', 'You're doing really well!'. You help candidates feel confident and appreciated.",
    "You are a principal engineer who interviews candidates. You're experienced, direct, and focus on practical problem-solving skills while being WARM AND ENCOURAGING. You appreciate honesty and clear communication, and you boost confidence with phrases like 'Nice work!', 'Good insight!', 'You're demonstrating strong understanding!'. You help candidates shine.",
    "You are a senior developer who conducts technical interviews. You're friendly, professional, and look for both technical skills and communication abilities. You're PASSIONATE ABOUT HELPING CANDIDATES SUCCEED. You provide positive feedback like 'Well done!', 'I appreciate your thoughtful answer!', 'Keep going, you're doing great!'. You make candidates feel confident and supported throughout the interview."
  ];
  
  return personalities[Math.floor(Math.random() * personalities.length)];
}

// Enhanced prompt engineering for interview optimization
interface InterviewContext {
  profile?: string;
  framework?: string;
  level: string;
  focus?: string;
  jdText?: string;
  questionType?: string;
  previousQuestion?: string;
  candidateAnswer?: string;
}

// Profile-specific interview data
const PROFILE_DATA = {
  frontend: {
    title: 'Frontend Engineer',
    expertise: 'UI/UX engineering, JavaScript/TypeScript, React/Vue/Angular, CSS, responsive design, performance optimization',
    frameworks: ['React', 'Vue', 'Angular', 'Next.js', 'Svelte'],
    focusAreas: ['State Management', 'Component Architecture', 'Performance', 'Accessibility', 'Testing'],
    examples: `
Example Frontend Interview Flow:
Q: "How would you optimize a React component that renders a large list of items?"
A: "I'd use React.memo, virtualization with react-window, and implement pagination..."
Q: "What about memory usage with virtualization? How would you handle cleanup?"
A: "Good point! I'd implement proper cleanup in useEffect and use refs to track mounted components..."

Q: "Explain the difference between useEffect and useMemo in React"
A: "useEffect runs after render for side effects, useMemo runs during render for expensive calculations..."
Q: "When would you use useCallback instead of useMemo?"
A: "useCallback is for functions passed to child components to prevent unnecessary re-renders..."

Q: "How would you handle state management in a large React application?"
A: "I'd use Redux Toolkit with RTK Query for server state, Context for local state, and custom hooks for shared logic..."
Q: "What about performance with large datasets? How would you optimize?"
A: "I'd implement virtualization, memoization, code splitting, and lazy loading for components..."`,
    criteria: ['javascript_knowledge', 'framework_expertise', 'ui_ux_skills', 'performance_optimization', 'testing_skills', 'accessibility']
  },
  
  backend: {
    title: 'Backend Engineer (Java Spring Boot)',
    expertise: 'Java, Spring Boot, microservices, REST APIs, database design, system architecture, cloud deployment',
    frameworks: ['Spring Boot', 'Spring Security', 'Spring Data', 'Hibernate', 'Maven/Gradle'],
    focusAreas: ['Microservices', 'API Design', 'Database Optimization', 'Security', 'Scalability'],
    examples: `
Example Backend Interview Flow:
Q: "How would you design a microservices architecture for an e-commerce platform?"
A: "I'd separate services by domain - user, product, order, payment. Use API Gateway for routing..."
Q: "How would you handle data consistency across services?"
A: "I'd use event-driven architecture with message queues and implement saga pattern for distributed transactions..."

Q: "Explain the difference between @Autowired and @Component in Spring"
A: "@Component marks a class as Spring bean, @Autowired injects dependencies..."
Q: "What about circular dependencies? How would you resolve them?"
A: "I'd refactor to use @Lazy annotation, constructor injection, or break the circular reference..."

Q: "How would you optimize database queries in a Spring Boot application?"
A: "I'd use JPA projections, implement caching with Redis, add proper indexes, and use query optimization..."
Q: "What about handling high concurrent load?"
A: "I'd implement connection pooling, use async processing, implement rate limiting, and consider database sharding..."`,
    criteria: ['java_knowledge', 'spring_framework', 'microservices', 'database_design', 'api_design', 'system_architecture']
  },
  
  product: {
    title: 'Product Manager',
    expertise: 'Product strategy, user research, metrics analysis, prioritization, stakeholder management, market analysis',
    frameworks: ['Agile', 'Scrum', 'Design Thinking', 'Lean Startup', 'OKRs'],
    focusAreas: ['Product Strategy', 'User Research', 'Metrics & Analytics', 'Prioritization', 'Stakeholder Management'],
    examples: `
Example Product Manager Interview Flow:
Q: "How would you prioritize features for a mobile app with limited resources?"
A: "I'd use RICE framework - Reach, Impact, Confidence, Effort. Focus on high-impact, low-effort features..."
Q: "How would you measure success of a new feature?"
A: "I'd define success metrics upfront - user adoption, engagement, retention. Use A/B testing and cohort analysis..."

Q: "How do you handle conflicting requirements from different stakeholders?"
A: "I'd facilitate discussions, gather data to support decisions, and align on business objectives..."
Q: "What if engineering says a feature will take 6 months but business wants it in 2?"
A: "I'd break it into smaller releases, identify MVP scope, and negotiate realistic timelines..."

Q: "How would you approach launching a new product in a competitive market?"
A: "I'd conduct market research, identify unique value proposition, validate with users, and create go-to-market strategy..."
Q: "How would you handle a product that's not meeting its KPIs?"
A: "I'd analyze data to identify root causes, conduct user interviews, and pivot strategy based on insights..."`,
    criteria: ['product_sense', 'strategic_thinking', 'user_research', 'metrics_analysis', 'stakeholder_management', 'market_understanding']
  },
  
  business: {
    title: 'Business Development',
    expertise: 'Sales strategy, partnerships, market expansion, revenue growth, client relationships, negotiation',
    frameworks: ['Sales Funnel', 'CRM', 'Lead Generation', 'Partnership Development', 'Revenue Models'],
    focusAreas: ['Sales Strategy', 'Partnership Development', 'Market Analysis', 'Client Relations', 'Revenue Growth'],
    examples: `
Example Business Development Interview Flow:
Q: "How would you approach a new market for our SaaS product?"
A: "I'd research market size, identify key players, understand local regulations, and develop go-to-market strategy..."
Q: "How would you handle a major client threatening to churn?"
A: "I'd schedule immediate meeting, understand their concerns, propose solutions, and involve technical team if needed..."

Q: "How do you identify and approach potential partners?"
A: "I'd research complementary companies, attend industry events, leverage LinkedIn, and create win-win proposals..."
Q: "What if a partnership deal falls through at the last minute?"
A: "I'd analyze what went wrong, maintain relationship for future, and have backup options ready..."

Q: "How would you structure a partnership agreement with a major enterprise?"
A: "I'd define clear value propositions, set measurable goals, establish communication protocols, and include exit clauses..."
Q: "How do you measure success of business development activities?"
A: "I'd track pipeline value, conversion rates, partnership revenue, and long-term relationship health..."`,
    criteria: ['sales_strategy', 'partnership_development', 'market_analysis', 'client_relations', 'negotiation_skills', 'revenue_growth']
  },
  
  qa: {
    title: 'QA Engineer',
    expertise: 'Test automation, manual testing, test strategy, bug tracking, quality assurance, CI/CD integration',
    frameworks: ['Selenium', 'Cypress', 'Jest', 'TestNG', 'Postman'],
    focusAreas: ['Test Automation', 'Manual Testing', 'Test Strategy', 'Bug Tracking', 'CI/CD'],
    examples: `
Example QA Engineer Interview Flow:
Q: "How would you test a new e-commerce feature for checkout process?"
A: "I'd create test cases for happy path, edge cases, error scenarios, and integration with payment systems..."
Q: "What about testing with different payment methods and currencies?"
A: "I'd test with various payment providers, validate currency conversion, and test international transactions..."

Q: "How do you prioritize which tests to automate?"
A: "I'd focus on regression tests, critical user journeys, and tests that run frequently in CI/CD..."
Q: "What if automated tests are flaky and unreliable?"
A: "I'd investigate root causes, improve test stability, and implement better test data management..."

Q: "How would you approach testing a mobile application?"
A: "I'd test on different devices, operating systems, network conditions, and use both manual and automated testing..."
Q: "How do you ensure quality in a fast-paced development environment?"
A: "I'd implement shift-left testing, use risk-based testing, and collaborate closely with development team..."`,
    criteria: ['test_automation', 'manual_testing', 'test_strategy', 'bug_tracking', 'ci_cd_integration', 'quality_assurance']
  },
  
  hr: {
    title: 'HR Professional',
    expertise: 'Talent acquisition, employee relations, performance management, culture building, compliance, training',
    frameworks: ['HRIS', 'ATS', 'Performance Management', 'Learning Management', 'Employee Engagement'],
    focusAreas: ['Talent Acquisition', 'Employee Relations', 'Performance Management', 'Culture Building', 'Compliance'],
    examples: `
Example HR Interview Flow:
Q: "How would you handle a conflict between two team members?"
A: "I'd meet with each individually, understand perspectives, facilitate mediation, and create action plan..."
Q: "What if the conflict affects team productivity?"
A: "I'd address immediately, involve managers if needed, and implement team-building activities..."

Q: "How do you ensure diversity and inclusion in hiring?"
A: "I'd use diverse interview panels, implement blind resume screening, and create inclusive job descriptions..."
Q: "What if a candidate raises concerns about bias in the process?"
A: "I'd take concerns seriously, review process objectively, and implement improvements..."

Q: "How would you approach performance improvement for an underperforming employee?"
A: "I'd identify specific issues, create improvement plan, provide support and resources, and set clear expectations..."
Q: "How do you handle sensitive employee information?"
A: "I'd maintain strict confidentiality, follow data protection laws, and ensure secure information handling..."`,
    criteria: ['talent_acquisition', 'employee_relations', 'performance_management', 'culture_building', 'compliance', 'communication']
  }
};

function buildEnhancedInterviewPrompt(context: InterviewContext, promptType: 'question' | 'followup' | 'analysis'): string {
  const { profile, framework, level, focus, jdText, questionType, previousQuestion, candidateAnswer } = context;
  
  // Get profile-specific data
  const profileData = PROFILE_DATA[profile as keyof typeof PROFILE_DATA] || PROFILE_DATA.frontend;
  
  // Base interviewer persona with profile-specific expertise and confidence-boosting
  const basePersona = `You are a senior ${profileData.title} interviewer with 10+ years of experience.
You're conducting a ${level} level interview for a ${profileData.title.toLowerCase()} position.

Your expertise includes:
- ${profileData.expertise}
- ${profileData.frameworks.join(', ')} frameworks and technologies
- Industry best practices and current trends
- Problem-solving methodologies and real-world scenarios
- Communication and collaboration skills

Interview style - BE ENCOURAGING AND CONFIDENCE-BOOSTING:
- Ask progressive questions (easy to hard) that build on each other
- PROVIDE POSITIVE REINFORCEMENT: Use phrases like "Great!", "Excellent!", "You're on the right track!", "Nice thinking!", "Well done!", "I appreciate that insight!", "That's a solid approach!", "Keep going, you're doing great!"
- Boost confidence when candidates answer correctly or show good thinking
- Provide hints when candidates struggle, but don't give away answers - frame hints encouragingly
- Focus on problem-solving approach and thought process - celebrate good approaches
- Test both technical knowledge and communication skills while being supportive
- Encourage candidates to think out loud and explain their reasoning - acknowledge their effort
- Use real-world scenarios relevant to ${profileData.title} role
- Make candidates feel valued and confident throughout the interview
- When they're stuck, help them with encouraging phrases like "Let me give you a hint to help you think through this", "That's okay, let's think about it differently", "You're close, keep exploring that thought"
- Build their confidence with phrases like "You're demonstrating strong understanding!", "I like your approach!", "That shows good problem-solving skills!"`;

  // Profile-specific examples
  const examples = profileData.examples;

  if (promptType === 'question') {
    // Strict focus area instruction - if JavaScript, ONLY JavaScript (no frameworks)
    const focusInstruction = focus === 'javascript' 
      ? `CRITICAL: The focus area is JavaScript. You MUST ask questions ONLY about pure JavaScript (vanilla JS), NOT about React, NOT about any frameworks, NOT about libraries. Focus on JavaScript fundamentals like closures, prototypes, async/await, promises, event loop, scope, hoisting, this binding, ES6+ features, etc.`
      : focus === 'react'
      ? `CRITICAL: The focus area is React. Ask questions about React concepts like hooks, component lifecycle, state management, JSX, virtual DOM, etc.`
      : focus === 'fullstack'
      ? `Focus area is Fullstack. Ask questions covering both frontend and backend concepts.`
      : focus
      ? `Focus area is ${focus}. Ask questions specifically about ${focus}.`
      : `Focus on ${profileData.focusAreas.join(', ')} areas`;

    return `${basePersona}

${examples}

Generate a ${questionType || 'technical'} question that:
1. Tests relevant ${profileData.title.toLowerCase()} concepts appropriate for ${level} level
2. Has multiple difficulty levels and allows for follow-up questions
3. Is practical, realistic, and related to real-world ${profileData.title.toLowerCase()} scenarios
4. Builds on the job description context when provided
5. Encourages the candidate to explain their thought process
6. ${focusInstruction}

Context: ${jdText ? `Job Description: ${jdText.slice(0, 1200)}` : `General ${profileData.title.toLowerCase()} interview`}
Focus Area: ${focus || profileData.focusAreas[0]}
${framework && focus !== 'javascript' ? `Framework: ${framework}` : ''}

Return ONLY the question text.`;
  }

  if (promptType === 'followup') {
    // Strict focus area instruction - if JavaScript, ONLY JavaScript (no frameworks)
    const focusInstruction = focus === 'javascript' 
      ? `CRITICAL: The focus area is JavaScript. You MUST ask questions ONLY about pure JavaScript (vanilla JS), NOT about React, NOT about any frameworks, NOT about libraries. Focus on JavaScript fundamentals like closures, prototypes, async/await, promises, event loop, scope, hoisting, this binding, ES6+ features, etc.`
      : focus === 'react'
      ? `CRITICAL: The focus area is React. Ask questions about React concepts like hooks, component lifecycle, state management, JSX, virtual DOM, etc.`
      : focus === 'fullstack'
      ? `Focus area is Fullstack. Ask questions covering both frontend and backend concepts.`
      : focus
      ? `Focus area is ${focus}. Ask questions specifically about ${focus}.`
      : `Focuses on ${profileData.focusAreas.join(', ')} areas`;

    return `${basePersona}

${examples}

Given the previous question and candidate's answer, generate the NEXT interview question.

Previous question: ${previousQuestion}
Candidate answer: ${candidateAnswer}

Generate a follow-up question that:
1. Builds naturally on their previous answer
2. Tests deeper understanding of the topic
3. Is appropriate for ${level} level difficulty
4. Allows for technical discussion and problem-solving
5. Encourages the candidate to elaborate on their approach
6. ${focusInstruction}
7. BEFORE ASKING THE NEXT QUESTION, provide brief positive encouragement about their previous answer (e.g., "Great explanation!", "I appreciate your thoughtful approach!", "Well done!", "Excellent insight!") - this boosts their confidence
8. Then transition smoothly to the next question with phrases like "Let's explore this further...", "Building on what you just explained...", "That's a good foundation, now let's dive deeper..."

Focus Area: ${focus || profileData.focusAreas[0]}
${framework && focus !== 'javascript' ? `Framework: ${framework}` : ''}

Return ONLY the question text.`;
  }

  if (promptType === 'analysis') {
    return `${basePersona}

${examples}

Analyze the candidate's performance based on the ACTUAL interview conversation provided below.

Context: ${jdText ? `Job Description: ${jdText.slice(0, 1200)}` : `General ${profileData.title.toLowerCase()} interview`}
Role: ${profileData.title}
Framework: ${framework || profileData.frameworks[0]}
Level: ${level}

IMPORTANT: Your analysis MUST be based ONLY on the actual questions asked and answers given. Do not make generic statements. Be specific and reference what the candidate actually said.

Provide a comprehensive analysis including:
1. Technical knowledge assessment in ${profileData.title.toLowerCase()} domain - reference specific answers
2. Problem-solving approach evaluation - cite examples from their responses
3. Communication skills evaluation - reference how they explained concepts
4. Areas of strength - be specific about what they did well based on their actual answers
5. Areas for improvement - be specific about gaps or weaknesses shown in their actual responses
6. Overall fit for the ${profileData.title} role

Rate the candidate on these criteria: ${profileData.criteria.join(', ')}

Return STRICT JSON with keys: {
  "summary": string (comprehensive summary referencing specific questions and answers),
  "strengths": string[] (each strength should reference specific answers/behaviors observed),
  "improvements": string[] (each improvement should be specific to gaps shown in their actual responses),
  "categories": object // ${profileData.criteria.join(', ')} with scores 0-10
}

Do not include markdown fences or extra text.`;
  }

  return basePersona;
}

async function generateQuestion(opts: { level: string; focus?: string; framework?: string; jdText?: string; profile?: string; }) {
  const { level, focus, framework, jdText, profile } = opts;
  
  // Use enhanced prompt engineering
  const context: InterviewContext = {
    profile,
    framework,
    level,
    focus,
    jdText,
    questionType: 'technical'
  };
  
  const prompt = buildEnhancedInterviewPrompt(context, 'question');

  console.log('prompt received is ', prompt);
  try {
    const text = await callAIWithRetry(prompt);
    return text.replace(/^"|"$/g, '');
  } catch (err: any) {
    console.error('[AI][start] error=', err?.message || err);
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
  
  // Detect inappropriate content (word-boundary safe to avoid false positives like "assets", "shell")
  const inappropriatePatterns = [
    /\b(fuck|shit|damn|hell|bitch|ass)\b/,
    /\b(stupid|dumb|idiot|moron)\b/
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
  
  // Classify the response first
  const responseClassification = classifyResponse(answer, previousQuestion);
  
  let prompt = '';
  
  if (responseClassification.type === 'nonsense') {
    // Enhanced prompt for nonsense responses
    const context: InterviewContext = {
      profile,
      framework,
      level,
      focus,
      jdText,
      previousQuestion,
      candidateAnswer: answer
    };
    
    prompt = buildEnhancedInterviewPrompt(context, 'followup') + `

The candidate gave a nonsensical response: "${answer}"
Previous question: ${previousQuestion}

Respond professionally and ENCOURAGINGLY:
1. Acknowledge their response briefly with understanding (e.g., "No worries, interviews can be nerve-wracking!")
2. Politely redirect them back to the technical question with encouragement
3. Ask a more specific follow-up question
4. Maintain a professional but supportive tone
5. Show understanding that they might be nervous and boost their confidence
6. Use phrases like "Let's try a different angle", "Don't worry, let's work through this together", "Take your time, we'll figure this out"

Return ONLY your response as the interviewer.`;
  } else if (responseClassification.type === 'inappropriate') {
    // Enhanced prompt for inappropriate responses
    const context: InterviewContext = {
      profile,
      framework,
      level,
      focus,
      jdText,
      previousQuestion,
      candidateAnswer: answer
    };
    
    prompt = buildEnhancedInterviewPrompt(context, 'followup') + `

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
    // Enhanced prompt for joke responses
    const context: InterviewContext = {
      profile,
      framework,
      level,
      focus,
      jdText,
      previousQuestion,
      candidateAnswer: answer
    };
    
    prompt = buildEnhancedInterviewPrompt(context, 'followup') + `

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
    // Enhanced prompt for off-topic responses
    const context: InterviewContext = {
      profile,
      framework,
      level,
      focus,
      jdText,
      previousQuestion,
      candidateAnswer: answer
    };
    
    prompt = buildEnhancedInterviewPrompt(context, 'followup') + `

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
    // Enhanced prompt for incomplete responses
    const context: InterviewContext = {
      profile,
      framework,
      level,
      focus,
      jdText,
      previousQuestion,
      candidateAnswer: answer
    };
    
    prompt = buildEnhancedInterviewPrompt(context, 'followup') + `

The candidate gave a very brief response: "${answer}"
Previous question: ${previousQuestion}

Respond professionally and ENCOURAGINGLY:
1. Acknowledge their response positively (e.g., "Good start!", "That's a beginning!")
2. Ask for more detail or clarification with encouragement
3. Provide a more specific follow-up question
4. Encourage them to elaborate with phrases like "I'd love to hear more about your thinking", "Can you walk me through your approach?", "Feel free to share more details"
5. Show that you're interested in their thoughts and boost their confidence
6. Use supportive phrases like "Take your time", "There's no rush", "I'm here to help you showcase your knowledge"

Return ONLY your response as the interviewer.`;
  } else {
    // Valid response - use enhanced prompt engineering
    const context: InterviewContext = {
      profile,
      framework,
      level,
      focus,
      jdText,
      previousQuestion,
      candidateAnswer: answer
    };
    
    prompt = buildEnhancedInterviewPrompt(context, 'followup');
  }
  
  try {
    const text = await callAIWithRetry(prompt);
    return text.replace(/^"|"$/g, '');
  } catch (err: any) {
    console.error('[AI][respond] error=', err?.message || err);
    throw err;
  }
}

async function generateEndSummary(opts: { framework?: string; jdText?: string; profile?: string; qaPairs?: Array<{ question: string; answer: string }> }) {
  const { framework, jdText, profile, qaPairs } = opts;
  
  // Build Q&A context string
  const qaContext = qaPairs && qaPairs.length > 0
    ? qaPairs.map((qa, idx) => `Question ${idx + 1}: ${qa.question}\nAnswer: ${qa.answer}`).join('\n\n')
    : 'No questions and answers provided.';
  
  // Use enhanced prompt engineering for analysis
  const context: InterviewContext = {
    profile,
    framework,
    level: 'mid', // Default level for analysis
    jdText
  };
  
  // Get profile data
  const profileData = PROFILE_DATA[profile as keyof typeof PROFILE_DATA] || PROFILE_DATA.frontend;
  const basePersona = `You are a senior ${profileData.title} interviewer with 10+ years of experience analyzing technical interviews.`;
  
  // Build comprehensive analysis prompt with actual Q&A
  const prompt = `${basePersona}

ACTUAL INTERVIEW CONVERSATION:
${qaContext}

${jdText ? `Job Description Context: ${jdText.slice(0, 1200)}` : ''}
Role: ${profileData.title}
${framework ? `Framework: ${framework}` : ''}

CRITICAL REQUIREMENTS:
1. Your analysis MUST be based ONLY on the actual questions asked and answers given above
2. Do NOT make generic statements - reference specific answers
3. Strengths must cite specific examples from their actual responses
4. Improvements must identify actual gaps or weaknesses shown in their answers
5. Be specific and constructive

Provide a comprehensive analysis including:
1. Technical knowledge assessment - reference what they actually said about specific topics
2. Problem-solving approach - cite examples of how they approached questions
3. Communication skills - reference how they explained their answers
4. Specific strengths - what did they demonstrate well? (reference specific answers)
5. Specific improvements - what gaps did you observe? (reference specific answers)
6. Overall assessment for ${profileData.title} role

Rate the candidate on these criteria: ${profileData.criteria.join(', ')}

Return STRICT JSON with keys: {
  "summary": string (comprehensive summary referencing specific Q&A pairs - mention question numbers and what they said),
  "strengths": string[] (each must reference specific answers, e.g., "In Q2, demonstrated strong understanding of closures by..."),
  "improvements": string[] (each must identify specific gaps, e.g., "In Q3, answer lacked depth on async operations..."),
  "categories": object // ${profileData.criteria.join(', ')} with scores 0-10
}

Do not include markdown fences or extra text.`;

  try {
    const text = await callAIWithRetry(prompt);
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
        summary: 'Thanks for participating. We will prepare a detailed analysis based on your responses.',
        strengths: [],
        improvements: [],
        categories: {}
      };
    }
    return json;
  } catch (err: any) {
    console.error('[AI][end] error=', err?.message || err);
    throw err;
  }
}

// Generate AI-powered per-question analysis
async function generateQuestionAnalysis(qa: { question: string; answer: string }, questionNumber: number, profile?: string, framework?: string): Promise<any> {
  const profileData = PROFILE_DATA[profile as keyof typeof PROFILE_DATA] || PROFILE_DATA.frontend;
  
  const prompt = `You are a senior ${profileData.title} interviewer analyzing a specific interview Q&A.

Question ${questionNumber}: ${qa.question}
Candidate Answer: ${qa.answer}

${framework ? `Framework: ${framework}` : ''}

Analyze this specific question and answer:
1. Score the answer (0-10) based on accuracy, depth, and relevance
2. Provide specific feedback about what they did well or poorly
3. Identify specific strengths in their answer (reference what they actually said)
4. Identify specific improvements needed (reference gaps in their answer)

Return STRICT JSON with keys: {
  "score": number (0-10),
  "feedback": string (specific feedback about this answer),
  "strengths": string[] (specific strengths - what did they say well?),
  "improvements": string[] (specific gaps - what was missing or incorrect?)
}

Do not include markdown fences or extra text.`;

  try {
    const text = await callAIWithRetry(prompt);
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      json = match ? JSON.parse(match[0]) : null;
    }
    
    if (!json) {
      // Fallback to basic analysis
      return {
        questionNumber,
        question: qa.question,
        answer: qa.answer,
        score: qa.answer.trim().length > 50 ? 5 : 2,
        feedback: 'Unable to analyze this response in detail.',
        strengths: [],
        improvements: ['Provide more detailed and structured responses']
      };
    }
    
    return {
      questionNumber,
      question: qa.question,
      answer: qa.answer,
      score: typeof json.score === 'number' ? Math.max(0, Math.min(10, json.score)) : 5,
      feedback: json.feedback || 'Analyzed response.',
      strengths: Array.isArray(json.strengths) ? json.strengths : [],
      improvements: Array.isArray(json.improvements) ? json.improvements : [],
      responseType: 'valid',
      confidence: 0.8
    };
  } catch (err: any) {
    console.error('[AI][question-analysis] error=', err?.message || err);
    // Return basic fallback
    return {
      questionNumber,
      question: qa.question,
      answer: qa.answer,
      score: qa.answer.trim().length > 50 ? 5 : 2,
      feedback: 'Unable to analyze this response.',
      strengths: [],
      improvements: ['Provide more detailed responses']
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, prompt } = body || {};

    // Handle AI screening generation requests
    if (prompt && prompt.includes('Generate a comprehensive screening assessment')) {
      try {
        const response = await callLlamaWithRetry(prompt);
        
        // Clean the response by removing markdown formatting and extracting JSON
        let cleanResponse = response;
        if (cleanResponse.includes('```json')) {
          cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }
        
        // Extract only the JSON part (before any additional text)
        const jsonStart = cleanResponse.indexOf('{');
        const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
        }
        
        return NextResponse.json({ response: cleanResponse });
      } catch (error) {
        console.error('Error generating screening details:', error);
        
        // Extract position from prompt for smarter fallback
        const lowerPrompt = prompt.toLowerCase();
        let positionTitle = "Software Engineer";
        let mustHaves: string[] = [];
        let goodToHaves: string[] = [];
        
        if (lowerPrompt.includes('backend') || lowerPrompt.includes('back-end') || lowerPrompt.includes('back end')) {
          positionTitle = lowerPrompt.includes('senior') ? 'Senior Backend Developer' : 'Backend Developer';
          mustHaves = [
            "5+ years backend development experience",
            "Proficient in Python, Java, or Node.js",
            "RESTful API development expertise",
            "Database design and optimization",
            "Version control with Git"
          ];
          goodToHaves = [
            "Experience with microservices architecture",
            "Knowledge of cloud platforms (AWS, GCP, Azure)",
            "Understanding of containerization (Docker, Kubernetes)",
            "Experience with message queues and event-driven architecture"
          ];
        } else if (lowerPrompt.includes('frontend') || lowerPrompt.includes('front-end') || lowerPrompt.includes('front end')) {
          positionTitle = lowerPrompt.includes('senior') ? 'Senior Frontend Developer' : 'Frontend Developer';
          mustHaves = [
            "5+ years frontend development experience",
            "Proficient in React, Vue.js, or Angular",
            "JavaScript ES6+ expertise",
            "CSS/SCSS and responsive design",
            "Version control with Git"
          ];
          goodToHaves = [
            "Experience with TypeScript",
            "Knowledge of state management (Redux, MobX)",
            "Understanding of build tools (Webpack, Vite)",
            "Experience with testing frameworks (Jest, Cypress)"
          ];
        } else if (lowerPrompt.includes('product manager') || lowerPrompt.includes('product management')) {
          positionTitle = "Product Manager";
          mustHaves = [
            "5+ years product management experience",
            "Strong analytical and data-driven decision making",
            "Experience with agile development methodologies",
            "Excellent stakeholder management skills",
            "Technical background or strong technical understanding"
          ];
          goodToHaves = [
            "Experience with user research and UX design",
            "Knowledge of analytics tools (Google Analytics, Mixpanel)",
            "Experience with A/B testing and experimentation",
            "Previous startup or high-growth company experience",
            "MBA or relevant advanced degree"
          ];
        } else {
          // Default fallback
          mustHaves = [
            "Relevant experience in the field",
            "Strong problem-solving skills",
            "Excellent communication abilities",
            "Team collaboration experience"
          ];
          goodToHaves = [
            "Industry-specific certifications",
            "Advanced degree in related field",
            "Experience with modern tools and technologies"
          ];
        }
        
        const fallbackResponse = {
          positionTitle: positionTitle,
          mustHaves: mustHaves,
          goodToHaves: goodToHaves,
          culturalFit: [
            "Strong communication and presentation skills",
            "Collaborative team player with leadership qualities",
            "Adaptable to fast-paced, changing environments"
          ],
          estimatedTime: {
            mustHaves: 4,
            goodToHaves: 2,
            culturalFit: 2
          }
        };
        return NextResponse.json({ response: JSON.stringify(fallbackResponse) });
      }
    }

    if (action === 'start') {
      const { level = 'mid', focus, framework, jdText, profile, interviewer } = body || {};
      try {
        // Generate AI introduction - confidence-boosting
        const interviewerName = interviewer?.name || 'your interviewer';
        const interviewerRole = interviewer?.role || 'Senior Technical Interviewer';
        const introduction = `Hello! I'm ${interviewerName}, ${interviewerRole}. Welcome to your technical interview! I'm really excited to learn about your skills and experience. Don't worry about being perfect - I'm here to help you showcase what you know and we'll work through the questions together. Take your time, think out loud, and remember that showing your thought process is just as important as the final answer. You've got this! Let's begin with our first question.`;

        // Generate the first question
        const question = await generateQuestion({ level, focus, framework, jdText, profile });
        
        // Combine introduction with first question
        const fullMessage = `${introduction}\n\n${question}`;
        
        return NextResponse.json({ sessionId: Date.now().toString(), message: fullMessage });
      } catch (e: any) {
        // Graceful fallback (e.g., Gemini quota)
        const interviewerName = interviewer?.name || 'your interviewer';
        const interviewerRole = interviewer?.role || 'Senior Technical Interviewer';
        const introduction = `Hello! I'm ${interviewerName}, ${interviewerRole}. Welcome to your technical interview. Let's begin.`;
        const fw = profile ? profile : (framework || 'frontend');
        const jdHint = jdText ? ' (align to the job description context)' : '';
        const fallbackQ = `${introduction}\n\nIn ${fw}, how would you approach a relevant scenario${focus ? ` focused on ${focus}` : ''}? Please outline key trade-offs${jdHint}.`;
        return NextResponse.json({ sessionId: Date.now().toString(), message: fallbackQ, fallback: true });
      }
    }

    if (action === 'respond') {
      const { message: answer, previousQuestion, level = 'mid', focus, framework, jdText, profile, currentQuestion = 0 } = body || {};
      
      // Check if we've reached the 7 question limit
      if (currentQuestion >= 7) {
        return NextResponse.json({ 
          message: "Excellent work! You've done a great job answering all the questions. I really appreciate your thoughtful responses and the effort you put into this interview. You should be proud of your performance! Let me now summarize what we discussed so we can provide you with comprehensive feedback.", 
          shouldEnd: true 
        });
      }
      
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
        // Compute per-question scoring if qaPairs provided
        const normalized: Array<{ question: string; answer: string }> = Array.isArray(qaPairs)
          ? qaPairs.filter((p: any) => p && typeof p.question === 'string').map((p: any) => ({ question: p.question, answer: String(p.answer || '') }))
          : [];
        
        // Generate AI-powered analysis for each question (in parallel for speed)
        const questionAnalysisPromises = normalized.map((qa, idx) => {
          const len = qa.answer.trim().length;
          
          // If no answer was provided, return a minimal analysis
          if (len === 0) {
            return Promise.resolve({
              questionNumber: idx + 1,
              question: qa.question,
              answer: qa.answer,
              score: 0,
              feedback: 'No answer provided.',
              strengths: [],
              improvements: [
                'Provide at least a brief structured response',
                'Outline key steps, examples, and trade-offs'
              ],
              responseType: 'empty',
              confidence: 1
            });
          }

          // Classify the response first
          const responseClassification = classifyResponse(qa.answer, qa.question);
          
          // For invalid responses, return quick analysis
          if (responseClassification.type === 'nonsense' || 
              responseClassification.type === 'inappropriate' || 
              responseClassification.type === 'joke') {
            return Promise.resolve({
              questionNumber: idx + 1,
              question: qa.question,
              answer: qa.answer,
              score: responseClassification.type === 'inappropriate' ? 0 : 1,
              feedback: responseClassification.type === 'nonsense' 
                ? 'Inappropriate or nonsensical response. Please provide a serious technical answer.'
                : responseClassification.type === 'inappropriate'
                ? 'Inappropriate language used. Please maintain professionalism.'
                : 'This is a professional interview. Please provide a serious technical response.',
              strengths: [],
              improvements: ['Provide a proper technical response', 'Focus on the question asked'],
              responseType: responseClassification.type,
              confidence: responseClassification.confidence
            });
          }

          // For valid responses, use AI to generate detailed analysis
          return generateQuestionAnalysis(qa, idx + 1, profile, framework);
        });
        
        const questionAnalysis = await Promise.all(questionAnalysisPromises);
        const answeredCount = normalized.filter((qa: any) => qa.answer && qa.answer.trim().length > 0).length;

        // If no answers were provided, return a minimal, fair analysis without generic strengths
        if (answeredCount === 0) {
          const minimalFeedback = {
            summary: 'No answers were provided. We could not assess your skills from this session.',
            strengths: [],
            improvements: [
              'Answer at least one question to generate a meaningful evaluation',
              'Provide structured, detailed responses with examples',
              'Address trade-offs, edge cases, and testing strategies'
            ],
            categories: {}
          };
          return NextResponse.json({ score: 1, technicalScore: 0, communicationScore: 0, feedback: minimalFeedback, questionAnalysis });
        }

        // Otherwise generate the closing summary and compute overall score (with actual Q&A pairs)
        const closing = await generateEndSummary({ framework, jdText, profile, qaPairs: normalized });
        const avg = questionAnalysis.length > 0 ? Math.round(questionAnalysis.reduce((s, q) => s + (q.score || 0), 0) / questionAnalysis.length) : 7;
        // Factor in number of questions answered: scale by coverage ratio
        const coverage = normalized.length > 0 ? answeredCount / normalized.length : 1;
        const overallScore = Math.max(1, Math.min(10, Math.round(avg * (0.6 + 0.4 * coverage))));

        // Derive Technical Score (0–100) from per-question base scores and response types
        const technicalRaw = questionAnalysis.reduce((s, q: any) => s + (typeof q.score === 'number' ? q.score : 0), 0);
        const technicalAvg10 = questionAnalysis.length > 0 ? technicalRaw / questionAnalysis.length : 0;
        // Penalize clearly non-technical responses
        const penalty = questionAnalysis.reduce((p, q: any) => {
          if (q.responseType === 'nonsense' || q.responseType === 'inappropriate') return p + 2;
          if (q.responseType === 'joke' || q.responseType === 'off-topic') return p + 1;
          return p;
        }, 0);
        const technicalScore = Math.max(0, Math.min(100, Math.round((technicalAvg10 * 10) - penalty * 3)));

        // Derive Communication Score (0–100) via simple heuristics across all concatenated answers
        const allAnswers = normalized.map(a => a.answer || '').join(' \n ').toLowerCase();
        const lengthScore = Math.min(40, Math.floor(allAnswers.length / 150)); // up to 40 points for sufficient detail
        const structureScore = [/- /, /\n\d+\./, /first(ly)?|second(ly)?|finally|in conclusion/, /for example|e\.g\./].reduce((acc, re) => acc + (re.test(allAnswers) ? 8 : 0), 0); // up to ~32
        const fillerPenalty = (allAnswers.match(/\bum\b|\buk\b|\blike\b|\byou know\b|\bkinda\b/g) || []).length;
        const clarityPenalty = (allAnswers.match(/\b(idk|dont know|no idea)\b/g) || []).length * 2;
        const communicationScore = Math.max(0, Math.min(100, lengthScore + structureScore - fillerPenalty - clarityPenalty + 20)); // +20 baseline

        return NextResponse.json({ score: overallScore, technicalScore, communicationScore, feedback: closing, questionAnalysis });
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
