import type { OpsLogEntry } from '@/lib/ops/audit-logs'
import { STATUS_META } from './statusMeta'
import { getLastSevenDays } from './utils'

interface AuditHeaderProps {
  logs: OpsLogEntry[]
}

export default function AuditHeader({ logs }: AuditHeaderProps) {
  const days = getLastSevenDays(logs)

  return (
    <header className="flex flex-wrap items-start justify-between gap-6">
      <div>
        <h1 className="text-5xl font-bold tracking-normal text-neutral-950">Automation Audit</h1>
        <p className="mt-3 text-lg text-neutral-600">
          Scheduled cache refreshes, backups, R2 cleanup, and workflow diagnostics.
        </p>
      </div>
      <div className="min-w-72">
        <p className="text-sm font-semibold text-neutral-950">Last 7 days</p>
        <div className="mt-3 grid grid-cols-7 gap-5 text-center">
          {days.map(day => (
            <div key={day.day}>
              <p className="text-sm font-medium text-neutral-600">{day.day}</p>
              <span
                className={`mx-auto mt-3 block size-5 rounded-full ${day.status === undefined ? 'bg-neutral-300' : STATUS_META[day.status].dotClass}`}
                title={day.status === undefined ? 'No logs' : STATUS_META[day.status].label}
              />
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
