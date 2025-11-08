"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, User, CreditCard, Calendar, CheckCircle, XCircle, Loader2, History, HelpCircle, Crown, Star, Ban } from "lucide-react"
import { getCurrentUser, logout, setCurrentUser, type Permission } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
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

  const handleHelpCenterClick = () => {
    router.push("/help-center")
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
      <DropdownMenuContent align="end" className="w-[95vw] sm:w-[420px] max-h-[85vh] mx-2 sm:mx-0">
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span className="text-sm">{user?.username || t.userMenu.user}</span>
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
                      return { label: 'FREE', Icon: Ban, classes: 'from-muted to-muted text-muted-foreground border border-border' }
                  }
                }
                const { label, Icon, classes } = getSubMeta()
                return (
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${classes} ${label === 'FREE' ? 'bg-transparent' : ''}`}>
                    <Icon className={`h-3 w-3 ${label === 'FREE' ? 'text-muted-foreground' : 'text-white'}`} />
                    <span className={`text-xs font-semibold ${label === 'FREE' ? 'text-muted-foreground' : 'text-white'}`}>{label}</span>
                  </div>
                )
              })()}
              {user?.isActive ? (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">{t.userMenu.active}</span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{t.userMenu.inactive}</span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
          {user?.phoneNumber || t.userMenu.phoneNotFound}
        </DropdownMenuLabel>
        

        {showPaymentHistory && hasPermission('VIEW_PAYMENTS') && paymentHistory.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 sm:px-3 py-2 sm:py-3">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="text-sm sm:text-base font-semibold">{t.userMenu.paymentHistory}</span>
              </div>
              
              <ScrollArea className="h-64 sm:h-72">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <div className="text-center">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-2 sm:mb-3" />
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">{t.common.loading}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentHistory.map((payment, index) => (
                      <Card key={index} className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 bg-card/30">
                        <CardHeader className="pb-1 sm:pb-1.5 px-2 sm:px-3 py-1 sm:py-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-sm sm:text-base font-bold truncate">
                              {formatAmount(payment.paymentAmount, payment.paymentCurrency)}
                            </CardTitle>
                            <Badge 
                              variant={payment.isPaid ? "default" : "destructive"}
                              className={`text-xs px-1 sm:px-1.5 py-0.5 h-4 sm:h-5 flex items-center gap-0.5 sm:gap-1 font-medium flex-shrink-0 ${
                                payment.isPaid 
                                  ? 'bg-green-500 hover:bg-green-600 text-white border-green-500' 
                                  : 'bg-red-500 hover:bg-red-600 text-white border-red-500'
                              }`}
                            >
                              {payment.isPaid ? (
                                <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              ) : (
                                <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              )}
                              <span className="hidden sm:inline">{payment.isPaid ? t.userMenu.paid : t.userMenu.unpaid}</span>
                              <span className="sm:hidden">{payment.isPaid ? '✓' : '✗'}</span>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 px-2 sm:px-3 pb-1.5 sm:pb-2">
                          <div className="space-y-1.5 sm:space-y-2">
                            {payment.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {payment.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground truncate">{formatDate(payment.paymentDate)}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                              <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground truncate">{payment.paymentMethod}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
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
        
        <DropdownMenuItem 
          onClick={handleHelpCenterClick}
          className="cursor-pointer"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          {t.userMenu.helpCenter}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t.userMenu.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
