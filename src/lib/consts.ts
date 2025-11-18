import process from 'node:process'

// RSS Feed Configuration
export const siteUrl = 'https://dtr.northwestern.edu' // Without trailing slash
export const feedFileName = 'letters-feed.xml' // Without leading slash

// R2 Configuration
export const R2_ENDPOINT = process.env.R2_ENDPOINT ?? ''
export const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? ''
export const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? ''
export const R2_BUCKET = process.env.R2_BUCKET ?? ''

export const R2_CLEANUP_MAX_AGE_DAYS = Number.isNaN(Number(process.env.R2_CLEANUP_MAX_AGE_DAYS))
  ? 45 // Default to 45 days
  : Number(process.env.R2_CLEANUP_MAX_AGE_DAYS)

// KV configuration
export const CLOUDFLARE_EMAIL = process.env.CLOUDFLARE_EMAIL ?? ''
export const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY ?? ''
export const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
export const CLOUDFLARE_KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID ?? ''
