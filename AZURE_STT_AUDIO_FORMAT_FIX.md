# Azure STT Audio Format Fix

## Problem
You were getting "Mock STT" as the source instead of "Azure STT" because Azure Speech Services was rejecting the WebM audio format sent by the browser.

## Root Cause
- Browser MediaRecorder was recording in `audio/webm;codecs=opus` format
- Azure Speech Services has strict audio format requirements
- Azure prefers WAV, MP3, OGG, FLAC formats
- WebM format is often rejected by Azure STT API

## Solutions Implemented

### 1. Frontend Audio Format Priority
**File:** `src/app/ai-interview/page.tsx`
- Added `audio/wav` as the first preferred format in MediaRecorder
- Fallback chain: WAV → WebM → OGG
- Better format detection and selection

### 2. Backend Audio Processing
**File:** `src/app/api/speech-to-text/route.ts`
- Added `convertAudioForAzure()` function for format handling
- Force `audio/wav` content type for Azure API calls
- Added retry mechanism with different content types
- Better error handling and logging

### 3. Retry Mechanism
- If Azure rejects the first format (400 error), automatically retry with `audio/ogg`
- Fallback to mock STT only after all retries fail
- Detailed logging for debugging

## Key Changes Made

### Frontend (page.tsx)
```typescript
const preferredTypes = [
  'audio/wav',           // ← NEW: Azure's preferred format
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg'
];
```

### Backend (route.ts)
```typescript
// Convert audio to Azure-compatible format
const audioBuffer = await convertAudioForAzure(audioBlob);

// Force WAV content type for Azure
const contentType = 'audio/wav; codecs=audio/pcm; samplerate=16000';

// Retry with different format if rejected
if (response.status === 400 && errorText.includes('format')) {
  // Try with audio/ogg instead
  const retryResponse = await fetch(endpoint, {
    headers: {
      'Content-Type': 'audio/ogg; codecs=opus',
      // ... other headers
    },
    body: audioBuffer,
  });
}
```

## Testing Instructions

1. **Set up Azure credentials** in `.env.local`:
   ```
   AZURE_SPEECH_KEY=your_azure_key_here
   AZURE_SPEECH_REGION=eastus
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Test the integration**:
   - Go to `http://localhost:3002/ai-interview`
   - Enable "Use Azure STT" toggle
   - Start recording and speak clearly
   - Check browser console for format selection logs
   - Verify transcription source shows "azure"

## Expected Results

✅ **Before Fix:**
- Source: "Mock STT" or "Browser STT"
- Mock transcription text
- Azure API calls failing

✅ **After Fix:**
- Source: "Azure STT"
- Real transcription of your speech
- Successful Azure API calls
- Better audio format compatibility

## Debugging

Check browser console for:
- `Azure STT initialized with MediaRecorder, type: audio/wav`
- `Sending to Azure STT: { endpoint, contentType, audioSize, language }`
- `Azure STT result: { RecognitionStatus: 'Success', DisplayText: '...' }`

## Production Considerations

For production, consider:
1. **Server-side audio conversion** using ffmpeg
2. **Audio preprocessing** to ensure optimal format
3. **Caching** of converted audio for retries
4. **Monitoring** of Azure STT success rates

## Files Modified

- `src/app/ai-interview/page.tsx` - Frontend audio format priority
- `src/app/api/speech-to-text/route.ts` - Backend format handling
- `test-azure-stt-fixed.js` - Test script for verification

The integration should now work correctly with Azure Speech Services!
