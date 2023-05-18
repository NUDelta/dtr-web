import Airtable, { Attachment } from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_API_KEY ?? "",
});

export const base = Airtable.base(process.env.AIRTABLE_BASE_ID ?? "");

/**
 * Returns the photo url from Airtable's attachment array.
 * @param attachmentArr Array of Airtable Attachments, or undefined.
 * @returns String photo url.
 * Empty string if first attachment in attachmentArr isn't an image.
 */
export function getImgUrlFromAttachmentObj(
  attachmentArr: Attachment[] | undefined
): string | null {
  // check if array is undefined
  if (attachmentArr === undefined) {
    return null;
  }

  // if not undefined, return the first attachement that is an image
  if (Array.isArray(attachmentArr)) {
    // return the first image if its actually an image
    let targetImg: Attachment = attachmentArr[0];
    if (targetImg.type.includes("image")) {
      return targetImg.url;
    }
  }

  // default return if first attachment wasn't an img
  return "";
}
