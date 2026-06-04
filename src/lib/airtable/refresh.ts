import type { AirtableRecordHashMap } from './record-change-summary'
import { randomUUID } from 'node:crypto'
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
} from '@/constants/cloudflare'
import { createWorkflowLogRun } from '@/lib/audit/workflow-logs'
import { CloudflareClient } from '@/lib/cloudflare'
import { refreshCachedRecords } from './airtable'
import { AIRTABLE_REFRESH_TABLES } from './config'
import {
  buildAirtableRecordHashes,
  summarizeAirtableRecordChanges,
} from './record-change-summary'

const REFRESH_STATE_KEY = 'airtable-refresh:state'
const REFRESH_GUARD_KEY = 'airtable-refresh:guard'
const DEFAULT_MIN_INTERVAL_HOURS = 12
const REFRESH_INTERVAL_BUFFER_MS = 10 * 60 * 1000
// A scheduled refresh can run five per-table calls at up to nine minutes each.
const REFRESH_GUARD_TTL_SECONDS = 60 * 60

type AirtableRefreshTable = typeof AIRTABLE_REFRESH_TABLES[number]

interface AirtableRefreshState {
  lastSuccessAt?: number
  tables?: string[]
  lastSuccessAtByTable: Partial<Record<AirtableRefreshTable, number>>
  recordHashesByTable: Partial<Record<AirtableRefreshTable, AirtableRecordHashMap>>
}

interface AirtableRefreshOptions {
  tables?: readonly string[]
  minIntervalHours?: number
  force?: boolean
  requestId?: string
  guardOwner?: string
  releaseGuard?: boolean
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
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
    const recordHashesByTable: Partial<Record<AirtableRefreshTable, AirtableRecordHashMap>> = {}

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

