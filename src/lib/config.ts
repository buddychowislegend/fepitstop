export const API_URL: string = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://fepit.vercel.app/api"
).replace(/\/$/, "");

export const api = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};


