"use client"

import { useState, useCallback } from "react"
import { buildApiUrl, getDefaultHeaders } from "@/lib/api-utils"
import { useTranslation } from "@/hooks/use-translation"

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
  const { language } = useTranslation()

  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Map frontend language to API language format
      // uz (lotin) -> uz, cyr (kiril) -> oz, ru -> ru
      const apiLanguage = language === 'cyr' ? 'oz' : language === 'ru' ? 'ru' : 'uz'
      
      const headers = {
        ...getDefaultHeaders(),
        'Accept-Language': apiLanguage,
      }
      
      const response = await fetch(buildApiUrl('/api/v1/news'), {
        method: 'GET',
        headers,
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
  }, [language])

  return {
    news,
    isLoading,
    error,
    fetchNews,
  }
}
