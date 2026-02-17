import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { tasksApi, employeesApi } from '@/api'
import type { TaskShort, EmployeeMember } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import SelectDropdown from '@/components/ui/SelectDropdown'
import DateRangeFilter from '@/components/ui/DateRangeFilter'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Pagination from '@/components/ui/Pagination'
import CreateTaskModal from '@/components/tasks/CreateTaskModal'
import { formatDate, getStatusLabel, getStatusColor } from '@/utils/helpers'
import { TASK_PRIORITIES, TASK_STATUSES } from '@/constants'
import { HiOutlineClipboardCheck, HiOutlinePlus, HiOutlineExclamation } from 'react-icons/hi'

const PAGE_SIZE = 50

export default function TasksPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const isDirector = user?.role === 'director'

  const [tasks, setTasks] = useState<TaskShort[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [priority, setPriority] = useState<string | null>(null)
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

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE }
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      if (priority) params.priority = priority
      if (status) params.status = status
      if (selectedUserId) params.user_id = selectedUserId
      if (myOnly) params.my_only = true

      const res = await tasksApi.list(params as any)
      setTasks(res.data)
      setTotalCount(res.data.length < PAGE_SIZE && page === 1 ? res.data.length : (page * PAGE_SIZE) + (res.data.length === PAGE_SIZE ? 1 : 0))
    } catch {} finally { setLoading(false) }
  }, [page, dateFrom, dateTo, priority, status, selectedUserId, myOnly])

  useEffect(() => { loadTasks() }, [loadTasks])

  const getPriorityBadge = (p: string) => {
    const item = TASK_PRIORITIES.find((tp) => tp.value === p)
    return <span className={`win-badge ${item?.color || 'bg-gray-100 text-gray-800'}`}>{item?.label || p}</span>
  }

  const getStatusBadge = (s: string) => {
    const label = getStatusLabel(TASK_STATUSES, s)
    const color = getStatusColor(TASK_STATUSES, s)
    return <span className={`win-badge ${color}`}>{label}</span>
  }

  return (
    <div>
      <PageHeader title="Задачи" subtitle="Управление задачами"
        actions={<button onClick={() => setShowCreate(true)} className="win-btn-primary"><HiOutlinePlus className="w-4 h-4" /> Создать</button>}
      />

      <div className="win-card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <DateRangeFilter dateFrom={dateFrom} dateTo={dateTo}
            onDateFromChange={(v) => { setDateFrom(v); setPage(1) }}
            onDateToChange={(v) => { setDateTo(v); setPage(1) }} />
          <SelectDropdown options={TASK_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))} value={priority}
            onChange={(v) => { setPriority(v as string | null); setPage(1) }} placeholder="Приоритет" clearable className="w-44" />
          <SelectDropdown options={TASK_STATUSES.map((s) => ({ value: s.value, label: s.label }))} value={status}
            onChange={(v) => { setStatus(v as string | null); setPage(1) }} placeholder="Статус" clearable className="w-40" />
          {isDirector && (
            <SelectDropdown options={employees} value={selectedUserId}
              onChange={(v) => { setSelectedUserId(v as number | null); setPage(1); setMyOnly(false) }}
              placeholder="Сотрудник" clearable searchable className="w-48" />
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={myOnly}
              onChange={(e) => { setMyOnly(e.target.checked); setSelectedUserId(null); setPage(1) }}
              className="rounded border-gray-300 text-primary focus:ring-primary" />
            Мои задачи
          </label>
        </div>
      </div>

      {loading ? <LoadingSpinner fullPage text="Загрузка..." /> : tasks.length === 0 ? (
        <EmptyState icon={HiOutlineClipboardCheck} title="Нет задач" description="Создайте первую задачу" />
      ) : (
        <div className="win-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-win-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Название</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Приоритет</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Статус</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Исполнитель</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Дедлайн</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Создатель</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-win-border">
                {tasks.map((t) => (
                  <tr key={t.id} onClick={() => navigate(`/tasks/${t.id}`)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {t.is_overdue && <HiOutlineExclamation className="w-4 h-4 text-red-500 flex-shrink-0" />}
                        <span className="text-sm font-medium text-win-text">{t.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getPriorityBadge(t.priority)}</td>
                    <td className="px-4 py-3">{getStatusBadge(t.status)}</td>
                    <td className="px-4 py-3 text-sm text-win-text-secondary">{t.target_user_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${t.is_overdue ? 'text-red-600 font-semibold' : 'text-win-text-secondary'}`}>
                        {formatDate(t.deadline)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-win-text-secondary">{t.creator_user_name || '—'}</td>
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

      {showCreate && <CreateTaskModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadTasks() }} />}
    </div>
  )
}