import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.cdn.paulgeorge.dev",
      },
    ],
  },
}

export default nextConfig
