import { useState, useEffect } from 'react'
import { HiOutlineKey, HiX } from 'react-icons/hi'

interface AdminCodeModalProps {
    isOpen: boolean
    isLoading: boolean
    onClose: () => void
    onSubmit: (code: string) => void
}

export default function AdminCodeModal({
    isOpen,
    isLoading,
    onClose,
    onSubmit,
}: AdminCodeModalProps) {
    const [code, setCode] = useState('')

    useEffect(() => {
        if (isOpen) {
            setCode('')
        }
    }, [isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (code) {
            onSubmit(code)
        }
    }

    if (!isOpen) return null

    return (
        <div className="relative z-50">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                                Подтверждение входа
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                                type="button"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-6">
                                Ваш аккаунт имеет права администратора. Для входа введите код подтверждения из нашего Telegram-бота.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Код из Telegram
                                    </label>
                                    <div className="relative">
                                        <HiOutlineKey className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-center text-lg tracking-widest outline-none"
                                            placeholder="000000"
                                            autoFocus
                                            autoComplete="one-time-code"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        disabled={isLoading || !code}
                                        className="w-full inline-flex justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            'Подтвердить'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
