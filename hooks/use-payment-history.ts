"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { buildApiUrl, safeJsonParse } from "@/lib/api-utils"

interface PaymentHistoryItem {
  paymentAmount: number
  paymentCurrency: string
  isPaid: boolean
  paymentDate: string
  paymentMethod: string
  description: string
}

export function usePaymentHistory() {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { makeAuthenticatedRequest } = useApi()

  const fetchPaymentHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await makeAuthenticatedRequest(buildApiUrl('/api/v1/payment-history'), {
        method: 'GET',
      })
      
      if (response) {
        const data = await safeJsonParse<PaymentHistoryItem[]>(response)
        if (data) {
          setPaymentHistory(data)
        } else {
          setError('Ma\'lumotlar yuklanmadi yoki noto\'g\'ri format')
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching payment history:', err)
      }
      setError(err instanceof Error ? err.message : 'To\'lov tarixi yuklanmadi')
    } finally {
      setIsLoading(false)
    }
  }, [makeAuthenticatedRequest])

  return {
    paymentHistory,
    isLoading,
    error,
    fetchPaymentHistory,
  }
}
