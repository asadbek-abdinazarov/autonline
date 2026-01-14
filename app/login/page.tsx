"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login, setCurrentUser } from "@/lib/auth"
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "@/hooks/use-translation"

export default function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const user = await login(username, password)
      setCurrentUser(user)
      
      // Show success state
      setIsSuccess(true)
      setIsLoading(false)
      
      // Wait a moment to show success animation, then redirect
      setTimeout(() => {
        router.push("/home")
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : t.login.defaultError
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6">
            <Image
              src="/autonline.svg"
              alt="AutOnline Logo"
              fill
              className="object-contain rounded-md"
              priority
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-balance bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {t.common.appName}
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400">
            {t.login.subtitle}
          </p>
        </div>

        <Card className="border-2 border-slate-300/50 dark:border-slate-700/50 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 bg-white/80 dark:bg-slate-800/40 backdrop-blur-xl transition-colors duration-300">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t.login.title}</CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-slate-400">{t.login.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
          {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800/50 mb-4 transition-colors duration-300">
                  <div className="flex items-start gap-2">
                    <div className="text-red-500 dark:text-red-400 mt-0.5">⚠️</div>
                    <div>
                      {error}
                    </div>
                  </div>
                </div>
              )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t.login.username}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t.login.usernamePlaceholder}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading || isSuccess}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.login.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t.login.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading || isSuccess}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading || isSuccess}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {isSuccess && (
                <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 p-3 rounded-md flex items-center gap-2 transition-colors duration-300">
                  <CheckCircle className="h-4 w-4" />
                  <span>{t.login.redirecting}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button asChild variant="outline" size="lg" className="w-full border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300">
                  <Link href="/">{t.common.home}</Link>
                </Button>

                <Button 
                type="submit" 
                size="lg"
                className={`w-full transition-all duration-300 shadow-lg hover:shadow-xl ${
                  isSuccess 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white' 
                    : isLoading 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                }`}
                disabled={isLoading || isSuccess}
              >
                {isSuccess ? (
                  <span className="flex items-center justify-center gap-1.5 text-xs sm:text-sm">
                    <CheckCircle className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{t.login.success}</span>
                  </span>
                ) : isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.login.logging}
                  </>
                ) : (
                  t.login.submit
                )}
              </Button>
              </div>
            </form>

            <div className="mt-4 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <p>{t.login.noAccount} <Link href="/register" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 underline transition-colors duration-300">{t.login.register}</Link></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
