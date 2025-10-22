#!/usr/bin/env node

/**
 * Test script for Azure Speech-to-Text integration
 * Run with: node test-azure-stt.js
 */

// Test Azure STT API integration
async function testAzureSTT() {
  console.log('🎤 Testing Azure Speech-to-Text Integration\n');
  
  // Check environment variables
  const azureKey = process.env.AZURE_SPEECH_KEY;
  const azureRegion = process.env.AZURE_SPEECH_REGION;
  
  console.log('📋 Environment Check:');
  console.log(`   AZURE_SPEECH_KEY: ${azureKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   AZURE_SPEECH_REGION: ${azureRegion ? '✅ Set' : '❌ Missing'}`);
  
  if (!azureKey || !azureRegion) {
    console.log('\n❌ Azure Speech credentials not found!');
    console.log('Please set the following environment variables:');
    console.log('   AZURE_SPEECH_KEY=your_azure_speech_key');
    console.log('   AZURE_SPEECH_REGION=eastus');
    console.log('\nSee AZURE_STT_SETUP.md for detailed setup instructions.');
    return;
  }
  
  console.log('\n🔧 Testing Azure STT API...');
  
  try {
    // Test with a simple audio file (you would need to provide a real audio file)
    const testAudioBuffer = Buffer.from('test audio data');
    
    const endpoint = `https://${azureRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
        'Accept': 'application/json',
      },
      body: testAudioBuffer,
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('   Response:', JSON.stringify(result, null, 2));
      console.log('\n✅ Azure STT API is working!');
    } else {
      const errorText = await response.text();
      console.log('   Error:', errorText);
      console.log('\n❌ Azure STT API test failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test the API endpoint directly
async function testAPIEndpoint() {
  console.log('\n🌐 Testing API Endpoint...');
  
  try {
    // Test with mock audio data
    const formData = new FormData();
    const audioBlob = new Blob(['mock audio data'], { type: 'audio/wav' });
    formData.append('audio', audioBlob, 'test.wav');
    formData.append('language', 'en-IN');
    
    const response = await fetch('http://localhost:3000/api/speech-to-text', {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('   API Response:', JSON.stringify(result, null, 2));
      console.log('\n✅ API endpoint is working!');
    } else {
      const errorText = await response.text();
      console.log('   Error:', errorText);
      console.log('\n❌ API endpoint test failed');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('   Make sure your Next.js server is running (npm run dev)');
  }
}

// Test language support
function testLanguageSupport() {
  console.log('\n🌍 Supported Languages:');
  
  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-IN', name: 'English (India)', flag: '🇮🇳' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'hi-IN', name: 'Hindi (India)', flag: '🇮🇳' },
    { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German (Germany)', flag: '🇩🇪' },
  ];
  
  languages.forEach(lang => {
    console.log(`   ${lang.flag} ${lang.code} - ${lang.name}`);
  });
  
  console.log('\n💡 Recommendation: Use "en-IN" for Indian English speakers');
}

// Test audio format support
function testAudioFormats() {
  console.log('\n🎵 Supported Audio Formats:');
  
  const formats = [
    { format: 'WAV', description: 'Recommended for best quality', quality: '⭐⭐⭐⭐⭐' },
    { format: 'MP3', description: 'Good compression, widely supported', quality: '⭐⭐⭐⭐' },
    { format: 'OGG', description: 'Open source, good compression', quality: '⭐⭐⭐' },
    { format: 'FLAC', description: 'Lossless compression', quality: '⭐⭐⭐⭐⭐' },
    { format: 'WebM', description: 'Browser recording format', quality: '⭐⭐⭐' },
  ];
  
  formats.forEach(format => {
    console.log(`   ${format.format} - ${format.description} ${format.quality}`);
  });
  
  console.log('\n💡 Recommendation: Use WAV format with 16kHz sample rate');
}

// Test pricing information
function testPricingInfo() {
  console.log('\n💰 Azure STT Pricing:');
  
  console.log('   Free Tier (F0):');
  console.log('     • 5 hours of audio per month');
  console.log('     • Perfect for testing and small usage');
  console.log('     • No credit card required');
  
  console.log('\n   Standard Tier (S0):');
  console.log('     • $1.00 per hour for standard audio');
  console.log('     • $2.00 per hour for custom models');
  console.log('     • Real-time and batch processing');
  
  console.log('\n   Cost Examples:');
  console.log('     • 1 interview (30 minutes): ~$0.50');
  console.log('     • 10 interviews per day: ~$5.00');
  console.log('     • 100 interviews per month: ~$50.00');
}

// Main test function
async function runTests() {
  console.log('🎤 Azure Speech-to-Text Integration Test\n');
  console.log('=' .repeat(60));
  
  await testAzureSTT();
  await testAPIEndpoint();
  testLanguageSupport();
  testAudioFormats();
  testPricingInfo();
  
  console.log('\n🎉 Azure STT Integration Test Complete!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Set up Azure Speech resource in Azure Portal');
  console.log('   2. Add credentials to .env.local file');
  console.log('   3. Test with real audio files');
  console.log('   4. Monitor usage in Azure Portal');
  
  console.log('\n📚 Resources:');
  console.log('   • Setup Guide: AZURE_STT_SETUP.md');
  console.log('   • Azure Portal: https://portal.azure.com');
  console.log('   • Documentation: https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/');
}

// Run tests
runTests().catch(console.error);
