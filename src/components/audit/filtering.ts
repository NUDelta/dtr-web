import type { AuditFilters, TimeRange } from './types'
import type { OpsLogEntry } from '@/lib/ops/audit-logs'
import { getEventStatus } from './runStatus'
import { getRunSummary } from './runText'

export function buildAuditHref(
  filters: AuditFilters,
  updates: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams()
  const next = {
    source: filters.source,
    status: filters.status,
    table: filters.table,
    range: filters.range,
    q: filters.q,
    ...updates,
  }

  for (const [key, value] of Object.entries(next)) {
    if (value !== undefined && value !== '' && value !== 'all' && value !== '7d') {
      params.set(key, value)
    }
  }

  const query = params.toString()
  return query.length === 0 ? '/audit' : `/audit?${query}`
}

export function getUniqueTables(logs: OpsLogEntry[]): string[] {
  return Array.from(new Set(
    logs
      .map(entry => entry.event.table)
      .filter((table): table is string => table !== undefined),
  )).sort((a, b) => a.localeCompare(b))
}

function isWithinRange(entry: OpsLogEntry, range: TimeRange): boolean {
  if (range === 'all') {
    return true
  }

  const days = range === '7d' ? 7 : 30
  return (entry.event.timestamp ?? 0) >= Date.now() - days * 24 * 60 * 60 * 1000
}

function shouldShowAuditLog(entry: OpsLogEntry): boolean {
  return entry.sourceId !== 'airtable-cache'
}

export function filterLogs(logs: OpsLogEntry[], filters: AuditFilters): OpsLogEntry[] {
  const query = filters.q.trim().toLowerCase()

  return logs.filter((entry) => {
    const event = entry.event
    if (!shouldShowAuditLog(entry) || !isWithinRange(entry, filters.range)) {
      return false
    }

    if (filters.status !== 'all' && getEventStatus(event) !== filters.status) {
      return false
    }

    if (filters.table !== '' && event.table !== filters.table) {
      return false
    }

    if (query.length === 0) {
      return true
    }

    return [
      entry.sourceLabel,
      event.kind,
      event.runId,
      event.table,
      event.reason,
      getRunSummary(event),
    ].some(value => value?.toLowerCase().includes(query))
  })
}
