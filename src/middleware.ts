import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allow your deployed frontend and localhost during development
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://frontendpitstop.vercel.app',
]);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // allow same-origin or curl without Origin
  if (allowedOrigins.has(origin)) return true;
  // allow any vercel preview of your frontend if needed
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.vercel.app')) return true;
  } catch {
    // ignore parse errors
  }
  return false;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isPreflight = request.method === 'OPTIONS';

  // Only apply to API routes (also configured via matcher below)
  const response = isPreflight ? new NextResponse(null, { status: 204 }) : NextResponse.next();

  // Basic CORS headers
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Vary', 'Origin');

  if (isAllowedOrigin(origin)) {
    // Reflect the allowed origin or fall back to '*'
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};


