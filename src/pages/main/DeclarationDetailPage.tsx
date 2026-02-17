import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { declarationsApi, employeesApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { DeclarationResponse, EmployeeMember } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import SelectDropdown from '@/components/ui/SelectDropdown'
import { formatDate, formatDateTime } from '@/utils/helpers'
import toast from 'react-hot-toast'
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSwitchHorizontal,
  HiOutlineFolder,
  HiOutlineArrowLeft,
  HiOutlineTruck,
  HiOutlineDocumentText,
  HiOutlinePaperClip,
} from 'react-icons/hi'

export default function DeclarationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [decl, setDecl] = useState<DeclarationResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [showRedirect, setShowRedirect] = useState(false)
  const [redirectUserId, setRedirectUserId] = useState<number | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const [employees, setEmployees] = useState<{ value: number; label: string }[]>([])

  useEffect(() => {
    loadDeclaration()
  }, [id])

  const loadDeclaration = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await declarationsApi.get(parseInt(id))
      setDecl(res.data)
    } catch {
      navigate('/declarations')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!decl) return
    setDeleting(true)
    try {
      await declarationsApi.delete(decl.id)
      toast.success('Декларация удалена')
      navigate('/declarations')
    } catch {} finally {
      setDeleting(false)
    }
  }

  const openRedirect = async () => {
    try {
      const res = await employeesApi.list()
      const members: EmployeeMember[] = res.data?.my_company?.members || []
      setEmployees(members.filter((m) => m.id !== user?.id).map((m) => ({ value: m.id, label: m.full_name })))
      setShowRedirect(true)
    } catch {}
  }

  const handleRedirect = async () => {
    if (!decl || !redirectUserId) return
    setRedirecting(true)
    try {
      await declarationsApi.redirect(decl.id, redirectUserId)
      toast.success('Декларация перенаправлена')
      setShowRedirect(false)
      loadDeclaration()
    } catch {} finally {
      setRedirecting(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage text="Загрузка декларации..." />
  if (!decl) return null

  return (
    <div>
      <PageHeader
        title={decl.display_number}
        subtitle="Детали декларации"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/declarations')} className="win-btn-secondary">
              <HiOutlineArrowLeft className="w-4 h-4" /> Назад
            </button>
            <button onClick={() => navigate(`/declarations/${decl.id}`, { state: { edit: true } })} className="win-btn-secondary">
              <HiOutlinePencil className="w-4 h-4" /> Редактировать
            </button>
            <button onClick={openRedirect} className="win-btn-secondary">
              <HiOutlineSwitchHorizontal className="w-4 h-4" /> Перенаправить
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
            <h3 className="text-sm font-semibold text-win-text mb-4 flex items-center gap-2">
              <HiOutlineDocumentText className="w-4 h-4 text-primary" /> Основная информация
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-win-text-secondary">Номер декларации</p>
                <p className="text-sm font-medium text-win-text">{decl.display_number}</p>
              </div>
              <div>
                <p className="text-xs text-win-text-secondary">Режим</p>
                <Badge variant="primary">{decl.regime}</Badge>
              </div>
              <div>
                <p className="text-xs text-win-text-secondary">Клиент</p>
                <p className="text-sm font-medium text-win-text">{decl.client_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-win-text-secondary">Дата отправки</p>
                <p className="text-sm text-win-text">{formatDate(decl.send_date)}</p>
              </div>
              <div>
                <p className="text-xs text-win-text-secondary">Сотрудник</p>
                <p className="text-sm text-win-text">{decl.user_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-win-text-secondary">Группа</p>
                <p className="text-sm text-win-text">{decl.group_name || '—'}</p>
              </div>
            </div>
            {decl.note && (
              <div className="mt-4 pt-4 border-t border-win-border">
                <p className="text-xs text-win-text-secondary mb-1">Примечание</p>
                <p className="text-sm text-win-text whitespace-pre-wrap">{decl.note}</p>
              </div>
            )}
          </div>

          {/* Vehicles */}
          <div className="win-card">
            <h3 className="text-sm font-semibold text-win-text mb-4 flex items-center gap-2">
              <HiOutlineTruck className="w-4 h-4 text-primary" /> Транспортные средства
            </h3>
            <div className="space-y-2">
              {decl.vehicles.map((v) => (
                <div key={v.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-win">
                  <Badge variant="info">{v.vehicle_type}</Badge>
                  <span className="text-sm font-medium text-win-text">{v.vehicle_number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          {decl.attachments.length > 0 && (
            <div className="win-card">
              <h3 className="text-sm font-semibold text-win-text mb-4 flex items-center gap-2">
                <HiOutlinePaperClip className="w-4 h-4 text-primary" /> Прикреплённые файлы
              </h3>
              <div className="space-y-2">
                {decl.attachments.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-win text-sm">
                    {a.document_name && <span>📄 {a.document_name}</span>}
                    {a.folder_name && <span>📁 {a.folder_name}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="win-card">
            <h3 className="text-sm font-semibold text-win-text mb-4">Связанные данные</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-win-text-secondary">Сертификаты</span>
                <Badge>{decl.certificates_count ?? 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-win-text-secondary">Задачи</span>
                <Badge>{decl.tasks_count ?? 0}</Badge>
              </div>
            </div>
          </div>

          <div className="win-card">
            <h3 className="text-sm font-semibold text-win-text mb-4">Даты</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-win-text-secondary">Создано</span>
                <span className="text-win-text">{formatDateTime(decl.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-win-text-secondary">Обновлено</span>
                <span className="text-win-text">{formatDateTime(decl.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Удалить декларацию"
        message={`Вы уверены, что хотите удалить декларацию ${decl.display_number}?`}
        confirmText="Удалить"
        loading={deleting}
      />

      {/* Redirect modal */}
      <Modal
        isOpen={showRedirect}
        onClose={() => setShowRedirect(false)}
        title="Перенаправить декларацию"
        size="sm"
        footer={
          <>
            <button onClick={() => setShowRedirect(false)} className="win-btn-secondary">Отмена</button>
            <button
              onClick={handleRedirect}
              disabled={!redirectUserId || redirecting}
              className="win-btn-primary disabled:opacity-50"
            >
              {redirecting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Перенаправить'}
            </button>
          </>
        }
      >
        <SelectDropdown
          label="Выберите сотрудника"
          options={employees}
          value={redirectUserId}
          onChange={(v) => setRedirectUserId(v as number | null)}
          placeholder="Выберите сотрудника"
          searchable
        />
      </Modal>
    </div>
  )
}