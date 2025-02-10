'use server';

import type { Attachment } from 'airtable';
import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

// Set cache directory and expiration time
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days before deletion
const CACHE_DIR = path.join(process.cwd(), 'public/cached-images');

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

// Ensure cache directory exists
fs.mkdir(CACHE_DIR, { recursive: true }).catch(console.error);

/**
 * Updates the modification time of a file to the current time.
 * Used to prevent cache files from being deleted prematurely.
 *
 * @param {string} filePath - Path to the file.
 */
async function touchFile(filePath: string) {
  try {
    // Append an empty string to update mtime (touch equivalent)
    await fs.appendFile(filePath, '');
  }
  catch (error_) {
    console.error(`Failed to update mtime for ${filePath}:`, error_);
  }
}

/**
 * Retrieves the path of a valid cached file if it exists and is not expired.
 * If the file is expired, it will be deleted.
 *
 * @param {string} cacheKey - Unique cache identifier (Airtable ID).
 * @returns {Promise<string | null>} The cached file path or null if not found or expired.
 */
async function getCachedFile(cacheKey: string): Promise<string | null> {
  const possibleExtensions = Object.values(EXTENSION_MAP);

  for (const ext of possibleExtensions) {
    const cachedFilePath = path.join(CACHE_DIR, `${cacheKey}${ext}`);

    try {
      await fs.stat(cachedFilePath);
      // Fake update to mtime to prevent deletion
      await touchFile(cachedFilePath);
      return `/cached-images/${cacheKey}${ext}`;
    }
    catch (error_) {
      // File might not exist or could have been deleted by another process
      if ((error_ as { code: string }).code !== 'ENOENT') {
        console.error('Error handling cache file:', error_);
      }
    }
  }

  return null; // No valid cached file found
}

/**
 * Downloads an image and caches it locally.
 * Falls back to the original Airtable URL if download fails.
 *
 * @param {string} url - Airtable attachment URL.
 * @param {string} cacheKey - Unique cache identifier (Airtable ID).
 * @returns {Promise<string>} Local cached path or original URL if caching fails.
 */
async function downloadImage(url: string, cacheKey: string): Promise<string> {
  if (!url) {
    return '';
  }

  // Check if we already have a valid cached image
  const cachedFile = await getCachedFile(cacheKey);
  if (cachedFile !== null) {
    return cachedFile;
  }

  // Attempt to download the image
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    // Determine file extension from Content-Type
    const mimeType = response.headers.get('content-type') ?? 'image/jpeg';
    const imgExt = EXTENSION_MAP[mimeType] || '.jpg';
    const cachedFilePath = path.join(CACHE_DIR, `${cacheKey}${imgExt}`);

    const buffer = await response.arrayBuffer();
    await fs.writeFile(cachedFilePath, Buffer.from(buffer));

    return `/cached-images/${cacheKey}${imgExt}`;
  }
  catch {
    // Fallback to the original Airtable URL if download fails
    return url;
  }
}

/**
 * Periodically removes old unused cache files.
 * Runs every X hours to prevent cache from growing indefinitely.
 */
async function cleanupCache() {
  try {
    const files = await fs.readdir(CACHE_DIR);
    let cleanedCount = 0;

    for (const file of files) {
      const filePath = path.join(CACHE_DIR, file);

      try {
        const stats = await fs.stat(filePath);
        const lastModified = stats.mtime.getTime();
        const now = Date.now();

        if (now - lastModified > MAX_CACHE_AGE_MS) {
          await fs.unlink(filePath);
          cleanedCount++;
        }
      }
      catch (error_) {
        console.error(`Failed to clean up ${filePath}:`, error_);
      }
    }

    // eslint-disable-next-line no-console
    console.info(`\t[Garbage Collection] Deleted ${cleanedCount} old cache files.`);
  }
  catch (error_) {
    console.error('Error reading cache directory:', error_);
  }
}

// Run cleanup periodically (every 24 hours)
setInterval(() => {
  cleanupCache().catch(console.error);
}, 24 * 60 * 60 * 1000);

/**
 * Retrieves the cached URL for an Airtable attachment image.
 * Downloads and caches it if not found.
 *
 * @param {Attachment[] | undefined} attachmentArr - Array of Airtable attachments.
 * @returns {Promise<string | null>} Cached image URL or original URL if caching fails.
 */
export async function getImgUrlFromAttachmentObj(attachmentArr?: Attachment[]): Promise<string | null> {
  if (!attachmentArr || attachmentArr.length === 0) {
    return null;
  }

  const targetImg = attachmentArr[0];
  if (!targetImg.type.includes('image')) {
    return null;
  }

  const airtableImgUrl = targetImg.url;
  const cacheKey = targetImg.id; // Use Airtable ID as cache key

  return downloadImage(airtableImgUrl, cacheKey);
}
