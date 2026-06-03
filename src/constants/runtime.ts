import { getEnvValue } from './utils'

/**
 * Local-only escape hatch for running builds without Airtable, Cloudflare KV, or
 * R2 credentials.
 *
 * Production should leave this unset. The flag still matters because cache
 * misses, cache refreshes, backups, and image writes can touch remote services
 * even though normal public reads prefer KV-cached data.
 */
export const SKIP_REMOTE_DATA = getEnvValue('SKIP_REMOTE_DATA') === '1'
