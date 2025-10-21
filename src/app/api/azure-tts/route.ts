import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = 'en-US-AriaNeural', rate = 0.9, pitch = 0 } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Check if Azure credentials are available
    const azureKey = process.env.AZURE_SPEECH_KEY;
    const azureRegion = process.env.AZURE_SPEECH_REGION;
    
    if (!azureKey || !azureRegion) {
      console.error('Azure Speech credentials not configured');
      return NextResponse.json({ 
        error: 'Azure Speech credentials not configured',
        useBrowserTTS: true,
        text: text 
      }, { status: 500 });
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
        throw new Error('Failed to get Azure access token');
      }

      const accessToken = await tokenResponse.text();
      
      // Generate SSML for Azure TTS
      const ssml = `
        <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
          <voice name='${voice}'>
            <prosody rate="${rate}" pitch="${pitch > 0 ? '+' : ''}${pitch}%">
              ${text}
            </prosody>
          </voice>
        </speak>
      `;

      // Call Azure TTS API
      const response = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        body: ssml,
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        
        return new NextResponse(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.byteLength.toString(),
          },
        });
      } else {
        const errorText = await response.text();
        console.error('Azure TTS API error:', errorText);
        throw new Error(`Azure TTS failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Azure TTS error:', error);
      return NextResponse.json({ 
        error: 'Azure TTS failed',
        useBrowserTTS: true,
        text: text 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('TTS error:', error);
    return NextResponse.json({ error: error.message || 'TTS generation failed' }, { status: 500 });
  }
}
