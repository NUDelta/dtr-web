import { getEnvValue } from './utils'

/**
 * Cloudflare API token used by the DigitalOcean-hosted Next.js server.
 *
 * This is a credential and must stay environment-backed.
 */
export const CLOUDFLARE_API_TOKEN = getEnvValue('CLOUDFLARE_API_TOKEN') ?? ''

/**
 * Cloudflare account ID that owns the Workers KV namespace and R2 buckets.
 *
 * This identifier is not secret and is source-controlled to reduce deployment
 * configuration surface area.
 */
export const CLOUDFLARE_ACCOUNT_ID = '4ce434f83e67d3b58ad3266ce59e63a3'

/**
 * Workers KV namespace ID used for Airtable caches and maintenance logs.
 *
 * The namespace ID is not a credential. The Cloudflare API token still controls
 * whether callers can read or write this namespace.
 */
export const CLOUDFLARE_KV_NAMESPACE_ID = '3f6810d58cc441769c336f00908c264b'

/**
 * Public Cloudflare Turnstile site key used by client-side widgets.
 *
 * This key is safe to expose in rendered HTML. The corresponding
 * {@link TURNSTILE_SECRET_KEY} remains environment-backed.
 */
export const TURNSTILE_SITE_KEY = '0x4AAAAAADdvARiP58DkR3rB'

/**
 * Cloudflare Turnstile secret key used for server-side token verification.
 *
 * This is a credential and must stay environment-backed.
 */
export const TURNSTILE_SECRET_KEY = getEnvValue('TURNSTILE_SECRET_KEY') ?? ''
