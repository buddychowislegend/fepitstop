import { NextRequest, NextResponse } from 'next/server';

// Step 1: Create talk and return talkId immediately
export async function POST(request: NextRequest) {
  try {
    console.log('=== D-ID Avatar Video API Called ===');
    
           const { text, avatarUrl, voice } = await request.json();
    
    console.log('Text length:', text.length);
    console.log('Avatar URL:', avatarUrl);
    console.log('Voice:', voice);
    
    const DID_API_KEY = process.env.DID_API_KEY;
    
    console.log('DID_API_KEY exists:', !!DID_API_KEY);
    console.log('DID_API_KEY value:', DID_API_KEY ? `${DID_API_KEY.substring(0, 20)}...` : 'undefined');
    
    if (!DID_API_KEY) {
      console.error('DID_API_KEY not configured');
      return NextResponse.json({ 
        error: 'DID_API_KEY not configured',
        fallback: true 
      }, { status: 500 });
    }

    // Try D-ID API call
    console.log('🎬 Attempting D-ID API call...');

    console.log('Generating D-ID video for text:', text.substring(0, 50));

    // Create talking video using D-ID API
           // D-ID generation works faster with shorter input.
           const trimmedText = typeof text === 'string' ? text.slice(0, 220) : '';
           const requestBody = {
      script: {
        type: 'text',
               input: trimmedText,
        provider: {
          type: 'microsoft',
          voice_id: voice || 'en-US-JennyNeural'
        }
      },
      config: {
        fluent: true,
               pad_audio: 0,
               // Disabling stitch can reduce render time for short utterances
               stitch: false
      },
      source_url: avatarUrl || 'https://create-images-results.d-id.com/google-oauth2%7C117408431483365796674/upl_kF-rKCg5Ym8RMgqrXxRnl/image.jpeg'
    };
    
    console.log('D-ID request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('D-ID response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('D-ID API error response:', error);
      console.error('D-ID API status:', response.status);
      return NextResponse.json({ 
        error: `Failed to generate video: ${response.status}`,
        details: error,
        fallback: true 
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('D-ID video created, ID:', data.id);
    return NextResponse.json({ talkId: data.id, pending: true });

  } catch (error: any) {
    console.error('Avatar video generation error:', error);
    return NextResponse.json({ 
      error: error.message,
      fallback: true 
    }, { status: 500 });
  }
}

// Step 2: Poll talk status by talkId from the client
export async function GET(request: NextRequest) {
  try {
    const DID_API_KEY = process.env.DID_API_KEY;
    if (!DID_API_KEY) {
      return NextResponse.json({ error: 'DID_API_KEY not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const talkId = searchParams.get('talkId');
    if (!talkId) {
      return NextResponse.json({ error: 'talkId is required' }, { status: 400 });
    }

    const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
      },
    });

    if (!statusResponse.ok) {
      const err = await statusResponse.text();
      return NextResponse.json({ error: 'Failed to fetch talk status', details: err }, { status: 500 });
    }

    const statusData = await statusResponse.json();
    if (statusData.status === 'done') {
      return NextResponse.json({ status: 'done', videoUrl: statusData.result_url });
    }
    if (statusData.status === 'error') {
      return NextResponse.json({ status: 'error', details: statusData }, { status: 500 });
    }

    return NextResponse.json({ status: statusData.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

