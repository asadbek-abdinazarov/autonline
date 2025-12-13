/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const apiBase = 'https://autonline-backend-production.up.railway.app'
    return [
      {
        source: '/api/backend/:path*',
        destination: `${apiBase.replace(/\/+$/, '')}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
