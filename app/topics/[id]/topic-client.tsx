"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { fetchQuestionsByLessonId, type QuestionApiResponse, getLocalizedLessonName, getLocalizedLessonDescription } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, FileQuestion, Play, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/hooks/use-translation"

interface TopicClientProps {
  topicId: string
}

export default function TopicClient({ topicId }: TopicClientProps) {
  const { t, language } = useTranslation()
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-12 mb-8 sm:mb-12">
          {/* Background gradient blobs */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span>{lessonData ? getLocalizedLessonName(lessonData, language) : t.topics.testInfo}</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-balance leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <span className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {lessonData ? getLocalizedLessonName(lessonData, language) : "Test mavzusi"}
                  </span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  {lessonData ? getLocalizedLessonDescription(lessonData, language) || "Test mavzusi" : "Test mavzusi"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
          <Card className="mb-8 sm:mb-10 border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <div className="text-6xl sm:text-7xl filter drop-shadow-lg">{lessonData.lessonIcon || "📚"}</div>
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
        </section>
      </main>
    </div>
  )
}
