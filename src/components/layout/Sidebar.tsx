import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getInitials } from '@/utils/helpers'
import {
  HiOutlineViewGrid,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineClipboardCheck,
  HiOutlineFolder,
  HiOutlineUserGroup,
  HiOutlineOfficeBuildingIcon,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi'
import {
  HiOutlineOfficeBuilding,
} from 'react-icons/hi'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const isDeclarant = user?.activity_type === 'declarant'
  const isDirector = user?.role === 'director'
  const isSenior = user?.role === 'senior'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Build menu based on activity type and role
  const menuItems = []

  menuItems.push({ path: '/dashboard', icon: HiOutlineViewGrid, label: 'Дашборд' })

  if (isDeclarant) {
    menuItems.push({ path: '/declarations', icon: HiOutlineDocumentText, label: 'Декларации' })
  }

  menuItems.push({ path: '/certificates', icon: HiOutlineShieldCheck, label: 'Сертификаты' })
  menuItems.push({ path: '/tasks', icon: HiOutlineClipboardCheck, label: 'Задачи' })
  menuItems.push({ path: '/documents', icon: HiOutlineFolder, label: 'Документы' })
  menuItems.push({ path: '/clients', icon: HiOutlineUserGroup, label: 'Клиенты' })
  menuItems.push({ path: '/partnerships', icon: HiOutlineOfficeBuilding, label: 'Сотрудничество' })

  if (isDirector || isSenior) {
    menuItems.push({ path: '/employees', icon: HiOutlineUsers, label: 'Мои сотрудники' })
  }

  if (isDirector) {
    menuItems.push({ path: '/requests', icon: HiOutlineClipboardList, label: 'Запросы' })
  }

  menuItems.push({ path: '/settings', icon: HiOutlineCog, label: 'Настройки' })

  const avatarUrl = user?.avatar_url

  return (
    <aside
      className={`${
        collapsed ? 'w-[72px]' : 'w-64'
      } bg-sidebar-bg flex flex-col shadow-lg transition-all duration-300 relative`}
    >
      {/* Collapse button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 w-6 h-6 bg-white border border-win-border 
          rounded-full shadow-win flex items-center justify-center
          hover:bg-gray-50 transition-colors"
      >
        {collapsed ? (
          <HiOutlineChevronRight className="w-3 h-3 text-gray-600" />
        ) : (
          <HiOutlineChevronLeft className="w-3 h-3 text-gray-600" />
        )}
      </button>

      {/* User profile */}
      <div className={`${collapsed ? 'px-3 py-4' : 'px-4 py-5'} border-b border-white/10`}>
        <div className={`flex ${collapsed ? 'justify-center' : 'items-center gap-3'}`}>
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-sm font-semibold">
                {user ? getInitials(user.full_name) : '?'}
              </span>
            )}
          </div>

          {!collapsed && user && (
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.full_name}</p>
              <p className="text-gray-400 text-xs truncate">{user.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2.5 rounded-win text-sm 
              transition-all duration-150 group ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Выход' : undefined}
          className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2.5 
            rounded-win text-sm text-gray-300 hover:bg-red-600/20 hover:text-red-400 
            w-full transition-all duration-150`}
        >
          <HiOutlineLogout className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Выход</span>}
        </button>
      </div>
    </aside>
  )
}