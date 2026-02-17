import { IconType } from 'react-icons'

interface EmptyStateProps {
  icon: IconType
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-win-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-win-text-secondary max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}