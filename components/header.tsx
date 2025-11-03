"use client"

"use client"

import { UserMenu } from "@/components/user-menu"
import { LanguageSwitcher } from "@/components/language-switcher"
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
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-2 sm:py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16">
            <Image
              src="/autonline.svg"
              alt="AutOnline Logo"
              fill
              className="object-contain rounded-md"
              priority
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">AutOnline</h1>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoggedIn && pathname === "/" && (
            <nav className="hidden md:flex items-center gap-4 mr-2 text-sm">
              <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
              <Link href="/#how-it-works" className="hover:text-primary transition-colors">Qanday ishlaydi</Link>
              <Link href="/#benefits" className="hover:text-primary transition-colors">Afzalliklar</Link>
              <Link href="/#faq" className="hover:text-primary transition-colors">FAQ</Link>
              <Link href="/help-center" className="hover:text-primary transition-colors">Yordam</Link>
            </nav>
          )}
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
