export type SubscriptionType = 'BASIC' | 'PRO' | 'FULL' | 'FREE' | 'STUDENT_BASIC' | 'STUDENT_PRO' | 'STUDENT_FULL' | 'BASIC_TEACHER' | 'PRO_TEACHER' | 'FULL_TEACHER'

export type Permission =
  | 'VIEW_PAYMENTS'
  | 'VIEW_ALL_TOPICS'
  | 'VIEW_RANDOM'
  | 'LIMITED_TOPICS'
  | 'VIEW_NEWS'
  | 'VIEW_TEST_HISTORY'
  | 'VIEW_TRAFFIC_SIGNS'
  | 'VIEW_ALL_MY_STUDENTS'

export interface User {
  id: number
  username: string
  phoneNumber: string
  isActive: boolean
  subscription?: SubscriptionType
  roles?: string[]
  permissions?: Permission[]
  fullName?: string
  nextPaymentDate?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  type?: string
  id: number
  username: string
  phoneNumber: string
  roles?: string[]
  subscription?: SubscriptionType
  subscriptionPermissions?: Permission[]
  rolePermissions?: Permission[]
  isActive: boolean
  fullName?: string
  nextPaymentDate?: string
  sessionId?: string
}

export async function login(username: string, password: string): Promise<User> {
  try {
    const { buildApiUrl, getDefaultHeaders } = await import('./api-utils')
    const response = await fetch(buildApiUrl('/api/v1/auth/login'), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({
        username,
        password,
      }),
    })

    if (!response.ok) {
      // Handle 429 errors
      if (response.status === 429) {
        const { handleApiError } = await import('./api-utils')
        await handleApiError({ status: 429 })
        throw new Error("Juda ko'p so'rovlar yuborildi. Iltimos, biroz kutib turing.")
      }
      
      // Try to get error details from response body
      let errorMessage = 'Tizimga kirishda xatolik yuz berdi'
      
      const { safeJsonParse } = await import('./api-utils')
      const errorData = await safeJsonParse<{ message?: string; error?: string }>(response)
      
      if (errorData) {
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
      } else {
        // If JSON parsing fails, use status-based error messages
        if (response.status === 400) {
          errorMessage = 'Login yoki parol noto\'g\'ri'
        } else if (response.status === 401) {
          errorMessage = 'Login yoki parol noto\'g\'ri'
        } else if (response.status === 403) {
          errorMessage = 'Foydalanuvchi faol emas'
        } else if (response.status >= 500) {
          errorMessage = 'Server xatoligi. Iltimos, keyinroq urinib ko\'ring'
        }
      }
      
      throw new Error(errorMessage)
    }

    const { safeJsonParse } = await import('./api-utils')
    const data = await safeJsonParse<LoginResponse>(response)
    
    if (!data) {
      throw new Error('Ma\'lumotlar yuklanmadi yoki noto\'g\'ri format')
    }
    
    // Check if user is active
    if (!data.isActive) {
      throw new Error('Foydalanuvchi faol emas')
    }

    // Store access token and refresh token
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      
      // Save sessionId if available
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId)
      }
    }

    // Combine subscriptionPermissions and rolePermissions into permissions
    const allPermissions: Permission[] = []
    if (Array.isArray(data.subscriptionPermissions)) {
      allPermissions.push(...data.subscriptionPermissions)
    }
    if (Array.isArray(data.rolePermissions)) {
      allPermissions.push(...data.rolePermissions)
    }
    // Remove duplicates
    const uniquePermissions = Array.from(new Set(allPermissions)) as Permission[]

    return {
      id: data.id,
      username: data.username,
      phoneNumber: data.phoneNumber,
      isActive: data.isActive,
      subscription: data.subscription ?? 'FREE',
      roles: Array.isArray(data.roles) ? data.roles : [],
      permissions: uniquePermissions,
      fullName: data.fullName,
      nextPaymentDate: data.nextPaymentDate,
    }
  } catch (error) {
    // If it's already an Error with a message, re-throw it
    if (error instanceof Error) {
      throw error
    }
    
    // Handle network errors or other unexpected errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Internet aloqasi yo\'q. Iltimos, internetingizni tekshiring')
    }
    
    // Fallback for any other errors
    throw new Error('Tizimga kirishda kutilmagan xatolik yuz berdi')
  }
}

