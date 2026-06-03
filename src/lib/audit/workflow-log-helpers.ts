import type {
  WorkflowRunStatus,
  WorkflowRunSummary,
} from './workflow-log-types'

export function getWorkflowEventStatus(event: CacheLogEvent): WorkflowRunStatus {
  if (event.kind === 'r2GcRunSuccess' && event.reason?.startsWith('last run ')) {
    return 'skipped'
  }

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
    event.capped === true
    || (event.confirmedOrphanCount ?? 0) > 0
    || (event.newOrphanCount ?? 0) > 0
    || (event.missingTables?.length ?? 0) > 0
    || (event.reason !== undefined && !event.kind.endsWith('Success'))
  ) {
    return 'warning'
  }

  return 'success'
}

export function getWorkflowEventTables(event: CacheLogEvent): string[] {
  return [
    event.table,
    ...(event.dueTables ?? []),
    ...(event.requestedTables ?? []),
  ].filter((table): table is string => typeof table === 'string' && table.length > 0)
}

export function getWorkflowSummaryTables(summary: WorkflowRunSummary): string[] {
  return Array.from(new Set([
    ...summary.tableNames,
    ...(summary.dueTables ?? []),
    ...(summary.requestedTables ?? []),
  ])).sort((a, b) => a.localeCompare(b))
}
