"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export function ServerError() {
  const router = useRouter()

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    router.push("/home")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md">
        <Card className="border-2 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-destructive to-orange-600 bg-clip-text text-transparent">
              Server Xatoligi
            </CardTitle>
            <CardDescription className="text-base">
              Serverga ulanib bo'lmadi yoki server ishlamayapti.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Iltimos, biroz kutib turing va qayta urinib ko'ring.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <Button
                onClick={handleRefresh}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Qayta urinish
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Bosh sahifaga
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

