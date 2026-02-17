import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { dashboardApi, employeesApi } from '@/api'
import type { DashboardCertifier, EmployeeMember } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import DateRangeFilter from '@/components/ui/DateRangeFilter'
import SelectDropdown from '@/components/ui/SelectDropdown'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/utils/helpers'
import {
  HiOutlineClipboardCheck,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineShieldCheck,
  HiOutlineClock,
} from 'react-icons/hi'

export default function CertifierDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardCertifier | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [employees, setEmployees] = useState<{ value: number; label: string }[]>([])

  const isDirector = user?.role === 'director'

  useEffect(() => {
    if (isDirector) {
      employeesApi.list().then((res) => {
        const members: EmployeeMember[] = res.data?.my_company?.members || []
        setEmployees(members.map((m) => ({ value: m.id, label: m.full_name })))
      }).catch(() => {})
    }
  }, [isDirector])

  useEffect(() => {
    loadData()
  }, [dateFrom, dateTo, selectedUserId])

  const loadData = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      if (selectedUserId) params.user_id = selectedUserId

      const res = await dashboardApi.certifier(params as any)
      setData(res.data)
    } catch {}
    finally {
      setLoading(false)
    }
  }

  if (loading && !data) {
    return <LoadingSpinner fullPage text="Загрузка дашборда..." />
  }

  if (!data) return null

  return (
    <div>
      <PageHeader
        title="Дашборд"
        subtitle={data.selected_user_name ? `Статистика: ${data.selected_user_name}` : 'Общая статистика'}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <DateRangeFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />
        {isDirector && (
          <SelectDropdown
            options={[{ value: 0, label: 'Все сотрудники' }, ...employees]}
            value={selectedUserId}
            onChange={(v) => setSelectedUserId(v === 0 ? null : v as number)}
            placeholder="Все сотрудники"
            searchable
            clearable
            className="w-52"
          />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        <StatCard icon={HiOutlineClipboardCheck} label="Активные задачи" value={data.active_tasks} color="blue" />
        <StatCard icon={HiOutlineCheckCircle} label="Выполненные задачи" value={data.completed_tasks} color="green" />
        <StatCard icon={HiOutlineExclamationCircle} label="Просроченные задачи" value={data.overdue_tasks} color="red" />
        <StatCard icon={HiOutlineClock} label="В процессе" value={data.in_progress_certificates} color="yellow" />
        <StatCard icon={HiOutlineShieldCheck} label="Выполненные серт." value={data.completed_certificates} color="green" />
        <StatCard icon={HiOutlineExclamationCircle} label="Просроченные серт." value={data.overdue_certificates} color="red" />
      </div>

      {/* Recent lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* In Progress */}
        <div className="win-card">
          <h3 className="text-sm font-semibold text-win-text mb-4">Выполняемые сертификаты</h3>
          {data.recent_in_progress.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">Нет сертификатов</p>
          ) : (
            <div className="space-y-2">
              {data.recent_in_progress.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/certificates/${c.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-win hover:bg-gray-50 
                    transition-colors text-left border border-win-border"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-win-text truncate">{c.certificate_type}</p>
                    <p className="text-xs text-win-text-secondary">{c.declarant_company_name || '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className="win-badge bg-blue-100 text-blue-800 text-[10px]">{c.status}</span>
                    <p className="text-[10px] text-gray-400 mt-1">до {formatDate(c.deadline)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Overdue */}
        <div className="win-card">
          <h3 className="text-sm font-semibold text-win-text mb-4">Просроченные сертификаты</h3>
          {data.recent_overdue.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">Нет просроченных</p>
          ) : (
            <div className="space-y-2">
              {data.recent_overdue.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/certificates/${c.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-win hover:bg-gray-50 
                    transition-colors text-left border border-win-border"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-win-text truncate">{c.certificate_type}</p>
                    <p className="text-xs text-win-text-secondary">{c.declarant_company_name || '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className="win-badge bg-red-100 text-red-800 text-[10px]">Просрочен</span>
                    <p className="text-[10px] text-red-400 mt-1">{formatDate(c.deadline)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}