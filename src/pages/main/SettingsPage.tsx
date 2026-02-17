import { useState, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { settingsApi } from '@/api'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import { getInitials } from '@/utils/helpers'
import toast from 'react-hot-toast'
import { HiOutlineCamera, HiOutlineTrash } from 'react-icons/hi'

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)

  // Password
  const [showPassword, setShowPassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwStep, setPwStep] = useState<'form' | 'code'>('form')
  const [pwCode, setPwCode] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  // Email
  const [showEmail, setShowEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emStep, setEmStep] = useState<'form' | 'code'>('form')
  const [emCode, setEmCode] = useState('')
  const [emLoading, setEmLoading] = useState(false)

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await settingsApi.updateProfile({ full_name: fullName, phone })
      const res = await settingsApi.getProfile()
      setUser(res.data)
      toast.success('Профиль обновлён')
    } catch {} finally { setSaving(false) }
  }

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await settingsApi.uploadAvatar(file)
      const res = await settingsApi.getProfile()
      setUser(res.data)
      toast.success('Фото обновлено')
    } catch {}
    e.target.value = ''
  }

  const handleDeleteAvatar = async () => {
    try {
      await settingsApi.deleteAvatar()
      const res = await settingsApi.getProfile()
      setUser(res.data)
      toast.success('Фото удалено')
    } catch {}
  }

  const handlePasswordRequest = async () => {
    if (!oldPassword || !newPassword) { toast.error('Заполните все поля'); return }
    if (newPassword.length < 6) { toast.error('Новый пароль минимум 6 символов'); return }
    setPwLoading(true)
    try {
      await settingsApi.requestPasswordChange({ old_password: oldPassword, new_password: newPassword })
      toast.success('Код отправлен в Telegram')
      setPwStep('code')
    } catch {} finally { setPwLoading(false) }
  }

  const handlePasswordConfirm = async () => {
    if (!pwCode) { toast.error('Введите код'); return }
    setPwLoading(true)
    try {
      await settingsApi.confirmPasswordChange(pwCode)
      toast.success('Пароль изменён')
      setShowPassword(false); setOldPassword(''); setNewPassword(''); setPwCode(''); setPwStep('form')
    } catch {} finally { setPwLoading(false) }
  }

  const handleEmailRequest = async () => {
    if (!newEmail) { toast.error('Введите новую почту'); return }
    setEmLoading(true)
    try {
      await settingsApi.requestEmailChange({ new_email: newEmail })
      toast.success('Код отправлен в Telegram')
      setEmStep('code')
    } catch {} finally { setEmLoading(false) }
  }

  const handleEmailConfirm = async () => {
    if (!emCode) { toast.error('Введите код'); return }
    setEmLoading(true)
    try {
      await settingsApi.confirmEmailChange(emCode)
      const res = await settingsApi.getProfile()
      setUser(res.data)
      toast.success('Почта изменена')
      setShowEmail(false); setNewEmail(''); setEmCode(''); setEmStep('form')
    } catch {} finally { setEmLoading(false) }
  }

  if (!user) return null

  return (
    <div>
      <PageHeader title="Настройки" subtitle="Управление профилем" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar */}
        <div className="win-card flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-bold">{getInitials(user.full_name)}</span>
              )}
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-win-border rounded-full 
                flex items-center justify-center shadow-win hover:bg-gray-50 transition-colors">
              <HiOutlineCamera className="w-4 h-4 text-gray-600" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" />
          </div>
          <p className="text-sm font-medium text-win-text">{user.full_name}</p>
          <p className="text-xs text-win-text-secondary">{user.email}</p>
          {user.avatar_url && (
            <button onClick={handleDeleteAvatar} className="text-xs text-red-500 hover:underline mt-2 flex items-center gap-1">
              <HiOutlineTrash className="w-3 h-3" /> Удалить фото
            </button>
          )}
        </div>

        {/* Profile form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="win-card">
            <h3 className="text-sm font-semibold mb-4">Основная информация</h3>
            <div className="space-y-4">
              <div><label className="win-label">Имя и фамилия</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="win-input" /></div>
              <div><label className="win-label">Телефон</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="win-input" /></div>
              <button onClick={handleSaveProfile} disabled={saving} className="win-btn-primary disabled:opacity-50">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Сохранить'}
              </button>
            </div>
          </div>

          <div className="win-card">
            <h3 className="text-sm font-semibold mb-4">Безопасность</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-win">
                <div><p className="text-sm font-medium">Электронная почта</p><p className="text-xs text-win-text-secondary">{user.email}</p></div>
                <button onClick={() => setShowEmail(true)} className="win-btn-secondary text-xs">Изменить</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-win">
                <div><p className="text-sm font-medium">Пароль</p><p className="text-xs text-win-text-secondary">••••••••</p></div>
                <button onClick={() => setShowPassword(true)} className="win-btn-secondary text-xs">Изменить</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password modal */}
      <Modal isOpen={showPassword} onClose={() => { setShowPassword(false); setPwStep('form'); setOldPassword(''); setNewPassword(''); setPwCode('') }}
        title={pwStep === 'form' ? 'Изменить пароль' : 'Код подтверждения'} size="sm"
        footer={<>
          <button onClick={() => { setShowPassword(false); setPwStep('form') }} className="win-btn-secondary">Отмена</button>
          <button onClick={pwStep === 'form' ? handlePasswordRequest : handlePasswordConfirm} disabled={pwLoading} className="win-btn-primary disabled:opacity-50">
            {pwLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : pwStep === 'form' ? 'Далее' : 'Подтвердить'}
          </button>
        </>}>
        {pwStep === 'form' ? (
          <div className="space-y-4">
            <div><label className="win-label">Старый пароль</label><input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="win-input" /></div>
            <div><label className="win-label">Новый пароль</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="win-input" placeholder="Минимум 6 символов" /></div>
          </div>
        ) : (
          <div><label className="win-label">Код из Telegram</label><input type="text" value={pwCode} onChange={(e) => setPwCode(e.target.value)} className="win-input text-center text-lg tracking-widest" placeholder="000000" /></div>
        )}
      </Modal>

      {/* Email modal */}
      <Modal isOpen={showEmail} onClose={() => { setShowEmail(false); setEmStep('form'); setNewEmail(''); setEmCode('') }}
        title={emStep === 'form' ? 'Изменить почту' : 'Код подтверждения'} size="sm"
        footer={<>
          <button onClick={() => { setShowEmail(false); setEmStep('form') }} className="win-btn-secondary">Отмена</button>
          <button onClick={emStep === 'form' ? handleEmailRequest : handleEmailConfirm} disabled={emLoading} className="win-btn-primary disabled:opacity-50">
            {emLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : emStep === 'form' ? 'Далее' : 'Подтвердить'}
          </button>
        </>}>
        {emStep === 'form' ? (
          <div><label className="win-label">Новая электронная почта</label><input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="win-input" placeholder="new@mail.com" /></div>
        ) : (
          <div><label className="win-label">Код из Telegram</label><input type="text" value={emCode} onChange={(e) => setEmCode(e.target.value)} className="win-input text-center text-lg tracking-widest" placeholder="000000" /></div>
        )}
      </Modal>
    </div>
  )
}