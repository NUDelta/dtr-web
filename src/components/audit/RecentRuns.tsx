import type { AuditFilters, AuditRun } from './types'
import Link from 'next/link'
import { STATUS_META } from './statusMeta'
import {
  buildAuditHref,
  formatTime,
} from './utils'

interface RecentRunsProps {
  filters: AuditFilters
  runs: AuditRun[]
  selectedKey?: string
}

export default function RecentRuns({
  filters,
  runs,
  selectedKey,
}: RecentRunsProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="text-xl font-bold tracking-normal">Recent Workflow Runs</h2>
      <div className="mt-4 space-y-3">
        {runs.map((run) => {
          const meta = STATUS_META[run.status]
          const Icon = meta.icon
          const isSelected = run.key === selectedKey

          return (
            <Link
              className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'}`}
              href={buildAuditHref(filters, { run: run.key })}
              key={run.key}
            >
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${meta.bgClass} ${meta.textClass}`}>
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-bold text-neutral-950">{run.title}</span>
                <span className="mt-1 block truncate text-sm text-neutral-600">{run.summary}</span>
              </span>
              <span className="shrink-0 text-sm text-neutral-600">{formatTime(run.timestamp)}</span>
            </Link>
          )
        })}
        {runs.length === 0 && (
          <p className="rounded-lg border border-dashed border-neutral-200 p-6 text-sm text-neutral-600">
            No workflow runs match the current filters.
          </p>
        )}
      </div>
      <p className="mt-5 text-sm text-neutral-600">
        Showing 1-
        {runs.length}
        {' '}
        of
        {' '}
        {runs.length}
        {' '}
        workflow runs
      </p>
    </section>
  )
}
