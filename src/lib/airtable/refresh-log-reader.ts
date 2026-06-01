import { CloudflareClient } from '@/lib/cloudflare'
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
} from '@/lib/consts'

const REFRESH_LOG_KEY_PREFIX = 'airtable-refresh-log:'
const DEFAULT_LOG_LIMIT = 100
const MAX_LOG_LIMIT = 200
const RECENT_LOG_LOOKBACK_DAYS = 30
const MIN_KEYS_BEFORE_STOPPING = 300

interface RefreshLogEntry {
  key: string
  event: CacheLogEvent
}

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

function getTimestampFromLogKey(key: string): number {
  const [, , timestamp] = key.split(':')
  const parsed = Number(timestamp)
  return Number.isFinite(parsed) ? parsed : 0
}

function clampLimit(limit: number): number {
  if (!Number.isInteger(limit) || limit < 1) {
    return DEFAULT_LOG_LIMIT
  }

  return Math.min(limit, MAX_LOG_LIMIT)
}

function getRecentIsoDays(days: number): string[] {
  const result: string[] = []
  const now = new Date()

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - offset,
    ))
    result.push(date.toISOString().slice(0, 10))
  }

  return result
}

async function readKvText(key: string): Promise<string | undefined> {
  try {
    const response = await CloudflareClient.kv.namespaces.values.get(
      CLOUDFLARE_KV_NAMESPACE_ID,
      key,
      { account_id: CLOUDFLARE_ACCOUNT_ID },
    )
    const text = await response.text()
    return text.length > 0 ? text : undefined
  }
  catch (error) {
    if (isCloudflareErrorWithStatus(error) && error.status === 404) {
      return undefined
    }
    throw error
  }
}

async function listKvKeysByPrefix(prefix: string): Promise<string[]> {
  const keyNames: string[] = []
  let cursor: string | undefined

  for (;;) {
    const page = await CloudflareClient.kv.namespaces.keys.list(
      CLOUDFLARE_KV_NAMESPACE_ID,
      {
        account_id: CLOUDFLARE_ACCOUNT_ID,
        prefix,
        ...(cursor !== undefined ? { cursor } : {}),
      },
    )

    const names = (page.result ?? [])
      .map(entry => entry.name)
      .filter((name): name is string => typeof name === 'string')

    keyNames.push(...names)

    const nextCursor = page.result_info?.cursor
    if (typeof nextCursor !== 'string' || nextCursor.length === 0) {
      break
    }

    cursor = nextCursor
  }

  return keyNames
}

export async function readRecentAirtableRefreshLogs(
  limit = DEFAULT_LOG_LIMIT,
): Promise<RefreshLogEntry[]> {
  const safeLimit = clampLimit(limit)
  const keyNames: string[] = []

  for (const day of getRecentIsoDays(RECENT_LOG_LOOKBACK_DAYS)) {
    keyNames.push(...await listKvKeysByPrefix(`${REFRESH_LOG_KEY_PREFIX}${day}:`))
    if (keyNames.length >= Math.max(safeLimit, MIN_KEYS_BEFORE_STOPPING)) {
      break
    }
  }

  const recentKeys = keyNames
    .sort((a, b) => getTimestampFromLogKey(b) - getTimestampFromLogKey(a))
    .slice(0, safeLimit)

  const entries = await Promise.all(
    recentKeys.map(async (key): Promise<RefreshLogEntry | undefined> => {
      const text = await readKvText(key)
      if (text === undefined) {
        return undefined
      }

      try {
        return {
          key,
          event: JSON.parse(text) as CacheLogEvent,
        }
      }
      catch {
        return undefined
      }
    }),
  )

  return entries.filter((entry): entry is RefreshLogEntry => entry !== undefined)
}
