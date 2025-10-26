import process from 'node:process'

// RSS Feed Configuration
export const siteUrl = 'https://dtr.northwestern.edu' // Without trailing slash
export const feedFileName = 'letters-feed.xml' // Without leading slash

// Revalidation Time Configuration (in seconds)
export const revalidateTime = Number.isNaN(Number(process.env.REVALIDATE_TIME))
  ? 21600 // Default to 6 hours
  : Number(process.env.REVALIDATE_TIME)

// R2 Configuration
export const R2_ENDPOINT = process.env.R2_ENDPOINT ?? ''
export const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? ''
export const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? ''
export const R2_BUCKET = process.env.R2_BUCKET ?? ''

export const R2_CLEANUP_MAX_AGE_DAYS = Number.isNaN(Number(process.env.R2_CLEANUP_MAX_AGE_DAYS))
  ? 45 // Default to 45 days
  : Number(process.env.R2_CLEANUP_MAX_AGE_DAYS)
