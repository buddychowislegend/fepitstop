import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const TYPECAST_API_KEY = process.env.TYPECAST_API_KEY;
    if (!TYPECAST_API_KEY) {
      return NextResponse.json({ error: 'TYPECAST_API_KEY not configured', fallback: true }, { status: 200 });
    }

    const { text, voiceId } = await request.json();
    const input = (text || 'Hello.').slice(0, 500);

    // NOTE: Typecast API shapes can vary by plan; this proxy attempts a common TTS endpoint.
    // If your workspace uses a different path, update the URL/payload accordingly.
    const payload: any = {
      input_text: input,
      voice_id: voiceId,
      format: 'mp3',
      sample_rate: 44100,
    };

    const res = await fetch('https://api.typecast.ai/v1/tts/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TYPECAST_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Typecast TTS error:', err);
      return NextResponse.json({ error: 'typecast_tts_failed', details: err, fallback: true }, { status: 200 });
    }

    const data = await res.json();
    const audioUrl = data?.data?.audio_url || data?.audio_url;
    if (!audioUrl) {
      return NextResponse.json({ error: 'audio_url_not_found', fallback: true }, { status: 200 });
    }
    return NextResponse.json({ audioUrl });
  } catch (e: any) {
    console.error('Typecast TTS exception:', e);
    return NextResponse.json({ error: e.message, fallback: true }, { status: 200 });
  }
}


