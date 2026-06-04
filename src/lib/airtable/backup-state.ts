import { randomUUID } from 'node:crypto'
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
} from '@/constants/cloudflare'
import { CloudflareClient } from '@/lib/cloudflare'

const BACKUP_STATE_KEY = 'airtable-backup:state'
const BACKUP_GUARD_KEY = 'airtable-backup:guard'
const BACKUP_GUARD_TTL_SECONDS = 30 * 60
const BACKUP_INTERVAL_BUFFER_MS = 10 * 60 * 1000

export interface AirtableBackupFile {
  table: string
  key: string
  records: number
  r2Attachments?: number
  createdCount?: number
  changedCount?: number
  removedCount?: number
  updatedCount?: number
  sizeBytes?: number
}

export interface AirtableBackupState {
  lastSuccessAt: number
  backupDate: string
  manifestKey: string
  tables: AirtableBackupFile[]
  recordHashesByTable?: Record<string, Record<string, string>>
}

function parseRecordHashesByTable(value: unknown): Record<string, Record<string, string>> | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined
  }

  const hashesByTable: Record<string, Record<string, string>> = {}
  for (const [table, hashes] of Object.entries(value as Record<string, unknown>)) {
    if (typeof hashes !== 'object' || hashes === null) {
      continue
    }

    hashesByTable[table] = Object.fromEntries(
      Object.entries(hashes as Record<string, unknown>)
        .filter((entry): entry is [string, string] => (
          typeof entry[0] === 'string'
          && typeof entry[1] === 'string'
        )),
    )
  }

  return Object.keys(hashesByTable).length > 0 ? hashesByTable : undefined
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

export async function readBackupState(): Promise<AirtableBackupState | undefined> {
  const text = await readKvText(BACKUP_STATE_KEY)
  if (text === undefined) {
    return undefined
  }

  try {
    const state = JSON.parse(text) as Partial<AirtableBackupState>
    if (
      typeof state.lastSuccessAt === 'number'
      && Number.isFinite(state.lastSuccessAt)
      && typeof state.backupDate === 'string'
      && typeof state.manifestKey === 'string'
      && Array.isArray(state.tables)
    ) {
      return {
        lastSuccessAt: state.lastSuccessAt,
        backupDate: state.backupDate,
        manifestKey: state.manifestKey,
        tables: state.tables,
        recordHashesByTable: parseRecordHashesByTable(state.recordHashesByTable),
      }
    }
  }
  catch {
    return undefined
  }

  return undefined
}

export function getSkippedBackup(
  state: AirtableBackupState | undefined,
  backupDate: string,
  minIntervalHours: number,
): { reason: string, state: AirtableBackupState } | undefined {
  if (state === undefined) {
    return undefined
  }

  if (state.backupDate === backupDate) {
    return { reason: `backup already completed for ${backupDate}`, state }
  }

  const minIntervalMs = Math.max(
    0,
    minIntervalHours * 60 * 60 * 1000 - BACKUP_INTERVAL_BUFFER_MS,
  )
  if (Date.now() - state.lastSuccessAt < minIntervalMs) {
    return {
      reason: `last successful backup ${((Date.now() - state.lastSuccessAt) / (60 * 60 * 1000)).toFixed(1)}h ago`,
      state,
    }
  }

  return undefined
}

export async function writeBackupState(state: AirtableBackupState): Promise<void> {
  await writeKvJson(BACKUP_STATE_KEY, state)
}

export async function claimBackupSlotBestEffort(): Promise<string | undefined> {
  const existingGuard = await readKvText(BACKUP_GUARD_KEY)
  if (existingGuard !== undefined) {
    return undefined
  }

  const owner = randomUUID()
  await writeKvJson(
    BACKUP_GUARD_KEY,
    { lockedAt: Date.now(), owner },
    BACKUP_GUARD_TTL_SECONDS,
  )
  return owner
}

export async function releaseBackupSlotBestEffort(owner: string): Promise<void> {
  const text = await readKvText(BACKUP_GUARD_KEY)
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
    BACKUP_GUARD_KEY,
    { account_id: CLOUDFLARE_ACCOUNT_ID },
  )
}
