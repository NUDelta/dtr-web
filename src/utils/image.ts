'use server';

import type { Attachment } from 'airtable';

/**
 * Retrieves the cached URL for an Airtable attachment image.
 *
 * @param {Attachment[] | undefined} attachmentArr - Array of Airtable attachments.
 * @returns {Promise<string | null>} Original Airtable image URL if caching fails.
 */
export const getImgUrlFromAttachmentObj = async (
  attachmentArr?: Attachment[],
): Promise<string | null> => {
  if (!attachmentArr || attachmentArr.length === 0) {
    return null;
  }

  const targetImg = attachmentArr[0];
  if (!targetImg.type.includes('image')) {
    return null;
  }

  const airtableImgUrl = targetImg.url;
  return airtableImgUrl;
};
