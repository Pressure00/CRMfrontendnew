interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullPage?: boolean
}

export default function LoadingSpinner({ size = 'md', text, fullPage = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClasses[size]} border-primary/30 border-t-primary rounded-full animate-spin`}
      />
      {text && <span className="text-sm text-win-text-secondary">{text}</span>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="flex items-center justify-center py-20">
        {spinner}
      </div>
    )
  }

  return spinner
}