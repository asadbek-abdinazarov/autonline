"use client"

import { memo } from 'react'
import { Clock, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuizTimerProps {
    timeLeft: number
    isPaused: boolean
    formatTime: (seconds: number) => string
    onTogglePause?: () => void
    showPauseButton?: boolean
}

export const QuizTimer = memo(({
    timeLeft,
    isPaused,
    formatTime,
    onTogglePause,
    showPauseButton = false
}: QuizTimerProps) => {
    const isLowTime = timeLeft < 300 // Less than 5 minutes
    const isCriticalTime = timeLeft < 60 // Less than 1 minute

    return (
        <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold transition-colors",
            isCriticalTime && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 animate-pulse",
            isLowTime && !isCriticalTime && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
            !isLowTime && "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        )}>
            <Clock className="h-5 w-5" />
            <span>{formatTime(timeLeft)}</span>

            {showPauseButton && onTogglePause && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onTogglePause}
                    className="ml-2 h-8 w-8 p-0"
                >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
            )}
        </div>
    )
}, (prevProps, nextProps) => {
    return (
        prevProps.timeLeft === nextProps.timeLeft &&
        prevProps.isPaused === nextProps.isPaused
    )
})

QuizTimer.displayName = 'QuizTimer'
