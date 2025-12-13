import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TrafficSignCategory } from "@/lib/data"
import { ArrowRight } from "lucide-react"

interface TrafficSignCategoryCardProps {
  category: TrafficSignCategory
  onClick: () => void
}

export function TrafficSignCategoryCard({ category, onClick }: TrafficSignCategoryCardProps) {
  return (
    <Card 
      className="group hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-300 border-2 border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 bg-slate-50/90 dark:bg-slate-900/50 backdrop-blur-xl w-full h-[280px] flex flex-col cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
            {category.icon}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1 line-clamp-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
              {category.name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 mt-2 line-clamp-3 leading-relaxed transition-colors duration-200">
          {category.description}
        </p>
        <div className="mt-auto">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:gap-3 transition-all duration-200">
            <span>Ko'rish</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}






