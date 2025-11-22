"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { submitLessonHistory, type QuestionApiResponse, type QuestionData, type QuestionDataNew, getLocalizedLessonName } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuestionNavigator } from "@/components/question-navigator"
import { QuizTimer } from "@/components/quiz-timer"
import { ImageModal } from "@/components/ui/image-modal"
import { ArrowLeft, CheckCircle2, ZoomIn, Sparkles, Target, Zap, Play } from "lucide-react"
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
    // Debug: log to identify the issue
    console.log('[Random Quiz] Header language:', language, 'Type:', typeof language)
    
    // Force check: ensure we're using the correct mapping
    let result: 'oz' | 'uz' | 'ru'
    if (language === 'uz') {
      result = 'uz' // Lotincha o'zbekcha - API da uz key
      console.log('[Random Quiz] Mapped to uz (lotincha)')
    } else if (language === 'cyr') {
      result = 'oz' // Kirilcha o'zbekcha - API da oz key
      console.log('[Random Quiz] Mapped to oz (kirilcha)')
    } else if (language === 'ru') {
      result = 'ru' // Ruscha - API da ru key
      console.log('[Random Quiz] Mapped to ru (ruscha)')
    } else {
      // Default to lotincha o'zbekcha
      result = 'uz'
      console.log('[Random Quiz] Default mapped to uz (lotincha)')
    }
    
    console.log('[Random Quiz] Final selectedLanguage:', result)
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
      console.error('Error fetching random quiz:', err)
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

  // Clear auto-skip timeout when component unmounts or question changes
  useEffect(() => {
    return () => {
      if (autoSkipTimeout) {
        clearTimeout(autoSkipTimeout)
      }
    }
  }, [autoSkipTimeout])

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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg mb-4">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
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
                              ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 border-violet-500 text-white shadow-lg"
                              : "bg-card border-border hover:border-primary/50"
                          )}
                        >
                          <div className="flex flex-col items-center justify-center h-full space-y-1">
                            <span className="text-2xl sm:text-3xl font-bold">{count}</span>
                            <span className="text-xs sm:text-sm opacity-80">{t.quiz.questions}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                              <CheckCircle2 className="h-4 w-4 text-violet-600" />
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
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
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
      console.log('[Random Quiz] isCorrect array:', currentQuestion.answers.isCorrect, 'answerIndex:', answerIndex, 'isCorrect:', isCorrect)
    } else if (currentQuestion.answers.status) {
      isCorrect = answerIndex === currentQuestion.answers.status - 1
      console.log('[Random Quiz] Using status field:', currentQuestion.answers.status, 'answerIndex:', answerIndex, 'isCorrect:', isCorrect)
    } else {
      console.warn('[Random Quiz] No isCorrect array or status field found for question:', currentQuestion.questionId)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <Header />

      <main className="flex-1">
        {/* Minimal Hero Section */}
        <section className="relative overflow-hidden pt-4 sm:pt-6 pb-4 sm:pb-6 mb-4 sm:mb-6">
          {/* Background gradient blobs */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 dark:bg-violet-500/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/5 dark:bg-fuchsia-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <Button variant="ghost" size="lg" asChild className="hover:scale-105 transition-transform text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <Link href="/home" className="flex items-center gap-2">
                  <ArrowLeft className="h-5 w-5" />
                  {t.quiz.back}
                </Link>
              </Button>
              <div className="flex items-center gap-4">
                <div className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
                  🎲 {lessonData ? getLocalizedLessonName(lessonData, language) : t.quiz.randomTest}
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                    {selectedLanguage === 'oz' ? "УЗ" : selectedLanguage === 'uz' ? "O'Z" : 'РУ'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quiz Content */}
        <section className="container mx-auto px-4 py-4 sm:py-8">
          <div className="max-w-5xl mx-auto">
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{t.quiz.questionNavigator}</CardTitle>
              </CardHeader>
              <CardContent>
                <QuestionNavigator
                  totalQuestions={questions.length}
                  currentQuestion={currentQuestionIndex}
                  answeredQuestions={answeredQuestions}
                  onQuestionClick={handleQuestionClick}
                />

                <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-success flex-shrink-0"></div>
                    <span className="text-pretty">{t.quiz.correctAnswer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-error flex-shrink-0"></div>
                    <span className="text-pretty">{t.quiz.incorrectAnswer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-muted flex-shrink-0"></div>
                    <span className="text-pretty">{t.quiz.unanswered}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <QuizTimer totalSeconds={totalTimeInSeconds} onTimeUp={handleTimeUp} isPaused={isAnswered} />
              </CardHeader>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-background via-background to-muted/10">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-xl shadow-md">
                      {currentQuestionIndex + 1}
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-2xl font-bold">
                        {t.quiz.question} {currentQuestionIndex + 1} {t.quiz.of} {questions.length}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 font-medium">
                        {t.quiz.randomTest}
                      </p>
                    </div>
                  </div>
                  {isAnswered && currentUserAnswer && (
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full shadow-md",
                      currentUserAnswer.isCorrect ? "bg-success/10 border border-success/20" : "bg-error/10 border border-error/20"
                    )}>
                      {currentUserAnswer.isCorrect ? (
                        <span className="text-success font-semibold flex items-center gap-2 text-sm sm:text-base">
                          <CheckCircle2 className="h-5 w-5" />
                          {t.quiz.correctAnswer}
                        </span>
                      ) : (
                        <span className="text-error font-semibold text-sm sm:text-base">
                          {t.quiz.incorrectAnswer}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-muted/20 rounded-xl border border-muted/50 shadow-sm">
                  <h3 className="text-xl sm:text-2xl font-semibold leading-relaxed text-balance max-w-3xl mx-auto">
                    {(() => {
                      const questionText = currentQuestion.questionText[selectedLanguage]
                      console.log('[Random Quiz] Question text for', selectedLanguage, ':', questionText ? 'Found' : 'Not found')
                      console.log('[Random Quiz] Available keys:', Object.keys(currentQuestion.questionText))
                      return questionText || currentQuestion.questionText.uz
                    })()}
                  </h3>
                </div>

                {currentQuestion.photo && (
                  <div className="flex justify-center">
                    <div className="relative group max-w-lg w-full">
                        <img
                          src={`https://api.rulionline.uz/storage/${currentQuestion.photo}`}
                          alt={t.quiz.questionImage}
                          className="w-full h-auto max-h-64 object-contain rounded-xl border border-muted/50 shadow-md cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const imageUrl = `https://api.rulionline.uz/storage/${currentQuestion.photo}`
                            setCurrentImageUrl(imageUrl)
                            setIsImageModalOpen(true)
                          }}
                        />
                      <div 
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const imageUrl = `https://api.rulionline.uz/storage/${currentQuestion.photo}`
                          setCurrentImageUrl(imageUrl)
                          setIsImageModalOpen(true)
                        }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg flex items-center gap-2">
                          <ZoomIn className="w-5 h-5 text-primary" />
                          <span className="text-primary font-semibold text-sm">{t.quiz.zoom}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-base font-semibold text-center mb-3 text-muted-foreground">
                    {t.quiz.selectAnswer}
                  </h4>
                  <div className="max-w-3xl mx-auto space-y-3">
                    {(currentQuestion.answers.answerText[selectedLanguage] || currentQuestion.answers.answerText.uz).map((option, index) => {
                      // API da to'g'ri javob isCorrect array'da saqlanadi
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
                            "w-full p-5 rounded-xl border-2 transition-all duration-200 shadow-sm",
                            "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20",
                            "transform hover:scale-[1.01] active:scale-[0.99]",
                            !isAnswered && "bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50",
                            !isAnswered && isSelected && "bg-blue-50 border-blue-400 shadow-md",
                            showCorrect && "bg-green-50 border-green-400 shadow-md",
                            showIncorrect && "bg-red-50 border-red-400 shadow-md",
                            isAnswered && !showCorrect && !showIncorrect && "opacity-60 bg-gray-100 border-gray-200",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={cn(
                                "text-lg font-bold flex-shrink-0 mt-0.5",
                                !isAnswered && "text-gray-600",
                                showCorrect && "text-green-600",
                                showIncorrect && "text-red-600",
                                !isAnswered && isSelected && "text-blue-600",
                              )}
                            >
                              {String.fromCharCode(65 + index)}
                            </span>
                            
                            <span
                              className={cn(
                                "text-lg leading-relaxed flex-1 text-left font-medium",
                                !isAnswered && "text-gray-800",
                                (isSelected || showCorrect || showIncorrect) && "font-semibold",
                                showCorrect && "text-green-700",
                                showIncorrect && "text-red-700",
                                !isAnswered && isSelected && "text-blue-700",
                              )}
                            >
                              {option}
                            </span>

                            {isAnswered && (showCorrect || showIncorrect) && (
                              <div className="flex-shrink-0 mt-0.5">
                                {showCorrect ? (
                                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                                ) : (
                                  <span className="text-red-600 text-lg font-bold">✕</span>
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
          </div>
          </div>
        </section>
      </main>

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false)
        }}
        imageUrl={currentImageUrl}
        alt={t.quiz.questionImage}
      />
    </div>
  )
}

