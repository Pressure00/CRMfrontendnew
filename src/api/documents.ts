import apiClient from './client'
import type {
  FolderCreate,
  FolderUpdate,
  FolderResponse,
  FolderShort,
  DocumentResponse,
  DocumentShort,
} from '@/types'

export const documentsApi = {
  // Folders
  createFolder(data: FolderCreate) {
    return apiClient.post<FolderResponse>('/api/documents/folders', data)
  },

  listFolders(params?: {
    parent_folder_id?: number
    client_id?: number
    user_id?: number
    skip?: number
    limit?: number
  }) {
    return apiClient.get<FolderShort[]>('/api/documents/folders', { params })
  },

  getFolder(folderId: number) {
    return apiClient.get<FolderResponse>(`/api/documents/folders/${folderId}`)
  },

  updateFolder(folderId: number, data: FolderUpdate) {
    return apiClient.put<FolderResponse>(`/api/documents/folders/${folderId}`, data)
  },

  deleteFolder(folderId: number) {
    return apiClient.delete(`/api/documents/folders/${folderId}`)
  },

  attachFolderToClient(folderId: number, clientId: number) {
    return apiClient.post(`/api/documents/folders/${folderId}/attach-client`, {
      client_id: clientId,
    })
  },

  // Files
  uploadDocument(file: File, folderId?: number, clientId?: number) {
    const formData = new FormData()
    formData.append('file', file)
    if (folderId) formData.append('folder_id', folderId.toString())
    if (clientId) formData.append('client_id', clientId.toString())
    return apiClient.post<DocumentResponse>('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadMultiple(files: File[], folderId?: number, clientId?: number) {
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    if (folderId) formData.append('folder_id', folderId.toString())
    if (clientId) formData.append('client_id', clientId.toString())
    return apiClient.post('/api/documents/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  listDocuments(params?: {
    folder_id?: number
    client_id?: number
    user_id?: number
    filename?: string
    skip?: number
    limit?: number
  }) {
    return apiClient.get<DocumentShort[]>('/api/documents/files', { params })
  },

  getDocument(documentId: number) {
    return apiClient.get<DocumentResponse>(`/api/documents/files/${documentId}`)
  },

  deleteDocument(documentId: number) {
    return apiClient.delete(`/api/documents/files/${documentId}`)
  },

  moveDocument(documentId: number, folderId: number | null) {
    return apiClient.post(`/api/documents/files/${documentId}/move`, { folder_id: folderId })
  },

  attachDocumentToClient(documentId: number, clientId: number) {
    return apiClient.post(`/api/documents/files/${documentId}/attach-client`, {
      client_id: clientId,
    })
  },
}