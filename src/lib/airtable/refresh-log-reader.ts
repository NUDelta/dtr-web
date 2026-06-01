import { CloudflareClient } from '@/lib/cloudflare'
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
} from '@/lib/consts'

const REFRESH_LOG_KEY_PREFIX = 'airtable-refresh-log:'
const DEFAULT_LOG_LIMIT = 100
const MAX_LISTED_KEYS = 300

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

export async function readRecentAirtableRefreshLogs(
  limit = DEFAULT_LOG_LIMIT,
): Promise<RefreshLogEntry[]> {
  const keyNames: string[] = []
  let cursor: string | undefined

  for (;;) {
    const page = await CloudflareClient.kv.namespaces.keys.list(
      CLOUDFLARE_KV_NAMESPACE_ID,
      {
        account_id: CLOUDFLARE_ACCOUNT_ID,
        prefix: REFRESH_LOG_KEY_PREFIX,
        ...(cursor !== undefined ? { cursor } : {}),
      },
    )

    const names = (page.result ?? [])
      .map(entry => entry.name)
      .filter((name): name is string => typeof name === 'string')

    keyNames.push(...names)

    if (keyNames.length >= MAX_LISTED_KEYS) {
      break
    }

    const nextCursor = page.result_info?.cursor
    if (typeof nextCursor !== 'string' || nextCursor.length === 0) {
      break
    }

    cursor = nextCursor
  }

  const recentKeys = keyNames
    .sort((a, b) => getTimestampFromLogKey(b) - getTimestampFromLogKey(a))
    .slice(0, limit)

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
