"use client"

import { useCallback } from "react"
import { useNotification } from "@/components/notification-provider"
import { getDefaultHeaders } from "@/lib/api-utils"
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
      
      const headers: Record<string, string> = {
        ...getDefaultHeaders(),
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
        if (response.status === 401) {
          await show401Error("Sizning sessiyangiz tugagan. Tizimga qaytadan kirish kerak.")
          return null
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
