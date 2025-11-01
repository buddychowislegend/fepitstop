/**
 * Test file to validate interview analysis accuracy
 * 
 * This script:
 * 1. Simulates a complete interview with accurate answers
 * 2. Submits Q&A pairs to the analysis endpoint
 * 3. Validates that feedback is specific and references actual answers
 * 4. Checks if improvements and strengths are relevant to the actual Q&A
 * 
 * Run with: node test-interview-analysis.js
 */

// Mock interview Q&A pairs with accurate, detailed answers
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
- Makes error handling cleaner with try/catch
- Better for sequential async operations

Example:
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) throw new Error('Network error');
    
    const user = await response.json();
    const posts = await fetch(\`/api/users/\${userId}/posts\`).then(r => r.json());
    
    return { user, posts };
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error; // Re-throw or handle appropriately
  }
}

Benefits:
- Sequential async operations are easier to read
- Error handling with try/catch (familiar syntax)
- Can await multiple promises in parallel with Promise.all()
- Better stack traces than promise chains

Example with parallel operations:
const [user, posts, comments] = await Promise.all([
  fetchUser(userId),
  fetchPosts(userId),
  fetchComments(userId)
]);`
  },
  {
    question: "What are JavaScript promises and how do they differ from callbacks?",
    answer: `A Promise is an object representing the eventual completion (or failure) of an asynchronous operation. It's a cleaner alternative to callbacks.

Promise states:
1. **Pending**: Initial state
2. **Fulfilled**: Operation completed successfully (resolved)
3. **Rejected**: Operation failed (rejected)

Key differences from callbacks:
- Promises avoid callback hell (nested callbacks)
- Better error handling with .catch()
- Can chain operations with .then()
- Supports parallel operations with Promise.all(), Promise.race()

Example:
// Callback approach (callback hell)
getData(function(data) {
  processData(data, function(result) {
    saveData(result, function(saved) {
      console.log('Done:', saved);
    });
  });
});

// Promise approach (cleaner)
getData()
  .then(data => processData(data))
  .then(result => saveData(result))
  .then(saved => console.log('Done:', saved))
  .catch(error => console.error('Error:', error));

// Or with async/await (even cleaner)
try {
  const data = await getData();
  const result = await processData(data);
  const saved = await saveData(result);
  console.log('Done:', saved);
} catch (error) {
  console.error('Error:', error);
}

Promise methods:
- Promise.all(): Waits for all promises (fails fast on first rejection)
- Promise.allSettled(): Waits for all (doesn't fail fast)
- Promise.race(): Returns first resolved/rejected promise`
  },
  {
    question: "Explain 'this' binding in JavaScript and how it works in different contexts.",
    answer: `'this' refers to the execution context and its value depends on how a function is called, not where it's defined.

Binding rules (in order of precedence):
1. **new binding**: When using 'new' keyword
   function Person(name) {
     this.name = name; // 'this' refers to new instance
   }
   const p = new Person('John');

2. **Explicit binding**: Using call(), apply(), bind()
   function greet() { return \`Hello, \${this.name}\`; }
   const obj = { name: 'John' };
   greet.call(obj); // 'this' refers to obj

3. **Implicit binding**: When called as method of object
   const obj = {
     name: 'John',
     greet() { return \`Hello, \${this.name}\`; }
   };
   obj.greet(); // 'this' refers to obj

4. **Default binding**: In strict mode (undefined), non-strict (global object)
   function test() { console.log(this); }
   test(); // undefined (strict) or global object

Arrow functions: Don't have their own 'this', inherit from enclosing scope
   const obj = {
     name: 'John',
     regular() {
       setTimeout(function() {
         console.log(this.name); // undefined (this refers to global/window)
       }, 100);
     },
     arrow() {
       setTimeout(() => {
         console.log(this.name); // 'John' (this from outer scope)
       }, 100);
     }
   };`
  },
  {
    question: "What is the prototype chain in JavaScript and how does inheritance work?",
    answer: `JavaScript uses prototypal inheritance where objects can inherit properties and methods from other objects through the prototype chain.

Key concepts:
- Every object has a prototype (accessed via __proto__ or Object.getPrototypeOf())
- When accessing a property, JavaScript looks up the prototype chain until found or undefined
- Functions have a .prototype property used when called with 'new'
- Object.create() creates objects with specified prototype

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
Dog.prototype = Object.create(Animal.prototype); // Set up inheritance
Dog.prototype.constructor = Dog; // Fix constructor reference
Dog.prototype.speak = function() {
  return \`\${this.name} barks!\`;
};

const dog = new Dog('Buddy', 'Golden Retriever');
dog.speak(); // "Buddy barks!" (overridden method)
console.log(dog.name); // "Buddy" (from Animal)

Prototype chain lookup:
1. Check object's own properties
2. Check prototype (__proto__)
3. Continue up chain until found or null
4. Return undefined if not found

Modern alternative (ES6 classes):
class Animal {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} makes a sound\`; }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  speak() { return \`\${this.name} barks!\`; }
}

Classes are syntactic sugar over prototype-based inheritance.`
  }
];

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3002';
const PROFILE = 'frontend';
const FRAMEWORK = 'React';
const LEVEL = 'mid';

