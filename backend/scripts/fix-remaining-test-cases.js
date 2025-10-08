const fs = require('fs');
const path = require('path');

// Import the problems directly
const comprehensiveProblems = require('../data/comprehensive-problems');

console.log(`📊 Found ${comprehensiveProblems.length} problems to check`);

// Enhanced test case generators for specific problem types
const enhancedTestCaseGenerators = {
  // Deep Clone problems
  'deep-clone': () => [
    { input: "{ a: 1, b: { c: 2 } }", expected: "{ a: 1, b: { c: 2 } }", explanation: "Should clone nested objects" },
    { input: "[1, [2, [3]]]", expected: "[1, [2, [3]]]", explanation: "Should clone nested arrays" },
    { input: "null", expected: "null", explanation: "Should handle null values" }
  ],

  // Event Emitter problems
  'event-emitter': () => [
    { input: "emitter.on('test', callback)", expected: "undefined", explanation: "Should register event listener" },
    { input: "emitter.emit('test', 'data')", expected: "undefined", explanation: "Should trigger event with data" },
    { input: "emitter.off('test', callback)", expected: "undefined", explanation: "Should remove event listener" }
  ],

  // Promise problems
  'build-promise': () => [
    { input: "new Promise((resolve) => resolve(42))", expected: "Promise", explanation: "Should create a promise" },
    { input: "Promise.resolve(42)", expected: "Promise", explanation: "Should create resolved promise" },
    { input: "Promise.reject('error')", expected: "Promise", explanation: "Should create rejected promise" }
  ],

  // DOM problems
  'create-dom': () => [
    { input: "createElement('div')", expected: "HTMLDivElement", explanation: "Should create div element" },
    { input: "createElement('span')", expected: "HTMLSpanElement", explanation: "Should create span element" },
    { input: "createElement('input')", expected: "HTMLInputElement", explanation: "Should create input element" }
  ],

  // Array methods
  'array-methods': () => [
    { input: "[1, 2, 3].map(x => x * 2)", expected: "[2, 4, 6]", explanation: "Should map array elements" },
    { input: "[1, 2, 3].filter(x => x > 1)", expected: "[2, 3]", explanation: "Should filter array elements" },
    { input: "[1, 2, 3].reduce((a, b) => a + b)", expected: "6", explanation: "Should reduce array to single value" }
  ],

  // Curry function
  'curry-function': () => [
    { input: "curry((a, b, c) => a + b + c)(1)(2)(3)", expected: "6", explanation: "Should curry function with 3 args" },
    { input: "curry((a, b) => a * b)(2)(3)", expected: "6", explanation: "Should curry function with 2 args" },
    { input: "curry((a) => a * 2)(5)", expected: "10", explanation: "Should curry single argument function" }
  ],

  // Compose function
  'compose-function': () => [
    { input: "compose(f, g)(x)", expected: "f(g(x))", explanation: "Should compose two functions" },
    { input: "compose(f, g, h)(x)", expected: "f(g(h(x)))", explanation: "Should compose three functions" },
    { input: "compose(x => x * 2, x => x + 1)(5)", expected: "12", explanation: "Should compose math functions" }
  ],

  // JSON.stringify
  'json-stringify': () => [
    { input: "{ a: 1, b: 'test' }", expected: '{"a":1,"b":"test"}', explanation: "Should stringify simple object" },
    { input: "[1, 2, 3]", expected: "[1,2,3]", explanation: "Should stringify array" },
    { input: "null", expected: "null", explanation: "Should stringify null" }
  ],

  // Rate Limiter
  'rate-limiter': () => [
    { input: "rateLimiter(3, 1000)", expected: "function", explanation: "Should create rate limiter" },
    { input: "limiter(() => {})", expected: "undefined", explanation: "Should allow first request" },
    { input: "limiter(() => {})", expected: "undefined", explanation: "Should allow within limit" }
  ],

  // Feature Flag
  'feature-flag': () => [
    { input: "featureFlag('new-feature')", expected: "boolean", explanation: "Should return boolean value" },
    { input: "featureFlag('enabled-feature')", expected: "true", explanation: "Should return true for enabled feature" },
    { input: "featureFlag('disabled-feature')", expected: "false", explanation: "Should return false for disabled feature" }
  ],

  // Roman Numeral
  'roman-numeral-to-int': () => [
    { input: "'I'", expected: "1", explanation: "Should convert I to 1" },
    { input: "'IV'", expected: "4", explanation: "Should convert IV to 4" },
    { input: "'IX'", expected: "9", explanation: "Should convert IX to 9" }
  ],

  // Math.sqrt
  'math-sqrt': () => [
    { input: "16", expected: "4", explanation: "Should calculate square root of 16" },
    { input: "25", expected: "5", explanation: "Should calculate square root of 25" },
    { input: "0", expected: "0", explanation: "Should handle zero" }
  ],

  // Top K Words
  'top-k-words': () => [
    { input: "['a', 'b', 'a', 'c'], 2", expected: "['a', 'b']", explanation: "Should return top 2 most frequent words" },
    { input: "['a', 'a', 'a'], 1", expected: "['a']", explanation: "Should return single most frequent word" },
    { input: "['a', 'b', 'c'], 3", expected: "['a', 'b', 'c']", explanation: "Should return all words when k equals length" }
  ],

  // String Repeater
  'string-repeater': () => [
    { input: "'hello', 3", expected: "'hellohellohello'", explanation: "Should repeat string 3 times" },
    { input: "'a', 5", expected: "'aaaaa'", explanation: "Should repeat single character" },
    { input: "'', 3", expected: "''", explanation: "Should handle empty string" }
  ],

  // Default enhanced generator
  default: (problem) => {
    const title = problem.title.toLowerCase();
    const prompt = problem.prompt.toLowerCase();
    
    // Try to create more specific test cases based on problem content
    if (title.includes('deep clone') || prompt.includes('deep clone')) {
      return [
        { input: "{ a: 1, b: { c: 2 } }", expected: "{ a: 1, b: { c: 2 } }", explanation: "Should clone nested objects" },
        { input: "[1, [2, [3]]]", expected: "[1, [2, [3]]]", explanation: "Should clone nested arrays" },
        { input: "null", expected: "null", explanation: "Should handle null values" }
      ];
    }
    
    if (title.includes('event') || prompt.includes('event')) {
      return [
        { input: "emitter.on('test', callback)", expected: "undefined", explanation: "Should register event listener" },
        { input: "emitter.emit('test', 'data')", expected: "undefined", explanation: "Should trigger event with data" },
        { input: "emitter.off('test', callback)", expected: "undefined", explanation: "Should remove event listener" }
      ];
    }
    
    if (title.includes('promise') || prompt.includes('promise')) {
      return [
        { input: "new Promise((resolve) => resolve(42))", expected: "Promise", explanation: "Should create a promise" },
        { input: "Promise.resolve(42)", expected: "Promise", explanation: "Should create resolved promise" },
        { input: "Promise.reject('error')", expected: "Promise", explanation: "Should create rejected promise" }
      ];
    }
    
    if (title.includes('dom') || prompt.includes('dom')) {
      return [
        { input: "createElement('div')", expected: "HTMLDivElement", explanation: "Should create DOM element" },
        { input: "querySelector('.test')", expected: "Element or null", explanation: "Should find DOM element" },
        { input: "addEventListener('click', handler)", expected: "undefined", explanation: "Should add event listener" }
      ];
    }
    
    if (title.includes('array') || prompt.includes('array')) {
      return [
        { input: "[1, 2, 3].map(x => x * 2)", expected: "[2, 4, 6]", explanation: "Should transform array elements" },
        { input: "[1, 2, 3].filter(x => x > 1)", expected: "[2, 3]", explanation: "Should filter array elements" },
        { input: "[1, 2, 3].reduce((a, b) => a + b)", expected: "6", explanation: "Should reduce array to single value" }
      ];
    }
    
    if (title.includes('function') || prompt.includes('function')) {
      return [
        { input: "fn(1, 2, 3)", expected: "computed result", explanation: "Should call function with arguments" },
        { input: "fn()", expected: "default result", explanation: "Should handle function with no arguments" },
        { input: "fn.call(this, arg)", expected: "bound result", explanation: "Should handle function binding" }
      ];
    }
    
    if (title.includes('string') || prompt.includes('string')) {
      return [
        { input: "'hello world'", expected: "processed string", explanation: "Should process string input" },
        { input: "''", expected: "empty result", explanation: "Should handle empty string" },
        { input: "'test123'", expected: "filtered result", explanation: "Should handle string with numbers" }
      ];
    }
    
    if (title.includes('number') || prompt.includes('number')) {
      return [
        { input: "42", expected: "computed number", explanation: "Should process positive number" },
        { input: "-42", expected: "computed number", explanation: "Should process negative number" },
        { input: "0", expected: "zero result", explanation: "Should handle zero" }
      ];
    }
    
    if (title.includes('object') || prompt.includes('object')) {
      return [
        { input: "{ a: 1, b: 2 }", expected: "processed object", explanation: "Should process object properties" },
        { input: "{}", expected: "empty object", explanation: "Should handle empty object" },
        { input: "{ nested: { value: 1 } }", expected: "nested result", explanation: "Should handle nested objects" }
      ];
    }
    
    // Generic but more specific test cases
    return [
      { input: "basic input", expected: "expected result", explanation: "Should handle basic scenario" },
      { input: "edge case input", expected: "edge case result", explanation: "Should handle edge cases" },
      { input: "complex input", expected: "complex result", explanation: "Should handle complex scenarios" }
    ];
  }
};

