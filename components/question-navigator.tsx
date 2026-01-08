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
    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
      {Array.from({ length: totalQuestions }, (_, index) => {
        const isAnswered = answeredQuestions.has(index)
        const isCorrect = answeredQuestions.get(index)
        const isCurrent = currentQuestion === index

        return (
          <button
            key={index}
            onClick={() => onQuestionClick(index)}
            className={cn(
              "w-full aspect-square rounded-lg text-sm font-medium transition-all",
              "flex items-center justify-center",
              "hover:ring-2 hover:ring-primary/50",
              isCurrent && "ring-2 ring-primary",
              !isAnswered && "bg-muted text-muted-foreground",
              isAnswered && isCorrect && "bg-success text-success-foreground",
              isAnswered && !isCorrect && "bg-error text-error-foreground",
            )}
          >
            {index + 1}
          </button>
        )
      })}
    </div>
  )
}
