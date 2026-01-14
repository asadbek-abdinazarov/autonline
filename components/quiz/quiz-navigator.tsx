"use client"

import { memo } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, Flag } from 'lucide-react'

interface QuizNavigatorProps {
    totalQuestions: number
    currentQuestionIndex: number
    answeredQuestions: Set<number> | Map<number, number>
    markedQuestions: Set<number>
    onQuestionClick: (index: number) => void
}

export const QuizNavigator = memo(({
    totalQuestions,
    currentQuestionIndex,
    answeredQuestions,
    markedQuestions,
    onQuestionClick
}: QuizNavigatorProps) => {
    const isAnswered = (questionIndex: number, questionId: number) => {
        if (answeredQuestions instanceof Map) {
            return answeredQuestions.has(questionId)
        }
        return answeredQuestions.has(questionIndex)
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Savollar
            </h3>

            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {Array.from({ length: totalQuestions }, (_, index) => {
                    const questionId = index + 1
                    const isCurrent = index === currentQuestionIndex
                    const answered = isAnswered(index, questionId)
                    const marked = markedQuestions.has(questionId)

                    return (
                        <button
                            key={index}
                            onClick={() => onQuestionClick(index)}
                            className={cn(
                                "relative h-10 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105",
                                isCurrent && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900",
                                answered && !isCurrent && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700",
                                !answered && !isCurrent && "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
                                isCurrent && answered && "bg-green-500 text-white",
                                isCurrent && !answered && "bg-blue-500 text-white"
                            )}
                        >
                            {index + 1}

                            {/* Marked Flag */}
                            {marked && (
                                <div className="absolute -top-1 -right-1">
                                    <Flag className="h-3 w-3 fill-orange-500 text-orange-500" />
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-500"></div>
                    <span className="text-slate-600 dark:text-slate-400">Joriy</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"></div>
                    <span className="text-slate-600 dark:text-slate-400">Javob berilgan</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></div>
                    <span className="text-slate-600 dark:text-slate-400">Javob berilmagan</span>
                </div>
                <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 fill-orange-500 text-orange-500" />
                    <span className="text-slate-600 dark:text-slate-400">Belgilangan</span>
                </div>
            </div>
        </div>
    )
}, (prevProps, nextProps) => {
    return (
        prevProps.currentQuestionIndex === nextProps.currentQuestionIndex &&
        prevProps.answeredQuestions === nextProps.answeredQuestions &&
        prevProps.markedQuestions === nextProps.markedQuestions
    )
})

QuizNavigator.displayName = 'QuizNavigator'
