import type { RunStatus } from './types'
import type {
  OpsLogSourceId,
  WorkflowRunSummary,
} from '@/lib/audit/workflow-logs'
import { getWorkflowEventStatus } from '@/lib/audit/workflow-log-helpers'

export function getLatestBySource(
  summaries: WorkflowRunSummary[],
  sourceId: OpsLogSourceId,
): WorkflowRunSummary | undefined {
  return summaries.find(summary => summary.sourceId === sourceId)
}

export function getEventStatus(event: CacheLogEvent): RunStatus {
  return getWorkflowEventStatus(event)
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
