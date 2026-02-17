import apiClient from './client'
import type {
  DashboardAdmin,
  CompanyAdminView,
  UserAdminView,
  RequestResponse,
  RequestAction,
  AdminMessageRequest,
  AssignRoleRequest,
} from '@/types'

export const adminApi = {
  getDashboard() {
    return apiClient.get<DashboardAdmin>('/api/admin/dashboard')
  },

  // Companies
  listCompanies(params?: {
    search?: string
    activity_type?: string
    is_active?: boolean
    skip?: number
    limit?: number
  }) {
    return apiClient.get<CompanyAdminView[]>('/api/admin/companies', { params })
  },

  getCompanyDetail(companyId: number) {
    return apiClient.get(`/api/admin/companies/${companyId}`)
  },

  deleteCompany(companyId: number) {
    return apiClient.delete(`/api/admin/companies/${companyId}`)
  },

  blockCompany(companyId: number) {
    return apiClient.post(`/api/admin/companies/${companyId}/block`)
  },

  unblockCompany(companyId: number) {
    return apiClient.post(`/api/admin/companies/${companyId}/unblock`)
  },

  sendMessageToCompany(companyId: number, data: AdminMessageRequest) {
    return apiClient.post(`/api/admin/companies/${companyId}/message`, data)
  },

  // Users
  listUsers(params?: {
    search?: string
    activity_type?: string
    company_id?: number
    skip?: number
    limit?: number
  }) {
    return apiClient.get<UserAdminView[]>('/api/admin/users', { params })
  },

  getUserDetail(userId: number) {
    return apiClient.get(`/api/admin/users/${userId}`)
  },

  deleteUser(userId: number) {
    return apiClient.delete(`/api/admin/users/${userId}`)
  },

  blockUser(userId: number) {
    return apiClient.post(`/api/admin/users/${userId}/block`)
  },

  unblockUser(userId: number) {
    return apiClient.post(`/api/admin/users/${userId}/unblock`)
  },

  sendMessageToUser(userId: number, data: AdminMessageRequest) {
    return apiClient.post(`/api/admin/users/${userId}/message`, data)
  },

  assignRole(userId: number, data: AssignRoleRequest) {
    return apiClient.post(`/api/admin/users/${userId}/assign-role`, data)
  },

  // Requests
  listRequests(params?: {
    type?: string
    status?: string
    skip?: number
    limit?: number
  }) {
    return apiClient.get<RequestResponse[]>('/api/admin/requests', { params })
  },

  handleRequest(requestId: number, data: RequestAction) {
    return apiClient.post(`/api/admin/requests/${requestId}/action`, data)
  },
}