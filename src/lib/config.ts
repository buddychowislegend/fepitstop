// API Configuration
// In production, use the full backend URL (https://fepit.vercel.app/api)
// In development, use relative path for Next.js rewrites or localhost
export const getApiBaseUrl = (): string => {
  // If explicitly set via environment variable, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  
  // Client-side: check if we're on production domain
  if (typeof window !== 'undefined') {
    const isProduction = window.location.hostname !== 'localhost' && 
                         window.location.hostname !== '127.0.0.1' &&
                         !window.location.hostname.includes('localhost');
    
    if (isProduction) {
      return 'https://fepit.vercel.app/api';
    }
  }
  
  // Server-side: check NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    return 'https://fepit.vercel.app/api';
  }
  
  // Default: use relative path (works with Next.js rewrites or localhost)
  return "/api";
};

// For backward compatibility
export const API_URL: string = getApiBaseUrl();

export const api = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${cleanPath}`;
};


