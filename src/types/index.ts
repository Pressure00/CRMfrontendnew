// ============ Auth ============
export interface RegisterRequest {
  full_name: string
  email: string
  phone: string
  activity_type: 'declarant' | 'certification'
  password: string
}

export interface RegisterResponse {
  message: string
  user_id: number
  needs_company_setup: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AdminLoginRequest {
  login: string
  password: string
  code: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user_id: number
  is_admin: boolean
}

export interface CompanySetupCreate {
  name: string
  inn: string
}

export interface CompanySetupJoin {
  inn: string
}

export interface CompanyLookupResponse {
  found: boolean
  company_name: string | null
  company_id: number | null
}

export interface ForgotPasswordRequest {
  email: string
}

// ============ User ============
export interface UserResponse {
  id: number
  full_name: string
  email: string
  phone: string
  activity_type: string
  avatar_url: string | null
  sound_enabled: boolean
  is_active: boolean
  created_at: string
  company_id: number | null
  company_name: string | null
  company_inn: string | null
  role: string | null
}

export interface UserAdminView {
  id: number
  full_name: string
  email: string
  phone: string
  activity_type: string
  avatar_url: string | null
  is_active: boolean
  created_at: string
  company_id: number | null
  company_name: string | null
  role: string | null
  is_blocked: boolean
  telegram_chat_id: string | null
}

export interface UserUpdate {
  full_name?: string | null
  phone?: string | null
}

// ============ Company ============
export interface CompanyAdminView {
  id: number
  name: string
  inn: string
  activity_type: string
  is_active: boolean
  is_blocked: boolean
  created_at: string
  members_count: number
  director_name: string | null
  director_phone: string | null
}

// ============ Dashboard ============
export interface GrowthPoint {
  date: string
  count: number
}

export interface DashboardAdmin {
  total_companies: number
  total_users: number
  active_requests: number
  companies_growth: GrowthPoint[]
  users_growth: GrowthPoint[]
  recent_requests: Record<string, unknown>[]
}

export interface DashboardDeclarant {
  active_tasks: number
  completed_tasks: number
  overdue_tasks: number
  sent_declarations: number
  in_progress_certificates: number
  completed_certificates: number
  overdue_certificates: number
  recent_declarations: DeclarationShortDash[]
  recent_certificates: CertificateShortDash[]
  date_from: string | null
  date_to: string | null
  selected_user_id: number | null
  selected_user_name: string | null
}

export interface DashboardCertifier {
  active_tasks: number
  completed_tasks: number
  overdue_tasks: number
  in_progress_certificates: number
  completed_certificates: number
  overdue_certificates: number
  recent_in_progress: CertificateShortDash[]
  recent_overdue: CertificateShortDash[]
  date_from: string | null
  date_to: string | null
  selected_user_id: number | null
  selected_user_name: string | null
}

// ============ Declarations ============
export interface DeclarationVehicle {
  vehicle_type: string
  vehicle_number: string
}

export interface DeclarationVehicleResponse extends DeclarationVehicle {
  id: number
}

export interface DeclarationCreate {
  post_number: string
  send_date: string
  declaration_number: string
  client_id: number
  regime: string
  vehicles: DeclarationVehicle[]
  note?: string | null
  attachment_document_ids?: number[]
  attachment_folder_ids?: number[]
}

export interface DeclarationUpdate {
  post_number?: string | null
  send_date?: string | null
  declaration_number?: string | null
  client_id?: number | null
  regime?: string | null
  vehicles?: DeclarationVehicle[] | null
  note?: string | null
  attachment_document_ids?: number[] | null
  attachment_folder_ids?: number[] | null
}

export interface DeclarationAttachmentResponse {
  id: number
  document_id: number | null
  folder_id: number | null
  document_name: string | null
  folder_name: string | null
}

export interface DeclarationResponse {
  id: number
  post_number: string
  send_date: string
  declaration_number: string
  display_number: string
  client_id: number
  client_name: string | null
  regime: string
  note: string | null
  company_id: number
  user_id: number
  user_name: string | null
  group_id: number | null
  group_name: string | null
  vehicles: DeclarationVehicleResponse[]
  attachments: DeclarationAttachmentResponse[]
  created_at: string
  updated_at: string
  certificates_count: number
  tasks_count: number
}

export interface DeclarationShort {
  id: number
  display_number: string
  client_name: string | null
  regime: string
  user_name: string | null
  group_id: number | null
  group_name: string | null
  created_at: string
}

export interface DeclarationShortDash {
  id: number
  display_number: string
  client_name: string | null
  regime: string
  created_at: string
}

export interface DeclarationGroupCreate {
  name: string
  declaration_ids: number[]
}

export interface DeclarationGroupResponse {
  id: number
  name: string
  declarations: DeclarationShort[]
  created_at: string
}

// ============ Certificates ============
export interface CertificateCreate {
  certifier_company_id?: number | null
  is_self: boolean
  certificate_type: string
  deadline: string
  certificate_number?: string | null
  is_number_by_certifier: boolean
  client_id: number
  declaration_ids?: number[]
  note?: string | null
  attachment_document_ids?: number[]
  attachment_folder_ids?: number[]
}

export interface CertificateUpdate {
  certifier_company_id?: number | null
  is_self?: boolean | null
  certificate_type?: string | null
  deadline?: string | null
  certificate_number?: string | null
  is_number_by_certifier?: boolean | null
  client_id?: number | null
  declaration_ids?: number[] | null
  note?: string | null
  attachment_document_ids?: number[] | null
  attachment_folder_ids?: number[] | null
}

export interface CertificateFileResponse {
  id: number
  file_path: string
  original_filename: string
  file_type: string
  uploaded_by: number
  uploader_name: string | null
  created_at: string
}

export interface CertificateActionResponse {
  id: number
  action: string
  description: string | null
  old_value: string | null
  new_value: string | null
  user_id: number
  user_name: string | null
  created_at: string
}

export interface CertificateAttachmentResponse {
  id: number
  document_id: number | null
  folder_id: number | null
  document_name: string | null
  folder_name: string | null
}

export interface CertificateDeclarationResponse {
  id: number
  declaration_id: number
  display_number: string | null
}

export interface CertificateResponse {
  id: number
  certifier_company_id: number | null
  certifier_company_name: string | null
  is_self: boolean
  certificate_type: string
  deadline: string
  certificate_number: string | null
  is_number_by_certifier: boolean
  client_id: number
  client_name: string | null
  note: string | null
  status: string
  rejection_note: string | null
  send_date: string
  declarant_company_id: number
  declarant_company_name: string | null
  declarant_user_id: number
  declarant_user_name: string | null
  assigned_user_id: number | null
  assigned_user_name: string | null
  files: CertificateFileResponse[]
  attachments: CertificateAttachmentResponse[]
  declarations: CertificateDeclarationResponse[]
  actions: CertificateActionResponse[]
  created_at: string
  updated_at: string
}

export interface CertificateShort {
  id: number
  certificate_type: string
  certificate_number: string | null
  status: string
  deadline: string
  client_name: string | null
  certifier_company_name: string | null
  declarant_company_name: string | null
  declarant_user_name: string | null
  assigned_user_name: string | null
  send_date: string
}

export interface CertificateShortDash {
  id: number
  certificate_type: string
  certificate_number: string | null
  status: string
  deadline: string
  certifier_company_name: string | null
  declarant_company_name: string | null
  send_date: string
}

export interface CertificateStatusUpdate {
  status: string
  rejection_note?: string | null
}

// ============ Tasks ============
export interface TaskCreate {
  target_company_id: number
  target_user_id: number
  title: string
  note?: string | null
  priority: string
  status: string
  deadline: string
  attachment_document_ids?: number[]
  attachment_folder_ids?: number[]
  attachment_declaration_ids?: number[]
  attachment_certificate_ids?: number[]
}

export interface TaskUpdate {
  title?: string | null
  note?: string | null
  priority?: string | null
  status?: string | null
  deadline?: string | null
  attachment_document_ids?: number[] | null
  attachment_folder_ids?: number[] | null
  attachment_declaration_ids?: number[] | null
  attachment_certificate_ids?: number[] | null
}

export interface TaskAttachmentResponse {
  id: number
  document_id: number | null
  folder_id: number | null
  declaration_id: number | null
  certificate_id: number | null
  document_name: string | null
  folder_name: string | null
  declaration_number: string | null
  certificate_type: string | null
}

export interface TaskHistoryResponse {
  id: number
  field: string
  old_value: string | null
  new_value: string
  user_id: number
  user_name: string | null
  created_at: string
}

export interface TaskResponse {
  id: number
  target_company_id: number
  target_company_name: string | null
  target_user_id: number
  target_user_name: string | null
  title: string
  note: string | null
  priority: string
  status: string
  deadline: string
  is_overdue: boolean
  creator_company_id: number
  creator_company_name: string | null
  creator_user_id: number
  creator_user_name: string | null
  attachments: TaskAttachmentResponse[]
  history: TaskHistoryResponse[]
  created_at: string
  updated_at: string
}

export interface TaskShort {
  id: number
  title: string
  priority: string
  status: string
  deadline: string
  is_overdue: boolean
  target_user_name: string | null
  creator_user_name: string | null
  created_at: string
}

// ============ Documents ============
export interface FolderCreate {
  name: string
  access_type: string
  parent_folder_id?: number | null
  client_id?: number | null
  granted_user_ids?: number[]
}

export interface FolderUpdate {
  name?: string | null
  access_type?: string | null
  client_id?: number | null
  granted_user_ids?: number[] | null
}

export interface FolderAccessResponse {
  id: number
  user_id: number
  user_name: string | null
}

export interface FolderResponse {
  id: number
  name: string
  access_type: string
  parent_folder_id: number | null
  company_id: number
  user_id: number
  user_name: string | null
  client_id: number | null
  client_name: string | null
  created_at: string
  documents_count: number
  subfolders_count: number
  access_list: FolderAccessResponse[]
}

export interface FolderShort {
  id: number
  name: string
  access_type: string
  documents_count: number
  subfolders_count: number
  client_name: string | null
}

export interface DocumentResponse {
  id: number
  filename: string
  original_filename: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  folder_id: number | null
  folder_name: string | null
  company_id: number
  user_id: number
  user_name: string | null
  client_id: number | null
  client_name: string | null
  created_at: string
}

export interface DocumentShort {
  id: number
  original_filename: string
  file_size: number | null
  mime_type: string | null
  user_name: string | null
  client_name: string | null
  created_at: string
}

// ============ Clients ============
export interface ClientCreate {
  company_name: string
  inn?: string | null
  director_name?: string | null
  access_type: string
  note?: string | null
  granted_user_ids?: number[]
}

export interface ClientUpdate {
  company_name?: string | null
  inn?: string | null
  director_name?: string | null
  access_type?: string | null
  note?: string | null
  granted_user_ids?: number[] | null
}

export interface ClientAccessResponse {
  id: number
  user_id: number
  user_name: string | null
}

export interface ClientResponse {
  id: number
  company_name: string
  inn: string | null
  director_name: string | null
  access_type: string
  note: string | null
  company_id: number
  user_id: number
  user_name: string | null
  created_at: string
  updated_at: string
  access_list: ClientAccessResponse[]
  declarations_count: number
  certificates_count: number
  documents_count: number
  folders_count: number
  tasks_count: number
}

export interface ClientShort {
  id: number
  company_name: string
  inn: string | null
  director_name: string | null
}

// ============ Partnerships ============
export interface PartnershipRequest {
  target_inn: string
  note?: string | null
}

export interface PartnershipLookup {
  found: boolean
  company_id: number | null
  company_name: string | null
  activity_type: string | null
}

export interface PartnerCompanyResponse {
  partnership_id: number
  company_id: number
  company_name: string
  company_inn: string
  activity_type: string
  created_at: string
}

export interface PartnershipResponse {
  id: number
  requester_company_id: number
  requester_company_name: string | null
  requester_company_inn: string | null
  target_company_id: number
  target_company_name: string | null
  target_company_inn: string | null
  status: string
  note: string | null
  created_at: string
}

// ============ Requests ============
export interface RequestAction {
  action: string
  note?: string | null
}

export interface RequestResponse {
  id: number
  type: string
  status: string
  from_user_id: number
  from_user_name: string | null
  from_company_id: number | null
  from_company_name: string | null
  to_user_id: number | null
  to_user_name: string | null
  to_company_id: number | null
  to_company_name: string | null
  data: Record<string, unknown> | null
  note: string | null
  created_at: string
  updated_at: string
}

// ============ Notifications ============
export interface NotificationResponse {
  id: number
  user_id: number
  type: string
  title: string
  message: string | null
  is_read: boolean
  data: Record<string, unknown> | null
  created_at: string
}

export interface NotificationList {
  notifications: NotificationResponse[]
  unread_count: number
  total: number
}

// ============ Settings ============
export interface PasswordChange {
  old_password: string
  new_password: string
}

export interface EmailChange {
  new_email: string
  confirmation_code?: string | null
}

export interface SoundToggle {
  enabled: boolean
}

// ============ Employees ============
export interface EmployeeMember {
  id: number
  full_name: string
  email: string
  phone: string
  role: string | null
  avatar_url: string | null
  is_blocked: boolean
}

export interface EmployeeCompany {
  name: string
  members: EmployeeMember[]
}

export interface EmployeesResponse {
  my_company: EmployeeCompany
  partner_companies: EmployeeCompany[]
}

export interface TransferDataRequest {
  target_user_id: number
}

export interface AdminMessageRequest {
  message: string
}

export interface AssignRoleRequest {
  user_id: number
  role: string
}

export interface MessageToAdmin {
  message: string
}