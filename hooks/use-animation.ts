"use client"

import { useEffect, useState } from 'react'

/**
 * Hook to determine if animations should be enabled based on:
 * - User motion preferences
 * - Data saver mode
 * - Network connection speed
 * 
 * Returns shouldAnimate which is false for:
 * - Users who prefer reduced motion
 * - Users with data saver enabled
 * - Slow 2G connections
 */
export function useAnimation() {
    const [shouldAnimate, setShouldAnimate] = useState(true)

    useEffect(() => {
        // Check user preferences for reduced motion
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches

        // Check if user has data saver enabled
        const prefersReducedData = window.matchMedia(
            '(prefers-reduced-data: reduce)'
        ).matches

        // Check connection speed (if available)
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
        const isSlowConnection = connection?.effectiveType === '2g' ||
            connection?.effectiveType === 'slow-2g'

        // Disable animations if any condition is true
        const shouldDisableAnimations =
            prefersReducedMotion ||
            prefersReducedData ||
            isSlowConnection

        setShouldAnimate(!shouldDisableAnimations)
    }, [])

    return { shouldAnimate }
}
