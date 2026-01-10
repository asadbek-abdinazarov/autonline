"use client"

import { useEffect, useRef, useState } from "react"
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export function HistoryClient() {
  const { t, language } = useTranslation()
  const { lessonHistory, pagination, stats, isLoading, error, fetchLessonHistory } = useLessonHistory()
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 10
  const hasFetchedRef = useRef(false)

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
    fetchLessonHistory(currentPage, pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const handlePageChange = (page: number, e?: React.MouseEvent) => {
    e?.preventDefault()
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

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

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500 text-white dark:bg-green-600"
    if (percentage >= 60) return "bg-orange-500 text-white dark:bg-orange-600"
    return "bg-red-500 text-white dark:bg-red-600"
  }

  const renderPagination = () => {
    if (!pagination) return null

    const totalPages = Number(pagination.totalPages) || 0
    const current = Number(pagination.number) || 0
    const totalElements = Number(pagination.totalElements) || 0

    if (!totalPages || isNaN(totalPages) || isNaN(current)) return null
    if (totalElements <= pageSize) return null
    if (totalPages <= 1) return null

    if (totalPages <= 7) {
      const pageNumbers: number[] = []
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i)
      }
      return (
        <Pagination className="mt-6">
          <PaginationContent>
            {current > 0 && (
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => handlePageChange(current - 1, e)}
                  className="cursor-pointer"
                  href="#"
                />
              </PaginationItem>
            )}
            {pageNumbers.map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={(e) => handlePageChange(pageNum, e)}
                  isActive={pageNum === current}
                  className="cursor-pointer"
                  href="#"
                >
                  {pageNum + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            {current < totalPages - 1 && (
              <PaginationItem>
                <PaginationNext
                  onClick={(e) => handlePageChange(current + 1, e)}
                  className="cursor-pointer"
                  href="#"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )
    }

    const pages: (number | 'ellipsis')[] = []
    pages.push(0)

    if (current > 2) {
      pages.push('ellipsis')
    }

    const start = Math.max(1, current - 1)
    const end = Math.min(totalPages - 2, current + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < totalPages - 3) {
      pages.push('ellipsis')
    }
    
    pages.push(totalPages - 1)

    const uniquePages: (number | 'ellipsis')[] = []
    const seen = new Set<string | number>()
    
    for (const page of pages) {
      const key = page === 'ellipsis' ? 'ellipsis' : page
      if (!seen.has(key)) {
        seen.add(key)
        uniquePages.push(page)
      }
    }

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          {current > 0 && (
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => handlePageChange(current - 1, e)}
                className="cursor-pointer"
                href="#"
              />
            </PaginationItem>
          )}
          {uniquePages
            .filter((page) => page === 'ellipsis' || (typeof page === 'number' && !isNaN(page)))
            .map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }
              const pageNum = Number(page)
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={(e) => handlePageChange(pageNum, e)}
                    isActive={pageNum === current}
                    className="cursor-pointer"
                    href="#"
                  >
                    {pageNum + 1}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
          {current < totalPages - 1 && (
            <PaginationItem>
              <PaginationNext
                onClick={(e) => handlePageChange(current + 1, e)}
                className="cursor-pointer"
                href="#"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    )
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
                <Card className="border-border/50">
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
                <Card className="border-border/50">
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
                <Card className="border-border/50">
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
                <Card className="border-border/50">
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
                  <Button onClick={(e) => { e.preventDefault(); fetchLessonHistory(currentPage, pageSize); }} variant="outline" size="lg">
                    {t.common.retry}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && lessonHistory.length === 0 && (
              <Card className="border-border/50">
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
                      
                      >
                         <CardContent className="py-3 px-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          {/* Lesson Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg sm:text-xl flex-shrink-0" role="img" aria-label="lesson icon">
                {history.lessonIcon || "📚"}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                  {getHistoryLessonName(history)}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-9">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{formatDate(history.createdDate)}</span>
            </div>
          </div>

          {/* Stats - Horizontal layout */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Correct Answers */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                {history.correctAnswersCount}
              </p>
            </div>

            {/* Incorrect Answers */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                {history.notCorrectAnswersCount}
              </p>
            </div>

            {/* Score Badge */}
            <Badge
              className={cn(
                "px-3 py-1.5 text-sm sm:text-base font-bold whitespace-nowrap",
                getPercentageColor(history.percentage || 0),
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
                {renderPagination()}
              </section>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
