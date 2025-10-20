"use client"

import { useNotification } from "@/components/notification-provider"
import { logout, setCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function useApi() {
  const { show401Error } = useNotification()
  const router = useRouter()

  const handleApiError = async (error: any) => {
    // Check if it's a 401 error
    if (error?.message?.includes('401') || error?.status === 401) {
      await show401Error("Sizning sessiyangiz tugagan. Qaytadan kirish kerak.")
      return true // Indicates 401 was handled
    }
    return false // Not a 401 error
  }

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
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
          await show401Error("Sizning sessiyangiz tugagan. Qaytadan kirish kerak.")
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

  return {
    handleApiError,
    makeAuthenticatedRequest,
  }
}
