import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tasksApi } from '@/api'
import type { TaskResponse } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { formatDate, formatDateTime, getStatusLabel, getStatusColor } from '@/utils/helpers'
import { TASK_PRIORITIES, TASK_STATUSES } from '@/constants'
import toast from 'react-hot-toast'
import { HiOutlineArrowLeft, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi'

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<TaskResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadTask() }, [id])

  const loadTask = async () => {
    if (!id) return
    setLoading(true)
    try { const res = await tasksApi.get(parseInt(id)); setTask(res.data) }
    catch { navigate('/tasks') }
    finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!task) return
    setDeleting(true)
    try { await tasksApi.delete(task.id); toast.success('Задача удалена'); navigate('/tasks') }
    catch {} finally { setDeleting(false) }
  }

  if (loading) return <LoadingSpinner fullPage />
  if (!task) return null

  const priorityItem = TASK_PRIORITIES.find((p) => p.value === task.priority)
  const statusLabel = getStatusLabel(TASK_STATUSES, task.status)
  const statusColor = getStatusColor(TASK_STATUSES, task.status)

  return (
    <div>
      <PageHeader title={task.title} subtitle={`Задача #${task.id}`}
        actions={<div className="flex gap-2">
          <button onClick={() => navigate('/tasks')} className="win-btn-secondary"><HiOutlineArrowLeft className="w-4 h-4" /> Назад</button>
          <button onClick={() => setShowDelete(true)} className="win-btn-danger"><HiOutlineTrash className="w-4 h-4" /> Удалить</button>
        </div>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="win-card">
            <h3 className="text-sm font-semibold mb-4">Информация о задаче</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-win-text-secondary">Название</p><p className="text-sm font-medium">{task.title}</p></div>
              <div><p className="text-xs text-win-text-secondary">Приоритет</p><span className={`win-badge ${priorityItem?.color || ''}`}>{priorityItem?.label || task.priority}</span></div>
              <div><p className="text-xs text-win-text-secondary">Статус</p><span className={`win-badge ${statusColor}`}>{statusLabel}</span></div>
              <div><p className="text-xs text-win-text-secondary">Дедлайн</p><p className={`text-sm ${task.is_overdue ? 'text-red-600 font-semibold' : ''}`}>{formatDate(task.deadline)}{task.is_overdue && ' (просрочено)'}</p></div>
              <div><p className="text-xs text-win-text-secondary">Исполнитель</p><p className="text-sm">{task.target_user_name} ({task.target_company_name})</p></div>
              <div><p className="text-xs text-win-text-secondary">Создатель</p><p className="text-sm">{task.creator_user_name} ({task.creator_company_name})</p></div>
            </div>
            {task.note && <div className="mt-4 pt-4 border-t border-win-border"><p className="text-xs text-win-text-secondary mb-1">Примечание</p><p className="text-sm whitespace-pre-wrap">{task.note}</p></div>}
          </div>

          {/* History */}
          {task.history.length > 0 && (
            <div className="win-card">
              <h3 className="text-sm font-semibold mb-4">История изменений</h3>
              <div className="space-y-3">
                {task.history.map((h) => (
                  <div key={h.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-win">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm"><span className="font-medium">{h.field}</span>: <span className="text-gray-500 line-through">{h.old_value || '—'}</span> → <span className="text-primary">{h.new_value}</span></p>
                      <p className="text-xs text-gray-400 mt-0.5">{h.user_name} • {formatDateTime(h.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {task.attachments.length > 0 && (
            <div className="win-card">
              <h3 className="text-sm font-semibold mb-4">Прикрепления</h3>
              <div className="space-y-2">
                {task.attachments.map((a) => (
                  <div key={a.id} className="p-2 bg-gray-50 rounded-win text-xs">
                    {a.document_name && <p>📄 {a.document_name}</p>}
                    {a.folder_name && <p>📁 {a.folder_name}</p>}
                    {a.declaration_number && <p>📋 {a.declaration_number}</p>}
                    {a.certificate_type && <p>🔖 {a.certificate_type}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="win-card">
            <h3 className="text-sm font-semibold mb-4">Даты</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-win-text-secondary">Создано</span><span>{formatDateTime(task.created_at)}</span></div>
              <div className="flex justify-between"><span className="text-win-text-secondary">Обновлено</span><span>{formatDateTime(task.updated_at)}</span></div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Удалить задачу" message={`Удалить задачу "${task.title}"?`} confirmText="Удалить" loading={deleting} />
    </div>
  )
}