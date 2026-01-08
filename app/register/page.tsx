"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react"
import { register as registerApi, setCurrentUser } from "@/lib/auth"
import { useTranslation } from "@/hooks/use-translation"
import { formatPhoneNumber, getPhoneCursorPosition } from "@/lib/utils"

export default function RegisterPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [phone, setPhone] = useState("+998 ")
  const [phoneError, setPhoneError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  // Validate and normalize phone number
  const validateAndNormalizePhone = (phoneNumber: string): { isValid: boolean; normalized: string; error: string } => {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '')
    
    // Remove leading + if present
    let digits = cleaned.replace(/^\+/, '')
    
    // Check if it starts with 998
    if (digits.startsWith('998')) {
      digits = digits.substring(3) // Remove 998 prefix
    }
    
    // Check if it's a valid 9-digit number (Uzbek mobile numbers)
    if (digits.length !== 9) {
      return {
        isValid: false,
        normalized: '',
        error: t.register.phoneError
      }
    }
    
    // Check if it starts with valid Uzbek mobile operator codes
    const validPrefixes = ['90', '91', '93', '94', '95', '97', '98', '99', '88', '33', '50', '55', '77']
    const prefix = digits.substring(0, 2)
    
    if (!validPrefixes.includes(prefix)) {
      return {
        isValid: false,
        normalized: '',
        error: t.register.phoneErrorOperator
      }
    }
    
    // Normalize to +998XXXXXXXXX format
    const normalized = `+998${digits}`
    
    return {
      isValid: true,
      normalized,
      error: ''
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const inputValue = input.value
    const cursorPos = input.selectionStart || 0
    const newValue = formatPhoneNumber(inputValue)
    
    // Calculate new cursor position before updating state
    const newCursorPos = getPhoneCursorPosition(inputValue, newValue, cursorPos)
    
    // Update state with formatted value
    setPhone(newValue)
    
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError("")
    }
    
    // Preserve cursor position using requestAnimationFrame for better reliability
    requestAnimationFrame(() => {
      const inputElement = document.getElementById('phone') as HTMLInputElement
      if (inputElement) {
        inputElement.setSelectionRange(newCursorPos, newCursorPos)
      }
    })
    
    // Real-time validation
    if (newValue.trim().length > 5) { // More than just "+998 "
      const validation = validateAndNormalizePhone(newValue)
      if (!validation.isValid) {
        setPhoneError(validation.error)
      } else {
        setPhoneError("")
      }
    }
  }

  const handlePhoneFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // If input is empty, set to +998
    if (!phone || phone.trim() === '') {
      setPhone('+998 ')
    }
  }

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const cursorPos = input.selectionStart || 0
    
    // Prevent deleting +998 prefix
    if (e.key === 'Backspace' && cursorPos <= 5) {
      e.preventDefault()
      return
    }
    
    // Prevent cursor from being placed before +998
    if (cursorPos < 5 && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
      e.preventDefault()
      input.setSelectionRange(5, 5)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    
    // Clear password error when user starts typing
    if (passwordError) {
      setPasswordError("")
    }
    
    // Check if passwords match when confirm password is filled
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError(t.register.passwordMismatch)
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    
    // Clear password error when user starts typing
    if (passwordError) {
      setPasswordError("")
    }
    
    // Check if passwords match
    if (password && value !== password) {
      setPasswordError(t.register.passwordMismatch)
    } else if (password && value === password) {
      setPasswordError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setPhoneError("")
    setPasswordError("")
    
    // Validate phone number
    const phoneValidation = validateAndNormalizePhone(phone)
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error)
      return
    }
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError(t.register.passwordMismatch)
      return
    }
    
    setIsLoading(true)
    try {
      const user = await registerApi(fullName, username, password, phoneValidation.normalized, confirmPassword)
      setCurrentUser(user)
      setIsSuccess(true)
      setIsLoading(false)
      setTimeout(() => router.push("/home"), 1200)
    } catch (err: any) {
      setError(err instanceof Error ? err.message : t.register.error)
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
            AutOnline
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400">
            {t.register.subtitle}
          </p>
        </div>

        <Card className="border-2 border-slate-300/50 dark:border-slate-700/50 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl transition-colors duration-300">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t.register.title}</CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-slate-400">{t.register.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800/50 mb-4 transition-colors duration-300">
                <div className="flex items-start gap-2">
                  <div className="text-red-500 dark:text-red-400 mt-0.5">⚠️</div>
                  <div>{error}</div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t.register.fullName}</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t.register.fullNamePlaceholder}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading || isSuccess}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">{t.register.username}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t.register.usernamePlaceholder}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading || isSuccess}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t.register.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={handlePhoneChange}
                  onFocus={handlePhoneFocus}
                  onKeyDown={handlePhoneKeyDown}
                  required
                  disabled={isLoading || isSuccess}
                  className={phoneError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {phoneError ? (
                  <p className="text-xs text-red-600 mt-1">{phoneError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.register.phoneExample}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.register.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t.register.passwordPlaceholder}
                    value={password}
                    onChange={handlePasswordChange}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.register.confirmPassword}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t.register.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    disabled={isLoading || isSuccess}
                    className={`pr-10 ${passwordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading || isSuccess}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-red-600 mt-1">{passwordError}</p>
                )}
              </div>
              
              {isSuccess && (
                <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 p-3 rounded-md flex items-center gap-2 transition-colors duration-300">
                  <CheckCircle className="h-4 w-4" />
                  <span>{t.register.success}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button asChild variant="outline" size="lg" className="w-full border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400/50 dark:hover:border-slate-600/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300">
                  <Link href="/">{t.register.homePage}</Link>
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
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 animate-pulse" />
                      {t.register.submitted}
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.register.submitting}
                    </>
                  ) : (
                    t.register.submit
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <p>
                {t.register.hasAccount}{" "}
                <Link href="/login" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 underline transition-colors duration-300">
                  {t.register.login}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
