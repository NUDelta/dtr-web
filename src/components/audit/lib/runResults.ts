import type { RunStatus } from './types'
import type { OpsLogSourceId } from '@/lib/audit/workflow-logs'
import { getEventStatus } from './runStatus'
import {
  formatWorkflowEventTables,
  getEventSummary,
} from './runText'

interface WorkflowResultGroup {
  detail: string
  durationMs?: number
  elapsedMs: number
  issueDetail?: string
  key: string
  metrics: string[]
  status: RunStatus
  timestamp: number
  title: string
}

function rankStatus(status: RunStatus): number {
  if (status === 'failure') {
    return 5
  }

  if (status === 'warning') {
    return 4
  }

  if (status === 'success') {
    return 3
  }

  if (status === 'skipped') {
    return 2
  }

  return 1
}

function getGroupStatus(events: CacheLogEvent[]): RunStatus {
  const statuses = events.map(getEventStatus)
  const hasRunSuccess = events.some(event => event.kind.endsWith('RunSuccess') && getEventStatus(event) === 'success')
  const hasRunSkipped = events.some(event => event.kind.endsWith('RunSkipped'))

  if (statuses.includes('failure')) {
    return 'failure'
  }

  if (statuses.includes('warning')) {
    return 'warning'
  }

  if (hasRunSuccess) {
    return 'success'
  }

  if (hasRunSkipped) {
    return 'skipped'
  }

  return statuses.sort((a, b) => rankStatus(b) - rankStatus(a))[0] ?? 'running'
}

function getGroupDetail(events: CacheLogEvent[]): string {
  const sorted = [...events].sort((a, b) => rankStatus(getEventStatus(b)) - rankStatus(getEventStatus(a)))
  const issue = sorted.find(event => getEventStatus(event) === 'failure')
    ?? sorted.find(event => getEventStatus(event) === 'warning')
  const success = events.findLast(event => getEventStatus(event) === 'success' && event.recordCount !== undefined)

  if (issue !== undefined && success !== undefined) {
    return getEventSummary(issue)
  }

  const primary = issue
    ?? events.findLast(event => getEventStatus(event) === 'success')
    ?? events.findLast(event => getEventStatus(event) === 'skipped')
    ?? events.at(-1)

  return primary === undefined ? 'No events recorded' : getEventSummary(primary)
}

function getPostRefreshIssue(events: CacheLogEvent[]): string | undefined {
  const issue = [...events]
    .sort((a, b) => rankStatus(getEventStatus(b)) - rankStatus(getEventStatus(a)))
    .find(event => getEventStatus(event) === 'failure' || getEventStatus(event) === 'warning')
  const success = events.findLast(event => getEventStatus(event) === 'success' && event.recordCount !== undefined)

  return issue !== undefined && success !== undefined ? getEventSummary(issue) : undefined
}

function getR2GcResultTitle(event: CacheLogEvent): string {
  if (event.kind === 'workflowLogRetention') {
    return 'Workflow log retention'
  }

  if (event.kind === 'r2GcOrphanState') {
    return 'Orphan tracking'
  }

  if (
    event.kind === 'r2GcRunSkipped'
    || (event.kind === 'r2GcRunSuccess' && event.reason?.startsWith('last run '))
  ) {
    return 'Cleanup schedule'
  }

  return 'Image cleanup'
}

function getResultGroupKey(sourceId: OpsLogSourceId, event: CacheLogEvent): string | undefined {
  if (sourceId === 'airtable-refresh') {
    return event.runId ?? `${event.fullKey}:${event.timestamp}`
  }

  if (sourceId === 'airtable-backup') {
    if (event.table !== undefined) {
      return `table:${event.table}`
    }

    if (event.kind === 'backupRunStart' || event.kind === 'backupRunSuccess') {
      return undefined
    }

    return 'backup-run'
  }

  if (sourceId === 'r2-gc') {
    if (event.kind === 'r2GcRunStart') {
      return undefined
    }

    if (event.kind === 'workflowLogRetention') {
      return 'workflow-log-retention'
    }

    if (event.kind === 'r2GcOrphanState') {
      return 'orphan-state'
    }

    return 'r2-gc-run'
  }

  return event.table ?? event.kind
}

