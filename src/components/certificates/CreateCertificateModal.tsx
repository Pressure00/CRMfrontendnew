import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import SelectDropdown from '@/components/ui/SelectDropdown'
import { certificatesApi, clientsApi, partnershipsApi } from '@/api'
import type { ClientShort, PartnerCompanyResponse } from '@/types'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateCertificateModal({ isOpen, onClose, onCreated }: Props) {
  const [certifierCompanyId, setCertifierCompanyId] = useState<number | null>(null)
  const [isSelf, setIsSelf] = useState(false)
  const [certificateType, setCertificateType] = useState('')
  const [deadline, setDeadline] = useState('')
  const [deadlineDays, setDeadlineDays] = useState('')
  const [certificateNumber, setCertificateNumber] = useState('')
  const [isNumberByCertifier, setIsNumberByCertifier] = useState(false)
  const [clientId, setClientId] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const [clients, setClients] = useState<{ value: number; label: string }[]>([])
  const [partners, setPartners] = useState<{ value: number; label: string }[]>([])

  useEffect(() => {
    clientsApi.list({ limit: 500 }).then((res) => {
      setClients(res.data.map((c: ClientShort) => ({ value: c.id, label: c.company_name })))
    }).catch(() => {})

    partnershipsApi.list().then((res) => {
      const certifiers = res.data.filter((p: PartnerCompanyResponse) => p.activity_type === 'certification')
      setPartners(certifiers.map((p: PartnerCompanyResponse) => ({ value: p.company_id, label: p.company_name })))
    }).catch(() => {})
  }, [])

  const handleDeadlineDaysChange = (days: string) => {
    setDeadlineDays(days)
    if (days) {
      const d = new Date()
      d.setDate(d.getDate() + parseInt(days))
      setDeadline(d.toISOString().split('T')[0])
    }
  }

  const handleSubmit = async () => {
    if (!isSelf && !certifierCompanyId) { toast.error('Выберите фирму сертификатчиков'); return }
    if (!certificateType) { toast.error('Укажите тип сертификата'); return }
    if (!deadline) { toast.error('Укажите срок'); return }
    if (!clientId) { toast.error('Выберите клиента'); return }
    if (!certificateNumber && !isNumberByCertifier) { toast.error('Укажите номер сертификата или отметьте "Заполнит сертификатчик"'); return }

    setLoading(true)
    try {
      await certificatesApi.create({
        certifier_company_id: isSelf ? null : certifierCompanyId,
        is_self: isSelf,
        certificate_type: certificateType,
        deadline,
        certificate_number: certificateNumber || undefined,
        is_number_by_certifier: isNumberByCertifier,
        client_id: clientId,
        note: note || undefined,
      })
      toast.success('Заявка на сертификат создана')
      onCreated()
    } catch {} finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen} onClose={onClose} title="Новая заявка на сертификат" size="lg"
      footer={
        <>
          <button onClick={onClose} className="win-btn-secondary">Отмена</button>
          <button onClick={handleSubmit} disabled={loading} className="win-btn-primary disabled:opacity-50">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Создать'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Company selection */}
        <div>
          <label className="win-label">Фирма сертификатчиков *</label>
          <div className="flex items-center gap-3 mb-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isSelf} onChange={(e) => { setIsSelf(e.target.checked); setCertifierCompanyId(null) }}
                className="rounded border-gray-300 text-primary focus:ring-primary" />
              Для себя
            </label>
          </div>
          {!isSelf && (
            <SelectDropdown
              options={partners}
              value={certifierCompanyId}
              onChange={(v) => setCertifierCompanyId(v as number | null)}
              placeholder="Выберите фирму"
              searchable clearable
            />
          )}
        </div>

        {/* Type */}
        <div>
          <label className="win-label">Тип сертификата *</label>
          <input type="text" value={certificateType} onChange={(e) => setCertificateType(e.target.value)}
            className="win-input" placeholder="Например: Сертификат соответствия" />
        </div>

        {/* Deadline */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="win-label">Срок (дней)</label>
            <input type="number" value={deadlineDays} onChange={(e) => handleDeadlineDaysChange(e.target.value)}
              className="win-input" placeholder="Кол-во дней" min="1" />
          </div>
          <div>
            <label className="win-label">Или выберите дату *</label>
            <input type="date" value={deadline} onChange={(e) => { setDeadline(e.target.value); setDeadlineDays('') }}
              className="win-input" />
          </div>
        </div>

        {/* Certificate number */}
        <div>
          <label className="win-label">Номер сертификата</label>
          <div className="flex items-center gap-3">
            <input type="text" value={certificateNumber}
              onChange={(e) => { setCertificateNumber(e.target.value); setIsNumberByCertifier(false) }}
              className="win-input flex-1" placeholder="Номер" disabled={isNumberByCertifier} />
            <label className="flex items-center gap-2 text-xs cursor-pointer whitespace-nowrap">
              <input type="checkbox" checked={isNumberByCertifier}
                onChange={(e) => { setIsNumberByCertifier(e.target.checked); if (e.target.checked) setCertificateNumber('') }}
                className="rounded border-gray-300 text-primary focus:ring-primary" />
              Заполнит сертификатчик
            </label>
          </div>
        </div>

        {/* Client */}
        <SelectDropdown label="Клиент *" options={clients} value={clientId}
          onChange={(v) => setClientId(v as number | null)} placeholder="Выберите клиента" searchable clearable />

        {/* Note */}
        <div>
          <label className="win-label">Примечание</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="win-input min-h-[80px] resize-y"
            placeholder="Необязательно" />
        </div>
      </div>
    </Modal>
  )
}