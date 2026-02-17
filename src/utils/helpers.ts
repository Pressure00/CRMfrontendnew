import { format, parseISO, isAfter, isBefore } from 'date-fns'
import { ru } from 'date-fns/locale'

export function formatDate(dateStr: string, fmt: string = 'dd.MM.yyyy'): string {
  try {
    return format(parseISO(dateStr), fmt, { locale: ru })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd.MM.yyyy HH:mm', { locale: ru })
  } catch {
    return dateStr
  }
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' Б'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' МБ'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' ГБ'
}

export function isOverdue(deadline: string): boolean {
  try {
    return isBefore(parseISO(deadline), new Date())
  } catch {
    return false
  }
}

export function getStatusLabel(statuses: { value: string; label: string }[], value: string): string {
  return statuses.find((s) => s.value === value)?.label || value
}

export function getStatusColor(statuses: { value: string; color: string }[], value: string): string {
  return statuses.find((s) => s.value === value)?.color || 'bg-gray-100 text-gray-800'
}

export function getRoleLabel(role: string | null): string {
  switch (role) {
    case 'admin': return 'Админ'
    case 'director': return 'Директор'
    case 'senior': return 'Старший'
    case 'employee': return 'Сотрудник'
    default: return role || 'Не назначен'
  }
}

export function getActivityLabel(type: string): string {
  switch (type) {
    case 'declarant': return 'Декларант'
    case 'certification': return 'Сертификация'
    default: return type
  }
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}