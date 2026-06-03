import type { AirtableCacheStore, Attachment } from 'ts-airtable'
import { AsyncLocalStorage } from 'node:async_hooks'
import { safeLog } from '../logger'
import { transformAttachmentForCache } from './attachment-transform'

const cacheBypassStorage = new AsyncLocalStorage<{ prefixes: string[] }>()

export async function runWithAirtableCacheBypass<T>(
  prefixes: string[],
  callback: () => Promise<T>,
): Promise<T> {
  return cacheBypassStorage.run({ prefixes }, callback)
}

function shouldBypassCacheRead(key: string): boolean {
  const context = cacheBypassStorage.getStore()
  return context?.prefixes.some(prefix => key.startsWith(prefix)) ?? false
}

/**
 * Adds an optional prefix in front of a logical cache key.
 */
function withOptionalPrefix(prefix: string | undefined, key: string): string {
  return prefix !== undefined ? `${prefix}:${key}` : key
}

/**
 * Converts an optional TTL in milliseconds into:
 * - fresh/stale application timestamps in ms, and
 * - a Cloudflare-compatible physical `expiration_ttl` in seconds.
 */
function toCacheTiming(
  ttlMs: number | undefined,
  minSeconds: number,
  staleTtlMs: number,
): {
  cachedAt?: number
  freshUntil?: number
  staleUntil?: number
  expiration_ttl?: number
} {
  if (ttlMs === undefined || ttlMs <= 0) {
    return {}
  }

  const now = Date.now()
  const freshUntil = now + ttlMs
  const staleUntil = now + Math.max(ttlMs, staleTtlMs)
  const seconds = Math.round((staleUntil - now) / 1000)

  return {
    cachedAt: now,
    freshUntil,
    staleUntil,
    expiration_ttl: Math.max(seconds, minSeconds),
  }
}

/**
 * Narrowing helper for Cloudflare-style errors that expose an HTTP status code.
 */
function isCloudflareErrorWithStatus(
  error: unknown,
): error is { status: number } {
  return (
    typeof error === 'object'
    && error !== null
    && 'status' in error
    && typeof error.status === 'number'
  )
}

/**
 * Create an AirtableCacheStore backed by Cloudflare KV via the public API.
 *
 * This implementation:
 * - Stores JSON-serialized envelopes with fresh/stale timestamps in KV.
 * - Enforces the stale window at read time.
 * - Best-effort forwards the stale window to Cloudflare via `expiration_ttl` so KV can
 *   automatically evict old keys over time.
 *
 * It is safe to use from multiple processes (DigitalOcean droplets, containers,
 * etc.) as long as they all point to the same account + namespace.
 */
export function createCloudflareApiKvCacheStore(
  options: CloudflareApiKvCacheStoreOptions,
): AirtableCacheStore {
  const {
    client,
    accountId,
    namespaceId,
    keyPrefix,
    minCloudflareTtlSeconds = 60,
    staleTtlMs = 0,
    logger,
  } = options

  return {
    async get<T = unknown>(key: string): Promise<T | undefined> {
      if (shouldBypassCacheRead(key)) {
        return undefined
      }

      const fullKey = withOptionalPrefix(keyPrefix, key)

      let res
      try {
        // cloudflare-typescript:
        // client.kv.namespaces.values.get(namespaceId, keyName, params?, options?)
        res = await client.kv.namespaces.values.get(namespaceId, fullKey, {
          account_id: accountId,
        })
      }
      catch (error) {
        // Treat "not found" as a normal cache miss.
        if (isCloudflareErrorWithStatus(error) && error.status === 404) {
          return undefined
        }
        // Let the Airtable cache wrapper decide how to surface other errors.
        throw error
      }

      const text = await res.text()
      if (!text) {
        return undefined
      }

      let envelope: KvEnvelope<T>
      try {
        envelope = JSON.parse(text) as KvEnvelope<T>
      }
      catch {
        // If parsing fails, treat it as a cache miss instead of raising.
        return undefined
      }

      const staleUntil = envelope.staleUntil
        ?? (envelope.expiresAt !== undefined ? envelope.expiresAt + staleTtlMs : undefined)

      // Application-level stale-window enforcement. Freshness is controlled by
      // scheduled refresh; user requests may serve stale data until this point.
      if (staleUntil != null && Number.isFinite(staleUntil) && Date.now() >= staleUntil) {
        // Optionally, we could fire-and-forget a delete here:
        // void client.kv.namespaces.values.delete(namespaceId, fullKey, { account_id: accountId })
        return undefined
      }

      return envelope.value
    },

    async set<T = unknown>(key: string, value: T, ttlMs?: number): Promise<void> {
      const fullKey = withOptionalPrefix(keyPrefix, key)

      const {
        cachedAt,
        freshUntil,
        staleUntil,
        expiration_ttl,
      } = toCacheTiming(
        ttlMs,
        minCloudflareTtlSeconds,
        staleTtlMs,
      )

      const envelope: KvEnvelope<T>
        = freshUntil !== undefined
          ? {
              value,
              cachedAt,
              freshUntil,
              staleUntil,
              expiresAt: freshUntil,
            }
          : { value }

      const serialized = JSON.stringify(envelope)
      const timestamp = Date.now()

      // cloudflare-typescript:
      // client.kv.namespaces.values.update(namespaceId, keyName, params?, options?)
      await client.kv.namespaces.values.update(namespaceId, fullKey, {
        account_id: accountId,
        value: serialized,
        ...(expiration_ttl !== undefined ? { expiration_ttl } : {}),
      })

      safeLog(logger, {
        kind: 'set',
        key,
        fullKey,
        timestamp,
        ttlMs,
        expiresAt: freshUntil,
        freshUntil,
        staleUntil,
      })
    },

    async delete(key: string): Promise<void> {
      const fullKey = withOptionalPrefix(keyPrefix, key)
      const timestamp = Date.now()

      await client.kv.namespaces.values.delete(namespaceId, fullKey, {
        account_id: accountId,
      })

      safeLog(logger, {
        kind: 'delete',
        key,
        fullKey,
        timestamp,
        affectedCount: 1,
      })
    },

    async deleteByPrefix(prefix: string): Promise<void> {
      const fullPrefix = withOptionalPrefix(keyPrefix, prefix)

      safeLog(logger, {
        kind: 'deleteByPrefix',
        key: prefix,
        fullKey: fullPrefix,
        timestamp: Date.now(),
        affectedCount: 0,
        reason: 'remote prefix deletes are disabled to protect Workers KV write quota',
      })
    },

    async transformAttachment(attachment: Attachment, _ctx: unknown): Promise<Attachment> {
      return transformAttachmentForCache(attachment, { logger })
    },
  }
}
