import { CloudflareClient } from '@/lib/cloudflare'
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
} from '@/lib/consts'
import { createKvLogger } from '@/lib/kv-logger'

export const OPS_LOG_TTL_SECONDS = 60 * 60 * 24 * 180
const OPS_LOG_WRITE_TIMEOUT_MS = 2_000

export const OPS_LOG_SOURCES = [
  { id: 'airtable-cache', label: 'Airtable Cache', keyPrefix: 'airtable-log' },
  { id: 'airtable-refresh', label: 'Airtable Refresh', keyPrefix: 'airtable-refresh-log' },
  { id: 'airtable-backup', label: 'Airtable Backup', keyPrefix: 'airtable-backup-log' },
  { id: 'r2-gc', label: 'R2 GC', keyPrefix: 'r2-gc-log' },
] as const

export type OpsLogSource = typeof OPS_LOG_SOURCES[number]
export type OpsLogSourceId = OpsLogSource['id']

const backupLogger = createKvLogger({
  client: CloudflareClient,
  accountId: CLOUDFLARE_ACCOUNT_ID,
  namespaceId: CLOUDFLARE_KV_NAMESPACE_ID,
  keyPrefix: 'airtable-backup-log',
  logTtlSeconds: OPS_LOG_TTL_SECONDS,
})

const r2GcLogger = createKvLogger({
  client: CloudflareClient,
  accountId: CLOUDFLARE_ACCOUNT_ID,
  namespaceId: CLOUDFLARE_KV_NAMESPACE_ID,
  keyPrefix: 'r2-gc-log',
  logTtlSeconds: OPS_LOG_TTL_SECONDS,
})

function getLogger(source: 'airtable-backup' | 'r2-gc'): CacheLogger {
  return source === 'airtable-backup' ? backupLogger : r2GcLogger
}

async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms))
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function logOpsEvent(
  source: 'airtable-backup' | 'r2-gc',
  event: Omit<CacheLogEvent, 'fullKey' | 'timestamp'>,
): Promise<void> {
  try {
    await Promise.race([
      getLogger(source).log({
        fullKey: `${source}:${event.kind}:${event.runId ?? 'unknown'}`,
        timestamp: Date.now(),
        ...event,
      }),
      sleep(OPS_LOG_WRITE_TIMEOUT_MS),
    ])
  }
  catch {
    // Diagnostics should never block production maintenance work.
  }
}
