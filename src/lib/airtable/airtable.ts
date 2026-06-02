'use server'

import type { AirtableRow } from './attachment-transform'
import Airtable from 'ts-airtable'
import {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
} from '@/constants/airtable'
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
} from '@/constants/cloudflare'
import { SKIP_REMOTE_DATA } from '@/constants/runtime'
import { CloudflareClient } from '@/lib/cloudflare'
import { createKvLogger } from '@/lib/kv-logger'
import { safeLog } from '@/lib/logger'
import { transformRowsAttachmentsForCache } from './attachment-transform'
import {
  createCloudflareApiKvCacheStore,
  runWithAirtableCacheBypass,
} from './cloudflare-kv-cache'
import {
  AIRTABLE_RECORDS_FRESH_TTL_MS,
  AIRTABLE_RECORDS_STALE_TTL_MS,
  getAirtableAllRecordsCacheKey,
  getAirtableListCachePrefix,
} from './config'

const logger = createKvLogger({
  client: CloudflareClient,
  accountId: CLOUDFLARE_ACCOUNT_ID,
  namespaceId: CLOUDFLARE_KV_NAMESPACE_ID,
  keyPrefix: 'airtable-log',
  logTtlSeconds: 60 * 60 * 24 * 180, // keep 180 days of logs
})

const store = createCloudflareApiKvCacheStore({
  client: CloudflareClient,
  accountId: CLOUDFLARE_ACCOUNT_ID,
  namespaceId: CLOUDFLARE_KV_NAMESPACE_ID,
  keyPrefix: 'airtable-cache',
  minCloudflareTtlSeconds: AIRTABLE_RECORDS_STALE_TTL_MS / 1000,
  staleTtlMs: AIRTABLE_RECORDS_STALE_TTL_MS,
  logger,
})

async function getFromRecordsCache<T>(key: string): Promise<T | undefined> {
  return store.get<T>(key)
}

async function setRecordsCache<T>(key: string, value: T, ttlMs: number): Promise<void> {
  await store.set(key, value, ttlMs)
}

/** Configure Airtable SDK (server-only). */
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: AIRTABLE_API_KEY,
  recordsCache: {
    store,
    defaultTtlMs: AIRTABLE_RECORDS_FRESH_TTL_MS,
    methods: {
      listRecords: false,
      listAllRecords: false,
      getRecord: false,
    },
    onError: (err, context) => {
      safeLog(logger, {
        kind: context.op,
        key: context.key,
        error: err,
        fullKey: `${context.prefix}:${context.key}`,
        timestamp: Date.now(),
      })
    },
  },
})

function getBase() {
  return Airtable.base(AIRTABLE_BASE_ID)
}

export async function fetchAirtableRecords<TFields = Record<string, unknown>>(
  tableName: string,
): Promise<AirtableRow<TFields>[]> {
  if (SKIP_REMOTE_DATA) {
    return []
  }

  const records = await getBase()(tableName).select().all()

  // !NOTE: We trust the Airtable schema matches the TFields provided by caller.
  return records.map(r => ({
    id: r.id,
    fields: r.fields as TFields,
  }))
}

async function fetchAndCacheRecords<TFields = Record<string, unknown>>(
  tableName: string,
  options: { strictCacheWrite: boolean },
): Promise<AirtableRow<TFields>[]> {
  const rows = await fetchAirtableRecords<TFields>(tableName)
  const transformedRows = await transformRowsAttachmentsForCache(tableName, rows, logger)

  const cacheKey = getAirtableAllRecordsCacheKey(tableName)
  try {
    await setRecordsCache(cacheKey, transformedRows, AIRTABLE_RECORDS_FRESH_TTL_MS)
  }
  catch (error) {
    safeLog(logger, {
      kind: 'set',
      key: cacheKey,
      fullKey: `airtable-cache:${cacheKey}`,
      timestamp: Date.now(),
      ttlMs: AIRTABLE_RECORDS_FRESH_TTL_MS,
      error,
    })

    if (options.strictCacheWrite) {
      throw error
    }
  }

  return transformedRows
}

/**
 * Cache enabled fetch of all records from an Airtable table.
 *
 * Caching is handled by Airtable TS with Cloudflare KV Cache Store.
 *
 * @see https://airtable.zla.app/guide/features/caching
 *
 * @typeParam TFields - Shape of the record fields for this table.
 * @param tableName - Airtable table name or ID.
 */
export async function getCachedRecords<TFields = Record<string, unknown>>(
  tableName: string,
): Promise<AirtableRow<TFields>[]> {
  if (SKIP_REMOTE_DATA) {
    return []
  }

  const cacheKey = getAirtableAllRecordsCacheKey(tableName)
  const cached = await getFromRecordsCache<AirtableRow<TFields>[]>(cacheKey).catch((error: unknown) => {
    safeLog(logger, {
      kind: 'get',
      key: cacheKey,
      fullKey: `airtable-cache:${cacheKey}`,
      timestamp: Date.now(),
      error,
    })
    return undefined
  })

  if (cached !== undefined) {
    return cached
  }

  return fetchAndCacheRecords<TFields>(tableName, { strictCacheWrite: false })
}

export async function refreshCachedRecords<TFields = Record<string, unknown>>(
  tableName: string,
): Promise<AirtableRow<TFields>[]> {
  if (SKIP_REMOTE_DATA) {
    return []
  }

  return runWithAirtableCacheBypass(
    [
      getAirtableAllRecordsCacheKey(tableName),
      getAirtableListCachePrefix(tableName),
    ],
    async () => fetchAndCacheRecords<TFields>(tableName, { strictCacheWrite: true }),
  )
}
