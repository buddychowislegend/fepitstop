/**
 * Test file to validate company interview endpoints
 * 
 * This script:
 * 1. Generates AI interview analysis from Q&A pairs
 * 2. Submits interview response to company interview API with detailed analysis
 * 3. Fetches screening details to verify analysis is stored and returned correctly
 * 4. Validates all detailed analysis fields (technicalScore, communicationScore, detailedFeedback, questionAnalysis)
 * 
 * Run with: node test-company-interview-endpoints.js
 */

const API_URL = process.env.API_URL || 'https://fepit.vercel.app';
const BACKEND_URL = process.env.BACKEND_URL || 'https://fepit.vercel.app';

// Use the same mock Q&A pairs from the analysis test
const mockInterviewQAPairs = [
  {
    question: "Explain how JavaScript closures work and provide a practical example.",
    answer: `A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned. This happens because the inner function maintains a reference to its outer scope's variables.

Here's a practical example:
function createCounter() {
  let count = 0; // This variable is in the outer scope
  
  return function() {
    count++; // Inner function accesses outer scope variable
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2

The closure allows the inner function to 'remember' and access the 'count' variable even after createCounter() has finished executing. This is useful for:
- Data privacy and encapsulation
- Creating function factories
- Implementing modules and namespaces
- Maintaining state in callbacks

Closures are fundamental to JavaScript and are used extensively in modern frameworks like React for hooks.`
  },
  {
    question: "What is the difference between let, const, and var in JavaScript?",
    answer: `The key differences are in scope, hoisting, and reassignment:

1. **var**:
   - Function-scoped or globally-scoped (not block-scoped)
   - Hoisted and initialized with undefined
   - Can be redeclared in the same scope
   - Example: if(true) { var x = 1; } console.log(x); // 1 (leaks out)

2. **let**:
   - Block-scoped (limited to {} blocks, loops, if statements)
   - Hoisted but in a "temporal dead zone" until declaration
   - Cannot be redeclared in the same scope
   - Can be reassigned
   - Example: if(true) { let y = 1; } console.log(y); // ReferenceError

3. **const**:
   - Block-scoped like let
   - Cannot be reassigned (but object properties can be modified)
   - Must be initialized at declaration
   - Example: const z = []; z.push(1); // OK, but z = [] would error

Best practice: Use const by default, let when you need to reassign, and avoid var in modern JavaScript.`
  },
  {
    question: "How does the JavaScript event loop work?",
    answer: `The event loop is JavaScript's mechanism for handling asynchronous operations. It manages the execution of code, callbacks, and handles events.

Key components:
1. **Call Stack**: Where synchronous code executes (LIFO)
2. **Callback Queue**: Holds callbacks from async operations (FIFO)
3. **Microtask Queue**: Higher priority queue for promises and queueMicrotask
4. **Event Loop**: Continuously checks if call stack is empty, then moves tasks from queues

Execution order:
- Synchronous code runs first
- When call stack is empty, event loop checks microtask queue (promises, queueMicrotask)
- After microtasks, event loop processes callback queue (setTimeout, setInterval, I/O)
- This process repeats

Example:
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2

This happens because:
- '1' and '4' are synchronous
- Promise (microtask) runs before setTimeout (macrotask)
- Event loop prioritizes microtasks over regular callbacks`
  },
  {
    question: "Explain async/await in JavaScript with error handling.",
    answer: `async/await is syntactic sugar built on top of Promises that makes asynchronous code look and behave more like synchronous code.

Key points:
- **async functions** always return a Promise
- **await** pauses execution until Promise resolves or rejects
- **Error handling** uses try/catch blocks

Example:
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error; // Re-throw to caller
  }
}

Benefits over Promises:
- More readable code (looks like synchronous code)
- Easier error handling with try/catch
- Better stack traces for debugging
- Sequential flow is more intuitive

Under the hood, async/await is transformed to Promise chains by the JavaScript engine.`
  },
  {
    question: "What are Promises in JavaScript and how do you handle multiple promises?",
    answer: `A Promise is an object representing the eventual completion (or failure) of an asynchronous operation.

Promise states:
1. **Pending**: Initial state, neither fulfilled nor rejected
2. **Fulfilled**: Operation completed successfully
3. **Rejected**: Operation failed

Creating a Promise:
const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = Math.random() > 0.5;
    if (success) {
      resolve('Operation succeeded');
    } else {
      reject(new Error('Operation failed'));
    }
  }, 1000);
});

Handling multiple promises:

1. **Promise.all()**: Waits for all promises to resolve, fails fast on first rejection
Promise.all([promise1, promise2, promise3])
  .then(results => console.log('All succeeded:', results))
  .catch(error => console.error('One failed:', error));

2. **Promise.allSettled()**: Waits for all promises to settle (resolve or reject)
Promise.allSettled([promise1, promise2, promise3])
  .then(results => results.forEach(result => console.log(result.status)));

3. **Promise.race()**: Returns the first promise that settles
Promise.race([promise1, promise2])
  .then(firstResult => console.log('First to complete:', firstResult));

Use Promise.all() when all promises must succeed, Promise.allSettled() when you need all results regardless of failures.`
  },
  {
    question: "Explain 'this' binding in JavaScript and provide examples.",
    answer: `The 'this' keyword in JavaScript refers to the context in which a function is called, not where it's defined. Its value is determined at runtime.

Binding rules (in priority order):

1. **Implicit Binding**: 'this' refers to the object calling the method
const person = {
  name: 'John',
  greet() {
    console.log(\`Hello, I'm \${this.name}\`);
  }
};
person.greet(); // "Hello, I'm John" - 'this' is 'person'

2. **Explicit Binding**: Using call(), apply(), or bind()
function greet() {
  console.log(\`Hello, \${this.name}\`);
}
const person = { name: 'John' };
greet.call(person); // "Hello, John" - explicitly set 'this'

3. **Arrow Functions**: 'this' is lexically bound (inherited from surrounding scope)
const obj = {
  name: 'John',
  regularFunction() {
    setTimeout(function() {
      console.log(this.name); // undefined (this is window/setTimeout context)
    }, 100);
  },
  arrowFunction() {
    setTimeout(() => {
      console.log(this.name); // "John" (this is 'obj')
    }, 100);
  }
};

4. **New Binding**: 'this' refers to the newly created instance
function Person(name) {
  this.name = name;
}
const person = new Person('John'); // 'this' is the new instance

5. **Default Binding**: 'this' is undefined (strict mode) or global object (non-strict)

Common pitfalls:
- Losing 'this' context when passing methods as callbacks
- Arrow functions don't have their own 'this' binding`
  },
  {
    question: "How does JavaScript prototype chain work?",
    answer: `JavaScript uses prototypal inheritance where objects inherit properties and methods from their prototype chain.

Key concepts:

1. **Prototype Chain**: Every object has a hidden [[Prototype]] property pointing to another object
2. **Prototype Lookup**: When accessing a property, JS looks up the chain until found or reaches null
3. **Object.prototype**: Root of all prototype chains

Example:
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return \`\${this.name} makes a sound\`;
};

function Dog(name, breed) {
  Animal.call(this, name); // Call parent constructor
  this.breed = breed;
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.speak = function() {
  return \`\${this.name} barks\`;
};

const dog = new Dog('Buddy', 'Golden Retriever');
console.log(dog.speak()); // "Buddy barks"
console.log(dog.name); // "Buddy"

How lookup works:
1. Check dog object for 'speak' - found, return it
2. If not found, check Dog.prototype - found 'speak', return it
3. If still not found, check Animal.prototype - would find if Dog didn't override
4. Continue up chain to Object.prototype, then null

Modern approach (ES6 classes):
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return \`\${this.name} makes a sound\`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  speak() {
    return \`\${this.name} barks\`;
  }
}

Classes are syntactic sugar over prototype-based inheritance.`
  }
];

