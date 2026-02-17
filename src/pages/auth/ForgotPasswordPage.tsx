import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'
import { HiOutlineMail } from 'react-icons/hi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Введите электронную почту')
      return
    }

    setLoading(true)
    try {
      await authApi.forgotPassword({ email })
      setSent(true)
      toast.success('Код отправлен в Telegram-бот')
    } catch {}
    finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HiOutlineMail className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-win-text mb-2">Код отправлен</h2>
        <p className="text-sm text-win-text-secondary mb-6">
          Код для сброса пароля отправлен в ваш Telegram-бот.
          Если вы не подключили Telegram-бот, обратитесь к администратору.
        </p>
        <Link to="/login" className="win-btn-primary inline-flex">
          Вернуться к входу
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-win-text mb-1">Забыли пароль?</h2>
      <p className="text-sm text-win-text-secondary mb-6">
        Введите вашу электронную почту, и мы отправим код восстановления в Telegram-бот
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            'Отправить код'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm text-primary hover:underline">
          ← Вернуться к входу
        </Link>
      </div>
    </div>
  )
}