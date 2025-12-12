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
}

export interface LessonHistoryPage {
  size: number
  number: number
  totalElements: number
  totalPages: number
}

export interface LessonHistoryResponse {
  totalTests: number
  passed: number
  averageScore: number | string
  successRate: number | string
  lessonHistories: {
    content: LessonHistoryItem[]
    page: LessonHistoryPage
  }
}

export function useLessonHistory() {
  const [lessonHistory, setLessonHistory] = useState<LessonHistoryItem[]>([])
  const [pagination, setPagination] = useState<LessonHistoryPage | null>(null)
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

  const fetchLessonHistory = useCallback(async (page: number = 0, size: number = 20) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await makeAuthenticatedRequest(buildApiUrl(`/api/v1/lesson-history?page=${page}&size=${size}`), {
        method: 'GET',
      })
      
      if (response) {
        const data = await safeJsonParse<LessonHistoryResponse>(response)
        
        if (!data) {
          setError('Ma\'lumotlar yuklanmadi yoki noto\'g\'ri format')
          return
        }
        
        // Set stats from API response (convert string to number if needed)
        setStats({
          totalTests: data.totalTests,
          passed: data.passed,
          averageScore: typeof data.averageScore === 'string' ? parseFloat(data.averageScore) : data.averageScore,
          successRate: typeof data.successRate === 'string' ? parseFloat(data.successRate) : data.successRate,
        })
        
        // Set pagination
        if (data.lessonHistories?.page) {
          setPagination(data.lessonHistories.page)
        }
        
        const histories = data.lessonHistories?.content || []
        
        // Check if we need to fetch topics (only if some items are missing icons)
        const needsIcons = histories.some(
          (item) => !item.lessonIcon && item.lessonId
        )
        
        if (needsIcons) {
          // Only fetch topics if we actually need icons
          try {
            const topics = await fetchTopicsFromApi()
            const topicsMap = new Map(topics.map(topic => [topic.id, { icon: topic.icon, name: topic.title }]))
            
            // Enrich history data with icons and names from topics
            const enrichedData = histories.map((historyItem) => {
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
            // Add default icons for items that don't have them
            const enrichedData = histories.map((item) => 
              item.lessonIcon ? item : { ...item, lessonIcon: '📚' }
            )
            setLessonHistory(enrichedData)
          }
        } else {
          // All items already have icons or no lessonId, just add default icons where missing
          const enrichedData = histories.map((item) => 
            item.lessonIcon ? item : { ...item, lessonIcon: '📚' }
          )
          setLessonHistory(enrichedData)
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
    pagination,
    stats,
    isLoading,
    error,
    fetchLessonHistory,
  }
}