# 🎤 Azure Speech-to-Text (STT) Setup Guide

## Overview
This guide explains how to set up Azure Speech-to-Text for your AI interview system, providing high-quality transcription with support for multiple languages including English (India).

## 🚀 Azure STT Benefits

### **1. High Accuracy**
- **95%+ accuracy** for clear speech
- **Real-time transcription** with low latency
- **Multiple language support** including English (India) - en-IN
- **Custom models** for domain-specific vocabulary

### **2. Interview-Specific Features**
- **Conversation mode** optimized for interviews
- **Punctuation and capitalization** automatically added
- **Confidence scores** for transcription quality
- **Profanity filtering** for professional environments

### **3. Cost-Effective**
- **Pay-per-use pricing** - only pay for what you transcribe
- **Free tier** - 5 hours of audio per month
- **Competitive rates** - $1.00 per hour for standard audio

## 🔧 Setup Instructions

### **Step 1: Create Azure Speech Resource**

1. **Go to Azure Portal**: https://portal.azure.com
2. **Create Resource** → **AI + Machine Learning** → **Speech**
3. **Fill in details**:
   - **Name**: `frontendpitstop-speech`
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Region**: Choose closest to your users (e.g., `eastus`, `westus2`)
   - **Pricing Tier**: `F0` (Free) or `S0` (Standard)

### **Step 2: Get API Credentials**

1. **Go to your Speech resource** in Azure Portal
2. **Click "Keys and Endpoint"** in the left menu
3. **Copy the following**:
   - **Key 1** or **Key 2** (either works)
   - **Region** (e.g., `eastus`, `westus2`)

### **Step 3: Configure Environment Variables**

Add to your `.env.local` file:

```bash
# Azure Speech Services
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=eastus
```

### **Step 4: Test the Integration**

Run the test script to verify everything works:

```bash
node test-azure-stt.js
```

## 📊 Azure STT Features

### **Supported Languages**
- **English (US)**: `en-US`
- **English (India)**: `en-IN` ⭐ **Perfect for Indian candidates**
- **English (UK)**: `en-GB`
- **Hindi**: `hi-IN`
- **Spanish**: `es-ES`
- **French**: `fr-FR`
- **German**: `de-DE`
- **And 100+ more languages**

### **Audio Formats Supported**
- **WAV** (recommended)
- **MP3**
- **OGG**
- **FLAC**
- **WebM** (from browser recordings)

### **Recognition Modes**
- **Conversation**: Optimized for interviews and meetings
- **Dictation**: For formal speech
- **Interactive**: For real-time applications

## 🎯 Interview-Specific Configuration

### **Language Selection**
```typescript
// For Indian candidates (recommended)
const language = 'en-IN';

// For US candidates
const language = 'en-US';

// For UK candidates
const language = 'en-GB';
```

### **Audio Quality Optimization**
```typescript
// Recommended settings for interview audio
const audioSettings = {
  sampleRate: 16000,        // 16kHz for speech
  channels: 1,              // Mono audio
  bitDepth: 16,             // 16-bit depth
  format: 'wav'             // WAV format for best quality
};
```

## 💰 Pricing Information

### **Free Tier (F0)**
- **5 hours of audio per month**
- **Perfect for testing and small usage**
- **No credit card required**

### **Standard Tier (S0)**
- **$1.00 per hour** for standard audio
- **$2.00 per hour** for custom models
- **Real-time and batch processing**
- **Advanced features**

### **Cost Examples**
- **1 interview (30 minutes)**: ~$0.50
- **10 interviews per day**: ~$5.00
- **100 interviews per month**: ~$50.00

## 🔧 Implementation Details

### **API Endpoint**
```typescript
const endpoint = `https://${azureRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;
```

### **Request Headers**
```typescript
const headers = {
  'Ocp-Apim-Subscription-Key': azureKey,
  'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
  'Accept': 'application/json',
};
```

### **Response Format**
```json
{
  "RecognitionStatus": "Success",
  "DisplayText": "That's a great question. Let me think about this step by step.",
  "Confidence": 0.95
}
```

## 🚀 Advanced Features

### **1. Custom Models**
- **Train on interview-specific vocabulary**
- **Improve accuracy for technical terms**
- **Domain-specific language models**

### **2. Real-time Transcription**
- **WebSocket support** for live transcription
- **Interim results** for real-time display
- **Final results** for processing

### **3. Speaker Diarization**
- **Identify different speakers** in group interviews
- **Track who said what** in conversations
- **Multi-speaker recognition**

## 📈 Performance Optimization

### **1. Audio Quality**
- **Use good microphones** for better accuracy
- **Minimize background noise** in interview environment
- **Speak clearly** and at normal pace

### **2. Network Optimization**
- **Compress audio** before sending to Azure
- **Use appropriate sample rates** (16kHz is optimal)
- **Implement retry logic** for network issues

### **3. Caching Strategy**
- **Cache common phrases** to reduce API calls
- **Implement fallback mechanisms** for reliability
- **Monitor usage** to optimize costs

## 🔍 Troubleshooting

### **Common Issues**

#### **1. Authentication Errors**
```
Error: 401 Unauthorized
```
**Solution**: Check your Azure Speech Key and Region

#### **2. Audio Format Issues**
```
Error: 400 Bad Request
```
**Solution**: Ensure audio is in supported format (WAV, MP3, etc.)

#### **3. Rate Limiting**
```
Error: 429 Too Many Requests
```
**Solution**: Implement exponential backoff and retry logic

### **Debug Steps**

1. **Check environment variables**:
   ```bash
   echo $AZURE_SPEECH_KEY
   echo $AZURE_SPEECH_REGION
   ```

2. **Test with curl**:
   ```bash
   curl -X POST \
     -H "Ocp-Apim-Subscription-Key: YOUR_KEY" \
     -H "Content-Type: audio/wav" \
     --data-binary @test-audio.wav \
     "https://eastus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1"
   ```

3. **Check Azure Portal**:
   - Go to your Speech resource
   - Check "Metrics" for usage and errors
   - Review "Logs" for detailed error information

## 🎯 Best Practices

### **1. Language Selection**
- **Use `en-IN`** for Indian English speakers
- **Use `en-US`** for American English speakers
- **Detect language** automatically when possible

### **2. Error Handling**
- **Implement fallback** to mock transcription
- **Log errors** for debugging
- **Provide user feedback** for transcription issues

### **3. Cost Management**
- **Monitor usage** in Azure Portal
- **Set up billing alerts** for cost control
- **Use free tier** for development and testing

## 📚 Resources

### **Azure Documentation**
- [Azure Speech Services Overview](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/)
- [Speech-to-Text API Reference](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-speech-to-text)
- [Language Support](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support)

### **Code Examples**
- [JavaScript SDK](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/quickstart-javascript-browser)
- [REST API Examples](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-speech-to-text)
- [WebSocket API](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-to-text-websocket)

Your AI interview system now has **professional-grade speech-to-text** with Azure integration! 🎉
