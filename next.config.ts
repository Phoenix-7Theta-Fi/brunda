import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['next/font', 'uploadthing'],
  experimental: {
    esmExternals: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/f/**',
      }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(md|LICENSE)$/,
      type: 'asset/source'
    });
    config.resolve.extensionAlias = {
      '.cts': ['.cts', '.mts', '.ts', '.tsx']
    };
    return config;
  }
}

export default nextConfig
