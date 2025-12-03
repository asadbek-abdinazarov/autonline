"use client"

import { useState, useCallback } from "react"
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
  pageable: Pageable
  totalPages: number
  last: boolean
  totalElements: number
  numberOfElements: number
  first: boolean
  size: number
  number: number
  sort: {
    unsorted: boolean
    sorted: boolean
    empty: boolean
  }
  empty: boolean
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

  const fetchStudents = useCallback(async (page: number = 0, size: number = 10) => {
    try {
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
        setPagination({
          page: data.number,
          size: data.size,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          first: data.first,
          last: data.last,
        })
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

