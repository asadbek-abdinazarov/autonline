/**
 * Centralized API Configuration
 * 
 * Base API URL ni bitta joydan boshqarish uchun.
 * 
 * O'zgartirish uchun:
 * 1. Quyidagi DEFAULT_API_BASE_URL ni o'zgartiring
 * 2. Yoki .env.local faylida NEXT_PUBLIC_API_BASE_URL ni o'rnating
 */

// Bitta joydan boshqarish uchun - faqat shu yerda o'zgartiring
export const DEFAULT_API_BASE_URL = 'https://autonline-backend-production.up.railway.app'
//http://localhost:8080
//https://autonline-backend-production.up.railway.app
//https://api.backend.autonline.uz
/**
 * Get API base URL from environment variable or use default
 * Environment variable ustunlik qiladi
 */
export function getApiBaseUrl(): string {
  // Prefer public env for client-side availability
  const fromEnv =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL

  // Use environment variable if set, otherwise use default
  return (fromEnv && fromEnv.trim().length > 0) 
    ? fromEnv 
    : DEFAULT_API_BASE_URL
}
