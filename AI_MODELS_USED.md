# AI Models Used for Interview Analysis

## Overview

The interview analysis system uses a **hybrid approach** with **Llama as the primary model** and **Gemini as the fallback**.

## Model Priority

1. **Primary: Llama 3.x** (tried first)
2. **Fallback: Gemini** (used if Llama fails)

## Llama Providers Configured

The system tries multiple Llama providers in order:

1. **Groq** (`llama-3.3-70b-versatile`)
   - API Key: `GROQ_API_KEY`
   - Base URL: `https://api.groq.com/openai/v1`

2. **Together AI** (`meta-llama/Llama-3.1-70B-Instruct-Turbo`)
   - API Key: `TOGETHER_API_KEY`
   - Base URL: `https://api.together.xyz/v1`

3. **Replicate** (`meta/llama-3.1-70b-instruct`)
   - API Key: `REPLICATE_API_KEY`
   - Base URL: `https://api.replicate.com/v1`

## Where Llama is Used

### 1. Per-Question Analysis (`generateQuestionAnalysis`)
- **Function**: `src/app/api/ai-interview/route.ts:853`
- **Purpose**: Analyzes each individual Q&A pair
- **Uses**: `callAIWithRetry()` → tries Llama first, falls back to Gemini
- **Output**: Score (0-10), feedback, strengths, improvements

### 2. End-of-Interview Summary (`generateEndSummary`)
- **Function**: `src/app/api/ai-interview/route.ts:771`
- **Purpose**: Generates comprehensive final analysis
- **Uses**: `callAIWithRetry()` → tries Llama first, falls back to Gemini
- **Output**: Summary, strengths, improvements, category scores

### 3. Question Generation (`generateQuestion`)
- **Function**: `src/app/api/ai-interview/route.ts:512`
- **Purpose**: Generates interview questions
- **Uses**: `callAIWithRetry()` → tries Llama first, falls back to Gemini

### 4. Follow-up Question Generation (`generateFollowUp`)
- **Function**: `src/app/api/ai-interview/route.ts:763`
- **Purpose**: Generates follow-up questions based on candidate answers
- **Uses**: `callAIWithRetry()` → tries Llama first, falls back to Gemini

### 5. Screening Assessment Generation
- **Function**: `src/app/api/ai-interview/route.ts:935`
- **Purpose**: Generates screening assessment details (JD, skills, etc.)
- **Uses**: `callLlamaWithRetry()` directly (no Gemini fallback for this)

## How It Works

```javascript
// Hybrid function: Try Llama first, fallback to Gemini
async function callAIWithRetry(prompt: string): Promise<string> {
  try {
    // Try Llama 3.x first
    return await callLlamaWithRetry(prompt);
  } catch (llamaError: any) {
    console.log('[AI] Llama failed, falling back to Gemini');
    
    // Fallback to Gemini
    try {
      return await callGeminiWithRetry(prompt);
    } catch (geminiError: any) {
      console.error('[AI] Both Llama and Gemini failed');
      throw new Error(`AI service unavailable: ${geminiError.message}`);
    }
  }
}
```

## Llama Configuration

- **Temperature**: 0.7 (balanced creativity/consistency)
- **Max Tokens**: 1000
- **Top P**: 0.9
- **System Prompt**: "You are a professional technical interviewer with 10+ years of experience..."

## Retry Logic

- **Max Attempts**: 3 per provider
- **Exponential Backoff**: 500ms, 1000ms, 2000ms
- **Provider Rotation**: If one provider fails (rate limit/quota), tries next provider
- **Error Handling**: Gracefully falls back to Gemini if all Llama providers fail

## Gemini Fallback

If all Llama providers fail, the system uses:
- **Primary**: `gemini-2.0-flash-exp`
- **Fallback**: `gemini-1.5-flash-001`
- **Final Fallback**: `gemini-1.5-pro-001`

## Environment Variables Required

For Llama to work, you need at least one of:
- `GROQ_API_KEY` (recommended - fastest)
- `TOGETHER_API_KEY`
- `REPLICATE_API_KEY`

For Gemini fallback:
- `GEMINI_API_KEY`

## Summary

✅ **Yes, Llama is used for interview analysis** as the primary model, with automatic fallback to Gemini if Llama is unavailable or fails.

The analysis includes:
- Per-question scoring and feedback
- Overall interview summary
- Strengths and improvements identification
- Category-based scoring

