"use client"

import { AuthGuard } from "@/components/auth-guard"
import { TrafficSignsClient } from "./traffic-signs-client"

export default function TrafficSignsPage() {
  return (
    <AuthGuard requiredPermission="VIEW_TRAFFIC_SIGNS">
      <TrafficSignsClient />
    </AuthGuard>
  )
}









