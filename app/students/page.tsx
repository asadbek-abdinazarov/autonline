"use client"

import dynamic from "next/dynamic"

const StudentsClient = dynamic(() => import("./students-client").then(mod => ({ default: mod.StudentsClient })), {
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      </div>
    </div>
  ),
  ssr: false,
})

export default function StudentsPage() {
  return <StudentsClient />
}

