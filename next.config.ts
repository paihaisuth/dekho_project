import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cbmfb0pdjno2q4t2.public.blob.vercel-storage.com",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
