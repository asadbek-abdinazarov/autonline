"use client"

import { useEffect, useState, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NewsCard } from "@/components/news-card"
import { TopicCard } from "@/components/topic-card"
import { fetchTopicsFromApi, type Topic } from "@/lib/data"
import { useNews } from "@/hooks/use-news"
import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { BookOpen, Newspaper, Loader2, Shuffle, Sparkles, TrendingUp, ArrowRight, Award } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { getCurrentUser, type Permission } from "@/lib/auth"

export default function HomeClient() {
  const { t } = useTranslation()
  const user = getCurrentUser()
  const hasPermission = (perm: Permission) => Array.isArray(user?.permissions) && user!.permissions!.includes(perm)
  const canViewNews = hasPermission('VIEW_NEWS')
  const canViewAllTopics = hasPermission('VIEW_ALL_TOPICS')
  const canViewLimitedTopics = hasPermission('LIMITED_TOPICS')
  const canViewRandom = hasPermission('VIEW_RANDOM')
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllTopics, setShowAllTopics] = useState(false)
  const { news, isLoading: newsLoading, error: newsError, fetchNews } = useNews()
  const hasFetchedRef = useRef(false)

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
        
        // Fetch both topics and news in parallel
        const [topicsData] = await Promise.all([
          fetchTopicsFromApi(),
          fetchNews()
        ])
        
        setTopics(topicsData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : t.home.topics.error)
        hasFetchedRef.current = false // Reset on error to allow retry
      } finally {
        setIsLoading(false)
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white text-sm font-medium shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="transition-transform duration-200 transition-colors duration-300">{t.home.hero.welcome}</span>
              </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-balance leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <span className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {t.home.hero.title}
                  </span>
                  <br />
                  <span className="text-slate-900 dark:text-white transition-transform duration-200 transition-colors duration-300">{t.home.hero.subtitle}</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
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
                <Button variant="outline" size="lg" asChild className="border-2 border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:scale-105 transition-all duration-300">
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
              {news.slice(0, 3).map((newsItem, index) => (
                <div 
                  key={newsItem.newsId} 
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 hover:scale-105 transition-transform"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                  <NewsCard news={newsItem} />
                </div>
              ))}
            </div>
          )}
        </section>
          )}

           {/* Special Features Section */}
           {canViewRandom && (
            <section className="container mx-auto px-4 py-8 sm:py-12 mb-8 sm:mb-12">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 dark:from-violet-500/10 dark:via-purple-500/10 dark:to-fuchsia-500/10 border border-violet-500/20 dark:border-violet-500/20 p-8 sm:p-12 backdrop-blur-xl">
                {/* Background decoration */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 dark:bg-violet-500/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/20 dark:bg-fuchsia-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center space-y-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-900 dark:text-white">{t.home.specialFeatures.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{t.home.specialFeatures.description}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      asChild 
                      size="lg" 
                      className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-base sm:text-lg px-8 py-6"
                    >
                      <Link href="/quiz/random" className="flex items-center gap-3">
                        <Shuffle className="h-5 w-5" />
                        {t.home.specialFeatures.randomQuizButton}
                      </Link>
                    </Button>
                  </div>
                </div>
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
                  className="border-2 border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300"
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
                {(canViewAllTopics
                  ? (showAllTopics ? topics : topics.slice(0, 6))
                  : topics.slice(0, 3)
                ).map((topic, index) => (
                  <div 
                    key={topic.id} 
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 hover:scale-105 transition-transform"
                    style={{ animationDelay: `${index * 100}ms` }}
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
