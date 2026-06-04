import { createHash } from 'node:crypto'

export interface AirtableRecordChangeSummary {
  /** Records whose id was not present in the previous snapshot. */
  createdCount: number
  /** Records whose id existed before but whose fields hash changed. */
  changedCount: number
  /** Records whose id existed before but is absent from the current snapshot. */
  removedCount: number
  /** Total cache-visible updates: created + changed + removed. */
  updatedCount: number
}

export type AirtableRecordHashMap = Record<string, string>

interface AirtableRecordLike {
  id: string
  fields: unknown
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue)
  }

  if (typeof value !== 'object' || value === null) {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, sortJsonValue(item)]),
  )
}

function hashRecordFields(fields: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(sortJsonValue(fields)))
    .digest('hex')
}

/**
 * Builds stable per-record hashes for Airtable row fields.
 *
 * These hashes let scheduled maintenance report real data changes without
 * storing full Airtable payloads in the small workflow state objects.
 */
export function buildAirtableRecordHashes(records: AirtableRecordLike[]): AirtableRecordHashMap {
  return Object.fromEntries(records.map(record => [record.id, hashRecordFields(record.fields)]))
}

/**
 * Compares two Airtable record hash snapshots using record ids as identity.
 *
 * A removed row is counted as an update because public cache consumers observe
 * the table contents changing even though no replacement record is written.
 */
export function summarizeAirtableRecordChanges(
  previous: AirtableRecordHashMap | undefined,
  current: AirtableRecordHashMap,
): AirtableRecordChangeSummary {
  if (previous === undefined) {
    const createdCount = Object.keys(current).length
    return {
      createdCount,
      changedCount: 0,
      removedCount: 0,
      updatedCount: createdCount,
    }
  }

  let createdCount = 0
  let changedCount = 0
  let removedCount = 0

  for (const [recordId, hash] of Object.entries(current)) {
    const previousHash = previous[recordId]
    if (previousHash === undefined) {
      createdCount++
    }
    else if (previousHash !== hash) {
      changedCount++
    }
  }

  for (const recordId of Object.keys(previous)) {
    if (current[recordId] === undefined) {
      removedCount++
    }
  }

  return {
    createdCount,
    changedCount,
    removedCount,
    updatedCount: createdCount + changedCount + removedCount,
  }
}
