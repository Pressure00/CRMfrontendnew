import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { HiOutlineOfficeBuilding, HiOutlineIdentification, HiOutlineSearch } from 'react-icons/hi'

export default function CompanySetupPage() {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [companyName, setCompanyName] = useState('')
  const [inn, setInn] = useState('')
  const [foundCompanyName, setFoundCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const { companyStatus, logout } = useAuthStore()
  const navigate = useNavigate()

  const isPending = companyStatus === 'pending'

  const handleLookup = async () => {
    if (inn.length !== 9) {
      toast.error('ИНН должен состоять из 9 цифр')
      return
    }

    setLookingUp(true)
    try {
      const res = await authApi.lookupCompany({ inn })
      if (res.data.found) {
        setFoundCompanyName(res.data.company_name || '')
        toast.success(`Фирма найдена: ${res.data.company_name}`)
      } else {
        setFoundCompanyName('')
        toast.error('Фирма не найдена. Проверьте правильность ИНН.')
      }
    } catch {}
    finally {
      setLookingUp(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim()) {
      toast.error('Введите имя фирмы')
      return
    }
    if (inn.length !== 9) {
      toast.error('ИНН должен состоять из 9 цифр')
      return
    }

    setLoading(true)
    try {
      await authApi.createCompany({ name: companyName, inn })
      toast.success('Запрос на регистрацию фирмы отправлен! Ожидайте одобрения.')
      navigate('/login')
    } catch {}
    finally {
      setLoading(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inn.length !== 9) {
      toast.error('ИНН должен состоять из 9 цифр')
      return
    }
    if (!foundCompanyName) {
      toast.error('Сначала найдите фирму по ИНН')
      return
    }

    setLoading(true)
    try {
      await authApi.joinCompany({ inn })
      toast.success('Запрос на вступление в фирму отправлен!')
      navigate('/login')
    } catch {}
    finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Show pending state
  if (isPending) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HiOutlineOfficeBuilding className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-xl font-semibold text-win-text mb-2">Ожидание одобрения</h2>
        <p className="text-sm text-win-text-secondary mb-6">
          Ваш запрос отправлен и ожидает одобрения. Вы получите уведомление, когда запрос будет обработан.
        </p>
        <button onClick={handleLogout} className="win-btn-secondary">
          Выйти
        </button>
      </div>
    )
  }

  // Choose mode
  if (mode === 'choose') {
    return (
      <div>
        <h2 className="text-xl font-semibold text-win-text mb-1">Настройка фирмы</h2>
        <p className="text-sm text-win-text-secondary mb-6">
          Зарегистрируйте свою фирму или войдите в существующую
        </p>

        <div className="space-y-3">
          <button
            onClick={() => setMode('create')}
            className="w-full p-4 border border-win-border rounded-win-lg text-left hover:border-primary 
              hover:bg-primary-light/30 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-win flex items-center justify-center 
                group-hover:bg-primary/20 transition-colors">
                <HiOutlineOfficeBuilding className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-win-text">Создать фирму</p>
                <p className="text-xs text-win-text-secondary">Зарегистрировать новую фирму в CRM</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode('join')}
            className="w-full p-4 border border-win-border rounded-win-lg text-left hover:border-primary 
              hover:bg-primary-light/30 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-win flex items-center justify-center 
                group-hover:bg-green-200 transition-colors">
                <HiOutlineIdentification className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-win-text">Войти в фирму</p>
                <p className="text-xs text-win-text-secondary">Присоединиться к существующей фирме по ИНН</p>
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 py-2"
        >
          Выйти из аккаунта
        </button>
      </div>
    )
  }

  // Create company
  if (mode === 'create') {
    return (
      <div>
        <button
          onClick={() => setMode('choose')}
          className="text-sm text-primary hover:underline mb-4 inline-block"
        >
          ← Назад
        </button>
        <h2 className="text-xl font-semibold text-win-text mb-1">Создать фирму</h2>
        <p className="text-sm text-win-text-secondary mb-6">
          Заполните данные для регистрации фирмы
        </p>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="win-label">Имя фирмы *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="win-input"
              placeholder="ООО Пример"
            />
          </div>

          <div>
            <label className="win-label">ИНН фирмы * (9 цифр)</label>
            <input
              type="text"
              value={inn}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 9)
                setInn(v)
              }}
              className="win-input"
              placeholder="123456789"
              maxLength={9}
            />
            <p className="text-xs text-gray-400 mt-1">{inn.length}/9 цифр</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="win-btn-primary w-full py-2.5 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Зарегистрировать фирму'
            )}
          </button>
        </form>
      </div>
    )
  }

  // Join company
  return (
    <div>
      <button
        onClick={() => { setMode('choose'); setFoundCompanyName(''); setInn('') }}
        className="text-sm text-primary hover:underline mb-4 inline-block"
      >
        ← Назад
      </button>
      <h2 className="text-xl font-semibold text-win-text mb-1">Войти в фирму</h2>
      <p className="text-sm text-win-text-secondary mb-6">
        Введите ИНН существующей фирмы для входа
      </p>

      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label className="win-label">ИНН фирмы * (9 цифр)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inn}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 9)
                setInn(v)
                setFoundCompanyName('')
              }}
              className="win-input flex-1"
              placeholder="123456789"
              maxLength={9}
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={lookingUp || inn.length !== 9}
              className="win-btn-secondary flex-shrink-0 disabled:opacity-50"
            >
              {lookingUp ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <HiOutlineSearch className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {foundCompanyName && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-win">
            <label className="win-label text-green-800">Имя фирмы</label>
            <p className="text-sm font-medium text-green-900">{foundCompanyName}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !foundCompanyName}
          className="win-btn-primary w-full py-2.5 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Отправить запрос'
          )}
        </button>
      </form>
    </div>
  )
}