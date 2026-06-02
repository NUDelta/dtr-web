import { randomUUID } from 'node:crypto'
import {
  R2_BACKUP_BUCKET,
  SKIP_REMOTE_DATA,
} from '@/lib/consts'
import { buildImageObjectKey } from '@/lib/image-cache'
import { archiveRecentOpsLogsToBackupBucket } from '@/lib/ops/audit-logs'
import { getErrorMessage, logOpsEvent } from '@/lib/ops/logging'
import { buildR2PublicUrl, r2Head, R2ObjectNotFoundError, r2PutToBucket } from '@/lib/r2'
import { fetchAirtableRecords } from './airtable'
import {
  claimBackupSlotBestEffort,
  getSkippedBackup,
  readBackupState,
  releaseBackupSlotBestEffort,
  writeBackupState,
} from './backup-state'
import { AIRTABLE_REFRESH_TABLES } from './config'

const AIRTABLE_BACKUP_PREFIX = 'backups/airtable'
const DEFAULT_MIN_INTERVAL_HOURS = 24
const TABLE_BACKUP_DELAY_MS = 250

type AirtableBackupTable = typeof AIRTABLE_REFRESH_TABLES[number]

interface AirtableBackupOptions {
  tables?: readonly string[]
  backupDate?: string
  minIntervalHours?: number
  force?: boolean
}

interface BackupR2ImageVariant {
  format: ImageFormat
  key: string
  publicUrl: string
}

interface BackupR2AttachmentReference {
  recordId: string
  fieldName: string
  attachmentId: string
  filename: string
  type?: string
  size?: number
  variants: BackupR2ImageVariant[]
}

function isBackupTable(table: string): table is AirtableBackupTable {
  return AIRTABLE_REFRESH_TABLES.includes(table as AirtableBackupTable)
}

function normalizeTables(tables: readonly string[] | undefined): AirtableBackupTable[] {
  if (tables === undefined) {
    return [...AIRTABLE_REFRESH_TABLES]
  }

  return Array.from(new Set(tables)).filter(isBackupTable)
}

function getBackupDate(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

function getTableSlug(table: string): string {
  return table
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms))
}

function isAttachment(value: unknown): value is {
  id?: unknown
  filename?: unknown
  type?: unknown
  size?: unknown
} {
  return (
    typeof value === 'object'
    && value !== null
    && 'id' in value
    && 'filename' in value
  )
}

function getAttachmentArrays(fields: Record<string, unknown>): Array<{
  fieldName: string
  attachments: Array<{
    id?: unknown
    filename?: unknown
    type?: unknown
    size?: unknown
  }>
}> {
  return Object.entries(fields)
    .filter((entry): entry is [string, unknown[]] => Array.isArray(entry[1]))
    .map(([fieldName, values]) => ({
      fieldName,
      attachments: values.filter(isAttachment),
    }))
    .filter(({ attachments }) => attachments.length > 0)
}

async function getExistingR2ImageVariant(
  attachmentId: string,
  filename: string,
  format: ImageFormat,
): Promise<BackupR2ImageVariant | undefined> {
  const key = await buildImageObjectKey(attachmentId, 'full', filename, format)
  try {
    await r2Head(key)
    return {
      format,
      key,
      publicUrl: buildR2PublicUrl(key),
    }
  }
  catch (error) {
    if (error instanceof R2ObjectNotFoundError) {
      return undefined
    }

    throw error
  }
}

async function collectR2AttachmentVariants(
  attachmentId: string,
  filename: string,
): Promise<BackupR2ImageVariant[]> {
  try {
    return (await Promise.all([
      getExistingR2ImageVariant(attachmentId, filename, 'webp'),
      getExistingR2ImageVariant(attachmentId, filename, 'avif'),
    ])).filter((variant): variant is BackupR2ImageVariant => variant !== undefined)
  }
  catch (error) {
    await logOpsEvent('airtable-backup', {
      kind: 'backupR2ReferenceFailure',
      key: attachmentId,
      reason: getErrorMessage(error),
      error,
    })
    throw error
  }
}

async function collectR2AttachmentReferences(
  records: Array<{ id: string, fields: Record<string, unknown> }>,
): Promise<BackupR2AttachmentReference[]> {
  const references: BackupR2AttachmentReference[] = []

  for (const record of records) {
    for (const { fieldName, attachments } of getAttachmentArrays(record.fields)) {
      for (const attachment of attachments) {
        if (
          typeof attachment.id !== 'string'
          || typeof attachment.filename !== 'string'
          || (
            typeof attachment.type === 'string'
            && !attachment.type.startsWith('image/')
          )
        ) {
          continue
        }

        const variants = await collectR2AttachmentVariants(attachment.id, attachment.filename)

        if (variants.length === 0) {
          continue
        }

        references.push({
          recordId: record.id,
          fieldName,
          attachmentId: attachment.id,
          filename: attachment.filename,
          ...(typeof attachment.type === 'string' ? { type: attachment.type } : {}),
          ...(typeof attachment.size === 'number' ? { size: attachment.size } : {}),
          variants,
        })
      }
    }
  }

  return references
}

