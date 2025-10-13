import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const TYPECAST_API_KEY = process.env.TYPECAST_API_KEY;
    if (!TYPECAST_API_KEY) {
      return NextResponse.json({ error: 'TYPECAST_API_KEY not configured', fallback: true }, { status: 200 });
    }

    const { text, actorId, voiceId, styleId } = await request.json();

    // Minimal payload based on Typecast async video generation
    // Note: API shapes can change; this proxy logs and passes through errors
    const payload: any = {
      script: {
        type: 'text',
        input: (text || 'Hello.').slice(0, 220),
      },
      actor_id: actorId || 'default_actor',
      voice_id: voiceId || 'default_voice',
      style_id: styleId || 'default_style',
      options: {
        resolution: '512x512',
        captions: false,
      },
    };

    const res = await fetch('https://api.typecast.ai/v1/video/generate', {
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
      console.error('Typecast generate error:', err);
      return NextResponse.json({ error: 'typecast_generate_failed', details: err, fallback: true }, { status: 200 });
    }

    const data = await res.json();
    // Expect job/task id in response
    const jobId = data?.data?.job_id || data?.job_id || data?.id;
    return NextResponse.json({ jobId, pending: true });
  } catch (e: any) {
    console.error('Typecast generate exception:', e);
    return NextResponse.json({ error: e.message, fallback: true }, { status: 200 });
  }
}


