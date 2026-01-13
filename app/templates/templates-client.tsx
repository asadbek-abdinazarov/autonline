"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, FileText, Bookmark, CheckCircle2, Clock, XCircle } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { useApi } from "@/hooks/use-api"
import { buildApiUrl } from "@/lib/api-utils"
import { getCurrentUser, type Permission } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Forbidden } from "@/components/forbidden"
import Link from "next/link"

interface TestResultResponse {
  id: number
  score: number | null
  status: string | null
  attemptNumber: number | null
  duration: string | null
  startedAt: string
  finishedAt: string | null
}

interface Template {
  id: number
  title: string
  duration: number
  maxScore: number
  passScore: number
  createdAt: string
  testResultResponse?: TestResultResponse
}

interface Variant {
  variantId: number
  isCorrect: boolean
  text: string
}

interface TemplateQuestion {
  questionId: number
  photo: string
  questionText: string
  variants: Variant[]
}

interface TemplateTestResponse {
  testResultId: number
  testTemplateId: number
  lessonId: number
  icon: string
  name: string
  description: string
  questions: TemplateQuestion[]
}

export default function TemplatesClient() {
  const { t } = useTranslation()
  const router = useRouter()
  const { makeAuthenticatedRequest } = useApi()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [isStartingTest, setIsStartingTest] = useState<number | null>(null)
  
  const user = getCurrentUser()
  const hasPermission = user && Array.isArray(user.permissions) && 
    (user.permissions.includes('LIMITED_TEMPLATES' as Permission) || 
     user.permissions.includes('VIEW_ALL_TEMPLATES' as Permission))
  
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col transition-colors duration-300">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Forbidden />
        </main>
        <Footer />
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  const formatDuration = (duration: string) => {
    // Duration format: "PT25M" or "25" (minutes)
    if (duration.includes('PT')) {
      const match = duration.match(/(\d+)M/)
      if (match) {
        return `${match[1]} daqiqa`
      }
    }
    // If it's just a number, assume it's minutes
    const minutes = parseInt(duration, 10)
    if (!isNaN(minutes)) {
      return `${minutes} daqiqa`
    }
    return duration
  }

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await makeAuthenticatedRequest(buildApiUrl('/api/v1/templates'), {
        method: 'GET',
      })
      
      if (response) {
        const { safeJsonParse } = await import('@/lib/api-utils')
        const data = await safeJsonParse<Template[]>(response)
        if (data) {
          setTemplates(data)
        } else {
          setError('Ma\'lumotlar yuklanmadi yoki noto\'g\'ri format')
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching templates:', err)
      }
      setError(err instanceof Error ? err.message : 'Shablon testlar yuklanmadi')
    } finally {
      setIsLoading(false)
    }
  }, [makeAuthenticatedRequest])

  const startTest = useCallback(async (templateId: number) => {
    try {
      setIsStartingTest(templateId)
      
      const response = await makeAuthenticatedRequest(buildApiUrl('/api/v1/templates/start-test'), {
        method: 'POST',
        body: JSON.stringify({ testTemplateId: templateId }),
      })
      
      if (response) {
        const { safeJsonParse } = await import('@/lib/api-utils')
        const data = await safeJsonParse<TemplateTestResponse>(response)
        if (data) {
          // Save test data to localStorage for quiz page
          if (typeof window !== 'undefined') {
            localStorage.setItem(`templateTest_${templateId}`, JSON.stringify(data))
          }
          // Navigate to quiz page
          router.push(`/templates/${templateId}`)
        } else {
          setError('Test ma\'lumotlari yuklanmadi')
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error starting test:', err)
      }
      setError(err instanceof Error ? err.message : 'Testni boshlashda xatolik yuz berdi')
    } finally {
      setIsStartingTest(null)
    }
  }, [makeAuthenticatedRequest, router])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }
    fetchTemplates()
  }, [fetchTemplates, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col transition-colors duration-300">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/home">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 dark:shadow-purple-500/20">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-900 dark:text-white">Shablon testlar</h1>
              <p className="text-slate-600 dark:text-slate-400">Tayyorlangan shablon testlar ro'yxati</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-500 dark:text-purple-400" />
              <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">Yuklanmoqda...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-6">
              <FileText className="h-10 w-10 text-destructive" />
            </div>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">{error}</p>
            <Button onClick={fetchTemplates} size="lg">
              Qayta urinish
            </Button>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20">
            <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
              <FileText className="h-12 w-12 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Shablon testlar topilmadi</h3>
            <p className="text-slate-600 dark:text-slate-400">Hozircha shablon testlar mavjud emas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template, index) => {
              const hasResult = !!template.testResultResponse
              const isCompleted = hasResult && template.testResultResponse?.finishedAt !== null
              const isSelected = selectedTemplateId === template.id
              
              return (
                <div
                  key={template.id}
                  onClick={() => startTest(template.id)}
                  className={cn(
                    "relative bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer hover:shadow-xl",
                    isStartingTest === template.id && "opacity-50 cursor-wait",
                    isSelected
                      ? "border-purple-500 dark:border-purple-500 shadow-lg shadow-purple-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700"
                  )}
                >
                  {/* Top Section - Title and Date */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {index + 1} SHABLON
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(template.createdAt)}
                      </span>
                      {/* <Bookmark className="h-4 w-4 text-slate-400 dark:text-slate-500" /> */}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-center mb-4">
                    {isStartingTest === template.id ? (
                      <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center border-2 border-purple-200 dark:border-purple-500/30">
                        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                      </div>
                    ) : hasResult ? (
                      (() => {
                        // Test hali tugallanmagan bo'lsa (in progress)
                        if (!isCompleted) {
                          return (
                            <div className="w-16 h-16 rounded-full bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center border-2 border-yellow-200 dark:border-yellow-500/30">
                              <Clock className="h-8 w-8 text-yellow-500" />
                            </div>
                          )
                        }
                        
                        // Test tugallangan, status ni tekshirish
                        const status = template.testResultResponse?.status
                        const isPassed = status === 'PASSED' || status === 'PASS'
                        return (
                          <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center border-2",
                            isPassed
                              ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30"
                              : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30"
                          )}>
                            {isPassed ? (
                              <CheckCircle2 className="h-8 w-8 text-green-500" />
                            ) : (
                              <XCircle className="h-8 w-8 text-red-500" />
                            )}
                          </div>
                        )
                      })()
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                        <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  {hasResult && template.testResultResponse && (
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      {isCompleted ? (
                        <>
                          {template.testResultResponse.score !== null && (
                            <div className="flex items-center gap-2">
                              {template.testResultResponse.status === 'PASSED' || template.testResultResponse.status === 'PASS' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span>To'g'ri javoblar soni: {template.testResultResponse.score}</span>
                            </div>
                          )}
                          {template.testResultResponse.duration && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Vaqt: {formatDuration(template.testResultResponse.duration)}</span>
                            </div>
                          )}
                          {template.testResultResponse.status && (
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-xs font-medium px-2 py-1 rounded-full",
                                template.testResultResponse.status === 'PASSED' || template.testResultResponse.status === 'PASS'
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              )}>
                                {template.testResultResponse.status === 'PASSED' || template.testResultResponse.status === 'PASS' 
                                  ? 'Muvaffaqiyatli' 
                                  : template.testResultResponse.status === 'FAILED' || template.testResultResponse.status === 'FAIL'
                                  ? 'Muvaffaqiyatsiz'
                                  : template.testResultResponse.status}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                          <Clock className="h-4 w-4" />
                          <span>Test jarayonda...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Template Info */}
                  {!hasResult && (
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Vaqt: {template.duration} daqiqa</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Maksimal ball: {template.maxScore}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