export async function register(fullName: string, username: string, password: string, phoneNumber: string, confirmPassword?: string): Promise<User> {
  try {
    const { buildApiUrl, getDefaultHeaders } = await import('./api-utils')
    const body: { fullName: string; username: string; password: string; phoneNumber: string; confirmPassword?: string } = {
      fullName,
      username,
      password,
      phoneNumber,
    }
    
    // Add confirmPassword if it's provided and not empty
    if (confirmPassword && confirmPassword.trim()) {
      body.confirmPassword = confirmPassword
    }
    
    const response = await fetch(buildApiUrl('/api/v1/auth/register'), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      if (response.status === 429) {
        const { handleApiError } = await import('./api-utils')
        await handleApiError({ status: 429 })
        throw new Error("Juda ko'p so'rovlar yuborildi. Iltimos, biroz kutib turing.")
      }

      let errorMessage = 'Ro\'yxatdan o\'tishda xatolik yuz berdi'
      const { safeJsonParse } = await import('./api-utils')
      const errorData = await safeJsonParse<{ message?: string; error?: string }>(response)
      
      if (errorData) {
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
      } else {
        if (response.status >= 500) {
          errorMessage = 'Server xatoligi. Iltimos, keyinroq urinib ko\'ring'
        }
      }

      throw new Error(errorMessage)
    }

    const { safeJsonParse } = await import('./api-utils')
    const data = await safeJsonParse<LoginResponse>(response)
    
    if (!data) {
      throw new Error('Ma\'lumotlar yuklanmadi yoki noto\'g\'ri format')
    }

    if (!data.isActive) {
      throw new Error('Foydalanuvchi faol emas')
    }

    // Store access token and refresh token
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      
      // Save sessionId if available
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId)
      }
    }

    // Combine subscriptionPermissions and rolePermissions into permissions
    const allPermissions: Permission[] = []
    if (Array.isArray(data.subscriptionPermissions)) {
      allPermissions.push(...data.subscriptionPermissions)
    }
    if (Array.isArray(data.rolePermissions)) {
      allPermissions.push(...data.rolePermissions)
    }
    // Remove duplicates
    const uniquePermissions = Array.from(new Set(allPermissions)) as Permission[]

    return {
      id: data.id,
      username: data.username,
      phoneNumber: data.phoneNumber,
      isActive: data.isActive,
      subscription: data.subscription ?? 'FREE',
      roles: Array.isArray(data.roles) ? data.roles : [],
      permissions: uniquePermissions,
      fullName: data.fullName,
      nextPaymentDate: data.nextPaymentDate,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    if (error instanceof TypeError && (error as any).message?.includes('fetch')) {
      throw new Error('Internet aloqasi yo\'q. Iltimos, internetingizni tekshiring')
    }
    throw new Error('Ro\'yxatdan o\'tishda kutilmagan xatolik yuz berdi')
  }
}

/**
 * Logout function
 * @param shouldCallBackend - If true, calls backend logout API. Should only be true when refresh token is missing or expired.
 *                            Defaults to true for backward compatibility (manual logout cases).
 */
export async function logout(shouldCallBackend: boolean = true, isManualLogout: boolean = false): Promise<void> {
  try {
    // Mark as manual logout if user initiated it
    if (isManualLogout && typeof window !== "undefined") {
      localStorage.setItem("isManualLogout", "true")
    }

    // Only call backend logout API if shouldCallBackend is true
    // This should only be true when refresh token is missing or expired
    if (shouldCallBackend) {
      const { buildApiUrl, getDefaultHeaders } = await import('./api-utils')
      const accessToken = getAccessToken()
      
      // Send logout request to backend if token exists
      if (accessToken) {
        try {
          const headers = getDefaultHeaders()
          headers['Authorization'] = `Bearer ${accessToken}`
          await fetch(buildApiUrl('/api/v1/auth/logout'), {
            method: 'POST',
            headers,
          })
        } catch (error) {
          // If logout request fails, still clear local storage
          // Silently handle error
        }
      }
    }
  } catch (error) {
    // If there's any error, still clear local storage
    // Silently handle error
  } finally {
    // Always clear local storage regardless of API call result
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("sessionId")
    }
  }
}

export function getCurrentUser(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  }
  return null
}

export function setCurrentUser(user: User | null): void {
  if (typeof window !== "undefined") {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  }
}

/**
 * Fetches current user data from /api/v1/users/me endpoint
 * Updates localStorage with the fetched data
 * Prevents duplicate concurrent requests
 * @returns User object or null if fetch fails
 */
export async function fetchCurrentUser(): Promise<User | null> {
  // If a fetch is already in progress, return the existing promise
  if (isFetchingUser && fetchUserPromise) {
    return fetchUserPromise
  }

  // Check if we have an access token
  const accessToken = getAccessToken()
  if (!accessToken) {
    return null
  }

  // Set flag and create promise
  isFetchingUser = true
  fetchUserPromise = (async () => {
    try {
      const { buildApiUrl, getDefaultHeaders, safeJsonParse, handleApiError } = await import('./api-utils')
      
      const headers: Record<string, string> = {
        ...getDefaultHeaders(),
        'Authorization': `Bearer ${accessToken}`,
      }

      const response = await fetch(buildApiUrl('/api/v1/users/me'), {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        // Handle 401 errors (unauthorized)
        if (response.status === 401) {
          await handleApiError({ status: 401 })
          return null
        }

        // Handle 429 errors (too many requests)
        if (response.status === 429) {
          await handleApiError({ status: 429 })
          return null
        }

        // For other errors, just return null without throwing
        return null
      }

      const data = await safeJsonParse<{
        id: number
        username: string
        fullName: string
        phoneNumber: string
        subscription: string
        isActive: boolean
        nextPaymentDate: string | null
        roles: string[]
        permissions: string[]
      }>(response)

      if (!data) {
        return null
      }

      // Map API response to User interface
      const user: User = {
        id: data.id,
        username: data.username,
        phoneNumber: data.phoneNumber,
        isActive: data.isActive,
        subscription: (data.subscription as SubscriptionType) ?? 'FREE',
        roles: Array.isArray(data.roles) ? data.roles : [],
        permissions: Array.isArray(data.permissions) ? (data.permissions as Permission[]) : [],
        fullName: data.fullName,
        nextPaymentDate: data.nextPaymentDate ?? undefined,
      }

      // Update localStorage
      setCurrentUser(user)

      return user
    } catch (error) {
      // Handle errors gracefully - don't throw, just return null
      console.error('Error fetching current user:', error)
      return null
    } finally {
      // Reset flags after fetch completes
      isFetchingUser = false
      fetchUserPromise = null
    }
  })()

  return fetchUserPromise
}

export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken")
  }
  return null
}

