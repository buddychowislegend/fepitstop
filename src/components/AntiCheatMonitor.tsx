"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, Eye, EyeOff, Smartphone, Copy, Minimize2 } from 'lucide-react';

export interface CheatingIncident {
  type: 'tab_switch' | 'multiple_people' | 'phone_detected' | 'copy_paste' | 'window_blur' | 'video_interrupted' | 'audio_anomaly' | 'multiple_windows';
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  description: string;
  metadata?: Record<string, any>;
}

interface AntiCheatMonitorProps {
  isInterviewActive: boolean;
  onIncident: (incident: CheatingIncident) => void;
  onWarning?: (message: string) => void;
  onViolation?: (message: string) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  streamRef: React.RefObject<MediaStream | null>;
}

export default function AntiCheatMonitor({
  isInterviewActive,
  onIncident,
  onWarning,
  onViolation,
  videoRef,
  streamRef
}: AntiCheatMonitorProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [incidents, setIncidents] = useState<CheatingIncident[]>([]);
  
  const tabSwitchTimeRef = useRef<number[]>([]);
  const lastVisibilityChangeRef = useRef<number>(Date.now());
  const faceDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioAnalysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keyboardMonitorRef = useRef<boolean>(false);
  const mouseActivityRef = useRef<boolean>(false);
  const lastMouseMoveRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clipboardMonitorRef = useRef<boolean>(false);
  const windowFocusRef = useRef<boolean>(true);
  
  // Tab visibility detection
  useEffect(() => {
    if (!isInterviewActive) return;

    const handleVisibilityChange = () => {
      const now = Date.now();
      const timeSinceLastChange = now - lastVisibilityChangeRef.current;
      
      // Prevent duplicate events
      if (timeSinceLastChange < 100) return;
      
      lastVisibilityChangeRef.current = now;
      
      if (document.hidden) {
        setIsVisible(false);
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        tabSwitchTimeRef.current.push(now);
        
        // Keep only last 10 switches
        if (tabSwitchTimeRef.current.length > 10) {
          tabSwitchTimeRef.current.shift();
        }
        
        const incident: CheatingIncident = {
          type: 'tab_switch',
          timestamp: new Date(),
          severity: newCount >= 3 ? 'high' : newCount >= 2 ? 'medium' : 'low',
          description: `Tab switched or minimized (${newCount} time${newCount > 1 ? 's' : ''})`,
          metadata: {
            count: newCount,
            switchTimes: [...tabSwitchTimeRef.current]
          }
        };
        
        setIncidents(prev => [...prev, incident]);
        onIncident(incident);
        
        // Show warning after 2 switches
        if (newCount >= 2) {
          const warningMessage = `⚠️ Warning: Tab switch detected ${newCount} times. Multiple switches may result in interview disqualification.`;
          onWarning?.(warningMessage);
        }
        
        // Severe violation after 5 switches
        if (newCount >= 5) {
          const violationMessage = `🚫 Multiple tab switches detected (${newCount}). Interview may be flagged for review.`;
          onViolation?.(violationMessage);
        }
      } else {
        setIsVisible(true);
        // Detect rapid switching (potential cheating)
        const recentSwitches = tabSwitchTimeRef.current.filter(time => now - time < 5000);
        if (recentSwitches.length >= 3) {
          const rapidSwitchIncident: CheatingIncident = {
            type: 'tab_switch',
            timestamp: new Date(),
            severity: 'high',
            description: `Rapid tab switching detected (${recentSwitches.length} switches in 5 seconds)`,
            metadata: { rapidSwitches: recentSwitches.length }
          };
          onIncident(rapidSwitchIncident);
          onViolation?.('🚫 Rapid tab switching detected. This behavior may result in interview disqualification.');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInterviewActive, tabSwitchCount, onIncident, onWarning, onViolation]);

  // Window blur/focus detection (different from tab switch)
  useEffect(() => {
    if (!isInterviewActive) return;

    const handleBlur = () => {
      windowFocusRef.current = false;
      const incident: CheatingIncident = {
        type: 'window_blur',
        timestamp: new Date(),
        severity: 'medium',
        description: 'Browser window lost focus',
        metadata: { windowFocus: false }
      };
      onIncident(incident);
    };

    const handleFocus = () => {
      windowFocusRef.current = true;
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isInterviewActive, onIncident]);

  // Copy-paste detection
  useEffect(() => {
    if (!isInterviewActive) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      clipboardMonitorRef.current = true;
      
      const incident: CheatingIncident = {
        type: 'copy_paste',
        timestamp: new Date(),
        severity: 'high',
        description: 'Copy operation detected',
        metadata: { operation: 'copy' }
      };
      
      setIncidents(prev => [...prev, incident]);
      onIncident(incident);
      onViolation?.('🚫 Copy operation detected. Copying during interview is not allowed.');
      
      // Show clipboard is disabled
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', '');
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      
      const incident: CheatingIncident = {
        type: 'copy_paste',
        timestamp: new Date(),
        severity: 'high',
        description: 'Paste operation detected',
        metadata: { operation: 'paste' }
      };
      
      setIncidents(prev => [...prev, incident]);
      onIncident(incident);
      onViolation?.('🚫 Paste operation detected. Pasting during interview is not allowed.');
    };

    // Prevent keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+A)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+X
      if (e.ctrlKey || e.metaKey) {
        if (['c', 'v', 'a', 'x'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          const operation = e.key.toLowerCase() === 'c' ? 'copy' : 
                           e.key.toLowerCase() === 'v' ? 'paste' :
                           e.key.toLowerCase() === 'a' ? 'select_all' : 'cut';
          
          const incident: CheatingIncident = {
            type: 'copy_paste',
            timestamp: new Date(),
            severity: 'high',
            description: `${operation.replace('_', ' ')} keyboard shortcut detected`,
            metadata: { operation, key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey }
          };
          
          onIncident(incident);
          onViolation?.(`🚫 ${operation.replace('_', ' ')} shortcut detected and blocked.`);
        }
      }
      
      // Detect F12 (Developer Tools)
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        const incident: CheatingIncident = {
          type: 'multiple_windows',
          timestamp: new Date(),
          severity: 'high',
          description: 'Developer tools access attempt detected',
          metadata: { action: 'devtools' }
        };
        onIncident(incident);
        onViolation?.('🚫 Developer tools access is not allowed during interview.');
      }
      
      // Detect Print Screen
      if (e.key === 'PrintScreen') {
        const incident: CheatingIncident = {
          type: 'copy_paste',
          timestamp: new Date(),
          severity: 'medium',
          description: 'Print Screen detected',
          metadata: { operation: 'screenshot' }
        };
        onIncident(incident);
        onWarning?.('⚠️ Screenshot attempt detected.');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      // Right-click is allowed but context menu is blocked
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isInterviewActive, onIncident, onWarning, onViolation]);

  // Mouse and keyboard activity monitoring
  useEffect(() => {
    if (!isInterviewActive) return;

    const handleMouseMove = () => {
      mouseActivityRef.current = true;
      lastMouseMoveRef.current = Date.now();
    };

    const handleKeyPress = () => {
      keyboardMonitorRef.current = true;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyPress);

    // Monitor for prolonged inactivity (suspicious)
    inactivityTimerRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastMouseMoveRef.current;
      // If no activity for 2 minutes and interview is active, flag it
      if (timeSinceLastActivity > 120000 && isInterviewActive) {
        const incident: CheatingIncident = {
          type: 'window_blur',
          timestamp: new Date(),
          severity: 'medium',
          description: 'Prolonged inactivity detected (no mouse/keyboard activity for 2+ minutes)',
          metadata: { inactivityDuration: timeSinceLastActivity }
        };
        onIncident(incident);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyPress);
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, [isInterviewActive, onIncident]);

  // Device orientation change detection (phone usage indicator)
  useEffect(() => {
    if (!isInterviewActive) return;

    let lastOrientation = window.orientation || 0;
    let orientationChangeCount = 0;

    const handleOrientationChange = () => {
      const currentOrientation = window.orientation || 0;
      const change = Math.abs(currentOrientation - lastOrientation);
      
      // Significant orientation change (likely phone movement)
      if (change > 45 && change < 315) {
        orientationChangeCount++;
        
        if (orientationChangeCount >= 2) {
          const incident: CheatingIncident = {
            type: 'phone_detected',
            timestamp: new Date(),
            severity: 'medium',
            description: 'Device orientation changes detected (possible phone usage)',
            metadata: {
              changeCount: orientationChangeCount,
              currentOrientation,
              lastOrientation
            }
          };
          
          setIncidents(prev => [...prev, incident]);
          onIncident(incident);
          onWarning?.('⚠️ Device orientation changes detected. Please keep your device stable during the interview.');
        }
      }
      
      lastOrientation = currentOrientation;
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isInterviewActive, onIncident, onWarning]);

  // Multiple people detection using video analysis
  useEffect(() => {
    if (!isInterviewActive || !videoRef.current || !streamRef.current) return;

    const detectMultiplePeople = async () => {
      const video = videoRef.current;
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Simple face detection heuristic: analyze face-like regions
        // This is a basic implementation - for production, use ML models like face-api.js or MediaPipe
        const faceCount = await simpleFaceDetection(imageData);
        
        if (faceCount > 1) {
          const incident: CheatingIncident = {
            type: 'multiple_people',
            timestamp: new Date(),
            severity: 'high',
            description: `Multiple faces detected in video feed (detected: ${faceCount})`,
            metadata: { detectedFaceCount: faceCount }
          };
          
          setIncidents(prev => {
            // Only add if not already reported in last 5 seconds
            const recent = prev.filter(i => 
              i.type === 'multiple_people' && 
              Date.now() - i.timestamp.getTime() < 5000
            );
            if (recent.length === 0) {
              onIncident(incident);
              onViolation?.('🚫 Multiple people detected in video feed. Only one person is allowed during the interview.');
              return [...prev, incident];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Error in face detection:', error);
      }
    };

    // Run face detection every 3 seconds
    faceDetectionIntervalRef.current = setInterval(detectMultiplePeople, 3000);

    return () => {
      if (faceDetectionIntervalRef.current) {
        clearInterval(faceDetectionIntervalRef.current);
      }
    };
  }, [isInterviewActive, videoRef, streamRef, onIncident, onViolation]);

  // Simple face detection heuristic (basic implementation)
  // For production, integrate with face-api.js, MediaPipe, or similar ML library
  const simpleFaceDetection = async (imageData: ImageData): Promise<number> => {
    // This is a placeholder - implement actual face detection
    // For now, return 1 (assuming one person)
    // In production, use:
    // - face-api.js: https://github.com/justadudewhohacks/face-api.js
    // - MediaPipe Face Detection: https://mediapipe.dev/
    // - TensorFlow.js Face Detection
    
    // Basic heuristic: look for skin-tone regions and count clusters
    const data = imageData.data;
    let skinTonePixels = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Simple skin tone detection (RGB ranges)
      if (r > 95 && g > 40 && b > 20 && 
          Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
          Math.abs(r - g) > 15 && r > g && r > b) {
        skinTonePixels++;
      }
    }
    
    // Very basic: if skin tone pixels exceed threshold, assume face present
    // This is not accurate - use proper ML model in production
    const threshold = imageData.width * imageData.height * 0.05; // 5% of image
    return skinTonePixels > threshold ? 1 : 0;
  };

  // Audio anomaly detection (multiple voices, background noise)
  useEffect(() => {
    if (!isInterviewActive || !streamRef.current) return;

    const analyzeAudio = () => {
      try {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(streamRef.current!);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        // Detect unusual audio patterns
        const maxFreq = Math.max(...Array.from(dataArray));
        const avgFreq = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        // High variation might indicate multiple sources
        if (maxFreq > avgFreq * 3 && maxFreq > 150) {
          const incident: CheatingIncident = {
            type: 'audio_anomaly',
            timestamp: new Date(),
            severity: 'medium',
            description: 'Unusual audio pattern detected (possible multiple voices or background noise)',
            metadata: { maxFreq, avgFreq }
          };
          
          setIncidents(prev => {
            const recent = prev.filter(i => 
              i.type === 'audio_anomaly' && 
              Date.now() - i.timestamp.getTime() < 10000
            );
            if (recent.length === 0) {
              onIncident(incident);
              return [...prev, incident];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Error analyzing audio:', error);
      }
    };

    audioAnalysisIntervalRef.current = setInterval(analyzeAudio, 5000);

    return () => {
      if (audioAnalysisIntervalRef.current) {
        clearInterval(audioAnalysisIntervalRef.current);
      }
    };
  }, [isInterviewActive, streamRef, onIncident]);

  // Video stream interruption detection
  useEffect(() => {
    if (!isInterviewActive || !streamRef.current) return;

    const checkVideoStream = () => {
      const video = videoRef.current;
      if (!video) return;

      const tracks = streamRef.current?.getVideoTracks();
      if (!tracks || tracks.length === 0) {
        const incident: CheatingIncident = {
          type: 'video_interrupted',
          timestamp: new Date(),
          severity: 'high',
          description: 'Video stream interrupted or camera disabled',
          metadata: { hasVideoTracks: false }
        };
        onIncident(incident);
        onWarning?.('⚠️ Video stream interrupted. Please ensure your camera is enabled.');
      } else {
        const track = tracks[0];
        if (track.readyState === 'ended' || track.muted) {
          const incident: CheatingIncident = {
            type: 'video_interrupted',
            timestamp: new Date(),
            severity: 'medium',
            description: 'Video track ended or muted',
            metadata: { readyState: track.readyState, muted: track.muted }
          };
          onIncident(incident);
        }
      }
    };

    const videoCheckInterval = setInterval(checkVideoStream, 5000);

    return () => {
      clearInterval(videoCheckInterval);
    };
  }, [isInterviewActive, videoRef, streamRef, onIncident, onWarning]);

  return null; // This component doesn't render UI, it only monitors
}

