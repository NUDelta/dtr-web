'use server';

import process from 'node:process';
import Airtable from 'airtable';
import { unstable_cache } from 'next/cache';
import { revalidateTime } from './consts';

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY ?? '',
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID ?? '');

export async function fetchAirtableRecords(
  tableName: string,
): Promise<{ id: string; fields: Record<string, unknown> }[]> {
  const records = await base(tableName).select().all();
  return records.map(record => ({ id: record.id, fields: record.fields }));
}

export const getCachedRecords = async (tableName: string) =>
  unstable_cache(
    async () => fetchAirtableRecords(tableName),
    [`airtable-${tableName}`],
    { revalidate: revalidateTime },
  )();
