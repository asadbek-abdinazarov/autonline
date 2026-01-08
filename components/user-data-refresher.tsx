"use client"

import { useEffect } from "react"
import { getCurrentUser, fetchCurrentUser } from "@/lib/auth"

/**
 * Component that refreshes user data on page load/refresh
 * Fetches current user data from /api/v1/users/me if user is logged in
 */
export function UserDataRefresher() {
  useEffect(() => {
    // Fetch user data on mount (page load/refresh) if user is logged in
    const currentUser = getCurrentUser()
    if (currentUser) {
      fetchCurrentUser().catch(() => {
        // Silently handle errors - user data will remain from localStorage
      })
    }
  }, [])

  // This component doesn't render anything
  return null
}

