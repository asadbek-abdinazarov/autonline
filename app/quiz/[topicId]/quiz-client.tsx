"use client"

import { useEffect, useState, useRef, useMemo, startTransition } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, type Permission } from "@/lib/auth"
import { Header } from "@/components/header"
import {
  fetchQuestionsByLessonId,
  submitLessonHistory,
  type QuestionApiResponse,
  type QuestionData,
  clearLessonCache,
  getLocalizedLessonName,
} from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuestionNavigator } from "@/components/question-navigator"
import { QuizTimer } from "@/components/quiz-timer"
import { ImageModal } from "@/components/ui/image-modal"
import { ArrowLeft, CheckCircle2, ZoomIn, History, Menu, Clock, ListChecks, Target, Check } from "lucide-react"
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

interface UserAnswer {
  selectedAnswer: number
  isCorrect: boolean
}

interface QuizClientProps {
  topicId: string
}

export default function QuizClient({ topicId }: QuizClientProps) {
  const { t, language, setLanguage } = useTranslation()
  const router = useRouter()
  const user = getCurrentUser()
  const hasPermission = (perm: Permission) => Array.isArray(user?.permissions) && user!.permissions!.includes(perm)
  const canViewHistory = hasPermission("VIEW_TEST_HISTORY")
  
  const handleLanguageChange = (lang: Language) => {
    if (lang !== language) {
      setLanguage(lang)
    }
  }
  
  const [lessonData, setLessonData] = useState<QuestionApiResponse | null>(null)
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
  const hasFetchedRef = useRef<string | null>(null)
  const hasSubmittedHistoryRef = useRef(false)
  const previousLanguageRef = useRef<string | null>(null)
  const userAnswersRef = useRef<Map<number, UserAnswer>>(new Map())
  const answeredQuestionsRef = useRef<Map<number, boolean>>(new Map())
  const currentQuestionIndexRef = useRef<number>(0)
  const scoreRef = useRef<number>(0)

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

  // Get localized topic name
  const topicName = useMemo(() => {
    if (!lessonData) return ""
    return getLocalizedLessonName(lessonData, language)
  }, [lessonData, language])

  const totalTimeInSeconds = questions.length > 0 ? Math.ceil(questions.length * 1.2 * 60) : 0

  // Fetch lesson data when topicId changes or language changes
  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      startTransition(() => {
        router.push("/login")
      })
      return
    }

    const languageChanged = previousLanguageRef.current !== null && previousLanguageRef.current !== language

    if (languageChanged) {
      clearLessonCache(topicId)
      hasFetchedRef.current = null
      previousLanguageRef.current = language
    } else {
      if (hasFetchedRef.current === topicId && !languageChanged) {
        return
      }
      previousLanguageRef.current = language
    }

    hasFetchedRef.current = topicId

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const savedUserAnswers = languageChanged ? new Map(userAnswersRef.current) : new Map()
        const savedAnsweredQuestions = languageChanged ? new Map(answeredQuestionsRef.current) : new Map()
        const savedCurrentIndex = languageChanged ? currentQuestionIndexRef.current : 0
        const savedScore = languageChanged ? scoreRef.current : 0

        const data = await fetchQuestionsByLessonId(topicId, {
          useCache: !languageChanged,
          forceRefresh: languageChanged,
        })

        startTransition(() => {
          setLessonData(data)
          setQuestions(data.questions)

          if (languageChanged) {
            setUserAnswers(savedUserAnswers)
            setAnsweredQuestions(savedAnsweredQuestions)
            setCurrentQuestionIndex(savedCurrentIndex)
            setScore(savedScore)
            const currentAnswer = savedUserAnswers.get(savedCurrentIndex)
            setIsAnswered(!!currentAnswer)
          }

          setIsLoading(false)
        })
      } catch (err) {
        console.error("Error fetching lesson data:", err)
        startTransition(() => {
          setError(err instanceof Error ? err.message : t.quiz.notFound)
          setIsLoading(false)
        })
        hasFetchedRef.current = null
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, language])

  useEffect(() => {
    const currentAnswer = userAnswers.get(currentQuestionIndex)
    if (currentAnswer) {
      setIsAnswered(true)
    } else {
      setIsAnswered(false)
    }
  }, [currentQuestionIndex, userAnswers])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (showResults && lessonData && lessonData.lessonId && questions.length > 0 && !hasSubmittedHistoryRef.current) {
      const percentage = Math.round((score / questions.length) * 100)
      const correctAnswersCount = score
      const notCorrectAnswersCount = questions.length - score

      submitLessonHistory({
        lessonId: Number(lessonData.lessonId),
        percentage,
        allQuestionsCount: questions.length,
        correctAnswersCount,
        notCorrectAnswersCount,
      })

      hasSubmittedHistoryRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults, lessonData, score, questions.length])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t.quiz.loading}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-lg text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.reload()}>{t.common.retry}</Button>
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

  const loadImageUrl = async (photoKey: string): Promise<string> => {
    if (imageUrlCache.has(photoKey)) {
      return imageUrlCache.get(photoKey)!
    }

    try {
      const blobUrl = await loadImageWithCache(photoKey)

      if (blobUrl) {
        setImageUrlCache((prev) => new Map(prev).set(photoKey, blobUrl))
      }

      return blobUrl
    } catch (error) {
      console.error("Error loading image:", error)
      return ""
    }
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

    if (autoSkipTimeout) {
      clearTimeout(autoSkipTimeout)
    }

    let isCorrect = false
    if (currentQuestion.answers.isCorrect && Array.isArray(currentQuestion.answers.isCorrect)) {
      isCorrect = currentQuestion.answers.isCorrect[answerIndex] === true
    } else if (currentQuestion.answers.status) {
      isCorrect = answerIndex === currentQuestion.answers.status - 1
    } else {
      console.warn("[Quiz] No isCorrect array or status field found for question:", currentQuestion.questionId)
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
    hasSubmittedHistoryRef.current = false
  }

  const progressPercentage = Math.round((answeredQuestions.size / questions.length) * 100)

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
                    <h3 className="text-2xl font-bold">{passed ? t.quiz.congratulations : t.quiz.unfortunately}</h3>
                    <p className="text-muted-foreground">{passed ? t.quiz.passedMessage : t.quiz.failedMessage}</p>
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
                    {t.common.retry}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-11 bg-transparent" asChild>
                      <Link href="/home">{t.quiz.homePage}</Link>
                    </Button>
                    {canViewHistory && (
                      <Button variant="outline" className="h-11 bg-transparent" asChild>
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