function getGroupTitle(sourceId: OpsLogSourceId, events: CacheLogEvent[]): string {
  const first = events[0]
  const tableLabel = Array.from(new Set(events.map(formatWorkflowEventTables).filter(table => table !== '-'))).join(', ')

  if (tableLabel.length > 0) {
    return tableLabel
  }

  if (sourceId === 'r2-gc' && first !== undefined) {
    return getR2GcResultTitle(first)
  }

  if (sourceId === 'airtable-backup') {
    return 'Backup run'
  }

  return 'Run'
}

function getMetricChips(sourceId: OpsLogSourceId, events: CacheLogEvent[]): string[] {
  const primary = events.findLast(event => event.recordCount !== undefined || event.scannedCount !== undefined)
    ?? events.at(-1)

  if (primary === undefined) {
    return []
  }

  if (sourceId === 'airtable-refresh') {
    return primary.recordCount === undefined ? [] : [`${primary.recordCount} records`]
  }

  if (sourceId === 'airtable-backup') {
    return [
      primary.recordCount === undefined ? undefined : `${primary.recordCount} records`,
      primary.affectedCount === undefined ? undefined : `${primary.affectedCount} R2 refs`,
    ].filter((value): value is string => value !== undefined)
  }

  if (sourceId === 'r2-gc') {
    return [
      primary.scannedCount === undefined ? undefined : `${primary.scannedCount} scanned`,
      primary.liveCount === undefined ? undefined : `${primary.liveCount} live`,
      primary.deletedCount === undefined ? undefined : `${primary.deletedCount} deleted`,
      primary.newOrphanCount === undefined ? undefined : `${primary.newOrphanCount} new`,
      primary.confirmedOrphanCount === undefined ? undefined : `${primary.confirmedOrphanCount} confirmed`,
      primary.recoveredOrphanCount === undefined || primary.recoveredOrphanCount === 0 ? undefined : `${primary.recoveredOrphanCount} recovered`,
      primary.prunedOrphanCount === undefined || primary.prunedOrphanCount === 0 ? undefined : `${primary.prunedOrphanCount} pruned`,
    ].filter((value): value is string => value !== undefined)
  }

  return []
}

export function getResultsSectionTitle(sourceId: OpsLogSourceId): string {
  if (sourceId === 'airtable-backup') {
    return 'Backup Results'
  }

  if (sourceId === 'r2-gc') {
    return 'Cleanup Results'
  }

  return 'Table Results'
}

export function groupWorkflowResultEvents(
  sourceId: OpsLogSourceId,
  events: CacheLogEvent[],
  startedAt: number,
): WorkflowResultGroup[] {
  const groups = new Map<string, CacheLogEvent[]>()

  for (const event of events) {
    const key = getResultGroupKey(sourceId, event)
    if (key === undefined) {
      continue
    }

    groups.set(key, [...(groups.get(key) ?? []), event])
  }

  return Array.from(groups.entries())
    .map(([key, groupEvents]) => {
      const sortedEvents = [...groupEvents].sort((a, b) => a.timestamp - b.timestamp)
      const first = sortedEvents[0]
      const last = sortedEvents.at(-1) ?? first

      return {
        key,
        issueDetail: sourceId === 'airtable-refresh' ? getPostRefreshIssue(sortedEvents) : undefined,
        metrics: getMetricChips(sourceId, sortedEvents),
        status: getGroupStatus(sortedEvents),
        title: getGroupTitle(sourceId, sortedEvents),
        timestamp: first?.timestamp ?? startedAt,
        elapsedMs: Math.max(0, (first?.timestamp ?? startedAt) - startedAt),
        durationMs: last?.durationMs ?? ((last?.timestamp ?? startedAt) - (first?.timestamp ?? startedAt)),
        detail: getGroupDetail(sortedEvents),
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp)
}
