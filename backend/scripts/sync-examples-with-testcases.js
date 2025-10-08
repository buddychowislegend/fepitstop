const fs = require('fs');
const path = require('path');

// Import the problems
const comprehensiveProblems = require('../data/comprehensive-problems');

console.log(`📊 Found ${comprehensiveProblems.length} problems to update`);

let updatedCount = 0;
let skippedCount = 0;

// Update examples to match test cases
const updatedProblems = comprehensiveProblems.map(problem => {
  // Check if problem has test cases
  if (!problem.testCases || problem.testCases.length === 0) {
    console.log(`⚠️  Skipping "${problem.title}" - no test cases`);
    skippedCount++;
    return problem;
  }

  // Use first 2-3 test cases as examples (or all if less than 3)
  const numExamples = Math.min(3, problem.testCases.length);
  const newExamples = problem.testCases.slice(0, numExamples).map(testCase => ({
    input: testCase.input,
    output: testCase.expected,
    explanation: testCase.explanation || "Demonstrates the expected behavior"
  }));

  console.log(`✅ Updated "${problem.title}" - ${newExamples.length} examples from test cases`);
  updatedCount++;

  return {
    ...problem,
    examples: newExamples
  };
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updatedCount} problems`);
console.log(`   ⚠️  Skipped: ${skippedCount} problems`);

// Generate new file content
const newContent = `// Comprehensive Frontend Interview Problems
// 100 original problems covering JavaScript, React, CSS, DOM APIs, and Algorithms
// All titles rephrased to be original and avoid copyright
// Problems randomly shuffled for uniqueness
// Examples synced with test cases for consistency

const comprehensiveProblems = ${JSON.stringify(updatedProblems, null, 2)};

module.exports = comprehensiveProblems;
`;

// Write the updated file
const outputPath = path.join(__dirname, '../data/comprehensive-problems.js');
fs.writeFileSync(outputPath, newContent, 'utf8');

console.log(`\n📝 Updated file: ${outputPath}`);
console.log(`📊 Total problems: ${updatedProblems.length}`);

// Show some examples
console.log('\n📋 Sample updated problem:');
const sampleProblem = updatedProblems.find(p => p.examples && p.examples.length > 0);
if (sampleProblem) {
  console.log(`\nProblem: ${sampleProblem.title}`);
  console.log(`Examples (${sampleProblem.examples.length}):`);
  sampleProblem.examples.forEach((example, index) => {
    console.log(`  ${index + 1}. Input: ${example.input}`);
    console.log(`     Output: ${example.output}`);
    console.log(`     Explanation: ${example.explanation}`);
  });
}

console.log('\n✅ Done! All examples synced with test cases.');
