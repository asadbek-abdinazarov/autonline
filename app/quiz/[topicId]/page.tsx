import dynamic from "next/dynamic"
import { QuizSkeleton } from "@/components/skeletons/quiz-skeleton"

const QuizClient = dynamic(() => import("./quiz-client"), {
  loading: () => <QuizSkeleton />
})

export default async function QuizPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params

  return <QuizClient topicId={topicId} />
}