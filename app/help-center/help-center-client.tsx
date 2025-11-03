"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, HelpCircle, Mail, Phone, MessageCircle, BookOpen, Info, ExternalLink, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { useTranslation } from "@/hooks/use-translation"

export function HelpCenterClient() {
  const { t } = useTranslation()
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
        <Header />

        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="max-w-5xl mx-auto">
              {/* Hero Section */}
              <section className="relative overflow-hidden mb-12 sm:mb-16">
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

            {/* Back Button */}
                <div className="mb-8">
                  <Button variant="ghost" size="lg" asChild className="hover:scale-105 transition-transform">
                    <Link href="/home" className="flex items-center gap-2">
                      <ArrowLeft className="h-5 w-5" />
                      {t.common.back}
                </Link>
              </Button>
            </div>

            {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <HelpCircle className="h-8 w-8 text-white" />
                </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {t.helpCenter.title}
                    </h1>
              </div>
                  <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
                    {t.helpCenter.description}
              </p>
            </div>
              </section>

            {/* About the Application */}
              <Card className="mb-8 border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Info className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t.helpCenter.about.title}</CardTitle>
                </div>
                  <CardDescription className="text-base">
                    {t.helpCenter.about.description}
                </CardDescription>
              </CardHeader>
                <CardContent className="space-y-6">
                <div>
                    <h3 className="font-bold text-lg mb-3">{t.helpCenter.about.whatIs}</h3>
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {t.helpCenter.about.whatIsAnswer}
                  </p>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-3">{t.helpCenter.about.features}</h3>
                    <ul className="list-none space-y-3">
                      {t.helpCenter.about.featuresList.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
              <Card className="mb-8 border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t.helpCenter.contact.title}</CardTitle>
                </div>
                  <CardDescription className="text-base">
                    {t.helpCenter.contact.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Email */}
                  <a 
                    href="mailto:support@autonline.uz" 
                      className="flex items-center gap-4 p-5 rounded-xl border-2 hover:border-primary/50 hover:scale-105 transition-all duration-300 bg-card hover:shadow-lg"
                  >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-base mb-1">{t.helpCenter.contact.email}</p>
                      <p className="text-sm text-muted-foreground">support@autonline.uz</p>
                    </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                  </a>

                  {/* Phone */}
                  <a 
                    href="tel:+998901234567" 
                      className="flex items-center gap-4 p-5 rounded-xl border-2 hover:border-primary/50 hover:scale-105 transition-all duration-300 bg-card hover:shadow-lg"
                  >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-base mb-1">{t.helpCenter.contact.phone}</p>
                      <p className="text-sm text-muted-foreground">+998 90 123 45 67</p>
                    </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                  </a>

                  {/* Telegram */}
                  <a 
                      href="https://t.me/AsadbekAbdinazarov" 
                    target="_blank"
                    rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5 rounded-xl border-2 hover:border-primary/50 hover:scale-105 transition-all duration-300 bg-card hover:shadow-lg"
                  >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-base mb-1">{t.helpCenter.contact.telegram}</p>
                        <p className="text-sm text-muted-foreground">@AsadbekAbdinazarov</p>
                    </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                  </a>

                  {/* Website */}
                  <a 
                    href="https://autonline.uz" 
                    target="_blank"
                    rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5 rounded-xl border-2 hover:border-primary/50 hover:scale-105 transition-all duration-300 bg-card hover:shadow-lg"
                  >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-base mb-1">{t.helpCenter.contact.website}</p>
                      <p className="text-sm text-muted-foreground">autonline.uz</p>
                    </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
              <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t.helpCenter.faq.title}</CardTitle>
                </div>
                  <CardDescription className="text-base">
                    {t.helpCenter.faq.description}
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {t.helpCenter.faq.items.map((faq, index) => (
                    <div key={index} className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">{index + 1}</span>
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground text-base leading-relaxed ml-8">
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
    </AuthGuard>
  )
}

