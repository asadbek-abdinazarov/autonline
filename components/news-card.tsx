"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { buildApiUrl } from "@/lib/api-utils"

interface NewsItem {
  newsId: number
  newsTitle: string
  newsDescription: string
  newsPhoto: string
  isActive: boolean
  newsCreatedAt: string
}

interface NewsCardProps {
  news: NewsItem
}

export function NewsCard({ news }: NewsCardProps) {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadImage = async () => {
      if (!news.newsPhoto) {
        setIsLoading(false)
        return
      }

      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
        const url = buildApiUrl(`/api/v1/storage/file?key=${encodeURIComponent(news.newsPhoto)}`)
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(url, {
          method: 'GET',
          headers,
        })

        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`)
        }

        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        setImageUrl(blobUrl)
      } catch (error) {
        console.error('Error loading news image:', error)
        setImageUrl("")
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()

    // Cleanup blob URL on unmount
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [news.newsPhoto])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInHours < 1) {
      return 'Hozir'
    } else if (diffInHours < 24) {
      return `${diffInHours} soat oldin`
    } else if (diffInDays < 7) {
      return `${diffInDays} kun oldin`
    } else {
      // Format as "18 Avgust 2025"
      const day = date.getDate()
      const monthNames = [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
      ]
      const month = monthNames[date.getMonth()]
      const year = date.getFullYear()
      
      return `${day} ${month} ${year}`
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border border-slate-300/50 dark:border-slate-700/50 bg-slate-50/90 dark:bg-slate-900/50 backdrop-blur-xl">
      <div className="relative h-64 w-full bg-slate-200 dark:bg-slate-800">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={news.newsTitle || "Yangilik rasmi"}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800">
            <span className="text-slate-400 text-sm">Rasm mavjud emas</span>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-lg text-balance text-slate-900 dark:text-white">{news.newsTitle}</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">{formatDate(news.newsCreatedAt)}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-pretty">{news.newsDescription}</p>
      </CardContent>
    </Card>
  )
}
