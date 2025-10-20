"use client"

import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, logout, setCurrentUser } from "@/lib/auth"
import { useNotification } from "@/components/notification-provider"

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const { show401Error } = useNotification()

  useEffect(() => {
    const user = getCurrentUser()
    const isLoggedIn = !!user
    setIsAuthenticated(isLoggedIn)

    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    if (user && user.isActive === false) {
      // Inactive user: clear storage, notify and redirect
      logout().finally(() => {
        setCurrentUser(null)
        show401Error("Sizning sessiyangiz tugagan. Qaytadan kirish kerak.")
      })
      return
    }
  }, [router])

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
