/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gymstack/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mygymapp.in',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