/**
 * Check if server is running
 */
async function checkServerHealth(url) {
  try {
    const response = await fetch(`${url}/api/ai-interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', profile: PROFILE, level: LEVEL })
    });
    return response.status !== 404;
  } catch {
    return false;
  }
}

/**
 * Test the interview analysis endpoint
 */
async function testInterviewAnalysis() {
  console.log('🧪 Testing Interview Analysis Accuracy\n');
  console.log('='.repeat(60));
  console.log(`Testing with ${mockInterviewQAPairs.length} Q&A pairs`);
  console.log(`Profile: ${PROFILE}, Framework: ${FRAMEWORK}, Level: ${LEVEL}\n`);

  // Check if server is running
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServerHealth(API_URL);
  
  if (!serverRunning) {
    console.log('\n⚠️  Server is not running or not accessible.');
    console.log('\n📝 To run this test:');
    console.log('   1. Start your Next.js development server:');
    console.log('      npm run dev');
    console.log('   2. Wait for server to be ready');
    console.log('   3. Run this test again:');
    console.log('      node test-interview-analysis.js');
    console.log('\n   Or set a custom API URL:');
    console.log('      API_URL=https://your-api-url.com node test-interview-analysis.js\n');
    process.exit(1);
  }

  console.log('✅ Server is running\n');

  try {
    console.log('📤 Sending Q&A pairs for analysis...\n');
    
    // Call the analysis endpoint
    const response = await fetch(`${API_URL}/api/ai-interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'end',
        profile: PROFILE,
        framework: FRAMEWORK,
        level: LEVEL,
        qaPairs: mockInterviewQAPairs
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ Analysis Generated Successfully\n');
    console.log('='.repeat(60));
    
    // Print raw response for debugging
    console.log('\n📄 RAW API RESPONSE:');
    console.log('-'.repeat(60));
    console.log(JSON.stringify(data, null, 2));
    console.log('-'.repeat(60));
    console.log('\n');
    
    // Analyze results
    const allPassed = analyzeResults(data);
    
    return allPassed;
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack && error.message.includes('fetch failed')) {
      console.error('\n💡 Tip: Make sure your Next.js dev server is running on', API_URL);
      console.error('   Run: npm run dev\n');
    } else if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Validate and analyze the results
 */
function analyzeResults(data) {
  console.log('\n📊 DETAILED ANALYSIS RESULTS');
  console.log('='.repeat(60));
  
  // Print overall scores first
  console.log('\n🎯 OVERALL SCORES:');
  console.log('-'.repeat(60));
  if (data.score !== undefined) {
    console.log(`   Overall Score: ${data.score}/10`);
  }
  if (data.technicalScore !== undefined) {
    console.log(`   Technical Score: ${data.technicalScore}/100`);
  }
  if (data.communicationScore !== undefined) {
    console.log(`   Communication Score: ${data.communicationScore}/100`);
  }
  
  // Check overall feedback
  if (data.feedback) {
    const feedback = typeof data.feedback === 'string' 
      ? { summary: data.feedback }
      : data.feedback;
    
    console.log('\n\n📝 DETAILED FEEDBACK SUMMARY:');
    console.log('-'.repeat(60));
    if (feedback.summary) {
      console.log('\n' + feedback.summary);
      console.log('\n' + '-'.repeat(60));
      
      // Validate summary references specific answers
      const summarySpecific = checkIfSpecific(feedback.summary, mockInterviewQAPairs);
      console.log(`\n✓ Summary Specificity: ${summarySpecific ? 'References specific Q&A ✅' : 'Generic ❌'}`);
    } else {
      console.log('No summary provided');
    }
    
    if (feedback.strengths && Array.isArray(feedback.strengths)) {
      console.log('\n\n💪 STRENGTHS IDENTIFIED:');
      console.log('-'.repeat(60));
      feedback.strengths.forEach((strength, idx) => {
        console.log(`\n${idx + 1}. ${strength}`);
        const isSpecific = checkIfSpecific(strength, mockInterviewQAPairs);
        console.log(`   ${isSpecific ? '✅' : '❌'} ${isSpecific ? 'References specific answers' : 'Generic statement'}`);
      });
    }
    
    if (feedback.improvements && Array.isArray(feedback.improvements)) {
      console.log('\n\n🔧 AREAS FOR IMPROVEMENT (DETAILED):');
      console.log('-'.repeat(60));
      
      if (feedback.improvements.length === 0) {
        console.log('\n   No improvements suggested - candidate performed excellently!');
      } else {
        feedback.improvements.forEach((improvement, idx) => {
          console.log(`\n${idx + 1}. ${improvement}`);
          
          // Detailed specificity analysis
          const isSpecific = checkIfSpecific(improvement, mockInterviewQAPairs);
          console.log(`   ${isSpecific ? '✅' : '❌'} Specificity: ${isSpecific ? 'References actual gaps from answers' : 'Generic/not specific to actual responses'}`);
          
          // Analyze what type of improvement it is
          const improvementType = analyzeImprovementType(improvement);
          console.log(`   📋 Type: ${improvementType.type}`);
          if (improvementType.details) {
            console.log(`   📝 Details: ${improvementType.details}`);
          }
          
          // Check if improvement references a specific question
          const questionRef = extractQuestionReference(improvement);
          if (questionRef) {
            console.log(`   🔢 References: Question ${questionRef}`);
          } else {
            console.log(`   🔢 References: No specific question mentioned`);
          }
          
          // Check if improvement mentions specific technical concepts
          const technicalConcepts = extractTechnicalConcepts(improvement);
          if (technicalConcepts.length > 0) {
            console.log(`   🔬 Technical Areas: ${technicalConcepts.join(', ')}`);
          }
        });
        
        // Summary of improvements
        console.log(`\n📊 Improvement Summary:`);
        console.log(`   Total Improvements: ${feedback.improvements.length}`);
        const specificImprovements = feedback.improvements.filter(imp => checkIfSpecific(imp, mockInterviewQAPairs));
        console.log(`   Specific Improvements: ${specificImprovements.length}/${feedback.improvements.length}`);
        console.log(`   Generic Improvements: ${feedback.improvements.length - specificImprovements.length}/${feedback.improvements.length}`);
      }
    }
    
    if (feedback.categories && typeof feedback.categories === 'object') {
      console.log('\n\n📈 CATEGORY-WISE BREAKDOWN:');
      console.log('-'.repeat(60));
      Object.entries(feedback.categories).forEach(([category, score]) => {
        const scoreNum = typeof score === 'number' ? score : parseFloat(score) || 0;
        const barLength = Math.round(scoreNum);
        const bar = '█'.repeat(barLength) + '░'.repeat(10 - barLength);
        console.log(`\n${category}:`);
        console.log(`   Score: ${scoreNum}/10  [${bar}]`);
      });
    }
  }
  
  // Check per-question analysis
  if (data.questionAnalysis && Array.isArray(data.questionAnalysis)) {
    console.log('\n\n📋 PER-QUESTION DETAILED ANALYSIS');
    console.log('='.repeat(60));
    
    data.questionAnalysis.forEach((analysis, idx) => {
      const qNum = analysis.questionNumber || idx + 1;
      console.log(`\n\n🔹 QUESTION ${qNum} ANALYSIS:`);
      console.log('-'.repeat(60));
      
      console.log(`\n📌 Question:`);
      console.log(`   ${analysis.question}`);
      
      console.log(`\n📝 Candidate Answer:`);
      const answerPreview = analysis.answer.length > 200 
        ? analysis.answer.substring(0, 200) + '...' 
        : analysis.answer;
      console.log(`   ${answerPreview}`);
      
      console.log(`\n📊 Score: ${analysis.score}/10`);
      const scoreBar = '█'.repeat(analysis.score) + '░'.repeat(10 - analysis.score);
      console.log(`   [${scoreBar}]`);
      
      // Validate score is reasonable for accurate answers
      if (analysis.score < 7) {
        console.log(`   ⚠️  Warning: Score seems low for accurate answer (expected 7+)`);
      }
      
      if (analysis.feedback) {
        console.log(`\n💬 DETAILED FEEDBACK:`);
        console.log(`   ${analysis.feedback}`);
        
        const isSpecific = checkIfSpecific(analysis.feedback, [{ question: analysis.question, answer: analysis.answer }]);
        console.log(`   ${isSpecific ? '✅' : '❌'} Specificity: ${isSpecific ? 'References specific content from answer' : 'Generic feedback (not specific)'}`);
        
        // Analyze feedback quality
        const feedbackAnalysis = analyzeFeedbackQuality(analysis.feedback, analysis.question, analysis.answer);
        console.log(`\n   📊 Feedback Quality Analysis:`);
        console.log(`      - Length: ${analysis.feedback.length} characters`);
        console.log(`      - Mentions question topic: ${feedbackAnalysis.mentionsTopic ? '✅' : '❌'}`);
        console.log(`      - Provides actionable insight: ${feedbackAnalysis.isActionable ? '✅' : '❌'}`);
        console.log(`      - References answer content: ${feedbackAnalysis.referencesAnswer ? '✅' : '❌'}`);
        if (feedbackAnalysis.suggestions.length > 0) {
          console.log(`      - Suggestions: ${feedbackAnalysis.suggestions.join(', ')}`);
        }
      }
      
      if (analysis.strengths && Array.isArray(analysis.strengths) && analysis.strengths.length > 0) {
        console.log(`\n✅ Strengths Identified:`);
        analysis.strengths.forEach((strength, sIdx) => {
          const isSpecific = checkIfSpecific(strength, [{ question: analysis.question, answer: analysis.answer }]);
          console.log(`   ${sIdx + 1}. ${strength}`);
          console.log(`      ${isSpecific ? '✅' : '❌'} ${isSpecific ? 'References specific content' : 'Generic statement'}`);
        });
      } else {
        console.log(`\n✅ Strengths: None identified`);
      }
      
      if (analysis.improvements && Array.isArray(analysis.improvements) && analysis.improvements.length > 0) {
        console.log(`\n🔧 IMPROVEMENTS SUGGESTED (DETAILED):`);
        analysis.improvements.forEach((improvement, iIdx) => {
          console.log(`\n   ${iIdx + 1}. ${improvement}`);
          
          const isSpecific = checkIfSpecific(improvement, [{ question: analysis.question, answer: analysis.answer }]);
          console.log(`      ${isSpecific ? '✅' : '❌'} Specificity: ${isSpecific ? 'Addresses specific gap in this answer' : 'Generic advice'}`);
          
          // Analyze improvement detail
          const improvementDetail = analyzeImprovementDetail(improvement, analysis.answer);
          console.log(`      📋 Focus: ${improvementDetail.focus}`);
          console.log(`      🎯 Actionability: ${improvementDetail.isActionable ? 'High - clear action items' : 'Low - vague suggestions'}`);
          
          if (improvementDetail.missingConcepts.length > 0) {
            console.log(`      ⚠️  Missing Concepts: ${improvementDetail.missingConcepts.join(', ')}`);
          }
          
          if (improvementDetail.suggestedDepth) {
            console.log(`      📚 Suggested Depth: ${improvementDetail.suggestedDepth}`);
          }
        });
        
        // Summary for this question
        console.log(`\n   📊 Question ${qNum} Improvement Summary:`);
        const specificCount = analysis.improvements.filter(imp => 
          checkIfSpecific(imp, [{ question: analysis.question, answer: analysis.answer }])
        ).length;
        console.log(`      Total: ${analysis.improvements.length}`);
        console.log(`      Specific: ${specificCount}`);
        console.log(`      Generic: ${analysis.improvements.length - specificCount}`);
      } else {
        console.log(`\n🔧 Improvements: None suggested (answer is comprehensive)`);
      }
      
      if (analysis.responseType) {
        console.log(`\n📋 Response Type: ${analysis.responseType}`);
      }
      
      if (analysis.confidence !== undefined) {
        console.log(`📊 Confidence: ${(analysis.confidence * 100).toFixed(0)}%`);
      }
    });
    
    // Summary of per-question analysis
    console.log('\n\n📈 PER-QUESTION SUMMARY:');
    console.log('-'.repeat(60));
    const avgScore = data.questionAnalysis.reduce((sum, q) => sum + (q.score || 0), 0) / data.questionAnalysis.length;
    const specificCount = data.questionAnalysis.filter(q => {
      const feedbackSpecific = q.feedback ? checkIfSpecific(q.feedback, [{ question: q.question, answer: q.answer }]) : false;
      return feedbackSpecific;
    }).length;
    
    console.log(`   Total Questions Analyzed: ${data.questionAnalysis.length}`);
    console.log(`   Average Score: ${avgScore.toFixed(2)}/10`);
    console.log(`   Questions with Specific Feedback: ${specificCount}/${data.questionAnalysis.length}`);
    console.log(`   High Scores (8+): ${data.questionAnalysis.filter(q => q.score >= 8).length}`);
    console.log(`   Low Scores (<7): ${data.questionAnalysis.filter(q => q.score < 7).length}`);
  }
  
  // Overall validation summary
  console.log('\n\n🎯 VALIDATION SUMMARY');
  console.log('='.repeat(60));
  
  const validations = {
    hasFeedback: !!data.feedback,
    hasQuestionAnalysis: !!data.questionAnalysis && data.questionAnalysis.length > 0,
    hasSpecificReferences: checkOverallSpecificity(data),
    scoresProvided: !!(data.score || data.technicalScore),
    reasonableScores: validateScoreReasonableness(data)
  };
  
  console.log('\nValidation Checklist:');
  Object.entries(validations).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase());
    console.log(`   ${value ? '✅' : '❌'} ${label}`);
  });
  
  const allPassed = Object.values(validations).every(v => v);
  const passedCount = Object.values(validations).filter(v => v).length;
  const totalCount = Object.keys(validations).length;
  
  console.log(`\n📊 Validation Score: ${passedCount}/${totalCount} passed`);
  console.log(`\n${allPassed ? '✅ ALL VALIDATIONS PASSED' : '⚠️  SOME VALIDATIONS FAILED'}`);
  
  // Print detailed validation report
  if (!allPassed) {
    console.log('\n⚠️  Recommendations:');
    if (!validations.hasFeedback) {
      console.log('   ❌ - No feedback generated. Check API endpoint.');
    }
    if (!validations.hasQuestionAnalysis) {
      console.log('   ❌ - No per-question analysis. Ensure qaPairs are being processed.');
    }
    if (!validations.hasSpecificReferences) {
      console.log('   ❌ - Feedback lacks specificity. Ensure prompts reference actual Q&A.');
    }
    if (!validations.scoresProvided) {
      console.log('   ❌ - No scores provided. Check scoring logic.');
    }
    if (!validations.reasonableScores) {
      console.log('   ❌ - Scores too low for accurate answers. Review scoring algorithm.');
      console.log(`      Current overall: ${data.score || 'N/A'}/10, Technical: ${data.technicalScore || 'N/A'}/100`);
      console.log(`      Expected: Overall ≥7/10, Technical ≥70/100`);
    }
  } else {
    console.log('\n🎉 All validations passed! The analysis system is working correctly.');
  }
  
  console.log('\n' + '='.repeat(60));
  
  return allPassed;
}

