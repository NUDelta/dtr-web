import type { LucideIcon } from 'lucide-react'
import type { RunStatus } from './types'
import type { WorkflowRunSummary } from '@/lib/audit/workflow-logs'
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
  getLatestBySource,
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

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <HealthCard
        detail={`Last refresh ${formatRelativeTime(refreshLatest?.endedAt)} · ${refreshLatest?.dueTables?.length ?? 0} tables updated`}
        icon={Database}
        status={refreshLatest?.status ?? 'skipped'}
        title="Cache Refresh"
      />
      <HealthCard
        detail={`${orphanCandidates} orphan candidates · GC ${formatRelativeTime(r2Latest?.endedAt)}`}
        icon={AlertTriangle}
        status={r2Latest?.status ?? 'skipped'}
        title="R2 Cleanup"
      />
      <HealthCard
        detail={`Last backup ${formatRelativeTime(backupLatest?.endedAt)} · ${backupLatest?.affectedCount ?? 0} tables`}
        icon={ShieldCheck}
        status={backupLatest?.status ?? 'skipped'}
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
