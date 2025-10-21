'use server';

import process from 'node:process';
import Airtable from 'airtable';
import { unstable_cache } from 'next/cache';
import { revalidateTime } from '@/lib/consts';
import { logProd, nowMs } from '@/lib/logger';

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY ?? '',
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID ?? '');

/**
 * Fetch Airtable records (uncached).
 * This function is called only on cache miss; use it as the quota "meter".
 */
async function fetchAirtableRecords(
  tableName: string,
): Promise<{ id: string; fields: Record<string, unknown> }[]> {
  const t0 = nowMs();

  // Structured, production-only start log
  logProd('airtable.fetch.start', {
    table: tableName,
    cache_tag: `airtable-${tableName}`,
    revalidate_s: revalidateTime,
  });

  const records = await base(tableName).select().all();

  const t1 = nowMs();
  // Structured, production-only done log
  logProd('airtable.fetch.done', {
    table: tableName,
    rows: records.length,
    ms: t1 - t0,
    cache_tag: `airtable-${tableName}`,
    revalidate_s: revalidateTime,
  });

  return records.map(record => ({ id: record.id, fields: record.fields }));
}

/**
 * Cached accessor using Next.js unstable_cache.
 * Cache key is per-table; manual revalidation via tag is supported.
 */
export async function getCachedRecords(tableName: string) {
  const cachedFetch = unstable_cache(
    async () => fetchAirtableRecords(tableName),
    [`airtable-${tableName}`],
    {
      revalidate: revalidateTime,
      tags: [`airtable-${tableName}`],
    },
  );
  return cachedFetch();
}
