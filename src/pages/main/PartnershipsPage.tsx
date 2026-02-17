import { useEffect, useState } from 'react'
import { partnershipsApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { PartnerCompanyResponse } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Badge from '@/components/ui/Badge'
import { formatDate, getActivityLabel } from '@/utils/helpers'
import toast from 'react-hot-toast'
import { HiOutlineOfficeBuilding, HiOutlinePlus, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi'

export default function PartnershipsPage() {
  const { user } = useAuthStore()
  const [partners, setPartners] = useState<PartnerCompanyResponse[]>([])
  const [loading, setLoading] = useState(true)

  const [showRequest, setShowRequest] = useState(false)
  const [targetInn, setTargetInn] = useState('')
  const [foundName, setFoundName] = useState('')
  const [foundType, setFoundType] = useState('')
  const [lookingUp, setLookingUp] = useState(false)
  const [requestNote, setRequestNote] = useState('')
  const [sending, setSending] = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadPartners() }, [])

  const loadPartners = async () => {
    setLoading(true)
    try {
      const res = await partnershipsApi.list()
      setPartners(res.data)
    } catch {} finally { setLoading(false) }
  }

  const handleLookup = async () => {
    if (targetInn.length !== 9) { toast.error('ИНН должен состоять из 9 цифр'); return }
    setLookingUp(true)
    try {
      const res = await partnershipsApi.lookup({ target_inn: targetInn })
      if (res.data.found) {
        setFoundName(res.data.company_name || '')
        setFoundType(res.data.activity_type || '')
        toast.success(`Фирма найдена: ${res.data.company_name}`)
      } else {
        setFoundName(''); setFoundType('')
        toast.error('Фирма не найдена')
      }
    } catch {} finally { setLookingUp(false) }
  }

  const handleSendRequest = async () => {
    if (!foundName) { toast.error('Сначала найдите фирму'); return }
    setSending(true)
    try {
      await partnershipsApi.sendRequest({ target_inn: targetInn, note: requestNote || undefined })
      toast.success('Запрос на сотрудничество отправлен')
      setShowRequest(false); setTargetInn(''); setFoundName(''); setRequestNote('')
    } catch {} finally { setSending(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await partnershipsApi.delete(deleteId)
      toast.success('Сотрудничество удалено')
      setDeleteId(null)
      loadPartners()
    } catch {} finally { setDeleting(false) }
  }

  return (
    <div>
      <PageHeader title="Сотрудничающие компании" subtitle="Партнёрские фирмы"
        actions={
          <button onClick={() => setShowRequest(true)} className="win-btn-primary">
            <HiOutlinePlus className="w-4 h-4" /> Отправить запрос
          </button>
        }
      />

      {loading ? <LoadingSpinner fullPage /> : partners.length === 0 ? (
        <EmptyState icon={HiOutlineOfficeBuilding} title="Нет партнёров" description="Отправьте запрос на сотрудничество" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <div key={p.partnership_id} className="win-card hover:shadow-win-hover transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-win bg-indigo-100 flex items-center justify-center">
                    <HiOutlineOfficeBuilding className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-win-text">{p.company_name}</p>
                    <p className="text-xs text-win-text-secondary">ИНН: {p.company_inn}</p>
                  </div>
                </div>
                <button onClick={() => setDeleteId(p.partnership_id)}
                  className="p-1.5 rounded hover:bg-red-50 transition-colors">
                  <HiOutlineTrash className="w-4 h-4 text-red-400" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={p.activity_type === 'declarant' ? 'primary' : 'info'}>
                  {getActivityLabel(p.activity_type)}
                </Badge>
                <span className="text-[10px] text-gray-400">{formatDate(p.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send request modal */}
      <Modal isOpen={showRequest} onClose={() => setShowRequest(false)} title="Запрос на сотрудничество" size="sm"
        footer={<>
          <button onClick={() => setShowRequest(false)} className="win-btn-secondary">Отмена</button>
          <button onClick={handleSendRequest} disabled={sending || !foundName} className="win-btn-primary disabled:opacity-50">
            {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Отправить'}
          </button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="win-label">ИНН фирмы * (9 цифр)</label>
            <div className="flex gap-2">
              <input type="text" value={targetInn}
                onChange={(e) => { setTargetInn(e.target.value.replace(/\D/g, '').slice(0, 9)); setFoundName('') }}
                className="win-input flex-1" placeholder="123456789" maxLength={9} />
              <button type="button" onClick={handleLookup} disabled={lookingUp || targetInn.length !== 9}
                className="win-btn-secondary disabled:opacity-50">
                {lookingUp ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <HiOutlineSearch className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {foundName && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-win">
              <p className="text-sm font-medium text-green-900">{foundName}</p>
              <p className="text-xs text-green-700">{getActivityLabel(foundType)}</p>
            </div>
          )}
          <div>
            <label className="win-label">Примечание</label>
            <textarea value={requestNote} onChange={(e) => setRequestNote(e.target.value)}
              className="win-input min-h-[60px] resize-y" placeholder="Необязательно" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Удалить сотрудничество" message="После удаления фирма больше не будет партнёром." confirmText="Удалить" loading={deleting} />
    </div>
  )
}