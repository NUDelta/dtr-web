type Cloudflare = import('cloudflare').Cloudflare

type CacheKind = 'get' | 'set' | 'delete' | 'deleteByPrefix'

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
   * How many keys were affected (for deleteByPrefix / bulk deletes).
   */
  affectedCount?: number
  /**
   * If the operation failed, attach the error for diagnostics.
   */
  error?: unknown
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
