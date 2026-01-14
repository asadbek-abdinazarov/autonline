"use client"

import { memo } from 'react'
import { Progress } from '@/components/ui/progress'

interface QuizProgressBarProps {
    current: number
    total: number
    variant?: 'default' | 'success' | 'warning'
}

export const QuizProgressBar = memo(({
    current,
    total,
    variant = 'default'
}: QuizProgressBarProps) => {
    const percentage = total > 0 ? (current / total) * 100 : 0

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                    Jarayon
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                    {current} / {total}
                </span>
            </div>
            <Progress
                value={percentage}
                className="h-2"
            />
            <p className="text-xs text-slate-600 dark:text-slate-400">
                {percentage.toFixed(0)}% bajarildi
            </p>
        </div>
    )
}, (prevProps, nextProps) => {
    return (
        prevProps.current === nextProps.current &&
        prevProps.total === nextProps.total
    )
})

QuizProgressBar.displayName = 'QuizProgressBar'
