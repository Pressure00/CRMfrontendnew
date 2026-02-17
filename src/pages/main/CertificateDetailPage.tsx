import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { certificatesApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { CertificateResponse } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import { formatDate, formatDateTime, getStatusLabel, getStatusColor } from '@/utils/helpers'
import { CERTIFICATE_STATUSES } from '@/constants'
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi'
import toast from 'react-hot-toast'

export default function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [cert, setCert] = useState<CertificateResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const isDeclarant = user?.activity_type === 'declarant'
  const isCertifier = user?.activity_type === 'certification'

  useEffect(() => { loadCert() }, [id])

  const loadCert = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await certificatesApi.get(parseInt(id))
      setCert(res.data)
    } catch { navigate('/certificates') }
    finally { setLoading(false) }
  }

  const handleConfirmReview = async () => {
    if (!cert) return
    try {
      await certificatesApi.confirmReview(cert.id)
      toast.success('Проверка подтверждена')
      loadCert()
    } catch {}
  }

  const handleConfirmPayment = async () => {
    if (!cert) return
    try {
      await certificatesApi.confirmPayment(cert.id)
      toast.success('Оплата подтверждена')
      loadCert()
    } catch {}
  }

  if (loading) return <LoadingSpinner fullPage text="Загрузка..." />
  if (!cert) return null

  const statusLabel = getStatusLabel(CERTIFICATE_STATUSES, cert.status)
  const statusColor = getStatusColor(CERTIFICATE_STATUSES, cert.status)

  return (
    <div>
      <PageHeader
        title={cert.certificate_type}
        subtitle={`Сертификат #${cert.id}`}
        actions={
          <button onClick={() => navigate('/certificates')} className="win-btn-secondary">
            <HiOutlineArrowLeft className="w-4 h-4" /> Назад
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main */}
          <div className="win-card">
            <h3 className="text-sm font-semibold mb-4">Информация</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-win-text-secondary">Тип</p><p className="text-sm font-medium">{cert.certificate_type}</p></div>
              <div><p className="text-xs text-win-text-secondary">Номер</p><p className="text-sm font-medium">{cert.certificate_number || '—'}</p></div>
              <div><p className="text-xs text-win-text-secondary">Статус</p><span className={`win-badge ${statusColor}`}>{statusLabel}</span></div>
              <div><p className="text-xs text-win-text-secondary">Дедлайн</p><p className="text-sm">{formatDate(cert.deadline)}</p></div>
              <div><p className="text-xs text-win-text-secondary">Клиент</p><p className="text-sm">{cert.client_name || '—'}</p></div>
              <div><p className="text-xs text-win-text-secondary">Дата отправки</p><p className="text-sm">{formatDate(cert.send_date)}</p></div>
              <div><p className="text-xs text-win-text-secondary">Декларант</p><p className="text-sm">{cert.declarant_user_name} ({cert.declarant_company_name})</p></div>
              <div><p className="text-xs text-win-text-secondary">Сертификатчик</p><p className="text-sm">{cert.assigned_user_name || cert.certifier_company_name || 'Для себя'}</p></div>
            </div>
            {cert.note && <div className="mt-4 pt-4 border-t border-win-border"><p className="text-xs text-win-text-secondary mb-1">Примечание</p><p className="text-sm whitespace-pre-wrap">{cert.note}</p></div>}
            {cert.rejection_note && <div className="mt-4 p-3 bg-red-50 rounded-win border border-red-200"><p className="text-xs text-red-600 mb-1">Причина отклонения</p><p className="text-sm text-red-800">{cert.rejection_note}</p></div>}
          </div>

          {/* Actions for declarant */}
          {isDeclarant && cert.status === 'on_review' && (
            <div className="win-card">
              <h3 className="text-sm font-semibold mb-3">Проверка документа</h3>
              <p className="text-sm text-win-text-secondary mb-3">Сертификатчик отправил документ на проверку</p>
              <button onClick={handleConfirmReview} className="win-btn-success">
                <HiOutlineCheckCircle className="w-4 h-4" /> Подтверждаю
              </button>
            </div>
          )}

          {/* Actions for certifier */}
          {isCertifier && cert.status === 'waiting_payment' && (
            <div className="win-card">
              <h3 className="text-sm font-semibold mb-3">Ожидание оплаты</h3>
              <button onClick={handleConfirmPayment} className="win-btn-success">
                <HiOutlineCheckCircle className="w-4 h-4" /> Подтвердить оплату
              </button>
            </div>
          )}

          {/* Actions history */}
          {cert.actions.length > 0 && (
            <div className="win-card">
              <h3 className="text-sm font-semibold mb-4">История действий</h3>
              <div className="space-y-3">
                {cert.actions.map((a) => (
                  <div key={a.id} className={`p-3 rounded-win text-sm ${
                    a.action.includes('confirm') || a.action.includes('completed') ? 'bg-green-50 border border-green-200 text-green-800' :
                    a.action.includes('reject') ? 'bg-red-50 border border-red-200 text-red-800' :
                    'bg-gray-50 border border-gray-200 text-gray-800'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{a.description || a.action}</p>
                        {a.user_name && <p className="text-xs mt-1 opacity-70">{a.user_name}</p>}
                      </div>
                      <span className="text-xs opacity-60">{formatDateTime(a.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="win-card">
            <h3 className="text-sm font-semibold mb-4">Файлы</h3>
            {cert.files.length === 0 ? (
              <p className="text-xs text-gray-400">Нет файлов</p>
            ) : (
              <div className="space-y-2">
                {cert.files.map((f) => (
                  <div key={f.id} className="p-2 bg-gray-50 rounded-win text-xs">
                    <p className="font-medium truncate">{f.original_filename}</p>
                    <p className="text-gray-400">{f.file_type} • {formatDate(f.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="win-card">
            <h3 className="text-sm font-semibold mb-4">Даты</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-win-text-secondary">Создано</span><span>{formatDateTime(cert.created_at)}</span></div>
              <div className="flex justify-between"><span className="text-win-text-secondary">Обновлено</span><span>{formatDateTime(cert.updated_at)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}