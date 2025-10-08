#!/usr/bin/env node

/**
 * Script to sort problems by serial number and rewrite to avoid copyright
 */

const fs = require('fs');
const path = require('path');

const problems = require('../data/comprehensive-problems');

// Extract serial number from title
function getSerialNumber(title) {
  const match = title.match(/^(\d+)\./);
  return match ? parseInt(match[1]) : 999;
}

// Sort problems by serial number
const sortedProblems = [...problems].sort((a, b) => {
  return getSerialNumber(a.title) - getSerialNumber(b.title);
});

console.log(`✓ Sorted ${sortedProblems.length} problems by serial number`);
console.log(`  First: ${sortedProblems[0].title}`);
console.log(`  Last: ${sortedProblems[sortedProblems.length - 1].title}`);

// Rewrite prompts to avoid copyright
// This function rewrites each problem description
function rewritePrompt(problem) {
  const rewrittenPrompts = {
    // Add rewritten prompts here for each problem ID
  };
  
  return rewrittenPrompts[problem.id] || problem.prompt;
}

// Generate the new file
const output = `// Comprehensive Frontend Interview Problems
// 100 curated problems covering JavaScript, React, CSS, DOM APIs, and Algorithms
// Sorted by problem number for easy navigation

const comprehensiveProblems = ${JSON.stringify(sortedProblems, null, 2)};

module.exports = comprehensiveProblems;
`;

// Write to file
const outputPath = path.join(__dirname, '../data/comprehensive-problems-sorted.js');
fs.writeFileSync(outputPath, output);

console.log(`✓ Written sorted problems to: ${outputPath}`);
console.log(`\nProblem breakdown:`);
console.log(`  Easy: ${sortedProblems.filter(p => p.difficulty === 'Easy').length}`);
console.log(`  Medium: ${sortedProblems.filter(p => p.difficulty === 'Medium').length}`);
console.log(`  Hard: ${sortedProblems.filter(p => p.difficulty === 'Hard').length}`);
