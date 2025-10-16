import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
    if (!GOOGLE_CLOUD_API_KEY) {
      return NextResponse.json({ error: 'GOOGLE_CLOUD_API_KEY not configured', fallback: true }, { status: 200 });
    }

    const { text, voiceName, languageCode = 'en-US' } = await request.json();
    const input = (text || 'Hello.').slice(0, 5000); // Limit to 5000 chars
    const voice = voiceName || 'en-US-Standard-A'; // Default voice

    const requestBody = {
      input: { text: input },
      voice: {
        languageCode: languageCode,
        name: voice,
        ssmlGender: voice.includes('Female') || voice.includes('Woman') ? 'FEMALE' : 'MALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9,
        pitch: 0.0
      }
    };

    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Google Cloud TTS error:', err);
      return NextResponse.json({ error: 'google_cloud_tts_failed', details: err, fallback: true }, { status: 200 });
    }

    const data = await res.json();
    const audioContent = data.audioContent;
    
    if (!audioContent) {
      return NextResponse.json({ error: 'No audio content returned', fallback: true }, { status: 200 });
    }

    // Return base64 audio data
    const dataUrl = `data:audio/mp3;base64,${audioContent}`;
    return NextResponse.json({ audioUrl: dataUrl });
  } catch (e: any) {
    console.error('Google Cloud TTS exception:', e);
    return NextResponse.json({ error: e.message, fallback: true }, { status: 200 });
  }
}
