import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { NotificationProvider } from '@/components/notification-provider'
import { TranslationProvider } from '@/hooks/use-translation'
import './globals.css'

export const metadata: Metadata = {
  title: 'AutOnline - Haydovchilik Guvohnomasi',
  description: 'Professional tayyorgarlik platformasi orqali haydovchilik imtihoniga tayyorlaning',
  generator: 'AutOnline Platform',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <TranslationProvider>
        <NotificationProvider>
          {children}
          <Toaster position="top-right" richColors />
        </NotificationProvider>
        </TranslationProvider>
        <Analytics />
      </body>
    </html>
  )
}
