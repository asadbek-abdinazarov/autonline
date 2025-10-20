"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { fetchQuestionsByLessonId, type QuestionApiResponse } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, FileQuestion, Play, Loader2 } from "lucide-react"
import Link from "next/link"

interface TopicClientProps {
  topicId: string
}

export default function TopicClient({ topicId }: TopicClientProps) {
  const router = useRouter()
  const [lessonData, setLessonData] = useState<QuestionApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }

    // Fetch lesson data
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchQuestionsByLessonId(topicId)
        setLessonData(data)
      } catch (err) {
        console.error('Error fetching lesson data:', err)
        setError(err instanceof Error ? err.message : 'Mavzu ma\'lumotlari yuklanmadi')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, topicId])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Mavzu ma'lumotlari yuklanmoqda...</p>
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
                {error || "Mavzu ma'lumotlari yuklanmadi. Iltimos, qayta urinib ko'ring."}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.reload()}>
                  Qayta urinish
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/home">Bosh sahifaga qaytish</Link>
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 sm:mb-6">
          <Link href="/home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Orqaga
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="text-5xl sm:text-6xl">{lessonData.lessonIcon || "📚"}</div>
                <div className="flex-1">
                  <CardTitle className="text-2xl sm:text-3xl mb-2 text-balance">{lessonData.lessonName}</CardTitle>
                  <CardDescription className="text-sm sm:text-base text-pretty">
                    {lessonData.lessonDescription || "Test mavzusi"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted rounded-lg">
                  <FileQuestion className="h-7 w-7 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Savollar soni</p>
                    <p className="text-xl sm:text-2xl font-bold">{lessonData.questions.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted rounded-lg">
                  <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Vaqt</p>
                    <p className="text-xl sm:text-2xl font-bold">{timeInMinutes} daqiqa</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted rounded-lg">
                  <Play className="h-7 w-7 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Har bir savol</p>
                    <p className="text-xl sm:text-2xl font-bold">1.2 daq</p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="w-full" asChild>
                <Link href={`/quiz/${topicId}`}>
                  <Play className="mr-2 h-5 w-5" />
                  Testni boshlash
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Test haqida ma'lumot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Qoidalar:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <li>Har bir savol uchun {(timeInMinutes / lessonData.questions.length).toFixed(1)} daqiqa vaqt beriladi</li>
                  <li>To'g'ri javoblar yashil rangda ko'rsatiladi</li>
                  <li>Noto'g'ri javoblar qizil rangda ko'rsatiladi</li>
                  <li>Javob bergandan keyin avtomatik keyingi savolga o'tiladi</li>
                  <li>Test tugagandan so'ng natijalaringizni ko'rishingiz mumkin</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Maslahatlar:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <li>Savolni diqqat bilan o'qing</li>
                  <li>Barcha variantlarni ko'rib chiqing</li>
                  <li>Ishonchingiz komil bo'lmasa, mantiqiy fikrlang</li>
                  <li>Vaqtni to'g'ri taqsimlang</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
