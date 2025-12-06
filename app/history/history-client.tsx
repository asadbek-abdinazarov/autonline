"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { AuthGuard } from "@/components/auth-guard"
import { useLessonHistory } from "@/hooks/use-lesson-history"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Calendar, BookOpen, Loader2, ArrowLeft, TrendingUp, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useTranslation, interpolate } from "@/hooks/use-translation"
import { getLocalizedLessonName } from "@/lib/data"

export function HistoryClient() {
  const { t, language } = useTranslation()
  const { lessonHistory, stats, isLoading, error, fetchLessonHistory } = useLessonHistory()

  const getHistoryLessonName = (history: { lessonName: string | null; nameUz?: string; nameOz?: string; nameRu?: string }) => {
    if (history.nameUz || history.nameOz || history.nameRu) {
      return getLocalizedLessonName(
        {
          nameUz: history.nameUz || history.lessonName || "",
          nameOz: history.nameOz || history.lessonName || "",
          nameRu: history.nameRu || history.lessonName || "",
        },
        language,
      )
    }
    return history.lessonName || "Unknown Lesson"
  }

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
      const day = date.getDate()
      const month = t.history.dateFormat.months[date.getMonth()]
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, "0")
      const minutes = date.getMinutes().toString().padStart(2, "0")
      return `${day} ${month} ${year}, ${hours}:${minutes}`
    }
  }

  return (
    <AuthGuard requiredPermission="VIEW_TEST_HISTORY">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
        <Header />
        <main className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Back Button */}
            <div>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link href="/home" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t.common.back}
                </Link>
              </Button>
            </div>

            {/* Header Section */}
            <section className="space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">{t.history.title}</h1>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground">{t.history.description}</p>
              </div>
            </section>

            {/* Stats Grid */}
            {!isLoading && !error && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Tests Card */}
                <Card className="border-border/50 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-900/60 transition-colors">
                  <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{t.history.totalTests ?? "Total Tests"}</p>
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.totalTests}</p>
                      </div>
                      <div className="p-2 sm:p-3 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex-shrink-0">
                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Passed Tests Card */}
                <Card className="border-border/50 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-900/60 transition-colors">
                  <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{t.history.passed || "Passed"}</p>
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.passed}</p>
                      </div>
                      <div className="p-2 sm:p-3 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex-shrink-0">
                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Average Score Card */}
                <Card className="border-border/50 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-900/60 transition-colors">
                  <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">
                          {t.history.averageScore ?? "Average Score"}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.averageScore}%</p>
                      </div>
                      <div className="p-2 sm:p-3 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex-shrink-0">
                        <Target className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Success Rate Card */}
                <Card className="border-border/50 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-900/60 transition-colors">
                  <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{t.history.successRate ?? "Success Rate"}</p>
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.successRate}%</p>
                      </div>
                      <div className="p-2 sm:p-3 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex-shrink-0">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground font-medium text-lg">{t.history.loading}</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="py-12 text-center">
                  <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-6">
                    <XCircle className="h-12 w-12 text-destructive" />
                  </div>
                  <p className="text-lg text-foreground mb-8">{error}</p>
                  <Button onClick={fetchLessonHistory} variant="outline" size="lg">
                    {t.common.retry}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && lessonHistory.length === 0 && (
              <Card className="border-border/50 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="py-20 text-center">
                  <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-6">
                    <BookOpen className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">{t.history.empty}</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t.history.emptyDescription}</p>
                  <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/home">{t.history.viewTopics}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* History List */}
            {!isLoading && !error && lessonHistory.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t.history.recentTests ?? "Recent Tests"}</h2>
                <div className="space-y-3">
                  {lessonHistory.map((history) => {
                    const totalQuestions = history.allQuestionCount || history.correctAnswersCount + history.notCorrectAnswersCount
                    const isPassed = (history.percentage || 0) >= 70

                    return (
                      <Card
                        key={history.lessonHistoryId}
                        className={cn(
                          "border transition-all duration-300 hover:shadow-md hover:border-primary/50 cursor-pointer",
                          isPassed
                            ? "border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5 hover:from-green-500/10 hover:to-emerald-500/10"
                            : "border-red-500/30 bg-gradient-to-r from-red-500/5 to-rose-500/5 hover:from-red-500/10 hover:to-rose-500/10",
                        )}
                      >
                        <CardContent className="py-3 sm:py-4 px-4 sm:px-6">
                          <div className="flex flex-col gap-3 sm:gap-4">
                            {/* Top: Lesson Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                <span className="text-xl sm:text-2xl flex-shrink-0" role="img" aria-label="lesson icon">
                                  {history.lessonIcon || "📚"}
                                </span>
                                <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                                  {getHistoryLessonName(history)}
                                </h3>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="truncate">{formatDate(history.createdDate)}</span>
                                </div>
                                <span className="text-muted-foreground/50 hidden sm:inline">•</span>
                                <span className="hidden sm:inline">
                                  {totalQuestions} {t.history.totalQuestions?.toLowerCase() || "questions"}
                                </span>
                              </div>
                            </div>

                            {/* Bottom: Stats and Score */}
                            <div className="flex items-center justify-between gap-2 sm:gap-4 pt-2 border-t border-border/50">
                              {/* Correct Answers */}
                              <div className="text-center flex-1">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                                  <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                                    {t.history.correctAnswers || "Correct"}
                                  </span>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-foreground">{history.correctAnswersCount}</p>
                              </div>

                              {/* Incorrect Answers */}
                              <div className="text-center flex-1">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
                                  <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                                    {t.history.incorrectAnswers || "Incorrect"}
                                  </span>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-foreground">{history.notCorrectAnswersCount}</p>
                              </div>

                              {/* Score Badge */}
                              <Badge
                                className={cn(
                                  "px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base font-bold whitespace-nowrap flex-shrink-0",
                                  isPassed
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-red-600 hover:bg-red-700 text-white",
                                )}
                              >
                                {history.percentage}%
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
