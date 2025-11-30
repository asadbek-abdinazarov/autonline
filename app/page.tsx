"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { getCurrentUser } from "@/lib/auth"
import { useTranslation } from "@/hooks/use-translation"
import { interpolate } from "@/hooks/use-translation"
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Newspaper, 
  Award,
  ArrowRight,
  Users,
  Zap,
  LayoutDashboard,
  Shield,
  TrendingUp,
  Star,
  Target,
  Brain,
  Timer,
  RefreshCw,
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  Play,
  ChevronRight,
  Sparkles,
  GraduationCap,
  FileText,
  History,
  Crown,
  Loader2,
  LogIn
} from "lucide-react"

interface StatisticResponse {
  allQuestionCount: number
  allLessonHistoriesCount: number
  allActiveUserCount: number
  allPaymentCount: number
}

export default function LandingPage() {
  const { t } = useTranslation()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [statsValues, setStatsValues] = useState<string[]>(["500+", "1000+", "95%", "24/7"])
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Memoize stats with translations
  const stats = useMemo(() => [
    {
      value: statsValues[0],
      label: t.landing.stats.items[0].label,
      description: t.landing.stats.items[0].description,
      icon: FileText
    },
    {
      value: statsValues[1],
      label: t.landing.stats.items[1].label,
      description: t.landing.stats.items[1].description,
      icon: Users
    },
    {
      value: statsValues[2],
      label: t.landing.stats.items[2].label,
      description: t.landing.stats.items[2].description,
      icon: TrendingUp
    },
    {
      value: statsValues[3],
      label: t.landing.stats.items[3].label,
      description: t.landing.stats.items[3].description,
      icon: Clock
    }
  ], [statsValues, t])

  useEffect(() => {
    const user = getCurrentUser()
    setIsLoggedIn(!!user)
  }, [])

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoadingStats(true)
        const { buildApiUrl, getDefaultHeaders } = await import('@/lib/api-utils')
        const response = await fetch(buildApiUrl('/api/v1/statistic'), {
          method: 'GET',
          headers: getDefaultHeaders(),
        })

        if (!response.ok) {
          if (response.status >= 500 && response.status < 600) {
            const { handleApiError } = await import('@/lib/api-utils')
            await handleApiError({ status: response.status })
            return
          }
          throw new Error('Failed to fetch statistics')
        }

        const { safeJsonParse } = await import('@/lib/api-utils')
        const data = await safeJsonParse<StatisticResponse>(response)
        
        if (!data) {
          throw new Error(t.common.error)
        }

        setStatsValues([
          `${data.allQuestionCount}+`,
          `${data.allActiveUserCount}+`,
          `${data.allLessonHistoriesCount}+`,
          `${data.allPaymentCount}+`
        ])
      } catch (error) {
        console.error('Error fetching statistics:', error)
        const { handleApiError } = await import('@/lib/api-utils')
        await handleApiError(error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchStatistics()
  }, [t])

  // Get features from translations (first 6 items)
  const features = t.landing.features.items.slice(0, 6).map((item, index) => {
    const icons = [BookOpen, Clock, BarChart3, Newspaper, Award, Zap]
    const colors = [
      "from-blue-500 to-indigo-600",
      "from-green-500 to-emerald-600",
      "from-purple-500 to-pink-500",
      "from-red-500 to-rose-600",
      "from-indigo-500 to-purple-600",
      "from-amber-500 to-yellow-500"
    ]
    return {
      icon: icons[index],
      title: item.title,
      description: item.description,
      color: colors[index]
    }
  })

  // Get steps from translations
  const steps = t.landing.howItWorks.steps.map((step, index) => {
    const icons = [Users, Target, FileText, TrendingUp]
    return {
      number: step.number,
      title: step.title,
      description: step.description,
      icon: icons[index]
    }
  })

  // Get benefits from translations
  const benefits = t.landing.benefits.items.map((item, index) => {
    const icons = [Shield, Star, Timer, GraduationCap]
    return {
      icon: icons[index],
      title: item.title,
      description: item.description
    }
  })

  // Get FAQs from translations (first 4 items)
  const faqs = t.landing.faq.items.slice(0, 4)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col transition-colors duration-300">
      {/* Navigation */}
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section 
          className="relative overflow-hidden pt-16 sm:pt-24 md:pt-32 pb-16 sm:pb-24 md:pb-32"
          aria-label={t.landing.hero.title || "Asosiy bo'lim"}
        >
          {/* Background gradient blobs */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto px-4 text-center">
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white text-sm font-medium shadow-lg transition-all duration-300">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span>{t.landing.hero.badge}</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-balance leading-tight">
                <span className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {t.landing.hero.title}
                </span>
                <br />
                <span className="text-slate-900 dark:text-white">{t.landing.hero.subtitle}</span>
              </h1>

              <p className="text-xl sm:text-2xl md:text-3xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto text-balance">
                {interpolate(t.landing.hero.description, { count: t.landing.hero.countText })}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                {isLoggedIn ? (
                  <Button size="lg" asChild className="text-lg px-10 py-7 h-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/20 hover:shadow-blue-500/50 dark:hover:shadow-blue-500/50 transition-all duration-300">
                    <Link href="/home" className="flex items-center gap-2">
                      {t.common.goToDashboard}
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild variant="outline" className="text-lg px-10 py-7 h-auto border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300">
                      <Link href="/login" className="flex items-center gap-2">
                        <LogIn className="h-5 w-5" />
                        {t.common.login}
                      </Link>
                    </Button>
                    <Button size="lg" asChild className="text-lg px-10 py-7 h-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/20 hover:shadow-blue-500/50 dark:hover:shadow-blue-500/50 transition-all duration-300">
                      <Link href="/register" className="flex items-center gap-2">
                        {t.common.freeStart}
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div key={index} className="text-center group">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/20 mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{stat.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          id="features" 
          className="py-20 sm:py-24 md:py-32 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl"
          aria-label={t.landing.features.title || "Xususiyatlar"}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/20 mb-6">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
                {t.landing.features.title}
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                {t.landing.features.subtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-xl bg-slate-50/90 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/10 dark:hover:shadow-slate-900/50 hover:-translate-y-0.5"
                  >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${feature.color} opacity-10`} />
                    <div className="relative p-6">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section 
          id="how-it-works" 
          className="py-20 sm:py-24 md:py-32 relative overflow-hidden"
          aria-label={t.landing.howItWorks.title || "Qanday ishlaydi"}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"></div>
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16 sm:mb-20">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
                {t.landing.howItWorks.title}
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                {t.landing.howItWorks.subtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="relative group">
                    <div className="relative overflow-hidden rounded-xl bg-white/80 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/10 dark:hover:shadow-slate-900/50 hover:-translate-y-0.5 h-full">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/10 to-indigo-600/10" />
                      <div className="relative p-6 text-center">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full opacity-20 dark:opacity-20 group-hover:opacity-40 transition-opacity"></div>
                          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 dark:shadow-blue-500/20">
                            <span className="text-2xl font-bold text-white">{step.number}</span>
                          </div>
                        </div>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-slate-200/50 dark:bg-slate-700/50 mb-4">
                          <Icon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section 
          id="benefits" 
          className="py-20 sm:py-24 md:py-32 bg-gradient-to-br from-blue-500/95 via-indigo-600/95 to-purple-600/95 dark:from-blue-600/90 dark:via-indigo-700/90 dark:to-purple-600/90 relative overflow-hidden"
          aria-label={t.landing.benefits.title || "Afzalliklar"}
        >
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5 dark:opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 sm:mb-20">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
                {t.landing.benefits.title}
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {t.landing.benefits.subtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-xl bg-white/10 dark:bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/10 to-white/5" />
                    <div className="relative p-6">
                      <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section 
          className="py-20 sm:py-24 md:py-32 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl"
          aria-label={t.landing.stats.title || "Statistika"}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 sm:mb-20">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
                {t.landing.stats.title}
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                {t.landing.stats.subtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {isLoadingStats ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin relative z-10" />
                  </div>
                </div>
              ) : (
                stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-xl bg-slate-50/90 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/10 dark:hover:shadow-slate-900/50 hover:-translate-y-0.5 text-center"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/10 to-indigo-600/10" />
                      <div className="relative p-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{stat.label}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {stat.description}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section 
          id="faq" 
          className="py-20 sm:py-24 md:py-32 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl"
          aria-label={t.landing.faq.title || "Tez-tez so'raladigan savollar"}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/20 mb-6">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
                {t.landing.faq.title}
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                {t.landing.faq.subtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-slate-50/90 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/10 dark:hover:shadow-slate-900/50 hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/10 to-indigo-600/10" />
                  <div className="relative p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/20">
                        <HelpCircle className="h-4 w-4 text-white" />
                      </div>
                      {faq.question}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed ml-11">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="relative py-20 sm:py-24 md:py-32 overflow-hidden"
          aria-label={t.landing.cta.title || "Boshlash"}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/95 via-indigo-600/95 to-purple-600/95 dark:from-blue-600/90 dark:via-indigo-700/90 dark:to-purple-600/90"></div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5 dark:opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl mb-6 shadow-lg">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                {t.landing.cta.title}
              </h2>
              <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto">
                {interpolate(t.landing.cta.description, { count: t.landing.cta.countText })}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                {isLoggedIn ? (
                  <Button 
                    size="lg" 
                    asChild
                    className="text-lg px-10 py-7 h-auto bg-white/10 dark:bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href="/home" className="flex items-center gap-2">
                      {t.common.goToDashboard}
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      asChild
                      variant="outline"
                      className="text-lg px-10 py-7 h-auto bg-white/10 dark:bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white hover:bg-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Link href="/login" className="flex items-center gap-2">
                        <LogIn className="h-5 w-5" />
                        {t.common.login}
                      </Link>
                    </Button>
                    <Button 
                      size="lg" 
                      asChild
                      className="text-lg px-10 py-7 h-auto bg-white/10 dark:bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Link href="/register" className="flex items-center gap-2">
                        {t.common.freeStart}
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>
              
              {/* Contact Info */}
              <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80">
                <a href="tel:+998770108060" className="flex items-center gap-2 hover:text-white transition-colors duration-300">
                  <Phone className="h-5 w-5" />
                  <span>+998 77 010 80 60</span>
                </a>
                <a href="https://t.me/AsadbekAbdinazarov" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors duration-300">
                  <MessageCircle className="h-5 w-5" />
                  <span>{t.landing.cta.contact.telegram}</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
