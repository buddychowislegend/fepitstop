import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: 'ELEVENLABS_API_KEY not configured', fallback: true }, { status: 200 });
    }

    const { text, voiceId } = await request.json();
    const input = (text || 'Hello.').slice(0, 500);
    const vId = voiceId || '21m00Tcm4TlvDq8ikWAM'; // Rachel (default public voice)

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: input,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('ElevenLabs TTS error:', err);
      return NextResponse.json({ error: 'elevenlabs_tts_failed', details: err, fallback: true }, { status: 200 });
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUrl = `data:audio/mpeg;base64,${base64}`;
    return NextResponse.json({ audioUrl: dataUrl });
  } catch (e: any) {
    console.error('ElevenLabs TTS exception:', e);
    return NextResponse.json({ error: e.message, fallback: true }, { status: 200 });
  }
}


