import type { StaticImageData } from 'next/image'
import type { ImgHTMLAttributes } from 'react'
import { R2_BUCKET_PUBLIC_URL } from '@/constants/r2'

const LOCAL_FORMAT_DIRECTORIES = [
  '/images/home-carousel/',
  '/images/how-we-work/',
] as const

export interface AdaptiveImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /**
   * Fallback image source.
   *
   * Local public image paths can be passed as `/images/...` or `images/...`.
   * R2 URLs usually point at the cached WebP variant; when that URL is present,
   * the component infers the sibling AVIF source from the same R2 key.
   */
  src: string | StaticImageData

  /**
   * Optional explicit AVIF source.
   * If not provided, the component will try to infer it.
   */
  avifSrc?: string

  /**
   * Optional explicit WebP source.
   * If not provided, the component will try to infer it.
   */
  webpSrc?: string

  /**
   * Disable automatic AVIF/WebP inference.
   * When true, only the explicitly provided avifSrc/webpSrc will be used.
   */
  disableAutoFormats?: boolean

  /**
   * Optional className for the wrapping `<picture>` element.
   * Use this when the layout needs the picture wrapper to be block-level,
   * flex-aware, or visually absent with `contents`.
   */
  pictureClassName?: string
}

/**
 * Infer a format-specific source path by inserting a subfolder (e.g. "avif")
 * before the file name and replacing the extension.
 *
 * Example:
 *   baseSrc = "/images/sig-banners/foo.png"
 *   folder  = "avif"
 *   ext     = "avif"
 *   -> "/images/sig-banners/avif/foo.avif"
 */
function inferFormatSrc(baseSrc: string, folder: string, ext: string): string {
  const lastSlash = baseSrc.lastIndexOf('/')

  const dir = lastSlash === -1 ? '' : baseSrc.slice(0, lastSlash)
  const file = lastSlash === -1 ? baseSrc : baseSrc.slice(lastSlash + 1)

  const dotIdx = file.lastIndexOf('.')
  const baseName = dotIdx === -1 ? file : file.slice(0, dotIdx)

  const prefix = dir ? `${dir}/${folder}` : folder

  return `${prefix}/${baseName}.${ext}`
}

function shouldInferLocalFormats(baseSrc: string): boolean {
  return LOCAL_FORMAT_DIRECTORIES.some(directory => baseSrc.startsWith(directory))
}

function normalizeImageSrc(baseSrc: string): string {
  if (baseSrc.startsWith('images/')) {
    return `/${baseSrc}`
  }

  return baseSrc
}

function inferR2SiblingSources(baseSrc: string): {
  avifSrc?: string
  webpSrc?: string
} | undefined {
  if (!baseSrc.startsWith(`${R2_BUCKET_PUBLIC_URL}/images/`)) {
    return undefined
  }

  try {
    const url = new URL(baseSrc)
    if (!url.pathname.toLowerCase().endsWith('.webp')) {
      return undefined
    }

    const avifUrl = new URL(url)
    avifUrl.pathname = url.pathname.replace(/\.webp$/i, '.avif')

    return {
      avifSrc: avifUrl.toString(),
      webpSrc: url.toString(),
    }
  }
  catch {
    return undefined
  }
}

/**
 * Picture-based image component that serves AVIF and WebP when available.
 *
 * Supported automatic layouts:
 * - public static assets in optimized directories:
 *   `/images/home-carousel/foo.jpg` -> `/images/home-carousel/avif/foo.avif`
 * - R2 optimized assets: `.../images/{attId}/full/foo.webp` -> sibling AVIF
 */
export const AdaptiveImage = ({
  src,
  avifSrc,
  webpSrc,
  disableAutoFormats,
  pictureClassName,
  loading = 'lazy',
  decoding = 'async',
  ...imgProps
}: AdaptiveImageProps) => {
  // Normalize src to a plain string
  const fallbackSrc
    = normalizeImageSrc(typeof src === 'string'
      ? src
      : src.src) // StaticImageData from Next.js imports

  const r2Sources = !disableAutoFormats ? inferR2SiblingSources(fallbackSrc) : undefined

  const effectiveAvif
    = avifSrc
      ?? r2Sources?.avifSrc
      ?? (!disableAutoFormats && shouldInferLocalFormats(fallbackSrc)
        ? inferFormatSrc(fallbackSrc, 'avif', 'avif')
        : undefined)

  const effectiveWebp
    = webpSrc
      ?? r2Sources?.webpSrc
      ?? (!disableAutoFormats && shouldInferLocalFormats(fallbackSrc)
        ? inferFormatSrc(fallbackSrc, 'webp', 'webp')
        : undefined)

  return (
    <picture className={pictureClassName}>
      {/* Highest priority: AVIF */}
      {effectiveAvif !== undefined && <source srcSet={effectiveAvif} type="image/avif" />}

      {/* Fallback modern format: WebP */}
      {effectiveWebp !== undefined && <source srcSet={effectiveWebp} type="image/webp" />}

      {/* Final fallback: original JPEG/PNG */}
      <img
        src={fallbackSrc}
        loading={loading}
        decoding={decoding}
        {...imgProps}
      />
    </picture>
  )
}

export default AdaptiveImage
