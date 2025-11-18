import type Cloudflare from 'cloudflare'
import type { AirtableCacheStore } from 'ts-airtable'

/**
 * Small envelope stored in KV so we can enforce TTL in userland even if
 * Cloudflare's expiration_ttl is not applied or not supported by the client.
 */
interface KvEnvelope<T> {
  value: T
  /**
   * Absolute expiration timestamp in milliseconds since epoch.
   * If omitted, the entry never expires at the application level.
   */
  expiresAt?: number
}

interface CloudflareApiKvCacheStoreOptions {
  /**
   * Pre-configured Cloudflare API client.
   *
   * Recommended:
   *   const client = new Cloudflare({ apiToken: process.env.CLOUDFLARE_API_TOKEN! })
   */
  client: Cloudflare

  /** Cloudflare account ID that owns the KV namespace. */
  accountId: string

  /** KV namespace ID where cache entries will be stored. */
  namespaceId: string

  /**
   * Optional global prefix for all cache keys written to KV.
   * This helps avoid collisions with other KV data.
   *
   * Final KV key will be `${keyPrefix}:${key}`.
   */
  keyPrefix?: string

  /**
   * Minimum TTL (in seconds) that we will send to Cloudflare's
   * `expiration_ttl` parameter. Workers KV docs state that expirationTtl
   * has a minimum of ~60 seconds, so 60s is a safe default.
   */
  minCloudflareTtlSeconds?: number
}

/**
 * Adds an optional prefix in front of a logical cache key.
 */
function withOptionalPrefix(prefix: string | undefined, key: string): string {
  return prefix !== undefined ? `${prefix}:${key}` : key
}

/**
 * Converts an optional TTL in milliseconds into:
 * - an absolute `expiresAt` timestamp in ms, and
 * - a Cloudflare-compatible `expiration_ttl` in seconds.
 */
function toCloudflareTtlSeconds(
  ttlMs: number | undefined,
  minSeconds: number,
): { expiresAt?: number, expiration_ttl?: number } {
  if (ttlMs === undefined || ttlMs <= 0) {
    return {}
  }

  const now = Date.now()
  const expiresAt = now + ttlMs
  const seconds = Math.round(ttlMs / 1000)

  return {
    expiresAt,
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
 * - Stores JSON-serialized envelopes { value, expiresAt } in KV.
 * - Enforces TTL at read time based on `expiresAt`.
 * - Best-effort forwards TTL to Cloudflare via `expiration_ttl` so KV can
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
  } = options

  return {
    async get<T = unknown>(key: string): Promise<T | undefined> {
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

      // Application-level TTL enforcement
      if (
        envelope.expiresAt != null
        && Number.isFinite(envelope.expiresAt)
        && Date.now() >= envelope.expiresAt
      ) {
        // Optionally, we could fire-and-forget a delete here:
        // void client.kv.namespaces.values.delete(namespaceId, fullKey, { account_id: accountId })
        return undefined
      }

      return envelope.value
    },

    async set<T = unknown>(key: string, value: T, ttlMs?: number): Promise<void> {
      const fullKey = withOptionalPrefix(keyPrefix, key)

      const { expiresAt, expiration_ttl } = toCloudflareTtlSeconds(
        ttlMs,
        minCloudflareTtlSeconds,
      )

      const envelope: KvEnvelope<T>
        = expiresAt !== undefined ? { value, expiresAt } : { value }

      const serialized = JSON.stringify(envelope)

      // cloudflare-typescript:
      // client.kv.namespaces.values.update(namespaceId, keyName, params?, options?)
      await client.kv.namespaces.values.update(namespaceId, fullKey, {
        account_id: accountId,
        value: serialized,
        ...(expiration_ttl !== undefined ? { expiration_ttl } : {}),
      })
    },

    async delete(key: string): Promise<void> {
      const fullKey = withOptionalPrefix(keyPrefix, key)

      await client.kv.namespaces.values.delete(namespaceId, fullKey, {
        account_id: accountId,
      })
    },

    async deleteByPrefix(prefix: string): Promise<void> {
      const fullPrefix = withOptionalPrefix(keyPrefix, prefix)

      let cursor: string | undefined

      // Paginate through all keys that start with the given prefix
      // and delete them in batches.
      for (;;) {
        // cloudflare-typescript:
        // client.kv.namespaces.keys.list(namespaceId, params?, options?)
        const page = await client.kv.namespaces.keys.list(namespaceId, {
          account_id: accountId,
          prefix: fullPrefix,
          ...(cursor !== undefined ? { cursor } : {}),
        })

        const result = page.result ?? []
        if (!Array.isArray(result) || result.length === 0) {
          break
        }

        const keyNames = result
          .map(entry => entry.name)
          .filter((name): name is string => typeof name === 'string')

        if (keyNames.length > 0) {
          // Prefer the non-deprecated bulk_delete on namespaces:
          // client.kv.namespaces.bulkDelete(namespaceId, params?, options?)
          await client.kv.namespaces.bulkDelete(namespaceId, {
            account_id: accountId,
            // Body is the array of key strings to delete.
            body: keyNames,
          })
        }

        const nextCursor = page.result_info?.cursors?.after
        if (typeof nextCursor !== 'string' || nextCursor.length === 0) {
          break
        }

        cursor = nextCursor
      }
    },
  }
}
