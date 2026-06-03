const EVENT_LABELS: Partial<Record<CacheKind, string>> = {
  refreshRunStart: 'Run started',
  refreshGuard: 'Refresh guard',
  refreshTableStart: 'Table refresh started',
  refreshTableSuccess: 'Table refreshed',
  refreshTableFailure: 'Table refresh failed',
  refreshStateWrite: 'Refresh state saved',
  refreshRunSuccess: 'Run completed',
  refreshRunSkipped: 'Run skipped',
  refreshRunFailure: 'Run failed',
  backupRunStart: 'Backup started',
  backupRunSuccess: 'Backup completed',
  backupRunSkipped: 'Backup skipped',
  backupRunFailure: 'Backup failed',
  backupTableSuccess: 'Table backed up',
  backupLogArchive: 'Logs archived',
  backupR2ReferenceFailure: 'R2 reference failed',
  r2GcRunStart: 'R2 GC started',
  r2GcRunSuccess: 'R2 GC completed',
  r2GcRunFailure: 'R2 GC failed',
  r2GcOrphanState: 'Orphan state updated',
  workflowLogRetention: 'Log retention cleaned',
}

const STATUS_SUMMARY_PATTERN = /\b(?:failure|failures|skipped|warning|warnings)\b/i

export function splitRunSummary(summary: string): {
  detail?: string
  primary: string
} {
  const parts = summary
    .split(' · ')
    .map(part => part.trim())
    .filter(part => part.length > 0)
  const statusParts = parts.filter(part => STATUS_SUMMARY_PATTERN.test(part))
  const primaryParts = parts.filter(part => !STATUS_SUMMARY_PATTERN.test(part))

  return {
    primary: primaryParts.length === 0 ? summary : primaryParts.join(' · '),
    detail: statusParts.length === 0 ? undefined : statusParts.join(' · '),
  }
}

function readCloudflareErrorMessage(value: unknown): string | undefined {
  if (
    typeof value !== 'object'
    || value === null
    || !('errors' in value)
    || !Array.isArray(value.errors)
  ) {
    return undefined
  }

  const firstError = value.errors[0] as { message?: unknown } | undefined
  return typeof firstError?.message === 'string' ? firstError.message : undefined
}

function getReadableDiagnostic(value: string): string {
  const status = value.slice(0, 3)
  if (!/^\d{3}$/.test(status) || value[3] !== ' ') {
    return value
  }

  const body = value.slice(4).trimStart()

  try {
    const parsed: unknown = JSON.parse(body)
    const message = readCloudflareErrorMessage(parsed)

    if (status === '429' && message?.includes('free usage limit')) {
      return 'Cloudflare KV daily quota reached (429). Retry after the quota resets.'
    }

    if (message !== undefined) {
      return `${message} (${status})`
    }
  }
  catch {
    // Keep the original text when the response body is not JSON.
  }

  return value
}

export function getEventLabel(event: CacheLogEvent): string {
  return EVENT_LABELS[event.kind] ?? event.kind
}

export function getEventSummary(event: CacheLogEvent): string {
  if (event.reason !== undefined) {
    return getReadableDiagnostic(event.reason)
  }

  if (typeof event.error === 'string') {
    return getReadableDiagnostic(event.error)
  }

  if (event.kind === 'refreshTableSuccess') {
    return `${event.recordCount ?? 0} records refreshed`
  }

  if (event.kind === 'refreshRunStart') {
    return `Requested ${getEventTables(event)}`
  }

  if (event.kind === 'refreshRunSuccess') {
    return `${event.recordCount ?? 0} records refreshed`
  }

  if (event.kind === 'refreshTableStart') {
    return 'Starting table refresh'
  }

  if (event.kind === 'refreshStateWrite') {
    return `${event.affectedCount ?? 0} table state ${event.affectedCount === 1 ? 'entry' : 'entries'} saved`
  }

  if (event.kind === 'backupTableSuccess') {
    return `${event.recordCount ?? 0} records backed up · ${event.affectedCount ?? 0} R2 references`
  }

  if (event.kind === 'backupRunSuccess') {
    return `${event.recordCount ?? 0} records backed up · ${event.affectedCount ?? 0} tables`
  }

  if (event.kind === 'r2GcRunSuccess') {
    return `${event.deletedCount ?? 0} deleted · ${event.newOrphanCount ?? 0} new orphan candidates`
  }

  if (event.kind === 'r2GcOrphanState') {
    return `${event.confirmedOrphanCount ?? 0} confirmed · ${event.newOrphanCount ?? 0} new orphan candidates`
  }

  if (event.kind === 'workflowLogRetention') {
    return `${event.deletedCount ?? 0} old logs deleted · ${event.scannedCount ?? 0} scanned`
  }

  if (event.recordCount !== undefined) {
    return `${event.recordCount} records`
  }

  return event.affectedCount === undefined ? event.kind : `${event.affectedCount} affected`
}

export function getEventTables(event: CacheLogEvent): string {
  const tables = Array.from(new Set([
    event.table,
    ...(event.dueTables ?? []),
    ...(event.requestedTables ?? []),
  ].filter((table): table is string => typeof table === 'string' && table.length > 0)))

  return tables.length === 0 ? '-' : tables.join(', ')
}
