"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { buildApiUrl } from "@/lib/api-utils"

export interface LessonHistoryItem {
  lessonHistoryId: number
  lessonName: string
  percentage: number
  correctAnswersCount: number
  notCorrectAnswersCount: number
  allQuestionCount: number | null
  createdDate: string
}

export function useLessonHistory() {
  const [lessonHistory, setLessonHistory] = useState<LessonHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { makeAuthenticatedRequest } = useApi()

  const fetchLessonHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await makeAuthenticatedRequest(buildApiUrl('/api/v1/lesson-history'), {
        method: 'GET',
      })
      
      if (response) {
        const data = await response.json()
        setLessonHistory(data)
      }
    } catch (err) {
      console.error('Error fetching lesson history:', err)
      setError(err instanceof Error ? err.message : 'Test tarixi yuklanmadi')
    } finally {
      setIsLoading(false)
    }
  }, [makeAuthenticatedRequest])

  return {
    lessonHistory,
    isLoading,
    error,
    fetchLessonHistory,
  }
}









