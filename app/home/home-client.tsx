"use client"

import { useEffect, useState, useRef, startTransition, useMemo, useCallback } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NewsCard } from "@/components/news-card"
import { TopicCard } from "@/components/topic-card"
import { fetchTopicsFromApi, type Topic } from "@/lib/data"
import { useNews } from "@/hooks/use-news"
import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { BookOpen, Newspaper, Loader2, Shuffle, Sparkles, TrendingUp, ArrowRight, Award, Signpost } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { getCurrentUser, type Permission, type User } from "@/lib/auth"

export default function HomeClient() {
  const { t } = useTranslation()
  const [user, setUser] = useState<User | null>(getCurrentUser())
  const hasPermission = useCallback((perm: Permission) => Array.isArray(user?.permissions) && user!.permissions!.includes(perm), [user?.permissions])
  const canViewNews = useMemo(() => hasPermission('VIEW_NEWS'), [hasPermission])
  const canViewAllTopics = useMemo(() => hasPermission('VIEW_ALL_TOPICS'), [hasPermission])
  const canViewLimitedTopics = useMemo(() => hasPermission('LIMITED_TOPICS'), [hasPermission])
  const canViewRandom = useMemo(() => hasPermission('VIEW_RANDOM'), [hasPermission])
  const canViewTrafficSigns = useMemo(() => hasPermission('VIEW_TRAFFIC_SIGNS'), [hasPermission])
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllTopics, setShowAllTopics] = useState(true)
  const { news, isLoading: newsLoading, error: newsError, fetchNews } = useNews()
  const hasFetchedRef = useRef(false)

  // Memoize displayed topics list
  const displayedTopics = useMemo(() => {
    if (canViewAllTopics) {
      return showAllTopics ? topics : topics.slice(0, 6)
    } else if (canViewLimitedTopics) {
      return topics.slice(0, 3)
    }
    return []
  }, [topics, showAllTopics, canViewAllTopics, canViewLimitedTopics])

  // Memoize displayed news
  const displayedNews = useMemo(() => news.slice(0, 3), [news])

  // Listen for user data updates
  useEffect(() => {
    // Initial check to ensure state is in sync with localStorage (fixes post-login visibility)
    setUser(getCurrentUser())

    const handleUserUpdate = () => {
      setUser(getCurrentUser())
    }

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        handleUserUpdate()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('userUpdated', handleUserUpdate)
      window.addEventListener('storage', handleStorageChange)

      return () => {
        window.removeEventListener('userUpdated', handleUserUpdate)
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [])

  useEffect(() => {
    // Prevent duplicate requests
    if (hasFetchedRef.current) {
      return
    }

    hasFetchedRef.current = true

    // Fetch topics and news
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch both topics and news in parallel - properly handle both results
        const [topicsData] = await Promise.all([
          fetchTopicsFromApi(),
          fetchNews() // This is called but result is not used - it updates the hook state
        ])

        // Use startTransition to batch state updates and make them non-blocking
        startTransition(() => {
          setTopics(topicsData)
          setIsLoading(false)
        })
      } catch (err) {
        console.error('Error fetching data:', err)
        startTransition(() => {
          setError(err instanceof Error ? err.message : t.home.topics.error)
          setIsLoading(false)
        })
        hasFetchedRef.current = false // Reset on error to allow retry
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col transition-colors duration-300">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-12">
            {/* Background gradient blobs */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="container mx-auto px-4 text-center">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 text-slate-900 dark:text-white text-sm font-medium shadow-lg transition-colors duration-200">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span>{t.home.hero.welcome}</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-balance leading-tight">
                  <span className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {t.home.hero.title}
                  </span>
                  <br />
                  <span className="text-slate-900 dark:text-white">{t.home.hero.subtitle}</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-balance">
                  {t.home.hero.description}
                </p>
              </div>
            </div>
          </section>

          {/* News Section */}
          {canViewNews && (
            <section className="container mx-auto px-4 py-8 sm:py-12 mb-8 sm:mb-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 dark:shadow-orange-500/20">
                    <Newspaper className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-900 dark:text-white">{t.home.news.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{t.home.news.description}</p>
                  </div>
                </div>
                {news.length > 3 && (
                  <Button variant="outline" size="lg" asChild className="border-2 border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:scale-105 transition-transform duration-200">
                    <Link href="/news" className="flex items-center gap-2">
                      {t.common.viewAll}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
              {newsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-blue-500 dark:text-blue-400" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">{t.home.news.loading}</p>
                  </div>
                </div>
              ) : newsError ? (
                <div className="text-center py-16">
                  <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-4">
                    <Newspaper className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">{newsError}</p>
                  <Button onClick={fetchNews} size="lg">
                    {t.common.retry}
                  </Button>
                </div>
              ) : news.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
                    <Newspaper className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{t.home.news.empty}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{t.home.news.emptyDescription}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {displayedNews.map((newsItem, index) => (
                    <div
                      key={newsItem.newsId}
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      <NewsCard news={newsItem} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

      {/* Learning Hub Section - Minimalist & Premium */}
{(canViewRandom || canViewTrafficSigns) && (
  <section className="container mx-auto px-4 py-16 mb-8">
    
    {/* Section Header - Clean & Centered */}
    <div className="text-center max-w-2xl mx-auto mb-10">
      <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white animate-gradient-x mb-4">
        Maxsus bo'limlar
      </h2>
      <p className="text-slate-600 dark:text-slate-400 text-lg">
        Yo'l harakati qoidalarini o'rganishning interaktiv usullari
      </p>
    </div>

    {/* Cards Grid */}
    <div className={`grid gap-6 ${canViewRandom && canViewTrafficSigns ? 'md:grid-cols-2' : 'max-w-3xl mx-auto'}`}>
      
      {/* 1. Random Quiz Card (Blue Theme) */}
      {canViewRandom && (
        <Link href="/quiz/random" className="group block h-full outline-none">
          <div className="relative h-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10">
            
            <div className="flex flex-col h-full">
              {/* Icon & Badge */}
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 dark:group-hover:bg-blue-600 dark:group-hover:border-blue-600 transition-colors duration-300">
                  <Sparkles className="h-7 w-7 text-blue-600 dark:text-blue-400 dark:group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800">
                  Test
                </span>
              </div>

              {/* Text Content */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {t.home.randomQuiz.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {(t as any).home.randomQuiz?.description || "Tasodifiy savollar orqali bilimingizni sinang va imtihonga tayyorlaning."}
                </p>
              </div>

              {/* Bottom Action Area */}
              <div className="mt-auto flex items-center text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {t.home.randomQuiz.randomQuizButton}
                <Shuffle className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* 2. Traffic Signs Card (Emerald Theme) */}
      {canViewTrafficSigns && (
        <Link href="/traffic-signs" className="group block h-full outline-none">
          <div className="relative h-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10">
            
            <div className="flex flex-col h-full">
              {/* Icon & Badge */}
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 dark:group-hover:bg-emerald-600 dark:group-hover:border-emerald-600 transition-colors duration-300">
                  <Signpost className="h-7 w-7 text-emerald-600 dark:text-emerald-400 dark:group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 rounded-full border border-emerald-100 dark:border-emerald-800">
                  Katalog
                </span>
              </div>

              {/* Text Content */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                  {t.home.trafficSigns.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.home.trafficSigns.description}
                </p>
              </div>

              {/* Bottom Action Area */}
              <div className="mt-auto flex items-center text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {t.home.trafficSigns.button}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </Link>
      )}
    </div>
  </section>
          )}

          {/* Topics Section */}
          {(canViewAllTopics || canViewLimitedTopics) && (
            <section className="container mx-auto px-4 py-8 sm:py-12 mb-8 sm:mb-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 dark:shadow-blue-500/20">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-900 dark:text-white">{t.home.topics.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{t.home.topics.description}</p>
                  </div>
                </div>
                {canViewAllTopics && topics.length > 6 && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setShowAllTopics(!showAllTopics)}
                      className="border-2 border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                    >
                      {showAllTopics ? t.home.topics.showLess : t.home.topics.viewAll}
                    </Button>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500 dark:text-blue-400" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">{t.home.topics.loading}</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-6">
                    <BookOpen className="h-10 w-10 text-destructive" />
                  </div>
                  <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">{error}</p>
                  <Button onClick={() => window.location.reload()} size="lg" variant="outline">
                    {t.common.retry}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                  {displayedTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      <TopicCard topic={topic} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </main>

        <Footer />
      </div>
    </AuthGuard>
  )
}
