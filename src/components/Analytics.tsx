"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/config";

// Generate device fingerprint for unique user tracking
function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Combine multiple device characteristics
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.platform,
  ];
  
  // Canvas fingerprinting
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('FrontendPitstop', 2, 2);
    components.push(canvas.toDataURL());
  }
  
  // Create hash from components
  const fingerprint = components.join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `device_${Math.abs(hash).toString(36)}`;
}

export default function Analytics() {
  const pathname = usePathname();
  const deviceIdRef = useRef<string>("");
  const pageLoadTimeRef = useRef<number>(0);
  const lastPathRef = useRef<string>("");

  // Generate or retrieve device ID (persistent across sessions)
  useEffect(() => {
    let deviceId = localStorage.getItem('fp_device_id');
    if (!deviceId) {
      deviceId = generateDeviceFingerprint();
      localStorage.setItem('fp_device_id', deviceId);
    }
    deviceIdRef.current = deviceId;
  }, []);

  // Track page views and time spent
  useEffect(() => {
    if (!pathname || !deviceIdRef.current) return;

    // Record page load time
    pageLoadTimeRef.current = Date.now();

    // Track page view
    const trackPageView = async () => {
      try {
        await fetch(api('/analytics/track'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            deviceId: deviceIdRef.current,
            timeSpent: 0,
            referrer: document.referrer || null,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }),
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackPageView();
    lastPathRef.current = pathname;

    // Track time spent when leaving page
    const handleBeforeUnload = () => {
      if (pageLoadTimeRef.current > 0) {
        const timeSpent = Math.floor((Date.now() - pageLoadTimeRef.current) / 1000);
        
        // Use sendBeacon for reliable tracking on page unload
        const data = JSON.stringify({
          path: pathname,
          deviceId: deviceIdRef.current,
          timeSpent,
          referrer: document.referrer || null,
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        
        navigator.sendBeacon(api('/analytics/track'), data);
      }
    };

    // Track time spent when navigating to another page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && pageLoadTimeRef.current > 0) {
        const timeSpent = Math.floor((Date.now() - pageLoadTimeRef.current) / 1000);
        
        if (timeSpent > 0) {
          fetch(api('/analytics/track'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              path: pathname,
              deviceId: deviceIdRef.current,
              timeSpent,
              referrer: document.referrer || null,
              userAgent: navigator.userAgent,
              screenResolution: `${screen.width}x${screen.height}`,
              language: navigator.language,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }),
          }).catch(() => {});
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);

  // This component doesn't render anything
  return null;
}
