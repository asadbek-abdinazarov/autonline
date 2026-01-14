"use client"

import { ReactNode } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface QuizLayoutProps {
    children: ReactNode
    showHeader?: boolean
    showFooter?: boolean
}

export function QuizLayout({
    children,
    showHeader = true,
    showFooter = true
}: QuizLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
            {showHeader && <Header />}

            <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
                {children}
            </main>

            {showFooter && <Footer />}
        </div>
    )
}
