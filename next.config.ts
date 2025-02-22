import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['next/font'],
  images: {
    remotePatterns: [],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  }
}

export default nextConfig
