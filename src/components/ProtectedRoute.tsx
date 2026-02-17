import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'

export default function ProtectedRoute() {
  const { isAuthenticated, isAdmin, setUser, setCompanyStatus, logout } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [companyOk, setCompanyOk] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const checkStatus = async () => {
      try {
        // Refresh user data
        const meRes = await authApi.getMe()
        setUser(meRes.data)

        // Check company status
        const statusRes = await authApi.getCompanyStatus()
        const status = statusRes.data.status
        setCompanyStatus(status)

        if (status === 'active') {
          setCompanyOk(true)
        } else {
          setCompanyOk(false)
        }
      } catch (err) {
        logout()
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [isAuthenticated])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-win-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-win-text-secondary">Загрузка...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (!companyOk) {
    return <Navigate to="/company-setup" replace />
  }

  return <Outlet />
}