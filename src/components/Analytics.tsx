"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/config";

export default function Analytics() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string>("");
  const pageLoadTimeRef = useRef<number>(0);
  const lastPathRef = useRef<string>("");

  // Generate or retrieve session ID
  useEffect(() => {
    let sessionId = sessionStorage.getItem('fp_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('fp_session_id', sessionId);
    }
    sessionIdRef.current = sessionId;
  }, []);

  // Track page views and time spent
  useEffect(() => {
    if (!pathname || !sessionIdRef.current) return;

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
            sessionId: sessionIdRef.current,
            timeSpent: 0,
            referrer: document.referrer || null,
            userAgent: navigator.userAgent
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
          sessionId: sessionIdRef.current,
          timeSpent,
          referrer: document.referrer || null,
          userAgent: navigator.userAgent
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
              sessionId: sessionIdRef.current,
              timeSpent,
              referrer: document.referrer || null,
              userAgent: navigator.userAgent
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
