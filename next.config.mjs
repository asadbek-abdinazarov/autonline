import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)

// Import getApiBaseUrl from api-config.ts using TypeScript compilation
// This ensures single source of truth for API base URL
let getApiBaseUrl
try {
  // Try to use ts-node if available, otherwise fallback to reading the file
  const tsNode = require('ts-node')
  tsNode.register({ transpileOnly: true, compilerOptions: { module: 'commonjs' } })
  const apiConfig = require('./lib/api-config.ts')
  getApiBaseUrl = apiConfig.getApiBaseUrl
} catch (e) {
  // Fallback: Read and parse the TypeScript file to extract DEFAULT_API_BASE_URL
  const fs = require('fs')
  const apiConfigContent = fs.readFileSync(resolve(__dirname, 'lib/api-config.ts'), 'utf8')
  // Extract DEFAULT_API_BASE_URL value using regex
  const defaultUrlMatch = apiConfigContent.match(/export const DEFAULT_API_BASE_URL = ['"]([^'"]+)['"]/)
  const DEFAULT_API_BASE_URL = defaultUrlMatch ? defaultUrlMatch[1] : 'http://localhost:8080'
  
  // Create a simple getApiBaseUrl function
  getApiBaseUrl = () => {
    const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL
    return (fromEnv && fromEnv.trim().length > 0) ? fromEnv : DEFAULT_API_BASE_URL
  }
}

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
    // Use getApiBaseUrl() from api-config.ts for single source of truth
    const apiBase = getApiBaseUrl()
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
