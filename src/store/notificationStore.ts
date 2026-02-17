import { create } from 'zustand'
import type { NotificationResponse } from '@/types'

interface NotificationState {
  notifications: NotificationResponse[]
  unreadCount: number
  soundEnabled: boolean
  isOpen: boolean

  setNotifications: (notifications: NotificationResponse[], unreadCount: number) => void
  setUnreadCount: (count: number) => void
  setSoundEnabled: (enabled: boolean) => void
  togglePanel: () => void
  closePanel: () => void
  markAsRead: (id: number) => void
  removeNotification: (id: number) => void
  clearAll: () => void
  addNotification: (notification: NotificationResponse) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  soundEnabled: true,
  isOpen: false,

  setNotifications: (notifications, unreadCount) => {
    set({ notifications, unreadCount })
  },

  setUnreadCount: (count) => {
    set({ unreadCount: count })
  },

  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled })
  },

  togglePanel: () => {
    set((state) => ({ isOpen: !state.isOpen }))
  },

  closePanel: () => {
    set({ isOpen: false })
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: state.notifications.find((n) => n.id === id && !n.is_read)
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount,
    }))
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 })
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },
}))