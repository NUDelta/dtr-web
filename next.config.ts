import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  cacheLife: {
    halfDays: {
      stale: 60 * 60 * 6, // 6 hours
      revalidate: 60 * 60 * 12, // 12 hours
      expire: 60 * 60 * 24 * 30, // 30 days
    },
    days: {
      stale: 60 * 60 * 12, // 12 hours
      revalidate: 60 * 60 * 24, // 1 day
      expire: 60 * 60 * 24 * 60, // 30 days
    },
  },
  reactStrictMode: true,
  images: {
    localPatterns: [
      {
        pathname: '/images/**',
        search: '',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'delta-lab.nyc3.cdn.digitaloceanspaces.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'dl.airtable.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'v5.airtableusercontent.com',
        pathname: '**',
      },
    ],
    unoptimized: true,
  },
}

export default nextConfig
