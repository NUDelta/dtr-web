import { AIRTABLE_REFRESH_TABLES, getAirtableAllRecordsCacheKey } from '@/lib/airtable/config'
import { buildImageObjectKey, buildOriginalImageObjectKey } from '@/lib/image-cache'
import { buildR2PublicUrl } from '@/lib/r2'
import { readKvText } from '@/lib/r2/r2-gc-kv'

const AIRTABLE_CACHE_KEY_PREFIX = 'airtable-cache'

interface AirtableCacheRecord {
  id: string
  fields: Record<string, unknown>
}

function getAirtableCacheFullKey(tableName: string): string {
  return `${AIRTABLE_CACHE_KEY_PREFIX}:${getAirtableAllRecordsCacheKey(tableName)}`
}

function isCacheEnvelopeUsable(envelope: Partial<KvEnvelope<unknown>>, now = Date.now()): boolean {
  const staleUntil = envelope.staleUntil ?? envelope.expiresAt
  return (
    staleUntil === undefined
    || (Number.isFinite(staleUntil) && staleUntil > now)
  )
}

function parseCachedRecords(text: string | undefined): AirtableCacheRecord[] | undefined {
  if (text === undefined) {
    return undefined
  }

  try {
    const envelope = JSON.parse(text) as Partial<KvEnvelope<unknown>>
    if (!isCacheEnvelopeUsable(envelope)) {
      return undefined
    }

    const value: unknown = envelope.value
    if (!Array.isArray(value)) {
      return undefined
    }

    return value.filter((record: unknown): record is AirtableCacheRecord => (
      typeof record === 'object'
      && record !== null
      && 'id' in record
      && typeof record.id === 'string'
      && 'fields' in record
      && typeof record.fields === 'object'
      && record.fields !== null
    ))
  }
  catch {
    return undefined
  }
}

function isAttachment(value: unknown): value is {
  id?: unknown
  filename?: unknown
  type?: unknown
  url?: unknown
} {
  return (
    typeof value === 'object'
    && value !== null
    && 'id' in value
    && 'filename' in value
  )
}

async function collectRecordImageKeys(record: AirtableCacheRecord): Promise<string[]> {
  const keys: string[] = []

  for (const value of Object.values(record.fields)) {
    if (!Array.isArray(value)) {
      continue
    }

    for (const attachment of value.filter(isAttachment)) {
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

      keys.push(
        await buildImageObjectKey(attachment.id, 'full', attachment.filename, 'webp'),
        await buildImageObjectKey(attachment.id, 'full', attachment.filename, 'avif'),
      )

      const originalKey = await buildOriginalImageObjectKey(attachment.id, attachment.filename)
      if (attachment.url === buildR2PublicUrl(originalKey)) {
        keys.push(originalKey)
      }
    }
  }

  return keys
}

export async function collectLiveImageKeys(): Promise<{ liveKeys: Set<string>, missingTables: string[] }> {
  const liveKeys = new Set<string>()
  const missingTables: string[] = []

  for (const table of AIRTABLE_REFRESH_TABLES) {
    const records = parseCachedRecords(await readKvText(getAirtableCacheFullKey(table)))
    if (records === undefined) {
      missingTables.push(table)
      continue
    }

    for (const record of records) {
      for (const key of await collectRecordImageKeys(record)) {
        liveKeys.add(key)
      }
    }
  }

  return { liveKeys, missingTables }
}
