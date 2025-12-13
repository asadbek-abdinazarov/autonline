"use client"

import { logout, setCurrentUser } from "@/lib/auth"

// Global notification function - will be set by the notification provider
let globalShow401Error: ((message?: string) => void) | null = null
let globalShow429Error: ((message?: string) => void) | null = null
let globalSetServerError: ((error: boolean) => void) | null = null
let globalShowError: ((message: string) => void) | null = null

export function setGlobalNotificationHandler(show401Error: (message?: string) => void) {
  globalShow401Error = show401Error
}

export function setGlobal429ErrorHandler(show429Error: (message?: string) => void) {
  globalShow429Error = show429Error
}

export function setGlobalServerErrorHandler(setServerError: (error: boolean) => void) {
  globalSetServerError = setServerError
}

export function setGlobalErrorHandler(showError: (message: string) => void) {
  globalShowError = showError
}

// Centralized API base URL helpers
export function getApiBaseUrl(): string {
  // Prefer public env for client-side availability
  const fromEnv =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL

  // Default to production API if no env var is set (for Railway deployment)
  return (fromEnv && fromEnv.trim().length > 0) 
    ? fromEnv 
    : 'https://autonline-backend-production.up.railway.app'
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl().replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

// Get current language from localStorage
export function getCurrentLanguage(): string {
  if (typeof window === 'undefined') {
    return 'uz' // Default language for server-side
  }
  const savedLanguage = localStorage.getItem('language')
  // Map language codes to API format (uz, oz, ru)
  // Handle 'en' or any unknown language as 'uz'
  const languageMap: Record<string, string> = {
    'uz': 'uz',
    'cyr': 'oz',
    'ru': 'ru',
    'en': 'uz', // Default English to Uzbek
  }
  return languageMap[savedLanguage as keyof typeof languageMap] || 'uz'
}

// Get default headers including Accept-Language
export function getDefaultHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': getCurrentLanguage(),
    ...(additionalHeaders || {}),
  }
  return headers
}

/**
 * Safely parse JSON from a Response object
 * Handles empty responses, invalid JSON, and network errors
 */
export async function safeJsonParse<T>(response: Response | null): Promise<T | null> {
  if (!response) {
    return null
  }

  try {
    // Check if response has content
    const contentType = response.headers.get('content-type')
    const text = await response.text()
    
    // If response is empty, return null
    if (!text || text.trim().length === 0) {
      return null
    }
    
    // Check if content-type indicates JSON
    if (contentType && !contentType.includes('application/json')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Response is not JSON, content-type:', contentType)
      }
      return null
    }
    
    // Try to parse JSON
    try {
      return JSON.parse(text) as T
    } catch (parseError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to parse JSON response:', parseError)
        console.error('Response text:', text.substring(0, 200)) // Log first 200 chars
      }
      return null
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reading response:', error)
    }
    return null
  }
}

// Check if error is a network/server error
function isNetworkError(error: any): boolean {
  if (!error) return false
  
  // Network errors (fetch failed, connection refused, etc.)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }
  
  // Connection errors
  if (error?.message?.includes('Failed to fetch') || 
      error?.message?.includes('NetworkError') ||
      error?.message?.includes('Network request failed') ||
      error?.message?.includes('ERR_INTERNET_DISCONNECTED') ||
      error?.message?.includes('ERR_NETWORK_CHANGED') ||
      error?.message?.includes('ERR_CONNECTION_REFUSED') ||
      error?.message?.includes('ERR_CONNECTION_RESET') ||
      error?.message?.includes('ERR_CONNECTION_CLOSED') ||
      error?.message?.includes('ERR_CONNECTION_ABORTED') ||
      error?.message?.includes('ERR_CONNECTION_TIMED_OUT')) {
    return true
  }
  
  // 500-599 server errors
  if (error?.status >= 500 && error?.status < 600) {
    return true
  }
  
  // 502, 503, 504 specific errors
  if (error?.status === 502 || error?.status === 503 || error?.status === 504) {
    return true
  }
  
  return false
}

export async function handleApiError(error: any): Promise<boolean> {
  // Check if it's a network/server error first
  if (isNetworkError(error)) {
    if (globalSetServerError) {
      globalSetServerError(true)
    }
    return true // Indicates server error was handled
  }
  
  // Check if it's a 401 error
  if (error?.message?.includes('401') || error?.status === 401) {
    if (globalShow401Error) {
      // Use error.message if available, otherwise use default message
      const messageToShow = error.message && typeof error.message === 'string' && !error.message.includes('401') 
        ? error.message 
        : "Sizning sessiyangiz tugagan. Tizimga qaytadan kirish kerak."
      await globalShow401Error(messageToShow)
    } else {
      // Fallback: check refresh token status
      // Only call backend logout if refresh token is missing (expired/cleared)
      const { getRefreshToken } = await import('./auth')
      const refreshToken = getRefreshToken()
      const shouldCallBackend = !refreshToken
      
      const messageToShow = error.message && typeof error.message === 'string' && !error.message.includes('401')
        ? error.message
        : "Sizning sessiyangiz tugagan. Tizimga qaytadan kirish kerak."
      
      await logout(shouldCallBackend)
      setCurrentUser(null)
      if (typeof window !== 'undefined') {
        // Show alert as fallback
        alert(messageToShow)
        window.location.href = '/login'
      }
    }
    return true // Indicates 401 was handled
  }
  // Check if it's a 429 error
  if (error?.message?.includes('429') || error?.status === 429) {
    const errorMessage = "Juda ko'p so'rovlar yuborildi. Iltimos, biroz kutib turing."
    if (globalShow429Error) {
      await globalShow429Error(errorMessage)
    } else {
      if (typeof window !== 'undefined') {
        // Try to show alert as fallback
        alert(errorMessage)
      }
    }
    return true // Indicates 429 was handled
  }
  return false // Not a handled error
}

