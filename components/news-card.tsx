import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

interface NewsItem {
  newsId: number
  newsTitle: string
  newsDescription: string
  newsPhoto: string
  isActive: boolean
  newsCreatedAt: string
}

interface NewsCardProps {
  news: NewsItem
}

export function NewsCard({ news }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInHours < 1) {
      return 'Hozir'
    } else if (diffInHours < 24) {
      return `${diffInHours} soat oldin`
    } else if (diffInDays < 7) {
      return `${diffInDays} kun oldin`
    } else {
      // Format as "18 Avgust 2025"
      const day = date.getDate()
      const monthNames = [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
      ]
      const month = monthNames[date.getMonth()]
      const year = date.getFullYear()
      
      return `${day} ${month} ${year}`
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border border-slate-300/50 dark:border-slate-700/50 bg-slate-50/90 dark:bg-slate-800/40 backdrop-blur-xl">
      <div className="relative h-48 w-full">
        <Image 
          src={news.newsPhoto || "/placeholder.svg"} 
          alt={news.newsTitle || "Yangilik rasmi"} 
          fill 
          className="object-cover" 
        />
      </div>
      <CardHeader>
        <CardTitle className="text-lg text-balance text-slate-900 dark:text-white">{news.newsTitle}</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">{formatDate(news.newsCreatedAt)}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-pretty">{news.newsDescription}</p>
      </CardContent>
    </Card>
  )
}
