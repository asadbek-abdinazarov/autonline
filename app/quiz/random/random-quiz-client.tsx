"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/header"
import { fetchRandomQuestions, submitLessonHistory, type QuestionApiResponse, type QuestionData } from "@/lib/data"
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

export default function RandomQuizClient() {
  const { t } = useTranslation()
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
  const [selectedLanguage, setSelectedLanguage] = useState<'oz' | 'uz' | 'ru'>('oz')
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState("")
  const [autoSkipTimeout, setAutoSkipTimeout] = useState<NodeJS.Timeout | null>(null)
  const hasFetchedRef = useRef(false)
  const hasSubmittedHistoryRef = useRef(false)

  const totalTimeInSeconds = questions.length > 0 ? Math.ceil(questions.length * 1.2 * 60) : 0

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }

    // Prevent duplicate requests
    if (hasFetchedRef.current) {
      return
    }

    hasFetchedRef.current = true

    // Fetch random questions
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchRandomQuestions(20)
        setLessonData(data)
        setQuestions(data.questions)
      } catch (err) {
        console.error('Error fetching random questions:', err)
        setError(err instanceof Error ? err.message : t.quiz.notFound)
        hasFetchedRef.current = false // Reset on error to allow retry
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

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

  // Submit lesson history when results are shown (skip for random test as lessonId is 0)
  useEffect(() => {
    // Random test doesn't submit history as lessonId is 0
    // History is only for specific topics
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
              <p className="text-muted-foreground">{t.quiz.randomLoading}</p>
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

    const correctAnswerIndex = currentQuestion.answers.status - 1
    const isCorrect = answerIndex === correctAnswerIndex

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
    
    // Reload random questions
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchRandomQuestions(20)
        setLessonData(data)
        setQuestions(data.questions)
      } catch (err) {
        console.error('Error fetching random questions:', err)
        setError(err instanceof Error ? err.message : t.quiz.notFound)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.quiz.back}
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                🎲 {lessonData?.lessonName || t.quiz.randomTest}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedLanguage === 'oz' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLanguage('oz')}
                >
                  O'Z
                </Button>
                <Button
                  variant={selectedLanguage === 'uz' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLanguage('uz')}
                >
                  УЗ
                </Button>
                <Button
                  variant={selectedLanguage === 'ru' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLanguage('ru')}
                >
                  РУ
                </Button>
              </div>
            </div>
          </div>

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
                    {currentQuestion.questionText[selectedLanguage]}
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
                    {currentQuestion.answers.answerText[selectedLanguage].map((option, index) => {
                      const correctAnswerIndex = currentQuestion.answers.status - 1
                      const isCorrect = index === correctAnswerIndex
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

