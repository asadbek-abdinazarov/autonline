"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { fetchQuestionsByLessonId, type QuestionApiResponse } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, FileQuestion, Play, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/hooks/use-translation"

interface TopicClientProps {
  topicId: string
}

export default function TopicClient({ topicId }: TopicClientProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [lessonData, setLessonData] = useState<QuestionApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef<string | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }

    // Prevent duplicate requests for the same topicId
    if (hasFetchedRef.current === topicId) {
      return
    }

    hasFetchedRef.current = topicId

    // Fetch lesson data
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchQuestionsByLessonId(topicId)
        setLessonData(data)
      } catch (err) {
        console.error('Error fetching lesson data:', err)
        setError(err instanceof Error ? err.message : t.home.topics.error)
        hasFetchedRef.current = null // Reset on error to allow retry
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [topicId])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">{t.home.topics.loading}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error || !lessonData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                {error || t.home.topics.error}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.reload()}>
                  {t.common.retry}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/home">{t.common.back}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const timeInMinutes = Math.ceil(lessonData.questions.length * 1.2) // 1.2 minutes per question

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <Button variant="ghost" size="lg" asChild className="mb-6 sm:mb-8 hover:scale-105 transition-transform">
          <Link href="/home" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            {t.common.back}
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-8 sm:mb-10 border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="text-6xl sm:text-7xl filter drop-shadow-lg">{lessonData.lessonIcon || "📚"}</div>
                <div className="flex-1">
                  <CardTitle className="text-3xl sm:text-4xl md:text-5xl mb-3 text-balance bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                    {lessonData.lessonName}
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg text-pretty leading-relaxed">
                    {lessonData.lessonDescription || "Test mavzusi"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <FileQuestion className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t.topics.questionsCount}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">{lessonData.questions.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t.topics.time}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">{timeInMinutes} {t.topics.minutes}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t.topics.timePerQuestion}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">1.2 {t.topics.minutesShort}</p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-lg py-6" asChild>
                <Link href={`/quiz/${topicId}`} className="flex items-center justify-center gap-2">
                  <Play className="h-5 w-5" />
                  {t.topics.startTest}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileQuestion className="h-5 w-5 text-primary" />
                </div>
                {t.topics.testInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-4 text-lg sm:text-xl">{t.topics.tips}</h4>
                <ul className="list-none space-y-3">
                  {t.topics.tipsList.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-base leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
