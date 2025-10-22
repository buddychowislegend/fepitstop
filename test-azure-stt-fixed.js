// Test script to verify Azure STT integration with improved audio format handling
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

console.log('🔧 Testing Azure STT Integration with Audio Format Fixes');
console.log('================================================');

// Check environment variables
const azureKey = process.env.AZURE_SPEECH_KEY;
const azureRegion = process.env.AZURE_SPEECH_REGION;

console.log('📋 Environment Check:');
console.log(`Azure Key: ${azureKey ? '✅ Set' : '❌ Missing'}`);
console.log(`Azure Region: ${azureRegion || '❌ Missing'}`);

if (!azureKey || !azureRegion) {
  console.log('\n❌ Azure credentials not found!');
  console.log('Please set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in your .env.local file');
  process.exit(1);
}

console.log('\n🎯 Key Improvements Made:');
console.log('1. ✅ Added audio format conversion function');
console.log('2. ✅ Prioritized WAV format in MediaRecorder');
console.log('3. ✅ Added retry mechanism for rejected audio formats');
console.log('4. ✅ Better error handling and logging');
console.log('5. ✅ Fallback to mock STT if Azure fails');

console.log('\n🔍 What to Test:');
console.log('1. Open http://localhost:3002/ai-interview');
console.log('2. Enable "Use Azure STT" toggle');
console.log('3. Start recording and speak clearly');
console.log('4. Check browser console for audio format selection');
console.log('5. Check network tab for Azure STT API calls');
console.log('6. Verify transcription source shows "azure" instead of "mock"');

console.log('\n📊 Expected Behavior:');
console.log('- MediaRecorder should prefer audio/wav format');
console.log('- If WAV not supported, fallback to WebM/OGG');
console.log('- Azure STT should accept the audio format');
console.log('- You should see "Azure STT" as the source');
console.log('- Real transcription of your speech (not mock text)');

console.log('\n🚀 Ready to test! Start your dev server and try the AI interview.');
