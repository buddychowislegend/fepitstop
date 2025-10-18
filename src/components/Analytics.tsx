"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/config";
import Script from "next/script";

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
    ctx.fillText('HireOG', 2, 2);
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
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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

  // Google Analytics tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
      // Initialize Google Analytics
      window.gtag = window.gtag || function() {
        (window.gtag.q = window.gtag.q || []).push(arguments);
      };
      
      // Track page views
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname,
        custom_map: {
          'custom_parameter_1': 'device_id',
          'custom_parameter_2': 'time_spent'
        }
      });
    }
  }, [pathname, GA_MEASUREMENT_ID]);

  // Track custom events
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'engagement',
        event_label: pathname,
        value: 1,
        ...parameters
      });
    }
  };

  // Track page-specific events
  useEffect(() => {
    // Track AI interview page
    if (pathname === '/ai-interview') {
      trackEvent('ai_interview_page_view', {
        custom_parameter_1: deviceIdRef.current,
        custom_parameter_2: Date.now()
      });
    }
    
    // Track problems page
    if (pathname === '/problems') {
      trackEvent('problems_page_view', {
        custom_parameter_1: deviceIdRef.current,
        custom_parameter_2: Date.now()
      });
    }
    
    // Track quiz page
    if (pathname === '/quiz') {
      trackEvent('quiz_page_view', {
        custom_parameter_1: deviceIdRef.current,
        custom_parameter_2: Date.now()
      });
    }
    
    // Track resume page
    if (pathname === '/resume') {
      trackEvent('resume_page_view', {
        custom_parameter_1: deviceIdRef.current,
        custom_parameter_2: Date.now()
      });
    }
    
    // Track community page
    if (pathname === '/community') {
      trackEvent('community_page_view', {
        custom_parameter_1: deviceIdRef.current,
        custom_parameter_2: Date.now()
      });
    }
    
    // Track prep plans page
    if (pathname === '/prep-plans') {
      trackEvent('prep_plans_page_view', {
        custom_parameter_1: deviceIdRef.current,
        custom_parameter_2: Date.now()
      });
    }
    
    // Track system design page
    if (pathname === '/system-design') {
      trackEvent('system_design_page_view', {
        custom_parameter_1: deviceIdRef.current,
        custom_parameter_2: Date.now()
      });
    }
    
    // Track profile page
    if (pathname === '/profile') {
      trackEvent('profile_page_view', {
        custom_parameter_1: deviceIdRef.current,
        custom_parameter_2: Date.now()
      });
    }
    
    // Track progress page
    if (pathname === '/progress') {
      trackEvent('progress_page_view', {
        custom_parameter_1: deviceIdRef.current,
        custom_parameter_2: Date.now()
      });
    }
    
    // Track signup page
    if (pathname === '/signup') {
      trackEvent('signup_page_view', {
        custom_parameter_1: deviceIdRef.current,
        custom_parameter_2: Date.now()
      });
    }
    
    // Track signin page
    if (pathname === '/signin') {
      trackEvent('signin_page_view', {
        custom_parameter_1: deviceIdRef.current,
        custom_parameter_2: Date.now()
      });
    }
    
    // Track home page
    if (pathname === '/') {
      trackEvent('home_page_view', {
        custom_parameter_1: deviceIdRef.current,
        custom_parameter_2: Date.now()
      });
    }
  }, [pathname]);

  return (
    <>
      {/* Google Analytics Script */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                custom_map: {
                  'custom_parameter_1': 'device_id',
                  'custom_parameter_2': 'time_spent'
                }
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}
