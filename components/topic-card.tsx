import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Topic } from "@/lib/data"
import { getLocalizedName, getLocalizedDescription } from "@/lib/data"
import { ArrowRight, BookOpen, Eye } from "lucide-react"
import Link from "next/link"
import { useState, memo, useMemo } from "react"
import { useTranslation } from "@/hooks/use-translation"

interface TopicCardProps {
  topic: Topic
}

function TopicCardComponent({ topic }: TopicCardProps) {
  const { language } = useTranslation()
  const [showTitleModal, setShowTitleModal] = useState(false)
  const localizedTitle = useMemo(() => getLocalizedName(topic, language), [topic, language])
  const localizedDescription = useMemo(() => getLocalizedDescription(topic, language), [topic, language])
  const isLongTitle = useMemo(() => localizedTitle.length > 44, [localizedTitle])

  return (
    <Card className="group hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-300 border-2 border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 bg-slate-50/90 dark:bg-slate-900/50 backdrop-blur-xl w-full h-[280px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
            {topic.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1 line-clamp-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200 flex-1">
                {localizedTitle}
              </CardTitle>
              {isLongTitle && (
                <Dialog open={showTitleModal} onOpenChange={setShowTitleModal}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0 hover:bg-primary/10"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowTitleModal(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold leading-relaxed transition-colors duration-200">
                        {localizedTitle}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-2 mt-4">
                      <Badge variant="secondary" className="text-sm">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {topic.questionCount} ta savol
                      </Badge>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="text-xs font-medium">
                <BookOpen className="w-3 h-3 mr-1" />
                {topic.questionCount} savol
              </Badge>
              {topic.lessonViewsCount !== undefined && topic.lessonViewsCount !== null && (
                <Badge variant="outline" className="text-xs font-medium">
                  <Eye className="w-3 h-3 mr-1" />
                  {topic.lessonViewsCount} marta ko'rilgan
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 mt-2 line-clamp-3 leading-relaxed transition-colors duration-200">
          {localizedDescription}
        </p>
        <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/20 transition-all duration-300">
          <Link href={`/quiz/${topic.id}`} className="flex items-center justify-center">
            <span className="font-medium transition-colors duration-200">Boshlash</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200 transition-colors duration-200" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export const TopicCard = memo(TopicCardComponent)
