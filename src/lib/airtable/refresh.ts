import { randomUUID } from 'node:crypto'
import { CloudflareClient } from '@/lib/cloudflare'
import { createKvLogger } from '@/lib/kv-logger'
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
const REFRESH_LOG_TTL_SECONDS = 60 * 60 * 24 * 180
const REFRESH_LOG_WRITE_TIMEOUT_MS = 2_000

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
  requestId?: string
}

const refreshLogger = createKvLogger({
  client: CloudflareClient,
  accountId: CLOUDFLARE_ACCOUNT_ID,
  namespaceId: CLOUDFLARE_KV_NAMESPACE_ID,
  keyPrefix: 'airtable-refresh-log',
  logTtlSeconds: REFRESH_LOG_TTL_SECONDS,
})

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function logRefreshEvent(
  event: Omit<CacheLogEvent, 'fullKey' | 'timestamp'>,
): Promise<void> {
  try {
    await Promise.race([
      refreshLogger.log({
        fullKey: `airtable-refresh:${event.kind}:${event.runId ?? 'unknown'}`,
        timestamp: Date.now(),
        ...event,
      }),
      sleep(REFRESH_LOG_WRITE_TIMEOUT_MS),
    ])
  }
  catch {
    // Diagnostics should never block cache refreshes.
  }
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
  const runId = options.requestId ?? randomUUID()
  const runStartedAt = Date.now()
  const minIntervalHours = options.minIntervalHours ?? DEFAULT_MIN_INTERVAL_HOURS
  const tables = normalizeTables(options.tables)

  await logRefreshEvent({
    kind: 'refreshRunStart',
    runId,
    requestedTables: tables,
    minIntervalHours,
    force: options.force === true,
  })

  if (tables.length === 0) {
    const reason = 'no valid refresh tables requested'
    await logRefreshEvent({
      kind: 'refreshRunSkipped',
      runId,
      requestedTables: [],
      reason,
      durationMs: Date.now() - runStartedAt,
    })

    return {
      skipped: true,
      reason,
      runId,
      tables: [],
    }
  }

  if (options.force !== true) {
    const state = await readRefreshState()
    const dueTables = getDueTables(tables, state, minIntervalHours)
    if (dueTables.length === 0) {
      const reason = state !== undefined
        ? `last successful refresh ${getMostRecentRefreshAgeHours(tables, state)}h ago`
        : 'all requested tables are fresh'
      await logRefreshEvent({
        kind: 'refreshRunSkipped',
        runId,
        requestedTables: tables,
        dueTables,
        reason,
        durationMs: Date.now() - runStartedAt,
      })

      return {
        skipped: true,
        reason,
        runId,
        tables,
      }
    }
  }

  const refreshSlotOwner = await claimRefreshSlotBestEffort()
  if (refreshSlotOwner === undefined) {
    const reason = 'refresh already in progress'
    await logRefreshEvent({
      kind: 'refreshGuard',
      runId,
      requestedTables: tables,
      reason,
      durationMs: Date.now() - runStartedAt,
    })

    return {
      skipped: true,
      reason,
      runId,
      tables,
    }
  }

  await logRefreshEvent({
    kind: 'refreshGuard',
    runId,
    requestedTables: tables,
    reason: 'claimed refresh slot',
    owner: refreshSlotOwner,
    durationMs: Date.now() - runStartedAt,
  })

  try {
    const state = await readRefreshState()
    const dueTables = options.force === true
      ? tables
      : getDueTables(tables, state, minIntervalHours)
    if (dueTables.length === 0) {
      if (options.force !== true) {
        const reason = state !== undefined
          ? `last successful refresh ${getMostRecentRefreshAgeHours(tables, state)}h ago`
          : 'all requested tables are fresh'
        await logRefreshEvent({
          kind: 'refreshRunSkipped',
          runId,
          requestedTables: tables,
          dueTables,
          reason,
          durationMs: Date.now() - runStartedAt,
        })

        return {
          skipped: true,
          reason,
          runId,
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
      const tableStartedAt = Date.now()
      await logRefreshEvent({
        kind: 'refreshTableStart',
        runId,
        table,
        requestedTables: tables,
        dueTables,
      })

      let records
      try {
        records = await refreshCachedRecords(table)
      }
      catch (error) {
        await logRefreshEvent({
          kind: 'refreshTableFailure',
          runId,
          table,
          requestedTables: tables,
          dueTables,
          durationMs: Date.now() - tableStartedAt,
          reason: getErrorMessage(error),
          error,
        })
        throw error
      }

      lastSuccessAt = Date.now()
      lastSuccessAtByTable[table] = lastSuccessAt
      refreshed.push({ table, records: records.length })

      await logRefreshEvent({
        kind: 'refreshTableSuccess',
        runId,
        table,
        requestedTables: tables,
        dueTables,
        durationMs: Date.now() - tableStartedAt,
        recordCount: records.length,
      })

      const stateWriteStartedAt = Date.now()
      const stateValue = {
        lastSuccessAt,
        tables: refreshed.map(result => result.table),
        lastSuccessAtByTable,
      }

      try {
        await writeKvJson(REFRESH_STATE_KEY, stateValue)
      }
      catch (error) {
        await logRefreshEvent({
          kind: 'refreshStateWrite',
          runId,
          table,
          requestedTables: tables,
          dueTables,
          durationMs: Date.now() - stateWriteStartedAt,
          reason: getErrorMessage(error),
          error,
        })
        throw error
      }

      await logRefreshEvent({
        kind: 'refreshStateWrite',
        runId,
        table,
        requestedTables: tables,
        dueTables,
        durationMs: Date.now() - stateWriteStartedAt,
        affectedCount: refreshed.length,
      })

      await sleep(250)
    }

    await logRefreshEvent({
      kind: 'refreshRunSuccess',
      runId,
      requestedTables: tables,
      dueTables,
      durationMs: Date.now() - runStartedAt,
      recordCount: refreshed.reduce((total, result) => total + result.records, 0),
    })

    return {
      skipped: false,
      runId,
      refreshed,
      requestedTables: tables,
      dueTables,
      durationMs: Date.now() - runStartedAt,
      lastSuccessAt,
    }
  }
  catch (error) {
    await logRefreshEvent({
      kind: 'refreshRunFailure',
      runId,
      requestedTables: tables,
      durationMs: Date.now() - runStartedAt,
      reason: getErrorMessage(error),
      error,
    })
    throw error
  }
  finally {
    await releaseRefreshSlotBestEffort(refreshSlotOwner)
      .then(() => {
        void logRefreshEvent({
          kind: 'refreshGuard',
          runId,
          requestedTables: tables,
          reason: 'released refresh slot',
          owner: refreshSlotOwner,
          durationMs: Date.now() - runStartedAt,
        })
      })
      .catch((error: unknown) => {
        void logRefreshEvent({
          kind: 'refreshGuard',
          runId,
          requestedTables: tables,
          reason: getErrorMessage(error),
          owner: refreshSlotOwner,
          durationMs: Date.now() - runStartedAt,
          error,
        })
      })
  }
}
