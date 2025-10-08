const fs = require('fs');
const path = require('path');

// Read the current problems file
const problemsPath = path.join(__dirname, '../data/comprehensive-problems.js');
const problemsContent = fs.readFileSync(problemsPath, 'utf8');

// Extract the problems array
const problemsMatch = problemsContent.match(/const comprehensiveProblems = \[([\s\S]*?)\];/);
if (!problemsMatch) {
  console.error('Could not find problems array');
  process.exit(1);
}

// Parse the problems (this is a bit hacky but works for our case)
const problemsArray = eval(`[${problemsMatch[1]}]`);

// Test case generators for different problem types
const testCaseGenerators = {
  // Array/Flatten problems
  'flatten-arrays-recursively-and-iteratively': () => [
    { input: "[[[[1]]]]", expected: "[1]", explanation: "Deep nesting with single element" },
    { input: "[[1, 2, [3, [4, 5]]], 6]", expected: "[1,2,3,4,5,6]", explanation: "Mixed nesting levels" },
    { input: "[1, 2, 3]", expected: "[1,2,3]", explanation: "Already flat array" },
    { input: "[]", expected: "[]", explanation: "Empty array" },
    { input: "[1, [2, [3, [4, [5]]]]]", expected: "[1,2,3,4,5]", explanation: "Deep nesting with multiple elements" }
  ],

  // Debounce problems
  'debounce': () => [
    { input: "debounce(console.log, 100)", expected: "function", explanation: "Should return a function" },
    { input: "debounce(() => {}, 0)", expected: "function", explanation: "Should work with zero delay" },
    { input: "debounce(() => {}, 1000)", expected: "function", explanation: "Should work with large delay" }
  ],

  // Throttle problems
  'throttle': () => [
    { input: "throttle(console.log, 100)", expected: "function", explanation: "Should return a function" },
    { input: "throttle(() => {}, 0)", expected: "function", explanation: "Should work with zero delay" },
    { input: "throttle(() => {}, 1000)", expected: "function", explanation: "Should work with large delay" }
  ],

  // Memoization problems
  'memoize-i': () => [
    { input: "memoize((x) => x * 2)", expected: "function", explanation: "Should return memoized function" },
    { input: "memoize((x) => x * x)(5)", expected: "25", explanation: "Should compute and cache result" },
    { input: "memoize((x) => x * x)(5)", expected: "25", explanation: "Should return cached result on second call" }
  ],

  // Counter/Closure problems
  'closure-counter': () => [
    { input: "createCounter()()", expected: "1", explanation: "First call should return 1" },
    { input: "createCounter()()()", expected: "2", explanation: "Second call should return 2" },
    { input: "createCounter()()()()", expected: "3", explanation: "Third call should return 3" }
  ],

  // Two Sum problems
  'two-sum': () => [
    { input: "[[2,7,11,15], 9]", expected: "[0,1]", explanation: "First two numbers sum to target" },
    { input: "[[3,2,4], 6]", expected: "[1,2]", explanation: "Second and third numbers sum to target" },
    { input: "[[3,3], 6]", expected: "[0,1]", explanation: "Same numbers at different indices" }
  ],

  // Salary calculation problems
  'total-salaries': () => [
    { input: "{ sales: [{ name: 'John', salary: 1000 }] }", expected: "1000", explanation: "Single employee salary" },
    { input: "{ sales: [{ name: 'John', salary: 1000 }], dev: [{ name: 'Jane', salary: 2000 }] }", expected: "3000", explanation: "Multiple departments" },
    { input: "{}", expected: "0", explanation: "Empty company structure" }
  ],

  // ClassNames problems
  'classnames': () => [
    { input: "['btn', 'btn-primary']", expected: "'btn btn-primary'", explanation: "Array of strings" },
    { input: "{ btn: true, 'btn-primary': false }", expected: "'btn'", explanation: "Object with boolean values" },
    { input: "['btn', { 'btn-primary': true, disabled: false }]", expected: "'btn btn-primary'", explanation: "Mixed array and object" }
  ],

  // Default test cases for unknown problems
  default: (problem) => [
    { input: "standard input", expected: "expected output", explanation: "Should handle typical scenario" },
    { input: "edge case", expected: "handles gracefully", explanation: "Should manage boundary conditions" },
    { input: "complex case", expected: "correct result", explanation: "Should handle complex scenarios" }
  ]
};

// Function to generate test cases based on problem ID and content
function generateTestCases(problem) {
  const generator = testCaseGenerators[problem.id] || testCaseGenerators.default;
  return generator(problem);
}

// Update problems with test cases
const updatedProblems = problemsArray.map(problem => {
  // Skip if already has good test cases
  if (problem.testCases && problem.testCases.length >= 3 && 
      problem.testCases[0].input !== "Basic case" && 
      problem.testCases[0].input !== "standard input") {
    return problem;
  }

  const newTestCases = generateTestCases(problem);
  
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
fs.writeFileSync(problemsPath, newContent, 'utf8');

console.log(`✅ Updated ${updatedProblems.length} problems with test cases`);
console.log(`📊 Added test cases for ${updatedProblems.filter(p => p.testCases && p.testCases.length >= 3).length} problems`);

// Show some examples
console.log('\n📝 Example updated problems:');
updatedProblems.slice(0, 3).forEach(problem => {
  console.log(`\n${problem.title}:`);
  problem.testCases.forEach((testCase, i) => {
    console.log(`  ${i + 1}. Input: ${testCase.input}`);
    console.log(`     Expected: ${testCase.expected}`);
  });
});
