import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)

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
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'https://autonline-backend-production.up.railway.app'
    return [
      {
        source: '/api/backend/:path*',
        destination: `${apiBase.replace(/\/+$/, '')}/api/v1/:path*`,
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side uchun Node.js modullarini fallback qilish
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'supports-color': false,
      }
      
      // debug paketining browser versiyasini ishlatish
      try {
        const debugBrowserPath = require.resolve('debug/src/browser.js')
        config.resolve.alias = {
          ...config.resolve.alias,
          'debug': debugBrowserPath,
        }
      } catch (e) {
        // Agar topilmasa, oddiy path ishlatish
        config.resolve.alias = {
          ...config.resolve.alias,
          'debug': resolve(__dirname, 'node_modules/debug/src/browser.js'),
        }
      }
    }
    return config
  },
}

export default nextConfig
