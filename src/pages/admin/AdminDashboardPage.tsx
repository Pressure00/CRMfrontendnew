import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'
import type { DashboardAdmin } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import { formatDateTime } from '@/utils/helpers'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { HiOutlineOfficeBuilding, HiOutlineUsers, HiOutlineClipboardList } from 'react-icons/hi'

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardAdmin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getDashboard().then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner fullPage text="Загрузка..." />
  if (!data) return null

  // Merge growth data for chart
  const chartData = data.companies_growth.map((cg, i) => ({
    date: cg.date,
    companies: cg.count,
    users: data.users_growth[i]?.count || 0,
  }))

  return (
    <div>
      <PageHeader title="Дашборд администратора" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={HiOutlineOfficeBuilding} label="Зарегистрировано компаний" value={data.total_companies} color="blue" />
        <StatCard icon={HiOutlineUsers} label="Зарегистрировано пользователей" value={data.total_users} color="green" />
        <StatCard icon={HiOutlineClipboardList} label="Активные запросы" value={data.active_requests} color="yellow" />
      </div>

      {/* Growth chart */}
      {chartData.length > 1 && (
        <div className="win-card mb-8">
          <h3 className="text-sm font-semibold text-win-text mb-4">График роста</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="companies" name="Компании" stroke="#0078D4" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="users" name="Пользователи" stroke="#107C10" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent requests */}
      <div className="win-card">
        <h3 className="text-sm font-semibold text-win-text mb-4">Активные запросы</h3>
        {data.recent_requests.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Нет активных запросов</p>
        ) : (
          <div className="space-y-2">
            {data.recent_requests.map((r: any, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-win flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="primary">{r.type}</Badge>
                    <Badge variant={r.status === 'pending' ? 'warning' : 'success'}>{r.status}</Badge>
                  </div>
                  <p className="text-sm text-win-text">{r.from_user_name} {r.from_company_name ? `(${r.from_company_name})` : ''}</p>
                </div>
                <span className="text-[10px] text-gray-400">{r.created_at ? formatDateTime(r.created_at) : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}