import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ["src"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "delta-lab.nyc3.cdn.digitaloceanspaces.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "dl.airtable.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "v5.airtableusercontent.com",
        pathname: "**",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
