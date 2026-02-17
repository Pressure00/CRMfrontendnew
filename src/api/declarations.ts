import apiClient from './client'
import type {
  DeclarationCreate,
  DeclarationUpdate,
  DeclarationResponse,
  DeclarationShort,
  DeclarationGroupCreate,
  DeclarationGroupResponse,
} from '@/types'

export const declarationsApi = {
  create(data: DeclarationCreate) {
    return apiClient.post<DeclarationResponse>('/api/declarations/', data)
  },

  list(params?: {
    user_id?: number
    post_number?: string
    date_from?: string
    date_to?: string
    declaration_number?: string
    client_id?: number
    regime?: string
    vehicle_number?: string
    vehicle_type?: string
    group_id?: number
    my_only?: boolean
    skip?: number
    limit?: number
  }) {
    return apiClient.get<DeclarationShort[]>('/api/declarations/', { params })
  },

  get(declarationId: number) {
    return apiClient.get<DeclarationResponse>(`/api/declarations/${declarationId}`)
  },

  update(declarationId: number, data: DeclarationUpdate) {
    return apiClient.put<DeclarationResponse>(`/api/declarations/${declarationId}`, data)
  },

  delete(declarationId: number) {
    return apiClient.delete(`/api/declarations/${declarationId}`)
  },

  redirect(declarationId: number, targetUserId: number) {
    return apiClient.post(`/api/declarations/${declarationId}/redirect`, { target_user_id: targetUserId })
  },

  // Groups
  createGroup(data: DeclarationGroupCreate) {
    return apiClient.post<DeclarationGroupResponse>('/api/declarations/groups', data)
  },

  addToGroup(declarationId: number, groupId: number) {
    return apiClient.post(`/api/declarations/${declarationId}/add-to-group`, { group_id: groupId })
  },

  removeFromGroup(declarationId: number) {
    return apiClient.post(`/api/declarations/${declarationId}/remove-from-group`)
  },

  listGroups() {
    return apiClient.get<DeclarationGroupResponse[]>('/api/declarations/groups/list')
  },

  deleteGroup(groupId: number) {
    return apiClient.delete(`/api/declarations/groups/${groupId}`)
  },
}