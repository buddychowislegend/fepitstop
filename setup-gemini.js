#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Gemini Flash Setup for Frontend Pitstop\n');
console.log('📋 First, get your Gemini API key from: https://aistudio.google.com/\n');

const questions = [
  {
    key: 'GEMINI_API_KEY',
    question: 'Enter your Gemini API key: ',
    required: true
  },
  {
    key: 'GEMINI_MAX_TOKENS',
    question: 'Max tokens per request (default: 1000): ',
    default: '1000'
  },
  {
    key: 'GEMINI_TEMPERATURE',
    question: 'Temperature for AI responses (default: 0.7): ',
    default: '0.7'
  },
  {
    key: 'NEXT_PUBLIC_API_URL',
    question: 'API URL (default: http://localhost:3000): ',
    default: 'http://localhost:3000'
  }
];

const envContent = {};

function askQuestion(index) {
  if (index >= questions.length) {
    createEnvFile();
    return;
  }

  const q = questions[index];
  const prompt = q.default ? `${q.question}[${q.default}] ` : q.question;

  rl.question(prompt, (answer) => {
    const value = answer.trim() || q.default || '';
    
    if (q.required && !value) {
      console.log('❌ This field is required!');
      askQuestion(index);
      return;
    }

    envContent[q.key] = value;
    askQuestion(index + 1);
  });
}

function createEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  
  let content = '# Gemini Flash API Configuration\n';
  content += `GEMINI_API_KEY=${envContent.GEMINI_API_KEY}\n\n`;
  content += '# Optional: Set usage limits\n';
  content += `GEMINI_MAX_TOKENS=${envContent.GEMINI_MAX_TOKENS}\n`;
  content += `GEMINI_TEMPERATURE=${envContent.GEMINI_TEMPERATURE}\n\n`;
  content += '# Application Configuration\n';
  content += `NEXT_PUBLIC_API_URL=${envContent.NEXT_PUBLIC_API_URL}\n\n`;
  content += '# Database Configuration (optional - add if using Supabase)\n';
  content += '# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here\n';
  content += '# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here\n';

  try {
    fs.writeFileSync(envPath, content);
    console.log('\n✅ .env.local file created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Install Gemini SDK: npm install @google/generative-ai');
    console.log('2. Start your development server: npm run dev');
    console.log('3. Test the AI interview features');
    console.log('\n💰 Cost Benefits:');
    console.log('- Gemini Flash is ~400x cheaper than GPT-4');
    console.log('- Free tier: 15 requests/minute, 1M tokens/day');
    console.log('- Paid: $0.000075/1K input, $0.0003/1K output');
    console.log('\n⚠️  Remember to add .env.local to your .gitignore file!');
  } catch (error) {
    console.error('❌ Error creating .env.local file:', error.message);
  }

  rl.close();
}

// Check if .env.local already exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  rl.question('⚠️  .env.local already exists. Overwrite? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      askQuestion(0);
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  askQuestion(0);
}
