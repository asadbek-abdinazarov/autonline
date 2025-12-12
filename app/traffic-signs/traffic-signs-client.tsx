"use client"

import { useState, useEffect, useCallback, useRef, memo } from "react"
import { Button } from "@/components/ui/button"
import { TrafficSignCategoryCard } from "@/components/traffic-sign-category-card"
import { fetchTrafficSignCategories, fetchTrafficSignsByCategory, type TrafficSignCategory, type TrafficSign } from "@/lib/data"
import { buildApiUrl } from "@/lib/api-utils"
import { Loader2, ArrowLeft, Image as ImageIcon, Signpost } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Memoized Traffic Sign Item Component to prevent unnecessary re-renders
const TrafficSignItem = memo(({ 
  sign, 
  loadImageUrl,
  imageUrlCache,
  imageLoadingStates
}: { 
  sign: TrafficSign
  loadImageUrl: (photoKey: string, signId: number) => Promise<string>
  imageUrlCache: Map<string, string>
  imageLoadingStates: Map<number, boolean>
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [localImageUrl, setLocalImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '100px' } // Start loading 100px before element is visible
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  // Load image when in view
  useEffect(() => {
    if (!isInView || !sign.photo) return

    // Check if already cached
    const cached = imageUrlCache.get(sign.photo)
    if (cached) {
      setLocalImageUrl(cached)
      setIsLoading(false)
      return
    }

    // Check loading state
    const loading = imageLoadingStates.get(sign.trafficSignsId)
    if (loading === false && !cached) {
      // Already tried to load but failed, don't retry
      setIsLoading(false)
      return
    }

    // Load image
    setIsLoading(true)
    loadImageUrl(sign.photo, sign.trafficSignsId).then((url) => {
      if (url) {
        setLocalImageUrl(url)
      }
      setIsLoading(false)
    })
  }, [isInView, sign.photo, sign.trafficSignsId, loadImageUrl, imageUrlCache, imageLoadingStates])

  return (
    <div
      ref={containerRef}
      className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:shadow-md transition-shadow"
    >
      {/* Image Column */}
      <div className="flex-shrink-0 w-full sm:w-40 h-40 sm:h-auto flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
        {!isInView || isLoading || !localImageUrl ? (
          <div className="flex items-center justify-center w-full h-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <img
            src={localImageUrl}
            alt={sign.name}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        )}
      </div>

      {/* Text Column */}
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {sign.name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {sign.description}
        </p>
      </div>
    </div>
  )
})

TrafficSignItem.displayName = 'TrafficSignItem'

export function TrafficSignsClient() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<TrafficSignCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [signs, setSigns] = useState<TrafficSign[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingSigns, setIsLoadingSigns] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const imageUrlCacheRef = useRef<Map<string, string>>(new Map())
  const imageLoadingStatesRef = useRef<Map<number, boolean>>(new Map())
  const [imageUrlCache, setImageUrlCache] = useState<Map<string, string>>(new Map())
  const [imageLoadingStates, setImageLoadingStates] = useState<Map<number, boolean>>(new Map())
  const batchUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Validate blob URL
  const isValidBlobUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      let resolved = false
      img.onload = () => {
        if (!resolved) {
          resolved = true
          resolve(true)
        }
      }
      img.onerror = () => {
        if (!resolved) {
          resolved = true
          resolve(false)
        }
      }
      img.src = url
      setTimeout(() => {
        if (!resolved) {
          resolved = true
          resolve(false)
        }
      }, 2000)
    })
  }

  // Batch update function to reduce re-renders
  const batchUpdateState = useCallback(() => {
    if (batchUpdateTimeoutRef.current) {
      clearTimeout(batchUpdateTimeoutRef.current)
    }
    
    batchUpdateTimeoutRef.current = setTimeout(() => {
      setImageUrlCache(new Map(imageUrlCacheRef.current))
      setImageLoadingStates(new Map(imageLoadingStatesRef.current))
      batchUpdateTimeoutRef.current = null
    }, 100) // Batch updates every 100ms
  }, [])

  // Load image with authentication
  const loadImageUrl = useCallback(async (photoKey: string, signId: number): Promise<string> => {
    // Check cache first and validate the URL
    if (imageUrlCacheRef.current.has(photoKey)) {
      const cachedUrl = imageUrlCacheRef.current.get(photoKey)!
      
      // For blob URLs, verify they're still valid
      if (cachedUrl.startsWith('blob:')) {
        const isValid = await isValidBlobUrl(cachedUrl)
        if (isValid) {
          return cachedUrl
        } else {
          // Blob URL is invalid (revoked), remove from cache and reload
          imageUrlCacheRef.current.delete(photoKey)
        }
      } else {
        // Non-blob URLs are always valid
        return cachedUrl
      }
    }

    // Set loading state
    imageLoadingStatesRef.current.set(signId, true)
    batchUpdateState()

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      const url = buildApiUrl(`/api/v1/storage/file?key=${encodeURIComponent(photoKey)}`)
      
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
      
      // Update cache in ref (immediate)
      imageUrlCacheRef.current.set(photoKey, blobUrl)
      imageLoadingStatesRef.current.set(signId, false)
      
      // Batch update state (delayed)
      batchUpdateState()
      
      return blobUrl
    } catch (error) {
      console.error('Error loading image:', error)
      imageLoadingStatesRef.current.set(signId, false)
      batchUpdateState()
      return ''
    }
  }, [batchUpdateState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (batchUpdateTimeoutRef.current) {
        clearTimeout(batchUpdateTimeoutRef.current)
      }
      // Cleanup blob URLs
      imageUrlCacheRef.current.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        setError(null)
        const data = await fetchTrafficSignCategories()
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : (t as any).trafficSigns?.error || 'Ma\'lumotlar yuklanmadi')
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [t])

  // Fetch signs when category is selected
  useEffect(() => {
    if (selectedCategory === null) {
      setSigns([])
      return
    }

    const fetchSigns = async () => {
      try {
        setIsLoadingSigns(true)
        setError(null)
        const data = await fetchTrafficSignsByCategory(selectedCategory)
        const activeSigns = data.filter(sign => sign.isActive)
        setSigns(activeSigns)
        
        // Initialize loading states for all signs
        activeSigns.forEach((sign) => {
          if (sign.photo) {
            imageLoadingStatesRef.current.set(sign.trafficSignsId, true)
          }
        })
        setImageLoadingStates(new Map(imageLoadingStatesRef.current))
        
        // Load images lazily - only when they come into view (handled by TrafficSignItem component)
      } catch (err) {
        setError(err instanceof Error ? err.message : (t as any).trafficSigns?.error || 'Ma\'lumotlar yuklanmadi')
      } finally {
        setIsLoadingSigns(false)
      }
    }

    fetchSigns()
  }, [selectedCategory, loadImageUrl, t])

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSigns([])
  }

  const selectedCategoryData = categories.find(cat => cat.trafficSignsCategoriesId === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300 flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-12">
          {/* Background gradient blobs */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 text-slate-900 dark:text-white text-sm font-medium shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                <Signpost className="h-4 w-4 text-blue-500" />
                <span>{(t as any).trafficSigns?.title || "Yo'l harakati belgilari"}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-balance leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {selectedCategory ? selectedCategoryData?.name : ((t as any).trafficSigns?.title || "Yo'l harakati belgilari")}
                </span>
              </h1>
              {selectedCategory && selectedCategoryData && (
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  {selectedCategoryData.description}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 py-8 sm:py-12">
          {selectedCategory === null ? (
            // Categories View
            <div>
              {isLoadingCategories ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500 dark:text-blue-400" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">
                      {(t as any).trafficSigns?.loading || "Yuklanmoqda..."}
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-6">
                    <ImageIcon className="h-10 w-10 text-destructive" />
                  </div>
                  <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">{error}</p>
                  <Button onClick={() => window.location.reload()} size="lg" variant="outline">
                    {(t as any).trafficSigns?.retry || t.common?.retry || "Qayta urinish"}
                  </Button>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-xl text-slate-600 dark:text-slate-400">
                    {(t as any).trafficSigns?.noCategories || "Kategoriyalar topilmadi"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                  {categories.map((category, index) => (
                    <div
                      key={category.trafficSignsCategoriesId}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-500 hover:scale-105 transition-transform"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <TrafficSignCategoryCard
                        category={category}
                        onClick={() => handleCategoryClick(category.trafficSignsCategoriesId)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Signs View
            <div>
              <Button
                variant="outline"
                onClick={handleBackToCategories}
                className="mb-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {(t as any).trafficSigns?.backToCategories || "Kategoriyalarga qaytish"}
              </Button>

              {isLoadingSigns ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500 dark:text-blue-400" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">
                      {(t as any).trafficSigns?.loading || "Yuklanmoqda..."}
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-6">
                    <ImageIcon className="h-10 w-10 text-destructive" />
                  </div>
                  <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">{error}</p>
                  <Button onClick={handleBackToCategories} size="lg" variant="outline">
                    {(t as any).trafficSigns?.backToCategories || "Kategoriyalarga qaytish"}
                  </Button>
                </div>
              ) : signs.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-xl text-slate-600 dark:text-slate-400">
                    {(t as any).trafficSigns?.noSigns || "Belgilar topilmadi"}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {signs.map((sign) => (
                    <TrafficSignItem
                      key={sign.trafficSignsId}
                      sign={sign}
                      loadImageUrl={loadImageUrl}
                      imageUrlCache={imageUrlCache}
                      imageLoadingStates={imageLoadingStates}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
