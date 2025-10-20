"use client"

import { useEffect, useState, useRef } from "react"
import { Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface QuizTimerProps {
  totalSeconds: number
  onTimeUp: () => void
  isPaused?: boolean
}

export function QuizTimer({ totalSeconds, onTimeUp, isPaused = false }: QuizTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const hasCalledTimeUp = useRef(false)

  useEffect(() => {
    if (secondsLeft === 0 && !hasCalledTimeUp.current) {
      hasCalledTimeUp.current = true
      onTimeUp()
    }
  }, [secondsLeft, onTimeUp])

  useEffect(() => {
    if (isPaused || secondsLeft <= 0) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, secondsLeft])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const progress = (secondsLeft / totalSeconds) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-semibold">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">{Math.ceil(secondsLeft / 60)} daqiqa qoldi</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
