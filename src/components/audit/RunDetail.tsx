import type { AuditFilters, AuditRun } from './types'
import { X } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from './status'
import {
  buildAuditHref,
  formatDateTime,
  formatDuration,
  getEventStatus,
  getEventSummary,
} from './utils'

interface RunDetailProps {
  filters: AuditFilters
  run?: AuditRun
}

export default function RunDetail({
  filters,
  run,
}: RunDetailProps) {
  const events = run?.detail?.events ?? []

  return (
    <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-200 p-4">
        <h2 className="text-xl font-bold tracking-normal">Workflow Detail</h2>
        <Link aria-label="Clear selected run" className="text-neutral-500 hover:text-neutral-950" href={buildAuditHref(filters, { run: undefined })}>
          <X size={24} aria-hidden="true" />
        </Link>
      </div>
      {run === undefined
        ? (
            <p className="p-6 text-sm text-neutral-600">Select a workflow run to inspect details.</p>
          )
        : (
            <>
              <div className="border-b border-neutral-200 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-bold tracking-normal">{run.title}</h3>
                  <StatusBadge status={run.status} />
                </div>
              </div>
              <div className="grid gap-5 border-b border-neutral-200 p-5 md:grid-cols-2">
                <div>
                  <h4 className="font-bold">Summary</h4>
                  <p className="mt-2 text-neutral-600">{run.summary}</p>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-neutral-200 text-sm md:border-l md:pl-8">
                  <dt className="font-medium text-neutral-600">Started</dt>
                  <dd>{formatDateTime(run.startedAt)}</dd>
                  <dt className="font-medium text-neutral-600">Duration</dt>
                  <dd>{formatDuration(run.durationMs)}</dd>
                  <dt className="font-medium text-neutral-600">Run ID</dt>
                  <dd className="break-all font-mono text-xs">{run.runId}</dd>
                </dl>
              </div>
              <dl className="grid gap-4 border-b border-neutral-200 p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="font-bold">Tables</dt>
                  <dd className="mt-2 text-neutral-600">{run.tableNames.length === 0 ? '-' : run.tableNames.join(', ')}</dd>
                </div>
                <div>
                  <dt className="font-bold">Records</dt>
                  <dd className="mt-2 text-xl font-semibold">{run.recordCount ?? '-'}</dd>
                </div>
                <div>
                  <dt className="font-bold">Affected</dt>
                  <dd className="mt-2 text-xl font-semibold">{run.affectedCount ?? run.deletedCount ?? '-'}</dd>
                </div>
                <div>
                  <dt className="font-bold">Events</dt>
                  <dd className="mt-2 text-xl font-semibold">{run.logCount}</dd>
                </div>
              </dl>
              <dl className="grid gap-4 border-b border-neutral-200 p-5 text-sm sm:grid-cols-[140px_1fr]">
                <dt className="font-bold">Warnings</dt>
                <dd className="text-neutral-600">{run.status === 'warning' ? run.summary : 'none'}</dd>
              </dl>
              {events.length > 0 && (
                <div className="border-b border-neutral-200 p-5">
                  <h4 className="font-bold">Events</h4>
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-neutral-500">
                        <tr>
                          <th className="border-b border-neutral-200 py-2 pr-4">Event</th>
                          <th className="border-b border-neutral-200 py-2 pr-4">Status</th>
                          <th className="border-b border-neutral-200 py-2 pr-4">Table</th>
                          <th className="border-b border-neutral-200 py-2 pr-4">Duration</th>
                          <th className="border-b border-neutral-200 py-2">Detail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((event) => {
                          const entryStatus = getEventStatus(event)
                          return (
                            <tr key={`${event.fullKey}-${event.timestamp}`}>
                              <td className="border-b border-neutral-100 py-2 pr-4 font-medium">{event.kind}</td>
                              <td className="border-b border-neutral-100 py-2 pr-4">
                                <StatusBadge status={entryStatus} />
                              </td>
                              <td className="border-b border-neutral-100 py-2 pr-4">{event.table ?? '-'}</td>
                              <td className="border-b border-neutral-100 py-2 pr-4">{formatDuration(event.durationMs)}</td>
                              <td className="border-b border-neutral-100 py-2 text-neutral-600">{getEventSummary(event)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {run.detail === undefined && (
                <p className="border-b border-neutral-200 p-5 text-sm text-neutral-600">
                  Detailed events are unavailable for this run.
                </p>
              )}
              <details className="p-5" open>
                <summary className="cursor-pointer font-bold">Raw Log</summary>
                <pre className="mt-4 max-h-112 overflow-auto rounded-md bg-neutral-950 p-4 text-xs leading-relaxed text-neutral-100">
                  {JSON.stringify(run.detail ?? run, null, 2)}
                </pre>
              </details>
            </>
          )}
    </section>
  )
}
