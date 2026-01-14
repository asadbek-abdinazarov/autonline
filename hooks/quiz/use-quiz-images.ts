"use client"

import { useState, useCallback } from 'react'
import { loadImageWithCache } from '@/lib/image-loader'

export interface QuizImagesHook {
    imageCache: Map<string, string>
    loadingImages: Set<string>
    loadImage: (photoKey: string) => Promise<string>
    isImageLoading: (photoKey: string) => boolean
    getImageUrl: (photoKey: string) => string | null
    clearCache: () => void
}

export function useQuizImages(): QuizImagesHook {
    const [imageCache, setImageCache] = useState<Map<string, string>>(new Map())
    const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())

    const loadImage = useCallback(async (photoKey: string): Promise<string> => {
        // Return cached image if available
        if (imageCache.has(photoKey)) {
            return imageCache.get(photoKey)!
        }

        // Mark as loading
        setLoadingImages(prev => new Set(prev).add(photoKey))

        try {
            const url = await loadImageWithCache(photoKey)

            // Cache the image URL
            setImageCache(prev => new Map(prev).set(photoKey, url))

            return url
        } catch (error) {
            console.error('Error loading quiz image:', error)
            throw error
        } finally {
            // Remove from loading set
            setLoadingImages(prev => {
                const next = new Set(prev)
                next.delete(photoKey)
                return next
            })
        }
    }, [imageCache])

    const isImageLoading = useCallback((photoKey: string): boolean => {
        return loadingImages.has(photoKey)
    }, [loadingImages])

    const getImageUrl = useCallback((photoKey: string): string | null => {
        return imageCache.get(photoKey) || null
    }, [imageCache])

    const clearCache = useCallback(() => {
        setImageCache(new Map())
        setLoadingImages(new Set())
    }, [])

    return {
        imageCache,
        loadingImages,
        loadImage,
        isImageLoading,
        getImageUrl,
        clearCache
    }
}
