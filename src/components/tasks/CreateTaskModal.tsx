import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import SelectDropdown from '@/components/ui/SelectDropdown'
import { tasksApi, employeesApi, partnershipsApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { EmployeeMember, PartnerCompanyResponse } from '@/types'
import { TASK_PRIORITIES, TASK_STATUSES } from '@/constants'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateTaskModal({ isOpen, onClose, onCreated }: Props) {
  const { user } = useAuthStore()
  const [targetCompanyId, setTargetCompanyId] = useState<number | null>(user?.company_id || null)
  const [targetUserId, setTargetUserId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [priority, setPriority] = useState('normal')
  const [status, setStatus] = useState('new')
  const [deadline, setDeadline] = useState('')
  const [deadlineDays, setDeadlineDays] = useState('')
  const [loading, setLoading] = useState(false)

  const [companies, setCompanies] = useState<{ value: number; label: string }[]>([])
  const [employees, setEmployees] = useState<{ value: number; label: string }[]>([])

  useEffect(() => {
    // Load companies (own + partners)
    const comps: { value: number; label: string }[] = []
    if (user?.company_id && user?.company_name) {
      comps.push({ value: user.company_id, label: user.company_name + ' (моя фирма)' })
    }
    partnershipsApi.list().then((res) => {
      res.data.forEach((p: PartnerCompanyResponse) => {
        comps.push({ value: p.company_id, label: p.company_name })
      })
      setCompanies(comps)
    }).catch(() => setCompanies(comps))
  }, [user])

  useEffect(() => {
    if (!targetCompanyId) { setEmployees([]); return }
    employeesApi.list().then((res) => {
      let members: EmployeeMember[] = []
      if (targetCompanyId === user?.company_id) {
        members = res.data?.my_company?.members || []
      } else {
        const partner = (res.data?.partner_companies || []).find((p: any) =>
          (res.data?.partner_companies || []).some((pc: any) => pc.members?.some((m: EmployeeMember) => true))
        )
        // Simplified: load all
        members = res.data?.my_company?.members || []
      }
      setEmployees(members.map((m: EmployeeMember) => ({ value: m.id, label: m.full_name })))
    }).catch(() => {})
  }, [targetCompanyId])

  const handleDeadlineDays = (days: string) => {
    setDeadlineDays(days)
    if (days) {
      const d = new Date(); d.setDate(d.getDate() + parseInt(days))
      setDeadline(d.toISOString().split('T')[0])
    }
  }

  const handleSubmit = async () => {
    if (!targetCompanyId) { toast.error('Выберите фирму'); return }
    if (!targetUserId) { toast.error('Выберите сотрудника'); return }
    if (!title) { toast.error('Введите название'); return }
    if (!deadline) { toast.error('Укажите дедлайн'); return }

    setLoading(true)
    try {
      await tasksApi.create({
        target_company_id: targetCompanyId,
        target_user_id: targetUserId,
        title, note: note || undefined,
        priority, status, deadline,
      })
      toast.success('Задача создана')
      onCreated()
    } catch {} finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Новая задача" size="lg"
      footer={<>
        <button onClick={onClose} className="win-btn-secondary">Отмена</button>
        <button onClick={handleSubmit} disabled={loading} className="win-btn-primary disabled:opacity-50">
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Создать'}
        </button>
      </>}
    >
      <div className="space-y-4">
        <SelectDropdown label="Фирма *" options={companies} value={targetCompanyId}
          onChange={(v) => { setTargetCompanyId(v as number | null); setTargetUserId(null) }}
          placeholder="Выберите фирму" searchable />

        <SelectDropdown label="Сотрудник *" options={employees} value={targetUserId}
          onChange={(v) => setTargetUserId(v as number | null)}
          placeholder="Выберите сотрудника" searchable />

        <div>
          <label className="win-label">Название задачи *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="win-input" placeholder="Введите название" />
        </div>

        <div>
          <label className="win-label">Примечание</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="win-input min-h-[80px] resize-y" placeholder="Необязательно" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectDropdown label="Приоритет *" options={TASK_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
            value={priority} onChange={(v) => setPriority(v as string)} placeholder="Приоритет" />
          <SelectDropdown label="Статус *" options={TASK_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            value={status} onChange={(v) => setStatus(v as string)} placeholder="Статус" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="win-label">Срок (дней)</label>
            <input type="number" value={deadlineDays} onChange={(e) => handleDeadlineDays(e.target.value)} className="win-input" placeholder="Дней" min="1" />
          </div>
          <div><label className="win-label">Или дата *</label>
            <input type="date" value={deadline} onChange={(e) => { setDeadline(e.target.value); setDeadlineDays('') }} className="win-input" />
          </div>
        </div>
      </div>
    </Modal>
  )
}