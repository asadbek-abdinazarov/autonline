"use client"

import { useState, useEffect, memo, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { buildApiUrl } from "@/lib/api-utils"
import { loadImageWithCache } from "@/lib/image-loader"

// Hook for lazy loading images with Intersection Observer
function useLazyImage(photoKey: string | null) {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [shouldLoad, setShouldLoad] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!photoKey || !imgRef.current) {
      setIsLoading(false)
      return
    }

    // Use Intersection Observer to load image only when it's about to enter viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01
      }
    )

    observer.observe(imgRef.current)

    return () => {
      observer.disconnect()
    }
  }, [photoKey])

  useEffect(() => {
    if (!shouldLoad || !photoKey) {
      return
    }

    let cancelled = false

    const loadImage = async () => {
      try {
        setIsLoading(true)
        const blobUrl = await loadImageWithCache(photoKey)
        if (!cancelled) {
          setImageUrl(blobUrl)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error loading news image:', error)
        if (!cancelled) {
          setImageUrl("")
          setIsLoading(false)
        }
      }
    }

    loadImage()

    return () => {
      cancelled = true
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [shouldLoad, photoKey])

  return { imageUrl, isLoading, imgRef }
}

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

function NewsCardComponent({ news }: NewsCardProps) {
  const { imageUrl, isLoading, imgRef } = useLazyImage(news.newsPhoto || null)

  const formattedDate = useMemo(() => {
    const date = new Date(news.newsCreatedAt)
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
  }, [news.newsCreatedAt])

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-slate-300/50 dark:border-slate-700/50 bg-slate-50/90 dark:bg-slate-900/50 backdrop-blur-xl">
      <div ref={imgRef} className="relative h-64 w-full bg-slate-200 dark:bg-slate-800">
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
        <CardDescription className="text-slate-600 dark:text-slate-400">{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-pretty">{news.newsDescription}</p>
      </CardContent>
    </Card>
  )
}

export const NewsCard = memo(NewsCardComponent)
