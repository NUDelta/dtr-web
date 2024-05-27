/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
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
  },
};
