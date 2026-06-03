export function getEventSummary(event: CacheLogEvent): string {
  if (event.reason !== undefined) {
    return event.reason
  }

  if (event.kind === 'refreshTableSuccess') {
    return `${event.recordCount ?? 0} records refreshed`
  }

  if (event.kind === 'backupTableSuccess') {
    return `${event.recordCount ?? 0} records backed up · ${event.affectedCount ?? 0} R2 references`
  }

  if (event.kind === 'r2GcOrphanState') {
    return `${event.confirmedOrphanCount ?? 0} confirmed · ${event.newOrphanCount ?? 0} new orphan candidates`
  }

  if (event.recordCount !== undefined) {
    return `${event.recordCount} records`
  }

  return event.affectedCount === undefined ? event.kind : `${event.affectedCount} affected`
}
