'use client'

import clsx from 'clsx'
import { Search, X } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  id?: string
  className?: string
  inputClassName?: string
  accent?: boolean
}

const SearchBar = function SearchBar({
  ref,
  value,
  onChange,
  onClear,
  placeholder = 'Search…',
  id,
  className,
  inputClassName,
  accent = true,
}: Props & { ref?: React.RefObject<HTMLInputElement | null> }) {
  return (
    <div className={clsx('relative', className)}>
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-yellow-600">
        <Search size={18} aria-hidden="true" />
      </div>

      <input
        ref={ref}
        id={id}
        type="search"
        inputMode="search"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={placeholder}
        className={clsx(
          'w-full rounded-full border border-neutral-300 bg-white py-2.5 pl-10 pr-10 text-[15px] outline-none shadow-sm transition',
          accent
            ? 'focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200'
            : 'focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200',
          inputClassName,
        )}
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-neutral-300 bg-white p-1 text-neutral-700 hover:border-yellow-500"
          title="Clear"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default SearchBar
