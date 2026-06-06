import type { RefObject } from 'react'
import type { ImageSize } from './types'
import { useEffect, useState } from 'react'

export function useMeasuredViewerSize(
  open: boolean,
  viewerRef: RefObject<HTMLDivElement | null>,
) {
  const [viewerSize, setViewerSize] = useState<ImageSize | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const viewer = viewerRef.current
    if (viewer === null) {
      return
    }

    const updateViewerSize = () => {
      const style = getComputedStyle(viewer)
      const width = viewer.clientWidth
        - Number.parseFloat(style.paddingLeft)
        - Number.parseFloat(style.paddingRight)
      const height = viewer.clientHeight
        - Number.parseFloat(style.paddingTop)
        - Number.parseFloat(style.paddingBottom)

      setViewerSize({
        height: Math.max(1, height),
        width: Math.max(1, width),
      })
    }

    const animationFrame = window.requestAnimationFrame(updateViewerSize)

    const observer = new ResizeObserver(updateViewerSize)
    observer.observe(viewer)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      observer.disconnect()
    }
  }, [open, viewerRef])

  return viewerSize
}
