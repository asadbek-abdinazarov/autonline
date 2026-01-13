"use client"

import { useEffect, useState, useRef, useMemo, startTransition } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuestionNavigator } from "@/components/question-navigator"
import { QuizTimer } from "@/components/quiz-timer"
import { ImageModal } from "@/components/ui/image-modal"
import { ArrowLeft, CheckCircle2, ZoomIn, History, Menu, Clock, ListChecks, Target, Check, Loader2 } from "lucide-react"
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
import { loadImageWithCache } from "@/lib/image-loader"
import { useApi } from "@/hooks/use-api"
import { buildApiUrl } from "@/lib/api-utils"

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

interface UserAnswer {
  selectedAnswer: number
  isCorrect: boolean
}

interface TemplateQuizClientProps {
  templateId: string
}

export default function TemplateQuizClient({ templateId }: TemplateQuizClientProps) {
  const { t, language, setLanguage } = useTranslation()
  const router = useRouter()
  const { makeAuthenticatedRequest } = useApi()
  
  const handleLanguageChange = (lang: Language) => {
    if (lang !== language) {
      setLanguage(lang)
    }
  }
  
  // Map header language to question language
  const selectedLanguage = useMemo(() => {
    let result: "oz" | "uz" | "ru"
    if (language === "uz") {
      result = "uz"
    } else if (language === "cyr") {
      result = "oz"
    } else if (language === "ru") {
      result = "ru"
    } else {
      result = "uz"
    }
    return result
  }, [language])
  const [testData, setTestData] = useState<TemplateTestResponse | null>(null)
  const [questions, setQuestions] = useState<TemplateQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Map<number, UserAnswer>>(new Map())
  const [answeredQuestions, setAnsweredQuestions] = useState<Map<number, boolean>>(new Map())
  const [isAnswered, setIsAnswered] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState("")
  const [imageUrlCache, setImageUrlCache] = useState<Map<string, string>>(new Map())
  const [currentImageSrc, setCurrentImageSrc] = useState<string>("")
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [autoSkipTimeout, setAutoSkipTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasFetchedRef = useRef<string | null>(null)
  const hasSubmittedRef = useRef(false)
  const previousLanguageRef = useRef<string | null>(null)
  const userAnswersRef = useRef<Map<number, UserAnswer>>(new Map())
  const answeredQuestionsRef = useRef<Map<number, boolean>>(new Map())
  const currentQuestionIndexRef = useRef<number>(0)
  const scoreRef = useRef<number>(0)

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

  // Fetch template test data from API or localStorage
  const fetchTemplateTest = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const savedUserAnswers = previousLanguageRef.current !== null && previousLanguageRef.current !== language 
        ? new Map(userAnswersRef.current) 
        : new Map()
      const savedAnsweredQuestions = previousLanguageRef.current !== null && previousLanguageRef.current !== language
        ? new Map(answeredQuestionsRef.current)
        : new Map()
      const savedCurrentIndex = previousLanguageRef.current !== null && previousLanguageRef.current !== language
        ? currentQuestionIndexRef.current
        : 0
      const savedScore = previousLanguageRef.current !== null && previousLanguageRef.current !== language
        ? scoreRef.current
        : 0

      // Try localStorage first (only on initial load)
      const savedData = localStorage.getItem(`templateTest_${templateId}`)
      let data: TemplateTestResponse | null = null

      if (savedData && previousLanguageRef.current === null) {
        // Initial load from localStorage
        data = JSON.parse(savedData)
        localStorage.removeItem(`templateTest_${templateId}`)
      } else {
        // Fetch from API (for language changes or if localStorage is empty)
        const response = await makeAuthenticatedRequest(buildApiUrl('/api/v1/templates/start-test'), {
          method: 'POST',
          body: JSON.stringify({ testTemplateId: Number(templateId) }),
        })

        if (response) {
          const { safeJsonParse } = await import('@/lib/api-utils')
          const apiData = await safeJsonParse<TemplateTestResponse>(response)
          if (apiData) {
            data = apiData
          }
        }
      }

      if (data) {
        startTransition(() => {
          setTestData(data)
          setQuestions(data.questions)

          // Restore user answers if language changed
          if (previousLanguageRef.current !== null && previousLanguageRef.current !== language) {
            setUserAnswers(savedUserAnswers)
            setAnsweredQuestions(savedAnsweredQuestions)
            setCurrentQuestionIndex(savedCurrentIndex)
            setScore(savedScore)
            const currentAnswer = savedUserAnswers.get(savedCurrentIndex)
            setIsAnswered(!!currentAnswer)
          }

          setIsLoading(false)
        })
      } else {
        setError(t.templates.dataNotFound)
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Error loading test data:", err)
      startTransition(() => {
        setError(t.templates.loadError)
        setIsLoading(false)
      })
      hasFetchedRef.current = null
    }
  }

  // Load test data when templateId or language changes
  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }

    const languageChanged = previousLanguageRef.current !== null && previousLanguageRef.current !== language

    if (languageChanged) {
      hasFetchedRef.current = null
    } else {
      if (hasFetchedRef.current === templateId && !languageChanged) {
        previousLanguageRef.current = language
        return
      }
    }

    previousLanguageRef.current = language
    hasFetchedRef.current = templateId
    fetchTemplateTest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, language, router])

  useEffect(() => {
    const currentAnswer = userAnswers.get(currentQuestionIndex)
    if (currentAnswer) {
      setIsAnswered(true)
    } else {
      setIsAnswered(false)
    }
  }, [currentQuestionIndex, userAnswers])

  // Function to load image with cache support
  const loadImageUrl = async (photoKey: string): Promise<string> => {
    if (imageUrlCache.has(photoKey)) {
      return imageUrlCache.get(photoKey)!
    }

    try {
      const blobUrl = await loadImageWithCache(photoKey)
      if (blobUrl) {
        setImageUrlCache(prev => new Map(prev).set(photoKey, blobUrl))
      }
      return blobUrl
    } catch (error) {
      console.error('Error loading image:', error)
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
  }, [currentQuestionIndex, questions])

  useEffect(() => {
    return () => {
      if (autoSkipTimeout) {
        clearTimeout(autoSkipTimeout)
      }
    }
  }, [autoSkipTimeout])

  useEffect(() => {
    return () => {
      imageUrlCache.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  const totalTimeInSeconds = questions.length > 0 ? Math.ceil(questions.length * 1.2 * 60) : 0

  const handleAnswerSelect = (variantIndex: number) => {
    if (isAnswered || showResults) return

    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    const selectedVariant = currentQuestion.variants[variantIndex]
    const isCorrect = selectedVariant?.isCorrect || false

    const newAnswer: UserAnswer = {
      selectedAnswer: variantIndex,
      isCorrect,
    }

    setUserAnswers(prev => {
      const newMap = new Map(prev)
      newMap.set(currentQuestionIndex, newAnswer)
      return newMap
    })

    setAnsweredQuestions(prev => {
      const newMap = new Map(prev)
      newMap.set(currentQuestionIndex, isCorrect)
      return newMap
    })

    setIsAnswered(true)

    // Auto-skip to next question after 2 seconds
    const timeout = setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        handleFinish()
      }
    }, 2000)

    setAutoSkipTimeout(timeout)

    // Update score
    if (isCorrect) {
      setScore(prev => prev + 1)
    }
  }

  const handleFinish = async () => {
    if (hasSubmittedRef.current || !testData) return
    
    hasSubmittedRef.current = true
    setIsSubmitting(true)
    
    try {
      const totalQuestions = questions.length
      const correctCount = score
      const wrongCount = totalQuestions - score
      const percentage = Math.round((score / totalQuestions) * 100)
      
      const response = await makeAuthenticatedRequest(buildApiUrl('/api/v1/templates/finish-test'), {
        method: 'POST',
        body: JSON.stringify({
          testResultId: testData.testResultId,
          score: score,
          correctCount: correctCount,
          wrongCount: wrongCount,
          percentage: percentage,
        }),
      })
      
      if (response) {
        const { safeJsonParse } = await import('@/lib/api-utils')
        const data = await safeJsonParse<{
          testResultId: number
          score: number
          correctCount: number
          wrongCount: number
          startedAt: string
          finishedAt: string
        }>(response)
        
        if (data) {
          // Successfully submitted
          setShowResults(true)
        } else {
          setError(t.templates.submitError)
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error finishing test:', err)
      }
      setError(err instanceof Error ? err.message : t.templates.submitError)
    } finally {
      setIsSubmitting(false)
      // Show results even if submission fails
      setShowResults(true)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      handleFinish()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleQuestionClick = (index: number) => {
    if (autoSkipTimeout) {
      clearTimeout(autoSkipTimeout)
      setAutoSkipTimeout(null)
    }
    setCurrentQuestionIndex(index)
  }

  const handleTimeUp = () => {
    handleFinish()
  }

  const progressPercentage = Math.round((answeredQuestions.size / questions.length) * 100)
  const correctAnswersCount = Array.from(answeredQuestions.values()).filter(Boolean).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-500 dark:text-purple-400" />
            <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">{t.templates.loading}</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !testData || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">{t.templates.error}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {error || t.templates.dataNotFoundShort}
              </p>
              <Button onClick={() => router.push("/templates")} className="w-full">
                {t.templates.backToTemplates}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentUserAnswer = userAnswers.get(currentQuestionIndex)
  const answeredCount = answeredQuestions.size
  const totalQuestions = questions.length

  if (showResults) {
    const percentage = Math.round((score / totalQuestions) * 100)
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
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full opacity-20 animate-pulse",
                        passed ? "bg-success" : "bg-error",
                      )}
                    />
                    <div
                      className={cn(
                        "relative w-full h-full rounded-full border-4 flex items-center justify-center bg-background",
                        passed ? "border-success text-success" : "border-error text-error",
                      )}
                    >
                      <span className="text-4xl font-bold">{percentage}%</span>
                    </div>
                </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">
                      {passed ? t.templates.congratulations : t.templates.unfortunately}
                    </h3>
                    <p className="text-muted-foreground">
                      {passed ? t.templates.passedMessage : t.templates.failedMessage}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t.templates.totalQuestions}</p>
                    <p className="text-xl font-bold">{totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t.templates.correctAnswers}</p>
                    <p className="text-xl font-bold text-success">{score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t.templates.incorrectAnswers}</p>
                    <p className="text-xl font-bold text-error">{totalQuestions - score}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button onClick={() => router.push("/templates")} className="w-full text-lg h-12">
                    {t.templates.backToTemplates}
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
    <div className="h-screen bg-muted/20 flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
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
                    <SheetTitle className="text-left">{t.templates.questionNavigator}</SheetTitle>
                  </SheetHeader>

                  <div className="p-4 space-y-4">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t.templates.timeRemaining}
                          </p>
                          <QuizTimer totalSeconds={totalTimeInSeconds} onTimeUp={handleTimeUp} isPaused={false} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <ListChecks className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">{t.templates.answered}</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {answeredQuestions.size}
                          <span className="text-base text-muted-foreground">/{totalQuestions}</span>
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-success" />
                          <span className="text-xs font-medium text-muted-foreground">{t.templates.correctAnswers}</span>
                        </div>
                        <p className="text-2xl font-bold text-success">{correctAnswersCount}</p>
                      </div>
                    </div>

                    {/* Question Navigator */}
                    <div className="bg-background rounded-xl border p-4">
              <QuestionNavigator
                totalQuestions={totalQuestions}
                currentQuestion={currentQuestionIndex}
                answeredQuestions={answeredQuestions}
                onQuestionClick={handleQuestionClick}
              />
                    </div>

                    {/* Back to Templates button */}
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href="/templates">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t.templates.backToTemplates}
                      </Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                <Link href="/templates">
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">
                  {currentQuestionIndex + 1}/{totalQuestions}
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
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:flex-col w-72 xl:w-80 flex-shrink-0 h-full gap-4 pb-4">
            <Button variant="outline" asChild className="w-full justify-start gap-2 bg-background shrink-0">
              <Link href="/templates">
                <ArrowLeft className="h-4 w-4" />
                {t.templates.backToTemplates}
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
                      {t.templates.timeRemaining}
                    </p>
                    <QuizTimer totalSeconds={totalTimeInSeconds} onTimeUp={handleTimeUp} isPaused={false} />
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/40 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <ListChecks className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">{t.templates.answered}</span>
                    </div>
                    <p className="text-xl font-bold">
                      {answeredQuestions.size}
                      <span className="text-sm text-muted-foreground font-normal">/{totalQuestions}</span>
                    </p>
              </div>
                  <div className="bg-success/10 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Target className="h-4 w-4 text-success" />
                      <span className="text-xs font-medium text-muted-foreground">{t.templates.correctAnswers}</span>
                    </div>
                    <p className="text-xl font-bold text-success">{correctAnswersCount}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{t.templates.answered}</span>
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
                {testData?.name && (
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-foreground line-clamp-2">
                      {testData.name}
                    </h3>
                    {testData?.icon && (
                      <span className="text-xl flex-shrink-0" role="img" aria-label="test icon">
                        {testData.icon}
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="px-4 pt-2 pb-4 flex-1 overflow-y-auto">
                <QuestionNavigator
                  totalQuestions={totalQuestions}
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
                      {t.templates.question} {currentQuestionIndex + 1}
                    </h2>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold leading-relaxed text-balance">
                      {currentQuestion.questionText}
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
                          <p className="text-sm text-muted-foreground">{t.templates.imageLoading}</p>
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
                {currentQuestion.variants.map((variant, index) => {
                  const isSelected = currentUserAnswer?.selectedAnswer === index
                  const showResult = isAnswered
                  const isCorrect = variant.isCorrect

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
                      key={variant.variantId}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={isAnswered || showResults}
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
                          {variant.text}
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
                    {t.common.previous}
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                  >
                    {t.common.next}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={currentImageUrl}
      />
    </div>
  )
}

