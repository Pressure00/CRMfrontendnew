import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { declarationsApi, clientsApi, employeesApi } from '@/api'
import type { DeclarationShort, ClientShort, EmployeeMember } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import SearchInput from '@/components/ui/SearchInput'
import SelectDropdown from '@/components/ui/SelectDropdown'
import DateRangeFilter from '@/components/ui/DateRangeFilter'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import CreateDeclarationModal from '@/components/declarations/CreateDeclarationModal'
import { formatDate } from '@/utils/helpers'
import { DECLARATION_REGIMES, VEHICLE_TYPES } from '@/constants'
import {
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineFolderOpen,
} from 'react-icons/hi'

const PAGE_SIZE = 50

export default function DeclarationsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [declarations, setDeclarations] = useState<DeclarationShort[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)

  // Filters
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [regime, setRegime] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [myOnly, setMyOnly] = useState(false)

  // Modal
  const [showCreate, setShowCreate] = useState(false)

  // Employee list for director
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

  const loadDeclarations = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      }
      if (search) {
        params.declaration_number = search
        params.post_number = search
      }
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      if (regime) params.regime = regime
      if (selectedUserId) params.user_id = selectedUserId
      if (myOnly) params.my_only = true

      const res = await declarationsApi.list(params as any)
      setDeclarations(res.data)
      setTotalCount(res.data.length < PAGE_SIZE && page === 1
        ? res.data.length
        : (page * PAGE_SIZE) + (res.data.length === PAGE_SIZE ? 1 : 0))
    } catch {}
    finally {
      setLoading(false)
    }
  }, [page, search, dateFrom, dateTo, regime, selectedUserId, myOnly])

  useEffect(() => {
    loadDeclarations()
  }, [loadDeclarations])

  const handleCreated = () => {
    setShowCreate(false)
    loadDeclarations()
  }

  return (
    <div>
      <PageHeader
        title="Декларации"
        subtitle="Управление декларациями"
        actions={
          <button onClick={() => setShowCreate(true)} className="win-btn-primary">
            <HiOutlinePlus className="w-4 h-4" />
            Добавить
          </button>
        }
      />

      {/* Filters */}
      <div className="win-card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Поиск по номеру..."
            className="w-64"
          />

          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={(v) => { setDateFrom(v); setPage(1) }}
            onDateToChange={(v) => { setDateTo(v); setPage(1) }}
          />

          <SelectDropdown
            options={DECLARATION_REGIMES.map((r) => ({ value: r, label: r }))}
            value={regime}
            onChange={(v) => { setRegime(v as string | null); setPage(1) }}
            placeholder="Режим"
            clearable
            searchable
            className="w-40"
          />

          {isDirector && (
            <SelectDropdown
              options={employees}
              value={selectedUserId}
              onChange={(v) => { setSelectedUserId(v as number | null); setPage(1); setMyOnly(false) }}
              placeholder="Сотрудник"
              clearable
              searchable
              className="w-48"
            />
          )}

          <label className="flex items-center gap-2 text-sm text-win-text cursor-pointer">
            <input
              type="checkbox"
              checked={myOnly}
              onChange={(e) => { setMyOnly(e.target.checked); setSelectedUserId(null); setPage(1) }}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            Мои декларации
          </label>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner fullPage text="Загрузка деклараций..." />
      ) : declarations.length === 0 ? (
        <EmptyState
          icon={HiOutlineDocumentText}
          title="Нет деклараций"
          description="Добавьте первую декларацию нажав кнопку выше"
        />
      ) : (
        <div className="win-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-win-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase tracking-wider">
                    Номер декларации
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase tracking-wider">
                    Режим
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase tracking-wider">
                    Сотрудник
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase tracking-wider">
                    Группа
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase tracking-wider">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-win-border">
                {declarations.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => navigate(`/declarations/${d.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-primary">{d.display_number}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-win-text">{d.client_name || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="primary">{d.regime}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-win-text-secondary">{d.user_name || '—'}</td>
                    <td className="px-4 py-3">
                      {d.group_name ? (
                        <span className="flex items-center gap-1 text-xs text-indigo-600">
                          <HiOutlineFolderOpen className="w-3.5 h-3.5" />
                          {d.group_name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-win-text-secondary">
                      {formatDate(d.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-win-border">
            <Pagination
              currentPage={page}
              totalItems={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateDeclarationModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}