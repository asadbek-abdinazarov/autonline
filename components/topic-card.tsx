import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Topic } from "@/lib/data"
import { ArrowRight, BookOpen, Eye } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface TopicCardProps {
  topic: Topic
}

export function TopicCard({ topic }: TopicCardProps) {
  const [showTitleModal, setShowTitleModal] = useState(false)
  const isLongTitle = topic.title.length > 30

  return (
    <Card className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-card to-card/50 w-full h-[280px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
            {topic.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <CardTitle className="text-lg font-bold text-foreground leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors duration-200 flex-1">
                {topic.title}
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
                      <DialogTitle className="text-xl font-bold leading-relaxed">
                        {topic.title}
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
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs font-medium">
                <BookOpen className="w-3 h-3 mr-1" />
                {topic.questionCount} savol
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="flex-1"></div>
        <p className="text-sm text-muted-foreground mb-10 line-clamp-1 leading-relaxed">
          {topic.description}
        </p>
        <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
          <Link href={`/topics/${topic.id}`} className="flex items-center justify-center">
            <span className="font-medium">Boshlash</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
