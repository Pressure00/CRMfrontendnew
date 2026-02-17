import apiClient from './client'
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  AdminLoginRequest,
  TokenResponse,
  CompanySetupCreate,
  CompanySetupJoin,
  CompanyLookupResponse,
  UserResponse,
  ForgotPasswordRequest,
} from '@/types'

export const authApi = {
  register(data: RegisterRequest) {
    return apiClient.post<RegisterResponse>('/api/auth/register', data)
  },

  login(data: LoginRequest) {
    return apiClient.post<TokenResponse>('/api/auth/login', data)
  },

  adminLogin(data: AdminLoginRequest) {
    return apiClient.post<TokenResponse>('/api/auth/admin/login', data)
  },

  lookupCompany(data: CompanySetupJoin) {
    return apiClient.post<CompanyLookupResponse>('/api/auth/company/lookup', data)
  },

  createCompany(data: CompanySetupCreate) {
    return apiClient.post('/api/auth/company/create', data)
  },

  joinCompany(data: CompanySetupJoin) {
    return apiClient.post('/api/auth/company/join', data)
  },

  getMe() {
    return apiClient.get<UserResponse>('/api/auth/me')
  },

  getCompanyStatus() {
    return apiClient.get<{ status: string }>('/api/auth/me/company-status')
  },

  forgotPassword(data: ForgotPasswordRequest) {
    return apiClient.post('/api/auth/forgot-password', data)
  },
}