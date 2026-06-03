import type { AuditRun } from './types'
import { ListChecks } from 'lucide-react'
import LocalTime from './LocalTime'
import {
  getResultsSectionTitle,
  groupWorkflowResultEvents,
} from './runResults'
import { StatusBadge } from './status'
import { STATUS_META } from './statusMeta'
import {
  formatDuration,
  splitRunSummary,
} from './utils'

interface RunDetailProps {
  run?: AuditRun
}

export default function RunDetail({
  run,
}: RunDetailProps) {
  const events = [...(run?.detail?.events ?? [])].sort((a, b) => a.timestamp - b.timestamp)
  const timelineGroups = run === undefined ? [] : groupWorkflowResultEvents(run.sourceId, events, run.startedAt)
  const summary = run === undefined ? undefined : splitRunSummary(run.summary)

  return (
    <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      {run === undefined
        ? (
            <div className="flex min-h-96 flex-col items-center justify-center p-8 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
                <ListChecks size={28} aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-xl font-bold tracking-normal text-neutral-950">Select a workflow run</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-600">
                Open a recent cache refresh, backup, or R2 cleanup run to inspect its result summary and raw log.
              </p>
            </div>
          )
        : (
            <>
              <div className="border-b border-neutral-200 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-normal">{run.title}</h2>
                  <StatusBadge status={run.status} />
                </div>
              </div>
              <div className="grid gap-5 border-b border-neutral-200 p-5 md:grid-cols-2">
                <div>
                  <h4 className="font-bold">Summary</h4>
                  <p className="mt-2 text-neutral-600">{summary?.primary ?? run.summary}</p>
                  {summary?.detail !== undefined && (
                    <p className="mt-1 text-sm font-medium text-amber-700">{summary.detail}</p>
                  )}
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-neutral-200 text-sm md:border-l md:pl-8">
                  <dt className="font-medium text-neutral-600">Started</dt>
                  <dd><LocalTime mode="dateTime" timestamp={run.startedAt} /></dd>
                  <dt className="font-medium text-neutral-600">Duration</dt>
                  <dd>{formatDuration(run.durationMs)}</dd>
                  <dt className="font-medium text-neutral-600">Run ID</dt>
                  <dd className="break-all rounded-md bg-neutral-50 px-2 py-1 font-mono text-sm leading-relaxed text-neutral-950">{run.runId}</dd>
                </dl>
              </div>
              {timelineGroups.length > 0 && (
                <div className="border-b border-neutral-200 p-5">
                  <h4 className="font-bold">{getResultsSectionTitle(run.sourceId)}</h4>
                  <ol className="mt-3 space-y-3">
                    {timelineGroups.map((group) => {
                      const meta = STATUS_META[group.status]
                      const Icon = meta.icon

                      return (
                        <li className="rounded-lg border border-neutral-200 p-4" key={group.key}>
                          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_max-content]">
                            <div className="flex min-w-0 gap-3">
                              <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${meta.bgClass} ${meta.textClass}`}>
                                <Icon size={19} aria-hidden="true" />
                              </span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h5 className="text-base font-bold tracking-normal">{group.title}</h5>
                                  <StatusBadge status={group.status} />
                                  {group.metrics.map(metric => (
                                    <span className="shrink-0 rounded-md bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700" key={metric}>
                                      {metric}
                                    </span>
                                  ))}
                                </div>
                                {group.issueDetail === undefined
                                  ? <p className="mt-2 text-sm text-neutral-600">{group.detail}</p>
                                  : (
                                      <p className="mt-2 text-sm text-neutral-600">
                                        <strong className="font-semibold text-neutral-950">Post-refresh issue:</strong>
                                        {' '}
                                        {group.issueDetail}
                                      </p>
                                    )}
                              </div>
                            </div>
                            <dl className="grid shrink-0 grid-cols-[auto_auto] gap-x-3 gap-y-1 text-right text-xs text-neutral-600">
                              <dt>Start</dt>
                              <dd className="font-medium text-neutral-950"><LocalTime mode="time" timestamp={group.timestamp} /></dd>
                              <dt>Elapsed</dt>
                              <dd className="font-medium text-neutral-950">{formatDuration(group.elapsedMs)}</dd>
                              <dt>Duration</dt>
                              <dd className="font-medium text-neutral-950">{formatDuration(group.durationMs)}</dd>
                            </dl>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              )}
              {run.detail === undefined && (
                <p className="border-b border-neutral-200 p-5 text-sm text-neutral-600">
                  Detailed events are unavailable for this run.
                </p>
              )}
              <details className="p-5">
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

export function RunDetailSkeleton({ run }: { run: AuditRun }) {
  return (
    <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold tracking-normal">{run.title}</h2>
          <StatusBadge status={run.status} />
        </div>
        <p className="mt-2 text-sm text-neutral-600">Loading workflow details...</p>
      </div>
      <div className="animate-pulse">
        <div className="grid gap-5 border-b border-neutral-200 p-5 md:grid-cols-2">
          <div className="space-y-3">
            <div className="h-4 w-24 rounded bg-neutral-200" />
            <div className="h-3 w-full rounded bg-neutral-100" />
            <div className="h-3 w-3/4 rounded bg-neutral-100" />
          </div>
          <div className="space-y-3 border-neutral-200 md:border-l md:pl-8">
            <div className="h-3 w-40 rounded bg-neutral-100" />
            <div className="h-3 w-32 rounded bg-neutral-100" />
            <div className="h-3 w-56 rounded bg-neutral-100" />
          </div>
        </div>
        <div className="space-y-3 p-5">
          <div className="h-4 w-28 rounded bg-neutral-200" />
          {Array.from({ length: 3 }, (_, index) => (
            <div className="grid gap-3 rounded-lg border border-neutral-100 p-4 md:grid-cols-[1fr_160px]" key={index}>
              <div className="space-y-3">
                <div className="h-4 w-48 rounded bg-neutral-100" />
                <div className="h-3 w-full rounded bg-neutral-100" />
              </div>
              <div className="space-y-2">
                <div className="h-3 rounded bg-neutral-100" />
                <div className="h-3 rounded bg-neutral-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
