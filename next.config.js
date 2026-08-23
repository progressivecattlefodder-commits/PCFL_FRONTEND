/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      // Allows all HTTPS external images (Unsplash, Cloudinary, S3, production backend)
      {
        protocol: 'https',
        hostname: '**',
      },
      // Allows local backend development images over HTTP
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080', // Adjust port if your backend runs on a different port (e.g. 5000)
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8080',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;