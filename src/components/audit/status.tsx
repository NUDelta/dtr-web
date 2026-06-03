import type { RunStatus } from './lib/types'
import { STATUS_META } from './statusMeta'

export function StatusBadge({ status }: { status: RunStatus }) {
  const meta = STATUS_META[status]
  const Icon = meta.icon

  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${meta.bgClass} ${meta.textClass}`}>
      <Icon size={14} aria-hidden="true" />
      {meta.label}
    </span>
  )
}
