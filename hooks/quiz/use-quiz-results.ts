"use client"

import { useState, useCallback } from 'react'
import { buildApiUrl, getDefaultHeaders, safeJsonParse } from '@/lib/api-utils'

export interface QuizResults {
    testResultId?: number
    score: number
    totalQuestions: number
    correctAnswers: number
    incorrectAnswers: number
    percentage: number
    passed: boolean
    timeSpent?: number
}

export interface QuizResultsHook {
    isSubmitting: boolean
    results: QuizResults | null
    error: string | null
    calculateResults: (questions: any[], answers: Map<number, number>) => QuizResults
    submitQuiz: (endpoint: string, data: any, language: string) => Promise<QuizResults | null>
    resetResults: () => void
}

export function useQuizResults(): QuizResultsHook {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [results, setResults] = useState<QuizResults | null>(null)
    const [error, setError] = useState<string | null>(null)

    const calculateResults = useCallback((questions: any[], answers: Map<number, number>): QuizResults => {
        let correctCount = 0

        questions.forEach(question => {
            const selectedVariantId = answers.get(question.questionId)
            const correctVariant = question.variants.find((v: any) => v.isCorrect)

            if (selectedVariantId && correctVariant && selectedVariantId === correctVariant.variantId) {
                correctCount++
            }
        })

        const total = questions.length
        const percentage = total > 0 ? (correctCount / total) * 100 : 0
        const passed = percentage >= 70

        return {
            score: correctCount,
            totalQuestions: total,
            correctAnswers: correctCount,
            incorrectAnswers: total - correctCount,
            percentage,
            passed
        }
    }, [])

    const submitQuiz = useCallback(async (
        endpoint: string,
        data: any,
        language: string
    ): Promise<QuizResults | null> => {
        setIsSubmitting(true)
        setError(null)

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
            const apiLanguage = language === 'cyr' ? 'oz' : language === 'ru' ? 'ru' : 'uz'

            const headers: Record<string, string> = {
                ...getDefaultHeaders(),
                'Accept-Language': apiLanguage,
            }

            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const response = await fetch(buildApiUrl(endpoint), {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await safeJsonParse<{ message?: string }>(response)
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`)
            }

            const result = await safeJsonParse<QuizResults>(response)

            if (result) {
                setResults(result)
                return result
            }

            return null
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit quiz'
            setError(errorMessage)
            console.error('Error submitting quiz:', err)
            return null
        } finally {
            setIsSubmitting(false)
        }
    }, [])

    const resetResults = useCallback(() => {
        setResults(null)
        setError(null)
        setIsSubmitting(false)
    }, [])

    return {
        isSubmitting,
        results,
        error,
        calculateResults,
        submitQuiz,
        resetResults
    }
}
