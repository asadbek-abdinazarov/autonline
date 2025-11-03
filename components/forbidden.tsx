"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ShieldAlert, Home, ArrowLeft } from "lucide-react"

export function Forbidden() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-12 sm:py-16 flex-1 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-destructive/10 mb-6">
              <ShieldAlert className="h-12 w-12 sm:h-16 sm:w-16 text-destructive" />
            </div>
            <h1 className="text-6xl sm:text-7xl font-bold mb-4 text-destructive">403</h1>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ruxsat yo'q</h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8">
              Kechirasiz, bu sahifani ko'rish uchun yetarli ruxsatlaringiz yo'q.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/home" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Bosh sahifa
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/home" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Orqaga
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


