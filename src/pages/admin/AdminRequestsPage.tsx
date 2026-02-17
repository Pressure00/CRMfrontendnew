import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'
import type { RequestResponse } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import SelectDropdown from '@/components/ui/SelectDropdown'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import { formatDateTime } from '@/utils/helpers'
import toast from 'react-hot-toast'
import { HiOutlineClipboardList, HiOutlineCheck, HiOutlineX } from 'react-icons/hi'

const PAGE_SIZE = 50

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [processing, setProcessing] = useState<number | null>(null)

  useEffect(() => { load() }, [page, typeFilter, statusFilter])

  const load = async () => {
    setLoading(true)
    try {
      const params: any = { skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE }
      if (typeFilter) params.type = typeFilter
      if (statusFilter) params.status = statusFilter
      const res = await adminApi.listRequests(params)
      setRequests(res.data)
      setTotalCount(
        res.data.length < PAGE_SIZE && page === 1
          ? res.data.length
          : page * PAGE_SIZE + (res.data.length === PAGE_SIZE ? 1 : 0)
      )
    } catch {} finally { setLoading(false) }
  }

  const handleAction = async (requestId: number, action: string) => {
    setProcessing(requestId)
    try {
      await adminApi.handleRequest(requestId, { action })
      toast.success(action === 'approve' ? 'Запрос одобрен' : 'Запрос отклонён')
      load()
    } catch {} finally { setProcessing(null) }
  }

  const requestTypes = [
    { value: 'company_registration', label: 'Регистрация фирмы' },
    { value: 'user_join', label: 'Вступление' },
    { value: 'partnership', label: 'Сотрудничество' },
    { value: 'message', label: 'Сообщение' },
  ]

  const requestStatuses = [
    { value: 'pending', label: 'Ожидает' },
    { value: 'approved', label: 'Одобрен' },
    { value: 'rejected', label: 'Отклонён' },
  ]

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'company_registration': return <Badge variant="info">Регистрация фирмы</Badge>
      case 'user_join': return <Badge variant="primary">Вступление</Badge>
      case 'partnership': return <Badge variant="success">Сотрудничество</Badge>
      case 'message': return <Badge variant="warning">Сообщение</Badge>
      default: return <Badge>{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Ожидает</Badge>
      case 'approved': return <Badge variant="success">Одобрен</Badge>
      case 'rejected': return <Badge variant="danger">Отклонён</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const getRequestDescription = (r: RequestResponse): string => {
    switch (r.type) {
      case 'company_registration':
        return `${r.from_user_name || 'Пользователь'} хочет зарегистрироваться и зарегистрировать фирму ${r.from_company_name || ''}`
      case 'user_join':
        return `${r.from_user_name || 'Пользователь'} хочет войти в фирму ${r.to_company_name || ''}`
      case 'partnership':
        return `${r.from_company_name || 'Фирма'} хочет сотрудничать с ${r.to_company_name || ''}`
      case 'message':
        return `Сообщение от ${r.from_user_name || 'пользователя'}`
      default:
        return r.type
    }
  }

  return (
    <div>
      <PageHeader title="Запросы" subtitle="Все запросы для администратора" />

      {/* Filters */}
      <div className="win-card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <SelectDropdown
            options={requestTypes}
            value={typeFilter}
            onChange={(v) => { setTypeFilter(v as string | null); setPage(1) }}
            placeholder="Тип запроса"
            clearable
            className="w-52"
          />
          <SelectDropdown
            options={requestStatuses}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v as string | null); setPage(1) }}
            placeholder="Статус"
            clearable
            className="w-40"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner fullPage text="Загрузка запросов..." />
      ) : requests.length === 0 ? (
        <EmptyState icon={HiOutlineClipboardList} title="Нет запросов" description="Все запросы обработаны" />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="win-card hover:shadow-win-hover transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header badges */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {getTypeBadge(r.type)}
                    {getStatusBadge(r.status)}
                    <span className="text-[10px] text-gray-400">#{r.id}</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-win-text mb-1">{getRequestDescription(r)}</p>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-win-text-secondary">
                    {r.from_user_name && (
                      <span>От: <span className="font-medium text-win-text">{r.from_user_name}</span></span>
                    )}
                    {r.from_company_name && (
                      <span>Фирма: <span className="font-medium text-win-text">{r.from_company_name}</span></span>
                    )}
                    {r.to_company_name && (
                      <span>→ <span className="font-medium text-win-text">{r.to_company_name}</span></span>
                    )}
                  </div>

                  {/* Note */}
                  {r.note && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-win-text-secondary">
                      {r.note}
                    </div>
                  )}

                  {/* Data */}
                  {r.data && Object.keys(r.data).length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                      {Object.entries(r.data).map(([k, v]) => (
                        <span key={k} className="mr-3">
                          <span className="font-medium">{k}:</span> {String(v)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                    <span>Создан: {formatDateTime(r.created_at)}</span>
                    {r.updated_at !== r.created_at && (
                      <span>Обновлён: {formatDateTime(r.updated_at)}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {r.status === 'pending' && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAction(r.id, 'approve')}
                      disabled={processing === r.id}
                      className="win-btn-success text-xs py-1.5 px-3"
                    >
                      {processing === r.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><HiOutlineCheck className="w-3.5 h-3.5" /> Одобрить</>
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(r.id, 'reject')}
                      disabled={processing === r.id}
                      className="win-btn-danger text-xs py-1.5 px-3"
                    >
                      <HiOutlineX className="w-3.5 h-3.5" /> Отклонить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalItems={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  )
}