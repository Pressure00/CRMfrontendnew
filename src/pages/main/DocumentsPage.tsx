import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { documentsApi, clientsApi, employeesApi } from '@/api'
import type { FolderShort, DocumentShort, ClientShort, EmployeeMember } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import SelectDropdown from '@/components/ui/SelectDropdown'
import SearchInput from '@/components/ui/SearchInput'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { formatDate, formatFileSize } from '@/utils/helpers'
import toast from 'react-hot-toast'
import {
  HiOutlineFolder, HiOutlineFolderAdd, HiOutlineDocumentAdd,
  HiOutlineTrash, HiOutlineDocument, HiOutlineArrowLeft,
} from 'react-icons/hi'

export default function DocumentsPage() {
  const { user } = useAuthStore()
  const isDirector = user?.role === 'director'

  const [folders, setFolders] = useState<FolderShort[]>([])
  const [documents, setDocuments] = useState<DocumentShort[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null)
  const [folderPath, setFolderPath] = useState<{ id: number | null; name: string }[]>([{ id: null, name: 'Документы' }])

  const [clientFilter, setClientFilter] = useState<number | null>(null)
  const [userFilter, setUserFilter] = useState<number | null>(null)
  const [searchFile, setSearchFile] = useState('')
  const [clients, setClients] = useState<{ value: number; label: string }[]>([])
  const [employees, setEmployees] = useState<{ value: number; label: string }[]>([])

  // Create folder
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [folderAccess, setFolderAccess] = useState('public')
  const [grantedUserIds, setGrantedUserIds] = useState<number[]>([])
  const [creatingFolder, setCreatingFolder] = useState(false)

  // Upload
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    clientsApi.list({ limit: 500 }).then((r) => setClients(r.data.map((c: ClientShort) => ({ value: c.id, label: c.company_name })))).catch(() => {})
    if (isDirector) {
      employeesApi.list().then((r) => {
        const m: EmployeeMember[] = r.data?.my_company?.members || []
        setEmployees(m.map((e) => ({ value: e.id, label: e.full_name })))
      }).catch(() => {})
    }
  }, [])

  useEffect(() => { loadContent() }, [currentFolderId, clientFilter, userFilter, searchFile])

  const loadContent = async () => {
    setLoading(true)
    try {
      const folderParams: any = {}
      if (currentFolderId) folderParams.parent_folder_id = currentFolderId
      if (clientFilter) folderParams.client_id = clientFilter
      if (userFilter) folderParams.user_id = userFilter

      const fileParams: any = {}
      if (currentFolderId) fileParams.folder_id = currentFolderId
      if (clientFilter) fileParams.client_id = clientFilter
      if (userFilter) fileParams.user_id = userFilter
      if (searchFile) fileParams.filename = searchFile

      const [fRes, dRes] = await Promise.all([
        documentsApi.listFolders(folderParams),
        documentsApi.listDocuments(fileParams),
      ])
      setFolders(fRes.data)
      setDocuments(dRes.data)
    } catch {} finally { setLoading(false) }
  }

  const navigateToFolder = (folderId: number, folderName: string) => {
    setCurrentFolderId(folderId)
    setFolderPath([...folderPath, { id: folderId, name: folderName }])
  }

  const navigateBack = () => {
    if (folderPath.length <= 1) return
    const newPath = folderPath.slice(0, -1)
    setFolderPath(newPath)
    setCurrentFolderId(newPath[newPath.length - 1].id)
  }

  const navigateToPathItem = (index: number) => {
    const newPath = folderPath.slice(0, index + 1)
    setFolderPath(newPath)
    setCurrentFolderId(newPath[newPath.length - 1].id)
  }

  const handleCreateFolder = async () => {
    if (!folderName) { toast.error('Введите имя папки'); return }
    setCreatingFolder(true)
    try {
      await documentsApi.createFolder({
        name: folderName, access_type: folderAccess,
        parent_folder_id: currentFolderId,
        granted_user_ids: folderAccess === 'private' ? grantedUserIds : [],
      })
      toast.success('Папка создана')
      setShowCreateFolder(false); setFolderName(''); setFolderAccess('public'); setGrantedUserIds([])
      loadContent()
    } catch {} finally { setCreatingFolder(false) }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      if (files.length === 1) {
        await documentsApi.uploadDocument(files[0], currentFolderId || undefined, clientFilter || undefined)
      } else {
        await documentsApi.uploadMultiple(Array.from(files), currentFolderId || undefined, clientFilter || undefined)
      }
      toast.success('Файлы загружены')
      loadContent()
    } catch {} finally { setUploading(false); e.target.value = '' }
  }

  const handleDeleteDoc = async (docId: number) => {
    try { await documentsApi.deleteDocument(docId); toast.success('Файл удалён'); loadContent() } catch {}
  }

  const handleDeleteFolder = async (folderId: number) => {
    try { await documentsApi.deleteFolder(folderId); toast.success('Папка удалена'); loadContent() } catch {}
  }

  return (
    <div>
      <PageHeader title="Документы" subtitle="Файлы и папки"
        actions={<div className="flex gap-2">
          <button onClick={() => setShowCreateFolder(true)} className="win-btn-secondary"><HiOutlineFolderAdd className="w-4 h-4" /> Папка</button>
          <label className={`win-btn-primary cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
            <HiOutlineDocumentAdd className="w-4 h-4" /> Загрузить
            <input type="file" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>}
      />

      {/* Filters & Breadcrumb */}
      <div className="win-card mb-4">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <SearchInput value={searchFile} onChange={setSearchFile} placeholder="Поиск файла..." className="w-56" />
          <SelectDropdown options={clients} value={clientFilter} onChange={(v) => setClientFilter(v as number | null)} placeholder="Клиент" clearable searchable className="w-48" />
          {isDirector && <SelectDropdown options={employees} value={userFilter} onChange={(v) => setUserFilter(v as number | null)} placeholder="Сотрудник" clearable searchable className="w-48" />}
        </div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm">
          {folderPath.map((p, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-400">/</span>}
              <button onClick={() => navigateToPathItem(i)} className={`hover:text-primary transition-colors ${i === folderPath.length - 1 ? 'text-win-text font-medium' : 'text-gray-500'}`}>{p.name}</button>
            </span>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner fullPage /> : (
        <div>
          {currentFolderId && (
            <button onClick={navigateBack} className="flex items-center gap-2 text-sm text-primary hover:underline mb-4">
              <HiOutlineArrowLeft className="w-4 h-4" /> Назад
            </button>
          )}

          {/* Folders */}
          {folders.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
              {folders.map((f) => (
                <div key={f.id} className="win-card p-4 cursor-pointer hover:shadow-win-hover transition-shadow group relative"
                  onClick={() => navigateToFolder(f.id, f.name)}>
                  <div className="flex flex-col items-center text-center">
                    <HiOutlineFolder className="w-10 h-10 text-yellow-500 mb-2" />
                    <p className="text-sm font-medium text-win-text truncate w-full">{f.name}</p>
                    <p className="text-[10px] text-gray-400">{f.documents_count} файлов</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f.id) }}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <HiOutlineTrash className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Files */}
          {documents.length > 0 ? (
            <div className="win-card p-0 overflow-hidden">
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b border-win-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Имя файла</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Размер</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Владелец</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-win-text-secondary uppercase">Дата</th>
                  <th className="w-10"></th>
                </tr></thead>
                <tbody className="divide-y divide-win-border">
                  {documents.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 flex items-center gap-2"><HiOutlineDocument className="w-4 h-4 text-gray-400 flex-shrink-0" /><span className="text-sm text-win-text truncate">{d.original_filename}</span></td>
                      <td className="px-4 py-3 text-xs text-win-text-secondary">{formatFileSize(d.file_size)}</td>
                      <td className="px-4 py-3 text-xs text-win-text-secondary">{d.user_name || '—'}</td>
                      <td className="px-4 py-3 text-xs text-win-text-secondary">{formatDate(d.created_at)}</td>
                      <td className="px-2"><button onClick={() => handleDeleteDoc(d.id)} className="p-1.5 rounded hover:bg-red-50"><HiOutlineTrash className="w-3.5 h-3.5 text-red-400" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : folders.length === 0 && (
            <EmptyState icon={HiOutlineFolder} title="Пусто" description="Загрузите файлы или создайте папку" />
          )}
        </div>
      )}

      {/* Create Folder Modal */}
      <Modal isOpen={showCreateFolder} onClose={() => setShowCreateFolder(false)} title="Создать папку" size="sm"
        footer={<><button onClick={() => setShowCreateFolder(false)} className="win-btn-secondary">Отмена</button>
          <button onClick={handleCreateFolder} disabled={creatingFolder} className="win-btn-primary disabled:opacity-50">
            {creatingFolder ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Создать'}
          </button></>}>
        <div className="space-y-4">
          <div><label className="win-label">Имя папки *</label><input type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)} className="win-input" placeholder="Название" /></div>
          <div>
            <label className="win-label">Доступность</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={folderAccess === 'public'} onChange={() => setFolderAccess('public')} className="text-primary focus:ring-primary" /> Общедоступный
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={folderAccess === 'private'} onChange={() => setFolderAccess('private')} className="text-primary focus:ring-primary" /> Только для себя
              </label>
            </div>
          </div>
          {folderAccess === 'private' && employees.length > 0 && (
            <div><label className="win-label">Дать доступ сотрудникам</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {employees.map((e) => (
                  <label key={e.value} className="flex items-center gap-2 text-sm cursor-pointer p-1 hover:bg-gray-50 rounded">
                    <input type="checkbox" checked={grantedUserIds.includes(e.value as number)}
                      onChange={(ev) => ev.target.checked ? setGrantedUserIds([...grantedUserIds, e.value as number]) : setGrantedUserIds(grantedUserIds.filter((id) => id !== e.value))}
                      className="rounded border-gray-300 text-primary focus:ring-primary" />{e.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}