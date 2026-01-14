"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

export interface QuizTimerHook {
    timeLeft: number
    isPaused: boolean
    timerEnabled: boolean
    isRunning: boolean
    setTimerEnabled: (enabled: boolean) => void
    togglePause: () => void
    resetTimer: (newTime: number) => void
    formatTime: (seconds: number) => string
    startTimer: () => void
    stopTimer: () => void
}

export function useQuizTimer(
    initialTime: number,
    onTimeout?: () => void
): QuizTimerHook {
    const [timeLeft, setTimeLeft] = useState(initialTime)
    const [isPaused, setIsPaused] = useState(false)
    const [timerEnabled, setTimerEnabled] = useState(true)
    const [isRunning, setIsRunning] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        setIsRunning(false)
    }, [])

    const startTimer = useCallback(() => {
        if (!timerEnabled) return
        setIsRunning(true)
    }, [timerEnabled])

    useEffect(() => {
        if (!timerEnabled || isPaused || !isRunning) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            return
        }

        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                const newTime = prev - 1

                if (newTime <= 0) {
                    clearInterval(intervalRef.current!)
                    intervalRef.current = null
                    setIsRunning(false)

                    if (onTimeout) {
                        onTimeout()
                    }

                    return 0
                }

                return newTime
            })
        }, 1000)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [timerEnabled, isPaused, isRunning, onTimeout])

    const togglePause = useCallback(() => {
        setIsPaused(prev => !prev)
    }, [])

    const resetTimer = useCallback((newTime: number) => {
        setTimeLeft(newTime)
        setIsPaused(false)
        setIsRunning(false)
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [])

    const formatTime = useCallback((seconds: number): string => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }

        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }, [])

    return {
        timeLeft,
        isPaused,
        timerEnabled,
        isRunning,
        setTimerEnabled,
        togglePause,
        resetTimer,
        formatTime,
        startTimer,
        stopTimer
    }
}
