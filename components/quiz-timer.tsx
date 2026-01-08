"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface QuizTimerProps {
  totalSeconds: number
  onTimeUp: () => void
  isPaused?: boolean
  minimal?: boolean
}

export function QuizTimer({ totalSeconds, onTimeUp, isPaused = false, minimal = false }: QuizTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)

  useEffect(() => {
    setRemainingSeconds(totalSeconds)
  }, [totalSeconds])

  useEffect(() => {
    if (isPaused || remainingSeconds <= 0) return

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, remainingSeconds, onTimeUp])

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  const isLowTime = remainingSeconds < 60
  const isCriticalTime = remainingSeconds < 30

  if (minimal) {
    return (
      <span
        className={cn(
          "font-mono text-sm font-semibold tabular-nums",
          isCriticalTime && "text-error animate-pulse",
          isLowTime && !isCriticalTime && "text-warning",
        )}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    )
  }

  return (
    <div
      className={cn(
        "text-2xl font-bold font-mono tabular-nums",
        isCriticalTime && "text-error animate-pulse",
        isLowTime && !isCriticalTime && "text-warning",
      )}
    >
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  )
}
