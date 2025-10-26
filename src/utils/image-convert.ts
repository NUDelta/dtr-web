import type { Buffer } from 'node:buffer'
import sharp from 'sharp'

/** Global tuning for small servers (e.g., 1 vCPU/512MB droplets). Adjust as needed. */
sharp.cache({ files: 128, items: 256, memory: 64 }) // memory is MB-ish
sharp.concurrency(2)

/**
 * Transcode an encoded image Buffer to WebP using sharp only.
 *
 * - Decodes common formats (JPEG/PNG/HEIC/WebP/etc.)
 * - Honors EXIF orientation
 * - Optional downscale (keeps aspect ratio, never upscales)
 * - Forces SDR: converts to sRGB and applies gamma mapping to tone-map HDR/wide-gamut
 * - Strips metadata by default (sharp does not copy metadata unless `.withMetadata()` is used)
 */
export async function transcodeBufferToWebp(
  input: Buffer,
  options: Partial<WebpOptions> = {},
): Promise<{ buffer: Buffer, contentType: 'image/webp', converted: boolean }> {
  const quality = options.quality ?? 82
  const lossless = options.lossless ?? false
  const effort = options.effort ?? 4
  const targetW = options.targetWidth

  try {
    let p = sharp(input, {
      unlimited: false,
      sequentialRead: true, // memory-friendly
      animated: false, // take first frame if input is animated
      failOnError: false,
    })

    // Respect EXIF rotation
    p = p.rotate()

    // Optional resize for thumbnails or smaller variants
    if (targetW !== undefined && Number.isFinite(targetW) && targetW > 0) {
      p = p.resize({
        width: Math.floor(targetW),
        fit: 'inside',
        withoutEnlargement: true,
        fastShrinkOnLoad: true,
      })
    }

    // HDR → SDR: force sRGB 8-bit + gamma for more natural SDR appearance
    p = p.toColorspace('srgb').gamma()

    // Encode to WebP
    const out = await p.webp({
      quality,
      lossless,
      effort,
      smartSubsample: true, // better chroma subsampling for photos
      nearLossless: false,
      alphaQuality: Math.min(quality + 5, 100), // preserve alpha edges slightly better
    }).toBuffer()

    return { buffer: out, contentType: 'image/webp', converted: true }
  }
  catch (err) {
    // Fallback: return original bytes so the request still succeeds
    // (If you prefer strict behavior, rethrow instead.)
    console.warn('[image-convert] sharp failed, returning original buffer:', err)
    return { buffer: input, contentType: 'image/webp', converted: false }
  }
}
