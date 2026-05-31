import { CloudflareClient } from '@/lib/cloudflare'
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
} from '../consts'
import { refreshCachedRecords } from './airtable'
import { AIRTABLE_REFRESH_TABLES } from './config'

const REFRESH_STATE_KEY = 'airtable-refresh:state'
const REFRESH_LOCK_KEY = 'airtable-refresh:lock'
const DEFAULT_MIN_INTERVAL_HOURS = 12
const REFRESH_LOCK_TTL_SECONDS = 15 * 60

type AirtableRefreshTable = typeof AIRTABLE_REFRESH_TABLES[number]

interface AirtableRefreshState {
  lastSuccessAt: number
  tables: string[]
}

interface AirtableRefreshOptions {
  tables?: readonly string[]
  minIntervalHours?: number
  force?: boolean
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

function isRefreshTable(table: string): table is AirtableRefreshTable {
  return AIRTABLE_REFRESH_TABLES.includes(table as AirtableRefreshTable)
}

function normalizeTables(tables: readonly string[] | undefined): AirtableRefreshTable[] {
  if (tables === undefined) {
    return [...AIRTABLE_REFRESH_TABLES]
  }

  return Array.from(new Set(tables)).filter(isRefreshTable)
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

async function writeKvJson(
  key: string,
  value: unknown,
  expirationTtlSeconds?: number,
): Promise<void> {
  await CloudflareClient.kv.namespaces.values.update(
    CLOUDFLARE_KV_NAMESPACE_ID,
    key,
    {
      account_id: CLOUDFLARE_ACCOUNT_ID,
      value: JSON.stringify(value),
      ...(expirationTtlSeconds !== undefined ? { expiration_ttl: expirationTtlSeconds } : {}),
    },
  )
}

async function readRefreshState(): Promise<AirtableRefreshState | undefined> {
  const text = await readKvText(REFRESH_STATE_KEY)
  if (text === undefined) {
    return undefined
  }

  try {
    const state = JSON.parse(text) as Partial<AirtableRefreshState>
    if (
      typeof state.lastSuccessAt === 'number'
      && Number.isFinite(state.lastSuccessAt)
      && Array.isArray(state.tables)
    ) {
      return {
        lastSuccessAt: state.lastSuccessAt,
        tables: state.tables.filter(table => typeof table === 'string'),
      }
    }
  }
  catch {
    return undefined
  }

  return undefined
}

function shouldSkipForInterval(
  state: AirtableRefreshState | undefined,
  minIntervalHours: number,
): { skipped: true, reason: string } | undefined {
  if (state === undefined) {
    return undefined
  }

  const ageMs = Date.now() - state.lastSuccessAt
  const minIntervalMs = minIntervalHours * 60 * 60 * 1000
  if (ageMs < minIntervalMs) {
    return {
      skipped: true,
      reason: `last successful refresh ${(ageMs / (60 * 60 * 1000)).toFixed(1)}h ago`,
    }
  }

  return undefined
}

async function acquireRefreshLock(): Promise<boolean> {
  const existingLock = await readKvText(REFRESH_LOCK_KEY)
  if (existingLock !== undefined) {
    return false
  }

  await writeKvJson(
    REFRESH_LOCK_KEY,
    { lockedAt: Date.now() },
    REFRESH_LOCK_TTL_SECONDS,
  )
  return true
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function refreshAirtableRecordsCache(options: AirtableRefreshOptions = {}) {
  const minIntervalHours = options.minIntervalHours ?? DEFAULT_MIN_INTERVAL_HOURS
  const tables = normalizeTables(options.tables)

  if (tables.length === 0) {
    return {
      skipped: true,
      reason: 'no valid refresh tables requested',
      tables: [],
    }
  }

  if (options.force !== true) {
    const intervalSkip = shouldSkipForInterval(await readRefreshState(), minIntervalHours)
    if (intervalSkip !== undefined) {
      return {
        ...intervalSkip,
        tables,
      }
    }
  }

  const locked = await acquireRefreshLock()
  if (!locked) {
    return {
      skipped: true,
      reason: 'refresh already in progress',
      tables,
    }
  }

  if (options.force !== true) {
    const intervalSkip = shouldSkipForInterval(await readRefreshState(), minIntervalHours)
    if (intervalSkip !== undefined) {
      return {
        ...intervalSkip,
        tables,
      }
    }
  }

  const refreshed = []
  for (const table of tables) {
    const records = await refreshCachedRecords(table)
    refreshed.push({ table, records: records.length })
    await sleep(250)
  }

  const lastSuccessAt = Date.now()
  await writeKvJson(REFRESH_STATE_KEY, {
    lastSuccessAt,
    tables,
  })

  return {
    skipped: false,
    refreshed,
    lastSuccessAt,
  }
}
