#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 OpenAI API Setup for Frontend Pitstop\n');

const questions = [
  {
    key: 'OPENAI_API_KEY',
    question: 'Enter your OpenAI API key: ',
    required: true
  },
  {
    key: 'OPENAI_MAX_TOKENS',
    question: 'Max tokens per request (default: 1000): ',
    default: '1000'
  },
  {
    key: 'OPENAI_TEMPERATURE',
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
  
  let content = '# OpenAI API Configuration\n';
  content += `OPENAI_API_KEY=${envContent.OPENAI_API_KEY}\n\n`;
  content += '# Optional: Set usage limits\n';
  content += `OPENAI_MAX_TOKENS=${envContent.OPENAI_MAX_TOKENS}\n`;
  content += `OPENAI_TEMPERATURE=${envContent.OPENAI_TEMPERATURE}\n\n`;
  content += '# Application Configuration\n';
  content += `NEXT_PUBLIC_API_URL=${envContent.NEXT_PUBLIC_API_URL}\n\n`;
  content += '# Database Configuration (optional - add if using Supabase)\n';
  content += '# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here\n';
  content += '# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here\n';

  try {
    fs.writeFileSync(envPath, content);
    console.log('\n✅ .env.local file created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Install OpenAI SDK: npm install openai');
    console.log('2. Start your development server: npm run dev');
    console.log('3. Test the AI interview features');
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
