import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import SelectDropdown from '@/components/ui/SelectDropdown'
import { declarationsApi, clientsApi } from '@/api'
import type { ClientShort, DeclarationVehicle } from '@/types'
import { DECLARATION_REGIMES, VEHICLE_TYPES } from '@/constants'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi'

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateDeclarationModal({ isOpen, onClose, onCreated }: Props) {
  const [postNumber, setPostNumber] = useState('')
  const [sendDate, setSendDate] = useState('')
  const [declarationNumber, setDeclarationNumber] = useState('')
  const [clientId, setClientId] = useState<number | null>(null)
  const [regime, setRegime] = useState<string | null>(null)
  const [vehicles, setVehicles] = useState<DeclarationVehicle[]>([{ vehicle_type: '', vehicle_number: '' }])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const [clients, setClients] = useState<{ value: number; label: string }[]>([])
  const [clientsLoading, setClientsLoading] = useState(false)

  useEffect(() => {
    setClientsLoading(true)
    clientsApi.list({ limit: 500 }).then((res) => {
      setClients(res.data.map((c: ClientShort) => ({ value: c.id, label: c.company_name })))
    }).catch(() => {}).finally(() => setClientsLoading(false))
  }, [])

  const addVehicle = () => {
    setVehicles([...vehicles, { vehicle_type: '', vehicle_number: '' }])
  }

  const removeVehicle = (index: number) => {
    if (vehicles.length === 1) return
    setVehicles(vehicles.filter((_, i) => i !== index))
  }

  const updateVehicle = (index: number, field: keyof DeclarationVehicle, value: string) => {
    const updated = [...vehicles]
    updated[index] = { ...updated[index], [field]: value }
    setVehicles(updated)
  }

  const handleSubmit = async () => {
    if (!postNumber || postNumber.length !== 5) {
      toast.error('Номер поста должен состоять из 5 цифр')
      return
    }
    if (!sendDate) { toast.error('Укажите дату отправки'); return }
    if (!declarationNumber || declarationNumber.length !== 7) {
      toast.error('Номер декларации должен состоять из 7 цифр')
      return
    }
    if (!clientId) { toast.error('Выберите клиента'); return }
    if (!regime) { toast.error('Выберите режим'); return }

    const validVehicles = vehicles.filter((v) => v.vehicle_type && v.vehicle_number)
    if (validVehicles.length === 0) {
      toast.error('Добавьте хотя бы одно транспортное средство')
      return
    }

    setLoading(true)
    try {
      await declarationsApi.create({
        post_number: postNumber,
        send_date: sendDate,
        declaration_number: declarationNumber,
        client_id: clientId,
        regime,
        vehicles: validVehicles,
        note: note || undefined,
      })
      toast.success('Декларация создана')
      onCreated()
    } catch {} finally {
      setLoading(false)
    }
  }

  const previewNumber = `${postNumber || '—'}/${sendDate ? sendDate.split('-').reverse().join('.') : '—'}/${declarationNumber || '—'}`

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Новая декларация"
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="win-btn-secondary">Отмена</button>
          <button onClick={handleSubmit} disabled={loading} className="win-btn-primary disabled:opacity-50">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Создать'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Preview */}
        <div className="p-3 bg-blue-50 rounded-win border border-blue-200">
          <p className="text-xs text-blue-600 mb-1">Номер декларации:</p>
          <p className="text-sm font-mono font-semibold text-blue-900">{previewNumber}</p>
        </div>

        {/* Row: Post Number, Date, Declaration Number */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="win-label">Номер поста * (5 цифр)</label>
            <input
              type="text"
              value={postNumber}
              onChange={(e) => setPostNumber(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="win-input"
              placeholder="26001"
              maxLength={5}
            />
          </div>
          <div>
            <label className="win-label">Дата отправки *</label>
            <input
              type="date"
              value={sendDate}
              onChange={(e) => setSendDate(e.target.value)}
              className="win-input"
            />
          </div>
          <div>
            <label className="win-label">Номер декл. * (7 цифр)</label>
            <input
              type="text"
              value={declarationNumber}
              onChange={(e) => setDeclarationNumber(e.target.value.replace(/\D/g, '').slice(0, 7))}
              className="win-input"
              placeholder="0010722"
              maxLength={7}
            />
          </div>
        </div>

        {/* Client */}
        <SelectDropdown
          label="Клиент *"
          options={clients}
          value={clientId}
          onChange={(v) => setClientId(v as number | null)}
          placeholder="Выберите клиента"
          searchable
          clearable
        />

        {/* Regime */}
        <SelectDropdown
          label="Режим декларации *"
          options={DECLARATION_REGIMES.map((r) => ({ value: r, label: r }))}
          value={regime}
          onChange={(v) => setRegime(v as string | null)}
          placeholder="Выберите режим"
          searchable
          clearable
        />

        {/* Vehicles */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="win-label mb-0">Транспортные средства *</label>
            <button type="button" onClick={addVehicle} className="text-xs text-primary hover:underline flex items-center gap-1">
              <HiOutlinePlus className="w-3 h-3" /> Добавить
            </button>
          </div>
          <div className="space-y-2">
            {vehicles.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={v.vehicle_type}
                  onChange={(e) => updateVehicle(i, 'vehicle_type', e.target.value)}
                  className="win-select flex-1"
                >
                  <option value="">Тип транспорта</option>
                  {VEHICLE_TYPES.map((vt) => (
                    <option key={vt.value} value={vt.value}>{vt.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={v.vehicle_number}
                  onChange={(e) => updateVehicle(i, 'vehicle_number', e.target.value)}
                  className="win-input flex-1"
                  placeholder="Номер машины"
                />
                {vehicles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVehicle(i)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="win-label">Примечание</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="win-input min-h-[80px] resize-y"
            placeholder="Необязательно"
          />
        </div>
      </div>
    </Modal>
  )
}