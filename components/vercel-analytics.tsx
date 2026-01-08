'use client'

import { useEffect, useState } from 'react'

export function VercelAnalytics() {
  const [Analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    // Only load Analytics on Vercel
    if (process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL) {
      import('@vercel/analytics/next')
        .then((mod) => {
          setAnalytics(() => mod.Analytics)
        })
        .catch(() => {
          // Ignore if package is not available or not on Vercel
        })
    }
  }, [])

  if (!Analytics) return null

  return <Analytics />
}