    if (state.recordHashesByTable !== undefined) {
      for (const [table, hashes] of Object.entries(state.recordHashesByTable)) {
        if (!isRefreshTable(table) || typeof hashes !== 'object' || hashes === null) {
          continue
        }

        recordHashesByTable[table] = Object.fromEntries(
          Object.entries(hashes)
            .filter((entry): entry is [string, string] => (
              typeof entry[0] === 'string'
              && typeof entry[1] === 'string'
            )),
        )
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
      return {
        lastSuccessAt: state.lastSuccessAt,
        tables: state.tables,
        lastSuccessAtByTable,
        recordHashesByTable,
      }
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

interface RefreshSlotClaim {
  owner: string
  reused: boolean
}

async function writeRefreshSlotGuard(owner: string): Promise<void> {
  await writeKvJson(
    REFRESH_GUARD_KEY,
    { lockedAt: Date.now(), owner },
    REFRESH_GUARD_TTL_SECONDS,
  )
}

async function claimRefreshSlotBestEffort(
  requestedOwner: string = randomUUID(),
): Promise<RefreshSlotClaim | undefined> {
  const existingGuard = await readKvText(REFRESH_GUARD_KEY)
  if (existingGuard !== undefined) {
    try {
      const guard = JSON.parse(existingGuard) as { owner?: unknown }
      if (guard.owner === requestedOwner) {
        await writeRefreshSlotGuard(requestedOwner)
        return { owner: requestedOwner, reused: true }
      }
    }
    catch {}

    return undefined
  }

  // Cloudflare KV writes are not compare-and-set. GitHub Actions concurrency is
  // the authoritative schedule/manual-run serializer; this only reduces
  // accidental overlap from direct API retries.
  await writeRefreshSlotGuard(requestedOwner)
  return { owner: requestedOwner, reused: false }
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

export async function releaseAirtableRefreshGuard(owner: string): Promise<void> {
  await releaseRefreshSlotBestEffort(owner)
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function refreshAirtableRecordsCache(options: AirtableRefreshOptions = {}) {
  const runId = options.requestId ?? randomUUID()
  const runStartedAt = Date.now()
  const workflowLog = createWorkflowLogRun('airtable-refresh', runId, runStartedAt)
  const minIntervalHours = options.minIntervalHours ?? DEFAULT_MIN_INTERVAL_HOURS
  const tables = normalizeTables(options.tables)

  workflowLog.add({
    kind: 'refreshRunStart',
    requestedTables: tables,
    minIntervalHours,
    force: options.force === true,
  })

  if (tables.length === 0) {
    const reason = 'no valid refresh tables requested'
    workflowLog.add({
      kind: 'refreshRunSkipped',
      requestedTables: [],
      reason,
      durationMs: Date.now() - runStartedAt,
    })
    await workflowLog.flush()

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
      workflowLog.add({
        kind: 'refreshRunSkipped',
        requestedTables: tables,
        dueTables,
        reason,
        durationMs: Date.now() - runStartedAt,
      })
      await workflowLog.flush()

      return {
        skipped: true,
        reason,
        runId,
        tables,
      }
    }
  }

  const refreshSlot = await claimRefreshSlotBestEffort(options.guardOwner)
  if (refreshSlot === undefined) {
    const reason = 'refresh already in progress'
    workflowLog.add({
      kind: 'refreshGuard',
      requestedTables: tables,
      reason,
      durationMs: Date.now() - runStartedAt,
    })
    await workflowLog.flush()

    return {
      skipped: true,
      reason,
      runId,
      tables,
    }
  }

  workflowLog.add({
    kind: 'refreshGuard',
    requestedTables: tables,
    reason: refreshSlot.reused ? 'reused refresh slot' : 'claimed refresh slot',
    owner: refreshSlot.owner,
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
        workflowLog.add({
          kind: 'refreshRunSkipped',
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
    const recordHashesByTable = {
      ...(state?.recordHashesByTable ?? {}),
    }
    let lastSuccessAt = state?.lastSuccessAt ?? Date.now()

    for (const table of dueTables) {
      const tableStartedAt = Date.now()
      workflowLog.add({
        kind: 'refreshTableStart',
        table,
        requestedTables: tables,
        dueTables,
      })

      let records
      try {
        records = await refreshCachedRecords(table)
      }
      catch (error) {
        workflowLog.add({
          kind: 'refreshTableFailure',
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
      const recordHashes = buildAirtableRecordHashes(records)
      const changeSummary = summarizeAirtableRecordChanges(
        recordHashesByTable[table],
        recordHashes,
      )
      recordHashesByTable[table] = recordHashes
      refreshed.push({ table, records: records.length, ...changeSummary })

      workflowLog.add({
        kind: 'refreshTableSuccess',
        table,
        requestedTables: tables,
        dueTables,
        durationMs: Date.now() - tableStartedAt,
        recordCount: records.length,
        ...changeSummary,
      })

      const stateWriteStartedAt = Date.now()
      const stateValue = {
        lastSuccessAt,
        tables: refreshed.map(result => result.table),
        lastSuccessAtByTable,
        recordHashesByTable,
      }

      try {
        await writeKvJson(REFRESH_STATE_KEY, stateValue)
      }
      catch (error) {
        workflowLog.add({
          kind: 'refreshStateWrite',
          table,
          requestedTables: tables,
          dueTables,
          durationMs: Date.now() - stateWriteStartedAt,
          reason: getErrorMessage(error),
          error,
        })
        throw error
      }

      workflowLog.add({
        kind: 'refreshStateWrite',
        table,
        requestedTables: tables,
        dueTables,
        durationMs: Date.now() - stateWriteStartedAt,
        affectedCount: refreshed.length,
      })

      await sleep(250)
    }

    workflowLog.add({
      kind: 'refreshRunSuccess',
      requestedTables: tables,
      dueTables,
      durationMs: Date.now() - runStartedAt,
      recordCount: refreshed.reduce((total, result) => total + result.records, 0),
      createdCount: refreshed.reduce((total, result) => total + result.createdCount, 0),
      changedCount: refreshed.reduce((total, result) => total + result.changedCount, 0),
      removedCount: refreshed.reduce((total, result) => total + result.removedCount, 0),
      updatedCount: refreshed.reduce((total, result) => total + result.updatedCount, 0),
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
    workflowLog.add({
      kind: 'refreshRunFailure',
      requestedTables: tables,
      durationMs: Date.now() - runStartedAt,
      reason: getErrorMessage(error),
      error,
    })
    throw error
  }
  finally {
    if (options.releaseGuard !== false) {
      await releaseRefreshSlotBestEffort(refreshSlot.owner)
        .then(() => {
          workflowLog.add({
            kind: 'refreshGuard',
            requestedTables: tables,
            reason: 'released refresh slot',
            owner: refreshSlot.owner,
            durationMs: Date.now() - runStartedAt,
          })
        })
        .catch((error: unknown) => {
          workflowLog.add({
            kind: 'refreshGuard',
            requestedTables: tables,
            reason: getErrorMessage(error),
            owner: refreshSlot.owner,
            durationMs: Date.now() - runStartedAt,
            error,
          })
        })
    }
    await workflowLog.flush()
  }
}
