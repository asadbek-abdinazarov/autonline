"use client"

import { useEffect } from 'react'

export interface QuizHotkeysHook {
    // This hook doesn't return anything, it just sets up event listeners
}

export function useQuizHotkeys(
    enabled: boolean,
    onSelectAnswer: (index: number) => void,
    onNext: () => void,
    onPrevious: () => void,
    variantsCount: number = 4
): void {
    useEffect(() => {
        if (!enabled) return

        const handleKeyPress = (e: KeyboardEvent) => {
            // Prevent hotkeys when user is typing in an input/textarea
            const target = e.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return
            }

            // Number keys (1-4) for selecting answers
            if (e.key >= '1' && e.key <= '4') {
                const index = parseInt(e.key) - 1
                if (index < variantsCount) {
                    e.preventDefault()
                    onSelectAnswer(index)
                }
            }

            // Arrow right for next question
            else if (e.key === 'ArrowRight') {
                e.preventDefault()
                onNext()
            }

            // Arrow left for previous question
            else if (e.key === 'ArrowLeft') {
                e.preventDefault()
                onPrevious()
            }
        }

        window.addEventListener('keydown', handleKeyPress)

        return () => {
            window.removeEventListener('keydown', handleKeyPress)
        }
    }, [enabled, onSelectAnswer, onNext, onPrevious, variantsCount])
}
