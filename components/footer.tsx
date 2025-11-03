"use client"

import { useTranslation } from "@/hooks/use-translation"
import { interpolate } from "@/hooks/use-translation"

export function Footer() {
  const { t } = useTranslation()
  
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground">
          <p>{interpolate(t.footer.copyright, { year: new Date().getFullYear().toString(), brand: "AutOnline" })}</p>
        </div>
      </div>
    </footer>
  )
}

