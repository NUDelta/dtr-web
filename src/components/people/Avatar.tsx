'use client'

import Image from 'next/image'
import { useState } from 'react'

interface AvatarProps {
  src: string | null
  alt: string
  size?: number
  fill?: boolean
}

const Avatar = ({ src, alt, size, fill = false }: AvatarProps) => {
  const placeholder = '/images/default-pic.png'
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const imageSrc = src !== null && src !== failedSrc ? src : placeholder
  const handleError = () => {
    if (src !== null) {
      setFailedSrc(src)
    }
  }

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="h-full w-full object-cover"
        loading="lazy"
        onError={handleError}
      />
    )
  }

  return (
    <Image
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
      onError={handleError}
    />
  )
}

export default Avatar
