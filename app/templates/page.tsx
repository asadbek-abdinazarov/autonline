"use client"

import { AuthGuard } from "@/components/auth-guard"
import TemplatesClient from "./templates-client"

export default function TemplatesPage() {
  return (
    <AuthGuard>
      <TemplatesClient />
    </AuthGuard>
  )
}

