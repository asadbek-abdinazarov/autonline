"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { AuthGuard } from "@/components/auth-guard"
import { useLessonHistory } from "@/hooks/use-lesson-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Calendar, BookOpen, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useTranslation, interpolate } from "@/hooks/use-translation"

export function HistoryClient() {
  const { t } = useTranslation()
  const { lessonHistory, isLoading, error, fetchLessonHistory } = useLessonHistory()

  useEffect(() => {
    fetchLessonHistory()
  }, [fetchLessonHistory])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInHours < 1) {
      return t.history.dateFormat.now
    } else if (diffInHours < 24) {
      return interpolate(t.history.dateFormat.hoursAgo, { hours: diffInHours.toString() })
    } else if (diffInDays < 7) {
      return interpolate(t.history.dateFormat.daysAgo, { days: diffInDays.toString() })
    } else {
      // Format as "18 Avgust 2025, 14:30"
      const day = date.getDate()
      const month = t.history.dateFormat.months[date.getMonth()]
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      return `${day} ${month} ${year}, ${hours}:${minutes}`
    }
  }

  return (
    <AuthGuard requiredPermission="VIEW_TEST_HISTORY">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-5xl mx-auto">
            {/* Hero Section */}
            <section className="relative overflow-hidden mb-12 sm:mb-16">
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <Button variant="ghost" size="lg" asChild className="hover:scale-105 transition-transform">
                  <Link href="/home" className="flex items-center gap-2">
                    <ArrowLeft className="h-5 w-5" />
                    {t.common.back}
                  </Link>
                </Button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                <div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {t.history.title}
                  </h1>
                    <p className="text-muted-foreground">
                      {t.history.description}
                  </p>
                  </div>
                </div>
              </div>
            </section>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground font-medium text-lg">{t.history.loading}</p>
                </div>
              </div>
            ) : error ? (
              <Card className="border-2 shadow-xl bg-card/80 backdrop-blur-sm">
                <CardContent className="py-16 text-center">
                  <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-6">
                    <XCircle className="h-12 w-12 text-destructive" />
                  </div>
                  <p className="text-xl text-muted-foreground mb-8">{error}</p>
                  <Button onClick={fetchLessonHistory} size="lg" variant="outline">
                    {t.common.retry}
                  </Button>
                </CardContent>
              </Card>
            ) : lessonHistory.length === 0 ? (
              <Card className="border-2 shadow-xl bg-card/80 backdrop-blur-sm">
                <CardContent className="py-20 text-center">
                  <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-6">
                    <BookOpen className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3">{t.history.empty}</h3>
                  <p className="text-lg text-muted-foreground mb-8">
                    {t.history.emptyDescription}
                  </p>
                  <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Link href="/home">{t.history.viewTopics}</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {lessonHistory.map((history) => {
                  const totalQuestions = history.allQuestionCount || (history.correctAnswersCount + history.notCorrectAnswersCount)
                  const isPassed = history.percentage >= 70
                  
                  return (
                    <Card 
                      key={history.lessonHistoryId} 
                      className={cn(
                        "border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-card/80 backdrop-blur-sm",
                        isPassed 
                          ? "border-green-500/30 bg-gradient-to-br from-green-50/50 to-emerald-50/50 hover:from-green-50 hover:to-emerald-50" 
                          : "border-red-500/30 bg-gradient-to-br from-red-50/50 to-rose-50/50 hover:from-red-50 hover:to-rose-50"
                      )}
                    >
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg sm:text-xl font-bold mb-2 line-clamp-2 flex items-center gap-2 sm:gap-3">
                              <span>{history.lessonName}</span>
                              <span className="text-2xl sm:text-3xl flex-shrink-0" role="img" aria-label="lesson icon">
                                {history.lessonIcon || '📚'}
                              </span>
                            </CardTitle>
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                              <Badge 
                                variant={isPassed ? "default" : "destructive"}
                                className={cn(
                                  "text-sm sm:text-base px-3 py-1.5 h-auto font-semibold flex items-center gap-1.5 sm:gap-2",
                                  isPassed 
                                    ? "bg-green-500 hover:bg-green-600 text-white" 
                                    : "bg-red-500 hover:bg-red-600 text-white"
                                )}
                              >
                                {isPassed ? (
                                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                ) : (
                                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                )}
                                <span>{history.percentage}%</span>
                                <span className="text-xs sm:text-sm opacity-90">
                                  {isPassed ? `(${t.history.passed})` : `(${t.history.failed})`}
                                </span>
                              </Badge>
                              <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-muted-foreground">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                <span>{formatDate(history.createdDate)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                          <div className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border-2 border-green-500/20 hover:scale-105 transition-transform">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t.history.correctAnswers}</p>
                              <p className="text-2xl sm:text-3xl font-bold text-green-700">{history.correctAnswersCount}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-xl border-2 border-red-500/20 hover:scale-105 transition-transform">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                              <XCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t.history.incorrectAnswers}</p>
                              <p className="text-2xl sm:text-3xl font-bold text-red-700">{history.notCorrectAnswersCount}</p>
                            </div>
                          </div>
                          
                          {totalQuestions > 0 && (
                            <div className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border-2 border-blue-500/20 hover:scale-105 transition-transform">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t.history.totalQuestions}</p>
                                <p className="text-2xl sm:text-3xl font-bold text-primary">{totalQuestions}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}

