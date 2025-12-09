"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, startTransition } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { logout, setCurrentUser } from "@/lib/auth"
import { setGlobalNotificationHandler, setGlobal429ErrorHandler, setGlobalErrorHandler } from "@/lib/api-utils"

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void
  show401Error: (message?: string) => void
  show429Error: (message?: string) => void
  showError: (message: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        toast.success(message)
        break
      case 'error':
        toast.error(message)
        break
      case 'warning':
        toast.warning(message)
        break
      case 'info':
        toast.info(message)
        break
    }
  }, [])

  const show401Error = useCallback(async (message?: string) => {
    const errorMessage = message || "Sizning sessiyangiz tugagan. Tizimga qaytadan kirish kerak."

    console.log('🟡 [SHOW401ERROR] Called', {
      message,
      timestamp: new Date().toISOString()
    })

    // Check if refresh token exists
    const { getRefreshToken } = await import('@/lib/auth')
    const refreshToken = getRefreshToken()
    
    console.log('🟡 [SHOW401ERROR] Refresh token status:', {
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken?.length || 0
    })
    
    // IMPORTANT: If refresh token exists, it means logout was NOT called yet
    // This should NOT happen if refresh was successful, but if refresh failed due to network error,
    // we should NOT logout or redirect. Only logout/redirect if refresh token is missing (already cleared by logout)
    if (!refreshToken) {
      // Refresh token is missing - logout was already called, just redirect
      console.log('🟡 [SHOW401ERROR] Refresh token missing - logout already called, redirecting')
      setCurrentUser(null)
      // Use startTransition to make redirect non-blocking
      startTransition(() => {
        router.push("/login")
      })
      // Show toast notification
      toast.error(errorMessage, { duration: 4500 })
    } else {
      // Refresh token exists - try to refresh access token and continue the process
      console.log('🟡 [SHOW401ERROR] Refresh token exists - attempting to refresh access token...')
      
      try {
        const { refreshAccessToken } = await import('@/lib/auth')
        const refreshResult = await refreshAccessToken()
        
        // Check if refresh result is an error object (refresh token expired)
        if (refreshResult && typeof refreshResult === 'object' && 'isRefreshTokenExpired' in refreshResult) {
          const errorObj = refreshResult as any
          console.log('🔴 [SHOW401ERROR] Refresh token expired - calling logout')
          
          // Refresh token expired - call logout
          await logout(true)
          setCurrentUser(null)
          // Use startTransition to make redirect non-blocking
          startTransition(() => {
            router.push("/login")
          })
          
          // Show backend message in notification
          toast.error(errorObj.backendMessage || errorMessage, { duration: 4500 })
          return
        }
        
        if (refreshResult && typeof refreshResult === 'string') {
          // Refresh successful - save flag and reload page
          console.log('🟢 [SHOW401ERROR] Refresh successful - reloading page to continue process')
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('tokenRefreshed', 'true')
          }
          
          // Reload page immediately - notification will be shown after reload
          window.location.reload()
          
        } else {
          // Refresh failed but refresh token still exists (network error, etc.)
          console.log('🟡 [SHOW401ERROR] Refresh failed but refresh token still exists - showing retry message')
          toast.error("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.", { duration: 4500 })
        }
      } catch (refreshError) {
        // Other errors (network, etc.) - show error but don't logout
        console.log('🟡 [SHOW401ERROR] Refresh error (not expired):', refreshError)
        toast.error("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.", { duration: 4500 })
      }
    }
  }, [router])

  const show429Error = useCallback(async (message?: string) => {
    const errorMessage = message || "Juda ko'p so'rovlar yuborildi. Iltimos, biroz kutib turing."
    
    // Show toast notification as warning
    toast.warning(errorMessage, { duration: 5000 })
  }, [])

  const showError = useCallback((message: string) => {
    // Show toast notification as error
    toast.error(message, { duration: 5000 })
  }, [])

  // Check for token refresh flag on page load and show notification
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const tokenRefreshed = localStorage.getItem('tokenRefreshed')
    if (tokenRefreshed === 'true') {
      // Kichik kechikish bilan notification ko'rsatish
      const timer = setTimeout(() => {
        toast.success("Sessiya yangilandi. Davom etishingiz mumkin, qandaydur kamchilik yuzaga kelsa sahifani yangilang!.", { duration: 4000 })
        localStorage.removeItem('tokenRefreshed')
      }, 400)
      
      return () => clearTimeout(timer)
    }
  }, [])

  // Set global notification handlers
  useEffect(() => {
    setGlobalNotificationHandler(show401Error)
    setGlobal429ErrorHandler(show429Error)
    setGlobalErrorHandler(showError)
  }, [show401Error, show429Error, showError])

  return (
    <NotificationContext.Provider value={{ showNotification, show401Error, show429Error, showError }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
