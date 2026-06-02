import { getEnvValue } from './utils'

/**
 * Airtable API key used by server-only data fetch and cache refresh code.
 *
 * This is a credential and must stay environment-backed.
 */
export const AIRTABLE_API_KEY = getEnvValue('AIRTABLE_API_KEY') ?? ''

/**
 * Airtable base ID used for DTR content tables and KV cache key namespacing.
 *
 * The base ID is not a credential. Keeping it in source control avoids
 * unnecessary deployment environment drift for the production content source.
 */
export const AIRTABLE_BASE_ID = 'app6s5xR7ukC8v9g0'
