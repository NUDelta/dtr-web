import type { AuditRun } from './types'
import type { OpsLogEntry } from '@/lib/ops/audit-logs'
import {
  getEventStatus,
  getOverallStatus,
} from './runStatus'
import {
  getRunSummary,
  getRunTitle,
} from './runText'

export function getSelectedRun(
  runs: AuditRun[],
  selectedKey: string | undefined,
): AuditRun | undefined {
  return runs.length === 0
    ? undefined
    : runs.find(run => run.key === selectedKey) ?? runs[0]
}

function isRefreshRunEntry(entry: OpsLogEntry): boolean {
  return entry.sourceId === 'airtable-refresh' && entry.event.runId !== undefined
}

function makeRunFromEntries(key: string, entries: OpsLogEntry[]): AuditRun {
  const sortedEntries = [...entries].sort((a, b) => (b.event.timestamp ?? 0) - (a.event.timestamp ?? 0))
  const primary = sortedEntries.find(entry => entry.event.kind === 'refreshRunSuccess')
    ?? sortedEntries.find(entry => entry.event.kind === 'refreshRunFailure')
    ?? sortedEntries.find(entry => entry.event.kind === 'refreshRunSkipped')
    ?? sortedEntries[0]
  const tableNames = Array.from(new Set(
    sortedEntries
      .map(entry => entry.event.table)
      .filter((table): table is string => table !== undefined),
  )).sort((a, b) => a.localeCompare(b))
  const recordCount = sortedEntries.reduce((total, entry) => {
    return total + (entry.event.kind === 'refreshTableSuccess' ? entry.event.recordCount ?? 0 : 0)
  }, 0)
  const tableSummary = tableNames.length === 0
    ? 'no tables'
    : `${tableNames.length} tables`
  const failures = sortedEntries.filter(entry => getEventStatus(entry.event) === 'failure').length

  return {
    key,
    entries: sortedEntries,
    primary,
    sourceLabel: primary.sourceLabel,
    status: getOverallStatus(sortedEntries),
    title: 'Airtable Refresh',
    summary: failures > 0
      ? `${failures} errors · ${tableSummary}`
      : `${recordCount} records refreshed · ${tableSummary}`,
    tableNames,
    timestamp: primary.event.timestamp,
    durationMs: primary.event.durationMs,
    recordCount,
  }
}

function makeSingleEntryRun(entry: OpsLogEntry): AuditRun {
  return {
    key: entry.key,
    entries: [entry],
    primary: entry,
    sourceLabel: entry.sourceLabel,
    status: getEventStatus(entry.event),
    title: getRunTitle(entry),
    summary: getRunSummary(entry.event),
    tableNames: entry.event.table === undefined ? [] : [entry.event.table],
    timestamp: entry.event.timestamp,
    durationMs: entry.event.durationMs,
    recordCount: entry.event.recordCount,
  }
}

export function groupAuditRuns(logs: OpsLogEntry[]): AuditRun[] {
  const groupedRefreshRuns = new Map<string, OpsLogEntry[]>()
  const runs: AuditRun[] = []

  for (const entry of logs) {
    if (!isRefreshRunEntry(entry)) {
      runs.push(makeSingleEntryRun(entry))
      continue
    }

    const key = `airtable-refresh:${entry.event.runId}`
    const entries = groupedRefreshRuns.get(key) ?? []
    entries.push(entry)
    groupedRefreshRuns.set(key, entries)
  }

  for (const [key, entries] of groupedRefreshRuns) {
    runs.push(makeRunFromEntries(key, entries))
  }

  return runs.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
}
