import { Header } from "@/components/header"
import TopicClient from "./topic-client"

export default async function TopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: topicId } = await params

  return <TopicClient topicId={topicId} />
}