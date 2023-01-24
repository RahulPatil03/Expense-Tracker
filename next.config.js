/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'rp-expense-tracker.s3.ap-south-1.amazonaws.com',
      }
    ],
  },
}

module.exports = nextConfig
