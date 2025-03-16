/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.redd.it',
      },
      {
        protocol: 'https',
        hostname: 'preview.redd.it',
      },
      {
        protocol: 'https',
        hostname: 'v.redd.it',
      },
      {
        protocol: 'https',
        hostname: 'https://picsum.photos'
      }
    ],
    unoptimized: true, // This will prevent optimization issues with GIFs
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    scrollRestoration: true,
  },
};

module.exports = nextConfig; 