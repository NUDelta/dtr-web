'use client'

import type { ProjectMediaImageProps } from './types'
import { Maximize2 } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { AdaptiveImage } from '@/components/shared'
import ProjectImageLightbox from './ProjectImageLightbox'

export default function ProjectMediaImage({
  src,
  alt,
  sizes,
  containerClassName,
  imageClassName,
}: ProjectMediaImageProps) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Open ${alt} full screen`}
        onClick={() => setOpen(true)}
        className={`${containerClassName} group relative cursor-zoom-in transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2`}
      >
        <AdaptiveImage
          src={src}
          alt={alt}
          sizes={sizes}
          pictureClassName="contents"
          className={imageClassName}
        />
        <span className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-xl border border-white/70 bg-white/85 text-neutral-900 opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 className="size-4" aria-hidden="true" />
        </span>
      </button>
      <ProjectImageLightbox
        src={src}
        alt={alt}
        open={open}
        titleId={titleId}
        triggerRef={triggerRef}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
