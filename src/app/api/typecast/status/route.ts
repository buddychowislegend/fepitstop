import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const TYPECAST_API_KEY = process.env.TYPECAST_API_KEY;
    if (!TYPECAST_API_KEY) {
      return NextResponse.json({ error: 'TYPECAST_API_KEY not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });

    const res = await fetch(`https://api.typecast.ai/v1/video/status?job_id=${encodeURIComponent(jobId)}`, {
      headers: {
        'Authorization': `Bearer ${TYPECAST_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: 'typecast_status_failed', details: err }, { status: 500 });
    }
    const data = await res.json();
    const status = data?.data?.status || data?.status;
    const videoUrl = data?.data?.video_url || data?.video_url;
    if (status === 'completed' && videoUrl) return NextResponse.json({ status: 'done', videoUrl });
    if (status === 'failed') return NextResponse.json({ status: 'error', details: data }, { status: 500 });
    return NextResponse.json({ status: 'pending' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


