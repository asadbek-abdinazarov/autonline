"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Users, Phone, Calendar, User, XCircle, CheckCircle, Trash2, UserPlus, Eye, EyeOff, Search } from "lucide-react"
import Link from "next/link"
import { useTranslation, interpolate } from "@/hooks/use-translation"
import { getCurrentUser } from "@/lib/auth"
import { useStudents } from "@/hooks/use-students"
import { useNotification } from "@/components/notification-provider"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function StudentsClient() {
  const { t, language } = useTranslation()
  const { showNotification } = useNotification()
  const user = getCurrentUser()
  const [currentPage, setCurrentPage] = useState(0)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState("")
  const [resultsError, setResultsError] = useState<string | null>(null)
  const [isResultsLoading, setIsResultsLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  const [lessonStats, setLessonStats] = useState<{
    totalTests: number
    passed: number
    averageScore: number
    successRate: number
  } | null>(null)
  const [lessonHistories, setLessonHistories] = useState<
    {
      lessonHistoryId: number
      lessonName: string
      allQuestionCount: number
      createdDate: string
      correctAnswersCount: number
      notCorrectAnswersCount: number
      percentage: number
      lessonIcon?: string
    }[]
  >([])
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    nextPaymentDate: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchPagination, setSearchPagination] = useState<{
    page: number
    size: number
    totalPages: number
    totalElements: number
    first: boolean
    last: boolean
  } | null>(null)
  const [searchCurrentPage, setSearchCurrentPage] = useState(0)
  const pageSize = 9

  const { students, isLoading, error, pagination, fetchStudents } = useStudents()

  // Check if user has TEACHER role
  const hasTeacherRole = () => {
    return Array.isArray(user?.roles) && user!.roles!.includes('TEACHER')
  }

  useEffect(() => {
    if (hasTeacherRole()) {
      fetchStudents(currentPage, pageSize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  // Search function
  const handleSearch = async (query: string, page: number = 0) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchPagination(null)
      setIsSearching(false)
      return
    }

    try {
      setIsSearching(true)
      
      // Get access token
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      
      // Map frontend language to API language format
      const apiLanguage = language === 'cyr' ? 'oz' : language === 'ru' ? 'ru' : 'uz'
      
      const { buildApiUrl, getDefaultHeaders, safeJsonParse } = await import('@/lib/api-utils')
      
      const headers: Record<string, string> = {
        ...getDefaultHeaders(),
        'Accept-Language': apiLanguage,
        'accept': '*/*',
      }
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(buildApiUrl(`/api/v1/students/search?value=${encodeURIComponent(query.trim())}&page=${page}&size=${pageSize}`), {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        // Handle errors
        if (response.status === 401) {
          const { handleApiError } = await import('@/lib/api-utils')
          await handleApiError({ status: 401 })
          return
        }
        
        if (response.status >= 500 && response.status < 600) {
          const { handleApiError } = await import('@/lib/api-utils')
          await handleApiError({ status: response.status })
          return
        }
        
        setSearchResults([])
        setSearchPagination(null)
        return
      }
      
      // API returns object with content and page
      const data = await safeJsonParse<{
        content: any[]
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
  }

  // Debounce search - 0.3 seconds
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSearchPagination(null)
      setIsSearching(false)
      setSearchCurrentPage(0)
      return
    }

    // Reset to first page when search query changes
    setSearchCurrentPage(0)

    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery, 0)
    }, 300)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  // Handle search pagination
  useEffect(() => {
    if (searchQuery.trim() && searchCurrentPage >= 0) {
      handleSearch(searchQuery, searchCurrentPage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCurrentPage])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const day = date.getDate()
    const month = t.history.dateFormat.months[date.getMonth()]
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${day} ${month} ${year}, ${hours}:${minutes}`
  }

  const getSubscriptionName = (subscription: any) => {
    if (!subscription) return t.students.noSubscription || "Obuna yo'q"
    
    const name = subscription.name || ''

    // Student-specific subscription types
    if (name === 'STUDENT_BASIC') return t.students.subscriptionStudentBasic || "Asosiy Talaba"
    if (name === 'STUDENT_PRO') return t.students.subscriptionStudentPro || "Professional Talaba"
    if (name === 'STUDENT_FULL') return t.students.subscriptionStudentFull || "To‘liq Talaba"

    // General subscription types
    if (name === 'FULL') return t.students.subscriptionFull || "Yillik obuna"
    if (name === 'PRO') return t.students.subscriptionPro || "Oylik obuna"
    if (name === 'BASIC') return t.students.subscriptionBasic || "Oylik obuna"
    if (name === 'FREE') return t.students.subscriptionFree || "Tekin obuna"

    return name
  }

  const getSubscriptionBadgeClasses = (subscription: any) => {
    if (!subscription) {
      return "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
    }

    const name = subscription.name || ''

    // To'liq/yillik obunalar – yorqin yashil
    if (name === 'FULL' || name === 'STUDENT_FULL') {
      return "bg-emerald-500 text-white"
    }

    // Pro obunalar – ko'k
    if (name === 'PRO' || name === 'STUDENT_PRO') {
      return "bg-blue-500 text-white"
    }

    // Basic obunalar – sariq / amber
    if (name === 'BASIC' || name === 'STUDENT_BASIC') {
      return "bg-amber-400 text-amber-900"
    }

    // Bepul obuna – neytral kulrang
    if (name === 'FREE') {
      return "bg-slate-300 text-slate-900 dark:bg-slate-600 dark:text-slate-100"
    }

    // Default holat – primary rang
    return "bg-primary text-primary-foreground"
  }

  const formatStatNumber = (value: number | null | undefined) => {
    return typeof value === 'number' && !isNaN(value) ? value.toFixed(1) : '0.0'
  }

  const handlePageChange = (page: number, e?: React.MouseEvent) => {
    e?.preventDefault()
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenResults = async (student: any) => {
    try {
      setSelectedStudent(student)
      setIsResultsDialogOpen(true)
      setIsResultsLoading(true)
      setResultsError(null)
      setLessonStats(null)
      setLessonHistories([])

      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      const apiLanguage = language === 'cyr' ? 'oz' : language === 'ru' ? 'ru' : 'uz'

      const { buildApiUrl, getDefaultHeaders, safeJsonParse, handleApiError } = await import('@/lib/api-utils')

      const headers: Record<string, string> = {
        ...getDefaultHeaders(),
        'Accept-Language': apiLanguage,
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(buildApiUrl(`/api/v1/lesson-history/student/${student.userId}`), {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        // Try to get error message from response
        const errorData = await safeJsonParse<{ message?: string; error?: string }>(response)
        const errorMessage = errorData?.message || errorData?.error || null

        // Server errors
        if (response.status >= 500 && response.status < 600) {
          await handleApiError({ status: response.status })
          setResultsError(errorMessage || "Server xatoligi. Iltimos, keyinroq urinib ko'ring.")
          return
        }

        // Auth / rate limit
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
        averageScore: number
        successRate: number
        lessonHistories: {
          lessonName: string
          allQuestionCount: number
          createdDate: string
          lessonHistoryId: number
          correctAnswersCount: number
          percentage: number
          lessonIcon: string
          notCorrectAnswersCount: number
        }[]
      }

      const data = await safeJsonParse<LessonHistoryResponse>(response)
      if (!data) {
        setResultsError("Natijalar topilmadi yoki noto'g'ri format.")
        return
      }

      setLessonStats({
        totalTests: data.totalTests,
        passed: data.passed,
        averageScore: data.averageScore,
        successRate: data.successRate,
      })
      setLessonHistories(data.lessonHistories || [])
    } catch (err) {
      console.error('Error fetching lesson history for student:', err)
      const message =
        err instanceof Error ? err.message : "Natijalarni yuklashda kutilmagan xatolik yuz berdi."
      setResultsError(message)
    } finally {
      setIsResultsLoading(false)
    }
  }

  // Validate and normalize phone number
  const validateAndNormalizePhone = (phoneNumber: string): { isValid: boolean; normalized: string; error: string } => {
    const cleaned = phoneNumber.replace(/[^\d+]/g, '')
    let digits = cleaned.replace(/^\+/, '')
    
    if (digits.startsWith('998')) {
      digits = digits.substring(3)
    }
    
    if (digits.length !== 9) {
      return {
        isValid: false,
        normalized: '',
        error: t.students.phoneError || "Telefon raqami 9 raqamdan iborat bo'lishi kerak"
      }
    }
    
    const validPrefixes = ['90', '91', '93', '94', '95', '97', '98', '99', '88', '33', '50', '55', '77']
    const prefix = digits.substring(0, 2)
    
    if (!validPrefixes.includes(prefix)) {
      return {
        isValid: false,
        normalized: '',
        error: t.students.phoneErrorOperator || "Telefon raqami noto'g'ri operator kodi"
      }
    }
    
    const normalized = `+998${digits}`
    
    return {
      isValid: true,
      normalized,
      error: ''
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError("")
    setPhoneError("")
    setPasswordError("")
    
    // Validate phone number
    const phoneValidation = validateAndNormalizePhone(formData.phoneNumber)
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error)
      return
    }
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError(t.students.passwordMismatch || t.register.passwordMismatch)
      return
    }
    
    setIsAdding(true)
    try {
      // Get access token
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      
      // Map frontend language to API language format
      const apiLanguage = language === 'cyr' ? 'oz' : language === 'ru' ? 'ru' : 'uz'
      
      const { buildApiUrl, getDefaultHeaders } = await import('@/lib/api-utils')
      
      const headers: Record<string, string> = {
        ...getDefaultHeaders(),
        'Accept-Language': apiLanguage,
      }
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // Convert datetime-local to ISO format if provided
      let nextPaymentDate = null
      if (formData.nextPaymentDate) {
        const date = new Date(formData.nextPaymentDate)
        nextPaymentDate = date.toISOString()
      }
      
      const requestBody = {
        fullName: formData.fullName,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: phoneValidation.normalized,
        nextPaymentDate: nextPaymentDate,
      }
      
      const response = await fetch(buildApiUrl('/api/v1/students'), {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      })
      
      if (!response.ok) {
        // Try to get error message from response first
        const { safeJsonParse } = await import('@/lib/api-utils')
        const errorData = await safeJsonParse<{ message?: string; error?: string }>(response)
        const errorMessage = errorData?.message || errorData?.error || null
        
        // Handle server errors (500-599) - only these should show server error page
        if (response.status >= 500 && response.status < 600) {
          const { handleApiError } = await import('@/lib/api-utils')
          await handleApiError({ status: response.status })
          setAddError(errorMessage || 'Server xatoligi. Iltimos, keyinroq urinib ko\'ring.')
          setIsAdding(false)
          return
        }
        
        // Handle 401 errors - show error in form, don't call handleApiError to avoid server error page
        if (response.status === 401) {
          setAddError(errorMessage || "Sizning sessiyangiz tugagan. Tizimga qaytadan kirish kerak.")
          setIsAdding(false)
          return
        }
        
        // Handle 429 errors - show error in form, don't call handleApiError to avoid server error page
        if (response.status === 429) {
          setAddError(errorMessage || "Juda ko'p so'rovlar yuborildi. Iltimos, biroz kutib turing.")
          setIsAdding(false)
          return
        }
        
        // Business logic errors (400, 403, 404, etc.) - show error message in form, don't call handleApiError
        // This prevents server error page from showing for validation/business logic errors
        setAddError(errorMessage || `HTTP error! status: ${response.status}`)
        setIsAdding(false)
        return
      }
      
      // Reset form and close dialog
      setFormData({
        fullName: "",
        username: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        nextPaymentDate: "",
      })
      setAddError("")
      setIsAdding(false)
      setIsAddDialogOpen(false)
      
      // Show success notification
      showNotification(
        t.students.addSuccess || `O'quvchi muvaffaqiyatli qo'shildi`,
        'success'
      )
      
      // Refresh the students list
      await fetchStudents(currentPage, pageSize)
    } catch (err) {
      console.error('Error adding student:', err)
      
      // Get error message
      const errorMessage = err instanceof Error ? err.message : t.students.addError || "O'quvchi qo'shilmadi"
      
      // Only call handleApiError for actual network errors (connection failures)
      // Don't call it for HTTP errors (400, 403, etc.) as they're already handled above
      if (err instanceof TypeError && (
        err.message.includes('fetch') || 
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError') ||
        err.message.includes('Network request failed')
      )) {
        // Real network error - show server error page
        const { handleApiError } = await import('@/lib/api-utils')
        await handleApiError(err)
        setIsAdding(false)
        return
      }
      
      // For other errors (including HTTP errors that weren't caught above), 
      // just show error in form without calling handleApiError
      setAddError(errorMessage)
      setIsAdding(false)
    }
  }

  const handleDeleteStudent = async (studentId: number) => {
    try {
      setDeletingId(studentId)
      
      // Get access token
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      
      // Map frontend language to API language format
      const apiLanguage = language === 'cyr' ? 'oz' : language === 'ru' ? 'ru' : 'uz'
      
      const { buildApiUrl, getDefaultHeaders } = await import('@/lib/api-utils')
      
      const headers: Record<string, string> = {
        ...getDefaultHeaders(),
        'Accept-Language': apiLanguage,
      }
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(buildApiUrl(`/api/v1/students/by-id/${studentId}`), {
        method: 'DELETE',
        headers,
      })
      
      if (!response.ok) {
        // Handle 401 errors
        if (response.status === 401) {
          const { handleApiError } = await import('@/lib/api-utils')
          await handleApiError({ status: 401 })
          throw new Error("Sizning sessiyangiz tugagan. Tizimga qaytadan kirish kerak.")
        }
        
        // Handle 429 errors
        if (response.status === 429) {
          const { handleApiError } = await import('@/lib/api-utils')
          await handleApiError({ status: 429 })
          throw new Error("Juda ko'p so'rovlar yuborildi. Iltimos, biroz kutib turing.")
        }
        
        // Handle server errors (500-599)
        if (response.status >= 500 && response.status < 600) {
          const { handleApiError } = await import('@/lib/api-utils')
          await handleApiError({ status: response.status })
          throw new Error('Server xatoligi. Iltimos, keyinroq urinib ko\'ring')
        }
        
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Refresh the students list
      await fetchStudents(currentPage, pageSize)
    } catch (err) {
      console.error('Error deleting student:', err)
      const { handleApiError } = await import('@/lib/api-utils')
      await handleApiError(err)
      // You might want to show a toast notification here
    } finally {
      setDeletingId(null)
    }
  }

  const renderPagination = () => {
    // Agar pagination ma'lumotlari bo'lmasa, ko'rsatilmaydi
    if (!pagination) return null

    const totalPages = Number(pagination.totalPages) || 0
    const current = Number(pagination.page) || 0
    const totalElements = Number(pagination.totalElements) || 0

    // Agar totalPages yoki current noto'g'ri bo'lsa, pagination ko'rsatilmaydi
    if (!totalPages || isNaN(totalPages) || isNaN(current)) return null

    // Agar umumiy o'quvchilar soni pageSize dan kichik yoki teng bo'lsa, pagination ko'rsatilmaydi
    if (totalElements <= pageSize) return null

    // Agar faqat 1 sahifa bo'lsa, pagination ko'rsatilmaydi
    if (totalPages <= 1) return null

    // Agar sahifalar soni 7 tadan kam bo'lsa, barcha sahifalarni ko'rsat
    if (totalPages <= 7) {
      const pageNumbers: number[] = []
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i)
      }
      return (
        <Pagination className="mt-6">
          <PaginationContent>
            {pageNumbers.map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={(e) => handlePageChange(pageNum, e)}
                  isActive={pageNum === current}
                  className="cursor-pointer"
                  href="#"
                >
                  {pageNum + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      )
    }

    // Ko'p sahifalar bo'lsa, ellipsis bilan ko'rsat
    const pages: (number | 'ellipsis')[] = []
    
    // Birinchi sahifa
    pages.push(0)

    // Ellipsis va o'rtadagi sahifalar
    if (current > 2) {
      pages.push('ellipsis')
    }

    // Joriy sahifa atrofidagi sahifalar
    const start = Math.max(1, current - 1)
    const end = Math.min(totalPages - 2, current + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Ellipsis va oxirgi sahifa
    if (current < totalPages - 3) {
      pages.push('ellipsis')
    }
    
    // Oxirgi sahifa
    pages.push(totalPages - 1)

    // Duplikatlarni olib tashlash va faqat raqamlarni saqlash
    const uniquePages: (number | 'ellipsis')[] = []
    const seen = new Set<string | number>()
    
    for (const page of pages) {
      const key = page === 'ellipsis' ? 'ellipsis' : page
      if (!seen.has(key)) {
        seen.add(key)
        uniquePages.push(page)
      }
    }

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          {uniquePages
            .filter((page) => page === 'ellipsis' || (typeof page === 'number' && !isNaN(page)))
            .map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }
              const pageNum = Number(page)
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={(e) => handlePageChange(pageNum, e)}
                    isActive={pageNum === current}
                    className="cursor-pointer"
                    href="#"
                  >
                    {pageNum + 1}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
        </PaginationContent>
      </Pagination>
    )
  }

  // Render search pagination
  const renderSearchPagination = () => {
    // Agar pagination ma'lumotlari bo'lmasa, ko'rsatilmaydi
    if (!searchPagination) return null

    const totalPages = Number(searchPagination.totalPages) || 0
    const current = Number(searchPagination.page) || 0
    const totalElements = Number(searchPagination.totalElements) || 0

    // Agar totalPages yoki current noto'g'ri bo'lsa, pagination ko'rsatilmaydi
    if (!totalPages || isNaN(totalPages) || isNaN(current)) return null

    // Agar umumiy o'quvchilar soni pageSize dan kichik yoki teng bo'lsa, pagination ko'rsatilmaydi
    if (totalElements <= pageSize) return null

    // Agar faqat 1 sahifa bo'lsa, pagination ko'rsatilmaydi
    if (totalPages <= 1) return null

    // Agar sahifalar soni 7 tadan kam bo'lsa, barcha sahifalarni ko'rsat
    if (totalPages <= 7) {
      const pageNumbers: number[] = []
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i)
      }
      return (
        <Pagination className="mt-6">
          <PaginationContent>
            {pageNumbers.map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault()
                    setSearchCurrentPage(pageNum)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  isActive={pageNum === current}
                  className="cursor-pointer"
                  href="#"
                >
                  {pageNum + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      )
    }

    // Ko'p sahifalar bo'lsa, ellipsis bilan ko'rsat
    const pages: (number | 'ellipsis')[] = []
    
    // Birinchi sahifa
    pages.push(0)

    // Ellipsis va o'rtadagi sahifalar
    if (current > 2) {
      pages.push('ellipsis')
    }

    // Joriy sahifa atrofidagi sahifalar
    const start = Math.max(1, current - 1)
    const end = Math.min(totalPages - 2, current + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Ellipsis va oxirgi sahifa
    if (current < totalPages - 3) {
      pages.push('ellipsis')
    }
    
    // Oxirgi sahifa
    pages.push(totalPages - 1)

    // Duplikatlarni olib tashlash va faqat raqamlarni saqlash
    const uniquePages: (number | 'ellipsis')[] = []
    const seen = new Set<string | number>()
    
    for (const page of pages) {
      const key = page === 'ellipsis' ? 'ellipsis' : page
      if (!seen.has(key)) {
        seen.add(key)
        uniquePages.push(page)
      }
    }

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          {uniquePages
            .filter((page) => page === 'ellipsis' || (typeof page === 'number' && !isNaN(page)))
            .map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }
              const pageNum = Number(page)
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={(e) => {
                      e.preventDefault()
                      setSearchCurrentPage(pageNum)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    isActive={pageNum === current}
                    className="cursor-pointer"
                    href="#"
                  >
                    {pageNum + 1}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <AuthGuard>
      {hasTeacherRole() ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col transition-colors duration-300">
          <Header />
          <main className="container mx-auto px-4 py-8 sm:py-12 flex-1">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Back Button */}
              <div>
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                  <Link href="/home" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {t.common.back}
                  </Link>
                </Button>
              </div>

              {/* Header Section */}
              <section className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                      {t.students.title}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                      {t.students.description}
                    </p>
                  </div>
                  <Dialog 
                    open={isAddDialogOpen} 
                    onOpenChange={(open) => {
                      setIsAddDialogOpen(open)
                      if (!open) {
                        // Reset form and states when dialog closes
                        setFormData({
                          fullName: "",
                          username: "",
                          password: "",
                          confirmPassword: "",
                          phoneNumber: "",
                          nextPaymentDate: "",
                        })
                        setAddError("")
                        setIsAdding(false)
                        setPhoneError("")
                        setPasswordError("")
                        setShowPassword(false)
                        setShowConfirmPassword(false)
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        {t.students.addStudent || "O'quvchi qo'shish"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{t.students.addStudent || "O'quvchi qo'shish"}</DialogTitle>
                        <DialogDescription>
                          {t.students.addStudentDescription || "Yangi o'quvchi ma'lumotlarini kiriting"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddStudent} className="space-y-4">
                        {addError && (
                          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800/50">
                            {addError}
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label htmlFor="fullName">{t.register.fullName}</Label>
                          <Input
                            id="fullName"
                            type="text"
                            placeholder={t.register.fullNamePlaceholder}
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                            disabled={isAdding}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="username">{t.register.username}</Label>
                          <Input
                            id="username"
                            type="text"
                            placeholder={t.register.usernamePlaceholder}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            disabled={isAdding}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">{t.register.phone}</Label>
                          <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder={t.register.phonePlaceholder}
                            value={formData.phoneNumber}
                            onChange={(e) => {
                              setFormData({ ...formData, phoneNumber: e.target.value })
                              if (phoneError) setPhoneError("")
                            }}
                            required
                            disabled={isAdding}
                            className={phoneError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                          />
                          {phoneError ? (
                            <p className="text-xs text-red-600 mt-1">{phoneError}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">
                              {t.register.phoneExample}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password">{t.register.password}</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder={t.register.passwordPlaceholder}
                              value={formData.password}
                              onChange={(e) => {
                                setFormData({ ...formData, password: e.target.value })
                                if (passwordError) setPasswordError("")
                              }}
                              required
                              disabled={isAdding}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              disabled={isAdding}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">{t.register.confirmPassword}</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder={t.register.confirmPasswordPlaceholder}
                              value={formData.confirmPassword}
                              onChange={(e) => {
                                setFormData({ ...formData, confirmPassword: e.target.value })
                                if (passwordError) setPasswordError("")
                              }}
                              required
                              disabled={isAdding}
                              className={`pr-10 ${passwordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              disabled={isAdding}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {passwordError && (
                            <p className="text-xs text-red-600 mt-1">{passwordError}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nextPaymentDate">{t.students.nextPaymentDate || "Keyingi to'lov sanasi"}</Label>
                          <Input
                            id="nextPaymentDate"
                            type="datetime-local"
                            value={formData.nextPaymentDate}
                            onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                            disabled={isAdding}
                          />
                          <p className="text-xs text-muted-foreground">
                            {t.students.nextPaymentDateHint || "Ixtiyoriy. Bo'sh qoldirish mumkin"}
                          </p>
                        </div>

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                            disabled={isAdding}
                          >
                            {t.common.cancel}
                          </Button>
                          <Button type="submit" disabled={isAdding}>
                            {isAdding ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t.students.adding || "Qo'shilmoqda..."}
                              </>
                            ) : (
                              t.students.add || t.common.save
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Search Input */}
                <div className="relative max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t.students.searchPlaceholder || "Username yoki telefon raqami bo'yicha qidirish..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {searchQuery && !isSearching && (
                      <button
                        onClick={() => {
                          setSearchQuery("")
                          setSearchResults([])
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground font-medium text-lg">{t.students.loading}</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="py-12 text-center">
                    <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-6">
                      <XCircle className="h-12 w-12 text-destructive" />
                    </div>
                    <p className="text-lg text-foreground mb-8">{error}</p>
                    <Button onClick={() => fetchStudents(currentPage, pageSize)} variant="outline" size="lg">
                      {t.students.retry || t.common.retry}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {!isLoading && !error && !searchQuery.trim() && students.length === 0 && (
                <Card className="border-2 border-slate-300/50 dark:border-slate-600/70 bg-white/80 dark:bg-slate-800/95 backdrop-blur-xl shadow-lg dark:shadow-slate-900/40">
                  <CardContent className="py-20 text-center">
                    <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-6">
                      <Users className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground">{t.students.empty}</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t.students.emptyDescription}</p>
                  </CardContent>
                </Card>
              )}

              {/* Search Results - Card Format (Same as regular students) */}
              {!isLoading && !error && searchQuery.trim() && !isSearching && searchResults.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((student) => (
                    <Card
                      key={student.userId}
                      className="relative border-2 border-slate-300/50 dark:border-slate-600/70 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-700/95 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20 dark:hover:shadow-slate-900/60 hover:border-slate-400/50 dark:hover:border-slate-500/80 shadow-lg dark:shadow-slate-900/40"
                    >
                      {/* Delete Button */}
                      <div className="absolute top-2 right-2 z-10">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                              disabled={deletingId === student.userId}
                            >
                              {deletingId === student.userId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.students.deleteConfirmTitle || "O'quvchini o'chirish"}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {interpolate(t.students.deleteConfirmMessage || "Siz rostdan ham {name} o'quvchisini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.", {
                                  name: student.fullName || student.username
                                })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteStudent(student.userId)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t.students.delete || t.common.delete}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      <CardContent className="p-4 sm:p-5">
                        <div className="space-y-3 pr-8">
                          {/* Header with Name and Status */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-foreground mb-0.5 break-words">
                                {student.fullName || student.username}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">@{student.username}</p>
                            </div>
                            <Badge
                              variant={student.isActive ? "default" : "secondary"}
                              className={`flex-shrink-0 text-xs ${
                                student.isActive
                                  ? "bg-green-500 hover:bg-green-600 text-white"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {student.isActive ? (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  <span className="hidden sm:inline ml-1">{t.students.active || t.userMenu.active}</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" />
                                  <span className="hidden sm:inline ml-1">{t.students.inactive || t.userMenu.inactive}</span>
                                </>
                              )}
                            </Badge>
                          </div>

                          {/* Phone Number */}
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{student.phoneNumber}</span>
                          </div>

                          {/* Subscription */}
                          {student.subscription && (
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                              <Badge
                                className={`text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-full truncate max-w-[140px] sm:max-w-[160px] ${getSubscriptionBadgeClasses(student.subscription)}`}
                              >
                                {getSubscriptionName(student.subscription)}
                              </Badge>
                            </div>
                          )}

                          {/* Next Payment Date */}
                          {student.nextPaymentDate && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">
                                {t.students.nextPayment || t.userMenu.nextPaymentDate}: {formatDate(student.nextPaymentDate)}
                              </span>
                            </div>
                          )}

                          {/* Results Button */}
                          <div className="pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-center"
                              onClick={() => handleOpenResults(student)}
                            >
                              {t.students.results || "Natijalari"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Search Pagination Info */}
                {searchPagination && searchPagination.totalElements > 0 && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-4">
                    <p>
                      {interpolate(t.students.showing || "Ko'rsatilmoqda: {from}-{to} / {total}", {
                        from: (searchPagination.page * pageSize + 1).toString(),
                        to: Math.min((searchPagination.page + 1) * pageSize, searchPagination.totalElements).toString(),
                        total: searchPagination.totalElements.toString(),
                      })}
                    </p>
                  </div>
                )}

                {/* Search Pagination Controls */}
                {renderSearchPagination()}
                </>
              )}

              {/* Search Empty State */}
              {!isLoading && !error && searchQuery.trim() && !isSearching && searchResults.length === 0 && (
                <Card className="border-2 border-slate-300/50 dark:border-slate-600/70 bg-white/80 dark:bg-slate-800/95 backdrop-blur-xl shadow-lg dark:shadow-slate-900/40">
                  <CardContent className="py-20 text-center">
                    <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-6">
                      <Search className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground">
                      {t.students.searchEmpty || "Natijalar topilmadi"}
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      {t.students.searchEmptyDescription || `"${searchQuery}" bo'yicha o'quvchilar topilmadi.`}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Students Grid */}
              {!isLoading && !error && !searchQuery.trim() && students.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((student) => (
                      <Card
                        key={student.userId}
                        className="relative border-2 border-slate-300/50 dark:border-slate-600/70 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-700/95 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20 dark:hover:shadow-slate-900/60 hover:border-slate-400/50 dark:hover:border-slate-500/80 shadow-lg dark:shadow-slate-900/40"
                      >
                        {/* Delete Button */}
                        <div className="absolute top-2 right-2 z-10">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                                disabled={deletingId === student.userId}
                              >
                                {deletingId === student.userId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t.students.deleteConfirmTitle || "O'quvchini o'chirish"}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {interpolate(t.students.deleteConfirmMessage || "Siz rostdan ham {name} o'quvchisini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.", {
                                    name: student.fullName || student.username
                                  })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteStudent(student.userId)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {t.students.delete || t.common.delete}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        <CardContent className="p-4 sm:p-5">
                          <div className="space-y-3 pr-8">
                            {/* Header with Name and Status */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-bold text-foreground mb-0.5 break-words">
                                  {student.fullName || student.username}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">@{student.username}</p>
                              </div>
                              <Badge
                                variant={student.isActive ? "default" : "secondary"}
                                className={`flex-shrink-0 text-xs ${
                                  student.isActive
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {student.isActive ? (
                                  <>
                                    <CheckCircle className="h-3 w-3" />
                                    <span className="hidden sm:inline ml-1">{t.students.active || t.userMenu.active}</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3" />
                                    <span className="hidden sm:inline ml-1">{t.students.inactive || t.userMenu.inactive}</span>
                                  </>
                                )}
                              </Badge>
                            </div>

                            {/* Phone Number */}
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{student.phoneNumber}</span>
                            </div>

                            {/* Subscription */}
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                              <Badge
                                className={`text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-full truncate max-w-[140px] sm:max-w-[160px] ${getSubscriptionBadgeClasses(student.subscription)}`}
                              >
                                {getSubscriptionName(student.subscription)}
                              </Badge>
                            </div>

                            {/* Next Payment Date */}
                            {student.nextPaymentDate && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">
                                  {t.students.nextPayment || t.userMenu.nextPaymentDate}: {formatDate(student.nextPaymentDate)}
                                </span>
                              </div>
                            )}

                            {/* Results Button */}
                            <div className="pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-center"
                                onClick={() => handleOpenResults(student)}
                              >
                                {t.students.results || "Natijalari"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination Info */}
                  {!searchQuery.trim() && pagination.totalElements > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-4">
                      <p>
                        {interpolate(t.students.showing || "Ko'rsatilmoqda: {from}-{to} / {total}", {
                          from: (pagination.page * pageSize + 1).toString(),
                          to: Math.min((pagination.page + 1) * pageSize, pagination.totalElements).toString(),
                          total: pagination.totalElements.toString(),
                        })}
                      </p>
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {!searchQuery.trim() && renderPagination()}
                </>
              )}
            </div>
          </main>

          {/* Lesson Results Dialog */}
          <Dialog
            open={isResultsDialogOpen}
            onOpenChange={(open) => {
              setIsResultsDialogOpen(open)
              if (!open) {
                setSelectedStudent(null)
                setLessonStats(null)
                setLessonHistories([])
                setResultsError(null)
                setIsResultsLoading(false)
              }
            }}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedStudent
                    ? `${selectedStudent.fullName || selectedStudent.username} — ${
                        t.students.resultsTitle || "Natijalari"
                      }`
                    : t.students.resultsTitle || "Natijalar"}
                </DialogTitle>
                <DialogDescription>
                  {t.students.resultsDescription ||
                    "O'quvchining test natijalari va o'rtacha ko'rsatkichlari."}
                </DialogDescription>
              </DialogHeader>

              {isResultsLoading && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {t.students.resultsLoading || "Natijalar yuklanmoqda..."}
                  </p>
                </div>
              )}

              {!isResultsLoading && resultsError && (
                <div className="space-y-3">
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800/50">
                    {resultsError}
                  </div>
                </div>
              )}

              {!isResultsLoading && !resultsError && lessonStats && (
                <div className="space-y-6">
                  {/* Summary stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg bg-muted p-3 text-center flex flex-col items-center justify-between h-full">
                      <p className="text-xs text-muted-foreground">
                        {t.students.resultsTotalTests || "Umumiy testlar"}
                      </p>
                      <p className="text-xl font-bold text-foreground">
                        {lessonStats.totalTests}
                      </p>
                    </div>
                    <div className="rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 p-3 text-center flex flex-col items-center justify-between h-full">
                      <p className="text-xs">
                        {t.students.resultsPassed || "Muvaffaqiyatli"}
                      </p>
                      <p className="text-xl font-bold">
                        {lessonStats.passed}
                      </p>
                    </div>
                    <div className="rounded-lg bg-primary/10 text-primary p-3 text-center flex flex-col items-center justify-between h-full">
                      <p className="text-xs">
                        {t.students.resultsAverageScore || "O'rtacha ball"}
                      </p>
                      <p className="text-xl font-bold">
                        {formatStatNumber(lessonStats.averageScore)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 p-3 text-center flex flex-col items-center justify-between h-full">
                      <p className="text-xs">
                        {t.students.resultsSuccessRate || "Muvaffaqiyat foizi"}
                      </p>
                      <p className="text-xl font-bold">
                        {formatStatNumber(lessonStats.successRate)}%
                      </p>
                    </div>
                  </div>

                  {/* Lessons list */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      {t.students.resultsLessons || "Testlar bo'yicha natijalar"}
                    </h4>

                    {lessonHistories.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        {t.students.resultsEmpty || "Hozircha natijalar mavjud emas."}
                      </p>
                    )}

                    {lessonHistories.length > 0 && (
                      <div className="space-y-2">
                        {lessonHistories.map((history) => (
                          <div
                            key={history.lessonHistoryId}
                            className="rounded-lg border border-border/60 bg-white/80 dark:bg-slate-900/50 px-3 py-2.5 flex flex-col gap-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-lg">
                                  {history.lessonIcon || "📚"}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">
                                    {history.lessonName}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {formatDate(history.createdDate)}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                  history.percentage >= 80
                                    ? "bg-emerald-500 text-white"
                                    : history.percentage >= 50
                                    ? "bg-amber-400 text-amber-900"
                                    : "bg-red-500 text-white"
                                }`}
                              >
                                {history.percentage.toFixed(0)}%
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                              <span>
                                {t.students.resultsCorrect || "To'g'ri"}:{" "}
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                  {history.correctAnswersCount}
                                </span>
                                {" / "}
                                {history.allQuestionCount}
                              </span>
                              <span>
                                {t.students.resultsWrong || "Noto'g'ri"}:{" "}
                                <span className="font-medium text-red-500">
                                  {history.notCorrectAnswersCount}
                                </span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          <Footer />
        </div>
      ) : (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
            <Button asChild>
              <Link href="/home">Go to Home</Link>
            </Button>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}

