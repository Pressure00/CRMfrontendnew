import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string | Array<{ msg: string }> }>) => {
    if (error.response) {
      const { status, data } = error.response

      let message = 'Произошла ошибка'
      if (data?.detail) {
        if (typeof data.detail === 'string') {
          message = data.detail
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          message = data.detail.map((e) => e.msg).join(', ')
        }
      }

      switch (status) {
        case 401:
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          if (window.location.pathname !== '/login' && 
              window.location.pathname !== '/register' &&
              window.location.pathname !== '/admin/login') {
            window.location.href = '/login'
          }
          break
        case 403:
          toast.error('Нет доступа: ' + message)
          break
        case 404:
          toast.error('Не найдено: ' + message)
          break
        case 422:
          toast.error('Ошибка валидации: ' + message)
          break
        case 500:
          toast.error('Ошибка сервера')
          break
        default:
          toast.error(message)
      }
    } else if (error.request) {
      toast.error('Сервер недоступен. Проверьте подключение.')
    }

    return Promise.reject(error)
  }
)

export default apiClient