'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AzureSTTPlayerProps {
  onTranscription: (text: string, confidence: number) => void;
  language?: string;
  className?: string;
}

export default function AzureSTTPlayer({ 
  onTranscription, 
  language = 'en-IN',
  className = '' 
}: AzureSTTPlayerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize media recorder
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          streamRef.current = stream;
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus'
          });
          mediaRecorderRef.current = mediaRecorder;
        })
        .catch(err => {
          console.error('Error accessing microphone:', err);
          setError('Microphone access denied. Please allow microphone access and try again.');
        });
    }
  }, []);

  // Start recording
  const startRecording = async () => {
    if (!mediaRecorderRef.current) {
      setError('Media recorder not initialized');
      return;
    }

    try {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setError('');
      setTranscription('');
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording');
    }
  };

  // Stop recording and process
  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    try {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      
      // Wait for the last data to be available
      await new Promise(resolve => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = resolve;
        }
      });
      
      // Process the audio
      await processAudio();
      
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Failed to stop recording');
      setIsProcessing(false);
    }
  };

  // Process audio with Azure STT
  const processAudio = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Create FormData for the API
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', language);
      
      // Call Azure STT API
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTranscription(result.transcription);
        setConfidence(result.confidence);
        onTranscription(result.transcription, result.confidence);
        
        console.log('Transcription result:', {
          text: result.transcription,
          confidence: result.confidence,
          source: result.source,
          language: result.language
        });
      } else {
        throw new Error(result.error || 'Transcription failed');
      }
      
    } catch (err) {
      console.error('Error processing audio:', err);
      setError(`Transcription failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className={`azure-stt-player ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Stop Recording</span>
            </button>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-4 text-sm">
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Recording...</span>
            </div>
          )}
          
          {isProcessing && (
            <div className="flex items-center space-x-2 text-blue-500">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing with Azure STT...</span>
            </div>
          )}
        </div>

        {/* Language Indicator */}
        <div className="text-xs text-gray-500">
          Language: {language} {language === 'en-IN' ? '🇮🇳' : '🌍'}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Transcription Result */}
        {transcription && (
          <div className="w-full max-w-2xl">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-800">Transcription Result</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-green-600">
                    Confidence: {Math.round(confidence * 100)}%
                  </span>
                  <span className="text-xs text-green-600">
                    Source: Azure STT
                  </span>
                </div>
              </div>
              <p className="text-green-700">{transcription}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-gray-600 max-w-md">
          <p>Click "Start Recording" to begin speaking. The audio will be processed using Azure Speech-to-Text for high-quality transcription.</p>
        </div>
      </div>
    </div>
  );
}
