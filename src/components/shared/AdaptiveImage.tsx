import type { StaticImageData } from 'next/image'
import type { ImgHTMLAttributes } from 'react'
import React from 'react'

export interface AdaptiveImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /**
   * Fallback image source (JPEG/PNG).
   * Can be a string path or a Next.js StaticImageData import.
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

/**
 * Picture-based image component that serves AVIF and WebP when available,
 * and falls back to the original JPEG/PNG source.
 */
export const AdaptiveImage = ({
  src,
  avifSrc,
  webpSrc,
  disableAutoFormats,
  loading = 'lazy',
  decoding = 'async',
  ...imgProps
}: AdaptiveImageProps) => {
  // Normalize src to a plain string
  const fallbackSrc
    = typeof src === 'string'
      ? src
      : src.src // StaticImageData from Next.js imports

  const effectiveAvif
    = avifSrc
      ?? (!disableAutoFormats ? inferFormatSrc(fallbackSrc, 'avif', 'avif') : undefined)

  const effectiveWebp
    = webpSrc
      ?? (!disableAutoFormats ? inferFormatSrc(fallbackSrc, 'webp', 'webp') : undefined)

  return (
    <picture>
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
