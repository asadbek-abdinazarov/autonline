export function HomePageSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
            {/* Header Skeleton */}
            <div className="h-16 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800" />

            <main className="flex-1">
                {/* Hero Section Skeleton */}
                <section className="container mx-auto px-4 py-12 sm:py-16">
                    <div className="max-w-4xl mx-auto text-center space-y-6 animate-pulse">
                        {/* Badge */}
                        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />

                        {/* Title */}
                        <div className="space-y-3">
                            <div className="h-12 sm:h-16 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4 mx-auto" />
                            <div className="h-12 sm:h-16 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/3 mx-auto" />
                        </div>

                        {/* Description */}
                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4 mx-auto" />
                    </div>
                </section>

                {/* News Section Skeleton */}
                <section className="container mx-auto px-4 py-8 sm:py-12">
                    <div className="mb-8 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                            <div>
                                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        ))}
                    </div>
                </section>

                {/* Topics Section Skeleton */}
                <section className="container mx-auto px-4 py-8 sm:py-12">
                    <div className="mb-8 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                            <div>
                                <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                                <div className="h-4 w-56 bg-slate-200 dark:bg-slate-800 rounded" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer Skeleton */}
            <div className="h-16 bg-slate-200/50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800" />
        </div>
    )
}
