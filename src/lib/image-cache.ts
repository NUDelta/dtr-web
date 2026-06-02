'use server'

import type { Attachment } from 'ts-airtable'
import { Buffer } from 'node:buffer'
import { buildR2PublicUrl, r2Delete, r2Get, r2Head, R2ObjectNotFoundError, r2Put } from '@/lib/r2'
import { transcodeBufferToOptimizedImages } from '@/utils/image-convert'

/** Maximum bounding box for width/height when transcoding. */
const MAX_DIMENSION = 2400
const FILE_EXTENSION_PATTERN = /\.[^.]+$/
const ORIGINAL_CACHE_CONTROL = 'public, max-age=31536000, immutable'

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
  const base = filename.replace(FILE_EXTENSION_PATTERN, '') || 'image'
  return `images/${attId}/${variant}/${base}.${format}`
}

export async function buildOriginalImageObjectKey(
  attId: string,
  filename: string,
): Promise<string> {
  return `images/${attId}/original/${filename || 'image'}`
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
  const key = await buildImageObjectKey(attId, variant, filename || 'image', 'webp')
  return buildR2PublicUrl(key)
}

async function readR2ObjectAsBuffer(key: string): Promise<Buffer | undefined> {
  try {
    await r2Head(key)
    const obj = await r2Get(key)
    const stream = obj.Body.transformToWebStream()
    if (stream === null) {
      return undefined
    }

    return Buffer.from(await new Response(stream).arrayBuffer())
  }
  catch (error) {
    if (error instanceof R2ObjectNotFoundError) {
      return undefined
    }

    throw error
  }
}

async function fetchAttachmentOriginal(
  src: string,
): Promise<{ buffer: Buffer, contentType?: string }> {
  const upstream = await fetch(src)
  if (!upstream.ok) {
    throw new Error(`Failed to fetch attachment from Airtable: ${upstream.status}`)
  }

  const contentType = upstream.headers.get('content-type') ?? undefined

  return {
    buffer: Buffer.from(await upstream.arrayBuffer()),
    contentType,
  }
}

/**
 * Ensure that AVIF + WebP variants of an Airtable attachment exist in R2,
 * and return the stable local URL.
 *
 * This is safe to call from **server-only** code (cache store, API routes, RSC).
 *
 * Behaviour:
 * - If WebP already exists in R2, this is a cheap HEAD check and we return it.
 * - Otherwise, we:
 *   1. Read a prior original fallback from R2, or fetch the Airtable URL
 *   2. Downscale & transcode to AVIF + WebP
 *   3. Store optimized variants in R2 with long-lived cache headers
 *   4. If transcoding fails, store the original bytes in R2 and return that URL
 */
export async function ensureImageInR2(
  attachment: Attachment,
  variant: ImageVariant = 'full',
): Promise<{ url: string, webpKey: string, avifKey: string, originalKey?: string }> {
  const attId = attachment.id
  const filename = attachment.filename || 'image'
  const src = attachment.url

  if (!attId || !src) {
    throw new Error('Attachment is missing id or url')
  }

  const [webpKey, avifKey, originalKey] = await Promise.all([
    buildImageObjectKey(attId, variant, filename, 'webp'),
    buildImageObjectKey(attId, variant, filename, 'avif'),
    buildOriginalImageObjectKey(attId, filename),
  ])

  // Fast path: already cached in R2?
  try {
    await r2Head(webpKey)
    return { url: await buildImageUrl(attId, variant, filename), webpKey, avifKey }
  }
  catch {}

  let original = await readR2ObjectAsBuffer(originalKey)
  const originalWasCached = original !== undefined
  let originalContentType = attachment.type

  if (original === undefined) {
    const fetched = await fetchAttachmentOriginal(src)
    original = fetched.buffer
    originalContentType = fetched.contentType ?? originalContentType
  }

  const { avif, webp, converted } = await transcodeBufferToOptimizedImages(original, {
    maxDimension: MAX_DIMENSION,
  })

  if (!converted) {
    if (!originalWasCached) {
      await r2Put(
        originalKey,
        original,
        originalContentType,
        ORIGINAL_CACHE_CONTROL,
      )
    }

    return {
      url: buildR2PublicUrl(originalKey),
      webpKey,
      avifKey,
      originalKey,
    }
  }

  await Promise.all([
    r2Put(webpKey, webp, 'image/webp', 'public, max-age=31536000, immutable'),
    r2Put(avifKey, avif, 'image/avif', 'public, max-age=31536000, immutable'),
  ])

  if (originalWasCached) {
    try {
      await r2Delete(originalKey)
    }
    catch {}
  }

  return {
    url: await buildImageUrl(attId, variant, filename),
    webpKey,
    avifKey,
  }
}
