import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.paulgeorge.dev",
      },
    ],
  },
}

export default nextConfig
