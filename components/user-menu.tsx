"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, User, CreditCard, Calendar, CheckCircle, XCircle, Loader2, History, Crown, Star, Ban, TrendingUp } from "lucide-react"
import { getCurrentUser, logout, setCurrentUser, type Permission } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePaymentHistory } from "@/hooks/use-payment-history"
import { useTranslation, interpolate } from "@/hooks/use-translation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu() {
  const { t } = useTranslation()
  const router = useRouter()
  const user = getCurrentUser()
  const { paymentHistory, isLoading, fetchPaymentHistory } = usePaymentHistory()
  const [showPaymentHistory, setShowPaymentHistory] = useState(false)
  const [hasLoadedPaymentHistory, setHasLoadedPaymentHistory] = useState(false)

  const handleLogout = async () => {
    await logout()
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
      // Format as "18 Avgust 2025"
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

  const handleDropdownOpen = () => {
    if (!hasLoadedPaymentHistory && hasPermission('VIEW_PAYMENTS')) {
      fetchPaymentHistory()
      setHasLoadedPaymentHistory(true)
    }
    setShowPaymentHistory(true)
  }
  
  const handleHistoryClick = () => {
    router.push("/history")
  }


  return (
    <DropdownMenu onOpenChange={(open) => {
      if (open) {
        handleDropdownOpen()
      } else {
        setShowPaymentHistory(false)
      }
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-11 w-11 border border-border">
          <User className="h-7 w-7 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[95vw] sm:w-[420px] max-h-[85vh] mx-2 sm:mx-0 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
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
                  switch (user.subscription) {
                    case 'FULL':
                      return { label: 'FULL', Icon: Crown, classes: 'from-amber-500 to-orange-500 text-white' }
                    case 'PRO':
                      return { label: 'PRO', Icon: Star, classes: 'from-violet-500 to-fuchsia-500 text-white' }
                    case 'BASIC':
                      return { label: 'BASIC', Icon: Star, classes: 'from-blue-500 to-cyan-500 text-white' }
                    default:
                      return { label: 'FREE', Icon: Ban, classes: 'from-slate-200/50 to-slate-200/50 dark:from-slate-700/50 dark:to-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-300/50 dark:border-slate-600/50' }
                  }
                }
                const { label, Icon, classes } = getSubMeta()
                return (
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${classes} ${label === 'FREE' ? '' : ''}`}>
                    <Icon className={`h-3 w-3 ${label === 'FREE' ? 'text-slate-600 dark:text-slate-400' : 'text-white'}`} />
                    <span className={`text-xs font-semibold ${label === 'FREE' ? 'text-slate-600 dark:text-slate-400' : 'text-white'}`}>{label}</span>
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
        

        {showPaymentHistory && hasPermission('VIEW_PAYMENTS') && paymentHistory.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-3">
              {/* Header */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.userMenu.paymentHistory}</h3>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400">Barcha to'lovlar ro'yxati</p>
                </div>
              </div>
              
              {/* Separator */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-300/50 dark:via-slate-700/50 to-transparent mb-3 transition-colors duration-300" />
              
              {/* Content */}
              <div className="bg-slate-50/90 dark:bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-300/50 dark:border-slate-700/50 overflow-hidden shadow-lg transition-colors duration-300">
                <div className={`p-2 ${paymentHistory.length > 2 ? 'max-h-48 overflow-y-auto' : ''}`}>
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                          <Loader2 className="h-8 w-8 text-blue-500 animate-spin relative z-10" />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">{t.common.loading}</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {paymentHistory.map((payment, index) => (
                          <div 
                            key={index}
                            className="group relative overflow-hidden rounded-lg bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 transition-all duration-300 hover:shadow-md hover:shadow-slate-900/10 dark:hover:shadow-slate-900/50 hover:-translate-y-0.5"
                          >
                            {/* Glow effect on hover */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                              payment.isPaid 
                                ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' 
                                : 'bg-gradient-to-r from-red-500/10 to-rose-500/10'
                            }`} />
                            
                            <div className="relative p-3">
                              {/* Top section */}
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
                                
                                {/* Status badge */}
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
                              
                              {/* Date section */}
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                <span className="text-[11px] truncate">{formatDate(payment.paymentDate)}</span>
                              </div>
                              
                              {/* Bottom accent line */}
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
              
              {/* Footer stats */}
              <div className="mt-3 flex items-center justify-between px-1 text-[10px] text-slate-600 dark:text-slate-400">
                <div>
                  Jami: <span className="font-semibold text-slate-900 dark:text-white">{paymentHistory.length}</span> ta
                </div>
                <div>
                  To'langan: <span className="font-semibold text-green-400">
                    {paymentHistory.filter(p => p.isPaid).length}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        <DropdownMenuSeparator />

        {hasPermission('VIEW_TEST_HISTORY') && (
          <DropdownMenuItem 
            onClick={handleHistoryClick}
            className="cursor-pointer"
          >
            <History className="mr-2 h-4 w-4" />
            {t.userMenu.testHistory}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-900/20 transition-colors duration-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t.userMenu.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
