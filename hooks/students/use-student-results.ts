"use client"

import { useState, useCallback } from 'react'
import { useTranslation } from '@/hooks/use-translation'
import { buildApiUrl, getDefaultHeaders, safeJsonParse, handleApiError } from '@/lib/api-utils'

export interface LessonHistory {
    lessonHistoryId: number
    lessonName: string
    allQuestionCount: number
    createdDate: string
    correctAnswersCount: number
    notCorrectAnswersCount: number
    percentage: number
    lessonIcon?: string
}

export interface LessonStats {
    totalTests: number
    passed: number
    averageScore: number
    successRate: number
}

export interface LessonHistoryPagination {
    size: number
    number: number
    totalElements: number
    totalPages: number
}

export function useStudentResults() {
    const { language } = useTranslation()
    const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false)
    const [isResultsLoading, setIsResultsLoading] = useState(false)
    const [resultsError, setResultsError] = useState<string | null>(null)
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
    const [lessonStats, setLessonStats] = useState<LessonStats | null>(null)
    const [lessonHistories, setLessonHistories] = useState<LessonHistory[]>([])
    const [lessonHistoryPage, setLessonHistoryPage] = useState(0)
    const [lessonHistoryPagination, setLessonHistoryPagination] = useState<LessonHistoryPagination | null>(null)

    const fetchStudentResults = useCallback(async (student: any, page: number = 0, pageSize: number = 4) => {
        try {
            if (page === 0) {
                setSelectedStudent(student)
                setIsResultsDialogOpen(true)
                setLessonHistoryPage(0)
            } else {
                setLessonHistoryPage(page)
            }
            setIsResultsLoading(true)
            setResultsError(null)
            if (page === 0) {
                setLessonStats(null)
                setLessonHistories([])
                setLessonHistoryPagination(null)
            }

            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
            const apiLanguage = language === 'cyr' ? 'oz' : language === 'ru' ? 'ru' : 'uz'

            const headers: Record<string, string> = {
                ...getDefaultHeaders(),
                'Accept-Language': apiLanguage,
            }

            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const response = await fetch(buildApiUrl(`/api/v1/lesson-history/student/${student.userId}?page=${page}&size=${pageSize}`), {
                method: 'GET',
                headers,
            })

            if (!response.ok) {
                const errorData = await safeJsonParse<{ message?: string; error?: string }>(response)
                const errorMessage = errorData?.message || errorData?.error || null

                if (response.status >= 500 && response.status < 600) {
                    await handleApiError({ status: response.status })
                    setResultsError(errorMessage || "Server xatoligi. Iltimos, keyinroq urinib ko'ring.")
                    return
                }

                if (response.status === 401 || response.status === 429) {
                    setResultsError(errorMessage || "Natijalarni yuklashda xatolik yuz berdi.")
                    return
                }

                setResultsError(errorMessage || `HTTP error! status: ${response.status}`)
                return
            }

            type LessonHistoryResponse = {
                totalTests: number
                passed: number
                averageScore: number | string
                successRate: number | string
                lessonHistories: {
                    content: LessonHistory[]
                    page: LessonHistoryPagination
                }
            }

            const data = await safeJsonParse<LessonHistoryResponse>(response)
            if (!data) {
                setResultsError("Natijalar topilmadi yoki noto'g'ri format.")
                return
            }

            setLessonStats({
                totalTests: data.totalTests,
                passed: data.passed,
                averageScore: typeof data.averageScore === 'string' ? parseFloat(data.averageScore) : data.averageScore,
                successRate: typeof data.successRate === 'string' ? parseFloat(data.successRate) : data.successRate,
            })

            if (data.lessonHistories?.content) {
                setLessonHistories(data.lessonHistories.content)
            } else if (Array.isArray(data.lessonHistories)) {
                setLessonHistories(data.lessonHistories as any)
            } else {
                setLessonHistories([])
            }

            if (data.lessonHistories?.page) {
                setLessonHistoryPagination(data.lessonHistories.page)
            }
        } catch (err) {
            console.error('Error fetching lesson history for student:', err)
            const message =
                err instanceof Error ? err.message : "Natijalarni yuklashda kutilmagan xatolik yuz berdi."
            setResultsError(message)
        } finally {
            setIsResultsLoading(false)
        }
    }, [language])

    const closeResultsDialog = useCallback(() => {
        setIsResultsDialogOpen(false)
        setSelectedStudent(null)
        setLessonStats(null)
        setLessonHistories([])
        setLessonHistoryPagination(null)
        setLessonHistoryPage(0)
        setResultsError(null)
    }, [])

    return {
        isResultsDialogOpen,
        setIsResultsDialogOpen,
        isResultsLoading,
        resultsError,
        selectedStudent,
        lessonStats,
        lessonHistories,
        lessonHistoryPage,
        setLessonHistoryPage,
        lessonHistoryPagination,
        fetchStudentResults,
        closeResultsDialog
    }
}
