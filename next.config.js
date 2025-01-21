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
  redirects: async () => [
    {
      source: '/lookup',
      destination: '/',
      permanent: true,
    },
  ],
  experimental: {
    webpackBuildWorker: true,
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
};

module.exports = nextConfig;
