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
  permissions?: Permission[]
}

export interface LoginResponse {
  token: string
  type: string
  id: number
  username: string
  phoneNumber: string
  isActive: boolean
  subscription?: SubscriptionType
  permissions?: Permission[]
}

export async function login(username: string, password: string): Promise<User> {
  try {
    const { buildApiUrl } = await import('./api-utils')
    const response = await fetch(buildApiUrl('/api/v1/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch (parseError) {
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

    const data: LoginResponse = await response.json()
    
    // Check if user is active
    if (!data.isActive) {
      throw new Error('Foydalanuvchi faol emas')
    }

    // Store access token
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.token)
    }

    return {
      id: data.id,
      username: data.username,
      phoneNumber: data.phoneNumber,
      isActive: data.isActive,
      subscription: data.subscription ?? 'FREE',
      permissions: Array.isArray(data.permissions) ? data.permissions : [],
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

export async function register(username: string, password: string, phoneNumber: string): Promise<User> {
  try {
    const { buildApiUrl } = await import('./api-utils')
    const response = await fetch(buildApiUrl('/api/v1/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, phoneNumber }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        const { handleApiError } = await import('./api-utils')
        await handleApiError({ status: 429 })
        throw new Error("Juda ko'p so'rovlar yuborildi. Iltimos, biroz kutib turing.")
      }

      let errorMessage = 'Ro\'yxatdan o\'tishda xatolik yuz berdi'
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch (_) {
        if (response.status >= 500) {
          errorMessage = 'Server xatoligi. Iltimos, keyinroq urinib ko\'ring'
        }
      }

      throw new Error(errorMessage)
    }

    const data: LoginResponse = await response.json()

    if (!data.isActive) {
      throw new Error('Foydalanuvchi faol emas')
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.token)
    }

    return {
      id: data.id,
      username: data.username,
      phoneNumber: data.phoneNumber,
      isActive: data.isActive,
      subscription: data.subscription ?? 'FREE',
      permissions: Array.isArray(data.permissions) ? data.permissions : [],
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

export function logout(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
    }
    resolve()
  })
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
