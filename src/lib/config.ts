// Use relative '/api' to leverage Next.js rewrites (avoids CORS)
// Next.js will proxy /api/* to the backend URL defined in next.config.ts
const DEFAULT_API = "/api";

export const API_URL: string = (
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API
).replace(/\/$/, "");

export const api = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};


