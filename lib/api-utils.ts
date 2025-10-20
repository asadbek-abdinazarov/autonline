"use client"

import { logout, setCurrentUser } from "@/lib/auth"

// Global notification function - will be set by the notification provider
let globalShow401Error: ((message?: string) => void) | null = null

export function setGlobalNotificationHandler(show401Error: (message?: string) => void) {
  globalShow401Error = show401Error
}

// Centralized API base URL helpers
export function getApiBaseUrl(): string {
  // Prefer public env for client-side availability
  const fromEnv =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL

  return (fromEnv && fromEnv.trim().length > 0) ? fromEnv : 'http://167.71.28.250:8084'
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl().replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

export async function handleApiError(error: any): Promise<boolean> {
  // Check if it's a 401 error
  if (error?.message?.includes('401') || error?.status === 401) {
    if (globalShow401Error) {
      await globalShow401Error("Sizning sessiyangiz tugagan. Qaytadan kirish kerak.")
    } else {
      // Fallback: direct logout and redirect
      await logout()
      setCurrentUser(null)
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return true // Indicates 401 was handled
  }
  return false // Not a 401 error
}

export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  try {
    // Get access token
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        await handleApiError({ status: 401 })
        return null
      }
      
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }
    
    return response
  } catch (error) {
    const is401Handled = await handleApiError(error)
    if (!is401Handled) {
      throw error
    }
    return null
  }
}
