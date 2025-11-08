"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Crown, Check, Loader2, Sparkles, Zap, Shield, Star } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { useState } from "react"
import { useNotification } from "@/components/notification-provider"
import { useApi } from "@/hooks/use-api"
import { buildApiUrl } from "@/lib/api-utils"
import { cn } from "@/lib/utils"

interface SubscriptionPlan {
  id: number
  name: string
  price: number
  currency: string
  duration: string
  description: string
  features: string[]
  popular?: boolean
}

export function SubscriptionClient() {
  const [isProcessing, setIsProcessing] = useState(false)
  const { showNotification } = useNotification()
  const { makeAuthenticatedRequest } = useApi()

  // Mock subscription plans - in real app, fetch from API
  const plans: SubscriptionPlan[] = [
    {
        id: 1,
        name: "Haftalik obuna",
        price: 15000,
        currency: "UZS",
        duration: "1 hafta",
        description: "Bir 1 hafta uchun to'liq kirish",
        features: [
          "Barcha mavzulardan cheksiz test",
          "Tasodify testlar",
          "Barcha yangiliklar"
        ],
        popular: false
      },
    {
      id: 2,
      name: "Oylik obuna",
      price: 50000,
      currency: "UZS",
      duration: "1 oy",
      description: "Bir oy uchun to'liq kirish",
      features: [
        "Barcha mavzulardan cheksiz test",
        "Tasodify testlar",
        "Test tarixini ko'rish",
        "Barcha yangiliklar",
        "24/7 qo'llab-quvvatlash"
      ],
      popular: false
    },
    {
      id: 3,
      name: "Yillik obuna",
      price: 500000,
      currency: "UZS",
      duration: "12 oy",
      description: "Bir yil uchun to'liq kirish (2 oy bepul)",
      features: [
        "Barcha mavzulardan cheksiz test",
        "Tasodify testlar",
        "Test tarixini ko'rish",
        "Barcha yangiliklar",
        "24/7 qo'llab-quvvatlash",
        "Yangi funksiyalar birinchi bo'lib",
        "Maxsus imkoniyatlar"
      ],
      popular: true
    }
  ]

  const formatPrice = (price: number, currency: string) => {
    const formattedNumber = new Intl.NumberFormat('uz-UZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
    
    return `${formattedNumber} ${currency}`
  }

  const handleSubscribe = async (planId: number) => {
    try {
      setIsProcessing(true)

      // Call API to initiate payment
      const response = await makeAuthenticatedRequest(buildApiUrl('/api/v1/payment/create'), {
        method: 'POST',
        body: JSON.stringify({
          planId: planId,
          returnUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/subscription/success`
        }),
      })

      if (response) {
        const data = await response.json()
        
        // If payment URL is provided, redirect to payment gateway
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl
        } else {
          showNotification('To\'lov tizimi bilan bog\'lanildi', 'info')
        }
      }
    } catch (error) {
      console.error('Error initiating payment:', error)
      showNotification(
        error instanceof Error ? error.message : 'To\'lovni amalga oshirishda xatolik yuz berdi',
        'error'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <Header />

        <main className="container mx-auto px-4 py-8 sm:py-12 flex-1 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-8">
              <Button variant="ghost" size="sm" asChild className="hover:bg-muted/50">
                <Link href="/home" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Orqaga</span>
                </Link>
              </Button>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center gap-3 mb-6 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 backdrop-blur-sm border border-primary/20 shadow-lg">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 shadow-md transform rotate-[-5deg] hover:rotate-0 transition-transform duration-300">
                  <Crown className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
                    Premium Obuna
                  </h1>
                  <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                    Cheksiz imkoniyatlar sizni kutmoqda
                  </p>
                </div>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Barcha funksiyalardan foydalanish va imtihonga mukammal tayyorlanish uchun obuna sotib oling
              </p>
            </div>

            {/* Pricing Cards */}
            <div className={cn(
              "grid gap-6 mb-12",
              plans.length === 1 && "grid-cols-1 max-w-md mx-auto",
              plans.length === 2 && "grid-cols-1 md:grid-cols-2",
              plans.length === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
              plans.length >= 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            )}>
              {plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className={cn(
                    "relative",
                    plan.popular && plans.length <= 3 && "md:scale-[1.03]",
                    plan.popular && plans.length >= 4 && "md:scale-[1.02]"
                  )}
                >
                  {plan.popular && (
                    <>
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-full blur-md opacity-75 animate-pulse" />
                          <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2">
                            <Star className="h-4 w-4 fill-white animate-spin-slow" />
                            <span>ENG MASHHUR</span>
                            <Star className="h-4 w-4 fill-white animate-spin-slow" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-amber-500 to-primary rounded-3xl opacity-20 blur-xl" />
                    </>
                  )}
                  
                  <Card
                    className={cn(
                      "h-full relative overflow-hidden transition-all duration-300 flex flex-col",
                      plan.popular
                        ? "border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/10 via-background/95 to-primary/5 backdrop-blur-sm"
                        : "border shadow-md hover:shadow-lg bg-background/95 backdrop-blur-sm hover:border-primary/20",
                      "hover:scale-[1.01] hover:-translate-y-0.5"
                    )}
                  >
                    {/* Decorative corner element */}
                    {plan.popular && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
                    )}
                    
                    <CardHeader className="relative pb-3 pt-5">
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn(
                            "p-1.5 rounded-lg flex-shrink-0",
                            index === 0 
                              ? "bg-blue-500/10 text-blue-600" 
                              : "bg-amber-500/10 text-amber-600"
                          )}>
                            {index === 0 ? (
                              <Sparkles className="h-4 w-4" />
                            ) : (
                              <Zap className="h-4 w-4" />
                            )}
                          </div>
                          <CardTitle className="text-lg sm:text-xl font-bold leading-tight">
                            {plan.name}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs sm:text-sm mb-2 line-clamp-2">
                          {plan.description}
                        </CardDescription>
                      </div>
                      
                      <div className="flex items-baseline gap-2 mt-3 mb-2">
                        <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
                          {new Intl.NumberFormat('uz-UZ', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(plan.price)}
                        </span>
                        <div className="flex flex-col justify-center">
                          <span className="text-sm font-semibold text-muted-foreground">
                            {plan.currency}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / {plan.duration}
                          </span>
                        </div>
                      </div>
                      
                      {plan.popular && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 mt-2">
                          <span className="text-sm">🎁</span>
                          <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                            Bonus
                          </span>
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-3 pb-4 flex-1 flex flex-col">
                      <div className="border-t pt-3 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
                          <div className="p-1 rounded-md bg-primary/10">
                            <Shield className="h-3 w-3 text-primary" />
                          </div>
                          <span>Imkoniyatlar:</span>
                        </div>
                        <ul className="space-y-1">
                          {plan.features.map((feature, featureIndex) => (
                            <li 
                              key={featureIndex} 
                              className="flex items-start gap-2 group/item hover:bg-muted/20 p-1 rounded transition-colors"
                            >
                              <div className="mt-0.5 p-0.5 rounded-full bg-success/20 group-hover/item:bg-success/30 transition-all flex-shrink-0">
                                <Check className="h-3 w-3 text-success" />
                              </div>
                              <span className="text-xs sm:text-sm leading-relaxed text-foreground">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button
                        className={cn(
                          "w-full h-10 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 mt-2",
                          plan.popular
                            ? "bg-gradient-to-r from-primary via-blue-600 to-primary hover:from-primary/90 hover:via-blue-500 hover:to-primary/90 text-white"
                            : "bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-200 hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-200 dark:hover:to-gray-300 text-white dark:text-gray-900"
                        )}
                        size="sm"
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            <span className="hidden sm:inline">Jarayonda...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <Crown className="mr-1.5 h-3.5 w-3.5" />
                            <span>Sotib olish</span>
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Benefits Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <Card className="border-none shadow-md bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent hover:from-blue-500/20 transition-all duration-300 hover:scale-105">
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
              
              <Card className="border-none shadow-md bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent hover:from-green-500/20 transition-all duration-300 hover:scale-105">
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
              
              <Card className="border-none shadow-md bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent hover:from-orange-500/20 transition-all duration-300 hover:scale-105">
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
        </main>

        <Footer />
      </div>
    </AuthGuard>
  )
}