/**
 * Check if text references specific Q&A content
 */
function checkIfSpecific(text, qaPairs) {
  if (!text || !qaPairs || qaPairs.length === 0) return false;
  
  const lowerText = text.toLowerCase();
  
  // Check for question number references
  const hasQuestionRef = /question\s*\d+|q\d+|in\s+question|q(\d+)|question\s+(\d+)/i.test(text);
  
  // Check for specific technical terms from answers
  const technicalTerms = [];
  qaPairs.forEach(qa => {
    const answer = qa.answer.toLowerCase();
    // Extract key technical terms (words longer than 5 chars that appear multiple times)
    const words = answer.match(/\b\w{6,}\b/g) || [];
    technicalTerms.push(...words.filter((word, idx, arr) => arr.indexOf(word) !== idx));
  });
  
  const hasTechnicalRef = technicalTerms.some(term => lowerText.includes(term));
  
  // Check for references to specific content from answers
  const hasContentRef = qaPairs.some(qa => {
    const keyPhrases = qa.answer.split('.').slice(0, 3).map(p => p.trim().substring(0, 30));
    return keyPhrases.some(phrase => phrase.length > 10 && lowerText.includes(phrase.toLowerCase()));
  });
  
  // Should have at least one type of specific reference
  return hasQuestionRef || hasTechnicalRef || hasContentRef;
}