// Test configuration
const TEST_CONFIG = {
  companyId: 'hireog',
  companyPassword: 'manasi22',
  candidateName: 'Test Candidate',
  candidateEmail: `test-${Date.now()}@example.com`,
  profile: 'frontend',
  level: 'mid',
  company: 'Test Company',
  framework: 'React'
};

let testScreeningId = null;
let testCandidateId = null;
let testToken = null;

/**
 * Check if backend server is running
 */
async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/company/screenings`, {
      method: 'GET',
      headers: {
        'X-Company-ID': TEST_CONFIG.companyId,
        'X-Company-Password': TEST_CONFIG.companyPassword,
        'Content-Type': 'application/json'
      }
    });
    return response.status !== 404 && response.status !== 500;
  } catch {
    return false;
  }
}

/**
 * Check if frontend API is running
 */
async function checkFrontendHealth() {
  try {
    const response = await fetch(`${API_URL}/api/ai-interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', profile: TEST_CONFIG.profile, level: TEST_CONFIG.level })
    });
    return response.status !== 404;
  } catch {
    return false;
  }
}

/**
 * Step 1: Generate AI interview analysis
 */
async function generateAnalysis() {
  console.log('\n📊 Step 1: Generating AI Interview Analysis');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${API_URL}/api/ai-interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'end',
        profile: TEST_CONFIG.profile,
        framework: TEST_CONFIG.framework,
        level: TEST_CONFIG.level,
        qaPairs: mockInterviewQAPairs
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ Analysis Generated');
    console.log(`   Overall Score: ${data.score || 'N/A'}/10`);
    console.log(`   Technical Score: ${data.technicalScore || 'N/A'}/100`);
    console.log(`   Communication Score: ${data.communicationScore || 'N/A'}/100`);
    console.log(`   Question Analysis: ${Array.isArray(data.questionAnalysis) ? data.questionAnalysis.length : 0} questions`);
    
    return data;
  } catch (error) {
    console.error('❌ Failed to generate analysis:', error.message);
    throw error;
  }
}

