import type {
  OpsLogSource,
  OpsLogSourceId,
  WorkflowRunStatus,
  WorkflowRunSummary,
} from './workflow-log-types'
import { formatBytes } from './format-bytes'
import {
  getWorkflowEventStatus,
  getWorkflowEventTables,
} from './workflow-log-helpers'
import { WORKFLOW_LOG_PREFIX } from './workflow-log-types'

function getEventStatus(event: CacheLogEvent): WorkflowRunStatus {
  return getWorkflowEventStatus(event)
}

function getOverallStatus(events: CacheLogEvent[]): WorkflowRunStatus {
  const statuses = events.map(getEventStatus)
  const hasRunSkipped = events.some(event => event.kind.endsWith('RunSkipped'))
  const hasRunSuccess = events.some(event => event.kind.endsWith('RunSuccess') && getEventStatus(event) === 'success')

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

  if (statuses.includes('success')) {
    return 'success'
  }

  if (statuses.includes('skipped')) {
    return 'skipped'
  }

  return statuses.includes('running') ? 'running' : 'skipped'
}

function getPrimaryEvent(events: CacheLogEvent[]): CacheLogEvent {
  return events.find(event => event.kind.endsWith('RunFailure'))
    ?? events.find(event => event.kind.endsWith('RunSuccess'))
    ?? events.find(event => event.kind.endsWith('RunSkipped'))
    ?? events.find(event => event.kind.endsWith('Failure'))
    ?? events.find(event => event.kind.endsWith('Success'))
    ?? events.find(event => event.kind.endsWith('Skipped'))
    ?? events[events.length - 1]
}

function getR2GcSummaryText(event: CacheLogEvent): string {
  if (event.kind === 'r2GcRunSkipped' && event.reason !== undefined) {
    return event.reason
  }

  const parts = [
    `${event.scannedCount ?? 0} scanned`,
    `${event.liveCount ?? 0} live`,
    `${event.deletedCount ?? 0} deleted`,
    `${event.newOrphanCount ?? 0} new orphan candidates`,
  ]

  if ((event.deletedBytes ?? 0) > 0) {
    parts.push(`${formatBytes(event.deletedBytes ?? 0)} deleted`)
  }

  if ((event.confirmedOrphanCount ?? 0) > 0) {
    parts.push(`${event.confirmedOrphanCount} confirmed orphan candidates`)
  }

  if (event.reason !== undefined) {
    parts.push(event.reason)
  }

  return parts.join(' · ')
}

function getUpdateSummaryText(event: CacheLogEvent): string | undefined {
  if (event.updatedCount === undefined) {
    return undefined
  }

  const parts = [
    `${event.updatedCount} data changes`,
    event.createdCount === undefined ? undefined : `${event.createdCount} new`,
    event.changedCount === undefined ? undefined : `${event.changedCount} changed`,
    event.removedCount === undefined || event.removedCount === 0 ? undefined : `${event.removedCount} removed`,
  ].filter((part): part is string => part !== undefined)

  return parts.join(' · ')
}

function getSummaryText(sourceId: OpsLogSourceId, event: CacheLogEvent, events: CacheLogEvent[]): string {
  if (event.reason !== undefined) {
    if (sourceId === 'r2-gc') {
      return getR2GcSummaryText(event)
    }

    return event.reason
  }

  if (sourceId === 'airtable-refresh') {
    const tableCount = new Set(events.flatMap(getWorkflowEventTables)).size
    return [
      `${event.recordCount ?? 0} records refreshed`,
      `${tableCount} tables`,
      getUpdateSummaryText(event),
    ].filter((part): part is string => part !== undefined).join(' · ')
  }

  if (sourceId === 'airtable-backup') {
    return [
      `${event.recordCount ?? 0} records backed up`,
      `${event.affectedCount ?? 0} tables`,
      getUpdateSummaryText(event),
      event.sizeBytes === undefined ? undefined : formatBytes(event.sizeBytes),
    ].filter((part): part is string => part !== undefined).join(' · ')
  }

  return getR2GcSummaryText(event)
}

function getObjectDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

function buildWorkflowLogKeys(sourceId: OpsLogSourceId, date: string, runId: string) {
  return {
    summaryKey: `${WORKFLOW_LOG_PREFIX}/summaries/${sourceId}/${date}/${runId}.json`,
    detailKey: `${WORKFLOW_LOG_PREFIX}/details/${sourceId}/${date}/${runId}.json`,
  }
}

function getGuardOwner(events: CacheLogEvent[]): string | undefined {
  const owner = events.find(event => typeof event.owner === 'string')?.owner
  return typeof owner === 'string' && owner.length > 0 ? owner : undefined
}

export function buildWorkflowRunSummary(
  source: OpsLogSource,
  runId: string,
  startedAt: number,
  events: CacheLogEvent[],
): WorkflowRunSummary {
  const endedAt = Date.now()
  const primary = getPrimaryEvent(events)
  const status = getOverallStatus(events)
  const date = getObjectDate(startedAt)
  const { summaryKey, detailKey } = buildWorkflowLogKeys(source.id, date, runId)
  const tableNames = Array.from(new Set(
    events
      .flatMap(getWorkflowEventTables),
  )).sort((a, b) => a.localeCompare(b))
  const guardOwner = getGuardOwner(events)

  return {
    schemaVersion: 1,
    sourceId: source.id,
    sourceLabel: source.label,
    runId,
    date,
    key: summaryKey,
    detailKey,
    status,
    title: source.label,
    summary: getSummaryText(source.id, primary, events),
    startedAt,
    endedAt,
    durationMs: primary.durationMs ?? endedAt - startedAt,
    tableNames,
    requestedTables: primary.requestedTables,
    dueTables: primary.dueTables,
    guardOwner,
    recordCount: primary.recordCount,
    createdCount: primary.createdCount,
    changedCount: primary.changedCount,
    removedCount: primary.removedCount,
    updatedCount: primary.updatedCount,
    sizeBytes: primary.sizeBytes,
    affectedCount: primary.affectedCount,
    deletedCount: primary.deletedCount,
    scannedBytes: primary.scannedBytes,
    deletedBytes: primary.deletedBytes,
    logCount: events.length,
    reason: primary.reason,
    bucket: primary.bucket,
    prefix: primary.prefix,
    scannedCount: primary.scannedCount,
    liveCount: primary.liveCount,
    newOrphanCount: primary.newOrphanCount,
    confirmedOrphanCount: primary.confirmedOrphanCount,
    recoveredOrphanCount: primary.recoveredOrphanCount,
    prunedOrphanCount: primary.prunedOrphanCount,
    missingTables: primary.missingTables,
    capped: primary.capped,
  }
}
