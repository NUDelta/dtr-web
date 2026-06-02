type Cloudflare = import('cloudflare').Cloudflare

type CacheKind
  = | 'get'
    | 'set'
    | 'delete'
    | 'deleteByPrefix'
    | 'transformAttachmentError'
    | 'refreshRunStart'
    | 'refreshRunSuccess'
    | 'refreshRunSkipped'
    | 'refreshRunFailure'
    | 'refreshGuard'
    | 'refreshTableStart'
    | 'refreshTableSuccess'
    | 'refreshTableFailure'
    | 'refreshStateWrite'
    | 'backupRunStart'
    | 'backupRunSuccess'
    | 'backupRunSkipped'
    | 'backupRunFailure'
    | 'backupTableSuccess'
    | 'backupLogArchive'
    | 'backupR2ReferenceFailure'
    | 'r2GcRunStart'
    | 'r2GcRunSuccess'
    | 'r2GcRunFailure'

interface CacheLogEvent {
  kind: CacheKind
  /**
   * Logical key passed to the cache store.
   */
  key?: string
  /**
   * Actual key written to Cloudflare KV (with prefix).
   */
  fullKey: string
  /**
   * When the event happened (ms since epoch).
   */
  timestamp: number
  /**
   * TTL passed in by caller (ms), if any.
   */
  ttlMs?: number
  /**
   * Application-level expiration timestamp (ms), if any.
   */
  expiresAt?: number
  /**
   * Application-level fresh-until timestamp (ms), if any.
   */
  freshUntil?: number
  /**
   * Application-level stale-until timestamp (ms), if any.
   */
  staleUntil?: number
  /**
   * How many keys were affected (for deleteByPrefix / bulk deletes).
   */
  affectedCount?: number
  /**
   * If the operation failed, attach the error for diagnostics.
   */
  error?: unknown
  /**
   * Correlates events that belong to the same long-running operation.
   */
  runId?: string
  /**
   * Airtable table being refreshed, when applicable.
   */
  table?: string
  /**
   * Requested tables for a refresh run.
   */
  requestedTables?: string[]
  /**
   * Tables selected for actual work after freshness checks.
   */
  dueTables?: string[]
  /**
   * Human-readable skip/failure/success detail.
   */
  reason?: string
  /**
   * Operation duration in milliseconds.
   */
  durationMs?: number
  /**
   * Number of Airtable records involved in an operation.
   */
  recordCount?: number
  /**
   * Refresh freshness interval used by the caller.
   */
  minIntervalHours?: number
  /**
   * Whether the caller bypassed freshness checks.
   */
  force?: boolean
  /**
   * Best-effort guard owner token for refresh overlap diagnostics.
   */
  owner?: string
  /**
   * UTC backup date, when applicable.
   */
  backupDate?: string
  /**
   * R2 manifest key written by backup/archive jobs.
   */
  manifestKey?: string
  /**
   * Cloudflare R2 bucket name for object operations.
   */
  bucket?: string
  /**
   * Object prefix scanned by R2 jobs.
   */
  prefix?: string
  /**
   * Number of objects/log entries scanned.
   */
  scannedCount?: number
  /**
   * Number of objects/log entries deleted or archived.
   */
  deletedCount?: number
  /**
   * Number of archived log entries.
   */
  logCount?: number
  /**
   * Whether an operation stopped at a configured safety cap.
   */
  capped?: boolean
  /**
   * R2 cleanup age threshold.
   */
  maxAgeDays?: number
  /**
   * R2 cleanup deletion cap.
   */
  maxDeletePerRun?: number
}

interface CacheLogger {
  log: (event: CacheLogEvent) => void | Promise<void>
}

interface KvLoggerOptions {
  client: Cloudflare
  accountId: string
  namespaceId: string
  /**
   * Optional prefix for log keys.
   * Final key looks like: `${keyPrefix}:${ISO_DATE}:${timestamp}:${rand}`
   */
  keyPrefix?: string
  /**
   * TTL for log entries in seconds, e.g. 7 days.
   * If omitted, logs never expire at KV level.
   */
  logTtlSeconds?: number
}
