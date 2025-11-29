"use client"

import { useCallback } from "react"
import { useNotification } from "@/components/notification-provider"
import { useTranslation } from "@/hooks/use-translation"

export function useApi() {
  const { show401Error, show429Error } = useNotification()
  const { language } = useTranslation()

  const handleApiError = useCallback(async (error: any) => {
    // Check if it's a 401 error
    if (error?.message?.includes('401') || error?.status === 401) {
      await show401Error("Sizning sessiyangiz tugagan. Tizimga qaytadan kirish kerak.")
      return true // Indicates 401 was handled
    }
    // Check if it's a 429 error
    if (error?.message?.includes('429') || error?.status === 429) {
      await show429Error("Juda ko'p so'rovlar yuborildi. Iltimos, biroz kutib turing.")
      return true // Indicates 429 was handled
    }
    return false // Not a 401 or 429 error
  }, [show401Error, show429Error])

  const makeAuthenticatedRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      // Get access token
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      
      // Map frontend language to API language format
      // uz (lotin) -> uz, cyr (kiril) -> oz, ru -> ru
      // Handle 'en' or any unknown language as 'uz'
      let apiLanguage = 'uz' // Default to uz
      if (language === 'cyr') {
        apiLanguage = 'oz'
      } else if (language === 'ru') {
        apiLanguage = 'ru'
      } else if (language === 'uz') {
        apiLanguage = 'uz'
      }
      // For 'en' or any other value, default to 'uz'
      
      // Create headers with correct language - don't use getDefaultHeaders to avoid 'en' issue
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept-Language': apiLanguage, // Use current language from hook
        ...(options.headers as Record<string, string>),
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(url, {
        ...options,
        headers,
      })
      
      if (!response.ok) {
        // Try to refresh token if 401 error (UNAUTHORIZED)
        if (response.status === 401) {
          // Parse error response to check if it's token expired
          let isTokenExpired = false
          let errorData: { message?: string; error?: string; code?: string } | null = null
          try {
            const clonedResponse = response.clone()
            const { safeJsonParse } = await import('@/lib/api-utils')
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
          
          const { refreshAccessToken, getRefreshToken } = await import('@/lib/auth')
          
          // Check if refresh token exists before attempting refresh
          const refreshToken = getRefreshToken()
          console.log('🟡 [401 ERROR]', {
            isTokenExpired,
            hasRefreshToken: !!refreshToken,
            errorCode: errorData?.code,
            errorMessage: errorData?.message
          })
          
          if (refreshToken && isTokenExpired) {
            console.log('🟡 [401 ERROR] Attempting to refresh token...')
            try {
              const refreshResult = await refreshAccessToken()
              
              // Check if refresh result is an error object (refresh token expired)
              if (refreshResult && typeof refreshResult === 'object' && 'isRefreshTokenExpired' in refreshResult) {
                const errorObj = refreshResult as any
                console.log('🔴 [REFRESH TOKEN EXPIRED] Calling logout')
                
                // Refresh token is expired - call logout with shouldCallBackend=true
                const { logout, setCurrentUser } = await import('@/lib/auth')
                await logout(true) // Refresh token expired, call backend logout API
                setCurrentUser(null)
                await show401Error(errorObj.backendMessage || "Sizning sessiyangiz tugagan. Tizimga qaytadan kirish kerak.")
                return null
              }
              
              if (refreshResult && typeof refreshResult === 'string') {
                const newToken = refreshResult
                console.log('🟢 [REFRESH SUCCESS] Retrying request with new token')
                // Retry the request with new token
                headers['Authorization'] = `Bearer ${newToken}`
                const retryResponse = await fetch(url, {
                  ...options,
                  headers,
                })
                
                if (retryResponse.ok) {
                  console.log('🟢 [RETRY SUCCESS] Request succeeded after refresh')
                  // Successfully retried with new token, don't redirect to login
                  return retryResponse
                }
                
                console.log('🟡 [RETRY FAILED] Request failed even after refresh:', retryResponse.status)
                // If retry still fails, return the error response without redirecting
                // The error should be handled by the calling code, not by redirecting to login
                // since refresh token was successful
                return retryResponse
              } else {
                // Refresh returned null - this could be network error or other issue
                // Don't logout, just return error - refresh token might still be valid
                // Let the user retry or handle the error appropriately
                console.log('🟡 [REFRESH NULL] Refresh returned null, but NOT logging out (refresh token might still be valid)')
                // Don't throw error, just return null - let calling code handle it
                return null
              }
            } catch (refreshError) {
              // Other errors (network, etc.) - don't logout, just show error
              console.log('🟡 [REFRESH ERROR] Network or other error, NOT logging out:', refreshError)
              // Don't throw, return null to let calling code handle
              return null
            }
          } else {
            if (!refreshToken) {
              console.log('🔴 [NO REFRESH TOKEN] Calling logout')
            } else {
              console.log('🟡 [NOT TOKEN EXPIRED] Error code is not TOKEN_EXPIRED, calling logout')
            }
            // No refresh token available - call logout with shouldCallBackend=true
            const { logout, setCurrentUser } = await import('@/lib/auth')
            await logout(true) // Refresh token missing, call backend logout API
            setCurrentUser(null)
            await show401Error("Sizning sessiyangiz tugagan. Tizimga qaytadan kirish kerak.")
            return null
          }
        }
        
        if (response.status === 429) {
          await show429Error("Juda ko'p so'rovlar yuborildi. Iltimos, biroz kutib turing.")
          return null
        }
        
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
  }, [handleApiError, language])

  return {
    handleApiError,
    makeAuthenticatedRequest,
  }
}
