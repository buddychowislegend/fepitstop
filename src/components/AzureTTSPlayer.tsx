"use client";

import React, { useState, useEffect, useRef } from 'react';

interface AzureTTSPlayerProps {
  text: string;
  onComplete?: () => void;
  autoPlay?: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
}

export default function AzureTTSPlayer({ 
  text, 
  onComplete, 
  autoPlay = true, 
  voice = 'en-US-AriaNeural',
  rate = 0.9,
  pitch = 0
}: AzureTTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // Generate Azure TTS audio when text changes
  useEffect(() => {
    if (!text.trim()) return;
    
    // Cancel any existing browser TTS first
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Reset states when text changes
    setIsPlaying(false);
    setAudioUrl('');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    if (!autoPlay) return;

    const generateTTS = async () => {
      console.log(`🎙️ AzureTTSPlayer: Generating TTS for text (${text.length} chars), autoPlay=${autoPlay}, voice=${voice}`);
      setIsLoading(true);
      setError('');
      
      // Cancel any browser TTS that might be playing
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      
      try {
        console.log('📡 Calling /api/azure-tts with:', { text: text.substring(0, 50) + '...', voice, rate, pitch });
        const response = await fetch('/api/azure-tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text, 
            voice,
            rate,
            pitch
          }),
        });
        
        console.log('📡 Azure TTS response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.useBrowserTTS) {
            // Only use browser TTS if Azure TTS completely fails
            // Cancel any existing browser TTS first
            if ('speechSynthesis' in window) {
              speechSynthesis.cancel();
              
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.rate = rate;
              utterance.pitch = pitch;
              utterance.volume = 1;
              
              utterance.onstart = () => {
                setIsPlaying(true);
                // Make sure Azure audio is not playing
                if (audioRef.current) {
                  audioRef.current.pause();
                }
              };
              utterance.onend = () => {
                setIsPlaying(false);
                if (onComplete) onComplete();
              };
              utterance.onerror = () => {
                setError('Speech synthesis failed');
                setIsPlaying(false);
              };
              
              if (autoPlay) {
                speechSynthesis.speak(utterance);
              }
            } else {
              setError('Speech synthesis not supported');
            }
            return;
          }
          throw new Error('Failed to generate TTS');
        }

        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('audio/')) {
          // Azure TTS audio response - this means Azure TTS succeeded
          // Cancel browser TTS to prevent duplicate playback
          if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
          }
          
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          console.log('✅ Azure TTS audio blob received, size:', blob.size, 'bytes, creating URL:', url.substring(0, 50));
          setAudioUrl(url);
          
          // Wait for audio element to be ready, then auto-play if enabled
          // Use useEffect to trigger when audioUrl changes
          if (autoPlay) {
            console.log('🎵 Auto-play enabled, audio URL set, will play when audio element is ready');
          } else {
            console.log('⏸️ Auto-play disabled, audio ready for manual play');
          }
        } else {
          // JSON response (fallback)
          const data = await response.json();
          if (data.useBrowserTTS) {
            // Only use browser TTS if explicitly requested
            // Cancel any existing browser TTS first
            if ('speechSynthesis' in window) {
              speechSynthesis.cancel();
              
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.rate = rate;
              utterance.pitch = pitch;
              utterance.volume = 1;
              
              utterance.onstart = () => {
                setIsPlaying(true);
                // Make sure Azure audio is not playing
                if (audioRef.current) {
                  audioRef.current.pause();
                }
              };
              utterance.onend = () => {
                setIsPlaying(false);
                if (onComplete) onComplete();
              };
              utterance.onerror = () => {
                setError('Speech synthesis failed');
                setIsPlaying(false);
              };
              
              if (autoPlay) {
                speechSynthesis.speak(utterance);
              }
            } else {
              setError('Speech synthesis not supported');
            }
          }
        }
      } catch (err) {
        console.error('TTS generation failed:', err);
        setError('Failed to generate speech');
      } finally {
        setIsLoading(false);
      }
    };

    generateTTS();
  }, [text, autoPlay, voice, rate, pitch]); // Removed onComplete from deps to avoid unnecessary re-runs
  
  // Auto-play when audioUrl is set and autoPlay is enabled
  useEffect(() => {
    if (!autoPlay || !audioUrl || !audioRef.current) return;
    
    // Cancel browser TTS before playing Azure TTS audio
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    console.log('🎵 Audio URL ready, attempting autoplay...');
    const tryPlay = () => {
      if (audioRef.current && audioRef.current.src) {
        // Ensure browser TTS is cancelled before playing
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
        }
        
        console.log('▶️ Attempting to play audio, src:', audioRef.current.src.substring(0, 50));
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          console.log('✅ Azure TTS autoplay started successfully');
          // Double-check browser TTS is stopped
          if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
          }
        }).catch(err => {
          console.log('⚠️ Autoplay blocked, will retry:', err.message);
          // Retry after a short delay - often works after user has interacted
          setTimeout(() => {
            if (audioRef.current && audioRef.current.src) {
              // Cancel browser TTS before retry
              if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
              }
              
              audioRef.current.play().then(() => {
                setIsPlaying(true);
                console.log('✅ Azure TTS autoplay started on retry');
                // Ensure browser TTS is stopped
                if ('speechSynthesis' in window) {
                  speechSynthesis.cancel();
                }
              }).catch((retryErr) => {
                console.log('❌ Autoplay failed - user may need to interact first:', retryErr.message);
              });
            }
          }, 500);
        });
      } else {
        // Audio ref not ready yet or src not set, try again
        console.log('⏳ Audio element not ready, retrying...', { hasRef: !!audioRef.current, hasSrc: audioRef.current?.src });
        setTimeout(tryPlay, 100);
      }
    };
    
    // Small delay to ensure audio element is rendered and ready
    const timeoutId = setTimeout(tryPlay, 200);
    return () => {
      clearTimeout(timeoutId);
      // Cancel browser TTS when component unmounts or audioUrl changes
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, [audioUrl, autoPlay]);

  const handlePlay = () => {
    // Cancel browser TTS first
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    if (audioUrl && audioRef.current) {
      // Azure TTS audio - prefer this
      audioRef.current.play();
      setIsPlaying(true);
    } else if ('speechSynthesis' in window) {
      // Browser TTS fallback - only if no Azure audio
      // Cancel any existing browser TTS
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        // Make sure Azure audio is not playing
        if (audioRef.current) {
          audioRef.current.pause();
        }
      };
      utterance.onend = () => {
        setIsPlaying(false);
        if (onComplete) onComplete();
      };
      utterance.onerror = () => {
        setError('Speech synthesis failed');
        setIsPlaying(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const handlePause = () => {
    // Cancel browser TTS
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    if (audioRef.current) {
      // Azure TTS audio
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
      )}
      {error && <span className="text-red-500 text-sm">{error}</span>}
      {!isLoading && (
        <button 
          onClick={isPlaying ? handlePause : handlePlay}
          className="p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
          disabled={!text.trim()}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          )}
        </button>
      )}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onEnded={handleEnded}
          onPlay={() => {
            console.log('🎵 Azure TTS audio started playing');
            setIsPlaying(true);
          }}
          onPause={() => {
            console.log('⏸️ Azure TTS audio paused');
            setIsPlaying(false);
          }}
          onError={(e) => {
            console.error('❌ Audio playback error:', e);
            setError('Audio playback failed');
            setIsPlaying(false);
          }}
        />
      )}
    </div>
  );
}
