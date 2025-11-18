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

  /**
   * Optional hook to observe mutations (set/delete/deleteByPrefix).
   * Useful for debugging, metrics, and offline analysis.
   */
  logger?: CacheLogger
}
