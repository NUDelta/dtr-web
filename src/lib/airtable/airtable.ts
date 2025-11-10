import 'server-only'

import process from 'node:process'
import type { AirtableFieldSet } from 'ts-airtable'
import Airtable, { InMemoryCacheStore } from 'ts-airtable'
import { cacheLife } from 'next/cache'
import { logProd, nowMs } from '@/lib/logger'

const store = new InMemoryCacheStore()

/** Configure Airtable SDK (server-only). */
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY ?? '',
  recordsCache: {
    store,
    defaultTtlMs: 1000 * 60 * 60 * 6, // 6 hours
    methods: {
      listRecords: true,
      listAllRecords: true,
      getRecord: true,
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

type AnyRow = Row<unknown>

/**
 * In-process coalescing of concurrent reads for the same table.
 * Keep this on globalThis to survive HMR / multi-module instances in dev.
 */
declare global {
  // eslint-disable-next-line vars-on-top
  var __airtableInflight: Map<string, Promise<AnyRow[]>> | undefined
}
const g = globalThis as typeof globalThis & {
  __airtableInflight?: Map<string, Promise<AnyRow[]>>
}
g.__airtableInflight ??= new Map<string, Promise<AnyRow[]>>()
const inflight = g.__airtableInflight

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
  'use cache'
  cacheLife('halfDays')

  // Coalesce concurrent calls for the same table within this process.
  const existing = inflight.get(tableName)
  if (existing) {
    return existing as Promise<Row<TFields>[]>
  }

  const p: Promise<Row<TFields>[]> = fetchAirtableRecordsRaw<TFields>(tableName)
    .finally(() => {
      // Always clear the inflight slot, even on rejection.
      inflight.delete(tableName)
    })

  inflight.set(tableName, p as Promise<AnyRow[]>)
  return p
}
