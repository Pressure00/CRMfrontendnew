import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '@/api/admin'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Modal from '@/components/ui/Modal'
import { formatDateTime, getActivityLabel, getRoleLabel } from '@/utils/helpers'
import toast from 'react-hot-toast'
import { HiOutlineArrowLeft, HiOutlineBan, HiOutlineCheck, HiOutlineTrash, HiOutlineMail } from 'react-icons/hi'

export default function AdminCompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [blocking, setBlocking] = useState(false)

  const [showMessage, setShowMessage] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)

  useEffect(() => { loadCompany() }, [id])

  const loadCompany = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await adminApi.getCompanyDetail(parseInt(id))
      console.log('Company detail:', res.data)
      setCompany(res.data)
    }
    catch (err) {
      console.error(err)
      navigate('/admin/companies')
    }
    finally { setLoading(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await adminApi.deleteCompany(parseInt(id!)); toast.success('Фирма удалена'); navigate('/admin/companies') }
    catch (err) { console.error(err); toast.error('Ошибка удаления') }
    finally { setDeleting(false) }
  }

  const handleBlock = async () => {
    setBlocking(true)
    try {
      if (company.is_blocked) {
        await adminApi.unblockCompany(parseInt(id!))
        toast.success('Разблокировано')
      } else {
        await adminApi.blockCompany(parseInt(id!))
        toast.success('Заблокировано')
      }
      await loadCompany()
    } catch (err) {
      console.error(err)
      toast.error('Ошибка при смене статуса')
    } finally { setBlocking(false) }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) return
    setSendingMsg(true)
    try { await adminApi.sendMessageToCompany(parseInt(id!), { message: messageText }); toast.success('Сообщение отправлено'); setShowMessage(false); setMessageText('') }
    catch { } finally { setSendingMsg(false) }
  }

  if (loading) return <LoadingSpinner fullPage />
  if (!company) return null

  return (
    <div>
      <PageHeader title={company.name} subtitle={`ИНН: ${company.inn}`}
        actions={<div className="flex gap-2">
          <button onClick={() => navigate('/admin/companies')} className="win-btn-secondary"><HiOutlineArrowLeft className="w-4 h-4" /> Назад</button>
          <button onClick={() => setShowMessage(true)} className="win-btn-secondary"><HiOutlineMail className="w-4 h-4" /> Сообщение</button>
          <button onClick={handleBlock} disabled={blocking} className="win-btn-secondary">
            {company.is_blocked ? <><HiOutlineCheck className="w-4 h-4" /> Разблокировать</> : <><HiOutlineBan className="w-4 h-4" /> Заблокировать</>}
          </button>
          <button onClick={() => setShowDelete(true)} className="win-btn-danger"><HiOutlineTrash className="w-4 h-4" /> Удалить</button>
        </div>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="win-card">
          <h3 className="text-sm font-semibold mb-4">Информация</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs text-win-text-secondary">Название</p><p className="font-medium">{company.name}</p></div>
            <div><p className="text-xs text-win-text-secondary">ИНН</p><p>{company.inn}</p></div>
            <div><p className="text-xs text-win-text-secondary">Деятельность</p><Badge>{getActivityLabel(company.activity_type)}</Badge></div>
            <div><p className="text-xs text-win-text-secondary">Статус</p>
              {company.is_blocked ? <Badge variant="danger">Заблокирована</Badge> : company.is_active ? <Badge variant="success">Активна</Badge> : <Badge variant="warning">Неактивна</Badge>}
            </div>
            <div><p className="text-xs text-win-text-secondary">Директор</p><p>{company.director_name || '—'}</p></div>
            <div><p className="text-xs text-win-text-secondary">Дата регистрации</p><p>{formatDateTime(company.created_at)}</p></div>
          </div>
        </div>

        <div className="win-card">
          <h3 className="text-sm font-semibold mb-4">Сотрудники ({company.members?.length || 0})</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {(company.members || []).map((m: any) => (
              <div key={m.id} className="p-2 bg-gray-50 rounded-win flex justify-between items-center cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`/admin/users/${m.id}`)}>
                <div><p className="text-sm font-medium">{m.full_name}</p><p className="text-xs text-gray-500">{m.email}</p></div>
                <Badge variant={m.role === 'director' ? 'primary' : 'default'}>{getRoleLabel(m.role)}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Удалить фирму"
        message="Удалить фирму и всех сотрудников?" confirmText="Удалить" loading={deleting} />

      <Modal isOpen={showMessage} onClose={() => setShowMessage(false)} title="Сообщение директору" size="sm"
        footer={<><button onClick={() => setShowMessage(false)} className="win-btn-secondary">Отмена</button>
          <button onClick={handleSendMessage} disabled={sendingMsg} className="win-btn-primary disabled:opacity-50">Отправить</button></>}>
        <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} className="win-input min-h-[100px] resize-y" placeholder="Сообщение..." />
      </Modal>
    </div>
  )
}