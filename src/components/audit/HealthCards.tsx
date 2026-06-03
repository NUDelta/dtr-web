import type { LucideIcon } from 'lucide-react'
import type { RunStatus } from './lib/types'
import type { WorkflowRunSummary } from '@/lib/audit/workflow-logs'
import {
  AlertTriangle,
  Database,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { formatRelativeTime } from './lib/format'
import { getLatestBySource, getOverallStatus } from './lib/runStatus'
import { StatusBadge } from './status'
import { STATUS_META } from './statusMeta'

function HealthCard({
  detail,
  icon: Icon,
  metric,
  status,
  title,
}: {
  detail: string
  icon: LucideIcon
  metric: string
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
        <p className="mt-2 text-base font-medium leading-snug text-neutral-800">{detail}</p>
        <p className="mt-1 text-sm leading-snug text-neutral-500">{metric}</p>
      </div>
    </article>
  )
}

interface HealthCardsProps {
  summaries: WorkflowRunSummary[]
}

export default function HealthCards({
  summaries,
}: HealthCardsProps) {
  const refreshLatest = getLatestBySource(summaries, 'airtable-refresh')
  const backupLatest = getLatestBySource(summaries, 'airtable-backup')
  const r2Latest = getLatestBySource(summaries, 'r2-gc')
  const maintenanceStatus = getOverallStatus([refreshLatest, backupLatest, r2Latest])
  const orphanCandidates = (r2Latest?.confirmedOrphanCount ?? 0)
    + (r2Latest?.newOrphanCount ?? 0)
  const refreshTables = refreshLatest?.dueTables?.length
    ?? refreshLatest?.requestedTables?.length
    ?? refreshLatest?.tableNames.length
    ?? 0
  const workflowCount = [refreshLatest, backupLatest, r2Latest].filter(Boolean).length

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <HealthCard
        detail={refreshLatest === undefined ? 'No refresh run in range' : `Last run ${formatRelativeTime(refreshLatest.endedAt)}`}
        icon={Database}
        metric={`${refreshTables} tables · ${refreshLatest?.recordCount ?? 0} records refreshed`}
        status={refreshLatest?.status ?? 'skipped'}
        title="Cache Refresh"
      />
      <HealthCard
        detail={r2Latest === undefined ? 'No cleanup run in range' : `Last cleanup ${formatRelativeTime(r2Latest.endedAt)}`}
        icon={AlertTriangle}
        metric={`${orphanCandidates} orphan candidates · ${r2Latest?.deletedCount ?? 0} deleted`}
        status={r2Latest?.status ?? 'skipped'}
        title="R2 Cleanup"
      />
      <HealthCard
        detail={backupLatest === undefined ? 'No backup run in range' : `Last backup ${formatRelativeTime(backupLatest.endedAt)}`}
        icon={ShieldCheck}
        metric={`${backupLatest?.affectedCount ?? 0} tables · ${backupLatest?.recordCount ?? 0} records backed up`}
        status={backupLatest?.status ?? 'skipped'}
        title="Backups"
      />
      <HealthCard
        detail={`${workflowCount}/3 workflow types have recent logs`}
        icon={Settings}
        metric="Overall status from refresh, backup, and cleanup"
        status={maintenanceStatus}
        title="Auto Workflows"
      />
    </div>
  )
}
