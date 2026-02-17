import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Заполните все поля')
      return
    }

    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      const { access_token, user_id, is_admin } = res.data

      // Get user data
      const meRes = await authApi.getMe()
      setAuth(access_token, meRes.data, is_admin)

      if (is_admin) {
        navigate('/admin/dashboard')
      } else {
        // Check company status
        const statusRes = await authApi.getCompanyStatus()
        const status = statusRes.data.status

        if (status === 'active') {
          navigate('/dashboard')
        } else {
          navigate('/company-setup')
        }
      }

      toast.success('Добро пожаловать!')
    } catch (err: any) {
      const msg = err?.response?.data?.detail
      if (typeof msg === 'string') {
        if (msg.includes('заблокирован')) {
          toast.error(msg)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-win-text mb-1">Вход в аккаунт</h2>
      <p className="text-sm text-win-text-secondary mb-6">
        Введите данные для входа в систему
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="win-label">Электронная почта</label>
          <div className="relative">
            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="win-input pl-10"
              placeholder="example@mail.com"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="win-label">Пароль</label>
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="win-input pl-10 pr-10"
              placeholder="Введите пароль"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="win-btn-primary w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Войти'
          )}
        </button>
      </form>

      {/* Links */}
      <div className="mt-6 space-y-3 text-center">
        <Link to="/forgot-password" className="text-sm text-primary hover:underline block">
          Забыли пароль?
        </Link>
        <div className="text-sm text-win-text-secondary">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Зарегистрироваться
          </Link>
        </div>
        <Link to="/admin/login" className="text-xs text-gray-400 hover:text-gray-600 block">
          Вход для администратора
        </Link>
      </div>
    </div>
  )
}