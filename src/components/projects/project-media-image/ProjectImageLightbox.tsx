'use client'

import type { RefObject } from 'react'
import type { DragState, ImageSize } from './types'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, Scan, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AdaptiveImage } from '@/components/shared'
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from './constants'
import { useImageViewerLifecycle } from './useImageViewerLifecycle'
import { useMeasuredViewerSize } from './useMeasuredViewerSize'
import ViewerIconButton from './ViewerIconButton'
import {
  clampZoom,
  formatZoom,
  getFittedImageSize,
  getImageOverflow,
  getZoomedImageSize,
} from './zoom'

interface ProjectImageLightboxProps {
  alt: string
  onClose: () => void
  open: boolean
  src: string
  titleId: string
  triggerRef: RefObject<HTMLButtonElement | null>
}

export default function ProjectImageLightbox({
  alt,
  onClose,
  open,
  src,
  titleId,
  triggerRef,
}: ProjectImageLightboxProps) {
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [naturalSize, setNaturalSize] = useState<ImageSize | null>(null)
  const [dragging, setDragging] = useState(false)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const viewerSize = useMeasuredViewerSize(open, viewerRef)

  const setViewerZoom = useCallback((nextZoom: number | ((currentZoom: number) => number)) => {
    setDragging(false)
    dragRef.current = null
    setZoom(value => clampZoom(typeof nextZoom === 'function' ? nextZoom(value) : nextZoom))
  }, [])

  const zoomOut = useCallback(() => setViewerZoom(value => value - ZOOM_STEP), [setViewerZoom])
  const zoomIn = useCallback(() => setViewerZoom(value => value + ZOOM_STEP), [setViewerZoom])
  const resetZoom = useCallback(() => setViewerZoom(MIN_ZOOM), [setViewerZoom])
  const closeViewer = useCallback(() => {
    setZoom(MIN_ZOOM)
    setDragging(false)
    dragRef.current = null
    onClose()
  }, [onClose])

  const fittedSize = useMemo(
    () => getFittedImageSize(naturalSize, viewerSize),
    [naturalSize, viewerSize],
  )
  const zoomedSize = useMemo(
    () => getZoomedImageSize(fittedSize, zoom),
    [fittedSize, zoom],
  )
  const overflow = useMemo(
    () => getImageOverflow(zoomedSize, viewerSize),
    [viewerSize, zoomedSize],
  )

  useImageViewerLifecycle({
    dialogRef,
    onClose: closeViewer,
    onResetZoom: resetZoom,
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    open,
    triggerRef,
  })

  useEffect(() => {
    const scrollArea = scrollRef.current
    if (zoomedSize === null || viewerSize === null || scrollArea === null) {
      return
    }

    const animationFrame = window.requestAnimationFrame(() => {
      scrollArea.scrollTo({
        left: overflow.x ? Math.max(0, (scrollArea.scrollWidth - scrollArea.clientWidth) / 2) : 0,
        top: overflow.y ? Math.max(0, (scrollArea.scrollHeight - scrollArea.clientHeight) / 2) : 0,
      })
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [overflow.x, overflow.y, viewerSize, zoomedSize])

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-neutral-950/95 p-3 text-white sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeViewer()
            }
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col outline-none"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            onMouseDown={event => event.stopPropagation()}
          >
            <header className="flex flex-wrap items-center justify-between gap-3 pb-3">
              <h2 id={titleId} className="min-w-0 flex-1 truncate text-sm font-semibold text-white/90 sm:text-base">
                {alt}
              </h2>
              <div className="flex items-center gap-2">
                <ViewerIconButton label="Zoom out" onClick={zoomOut} disabled={zoom <= MIN_ZOOM}>
                  <Minus className="size-4" aria-hidden="true" />
                </ViewerIconButton>
                <span className="min-w-12 text-center text-sm font-semibold tabular-nums text-white/80">
                  {formatZoom(zoom)}
                </span>
                <ViewerIconButton label="Zoom in" onClick={zoomIn} disabled={zoom >= MAX_ZOOM}>
                  <Plus className="size-4" aria-hidden="true" />
                </ViewerIconButton>
                <ViewerIconButton label="Fit to screen" onClick={resetZoom} disabled={zoom === MIN_ZOOM}>
                  <Scan className="size-4" aria-hidden="true" />
                </ViewerIconButton>
                <ViewerIconButton label="Close image viewer" onClick={closeViewer}>
                  <X className="size-5" aria-hidden="true" />
                </ViewerIconButton>
              </div>
            </header>
            <LightboxImageCanvas
              alt={alt}
              dragging={dragging}
              dragRef={dragRef}
              overflow={overflow}
              scrollRef={scrollRef}
              setDragging={setDragging}
              setNaturalSize={setNaturalSize}
              src={src}
              viewerRef={viewerRef}
              zoom={zoom}
              zoomedSize={zoomedSize}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

interface LightboxImageCanvasProps {
  alt: string
  dragging: boolean
  dragRef: RefObject<DragState | null>
  overflow: { x: boolean, y: boolean }
  scrollRef: RefObject<HTMLDivElement | null>
  setDragging: (dragging: boolean) => void
  setNaturalSize: (size: ImageSize) => void
  src: string
  viewerRef: RefObject<HTMLDivElement | null>
  zoom: number
  zoomedSize: ImageSize | null
}

function LightboxImageCanvas({
  alt,
  dragging,
  dragRef,
  overflow,
  scrollRef,
  setDragging,
  setNaturalSize,
  src,
  viewerRef,
  zoom,
  zoomedSize,
}: LightboxImageCanvasProps) {
  const stopDragging = (pointerId: number) => {
    const scrollArea = scrollRef.current
    if (dragRef.current?.pointerId === pointerId) {
      dragRef.current = null
      setDragging(false)
      scrollArea?.releasePointerCapture(pointerId)
    }
  }

  return (
    <div
      ref={scrollRef}
      className={[
        'min-h-0 flex-1 overflow-auto rounded-2xl border border-white/10 bg-black/30',
        zoom > MIN_ZOOM ? 'cursor-grab active:cursor-grabbing' : '',
      ].filter(Boolean).join(' ')}
      onPointerDown={(event) => {
        if (zoom === MIN_ZOOM || scrollRef.current === null) {
          return
        }

        dragRef.current = {
          left: scrollRef.current.scrollLeft,
          pointerId: event.pointerId,
          top: scrollRef.current.scrollTop,
          x: event.clientX,
          y: event.clientY,
        }
        setDragging(true)
        scrollRef.current.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (dragRef.current === null || scrollRef.current === null) {
          return
        }

        scrollRef.current.scrollLeft = dragRef.current.left - (event.clientX - dragRef.current.x)
        scrollRef.current.scrollTop = dragRef.current.top - (event.clientY - dragRef.current.y)
      }}
      onPointerUp={event => stopDragging(event.pointerId)}
      onPointerCancel={event => stopDragging(event.pointerId)}
    >
      <div
        ref={viewerRef}
        className="flex min-h-full min-w-full p-3 sm:p-6"
        style={{
          alignItems: overflow.y ? 'flex-start' : 'center',
          justifyContent: overflow.x ? 'flex-start' : 'center',
        }}
      >
        <AdaptiveImage
          src={src}
          alt={alt}
          sizes="100vw"
          pictureClassName="contents"
          className={[
            'block h-auto select-none object-contain',
            dragging ? 'pointer-events-none' : '',
          ].filter(Boolean).join(' ')}
          draggable={false}
          onLoad={(event) => {
            const img = event.currentTarget
            setNaturalSize({
              height: img.naturalHeight,
              width: img.naturalWidth,
            })
          }}
          style={{
            height: zoomedSize === null ? undefined : `${zoomedSize.height}px`,
            maxWidth: 'none',
            width: zoomedSize === null ? undefined : `${zoomedSize.width}px`,
          }}
        />
      </div>
    </div>
  )
}
