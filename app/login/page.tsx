"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login, setCurrentUser } from "@/lib/auth"
import { Loader2, CheckCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
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
      setError(err instanceof Error ? err.message : "Login yoki parol noto'g'ri")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4">
            <Image
              src="/autonline.svg"
              alt="AutOnline Logo"
              fill
              className="object-contain rounded-md"
              priority
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-balance">AutOnline</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Haydovchilik guvohnomasini olish uchun tayyorgarlik platformasi
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Kirish</CardTitle>
            <CardDescription className="text-sm">Hisobingizga kirish uchun ma'lumotlaringizni kiriting</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Foydalanuvchi nomi</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Foydalanuvchi nomingizni kiriting"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading || isSuccess}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Parol</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Parolingizni kiriting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || isSuccess}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-4 rounded-md border border-red-200 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="text-red-500 mt-0.5">⚠️</div>
                    <div>
                      <strong>Xatolik:</strong> {error}
                    </div>
                  </div>
                </div>
              )}
              
              {isSuccess && (
                <div className="text-sm text-green-600 bg-green-50 border border-green-200 p-3 rounded-md flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Bosh sahifaga yo'naltirilmoqda...</span>
                </div>
              )}

              <Button 
                type="submit" 
                className={`w-full transition-all duration-300 ${
                  isSuccess 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : isLoading 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : ''
                }`}
                disabled={isLoading || isSuccess}
              >
                {isSuccess ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 animate-pulse" />
                    Muvaffaqiyatli kirdingiz!
                  </>
                ) : isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Tizimga kirilmoqda...
                  </>
                ) : (
                  "Kirish"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-xs sm:text-sm text-muted-foreground">
              <p>Sizda kirish uchun hisobingiz yo'qmi? <Link href="https://t.me/AsadbekAbdinazarov" className="text-primary underline">Ro'yxatdan o'tish</Link></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
