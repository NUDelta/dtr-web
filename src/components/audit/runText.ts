import type { OpsLogEntry } from '@/lib/ops/audit-logs'

export function getRunTitle(entry: OpsLogEntry): string {
  const base = entry.sourceLabel.replace('R2 GC Orphans', 'R2 Orphan Tracking')
  return entry.event.table === undefined ? base : `${base} / ${entry.event.table}`
}

export function getRunSummary(event: CacheLogEvent): string {
  if (event.reason !== undefined) {
    return event.reason
  }

  if (event.kind === 'refreshTableSuccess') {
    return `${event.recordCount ?? 0} records refreshed · KV cache updated`
  }

  if (event.kind === 'backupTableSuccess') {
    return `${event.recordCount ?? 0} records backed up · ${event.affectedCount ?? 0} R2 references`
  }

  if (event.kind === 'backupLogArchive') {
    return `${event.logCount ?? 0} logs archived`
  }

  if (event.kind === 'r2GcOrphanState') {
    return `${event.confirmedOrphanCount ?? 0} confirmed · ${event.newOrphanCount ?? 0} new orphan candidates`
  }

  if (event.recordCount !== undefined) {
    return `${event.recordCount} records`
  }

  return event.affectedCount === undefined ? event.kind : `${event.affectedCount} affected`
}
