"use client"

import { UserMenu } from "@/components/user-menu"
import Image from "next/image"
import Link from "next/link"

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-2 sm:py-3 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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

        <UserMenu />
      </div>
    </header>
  )
}
