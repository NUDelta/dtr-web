/**
 * Runtime R2 bucket that stores optimized image objects.
 *
 * Bucket names are not credentials. Access is controlled by the Cloudflare API
 * token, so the production bucket name can be source-controlled.
 */
export const R2_BUCKET = 'dtr-web'

/**
 * Private R2 bucket that stores Airtable and maintenance-log backups.
 *
 * This bucket is intentionally separate from {@link R2_BUCKET}; the name is not
 * secret, but object access remains private unless separately authorized.
 */
export const R2_BACKUP_BUCKET = 'dtr-web-backups'

/**
 * Public origin for optimized image objects stored in {@link R2_BUCKET}.
 *
 * This is source-controlled because the public domain is stable application
 * configuration and does not need per-deployment env plumbing.
 */
export const R2_BUCKET_PUBLIC_URL = 'https://r2.dtr-web.pairresearch.io'

/**
 * How long an R2 image object must stay unreferenced before GC may delete it.
 *
 * The first orphan timestamp is tracked in Workers KV.
 */
export const R2_GC_ORPHAN_GRACE_DAYS = 15
