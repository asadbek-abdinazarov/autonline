"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { NewsCard } from "@/components/news-card"
import { useNews } from "@/hooks/use-news"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Newspaper, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/hooks/use-translation"

export default function NewsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { news, isLoading, error, fetchNews } = useNews()
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }

    // Prevent duplicate requests
    if (hasFetchedRef.current) {
      return
    }

    hasFetchedRef.current = true
    fetchNews()
  }, [fetchNews])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header Section */}
        <section className="relative overflow-hidden mb-12 sm:mb-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <Button variant="ghost" size="lg" asChild className="hover:scale-105 transition-transform">
              <Link href="/home" className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                {t.common.back}
            </Link>
          </Button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Newspaper className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-2">{t.news.title}</h1>
                <p className="text-muted-foreground">{t.news.description}</p>
              </div>
            </div>
          </div>
        </section>

        {/* News Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground font-medium text-lg">{t.news.loading}</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-6">
              <Newspaper className="h-10 w-10 text-destructive" />
            </div>
            <p className="text-xl text-muted-foreground mb-8">{error}</p>
            <Button onClick={fetchNews} size="lg">
              {t.common.retry}
            </Button>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20">
            <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-6">
              <Newspaper className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">{t.news.empty}</h3>
            <p className="text-lg text-muted-foreground mb-8">{t.news.emptyDescription}</p>
            <Button size="lg" variant="outline" asChild>
              <Link href="/home">{t.news.backToHome}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {news.map((newsItem, index) => (
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
      </main>
    </div>
  )
}
