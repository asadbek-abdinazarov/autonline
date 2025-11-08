"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { buildApiUrl } from "@/lib/api-utils"
import { fetchTopicsFromApi } from "@/lib/data"

export interface LessonHistoryItem {
  lessonHistoryId: number
  lessonId?: number
  lessonName: string
  lessonIcon?: string
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
        const data: LessonHistoryItem[] = await response.json()
        
        // Fetch topics to get lesson icons
        try {
          const topics = await fetchTopicsFromApi()
          const topicsMap = new Map(topics.map(topic => [topic.id, topic.icon]))
          
          // Enrich history data with icons from topics
          const enrichedData = data.map((historyItem) => {
            // If icon already exists in API response, use it
            if (historyItem.lessonIcon) {
              return historyItem
            }
            
            // Try to find icon by lessonId
            if (historyItem.lessonId) {
              const icon = topicsMap.get(historyItem.lessonId.toString())
              if (icon) {
                return { ...historyItem, lessonIcon: icon }
              }
            }
            
            // Default icon if not found
            return { ...historyItem, lessonIcon: '📚' }
          })
          
          setLessonHistory(enrichedData)
        } catch (topicsError) {
          console.error('Error fetching topics for icons:', topicsError)
          // Still set history data even if topics fetch fails
          setLessonHistory(data)
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
    isLoading,
    error,
    fetchLessonHistory,
  }
}