"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Users, Phone, Calendar, User, XCircle, CheckCircle, Trash2, UserPlus, Eye, EyeOff } from "lucide-react"
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
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState("")
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
  const pageSize = 10

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
    if (name.includes('FULL')) return t.students.subscriptionFull || "Yillik obuna"
    if (name.includes('PRO')) return t.students.subscriptionPro || "Oylik obuna"
    if (name.includes('BASIC')) return t.students.subscriptionBasic || "Oylik obuna"
    if (name.includes('FREE')) return t.students.subscriptionFree || "Tekin obuna"
    return name
  }

  const handlePageChange = (page: number, e?: React.MouseEvent) => {
    e?.preventDefault()
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    if (pagination.totalPages <= 1) return null

    const pages: (number | 'ellipsis')[] = []
    const totalPages = pagination.totalPages
    const current = pagination.page

    // Always show first page
    if (totalPages > 0) {
      pages.push(0)
    }

    // Show ellipsis if needed
    if (current > 2) {
      pages.push('ellipsis')
    }

    // Show pages around current page
    for (let i = Math.max(1, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
      if (i !== 0 && i !== totalPages - 1) {
        pages.push(i)
      }
    }

    // Show ellipsis if needed
    if (current < totalPages - 3) {
      pages.push('ellipsis')
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages - 1)
    }

    // Remove duplicates
    const uniquePages = Array.from(new Set(pages))

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => !pagination.first && handlePageChange(current - 1, e)}
              className={pagination.first ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              href="#"
            />
          </PaginationItem>
          {uniquePages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={(e) => handlePageChange(page, e)}
                  isActive={page === current}
                  className="cursor-pointer"
                  href="#"
                >
                  {page + 1}
                </PaginationLink>
              </PaginationItem>
            )
          })}
          <PaginationItem>
            <PaginationNext
              onClick={(e) => !pagination.last && handlePageChange(current + 1, e)}
              className={pagination.last ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              href="#"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <AuthGuard>
      {hasTeacherRole() ? (
        <div className="min-h-screen bg-background flex flex-col">
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
              {!isLoading && !error && students.length === 0 && (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="py-20 text-center">
                    <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-6">
                      <Users className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground">{t.students.empty}</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t.students.emptyDescription}</p>
                  </CardContent>
                </Card>
              )}

              {/* Students Grid */}
              {!isLoading && !error && students.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((student) => (
                      <Card
                        key={student.userId}
                        className="relative border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 hover:shadow-md"
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
                                <h3 className="text-base sm:text-lg font-bold text-foreground mb-0.5 truncate">
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
                              <span className="text-xs sm:text-sm text-foreground truncate">
                                {getSubscriptionName(student.subscription)}
                              </span>
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
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination Info */}
                  {pagination.totalElements > 0 && (
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
                  {renderPagination()}
                </>
              )}
            </div>
          </main>
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

