import { randomUUID } from 'node:crypto'
import { CloudflareClient } from '@/lib/cloudflare'
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
} from '../consts'
import { refreshCachedRecords } from './airtable'
import { AIRTABLE_REFRESH_TABLES } from './config'

const REFRESH_STATE_KEY = 'airtable-refresh:state'
const REFRESH_GUARD_KEY = 'airtable-refresh:guard'
const DEFAULT_MIN_INTERVAL_HOURS = 12
const REFRESH_INTERVAL_BUFFER_MS = 10 * 60 * 1000
const REFRESH_GUARD_TTL_SECONDS = 15 * 60

type AirtableRefreshTable = typeof AIRTABLE_REFRESH_TABLES[number]

interface AirtableRefreshState {
  lastSuccessAt?: number
  tables?: string[]
  lastSuccessAtByTable: Partial<Record<AirtableRefreshTable, number>>
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
    const lastSuccessAtByTable: Partial<Record<AirtableRefreshTable, number>> = {}

    if (state.lastSuccessAtByTable !== undefined) {
      for (const [table, timestamp] of Object.entries(state.lastSuccessAtByTable)) {
        if (
          isRefreshTable(table)
          && typeof timestamp === 'number'
          && Number.isFinite(timestamp)
        ) {
          lastSuccessAtByTable[table] = timestamp
        }
      }
    }

    if (
      Object.keys(lastSuccessAtByTable).length === 0
      && typeof state.lastSuccessAt === 'number'
      && Number.isFinite(state.lastSuccessAt)
    ) {
      const legacyTables = Array.isArray(state.tables)
        ? state.tables.filter(isRefreshTable)
        : [...AIRTABLE_REFRESH_TABLES]

      for (const table of legacyTables) {
        lastSuccessAtByTable[table] = state.lastSuccessAt
      }
    }

    if (Object.keys(lastSuccessAtByTable).length > 0) {
      return { lastSuccessAt: state.lastSuccessAt, tables: state.tables, lastSuccessAtByTable }
    }
  }
  catch {
    return undefined
  }

  return undefined
}

function getDueTables(
  tables: AirtableRefreshTable[],
  state: AirtableRefreshState | undefined,
  minIntervalHours: number,
): AirtableRefreshTable[] {
  if (state === undefined) {
    return tables
  }

  const now = Date.now()
  const minIntervalMs = Math.max(
    0,
    minIntervalHours * 60 * 60 * 1000 - REFRESH_INTERVAL_BUFFER_MS,
  )

  return tables.filter((table) => {
    const lastSuccessAt = state.lastSuccessAtByTable[table]
    return lastSuccessAt === undefined || now - lastSuccessAt >= minIntervalMs
  })
}

function getMostRecentRefreshAgeHours(
  tables: AirtableRefreshTable[],
  state: AirtableRefreshState,
): string {
  const timestamps = tables
    .map(table => state.lastSuccessAtByTable[table])
    .filter((timestamp): timestamp is number => timestamp !== undefined)

  const mostRecent = Math.max(...timestamps)
  return ((Date.now() - mostRecent) / (60 * 60 * 1000)).toFixed(1)
}

async function claimRefreshSlotBestEffort(): Promise<string | undefined> {
  const existingGuard = await readKvText(REFRESH_GUARD_KEY)
  if (existingGuard !== undefined) {
    return undefined
  }

  const owner = randomUUID()
  // Cloudflare KV writes are not compare-and-set. GitHub Actions concurrency is
  // the authoritative schedule/manual-run serializer; this only reduces
  // accidental overlap from direct API retries.
  await writeKvJson(
    REFRESH_GUARD_KEY,
    { lockedAt: Date.now(), owner },
    REFRESH_GUARD_TTL_SECONDS,
  )
  return owner
}

async function releaseRefreshSlotBestEffort(owner: string): Promise<void> {
  const text = await readKvText(REFRESH_GUARD_KEY)
  if (text === undefined) {
    return
  }

  try {
    const guard = JSON.parse(text) as { owner?: unknown }
    if (guard.owner !== owner) {
      return
    }
  }
  catch {
    return
  }

  await CloudflareClient.kv.namespaces.values.delete(
    CLOUDFLARE_KV_NAMESPACE_ID,
    REFRESH_GUARD_KEY,
    { account_id: CLOUDFLARE_ACCOUNT_ID },
  )
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
    const state = await readRefreshState()
    const dueTables = getDueTables(tables, state, minIntervalHours)
    if (dueTables.length === 0) {
      return {
        skipped: true,
        reason: state !== undefined
          ? `last successful refresh ${getMostRecentRefreshAgeHours(tables, state)}h ago`
          : 'all requested tables are fresh',
        tables,
      }
    }
  }

  const refreshSlotOwner = await claimRefreshSlotBestEffort()
  if (refreshSlotOwner === undefined) {
    return {
      skipped: true,
      reason: 'refresh already in progress',
      tables,
    }
  }

  try {
    const state = await readRefreshState()
    const dueTables = options.force === true
      ? tables
      : getDueTables(tables, state, minIntervalHours)
    if (dueTables.length === 0) {
      if (options.force !== true) {
        return {
          skipped: true,
          reason: state !== undefined
            ? `last successful refresh ${getMostRecentRefreshAgeHours(tables, state)}h ago`
            : 'all requested tables are fresh',
          tables,
        }
      }
    }

    const refreshed = []
    const lastSuccessAtByTable = {
      ...(state?.lastSuccessAtByTable ?? {}),
    }
    let lastSuccessAt = state?.lastSuccessAt ?? Date.now()

    for (const table of dueTables) {
      const records = await refreshCachedRecords(table)
      lastSuccessAt = Date.now()
      lastSuccessAtByTable[table] = lastSuccessAt
      refreshed.push({ table, records: records.length })
      await writeKvJson(REFRESH_STATE_KEY, {
        lastSuccessAt,
        tables: refreshed.map(result => result.table),
        lastSuccessAtByTable,
      })
      await sleep(250)
    }

    return {
      skipped: false,
      refreshed,
      requestedTables: tables,
      lastSuccessAt,
    }
  }
  finally {
    await releaseRefreshSlotBestEffort(refreshSlotOwner).catch(() => {})
  }
}
