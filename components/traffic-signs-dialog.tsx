"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TrafficSignCategoryCard } from "@/components/traffic-sign-category-card"
import { fetchTrafficSignCategories, fetchTrafficSignsByCategory, type TrafficSignCategory, type TrafficSign } from "@/lib/data"
import { buildApiUrl } from "@/lib/api-utils"
import { loadImageWithCache } from "@/lib/image-loader"
import { Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface TrafficSignsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TrafficSignsDialog({ open, onOpenChange }: TrafficSignsDialogProps) {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<TrafficSignCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [signs, setSigns] = useState<TrafficSign[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingSigns, setIsLoadingSigns] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrlCache, setImageUrlCache] = useState<Map<string, string>>(new Map())
  const [imageLoadingStates, setImageLoadingStates] = useState<Map<number, boolean>>(new Map())

  // Load image with authentication and cache support
  const loadImageUrl = useCallback(async (photoKey: string): Promise<string> => {
    // Check cache first
    if (imageUrlCache.has(photoKey)) {
      return imageUrlCache.get(photoKey)!
    }

    try {
      // Use centralized image loader with ETag and cache support
      const blobUrl = await loadImageWithCache(photoKey)
      
      if (blobUrl) {
        // Cache the blob URL in component state
        setImageUrlCache(prev => new Map(prev).set(photoKey, blobUrl))
      }
      
      return blobUrl
    } catch (error) {
      console.error('Error loading image:', error)
      return ''
    }
  }, [imageUrlCache])

  // Fetch categories when dialog opens
  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setSelectedCategory(null)
      setSigns([])
      setError(null)
      return
    }

    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        setError(null)
        const data = await fetchTrafficSignCategories()
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : t.trafficSigns?.error || 'Ma\'lumotlar yuklanmadi')
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [open, t.trafficSigns?.error])

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
        setSigns(data.filter(sign => sign.isActive))
        
        // Preload images for all signs
        data.forEach((sign, index) => {
          if (sign.isActive && sign.photo) {
            setImageLoadingStates(prev => new Map(prev).set(sign.trafficSignsId, true))
            loadImageUrl(sign.photo).then(() => {
              setImageLoadingStates(prev => new Map(prev).set(sign.trafficSignsId, false))
            })
          }
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : t.trafficSigns?.error || 'Ma\'lumotlar yuklanmadi')
      } finally {
        setIsLoadingSigns(false)
      }
    }

    fetchSigns()
  }, [selectedCategory, loadImageUrl, t.trafficSigns?.error])

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSigns([])
  }

  const selectedCategoryData = categories.find(cat => cat.trafficSignsCategoriesId === selectedCategory)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {selectedCategory ? selectedCategoryData?.name : (t.trafficSigns?.title || "Yo'l harakati belgilari")}
          </DialogTitle>
        </DialogHeader>

        {selectedCategory === null ? (
          // Categories View
          <div className="mt-4">
            {isLoadingCategories ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500 dark:text-blue-400" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">
                    {t.trafficSigns?.loading || "Yuklanmoqda..."}
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
                  {t.trafficSigns?.retry || t.common?.retry || "Qayta urinish"}
                </Button>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-slate-600 dark:text-slate-400">
                  {t.trafficSigns?.noCategories || "Kategoriyalar topilmadi"}
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
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={handleBackToCategories}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.trafficSigns?.backToCategories || "Kategoriyalarga qaytish"}
            </Button>

            {isLoadingSigns ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500 dark:text-blue-400" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">
                    {t.trafficSigns?.loading || "Yuklanmoqda..."}
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
                  {t.trafficSigns?.backToCategories || "Kategoriyalarga qaytish"}
                </Button>
              </div>
            ) : signs.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-slate-600 dark:text-slate-400">
                  {t.trafficSigns?.noSigns || "Belgilar topilmadi"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {signs.map((sign) => {
                  const isLoading = imageLoadingStates.get(sign.trafficSignsId) ?? true
                  const imageUrl = imageUrlCache.get(sign.photo) || ''

                  return (
                    <div
                      key={sign.trafficSignsId}
                      className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:shadow-md transition-shadow"
                    >
                      {/* Image Column */}
                      <div className="flex-shrink-0 w-full sm:w-40 h-40 sm:h-auto flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                        {isLoading || !imageUrl ? (
                          <div className="flex items-center justify-center w-full h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          </div>
                        ) : (
                          <img
                            src={imageUrl}
                            alt={sign.name}
                            className="w-full h-full object-contain"
                            onError={() => {
                              setImageLoadingStates(prev => new Map(prev).set(sign.trafficSignsId, false))
                            }}
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
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}








