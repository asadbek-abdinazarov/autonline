"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, HelpCircle, Mail, Phone, MessageCircle, BookOpen, Info, ExternalLink, CheckCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { useTranslation } from "@/hooks/use-translation"
import { getCurrentUser } from "@/lib/auth"

export function HelpCenterClient() {
  const { t } = useTranslation()
  const [backLink, setBackLink] = useState("/")
  
  useEffect(() => {
    const user = getCurrentUser()
    setBackLink(user ? "/home" : "/")
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300 flex flex-col">
      <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-12 mb-8 sm:mb-12">
            {/* Background gradient blobs */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <Button variant="ghost" size="lg" asChild className="hover:scale-105 transition-transform text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <Link href={backLink} className="flex items-center gap-2">
                    <ArrowLeft className="h-5 w-5" />
                    {t.common.back}
                  </Link>
                </Button>
              </div>

              <div className="text-center">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 text-slate-900 dark:text-white text-sm font-medium shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span>{t.helpCenter.title}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 px-2">
                    <span className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {t.helpCenter.title}
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 px-4">
                    {t.helpCenter.description}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Content Section */}
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="max-w-5xl mx-auto">

            {/* About the Application */}
              <Card className="mb-6 sm:mb-8 border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Info className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">{t.helpCenter.about.title}</CardTitle>
                </div>
                  <CardDescription className="text-sm sm:text-base">
                    {t.helpCenter.about.description}
                </CardDescription>
              </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div>
                    <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">{t.helpCenter.about.whatIs}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                      {t.helpCenter.about.whatIsAnswer}
                  </p>
                </div>
                <div>
                    <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">{t.helpCenter.about.features}</h3>
                    <ul className="list-none space-y-2 sm:space-y-3">
                      {t.helpCenter.about.featuresList.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm sm:text-base text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
              <Card className="mb-6 sm:mb-8 border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">{t.helpCenter.contact.title}</CardTitle>
                </div>
                  <CardDescription className="text-sm sm:text-base">
                    {t.helpCenter.contact.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  {/* Email */}
                  <a 
                    href="mailto:a.abdinazarov@student.pdp.university" 
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-xl border-2 hover:border-primary/50 hover:scale-105 transition-all duration-300 bg-card hover:shadow-lg"
                  >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm sm:text-base mb-1">{t.helpCenter.contact.email}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">a.abdinazarov@student.pdp.university</p>
                    </div>
                      <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  </a>

                  {/* Phone */}
                  <a 
                    href="tel:+998770108060" 
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-xl border-2 hover:border-primary/50 hover:scale-105 transition-all duration-300 bg-card hover:shadow-lg"
                  >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm sm:text-base mb-1">{t.helpCenter.contact.phone}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">+998 77 010 80 60</p>
                    </div>
                      <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  </a>

                  {/* Telegram */}
                  <a 
                      href="https://t.me/AsadbekAbdinazarov" 
                    target="_blank"
                    rel="noopener noreferrer"
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-xl border-2 hover:border-primary/50 hover:scale-105 transition-all duration-300 bg-card hover:shadow-lg"
                  >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm sm:text-base mb-1">{t.helpCenter.contact.telegram}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">@AsadbekAbdinazarov</p>
                    </div>
                      <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  </a>

                  {/* Website */}
                  <a 
                    href="https://autonline.uz" 
                    target="_blank"
                    rel="noopener noreferrer"
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-xl border-2 hover:border-primary/50 hover:scale-105 transition-all duration-300 bg-card hover:shadow-lg"
                  >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm sm:text-base mb-1">{t.helpCenter.contact.website}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">autonline.uz</p>
                    </div>
                      <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
              <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">{t.helpCenter.faq.title}</CardTitle>
                </div>
                  <CardDescription className="text-sm sm:text-base">
                    {t.helpCenter.faq.description}
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                  {t.helpCenter.faq.items.map((faq, index) => (
                    <div key={index} className="p-3 sm:p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <h3 className="font-bold text-base sm:text-lg mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs sm:text-sm font-bold flex-shrink-0">{index + 1}</span>
                        <span className="flex-1">{faq.question}</span>
                      </h3>
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed ml-6 sm:ml-8">
                        {faq.answer}
                  </p>
                </div>
                  ))}
              </CardContent>
            </Card>
            </div>
          </div>
        </main>

      <Footer />
    </div>
  )
}

