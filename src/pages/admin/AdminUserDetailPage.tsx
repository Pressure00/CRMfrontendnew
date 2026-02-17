import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '@/api/admin'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Modal from '@/components/ui/Modal'
import SelectDropdown from '@/components/ui/SelectDropdown'
import { formatDateTime, getActivityLabel, getRoleLabel } from '@/utils/helpers'
import { USER_ROLES } from '@/constants'
import toast from 'react-hot-toast'
import { HiOutlineArrowLeft, HiOutlineBan, HiOutlineCheck, HiOutlineTrash, HiOutlineMail, HiOutlineUserAdd } from 'react-icons/hi'

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [userDetail, setUserDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [blocking, setBlocking] = useState(false)

  const [showMessage, setShowMessage] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)

  const [showRole, setShowRole] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [assigningRole, setAssigningRole] = useState(false)

  useEffect(() => { loadUser() }, [id])

  const loadUser = async () => {
    if (!id) return
    setLoading(true)
    try { const res = await adminApi.getUserDetail(parseInt(id)); setUserDetail(res.data) }
    catch { navigate('/admin/users') }
    finally { setLoading(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await adminApi.deleteUser(parseInt(id!)); toast.success('Пользователь удалён'); navigate('/admin/users') }
    catch {} finally { setDeleting(false) }
  }

  const handleBlock = async () => {
    setBlocking(true)
    try {
      if (userDetail.is_blocked) { await adminApi.unblockUser(parseInt(id!)); toast.success('Разблокирован') }
      else { await adminApi.blockUser(parseInt(id!)); toast.success('Заблокирован') }
      loadUser()
    } catch {} finally { setBlocking(false) }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) return
    setSendingMsg(true)
    try { await adminApi.sendMessageToUser(parseInt(id!), { message: messageText }); toast.success('Отправлено'); setShowMessage(false); setMessageText('') }
    catch {} finally { setSendingMsg(false) }
  }

  const handleAssignRole = async () => {
    if (!selectedRole) return
    setAssigningRole(true)
    try {
      await adminApi.assignRole(parseInt(id!), { user_id: parseInt(id!), role: selectedRole })
      toast.success(`Роль назначена: ${getRoleLabel(selectedRole)}`)
      setShowRole(false)
      loadUser()
    } catch {} finally { setAssigningRole(false) }
  }

  if (loading) return <LoadingSpinner fullPage />
  if (!userDetail) return null

  return (
    <div>
      <PageHeader title={userDetail.full_name} subtitle={userDetail.email}
        actions={<div className="flex gap-2">
          <button onClick={() => navigate('/admin/users')} className="win-btn-secondary"><HiOutlineArrowLeft className="w-4 h-4" /> Назад</button>
          <button onClick={() => setShowRole(true)} className="win-btn-secondary"><HiOutlineUserAdd className="w-4 h-4" /> Назначить роль</button>
          <button onClick={() => setShowMessage(true)} className="win-btn-secondary"><HiOutlineMail className="w-4 h-4" /> Сообщение</button>
          <button onClick={handleBlock} disabled={blocking} className="win-btn-secondary">
            {userDetail.is_blocked ? <><HiOutlineCheck className="w-4 h-4" /> Разблокировать</> : <><HiOutlineBan className="w-4 h-4" /> Заблокировать</>}
          </button>
          <button onClick={() => setShowDelete(true)} className="win-btn-danger"><HiOutlineTrash className="w-4 h-4" /> Удалить</button>
        </div>}
      />

      <div className="win-card">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div><p className="text-xs text-win-text-secondary">Имя</p><p className="font-medium">{userDetail.full_name}</p></div>
          <div><p className="text-xs text-win-text-secondary">Email</p><p>{userDetail.email}</p></div>
          <div><p className="text-xs text-win-text-secondary">Телефон</p><p>{userDetail.phone}</p></div>
          <div><p className="text-xs text-win-text-secondary">Деятельность</p><Badge>{getActivityLabel(userDetail.activity_type)}</Badge></div>
          <div><p className="text-xs text-win-text-secondary">Роль</p><Badge variant="primary">{getRoleLabel(userDetail.role)}</Badge></div>
          <div><p className="text-xs text-win-text-secondary">Фирма</p><p>{userDetail.company_name || '—'}</p></div>
          <div><p className="text-xs text-win-text-secondary">Статус</p>
            {userDetail.is_blocked ? <Badge variant="danger">Заблокирован</Badge> : userDetail.is_active ? <Badge variant="success">Активен</Badge> : <Badge variant="warning">Неактивен</Badge>}
          </div>
          <div><p className="text-xs text-win-text-secondary">Telegram</p><p>{userDetail.telegram_chat_id || 'Не подключен'}</p></div>
          <div><p className="text-xs text-win-text-secondary">Дата регистрации</p><p>{formatDateTime(userDetail.created_at)}</p></div>
        </div>
      </div>

      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Удалить пользователя"
        message="Удалить этого пользователя?" confirmText="Удалить" loading={deleting} />

      <Modal isOpen={showMessage} onClose={() => setShowMessage(false)} title="Сообщение пользователю" size="sm"
        footer={<><button onClick={() => setShowMessage(false)} className="win-btn-secondary">Отмена</button>
          <button onClick={handleSendMessage} disabled={sendingMsg} className="win-btn-primary disabled:opacity-50">Отправить</button></>}>
        <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} className="win-input min-h-[100px] resize-y" placeholder="Сообщение..." />
      </Modal>

      <Modal isOpen={showRole} onClose={() => setShowRole(false)} title="Назначить роль" size="sm"
        footer={<><button onClick={() => setShowRole(false)} className="win-btn-secondary">Отмена</button>
          <button onClick={handleAssignRole} disabled={assigningRole || !selectedRole} className="win-btn-primary disabled:opacity-50">
            {assigningRole ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Назначить'}
          </button></>}>
        <SelectDropdown label="Роль" options={USER_ROLES.map((r) => ({ value: r.value, label: r.label }))}
          value={selectedRole} onChange={(v) => setSelectedRole(v as string | null)} placeholder="Выберите роль" />
      </Modal>
    </div>
  )
}