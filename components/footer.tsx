"use client"

import { useTranslation } from "@/hooks/use-translation"
import { interpolate } from "@/hooks/use-translation"

export function Footer() {
  const { t } = useTranslation()
  
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl mt-auto transition-colors duration-300">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          <p>{interpolate(t.footer.copyright, { year: new Date().getFullYear().toString(), brand: "AutOnline" })}</p>
        </div>
      </div>
    </footer>
  )
}

