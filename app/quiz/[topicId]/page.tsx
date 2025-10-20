import QuizClient from "./quiz-client"

export default async function QuizPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params

  return <QuizClient topicId={topicId} />
}