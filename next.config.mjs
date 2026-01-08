import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL  || 'http://localhost:8080'
    return [
      {
        source: '/api/backend/:path*',
        destination: `${apiBase.replace(/\/+$/, '')}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
