import type { LucideIcon } from 'lucide-react'
import type { RunStatus } from './types'
import type {
  ArchivedLogManifest,
  OpsLogEntry,
} from '@/lib/ops/audit-logs'
import {
  AlertTriangle,
  Database,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { StatusBadge } from './status'
import { STATUS_META } from './statusMeta'
import {
  formatRelativeTime,
  getEventStatus,
  getOverallStatus,
} from './utils'

function HealthCard({
  detail,
  icon: Icon,
  status,
  title,
}: {
  detail: string
  icon: LucideIcon
  status: RunStatus
  title: string
}) {
  const meta = STATUS_META[status]

  return (
    <article className="flex min-h-32 items-center gap-5 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className={`flex size-16 shrink-0 items-center justify-center rounded-full ${meta.bgClass} ${meta.textClass}`}>
        <Icon size={32} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold tracking-normal text-neutral-950">{title}</h2>
          <StatusBadge status={status} />
        </div>
        <p className="mt-2 text-base leading-snug text-neutral-600">{detail}</p>
      </div>
    </article>
  )
}

interface HealthCardsProps {
  archivedManifests: ArchivedLogManifest[]
  logs: OpsLogEntry[]
}

function getLatestRefreshRun(logs: OpsLogEntry[]): OpsLogEntry | undefined {
  return logs.find((entry) => {
    return (
      entry.sourceId === 'airtable-refresh'
      && (
        entry.event.kind === 'refreshRunSuccess'
        || entry.event.kind === 'refreshRunSkipped'
        || entry.event.kind === 'refreshRunFailure'
      )
    )
  })
}

function getLatestBySource(logs: OpsLogEntry[], sourceId: OpsLogEntry['sourceId']): OpsLogEntry | undefined {
  return logs.find(entry => entry.sourceId === sourceId)
}

export default function HealthCards({
  archivedManifests,
  logs,
}: HealthCardsProps) {
  const refreshLatest = getLatestRefreshRun(logs)
  const backupLatest = getLatestBySource(logs, 'airtable-backup')
  const r2Latest = getLatestBySource(logs, 'r2-gc')
  const orphanLatest = getLatestBySource(logs, 'r2-gc-orphans')
  const imageStatus = getOverallStatus([r2Latest, orphanLatest])
  const maintenanceStatus = getOverallStatus([refreshLatest, backupLatest, r2Latest])
  const orphanCandidates = (orphanLatest?.event.confirmedOrphanCount ?? 0)
    + (orphanLatest?.event.newOrphanCount ?? 0)

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <HealthCard
        detail={`Last refresh ${formatRelativeTime(refreshLatest?.event.timestamp)} · ${refreshLatest?.event.dueTables?.length ?? 0} tables updated`}
        icon={Database}
        status={refreshLatest === undefined ? 'skipped' : getEventStatus(refreshLatest.event)}
        title="Cache Refresh"
      />
      <HealthCard
        detail={`${orphanCandidates} orphan candidates · GC ${formatRelativeTime(r2Latest?.event.timestamp)}`}
        icon={AlertTriangle}
        status={imageStatus}
        title="R2 Cleanup"
      />
      <HealthCard
        detail={`Last backup ${formatRelativeTime(backupLatest?.event.timestamp)} · ${archivedManifests.length} snapshots`}
        icon={ShieldCheck}
        status={backupLatest === undefined ? 'skipped' : getEventStatus(backupLatest.event)}
        title="Backups"
      />
      <HealthCard
        detail="Scheduled refresh, backup, and GC activity."
        icon={Settings}
        status={maintenanceStatus}
        title="Auto Workflows"
      />
    </div>
  )
}
