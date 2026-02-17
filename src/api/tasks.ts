import apiClient from './client'
import type {
  TaskCreate,
  TaskUpdate,
  TaskResponse,
  TaskShort,
} from '@/types'

export const tasksApi = {
  create(data: TaskCreate) {
    return apiClient.post<TaskResponse>('/api/tasks/', data)
  },

  list(params?: {
    user_id?: number
    priority?: string
    status?: string
    date_from?: string
    date_to?: string
    target_company_id?: number
    my_only?: boolean
    skip?: number
    limit?: number
  }) {
    return apiClient.get<TaskShort[]>('/api/tasks/', { params })
  },

  get(taskId: number) {
    return apiClient.get<TaskResponse>(`/api/tasks/${taskId}`)
  },

  update(taskId: number, data: TaskUpdate) {
    return apiClient.put<TaskResponse>(`/api/tasks/${taskId}`, data)
  },

  delete(taskId: number) {
    return apiClient.delete(`/api/tasks/${taskId}`)
  },
}