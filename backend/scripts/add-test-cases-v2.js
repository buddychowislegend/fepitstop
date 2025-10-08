const fs = require('fs');
const path = require('path');

// Import the problems directly
const comprehensiveProblems = require('../data/comprehensive-problems');

console.log(`📊 Found ${comprehensiveProblems.length} problems to update`);

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

  // Histogram problems
  'histogram': () => [
    { input: "[2, 4, 5, 2, 3, 4]", expected: "histogram object", explanation: "Should create histogram with correct counts" },
    { input: "[1, 1, 1, 1]", expected: "histogram object", explanation: "All same values" },
    { input: "[]", expected: "empty histogram", explanation: "Empty input array" }
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

  // Virtual scroll problems
  'virtualize': () => [
    { input: "1000 items, 10 visible", expected: "virtual list", explanation: "Should handle large datasets efficiently" },
    { input: "100 items, 20 visible", expected: "virtual list", explanation: "Should handle medium datasets" },
    { input: "10 items, 50 visible", expected: "virtual list", explanation: "Should handle small datasets" }
  ],

  // Autocomplete problems
  'autocomplete': () => [
    { input: "'react' with ['react', 'javascript', 'node']", expected: "['react']", explanation: "Should filter matching items" },
    { input: "'js' with ['javascript', 'json', 'react']", expected: "['javascript', 'json']", explanation: "Should find partial matches" },
    { input: "'xyz' with ['react', 'javascript']", expected: "[]", explanation: "Should return empty for no matches" }
  ],

  // Grid layout problems
  'grid-layout': () => [
    { input: "3 columns, 6 items", expected: "2x3 grid", explanation: "Should arrange items in grid" },
    { input: "2 columns, 5 items", expected: "3x2 grid with gap", explanation: "Should handle uneven distribution" },
    { input: "4 columns, 1 item", expected: "1x4 grid", explanation: "Should handle single item" }
  ],

  // Riddle problems
  'riddle-bridge-crossing': () => [
    { input: "4 people, bridge capacity 2", expected: "minimum time", explanation: "Should find optimal crossing strategy" },
    { input: "3 people, bridge capacity 2", expected: "minimum time", explanation: "Should handle fewer people" },
    { input: "2 people, bridge capacity 1", expected: "minimum time", explanation: "Should handle single person crossing" }
  ],

  'riddle-wolf-goat-cabbage': () => [
    { input: "farmer with wolf, goat, cabbage", expected: "crossing sequence", explanation: "Should prevent wolf eating goat" },
    { input: "empty boat crossing", expected: "return trip", explanation: "Should handle return crossings" },
    { input: "final state", expected: "all items on other side", explanation: "Should successfully transport all items" }
  ],

  // Default test cases for unknown problems
  default: (problem) => {
    // Try to infer test cases from the problem content
    const title = problem.title.toLowerCase();
    const prompt = problem.prompt.toLowerCase();
    
    if (title.includes('flatten') || prompt.includes('flatten')) {
      return [
        { input: "[1, [2, [3]]]", expected: "[1,2,3]", explanation: "Should flatten nested arrays" },
        { input: "[[1, 2], [3, 4]]", expected: "[1,2,3,4]", explanation: "Should flatten array of arrays" },
        { input: "[1, 2, 3]", expected: "[1,2,3]", explanation: "Should handle already flat array" }
      ];
    }
    
    if (title.includes('counter') || prompt.includes('counter')) {
      return [
        { input: "createCounter()", expected: "function", explanation: "Should return a counter function" },
        { input: "counter()", expected: "1", explanation: "First call should return 1" },
        { input: "counter()", expected: "2", explanation: "Second call should return 2" }
      ];
    }
    
    if (title.includes('memoize') || prompt.includes('memoize')) {
      return [
        { input: "memoize(fn)", expected: "function", explanation: "Should return memoized function" },
        { input: "memoizedFn(5)", expected: "computed result", explanation: "Should compute result first time" },
        { input: "memoizedFn(5)", expected: "cached result", explanation: "Should return cached result" }
      ];
    }
    
    if (title.includes('debounce') || prompt.includes('debounce')) {
      return [
        { input: "debounce(fn, 100)", expected: "function", explanation: "Should return debounced function" },
        { input: "rapid calls", expected: "delayed execution", explanation: "Should delay execution" },
        { input: "single call", expected: "executed once", explanation: "Should execute after delay" }
      ];
    }
    
    if (title.includes('throttle') || prompt.includes('throttle')) {
      return [
        { input: "throttle(fn, 100)", expected: "function", explanation: "Should return throttled function" },
        { input: "rapid calls", expected: "limited execution", explanation: "Should limit execution rate" },
        { input: "within limit", expected: "executed immediately", explanation: "Should execute if within limit" }
      ];
    }
    
    if (title.includes('react') || prompt.includes('react')) {
      return [
        { input: "component props", expected: "rendered component", explanation: "Should render React component" },
        { input: "state change", expected: "updated component", explanation: "Should handle state updates" },
        { input: "event handling", expected: "event response", explanation: "Should handle user interactions" }
      ];
    }
    
    if (title.includes('css') || prompt.includes('css')) {
      return [
        { input: "basic styles", expected: "styled element", explanation: "Should apply CSS styles" },
        { input: "responsive design", expected: "adaptive layout", explanation: "Should handle different screen sizes" },
        { input: "animations", expected: "animated element", explanation: "Should create smooth animations" }
      ];
    }
    
    // Generic test cases
    return [
      { input: "standard input", expected: "expected output", explanation: "Should handle typical scenario" },
      { input: "edge case", expected: "handles gracefully", explanation: "Should manage boundary conditions" },
      { input: "complex case", expected: "correct result", explanation: "Should handle complex scenarios" }
    ];
  }
};

// Function to generate test cases based on problem ID and content
function generateTestCases(problem) {
  const generator = testCaseGenerators[problem.id] || testCaseGenerators.default;
  return generator(problem);
}

// Update problems with test cases
let updatedCount = 0;
const updatedProblems = comprehensiveProblems.map(problem => {
  // Skip if already has good test cases
  if (problem.testCases && problem.testCases.length >= 3 && 
      problem.testCases[0].input !== "Basic case" && 
      problem.testCases[0].input !== "standard input" &&
      problem.testCases[0].input !== "Standard input") {
    return problem;
  }

  const newTestCases = generateTestCases(problem);
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

console.log(`✅ Updated ${updatedCount} problems with test cases`);
console.log(`📊 Total problems: ${updatedProblems.length}`);
console.log(`📝 Problems with 3+ test cases: ${updatedProblems.filter(p => p.testCases && p.testCases.length >= 3).length}`);

// Show some examples
console.log('\n📝 Example updated problems:');
updatedProblems.slice(0, 5).forEach(problem => {
  console.log(`\n${problem.title}:`);
  problem.testCases.forEach((testCase, i) => {
    console.log(`  ${i + 1}. Input: ${testCase.input}`);
    console.log(`     Expected: ${testCase.expected}`);
  });
});
