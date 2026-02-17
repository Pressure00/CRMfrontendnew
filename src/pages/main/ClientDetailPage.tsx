import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clientsApi } from '@/api'
import type { ClientResponse } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { formatDateTime, getRoleLabel } from '@/utils/helpers'
import toast from 'react-hot-toast'
import {
  HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash,
  HiOutlineDocumentText, HiOutlineShieldCheck, HiOutlineFolder,
  HiOutlineClipboardCheck,
} from 'react-icons/hi'

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [client, setClient] = useState<ClientResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activity, setActivity] = useState<any>(null)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadClient() }, [id])

  const loadClient = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [clientRes, activityRes] = await Promise.all([
        clientsApi.get(parseInt(id)),
        clientsApi.getActivity(parseInt(id)),
      ])
      setClient(clientRes.data)
      setActivity(activityRes.data)
    } catch { navigate('/clients') }
    finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!client) return
    setDeleting(true)
    try {
      await clientsApi.delete(client.id)
      toast.success('Клиент удалён')
      navigate('/clients')
    } catch {} finally { setDeleting(false) }
  }

  if (loading) return <LoadingSpinner fullPage />
  if (!client) return null

  return (
    <div>
      <PageHeader
        title={client.company_name}
        subtitle={`Клиент #${client.id}`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate('/clients')} className="win-btn-secondary">
              <HiOutlineArrowLeft className="w-4 h-4" /> Назад
            </button>
            <button onClick={() => setShowDelete(true)} className="win-btn-danger">
              <HiOutlineTrash className="w-4 h-4" /> Удалить
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="win-card">
            <h3 className="text-sm font-semibold mb-4">Информация о клиенте</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-win-text-secondary">Имя фирмы</p>
                <p className="text-sm font-medium">{client.company_name}</p>
              </div>
              <div>
                <p className="text-xs text-win-text-secondary">ИНН</p>
                <p className="text-sm">{client.inn || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-win-text-secondary">Директор</p>
                <p className="text-sm">{client.director_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-win-text-secondary">Доступность</p>
                <Badge variant={client.access_type === 'public' ? 'success' : 'warning'}>
                  {client.access_type === 'public' ? 'Общедоступный' : 'Приватный'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-win-text-secondary">Добавил</p>
                <p className="text-sm">{client.user_name || '—'}</p>
              </div>
            </div>
            {client.note && (
              <div className="mt-4 pt-4 border-t border-win-border">
                <p className="text-xs text-win-text-secondary mb-1">Примечание</p>
                <p className="text-sm whitespace-pre-wrap">{client.note}</p>
              </div>
            )}
          </div>

          {/* Activity */}
          {activity && (
            <div className="win-card">
              <h3 className="text-sm font-semibold mb-4">Связанные действия</h3>
              <div className="space-y-3">
                {activity.declarations?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-win-text-secondary mb-2 flex items-center gap-1">
                      <HiOutlineDocumentText className="w-3.5 h-3.5" /> Декларации ({activity.declarations.length})
                    </p>
                    {activity.declarations.slice(0, 5).map((d: any) => (
                      <div key={d.id} className="p-2 bg-gray-50 rounded-win text-xs mb-1 cursor-pointer hover:bg-gray-100"
                        onClick={() => navigate(`/declarations/${d.id}`)}>
                        {d.display_number}
                      </div>
                    ))}
                  </div>
                )}
                {activity.certificates?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-win-text-secondary mb-2 flex items-center gap-1">
                      <HiOutlineShieldCheck className="w-3.5 h-3.5" /> Сертификаты ({activity.certificates.length})
                    </p>
                    {activity.certificates.slice(0, 5).map((c: any) => (
                      <div key={c.id} className="p-2 bg-gray-50 rounded-win text-xs mb-1 cursor-pointer hover:bg-gray-100"
                        onClick={() => navigate(`/certificates/${c.id}`)}>
                        {c.certificate_type} — {c.certificate_number || 'без номера'}
                      </div>
                    ))}
                  </div>
                )}
                {activity.documents?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-win-text-secondary mb-2 flex items-center gap-1">
                      <HiOutlineFolder className="w-3.5 h-3.5" /> Документы ({activity.documents.length})
                    </p>
                    {activity.documents.slice(0, 5).map((d: any) => (
                      <div key={d.id} className="p-2 bg-gray-50 rounded-win text-xs mb-1">
                        📄 {d.original_filename}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="win-card">
            <h3 className="text-sm font-semibold mb-4">Статистика</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-win-text-secondary">Декларации</span><Badge>{client.declarations_count}</Badge></div>
              <div className="flex justify-between text-sm"><span className="text-win-text-secondary">Сертификаты</span><Badge>{client.certificates_count}</Badge></div>
              <div className="flex justify-between text-sm"><span className="text-win-text-secondary">Документы</span><Badge>{client.documents_count}</Badge></div>
              <div className="flex justify-between text-sm"><span className="text-win-text-secondary">Папки</span><Badge>{client.folders_count}</Badge></div>
              <div className="flex justify-between text-sm"><span className="text-win-text-secondary">Задачи</span><Badge>{client.tasks_count}</Badge></div>
            </div>
          </div>

          {client.access_list.length > 0 && (
            <div className="win-card">
              <h3 className="text-sm font-semibold mb-4">Доступ</h3>
              <div className="space-y-1">
                {client.access_list.map((a) => (
                  <div key={a.id} className="text-sm text-win-text p-1.5 bg-gray-50 rounded">
                    {a.user_name || `User #${a.user_id}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="win-card">
            <h3 className="text-sm font-semibold mb-4">Даты</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-win-text-secondary">Создано</span><span>{formatDateTime(client.created_at)}</span></div>
              <div className="flex justify-between"><span className="text-win-text-secondary">Обновлено</span><span>{formatDateTime(client.updated_at)}</span></div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Удалить клиента" message={`Удалить клиента "${client.company_name}"?`} confirmText="Удалить" loading={deleting} />
    </div>
  )
}