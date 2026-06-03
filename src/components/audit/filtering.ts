import type { AuditFilters, TimeRange } from './types'
import type { WorkflowRunSummary } from '@/lib/audit/workflow-logs'

export function getRunTables(summary: WorkflowRunSummary): string[] {
  return Array.from(new Set([
    ...summary.tableNames,
    ...(summary.dueTables ?? []),
    ...(summary.requestedTables ?? []),
  ])).sort((a, b) => a.localeCompare(b))
}

export function buildAuditHref(
  filters: AuditFilters,
  updates: Record<string, number | string | undefined>,
): string {
  const params = new URLSearchParams()
  const next = {
    source: filters.source,
    status: filters.status,
    range: filters.range,
    q: filters.q,
    page: filters.page,
    ...updates,
  }

  for (const [key, value] of Object.entries(next)) {
    if (
      value !== undefined
      && value !== ''
      && value !== 'all'
      && value !== '7d'
      && !(key === 'page' && value === 1)
    ) {
      params.set(key, String(value))
    }
  }

  const query = params.toString()
  return query.length === 0 ? '/audit' : `/audit?${query}`
}

export function getUniqueTables(summaries: WorkflowRunSummary[]): string[] {
  return Array.from(new Set(
    summaries.flatMap(getRunTables),
  )).sort((a, b) => a.localeCompare(b))
}

function isWithinRange(summary: WorkflowRunSummary, range: TimeRange): boolean {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 60
  return summary.endedAt >= Date.now() - days * 24 * 60 * 60 * 1000
}

export function filterRuns(
  summaries: WorkflowRunSummary[],
  filters: AuditFilters,
): WorkflowRunSummary[] {
  const query = filters.q.trim().toLowerCase()

  return summaries.filter((summary) => {
    if (!isWithinRange(summary, filters.range)) {
      return false
    }

    if (filters.status !== 'all' && summary.status !== filters.status) {
      return false
    }

    const tableNames = getRunTables(summary)

    if (query.length === 0) {
      return true
    }

    return [
      summary.sourceLabel,
      summary.runId,
      summary.title,
      summary.summary,
      summary.reason,
      ...tableNames,
    ].some(value => value?.toLowerCase().includes(query))
  })
}
