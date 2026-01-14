"use client"

import { memo, useEffect, useState } from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import type { QuizQuestion } from '@/hooks/quiz/use-quiz-state'
import type { QuizImagesHook } from '@/hooks/quiz/use-quiz-images'

interface QuizQuestionProps {
    question: QuizQuestion
    questionNumber: number
    totalQuestions: number
    images: QuizImagesHook
}

export const QuizQuestionComponent = memo(({
    question,
    questionNumber,
    totalQuestions,
    images
}: QuizQuestionProps) => {
    const [imageUrl, setImageUrl] = useState<string>('')
    const [imageError, setImageError] = useState(false)

    useEffect(() => {
        if (question.photo) {
            const cachedUrl = images.getImageUrl(question.photo)
            if (cachedUrl) {
                setImageUrl(cachedUrl)
            } else {
                images.loadImage(question.photo)
                    .then(url => setImageUrl(url))
                    .catch(() => setImageError(true))
            }
        }
    }, [question.photo, images])

    const isLoading = question.photo && images.isImageLoading(question.photo)

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Question Number */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Savol {questionNumber} / {totalQuestions}
                </span>
            </div>

            {/* Question Text */}
            <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg sm:text-xl font-medium text-slate-900 dark:text-white leading-relaxed">
                    {question.questionText}
                </p>
            </div>

            {/* Question Image */}
            {question.photo && (
                <div className="relative w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64 sm:h-80">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : imageError ? (
                        <div className="flex items-center justify-center h-64 sm:h-80">
                            <p className="text-slate-500 dark:text-slate-400">Rasm yuklanmadi</p>
                        </div>
                    ) : imageUrl ? (
                        <div className="relative h-64 sm:h-80 md:h-96">
                            <Image
                                src={imageUrl}
                                alt={`Savol ${questionNumber}`}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                                priority={questionNumber === 1}
                            />
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}, (prevProps, nextProps) => {
    return (
        prevProps.question.questionId === nextProps.question.questionId &&
        prevProps.questionNumber === nextProps.questionNumber
    )
})

QuizQuestionComponent.displayName = 'QuizQuestion'