// Track if fetchCurrentUser is in progress to prevent duplicate requests
let isFetchingUser = false
let fetchUserPromise: Promise<User | null> | null = null

export function setAccessToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token)
  }
}

export function removeAccessToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken")
  }
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken")
  }
  return null
}

/**
 * Set refresh token in localStorage
 */
export function setRefreshToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("refreshToken", token)
  }
}

/**
 * Remove refresh token from localStorage
 */
export function removeRefreshToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("refreshToken")
  }
}

/**
 * Refresh access token using refresh token
 * Uses /api/v1/auth/refresh-token endpoint
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      throw new Error('Refresh token not found')
    }

    const { buildApiUrl, getDefaultHeaders, safeJsonParse } = await import('./api-utils')
    const response = await fetch(buildApiUrl('/api/v1/auth/refresh-token'), {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({
        refreshToken,
      }),
    })

    if (!response.ok) {
      // Check if refresh token is expired (401) or invalid
      if (response.status === 401) {
        // Try to parse error response to get error code and message
        let errorMessage = 'Refresh token expired or invalid'
        let errorCode = 'REFRESH_TOKEN_EXPIRED'
        
        try {
          const clonedResponse = response.clone()
          const errorData = await safeJsonParse<{ error?: string; code?: string; message?: string }>(clonedResponse)
          
          if (errorData) {
            // Check if error code is REFRESH_TOKEN_INVALID or REFRESH_TOKEN_EXPIRED
            if (errorData.code === 'REFRESH_TOKEN_INVALID' || errorData.error === 'REFRESH_TOKEN_INVALID' ||
                errorData.code === 'REFRESH_TOKEN_EXPIRED' || errorData.error === 'REFRESH_TOKEN_EXPIRED') {
              errorCode = 'REFRESH_TOKEN_EXPIRED'
              // Use backend message if available, otherwise use default
              errorMessage = errorData.message || errorData.error || errorMessage
            } else {
              // Other 401 errors - use backend message if available
              errorMessage = errorData.message || errorData.error || errorMessage
            }
          }
        } catch (parseError) {
          // If parsing fails, use default message
          // Silently handle parse error
        }
        
        // Create error object - don't throw to avoid console error
        // Return special object that indicates refresh token expired
        const errorObj = {
          isRefreshTokenExpired: true,
          backendMessage: errorMessage,
          errorCode: errorCode,
          error: new Error(`${errorCode}:${errorMessage}`)
        }
        // Return null but attach error info to indicate expiration
        return errorObj as any
      }
      // Other errors (network, server errors, etc.) - don't treat as expiration
      // Return null but don't throw - let caller decide what to do
      return null
    }

    // Response is same format as login response
    const data = await safeJsonParse<LoginResponse>(response)
    
    if (!data || !data.accessToken || !data.refreshToken) {
      throw new Error('Invalid refresh response')
    }

    // Update tokens (both accessToken and refreshToken are returned)
    if (typeof window !== "undefined") {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      
      // Save sessionId if available
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId)
      }
      
      // Also update user data if available
      if (data.id && data.username) {
        // Combine subscriptionPermissions and rolePermissions into permissions
        const allPermissions: Permission[] = []
        if (Array.isArray(data.subscriptionPermissions)) {
          allPermissions.push(...data.subscriptionPermissions)
        }
        if (Array.isArray(data.rolePermissions)) {
          allPermissions.push(...data.rolePermissions)
        }
        // Remove duplicates
        const uniquePermissions = Array.from(new Set(allPermissions)) as Permission[]
        
        const user: User = {
          id: data.id,
          username: data.username,
          phoneNumber: data.phoneNumber,
          isActive: data.isActive,
          subscription: data.subscription ?? 'FREE',
          roles: Array.isArray(data.roles) ? data.roles : [],
          permissions: uniquePermissions,
          fullName: data.fullName,
          nextPaymentDate: data.nextPaymentDate,
        }
        localStorage.setItem("user", JSON.stringify(user))
      }
    }

    return data.accessToken
  } catch (error) {
    // Other errors (network, parsing, etc.) - return null but don't treat as expiration
    // Don't clear tokens here - let the caller handle logout and cleanup
    return null
  }
}
