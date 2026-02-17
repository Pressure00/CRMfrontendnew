import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { certificatesApi, employeesApi } from '@/api'
import type { CertificateShort, EmployeeMember } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import SearchInput from '@/components/ui/SearchInput'
import SelectDropdown from '@/components/ui/SelectDropdown'
import DateRangeFilter from '@/components/ui/DateRangeFilter'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import CreateCertificateModal from '@/components/certificates/CreateCertificateModal'
import { formatDate } from '@/utils/helpers'
import { CERTIFICATE_STATUSES } from '@/constants'
import { getStatusLabel, getStatusColor } from '@/utils/helpers'
import { HiOutlineShieldCheck, HiOutlinePlus } from 'react-icons/hi'

const PAGE_SIZE = 50

export default function CertificatesPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const isDeclarant = user?.activity_type === 'declarant'
  const isDirector = user?.role === 'director'

  const [certificates, setCertificates] = useState<CertificateShort[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [myOnly, setMyOnly] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [employees, setEmployees] = useState<{ value: number; label: string }[]>([])

  useEffect(() => {
    if (isDirector) {
      employeesApi.list().then((res) => {
        const members: EmployeeMember[] = res.data?.my_company?.members || []
        setEmployees(members.map((m) => ({ value: m.id, label: m.full_name })))
      }).catch(() => {})
    }
  }, [isDirector])

  const loadCertificates = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      }
      if (search) params.certificate_number = search
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      if (status) params.status = status
      if (selectedUserId) params.user_id = selectedUserId
      if (myOnly) params.my_only = true

      const res = await certificatesApi.list(params as any)
      setCertificates(res.data)
      setTotalCount(res.data.length < PAGE_SIZE && page === 1
        ? res.data.length
        : (page * PAGE_SIZE) + (res.data.length === PAGE_SIZE ? 1 : 0))
    } catch {} finally {
      setLoading(false)
    }
  }, [page, search, dateFrom, dateTo, status, selectedUserId, myOnly])

  useEffect(() => { loadCertificates() }, [loadCertificates])

  const getStatusBadge = (s: string) => {
    const label = getStatusLabel(CERTIFICATE_STATUSES, s)
    const color = getStatusColor(CERTIFICATE_STATUSES, s)
    return <span className={`win-badge ${color}`}>{label}</span>
  }

  return (
    <div>
      <PageHeader
        title="Сертификаты"
        subtitle={isDeclarant ? 'Управление сертификатами' : 'Входящие заявки'}
        actions={
          isDeclarant ? (
            <button onClick={() => setShowCreate(true)} className="win-btn-primary">
              <HiOutlinePlus className="w-4 h-4" /> Создать заявку
            </button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="win-card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Номер сертификата..."
            className="w-56"
          />
          <DateRangeFilter
            dateFrom={dateFrom} dateTo={dateTo}
            onDateFromChange={(v) => { setDateFrom(v); setPage(1) }}
            onDateToChange={(v) => { setDateTo(v); setPage(1) }}
          />
          <SelectDropdown
            options={CERTIFICATE_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            value={status}
            onChange={(v) => { setStatus(v as string | null); setPage(1) }}
            placeholder="Статус"
            clearable
            className="w-44"
          />
          {isDirector && (
            <SelectDropdown
              options={employees}
              value={selectedUserId}
              onChange={(v) => { setSelectedUserId(v as number | null); setPage(1); setMyOnly(false) }}
              placeholder="Сотрудник"
              clearable searchable className="w-48"
            />
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox" checked={myOnly}
              onChange={(e) => { setMyOnly(e.target.checked); setSelectedUserId(null); setPage(1) }}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            Мои сертификаты
          </label>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner fullPage text="Загрузка..." />
      ) : certificates.length === 0 ? (
        <EmptyState icon={HiOutlineShieldCheck} title="Нет сертификатов" description="Создайте первую заявку" />
      ) : (
        <div className="win-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-win-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Тип</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Номер</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Статус</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Клиент</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">
                    {isDeclarant ? 'Сертификатчики' : 'Декларант'}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Дедлайн</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Отправлено</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-win-border">
                {certificates.map((c) => (
                  <tr key={c.id} onClick={() => navigate(`/certificates/${c.id}`)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-win-text">{c.certificate_type}</td>
                    <td className="px-4 py-3 text-sm text-primary">{c.certificate_number || '—'}</td>
                    <td className="px-4 py-3">{getStatusBadge(c.status)}</td>
                    <td className="px-4 py-3 text-sm text-win-text">{c.client_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-win-text-secondary">
                      {isDeclarant ? c.certifier_company_name || 'Для себя' : c.declarant_company_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-win-text-secondary">{formatDate(c.deadline)}</td>
                    <td className="px-4 py-3 text-xs text-win-text-secondary">{formatDate(c.send_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-win-border">
            <Pagination currentPage={page} totalItems={totalCount} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </div>
        </div>
      )}

      {showCreate && (
        <CreateCertificateModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadCertificates() }}
        />
      )}
    </div>
  )
}