export type SubscriptionType = 'BASIC' | 'PRO' | 'FULL' | 'FREE'

export type Permission =
  | 'VIEW_PAYMENTS'
  | 'VIEW_ALL_TOPICS'
  | 'VIEW_RANDOM'
  | 'LIMITED_TOPICS'
  | 'VIEW_NEWS'
  | 'VIEW_TEST_HISTORY'

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
  token: string
  type: string
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

    // Store access token
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.token)
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

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.token)
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

export async function logout(): Promise<void> {
  try {
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
        console.error('Logout request failed:', error)
      }
    }
  } catch (error) {
    // If there's any error, still clear local storage
    console.error('Logout error:', error)
  } finally {
    // Always clear local storage regardless of API call result
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
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

export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken")
  }
  return null
}

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
