/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/trpc/:path*',
        destination: 'http://localhost:8000/trpc/:path*',
      },
    ];
  },
};

export default nextConfig;
