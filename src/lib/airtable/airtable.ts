import 'server-only'

import process from 'node:process'
import Airtable from 'airtable'
import { cacheLife } from 'next/cache'
import { logProd, nowMs } from '@/lib/logger'

/** Configure Airtable SDK (server-only). */
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY ?? '',
})

const base = Airtable.base(process.env.AIRTABLE_BASE_ID ?? '')

interface Row {
  id: string
  fields: Record<string, unknown>
}

/**
 * Low-level fetcher that actually hits Airtable.
 * Called only on cache miss / first fill.
 */
async function fetchAirtableRecordsRaw(tableName: string): Promise<Row[]> {
  const t0 = nowMs()
  logProd('airtable.fetch.start', { table: tableName })

  const records = await base(tableName).select().all()

  logProd('airtable.fetch.done', {
    table: tableName,
    rows: records.length,
    ms: nowMs() - t0,
  })

  return records.map(r => ({ id: r.id, fields: r.fields }))
}

/**
 * In-process coalescing of concurrent reads for the same table.
 * Keep this on globalThis to survive HMR / multi-module instances in dev.
 */
declare global {
  // eslint-disable-next-line vars-on-top
  var __airtableInflight: Map<string, Promise<Row[]>> | undefined
}
const g = globalThis as unknown as { __airtableInflight?: Map<string, Promise<Row[]>> }
g.__airtableInflight ??= new Map<string, Promise<Row[]>>()
const inflight = g.__airtableInflight

/**
 * Public entry: uses Next.js Server Cache in prod + in-process coalescing always.
 * - 'use cache' + cacheLife('halfDays') lets Next manage cross-request caching in prod.
 * - The in-process inflight map avoids thundering herds during the first fill.
 */
export async function getCachedRecords(tableName: string): Promise<Row[]> {
  'use cache'
  cacheLife('halfDays')

  // Coalesce concurrent calls for the same table within this process.
  const existing = inflight.get(tableName)
  if (existing) {
    return existing
  }

  const p = fetchAirtableRecordsRaw(tableName)
    .finally(() => {
      // Always clear the inflight slot, even on rejection.
      inflight.delete(tableName)
    })

  inflight.set(tableName, p)
  return p
}
