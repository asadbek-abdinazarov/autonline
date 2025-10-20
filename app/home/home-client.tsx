"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { NewsCard } from "@/components/news-card"
import { TopicCard } from "@/components/topic-card"
import { fetchTopicsFromApi, type Topic } from "@/lib/data"
import { useNews } from "@/hooks/use-news"
import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { BookOpen, Newspaper, Loader2 } from "lucide-react"

export default function HomeClient() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { news, isLoading: newsLoading, error: newsError, fetchNews } = useNews()

  useEffect(() => {
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
        setError(err instanceof Error ? err.message : 'Ma\'lumotlar yuklanmadi')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [fetchNews])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-6 sm:py-8">
        <section className="mb-8 sm:mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-balance animate-in fade-in slide-in-from-bottom-4 duration-700">
            Haydovchilik imtihoniga biz bilan tayyorlaning!
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-balance px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            AutOnline qulay va oson imtihonlar platformasi siz uchun.
          </p>
        </section>

        <section className="mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse" />
              <h3 className="text-xl sm:text-2xl font-bold">Yangiliklar</h3>
            </div>
            <Button variant="ghost" size="sm" asChild className="hover:scale-105 transition-transform duration-200">
              <Link href="/news">Barchasini ko'rish</Link>
            </Button>
          </div>
          {newsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Yangiliklar yuklanmoqda...</p>
              </div>
            </div>
          ) : newsError ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">{newsError}</p>
              <Button onClick={fetchNews} size="sm">
                Qayta urinish
              </Button>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-8">
              <Newspaper className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Yangiliklar mavjud emas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {news.slice(0, 3).map((newsItem, index) => (
                <div 
                  key={newsItem.newsId} 
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <NewsCard news={newsItem} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold">Mavzular</h3>
                <p className="text-sm text-muted-foreground">Imtihon mavzularini tanlang va o'rganing</p>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground font-medium">Mavzular yuklanmoqda...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-lg text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Qayta urinish
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {topics.map((topic, index) => (
                <div 
                  key={topic.id} 
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  <TopicCard topic={topic} />
                </div>
              ))}
            </div>
          )}
        </section>
        </main>
      </div>
    </AuthGuard>
  )
}
