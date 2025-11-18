import process from 'node:process'
import type { AirtableFieldSet } from 'ts-airtable'
import Airtable from 'ts-airtable'
// import { cacheLife } from 'next/cache'
import { logProd, nowMs } from '@/lib/logger'
import { createCloudflareApiKvCacheStore } from './cloudflare-kv-cache'
import { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_KV_NAMESPACE_ID } from '@/lib/consts'
import { CloudflareClient } from '@/lib/cloudflare'

/** Default TTL for Airtable records cache: 6 hours. */
const TTL = 1000 * 60 * 60 * 6

const store = createCloudflareApiKvCacheStore({
  client: CloudflareClient,
  accountId: CLOUDFLARE_ACCOUNT_ID,
  namespaceId: CLOUDFLARE_KV_NAMESPACE_ID,
  keyPrefix: 'airtable-cache',
  minCloudflareTtlSeconds: TTL / 1000,
})

/** Configure Airtable SDK (server-only). */
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY ?? '',
  recordsCache: {
    store,
    defaultTtlMs: TTL,
    methods: {
      listRecords: true,
      listAllRecords: true,
      getRecord: true,
    },
    onError: (err, context) => {
      logProd('airtable.cache.error', {
        error: err instanceof Error ? err.message : String(err),
        context,
      })
    },
  },
})

const base = Airtable.base(process.env.AIRTABLE_BASE_ID ?? '')

interface Row<TFields = Record<string, unknown>> {
  id: string
  fields: TFields
}

/**
 * Low-level fetcher that actually hits Airtable.
 * Called only on cache miss / first fill.
 *
 * @typeParam TFields - Shape of the record fields for this table.
 * @param tableName - Airtable table name or ID.
 */
async function fetchAirtableRecordsRaw<TFields = Record<string, unknown>>(
  tableName: string,
): Promise<Row<TFields>[]> {
  const t0 = nowMs()
  logProd('airtable.fetch.start', { table: tableName })

  const records = await base(tableName).select().all()

  logProd('airtable.fetch.done', {
    table: tableName,
    rows: records.length,
    ms: nowMs() - t0,
  })

  // !NOTE: We trust the Airtable schema matches the TFields provided by caller.
  return records.map(r => ({
    id: r.id,
    fields: r.fields as TFields,
  }))
}

/**
 * Public entry: uses Next.js Server Cache in prod + in-process coalescing always.
 * - 'use cache' + cacheLife('halfDays') lets Next manage cross-request caching in prod.
 * - The in-process inflight map avoids thundering herds during the first fill.
 * @typeParam TFields - Shape of the record fields for this table.
 * @param tableName - Airtable table name or ID.
 */
export async function getCachedRecords<TFields = AirtableFieldSet>(
  tableName: string,
): Promise<Row<TFields>[]> {
  // 'use cache'
  // cacheLife('halfDays')

  return fetchAirtableRecordsRaw<TFields>(tableName)
}
