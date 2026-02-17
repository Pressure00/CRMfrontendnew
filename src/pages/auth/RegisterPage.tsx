import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from 'react-icons/hi'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [activityType, setActivityType] = useState<'declarant' | 'certification'>('declarant')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !email || !phone || !password) {
      toast.error('Заполните все обязательные поля')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают')
      return
    }

    if (password.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов')
      return
    }

    setLoading(true)
    try {
      const res = await authApi.register({
        full_name: fullName,
        email,
        phone,
        activity_type: activityType,
        password,
      })

      toast.success(res.data.message || 'Регистрация успешна!')

      // Auto-login after registration
      const loginRes = await authApi.login({ email, password })
      const meRes = await authApi.getMe()
      const { setAuth } = useAuthStore.getState()
      setAuth(loginRes.data.access_token, meRes.data, loginRes.data.is_admin)

      navigate('/company-setup')
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-win-text mb-1">Регистрация</h2>
      <p className="text-sm text-win-text-secondary mb-6">
        Создайте аккаунт для работы в CRM
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="win-label">Полное имя и фамилия *</label>
          <div className="relative">
            <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="win-input pl-10"
              placeholder="Иванов Иван"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="win-label">Электронная почта *</label>
          <div className="relative">
            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="win-input pl-10"
              placeholder="example@mail.com"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="win-label">Номер телефона *</label>
          <div className="relative">
            <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="win-input pl-10"
              placeholder="+7 (999) 123-45-67"
            />
          </div>
        </div>

        {/* Activity Type */}
        <div>
          <label className="win-label">Деятельность *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActivityType('declarant')}
              className={`py-3 px-4 rounded-win border text-sm font-medium transition-all duration-150 ${
                activityType === 'declarant'
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-win-border bg-white text-win-text hover:border-gray-300'
              }`}
            >
              Декларант
            </button>
            <button
              type="button"
              onClick={() => setActivityType('certification')}
              className={`py-3 px-4 rounded-win border text-sm font-medium transition-all duration-150 ${
                activityType === 'certification'
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-win-border bg-white text-win-text hover:border-gray-300'
              }`}
            >
              Сертификация
            </button>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="win-label">Пароль *</label>
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="win-input pl-10 pr-10"
              placeholder="Минимум 6 символов"
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

        {/* Confirm Password */}
        <div>
          <label className="win-label">Подтвердите пароль *</label>
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="win-input pl-10"
              placeholder="Повторите пароль"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="win-btn-primary w-full py-2.5 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Зарегистрироваться'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-win-text-secondary">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Войти
        </Link>
      </div>
    </div>
  )
}