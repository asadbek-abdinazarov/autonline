"use client"

import { useEffect, useRef, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { UserPlus, Eye, EyeOff, Loader2 } from "lucide-react"
import { useTranslation, interpolate } from "@/hooks/use-translation"
import { getCurrentUser } from "@/lib/auth"
import { useStudents } from "@/hooks/use-students"
import { useNotification } from "@/components/notification-provider"
import { formatPhoneNumber, getPhoneCursorPosition } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Import our new optimized hooks and components
import { useStudentSearch } from "@/hooks/students/use-student-search"
import { useStudentForm } from "@/hooks/students/use-student-form"
import { useStudentResults } from "@/hooks/students/use-student-results"
import { useStudentUtils } from "@/hooks/students/use-student-utils"

import { StudentsList } from "@/components/students/students-list"
import { StudentSearch } from "@/components/students/student-search"
import { StudentPagination } from "@/components/students/student-pagination"

export function StudentsClient() {
  const { t, language } = useTranslation()
  const { showNotification } = useNotification()
  const user = getCurrentUser()

  // Page state
  const [currentPage, setCurrentPage] = useState(0)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState("")
  const [deleteDialogStudent, setDeleteDialogStudent] = useState<{ userId: number; fullName: string } | null>(null)
  const pageSize = 9

  // Use our custom hooks
  const { students, isLoading, error, pagination, fetchStudents } = useStudents()
  const searchHook = useStudentSearch()
  const formHook = useStudentForm()
  const resultsHook = useStudentResults()
  const { formatDate, getSubscriptionName, getSubscriptionBadgeClasses, formatStatNumber } = useStudentUtils()

  const lastFetchedPageRef = useRef<number | null>(null)

  // Check if user has TEACHER role
  const hasTeacherRole = () => {
    return Array.isArray(user?.roles) && user!.roles!.includes('TEACHER')
  }

  // Fetch students on page change
  useEffect(() => {
    if (hasTeacherRole() && lastFetchedPageRef.current !== currentPage) {
      lastFetchedPageRef.current = currentPage
      fetchStudents(currentPage, pageSize)
    }
  }, [currentPage, fetchStudents])

  // Debounced search
  useEffect(() => {
    if (!searchHook.searchQuery.trim()) {
      searchHook.clearSearch()
      return
    }

    searchHook.setSearchCurrentPage(0)
    const timeoutId = setTimeout(() => {
      searchHook.executeSearch(searchHook.searchQuery, 0, pageSize)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchHook.searchQuery])

  // Search pagination
  useEffect(() => {
    if (searchHook.searchQuery.trim() && searchHook.searchCurrentPage >= 0) {
      searchHook.executeSearch(searchHook.searchQuery, searchHook.searchCurrentPage, pageSize)
    }
  }, [searchHook.searchCurrentPage])

  const handlePageChange = (page: number, e?: React.MouseEvent) => {
    e?.preventDefault()
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const inputValue = input.value
    const cursorPos = input.selectionStart || 0
    const newValue = formatPhoneNumber(inputValue)

    const newCursorPos = getPhoneCursorPosition(inputValue, newValue, cursorPos)
    formHook.updateFormData({ phoneNumber: newValue })

    if (formHook.phoneError) {
      formHook.setPhoneError("")
    }

    requestAnimationFrame(() => {
      const inputElement = document.getElementById('phoneNumber') as HTMLInputElement
      if (inputElement) {
        inputElement.setSelectionRange(newCursorPos, newCursorPos)
      }
    })

    if (newValue.trim().length > 5) {
      const validation = formHook.validateAndNormalizePhone(newValue)
      if (!validation.isValid) {
        formHook.setPhoneError(validation.error)
      } else {
        formHook.setPhoneError("")
      }
    }
  }

  const handlePhoneFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!formHook.formData.phoneNumber || formHook.formData.phoneNumber.trim() === '') {
      formHook.updateFormData({ phoneNumber: '+998 ' })
    }
  }

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const cursorPos = input.selectionStart || 0

    if (e.key === 'Backspace' && cursorPos <= 5) {
      e.preventDefault()
      return
    }

    if (cursorPos < 5 && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
      e.preventDefault()
      input.setSelectionRange(5, 5)
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError("")

    if (!formHook.validateForm()) {
      return
    }

    const phoneValidation = formHook.validateAndNormalizePhone(formHook.formData.phoneNumber)

    setIsAdding(true)
    try {
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

      let nextPaymentDate = null
      if (formHook.formData.nextPaymentDate) {
        const date = new Date(formHook.formData.nextPaymentDate)
        nextPaymentDate = date.toISOString()
      }

      const requestBody = {
        fullName: formHook.formData.fullName,
        username: formHook.formData.username,
        password: formHook.formData.password,
        confirmPassword: formHook.formData.confirmPassword,
        phoneNumber: phoneValidation.normalized,
        nextPaymentDate: nextPaymentDate,
      }

      const response = await fetch(buildApiUrl('/api/v1/students'), {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await safeJsonParse<{ message?: string; error?: string }>(response)
        const errorMessage = errorData?.message || errorData?.error || null

        if (response.status >= 500 && response.status < 600) {
          await handleApiError({ status: response.status })
          setAddError(errorMessage || 'Server xatoligi. Iltimos, keyinroq urinib ko\'ring.')
          setIsAdding(false)
          return
        }

        setAddError(errorMessage || `HTTP error! status: ${response.status}`)
        setIsAdding(false)
        return
      }

      formHook.resetForm()
      setAddError("")
      setIsAdding(false)
      setIsAddDialogOpen(false)

      showNotification(
        t.students.addSuccess || `O'quvchi muvaffaqiyatli qo'shildi`,
        'success'
      )

      await fetchStudents(currentPage, pageSize)
    } catch (err) {
      console.error('Error adding student:', err)
      const errorMessage = err instanceof Error ? err.message : t.students.addError || "O'quvchi qo'shilmadi"
      setAddError(errorMessage)
      setIsAdding(false)
    }
  }

  const handleDeleteStudent = async (studentId: number) => {
    try {
      setDeletingId(studentId)

      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      const apiLanguage = language === 'cyr' ? 'oz' : language === 'ru' ? 'ru' : 'uz'

      const { buildApiUrl, getDefaultHeaders, handleApiError } = await import('@/lib/api-utils')

      const headers: Record<string, string> = {
        ...getDefaultHeaders(),
        'Accept-Language': apiLanguage,
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(buildApiUrl(`/api/v1/students/by-id/${studentId}`), {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 429 || (response.status >= 500 && response.status < 600)) {
          await handleApiError({ status: response.status })
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      showNotification(
        t.students.deleteSuccess || "O'quvchi o'chirildi",
        'success'
      )

      await fetchStudents(currentPage, pageSize)
    } catch (err) {
      console.error('Error deleting student:', err)
      const { handleApiError } = await import('@/lib/api-utils')
      await handleApiError(err)
    } finally {
      setDeletingId(null)
      setDeleteDialogStudent(null)
    }
  }

  // Determine which data to show (search results or regular list)
  const displayStudents = searchHook.searchQuery.trim() ? searchHook.searchResults : students
  const displayPagination = searchHook.searchQuery.trim() ? searchHook.searchPagination : pagination
  const displayIsLoading = searchHook.searchQuery.trim() ? searchHook.isSearching : isLoading

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                {t.students.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t.students.description}
              </p>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="hover:scale-[1.02] transition-transform duration-200"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t.students.addStudent}
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <StudentSearch
              searchQuery={searchHook.searchQuery}
              onSearchChange={searchHook.setSearchQuery}
              onClearSearch={searchHook.clearSearch}
            />
          </div>

          {/* Students List */}
          <StudentsList
            students={displayStudents}
            isLoading={displayIsLoading}
            error={error}
            deletingId={deletingId}
            onViewResults={(student) => resultsHook.fetchStudentResults(student, 0, 4)}
            onDelete={(studentId) => {
              const student = displayStudents.find(s => s.userId === studentId)
              if (student) {
                setDeleteDialogStudent({ 
                  userId: student.userId, 
                  fullName: student.fullName || student.username 
                })
              }
            }}
            formatDate={formatDate}
            getSubscriptionName={getSubscriptionName}
            getSubscriptionBadgeClasses={getSubscriptionBadgeClasses}
          />

          {/* Pagination */}
          {displayPagination && displayPagination.totalPages > 1 && (
            <StudentPagination
              currentPage={searchHook.searchQuery.trim() ? searchHook.searchCurrentPage : currentPage}
              totalPages={displayPagination.totalPages}
              totalElements={displayPagination.totalElements}
              pageSize={pageSize}
              onPageChange={searchHook.searchQuery.trim()
                ? (page, e) => { e?.preventDefault(); searchHook.setSearchCurrentPage(page) }
                : handlePageChange
              }
            />
          )}
        </main>

        <Footer />

        {/* Add Student Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.students.addStudent}</DialogTitle>
              <DialogDescription>
                {t.students.addStudentDescription}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t.students.fullName}</Label>
                <Input
                  id="fullName"
                  value={formHook.formData.fullName}
                  onChange={(e) => formHook.updateFormData({ fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">{t.students.username}</Label>
                <Input
                  id="username"
                  value={formHook.formData.username}
                  onChange={(e) => formHook.updateFormData({ username: e.target.value })}
                  required
                  className={formHook.usernameError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {formHook.usernameError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formHook.usernameError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t.students.phoneNumber}</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formHook.formData.phoneNumber}
                  onChange={handlePhoneChange}
                  onFocus={handlePhoneFocus}
                  onKeyDown={handlePhoneKeyDown}
                  required
                />
                {formHook.phoneError && (
                  <p className="text-sm text-red-500">{formHook.phoneError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.students.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={formHook.showPassword ? "text" : "password"}
                    value={formHook.formData.password}
                    onChange={(e) => formHook.updateFormData({ password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => formHook.setShowPassword(!formHook.showPassword)}
                  >
                    {formHook.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.students.confirmPassword}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={formHook.showConfirmPassword ? "text" : "password"}
                    value={formHook.formData.confirmPassword}
                    onChange={(e) => formHook.updateFormData({ confirmPassword: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => formHook.setShowConfirmPassword(!formHook.showConfirmPassword)}
                  >
                    {formHook.showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formHook.passwordError && (
                  <p className="text-sm text-red-500">{formHook.passwordError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextPaymentDate">{t.students.nextPaymentDate}</Label>
                <Input
                  id="nextPaymentDate"
                  type="datetime-local"
                  value={formHook.formData.nextPaymentDate}
                  onChange={(e) => formHook.updateFormData({ nextPaymentDate: e.target.value })}
                />
              </div>

              {addError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{addError}</p>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    formHook.resetForm()
                    setAddError("")
                  }}
                >
                  {t.students.cancel}
                </Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t.students.adding}
                    </>
                  ) : (
                    t.students.add
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteDialogStudent} onOpenChange={(open) => !open && setDeleteDialogStudent(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.students.deleteConfirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {interpolate(t.students.deleteConfirmMessage, { name: deleteDialogStudent?.fullName || '' })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.students.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteDialogStudent && handleDeleteStudent(deleteDialogStudent.userId)}
                className="bg-red-500 hover:bg-red-600"
              >
                {t.students.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Results Dialog - Keeping inline for now, can be extracted later */}
        <Dialog open={resultsHook.isResultsDialogOpen} onOpenChange={(open) => !open && resultsHook.closeResultsDialog()}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {resultsHook.selectedStudent?.fullName || resultsHook.selectedStudent?.username} - {t.students.results}
              </DialogTitle>
            </DialogHeader>

            {resultsHook.isResultsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : resultsHook.resultsError ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400">{resultsHook.resultsError}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Statistics */}
                {resultsHook.lessonStats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-stretch">
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center">
                          {t.students.resultsTotalTests}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex items-center justify-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white text-center">
                          {resultsHook.lessonStats.totalTests}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center">
                          {t.students.resultsPassed}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex items-center justify-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 text-center">
                          {resultsHook.lessonStats.passed}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center">
                          {t.students.resultsAverageScore}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex items-center justify-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center">
                          {formatStatNumber(resultsHook.lessonStats.averageScore)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center">
                          {t.students.resultsSuccessRate}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex items-center justify-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 text-center">
                          {formatStatNumber(resultsHook.lessonStats.successRate)}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Lesson History */}
                {resultsHook.lessonHistories.length > 0 ? (
                  <div className="space-y-3">
                    {resultsHook.lessonHistories.map((history) => (
                      <Card key={history.lessonHistoryId}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 dark:text-white">
                                {history.lessonName}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {formatDate(history.createdDate)}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge
                                className={
                                  history.percentage >= 70
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                }
                              >
                                {history.percentage.toFixed(1)}%
                              </Badge>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {history.correctAnswersCount}/{history.allQuestionCount}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                    {t.students.resultsEmpty}
                  </div>
                )}

                {/* Pagination for results */}
                {resultsHook.lessonHistoryPagination && resultsHook.lessonHistoryPagination.totalPages > 1 && (
                  <StudentPagination
                    currentPage={resultsHook.lessonHistoryPage}
                    totalPages={resultsHook.lessonHistoryPagination.totalPages}
                    totalElements={resultsHook.lessonHistoryPagination.totalElements}
                    pageSize={4}
                    onPageChange={(page, e) => {
                      e?.preventDefault()
                      if (resultsHook.selectedStudent) {
                        resultsHook.fetchStudentResults(resultsHook.selectedStudent, page, 4)
                      }
                    }}
                  />
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