/**
 * Check overall specificity of feedback
 */
function checkOverallSpecificity(data) {
  if (!data.feedback) return false;
  
  const feedback = typeof data.feedback === 'string' 
    ? { summary: data.feedback }
    : data.feedback;
  
  const summarySpecific = checkIfSpecific(feedback.summary || '', mockInterviewQAPairs);
  const strengthsSpecific = feedback.strengths 
    ? feedback.strengths.some(s => checkIfSpecific(s, mockInterviewQAPairs))
    : false;
  const improvementsSpecific = feedback.improvements
    ? feedback.improvements.some(i => checkIfSpecific(i, mockInterviewQAPairs))
    : false;
  
  return summarySpecific || strengthsSpecific || improvementsSpecific;
}

/**
 * Validate that scores are reasonable for accurate answers
 */
function validateScoreReasonableness(data) {
  const overallScore = data.score || 0;
  const technicalScore = data.technicalScore || 0;
  
  // For accurate answers, we expect:
  // - Overall score >= 7/10
  // - Technical score >= 70/100
  const overallReasonable = overallScore >= 7;
  const technicalReasonable = technicalScore >= 70;
  
  return overallReasonable && technicalReasonable;
}

// Run the test
if (require.main === module) {
  testInterviewAnalysis()
    .then(() => {
      console.log('\n✅ Test completed successfully\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

/**
 * Analyze the type of improvement being suggested
 */
function analyzeImprovementType(improvement) {
  const lower = improvement.toLowerCase();
  
  if (lower.includes('example') || lower.includes('instance') || lower.includes('demonstrate')) {
    return { type: 'Needs Examples', details: 'Suggests candidate should provide concrete examples' };
  }
  if (lower.includes('depth') || lower.includes('detail') || lower.includes('elaborate')) {
    return { type: 'Needs Depth', details: 'Suggests answer needs more thorough explanation' };
  }
  if (lower.includes('trade-off') || lower.includes('pitfall') || lower.includes('edge case') || lower.includes('limitation')) {
    return { type: 'Needs Critical Thinking', details: 'Suggests discussing trade-offs, edge cases, or limitations' };
  }
  if (lower.includes('code') || lower.includes('implementation') || lower.includes('snippet')) {
    return { type: 'Needs Code', details: 'Suggests providing code examples or implementation details' };
  }
  if (lower.includes('structure') || lower.includes('organize') || lower.includes('format')) {
    return { type: 'Needs Structure', details: 'Suggests better organization or structure' };
  }
  if (lower.includes('accuracy') || lower.includes('correct') || lower.includes('wrong') || lower.includes('incorrect')) {
    return { type: 'Accuracy Issue', details: 'Identifies incorrect information or misunderstandings' };
  }
  
  return { type: 'General Improvement', details: 'General suggestion for enhancement' };
}

/**
 * Extract question number reference from text
 */
function extractQuestionReference(text) {
  const match = text.match(/(?:question|q)\s*(\d+)/i);
  return match ? match[1] : null;
}

/**
 * Extract technical concepts mentioned in improvement
 */
function extractTechnicalConcepts(text) {
  const technicalTerms = [
    'closure', 'async', 'await', 'promise', 'event loop', 'hoisting', 'scope',
    'prototype', 'inheritance', 'this', 'binding', 'let', 'const', 'var',
    'callbacks', 'callback', 'react', 'component', 'hook', 'state', 'props',
    'javascript', 'js', 'dom', 'api', 'fetch', 'json', 'function', 'arrow function'
  ];
  
  const found = technicalTerms.filter(term => text.toLowerCase().includes(term.toLowerCase()));
  return found;
}

/**
 * Analyze feedback quality
 */
function analyzeFeedbackQuality(feedback, question, answer) {
  const lowerFeedback = feedback.toLowerCase();
  const lowerQuestion = question.toLowerCase();
  const lowerAnswer = answer.toLowerCase();
  
  // Extract key topic from question
  const questionWords = lowerQuestion.split(/\s+/).filter(w => w.length > 5);
  const mentionsTopic = questionWords.some(word => lowerFeedback.includes(word));
  
  // Check if feedback references answer content
  const answerPhrases = answer.split(/[.!?]/).slice(0, 3).map(p => p.trim().substring(0, 30).toLowerCase());
  const referencesAnswer = answerPhrases.some(phrase => 
    phrase.length > 10 && lowerFeedback.includes(phrase)
  );
  
  // Check if actionable
  const actionableWords = ['should', 'consider', 'try', 'improve', 'add', 'provide', 'explain', 'demonstrate'];
  const isActionable = actionableWords.some(word => lowerFeedback.includes(word));
  
  // Extract suggestions
  const suggestions = [];
  if (lowerFeedback.includes('example')) suggestions.push('Provide examples');
  if (lowerFeedback.includes('detail') || lowerFeedback.includes('elaborate')) suggestions.push('Add more detail');
  if (lowerFeedback.includes('code')) suggestions.push('Include code');
  if (lowerFeedback.includes('trade-off')) suggestions.push('Discuss trade-offs');
  
  return {
    mentionsTopic,
    referencesAnswer,
    isActionable,
    suggestions
  };
}

/**
 * Analyze improvement detail
 */
function analyzeImprovementDetail(improvement, answer) {
  const lower = improvement.toLowerCase();
  const lowerAnswer = answer.toLowerCase();
  
  // Determine focus
  let focus = 'General';
  if (lower.includes('example')) focus = 'Examples';
  else if (lower.includes('depth') || lower.includes('detail')) focus = 'Depth';
  else if (lower.includes('code') || lower.includes('implementation')) focus = 'Code/Implementation';
  else if (lower.includes('explanation') || lower.includes('clarify')) focus = 'Clarity';
  else if (lower.includes('trade-off') || lower.includes('edge case')) focus = 'Critical Thinking';
  
  // Check if actionable
  const actionableIndicators = ['should', 'try', 'consider', 'add', 'provide', 'include', 'explain'];
  const isActionable = actionableIndicators.some(indicator => lower.includes(indicator));
  
  // Find missing concepts that could improve the answer
  const missingConcepts = [];
  if (lower.includes('missing') || lower.includes('lack')) {
    if (lower.includes('example')) missingConcepts.push('Examples');
    if (lower.includes('code')) missingConcepts.push('Code snippets');
    if (lower.includes('trade-off')) missingConcepts.push('Trade-offs');
    if (lower.includes('edge case')) missingConcepts.push('Edge cases');
  }
  
  // Suggested depth level
  let suggestedDepth = null;
  if (lower.includes('more detail') || lower.includes('elaborate') || lower.includes('deeper')) {
    suggestedDepth = 'More depth needed';
  } else if (lower.includes('concise') || lower.includes('brief')) {
    suggestedDepth = 'More concise needed';
  }
  
  return {
    focus,
    isActionable,
    missingConcepts,
    suggestedDepth
  };
}

module.exports = { testInterviewAnalysis, mockInterviewQAPairs };

