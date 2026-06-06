import type { ImageSize } from './types'
import { ALIGNMENT_OVERFLOW_THRESHOLD, MAX_ZOOM, MIN_ZOOM } from './constants'

export function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

export function formatZoom(value: number): string {
  return value === MIN_ZOOM ? 'Fit' : `${value.toFixed(1).replace(/\.0$/, '')}x`
}

export function getFittedImageSize(
  naturalSize: ImageSize | null,
  viewerSize: ImageSize | null,
): ImageSize | null {
  if (naturalSize === null || viewerSize === null) {
    return null
  }

  const scale = Math.min(
    1,
    viewerSize.width / naturalSize.width,
    viewerSize.height / naturalSize.height,
  )

  return {
    height: Math.max(1, naturalSize.height * scale),
    width: Math.max(1, naturalSize.width * scale),
  }
}

export function getZoomedImageSize(
  fittedSize: ImageSize | null,
  zoom: number,
): ImageSize | null {
  return fittedSize === null
    ? null
    : {
        height: fittedSize.height * zoom,
        width: fittedSize.width * zoom,
      }
}

export function getImageOverflow(
  zoomedSize: ImageSize | null,
  viewerSize: ImageSize | null,
) {
  return {
    x: zoomedSize !== null
      && viewerSize !== null
      && zoomedSize.width > viewerSize.width + ALIGNMENT_OVERFLOW_THRESHOLD,
    y: zoomedSize !== null
      && viewerSize !== null
      && zoomedSize.height > viewerSize.height + ALIGNMENT_OVERFLOW_THRESHOLD,
  }
}
