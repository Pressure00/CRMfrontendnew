import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import DeclarantDashboard from '@/components/dashboard/DeclarantDashboard'
import CertifierDashboard from '@/components/dashboard/CertifierDashboard'

export default function DashboardPage() {
  const { user } = useAuthStore()

  if (!user) return null

  if (user.activity_type === 'declarant') {
    return <DeclarantDashboard />
  }

  return <CertifierDashboard />
}