export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  try {
    // Get access token
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    
    const headers: Record<string, string> = {
      ...getDefaultHeaders(),
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
      // Check for server errors (500-599)
      if (response.status >= 500 && response.status < 600) {
        await handleApiError({ status: response.status })
        return null
      }
      
      if (response.status === 401) {
        // Try to refresh token before showing error (UNAUTHORIZED)
        // Parse error response to check if it's token expired
        let isTokenExpired = false
        let errorData: { message?: string; error?: string; code?: string } | null = null
        try {
          const clonedResponse = response.clone()
          errorData = await safeJsonParse<{ message?: string; error?: string; code?: string }>(clonedResponse)
          
          if (errorData) {
            // Check if code is TOKEN_EXPIRED
            if (errorData.code === 'TOKEN_EXPIRED') {
              isTokenExpired = true
            } else {
              // Fallback to checking error message
              const errorMessage = (errorData.message || errorData.error || '').toLowerCase()
              // Check if error indicates token expiration
              isTokenExpired = errorMessage.includes('token') && (
                errorMessage.includes('expired') || 
                errorMessage.includes('invalid') || 
                errorMessage.includes('unauthorized')
              )
            }
          } else {
            // If no error message, assume token expired for 401
            isTokenExpired = true
          }
        } catch (parseError) {
          // If parsing fails, assume token expired for 401
          isTokenExpired = true
        }
        
        const { refreshAccessToken, getRefreshToken } = await import('./auth')
        
        // Check if refresh token exists before attempting refresh
        const refreshToken = getRefreshToken()
        
        if (refreshToken && isTokenExpired) {
          try {
            const refreshResult = await refreshAccessToken()
            
            // Check if refresh result is an error object (refresh token expired)
            if (refreshResult && typeof refreshResult === 'object' && 'isRefreshTokenExpired' in refreshResult) {
              const errorObj = refreshResult as any
              
              // Refresh token is expired - call logout with shouldCallBackend=true
              await logout(true) // Refresh token expired, call backend logout API
              setCurrentUser(null)
              await handleApiError({ status: 401, message: errorObj.backendMessage })
              return null
            }
            
            if (refreshResult && typeof refreshResult === 'string') {
              const newToken = refreshResult
              // Retry the request with new token
              headers['Authorization'] = `Bearer ${newToken}`
              const retryResponse = await fetch(url, {
                ...options,
                headers,
              })
              
              if (retryResponse.ok) {
                // Successfully retried with new token, don't redirect to login
                return retryResponse
              }
              
              // If retry still fails, return the error response without redirecting
              // The error should be handled by the calling code, not by redirecting to login
              // since refresh token was successful
              return retryResponse
            } else {
              // Refresh returned null - this could be network error or other issue
              // Don't logout, just return null - refresh token might still be valid
              // Don't throw error, just return null - let calling code handle it
              return null
            }
          } catch (refreshError) {
            // Other errors (network, etc.) - don't logout, return null
            // Don't throw, return null to let calling code handle
            return null
          }
        } else {
          // No refresh token available - call logout with shouldCallBackend=true
          await logout(true) // Refresh token missing, call backend logout API
          setCurrentUser(null)
          await handleApiError({ status: 401 })
          return null
        }
      }
      
      if (response.status === 429) {
        await handleApiError({ status: 429 })
        return null
      }
      
      // Try to parse error response to get message field
      let errorMessage: string | null = null
      const clonedResponse = response.clone()
      
      // Try to parse error response as JSON
      const errorData = await safeJsonParse<{ message?: string; error?: string }>(clonedResponse)
      if (errorData) {
        errorMessage = errorData.message || errorData.error || null
      }
      
      // If message field exists and is not empty, show it in notification
      if (errorMessage && errorMessage.trim() && globalShowError) {
        globalShowError(errorMessage)
        return null
      }
      
      // Fallback to text response if no message field
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }
    
    return response
  } catch (error) {
    // Don't handle 401 errors in catch block if we already tried refresh token
    // The 401 error should be handled in the if block above
    if (error instanceof Error && error.message.includes('401')) {
      // Already handled above, don't show error again
      return null
    }
    
    const isHandled = await handleApiError(error)
    if (!isHandled) {
      throw error
    }
    return null
  }
}