/**
 * Step 2: Create test screening and candidate
 */
async function setupTestData() {
  console.log('\n🏗️  Step 2: Setting Up Test Data (Screening & Candidate)');
  console.log('-'.repeat(60));
  
  try {
    // Create a test screening
    const screeningResponse = await fetch(`${BACKEND_URL}/api/company/screenings`, {
      method: 'POST',
      headers: {
        'X-Company-ID': TEST_CONFIG.companyId,
        'X-Company-Password': TEST_CONFIG.companyPassword,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `Test Screening ${Date.now()}`,
        positionTitle: 'Frontend Developer',
        status: 'active'
      })
    });

    if (!screeningResponse.ok) {
      const errorText = await screeningResponse.text();
      throw new Error(`Failed to create screening: ${screeningResponse.status}\n${errorText}`);
    }

    const screeningData = await screeningResponse.json();
    testScreeningId = screeningData.screening?.id || screeningData.id;
    
    console.log(`✅ Screening created: ${testScreeningId}`);
    
    // Add candidate to screening
    const inviteResponse = await fetch(`${BACKEND_URL}/api/company/screenings/${testScreeningId}/invite-candidates`, {
      method: 'POST',
      headers: {
        'X-Company-ID': TEST_CONFIG.companyId,
        'X-Company-Password': TEST_CONFIG.companyPassword,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        candidates: [{
          name: TEST_CONFIG.candidateName,
          email: TEST_CONFIG.candidateEmail,
          profile: TEST_CONFIG.profile
        }]
      })
    });

    if (!inviteResponse.ok) {
      const errorText = await inviteResponse.text();
      throw new Error(`Failed to invite candidate: ${inviteResponse.status}\n${errorText}`);
    }

    const inviteData = await inviteResponse.json();
    console.log('✅ Candidate invited');
    
    // Wait a moment for database to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try to extract token from invite response (if links are included)
    let token = null;
    if (inviteData.links && Array.isArray(inviteData.links) && inviteData.links.length > 0) {
      const candidateLink = inviteData.links.find(l => l.candidate?.email === TEST_CONFIG.candidateEmail);
      if (candidateLink?.link) {
        // Extract token from interview link URL
        const url = new URL(candidateLink.link);
        token = url.searchParams.get('token');
        if (token) {
          console.log(`✅ Token extracted from invite response`);
        }
      }
    }
    
    // Get candidate ID by fetching screening details
    const detailsResponse = await fetch(`${BACKEND_URL}/api/company/screenings/${testScreeningId}/details`, {
      method: 'GET',
      headers: {
        'X-Company-ID': TEST_CONFIG.companyId,
        'X-Company-Password': TEST_CONFIG.companyPassword,
        'Content-Type': 'application/json'
      }
    });

    if (!detailsResponse.ok) {
      throw new Error(`Failed to get screening details: ${detailsResponse.status}`);
    }

    const detailsData = await detailsResponse.json();
    const candidate = detailsData.candidates?.find(c => c.email === TEST_CONFIG.candidateEmail);
    
    if (!candidate) {
      throw new Error('Candidate not found in screening details');
    }

    testCandidateId = candidate.id;
    console.log(`✅ Candidate ID: ${testCandidateId}`);
    
    // If token wasn't extracted from response, try to find it by testing recent timestamps
    if (!token) {
      console.log('   Searching for token...');
      const searchStartTime = Date.now() - 5000; // Search last 5 seconds
      
      for (let offset = 0; offset < 5000; offset += 500) {
        const testTimestamp = searchStartTime + offset;
        const testToken = Buffer.from(`${testCandidateId}-${testScreeningId}-${testTimestamp}`).toString('base64');
        
        try {
          const configResponse = await fetch(`${BACKEND_URL}/api/company/interview/config/${testToken}`, {
            method: 'GET',
            headers: {
              'X-Company-ID': TEST_CONFIG.companyId,
              'X-Company-Password': TEST_CONFIG.companyPassword
            }
          });
          
          if (configResponse.ok) {
            token = testToken;
            console.log(`✅ Found token by searching recent timestamps`);
            break;
          }
        } catch (e) {
          // Continue searching
        }
      }
    }
    
    return { screeningId: testScreeningId, candidateId: testCandidateId, token };
  } catch (error) {
    console.error('❌ Failed to setup test data:', error.message);
    throw error;
  }
}

