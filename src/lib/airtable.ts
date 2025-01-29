import type { Attachment } from 'airtable';
import process from 'node:process';
import Airtable from 'airtable';
import { unstable_cache } from 'next/cache';
import { revalidateTime } from './consts';

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY ?? '',
});

export const base = Airtable.base(process.env.AIRTABLE_BASE_ID ?? '');

export async function fetchAirtableRecords(tableName: string) {
  const records = await base(tableName).select().all();
  return records.map(record => ({ id: record.id, fields: record.fields }));
}

export const getCachedRecords = unstable_cache(
  async (tableName: string) => fetchAirtableRecords(tableName),
  ['airtable'],
  { revalidate: revalidateTime },
);

/**
 * Extracts the first image URL from Airtable's attachment array.
 *
 * @param {Attachment[] | undefined} attachmentArr - Array of Airtable Attachments, or undefined.
 * @returns {string | null} The first image URL if found, otherwise `null`.
 *
 * @example
 * const imgUrl = getImgUrlFromAttachmentObj(record.fields.profile_photo);
 * console.log(imgUrl); // "https://dl.airtable.com/..."
 */
export function getImgUrlFromAttachmentObj(attachmentArr?: Attachment[]): string | null {
  // Ensure the array is not empty and has at least one image attachment
  const targetImg = attachmentArr?.[0];
  return targetImg?.type.includes('image') ? targetImg.url : null;
}
