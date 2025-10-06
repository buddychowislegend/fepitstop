// Use relative '/api' during development to leverage Next.js rewrites (avoids CORS)
const DEFAULT_API =
  process.env.NODE_ENV === "development" ? "/api" : "https://fepit.vercel.app/api";

export const API_URL: string = (
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API
).replace(/\/$/, "");

export const api = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};


