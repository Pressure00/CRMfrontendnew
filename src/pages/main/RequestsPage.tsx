import { useEffect, useState } from 'react'
import { requestsApi } from '@/api'
import type { RequestResponse } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { formatDateTime } from '@/utils/helpers'
import toast from 'react-hot-toast'
import { HiOutlineClipboardList, HiOutlineCheck, HiOutlineX, HiOutlineMail } from 'react-icons/hi'

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)

  const [showMessage, setShowMessage] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => { loadRequests() }, [])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const res = await requestsApi.list({ limit: 100 })
      setRequests(res.data)
    } catch {} finally { setLoading(false) }
  }

  const handleAction = async (requestId: number, action: string) => {
    setProcessing(requestId)
    try {
      await requestsApi.handleRequest(requestId, { action })
      toast.success(action === 'approve' ? 'Запрос одобрен' : 'Запрос отклонён')
      loadRequests()
    } catch {} finally { setProcessing(null) }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) { toast.error('Введите сообщение'); return }
    setSendingMessage(true)
    try {
      await requestsApi.sendMessageToAdmin({ message: messageText })
      toast.success('Сообщение отправлено администратору')
      setShowMessage(false); setMessageText('')
    } catch {} finally { setSendingMessage(false) }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'user_join': return <Badge variant="primary">Вступление</Badge>
      case 'company_registration': return <Badge variant="info">Регистрация фирмы</Badge>
      case 'partnership': return <Badge variant="success">Сотрудничество</Badge>
      case 'message': return <Badge variant="warning">Сообщение</Badge>
      default: return <Badge>{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Ожидает</Badge>
      case 'approved': return <Badge variant="success">Одобрен</Badge>
      case 'rejected': return <Badge variant="danger">Отклонён</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div>
      <PageHeader title="Запросы" subtitle="Входящие запросы"
        actions={
          <button onClick={() => setShowMessage(true)} className="win-btn-secondary">
            <HiOutlineMail className="w-4 h-4" /> Написать админу
          </button>
        }
      />

      {loading ? <LoadingSpinner fullPage /> : requests.length === 0 ? (
        <EmptyState icon={HiOutlineClipboardList} title="Нет запросов" />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="win-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeBadge(r.type)}
                    {getStatusBadge(r.status)}
                  </div>
                  <p className="text-sm text-win-text">
                    <span className="font-medium">{r.from_user_name}</span>
                    {r.from_company_name && <span className="text-win-text-secondary"> ({r.from_company_name})</span>}
                    {r.type === 'user_join' && ' хочет войти в вашу фирму'}
                    {r.type === 'partnership' && ` хочет сотрудничать`}
                    {r.type === 'company_registration' && ' хочет зарегистрировать фирму'}
                  </p>
                  {r.note && <p className="text-xs text-win-text-secondary mt-1">{r.note}</p>}
                  <p className="text-[10px] text-gray-400 mt-2">{formatDateTime(r.created_at)}</p>
                </div>

                {r.status === 'pending' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleAction(r.id, 'approve')} disabled={processing === r.id}
                      className="win-btn-success text-xs py-1.5 px-3">
                      <HiOutlineCheck className="w-3.5 h-3.5" /> Одобрить
                    </button>
                    <button onClick={() => handleAction(r.id, 'reject')} disabled={processing === r.id}
                      className="win-btn-danger text-xs py-1.5 px-3">
                      <HiOutlineX className="w-3.5 h-3.5" /> Отклонить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message to admin modal */}
      <Modal isOpen={showMessage} onClose={() => setShowMessage(false)} title="Сообщение администратору" size="sm"
        footer={<>
          <button onClick={() => setShowMessage(false)} className="win-btn-secondary">Отмена</button>
          <button onClick={handleSendMessage} disabled={sendingMessage} className="win-btn-primary disabled:opacity-50">
            {sendingMessage ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Отправить'}
          </button>
        </>}>
        <div>
          <label className="win-label">Сообщение</label>
          <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)}
            className="win-input min-h-[120px] resize-y" placeholder="Напишите сообщение..." />
        </div>
      </Modal>
    </div>
  )
}