import { useEffect, useState } from 'react'
import { employeesApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { EmployeeMember, EmployeesResponse } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import SelectDropdown from '@/components/ui/SelectDropdown'
import { getRoleLabel, getInitials } from '@/utils/helpers'
import toast from 'react-hot-toast'
import { HiOutlineUsers, HiOutlineBan, HiOutlineCheck, HiOutlineTrash, HiOutlineLockClosed, HiOutlineLockOpen } from 'react-icons/hi'

export default function EmployeesPage() {
  const { user } = useAuthStore()
  const isDirector = user?.role === 'director'
  const [data, setData] = useState<EmployeesResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const [blockUserId, setBlockUserId] = useState<number | null>(null)
  const [unblockUserId, setUnblockUserId] = useState<number | null>(null)
  const [blocking, setBlocking] = useState(false)

  const [removeUserId, setRemoveUserId] = useState<number | null>(null)
  const [transferToId, setTransferToId] = useState<number | null>(null)
  const [removing, setRemoving] = useState(false)

  useEffect(() => { loadEmployees() }, [])

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const res = await employeesApi.list()
      setData(res.data)
    } catch {} finally { setLoading(false) }
  }

  const handleBlock = async () => {
    if (!blockUserId) return
    setBlocking(true)
    try {
      await employeesApi.block(blockUserId)
      toast.success('Сотрудник заблокирован')
      setBlockUserId(null)
      loadEmployees()
    } catch {} finally { setBlocking(false) }
  }

  const handleUnblock = async (userId: number) => {
    try {
      await employeesApi.unblock(userId)
      toast.success('Сотрудник разблокирован')
      loadEmployees()
    } catch {}
  }

  const handleRemove = async () => {
    if (!removeUserId || !transferToId) { toast.error('Выберите кому передать данные'); return }
    setRemoving(true)
    try {
      await employeesApi.remove(removeUserId, { target_user_id: transferToId })
      toast.success('Сотрудник удалён, данные переданы')
      setRemoveUserId(null); setTransferToId(null)
      loadEmployees()
    } catch {} finally { setRemoving(false) }
  }

  const renderMember = (member: EmployeeMember, isMyCompany: boolean) => (
    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-win hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center overflow-hidden flex-shrink-0">
          {member.avatar_url ? (
            <img src={member.avatar_url} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-xs font-semibold">{getInitials(member.full_name)}</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-win-text">{member.full_name}</p>
            {member.role && <Badge variant={member.role === 'director' ? 'primary' : 'default'}>{getRoleLabel(member.role)}</Badge>}
            {member.is_blocked && <Badge variant="danger">Заблокирован</Badge>}
          </div>
          <p className="text-xs text-win-text-secondary">{member.email} • {member.phone}</p>
        </div>
      </div>

      {isDirector && isMyCompany && member.id !== user?.id && (
        <div className="flex items-center gap-1">
          {member.is_blocked ? (
            <button onClick={() => handleUnblock(member.id)} className="p-1.5 rounded hover:bg-green-50" title="Разблокировать">
              <HiOutlineLockOpen className="w-4 h-4 text-green-600" />
            </button>
          ) : (
            <button onClick={() => setBlockUserId(member.id)} className="p-1.5 rounded hover:bg-yellow-50" title="Заблокировать">
              <HiOutlineLockClosed className="w-4 h-4 text-yellow-600" />
            </button>
          )}
          <button onClick={() => setRemoveUserId(member.id)} className="p-1.5 rounded hover:bg-red-50" title="Удалить">
            <HiOutlineTrash className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}
    </div>
  )

  if (loading) return <LoadingSpinner fullPage />

  const myMembers = data?.my_company?.members || []
  const transferOptions = myMembers.filter((m) => m.id !== removeUserId && m.id !== user?.id).map((m) => ({ value: m.id, label: m.full_name }))

  return (
    <div>
      <PageHeader title="Мои сотрудники" subtitle="Коллеги и партнёры" />

      {/* My company */}
      <div className="win-card mb-6">
        <h3 className="text-sm font-semibold text-win-text mb-4 flex items-center gap-2">
          <HiOutlineUsers className="w-4 h-4 text-primary" /> Мои коллеги — {data?.my_company?.name}
        </h3>
        <div className="space-y-2">
          {myMembers.map((m) => renderMember(m, true))}
        </div>
      </div>

      {/* Partner companies */}
      {data?.partner_companies?.map((pc, idx) => (
        <div key={idx} className="win-card mb-4">
          <h3 className="text-sm font-semibold text-win-text mb-4">{pc.name}</h3>
          <div className="space-y-2">
            {pc.members.map((m) => renderMember(m, false))}
          </div>
        </div>
      ))}

      {/* Block confirm */}
      <ConfirmDialog isOpen={!!blockUserId} onClose={() => setBlockUserId(null)} onConfirm={handleBlock}
        title="Заблокировать сотрудника" message="Сотрудник будет автоматически выведен из аккаунта и не сможет войти."
        confirmText="Заблокировать" variant="danger" loading={blocking} />

      {/* Remove modal */}
      <Modal isOpen={!!removeUserId} onClose={() => { setRemoveUserId(null); setTransferToId(null) }}
        title="Удалить сотрудника" size="sm"
        footer={<>
          <button onClick={() => { setRemoveUserId(null); setTransferToId(null) }} className="win-btn-secondary">Отмена</button>
          <button onClick={handleRemove} disabled={removing || !transferToId} className="win-btn-danger disabled:opacity-50">
            {removing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Удалить'}
          </button>
        </>}>
        <div className="space-y-4">
          <p className="text-sm text-win-text-secondary">
            На кого передать все данные этого сотрудника? (декларации, сертификаты, документы, клиенты)
          </p>
          <SelectDropdown label="Передать данные" options={transferOptions} value={transferToId}
            onChange={(v) => setTransferToId(v as number | null)} placeholder="Выберите сотрудника" searchable />
        </div>
      </Modal>
    </div>
  )
}