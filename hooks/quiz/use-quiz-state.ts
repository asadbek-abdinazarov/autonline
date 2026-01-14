"use client"

import { useState, useCallback } from 'react'

export interface QuizQuestion {
    questionId: number
    photo: string | null
    questionText: string
    variants: {
        variantId: number
        text: string
        isCorrect: boolean
    }[]
}

export interface QuizStateHook {
    currentQuestionIndex: number
    currentQuestion: QuizQuestion | null
    answers: Map<number, number>
    markedQuestions: Set<number>
    goToQuestion: (index: number) => void
    nextQuestion: () => void
    previousQuestion: () => void
    selectAnswer: (questionId: number, variantId: number) => void
    toggleMark: (questionId: number) => void
    isAnswered: (questionId: number) => boolean
    isMarked: (questionId: number) => boolean
    isLastQuestion: boolean
    isFirstQuestion: boolean
    totalQuestions: number
    answeredCount: number
    markedCount: number
}

export function useQuizState(questions: QuizQuestion[]): QuizStateHook {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Map<number, number>>(new Map())
    const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set())

    const currentQuestion = questions[currentQuestionIndex] || null
    const totalQuestions = questions.length
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1
    const isFirstQuestion = currentQuestionIndex === 0

    const goToQuestion = useCallback((index: number) => {
        if (index >= 0 && index < totalQuestions) {
            setCurrentQuestionIndex(index)
            // Scroll to top when changing questions
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [totalQuestions])

    const nextQuestion = useCallback(() => {
        if (!isLastQuestion) {
            setCurrentQuestionIndex(prev => prev + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [isLastQuestion])

    const previousQuestion = useCallback(() => {
        if (!isFirstQuestion) {
            setCurrentQuestionIndex(prev => prev - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [isFirstQuestion])

    const selectAnswer = useCallback((questionId: number, variantId: number) => {
        setAnswers(prev => {
            const newAnswers = new Map(prev)
            newAnswers.set(questionId, variantId)
            return newAnswers
        })
    }, [])

    const toggleMark = useCallback((questionId: number) => {
        setMarkedQuestions(prev => {
            const newMarked = new Set(prev)
            if (newMarked.has(questionId)) {
                newMarked.delete(questionId)
            } else {
                newMarked.add(questionId)
            }
            return newMarked
        })
    }, [])

    const isAnswered = useCallback((questionId: number) => {
        return answers.has(questionId)
    }, [answers])

    const isMarked = useCallback((questionId: number) => {
        return markedQuestions.has(questionId)
    }, [markedQuestions])

    const answeredCount = answers.size
    const markedCount = markedQuestions.size

    return {
        currentQuestionIndex,
        currentQuestion,
        answers,
        markedQuestions,
        goToQuestion,
        nextQuestion,
        previousQuestion,
        selectAnswer,
        toggleMark,
        isAnswered,
        isMarked,
        isLastQuestion,
        isFirstQuestion,
        totalQuestions,
        answeredCount,
        markedCount
    }
}
