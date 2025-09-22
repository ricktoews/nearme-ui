// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/upload", destination: "https://nearme.toews-api.com/locate" },
    ];
  },
};

export default nextConfig;
