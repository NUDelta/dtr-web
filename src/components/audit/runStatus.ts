import type { RunStatus } from './types'
import type {
  OpsLogSourceId,
  WorkflowRunSummary,
} from '@/lib/audit/workflow-logs'

export function getLatestBySource(
  summaries: WorkflowRunSummary[],
  sourceId: OpsLogSourceId,
): WorkflowRunSummary | undefined {
  return summaries.find(summary => summary.sourceId === sourceId)
}

export function getEventStatus(event: CacheLogEvent): RunStatus {
  if (event.kind === 'refreshGuard') {
    if (event.reason === 'refresh already in progress') {
      return 'skipped'
    }

    return event.error === undefined ? 'success' : 'warning'
  }

  if (
    event.kind.endsWith('Failure')
    || event.kind.endsWith('Error')
    || event.error !== undefined
  ) {
    return 'failure'
  }

  if (event.kind.endsWith('Start')) {
    return 'running'
  }

  if (event.kind.endsWith('Skipped')) {
    return 'skipped'
  }

  if (
    event.kind === 'r2GcOrphanState'
    || event.capped === true
    || (event.confirmedOrphanCount ?? 0) > 0
    || (event.newOrphanCount ?? 0) > 0
    || (event.missingTables?.length ?? 0) > 0
    || (event.reason !== undefined && !event.kind.endsWith('Success'))
  ) {
    return 'warning'
  }

  return 'success'
}

export function getOverallStatus(summaries: Array<WorkflowRunSummary | undefined>): RunStatus {
  const statuses = summaries
    .filter((summary): summary is WorkflowRunSummary => summary !== undefined)
    .map(summary => summary.status)

  if (statuses.includes('failure')) {
    return 'failure'
  }

  if (statuses.includes('warning')) {
    return 'warning'
  }

  if (statuses.includes('success')) {
    return 'success'
  }

  if (statuses.includes('skipped')) {
    return 'skipped'
  }

  return statuses.includes('running') ? 'running' : 'skipped'
}

export function getLastSevenDays(summaries: WorkflowRunSummary[]): Array<{ day: string, status?: RunStatus }> {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const dateKey = date.toISOString().slice(0, 10)
    const daySummaries = summaries.filter(summary => summary.date === dateKey)

    return {
      day: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
      status: daySummaries.length === 0 ? undefined : getOverallStatus(daySummaries),
    }
  })
}