export async function backupAirtableTables(options: AirtableBackupOptions = {}) {
  const runStartedAt = Date.now()
  const runId = randomUUID()

  if (SKIP_REMOTE_DATA) {
    throw new Error('Airtable backup cannot run while remote data is disabled')
  }

  if (R2_BACKUP_BUCKET.length === 0) {
    throw new Error('Missing R2_BACKUP_BUCKET environment variable')
  }

  const tables = normalizeTables(options.tables)
  if (tables.length === 0) {
    return {
      skipped: true,
      reason: 'no valid backup tables requested',
      tables: [],
    }
  }

  const backedUpAt = new Date().toISOString()
  const backupDate = options.backupDate ?? getBackupDate()
  const minIntervalHours = options.minIntervalHours ?? DEFAULT_MIN_INTERVAL_HOURS

  await logOpsEvent('airtable-backup', {
    kind: 'backupRunStart',
    runId,
    requestedTables: tables,
    backupDate,
    bucket: R2_BACKUP_BUCKET,
    minIntervalHours,
    force: options.force === true,
  })

  if (options.force !== true) {
    const skipped = getSkippedBackup(await readBackupState(), backupDate, minIntervalHours)
    if (skipped !== undefined) {
      await logOpsEvent('airtable-backup', {
        kind: 'backupRunSkipped',
        runId,
        requestedTables: tables,
        backupDate: skipped.state.backupDate,
        manifestKey: skipped.state.manifestKey,
        reason: skipped.reason,
        durationMs: Date.now() - runStartedAt,
      })

      return {
        skipped: true,
        reason: skipped.reason,
        backupDate: skipped.state.backupDate,
        manifestKey: skipped.state.manifestKey,
        tables: skipped.state.tables,
      }
    }
  }

  const backupSlotOwner = await claimBackupSlotBestEffort()
  if (backupSlotOwner === undefined) {
    await logOpsEvent('airtable-backup', {
      kind: 'backupRunSkipped',
      runId,
      requestedTables: tables,
      backupDate,
      reason: 'backup already in progress',
      durationMs: Date.now() - runStartedAt,
    })

    return {
      skipped: true,
      reason: 'backup already in progress',
      backupDate,
      tables,
    }
  }

  const backupPrefix = `${AIRTABLE_BACKUP_PREFIX}/${backupDate}`
  const files = []

  try {
    if (options.force !== true) {
      const skipped = getSkippedBackup(await readBackupState(), backupDate, minIntervalHours)
      if (skipped !== undefined) {
        await logOpsEvent('airtable-backup', {
          kind: 'backupRunSkipped',
          runId,
          requestedTables: tables,
          backupDate: skipped.state.backupDate,
          manifestKey: skipped.state.manifestKey,
          reason: skipped.reason,
          durationMs: Date.now() - runStartedAt,
        })

        return {
          skipped: true,
          reason: skipped.reason,
          backupDate: skipped.state.backupDate,
          manifestKey: skipped.state.manifestKey,
          tables: skipped.state.tables,
        }
      }
    }

    for (const table of tables) {
      const records = await fetchAirtableRecords(table)
      const r2Attachments = await collectR2AttachmentReferences(records)
      const key = `${backupPrefix}/${getTableSlug(table)}.json`
      await r2PutToBucket(
        R2_BACKUP_BUCKET,
        key,
        JSON.stringify({ backedUpAt, table, records, r2Attachments }, null, 2),
        'application/json',
        'no-store',
      )
      files.push({ table, key, records: records.length, r2Attachments: r2Attachments.length })
      await logOpsEvent('airtable-backup', {
        kind: 'backupTableSuccess',
        runId,
        table,
        backupDate,
        key,
        bucket: R2_BACKUP_BUCKET,
        recordCount: records.length,
        affectedCount: r2Attachments.length,
      })
      await sleep(TABLE_BACKUP_DELAY_MS)
    }

    const manifestKey = `${backupPrefix}/manifest.json`
    await r2PutToBucket(
      R2_BACKUP_BUCKET,
      manifestKey,
      JSON.stringify({ backedUpAt, backupDate, tables: files }, null, 2),
      'application/json',
      'no-store',
    )

    await writeBackupState({
      lastSuccessAt: Date.now(),
      backupDate,
      manifestKey,
      tables: files,
    })

    try {
      const logArchive = await archiveRecentOpsLogsToBackupBucket({ backupDate, backedUpAt })
      if (logArchive !== undefined) {
        await logOpsEvent('airtable-backup', {
          kind: 'backupLogArchive',
          runId,
          backupDate,
          manifestKey: logArchive.manifestKey,
          bucket: R2_BACKUP_BUCKET,
          logCount: logArchive.sources.reduce((total, source) => total + source.logs, 0),
          affectedCount: logArchive.sources.length,
        })
      }
    }
    catch (error) {
      await logOpsEvent('airtable-backup', {
        kind: 'backupLogArchive',
        runId,
        backupDate,
        bucket: R2_BACKUP_BUCKET,
        reason: getErrorMessage(error),
        error,
      })
    }

    await logOpsEvent('airtable-backup', {
      kind: 'backupRunSuccess',
      runId,
      requestedTables: tables,
      backupDate,
      manifestKey,
      bucket: R2_BACKUP_BUCKET,
      durationMs: Date.now() - runStartedAt,
      recordCount: files.reduce((total, file) => total + file.records, 0),
      affectedCount: files.length,
    })

    return {
      skipped: false,
      backupDate,
      manifestKey,
      tables: files,
    }
  }
  catch (error) {
    await logOpsEvent('airtable-backup', {
      kind: 'backupRunFailure',
      runId,
      requestedTables: tables,
      backupDate,
      reason: getErrorMessage(error),
      durationMs: Date.now() - runStartedAt,
      error,
    })
    throw error
  }
  finally {
    await releaseBackupSlotBestEffort(backupSlotOwner).catch(() => {})
  }
}
