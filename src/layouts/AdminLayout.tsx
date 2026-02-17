import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  HiOutlineViewGrid,
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineLogout,
} from 'react-icons/hi'

const adminMenu = [
  { path: '/admin/dashboard', icon: HiOutlineViewGrid, label: 'Дашборд' },
  { path: '/admin/companies', icon: HiOutlineOfficeBuilding, label: 'Фирмы' },
  { path: '/admin/users', icon: HiOutlineUsers, label: 'Пользователи' },
  { path: '/admin/requests', icon: HiOutlineClipboardList, label: 'Запросы' },
]

export default function AdminLayout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-win-bg">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-sidebar-bg flex flex-col shadow-lg">
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div>
              <h2 className="text-white text-sm font-semibold">Админ-панель</h2>
              <p className="text-gray-400 text-xs">Управление CRM</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {adminMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-win text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-win text-sm text-gray-300 
              hover:bg-sidebar-hover hover:text-white w-full transition-all duration-150"
          >
            <HiOutlineLogout className="w-5 h-5" />
            <span>Выход</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-win-border flex items-center px-6">
          <h1 className="text-lg font-semibold text-win-text">Администрирование</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}