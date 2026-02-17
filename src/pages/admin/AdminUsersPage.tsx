import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '@/api/admin'
import type { UserAdminView } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import SearchInput from '@/components/ui/SearchInput'
import SelectDropdown from '@/components/ui/SelectDropdown'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import { formatDate, getActivityLabel, getRoleLabel } from '@/utils/helpers'
import { HiOutlineUsers } from 'react-icons/hi'

const PAGE_SIZE = 50

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserAdminView[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [activityType, setActivityType] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE }
      if (search) params.search = search
      if (activityType) params.activity_type = activityType
      const res = await adminApi.listUsers(params)
      setUsers(res.data)
      setTotalCount(res.data.length < PAGE_SIZE && page === 1 ? res.data.length : (page * PAGE_SIZE) + (res.data.length === PAGE_SIZE ? 1 : 0))
    } catch {} finally { setLoading(false) }
  }, [page, search, activityType])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <PageHeader title="Пользователи" subtitle="Все пользователи CRM" />

      <div className="win-card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Поиск..." className="w-64" />
          <SelectDropdown options={[{ value: 'declarant', label: 'Декларант' }, { value: 'certification', label: 'Сертификация' }]}
            value={activityType} onChange={(v) => { setActivityType(v as string | null); setPage(1) }} placeholder="Деятельность" clearable className="w-44" />
        </div>
      </div>

      {loading ? <LoadingSpinner fullPage /> : users.length === 0 ? (
        <EmptyState icon={HiOutlineUsers} title="Нет пользователей" />
      ) : (
        <div className="win-card p-0 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-win-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Имя</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Фирма</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Роль</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Деятельность</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Статус</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Дата</th>
            </tr></thead>
            <tbody className="divide-y divide-win-border">
              {users.map((u) => (
                <tr key={u.id} onClick={() => navigate(`/admin/users/${u.id}`)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-win-text">{u.full_name}</td>
                  <td className="px-4 py-3 text-sm text-win-text-secondary">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-win-text-secondary">{u.company_name || '—'}</td>
                  <td className="px-4 py-3"><Badge>{getRoleLabel(u.role)}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={u.activity_type === 'declarant' ? 'primary' : 'info'}>{getActivityLabel(u.activity_type)}</Badge></td>
                  <td className="px-4 py-3">
                    {u.is_blocked ? <Badge variant="danger">Заблокирован</Badge> : u.is_active ? <Badge variant="success">Активен</Badge> : <Badge variant="warning">Неактивен</Badge>}
                  </td>
                  <td className="px-4 py-3 text-xs text-win-text-secondary">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-win-border">
            <Pagination currentPage={page} totalItems={totalCount} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  )
}