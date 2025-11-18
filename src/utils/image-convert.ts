import type { Buffer } from 'node:buffer'
import sharp from 'sharp'

/** Global tuning for small servers (e.g., 1 vCPU/512MB droplets). Adjust as needed. */
sharp.cache({ files: 128, items: 256, memory: 64 }) // memory is MB-ish
sharp.concurrency(2)

interface MultiFormatOptions {
  /**
   * Maximum bounding box for width/height in pixels.
   * The longer side will be clamped to this value, preserving aspect ratio.
   */
  maxDimension?: number
  webp?: {
    quality?: number
    lossless?: boolean
    effort?: number
  }
  avif?: {
    quality?: number
    lossless?: boolean
    effort?: number
  }
}

/**
 * Decode an encoded image buffer and produce both AVIF and WebP variants.
 *
 * - Decodes common formats (JPEG/PNG/HEIC/WebP/etc.).
 * - Honors EXIF orientation.
 * - Resizes to fit inside a max bounding box (if provided).
 * - Forces SDR (sRGB + gamma).
 * - Strips metadata by default.
 */
export async function transcodeBufferToOptimizedImages(
  input: Buffer,
  options: MultiFormatOptions = {},
): Promise<{ avif: Buffer, webp: Buffer, converted: boolean }> {
  const maxDimension = options.maxDimension ?? 2400

  const webpQuality = options.webp?.quality ?? 82
  const webpLossless = options.webp?.lossless ?? false
  const webpEffort = options.webp?.effort ?? 4

  const avifQuality = options.avif?.quality ?? 55
  const avifLossless = options.avif?.lossless ?? false
  const avifEffort = options.avif?.effort ?? 4

  try {
    let pipeline = sharp(input, {
      unlimited: false,
      sequentialRead: true,
      animated: false,
      failOnError: false,
    })

    // Respect EXIF rotation.
    pipeline = pipeline.rotate()

    // Clamp both width and height to maxDimension (fit inside, no upscaling).
    if (Number.isFinite(maxDimension) && maxDimension > 0) {
      pipeline = pipeline.resize({
        width: Math.floor(maxDimension),
        height: Math.floor(maxDimension),
        fit: 'inside',
        withoutEnlargement: true,
        fastShrinkOnLoad: true,
      })
    }

    // HDR -> SDR: force sRGB 8-bit + gamma for more natural SDR appearance.
    pipeline = pipeline.toColorspace('srgb').gamma()

    const base = pipeline

    const [webp, avif] = await Promise.all([
      base
        .clone()
        .webp({
          quality: webpQuality,
          lossless: webpLossless,
          effort: webpEffort,
          smartSubsample: true,
          nearLossless: false,
          alphaQuality: Math.min(webpQuality + 5, 100),
        })
        .toBuffer(),
      base
        .clone()
        .avif({
          quality: avifQuality,
          lossless: avifLossless,
          effort: avifEffort,
        })
        .toBuffer(),
    ])

    return { avif, webp, converted: true }
  }
  catch (err) {
    // Fallback: return original bytes as WebP-ish payload.
    // If handled outside, rethrow instead.
    console.warn('[image-convert] multi-format sharp failed, returning original buffer:', err)
    return { avif: input, webp: input, converted: false }
  }
}
