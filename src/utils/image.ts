'use server'

import type { Attachment } from 'ts-airtable'

/**
 * Returns the image URL for the first Airtable attachment.
 *
 * Airtable cache writes normalize image attachments to stable public R2 URLs,
 * so callers should not receive Airtable's short-lived signed URLs here.
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
