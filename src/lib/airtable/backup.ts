import type { AirtableRecordHashMap } from './record-change-summary'
import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { R2_BACKUP_BUCKET } from '@/constants/r2'
import { SKIP_REMOTE_DATA } from '@/constants/runtime'
import { createWorkflowLogRun, getErrorMessage } from '@/lib/audit/workflow-logs'
import { buildImageObjectKey, buildOriginalImageObjectKey } from '@/lib/image-cache'
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
import {
  buildAirtableRecordHashes,
  summarizeAirtableRecordChanges,
} from './record-change-summary'

const AIRTABLE_BACKUP_PREFIX = 'backups/airtable'
const DEFAULT_MIN_INTERVAL_HOURS = 24
const TABLE_BACKUP_DELAY_MS = 250

type AirtableBackupTable = typeof AIRTABLE_REFRESH_TABLES[number]
type BackupR2ImageFormat = ImageFormat | 'original'

interface AirtableBackupOptions {
  tables?: readonly string[]
  backupDate?: string
  minIntervalHours?: number
  force?: boolean
  requestId?: string
}

interface BackupR2ImageVariant {
  format: BackupR2ImageFormat
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
  format: BackupR2ImageFormat,
): Promise<BackupR2ImageVariant | undefined> {
  const key = format === 'original'
    ? await buildOriginalImageObjectKey(attachmentId, filename)
    : await buildImageObjectKey(attachmentId, 'full', filename, format)
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
  workflowLog?: ReturnType<typeof createWorkflowLogRun>,
): Promise<BackupR2ImageVariant[]> {
  try {
    return (await Promise.all([
      getExistingR2ImageVariant(attachmentId, filename, 'webp'),
      getExistingR2ImageVariant(attachmentId, filename, 'avif'),
      getExistingR2ImageVariant(attachmentId, filename, 'original'),
    ])).filter((variant): variant is BackupR2ImageVariant => variant !== undefined)
  }
  catch (error) {
    workflowLog?.add({
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
  workflowLog?: ReturnType<typeof createWorkflowLogRun>,
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

        const variants = await collectR2AttachmentVariants(attachment.id, attachment.filename, workflowLog)

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
  const runId = options.requestId ?? randomUUID()
  const workflowLog = createWorkflowLogRun('airtable-backup', runId, runStartedAt)

  if (SKIP_REMOTE_DATA) {
    workflowLog.add({
      kind: 'backupRunFailure',
      reason: 'Airtable backup cannot run while remote data is disabled',
      durationMs: Date.now() - runStartedAt,
    })
    await workflowLog.flush()
    throw new Error('Airtable backup cannot run while remote data is disabled')
  }

  if (R2_BACKUP_BUCKET.length === 0) {
    workflowLog.add({
      kind: 'backupRunFailure',
      reason: 'Missing R2 backup bucket configuration',
      durationMs: Date.now() - runStartedAt,
    })
    await workflowLog.flush()
    throw new Error('Missing R2 backup bucket configuration')
  }

  const tables = normalizeTables(options.tables)
  if (tables.length === 0) {
    workflowLog.add({
      kind: 'backupRunSkipped',
      requestedTables: [],
      reason: 'no valid backup tables requested',
      durationMs: Date.now() - runStartedAt,
    })
    await workflowLog.flush()

    return {
      skipped: true,
      reason: 'no valid backup tables requested',
      tables: [],
    }
  }

  const backedUpAt = new Date().toISOString()
  const backupDate = options.backupDate ?? getBackupDate()
  const minIntervalHours = options.minIntervalHours ?? DEFAULT_MIN_INTERVAL_HOURS

  workflowLog.add({
    kind: 'backupRunStart',
    requestedTables: tables,
    backupDate,
    bucket: R2_BACKUP_BUCKET,
    minIntervalHours,
    force: options.force === true,
  })

  let previousState = await readBackupState()
  if (options.force !== true) {
    const skipped = getSkippedBackup(previousState, backupDate, minIntervalHours)
    if (skipped !== undefined) {
      workflowLog.add({
        kind: 'backupRunSkipped',
        requestedTables: tables,
        backupDate: skipped.state.backupDate,
        manifestKey: skipped.state.manifestKey,
        reason: skipped.reason,
        durationMs: Date.now() - runStartedAt,
      })
      await workflowLog.flush()

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
    workflowLog.add({
      kind: 'backupRunSkipped',
      requestedTables: tables,
      backupDate,
      reason: 'backup already in progress',
      durationMs: Date.now() - runStartedAt,
    })
    await workflowLog.flush()

    return {
      skipped: true,
      reason: 'backup already in progress',
      backupDate,
      tables,
    }
  }

  const backupPrefix = `${AIRTABLE_BACKUP_PREFIX}/${backupDate}`
  const files = []
  const recordHashesByTable: Record<string, AirtableRecordHashMap> = {
    ...(previousState?.recordHashesByTable ?? {}),
  }

  try {
    previousState = await readBackupState()
    Object.assign(recordHashesByTable, previousState?.recordHashesByTable ?? {})
    if (options.force !== true) {
      const skipped = getSkippedBackup(previousState, backupDate, minIntervalHours)
      if (skipped !== undefined) {
        workflowLog.add({
          kind: 'backupRunSkipped',
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
      const r2Attachments = await collectR2AttachmentReferences(records, workflowLog)
      const recordHashes = buildAirtableRecordHashes(records)
      const changeSummary = summarizeAirtableRecordChanges(
        previousState?.recordHashesByTable?.[table],
        recordHashes,
      )
      recordHashesByTable[table] = recordHashes
      const key = `${backupPrefix}/${getTableSlug(table)}.json`
      const body = JSON.stringify({ backedUpAt, table, records, r2Attachments }, null, 2)
      const sizeBytes = Buffer.byteLength(body)
      await r2PutToBucket(
        R2_BACKUP_BUCKET,
        key,
        body,
        'application/json',
        'no-store',
      )
      files.push({
        table,
        key,
        records: records.length,
        r2Attachments: r2Attachments.length,
        sizeBytes,
        ...changeSummary,
      })
      workflowLog.add({
        kind: 'backupTableSuccess',
        table,
        backupDate,
        key,
        bucket: R2_BACKUP_BUCKET,
        recordCount: records.length,
        affectedCount: r2Attachments.length,
        sizeBytes,
        ...changeSummary,
      })
      await sleep(TABLE_BACKUP_DELAY_MS)
    }

    const manifestKey = `${backupPrefix}/manifest.json`
    const manifestBody = JSON.stringify({ backedUpAt, backupDate, tables: files }, null, 2)
    const manifestSizeBytes = Buffer.byteLength(manifestBody)
    await r2PutToBucket(
      R2_BACKUP_BUCKET,
      manifestKey,
      manifestBody,
      'application/json',
      'no-store',
    )

    await writeBackupState({
      lastSuccessAt: Date.now(),
      backupDate,
      manifestKey,
      tables: files,
      recordHashesByTable,
    })

    workflowLog.add({
      kind: 'backupRunSuccess',
      requestedTables: tables,
      backupDate,
      manifestKey,
      bucket: R2_BACKUP_BUCKET,
      durationMs: Date.now() - runStartedAt,
      recordCount: files.reduce((total, file) => total + file.records, 0),
      affectedCount: files.length,
      createdCount: files.reduce((total, file) => total + (file.createdCount ?? 0), 0),
      changedCount: files.reduce((total, file) => total + (file.changedCount ?? 0), 0),
      removedCount: files.reduce((total, file) => total + (file.removedCount ?? 0), 0),
      updatedCount: files.reduce((total, file) => total + (file.updatedCount ?? 0), 0),
      sizeBytes: files.reduce((total, file) => total + (file.sizeBytes ?? 0), manifestSizeBytes),
    })

    return {
      skipped: false,
      backupDate,
      manifestKey,
      tables: files,
    }
  }
  catch (error) {
    workflowLog.add({
      kind: 'backupRunFailure',
      requestedTables: tables,
      backupDate,
      reason: getErrorMessage(error),
      durationMs: Date.now() - runStartedAt,
      error,
    })
    throw error
  }
  finally {
    await workflowLog.flush()
    await releaseBackupSlotBestEffort(backupSlotOwner).catch(() => {})
  }
}
