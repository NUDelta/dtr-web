import { r2Put } from '@/lib/r2'
import { fetchAirtableRecords } from './airtable'
import { AIRTABLE_REFRESH_TABLES } from './config'

const AIRTABLE_BACKUP_PREFIX = 'backups/airtable'
const TABLE_BACKUP_DELAY_MS = 250

type AirtableBackupTable = typeof AIRTABLE_REFRESH_TABLES[number]

interface AirtableBackupOptions {
  tables?: readonly string[]
  backupDate?: string
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

export async function backupAirtableTables(options: AirtableBackupOptions = {}) {
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
  const backupPrefix = `${AIRTABLE_BACKUP_PREFIX}/${backupDate}`
  const files = []

  for (const table of tables) {
    const records = await fetchAirtableRecords(table)
    const key = `${backupPrefix}/${getTableSlug(table)}.json`
    await r2Put(
      key,
      JSON.stringify({ backedUpAt, table, records }, null, 2),
      'application/json',
      'no-store',
    )
    files.push({ table, key, records: records.length })
    await sleep(TABLE_BACKUP_DELAY_MS)
  }

  const manifestKey = `${backupPrefix}/manifest.json`
  await r2Put(
    manifestKey,
    JSON.stringify({ backedUpAt, backupDate, tables: files }, null, 2),
    'application/json',
    'no-store',
  )

  return {
    skipped: false,
    backupDate,
    manifestKey,
    tables: files,
  }
}
