import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Use Azure TTS for high-quality speech synthesis
      
      // Try Azure Cognitive Services TTS (better quality than ElevenLabs for longer text)
      const azureKey = process.env.AZURE_SPEECH_KEY;
      const azureRegion = process.env.AZURE_SPEECH_REGION;
      
      if (azureKey && azureRegion) {
        try {
          const response = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': azureKey,
              'Content-Type': 'application/ssml+xml',
              'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            },
            body: `
              <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
                <voice name='en-US-AriaNeural'>
                  ${text}
                </voice>
              </speak>
            `,
          });

          if (response.ok) {
            const audioBuffer = await response.arrayBuffer();
            
            return new NextResponse(audioBuffer, {
              headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
              },
            });
          }
        } catch (err) {
          console.error('Azure TTS failed:', err);
        }
      }

      // Fallback to ElevenLabs if Azure is not available
      const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
      
      if (elevenLabsApiKey) {
        try {
          const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': elevenLabsApiKey,
            },
            body: JSON.stringify({
              text: text,
              model_id: 'eleven_monolingual_v1',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
              }
            }),
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
            console.error('ElevenLabs API error:', errorText);
          }
        } catch (err) {
          console.error('ElevenLabs API failed:', err);
        }
      }

      // Final fallback: Return a signal to use browser TTS
      return NextResponse.json({ 
        useBrowserTTS: true, 
        text: text 
      });

    } catch (error) {
      console.error('TTS error:', error);
      return NextResponse.json({ 
        useBrowserTTS: true, 
        text: text 
      });
    }

  } catch (error: any) {
    console.error('TTS error:', error);
    return NextResponse.json({ error: error.message || 'TTS generation failed' }, { status: 500 });
  }
}
