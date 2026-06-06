import type { RefObject } from 'react'

export interface ProjectMediaImageProps {
  src: string
  alt: string
  sizes: string
  containerClassName: string
  imageClassName: string
}

export interface ImageSize {
  height: number
  width: number
}

export interface DragState {
  left: number
  pointerId: number
  top: number
  x: number
  y: number
}

export interface ImageViewerLifecycleOptions {
  dialogRef: RefObject<HTMLDivElement | null>
  onClose: () => void
  onResetZoom: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  open: boolean
  triggerRef: RefObject<HTMLButtonElement | null>
}
