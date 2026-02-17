import { IconType } from 'react-icons'

interface StatCardProps {
  icon: IconType
  label: string
  value: number | string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo'
  subtitle?: string
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-700',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    value: 'text-green-700',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    value: 'text-red-700',
  },
  yellow: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    value: 'text-amber-700',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    value: 'text-purple-700',
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'bg-indigo-100 text-indigo-600',
    value: 'text-indigo-700',
  },
}

export default function StatCard({ icon: Icon, label, value, color = 'blue', subtitle }: StatCardProps) {
  const c = colorMap[color]

  return (
    <div className={`${c.bg} rounded-win-lg p-4 border border-transparent hover:shadow-win transition-shadow`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-win flex items-center justify-center ${c.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-win-text-secondary truncate">{label}</p>
          <p className={`text-xl font-bold ${c.value}`}>{value}</p>
          {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}