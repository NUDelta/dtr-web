'use server'

import type { Attachment } from 'ts-airtable'
import { Buffer } from 'node:buffer'
import { r2Head, r2Put, r2PutTags } from '@/lib/r2'
import { transcodeBufferToOptimizedImages } from '@/utils/image-convert'

/** Maximum bounding box for width/height when transcoding. */
const MAX_DIMENSION = 2400

/**
 * Normalize filename and attach requested extension.
 * Stored objects:
 * - images/{attId}/{variant}/{basename}.webp
 * - images/{attId}/{variant}/{basename}.avif
 */
export async function buildImageObjectKey(
  attId: string,
  variant: ImageVariant,
  filename: string,
  format: ImageFormat,
): Promise<string> {
  const base = filename.replace(/\.[^.]+$/, '') || 'image'
  return `images/${attId}/${variant}/${base}.${format}`
}

/**
 * Public URL used by the app to serve the optimized image.
 *
 * Note: no Airtable URL in query params; this only encodes:
 * - attachment id
 * - logical variant bucket
 * - filename
 */
export async function buildImageUrl(
  attId: string,
  variant: ImageVariant,
  filename: string,
): Promise<string> {
  const encodedId = encodeURIComponent(attId)
  const encodedVariant = encodeURIComponent(variant)
  const encodedName = encodeURIComponent(filename || 'image')
  return `/api/images/${encodedId}/${encodedVariant}/${encodedName}`
}

/**
 * Ensure that AVIF + WebP variants of an Airtable attachment exist in R2,
 * and return the stable local URL.
 *
 * This is safe to call from **server-only** code (cache store, API routes, RSC).
 *
 * Behaviour:
 * - If either WebP or AVIF already exists in R2, this is a cheap HEAD check
 *   and we just return the URL.
 * - Otherwise, we:
 *   1. Fetch the original Airtable URL (short-lived signed URL)
 *   2. Downscale & transcode to AVIF + WebP
 *   3. Store both in R2 with long-lived cache headers
 *   4. Return the stable `/api/images/...` URL
 */
export async function ensureImageInR2(
  attachment: Attachment,
  variant: ImageVariant = 'full',
): Promise<{ url: string, webpKey: string, avifKey: string }> {
  const attId = attachment.id
  const filename = attachment.filename || 'image'
  const src = attachment.url

  if (!attId || !src) {
    throw new Error('Attachment is missing id or url')
  }

  const [webpKey, avifKey] = await Promise.all([
    buildImageObjectKey(attId, variant, filename, 'webp'),
    buildImageObjectKey(attId, variant, filename, 'avif'),
  ])

  // Fast path: already cached in R2?
  try {
    await r2Head(webpKey)
    return { url: await buildImageUrl(attId, variant, filename), webpKey, avifKey }
  }
  catch {}
  try {
    await r2Head(avifKey)
    return { url: await buildImageUrl(attId, variant, filename), webpKey, avifKey }
  }
  catch {}

  // Cache miss -> fetch from Airtable, transcode and upload.
  const upstream = await fetch(src)
  if (!upstream.ok) {
    throw new Error(`Failed to fetch attachment from Airtable: ${upstream.status}`)
  }

  const original = Buffer.from(await upstream.arrayBuffer())
  const { avif, webp } = await transcodeBufferToOptimizedImages(original, {
    maxDimension: MAX_DIMENSION,
  })

  await Promise.all([
    r2Put(webpKey, webp, 'image/webp', 'public, max-age=31536000, immutable'),
    r2Put(avifKey, avif, 'image/avif', 'public, max-age=31536000, immutable'),
  ])

  await Promise.all([
    touchLastAccess(webpKey),
    touchLastAccess(avifKey),
  ])

  return {
    url: await buildImageUrl(attId, variant, filename),
    webpKey,
    avifKey,
  }
}

/** Best-effort access tracking via object tag `last-access=YYYY-MM-DD`. */
async function touchLastAccess(key: string) {
  try {
    const today = new Date()
    const y = today.getUTCFullYear()
    const m = String(today.getUTCMonth() + 1).padStart(2, '0')
    const d = String(today.getUTCDate()).padStart(2, '0')
    await r2PutTags(key, { 'last-access': `${y}-${m}-${d}` })
  }
  catch {
    // non-fatal
  }
}
