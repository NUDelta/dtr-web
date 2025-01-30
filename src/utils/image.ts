import type { Attachment } from 'airtable';

/**
 * Extracts the first image URL from Airtable's attachment array.
 *
 * @param {Attachment[] | undefined} attachmentArr - Array of Airtable Attachments, or undefined.
 * @returns {string | null} The first image URL if found, otherwise `null`.
 *
 * @example
 * const imgUrl = getImgUrlFromAttachmentObj(record.fields.profile_photo);
 * console.log(imgUrl); // "https://dl.airtable.com/..."
 */
export function getImgUrlFromAttachmentObj(attachmentArr?: Attachment[]): string | null {
  // Ensure the array is not empty and has at least one image attachment
  const targetImg = attachmentArr?.[0];
  return targetImg?.type.includes('image') ? targetImg.url : null;
}
