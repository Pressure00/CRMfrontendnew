import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineKey } from 'react-icons/hi'

export default function AdminLoginPage() {
  const [step, setStep] = useState<'credentials' | 'code'>('credentials')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault()
    if (!login || !password) {
      toast.error('Заполните логин и пароль')
      return
    }
    setStep('code')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) {
      toast.error('Введите код из Telegram')
      return
    }

    setLoading(true)
    try {
      const res = await authApi.adminLogin({ login, password, code })
      const meRes = await authApi.getMe()
      setAuth(res.data.access_token, meRes.data, true)
      toast.success('Добро пожаловать, администратор!')
      navigate('/admin/dashboard')
    } catch {
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'code') {
    return (
      <div>
        <h2 className="text-xl font-semibold text-win-text mb-1">Код подтверждения</h2>
        <p className="text-sm text-win-text-secondary mb-6">
          Введите одноразовый код из Telegram-бота
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="win-label">Код из Telegram</label>
            <div className="relative">
              <HiOutlineKey className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="win-input pl-10 text-center text-lg tracking-widest"
                placeholder="000000"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="win-btn-primary w-full py-2.5 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Войти'
            )}
          </button>

          <button
            type="button"
            onClick={() => { setStep('credentials'); setCode('') }}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            ← Назад
          </button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-win-text mb-1">Вход для администратора</h2>
      <p className="text-sm text-win-text-secondary mb-6">
        Введите логин и пароль администратора
      </p>

      <form onSubmit={handleCredentials} className="space-y-4">
        <div>
          <label className="win-label">Логин</label>
          <div className="relative">
            <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="win-input pl-10"
              placeholder="admin"
            />
          </div>
        </div>

        <div>
          <label className="win-label">Пароль</label>
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="win-input pl-10"
              placeholder="Пароль"
            />
          </div>
        </div>

        <button type="submit" className="win-btn-primary w-full py-2.5">
          Далее
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">
          ← Обычный вход
        </Link>
      </div>
    </div>
  )
}