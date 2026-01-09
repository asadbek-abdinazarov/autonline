"use client"

import { useState, useCallback, useRef } from "react"
import { buildApiUrl, getDefaultHeaders } from "@/lib/api-utils"
import { useTranslation } from "@/hooks/use-translation"

interface Permission {
  permissionId: number
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}

interface Subscription {
  subscriptionId: number
  name: string
  defName: string | null
  description: string | null
  price: number | null
  buyText: string | null
  features: any[]
  isActive: boolean
  permissions: Permission[]
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}

export interface Student {
  userId: number
  username: string
  fullName: string | null
  phoneNumber: string
  isActive: boolean
  nextPaymentDate: string | null
  subscription: Subscription | null
  createdAt: string
  updatedAt: string
}

interface Pageable {
  pageNumber: number
  pageSize: number
  sort: {
    unsorted: boolean
    sorted: boolean
    empty: boolean
  }
  offset: number
  paged: boolean
  unpaged: boolean
}

interface StudentsResponse {
  content: Student[]
  page?: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
  // Old format support (fallback)
  pageable?: Pageable
  totalPages?: number
  last?: boolean
  totalElements?: number
  numberOfElements?: number
  first?: boolean
  size?: number
  number?: number
  sort?: {
    unsorted: boolean
    sorted: boolean
    empty: boolean
  }
  empty?: boolean
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    size: number
    totalPages: number
    totalElements: number
    first: boolean
    last: boolean
  }>({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true,
  })
  const { language } = useTranslation()
  const fetchingRef = useRef<string | null>(null)

  const fetchStudents = useCallback(async (page: number = 0, size: number = 10) => {
    // Prevent duplicate requests for the same page and size
    const requestKey = `${page}-${size}`
    if (fetchingRef.current === requestKey) {
      return // Already fetching this page
    }
    
    try {
      fetchingRef.current = requestKey
      setIsLoading(true)
      setError(null)
      
      // Get access token
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      
      // Map frontend language to API language format
      const apiLanguage = language === 'cyr' ? 'oz' : language === 'ru' ? 'ru' : 'uz'
      
      const headers: Record<string, string> = {
        ...getDefaultHeaders(),
        'Accept-Language': apiLanguage,
      }
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(buildApiUrl(`/api/v1/students?page=${page}&size=${size}`), {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        // Handle 401 errors
        if (response.status === 401) {
          const { handleApiError } = await import('@/lib/api-utils')
          await handleApiError({ status: 401 })
          throw new Error("Sizning sessiyangiz tugagan. Tizimga qaytadan kirish kerak.")
        }
        
        // Handle 429 errors
        if (response.status === 429) {
          const { handleApiError } = await import('@/lib/api-utils')
          await handleApiError({ status: 429 })
          throw new Error("Juda ko'p so'rovlar yuborildi. Iltimos, biroz kutib turing.")
        }
        
        // Handle server errors (500-599)
        if (response.status >= 500 && response.status < 600) {
          const { handleApiError } = await import('@/lib/api-utils')
          await handleApiError({ status: response.status })
          throw new Error('Server xatoligi. Iltimos, keyinroq urinib ko\'ring')
        }
        
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const { safeJsonParse } = await import('@/lib/api-utils')
      const data = await safeJsonParse<StudentsResponse>(response)
      
      if (data) {
        setStudents(data.content)
        
        // New format: pagination data in page object
        if (data.page) {
          setPagination({
            page: data.page.number,
            size: data.page.size,
            totalPages: data.page.totalPages,
            totalElements: data.page.totalElements,
            first: data.page.number === 0,
            last: data.page.number >= data.page.totalPages - 1,
          })
        } 
        // Old format: pagination data at root level (fallback)
        else if (data.number !== undefined && data.totalPages !== undefined) {
          setPagination({
            page: data.number,
            size: data.size || 10,
            totalPages: data.totalPages,
            totalElements: data.totalElements || 0,
            first: data.first || false,
            last: data.last || false,
          })
        } else {
          throw new Error('Pagination ma\'lumotlari topilmadi')
        }
      } else {
        throw new Error('Ma\'lumotlar yuklanmadi yoki noto\'g\'ri format')
      }
    } catch (err) {
      console.error('Error fetching students:', err)
      // Check if it's a network error
      const { handleApiError } = await import('@/lib/api-utils')
      await handleApiError(err)
      setError(err instanceof Error ? err.message : 'O\'quvchilar yuklanmadi')
    } finally {
      setIsLoading(false)
      fetchingRef.current = null
    }
  }, [language])

  return {
    students,
    isLoading,
    error,
    pagination,
    fetchStudents,
  }
}

