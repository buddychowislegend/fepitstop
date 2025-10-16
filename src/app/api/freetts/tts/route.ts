import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceType = 'female' } = await request.json();
    const input = (text || 'Hello.').slice(0, 5000); // Limit to 5000 chars

    // FreeTTS.com doesn't have a public API, so we'll use a web scraping approach
    // or implement a simple fallback to browser TTS
    console.log('🔊 FreeTTS: Processing text', { textPreview: input.substring(0, 40), voiceType });

    // Since FreeTTS.com doesn't provide a direct API, we'll return a fallback response
    // This will trigger the browser SpeechSynthesis fallback
    return NextResponse.json({ 
      error: 'FreeTTS API not available', 
      fallback: true,
      message: 'Using browser TTS fallback'
    }, { status: 200 });

  } catch (e: any) {
    console.error('FreeTTS TTS exception:', e);
    return NextResponse.json({ error: e.message, fallback: true }, { status: 200 });
  }
}
