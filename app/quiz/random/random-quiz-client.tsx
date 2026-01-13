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
import { ArrowLeft, ArrowRight, CheckCircle2, ZoomIn, Sparkles, Target, Zap, Play, History, Menu, Clock, ListChecks, Check, AlertCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/hooks/use-translation"
import { Language, availableLanguages } from "@/lib/locales"
import { useApi } from "@/hooks/use-api"
import { buildApiUrl } from "@/lib/api-utils"
import { loadImageWithCache } from "@/lib/image-loader"
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
  const { t, language, setLanguage } = useTranslation()
  
  const handleLanguageChange = (lang: Language) => {
    if (lang !== language) {
      setLanguage(lang)
    }
  }
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
  const [isImageLoading, setIsImageLoading] = useState(false)
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

    // Get localized topic name
    const topicName = useMemo(() => {
      if (!lessonData) return ""
      return getLocalizedLessonName(lessonData, language)
    }, [lessonData, language])

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

  // Function to load image with authentication and cache support
  const loadImageUrl = async (photoKey: string): Promise<string> => {
    // Check cache first
    if (imageUrlCache.has(photoKey)) {
      return imageUrlCache.get(photoKey)!
    }

    try {
      // Use centralized image loader with ETag and cache support
      const blobUrl = await loadImageWithCache(photoKey)

      if (blobUrl) {
        // Cache the blob URL in component state
        setImageUrlCache(prev => new Map(prev).set(photoKey, blobUrl))
      }

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
        setIsImageLoading(true)
        const imageUrl = await loadImageUrl(currentQuestion.photo)
        setCurrentImageSrc(imageUrl)
        setIsImageLoading(false)
      } else {
        setCurrentImageSrc("")
        setIsImageLoading(false)
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <Header />
        
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Header Content */}
            <div className="text-center mb-10 space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t.quiz.selectQuestionCount}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
                {t.quiz.selectQuestionCountDescription}
              </p>
            </div>

            {/* Main Control Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800">
              
              {/* Presets Grid */}
              <div className="space-y-6">
                <div className="flex items-center justify-between text-sm font-medium text-slate-900 dark:text-white">
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    {t.quiz.quickSelect}
                  </span>
                  <span className="text-slate-400 font-normal hidden sm:inline">Tavsiya etilgan</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                          "relative h-20 sm:h-24 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/25 transform scale-[1.02]"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-white dark:hover:bg-slate-700"
                        )}
                      >
                        <span className="text-2xl sm:text-3xl font-bold block">{count}</span>
                        <span className={cn(
                          "text-xs font-medium uppercase tracking-wider",
                          isSelected ? "text-blue-100" : "text-slate-400"
                        )}>
                          {t.quiz.questions}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Divider with Text */}
              <div className="relative py-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-slate-900 px-4 text-sm text-slate-400 uppercase tracking-widest font-medium">
                    {t.quiz.custom || "Yoki"}
                  </span>
                </div>
              </div>

              {/* Custom Input Section */}
              <div className="space-y-4">
                <div 
                  className={cn(
                    "group relative flex items-center rounded-2xl border-2 transition-all duration-300 overflow-hidden bg-slate-50 dark:bg-slate-800/50",
                    isCustomMode 
                      ? "border-blue-500 bg-white dark:bg-slate-800 ring-4 ring-blue-500/10" 
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
                    error ? "border-red-500 ring-4 ring-red-500/10" : ""
                  )}
                  onClick={() => setIsCustomMode(true)}
                >
                   <div className="pl-6 text-slate-400">
                      <Sparkles className={cn("h-5 w-5 transition-colors", isCustomMode ? "text-blue-500" : "")} />
                   </div>
                   
                   <Input
                      type="text"
                      inputMode="numeric"
                      placeholder={t.quiz.customIntervalPlaceholder || "O'zingiz kiriting (5-100)"}
                      value={customInterval}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '' || /^\d+$/.test(value)) {
                          setCustomInterval(value)
                          setIsCustomMode(true)
                          setError(null)
                        }
                      }}
                      className="border-none bg-transparent h-16 text-lg sm:text-xl font-semibold shadow-none focus-visible:ring-0 placeholder:text-slate-400"
                   />
                   
                   {isCustomMode && customInterval && (
                     <div className="pr-6 animate-in fade-in zoom-in duration-200">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                     </div>
                   )}
                </div>

                {/* Error & Info Message */}
                <div className="flex items-center justify-between text-xs px-2 h-6">
                  {error ? (
                    <span className="text-red-500 font-medium animate-in slide-in-from-left-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {error}
                    </span>
                  ) : (
                    <span className="text-slate-400 flex gap-4">
                       <span>Min: 5</span>
                       <span>Max: 100</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-4">
                <Button
                  size="lg"
                  onClick={handleStartQuiz}
                  disabled={isCustomMode && (!customInterval || parseInt(customInterval, 10) < 5 || parseInt(customInterval, 10) > 100)}
                  className="w-full h-14 rounded-xl text-lg font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    {t.quiz.startQuiz}
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </Button>

                <Button 
                  variant="ghost" 
                  asChild 
                  className="w-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-transparent"
                >
                  <Link href="/home">
                    {t.quiz.backToHome}
                  </Link>
                </Button>
              </div>
            </div>

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

  const handleNext = () => {
    if (autoSkipTimeout) {
      clearTimeout(autoSkipTimeout)
      setAutoSkipTimeout(null)
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (autoSkipTimeout) {
      clearTimeout(autoSkipTimeout)
      setAutoSkipTimeout(null)
    }
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
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

  // Calculate progress percentage
  const progressPercentage = questions.length > 0 ? Math.round((answeredQuestions.size / questions.length) * 100) : 0

  const correctAnswersCount = Array.from(answeredQuestions.values()).filter(Boolean).length

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100)
    const passed = percentage >= 70

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
            <Card className="border-none shadow-xl bg-card">
              <CardContent className="pt-8 pb-8 px-6 space-y-8">
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-32 h-32">
                    <div className={cn(
                      "absolute inset-0 rounded-full opacity-20 animate-pulse",
                      passed ? "bg-success" : "bg-error"
                    )} />
                    <div className={cn(
                      "relative w-full h-full rounded-full border-4 flex items-center justify-center bg-background",
                      passed ? "border-success text-success" : "border-error text-error"
                    )}>
                      <span className="text-4xl font-bold">{percentage}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{passed ? t.quiz.congratulations : t.quiz.unfortunately}</h3>
                    <p className="text-muted-foreground">
                      {passed ? t.quiz.passedMessage : t.quiz.failedMessage}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t.quiz.totalQuestions}</p>
                    <p className="text-xl font-bold">{questions.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t.quiz.correctAnswers}</p>
                    <p className="text-xl font-bold text-success">{score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t.quiz.incorrectAnswers}</p>
                    <p className="text-xl font-bold text-error">{questions.length - score}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button className="w-full text-lg h-12" onClick={handleRetry}>
                    {t.quiz.newRandomTest}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-11" asChild>
                      <Link href="/home">{t.quiz.homePage}</Link>
                    </Button>
                    {canViewHistory && (
                      <Button variant="outline" className="h-11" asChild>
                        <Link href="/history">
                          <History className="h-4 w-4 mr-2" />
                          {t.history?.title || "Tarix"}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen bg-muted/20 flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden bg-background border-b px-3 py-2.5 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            {/* Menu & Back */}
            <div className="flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-[350px] overflow-y-auto p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="text-left">{t.quiz.questionNavigator}</SheetTitle>
                  </SheetHeader>

                  <div className="p-4 space-y-4">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t.quiz.timeRemaining}
                          </p>
                          <QuizTimer totalSeconds={totalTimeInSeconds} onTimeUp={handleTimeUp} isPaused={false} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <ListChecks className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">{t.quiz.progress}</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {answeredQuestions.size}
                          <span className="text-base text-muted-foreground">/{questions.length}</span>
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-success" />
                          <span className="text-xs font-medium text-muted-foreground">{t.quiz.correctAnswers}</span>
                        </div>
                        <p className="text-2xl font-bold text-success">{correctAnswersCount}</p>
                      </div>
                    </div>

                    {/* Question Navigator */}
                    <div className="bg-background rounded-xl border p-4">
                      <QuestionNavigator
                        totalQuestions={questions.length}
                        currentQuestion={currentQuestionIndex}
                        answeredQuestions={answeredQuestions}
                        onQuestionClick={handleQuestionClick}
                      />
                    </div>

                    {/* Back to Home button */}
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href="/home">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t.quiz.backToHome}
                      </Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                <Link href="/home">
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">
                  {currentQuestionIndex + 1}/{questions.length}
                </span>
                <span className="text-xs text-muted-foreground">{progressPercentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1 bg-muted/60 px-2.5 py-1.5 rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <QuizTimer totalSeconds={totalTimeInSeconds} onTimeUp={handleTimeUp} isPaused={false} minimal />
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-6 lg:p-6 overflow-hidden">
          <aside className="hidden lg:flex lg:flex-col w-72 xl:w-80 flex-shrink-0 h-full gap-4 pb-4">
            <Button variant="outline" asChild className="w-full justify-start gap-2 bg-background shrink-0">
              <Link href="/home">
                <ArrowLeft className="h-4 w-4" />
                {t.quiz.backToHome}
              </Link>
            </Button>

            <Card className="shrink-0">
              <CardContent className="p-4 space-y-4">
                {/* Timer Section */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                      {t.quiz.timeRemaining}
                    </p>
                    <QuizTimer totalSeconds={totalTimeInSeconds} onTimeUp={handleTimeUp} isPaused={false} />
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/40 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <ListChecks className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">{t.quiz.progress}</span>
                    </div>
                    <p className="text-xl font-bold">
                      {answeredQuestions.size}
                      <span className="text-sm text-muted-foreground font-normal">/{questions.length}</span>
                    </p>
                  </div>
                  <div className="bg-success/10 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Target className="h-4 w-4 text-success" />
                      <span className="text-xs font-medium text-muted-foreground">{t.quiz.correctAnswers}</span>
                    </div>
                    <p className="text-xl font-bold text-success">{correctAnswersCount}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{t.quiz.progress}</span>
                    <span className="font-medium">{progressPercentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
              <CardHeader className="pb-2 pt-2 px-4 shrink-0">
                {topicName && (
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-foreground line-clamp-2">
                      {topicName}
                    </h3>
                    
                    {lessonData?.lessonIcon && (
                      <span className="text-xl flex-shrink-0" role="img" aria-label="lesson icon">
                        {lessonData.lessonIcon}
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="px-4 pt-2 pb-4 flex-1 overflow-y-auto">
                <QuestionNavigator
                  totalQuestions={questions.length}
                  currentQuestion={currentQuestionIndex}
                  answeredQuestions={answeredQuestions}
                  onQuestionClick={handleQuestionClick}
                />
              </CardContent>
            </Card>
          </aside>

          {/* Main Question Area - Scrollable */}
          <section className="flex-1 h-full overflow-y-auto pb-20 lg:pb-4 px-4 py-4 lg:py-0">
            <div className="max-w-3xl mx-auto space-y-4 lg:space-y-6">
              {/* Question Card */}
              <div className="bg-card rounded-2xl shadow-sm border p-4 sm:p-6 lg:p-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="mb-4 sm:mb-6 flex justify-between items-start gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <h2 className="text-xs sm:text-sm font-medium text-primary uppercase tracking-wider">
                      {t.quiz.question} {currentQuestionIndex + 1}
                    </h2>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold leading-relaxed text-balance">
                      {(() => {
                        const questionText = currentQuestion.questionText[selectedLanguage]
                        return questionText || currentQuestion.questionText.uz
                      })()}
                    </h3>
                  </div>
                  {/* Language Badge - Clickable to change language */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="shrink-0 px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-xs font-medium uppercase cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        {selectedLanguage}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {availableLanguages.map((lang) => {
                        // Map frontend language to question language
                        const questionLang = lang.code === 'uz' ? 'uz' : lang.code === 'cyr' ? 'oz' : 'ru'
                        const isSelected = selectedLanguage === questionLang
                        return (
                          <DropdownMenuItem
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className="flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <span>{lang.nativeName}</span>
                            {isSelected && <Check className="h-4 w-4" />}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {currentQuestion.photo && (
                  <div className="mb-4 sm:mb-6 lg:mb-8 rounded-xl overflow-hidden border bg-muted/20">
                    {isImageLoading ? (
                      <div className="w-full h-[250px] sm:h-[350px] lg:h-[400px] flex items-center justify-center bg-muted/30">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="text-sm text-muted-foreground">{t.quiz.imageLoading}</p>
                        </div>
                      </div>
                    ) : currentImageSrc ? (
                      <div
                        className="relative group cursor-zoom-in"
                        onClick={() => {
                          setCurrentImageUrl(currentImageSrc)
                          setIsImageModalOpen(true)
                        }}
                      >
                        <img
                          src={currentImageSrc || "/placeholder.svg"}
                          alt="Question"
                          className="w-full h-auto max-h-[250px] sm:max-h-[350px] lg:max-h-[400px] object-contain mx-auto"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md w-8 h-8" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="space-y-2 sm:space-y-3">
                  {(() => {
                    const answerOptions =
                      currentQuestion.answers.answerText[selectedLanguage] || currentQuestion.answers.answerText.uz
                    return answerOptions
                  })().map((option, index) => {
                    let isCorrect = false
                    if (currentQuestion.answers.isCorrect && Array.isArray(currentQuestion.answers.isCorrect)) {
                      isCorrect = currentQuestion.answers.isCorrect[index] === true
                    } else if (currentQuestion.answers.status) {
                      isCorrect = index === currentQuestion.answers.status - 1
                    }

                    const isSelected = currentUserAnswer?.selectedAnswer === index
                    const showResult = isAnswered

                    // Style variants
                    let buttonStyle = "hover:border-primary/50 hover:bg-muted/30"
                    let iconStyle = "bg-muted text-muted-foreground"

                    if (showResult) {
                      if (isCorrect) {
                        buttonStyle = "border-success bg-success/10 text-success-foreground"
                        iconStyle = "bg-success text-white"
                      } else if (isSelected) {
                        buttonStyle = "border-error bg-error/10 text-error-foreground"
                        iconStyle = "bg-error text-white"
                      } else {
                        buttonStyle = "opacity-50"
                      }
                    } else if (isSelected) {
                      buttonStyle = "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                      iconStyle = "bg-primary text-primary-foreground"
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={isAnswered}
                        className={cn(
                          "group w-full p-3 sm:p-4 lg:p-5 rounded-xl border-2 text-left transition-all duration-200 flex gap-3 sm:gap-4 items-start select-none",
                          "active:scale-[0.99]",
                          buttonStyle,
                        )}
                      >
                        <div
                          className={cn(
                            "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 transition-colors mt-0.5",
                            iconStyle,
                          )}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span
                          className={cn(
                            "text-sm sm:text-base lg:text-lg font-medium leading-relaxed",
                            showResult && isCorrect && "text-success font-bold",
                            showResult && isSelected && !isCorrect && "text-error font-bold",
                          )}
                        >
                          {option}
                        </span>

                        {showResult && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-success shrink-0 ml-auto" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    Oldingi
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Keyingi
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={currentImageUrl}
        alt={t.quiz.questionImage}
      />
    </div>
  )
}

