import type { OpsLogSourceId } from './logging'
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
} from '@/constants/cloudflare'
import { R2_BACKUP_BUCKET } from '@/constants/r2'
import { CloudflareClient } from '@/lib/cloudflare'
import { r2GetFromBucket, r2ListFromBucket, r2PutToBucket } from '@/lib/r2'
import { OPS_LOG_SOURCES } from './logging'

const DEFAULT_LOG_LIMIT = 100
const MAX_LOG_LIMIT = 300
const RECENT_LOG_LOOKBACK_DAYS = 30
const MIN_KEYS_BEFORE_STOPPING = 300
const LOG_ARCHIVE_PREFIX = 'backups/logs'

export interface OpsLogEntry {
  sourceId: OpsLogSourceId
  sourceLabel: string
  key: string
  event: CacheLogEvent
}

export interface ArchivedLogManifest {
  key: string
  backedUpAt?: string
  backupDate?: string
  sources: Array<{
    sourceId: string
    sourceLabel: string
    key: string
    logs: number
  }>
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

async function readRecentOpsLogsForSource(
  sourceId: OpsLogSourceId,
  limit: number,
): Promise<OpsLogEntry[]> {
  const source = OPS_LOG_SOURCES.find(item => item.id === sourceId)
  if (source === undefined) {
    return []
  }

  const keyNames: string[] = []
  for (const day of getRecentIsoDays(RECENT_LOG_LOOKBACK_DAYS)) {
    keyNames.push(...await listKvKeysByPrefix(`${source.keyPrefix}:${day}:`))
    if (keyNames.length >= Math.max(limit, MIN_KEYS_BEFORE_STOPPING)) {
      break
    }
  }

  const recentKeys = keyNames
    .sort((a, b) => getTimestampFromLogKey(b) - getTimestampFromLogKey(a))
    .slice(0, limit)

  const entries = await Promise.all(
    recentKeys.map(async (key): Promise<OpsLogEntry | undefined> => {
      const text = await readKvText(key)
      if (text === undefined) {
        return undefined
      }

      try {
        return {
          sourceId: source.id,
          sourceLabel: source.label,
          key,
          event: JSON.parse(text) as CacheLogEvent,
        }
      }
      catch {
        return undefined
      }
    }),
  )

  return entries.filter((entry): entry is OpsLogEntry => entry !== undefined)
}

export async function readRecentOpsLogs(options: {
  limit?: number
  sourceId?: OpsLogSourceId | 'all'
} = {}): Promise<OpsLogEntry[]> {
  const safeLimit = clampLimit(options.limit ?? DEFAULT_LOG_LIMIT)
  const selectedSources = options.sourceId === undefined || options.sourceId === 'all'
    ? OPS_LOG_SOURCES
    : OPS_LOG_SOURCES.filter(source => source.id === options.sourceId)

  const sourceLimit = options.sourceId === undefined || options.sourceId === 'all'
    ? safeLimit
    : safeLimit

  const logs = (await Promise.all(
    selectedSources.map(async source => readRecentOpsLogsForSource(source.id, sourceLimit)),
  )).flat()

  return logs
    .sort((a, b) => (b.event.timestamp ?? 0) - (a.event.timestamp ?? 0))
    .slice(0, safeLimit)
}

export async function archiveRecentOpsLogsToBackupBucket(options: {
  backupDate: string
  backedUpAt: string
  limitPerSource?: number
}): Promise<{ manifestKey: string, sources: ArchivedLogManifest['sources'] } | undefined> {
  if (R2_BACKUP_BUCKET.length === 0) {
    return undefined
  }

  const safeLimit = clampLimit(options.limitPerSource ?? 200)
  const archivePrefix = `${LOG_ARCHIVE_PREFIX}/${options.backupDate}`
  const sources = []

  for (const source of OPS_LOG_SOURCES) {
    const logs = await readRecentOpsLogsForSource(source.id, safeLimit)
    const key = `${archivePrefix}/${source.id}.json`
    await r2PutToBucket(
      R2_BACKUP_BUCKET,
      key,
      JSON.stringify({
        backedUpAt: options.backedUpAt,
        backupDate: options.backupDate,
        sourceId: source.id,
        sourceLabel: source.label,
        logs,
      }, null, 2),
      'application/json',
      'no-store',
    )
    sources.push({
      sourceId: source.id,
      sourceLabel: source.label,
      key,
      logs: logs.length,
    })
  }

  const manifestKey = `${archivePrefix}/manifest.json`
  await r2PutToBucket(
    R2_BACKUP_BUCKET,
    manifestKey,
    JSON.stringify({
      backedUpAt: options.backedUpAt,
      backupDate: options.backupDate,
      sources,
    }, null, 2),
    'application/json',
    'no-store',
  )

  return { manifestKey, sources }
}

export async function readRecentArchivedLogManifests(limit = 10): Promise<ArchivedLogManifest[]> {
  if (R2_BACKUP_BUCKET.length === 0) {
    return []
  }

  const objects = []
  let token: string | undefined

  do {
    const page = await r2ListFromBucket(R2_BACKUP_BUCKET, `${LOG_ARCHIVE_PREFIX}/`, token)
    objects.push(...(page.Contents ?? []))
    token = page.NextContinuationToken
  } while (token !== undefined)

  const manifestKeys = objects
    .map(object => object.Key)
    .filter((key): key is string => typeof key === 'string' && key.endsWith('/manifest.json'))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, clampLimit(limit))

  const manifests = await Promise.all(
    manifestKeys.map(async (key): Promise<ArchivedLogManifest | undefined> => {
      try {
        const object = await r2GetFromBucket(R2_BACKUP_BUCKET, key)
        const text = await object.Body.transformToString('utf-8')
        const parsed = JSON.parse(text) as Partial<ArchivedLogManifest>
        if (!Array.isArray(parsed.sources)) {
          return undefined
        }

        return {
          key,
          backedUpAt: typeof parsed.backedUpAt === 'string' ? parsed.backedUpAt : undefined,
          backupDate: typeof parsed.backupDate === 'string' ? parsed.backupDate : undefined,
          sources: parsed.sources,
        }
      }
      catch {
        return undefined
      }
    }),
  )

  return manifests.filter((manifest): manifest is ArchivedLogManifest => manifest !== undefined)
}
