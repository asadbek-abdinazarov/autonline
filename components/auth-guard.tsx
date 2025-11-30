"use client"

import { useEffect, useState, ReactNode, useMemo, useCallback, startTransition } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, logout, setCurrentUser, type Permission } from "@/lib/auth"
import { useNotification } from "@/components/notification-provider"
import { Forbidden } from "@/components/forbidden"
import { useTranslation } from "@/hooks/use-translation"

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  requiredPermission?: Permission
}

export function AuthGuard({ children, fallback, requiredPermission }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [hasRequiredPermission, setHasRequiredPermission] = useState<boolean | null>(null)
  const router = useRouter()
  const { show401Error } = useNotification()
  const { t } = useTranslation()

  // Memoize authentication check to avoid blocking
  const authCheck = useMemo(() => {
    const user = getCurrentUser()
    const isLoggedIn = !!user
    
    if (!isLoggedIn) {
      return { isAuthenticated: false, user: null, hasPermission: false }
    }

    if (user && user.isActive === false) {
      return { isAuthenticated: false, user, hasPermission: false, isInactive: true }
    }

    let hasPermission = true
    if (requiredPermission) {
      hasPermission = Array.isArray(user?.permissions) && user!.permissions!.includes(requiredPermission)
    }

    return { isAuthenticated: true, user, hasPermission }
  }, [requiredPermission])

  // Use callback for redirect to avoid blocking
  const handleRedirect = useCallback(() => {
    startTransition(() => {
      router.push("/login")
    })
  }, [router])

  // Use callback for inactive user handling
  const handleInactiveUser = useCallback(async () => {
    try {
      await logout(true)
      setCurrentUser(null)
      await show401Error("Sizning sessiyangiz tugagan. Tizimga qaytadan kirish kerak.")
      startTransition(() => {
        router.push("/login")
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error handling inactive user:', error)
      }
      startTransition(() => {
        router.push("/login")
      })
    }
  }, [router, show401Error])

  useEffect(() => {
    // Use startTransition to make state updates non-blocking
    startTransition(() => {
      setIsAuthenticated(authCheck.isAuthenticated)
      
      if (authCheck.isInactive) {
        // Handle inactive user asynchronously
        handleInactiveUser()
        return
      }

      if (!authCheck.isAuthenticated) {
        // Redirect asynchronously to avoid blocking
        handleRedirect()
        return
      }

      setHasRequiredPermission(authCheck.hasPermission)
    })
  }, [authCheck, handleRedirect, handleInactiveUser])

  // Show loading state while checking authentication
  if (isAuthenticated === null || hasRequiredPermission === null) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.authGuard.loading}</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  if (!hasRequiredPermission) {
    return <Forbidden />
  }

  return <>{children}</>
}
