const fs = require('fs');
const path = require('path');

// Read the source file
const filePath = path.join(__dirname, '../data/quizQuestions.js');
let content = fs.readFileSync(filePath, 'utf-8');

// Extract the questions array
const match = content.match(/const quizQuestions = \[([\s\S]*?)\];/);
if (!match) {
  console.error('❌ Could not find quizQuestions array');
  process.exit(1);
}

// Parse the array content
const arrayContent = '[' + match[1] + ']';
const quizQuestions = eval(arrayContent);

console.log(`📋 Processing ${quizQuestions.length} questions...\n`);

let fixedCount = 0;

// Fix each question
const fixedQuestions = quizQuestions.map(q => {
  if (q.options && q.options.length > 4) {
    const oldLength = q.options.length;
    q.options = q.options.slice(0, 4);
    
    // Adjust correct answer if needed
    if (q.correct >= q.options.length) {
      q.correct = 0;
    }
    
    fixedCount++;
    console.log(`✅ Fixed: ${q.id} (${oldLength} → 4 options)`);
    return q;
  }
  return q;
});

if (fixedCount > 0) {
  // Rebuild the file
  const newContent = `const quizQuestions = ${JSON.stringify(fixedQuestions, null, 2)};\n\nmodule.exports = quizQuestions;\n`;
  fs.writeFileSync(filePath, newContent);
  console.log(`\n✅ Successfully fixed ${fixedCount} questions in source file!`);
} else {
  console.log('\n✅ All questions in source file already have 4 or fewer options!');
}
