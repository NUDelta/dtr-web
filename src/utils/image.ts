'use server'

import type { Attachment } from 'ts-airtable'

/**
 * Returns the image URL for the first Airtable attachment.
 *
 * When using `recordsCache` with a store that implements
 * `transformAttachment`, this will already be a stable public R2 URL
 * that does not expose Airtable's signed URL.
 */
export const getImgUrlFromAttachmentObj = async (
  attachmentArr?: Attachment[],
): Promise<string | null> => {
  if (!attachmentArr || attachmentArr.length === 0) {
    return null
  }

  const target = attachmentArr[0]
  if (!target?.type?.includes('image')) {
    return null
  }

  return target.url ?? null
}
