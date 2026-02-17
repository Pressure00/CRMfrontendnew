import apiClient from './client'
import type {
  CertificateCreate,
  CertificateUpdate,
  CertificateResponse,
  CertificateShort,
  CertificateStatusUpdate,
} from '@/types'

export const certificatesApi = {
  create(data: CertificateCreate) {
    return apiClient.post<CertificateResponse>('/api/certificates/', data)
  },

  list(params?: {
    certifier_company_id?: number
    declarant_company_id?: number
    certificate_number?: string
    client_id?: number
    status?: string
    date_from?: string
    date_to?: string
    user_id?: number
    my_only?: boolean
    skip?: number
    limit?: number
  }) {
    return apiClient.get<CertificateShort[]>('/api/certificates/', { params })
  },

  get(certificateId: number) {
    return apiClient.get<CertificateResponse>(`/api/certificates/${certificateId}`)
  },

  update(certificateId: number, data: CertificateUpdate) {
    return apiClient.put<CertificateResponse>(`/api/certificates/${certificateId}`, data)
  },

  delete(certificateId: number) {
    return apiClient.delete(`/api/certificates/${certificateId}`)
  },

  updateStatus(certificateId: number, data: CertificateStatusUpdate) {
    return apiClient.post(`/api/certificates/${certificateId}/status`, data)
  },

  fillNumber(certificateId: number, certificateNumber: string) {
    return apiClient.post(`/api/certificates/${certificateId}/fill-number`, {
      certificate_number: certificateNumber,
    })
  },

  assign(certificateId: number, assignedUserId: number) {
    return apiClient.post(`/api/certificates/${certificateId}/assign`, {
      assigned_user_id: assignedUserId,
    })
  },

  redirect(certificateId: number, targetUserId: number) {
    return apiClient.post(`/api/certificates/${certificateId}/redirect`, {
      target_user_id: targetUserId,
    })
  },

  confirmReview(certificateId: number) {
    return apiClient.post(`/api/certificates/${certificateId}/confirm-review`)
  },

  confirmPayment(certificateId: number) {
    return apiClient.post(`/api/certificates/${certificateId}/confirm-payment`)
  },

  uploadFile(certificateId: number, file: File, fileType: string) {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post(
      `/api/certificates/${certificateId}/upload-file?file_type=${fileType}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  },
}