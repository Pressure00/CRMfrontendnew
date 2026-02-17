import { useState, useEffect, useCallback } from 'react'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'

interface SearchInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Поиск...',
  debounceMs = 300,
  className = '',
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [localValue, debounceMs])

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className={`relative ${className}`}>
      <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="win-input pl-9 pr-8"
        placeholder={placeholder}
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <HiOutlineX className="w-3.5 h-3.5 text-gray-400" />
        </button>
      )}
    </div>
  )
}