"use client"

import { useState, useCallback } from "react"
import { buildApiUrl, getDefaultHeaders } from "@/lib/api-utils"

interface NewsItem {
  newsId: number
  newsTitle: string
  newsDescription: string
  newsPhoto: string
  isActive: boolean
  newsCreatedAt: string
}

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(buildApiUrl('/api/v1/news'), {
        method: 'GET',
        headers: getDefaultHeaders(),
      })
      
      if (!response.ok) {
        // Handle 429 errors
        if (response.status === 429) {
          const { handleApiError } = await import('@/lib/api-utils')
          await handleApiError({ status: 429 })
          throw new Error("Juda ko'p so'rovlar yuborildi. Iltimos, biroz kutib turing.")
        }
        
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const { safeJsonParse } = await import('@/lib/api-utils')
      const data = await safeJsonParse<NewsItem[]>(response)
      if (data) {
        setNews(data)
      } else {
        throw new Error('Ma\'lumotlar yuklanmadi yoki noto\'g\'ri format')
      }
    } catch (err) {
      console.error('Error fetching news:', err)
      // Check if it's a network error
      const { handleApiError } = await import('@/lib/api-utils')
      await handleApiError(err)
      setError(err instanceof Error ? err.message : 'Yangiliklar yuklanmadi')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    news,
    isLoading,
    error,
    fetchNews,
  }
}
