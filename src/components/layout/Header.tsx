import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { notificationsApi } from '@/api'
import { formatDateTime } from '@/utils/helpers'
import {
  HiOutlineBell,
  HiOutlineVolumeUp,
  HiOutlineVolumeOff,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineTrash,
} from 'react-icons/hi'

interface HeaderProps {
  onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user } = useAuthStore()
  const {
    notifications,
    unreadCount,
    soundEnabled,
    isOpen,
    togglePanel,
    closePanel,
    setNotifications,
    setUnreadCount,
    setSoundEnabled,
    markAsRead,
    removeNotification,
    clearAll,
  } = useNotificationStore()

  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await notificationsApi.list({ limit: 50 })
        setNotifications(res.data.notifications, res.data.unread_count)
      } catch {}
    }
    loadNotifications()

    // Poll every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Load sound status
  useEffect(() => {
    notificationsApi.getSoundStatus().then((res) => {
      setSoundEnabled(res.data.enabled ?? true)
    }).catch(() => {})
  }, [])

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, closePanel])

  const handleToggleSound = async () => {
    try {
      await notificationsApi.toggleSound({ enabled: !soundEnabled })
      setSoundEnabled(!soundEnabled)
    } catch {}
  }

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markSingleRead(id)
      markAsRead(id)
    } catch {}
  }

  const handleDelete = async (id: number) => {
    try {
      await notificationsApi.delete(id)
      removeNotification(id)
    } catch {}
  }

  const handleClearAll = async () => {
    try {
      await notificationsApi.clearAll()
      clearAll()
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markRead()
      setUnreadCount(0)
      const res = await notificationsApi.list({ limit: 50 })
      setNotifications(res.data.notifications, 0)
    } catch {}
  }

  return (
    <header className="h-14 bg-white border-b border-win-border flex items-center justify-between px-4 shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-win hover:bg-gray-100 transition-colors"
        >
          <HiOutlineMenu className="w-5 h-5 text-gray-600" />
        </button>

        {user?.company_name && (
          <div className="hidden sm:block">
            <span className="text-sm text-win-text-secondary">{user.company_name}</span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1" ref={panelRef}>
        {/* Sound toggle */}
        <button
          onClick={handleToggleSound}
          className="p-2 rounded-win hover:bg-gray-100 transition-colors"
          title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
        >
          {soundEnabled ? (
            <HiOutlineVolumeUp className="w-5 h-5 text-gray-600" />
          ) : (
            <HiOutlineVolumeOff className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={togglePanel}
            className="p-2 rounded-win hover:bg-gray-100 transition-colors relative"
            title="Уведомления"
          >
            <HiOutlineBell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] 
                font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification panel */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 max-h-[500px] bg-white 
              rounded-win-lg shadow-win-modal border border-win-border z-50 animate-scaleIn 
              flex flex-col overflow-hidden">
              {/* Panel header */}
              <div className="px-4 py-3 border-b border-win-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-win-text">
                  Уведомления {unreadCount > 0 && `(${unreadCount})`}
                </h3>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary hover:underline px-2 py-1"
                    >
                      Прочитать все
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-xs text-gray-400 hover:text-danger px-2 py-1"
                    >
                      Очистить
                    </button>
                  )}
                </div>
              </div>

              {/* Panel body */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-400">
                    Нет уведомлений
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-win-border last:border-0 
                        hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {!n.is_read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                            <p className="text-sm font-medium text-win-text truncate">
                              {n.title}
                            </p>
                          </div>
                          {n.message && (
                            <p className="text-xs text-win-text-secondary mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                          )}
                          <p className="text-[10px] text-gray-400 mt-1">
                            {formatDateTime(n.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {!n.is_read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id) }}
                              className="p-1 rounded hover:bg-gray-200 transition-colors"
                              title="Прочитано"
                            >
                              <HiOutlineCheck className="w-3.5 h-3.5 text-green-600" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(n.id) }}
                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                            title="Удалить"
                          >
                            <HiOutlineTrash className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}