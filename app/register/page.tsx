"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, CheckCircle } from "lucide-react"
import { register as registerApi, setCurrentUser } from "@/lib/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const user = await registerApi(username, password, phone)
      setCurrentUser(user)
      setIsSuccess(true)
      setIsLoading(false)
      setTimeout(() => router.push("/home"), 1200)
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Ro'yxatdan o'tishda xatolik")
      setIsLoading(false)
    }
  }

  return React.createElement(
    'div',
    { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 relative overflow-hidden" },
    React.createElement(
      'div',
      { className: "absolute inset-0 -z-10" },
      React.createElement('div', { className: "absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" }),
      React.createElement('div', { className: "absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" }),
    ),
    React.createElement(
      'div',
      { className: "w-full max-w-md" },
      React.createElement(
        'div',
        { className: "text-center mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700" },
        React.createElement(
          'div',
          { className: "relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6" },
          React.createElement(Image as any, { src: "/autonline.svg", alt: "AutOnline Logo", fill: true, className: "object-contain rounded-md", priority: true }),
        ),
        React.createElement(
          'h1',
          { className: "text-4xl sm:text-5xl font-bold mb-3 text-balance bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" },
          'AutOnline'
        ),
        React.createElement('p', { className: "text-lg sm:text-xl text-muted-foreground" }, "Haydovchilik guvohnomasini olish uchun tayyorgarlik platformasi"),
      ),
      React.createElement(
        Card as any,
        { className: "border-2 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 bg-card/80 backdrop-blur-sm" },
        React.createElement(
          CardHeader as any,
          { className: "text-center" },
          React.createElement(CardTitle as any, { className: "text-2xl sm:text-3xl font-bold" }, 'Hisob yaratish'),
          React.createElement(CardDescription as any, { className: "text-base" }, "To'liq ism va telefon raqamingizni kiriting"),
        ),
        React.createElement(
          CardContent as any,
          null,
          error
            ? React.createElement(
                'div',
                { className: 'text-sm text-red-600 bg-red-50 p-4 rounded-md border border-red-200 mb-2' },
                React.createElement(
                  'div',
                  { className: 'flex items-start gap-2' },
                  React.createElement('div', { className: 'text-red-500 mt-0.5' }, '⚠️'),
                  React.createElement('div', null, error)
                )
              )
            : null,
          React.createElement(
            'form',
            { onSubmit: handleSubmit, className: "space-y-4" },
            React.createElement(
                'div',
                { className: 'space-y-2' },
                React.createElement(Label as any, { htmlFor: 'username' }, 'Foydalanuvchi nomi'),
                React.createElement(Input as any, { id: 'username', type: 'text', placeholder: 'Foydalanuvchi nomingizni yarating', value: username, onChange: (e: any) => setUsername(e.target.value), required: true, disabled: isLoading || isSuccess }),
              ),
            React.createElement(
                'div',
                { className: 'space-y-2' },
                React.createElement(Label as any, { htmlFor: 'password' }, 'Foydalanuvchi paroli'),
                React.createElement(Input as any, { id: 'password', type: 'password', placeholder: 'Yangi parol yarating', value: password, onChange: (e: any) => setPassword(e.target.value), required: true, disabled: isLoading || isSuccess }),
              ),
            React.createElement(
              'div',
              { className: "space-y-2" },
              React.createElement(Label as any, { htmlFor: 'phone' }, 'Telefon raqam'),
              React.createElement(Input as any, { id: 'phone', type: 'tel', placeholder: '(+998) 90 123 45 67', value: phone, onChange: (e: any) => setPhone(e.target.value), required: true, disabled: isLoading || isSuccess }),
            ),
            React.createElement(
              'div',
              { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
              React.createElement(
                Button as any,
                { asChild: true, variant: 'outline', size: 'lg', className: 'w-full' },
                React.createElement(Link as any, { href: '/' }, 'Bosh sahifa')
              ),
              React.createElement(
                Button as any,
                { type: 'submit', size: 'lg', className: `w-full transition-all duration-300 shadow-lg hover:shadow-xl ${isSuccess ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white' : isLoading ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'}`, disabled: isLoading || isSuccess },
                isSuccess
                  ? React.createElement(React.Fragment, null,
                      React.createElement(CheckCircle as any, { className: 'mr-2 h-4 w-4 animate-pulse' }),
                      'Yuborildi'
                    )
                  : isLoading
                  ? React.createElement(React.Fragment, null,
                      React.createElement(Loader2 as any, { className: 'mr-2 h-4 w-4 animate-spin' }),
                      "Jo'natilmoqda"
                    )
                  : "Ro'yxatdan o'tish"
              ),
            ),
          ),
          React.createElement(
            'div',
            { className: 'mt-4 text-center text-xs sm:text-sm text-muted-foreground' },
            React.createElement(
              'p',
              null,
              'Allaqachon hisob bormi? ',
              React.createElement(Link as any, { href: '/login', className: 'text-primary underline' }, 'Kirish')
            )
          ),
        ),
      ),
    )
  )
}

