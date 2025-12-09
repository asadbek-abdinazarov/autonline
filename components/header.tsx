"use client"

import { UserMenu } from "@/components/user-menu"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, LayoutDashboard, Crown } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { useEffect, useState, useMemo, useCallback } from "react"
import { usePathname } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export function Header() {
  const { t } = useTranslation()
  const pathname = usePathname()
  
  // Initialize state as false to match server render (prevents hydration mismatch)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkUser = () => {
      const user = getCurrentUser()
      setIsLoggedIn(!!user)
    }
    
    // Check on mount and when pathname changes
    checkUser()
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkUser()
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      
      // Also check periodically to catch login/logout in same tab
      const interval = setInterval(checkUser, 500)
      
      return () => {
        window.removeEventListener('storage', handleStorageChange)
        clearInterval(interval)
      }
    }
  }, [pathname])

  // Handle hash change for smooth scroll
  useEffect(() => {
    if (typeof window === 'undefined' || pathname !== "/") return

    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove #
      if (hash) {
        setTimeout(() => {
          const targetElement = document.getElementById(hash)
          if (targetElement) {
            const headerHeight = 80
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            })
          }
        }, 100) // Small delay to ensure DOM is ready
      }
    }

    // Handle initial hash on page load
    if (window.location.hash) {
      handleHashChange()
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [pathname])

  const isLandingPage = useMemo(() => pathname === "/", [pathname])
  const isHomePage = useMemo(() => pathname === "/home", [pathname])
  const showNavLinks = useMemo(() => !isLoggedIn && isLandingPage, [isLoggedIn, isLandingPage])

  const handleSmoothScroll = useCallback((e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    
    // Check if we're on the landing page
    if (pathname !== "/") {
      // If not on landing page, navigate first, then scroll
      window.location.href = `/#${targetId}`
      return
    }

    // Update URL hash without triggering scroll
    window.history.pushState(null, '', `#${targetId}`)

    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      const headerHeight = 80 // Approximate header height
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
    }
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl transition-colors duration-300">
      <div className="container mx-auto px-4 py-2 sm:py-3 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md"
          aria-label={t.common.home}
        >
          <div className="relative w-12 h-12 sm:w-16 sm:h-16">
            <Image
              src="/autonline.svg"
              alt="AutOnline Logo"
              fill
              className="object-contain rounded-md"
              priority
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">AutOnline</h1>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Navigation links - only on landing page for non-logged users */}
          {showNavLinks && (
            <nav className="hidden lg:flex items-center gap-3 mr-1 text-sm" aria-label={t.common.home}>
              <Link 
                href="/#features" 
                onClick={(e) => handleSmoothScroll(e, 'features')}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md px-2 py-1 hover:scale-105 active:scale-95"
                aria-label={t.landing.features.title || t.header.nav.features}
              >
                {t.header.nav.features}
              </Link>
              <Link 
                href="/#how-it-works" 
                onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md px-2 py-1 hover:scale-105 active:scale-95"
                aria-label={t.landing.howItWorks.title || t.header.nav.howItWorks}
              >
                {t.header.nav.howItWorks}
              </Link>
              <Link 
                href="/#benefits" 
                onClick={(e) => handleSmoothScroll(e, 'benefits')}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md px-2 py-1 hover:scale-105 active:scale-95"
                aria-label={t.landing.benefits.title || t.header.nav.benefits}
              >
                {t.header.nav.benefits}
              </Link>
              <Link 
                href="/#stats" 
                onClick={(e) => handleSmoothScroll(e, 'stats')}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md px-2 py-1 hover:scale-105 active:scale-95"
                aria-label={t.landing.stats.title || t.header.nav.stats}
              >
                {t.header.nav.stats}
              </Link>
              <Link 
                href="/#faq" 
                onClick={(e) => handleSmoothScroll(e, 'faq')}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md px-2 py-1 hover:scale-105 active:scale-95"
                aria-label={t.landing.faq.title || t.header.nav.faq}
              >
                {t.header.nav.faq}
              </Link>
            </nav>
          )}
          
          {/* Subscription button - always visible */}
          <Button 
            variant="ghost" 
            asChild 
            size="sm" 
            className="flex text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            <Link href="/subscription" className="flex items-center gap-1.5" aria-label={t.header.subscription}>
              <Crown className="h-4 w-4" aria-hidden="true" />
              <span className="hidden md:inline text-xs sm:text-sm">{t.header.subscription}</span>
            </Link>
          </Button>
          
          {/* Login/Register/Dashboard buttons */}
          {isLandingPage && !isLoggedIn && (
            <>
              <Button variant="ghost" asChild size="sm" className="flex text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                <Link href="/login" className="flex items-center gap-1.5" aria-label={t.common.login}>
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden md:inline text-xs sm:text-sm">{t.common.login}</span>
                </Link>
              </Button>
              <Button asChild size="sm" className="flex bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/20 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                <Link href="/register" className="flex items-center gap-1.5" aria-label={t.common.start}>
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden md:inline text-xs sm:text-sm">{t.common.start}</span>
                </Link>
              </Button>
            </>
          )}
          {isLoggedIn && !isHomePage &&(
            <Button asChild size="sm" className="hidden sm:flex bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/20 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
              <Link href="/home" className="flex items-center gap-1.5" aria-label={t.common.dashboard}>
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                <span className="hidden md:inline text-xs sm:text-sm">{t.common.dashboard}</span>
              </Link>
            </Button>
          )}
          
          {/* User Menu - visible on all screen sizes (includes all header actions) */}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
