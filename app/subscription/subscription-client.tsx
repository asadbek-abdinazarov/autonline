"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Crown, Check, Loader2, Sparkles, Zap, Shield, Star } from "lucide-react"
import { Footer } from "@/components/footer"
import { useNotification } from "@/components/notification-provider"
import { buildApiUrl, getDefaultHeaders, safeJsonParse } from "@/lib/api-utils"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"

interface SubscriptionPermission {
  permissionId: number
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}

interface SubscriptionPlan {
  subscriptionId: number
  name: string
  defName: string
  description: string
  price: number
  buyText: string
  features: string[]
  isActive: boolean
  permissions: SubscriptionPermission[]
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}

export function SubscriptionClient() {
  const { t } = useTranslation()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showNotification } = useNotification()

  // Fetch subscription plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(buildApiUrl('/api/v1/subscription'), {
          method: 'GET',
          headers: getDefaultHeaders(),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await safeJsonParse<SubscriptionPlan[]>(response)
        
        if (data && Array.isArray(data)) {
          // Filter only active plans, exclude FREE plans, and sort by price (ascending)
          const activePlans = data
            .filter(plan => plan.isActive && plan.name !== 'FREE' && plan.price > 0)
            .sort((a, b) => a.price - b.price)
          
          // Mark the most expensive plan as popular
          if (activePlans.length > 0) {
            activePlans[activePlans.length - 1] = {
              ...activePlans[activePlans.length - 1],
            }
          }
          
          setPlans(activePlans)
        } else {
          showNotification('Obuna ma\'lumotlarini yuklashda xatolik yuz berdi', 'error')
        }
      } catch (error) {
        console.error('Error fetching subscription plans:', error)
        showNotification(
          error instanceof Error ? error.message : 'Obuna ma\'lumotlarini yuklashda xatolik yuz berdi',
          'error'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [showNotification])

  // Determine if plan is popular (most expensive active plan)
  const getPopularPlanId = () => {
    if (plans.length === 0) return null
    const sortedByPrice = [...plans].sort((a, b) => b.price - a.price)
    return sortedByPrice[0]?.subscriptionId || null
  }

  const popularPlanId = getPopularPlanId()

  const handleSubscribe = (plan: SubscriptionPlan) => {
    try {
      // Encode buyText for URL
      const encodedText = encodeURIComponent(plan.buyText)
      // Open Telegram link with buyText
      const telegramUrl = `https://t.me/AsadbekAbdinazarov?text=${encodedText}`
      window.open(telegramUrl, '_blank')
    } catch (error) {
      console.error('Error opening Telegram:', error)
      showNotification(
        error instanceof Error ? error.message : 'Telegram\'ga bog\'lanishda xatolik yuz berdi',
        'error'
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300 flex flex-col">
      <Header />

      <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-12 mb-8 sm:mb-12">
            {/* Background gradient blobs */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <Button variant="ghost" size="lg" asChild className="hover:scale-105 transition-transform text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <Link href="/home" className="flex items-center gap-2">
                    <ArrowLeft className="h-5 w-5" />
                    {t.common.back}
                  </Link>
                </Button>
              </div>

              <div className="text-center">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white text-sm font-medium shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Premium Obuna</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 px-2">
                    <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                      Premium Obuna
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 px-4">
                    Barcha funksiyalardan foydalanish va imtihonga mukammal tayyorlanish uchun obuna sotib oling
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Content Section */}
          <section className="container mx-auto px-4 py-8 sm:py-12">
            <div className="max-w-6xl mx-auto">

            {/* Pricing Cards */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12 mb-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Ma'lumotlar yuklanmoqda...</p>
                </div>
              </div>
            ) : plans.length === 0 ? (
              <div className="flex items-center justify-center py-12 mb-12">
                <div className="text-center">
                  <p className="text-muted-foreground">Obuna rejalari topilmadi</p>
                </div>
              </div>
            ) : (
              <div className={cn(
                "grid gap-6 mb-12",
                plans.length === 1 && "grid-cols-1 max-w-md mx-auto",
                plans.length === 2 && "grid-cols-1 md:grid-cols-2",
                plans.length === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                plans.length >= 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              )}>
                {plans.map((plan, index) => {
                  const isPopular = plan.subscriptionId === popularPlanId
                  return (
                    <div
                      key={plan.subscriptionId}
                      className={cn(
                        "relative",
                        isPopular && plans.length <= 3 && "md:scale-[1.03]",
                        isPopular && plans.length >= 4 && "md:scale-[1.02]"
                      )}
                    >
                      {isPopular && (
                    <>
                      <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-full blur-md opacity-75 animate-pulse" />
                          <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold shadow-2xl flex items-center gap-1 sm:gap-2">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-white animate-spin-slow" />
                            <span className="whitespace-nowrap">ENG MASHHUR</span>
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-white animate-spin-slow" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-amber-500 to-primary rounded-2xl sm:rounded-3xl opacity-20 blur-xl" />
                    </>
                  )}
                  
                      <Card
                        className={cn(
                          "h-full relative overflow-hidden transition-all duration-300 flex flex-col",
                          isPopular
                            ? "border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/10 via-background/95 to-primary/5 backdrop-blur-sm"
                            : "border shadow-md hover:shadow-lg bg-background/95 backdrop-blur-sm hover:border-primary/20",
                          "hover:scale-[1.01] hover:-translate-y-0.5"
                        )}
                      >
                        {/* Decorative corner element */}
                        {isPopular && (
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
                        )}
                        
                        <CardHeader className="relative pb-3 pt-4 sm:pt-5 px-4 sm:px-6">
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={cn(
                                "p-1 sm:p-1.5 rounded-lg flex-shrink-0",
                                index === 0 
                                  ? "bg-blue-500/10 text-blue-600" 
                                  : "bg-amber-500/10 text-amber-600"
                              )}>
                                {index === 0 ? (
                                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                                ) : (
                                  <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                                )}
                              </div>
                              <CardTitle className="text-base sm:text-lg md:text-xl font-bold leading-tight">
                                {plan.defName}
                              </CardTitle>
                            </div>
                            <CardDescription className="text-xs sm:text-sm mb-2 line-clamp-2">
                              {plan.description}
                            </CardDescription>
                          </div>
                          
                          <div className="flex items-baseline gap-1 sm:gap-2 mt-3 mb-2">
                            <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
                              {new Intl.NumberFormat('uz-UZ', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              }).format(plan.price)}
                            </span>
                            <div className="flex flex-col justify-center">
                              <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                                UZS
                              </span>
                            </div>
                          </div>
                          
                          {isPopular && (
                            <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 mt-2">
                              <span className="text-xs sm:text-sm">🎁</span>
                              <span className="text-[10px] sm:text-xs font-semibold text-green-700 dark:text-green-400">
                                Bonus
                              </span>
                            </div>
                          )}
                        </CardHeader>
                    
                    <CardContent className="space-y-3 pb-4 flex-1 flex flex-col px-4 sm:px-6">
                      <div className="border-t pt-3 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-foreground mb-2">
                          <div className="p-0.5 sm:p-1 rounded-md bg-primary/10">
                            <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                          </div>
                          <span>Imkoniyatlar:</span>
                        </div>
                        <ul className="space-y-1">
                          {plan.features.map((feature, featureIndex) => (
                            <li 
                              key={featureIndex} 
                              className="flex items-start gap-1.5 sm:gap-2 group/item hover:bg-muted/20 p-0.5 sm:p-1 rounded transition-colors"
                            >
                              <div className="mt-0.5 p-0.5 rounded-full bg-success/20 group-hover/item:bg-success/30 transition-all flex-shrink-0">
                                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-success" />
                              </div>
                              <span className="text-[11px] sm:text-xs md:text-sm leading-relaxed text-foreground">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                        <Button
                          className={cn(
                            "w-full h-9 sm:h-10 text-[11px] sm:text-xs md:text-sm font-semibold rounded-lg transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 mt-2",
                            isPopular
                              ? "bg-gradient-to-r from-primary via-blue-600 to-primary hover:from-primary/90 hover:via-blue-500 hover:to-primary/90 text-white"
                              : "bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-200 hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-200 dark:hover:to-gray-300 text-white dark:text-gray-900"
                          )}
                          size="sm"
                          onClick={() => handleSubscribe(plan)}
                        >
                          <Crown className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span>Sotib olish</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
            )}

            {/* Benefits Section */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Card className="border-none shadow-md bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent hover:from-blue-500/20 transition-all duration-300 hover:scale-105 w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)] max-w-sm">
                <CardContent className="p-5 text-center">
                  <div className="inline-flex p-3 rounded-xl bg-blue-500/20 mb-3">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-base mb-1.5">Cheksiz testlar</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Har qanday vaqtda cheksiz miqdorda test topshirish imkoniyati
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent hover:from-green-500/20 transition-all duration-300 hover:scale-105 w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)] max-w-sm">
                <CardContent className="p-5 text-center">
                  <div className="inline-flex p-3 rounded-xl bg-green-500/20 mb-3">
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-base mb-1.5">Tezkor natijalar</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Darhol natijalarni ko'rish va tahlil qilish imkoniyati
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent hover:from-orange-500/20 transition-all duration-300 hover:scale-105 w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)] max-w-sm">
                <CardContent className="p-5 text-center">
                  <div className="inline-flex p-3 rounded-xl bg-orange-500/20 mb-3">
                    <Star className="h-5 w-5 text-orange-600 fill-orange-600" />
                  </div>
                  <h3 className="font-bold text-base mb-1.5">Premium qo'llab-quvvatlash</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    24/7 professional yordam va qo'llab-quvvatlash xizmati
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Trust Section */}
            <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-background via-muted/30 to-background backdrop-blur-sm">
              <CardContent className="py-6 px-5">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-1">
                    <Shield className="h-4 w-4 text-primary" />
                    <p className="font-bold text-sm sm:text-base text-primary">100% Kafolat</p>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Obuna bekor qilingan paytdan boshlab <span className="font-semibold text-foreground">darhol faol bo'ladi</span>. 
                    Har qanday savol yoki muammo bo'lsa, bizning{" "}
                    <Link href="/help-center" className="text-primary hover:text-primary/80 font-semibold underline underline-offset-2 decoration-2">
                      yordam markazimizga
                    </Link>{" "}
                    murojat qiling. Biz sizga <span className="font-medium">24/7 professional yordam</span> beramiz va 
                    har qanday masalada yonlashingizga tayyormiz.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          </section>
      </main>

      <Footer />
    </div>
  )
}
