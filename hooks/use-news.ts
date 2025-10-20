"use client"

import { useState, useCallback } from "react"
import { buildApiUrl } from "@/lib/api-utils"

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
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setNews(data)
    } catch (err) {
      console.error('Error fetching news:', err)
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
