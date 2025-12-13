"use client"

import { buildApiUrl } from "./api-utils"

// ETag storage key prefix
const ETAG_STORAGE_PREFIX = "image_etag_"
const BLOB_URL_CACHE_PREFIX = "image_blob_"

// Cache for blob URLs in memory (faster than localStorage)
const blobUrlCache = new Map<string, string>()
// Cache for ETags in memory
const etagCache = new Map<string, string>()

/**
 * Load image with ETag support and browser cache
 * Uses If-None-Match header to avoid unnecessary downloads
 * Stores ETags in localStorage for persistence
 */
export async function loadImageWithCache(photoKey: string): Promise<string> {
  if (!photoKey) {
    return ""
  }

  // Check in-memory blob URL cache first
  // Blob URLs are valid until revoked, so we can return them directly
  if (blobUrlCache.has(photoKey)) {
    return blobUrlCache.get(photoKey)!
  }

  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    const url = buildApiUrl(`/api/v1/storage/file?key=${encodeURIComponent(photoKey)}`)

    // Get stored ETag from localStorage or memory cache
    let storedEtag: string | null = null
    if (typeof window !== "undefined") {
      const memoryEtag = etagCache.get(photoKey)
      const localEtag = localStorage.getItem(`${ETAG_STORAGE_PREFIX}${photoKey}`)
      storedEtag = memoryEtag ?? localEtag ?? null
    } else {
      storedEtag = etagCache.get(photoKey) ?? null
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    // Add If-None-Match header if we have a stored ETag
    if (storedEtag) {
      headers["If-None-Match"] = storedEtag
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      // Use cache: 'default' to respect Cache-Control headers from server
      cache: "default",
    })

    // Handle 304 Not Modified - reuse cached blob URL
    if (response.status === 304) {
      const cachedBlobUrl = blobUrlCache.get(photoKey)
      if (cachedBlobUrl) {
        return cachedBlobUrl
      }
      // If we don't have blob URL cached (e.g., after page reload), fetch it
      // Remove If-None-Match header and fetch again to get the actual image
      const retryHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) {
        retryHeaders["Authorization"] = `Bearer ${token}`
      }
      // Don't include If-None-Match for retry
      
      const retryResponse = await fetch(url, {
        method: "GET",
        headers: retryHeaders,
        cache: "default",
      })
      if (!retryResponse.ok) {
        throw new Error(`Failed to load image: ${retryResponse.status}`)
      }
      const blob = await retryResponse.blob()
      const blobUrl = URL.createObjectURL(blob)
      blobUrlCache.set(photoKey, blobUrl)
      
      // Store ETag from response
      const etag = retryResponse.headers.get("ETag")
      if (etag && typeof window !== "undefined") {
        etagCache.set(photoKey, etag)
        localStorage.setItem(`${ETAG_STORAGE_PREFIX}${photoKey}`, etag)
      }
      
      return blobUrl
    }

    if (!response.ok) {
      throw new Error(`Failed to load image: ${response.status}`)
    }

    // Get ETag from response headers
    const etag = response.headers.get("ETag")
    if (etag) {
      // Store ETag in memory and localStorage
      etagCache.set(photoKey, etag)
      if (typeof window !== "undefined") {
        localStorage.setItem(`${ETAG_STORAGE_PREFIX}${photoKey}`, etag)
      }
    }

    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    // Cache the blob URL
    blobUrlCache.set(photoKey, blobUrl)

    return blobUrl
  } catch (error) {
    console.error("Error loading image:", error)
    return ""
  }
}

/**
 * Clear cached image data for a specific photo key
 */
export function clearImageCache(photoKey: string): void {
  // Clear blob URL from memory
  const blobUrl = blobUrlCache.get(photoKey)
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl)
    blobUrlCache.delete(photoKey)
  }

  // Clear ETag from memory and localStorage
  etagCache.delete(photoKey)
  if (typeof window !== "undefined") {
    localStorage.removeItem(`${ETAG_STORAGE_PREFIX}${photoKey}`)
  }
}

/**
 * Clear all cached image data
 */
export function clearAllImageCache(): void {
  // Revoke all blob URLs
  for (const blobUrl of blobUrlCache.values()) {
    URL.revokeObjectURL(blobUrl)
  }
  blobUrlCache.clear()
  etagCache.clear()

  // Clear from localStorage
  if (typeof window !== "undefined") {
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (key.startsWith(ETAG_STORAGE_PREFIX)) {
        localStorage.removeItem(key)
      }
    }
  }
}
