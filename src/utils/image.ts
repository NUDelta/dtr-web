'use server'

import type { Attachment } from 'ts-airtable'

/**
 * Generates a cached image URL from an Airtable attachment using a stable key.
 *
 * Instead of returning a temporary Airtable URL, this function generates
 * a local API endpoint URL backed by R2 persistent cache. The cache key
 * is the stable Airtable `attachment.id`, so it won't churn when the
 * signed Airtable URL rotates/expires. The `src` query param is only used
 * on the very first cache miss to fetch and populate R2, and ignored afterwards.
 *
 * @param {Attachment[] | undefined} attachmentArr - Airtable attachments array.
 * @param {('full'|'thumb'|'large')} variant - Optional size/variant bucket to avoid collisions across sizes.
 * @returns {Promise<string | null>} Local cached WebP URL or null if no valid image.
 */
export const getImgUrlFromAttachmentObj = async (
  attachmentArr?: Attachment[],
  variant: 'full' | 'thumb' | 'large' = 'full',
): Promise<string | null> => {
  if (!attachmentArr || attachmentArr.length === 0) {
    return null
  }

  const target = attachmentArr[0]
  if (!target?.type?.includes('image')) {
    return null
  }

  const attId = target.id // Airtable attachment id is stable (e.g., "attXXXXXXXX")
  const filename = target.filename || 'image'
  const src = target.url // Temporary signed URL from Airtable - used only on first miss

  if (!attId || !src) {
    return null
  }

  const encodedId = encodeURIComponent(attId)
  const encodedVariant = encodeURIComponent(variant)
  const encodedName = encodeURIComponent(filename)
  const encodedSrc = encodeURIComponent(src)

  // The route will persist to R2 (as WebP) on first miss, then serve/redirect.
  // Format: /api/images/{attId}/{variant}/{filename}?src={airtable_url}
  const url = `/api/images/${encodedId}/${encodedVariant}/${encodedName}?src=${encodedSrc}`
  fetch(url).catch(() => {
    // Ignore errors - this is just a prefetch to warm the cache.
  })
  return url
}
