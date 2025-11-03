"use client"

import React, { useContext, createContext, useState, useEffect, ReactNode } from 'react'
import { Language, translations, defaultLanguage, Translations } from '@/lib/locales'

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Load language from localStorage after hydration
    const savedLanguage = localStorage.getItem('language') as Language | null
    if (savedLanguage && ['uz', 'cyr', 'ru'].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    }
    setIsHydrated(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }

  const value = {
    language,
    setLanguage,
    t: translations[language],
  }

  return React.createElement(
    TranslationContext.Provider,
    { value },
    children
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}

// Helper function to interpolate strings with variables
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return vars[key]?.toString() || match
  })
}


