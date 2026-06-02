import type { RunStatus } from './types'
import type { OpsLogEntry } from '@/lib/ops/audit-logs'
import type { OpsLogSourceId } from '@/lib/ops/logging'

export function getEventStatus(event: CacheLogEvent): RunStatus {
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

export function getLatestBySource(
  logs: OpsLogEntry[],
  sourceId: OpsLogSourceId,
): OpsLogEntry | undefined {
  return logs.find(entry => entry.sourceId === sourceId)
}

export function getOverallStatus(entries: Array<OpsLogEntry | undefined>): RunStatus {
  const statuses = entries
    .filter((entry): entry is OpsLogEntry => entry !== undefined)
    .map(entry => getEventStatus(entry.event))

  if (statuses.includes('failure')) {
    return 'failure'
  }

  if (statuses.includes('warning')) {
    return 'warning'
  }

  if (statuses.includes('running')) {
    return 'running'
  }

  return statuses.includes('success') ? 'success' : 'skipped'
}

export function getLastSevenDays(logs: OpsLogEntry[]): Array<{ day: string, status?: RunStatus }> {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const dateKey = date.toISOString().slice(0, 10)
    const dayLogs = logs.filter((entry) => {
      return new Date(entry.event.timestamp ?? 0).toISOString().slice(0, 10) === dateKey
    })

    return {
      day: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
      status: dayLogs.length === 0 ? undefined : getOverallStatus(dayLogs),
    }
  })
}
