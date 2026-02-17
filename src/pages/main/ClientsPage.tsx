import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientsApi, employeesApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { ClientShort, EmployeeMember } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import SearchInput from '@/components/ui/SearchInput'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Pagination from '@/components/ui/Pagination'
import Modal from '@/components/ui/Modal'
import SelectDropdown from '@/components/ui/SelectDropdown'
import { HiOutlineUserGroup, HiOutlinePlus } from 'react-icons/hi'
import toast from 'react-hot-toast'

const PAGE_SIZE = 50

export default function ClientsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [clients, setClients] = useState<ClientShort[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [inn, setInn] = useState('')
  const [directorName, setDirectorName] = useState('')
  const [accessType, setAccessType] = useState('public')
  const [note, setNote] = useState('')
  const [grantedUserIds, setGrantedUserIds] = useState<number[]>([])
  const [creating, setCreating] = useState(false)

  const [employees, setEmployees] = useState<{ value: number; label: string }[]>([])

  useEffect(() => {
    employeesApi.list().then((r) => {
      const m: EmployeeMember[] = r.data?.my_company?.members || []
      setEmployees(m.filter((e) => e.id !== user?.id).map((e) => ({ value: e.id, label: e.full_name })))
    }).catch(() => {})
  }, [])

  const loadClients = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE }
      if (search) { params.company_name = search; params.inn = search }
      const res = await clientsApi.list(params)
      setClients(res.data)
      setTotalCount(res.data.length < PAGE_SIZE && page === 1 ? res.data.length : (page * PAGE_SIZE) + (res.data.length === PAGE_SIZE ? 1 : 0))
    } catch {} finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { loadClients() }, [loadClients])

  const handleCreate = async () => {
    if (!companyName) { toast.error('Введите имя фирмы'); return }
    setCreating(true)
    try {
      await clientsApi.create({
        company_name: companyName, inn: inn || undefined, director_name: directorName || undefined,
        access_type: accessType, note: note || undefined,
        granted_user_ids: accessType === 'private' ? grantedUserIds : [],
      })
      toast.success('Клиент добавлен')
      setShowCreate(false); setCompanyName(''); setInn(''); setDirectorName(''); setNote(''); setAccessType('public'); setGrantedUserIds([])
      loadClients()
    } catch {} finally { setCreating(false) }
  }

  return (
    <div>
      <PageHeader title="Клиенты" subtitle="Управление клиентами"
        actions={<button onClick={() => setShowCreate(true)} className="win-btn-primary"><HiOutlinePlus className="w-4 h-4" /> Добавить</button>} />

      <div className="win-card mb-6">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Поиск по названию или ИНН..." className="w-80" />
      </div>

      {loading ? <LoadingSpinner fullPage /> : clients.length === 0 ? (
        <EmptyState icon={HiOutlineUserGroup} title="Нет клиентов" description="Добавьте первого клиента" />
      ) : (
        <div className="win-card p-0 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-win-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Фирма</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">ИНН</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Директор</th>
            </tr></thead>
            <tbody className="divide-y divide-win-border">
              {clients.map((c) => (
                <tr key={c.id} onClick={() => navigate(`/clients/${c.id}`)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-primary">{c.company_name}</td>
                  <td className="px-4 py-3 text-sm text-win-text-secondary">{c.inn || '—'}</td>
                  <td className="px-4 py-3 text-sm text-win-text-secondary">{c.director_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-win-border">
            <Pagination currentPage={page} totalItems={totalCount} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Добавить клиента" size="md"
        footer={<><button onClick={() => setShowCreate(false)} className="win-btn-secondary">Отмена</button>
          <button onClick={handleCreate} disabled={creating} className="win-btn-primary disabled:opacity-50">
            {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Добавить'}
          </button></>}>
        <div className="space-y-4">
          <div><label className="win-label">Имя фирмы *</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="win-input" placeholder="ООО Пример" /></div>
          <div><label className="win-label">ИНН фирмы</label><input type="text" value={inn} onChange={(e) => setInn(e.target.value)} className="win-input" placeholder="Необязательно" /></div>
          <div><label className="win-label">Имя директора</label><input type="text" value={directorName} onChange={(e) => setDirectorName(e.target.value)} className="win-input" placeholder="Необязательно" /></div>
          <div>
            <label className="win-label">Доступность</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" checked={accessType === 'public'} onChange={() => setAccessType('public')} className="text-primary" /> Общедоступный</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" checked={accessType === 'private'} onChange={() => setAccessType('private')} className="text-primary" /> Только для себя</label>
            </div>
          </div>
          {accessType === 'private' && employees.length > 0 && (
            <div><label className="win-label">Дать доступ сотрудникам</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {employees.map((e) => (
                  <label key={e.value} className="flex items-center gap-2 text-sm cursor-pointer p-1 hover:bg-gray-50 rounded">
                    <input type="checkbox" checked={grantedUserIds.includes(e.value as number)}
                      onChange={(ev) => ev.target.checked ? setGrantedUserIds([...grantedUserIds, e.value as number]) : setGrantedUserIds(grantedUserIds.filter((id) => id !== e.value))}
                      className="rounded border-gray-300 text-primary" />{e.label}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div><label className="win-label">Примечание</label><textarea value={note} onChange={(e) => setNote(e.target.value)} className="win-input min-h-[60px] resize-y" placeholder="Необязательно" /></div>
        </div>
      </Modal>
    </div>
  )
}