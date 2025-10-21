"use client";

import React, { useState, useEffect, useRef } from 'react';

interface TTSPlayerProps {
  text: string;
  onComplete?: () => void;
  autoPlay?: boolean;
}

export default function TTSPlayer({ text, onComplete, autoPlay = true }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [userInteracted, setUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // Generate TTS audio when text changes
  useEffect(() => {
    if (!text.trim() || !autoPlay) return;

    const generateTTS = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Use regular TTS API
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate TTS');
        }

        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('audio/')) {
          // Audio response (Azure TTS or ElevenLabs)
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          
          // Auto-play if enabled and user has interacted
          if (autoPlay && userInteracted) {
            // Wait for audio to be loaded before playing
            setTimeout(() => {
              if (audioRef.current) {
                // Ensure audio is loaded
                if (audioRef.current.readyState >= 2) { // HAVE_CURRENT_DATA
                  audioRef.current.play().then(() => {
                    setIsPlaying(true);
                  }).catch(err => {
                    console.log('Autoplay prevented:', err);
                    // If autoplay fails, user will need to click play
                  });
                } else {
                  // Wait for audio to load
                  audioRef.current.addEventListener('canplay', () => {
                    audioRef.current?.play().then(() => {
                      setIsPlaying(true);
                    }).catch(err => {
                      console.log('Autoplay prevented after load:', err);
                    });
                  }, { once: true });
                }
              }
            }, 200);
          }
        } else {
          // Browser TTS fallback
          const data = await response.json();
          if (data.useBrowserTTS) {
            // Use browser's built-in TTS
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.rate = 0.9;
              utterance.pitch = 1;
              utterance.volume = 1;
              
              utterance.onstart = () => setIsPlaying(true);
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
  }, [text, autoPlay, onComplete]);

  const handlePlay = () => {
    setUserInteracted(true); // Mark that user has interacted
    
    if (audioUrl && audioRef.current) {
      // ElevenLabs audio
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log('Play failed:', err);
        setError('Failed to play audio. Please try again.');
      });
    } else if ('speechSynthesis' in window) {
      // Browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsPlaying(true);
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

  // Auto-play when audio URL changes and user has interacted
  useEffect(() => {
    if (audioUrl && userInteracted && autoPlay && audioRef.current) {
      const playAudio = () => {
        if (audioRef.current) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(err => {
            console.log('Auto-play failed:', err);
          });
        }
      };

      // Try to play immediately
      playAudio();
      
      // Also try after a short delay
      const timeoutId = setTimeout(playAudio, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [audioUrl, userInteracted, autoPlay]);

  const handlePause = () => {
    if (audioUrl && audioRef.current) {
      // ElevenLabs audio
      audioRef.current.pause();
      setIsPlaying(false);
    } else if ('speechSynthesis' in window) {
      // Browser TTS
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleError = () => {
    setError('Audio playback failed');
    setIsPlaying(false);
  };

  // Stop any previous TTS when text changes
  useEffect(() => {
    // Stop any ongoing speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Stop any ongoing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setIsPlaying(false);
  }, [text]);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 text-sm">
        <span>🔊</span>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-2"
      onClick={() => setUserInteracted(true)} // Enable user interaction on any click
    >
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleEnded}
          onError={handleError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onCanPlay={() => {
            // Auto-play when audio can play if autoPlay is enabled and user has interacted
            if (autoPlay && userInteracted && audioRef.current) {
              // Small delay to ensure audio is fully ready
              setTimeout(() => {
                if (audioRef.current) {
                  audioRef.current.play().then(() => {
                    setIsPlaying(true);
                  }).catch(err => {
                    console.log('Autoplay prevented after canplay:', err);
                  });
                }
              }, 50);
            }
          }}
          preload="auto"
        />
      )}
      
      {isLoading ? (
        <div className="flex items-center gap-2 text-blue-500 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span>Generating speech...</span>
        </div>
      ) : audioUrl ? (
        <div className="flex items-center gap-2">
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <span className="text-sm text-gray-600">
            {isPlaying ? 'Playing...' : userInteracted ? 'Ready to play' : 'Click to enable autoplay'}
          </span>
        </div>
      ) : null}
    </div>
  );
}
