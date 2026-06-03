import type {
  WorkflowRunDetail,
  WorkflowRunStatus,
  WorkflowRunSummary,
} from './workflow-logs'
import { getWorkflowSummaryTables } from './workflow-log-helpers'

const REFRESH_GROUP_WINDOW_MS = 15 * 60 * 1000

function getGroupedStatus(summaries: WorkflowRunSummary[]): WorkflowRunStatus {
  const statuses = summaries.map(summary => summary.status)
  const recordCount = summaries.reduce((total, summary) => total + (summary.recordCount ?? 0), 0)

  if (statuses.includes('failure')) {
    return recordCount > 0 ? 'warning' : 'failure'
  }

  if (statuses.includes('warning')) {
    return 'warning'
  }

  if (statuses.includes('success')) {
    return 'success'
  }

  if (statuses.includes('running')) {
    return 'running'
  }

  return 'skipped'
}

function getGroupedRefreshSummaryText(summaries: WorkflowRunSummary[], tableCount: number): string {
  const recordCount = summaries.reduce((total, summary) => total + (summary.recordCount ?? 0), 0)
  const skippedCount = summaries.filter(summary => (
    summary.status === 'skipped'
    || summary.reason === 'refresh already in progress'
  )).length
  const warningCount = summaries.filter(summary => (
    (summary.status === 'warning' || summary.status === 'failure')
    && summary.reason !== 'refresh already in progress'
  )).length
  const parts = [
    `${tableCount} tables`,
    `${recordCount} records`,
  ]

  if (skippedCount > 0) {
    parts.push(`${skippedCount} skipped`)
  }

  if (warningCount > 0) {
    parts.push(`${warningCount} warning${warningCount === 1 ? '' : 's'}`)
  }

  return parts.join(' · ')
}

function isSingleTableRefresh(summary: WorkflowRunSummary): boolean {
  return getWorkflowSummaryTables(summary).length === 1
}

function shouldGroupLegacyRefreshes(summaries: WorkflowRunSummary[]): boolean {
  return summaries.length > 1
    && summaries.every(isSingleTableRefresh)
    && summaries.some(summary => summary.reason === 'refresh already in progress')
}

function shouldJoinRefreshGroup(group: WorkflowRunSummary[], summary: WorkflowRunSummary, lastEndedAt: number): boolean {
  if (summary.startedAt - lastEndedAt > REFRESH_GROUP_WINDOW_MS) {
    return false
  }

  const firstOwner = group[0]?.guardOwner
  if (firstOwner !== undefined || summary.guardOwner !== undefined) {
    return firstOwner !== undefined
      && summary.guardOwner !== undefined
      && firstOwner === summary.guardOwner
  }

  return isSingleTableRefresh(summary)
}

function groupRefreshSummaries(summaries: WorkflowRunSummary[]): WorkflowRunSummary[] {
  const ordered = [...summaries].sort((a, b) => a.startedAt - b.startedAt)
  const groups: WorkflowRunSummary[][] = []

  for (const summary of ordered) {
    const lastGroup = groups.at(-1)
    const lastEndedAt = lastGroup === undefined
      ? undefined
      : Math.max(...lastGroup.map(item => item.endedAt))

    if (
      lastGroup === undefined
      || lastEndedAt === undefined
      || !shouldJoinRefreshGroup(lastGroup, summary, lastEndedAt)
    ) {
      groups.push([summary])
    }
    else {
      lastGroup.push(summary)
    }
  }

  return groups.flatMap((group) => {
    if (
      group.length === 1
      || (group[0]?.guardOwner === undefined && !shouldGroupLegacyRefreshes(group))
    ) {
      return group[0]
    }

    const startedAt = Math.min(...group.map(summary => summary.startedAt))
    const endedAt = Math.max(...group.map(summary => summary.endedAt))
    const tableNames = Array.from(new Set(group.flatMap(getWorkflowSummaryTables))).sort((a, b) => a.localeCompare(b))
    const detailKeys = group
      .sort((a, b) => a.startedAt - b.startedAt)
      .flatMap(summary => summary.detailKeys ?? [summary.detailKey])
    const first = group[0]

    return [{
      ...first,
      key: `group:${first.sourceId}:${first.date}:${startedAt}`,
      detailKey: `group:${first.sourceId}:${first.date}:${startedAt}`,
      detailKeys,
      status: getGroupedStatus(group),
      summary: getGroupedRefreshSummaryText(group, tableNames.length),
      startedAt,
      endedAt,
      durationMs: endedAt - startedAt,
      tableNames,
      requestedTables: tableNames,
      dueTables: tableNames,
      recordCount: group.reduce((total, summary) => total + (summary.recordCount ?? 0), 0),
      logCount: group.reduce((total, summary) => total + summary.logCount, 0),
      reason: undefined,
    }]
  })
}

export function groupWorkflowRunSummaries(summaries: WorkflowRunSummary[]): WorkflowRunSummary[] {
  const refreshSummaries = summaries.filter(summary => summary.sourceId === 'airtable-refresh')
  const otherSummaries = summaries.filter(summary => summary.sourceId !== 'airtable-refresh')

  return [
    ...groupRefreshSummaries(refreshSummaries),
    ...otherSummaries,
  ].sort((a, b) => b.endedAt - a.endedAt)
}

export function mergeWorkflowRunDetails(
  summary: WorkflowRunSummary,
  details: WorkflowRunDetail[],
): WorkflowRunDetail | undefined {
  if (details.length === 0) {
    return undefined
  }

  return {
    schemaVersion: 1,
    summary,
    events: details
      .flatMap(detail => detail.events)
      .sort((a, b) => a.timestamp - b.timestamp),
  }
}
