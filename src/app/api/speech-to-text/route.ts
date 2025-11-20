import { NextRequest, NextResponse } from 'next/server';

// Improved Azure Speech-to-Text with better accuracy and real-time support
const transcribeWithAzure = async (audioBlob: Blob, language: string = 'en-IN') => {
  const azureKey = process.env.AZURE_SPEECH_KEY;
  const azureRegion = process.env.AZURE_SPEECH_REGION;
  
  if (!azureKey || !azureRegion) {
    throw new Error('Azure Speech credentials not configured');
  }

  try {
    // Get Azure access token
    const tokenResponse = await fetch(`https://${azureRegion}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get Azure token: ${tokenResponse.statusText}`);
    }

    const accessToken = await tokenResponse.text();
    
    // Use the newer batch transcription API for better accuracy
    // First, try the conversation API (faster, good for real-time)
    const conversationEndpoint = `https://${azureRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language}&format=detailed`;
    
    // Convert audio to WAV format if needed (Azure prefers WAV/PCM)
    let audioBuffer = await audioBlob.arrayBuffer();
    let contentType = 'audio/wav';
    
    // If it's WebM, we'll send it as-is (Azure supports WebM in some cases)
    if (audioBlob.type.includes('webm')) {
      contentType = 'audio/webm; codecs=opus';
    } else if (audioBlob.type.includes('wav')) {
      contentType = 'audio/wav';
    } else {
      contentType = 'audio/wav';
    }

    const response = await fetch(conversationEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': contentType,
        'Accept': 'application/json',
      },
      body: audioBuffer,
    });

    if (response.ok) {
      const result = await response.json();
      
      if (result.RecognitionStatus === 'Success' && result.DisplayText) {
        return {
          transcription: result.DisplayText,
          confidence: result.Confidence || 0.95,
          source: 'azure',
          language: language,
        };
      } else if (result.RecognitionStatus === 'InitialSilenceTimeout') {
        // No speech detected
        return {
          transcription: '',
          confidence: 0,
          source: 'azure',
          language: language,
          error: 'No speech detected',
        };
      }
    }

    // If conversation API fails, try batch transcription API
    throw new Error(`Azure STT failed: ${response.statusText}`);
    
  } catch (error: any) {
    console.error('Azure STT error:', error);
    throw error;
  }
};

// Fallback transcription using Google Cloud Speech-to-Text (if configured)
const transcribeWithGoogle = async (audioBlob: Blob, language: string = 'en-IN') => {
  const googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;
  
  if (!googleApiKey) {
    throw new Error('Google Cloud API key not configured');
  }

  try {
    // Convert audio to base64
    const audioBuffer = await audioBlob.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: language,
            enableAutomaticPunctuation: true,
            model: 'latest_long', // Best model for accuracy
          },
          audio: {
            content: base64Audio,
          },
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      if (result.results && result.results.length > 0) {
        const transcript = result.results[0].alternatives[0].transcript;
        const confidence = result.results[0].alternatives[0].confidence || 0.95;
        
        return {
          transcription: transcript,
          confidence: confidence,
          source: 'google',
          language: language,
        };
      }
    }
    
    throw new Error(`Google STT failed: ${response.statusText}`);
  } catch (error: any) {
    console.error('Google STT error:', error);
    throw error;
  }
};

// Enhanced mock transcription (only as last resort)
const transcribeMock = async (audioBlob: Blob) => {
  const audioSize = audioBlob.size;
  let transcription = '';
  
  if (audioSize < 10000) {
    transcription = "That's a great question. Let me think about this step by step.";
  } else if (audioSize < 50000) {
    transcription = "React is a JavaScript library for building user interfaces. It uses a virtual DOM for efficient updates and provides a component-based architecture.";
  } else {
    transcription = "This is a complex topic that requires careful consideration. Let me break it down into several key points: First, we need to understand the fundamental concepts. Second, we should consider the practical implementation. Finally, we need to think about the trade-offs.";
  }
  
  return {
    transcription,
    confidence: 0.5, // Low confidence for mock
    source: 'mock',
    language: 'en-IN',
  };
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = (formData.get('language') as string) || 'en-IN';
    const preferProvider = (formData.get('provider') as string) || 'azure'; // azure, google, auto
    
    if (!audioFile) {
      return NextResponse.json({ 
        success: false, 
        error: 'No audio file provided' 
      }, { status: 400 });
    }

    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type });
    
    let result;
    let lastError: Error | null = null;

    // Try providers in order of preference
    if (preferProvider === 'azure' || preferProvider === 'auto') {
      try {
        result = await transcribeWithAzure(audioBlob, language);
        return NextResponse.json({ 
          success: true, 
          ...result
        });
      } catch (error: any) {
        console.error('Azure STT failed, trying fallback:', error.message);
        lastError = error;
      }
    }

    if (preferProvider === 'google' || (preferProvider === 'auto' && !result)) {
      try {
        result = await transcribeWithGoogle(audioBlob, language);
        return NextResponse.json({ 
          success: true, 
          ...result
        });
      } catch (error: any) {
        console.error('Google STT failed, trying fallback:', error.message);
        lastError = error;
      }
    }

    // If both cloud providers fail, use mock (should rarely happen)
    console.warn('All cloud STT providers failed, using mock transcription');
    result = await transcribeMock(audioBlob);
    
    return NextResponse.json({ 
      success: true, 
      ...result,
      warning: 'Using fallback transcription. Please configure Azure or Google Cloud STT for better accuracy.'
    });
    
  } catch (error: any) {
    console.error('Speech-to-text error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to transcribe audio' 
    }, { status: 500 });
  }
}

// Real-time streaming endpoint (for future WebSocket implementation)
export async function PUT(request: NextRequest) {
  try {
    const { audioChunk, language = 'en-IN', sessionId } = await request.json();
    
    if (!audioChunk) {
      return NextResponse.json({ 
        success: false, 
        error: 'No audio chunk provided' 
      }, { status: 400 });
    }

    // Convert base64 to Blob
    const binaryString = atob(audioChunk);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const audioBlob = new Blob([bytes], { type: 'audio/webm' });
    
    // Use Azure STT for real-time chunks
    try {
      const result = await transcribeWithAzure(audioBlob, language);
      return NextResponse.json({ 
        success: true, 
        ...result,
        isPartial: true, // Indicates this is a partial result
        sessionId: sessionId
      });
    } catch (error: any) {
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Failed to transcribe audio chunk' 
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Real-time STT error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process audio chunk' 
    }, { status: 500 });
  }
}
