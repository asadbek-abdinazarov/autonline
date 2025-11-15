"use client"

"use client"

import { UserMenu } from "@/components/user-menu"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export function Header() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    setIsLoggedIn(!!user)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl transition-colors duration-300">
      <div className="container mx-auto px-4 py-2 sm:py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16">
            <Image
              src="/autonline.svg"
              alt="AutOnline Logo"
              fill
              className="object-contain rounded-md"
              priority
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">AutOnline</h1>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoggedIn && pathname === "/" && (
            <nav className="hidden md:flex items-center gap-4 mr-2 text-sm">
              <Link href="/#features" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300">Features</Link>
              <Link href="/#how-it-works" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300">Qanday ishlaydi</Link>
              <Link href="/#benefits" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300">Afzalliklar</Link>
              <Link href="/#faq" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300">FAQ</Link>
              <Link href="/help-center" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300">Yordam</Link>
            </nav>
          )}
          <ThemeSwitcher />
          <LanguageSwitcher />
          {/*
          <Button
            asChild
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Link href="/subscription" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">{t.header.subscription}</span>
            </Link>
          </Button>
          */}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
