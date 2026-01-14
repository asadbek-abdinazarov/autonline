"use client"

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, RotateCcw, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuizResults } from '@/hooks/quiz/use-quiz-results'

interface QuizResultsProps {
    results: QuizResults
    onRetry?: () => void
    onGoHome?: () => void
    showRetry?: boolean
    showGoHome?: boolean
}

export const QuizResultsComponent = memo(({
    results,
    onRetry,
    onGoHome,
    showRetry = true,
    showGoHome = true
}: QuizResultsProps) => {
    const isPassed = results.passed
    const percentage = results.percentage

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Result Status Card */}
            <Card className={cn(
                "border-2",
                isPassed ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-red-500 bg-red-50 dark:bg-red-900/20"
            )}>
                <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        {isPassed ? (
                            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle2 className="h-12 w-12 text-white" />
                            </div>
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center">
                                <XCircle className="h-12 w-12 text-white" />
                            </div>
                        )}
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl">
                        {isPassed ? "Tabriklaymiz! 🎉" : "Afsuski, o'tolmadingiz 😔"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center">
                        <div className="text-5xl sm:text-6xl font-bold mb-2">
                            {percentage.toFixed(1)}%
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                            {results.correctAnswers} / {results.totalQuestions} to'g'ri javob
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Jami savollar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {results.totalQuestions}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            To'g'ri
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {results.correctAnswers}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Noto'g'ri
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {results.incorrectAnswers}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Foiz
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {percentage.toFixed(0)}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {showRetry && onRetry && (
                    <Button
                        onClick={onRetry}
                        size="lg"
                        variant={isPassed ? "outline" : "default"}
                        className="gap-2"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Qayta urinish
                    </Button>
                )}

                {showGoHome && onGoHome && (
                    <Button
                        onClick={onGoHome}
                        size="lg"
                        variant={isPassed ? "default" : "outline"}
                        className="gap-2"
                    >
                        <Home className="h-4 w-4" />
                        Bosh sahifa
                    </Button>
                )}
            </div>

            {/* Pass Criteria Info */}
            <Card className="bg-slate-50 dark:bg-slate-900/50">
                <CardContent className="pt-6">
                    <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                        O'tish uchun minimal: <span className="font-semibold">70%</span>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}, (prevProps, nextProps) => {
    return prevProps.results === nextProps.results
})

QuizResultsComponent.displayName = 'QuizResults'
