import type { AuditFilters, AuditRun } from './lib/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import LocalTime from './detail/LocalTime'
import { buildAuditHref } from './lib/filtering'
import { splitRunSummary } from './lib/runText'
import { STATUS_META } from './statusMeta'

interface RecentRunsProps {
  filters: AuditFilters
  page: number
  pageCount: number
  pageSize: number
  runs: AuditRun[]
  selectedKey?: string
  total: number
}

export default function RecentRuns({
  filters,
  page,
  pageCount,
  pageSize,
  runs,
  selectedKey,
  total,
}: RecentRunsProps) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold tracking-normal">Workflow Runs</h2>
        <span className="text-xs font-medium text-neutral-500">
          {total}
          {' '}
          total
        </span>
      </div>
      <div className="mt-3 divide-y divide-neutral-100 overflow-hidden rounded-md border border-neutral-200">
        {runs.map((run) => {
          const meta = STATUS_META[run.status]
          const Icon = meta.icon
          const isSelected = run.detailKey === selectedKey
          const summary = splitRunSummary(run.summary)

          return (
            <Link
              aria-current={isSelected ? 'page' : undefined}
              className={`flex items-start gap-3 p-3 transition-colors ${isSelected ? 'bg-blue-50' : 'bg-white hover:bg-neutral-50'}`}
              href={buildAuditHref(filters, { run: run.detailKey })}
              key={run.key}
            >
              <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${meta.bgClass} ${meta.textClass}`}>
                <Icon size={16} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-neutral-950">{run.title}</span>
                <span className="mt-1 block truncate text-sm text-neutral-600">{summary.primary}</span>
                {summary.detail !== undefined && (
                  <span className="mt-0.5 block truncate text-xs font-medium text-amber-700">{summary.detail}</span>
                )}
                <span className="mt-1 block text-xs text-neutral-500">
                  <LocalTime mode="time" timestamp={run.endedAt} />
                </span>
              </span>
            </Link>
          )
        })}
        {runs.length === 0 && (
          <p className="p-5 text-sm text-neutral-600">
            No workflow runs match the current filters.
          </p>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-neutral-600">
        <span>
          {first}
          -
          {last}
          {' '}
          of
          {' '}
          {total}
        </span>
        <div className="flex items-center gap-2">
          {page > 1
            ? (
                <Link
                  aria-label="Previous workflow run page"
                  className="flex size-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  href={buildAuditHref(filters, { page: page - 1, run: undefined })}
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </Link>
              )
            : (
                <span className="flex size-9 items-center justify-center rounded-md border border-neutral-100 text-neutral-300">
                  <ChevronLeft size={18} aria-hidden="true" />
                </span>
              )}
          <span className="min-w-12 text-center text-xs font-medium text-neutral-500">
            {page}
            /
            {pageCount}
          </span>
          {page < pageCount
            ? (
                <Link
                  aria-label="Next workflow run page"
                  className="flex size-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  href={buildAuditHref(filters, { page: page + 1, run: undefined })}
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              )
            : (
                <span className="flex size-9 items-center justify-center rounded-md border border-neutral-100 text-neutral-300">
                  <ChevronRight size={18} aria-hidden="true" />
                </span>
              )}
        </div>
      </div>
    </section>
  )
}
