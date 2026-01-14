export function QuizSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
            {/* Header Skeleton */}
            <div className="h-16 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800" />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
                    {/* Quiz Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full" />

                    {/* Question Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                        {/* Question Number */}
                        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />

                        {/* Question Text */}
                        <div className="space-y-3">
                            <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>

                        {/* Question Image Placeholder */}
                        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />

                        {/* Answer Options */}
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                            ))}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between">
                        <div className="h-12 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-12 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    </div>

                    {/* Question Navigator */}
                    <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
