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
import { getLocalizedLessonName } from "@/lib/data"

export function HistoryClient() {
  const { t, language } = useTranslation()
  const { lessonHistory, isLoading, error, fetchLessonHistory } = useLessonHistory()
  
  // Helper function to get localized lesson name from history item
  const getHistoryLessonName = (history: { lessonName: string; nameUz?: string; nameOz?: string; nameRu?: string }) => {
    if (history.nameUz || history.nameOz || history.nameRu) {
      return getLocalizedLessonName(
        {
          nameUz: history.nameUz || history.lessonName,
          nameOz: history.nameOz || history.lessonName,
          nameRu: history.nameRu || history.lessonName,
        },
        language
      )
    }
    return history.lessonName
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
        <Header />
        <main className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-5xl mx-auto">
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
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span>{t.history.title}</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-balance leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <span className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {t.history.title}
                      </span>
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                      {t.history.description}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500 dark:text-blue-400" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">{t.history.loading}</p>
                </div>
              </div>
            ) : error ? (
              <Card className="border-2 border-slate-300/50 dark:border-slate-700/50 shadow-xl bg-white/80 dark:bg-slate-800/40 backdrop-blur-xl transition-colors duration-300">
                <CardContent className="py-16 text-center">
                  <div className="p-4 rounded-full bg-destructive/10 dark:bg-destructive/20 w-fit mx-auto mb-6">
                    <XCircle className="h-12 w-12 text-destructive" />
                  </div>
                  <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">{error}</p>
                  <Button onClick={fetchLessonHistory} size="lg" variant="outline" className="border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300">
                    {t.common.retry}
                  </Button>
                </CardContent>
              </Card>
            ) : lessonHistory.length === 0 ? (
              <Card className="border-2 border-slate-300/50 dark:border-slate-700/50 shadow-xl bg-white/80 dark:bg-slate-800/40 backdrop-blur-xl transition-colors duration-300">
                <CardContent className="py-20 text-center">
                  <div className="p-4 rounded-full bg-slate-200/50 dark:bg-slate-700/50 w-fit mx-auto mb-6">
                    <BookOpen className="h-16 w-16 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-slate-900 dark:text-white">{t.history.empty}</h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                    {t.history.emptyDescription}
                  </p>
                  <Button size="lg" asChild className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/20 transition-all duration-300">
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
                        "border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-slate-50/90 dark:bg-slate-800/40 backdrop-blur-xl",
                        isPassed 
                          ? "border-green-500/30 dark:border-green-500/20 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30" 
                          : "border-red-500/30 dark:border-red-500/20 bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-900/20 dark:to-rose-900/20 hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/30 dark:hover:to-rose-900/30"
                      )}
                    >
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg sm:text-xl font-bold mb-2 line-clamp-2 flex items-center gap-2 sm:gap-3 text-slate-900 dark:text-white">
                              <span>{getHistoryLessonName(history)}</span>
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
                              <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                <span>{formatDate(history.createdDate)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                          <div className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-xl border-2 border-green-500/20 dark:border-green-500/30 hover:scale-105 transition-transform">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">{t.history.correctAnswers}</p>
                              <p className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400">{history.correctAnswersCount}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-500/20 dark:to-rose-500/20 rounded-xl border-2 border-red-500/20 dark:border-red-500/30 hover:scale-105 transition-transform">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                              <XCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">{t.history.incorrectAnswers}</p>
                              <p className="text-2xl sm:text-3xl font-bold text-red-700 dark:text-red-400">{history.notCorrectAnswersCount}</p>
                            </div>
                          </div>
                          
                          {totalQuestions > 0 && (
                            <div className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-xl border-2 border-blue-500/20 dark:border-blue-500/30 hover:scale-105 transition-transform">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">{t.history.totalQuestions}</p>
                                <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{totalQuestions}</p>
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

