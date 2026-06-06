import type { ReactNode } from 'react'

interface ViewerIconButtonProps {
  children: ReactNode
  disabled?: boolean
  label: string
  onClick: () => void
}

export default function ViewerIconButton({
  children,
  disabled,
  label,
  onClick,
}: ViewerIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}
