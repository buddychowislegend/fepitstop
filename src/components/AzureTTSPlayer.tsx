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
    if (!text.trim() || !autoPlay) return;

    const generateTTS = async () => {
      setIsLoading(true);
      setError('');
      
      try {
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

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.useBrowserTTS) {
            // Fallback to browser TTS
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.rate = rate;
              utterance.pitch = pitch;
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
            return;
          }
          throw new Error('Failed to generate TTS');
        }

        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('audio/')) {
          // Azure TTS audio response
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          
          // Auto-play if enabled
          if (autoPlay && audioRef.current) {
            setTimeout(()=> {
              audioRef?.current?.play();
              setIsPlaying(true);
            },1500)
          
          }
        } else {
          // JSON response (fallba\k)
          const data = await response.json();
          if (data.useBrowserTTS) {
            // Use browser's built-in TTS
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.rate = rate;
              utterance.pitch = pitch;
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
  }, [text, autoPlay, onComplete, voice, rate, pitch]);

  const handlePlay = () => {
    if (audioUrl && audioRef.current) {
      // Azure TTS audio
      audioRef.current.play();
      setIsPlaying(true);
    } else if ('speechSynthesis' in window) {
      // Browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
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

  const handlePause = () => {
    if (audioUrl && audioRef.current) {
      // Azure TTS audio
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
      {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={handleEnded} />}
    </div>
  );
}
