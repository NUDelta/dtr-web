import { AIRTABLE_BASE_ID } from '@/constants/airtable'

/** Airtable records are refreshed by cron every 12 hours. */
export const AIRTABLE_RECORDS_FRESH_TTL_MS = 1000 * 60 * 60 * 12
/** Keep stale data available so Airtable outages do not break public pages. */
export const AIRTABLE_RECORDS_STALE_TTL_MS = 1000 * 60 * 60 * 24 * 30

export const AIRTABLE_REFRESH_TABLES = [
  'People',
  'Projects',
  'SIGs',
  'Project Images',
  'Project Publications',
] as const

export function getAirtableListCachePrefix(tableName: string): string {
  return `records:list:${AIRTABLE_BASE_ID}:${encodeURIComponent(tableName)}:`
}

export function getAirtableAllRecordsCacheKey(tableName: string): string {
  return `records:all:${AIRTABLE_BASE_ID}:${encodeURIComponent(tableName)}:{}`
}
