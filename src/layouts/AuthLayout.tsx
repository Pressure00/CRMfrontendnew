import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function AuthLayout() {
  const [appName, setAppName] = useState('Declarant CRM')
  const [logo, setLogo] = useState('/logo.svg')

  useEffect(() => {
    fetch('/config.json')
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg.appName) setAppName(cfg.appName)
        if (cfg.logo) setLogo(cfg.logo)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-4">
            <img
              src={logo}
              alt={appName}
              className="w-10 h-10"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
          <h1 className="text-2xl font-semibold text-win-text">{appName}</h1>
          <p className="text-sm text-win-text-secondary mt-1">
            Система управления для декларантов
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-win-lg shadow-win-modal p-8 animate-scaleIn">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} {appName}. Все права защищены.
        </p>
      </div>
    </div>
  )
}