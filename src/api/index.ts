import apiClient from './client'
import type {
  ClientCreate,
  ClientUpdate,
  ClientResponse,
  ClientShort,
  PartnershipRequest,
  PartnershipLookup,
  PartnerCompanyResponse,
  PartnershipResponse,
  RequestResponse,
  RequestAction,
  MessageToAdmin,
  NotificationList,
  SoundToggle,
  UserResponse,
  UserUpdate,
  PasswordChange,
  EmailChange,
  TransferDataRequest,
  DashboardDeclarant,
  DashboardCertifier,
} from '@/types'

// Re-export all sub-apis
export { authApi } from './auth'
export { adminApi } from './admin'
export { declarationsApi } from './declarations'
export { certificatesApi } from './certificates'
export { tasksApi } from './tasks'
export { documentsApi } from './documents'

// Clients
export const clientsApi = {
  create(data: ClientCreate) {
    return apiClient.post<ClientResponse>('/api/clients/', data)
  },
  list(params?: { company_name?: string; inn?: string; user_id?: number; skip?: number; limit?: number }) {
    return apiClient.get<ClientShort[]>('/api/clients/', { params })
  },
  get(clientId: number) {
    return apiClient.get<ClientResponse>(`/api/clients/${clientId}`)
  },
  update(clientId: number, data: ClientUpdate) {
    return apiClient.put<ClientResponse>(`/api/clients/${clientId}`, data)
  },
  delete(clientId: number) {
    return apiClient.delete(`/api/clients/${clientId}`)
  },
  getActivity(clientId: number) {
    return apiClient.get(`/api/clients/${clientId}/activity`)
  },
}

// Partnerships
export const partnershipsApi = {
  lookup(data: PartnershipRequest) {
    return apiClient.post<PartnershipLookup>('/api/partnerships/lookup', data)
  },
  sendRequest(data: PartnershipRequest) {
    return apiClient.post('/api/partnerships/request', data)
  },
  list() {
    return apiClient.get<PartnerCompanyResponse[]>('/api/partnerships/')
  },
  listPending() {
    return apiClient.get<PartnershipResponse[]>('/api/partnerships/pending')
  },
  delete(partnershipId: number) {
    return apiClient.delete(`/api/partnerships/${partnershipId}`)
  },
}

// Requests (Director)
export const requestsApi = {
  list(params?: { type?: string; status?: string; skip?: number; limit?: number }) {
    return apiClient.get<RequestResponse[]>('/api/requests/', { params })
  },
  handleRequest(requestId: number, data: RequestAction) {
    return apiClient.post(`/api/requests/${requestId}/action`, data)
  },
  sendMessageToAdmin(data: MessageToAdmin) {
    return apiClient.post('/api/requests/message-to-admin', data)
  },
}

// Employees
export const employeesApi = {
  list() {
    return apiClient.get('/api/employees/')
  },
  block(userId: number) {
    return apiClient.post(`/api/employees/${userId}/block`)
  },
  unblock(userId: number) {
    return apiClient.post(`/api/employees/${userId}/unblock`)
  },
  remove(userId: number, data: TransferDataRequest) {
    return apiClient.delete(`/api/employees/${userId}`, { data })
  },
}

// Notifications
export const notificationsApi = {
  list(params?: { unread_only?: boolean; skip?: number; limit?: number }) {
    return apiClient.get<NotificationList>('/api/notifications/', { params })
  },
  getUnreadCount() {
    return apiClient.get<{ count: number }>('/api/notifications/unread-count')
  },
  markRead(notificationIds?: number[]) {
    return apiClient.post('/api/notifications/mark-read', { notification_ids: notificationIds || null })
  },
  markSingleRead(notificationId: number) {
    return apiClient.post(`/api/notifications/${notificationId}/read`)
  },
  delete(notificationId: number) {
    return apiClient.delete(`/api/notifications/${notificationId}`)
  },
  clearAll() {
    return apiClient.delete('/api/notifications/')
  },
  toggleSound(data: SoundToggle) {
    return apiClient.post('/api/notifications/sound', data)
  },
  getSoundStatus() {
    return apiClient.get('/api/notifications/sound-status')
  },
}

// Settings
export const settingsApi = {
  getProfile() {
    return apiClient.get<UserResponse>('/api/settings/profile')
  },
  updateProfile(data: UserUpdate) {
    return apiClient.put('/api/settings/profile', data)
  },
  uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/api/settings/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteAvatar() {
    return apiClient.delete('/api/settings/avatar')
  },
  requestPasswordChange(data: PasswordChange) {
    return apiClient.post('/api/settings/change-password/request', data)
  },
  confirmPasswordChange(code: string) {
    return apiClient.post(`/api/settings/change-password/confirm?code=${code}`)
  },
  requestEmailChange(data: EmailChange) {
    return apiClient.post('/api/settings/change-email/request', data)
  },
  confirmEmailChange(code: string) {
    return apiClient.post(`/api/settings/change-email/confirm?code=${code}`)
  },
  linkTelegram(telegramChatId: string) {
    return apiClient.post(`/api/settings/link-telegram?telegram_chat_id=${telegramChatId}`)
  },
}

// Dashboard
export const dashboardApi = {
  declarant(params?: { date_from?: string; date_to?: string; user_id?: number }) {
    return apiClient.get<DashboardDeclarant>('/api/dashboard/declarant', { params })
  },
  certifier(params?: { date_from?: string; date_to?: string; user_id?: number }) {
    return apiClient.get<DashboardCertifier>('/api/dashboard/certifier', { params })
  },
}