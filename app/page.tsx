"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { getCurrentUser } from "@/lib/auth"
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Newspaper, 
  Award,
  ArrowRight,
  Users,
  Zap,
  LayoutDashboard,
  Shield,
  TrendingUp,
  Star,
  Target,
  Brain,
  Timer,
  RefreshCw,
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  Play,
  ChevronRight,
  Sparkles,
  GraduationCap,
  FileText,
  History,
  Crown
} from "lucide-react"

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    setIsLoggedIn(!!user)
  }, [])

  const features = [
    {
      icon: BookOpen,
      title: "Keng qamrovli testlar",
      description: "Haydovchilik guvohnomasi uchun barcha mavzularda 100+ dan ortiq professional testlar. Har bir mavzu bo'yicha chuqur bilim olish imkoniyati.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Clock,
      title: "Real vaqtda natijalar",
      description: "Testni yakunlang va darhol batafsil natijalarni ko'ring. To'g'ri va noto'g'ri javoblaringizni darhol tekshiring.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Progress kuzatuv",
      description: "O'z bilimingizni rivojlantirishni kuzating. Qaysi mavzularda yaxshi ekanligingizni va qaysi joylarda mashq qilish kerakligini biling.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Newspaper,
      title: "Yangiliklar bo'limi",
      description: "Haydovchilik sohasidagi so'nggi yangiliklardan, qonunchilik o'zgarishlaridan va muhim yangiliklardan doimo xabardor bo'ling.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Award,
      title: "Professional tayyorgarlik",
      description: "Imtihonga muvaffaqiyatli tayyorlanish uchun professional dastur. Sertifikatli haydovchilar tomonidan tayyorlangan materiallar.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Zap,
      title: "Zamonaviy interfeys",
      description: "Qulay va intuitiv dizayn bilan oson foydalanish. Mobil va desktop versiyalarida mukammal ishlaydi.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Brain,
      title: "Aqlli o'rganish",
      description: "Adaptive o'rganish tizimi. Zaif tomonlaringizni aniqlash va ularni yaxshilash uchun shaxsiylashtirilgan tavsiyalar.",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: RefreshCw,
      title: "Cheksiz mashq qilish",
      description: "Har bir testni necha marta bo'lishdan qat'iy nazar, cheksiz takrorlash imkoniyati. Bilimingizni mustahkamlang.",
      color: "from-amber-500 to-yellow-500"
    },
    {
      icon: History,
      title: "Test tarixi",
      description: "Barcha topshirgan testlaringizning to'liq tarixi va statistika. O'sishingizni kuzatib boring.",
      color: "from-violet-500 to-purple-500"
    }
  ]

  const steps = [
    {
      number: "01",
      title: "Ro'yxatdan o'ting",
      description: "Telegram orqali tezkor ro'yxatdan o'ting va hisobingizni yarating. Bir necha daqiqa ichida boshlang.",
      icon: Users
    },
    {
      number: "02",
      title: "Mavzu tanlang",
      description: "Kerakli mavzuni tanlang yoki tasodifiy testni boshlang. Barcha mavzular mavjud.",
      icon: Target
    },
    {
      number: "03",
      title: "Test topshiring",
      description: "Savollarga javob bering va bilimingizni sinab ko'ring. Vaqt cheklovlari bilan yoki cheklovlarsiz.",
      icon: FileText
    },
    {
      number: "04",
      title: "Natijalarni ko'ring",
      description: "Darhol batafsil natijalarni ko'ring va qaysi mavzularda ko'proq mashq qilishingiz kerakligini biling.",
      icon: TrendingUp
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: "Ishonchli platforma",
      description: "Professional tayyorgarlik materiallari va tekshirilgan kontent"
    },
    {
      icon: Star,
      title: "Yuqori natijalar",
      description: "Bizning foydalanuvchilarimiz imtihonlarda yuqori natijalar ko'rsatmoqda"
    },
    {
      icon: Timer,
      title: "Qulay vaqt",
      description: "Har qanday vaqtda, har qanday joydan o'rganish va mashq qilish imkoniyati"
    },
    {
      icon: GraduationCap,
      title: "Professional yondashuv",
      description: "Sertifikatli mutaxassislar tomonidan tayyorlangan materiallar"
    }
  ]

  const stats = [
    {
      value: "500+",
      label: "Test savollari",
      description: "Barcha mavzular bo'yicha",
      icon: FileText
    },
    {
      value: "1000+",
      label: "Muvaffaqiyatli foydalanuvchilar",
      description: "Imtihonni muvaffaqiyatli topshirganlar",
      icon: Users
    },
    {
      value: "95%",
      label: "Muvaffaqiyat darajasi",
      description: "Bizning foydalanuvchilarimiz",
      icon: TrendingUp
    },
    {
      value: "24/7",
      label: "Qo'llab-quvvatlash",
      description: "Kunduzi va kechasi",
      icon: Clock
    }
  ]

  const faqs = [
    {
      question: "AutOnline nima?",
      answer: "AutOnline - haydovchilik guvohnomasi imtihonlariga tayyorlanish uchun zamonaviy va qulay onlayn platforma. Bizning platformamiz orqali siz turli mavzularda test topshirishingiz, bilimingizni oshirishingiz va imtihonga yaxshi tayyorlashingiz mumkin."
    },
    {
      question: "Qanday ro'yxatdan o'taman?",
      answer: "Ro'yxatdan o'tish uchun Telegram orqali murojaat qiling. Bizning adminstratorlarimiz sizga yordam berishadi va hisobingizni yaratishadi."
    },
    {
      question: "Testlar pullikmi?",
      answer: "Bizning platformamizda bepul va pullik testlar mavjud. Bepul testlar bilan boshlash mumkin, pullik obuna orqali barcha imkoniyatlardan foydalanish mumkin."
    },
    {
      question: "Mobil versiyadan foydalanish mumkinmi?",
      answer: "Ha, bizning platformamiz to'liq responsive dizaynga ega va barcha qurilmalarda (telefon, planshet, kompyuter) mukammal ishlaydi."
    },
    {
      question: "Natijalarni qanday ko'rish mumkin?",
      answer: "Har bir testni yakunlaganingizdan keyin, darhol batafsil natijalarni ko'rishingiz mumkin. To'g'ri va noto'g'ri javoblar, ballar va tavsiyalar ko'rsatiladi."
    },
    {
      question: "Testni qayta topshirish mumkinmi?",
      answer: "Ha, har qanday testni istalgancha takrorlash mumkin. Bu sizga bilimingizni mustahkamlash va yaxshiroq tayyorlanish imkoniyatini beradi."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-card">
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
            {isLoggedIn ? (
              <Button asChild className="gap-2">
                <Link href="/home" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild size="sm">
                  <Link href="/login">Kirish</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                  <Link href="/register">Boshlash</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 sm:pt-16 md:pt-24 pb-12 sm:pb-16 md:pb-24">
          {/* Background gradient blob */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto px-4 text-center">
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
                <Sparkles className="h-4 w-4" />
                <span>#1 Haydovchilik imtihoni tayyorgarlik platformasi</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-balance leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Haydovchilik Guvohnomasi
                </span>
                <br />
                <span className="text-foreground">Imtihoniga Tayyorlaning</span>
              </h1>

              <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                Professional tayyorgarlik platformasi orqali haydovchilik imtihoniga muvaffaqiyatli tayyorlaning. 
                <span className="text-primary font-semibold"> 500+ test savollari</span> va professional materiallar.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                {isLoggedIn ? (
                  <Button size="lg" asChild className="text-lg px-10 py-7 h-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
                    <Link href="/home" className="flex items-center gap-2">
                      Dashboardga o'tish
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild className="text-lg px-10 py-7 h-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
                      <Link href="/register" className="flex items-center gap-2">
                        Bepul boshlash
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div key={index} className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                      <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-24 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 sm:mb-20">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nima uchun AutOnline?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Bizning platformamiz haydovchilik guvohnomasi imtihoniga tayyorlanish uchun barcha kerakli vositalarni taqdim etadi
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card 
                    key={index}
                    className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 hover:border-primary/50 bg-card/50 backdrop-blur-sm"
                  >
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 sm:py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5"></div>
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16 sm:mb-20">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                Qanday Ishlaydi?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Bir necha oddiy qadam bilan imtihonga tayyorlanishni boshlang
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div 
                    key={index}
                    className="relative group"
                  >
                    <Card className="h-full text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50 bg-card/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="relative w-20 h-20 mx-auto mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
                          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{step.number}</span>
                          </div>
                        </div>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl mb-3">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base leading-relaxed">
                          {step.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ChevronRight className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 sm:py-24 md:py-32 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 sm:mb-20">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                Sizning Afzalliklaringiz
              </h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                AutOnline platformasi bilan imtihonga tayyorlanishning barcha afzalliklari
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <CardHeader>
                      <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                        <Icon className="h-7 w-7" />
                      </div>
                      <CardTitle className="text-xl mb-2">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-white/80 text-base">
                        {benefit.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 sm:py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 sm:mb-20">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                Platforma Statistikasi
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Bizning natijalarimiz va muvaffaqiyatlarimiz
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50">
                    <CardHeader>
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                      <CardTitle className="text-xl mb-2">{stat.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {stat.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 sm:py-24 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                Tez-tez So'raladigan Savollar
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Sizning savollaringizga javoblar
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {faqs.map((faq, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <HelpCircle className="h-4 w-4 text-primary" />
                      </div>
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {faq.answer}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 sm:py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md mb-6">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                Imtihonga Tayyorlanishni Boshlaymizmi?
              </h2>
              <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto">
                AutOnline platformasiga qo'shiling va haydovchilik guvohnomasi imtihoniga muvaffaqiyatli tayyorlaning. 
                <span className="font-semibold"> 500+ test savollari</span> va professional materiallar sizni kutmoqda.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                {isLoggedIn ? (
                  <Button 
                    size="lg" 
                    variant="secondary"
                    asChild
                    className="text-lg px-10 py-7 h-auto shadow-2xl hover:shadow-3xl transition-all"
                  >
                    <Link href="/home" className="flex items-center gap-2">
                      Dashboardga o'tish
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      variant="secondary"
                      asChild
                      className="text-lg px-10 py-7 h-auto shadow-2xl hover:shadow-3xl transition-all"
                    >
                      <Link href="/register" className="flex items-center gap-2">
                        Bepul boshlash
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>
              
              {/* Contact Info */}
              <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80">
                <a href="tel:+998901234567" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-5 w-5" />
                  <span>+998 90 123 45 67</span>
                </a>
                <a href="mailto:info@autonline.uz" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="h-5 w-5" />
                  <span>info@autonline.uz</span>
                </a>
                <a href="https://t.me/AsadbekAbdinazarov" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