// Function to generate enhanced test cases
function generateEnhancedTestCases(problem) {
  const generator = enhancedTestCaseGenerators[problem.id] || enhancedTestCaseGenerators.default;
  return generator(problem);
}

// Find problems that still have generic test cases
const problemsToFix = comprehensiveProblems.filter(problem => 
  problem.testCases && 
  problem.testCases.length >= 3 && 
  problem.testCases[0].input === "standard input"
);

console.log(`🔍 Found ${problemsToFix.length} problems with generic test cases`);

// Update problems with enhanced test cases
let updatedCount = 0;
const updatedProblems = comprehensiveProblems.map(problem => {
  // Skip if already has good test cases
  if (problem.testCases && 
      problem.testCases.length >= 3 && 
      problem.testCases[0].input !== "standard input" &&
      problem.testCases[0].input !== "basic input") {
    return problem;
  }

  const newTestCases = generateEnhancedTestCases(problem);
  updatedCount++;
  
  return {
    ...problem,
    testCases: newTestCases
  };
});

// Generate new file content
const newContent = `// Comprehensive Frontend Interview Problems
// 100 original problems covering JavaScript, React, CSS, DOM APIs, and Algorithms
// All content rewritten to avoid copyright while maintaining technical challenges
// Sorted numerically (1-100) for easy navigation

const comprehensiveProblems = ${JSON.stringify(updatedProblems, null, 2)};

module.exports = comprehensiveProblems;
`;

// Write the updated file
fs.writeFileSync(path.join(__dirname, '../data/comprehensive-problems.js'), newContent, 'utf8');

console.log(`✅ Updated ${updatedCount} problems with enhanced test cases`);
console.log(`📊 Total problems: ${updatedProblems.length}`);

// Show examples of updated problems
console.log('\n📝 Example updated problems:');
const newlyUpdated = updatedProblems.filter(p => 
  p.testCases && p.testCases.length >= 3 && 
  p.testCases[0].input !== "standard input" &&
  p.testCases[0].input !== "basic input"
).slice(0, 5);

newlyUpdated.forEach(problem => {
  console.log(`\n${problem.title}:`);
  problem.testCases.forEach((testCase, i) => {
    console.log(`  ${i + 1}. Input: ${testCase.input}`);
    console.log(`     Expected: ${testCase.expected}`);
  });
});

// Count remaining generic test cases
const remainingGeneric = updatedProblems.filter(p => 
  p.testCases && p.testCases[0].input === "basic input"
).length;

console.log(`\n📊 Remaining problems with generic test cases: ${remainingGeneric}`);
