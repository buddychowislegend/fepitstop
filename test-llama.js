#!/usr/bin/env node

/**
 * Test script for Llama 3.x integration
 * Run with: node test-llama.js
 */

const testProviders = [
  {
    name: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.1-70b-versatile'
  },
  {
    name: 'together',
    baseUrl: 'https://api.together.xyz/v1',
    apiKey: process.env.TOGETHER_API_KEY,
    model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo'
  }
];

async function testProvider(provider) {
  if (!provider.apiKey) {
    console.log(`❌ ${provider.name}: No API key provided`);
    return false;
  }

  try {
    console.log(`🧪 Testing ${provider.name}...`);
    
    const startTime = Date.now();
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional technical interviewer.'
          },
          {
            role: 'user',
            content: 'Generate a technical interview question for a React developer.'
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content?.trim();
    
    if (!text) {
      throw new Error('No response content');
    }

    console.log(`✅ ${provider.name}: Success (${responseTime}ms)`);
    console.log(`📝 Response: ${text.substring(0, 100)}...`);
    return true;
  } catch (error) {
    console.log(`❌ ${provider.name}: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🦙 Testing Llama 3.x Providers\n');
  
  const results = await Promise.all(
    testProviders.map(provider => testProvider(provider))
  );
  
  const successCount = results.filter(Boolean).length;
  console.log(`\n📊 Results: ${successCount}/${testProviders.length} providers working`);
  
  if (successCount === 0) {
    console.log('\n⚠️  No providers working. Please check your API keys.');
    console.log('📖 See LLAMA_SETUP.md for setup instructions.');
  } else {
    console.log('\n🎉 Llama 3.x integration is ready!');
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

runTests().catch(console.error);
