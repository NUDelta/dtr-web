import clsx from 'clsx'

interface DirectoryStatusTabsProps<T extends string> {
  tabs: readonly T[]
  value: T
  onChange: (value: T) => void
  counts: Partial<Record<T, number>>
  ariaLabel: string
  helperText?: React.ReactNode
  className?: string
}

const DirectoryStatusTabs = <T extends string>({
  tabs,
  value,
  onChange,
  counts,
  ariaLabel,
  helperText,
  className,
}: DirectoryStatusTabsProps<T>) => {
  return (
    <div className={clsx('mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div
        className="mt-2 inline-flex w-full max-w-md rounded-2xl bg-gray-50 p-1 shadow-sm ring-1 ring-gray-200"
        role="radiogroup"
        aria-label={ariaLabel}
      >
        {tabs.map((tab) => {
          const isActive = value === tab
          const count = counts[tab]?.toLocaleString?.() ?? '0'

          return (
            <button
              key={tab}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(tab)}
              className={clsx(
                'flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-white',
              )}
            >
              <span>{tab}</span>
              <span
                className={clsx(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-base',
                  isActive ? 'bg-white/15 text-gray-100' : 'bg-gray-100 text-gray-600',
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {helperText !== undefined
        ? (
            <p className="text-xs text-gray-500 sm:text-right">
              {helperText}
            </p>
          )
        : null}
    </div>
  )
}

export default DirectoryStatusTabs
