"use client"

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuizAnswerOption {
    variantId: number
    text: string
    isCorrect: boolean
}

interface QuizAnswerOptionsProps {
    variants: QuizAnswerOption[]
    selectedAnswer: number | undefined
    onSelectAnswer: (variantId: number) => void
    disabled?: boolean
    showResults?: boolean
}

export const QuizAnswerOptions = memo(({
    variants,
    selectedAnswer,
    onSelectAnswer,
    disabled = false,
    showResults = false
}: QuizAnswerOptionsProps) => {
    return (
        <div className="space-y-3">
            {variants.map((variant, index) => {
                const isSelected = selectedAnswer === variant.variantId
                const isCorrect = variant.isCorrect
                const showCorrectAnswer = showResults && isCorrect
                const showIncorrectAnswer = showResults && isSelected && !isCorrect

                return (
                    <Button
                        key={variant.variantId}
                        onClick={() => !disabled && onSelectAnswer(variant.variantId)}
                        disabled={disabled}
                        variant="outline"
                        className={cn(
                            "w-full h-auto min-h-[3.5rem] p-4 text-left justify-start items-start whitespace-normal hover:scale-[1.01] transition-all duration-200",
                            isSelected && !showResults && "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600",
                            showCorrectAnswer && "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600",
                            showIncorrectAnswer && "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600"
                        )}
                    >
                        <div className="flex items-start gap-3 w-full">
                            {/* Answer Number Badge */}
                            <div className={cn(
                                "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                                isSelected && !showResults && "bg-blue-500 text-white",
                                !isSelected && !showResults && "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
                                showCorrectAnswer && "bg-green-500 text-white",
                                showIncorrectAnswer && "bg-red-500 text-white"
                            )}>
                                {index + 1}
                            </div>

                            {/* Answer Text */}
                            <span className="flex-1 text-base text-slate-900 dark:text-white leading-snug">
                                {variant.text}
                            </span>
                        </div>
                    </Button>
                )
            })}
        </div>
    )
}, (prevProps, nextProps) => {
    return (
        prevProps.selectedAnswer === nextProps.selectedAnswer &&
        prevProps.disabled === nextProps.disabled &&
        prevProps.showResults === nextProps.showResults &&
        prevProps.variants === nextProps.variants
    )
})

QuizAnswerOptions.displayName = 'QuizAnswerOptions'
