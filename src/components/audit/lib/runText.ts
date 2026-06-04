import { getWorkflowEventTables } from '@/lib/audit/workflow-log-helpers'

const STATUS_SUMMARY_PATTERN = /\b(?:failure|failures|skipped|warning|warnings)\b/i
const HTTP_STATUS_MESSAGES: Partial<Record<string, string>> = {
  400: 'Bad request. Check the workflow payload and parameters.',
  401: 'Authentication failed. Check the token or secret used by this workflow.',
  403: 'Permission denied. Check the token scopes and resource access.',
  404: 'Resource not found. Check the configured bucket, key, namespace, or endpoint.',
  408: 'Request timed out before the upstream service responded. Retry the workflow.',
  409: 'Request conflicted with another operation. Retry after the current run finishes.',
  413: 'Request payload is too large. Reduce the batch size or object size.',
  429: 'Rate limit or quota reached. Retry after the quota window resets.',
  500: 'Upstream service returned an internal error. Retry later and check provider status if it repeats.',
  502: 'Bad gateway between Cloudflare and the origin. Retry later and check origin health.',
  503: 'Service temporarily unavailable. Retry later.',
  504: 'Gateway timeout. The upstream service did not respond in time.',
  520: 'Cloudflare received an unknown or unexpected origin response.',
  521: 'Cloudflare could not connect because the origin server is down.',
  522: 'Cloudflare timed out while connecting to the origin server.',
  523: 'Cloudflare could not reach the origin server. Check DNS and routing.',
  524: 'Cloudflare connected to the origin, but the origin took too long to respond.',
  525: 'Cloudflare SSL handshake with the origin failed. Check origin TLS configuration.',
  526: 'Cloudflare rejected the origin SSL certificate. Check certificate validity and hostname.',
  530: 'Cloudflare returned an origin or routing error. Check the error detail and Cloudflare logs.',
}
const MAX_DIAGNOSTIC_DETAIL_LENGTH = 180
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

export function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return '0 B'
  }

  let size = value
  let unitIndex = 0
  while (size >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
    size /= 1024
    unitIndex++
  }

  const formatted = size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)
  return `${formatted} ${BYTE_UNITS[unitIndex]}`
}

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

function truncateDiagnosticDetail(value: string): string {
  const singleLine = value.replace(/\s+/g, ' ').trim()
  return singleLine.length <= MAX_DIAGNOSTIC_DETAIL_LENGTH
    ? singleLine
    : `${singleLine.slice(0, MAX_DIAGNOSTIC_DETAIL_LENGTH - 1)}...`
}

function readMessageFromErrorItem(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value !== 'object' || value === null) {
    return undefined
  }

  const parsed = value as {
    detail?: unknown
    message?: unknown
    title?: unknown
  }

  return typeof parsed.message === 'string'
    ? parsed.message
    : typeof parsed.detail === 'string'
      ? parsed.detail
      : typeof parsed.title === 'string'
        ? parsed.title
        : undefined
}

function readStructuredErrorMessage(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined
  }

  const parsed = value as {
    error?: unknown
    errors?: unknown
    message?: unknown
    messages?: unknown
    title?: unknown
  }

  if (typeof parsed.message === 'string') {
    return parsed.message
  }

  if (typeof parsed.error === 'string') {
    return parsed.error
  }

  if (typeof parsed.title === 'string') {
    return parsed.title
  }

  for (const list of [parsed.errors, parsed.messages]) {
    if (Array.isArray(list)) {
      const message = list.map(readMessageFromErrorItem).find(item => item !== undefined)
      if (message !== undefined) {
        return message
      }
    }
  }

  return undefined
}

function formatHttpDiagnostic(status: string, body: string, message?: string): string {
  if (status === '429' && message?.includes('free usage limit')) {
    return 'Cloudflare KV daily quota reached (429). Retry after the quota resets.'
  }

  const fallback = HTTP_STATUS_MESSAGES[status] ?? `HTTP ${status} request failed.`
  const detail = message ?? (body.length > 0 ? body : undefined)

  if (detail === undefined) {
    return `${fallback} (${status})`
  }

  return `${fallback} (${status}) ${truncateDiagnosticDetail(detail)}`
}

function parseHttpError(value: string): { body: string, status: string } | undefined {
  const status = value.slice(0, 3)
  if (!/^\d{3}$/.test(status)) {
    return undefined
  }

  const separator = value[3]
  if (separator !== ' ' && separator !== ':' && separator !== '-') {
    return undefined
  }

  return {
    status,
    body: value.slice(4).trimStart(),
  }
}

function getReadableDiagnostic(value: string): string {
  const parsedError = parseHttpError(value)
  if (parsedError === undefined) {
    return value
  }

  try {
    const parsed: unknown = JSON.parse(parsedError.body)
    return formatHttpDiagnostic(parsedError.status, parsedError.body, readStructuredErrorMessage(parsed))
  }
  catch {
    return formatHttpDiagnostic(parsedError.status, parsedError.body)
  }
}

function formatR2GcStats(event: CacheLogEvent): string {
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
    parts.push(getReadableDiagnostic(event.reason))
  }

  return parts.join(' · ')
}

export function getEventSummary(event: CacheLogEvent): string {
  if (event.kind === 'r2GcRunSuccess') {
    return formatR2GcStats(event)
  }

  if (event.kind === 'r2GcRunSkipped') {
    return event.reason ?? 'Cleanup skipped'
  }

  if (event.reason !== undefined) {
    return getReadableDiagnostic(event.reason)
  }

  if (typeof event.error === 'string') {
    return getReadableDiagnostic(event.error)
  }

  if (event.kind === 'refreshTableSuccess') {
    return [
      `${event.recordCount ?? 0} records refreshed`,
      event.updatedCount === undefined ? undefined : `${event.updatedCount} updated`,
    ].filter((part): part is string => part !== undefined).join(' · ')
  }

  if (event.kind === 'refreshRunStart') {
    return `Requested ${formatWorkflowEventTables(event)}`
  }

  if (event.kind === 'refreshRunSuccess') {
    return [
      `${event.recordCount ?? 0} records refreshed`,
      event.updatedCount === undefined ? undefined : `${event.updatedCount} updated`,
    ].filter((part): part is string => part !== undefined).join(' · ')
  }

  if (event.kind === 'refreshTableStart') {
    return 'Starting table refresh'
  }

  if (event.kind === 'refreshStateWrite') {
    return `${event.affectedCount ?? 0} table state ${event.affectedCount === 1 ? 'entry' : 'entries'} saved`
  }

  if (event.kind === 'backupTableSuccess') {
    return [
      `${event.recordCount ?? 0} records backed up`,
      event.updatedCount === undefined ? undefined : `${event.updatedCount} updated`,
      `${event.affectedCount ?? 0} R2 references`,
      event.sizeBytes === undefined ? undefined : formatBytes(event.sizeBytes),
    ].filter((part): part is string => part !== undefined).join(' · ')
  }

  if (event.kind === 'backupRunSuccess') {
    return [
      `${event.recordCount ?? 0} records backed up`,
      event.updatedCount === undefined ? undefined : `${event.updatedCount} updated`,
      `${event.affectedCount ?? 0} tables`,
      event.sizeBytes === undefined ? undefined : formatBytes(event.sizeBytes),
    ].filter((part): part is string => part !== undefined).join(' · ')
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

export function formatWorkflowEventTables(event: CacheLogEvent): string {
  const tables = Array.from(new Set(getWorkflowEventTables(event)))
  return tables.length === 0 ? '-' : tables.join(', ')
}
