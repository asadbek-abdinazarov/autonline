"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { LogOut, User, CreditCard, Calendar, CheckCircle, XCircle, Loader2, History, Crown, Star, Ban, TrendingUp, MoreVertical, Globe, HelpCircle, Check, Sun, Moon, ChevronRight, ChevronDown, Users, Signpost } from "lucide-react"
import { getCurrentUser, logout, setCurrentUser, fetchCurrentUser, type Permission } from "@/lib/auth"
import { usePaymentHistory } from "@/hooks/use-payment-history"
import { useTranslation, interpolate } from "@/hooks/use-translation"
import { useTheme } from "next-themes"
import { Language, availableLanguages } from "@/lib/locales"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export function UserMenu() {
  const { t, language, setLanguage } = useTranslation()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const user = getCurrentUser()
  const { paymentHistory, isLoading, fetchPaymentHistory } = usePaymentHistory()
  const [showPaymentHistory, setShowPaymentHistory] = useState(false)
  const [hasLoadedPaymentHistory, setHasLoadedPaymentHistory] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLanguageSubmenuOpen, setIsLanguageSubmenuOpen] = useState(false)
  const [submenuPosition, setSubmenuPosition] = useState<{ top: number; left: number } | null>(null)
  const languageSubmenuTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const languageButtonRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (languageSubmenuTimeoutRef.current) {
        clearTimeout(languageSubmenuTimeoutRef.current)
      }
    }
  }, [])

  // Calculate submenu position
  useEffect(() => {
    if (isLanguageSubmenuOpen && languageButtonRef.current) {
      const updatePosition = () => {
        if (!languageButtonRef.current) return

        const rect = languageButtonRef.current.getBoundingClientRect()
        const submenuWidth = 160 // min-w-[160px]
        const gap = 4 // ml-1 = 4px
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        
        let left = rect.right + gap
        let top = rect.top
        
        // Check if submenu would overflow to the right
        if (left + submenuWidth > viewportWidth) {
          // Open to the left instead
          left = rect.left - submenuWidth - gap
        }
        
        // Ensure submenu doesn't go off-screen horizontally
        if (left < 0) {
          left = gap
        }
        
        // Check if submenu would overflow vertically
        const submenuHeight = availableLanguages.length * 36 + 8 // approximate height
        if (top + submenuHeight > viewportHeight) {
          top = viewportHeight - submenuHeight - gap
        }
        
        // Ensure submenu doesn't go off-screen vertically
        if (top < 0) {
          top = gap
        }
        
        setSubmenuPosition({ top, left })
      }

      updatePosition()
      
      // Throttle scroll handler for better performance
      let scrollTimeout: NodeJS.Timeout | null = null
      const throttledUpdatePosition = () => {
        if (scrollTimeout) return
        scrollTimeout = setTimeout(() => {
          updatePosition()
          scrollTimeout = null
        }, 16) // ~60fps
      }
      
      // Update position on scroll and resize
      window.addEventListener('scroll', throttledUpdatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', throttledUpdatePosition, true)
        window.removeEventListener('resize', updatePosition)
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }
      }
    } else {
      setSubmenuPosition(null)
    }
  }, [isLanguageSubmenuOpen])

  const handleLogout = async () => {
    await logout(true, true) // isManualLogout = true
    setCurrentUser(null)
    router.push("/login")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInHours < 1) {
      return t.history.dateFormat.now
    } else if (diffInHours < 24) {
      return interpolate(t.history.dateFormat.hoursAgo, { hours: diffInHours.toString() })
    } else if (diffInDays < 7) {
      return interpolate(t.history.dateFormat.daysAgo, { days: diffInDays.toString() })
    } else {
      const day = date.getDate()
      const month = t.history.dateFormat.months[date.getMonth()]
      const year = date.getFullYear()
      return `${day} ${month} ${year}`
    }
  }

  const formatFullDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = t.history.dateFormat.months[date.getMonth()]
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${day} ${month} ${year}, ${hours}:${minutes}`
  }

  const formatAmount = (amount: number, currency: string) => {
    const formattedNumber = new Intl.NumberFormat('uz-UZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
    
    const currencySymbol = currency === 'USD' ? 'USD' : currency === 'EUR' ? 'EUR' : 'UZS'
    return `${formattedNumber} ${currencySymbol}`
  }

  const hasPermission = (perm: Permission) => Array.isArray(user?.permissions) && user!.permissions!.includes(perm)

  const hasTeacherRole = () => {
    return Array.isArray(user?.roles) && user!.roles!.includes('TEACHER')
  }

  const handleDropdownOpen = () => {
    // Fetch user data when menu opens
    const currentUser = getCurrentUser()
    if (currentUser) {
      fetchCurrentUser().catch(() => {
        // Silently handle errors - user data will remain from localStorage
      })
    }
    if (!hasLoadedPaymentHistory && hasPermission('VIEW_PAYMENTS')) {
      fetchPaymentHistory()
      setHasLoadedPaymentHistory(true)
    }
  }
  
  const handleHistoryClick = useCallback(() => {
    router.push("/history")
  }, [router])

  const handleStudentsClick = useCallback(() => {
    router.push("/students")
  }, [router])

  const handleTrafficSignsClick = useCallback(() => {
    router.push("/traffic-signs")
  }, [router])

  const handleLanguageChange = useCallback((lang: Language) => {
    if (lang !== language) {
      setLanguage(lang)
    }
  }, [setLanguage, language])

  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }, [theme, setTheme])

  const paidCount = useMemo(() => {
    return paymentHistory.filter(p => p.isPaid).length
  }, [paymentHistory])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-11 w-11 border border-border">
        <MoreVertical className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu 
      modal={false}
      onOpenChange={(open) => {
        if (open) {
          handleDropdownOpen()
        } else {
          setShowPaymentHistory(false)
          setIsLanguageSubmenuOpen(false)
          if (languageSubmenuTimeoutRef.current) {
            clearTimeout(languageSubmenuTimeoutRef.current)
            languageSubmenuTimeoutRef.current = null
          }
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-11 w-11 border border-border focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label={user ? t.userMenu.user : "Menu"}
          aria-haspopup="true"
          aria-expanded="false"
        >
          {user ? (
            <User className="h-7 w-7 text-primary" aria-hidden="true" />
          ) : (
            <MoreVertical className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[95vw] sm:w-[420px] max-h-[85vh] mx-2 sm:mx-0 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
        {/* User Info - only when logged in */}
        {user && (
          <>
            <DropdownMenuLabel className="text-slate-900 dark:text-white">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{user?.fullName || user?.username || t.userMenu.user}</span>
                  {user?.fullName && (
                    <span className="text-xs text-slate-600 dark:text-slate-400">{user.username}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {user?.subscription && (() => {
                    const getSubMeta = () => {
                      // Use defName from API if available, otherwise fallback to hardcoded labels
                      const label = user.subscriptionDefName || (() => {
                        switch (user.subscription) {
                          case 'FULL':
                            return 'Yillik obuna'
                          case 'PRO':
                            return 'Oylik obuna'
                          case 'BASIC':
                            return 'Haftalik obuna'
                          case 'STUDENT_BASIC':
                            return 'Asosiy Talaba'
                          case 'STUDENT_PRO':
                            return 'Professional Talaba'
                          case 'STUDENT_FULL':
                            return 'To\'liq Talaba'
                          case 'BASIC_TEACHER':
                            return 'Asosiy O\'qituvchi'
                          case 'PRO_TEACHER':
                            return 'Professional O\'qituvchi'
                          case 'FULL_TEACHER':
                            return 'To\'liq O\'qituvchi'
                          default:
                            return 'Tekin obuna'
                        }
                      })()
                      
                      // Get icon and classes based on subscription type
                      switch (user.subscription) {
                          case 'FULL':
                            return { label, Icon: Crown, classes: 'from-amber-500 to-orange-500 text-white' }
                          case 'PRO':
                            return { label, Icon: Star, classes: 'from-violet-500 to-fuchsia-500 text-white' }
                          case 'BASIC':
                            return { label, Icon: Star, classes: 'from-blue-500 to-cyan-500 text-white' }
                          case 'STUDENT_BASIC':
                            return { label, Icon: Star, classes: 'from-blue-500 to-cyan-500 text-white' }
                          case 'STUDENT_PRO':
                            return { label, Icon: Star, classes: 'from-violet-500 to-fuchsia-500 text-white' }
                          case 'STUDENT_FULL':
                            return { label, Icon: Star, classes: 'from-amber-500 to-orange-500 text-white' }
                          case 'BASIC_TEACHER':
                            return { label, Icon: Users, classes: 'from-emerald-500 to-teal-500 text-white border-2 border-emerald-400/50' }
                          case 'PRO_TEACHER':
                            return { label, Icon: Users, classes: 'from-purple-500 to-indigo-500 text-white border-2 border-purple-400/50' }
                          case 'FULL_TEACHER':
                            return { label, Icon: Users, classes: 'from-rose-500 to-pink-500 text-white border-2 border-rose-400/50' }
                        default:
                          return { label, Icon: Ban, classes: 'from-slate-200/50 to-slate-200/50 dark:from-slate-700/50 dark:to-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-300/50 dark:border-slate-600/50' }
                      }
                    }
                    const { label, Icon, classes } = getSubMeta()
                    const isFree = label === 'Tekin obuna'
                    return (
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${classes}`}>
                        <Icon className={`h-3 w-3 ${isFree ? 'text-slate-600 dark:text-slate-400' : 'text-white'}`} />
                        <span className={`text-xs font-semibold ${isFree ? 'text-slate-600 dark:text-slate-400' : 'text-white'}`}>{label}</span>
                      </div>
                    )
                  })()}
                  {user?.isActive ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 transition-colors duration-300">{t.userMenu.active}</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-200/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-300/50 dark:border-slate-600/50 transition-colors duration-300">{t.userMenu.inactive}</span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuLabel className="font-normal text-xs text-slate-600 dark:text-slate-400">
              {user?.phoneNumber || t.userMenu.phoneNotFound}
            </DropdownMenuLabel>
            {user?.nextPaymentDate && (
              <DropdownMenuLabel className="font-normal text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <span>{t.userMenu.nextPaymentDate}: {formatFullDateTime(user.nextPaymentDate)}</span>
              </DropdownMenuLabel>
            )}

            {hasPermission('VIEW_PAYMENTS') && paymentHistory.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-3 py-3">
                  <button
                    onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                    className="w-full flex items-center gap-2.5 mb-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  >
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.userMenu.paymentHistory}</h3>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400">{t.userMenu.paymentHistoryDescription}</p>
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${
                        showPaymentHistory ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {showPaymentHistory && (
                    <div className="overflow-hidden transition-all duration-300 ease-in-out animate-in fade-in-0 slide-in-from-top-2">
                      <div className="h-px bg-gradient-to-r from-transparent via-slate-300/50 dark:via-slate-700/50 to-transparent mb-3 transition-colors duration-300" />
                      
                      <div className="bg-slate-50/90 dark:bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-300/50 dark:border-slate-700/50 overflow-hidden shadow-lg transition-colors duration-300">
                    <div className={`p-2 ${paymentHistory.length > 2 ? 'max-h-48 overflow-y-auto' : ''}`}>
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin relative z-10" />
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">{t.common.loading}</p>
                        </div>
                      ) : paymentHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4">
                          <CreditCard className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-3" />
                          <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                            {t.userMenu.paymentHistoryEmpty || "To'lovlar tarixi bo'sh"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {paymentHistory.map((payment, index) => (
                            <div 
                              key={index}
                              className="group relative overflow-hidden rounded-lg bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 transition-all duration-300 hover:shadow-md hover:shadow-slate-900/10 dark:hover:shadow-slate-900/50 hover:-translate-y-0.5"
                            >
                              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                                payment.isPaid 
                                  ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' 
                                  : 'bg-gradient-to-r from-red-500/10 to-rose-500/10'
                              }`} />
                              
                              <div className="relative p-3">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <TrendingUp className={`h-3.5 w-3.5 flex-shrink-0 ${
                                        payment.isPaid ? 'text-green-400' : 'text-red-400'
                                      }`} />
                                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                        {formatAmount(payment.paymentAmount, payment.paymentCurrency)}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[10px] transition-all duration-300 flex-shrink-0 ${
                                    payment.isPaid 
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/30 group-hover:shadow-green-500/50' 
                                      : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/30 group-hover:shadow-red-500/50'
                                  }`}>
                                    {payment.isPaid ? (
                                      <>
                                        <CheckCircle className="h-2.5 w-2.5" />
                                        <span>{t.userMenu.paid}</span>
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="h-2.5 w-2.5" />
                                        <span>{t.userMenu.unpaid}</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                  <span className="text-[12px] mb-2 truncate">{payment.description}</span>
                                  <span className="text-[12px] mb-2 truncate">({payment.paymentMethod})</span>
                                </div>
                                
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  <span className="text-[11px] truncate">{formatDate(payment.paymentDate)}</span>
                                </div>
                                
                                <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ${
                                  payment.isPaid 
                                    ? 'bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-0 group-hover:opacity-100' 
                                    : 'bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100'
                                }`} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between px-1 text-[10px] text-slate-600 dark:text-slate-400">
                        <div>
                          {t.userMenu.total} <span className="font-semibold text-slate-900 dark:text-white">{paymentHistory.length}</span> {t.common.items || 'ta'}
                        </div>
                        <div>
                          {t.userMenu.paidCount} <span className="font-semibold text-green-400">
                            {paymentHistory.filter(p => p.isPaid).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <DropdownMenuSeparator />
          </>
        )}

{(hasTeacherRole() || hasPermission('VIEW_ALL_MY_STUDENTS')) && (
              <DropdownMenuItem 
                onClick={handleStudentsClick}
                className="cursor-pointer"
              >
                <Users className="mr-2 h-4 w-4" />
                {t.userMenu.students}
              </DropdownMenuItem>
            )}

            {hasPermission('VIEW_TEST_HISTORY') && (
              <DropdownMenuItem 
                onClick={handleHistoryClick}
                className="cursor-pointer"
              >
                <History className="mr-2 h-4 w-4" />
                {t.userMenu.testHistory}
                <DropdownMenuSeparator />
              </DropdownMenuItem>
            )}

            {/* {hasPermission('VIEW_TRAFFIC_SIGNS') && (
              <DropdownMenuItem 
                onClick={handleTrafficSignsClick}
                className="cursor-pointer"
              >
                <Signpost className="mr-2 h-4 w-4" />
                {(t as any).userMenu?.trafficSigns || (t as any).trafficSignsButton || "Yo'l harakati belgilari"}
              </DropdownMenuItem>
            )} */}




        {/* Language Switcher */}
        <div 
          ref={languageButtonRef}
          className="relative"
          onMouseEnter={() => {
            if (languageSubmenuTimeoutRef.current) {
              clearTimeout(languageSubmenuTimeoutRef.current)
              languageSubmenuTimeoutRef.current = null
            }
            setIsLanguageSubmenuOpen(true)
          }}
          onMouseLeave={() => {
            languageSubmenuTimeoutRef.current = setTimeout(() => {
              setIsLanguageSubmenuOpen(false)
            }, 200)
          }}
        >
          <div
            className="relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <Globe className="mr-2 h-4 w-4" />
            <span className="flex-1">{t.userMenu.language}</span>
            <ChevronRight className="ml-auto h-4 w-4" />
          </div>
        </div>

        {/* Theme Switcher */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            handleThemeToggle()
          }}
        >
          {theme === "dark" ? (
            <Moon className="mr-2 h-4 w-4" />
          ) : (
            <Sun className="mr-2 h-4 w-4" />
          )}
          <span>{theme === "dark" ? (t.userMenu.theme?.dark || "Tun") : (t.userMenu.theme?.light || "Kun")}</span>
        </DropdownMenuItem>

        
        {/* Submenu Portal */}
        {mounted && isLanguageSubmenuOpen && submenuPosition && createPortal(
          <div
            ref={submenuRef}
            className="fixed z-[9999] min-w-[160px] rounded-md border bg-popover text-popover-foreground shadow-lg p-1 animate-in fade-in-0 zoom-in-95 duration-200"
            style={{
              top: `${submenuPosition.top}px`,
              left: `${submenuPosition.left}px`,
            }}
            onMouseEnter={() => {
              if (languageSubmenuTimeoutRef.current) {
                clearTimeout(languageSubmenuTimeoutRef.current)
                languageSubmenuTimeoutRef.current = null
              }
              setIsLanguageSubmenuOpen(true)
            }}
            onMouseLeave={() => {
              languageSubmenuTimeoutRef.current = setTimeout(() => {
                setIsLanguageSubmenuOpen(false)
              }, 200)
            }}
          >
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleLanguageChange(lang.code)
                  setIsLanguageSubmenuOpen(false)
                }}
                className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer transition-colors"
              >
                <span className="flex-1 text-left">{lang.nativeName}</span>
                {language === lang.code && <Check className="h-4 w-4 flex-shrink-0" />}
              </button>
            ))}
          </div>,
          document.body
        )}



        {/* Help Center */}
        <DropdownMenuItem asChild>
          <Link href="/help-center" className="flex items-center cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>{t.userMenu.helpCenter}</span>
          </Link>
        </DropdownMenuItem>

        {/* Logout - only show when user is logged in */}
        {user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 focus:text-red-600 dark:focus:text-red-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t.userMenu.logout}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}