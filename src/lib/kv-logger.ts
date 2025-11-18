/**
 * A simple logger that writes each log event as a separate KV entry.
 */
export function createKvLogger(
  options: KvLoggerOptions,
): CacheLogger {
  const {
    client,
    accountId,
    namespaceId,
    keyPrefix = 'airtable-log',
    logTtlSeconds = 60 * 60 * 24 * 30, // 30 days
  } = options

  return {
    async log(event: CacheLogEvent): Promise<void> {
      const ts = event.timestamp ?? Date.now()
      const isoDay = new Date(ts).toISOString().slice(0, 10) // YYYY-MM-DD
      const rand = Math.random().toString(36).slice(2, 8)

      const key = `${keyPrefix}:${isoDay}:${ts}:${rand}`
      const value = JSON.stringify(event)

      await client.kv.namespaces.values.update(namespaceId, key, {
        account_id: accountId,
        value,
        expiration_ttl: logTtlSeconds,
      })
    },
  }
}
