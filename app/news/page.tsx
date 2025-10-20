"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { NewsCard } from "@/components/news-card"
import { useNews } from "@/hooks/use-news"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Newspaper, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewsPage() {
  const router = useRouter()
  const { news, isLoading, error, fetchNews } = useNews()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
    } else {
      fetchNews()
    }
  }, [router, fetchNews])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Yangiliklar</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Yangiliklar yuklanmoqda...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchNews}>
              Qayta urinish
            </Button>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Hozircha yangiliklar yo'q</h3>
            <p className="text-muted-foreground">Tez orada yangi yangiliklar qo'shiladi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {news.map((newsItem) => (
              <NewsCard key={newsItem.newsId} news={newsItem} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
