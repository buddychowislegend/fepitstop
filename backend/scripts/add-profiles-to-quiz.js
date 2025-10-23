const fs = require('fs');
const path = require('path');

// Read the quiz questions file
const quizFile = path.join(__dirname, '../data/quizQuestions.js');
let content = fs.readFileSync(quizFile, 'utf8');

// Function to map category to profile
function getProfileByCategory(category) {
  if (!category) return 'frontend';
  
  const lowerCat = category.toLowerCase();
  
  // Frontend categories
  if (lowerCat.includes('javascript') || lowerCat.includes('js') || 
      lowerCat.includes('react') || lowerCat.includes('typescript') ||
      lowerCat.includes('css') || lowerCat.includes('html') ||
      lowerCat.includes('type coercion') || lowerCat.includes('hoisting') ||
      lowerCat.includes('scope') || lowerCat.includes('arrow') ||
      lowerCat.includes('promise') || lowerCat.includes('async') ||
      lowerCat.includes('array') || lowerCat.includes('object') ||
      lowerCat.includes('string') || lowerCat.includes('spread')) {
    return 'frontend';
  }
  
  // Backend/Spring Boot categories
  if (lowerCat.includes('java') || lowerCat.includes('spring') ||
      lowerCat.includes('microservice') || lowerCat.includes('sql') ||
      lowerCat.includes('database') || lowerCat.includes('api')) {
    return 'backend';
  }
  
  // Product Manager categories
  if (lowerCat.includes('product') || lowerCat.includes('strategy') ||
      lowerCat.includes('roadmap') || lowerCat.includes('metrics')) {
    return 'product';
  }
  
  // HR categories  
  if (lowerCat.includes('hr') || lowerCat.includes('recruitment') ||
      lowerCat.includes('culture') || lowerCat.includes('interview')) {
    return 'hr';
  }
  
  // Sales/Business categories
  if (lowerCat.includes('sales') || lowerCat.includes('business') ||
      lowerCat.includes('enterprise') || lowerCat.includes('partnership')) {
    return 'business';
  }
  
  return 'frontend';
}

// Parse and modify the content
const lines = content.split('\n');
const newLines = [];
let inQuestionObject = false;
let questionLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect start of a question object
  if (line.includes('{') && lines[i + 1] && lines[i + 1].includes('id:')) {
    inQuestionObject = true;
    questionLines = [line];
  }
  // Detect end of question object
  else if (inQuestionObject && (line.includes('},') || line.includes('},'))) {
    questionLines.push(line);
    
    // Process the question block
    let blockContent = questionLines.join('\n');
    const categoryMatch = blockContent.match(/category:\s*["']([^"']+)["']/);
    const category = categoryMatch ? categoryMatch[1] : null;
    const profile = getProfileByCategory(category);
    
    // Check if profile field already exists
    if (!blockContent.includes('profile:')) {
      // Add profile field before closing brace
      blockContent = blockContent.replace(/\n\s*\}[,]?$/, `,\n    profile: '${profile}'\n  },`);
      if (blockContent.endsWith('},')) {
        // Already has comma
        newLines.push(blockContent);
      } else {
        newLines.push(blockContent);
      }
    } else {
      newLines.push(blockContent);
    }
    
    inQuestionObject = false;
    questionLines = [];
  }
  else if (inQuestionObject) {
    questionLines.push(line);
  }
  else {
    newLines.push(line);
  }
}

// Write the modified content
const modifiedContent = newLines.join('\n');
fs.writeFileSync(quizFile, modifiedContent);

console.log('✅ Added profile field to all quiz questions');
