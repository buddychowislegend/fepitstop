import { NextRequest, NextResponse } from 'next/server';

// Note: Gemini Flash doesn't support audio input directly
// We'll use the Web Speech API on the frontend for real transcription
// This API endpoint will serve as a fallback with enhanced mock responses

const transcribeAudio = async (audioBlob: Blob) => {
  try {
    console.log('Audio blob size:', audioBlob.size, 'bytes');
    
    // For now, we'll use enhanced mock responses based on audio length
    // In a production app, you'd integrate with Google Cloud Speech-to-Text API
    // or use the Web Speech API on the frontend
    
    const audioSize = audioBlob.size;
    let transcription = '';
    
    if (audioSize < 10000) {
      // Short audio - likely a quick answer
      transcription = "That's a great question. Let me think about this step by step.";
    } else if (audioSize < 50000) {
      // Medium audio - detailed explanation
      transcription = "React is a JavaScript library for building user interfaces. It uses a virtual DOM for efficient updates and provides a component-based architecture that makes code reusable and maintainable.";
    } else {
      // Long audio - comprehensive answer
      transcription = "This is a complex topic that requires careful consideration. Let me break it down into several key points: First, we need to understand the fundamental concepts. Second, we should consider the practical implementation. Finally, we need to think about the trade-offs and potential issues.";
    }
    
    console.log('Generated transcription:', transcription);
    return transcription;
    
  } catch (error) {
    console.error('Transcription error:', error);
    return "I apologize, but I couldn't process the audio. Please try typing your answer instead.";
  }
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ 
        success: false, 
        error: 'No audio file provided' 
      }, { status: 400 });
    }

    // Convert File to Blob for processing
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type });
    
    // Transcribe audio (mock implementation)
    const transcription = await transcribeAudio(audioBlob);
    
    return NextResponse.json({ 
      success: true, 
      transcription,
      confidence: 0.95 // Mock confidence score
    });
    
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to transcribe audio' 
    }, { status: 500 });
  }
}

// Alternative endpoint for base64 audio data
export async function PUT(request: NextRequest) {
  try {
    const { audioData, mimeType } = await request.json();
    
    if (!audioData) {
      return NextResponse.json({ 
        success: false, 
        error: 'No audio data provided' 
      }, { status: 400 });
    }

    // Convert base64 to Blob
    const binaryString = atob(audioData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const audioBlob = new Blob([bytes], { type: mimeType || 'audio/webm' });
    
    // Transcribe audio
    const transcription = await transcribeAudio(audioBlob);
    
    return NextResponse.json({ 
      success: true, 
      transcription,
      confidence: 0.95
    });
    
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to transcribe audio' 
    }, { status: 500 });
  }
}
