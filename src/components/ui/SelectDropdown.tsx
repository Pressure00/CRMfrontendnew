import { useState, useRef, useEffect } from 'react'
import { HiOutlineChevronDown, HiOutlineSearch } from 'react-icons/hi'

interface Option {
  value: string | number
  label: string
}

interface SelectDropdownProps {
  options: Option[]
  value: string | number | null
  onChange: (val: string | number | null) => void
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  className?: string
  label?: string
}

export default function SelectDropdown({
  options,
  value,
  onChange,
  placeholder = 'Выберите...',
  searchable = false,
  clearable = false,
  className = '',
  label,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value)

  const filtered = searchable && search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <label className="win-label">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="win-input flex items-center justify-between gap-2 text-left"
      >
        <span className={selectedOption ? 'text-win-text' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {clearable && value !== null && (
            <span
              onClick={(e) => { e.stopPropagation(); onChange(null); setIsOpen(false) }}
              className="text-gray-400 hover:text-gray-600 text-xs px-1"
            >
              ✕
            </span>
          )}
          <HiOutlineChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-30 top-full mt-1 w-full bg-white border border-win-border rounded-win shadow-win-modal 
          max-h-60 overflow-hidden animate-scaleIn">
          {searchable && (
            <div className="p-2 border-b border-win-border">
              <div className="relative">
                <HiOutlineSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-win-border rounded focus:outline-none focus:border-primary"
                  placeholder="Поиск..."
                  autoFocus
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-400">Ничего не найдено</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setIsOpen(false); setSearch('') }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    opt.value === value ? 'bg-primary-light text-primary font-medium' : 'text-win-text'
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}