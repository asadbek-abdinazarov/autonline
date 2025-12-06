"use client"

import { useEffect, useState, useRef, useMemo, startTransition } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { fetchQuestionsByLessonId, submitLessonHistory, type QuestionApiResponse, type QuestionData, getLocalizedLessonName, clearLessonCache } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuestionNavigator } from "@/components/question-navigator"
import { QuizTimer } from "@/components/quiz-timer"
import { ImageModal } from "@/components/ui/image-modal"
import { ArrowLeft, CheckCircle2, ZoomIn } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"

interface UserAnswer {
  selectedAnswer: number
  isCorrect: boolean
}

interface QuizClientProps {
  topicId: string
}

export default function QuizClient({ topicId }: QuizClientProps) {
  const { t, language } = useTranslation()
  const router = useRouter()
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
  const [autoSkipTimeout, setAutoSkipTimeout] = useState<NodeJS.Timeout | null>(null)
  const hasFetchedRef = useRef<string | null>(null)
  const hasSubmittedHistoryRef = useRef(false)
  const previousLanguageRef = useRef<string | null>(null)
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
    console.log('[Quiz] Header language:', language, 'Type:', typeof language)
    
    // Force check: ensure we're using the correct mapping
    let result: 'oz' | 'uz' | 'ru'
    if (language === 'uz') {
      result = 'uz' // Lotincha o'zbekcha - API da uz key
      console.log('[Quiz] Mapped to uz (lotincha)')
    } else if (language === 'cyr') {
      result = 'oz' // Kirilcha o'zbekcha - API da oz key
      console.log('[Quiz] Mapped to oz (kirilcha)')
    } else if (language === 'ru') {
      result = 'ru' // Ruscha - API da ru key
      console.log('[Quiz] Mapped to ru (ruscha)')
    } else {
      // Default to lotincha o'zbekcha
      result = 'uz'
      console.log('[Quiz] Default mapped to uz (lotincha)')
    }
    
    console.log('[Quiz] Final selectedLanguage:', result)
    return result
  }, [language])

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

    // Check if language has changed
    const languageChanged = previousLanguageRef.current !== null && previousLanguageRef.current !== language
    
    // If language changed, clear cache and reset fetch ref to force new fetch
    if (languageChanged) {
      clearLessonCache(topicId)
      hasFetchedRef.current = null
      previousLanguageRef.current = language
    } else {
      // Prevent duplicate requests for the same topicId and language
      if (hasFetchedRef.current === topicId && !languageChanged) {
        return
      }
      previousLanguageRef.current = language
    }

    hasFetchedRef.current = topicId

    // Fetch lesson data (force refresh if language changed)
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Save current userAnswers before refetching (to preserve user's answers when language changes)
        // Use refs to get the latest values without causing dependency issues
        const savedUserAnswers = languageChanged ? new Map(userAnswersRef.current) : new Map()
        const savedAnsweredQuestions = languageChanged ? new Map(answeredQuestionsRef.current) : new Map()
        const savedCurrentIndex = languageChanged ? currentQuestionIndexRef.current : 0
        const savedScore = languageChanged ? scoreRef.current : 0
        
        // Force refresh if language changed, otherwise use cache
        const data = await fetchQuestionsByLessonId(topicId, { 
          useCache: !languageChanged,
          forceRefresh: languageChanged 
        })
        
        // Use startTransition to batch state updates
        startTransition(() => {
          setLessonData(data)
          setQuestions(data.questions)
          
          // Restore userAnswers if language changed (preserve user's progress)
          if (languageChanged) {
            setUserAnswers(savedUserAnswers)
            setAnsweredQuestions(savedAnsweredQuestions)
            setCurrentQuestionIndex(savedCurrentIndex)
            setScore(savedScore)
            // Update isAnswered state based on current question
            const currentAnswer = savedUserAnswers.get(savedCurrentIndex)
            setIsAnswered(!!currentAnswer)
          }
          
          setIsLoading(false)
        })
      } catch (err) {
        console.error('Error fetching lesson data:', err)
        startTransition(() => {
          setError(err instanceof Error ? err.message : t.quiz.notFound)
          setIsLoading(false)
        })
        hasFetchedRef.current = null // Reset on error to allow retry
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

  // Clear auto-skip timeout when component unmounts or question changes
  useEffect(() => {
    return () => {
      if (autoSkipTimeout) {
        clearTimeout(autoSkipTimeout)
      }
    }
  }, [autoSkipTimeout])

  // Submit lesson history when results are shown
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
                <Button onClick={() => window.location.reload()}>
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
      console.log('[Quiz] isCorrect array:', currentQuestion.answers.isCorrect, 'answerIndex:', answerIndex, 'isCorrect:', isCorrect)
    } else if (currentQuestion.answers.status) {
      isCorrect = answerIndex === currentQuestion.answers.status - 1
      console.log('[Quiz] Using status field:', currentQuestion.answers.status, 'answerIndex:', answerIndex, 'isCorrect:', isCorrect)
    } else {
      console.warn('[Quiz] No isCorrect array or status field found for question:', currentQuestion.questionId)
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

    // Set auto-skip timeout only for the current question
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
    // Clear auto-skip timeout when user manually navigates
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
    hasSubmittedHistoryRef.current = false // Reset so history can be submitted again on retry
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
                    {t.common.retry}
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
                <span className="text-sm font-medium">{lessonData?.lessonIcon}</span>
                <span className="text-sm font-medium text-foreground hidden sm:inline">{lessonData ? getLocalizedLessonName(lessonData, language) : ''}</span>
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
                  {currentQuestion.photo && (
                    <div className="flex justify-center">
                      <div className="relative group max-w-md w-full">
                        <img
                          src={`https://api.rulionline.uz/storage/${currentQuestion.photo}`}
                          alt={t.quiz.questionImage}
                          className="w-full h-auto max-h-80 object-contain rounded-lg border border-border shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const imageUrl = `https://api.rulionline.uz/storage/${currentQuestion.photo}`
                            setCurrentImageUrl(imageUrl)
                            setIsImageModalOpen(true)
                          }}
                        />
                        <div 
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const imageUrl = `https://api.rulionline.uz/storage/${currentQuestion.photo}`
                            setCurrentImageUrl(imageUrl)
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
