"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { logout, setCurrentUser } from "@/lib/auth"
import { setGlobalNotificationHandler } from "@/lib/api-utils"

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void
  show401Error: (message?: string) => void
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
    const errorMessage = message || "Sizning sessiyangiz tugagan. Qaytadan kirish kerak."

    // Clear user data and redirect immediately
    await logout()
    setCurrentUser(null)
    router.push("/login")

    // Show toast notification (no action button needed)
    toast.error(errorMessage, { duration: 4500 })
  }, [router])

  // Set global notification handler
  useEffect(() => {
    setGlobalNotificationHandler(show401Error)
  }, [show401Error])

  return (
    <NotificationContext.Provider value={{ showNotification, show401Error }}>
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
