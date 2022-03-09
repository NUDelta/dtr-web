import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_API_KEY ?? "",
});

export const base = Airtable.base(process.env.AIRTABLE_BASE_ID ?? "");

// TODO: refactor using Attachment[] type
/**
 * Returns the photo url from Airtable's attachment array.
 * @param attachmentArr Array of objects, or undefined.
 * @returns String photo url.
 */
export function getPhotoUrlFromAttachmentObj(attachmentArr: Array<any> | undefined): string | null {
  // check if array is undefined
  if (attachmentArr === undefined) {
    return null;
  }

  // if not undefined, return the first attachement that is an image
  let photoUrl = "";
  if (Array.isArray(attachmentArr)) {
    for (const currImg of attachmentArr) {
      if (currImg.type.includes("image")) {
        photoUrl = currImg.url;
      }
    }
  }

  return photoUrl;
};