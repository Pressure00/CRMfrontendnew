import { create } from 'zustand'
import type { UserResponse } from '@/types'

interface AuthState {
  token: string | null
  user: UserResponse | null
  isAdmin: boolean
  isAuthenticated: boolean
  companyStatus: string | null

  setAuth: (token: string, user: UserResponse, isAdmin?: boolean) => void
  setUser: (user: UserResponse) => void
  setCompanyStatus: (status: string) => void
  logout: () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAdmin: false,
  isAuthenticated: false,
  companyStatus: null,

  setAuth: (token, user, isAdmin = false) => {
    localStorage.setItem('access_token', token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('is_admin', JSON.stringify(isAdmin))
    set({
      token,
      user,
      isAdmin,
      isAuthenticated: true,
    })
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },

  setCompanyStatus: (status) => {
    set({ companyStatus: status })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    localStorage.removeItem('is_admin')
    set({
      token: null,
      user: null,
      isAdmin: false,
      isAuthenticated: false,
      companyStatus: null,
    })
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('access_token')
    const userStr = localStorage.getItem('user')
    const isAdminStr = localStorage.getItem('is_admin')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as UserResponse
        const isAdmin = isAdminStr ? JSON.parse(isAdminStr) : false
        set({
          token,
          user,
          isAdmin,
          isAuthenticated: true,
        })
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        localStorage.removeItem('is_admin')
      }
    }
  },
}))