/**
 * Step 3: Submit interview with detailed analysis
 */
async function submitInterview(analysisData, token) {
  console.log('\n📤 Step 3: Submitting Interview with Detailed Analysis');
  console.log('-'.repeat(60));
  
  try {
    // Map analysis data to submission format
    const mappedFeedback = typeof analysisData?.feedback === 'string' 
      ? { summary: analysisData.feedback }
      : analysisData?.feedback || {};
    
    const overallScore = typeof analysisData?.score === 'number' ? Math.round(analysisData.score * 10) : null;
    
    const submissionData = {
      candidateName: TEST_CONFIG.candidateName,
      candidateEmail: TEST_CONFIG.candidateEmail,
      profile: TEST_CONFIG.profile,
      level: TEST_CONFIG.level,
      company: TEST_CONFIG.company,
      qaPairs: mockInterviewQAPairs.map(qa => ({
        question: qa.question,
        answer: qa.answer
      })),
      score: overallScore || 0,
      overallScore: overallScore,
      technicalScore: analysisData.technicalScore || null,
      communicationScore: analysisData.communicationScore || null,
      feedback: typeof mappedFeedback === 'string' ? mappedFeedback : mappedFeedback.summary || '',
      detailedFeedback: mappedFeedback,
      questionAnalysis: Array.isArray(analysisData.questionAnalysis) ? analysisData.questionAnalysis : null,
      completedAt: new Date().toISOString()
    };
    
    console.log('📋 Submission Data:');
    console.log(`   Score: ${submissionData.score}`);
    console.log(`   Technical Score: ${submissionData.technicalScore || 'N/A'}`);
    console.log(`   Communication Score: ${submissionData.communicationScore || 'N/A'}`);
    console.log(`   Has Detailed Feedback: ${!!submissionData.detailedFeedback}`);
    console.log(`   Question Analysis Count: ${Array.isArray(submissionData.questionAnalysis) ? submissionData.questionAnalysis.length : 0}`);
    
    const response = await fetch(`${BACKEND_URL}/api/company/interview/${token}/submit`, {
      method: 'POST',
      headers: {
        'X-Company-ID': TEST_CONFIG.companyId,
        'X-Company-Password': TEST_CONFIG.companyPassword,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ Interview Submitted Successfully');
    console.log(`   Response Score: ${data.score || 'N/A'}`);
    console.log(`   Response Technical Score: ${data.technicalScore || 'N/A'}`);
    console.log(`   Response Communication Score: ${data.communicationScore || 'N/A'}`);
    
    return data;
  } catch (error) {
    console.error('❌ Failed to submit interview:', error.message);
    throw error;
  }
}

/**
 * Step 4: Fetch screening details and validate
 */
async function fetchAndValidateAnalysis(screeningId) {
  console.log('\n📥 Step 4: Fetching Screening Details & Validating Analysis');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/company/screenings/${screeningId}/details?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'X-Company-ID': TEST_CONFIG.companyId,
        'X-Company-Password': TEST_CONFIG.companyPassword,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ Screening Details Retrieved');
    
    const candidate = data.candidates?.find(c => c.email === TEST_CONFIG.candidateEmail);
    
    if (!candidate) {
      throw new Error('Test candidate not found in screening details');
    }
    
    console.log('\n📊 CANDIDATE ANALYSIS VALIDATION:');
    console.log('='.repeat(60));
    
    const validations = {
      hasScore: candidate.score !== null && candidate.score !== undefined,
      hasTechnicalScore: candidate.technicalScore !== null && candidate.technicalScore !== undefined,
      hasCommunicationScore: candidate.communicationScore !== null && candidate.communicationScore !== undefined,
      hasDetailedFeedback: !!candidate.detailedFeedback,
      hasQuestionAnalysis: Array.isArray(candidate.questionAnalysis) && candidate.questionAnalysis.length > 0,
      hasQAPairs: Array.isArray(candidate.qaPairs) && candidate.qaPairs.length > 0,
      statusIsCompleted: candidate.status === 'completed'
    };
    
    console.log('\n✅ Validation Results:');
    Object.entries(validations).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase());
      console.log(`   ${value ? '✅' : '❌'} ${label}: ${value ? 'YES' : 'NO'}`);
    });
    
    // Detailed validation
    console.log('\n📈 Detailed Scores:');
    console.log(`   Overall Score: ${candidate.score !== null ? candidate.score : 'MISSING ❌'}`);
    console.log(`   Technical Score: ${candidate.technicalScore !== null ? candidate.technicalScore : 'MISSING ❌'}`);
    console.log(`   Communication Score: ${candidate.communicationScore !== null ? candidate.communicationScore : 'MISSING ❌'}`);
    
    if (candidate.detailedFeedback) {
      console.log('\n📝 Detailed Feedback Structure:');
      const feedback = typeof candidate.detailedFeedback === 'object' ? candidate.detailedFeedback : { summary: candidate.detailedFeedback };
      console.log(`   Has Summary: ${!!feedback.summary ? '✅' : '❌'}`);
      console.log(`   Has Strengths: ${Array.isArray(feedback.strengths) && feedback.strengths.length > 0 ? `✅ (${feedback.strengths.length})` : '❌'}`);
      console.log(`   Has Improvements: ${Array.isArray(feedback.improvements) && feedback.improvements.length > 0 ? `✅ (${feedback.improvements.length})` : '❌'}`);
      console.log(`   Has Categories: ${!!feedback.categories ? '✅' : '❌'}`);
    } else {
      console.log('\n❌ Detailed Feedback: MISSING');
    }
    
    if (Array.isArray(candidate.questionAnalysis) && candidate.questionAnalysis.length > 0) {
      console.log(`\n📋 Question Analysis: ✅ (${candidate.questionAnalysis.length} questions)`);
      candidate.questionAnalysis.forEach((qa, idx) => {
        console.log(`   Q${qa.questionNumber || idx + 1}: Score ${qa.score || 'N/A'}/10`);
        console.log(`      - Has Feedback: ${qa.feedback ? '✅' : '❌'}`);
        console.log(`      - Has Strengths: ${Array.isArray(qa.strengths) && qa.strengths.length > 0 ? `✅ (${qa.strengths.length})` : '❌'}`);
        console.log(`      - Has Improvements: ${Array.isArray(qa.improvements) && qa.improvements.length > 0 ? `✅ (${qa.improvements.length})` : '❌'}`);
      });
    } else {
      console.log('\n❌ Question Analysis: MISSING or EMPTY');
    }
    
    if (Array.isArray(candidate.qaPairs) && candidate.qaPairs.length > 0) {
      console.log(`\n💬 Q&A Pairs: ✅ (${candidate.qaPairs.length} pairs)`);
    } else {
      console.log('\n❌ Q&A Pairs: MISSING or EMPTY');
    }
    
    const allPassed = Object.values(validations).every(v => v);
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n${allPassed ? '✅ ALL VALIDATIONS PASSED' : '⚠️  SOME VALIDATIONS FAILED'}\n`);
    
    return { candidate, allPassed };
  } catch (error) {
    console.error('❌ Failed to fetch/validate:', error.message);
    throw error;
  }
}

/**
 * Main test function
 */
async function runTest() {
  console.log('\n🧪 Company Interview Endpoints Test');
  console.log('='.repeat(60));
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend API URL: ${API_URL}`);
  console.log(`Candidate Email: ${TEST_CONFIG.candidateEmail}\n`);
  
  // Check server health
  console.log('🔍 Checking server health...');
  const backendHealth = await checkBackendHealth();
  const frontendHealth = await checkFrontendHealth();
  
  if (!backendHealth) {
    console.log('\n⚠️  Backend server is not accessible.');
    console.log('   Make sure the backend is running and accessible at:', BACKEND_URL);
    process.exit(1);
  }
  
  if (!frontendHealth) {
    console.log('\n⚠️  Frontend API server is not accessible.');
    console.log('   Make sure the Next.js dev server is running: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Both servers are accessible\n');
  
  try {
    // Step 1: Generate analysis
    const analysisData = await generateAnalysis();
    
    // Step 2: Setup test data (screening, candidate, and token)
    const { screeningId, candidateId, token } = await setupTestData();
    
    if (!token) {
      console.log('\n⚠️  Could not retrieve interview token.');
      console.log('   The token should be created during invite-candidates.');
      console.log('   Please check the invite response or database for the token.');
      console.log('   Exiting test.\n');
      process.exit(1);
    }
    
    console.log(`✅ Token retrieved: ${token.substring(0, 30)}...`);
    
    // Step 3: Submit interview
    await submitInterview(analysisData, token);
    
    // Wait a bit for database to update
    console.log('\n⏳ Waiting for database update...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Fetch and validate
    const { candidate, allPassed } = await fetchAndValidateAnalysis(screeningId);
    
    // Print full candidate data for debugging
    console.log('\n📄 FULL CANDIDATE DATA (for debugging):');
    console.log('-'.repeat(60));
    console.log(JSON.stringify(candidate, null, 2));
    
    if (allPassed) {
      console.log('\n🎉 Test completed successfully! All endpoints working correctly.\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Test completed but some validations failed.');
      console.log('   Review the validation results above.\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  runTest().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runTest, mockInterviewQAPairs };

