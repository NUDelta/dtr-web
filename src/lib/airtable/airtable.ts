'use server'

import Airtable from 'ts-airtable'
import { createCloudflareApiKvCacheStore } from './cloudflare-kv-cache'
import {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_KV_NAMESPACE_ID,
} from '@/lib/consts'
import { CloudflareClient } from '@/lib/cloudflare'
import { createKvLogger } from '@/lib/kv-logger'
import { safeLog } from '@/lib/logger'

/** Default TTL for Airtable records cache: 12 hours. */
const TTL = 1000 * 60 * 60 * 12

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
  minCloudflareTtlSeconds: TTL / 1000,
  logger,
})

/** Configure Airtable SDK (server-only). */
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: AIRTABLE_API_KEY,
  recordsCache: {
    store,
    defaultTtlMs: TTL,
    methods: {
      listRecords: true,
      listAllRecords: true,
      getRecord: true,
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

const base = Airtable.base(AIRTABLE_BASE_ID)

interface Row<TFields = Record<string, unknown>> {
  id: string
  fields: TFields
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
): Promise<Row<TFields>[]> {
  const records = await base(tableName).select().all()

  // !NOTE: We trust the Airtable schema matches the TFields provided by caller.
  return records.map(r => ({
    id: r.id,
    fields: r.fields as TFields,
  }))
}
