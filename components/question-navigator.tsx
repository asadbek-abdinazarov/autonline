"use client"

import { cn } from "@/lib/utils"

interface QuestionNavigatorProps {
  totalQuestions: number
  currentQuestion: number
  answeredQuestions: Map<number, boolean>
  onQuestionClick: (index: number) => void
}

export function QuestionNavigator({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  onQuestionClick,
}: QuestionNavigatorProps) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {Array.from({ length: totalQuestions }, (_, i) => {
        const isAnswered = answeredQuestions.has(i)
        const isCorrect = answeredQuestions.get(i)
        const isCurrent = i === currentQuestion

        return (
          <button
            key={i}
            onClick={() => onQuestionClick(i)}
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-semibold transition-all text-sm sm:text-base",
              "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
              isCurrent && "ring-2 ring-primary",
              !isAnswered && "bg-muted text-muted-foreground",
              isAnswered && isCorrect && "bg-success text-success-foreground",
              isAnswered && !isCorrect && "bg-error text-error-foreground",
            )}
          >
            {i + 1}
          </button>
        )
      })}
    </div>
  )
}
