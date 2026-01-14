"use client"

import { useState, useCallback } from 'react'
import { useTranslation } from '@/hooks/use-translation'
import { buildApiUrl, getDefaultHeaders, safeJsonParse, handleApiError } from '@/lib/api-utils'

export interface StudentSearchResult {
    userId: number
    fullName: string
    username: string
    phoneNumber: string
    nextPaymentDate: string | null
    subscription: {
        name: string
        description: string
    } | null
}

export interface SearchPagination {
    page: number
    size: number
    totalPages: number
    totalElements: number
    first: boolean
    last: boolean
}

export function useStudentSearch() {
    const { language } = useTranslation()
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([])
    const [searchPagination, setSearchPagination] = useState<SearchPagination | null>(null)
    const [searchCurrentPage, setSearchCurrentPage] = useState(0)

    const executeSearch = useCallback(async (query: string, page: number, pageSize: number) => {
        if (!query.trim()) {
            setSearchResults([])
            setSearchPagination(null)
            setIsSearching(false)
            return
        }

        try {
            setIsSearching(true)

            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
            const apiLanguage = language === 'cyr' ? 'oz' : language === 'ru' ? 'ru' : 'uz'

            const headers: Record<string, string> = {
                ...getDefaultHeaders(),
                'Accept-Language': apiLanguage,
                'accept': '*/*',
            }

            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const response = await fetch(buildApiUrl(`/api/v1/students/search?value=${encodeURIComponent(query.trim())}&page=${page}&size=${pageSize}`), {
                method: 'GET',
                headers,
            })

            if (!response.ok) {
                if (response.status === 401) {
                    await handleApiError({ status: 401 })
                    return
                }

                if (response.status >= 500 && response.status < 600) {
                    await handleApiError({ status: response.status })
                    return
                }

                setSearchResults([])
                setSearchPagination(null)
                return
            }

            const data = await safeJsonParse<{
                content: StudentSearchResult[]
                page: {
                    size: number
                    number: number
                    totalElements: number
                    totalPages: number
                }
            }>(response)

            if (data) {
                if (data.content && Array.isArray(data.content)) {
                    setSearchResults(data.content)
                } else {
                    setSearchResults([])
                }

                if (data.page) {
                    setSearchPagination({
                        page: data.page.number,
                        size: data.page.size,
                        totalPages: data.page.totalPages,
                        totalElements: data.page.totalElements,
                        first: data.page.number === 0,
                        last: data.page.number >= data.page.totalPages - 1,
                    })
                } else {
                    setSearchPagination(null)
                }
            } else {
                setSearchResults([])
                setSearchPagination(null)
            }
        } catch (err) {
            console.error('Error searching students:', err)
            setSearchResults([])
            setSearchPagination(null)
        } finally {
            setIsSearching(false)
        }
    }, [language])

    const clearSearch = useCallback(() => {
        setSearchQuery("")
        setSearchResults([])
        setSearchPagination(null)
        setSearchCurrentPage(0)
    }, [])

    return {
        searchQuery,
        setSearchQuery,
        isSearching,
        searchResults,
        searchPagination,
        searchCurrentPage,
        setSearchCurrentPage,
        executeSearch,
        clearSearch
    }
}
