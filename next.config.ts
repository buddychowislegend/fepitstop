import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Proxy API requests to the backend to avoid CORS
    const target = process.env.NEXT_PUBLIC_API_URL || "https://fepit.vercel.app/api";
    // Strip trailing slash for safety
    const targetBase = target.replace(/\/$/, "");
    
    return [
      {
        source: "/api/:path*",
        destination: `${targetBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
