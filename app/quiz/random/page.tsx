import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { QuizSkeleton } from '@/components/skeletons/quiz-skeleton'

const RandomQuizClient = dynamic(() => import('./random-quiz-client'), {
  loading: () => <QuizSkeleton />
})

export default function RandomQuizPage() {
  return (
    <Suspense fallback={<QuizSkeleton />}>
      <RandomQuizClient />
    </Suspense>
  )
}
