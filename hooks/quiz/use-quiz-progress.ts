"use client"

import { useMemo } from 'react'

export interface QuizProgress {
    totalQuestions: number
    answeredQuestions: number
    unansweredQuestions: number
    markedQuestions: number
    progressPercentage: number
    completionStatus: 'not-started' | 'in-progress' | 'completed'
}

export function useQuizProgress(
    totalQuestions: number,
    answeredCount: number,
    markedCount: number
): QuizProgress {
    return useMemo(() => {
        const unanswered = totalQuestions - answeredCount
        const percentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

        let status: 'not-started' | 'in-progress' | 'completed' = 'not-started'
        if (answeredCount === totalQuestions) {
            status = 'completed'
        } else if (answeredCount > 0) {
            status = 'in-progress'
        }

        return {
            totalQuestions,
            answeredQuestions: answeredCount,
            unansweredQuestions: unanswered,
            markedQuestions: markedCount,
            progressPercentage: percentage,
            completionStatus: status,
        }
    }, [totalQuestions, answeredCount, markedCount])
}
