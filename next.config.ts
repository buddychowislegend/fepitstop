import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // In development, proxy API requests to the deployed backend to avoid CORS
    if (process.env.NODE_ENV === "development") {
      const target = process.env.NEXT_PUBLIC_API_URL || "https://fepit.vercel.app/api";
      // Strip trailing slash for safety
      const targetBase = target.replace(/\/$/, "");
      return [
        {
          source: "/api/:path*",
          destination: `${targetBase}/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
