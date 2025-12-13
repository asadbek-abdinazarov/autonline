"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, type Permission } from "@/lib/auth"
import { Header } from "@/components/header"
import { submitLessonHistory, type QuestionApiResponse, type QuestionData, type QuestionDataNew, getLocalizedLessonName } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuestionNavigator } from "@/components/question-navigator"
import { QuizTimer } from "@/components/quiz-timer"
import { ImageModal } from "@/components/ui/image-modal"
import { ArrowLeft, CheckCircle2, ZoomIn, Sparkles, Target, Zap, Play, History } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import { useApi } from "@/hooks/use-api"
import { buildApiUrl } from "@/lib/api-utils"
import { Input } from "@/components/ui/input"

interface UserAnswer {
  selectedAnswer: number
  isCorrect: boolean
}

interface RandomQuizApiResponse {
  id: number
  icon: string
  name: string
  description: string
  viewsCount: number
  questions: QuestionDataNew[]
}

export default function RandomQuizClient() {
  const { t, language } = useTranslation()
  const router = useRouter()
  const { makeAuthenticatedRequest } = useApi()
  const user = getCurrentUser()
  const hasPermission = (perm: Permission) => Array.isArray(user?.permissions) && user!.permissions!.includes(perm)
  const canViewHistory = hasPermission('VIEW_TEST_HISTORY')
  const [lessonData, setLessonData] = useState<QuestionApiResponse | null>(null)
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Map<number, UserAnswer>>(new Map())
  const [answeredQuestions, setAnsweredQuestions] = useState<Map<number, boolean>>(new Map())
  const [isAnswered, setIsAnswered] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  
  // Keep refs in sync with state
  useEffect(() => {
    userAnswersRef.current = userAnswers
  }, [userAnswers])
  
  useEffect(() => {
    answeredQuestionsRef.current = answeredQuestions
  }, [answeredQuestions])
  
  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex
  }, [currentQuestionIndex])
  
  useEffect(() => {
    scoreRef.current = score
  }, [score])
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState("")
  const [imageUrlCache, setImageUrlCache] = useState<Map<string, string>>(new Map())
  const [currentImageSrc, setCurrentImageSrc] = useState<string>("")
  const [autoSkipTimeout, setAutoSkipTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showIntervalSelector, setShowIntervalSelector] = useState(true)
  const [interval, setInterval] = useState<number>(20)
  const [customInterval, setCustomInterval] = useState<string>("")
  const [isCustomMode, setIsCustomMode] = useState(false)
  const hasFetchedRef = useRef(false)
  const hasSubmittedHistoryRef = useRef(false)
  const previousLanguageRef = useRef<string | null>(null)
  const currentQuestionCountRef = useRef<number | null>(null)
  const userAnswersRef = useRef<Map<number, UserAnswer>>(new Map())
  const answeredQuestionsRef = useRef<Map<number, boolean>>(new Map())
  const currentQuestionIndexRef = useRef<number>(0)
  const scoreRef = useRef<number>(0)

  // Map header language to question language
  // Header: uz (lotincha) -> API: uz (lotincha)
  // Header: cyr (kirilcha) -> API: oz (kirilcha)
  // Header: ru (ruscha) -> API: ru (ruscha)
  const selectedLanguage = useMemo(() => {
    // Force check: ensure we're using the correct mapping
    let result: 'oz' | 'uz' | 'ru'
    if (language === 'uz') {
      result = 'uz' // Lotincha o'zbekcha - API da uz key
    } else if (language === 'cyr') {
      result = 'oz' // Kirilcha o'zbekcha - API da oz key
    } else if (language === 'ru') {
      result = 'ru' // Ruscha - API da ru key
    } else {
      // Default to lotincha o'zbekcha
      result = 'uz'
    }
    
    return result
  }, [language])

  const totalTimeInSeconds = questions.length > 0 ? Math.ceil(questions.length * 1.2 * 60) : 0

  // Fetch random questions from API
  const fetchRandomQuiz = useCallback(async (questionCount: number) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const url = buildApiUrl(`/api/v1/random-quiz?interval=${questionCount}`)
      const response = await makeAuthenticatedRequest(url, {
        method: 'GET',
      })

      if (!response) {
        throw new Error('Network error or authentication failed')
      }

      const { safeJsonParse } = await import('@/lib/api-utils')
      const apiData = await safeJsonParse<RandomQuizApiResponse>(response)
      
      if (!apiData) {
        throw new Error('Ma\'lumotlar yuklanmadi yoki noto\'g\'ri format')
      }

      // Convert questions from API response to QuestionData format
      const allQuestions: QuestionData[] = []
      if (apiData.questions && apiData.questions.length > 0) {
        // Convert QuestionDataNew format to QuestionData format
        const convertedQuestions: QuestionData[] = apiData.questions.map((q): QuestionData => ({
          questionId: q.questionId,
          photo: q.photo,
          questionText: {
            uz: q.questionText,
            oz: q.questionText,
            ru: q.questionText,
          },
          answers: {
            answerId: q.variants.find(v => v.isCorrect)?.variantId || 0,
            questionId: q.questionId,
            status: q.variants.findIndex(v => v.isCorrect) + 1, // Find index of correct answer (1-based)
            isCorrect: q.variants.map(v => v.isCorrect), // Create isCorrect array from variants
            answerText: {
              uz: q.variants.map(v => v.text),
              oz: q.variants.map(v => v.text),
              ru: q.variants.map(v => v.text),
            },
          },
        }))
        allQuestions.push(...convertedQuestions)
      }

      if (allQuestions.length === 0) {
        throw new Error('Savollar topilmadi')
      }

      // Create a synthetic QuestionApiResponse for compatibility
      const syntheticResponse: QuestionApiResponse = {
        lessonId: apiData.id || 43, // Use API ID or default to 43 for random quiz
        nameUz: apiData.name || 'Tasodify test',
        nameOz: apiData.name || 'Таъсифий тест',
        nameRu: apiData.name || 'Случайный тест',
        descriptionUz: apiData.description || 'Har hil mavzulardan tayyorlangan tasodify savollar',
        descriptionOz: apiData.description || 'Ҳар хил мавзулардан тайёрланган таъсифий саволлар',
        descriptionRu: apiData.description || 'Случайные вопросы из разных тем',
        lessonIcon: apiData.icon || '🎲',
        lessonQuestionCount: allQuestions.length,
        questions: allQuestions,
      }

      setLessonData(syntheticResponse)
      setQuestions(allQuestions)
      currentQuestionCountRef.current = questionCount
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching random quiz:', err)
      }
      setError(err instanceof Error ? err.message : t.quiz.notFound)
      hasFetchedRef.current = false // Reset on error to allow retry
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [makeAuthenticatedRequest, t.quiz.notFound])

  const handleStartQuiz = () => {
    let questionCount = interval
    if (isCustomMode && customInterval) {
      const customValue = parseInt(customInterval, 10)
      if (isNaN(customValue) || customValue < 5 || customValue > 100) {
        setError(t.quiz.invalidInterval)
        return
      }
      questionCount = customValue
    }
    
    setError(null)
    setShowIntervalSelector(false)
    hasFetchedRef.current = false
    previousLanguageRef.current = language
    fetchRandomQuiz(questionCount)
  }

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }
  }, [router])

  // Watch for language changes and refetch questions if quiz is active
  useEffect(() => {
    // Only refetch if quiz has started (not showing interval selector) and language changed
    if (!showIntervalSelector && questions.length > 0) {
      const languageChanged = previousLanguageRef.current !== null && previousLanguageRef.current !== language
      
      if (languageChanged && currentQuestionCountRef.current !== null) {
        // Save current userAnswers before refetching (to preserve user's answers when language changes)
        // Use refs to get the latest values without causing dependency issues
        const savedUserAnswers = new Map(userAnswersRef.current)
        const savedAnsweredQuestions = new Map(answeredQuestionsRef.current)
        const savedCurrentIndex = currentQuestionIndexRef.current
        const savedScore = scoreRef.current
        
        // Reset fetch ref and update language
        previousLanguageRef.current = language
        hasFetchedRef.current = false
        
        // Refetch with new language
        fetchRandomQuiz(currentQuestionCountRef.current).then(() => {
          // Restore userAnswers after refetch (preserve user's progress)
          setUserAnswers(savedUserAnswers)
          setAnsweredQuestions(savedAnsweredQuestions)
          setCurrentQuestionIndex(savedCurrentIndex)
          setScore(savedScore)
          // Update isAnswered state based on current question
          const currentAnswer = savedUserAnswers.get(savedCurrentIndex)
          setIsAnswered(!!currentAnswer)
        }).catch(() => {
          // If fetch fails, reset state
          setUserAnswers(new Map())
          setAnsweredQuestions(new Map())
          setCurrentQuestionIndex(0)
          setIsAnswered(false)
          setScore(0)
        })
      } else if (previousLanguageRef.current === null) {
        previousLanguageRef.current = language
      }
    } else if (previousLanguageRef.current === null) {
      previousLanguageRef.current = language
    }
  }, [language, showIntervalSelector, questions.length, fetchRandomQuiz])

  useEffect(() => {
    const currentAnswer = userAnswers.get(currentQuestionIndex)
    if (currentAnswer) {
      setIsAnswered(true)
    } else {
      setIsAnswered(false)
    }
  }, [currentQuestionIndex, userAnswers])

  // Function to validate if a blob URL is still valid
  const isValidBlobUrl = (url: string): Promise<boolean> => {
    if (!url.startsWith('blob:')) return Promise.resolve(true) // Non-blob URLs are considered valid
    
    return new Promise((resolve) => {
      const img = new Image()
      let resolved = false
      
      img.onload = () => {
        if (!resolved) {
          resolved = true
          resolve(true)
        }
      }
      
      img.onerror = () => {
        if (!resolved) {
          resolved = true
          resolve(false)
        }
      }
      
      img.src = url
      // Timeout after 2 seconds if image doesn't load
      setTimeout(() => {
        if (!resolved) {
          resolved = true
          resolve(false)
        }
      }, 2000)
    })
  }

  // Function to load image with authentication
  const loadImageUrl = async (photoKey: string): Promise<string> => {
    // Check cache first and validate the URL
    if (imageUrlCache.has(photoKey)) {
      const cachedUrl = imageUrlCache.get(photoKey)!
      
      // For blob URLs, verify they're still valid
      if (cachedUrl.startsWith('blob:')) {
        const isValid = await isValidBlobUrl(cachedUrl)
        if (isValid) {
          return cachedUrl
        } else {
          // Blob URL is invalid (revoked), remove from cache and reload
          setImageUrlCache(prev => {
            const newCache = new Map(prev)
            newCache.delete(photoKey)
            return newCache
          })
        }
      } else {
        // Non-blob URLs are always valid
        return cachedUrl
      }
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      const url = buildApiUrl(`/api/v1/storage/file?key=${encodeURIComponent(photoKey)}`)
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.status}`)
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      
      // Cache the blob URL
      setImageUrlCache(prev => new Map(prev).set(photoKey, blobUrl))
      
      return blobUrl
    } catch (error) {
      console.error('Error loading image:', error)
      // Return empty string or a placeholder
      return ''
    }
  }

  // Load image when question changes
  useEffect(() => {
    const loadCurrentImage = async () => {
      const currentQuestion = questions[currentQuestionIndex]
      if (currentQuestion?.photo) {
        const imageUrl = await loadImageUrl(currentQuestion.photo)
        setCurrentImageSrc(imageUrl)
      } else {
        setCurrentImageSrc("")
      }
    }

    if (questions.length > 0) {
      loadCurrentImage()
    }

    // Don't revoke blob URLs in cleanup - they're cached and should persist
    // Only revoke when component unmounts (handled in separate effect)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, questions])

  // Clear auto-skip timeout when component unmounts or question changes
  useEffect(() => {
    return () => {
      if (autoSkipTimeout) {
        clearTimeout(autoSkipTimeout)
      }
    }
  }, [autoSkipTimeout])

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      imageUrlCache.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Submit lesson history when results are shown for random test as well
  useEffect(() => {
    if (showResults && lessonData && lessonData.lessonId !== undefined && lessonData.lessonId !== null && questions.length > 0 && !hasSubmittedHistoryRef.current) {
      const percentage = Math.round((score / questions.length) * 100)
      const correctAnswersCount = score
      const notCorrectAnswersCount = questions.length - score
      const lessonId = Number(lessonData.lessonId)

      if (!isNaN(lessonId) && lessonId > 0) {
        submitLessonHistory({
          lessonId,
          percentage,
          allQuestionsCount: questions.length,
          correctAnswersCount,
          notCorrectAnswersCount,
        })

        hasSubmittedHistoryRef.current = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults, lessonData, score, questions.length])

  // Interval selector state
  if (showIntervalSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-3xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-8 sm:mb-12 space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {t.quiz.selectQuestionCount}
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {t.quiz.selectQuestionCountDescription}
              </p>
            </div>

            <Card className="border-2 shadow-xl bg-gradient-to-br from-card via-card to-muted/20">
              <CardContent className="p-6 sm:p-8">
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm text-center animate-in fade-in slide-in-from-top-2">
                    {error}
                  </div>
                )}

                {/* Quick Select Buttons */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{t.quiz.quickSelect}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {[20, 50, 100].map((count) => {
                      const isSelected = !isCustomMode && interval === count
                      return (
                        <button
                          key={count}
                          onClick={() => {
                            setInterval(count)
                            setIsCustomMode(false)
                            setCustomInterval("")
                            setError(null)
                          }}
                          className={cn(
                            "relative group h-24 sm:h-28 rounded-xl border-2 transition-all duration-300",
                            "hover:scale-105 hover:shadow-lg",
                            isSelected
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-500 text-white shadow-lg"
                              : "bg-card border-border hover:border-primary/50"
                          )}
                        >
                          <div className="flex flex-col items-center justify-center h-full space-y-1">
                            <span className="text-2xl sm:text-3xl font-bold">{count}</span>
                            <span className="text-xs sm:text-sm opacity-80">{t.quiz.questions}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Option */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{t.quiz.personalized}</h3>
                  </div>
                  <button
                    onClick={() => {
                      setIsCustomMode(!isCustomMode)
                      if (!isCustomMode) {
                        setCustomInterval("")
                      } else {
                        setInterval(20)
                      }
                      setError(null)
                    }}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all duration-300",
                      "hover:scale-[1.02] hover:shadow-md",
                      isCustomMode
                        ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary shadow-md"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-base">{t.quiz.custom}</span>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 transition-all",
                        isCustomMode ? "bg-primary border-primary" : "border-muted-foreground"
                      )}>
                        {isCustomMode && (
                          <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {isCustomMode && (
                    <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder={t.quiz.customIntervalPlaceholder}
                          value={customInterval}
                          onChange={(e) => {
                            const value = e.target.value
                            // Faqat raqamlarni qabul qilish
                            if (value === '' || /^\d+$/.test(value)) {
                              setCustomInterval(value)
                              setError(null)
                            }
                          }}
                          className="text-center text-xl font-semibold h-14 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                          <span className="text-muted-foreground font-medium">{t.quiz.questions}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-success" />
                          <span>Min: 5</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span>Max: 100</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    onClick={handleStartQuiz}
                    disabled={isCustomMode && (!customInterval || parseInt(customInterval, 10) < 5 || parseInt(customInterval, 10) > 100)}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    {t.quiz.startQuiz}
                  </Button>

                  <Button variant="ghost" asChild className="w-full">
                    <Link href="/home" className="flex items-center justify-center">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {t.quiz.backToHome}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t.quiz.randomLoading}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error && !showIntervalSelector) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-lg text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => {
                  setError(null)
                  setShowIntervalSelector(true)
                }}>
                  {t.common.retry}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/home">{t.quiz.backToHome}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-lg text-muted-foreground">{t.quiz.notFound}</p>
              <Button className="mt-4" asChild>
                <Link href="/home">{t.quiz.backToHome}</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentUserAnswer = userAnswers.get(currentQuestionIndex)

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-lg text-muted-foreground">{t.quiz.questionNotFound}</p>
              <Button className="mt-4" asChild>
                <Link href="/home">{t.quiz.backToHome}</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return

    // Clear any existing auto-skip timeout
    if (autoSkipTimeout) {
      clearTimeout(autoSkipTimeout)
    }

    // API da to'g'ri javob isCorrect array'da saqlanadi
    // isCorrect[index] === true bo'lsa, u javob to'g'ri
    let isCorrect = false
    if (currentQuestion.answers.isCorrect && Array.isArray(currentQuestion.answers.isCorrect)) {
      isCorrect = currentQuestion.answers.isCorrect[answerIndex] === true
    } else if (currentQuestion.answers.status) {
      isCorrect = answerIndex === currentQuestion.answers.status - 1
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Random Quiz] No isCorrect array or status field found for question:', currentQuestion.questionId)
      }
    }

    const newUserAnswers = new Map(userAnswers)
    newUserAnswers.set(currentQuestionIndex, { selectedAnswer: answerIndex, isCorrect })
    setUserAnswers(newUserAnswers)

    const newAnsweredQuestions = new Map(answeredQuestions)
    newAnsweredQuestions.set(currentQuestionIndex, isCorrect)
    setAnsweredQuestions(newAnsweredQuestions)

    setIsAnswered(true)

    if (isCorrect) {
      setScore((prev) => prev + 1)
    }

    // Set auto-skip timeout
    const timeout = setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
      } else {
        setShowResults(true)
      }
    }, 1500)
    
    setAutoSkipTimeout(timeout)
  }

  const handleQuestionClick = (index: number) => {
    if (autoSkipTimeout) {
      clearTimeout(autoSkipTimeout)
      setAutoSkipTimeout(null)
    }
    setCurrentQuestionIndex(index)
  }

  const handleTimeUp = () => {
    setShowResults(true)
  }

  const handleRetry = () => {
    setCurrentQuestionIndex(0)
    setUserAnswers(new Map())
    setAnsweredQuestions(new Map())
    setIsAnswered(false)
    setShowResults(false)
    setScore(0)
    hasFetchedRef.current = false
    hasSubmittedHistoryRef.current = false
    
    setShowIntervalSelector(true)
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100)
    const passed = percentage >= 70

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-4 sm:py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-2xl sm:text-3xl">{t.quiz.results}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div
                    className={cn(
                      "inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full mb-4",
                      passed ? "bg-success/20" : "bg-error/20",
                    )}
                  >
                    <span className={cn("text-4xl sm:text-5xl font-bold", passed ? "text-success" : "text-error")}>
                      {percentage}%
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{passed ? t.quiz.congratulations : t.quiz.unfortunately}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {passed ? t.quiz.passedMessage : t.quiz.failedMessage}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div className="p-3 sm:p-4 bg-muted rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t.quiz.totalQuestions}</p>
                    <p className="text-xl sm:text-2xl font-bold">{questions.length}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-success/20 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t.quiz.correctAnswers}</p>
                    <p className="text-xl sm:text-2xl font-bold text-success">{score}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-error/20 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t.quiz.incorrectAnswers}</p>
                    <p className="text-xl sm:text-2xl font-bold text-error">{questions.length - score}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button variant="outline" className="flex-1 bg-transparent" asChild>
                    <Link href="/home">{t.quiz.homePage}</Link>
                  </Button>
                  {canViewHistory && (
                    <Button variant="outline" className="flex-1 bg-transparent" asChild>
                      <Link href="/history" className="flex items-center gap-2 justify-center">
                        <History className="h-4 w-4" />
                        {t.history.title || t.userMenu.testHistory}
                      </Link>
                    </Button>
                  )}
                  <Button className="flex-1" onClick={handleRetry}>
                    {t.quiz.newRandomTest}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* Header Section - Minimal and Clean */}
        <div className="border-b border-border bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/home" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">{t.quiz.back}</span>
                </Link>
              </Button>
              <div className="h-5 w-px bg-border hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{lessonData?.lessonIcon || '🎲'}</span>
                <span className="text-sm font-medium text-foreground hidden sm:inline">{lessonData ? getLocalizedLessonName(lessonData, language) : t.quiz.randomTest}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-primary/10 text-primary">
                {selectedLanguage === 'uz' ? "O'Z" : selectedLanguage === 'oz' ? 'УЗ' : 'РУ'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Sidebar + Quiz */}
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Timer Card */}
                <Card className="bg-gradient-to-br from-primary/5 via-primary/0 to-transparent border-primary/20">
                  <CardContent className="pt-6">
                    <QuizTimer totalSeconds={totalTimeInSeconds} onTimeUp={handleTimeUp} isPaused={isAnswered} />
                  </CardContent>
                </Card>

                {/* Navigator Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t.quiz.questionNavigator}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <QuestionNavigator
                      totalQuestions={questions.length}
                      currentQuestion={currentQuestionIndex}
                      answeredQuestions={answeredQuestions}
                      onQuestionClick={handleQuestionClick}
                    />

                    {/* Legend */}
                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded bg-success"></div>
                        <span className="text-muted-foreground">{t.quiz.correctAnswer}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded bg-error"></div>
                        <span className="text-muted-foreground">{t.quiz.incorrectAnswer}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded bg-muted"></div>
                        <span className="text-muted-foreground">{t.quiz.unanswered}</span>
                      </div>
                    </div>

                    {/* Progress Stats */}
                    <div className="pt-3 border-t border-border">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground mb-1 font-medium">{t.quiz.progress}</p>
                          <p className="text-lg font-bold">{answeredQuestions.size}/{questions.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 font-medium">{t.quiz.score}</p>
                          <p className="text-lg font-bold text-success">{score}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </aside>

            <section className="lg:col-span-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-6 border-b border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold">
                          {currentQuestionIndex + 1}
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {t.quiz.question} {currentQuestionIndex + 1} <span className="text-muted-foreground font-normal">/ {questions.length}</span>
                          </CardTitle>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Badge */}
                    {isAnswered && currentUserAnswer && (
                      <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap",
                        currentUserAnswer.isCorrect 
                          ? "bg-success/15 text-success border border-success/30" 
                          : "bg-error/15 text-error border border-error/30"
                      )}>
                        {currentUserAnswer.isCorrect ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            {t.quiz.correctAnswer}
                          </>
                        ) : (
                          <>
                            <span className="text-lg">✕</span>
                            {t.quiz.incorrectAnswer}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-8 space-y-6">
                  {/* Question Text */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t.quiz.question}</p>
                    <div className="text-center p-6 rounded-lg bg-muted/40 border border-muted/60">
                      <h3 className="text-2xl font-semibold leading-relaxed text-balance">
                        {(() => {
                          const questionText = currentQuestion.questionText[selectedLanguage]
                          return questionText || currentQuestion.questionText.uz
                        })()}
                      </h3>
                    </div>
                  </div>

                  {/* Image - if exists */}
                  {currentQuestion.photo && currentImageSrc && (
                    <div className="flex justify-center">
                      <div className="relative group max-w-md w-full">
                        <img
                          src={currentImageSrc}
                          alt={t.quiz.questionImage}
                          className="w-full h-auto max-h-80 object-contain rounded-lg border border-border shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setCurrentImageUrl(currentImageSrc)
                            setIsImageModalOpen(true)
                          }}
                        />
                        <div 
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setCurrentImageUrl(currentImageSrc)
                            setIsImageModalOpen(true)
                          }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
                            <ZoomIn className="w-4 h-4 text-primary" />
                            <span className="text-primary font-medium text-xs">{t.quiz.zoom}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Answer Options */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t.quiz.selectAnswer}</p>
                    <div className="space-y-2">
                      {(() => {
                        const answerOptions = currentQuestion.answers.answerText[selectedLanguage] || currentQuestion.answers.answerText.uz
                        return answerOptions
                      })().map((option, index) => {
                        let isCorrect = false
                        if (currentQuestion.answers.isCorrect && Array.isArray(currentQuestion.answers.isCorrect)) {
                          isCorrect = currentQuestion.answers.isCorrect[index] === true
                        } else if (currentQuestion.answers.status) {
                          isCorrect = index === currentQuestion.answers.status - 1
                        }
                        const isSelected = currentUserAnswer?.selectedAnswer === index
                        const showCorrect = isAnswered && isCorrect
                        const showIncorrect = isAnswered && isSelected && !isCorrect

                        return (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            disabled={isAnswered}
                            className={cn(
                              "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left",
                              "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20",
                              "transform hover:scale-[1.01] active:scale-[0.99]",
                              !isAnswered && "bg-card border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer",
                              !isAnswered && isSelected && "bg-primary/10 border-primary shadow-md",
                              showCorrect && "bg-success/10 border-success shadow-md",
                              showIncorrect && "bg-error/10 border-error shadow-md",
                              isAnswered && !showCorrect && !showIncorrect && "opacity-50 bg-muted/30 border-muted/50 cursor-not-allowed",
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm flex-shrink-0 mt-0.5",
                                !isAnswered && "bg-muted text-foreground",
                                !isAnswered && isSelected && "bg-primary text-primary-foreground",
                                showCorrect && "bg-success text-white",
                                showIncorrect && "bg-error text-white",
                              )}>
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span className={cn(
                                "flex-1 font-medium leading-relaxed",
                                !isAnswered && "text-foreground",
                                (isSelected || showCorrect || showIncorrect) && "font-semibold",
                                showCorrect && "text-success",
                                showIncorrect && "text-error",
                                !isAnswered && isSelected && "text-primary",
                              )}>
                                {option}
                              </span>
                              {isAnswered && (showCorrect || showIncorrect) && (
                                <div className="flex-shrink-0 mt-1">
                                  {showCorrect ? (
                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                  ) : (
                                    <span className="text-error text-lg font-bold">✕</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={currentImageUrl}
        alt={t.quiz.questionImage}
      />
    </div>
  )
}

