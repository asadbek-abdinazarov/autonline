"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { buildApiUrl, safeJsonParse } from "@/lib/api-utils"
import { fetchTopicsFromApi } from "@/lib/data"

export interface LessonHistoryItem {
  lessonHistoryId: number
  lessonId?: number
  lessonName: string | null
  lessonIcon?: string
  percentage: number
  correctAnswersCount: number
  notCorrectAnswersCount: number
  allQuestionCount: number
  createdDate: string
  // Localized fields from API (if available)
  nameUz?: string
  nameOz?: string
  nameRu?: string
}

export interface LessonHistoryResponse {
  totalTests: number
  passed: number
  averageScore: number
  successRate: number
  lessonHistories: LessonHistoryItem[]
}

export function useLessonHistory() {
  const [lessonHistory, setLessonHistory] = useState<LessonHistoryItem[]>([])
  const [stats, setStats] = useState<{
    totalTests: number
    passed: number
    averageScore: number
    successRate: number
  }>({
    totalTests: 0,
    passed: 0,
    averageScore: 0,
    successRate: 0,
  })
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
        const data = await safeJsonParse<LessonHistoryResponse>(response)
        
        if (!data) {
          setError('Ma\'lumotlar yuklanmadi yoki noto\'g\'ri format')
          return
        }
        
        // Set stats from API response
        setStats({
          totalTests: data.totalTests,
          passed: data.passed,
          averageScore: data.averageScore,
          successRate: data.successRate,
        })
        
        // Fetch topics to get lesson icons and names
        try {
          const topics = await fetchTopicsFromApi()
          const topicsMap = new Map(topics.map(topic => [topic.id, { icon: topic.icon, name: topic.title }]))
          
          // Enrich history data with icons and names from topics
          const enrichedData = data.lessonHistories.map((historyItem) => {
            // If icon already exists in API response, use it
            if (historyItem.lessonIcon) {
              return historyItem
            }
            
            // Try to find icon by lessonId
            if (historyItem.lessonId) {
              const topic = topicsMap.get(historyItem.lessonId.toString())
              if (topic) {
                return { ...historyItem, lessonIcon: topic.icon }
              }
            }
            
            // Default icon if not found
            return { ...historyItem, lessonIcon: '📚' }
          })
          
          setLessonHistory(enrichedData)
        } catch (topicsError) {
          console.error('Error fetching topics for icons:', topicsError)
          // Still set history data even if topics fetch fails
          setLessonHistory(data.lessonHistories)
        }
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
    stats,
    isLoading,
    error,
    fetchLessonHistory,
  }
}