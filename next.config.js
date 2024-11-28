/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: 'www.whatruns.com',
      },
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
};

module.exports = nextConfig;
