/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/runtime/:path*',
        destination: 'http://localhost:8080/api/runtime/:path*',
      },
      {
        source: '/api/health/:path*',
        destination: 'http://localhost:8080/api/health/:path*',
      },
    ]
  },
}

module.exports = nextConfig