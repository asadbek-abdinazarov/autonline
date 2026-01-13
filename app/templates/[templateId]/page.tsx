import TemplateQuizClient from "./template-quiz-client"

export default async function TemplateQuizPage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params

  return <TemplateQuizClient templateId={templateId} />
}

