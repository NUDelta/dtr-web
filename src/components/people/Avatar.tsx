'use client'

import { useState } from 'react'
import { AdaptiveImage } from '@/components/shared'

interface AvatarProps {
  src: string | null
  alt: string
  size?: number
  fill?: boolean
}

const Avatar = ({ src, alt, size, fill = false }: AvatarProps) => {
  const placeholder = '/images/default-pic.png'
  const placeholderWebp = '/images/default-pic.webp'
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const imageSrc = src !== null && src !== failedSrc ? src : placeholder
  const isPlaceholder = imageSrc === placeholder
  const handleError = () => {
    if (src !== null) {
      setFailedSrc(src)
    }
  }

  if (fill) {
    return (
      <AdaptiveImage
        src={imageSrc}
        alt={alt}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        webpSrc={isPlaceholder ? placeholderWebp : undefined}
        disableAutoFormats={isPlaceholder}
        onError={handleError}
      />
    )
  }

  return (
    <AdaptiveImage
      src={imageSrc}
      alt={alt}
      width={size ?? 80}
      height={size ?? 80}
      className="inline-block rounded-xl object-cover"
      sizes={
        size !== undefined
          ? `${size}px`
          : '(max-width: 640px) 128px, 160px'
      }
      loading="lazy"
      webpSrc={isPlaceholder ? placeholderWebp : undefined}
      disableAutoFormats={isPlaceholder}
      onError={handleError}
    />
  )
}

export default Avatar
